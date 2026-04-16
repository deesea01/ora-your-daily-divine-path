import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ADMIN_EMAIL = "derek@oradevotion.com";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { functionName, errorMessage, userId, metadata } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Log error to database
    await supabaseAdmin.from("ai_error_logs").insert({
      function_name: functionName || "unknown",
      error_message: errorMessage || "Unknown error",
      user_id: userId || null,
      metadata: metadata || {},
    });

    console.log(`[AI Error] ${functionName}: ${errorMessage} | user: ${userId || "anon"}`);

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
