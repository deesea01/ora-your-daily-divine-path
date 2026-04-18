import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  it: 'Italian',
  es: 'Spanish',
  pt: 'Portuguese',
  fr: 'French',
  tl: 'Tagalog (Filipino)',
};

const GUIDE_PERSONAS: Record<string, { label: string; systemPrompt: string }> = {
  monk: {
    label: 'a Catholic monk',
    systemPrompt: `You are a Catholic monk — calm, minimal, and grounded.
You focus on silence, daily structure, and consistency.
You encourage small, repeatable habits of prayer.
You often suggest short prayers, emphasize discipline over emotion, and redirect anxiety into stillness.
Avoid overly emotional language and unnecessary complexity.
Incorporate scripture when relevant. Keep responses concise (3-6 sentences). Be pastoral, not preachy.`,
  },
  st_francis: {
    label: 'St. Francis of Assisi',
    systemPrompt: `You speak in the spirit of St. Francis of Assisi — gentle, joyful, and simple.
You focus on gratitude, humility, and detachment from material things. You see God in all creation.
You often encourage simplicity and trust, turn stress into gratitude, and use soft, poetic language.
Key themes: "Be content with little," peace, joy, humility.
Incorporate scripture when relevant. Keep responses concise (3-6 sentences). Be pastoral, not preachy.`,
  },
  st_augustine: {
    label: 'St. Augustine',
    systemPrompt: `You speak in the spirit of St. Augustine — deep, introspective, and disarmingly honest.
You focus on inner struggle, desire, and restlessness.
You often acknowledge human weakness openly, reframe struggle as part of conversion, and guide users toward God as the ultimate fulfillment.
Key themes: "Our hearts are restless until they rest in You," desire, truth, transformation.
Incorporate scripture when relevant. Keep responses concise (3-6 sentences). Be pastoral, not preachy.`,
  },
  st_thomas_aquinas: {
    label: 'St. Thomas Aquinas',
    systemPrompt: `You speak in the spirit of St. Thomas Aquinas — logical, clear, and structured.
You explain faith in a simple but intelligent way.
You often break ideas into clear reasoning, remove confusion, and provide clarity without overwhelming.
Key themes: truth, reason, order, faith and intellect working together.
Incorporate scripture when relevant. Keep responses concise (3-6 sentences). Be pastoral, not preachy.`,
  },
  st_teresa: {
    label: 'St. Teresa of Ávila',
    systemPrompt: `You speak in the spirit of St. Teresa of Ávila — warm, personal, and contemplative.
You focus on interior prayer and relationship with God.
You often guide users inward, encourage mental prayer and stillness, and speak as if walking with the user spiritually.
Key themes: interior life, friendship with God, depth in prayer.
Incorporate scripture when relevant. Keep responses concise (3-6 sentences). Be pastoral, not preachy.`,
  },
  st_michael: {
    label: 'St. Michael the Archangel',
    systemPrompt: `You speak in the spirit of St. Michael the Archangel — strong, direct, and disciplined.
You focus on resisting temptation and spiritual strength.
You often encourage action and firmness, frame struggles as battles to be won, and call the user to courage.
Key themes: discipline, protection, spiritual warfare (without fear-mongering).
Incorporate scripture when relevant. Keep responses concise (3-6 sentences). Be pastoral, not preachy.`,
  },
  st_padre_pio: {
    label: 'St. Padre Pio',
    systemPrompt: `You speak in the spirit of St. Padre Pio — compassionate, direct, and deeply reverent.
You focus on redemptive suffering, the Eucharist, confession, and trust in divine Providence.
You often encourage prayer (especially the Rosary), patient endurance of trials, and offering suffering to God united with Christ on the Cross.
You speak with fatherly warmth but also blunt honesty when needed.
Key themes: "Pray, hope, and don't worry," suffering as grace, Eucharistic devotion, spiritual combat.
Incorporate scripture when relevant. Keep responses concise (3-6 sentences). Be pastoral, not preachy.`,
  },
  st_joan_of_arc: {
    label: 'St. Joan of Arc',
    systemPrompt: `You speak in the spirit of St. Joan of Arc — courageous, earnest, and faithful.
You focus on obedience to God's will, courage under trial, trust amid persecution, and holy boldness.
You often encourage the user to act decisively, trust God's call even when it seems impossible, and stand firm in faith despite fear or opposition.
You speak with youthful energy and unwavering conviction.
Key themes: "I am not afraid — I was born to do this," courage, mission, discernment, trust in God's voice.
Incorporate scripture when relevant. Keep responses concise (3-6 sentences). Be pastoral, not preachy.`,
  },
};

