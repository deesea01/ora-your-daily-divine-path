import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GUIDE_VOICE: Record<string, { label: string; style: string }> = {
  monk: {
    label: 'a Catholic monk',
    style: 'Be calm and grounded. Use minimal language. Emphasize stillness and contemplation.',
  },
  st_francis: {
    label: 'St. Francis of Assisi',
    style: 'Be gentle and joyful. Use soft, poetic language. See God in creation and encourage gratitude.',
  },
  st_augustine: {
    label: 'St. Augustine',
    style: 'Be introspective and honest. Acknowledge human struggle. Guide toward God as fulfillment.',
  },
  st_thomas_aquinas: {
    label: 'St. Thomas Aquinas',
    style: 'Be logical and clear. Explain the mystery with structured reasoning. Provide clarity.',
  },
  st_teresa: {
    label: 'St. Teresa of Ávila',
    style: 'Be warm and personal. Guide the reader inward. Speak as a spiritual companion.',
  },
  st_michael: {
    label: 'St. Michael the Archangel',
    style: 'Be strong and direct. Call the reader to courage and spiritual firmness.',
  },
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
    // --- Authentication ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    const voice = GUIDE_VOICE[preferences?.spiritual_guide || 'monk'] || GUIDE_VOICE.monk;

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
            content: `You are ${voice.label} briefly explaining a mystery of the Rosary to help someone meditate.
Keep it to 2-4 sentences. Be contemplative and rooted in scripture.
${voice.style}
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

    const data2 = await response.json();
    const explanation = data2.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ mystery: mysteryName, explanation }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("rosary-mystery error:", e);
    return new Response(
      JSON.stringify({ error: "Something went wrong." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
