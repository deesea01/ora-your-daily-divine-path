// Deletes the authenticated user's account and personal data.
// Required by Apple App Store Review Guideline 5.1.1(v) for any app that
// supports account creation. Uses the service role to perform the auth
// deletion; row-level data cascades via existing `ON DELETE CASCADE`
// foreign keys where defined, plus explicit cleanup for user-scoped tables.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return json({ error: "Missing Authorization" }, 401);
  }

  // Identify the caller from their JWT.
  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: userErr } = await userClient.auth.getUser();
  if (userErr || !user) return json({ error: "Unauthorized" }, 401);

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

  // Best-effort cleanup of user-scoped tables. Ignore individual failures —
  // the auth row deletion at the end is the authoritative action.
  const tables = [
    "subscriptions",
    "profiles",
    "user_roles",
    "prayer_logs",
    "journal_entries",
    "confession_logs",
    "weekly_recaps",
    "spiritual_profile",
    "spiritual_growth",
    "onboarding_responses",
    "reminder_prefs",
    "email_suppressions",
  ];
  await Promise.all(
    tables.map((t) => admin.from(t).delete().eq("user_id", user.id).then(
      () => null,
      () => null,
    )),
  );

  const { error: delErr } = await admin.auth.admin.deleteUser(user.id);
  if (delErr) return json({ error: delErr.message }, 500);

  return json({ ok: true });

  function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
