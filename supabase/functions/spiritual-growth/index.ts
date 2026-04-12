import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GUIDE_PERSONAS: Record<string, string> = {
  monk: "You are a wise, calm Catholic spiritual director. You are compassionate but truthful, never judgmental. You always point toward hope, growth, and God's mercy.",
  francis: "You are St. Francis of Assisi — joyful, humble, deeply connected to creation. You speak with simplicity and warmth, always pointing to poverty of spirit, love for the poor, and finding God in all creatures. You often reference nature and emphasize radical simplicity and peace.",
  augustine: "You are St. Augustine of Hippo — deeply intellectual yet profoundly moved by grace. You speak from personal experience of conversion and struggle. You emphasize the restless heart finding rest in God, the battle between flesh and spirit, and the transforming power of divine grace. You sometimes quote your Confessions.",
  aquinas: "You are St. Thomas Aquinas — systematic, clear, and profoundly wise. You approach spiritual matters with both reason and faith. You help organize thoughts logically while pointing to deeper theological truths. You emphasize virtue ethics, the natural law, and the harmony of faith and reason.",
  teresa: "You are St. Teresa of Ávila — warm, witty, and mystical. You speak as a dear friend who has experienced the depths of prayer. You emphasize the interior castle of the soul, stages of prayer, and intimate friendship with Christ. You are practical and sometimes humorous.",
  michael: "You are inspired by St. Michael the Archangel — bold, protective, and unwavering. You speak with clarity about spiritual warfare, guarding against evil, and standing firm in truth. You emphasize courage, vigilance, and the triumph of good over darkness.",
  padre_pio: "You are St. Padre Pio — deeply devoted, mystical, and direct. You speak with the authority of one who has suffered greatly for Christ. You emphasize the power of the Cross, the Eucharist, and perseverance through suffering. You are warm but unflinchingly honest.",
  joan: "You are St. Joan of Arc — courageous, mission-driven, and trusting in God's call. You speak with youthful boldness and unwavering faith. You emphasize listening to God's voice, courage in adversity, and faithfulness to one's divine mission even when others doubt.",
};

function getGuidePersona(guide: string): string {
  return GUIDE_PERSONAS[guide] || GUIDE_PERSONAS.monk;
}

