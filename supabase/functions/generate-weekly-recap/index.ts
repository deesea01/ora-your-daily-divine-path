import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { isAdminCaller } from "../_shared/admin-auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GUIDE_NAMES: Record<string, string> = {
  monk: "The Monk",
  st_francis: "St. Francis of Assisi",
  st_augustine: "St. Augustine",
  st_thomas_aquinas: "St. Thomas Aquinas",
  st_teresa: "St. Teresa of Ávila",
  st_michael: "St. Michael the Archangel",
  st_padre_pio: "St. Padre Pio",
  st_joan_of_arc: "St. Joan of Arc",
  st_anthony: "St. Anthony of Padua",
  // legacy short keys used by spiritual-growth function
  francis: "St. Francis of Assisi",
  augustine: "St. Augustine",
  aquinas: "St. Thomas Aquinas",
  teresa: "St. Teresa of Ávila",
  michael: "St. Michael the Archangel",
  padre_pio: "St. Padre Pio",
  joan: "St. Joan of Arc",
};

function startOfWeekSunday(d: Date): Date {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - date.getDay()); // back to Sunday
  return date;
}

function fmtDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function topN<T extends string>(arr: T[], n = 3): { name: T; count: number }[] {
  const counts: Record<string, number> = {};
  for (const item of arr) counts[item] = (counts[item] || 0) + 1;
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name, count]) => ({ name: name as T, count }));
}

function extractGuide(content: string): string | null {
  const m = content.match(/\[guide:([a-z_]+)\]/i);
  return m ? m[1] : null;
}

async function aggregateForUser(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  weekStart: string,
  weekEnd: string,
) {
  const startISO = `${weekStart}T00:00:00Z`;
  const endISO = `${weekEnd}T23:59:59Z`;

  const [
    { data: messages },
    { data: analyses },
    { data: confessions },
    { data: completions },
    { data: journalEntries },
  ] = await Promise.all([
    supabase
      .from("chat_messages")
      .select("role, content, created_at")
      .eq("user_id", userId)
      .gte("created_at", startISO)
      .lte("created_at", endISO),
    supabase
      .from("reflection_analyses")
      .select("detected_virtues, detected_struggles, emotional_tone, entry_date")
      .eq("user_id", userId)
      .gte("entry_date", weekStart)
      .lte("entry_date", weekEnd),
    supabase
      .from("confessions")
      .select("confession_date, mood")
      .eq("user_id", userId)
      .gte("confession_date", weekStart)
      .lte("confession_date", weekEnd),
    supabase
      .from("prayer_completions")
      .select("prayer_type, prayer_date")
      .eq("user_id", userId)
      .gte("prayer_date", weekStart)
      .lte("prayer_date", weekEnd),
    supabase
      .from("journal_entries")
      .select("id")
      .eq("user_id", userId)
      .gte("created_at", startISO)
      .lte("created_at", endISO),
  ]);

  // ----- Saint stats -----
  const guideMessages: Record<string, number> = {};
  for (const m of messages || []) {
    const g = extractGuide((m as any).content || "");
    if (!g) continue;
    guideMessages[g] = (guideMessages[g] || 0) + 1;
  }
  const saintBreakdown = Object.entries(guideMessages)
    .map(([guide, msgs]) => ({
      guide,
      label: GUIDE_NAMES[guide] || guide,
      messages: msgs,
      // ~30 seconds per exchange (user+assistant). Round to nearest minute.
      minutes: Math.max(1, Math.round((msgs * 30) / 60)),
    }))
    .sort((a, b) => b.messages - a.messages);

  const top = saintBreakdown[0];

  // ----- Virtues / struggles -----
  const allVirtues = (analyses || []).flatMap((a: any) => a.detected_virtues || []);
  const allStruggles = (analyses || []).flatMap((a: any) => a.detected_struggles || []);
  const tones = (analyses || []).map((a: any) => a.emotional_tone).filter(Boolean);

  const topVirtues = topN(allVirtues);
  const struggleCounts = topN(allStruggles, 5);
  const recurring = struggleCounts.filter((s) => s.count >= 2);
  const overcome = struggleCounts.filter((s) => s.count === 1);

  const toneCounts = topN(tones);
  const dominantTone = toneCounts[0]?.name || null;

  // ----- Prayer stats -----
  const prayersByType: Record<string, number> = {};
  const dayset = new Set<string>();
  for (const c of completions || []) {
    const t = (c as any).prayer_type;
    prayersByType[t] = (prayersByType[t] || 0) + 1;
    dayset.add((c as any).prayer_date);
  }
  const rosaries = prayersByType["rosary"] || 0;

  // streak within week (longest consecutive days w/ at least one completion)
  const sortedDays = [...dayset].sort();
  let longest = 0;
  let cur = 0;
  let prev: Date | null = null;
  for (const d of sortedDays) {
    const cd = new Date(d + "T00:00:00");
    if (prev && (cd.getTime() - prev.getTime()) / 86400000 === 1) cur++;
    else cur = 1;
    if (cur > longest) longest = cur;
    prev = cd;
  }

  return {
    saint_top: top,
    saint_breakdown: saintBreakdown,
    saint_message_count: top?.messages || 0,
    saint_minutes_estimate: top?.minutes || 0,
    top_virtues: topVirtues,
    recurring_struggles: recurring,
    overcome_struggles: overcome,
    emotional_tone: dominantTone,
    prayer_completions_count: completions?.length || 0,
    prayers_by_type: prayersByType,
    rosaries_completed: rosaries,
    longest_streak_this_week: longest,
    journal_entries_count: journalEntries?.length || 0,
    confessions_count: confessions?.length || 0,
  };
}

