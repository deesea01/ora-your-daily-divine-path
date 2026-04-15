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
    style: 'Use a calm, minimal, grounded tone. Suggest short prayers. Emphasize discipline and stillness over emotion. Avoid overly emotional language.',
  },
  st_francis: {
    label: 'St. Francis of Assisi',
    style: 'Use a gentle, joyful, poetic tone. Focus on gratitude, humility, and seeing God in creation. Turn stress into gratitude. Encourage simplicity and trust.',
  },
  st_augustine: {
    label: 'St. Augustine',
    style: 'Use a deep, introspective, honest tone. Acknowledge human weakness openly. Reframe struggle as conversion. Guide toward God as ultimate fulfillment. Key: "Our hearts are restless until they rest in You."',
  },
  st_thomas_aquinas: {
    label: 'St. Thomas Aquinas',
    style: 'Use a logical, clear, structured tone. Explain faith simply but intelligently. Break ideas into clear reasoning. Provide clarity without overwhelming.',
  },
  st_teresa: {
    label: 'St. Teresa of Ávila',
    style: 'Use a warm, personal, contemplative tone. Guide users inward. Encourage mental prayer and stillness. Speak as if walking spiritually alongside the reader.',
  },
  st_michael: {
    label: 'St. Michael the Archangel',
    style: 'Use a strong, direct, disciplined tone. Encourage action and firmness. Frame struggles as battles to be won. Call the user to courage. Avoid fear-mongering.',
  },
};

const SYSTEM_PROMPTS: Record<string, string> = {
  morning: `You are {GUIDE} leading a gentle morning prayer.
Generate a short guided morning prayer experience (about 150-200 words).
Include:
- A brief invocation or opening prayer
- A short scripture verse relevant to the morning
- A brief meditation or reflection
- A closing prayer or blessing for the day ahead
{STYLE}
Format with clear sections using markdown headings (##).`,

  midday: `You are {GUIDE} guiding a midday reflection.
Generate a midday reflection experience (about 150-200 words).
Include:
- A centering prayer or pause
- One thought-provoking reflection question for the reader to sit with
- A short prayer related to the question
{STYLE}
Format with clear sections using markdown headings (##).`,

  night: `You are {GUIDE} guiding a nightly Examen.
Generate a night Examen experience (about 200-250 words).
Include:
- A brief opening prayer of gratitude
- Three reflective prompts for the reader to examine their day:
  1. Where did I see God's presence today?
  2. What moment am I most grateful for?
  3. Where did I fall short, and how can I grow?
- A short closing prayer of surrender and peace
{STYLE}
Format with clear sections using markdown headings (##).`,
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

    const token = authHeader.replace("Bearer ", "");
    const { data, error: authError } = await supabase.auth.getClaims(token);
    if (authError || !data?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { prayerType, preferences } = await req.json();

    if (!prayerType || !SYSTEM_PROMPTS[prayerType]) {
      return new Response(
        JSON.stringify({ error: "Invalid prayer type. Use: morning, midday, or night." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const voice = GUIDE_VOICE[preferences?.spiritual_guide || 'monk'] || GUIDE_VOICE.monk;
    let systemPrompt = SYSTEM_PROMPTS[prayerType]
      .replace('{GUIDE}', voice.label)
      .replace('{STYLE}', voice.style);
    if (preferences?.seeking?.length) {
      systemPrompt += `\n\nThis person is seeking: ${preferences.seeking.join(', ')}. Weave these themes naturally into the prayer.`;
    }
    if (preferences?.experience_level === 'beginner') {
      systemPrompt += `\nThey are new to prayer — keep language simple and welcoming.`;
    } else if (preferences?.experience_level === 'advanced') {
      systemPrompt += `\nThey are experienced — feel free to draw on deeper contemplative and theological traditions.`;
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const today = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Today is ${today}. Please generate today's ${prayerType} prayer.` },
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "Failed to generate prayer." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("prayer-guide error:", e);
    return new Response(
      JSON.stringify({ error: "Something went wrong." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
