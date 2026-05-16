import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Require an authenticated caller — prevents unauthenticated log flooding/spoofing.
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } = await userClient.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const callerId = claimsData.claims.sub as string | undefined;

    const body = await req.json().catch(() => ({}));
    const rawFn = typeof body.functionName === "string" ? body.functionName : "unknown";
    const rawMsg = typeof body.errorMessage === "string" ? body.errorMessage : "Unknown error";
    const metadata = body.metadata && typeof body.metadata === "object" ? body.metadata : {};

    // Force the user_id to the authenticated caller — never trust client-supplied IDs.
    const functionName = rawFn.slice(0, 200);
    const errorMessage = rawMsg.slice(0, 4000);

    const supabaseAdmin = createClient(supabaseUrl, serviceKey);
    await supabaseAdmin.from("ai_error_logs").insert({
      function_name: functionName,
      error_message: errorMessage,
      user_id: callerId ?? null,
      metadata,
    });

    console.log(`[AI Error] ${functionName}: ${errorMessage} | user: ${callerId ?? "anon"}`);

    return new Response(
      JSON.stringify({ success: true, logged: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("notify-admin error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to log error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
