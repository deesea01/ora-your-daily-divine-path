import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type Slot = "morning" | "midday" | "night";

const GUIDE_VOICE: Record<string, { label: string; style: string }> = {
  st_francis: { label: "St. Francis of Assisi", style: "Gentle, joyful, poetic. Find God in creation; turn worry into gratitude." },
  st_augustine: { label: "St. Augustine", style: "Deep, honest, introspective. Acknowledge weakness; reframe struggle as conversion." },
  st_thomas_aquinas: { label: "St. Thomas Aquinas", style: "Clear, logical, structured. Explain faith simply but intelligently." },
  st_teresa: { label: "St. Teresa of Ávila", style: "Warm, personal, contemplative. Guide inward to mental prayer and stillness." },
  st_michael: { label: "St. Michael the Archangel", style: "Strong, direct, courageous. Frame trials as battles of trust to be won." },
  st_anthony: { label: "St. Anthony of Padua", style: "Wise, restorative, peaceful. Help find what is lost and return wandering hearts to God." },
};

function voiceFor(key?: string) {
  return GUIDE_VOICE[key ?? "st_francis"] ?? GUIDE_VOICE.st_francis;
}

interface RecentCtx {
  saints: string[];
  themes: string[];
  lastCompleted: string[];
  recentMood?: string | null;
  openIntentions?: string[];
  recentReflectionSnippet?: string | null;
}

function systemPrompt(slot: Slot, guideKey: string | undefined, recent: RecentCtx) {
  const v = voiceFor(guideKey);

  const sharedShape = `
Return ONLY a single JSON object with this exact shape, no prose, no markdown fences:
{
  "opening": string,                                 // 2-3 sentences. Intimate, sacred. Sets the heart before God. No headings.
  "scripture": { "ref": string, "text": string },    // ONE single Bible verse chosen specifically for THIS person today, faithfully quoted (RSV-style ok). Keep it to ONE verse — never a passage. This is the only Scripture in the devotion.
  "reflection": string,                              // 2-4 sentences gently unpacking the scripture for THIS person today.
  "intercession": string,                            // 2-3 short petitions, line-broken. Weave in the user's open intentions if any, but never quote them verbatim.
  "saint": null | { "key": string, "name": string, "intercession": string }, // Include ONLY when meaningful; otherwise null.
  "prayer": string,                                  // 4-8 short lines forming ONE flowing personalized prayer. Plain text, line breaks ok.
  "blessing": string,                                // 1 short sentence closing blessing.
  "themes": string[],                                // 2-4 lowercase keywords this devotion touches (e.g. ["surrender","gratitude"]).
  "next_step": null | { "kind": "confession"|"rosary"|"novena"|"scripture"|"saint", "label": string, "reason": string }
}
Voice: ${v.label}. ${v.style}
Tone rules: gentle, reverent, never guilt-inducing or manipulative. Catholic and orthodox. Concise.
Personalization rules:
- Use the recent context lightly. Never quote the user's words back. Never name their intentions explicitly.
- If a recurring mood like "anxious" or "lonely" is present, choose a Psalm and reflection that meets that mood with hope.
"saint" guidance: include only if today's liturgical sense, the user's recent themes, or the chosen guide makes a saint feel naturally present. Otherwise return null.
"next_step" guidance: include only when truly fitting (e.g. a recurring struggle suggests Confession, repeated marian themes suggest the Rosary). Otherwise null.
`;

  const slotIntent: Record<Slot, string> = {
    morning: `Lead a MORNING PRAYER (Lauds tradition). The "opening" places the day before God in trust. The "scripture" is ONE single morning Bible verse chosen for this person (e.g. Ps 5:3, 63:1, 90:14, 143:8, Lam 3:22-23). The "intercession" lifts up the day's people, work, and unspoken needs. The "prayer" is one personalized morning offering.`,
    midday: `Lead the MIDDAY ANGELUS. The "opening" walks the user through the traditional Angelus in 3 short call-and-response style lines: "The Angel of the Lord declared unto Mary…", "Behold the handmaid of the Lord…", "And the Word was made flesh…" (concise, not full Hail Marys). The "scripture" is ONE single Marian or noon-hour verse (e.g. Lk 1:38, Jn 1:14, Ps 113:3). The "intercession" asks for grace to surrender the rest of the day. The "prayer" is one brief reflection on incarnation, vocation, or surrender.`,
    night: `Lead NIGHT PRAYER (Compline). The "opening" begins with a brief Examen — at most 3 short reflection prompts (one line each: gratitude, awareness, contrition). The "scripture" is ONE single night verse for rest and trust (e.g. Ps 4:8, 31:5, 91:1, Mt 11:28). The "intercession" asks protection for self, loved ones, and those who suffer. The "prayer" is a personalized Compline-style prayer for surrender and rest.`,
  };

  const personalization = `
Recent context (use lightly to personalize, never quote back verbatim):
- Recent saints prayed with: ${recent.saints.length ? recent.saints.join(", ") : "none yet"}
- Recurring themes: ${recent.themes.length ? recent.themes.join(", ") : "none yet"}
- Last 3 prayer slots completed: ${recent.lastCompleted.length ? recent.lastCompleted.join(", ") : "none yet"}
- Most recent journal mood: ${recent.recentMood ?? "unknown"}
- Number of open prayer intentions on the user's heart: ${recent.openIntentions?.length ?? 0}
- Brief gist of their last reflection (DO NOT QUOTE): ${recent.recentReflectionSnippet ?? "none"}
`;

  return `${slotIntent[slot]}\n${personalization}\n${sharedShape}`;
}

