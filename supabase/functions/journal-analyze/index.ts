import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Premium gate ---
    const { hasActiveSubscription } = await import("../_shared/entitlement.ts");
    const isPremium = await hasActiveSubscription(user.id);
    if (!isPremium) {
      return new Response(
        JSON.stringify({ error: "Premium required", code: "premium_required" }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Fetch last 10 entries only
    const { data: entries } = await supabase
      .from("journal_entries")
      .select("content, mood, tags, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (!entries || entries.length < 3) {
      return new Response(
        JSON.stringify({ error: "Need at least 3 journal entries for analysis" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const entrySummaries = entries
      .map((e: any, i: number) => `Entry ${i + 1} (${e.created_at?.split("T")[0]}): ${e.content.slice(0, 500)}${e.mood ? ` [Mood: ${e.mood}]` : ""}`)
      .join("\n\n");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a Catholic spiritual director analyzing journal entries. Be gentle, encouraging, and theologically grounded. Return analysis using the provided tool.`,
          },
          {
            role: "user",
            content: `Analyze these ${entries.length} spiritual journal entries and identify patterns:\n\n${entrySummaries}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "save_analysis",
              description: "Save the spiritual pattern analysis",
              parameters: {
                type: "object",
                properties: {
                  summary: { type: "string", description: "2-3 sentence overview of spiritual state" },
                  patterns: { type: "array", items: { type: "string" }, description: "Recurring struggles or themes" },
                  strengths: { type: "array", items: { type: "string" }, description: "Areas of growth and virtue" },
                  suggested_focus: { type: "string", description: "One specific area to focus on" },
                },
                required: ["summary", "patterns", "strengths", "suggested_focus"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "save_analysis" } },
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI error: ${status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No analysis returned");
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    // Store insight
    await supabase.from("spiritual_insights").insert({
      user_id: user.id,
      summary: analysis.summary,
      patterns: analysis.patterns,
      strengths: analysis.strengths,
      suggested_focus: analysis.suggested_focus,
      entry_count: entries.length,
    });

    return new Response(JSON.stringify({ success: true, analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("journal-analyze error:", e);
    return new Response(
      JSON.stringify({ error: "Analysis failed. Continue journaling — your insights will update soon." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
