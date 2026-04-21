// Daily cron: finds trials ending tomorrow and enqueues "trial_ending" emails.
// Idempotent — uses subscription_notifications to avoid double-sends.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Content-Type": "application/json",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Find trialing subs whose trial ends within the next 24-48h window
  const now = new Date();
  const start = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const end = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  const { data: subs, error } = await admin
    .from("subscriptions")
    .select("id, user_id, current_period_end")
    .eq("status", "trialing")
    .gte("current_period_end", start.toISOString())
    .lt("current_period_end", end.toISOString());

  if (error) {
    console.error("trial-reminders query error", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }

  let enqueued = 0;
  for (const s of subs ?? []) {
    // skip if already notified
    const { data: existing } = await admin
      .from("subscription_notifications")
      .select("id")
      .eq("subscription_id", s.id)
      .eq("kind", "trial_ending")
      .maybeSingle();
    if (existing) continue;

    // Get email + display name from auth + profile
    const { data: userRes } = await admin.auth.admin.getUserById(s.user_id);
    const email = userRes?.user?.email;
    if (!email) continue;

    const { data: profile } = await admin
      .from("user_profiles")
      .select("display_name")
      .eq("user_id", s.user_id)
      .maybeSingle();

    const endsAt = new Date(s.current_period_end!).toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });

    // Enqueue via the public RPC wrapper
    const { error: enqErr } = await admin.rpc("enqueue_email", {
      queue_name: "transactional_emails",
      payload: {
        to: email,
        template_name: "trial_ending",
        template_data: {
          displayName: profile?.display_name ?? "",
          endsAt,
          manageUrl: "https://oradevotion.com/settings",
        },
      },
    });
    if (enqErr) {
      console.error("enqueue trial_ending failed", enqErr);
      continue;
    }

    await admin.from("subscription_notifications").insert({
      subscription_id: s.id,
      user_id: s.user_id,
      kind: "trial_ending",
    });
    enqueued++;
  }

  return new Response(JSON.stringify({ ok: true, enqueued }), { headers: corsHeaders });
});
