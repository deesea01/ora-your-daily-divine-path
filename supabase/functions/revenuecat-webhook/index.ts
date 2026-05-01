// supabase/functions/revenuecat-webhook/index.ts
//
// Receives RevenueCat server webhook events and mirrors entitlement state
// into the `subscriptions` table so the existing `useSubscription` /
// `RequirePremium` plumbing on the frontend keeps working unchanged.
//
// Setup in RevenueCat dashboard → Project Settings → Integrations → Webhooks:
//   URL:    https://<project-ref>.functions.supabase.co/revenuecat-webhook
//   Header: Authorization: Bearer <REVENUECAT_WEBHOOK_AUTH>
//
// We use a shared-secret bearer header for auth (RevenueCat does not sign
// webhooks). The secret is set via Lovable Cloud secrets.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const PREMIUM_ENTITLEMENT = "premium";

function admin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

interface RcEvent {
  event: {
    type: string; // INITIAL_PURCHASE | RENEWAL | CANCELLATION | EXPIRATION | PRODUCT_CHANGE | UNCANCELLATION | BILLING_ISSUE | SUBSCRIPTION_PAUSED | NON_RENEWING_PURCHASE | TRANSFER | ...
    id: string;
    app_user_id: string;
    original_app_user_id?: string;
    product_id?: string;
    period_type?: "TRIAL" | "INTRO" | "NORMAL" | "PROMOTIONAL";
    purchased_at_ms?: number;
    expiration_at_ms?: number | null;
    environment?: "SANDBOX" | "PRODUCTION";
    store?: "APP_STORE" | "PLAY_STORE" | "STRIPE" | "PROMOTIONAL" | string;
    cancel_reason?: string;
    new_product_id?: string;
    entitlement_ids?: string[];
  };
  api_version?: string;
}

function statusFromEventType(type: string): "active" | "trialing" | "canceled" | "past_due" | "expired" {
  switch (type) {
    case "INITIAL_PURCHASE":
    case "RENEWAL":
    case "UNCANCELLATION":
    case "PRODUCT_CHANGE":
    case "NON_RENEWING_PURCHASE":
    case "TRANSFER":
      return "active";
    case "TRIAL_STARTED":
      return "trialing";
    case "BILLING_ISSUE":
      return "past_due";
    case "CANCELLATION":
      // Cancelled but still has access until expiration. Caller handles cancel_at_period_end.
      return "active";
    case "EXPIRATION":
    case "SUBSCRIPTION_PAUSED":
      return "expired";
    default:
      return "active";
  }
}

async function handleEvent(payload: RcEvent) {
  const e = payload.event;
  if (!e?.app_user_id) {
    console.warn("[revenuecat-webhook] missing app_user_id, ignoring", e?.type);
    return;
  }

  // Only Apple IAP for now; ignore Play / Stripe etc.
  const isIos = !e.store || e.store === "APP_STORE";
  if (!isIos) {
    console.log("[revenuecat-webhook] ignoring non-iOS store", e.store);
    return;
  }

  // Only count premium entitlement; ignore other entitlements RevenueCat might send.
  const entitlementIds = e.entitlement_ids ?? [];
  if (entitlementIds.length && !entitlementIds.includes(PREMIUM_ENTITLEMENT)) {
    console.log("[revenuecat-webhook] event without premium entitlement", entitlementIds);
    return;
  }

  const status = statusFromEventType(e.type);
  const periodEnd = e.expiration_at_ms ? new Date(e.expiration_at_ms).toISOString() : null;
  const periodStart = e.purchased_at_ms ? new Date(e.purchased_at_ms).toISOString() : null;
  const cancelAtPeriodEnd = e.type === "CANCELLATION";
  const env = "ios_iap"; // We don't differentiate Apple sandbox vs prod at the row level — RevenueCat handles routing.

  const row = {
    user_id: e.app_user_id,
    paddle_subscription_id: `rc_${e.id}`, // unique per event; we upsert on (user, provider, env)
    paddle_customer_id: e.original_app_user_id ?? e.app_user_id,
    product_id: e.product_id ?? "ora_premium",
    price_id: e.product_id ?? "ora_premium",
    status,
    current_period_start: periodStart,
    current_period_end: periodEnd,
    cancel_at_period_end: cancelAtPeriodEnd,
    environment: env,
    provider: "revenuecat_ios",
    updated_at: new Date().toISOString(),
  } as Record<string, unknown>;

  // Upsert on (user_id, provider, environment) — matches the unique index from the IAP migration.
  const { error } = await admin()
    .from("subscriptions")
    .upsert(row, { onConflict: "user_id,provider,environment" });
  if (error) {
    console.error("[revenuecat-webhook] upsert failed", error);
    throw error;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  // Shared-secret auth — RevenueCat lets you configure an Authorization header.
  const expected = Deno.env.get("REVENUECAT_WEBHOOK_AUTH");
  const got = req.headers.get("authorization") ?? "";
  const stripped = got.replace(/^Bearer\s+/i, "").trim();
  if (!expected || stripped !== expected) {
    console.warn("[revenuecat-webhook] auth failed");
    return new Response("Unauthorized", { status: 401, headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as RcEvent;
    await handleEvent(body);
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[revenuecat-webhook] error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
