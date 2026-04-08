import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MYSTERIES: Record<string, string[]> = {
  joyful: [
    "The Annunciation",
    "The Visitation",
    "The Nativity of Jesus",
    "The Presentation in the Temple",
    "The Finding of Jesus in the Temple",
  ],
  sorrowful: [
    "The Agony in the Garden",
    "The Scourging at the Pillar",
    "The Crowning with Thorns",
    "The Carrying of the Cross",
    "The Crucifixion and Death of Jesus",
  ],
  glorious: [
    "The Resurrection",
    "The Ascension",
    "The Descent of the Holy Spirit",
    "The Assumption of Mary",
    "The Coronation of Mary",
  ],
  luminous: [
    "The Baptism of Jesus",
    "The Wedding at Cana",
    "The Proclamation of the Kingdom",
    "The Transfiguration",
    "The Institution of the Eucharist",
  ],
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mysterySet, decadeIndex, preferences } = await req.json();

    if (!mysterySet || !MYSTERIES[mysterySet] || decadeIndex == null || decadeIndex < 0 || decadeIndex > 4) {
      return new Response(
        JSON.stringify({ error: "Invalid mysterySet or decadeIndex." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const mysteryName = MYSTERIES[mysterySet][decadeIndex];
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            content: `You are a Catholic monk briefly explaining a mystery of the Rosary to help someone meditate.
Keep it to 2-4 sentences. Be contemplative, warm, and rooted in scripture.
Do not use markdown headings. Write in plain flowing prose.${
  preferences?.experience_level === 'beginner' ? '\nUse simple, welcoming language.' :
  preferences?.experience_level === 'advanced' ? '\nYou may reference Church Fathers and deeper theology.' : ''
}${preferences?.seeking?.length ? `\nThis person is seeking: ${preferences.seeking.join(', ')}.` : ''}`,
          },
          {
            role: "user",
            content: `Briefly explain the mystery "${mysteryName}" from the ${mysterySet} mysteries to help me meditate during this decade of the Rosary.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      return new Response(JSON.stringify({ error: "Failed to generate explanation." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const explanation = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ mystery: mysteryName, explanation }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("rosary-mystery error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
