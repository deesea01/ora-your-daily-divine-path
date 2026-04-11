import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface JournalEntry {
  id: string;
  title: string | null;
  body: string | null;
  tags: string[];
  emotional_state: string | null;
  spiritual_state: string | null;
  prayer_intention: string | null;
  saint_theme: string | null;
  scripture_verse: string | null;
  entry_type: string;
  entry_date: string;
  created_at: string;
}

export interface ExamenEntry {
  id: string;
  step_number: number;
  step_name: string;
  response: string | null;
  entry_date: string;
  is_draft: boolean;
}

export interface JournalSettings {
  passcode_enabled: boolean;
  hide_previews: boolean;
  local_only: boolean;
}

const DEFAULT_SETTINGS: JournalSettings = {
  passcode_enabled: false,
  hide_previews: false,
  local_only: false,
};

export function useJournal() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [examenEntries, setExamenEntries] = useState<ExamenEntry[]>([]);
  const [settings, setSettings] = useState<JournalSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);

    const today = new Date().toISOString().split('T')[0];
    const [entRes, exRes, setRes] = await Promise.all([
      supabase.from('journal_entries').select('*').eq('user_id', user.id).order('entry_date', { ascending: false }).limit(100),
      supabase.from('examen_entries').select('*').eq('user_id', user.id).eq('entry_date', today),
      supabase.from('journal_settings').select('*').eq('user_id', user.id).maybeSingle(),
    ]);

    if (entRes.data) setEntries(entRes.data as any);
    if (exRes.data) setExamenEntries(exRes.data as any);
    if (setRes.data) {
      const { id, user_id, created_at, updated_at, ...rest } = setRes.data as any;
      setSettings(rest);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const saveJournalEntry = async (data: {
    title?: string; body?: string; tags?: string[]; emotional_state?: string;
    spiritual_state?: string; prayer_intention?: string; saint_theme?: string;
    scripture_verse?: string; entry_type?: string;
  }) => {
    if (!user) return;
    const { error } = await supabase.from('journal_entries').insert({
      user_id: user.id, ...data,
    });
    if (!error) await fetchAll();
    return { error };
  };

  const deleteJournalEntry = async (id: string) => {
    const { error } = await supabase.from('journal_entries').delete().eq('id', id);
    if (!error) await fetchAll();
  };

  const deleteAllEntries = async () => {
    if (!user) return;
    await supabase.from('journal_entries').delete().eq('user_id', user.id);
    await supabase.from('examen_entries').delete().eq('user_id', user.id);
    setEntries([]);
    setExamenEntries([]);
  };

  const saveExamenStep = async (stepNumber: number, stepName: string, response: string, isDraft: boolean) => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const existing = examenEntries.find(e => e.step_number === stepNumber && e.entry_date === today);
    if (existing) {
      await supabase.from('examen_entries').update({
        response, is_draft: isDraft, updated_at: new Date().toISOString(),
      }).eq('id', existing.id);
    } else {
      await supabase.from('examen_entries').insert({
        user_id: user.id, step_number: stepNumber, step_name: stepName, response, is_draft: isDraft,
      });
    }
    await fetchAll();
  };

  const completeExamen = async () => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    await supabase.from('examen_entries').update({ is_draft: false, updated_at: new Date().toISOString() })
      .eq('user_id', user.id).eq('entry_date', today);
    // Also create a journal entry for the examen
    const responses = examenEntries.filter(e => e.response?.trim()).map(e => `**${e.step_name}**: ${e.response}`).join('\n\n');
    await supabase.from('journal_entries').insert({
      user_id: user.id, title: 'Daily Examen', body: responses, entry_type: 'examen', tags: ['examen'],
    });
    await fetchAll();
  };

  const updateSettings = async (newSettings: Partial<JournalSettings>) => {
    if (!user) return;
    const merged = { ...settings, ...newSettings };
    const { data: existing } = await supabase.from('journal_settings').select('id').eq('user_id', user.id).maybeSingle();
    if (existing) {
      await supabase.from('journal_settings').update({ ...merged, updated_at: new Date().toISOString() }).eq('user_id', user.id);
    } else {
      await supabase.from('journal_settings').insert({ user_id: user.id, ...merged });
    }
    setSettings(merged);
  };

  // Computed values
  const today = new Date().toISOString().split('T')[0];
  const todayEntry = entries.find(e => e.entry_date === today);
  const todayExamen = examenEntries.filter(e => e.entry_date === today);
  const hasExamenToday = todayExamen.some(e => !e.is_draft);

  // Streak
  const streak = (() => {
    const entryDates = new Set(entries.map(e => e.entry_date));
    let s = 0;
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    while (true) {
      const ds = d.toISOString().split('T')[0];
      if (entryDates.has(ds)) { s++; d.setDate(d.getDate() - 1); }
      else if (s === 0) { d.setDate(d.getDate() - 1); /* allow today not yet done */ }
      else break;
    }
    return s;
  })();

  return {
    entries, examenEntries, settings, loading,
    todayEntry, todayExamen, hasExamenToday, streak,
    saveJournalEntry, deleteJournalEntry, deleteAllEntries,
    saveExamenStep, completeExamen, updateSettings, refetch: fetchAll,
  };
}