function safeParseJson(s: string): any | null {
  if (!s) return null;
  const cleaned = s.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
  try { return JSON.parse(cleaned); } catch {}
  const m = cleaned.match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch {} }
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const slot = body?.slot as Slot;
    if (!["morning", "midday", "night"].includes(slot)) {
      return new Response(JSON.stringify({ error: "Invalid slot" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const preferences = body?.preferences ?? {};
    const guideKey: string | undefined = preferences.spiritual_guide;

    const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const [{ data: recentRows }, { data: saintRows }, { data: latestJournal }, { data: openInts }] = await Promise.all([
      supabase
        .from("prayer_completions")
        .select("prayer_type, saint_key, themes, prayer_date")
        .eq("user_id", user.id)
        .gte("prayer_date", since)
        .order("prayer_date", { ascending: false })
        .limit(20),
      supabase
        .from("saint_interactions")
        .select("saint_key")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("journal_entries")
        .select("mood, content, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("intentions")
        .select("text, category")
        .eq("user_id", user.id)
        .eq("answered", false)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    const themeCounts = new Map<string, number>();
    const saintsRecent = new Set<string>();
    const lastCompleted: string[] = [];
    for (const r of recentRows ?? []) {
      if (Array.isArray((r as any).themes)) {
        for (const t of (r as any).themes as string[]) themeCounts.set(t, (themeCounts.get(t) ?? 0) + 1);
      }
      if ((r as any).saint_key) saintsRecent.add((r as any).saint_key);
      if (lastCompleted.length < 3) lastCompleted.push((r as any).prayer_type);
    }
    for (const s of saintRows ?? []) {
      if ((s as any).saint_key) saintsRecent.add((s as any).saint_key);
    }
    const topThemes = [...themeCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([t]) => t);

    const recentMood = (latestJournal as any)?.mood ?? null;
    const recentReflectionSnippet = (latestJournal as any)?.content
      ? String((latestJournal as any).content).slice(0, 160).replace(/\s+/g, " ")
      : null;
    const openIntentions = (openInts ?? []).map((i: any) => String(i.category ?? "intention"));

    const prompt = systemPrompt(slot, guideKey, {
      saints: [...saintsRecent].slice(0, 5),
      themes: topThemes,
      lastCompleted,
      recentMood,
      openIntentions,
      recentReflectionSnippet,
    });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const today = new Date().toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric", year: "numeric",
    });

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: `Today is ${today}. Generate the ${slot} devotion JSON now.` },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) {
      const txt = await aiRes.text();
      console.error("AI gateway error", aiRes.status, txt);
      const status = aiRes.status === 429 ? 429 : 500;
      return new Response(JSON.stringify({ error: status === 429 ? "Rate limited" : "Generation failed" }), {
        status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ai = await aiRes.json();
    const raw = ai?.choices?.[0]?.message?.content ?? "";
    const parsed = safeParseJson(raw);
    if (!parsed || typeof parsed !== "object") {
      console.error("Failed to parse AI JSON:", raw?.slice(0, 400));
      return new Response(JSON.stringify({ error: "Bad model output" }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const refText = (v: any) =>
      v && typeof v === "object"
        ? { ref: String(v.ref ?? ""), text: String(v.text ?? "") }
        : { ref: "", text: "" };

    const out = {
      opening: String(parsed.opening ?? ""),
      scripture: refText(parsed.scripture),
      reflection: String(parsed.reflection ?? ""),
      intercession: String(parsed.intercession ?? ""),
      prayer: String(parsed.prayer ?? ""),
      saint: parsed.saint && typeof parsed.saint === "object"
        ? {
            key: String(parsed.saint.key ?? ""),
            name: String(parsed.saint.name ?? ""),
            intercession: String(parsed.saint.intercession ?? ""),
          }
        : null,
      blessing: String(parsed.blessing ?? ""),
      themes: Array.isArray(parsed.themes) ? parsed.themes.map((t: any) => String(t).toLowerCase()).slice(0, 6) : [],
      next_step: parsed.next_step && typeof parsed.next_step === "object"
        ? {
            kind: String(parsed.next_step.kind ?? ""),
            label: String(parsed.next_step.label ?? ""),
            reason: String(parsed.next_step.reason ?? ""),
          }
        : null,
    };

    return new Response(JSON.stringify(out), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("guided-devotion error:", e);
    return new Response(JSON.stringify({ error: "Something went wrong" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
