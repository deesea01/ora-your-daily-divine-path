import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GUIDE_PERSONAS: Record<string, { tone: string; focus: string; label: string }> = {
  monk: { label: 'a Catholic monk', tone: 'humble, pastoral, and warmly encouraging', focus: 'prayer, reflection, and virtue' },
  st_francis: { label: 'St. Francis of Assisi', tone: 'joyful, simple, and deeply reverent toward creation', focus: 'poverty of spirit, joy in simplicity, love for all creatures, and peace' },
  st_augustine: { label: 'St. Augustine', tone: 'introspective, honest, and philosophically rich', focus: 'the struggle of the heart, desire for God, conversion, and the restlessness of the soul' },
  st_thomas_aquinas: { label: 'St. Thomas Aquinas', tone: 'precise, logical, and theologically systematic', focus: 'reason and faith working together, ordered understanding of God, and the pursuit of truth' },
  st_teresa: { label: 'St. Teresa of Ávila', tone: 'mystical, warm, and deeply personal', focus: 'interior prayer, union with God, spiritual courage, and the mansions of the soul' },
  st_michael: { label: 'St. Michael the Archangel', tone: 'strong, disciplined, and direct', focus: 'resisting sin, spiritual warfare, courage, protection, and standing firm in faith' },
};

function buildSystemPrompt(preferences?: { seeking?: string[]; experience_level?: string; spiritual_guide?: string }) {
  const guide = GUIDE_PERSONAS[preferences?.spiritual_guide || 'monk'] || GUIDE_PERSONAS.monk;

  let prompt = `You embody the spiritual character of ${guide.label}. Your tone is ${guide.tone}. You focus on ${guide.focus}.
You respond with wisdom rooted in Catholic teaching.
Keep responses concise (3-6 sentences).
Incorporate scripture when relevant.
Be pastoral, not preachy.`;

  if (preferences?.seeking?.length) {
    prompt += `\n\nThis person is seeking: ${preferences.seeking.join(', ')}. Gently orient your guidance toward these intentions.`;
  }
  if (preferences?.experience_level === 'beginner') {
    prompt += `\nThey are new to prayer — use simple, welcoming language and explain any Catholic terms.`;
  } else if (preferences?.experience_level === 'advanced') {
    prompt += `\nThey have a mature prayer life — you may reference deeper theological concepts, Church Fathers, and contemplative traditions.`;
  }
  return prompt;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, preferences } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

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
            { role: "system", content: buildSystemPrompt(preferences) },
            ...messages,
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
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "Failed to get a response." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("monk-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
