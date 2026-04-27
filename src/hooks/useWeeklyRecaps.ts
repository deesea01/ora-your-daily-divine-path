import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface SaintBreakdownEntry {
  guide: string;
  label: string;
  messages: number;
  minutes: number;
}

export interface CountedItem {
  name: string;
  count: number;
}

export interface WeeklyRecap {
  id: string;
  week_start: string;
  week_end: string;
  top_saint: string | null;
  saint_message_count: number;
  saint_minutes_estimate: number;
  saint_breakdown: SaintBreakdownEntry[];
  top_virtues: CountedItem[];
  recurring_struggles: CountedItem[];
  overcome_struggles: CountedItem[];
  emotional_tone: string | null;
  prayer_completions_count: number;
  prayers_by_type: Record<string, number>;
  rosaries_completed: number;
  current_streak: number;
  longest_streak_this_week: number;
  journal_entries_count: number;
  confessions_count: number;
  headline: string | null;
  reflection: string | null;
  scripture: string | null;
  generated_at: string;
}

export function useWeeklyRecaps() {
  const { user } = useAuth();
  const [recaps, setRecaps] = useState<WeeklyRecap[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const load = useCallback(async () => {
    if (!user) {
      setRecaps([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("weekly_recaps")
      .select("*")
      .eq("user_id", user.id)
      .order("week_start", { ascending: false })
      .limit(20);
    setRecaps((data as unknown as WeeklyRecap[]) || []);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const generateForLastWeek = useCallback(async () => {
    if (!user) return null;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-weekly-recap", {
        body: {},
      });
      if (error) throw error;
      await load();
      return data?.recap as WeeklyRecap | null;
    } finally {
      setGenerating(false);
    }
  }, [user?.id, load]);

  return { recaps, latest: recaps[0] || null, loading, generating, generateForLastWeek, refresh: load };
}