function getGuideName(guide: string): string {
  const names: Record<string, string> = {
    monk: "your spiritual director",
    francis: "St. Francis of Assisi",
    augustine: "St. Augustine",
    aquinas: "St. Thomas Aquinas",
    teresa: "St. Teresa of Ávila",
    michael: "St. Michael the Archangel",
    padre_pio: "St. Padre Pio",
    joan: "St. Joan of Arc",
  };
  return names[guide] || names.monk;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Unauthorized");

    const body = await req.json();
    const { action, reflection_text, entry_id, entry_date } = body;

    // Resolve guide: from request body, or from user profile
    let guide = body.guide as string | undefined;
    if (!guide) {
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("spiritual_guide")
        .eq("user_id", user.id)
        .limit(1)
        .single();
      guide = profile?.spiritual_guide || "monk";
    }

    const persona = getGuidePersona(guide);
    const guideName = getGuideName(guide);

    if (action === "analyze_reflection") {
      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content: `${persona}

Analyze the following spiritual reflection and return a JSON object with these fields:
- detected_emotions: array of 1-3 emotions (e.g., "gratitude", "frustration", "peace", "anxiety", "hope", "sadness", "joy", "guilt", "love")
- detected_virtues: array of 0-2 virtues present (e.g., "patience", "humility", "charity", "discipline", "courage", "faith", "hope", "temperance", "fortitude", "prudence")
- detected_struggles: array of 0-2 struggles (e.g., "anger", "pride", "lust", "laziness", "envy", "gluttony", "greed", "impatience", "doubt", "fear", "distraction")
- emotional_tone: one word describing the overall tone
- ai_summary: 2-3 sentence summary of the reflection, written in the voice of ${guideName}
- affirmation: highlight a virtue or good seen in the reflection (2-3 sentences), in the voice of ${guideName}
- gentle_correction: gently identify a struggle area with compassion (2-3 sentences), in the voice of ${guideName}
- scripture: a specific, relevant scripture verse with reference that ${guideName} would choose
- actionable_step: one concrete step for tomorrow, suggested in the style of ${guideName}
- personalized_prayer: a short personalized prayer (3-4 sentences) in the voice of ${guideName}

Return ONLY valid JSON, no markdown.`
            },
            { role: "user", content: reflection_text }
          ],
          tools: [{
            type: "function",
            function: {
              name: "analyze_reflection",
              description: "Analyze a spiritual reflection",
              parameters: {
                type: "object",
                properties: {
                  detected_emotions: { type: "array", items: { type: "string" } },
                  detected_virtues: { type: "array", items: { type: "string" } },
                  detected_struggles: { type: "array", items: { type: "string" } },
                  emotional_tone: { type: "string" },
                  ai_summary: { type: "string" },
                  affirmation: { type: "string" },
                  gentle_correction: { type: "string" },
                  scripture: { type: "string" },
                  actionable_step: { type: "string" },
                  personalized_prayer: { type: "string" }
                },
                required: ["detected_emotions", "detected_virtues", "detected_struggles", "emotional_tone", "ai_summary", "affirmation", "gentle_correction", "scripture", "actionable_step", "personalized_prayer"],
                additionalProperties: false
              }
            }
          }],
          tool_choice: { type: "function", function: { name: "analyze_reflection" } }
        }),
      });

      if (!aiResponse.ok) {
        const status = aiResponse.status;
        if (status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (status === 402) return new Response(JSON.stringify({ error: "Credits exhausted. Please add funds." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        throw new Error("AI gateway error: " + status);
      }

      const aiData = await aiResponse.json();
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall) throw new Error("No tool call in AI response");
      
      const analysis = JSON.parse(toolCall.function.arguments);

      const { data: stored, error: storeError } = await supabase.from("reflection_analyses").insert({
        user_id: user.id,
        entry_id: entry_id || null,
        entry_date: entry_date || new Date().toISOString().split("T")[0],
        reflection_text,
        ...analysis,
      }).select().single();

      if (storeError) throw storeError;

      return new Response(JSON.stringify({ analysis: stored }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "generate_patterns") {
      const { data: analyses } = await supabase
        .from("reflection_analyses")
        .select("*")
        .eq("user_id", user.id)
        .order("entry_date", { ascending: false })
        .limit(14);

      if (!analyses || analyses.length < 5) {
        return new Response(JSON.stringify({ error: "Need at least 5 entries for pattern analysis", entry_count: analyses?.length || 0 }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const summaryText = analyses.map((a: any) => 
        `Date: ${a.entry_date}\nEmotions: ${a.detected_emotions.join(", ")}\nVirtues: ${a.detected_virtues.join(", ")}\nStruggles: ${a.detected_struggles.join(", ")}\nTone: ${a.emotional_tone}\nSummary: ${a.ai_summary}`
      ).join("\n\n---\n\n");

      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content: `${persona}

You are analyzing patterns across multiple spiritual reflections. Be compassionate and insightful, speaking in the voice of ${guideName}. Return JSON with:
- recurring_struggles: array of objects with {name, frequency, description} ranked by frequency
- growing_virtues: array of objects with {name, evidence, growth_note}
- common_triggers: array of objects with {trigger, context}
- emotional_trends: array of objects with {trend, description}
Return ONLY valid JSON.`
            },
            { role: "user", content: `Analyze these ${analyses.length} spiritual reflections for patterns:\n\n${summaryText}` }
          ],
          tools: [{
            type: "function",
            function: {
              name: "analyze_patterns",
              description: "Analyze spiritual patterns",
              parameters: {
                type: "object",
                properties: {
                  recurring_struggles: { type: "array", items: { type: "object", properties: { name: { type: "string" }, frequency: { type: "number" }, description: { type: "string" } }, required: ["name", "frequency", "description"] } },
                  growing_virtues: { type: "array", items: { type: "object", properties: { name: { type: "string" }, evidence: { type: "string" }, growth_note: { type: "string" } }, required: ["name", "evidence", "growth_note"] } },
                  common_triggers: { type: "array", items: { type: "object", properties: { trigger: { type: "string" }, context: { type: "string" } }, required: ["trigger", "context"] } },
                  emotional_trends: { type: "array", items: { type: "object", properties: { trend: { type: "string" }, description: { type: "string" } }, required: ["trend", "description"] } }
                },
                required: ["recurring_struggles", "growing_virtues", "common_triggers", "emotional_trends"],
                additionalProperties: false
              }
            }
          }],
          tool_choice: { type: "function", function: { name: "analyze_patterns" } }
        }),
      });

      if (!aiResponse.ok) {
        if (aiResponse.status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (aiResponse.status === 402) return new Response(JSON.stringify({ error: "Payment required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        throw new Error("AI error");
      }

      const aiData = await aiResponse.json();
      const patterns = JSON.parse(aiData.choices[0].message.tool_calls[0].function.arguments);

      const periodStart = analyses[analyses.length - 1].entry_date;
      const periodEnd = analyses[0].entry_date;

      const { data: stored } = await supabase.from("spiritual_patterns").insert({
        user_id: user.id,
        analysis_period_start: periodStart,
        analysis_period_end: periodEnd,
        entry_count: analyses.length,
        ...patterns,
      }).select().single();

      return new Response(JSON.stringify({ patterns: stored }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "generate_weekly_report") {
      const now = new Date();
      const weekEnd = now.toISOString().split("T")[0];
      const weekStart = new Date(now.getTime() - 7 * 86400000).toISOString().split("T")[0];

      const { data: analyses } = await supabase
        .from("reflection_analyses")
        .select("*")
        .eq("user_id", user.id)
        .gte("entry_date", weekStart)
        .lte("entry_date", weekEnd)
        .order("entry_date", { ascending: true });

      if (!analyses || analyses.length < 2) {
        return new Response(JSON.stringify({ error: "Need at least 2 entries this week", entry_count: analyses?.length || 0 }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const summaryText = analyses.map((a: any) =>
        `${a.entry_date}: Emotions=${a.detected_emotions.join(",")}, Virtues=${a.detected_virtues.join(",")}, Struggles=${a.detected_struggles.join(",")}, Tone=${a.emotional_tone}, Summary=${a.ai_summary}`
      ).join("\n");

      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content: `${persona}

You are creating a weekly spiritual report, speaking in the voice of ${guideName}. Be warm, insightful, and hopeful. Return JSON with:
- overall_summary: 2-3 sentence summary titled "This Week with God"
- growth_areas: Specific examples of virtue growth titled "Where You Grew" (2-3 sentences)
- struggle_patterns: Patterns, not one-offs, titled "Where You Struggled" (2-3 sentences)
- divine_invitation: Insightful directional guidance titled "God May Be Inviting You To…" (2-3 sentences)
- weekly_focus: ONE clear focus for next week with brief explanation`
            },
            { role: "user", content: `Weekly entries:\n${summaryText}` }
          ],
          tools: [{
            type: "function",
            function: {
              name: "weekly_report",
              description: "Generate weekly spiritual report",
              parameters: {
                type: "object",
                properties: {
                  overall_summary: { type: "string" },
                  growth_areas: { type: "string" },
                  struggle_patterns: { type: "string" },
                  divine_invitation: { type: "string" },
                  weekly_focus: { type: "string" }
                },
                required: ["overall_summary", "growth_areas", "struggle_patterns", "divine_invitation", "weekly_focus"],
                additionalProperties: false
              }
            }
          }],
          tool_choice: { type: "function", function: { name: "weekly_report" } }
        }),
      });

      if (!aiResponse.ok) {
        if (aiResponse.status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (aiResponse.status === 402) return new Response(JSON.stringify({ error: "Payment required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        throw new Error("AI error");
      }

      const aiData = await aiResponse.json();
      const report = JSON.parse(aiData.choices[0].message.tool_calls[0].function.arguments);

      const { data: stored } = await supabase.from("weekly_reports").insert({
        user_id: user.id,
        week_start: weekStart,
        week_end: weekEnd,
        ...report,
        full_report: report,
      }).select().single();

      return new Response(JSON.stringify({ report: stored }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "generate_growth_plan") {
      const [{ data: patterns }, { data: analyses }] = await Promise.all([
        supabase.from("spiritual_patterns").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1),
        supabase.from("reflection_analyses").select("*").eq("user_id", user.id).order("entry_date", { ascending: false }).limit(7),
      ]);

      const context = patterns?.[0]
        ? `Recent patterns: Struggles=${JSON.stringify(patterns[0].recurring_struggles)}, Virtues=${JSON.stringify(patterns[0].growing_virtues)}`
        : analyses?.map((a: any) => `Struggles=${a.detected_struggles.join(",")}, Virtues=${a.detected_virtues.join(",")}`).join("; ");

      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content: `${persona}

You are creating a personalized 3-day spiritual growth plan, speaking in the voice of ${guideName}. Make it practical, actionable, and rooted in Catholic tradition — especially in the spirituality and charism of ${guideName}. Return JSON with:
- focus_area: the main area to focus on
- day1_action: Day 1 - a specific behavioral action inspired by ${guideName}'s spirituality
- day2_action: Day 2 - a prayer or reflection exercise
- day3_action: Day 3 - a challenge or sacrifice
- scripture_anchor: one relevant scripture verse with reference that ${guideName} would choose
- plan_prayer: a short personalized prayer (3-4 sentences) in the voice of ${guideName}`
            },
            { role: "user", content: `Create a growth plan based on: ${context}` }
          ],
          tools: [{
            type: "function",
            function: {
              name: "growth_plan",
              description: "Generate 3-day growth plan",
              parameters: {
                type: "object",
                properties: {
                  focus_area: { type: "string" },
                  day1_action: { type: "string" },
                  day2_action: { type: "string" },
                  day3_action: { type: "string" },
                  scripture_anchor: { type: "string" },
                  plan_prayer: { type: "string" }
                },
                required: ["focus_area", "day1_action", "day2_action", "day3_action", "scripture_anchor", "plan_prayer"],
                additionalProperties: false
              }
            }
          }],
          tool_choice: { type: "function", function: { name: "growth_plan" } }
        }),
      });

      if (!aiResponse.ok) {
        if (aiResponse.status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (aiResponse.status === 402) return new Response(JSON.stringify({ error: "Payment required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        throw new Error("AI error");
      }

      const aiData = await aiResponse.json();
      const plan = JSON.parse(aiData.choices[0].message.tool_calls[0].function.arguments);

      await supabase.from("growth_plans").update({ is_active: false }).eq("user_id", user.id).eq("is_active", true);

      const { data: stored } = await supabase.from("growth_plans").insert({
        user_id: user.id,
        title: "Your 3-Day Spiritual Plan",
        ...plan,
      }).select().single();

      return new Response(JSON.stringify({ plan: stored }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "confession_prep") {
      // Fetch patterns and recent analyses for struggle context
      const [{ data: patterns }, { data: analyses }] = await Promise.all([
        supabase.from("spiritual_patterns").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1),
        supabase.from("reflection_analyses").select("detected_struggles, detected_emotions, ai_summary, entry_date").eq("user_id", user.id).order("entry_date", { ascending: false }).limit(10),
      ]);

      const struggles: string[] = [];
      if (patterns?.[0]?.recurring_struggles) {
        (patterns[0].recurring_struggles as any[]).forEach((s: any) => struggles.push(s.name || s));
      }
      analyses?.forEach((a: any) => {
        a.detected_struggles?.forEach((s: string) => {
          if (!struggles.includes(s)) struggles.push(s);
        });
      });

      if (struggles.length === 0) {
        return new Response(JSON.stringify({ error: "No detected struggles yet. Complete some Daily Examen reflections first." }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const context = patterns?.[0]
        ? `Recurring struggles: ${JSON.stringify(patterns[0].recurring_struggles)}. Recent reflections: ${analyses?.map((a: any) => `${a.entry_date}: struggles=${a.detected_struggles.join(",")}, summary=${a.ai_summary}`).join("; ")}`
        : `Recent struggles from reflections: ${analyses?.map((a: any) => `${a.entry_date}: ${a.detected_struggles.join(",")}`).join("; ")}`;

      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content: `${persona}

You are helping a Catholic prepare for the Sacrament of Reconciliation (Confession), speaking in the voice of ${guideName}. Based on the user's detected spiritual struggles and patterns, generate personalized confession preparation suggestions. Be compassionate, never judgmental, and always point toward God's mercy.

Return JSON with:
- examination_points: array of 3-5 objects with {struggle, question, reflection} — each maps a detected struggle to a specific examination question and a brief reflection prompt
- act_of_contrition_focus: a 2-3 sentence personalized focus for their act of contrition
- preparation_prayer: a short prayer (3-4 sentences) to pray before confession, in the voice of ${guideName}
- encouragement: 2-3 sentences of encouragement about approaching the sacrament, in the voice of ${guideName}
- suggested_penance_intentions: array of 2-3 brief penance intentions they might offer

This is a spiritual aid, NOT a substitute for the Sacrament. Return ONLY valid JSON.`
            },
            { role: "user", content: `Generate confession preparation based on these patterns:\n${context}` }
          ],
          tools: [{
            type: "function",
            function: {
              name: "confession_prep",
              description: "Generate personalized confession preparation",
              parameters: {
                type: "object",
                properties: {
                  examination_points: { type: "array", items: { type: "object", properties: { struggle: { type: "string" }, question: { type: "string" }, reflection: { type: "string" } }, required: ["struggle", "question", "reflection"] } },
                  act_of_contrition_focus: { type: "string" },
                  preparation_prayer: { type: "string" },
                  encouragement: { type: "string" },
                  suggested_penance_intentions: { type: "array", items: { type: "string" } }
                },
                required: ["examination_points", "act_of_contrition_focus", "preparation_prayer", "encouragement", "suggested_penance_intentions"],
                additionalProperties: false
              }
            }
          }],
          tool_choice: { type: "function", function: { name: "confession_prep" } }
        }),
      });

      if (!aiResponse.ok) {
        if (aiResponse.status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (aiResponse.status === 402) return new Response(JSON.stringify({ error: "Payment required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        throw new Error("AI error");
      }

      const aiData = await aiResponse.json();
      const prep = JSON.parse(aiData.choices[0].message.tool_calls[0].function.arguments);

      return new Response(JSON.stringify({ confession_prep: prep }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("spiritual-growth error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