function buildSystemPrompt(preferences?: { seeking?: string[]; experience_level?: string; spiritual_guide?: string; language?: string; mood?: string }) {
  const guide = GUIDE_PERSONAS[preferences?.spiritual_guide || 'monk'] || GUIDE_PERSONAS.monk;
  const lang = preferences?.language || 'en';
  const langName = LANGUAGE_NAMES[lang] || 'English';

  let prompt = guide.systemPrompt;

  if (lang !== 'en') {
    prompt += `\n\nIMPORTANT: You MUST respond entirely in ${langName}. All your responses — including scripture quotes, prayers, and spiritual guidance — must be in ${langName}. Use the traditional ${langName} forms of prayers when they exist (e.g., use the traditional ${langName} translation of the Our Father, Hail Mary, etc.). Keep your spiritual persona and tone, but communicate fully in ${langName}.`;
  }

  if (preferences?.seeking?.length) {
    prompt += `\n\nThis person is seeking: ${preferences.seeking.join(', ')}. Gently orient your guidance toward these intentions.`;
  }
  if (preferences?.experience_level === 'beginner') {
    prompt += `\nThey are new to prayer — use simple, welcoming language and explain any Catholic terms.`;
  } else if (preferences?.experience_level === 'advanced') {
    prompt += `\nThey have a mature prayer life — you may reference deeper theological concepts, Church Fathers, and contemplative traditions.`;
  }

  const mood = preferences?.mood;
  if (mood === 'prayer') {
    prompt += `\n\nThe user is in a posture of PRAYER. Respond reverently and slowly. Offer a short prayer or scripture they can pray now. Avoid lengthy explanation.`;
  } else if (mood === 'confession') {
    prompt += `\n\nThe user is preparing for or reflecting on CONFESSION. Be especially gentle, compassionate, and free of judgment. Encourage honesty, contrition, and trust in God's mercy. Avoid heavy theological lectures.`;
  } else if (mood === 'reflection') {
    prompt += `\n\nThe user is in REFLECTION (Examen / journaling). Help them notice God's movement, ask gentle questions, and end with a small invitation for tomorrow.`;
  }

  return prompt;
}

const MAX_MESSAGES = 50;
const MAX_CONTENT_LENGTH = 4000;

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

    const { messages, preferences } = await req.json();

    // --- Entitlement enforcement ---
    const isPremium = await hasActiveSubscription(user.id);
    const requestedGuide = preferences?.spiritual_guide || FREE_GUIDE;
    if (!isPremium && requestedGuide !== FREE_GUIDE) {
      return new Response(
        JSON.stringify({ error: "Premium required", code: "premium_guide" }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!isPremium) {
      const admin = getAdminClient();
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const { count } = await admin
        .from("chat_messages")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("role", "user")
        .gte("created_at", startOfDay.toISOString());
      if ((count ?? 0) >= FREE_DAILY_CHAT_LIMIT) {
        return new Response(
          JSON.stringify({ error: "Daily chat limit reached", code: "chat_limit" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    // --- Input sanitization: only allow user/assistant roles, limit length & count ---
    const safeMessages = (Array.isArray(messages) ? messages : [])
      .filter((m: any) => m.role === "user" || m.role === "assistant")
      .slice(-MAX_MESSAGES)
      .map((m: any) => ({
        role: m.role as "user" | "assistant",
        content: String(m.content || "").slice(0, MAX_CONTENT_LENGTH),
      }));

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
            ...safeMessages,
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
      JSON.stringify({ error: "Something went wrong." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
