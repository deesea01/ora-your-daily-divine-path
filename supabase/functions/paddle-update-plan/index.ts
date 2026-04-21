import { createClient } from "npm:@supabase/supabase-js@2";
import { getPaddleClient, gatewayFetch, type PaddleEnv } from "../_shared/paddle.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Content-Type": "application/json",
};

// Switches a subscription between monthly and yearly Ora Premium.
// Body: { newPriceId: 'ora_premium_monthly' | 'ora_premium_yearly' }
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claims } = await supabase.auth.getClaims(token);
    const userId = claims?.claims?.sub as string | undefined;
    if (!userId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const { newPriceId } = await req.json().catch(() => ({} as any));
    if (newPriceId !== "ora_premium_monthly" && newPriceId !== "ora_premium_yearly") {
      return new Response(JSON.stringify({ error: "Invalid newPriceId" }), { status: 400, headers: corsHeaders });
    }

    const url = new URL(req.url);
    const envParam = url.searchParams.get("env");
    const envFilter = envParam === "sandbox" || envParam === "live" ? envParam : null;

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    let q = admin.from("subscriptions").select("paddle_subscription_id, environment, price_id, status").eq("user_id", userId);
    if (envFilter) q = q.eq("environment", envFilter);
    const { data: sub } = await q.order("updated_at", { ascending: false }).limit(1).maybeSingle();
    if (!sub?.paddle_subscription_id) {
      return new Response(JSON.stringify({ error: "No subscription found" }), { status: 404, headers: corsHeaders });
    }
    if (sub.price_id === newPriceId) {
      return new Response(JSON.stringify({ ok: true, unchanged: true }), { headers: corsHeaders });
    }

    const env = sub.environment as PaddleEnv;
    // Resolve external_id -> paddle internal id
    const lookup = await gatewayFetch(env, `/prices?external_id=${encodeURIComponent(newPriceId)}`);
    const lookupJson = await lookup.json();
    const paddlePriceId = lookupJson?.data?.[0]?.id;
    if (!paddlePriceId) {
      return new Response(JSON.stringify({ error: "Price not found" }), { status: 404, headers: corsHeaders });
    }

    const paddle = getPaddleClient(env);
    await paddle.subscriptions.update(sub.paddle_subscription_id, {
      items: [{ priceId: paddlePriceId, quantity: 1 }],
      prorationBillingMode: "prorated_immediately",
    });

    return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
  } catch (e) {
    console.error("paddle-update-plan error:", e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders });
  }
});
