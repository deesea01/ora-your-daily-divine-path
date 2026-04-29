import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Recommendation {
  type: "prayer" | "scripture" | "sacrament" | "saint" | "devotion";
  title: string;
  reason: string;
  action_label?: string;
  action_route?: string;
  priority?: number;
}

const SAINT_LABEL: Record<string, string> = {
  st_francis: "St. Francis of Assisi",
  st_augustine: "St. Augustine",
  st_thomas_aquinas: "St. Thomas Aquinas",
  st_teresa: "St. Teresa of Ávila",
  st_michael: "St. Michael the Archangel",
  st_padre_pio: "St. Padre Pio",
  st_joan_of_arc: "St. Joan of Arc",
};

function daysSince(date: string | null): number | null {
  if (!date) return null;
  const ms = Date.now() - new Date(date).getTime();
  return Math.floor(ms / 86_400_000);
}

function buildRules(ctx: {
  struggles: string[];
  growth_areas: string[];
  daysSinceConfession: number | null;
  recentJournalCount: number;
  prayerStreak: number;
  topSaint: string | null;
}): Recommendation[] {
  const recs: Recommendation[] = [];
  const s = new Set(ctx.struggles.map((x) => x.toLowerCase()));

  if (s.has("anxiety") || s.has("stress") || s.has("worry") || s.has("fear")) {
    recs.push({
      type: "scripture",
      title: "Psalm 23 — The Lord is my Shepherd",
      reason: "You've shared anxious thoughts recently. This Psalm is a quiet shelter.",
      action_label: "Read & pray",
      action_route: "/prayer-library",
      priority: 9,
    });
    recs.push({
      type: "prayer",
      title: "Litany of Trust",
      reason: "A prayer to lay down what you cannot carry.",
      action_label: "Pray now",
      action_route: "/prayer-library",
      priority: 7,
    });
  }

  if (s.has("lust") || s.has("temptation") || s.has("purity")) {
    recs.push({
      type: "devotion",
      title: "Daily accountability rule with St. Michael",
      reason: "When temptation recurs, rhythm and a strong intercessor help you stand firm.",
      action_label: "Begin rule",
      action_route: "/guide",
      priority: 9,
    });
    recs.push({
      type: "sacrament",
      title: "Prepare for Confession",
      reason: "Reconciliation lifts shame and restores grace. Ora can guide your examination.",
      action_label: "Examine conscience",
      action_route: "/confession/examine",
      priority: 10,
    });
  }

  if (s.has("guilt") || s.has("shame") || s.has("regret")) {
    recs.push({
      type: "sacrament",
      title: "The Sacrament of Reconciliation",
      reason: "Guilt is an invitation, not a verdict. Christ waits for you in the confessional.",
      action_label: "Prepare gently",
      action_route: "/confession",
      priority: 10,
    });
  }

  if (ctx.daysSinceConfession !== null && ctx.daysSinceConfession > 60) {
    recs.push({
      type: "sacrament",
      title: `It's been ${ctx.daysSinceConfession} days since your last confession`,
      reason: "When you're ready, the Lord is more eager to forgive than you are to be forgiven.",
      action_label: "Plan a visit",
      action_route: "/confession",
      priority: 8,
    });
  }

  if (s.has("doubt") || s.has("doubts") || s.has("faith")) {
    recs.push({
      type: "prayer",
      title: "Prayer of St. Augustine — for restless hearts",
      reason: "Doubt often hides a deeper longing. Augustine walked this road.",
      action_label: "Pray with Augustine",
      action_route: "/guide",
      priority: 6,
    });
  }

  if (s.has("loneliness") || s.has("isolation") || s.has("sadness") || s.has("grief")) {
    recs.push({
      type: "scripture",
      title: "Psalm 34 — Near to the brokenhearted",
      reason: "Scripture for the heaviness you've been carrying.",
      action_label: "Read",
      action_route: "/prayer-library",
      priority: 8,
    });
  }

  if (s.has("anger") || s.has("resentment") || s.has("unforgiveness")) {
    recs.push({
      type: "prayer",
      title: "Forgiveness Prayer",
      reason: "A short prayer to begin releasing what's been weighing on your heart.",
      action_label: "Pray",
      action_route: "/prayer-library",
      priority: 7,
    });
  }

  if (ctx.prayerStreak === 0) {
    recs.push({
      type: "devotion",
      title: "Begin again — one short prayer today",
      reason: "Every saint started with one quiet 'yes.' No shame in returning.",
      action_label: "Today's prayer path",
      action_route: "/",
      priority: 6,
    });
  } else if (ctx.prayerStreak >= 7) {
    recs.push({
      type: "devotion",
      title: "Try the Holy Rosary today",
      reason: `${ctx.prayerStreak} days of faithfulness — Our Lady would love to walk with you.`,
      action_label: "Begin Rosary",
      action_route: "/rosary",
      priority: 5,
    });
  }

  if (ctx.recentJournalCount === 0) {
    recs.push({
      type: "devotion",
      title: "An evening Examen",
      reason: "A quiet five minutes with God to notice where He moved today.",
      action_label: "Begin Examen",
      action_route: "/journal/examen",
      priority: 4,
    });
  }

  if (ctx.topSaint && SAINT_LABEL[ctx.topSaint]) {
    recs.push({
      type: "saint",
      title: `Continue with ${SAINT_LABEL[ctx.topSaint]}`,
      reason: "You've been drawn here lately. Stay close.",
      action_label: "Open chat",
      action_route: "/monk-chat",
      priority: 3,
    });
  }

  // Dedupe by title and sort by priority desc
  const seen = new Set<string>();
  const unique = recs.filter((r) => {
    if (seen.has(r.title)) return false;
    seen.add(r.title);
    return true;
  });
  unique.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  return unique.slice(0, 6);
}

