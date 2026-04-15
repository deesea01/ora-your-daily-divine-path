import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface JournalEntry {
  id: string;
  content: string;
  mood: string | null;
  tags: string[];
  entry_type: string;
  examen_data: Record<string, string> | null;
  created_at: string;
}

export interface SpiritualInsight {
  id: string;
  summary: string | null;
  patterns: string[];
  strengths: string[];
  suggested_focus: string | null;
  entry_count: number;
  generated_at: string;
}

const PAGE_SIZE = 7;

export function useJournal() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [insight, setInsight] = useState<SpiritualInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const fetchEntries = useCallback(async (pageNum: number, append = false) => {
    if (!user) return;
    const from = pageNum * PAGE_SIZE;
    const to = from + PAGE_SIZE;

    const { data } = await supabase
      .from('journal_entries')
      .select('id, content, mood, tags, entry_type, examen_data, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (data) {
      const mapped = data.map((d: any) => ({
        ...d,
        tags: Array.isArray(d.tags) ? d.tags : [],
        examen_data: d.examen_data as Record<string, string> | null,
      }));
      setHasMore(mapped.length > PAGE_SIZE);
      const trimmed = mapped.slice(0, PAGE_SIZE);
      setEntries(prev => append ? [...prev, ...trimmed] : trimmed);
    }
    setLoading(false);
  }, [user]);

  const fetchInsight = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('spiritual_insights')
      .select('*')
      .eq('user_id', user.id)
      .order('generated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      setInsight({
        ...data,
        patterns: Array.isArray(data.patterns) ? data.patterns as string[] : [],
        strengths: Array.isArray(data.strengths) ? data.strengths as string[] : [],
      });
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchEntries(0);
      fetchInsight();
    } else {
      setEntries([]);
      setInsight(null);
      setLoading(false);
    }
  }, [user, fetchEntries, fetchInsight]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchEntries(next, true);
  };

  const saveEntry = async (content: string, mood?: string, tags?: string[], entryType = 'free', examenData?: Record<string, string>) => {
    if (!user || !content.trim()) return;
    setSaving(true);
    const { error } = await supabase.from('journal_entries').insert({
      user_id: user.id,
      content: content.trim().slice(0, 5000),
      mood: mood || null,
      tags: (tags || []).slice(0, 10),
      entry_type: entryType,
      examen_data: examenData || null,
    });
    setSaving(false);
    if (!error) {
      setPage(0);
      await fetchEntries(0);
    }
    return { error };
  };

  const deleteEntry = async (id: string) => {
    if (!user) return;
    await supabase.from('journal_entries').delete().eq('id', id).eq('user_id', user.id);
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const analyzePatterns = async () => {
    if (!user || analyzing) return;
    setAnalyzing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await supabase.functions.invoke('journal-analyze', {
        body: {},
      });
      if (resp.data && !resp.error) {
        await fetchInsight();
      }
    } catch (e) {
      console.error('Analysis failed:', e);
    }
    setAnalyzing(false);
  };

  return {
    entries, insight, loading, saving, analyzing, hasMore,
    saveEntry, deleteEntry, loadMore, analyzePatterns,
  };
}