async function aiNarrative(
  agg: any,
  apiKey: string,
): Promise<{ headline: string; reflection: string; scripture: string }> {
  const guideName = agg.saint_top?.label || "your spiritual guide";
  const ctx = `
- Top Saint: ${guideName} (${agg.saint_message_count} messages, ~${agg.saint_minutes_estimate} min)
- Top virtues: ${agg.top_virtues.map((v: any) => `${v.name} (${v.count})`).join(", ") || "none"}
- Recurring struggles: ${agg.recurring_struggles.map((s: any) => s.name).join(", ") || "none"}
- Struggles overcome: ${agg.overcome_struggles.map((s: any) => s.name).join(", ") || "none"}
- Emotional tone: ${agg.emotional_tone || "varied"}
- Prayer completions: ${agg.prayer_completions_count}, Rosaries: ${agg.rosaries_completed}
- Journal entries: ${agg.journal_entries_count}, Confessions: ${agg.confessions_count}
- Longest streak this week: ${agg.longest_streak_this_week} days
`;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content:
            "You are a warm, hopeful Catholic spiritual director writing a Spotify-Wrapped-style weekly recap. Always be encouraging, never shame the user. Return ONLY a JSON object via the tool call.",
        },
        {
          role: "user",
          content: `Here is this week's spiritual data:\n${ctx}\n\nGenerate a recap with:\n- headline: 4-7 word celebratory title\n- reflection: 2-3 sentence warm reflection naming the user's top Saint and growth\n- scripture: a short relevant Bible verse with reference`,
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "weekly_recap",
            parameters: {
              type: "object",
              properties: {
                headline: { type: "string" },
                reflection: { type: "string" },
                scripture: { type: "string" },
              },
              required: ["headline", "reflection", "scripture"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "weekly_recap" } },
    }),
  });

  if (!res.ok) {
    return {
      headline: "A Week of Grace",
      reflection: `You spent time with ${guideName} this week. Keep walking the path.`,
      scripture: "“Be still, and know that I am God.” — Psalm 46:10",
    };
  }
  const data = await res.json();
  const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  if (!args) {
    return {
      headline: "A Week of Grace",
      reflection: `You spent time with ${guideName} this week.`,
      scripture: "“Be still, and know that I am God.” — Psalm 46:10",
    };
  }
  return JSON.parse(args);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");
    const admin = createClient(supabaseUrl, serviceKey);

    const body = await req.json().catch(() => ({}));
    const { mode, week_start: weekStartParam, send_email: sendEmailParam } = body as {
      mode?: "current_user" | "all_users";
      week_start?: string;
      send_email?: boolean;
    };
    // Default: send emails on cron batch, skip on manual single-user generate
    const sendEmail = sendEmailParam ?? mode === "all_users";
    const APP_URL = Deno.env.get("APP_PUBLIC_URL") || "https://oradevotion.com";

    // Determine week window — last completed Sun-Sat by default
    const today = new Date();
    let weekStartDate: Date;
    if (weekStartParam) {
      weekStartDate = new Date(weekStartParam + "T00:00:00Z");
    } else {
      // most recent past Sunday (the just-completed week starts the Sunday before that)
      const thisSunday = startOfWeekSunday(today);
      weekStartDate = new Date(thisSunday);
      weekStartDate.setDate(thisSunday.getDate() - 7);
    }
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekStartDate.getDate() + 6);
    const weekStart = fmtDate(weekStartDate);
    const weekEnd = fmtDate(weekEndDate);

    let userIds: string[] = [];

    if (mode === "all_users") {
      // System batch (cron) — process every user with onboarding completed
      const { data } = await admin
        .from("user_profiles")
        .select("user_id")
        .eq("onboarding_completed", true);
      userIds = (data || []).map((r: any) => r.user_id);
    } else {
      // Single user — auth required
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) throw new Error("Missing authorization");
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error } = await admin.auth.getUser(token);
      if (error || !user) throw new Error("Unauthorized");
      userIds = [user.id];
    }

    const results: any[] = [];

    for (const uid of userIds) {
      const agg = await aggregateForUser(admin, uid, weekStart, weekEnd);

      // Skip users with effectively no activity (avoid empty recaps in batch mode)
      if (
        mode === "all_users" &&
        agg.prayer_completions_count === 0 &&
        agg.journal_entries_count === 0 &&
        agg.confessions_count === 0 &&
        agg.saint_message_count === 0
      ) {
        continue;
      }

      // Get current streak (across all time, ending on weekEnd)
      const { data: allDays } = await admin
        .from("prayer_completions")
        .select("prayer_date")
        .eq("user_id", uid)
        .lte("prayer_date", weekEnd)
        .order("prayer_date", { ascending: false })
        .limit(400);
      const unique = [...new Set((allDays || []).map((d: any) => d.prayer_date))].sort().reverse();
      let currentStreak = 0;
      if (unique.length > 0) {
        const end = new Date(weekEnd + "T00:00:00");
        const first = new Date(unique[0] + "T00:00:00");
        const diff = Math.floor((end.getTime() - first.getTime()) / 86400000);
        if (diff <= 1) {
          currentStreak = 1;
          for (let i = 0; i < unique.length - 1; i++) {
            const c = new Date(unique[i] + "T00:00:00");
            const p = new Date(unique[i + 1] + "T00:00:00");
            if ((c.getTime() - p.getTime()) / 86400000 === 1) currentStreak++;
            else break;
          }
        }
      }

      const narrative = await aiNarrative(agg, apiKey);

      const row = {
        user_id: uid,
        week_start: weekStart,
        week_end: weekEnd,
        top_saint: agg.saint_top?.guide || null,
        saint_message_count: agg.saint_message_count,
        saint_minutes_estimate: agg.saint_minutes_estimate,
        saint_breakdown: agg.saint_breakdown,
        top_virtues: agg.top_virtues,
        recurring_struggles: agg.recurring_struggles,
        overcome_struggles: agg.overcome_struggles,
        emotional_tone: agg.emotional_tone,
        prayer_completions_count: agg.prayer_completions_count,
        prayers_by_type: agg.prayers_by_type,
        rosaries_completed: agg.rosaries_completed,
        current_streak: currentStreak,
        longest_streak_this_week: agg.longest_streak_this_week,
        journal_entries_count: agg.journal_entries_count,
        confessions_count: agg.confessions_count,
        headline: narrative.headline,
        reflection: narrative.reflection,
        scripture: narrative.scripture,
        generated_at: new Date().toISOString(),
      };

      const { data: stored, error: upsertError } = await admin
        .from("weekly_recaps")
        .upsert(row, { onConflict: "user_id,week_start" })
        .select()
        .single();

      if (upsertError) {
        results.push({ user_id: uid, error: upsertError.message });
        continue;
      }
      results.push({ user_id: uid, recap: stored });

      // Send Sunday-morning email notification
      if (sendEmail) {
        try {
          const { data: authUser } = await admin.auth.admin.getUserById(uid);
          const recipient = authUser?.user?.email;
          if (recipient) {
            const { data: profile } = await admin
              .from("user_profiles")
              .select("display_name")
              .eq("user_id", uid)
              .maybeSingle();

            await admin.functions.invoke("send-transactional-email", {
              body: {
                templateName: "weekly_recap",
                recipientEmail: recipient,
                idempotencyKey: `weekly_recap_${uid}_${weekStart}`,
                templateData: {
                  displayName: (profile as any)?.display_name || null,
                  headline: narrative.headline,
                  topSaint: agg.saint_top?.label || null,
                  saintMessageCount: agg.saint_message_count,
                  saintMinutes: agg.saint_minutes_estimate,
                  prayerCount: agg.prayer_completions_count,
                  rosaryCount: agg.rosaries_completed,
                  streak: currentStreak,
                  topVirtue: agg.top_virtues[0]?.name || null,
                  reflection: narrative.reflection,
                  scripture: narrative.scripture,
                  recapUrl: `${APP_URL}/recap`,
                },
              },
            });
          }
        } catch (mailErr) {
          console.error("weekly recap email failed", { uid, error: mailErr });
        }
      }
    }

    return new Response(
      JSON.stringify(
        mode === "all_users"
          ? { processed: results.length, week_start: weekStart, week_end: weekEnd }
          : { recap: results[0]?.recap || null, week_start: weekStart, week_end: weekEnd },
      ),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    console.error("generate-weekly-recap error:", err);
    return new Response(
      JSON.stringify({ error: err?.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