async function maybeAiInvitation(
  summaryCtx: any,
  recs: Recommendation[],
): Promise<{ invitation: string | null; summary: string | null }> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return { invitation: null, summary: null };

  try {
    const prompt = `You are Ora, a Catholic spiritual companion with a sacred, gentle, never manipulative tone.
A user's recent spiritual context:
- Prayer streak: ${summaryCtx.prayerStreak} days
- Recurring struggles: ${summaryCtx.struggles.join(", ") || "(none noted)"}
- Growth areas: ${summaryCtx.growth_areas.join(", ") || "(none noted)"}
- Days since last confession: ${summaryCtx.daysSinceConfession ?? "unknown"}
- Top recommendation: ${recs[0]?.title ?? "(rest)"}

Write TWO short pieces in plain JSON: {"summary": "...", "invitation": "..."}
- summary: 1-2 sentences, in third person, gently observing where God seems to be working in this person.
- invitation: 1 sentence beginning with "Based on your recent prayer life, Ora suggests" — a gentle invitation, never a command, never guilt.
Return ONLY JSON. No markdown, no code fences.`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
    });

    if (!resp.ok) return { invitation: null, summary: null };
    const data = await resp.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) return { invitation: null, summary: null };
    const parsed = JSON.parse(text);
    return {
      summary: parsed.summary ?? null,
      invitation: parsed.invitation ?? null,
    };
  } catch (e) {
    console.error("AI invitation failed", e);
    return { invitation: null, summary: null };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anon, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;
    const admin = createClient(supabaseUrl, service);

    const body = await req.json().catch(() => ({}));
    const mode = body.mode === "full" ? "full" : "rules";

    // Throttle full refresh to once per 24h unless explicitly requested via ?force
    if (mode === "full" && !body.force) {
      const { data: existing } = await admin
        .from("spiritual_profiles")
        .select("last_refreshed_at")
        .eq("user_id", userId)
        .maybeSingle();
      if (existing?.last_refreshed_at) {
        const hours = (Date.now() - new Date(existing.last_refreshed_at).getTime()) / 3_600_000;
        if (hours < 20) {
          // Just return existing
          const { data: cur } = await admin
            .from("spiritual_profiles")
            .select("*")
            .eq("user_id", userId)
            .maybeSingle();
          return new Response(JSON.stringify({ profile: cur, cached: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
    }

    // Gather signals (last 30 days)
    const thirtyAgo = new Date(Date.now() - 30 * 86_400_000).toISOString();

    const [analysesRes, completionsRes, journalRes, confessionsRes, saintLogRes, profileRes, onbRes, scriptureRes, intentionsRes] =
      await Promise.all([
        admin.from("reflection_analyses").select("detected_struggles, detected_virtues, detected_emotions, entry_date").eq("user_id", userId).gte("entry_date", thirtyAgo.split("T")[0]),
        admin.from("prayer_completions").select("prayer_date, prayer_type").eq("user_id", userId).gte("prayer_date", thirtyAgo.split("T")[0]),
        admin.from("journal_entries").select("id, created_at, mood").eq("user_id", userId).gte("created_at", thirtyAgo),
        admin.from("confessions").select("confession_date").eq("user_id", userId).order("confession_date", { ascending: false }).limit(1),
        admin.from("saint_interactions").select("saint_key, created_at").eq("user_id", userId).gte("created_at", thirtyAgo),
        admin.from("user_profiles").select("spiritual_guide, daily_prayer_goal").eq("user_id", userId).maybeSingle(),
        admin.from("onboarding_responses").select("struggles, growth_focus").eq("user_id", userId).maybeSingle(),
        admin.from("scripture_saves").select("theme, reference, created_at").eq("user_id", userId).gte("created_at", thirtyAgo),
        admin.from("intentions").select("text, category, answered, created_at").eq("user_id", userId).gte("created_at", thirtyAgo),
      ]);

    // Aggregate struggles
    const struggleCounts = new Map<string, number>();
    (onbRes.data?.struggles ?? []).forEach((s: string) => struggleCounts.set(s, (struggleCounts.get(s) ?? 0) + 2));
    (analysesRes.data ?? []).forEach((a: any) => {
      (a.detected_struggles ?? []).forEach((s: string) => {
        struggleCounts.set(s.toLowerCase(), (struggleCounts.get(s.toLowerCase()) ?? 0) + 1);
      });
    });
    const struggles = [...struggleCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([s]) => s)
      .slice(0, 5);

    const virtueCounts = new Map<string, number>();
    (analysesRes.data ?? []).forEach((a: any) => {
      (a.detected_virtues ?? []).forEach((v: string) => {
        virtueCounts.set(v.toLowerCase(), (virtueCounts.get(v.toLowerCase()) ?? 0) + 1);
      });
    });
    const growth_areas = [
      ...new Set([...(onbRes.data?.growth_focus ?? []), ...[...virtueCounts.entries()].sort((a, b) => b[1] - a[1]).map(([v]) => v)]),
    ].slice(0, 5);

    // Saints affinity
    const saintCounts = new Map<string, number>();
    (saintLogRes.data ?? []).forEach((r: any) => {
      saintCounts.set(r.saint_key, (saintCounts.get(r.saint_key) ?? 0) + 1);
    });
    if (profileRes.data?.spiritual_guide) {
      saintCounts.set(profileRes.data.spiritual_guide, (saintCounts.get(profileRes.data.spiritual_guide) ?? 0) + 3);
    }
    const saints_affinity = [...saintCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([saint_key, interaction_count]) => ({ saint_key, interaction_count }));
    const top_saint = saints_affinity[0]?.saint_key ?? profileRes.data?.spiritual_guide ?? null;

    // Devotional consistency: % of last 30 days with at least one completion
    const completionDays = new Set((completionsRes.data ?? []).map((c: any) => c.prayer_date));
    const devotional_consistency = Math.round((completionDays.size / 30) * 100);

    // Streak
    const sortedDays = [...completionDays].sort().reverse();
    let prayerStreak = 0;
    if (sortedDays.length) {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const mostRecent = new Date(sortedDays[0] + "T00:00:00");
      const diff = Math.floor((today.getTime() - mostRecent.getTime()) / 86_400_000);
      if (diff <= 1) {
        prayerStreak = 1;
        for (let i = 0; i < sortedDays.length - 1; i++) {
          const c = new Date(sortedDays[i] + "T00:00:00");
          const p = new Date(sortedDays[i + 1] + "T00:00:00");
          if (Math.floor((c.getTime() - p.getTime()) / 86_400_000) === 1) prayerStreak++;
          else break;
        }
      }
    }

    // Preferred devotional time (morning/midday/night)
    const timeCounts = new Map<string, number>();
    (completionsRes.data ?? []).forEach((c: any) => {
      timeCounts.set(c.prayer_type, (timeCounts.get(c.prayer_type) ?? 0) + 1);
    });
    const preferred_devotional_time = [...timeCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    const lastConfession = confessionsRes.data?.[0]?.confession_date ?? null;
    const daysSinceConfession = daysSince(lastConfession);
    const recentJournalCount = journalRes.data?.length ?? 0;

    const recommendations = buildRules({
      struggles,
      growth_areas,
      daysSinceConfession,
      recentJournalCount,
      prayerStreak,
      topSaint: top_saint,
    });

    let ai_summary: string | null = null;
    let ai_invitation: string | null = null;
    if (mode === "full") {
      const ai = await maybeAiInvitation(
        { struggles, growth_areas, daysSinceConfession, prayerStreak },
        recommendations,
      );
      ai_summary = ai.summary;
      ai_invitation = ai.invitation;
    }

    const upsertPayload: any = {
      user_id: userId,
      growth_areas,
      struggles,
      devotional_consistency,
      top_saint,
      saints_affinity,
      preferred_devotional_time,
      recommendations,
      last_refreshed_at: new Date().toISOString(),
    };
    if (mode === "full") {
      upsertPayload.ai_summary = ai_summary;
      upsertPayload.ai_invitation = ai_invitation;
    }

    const { data: profile, error: upErr } = await admin
      .from("spiritual_profiles")
      .upsert(upsertPayload, { onConflict: "user_id" })
      .select()
      .single();

    if (upErr) {
      console.error("Upsert failed", upErr);
      return new Response(JSON.stringify({ error: "Failed to save profile" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ profile, cached: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("spiritual-memory error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
