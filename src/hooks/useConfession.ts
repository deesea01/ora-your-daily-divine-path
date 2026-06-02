import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Confession {
  id: string;
  confession_date: string;
  parish_name: string | null;
  priest_name: string | null;
  reflection: string | null;
  mood: string | null;
  created_at: string;
}

export interface ConfessionPrepNote {
  id: string;
  category: string;
  checked_items: string[];
  notes: string | null;
  is_draft: boolean;
}

export interface ConfessionSettings {
  target_rhythm: string;
  passcode_enabled: boolean;
  auto_delete_prep: boolean;
  hide_previews: boolean;
  local_only: boolean;
}

const DEFAULT_SETTINGS: ConfessionSettings = {
  target_rhythm: 'monthly',
  passcode_enabled: false,
  auto_delete_prep: true,
  hide_previews: false,
  local_only: false,
};

export function useConfession() {
  const { user } = useAuth();
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [prepNotes, setPrepNotes] = useState<ConfessionPrepNote[]>([]);
  const [settings, setSettings] = useState<ConfessionSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const [confRes, prepRes, settRes] = await Promise.all([
        supabase
          .from('confessions')
          .select('*')
          .eq('user_id', user.id)
          .order('confession_date', { ascending: false }),
        supabase
          .from('confession_prep_notes')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_draft', true),
        supabase
          .from('confession_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(),
      ]);

      if (confRes.data) setConfessions(confRes.data as any);
      if (prepRes.data) setPrepNotes(prepRes.data as any);
      if (settRes.data) {
        const { id, user_id, created_at, updated_at, ...rest } = settRes.data as any;
        setSettings(rest);
      }
    } catch (e) {
      // Swallow — we always want to clear loading so the UI doesn't freeze.
      console.warn('[useConfession] fetchAll failed', e);
    } finally {
      setLoading(false);
    }
  }, [user]);


  useEffect(() => { fetchAll(); }, [fetchAll]);

  const logConfession = async (data: {
    confession_date: string;
    parish_name?: string;
    priest_name?: string;
    reflection?: string;
    mood?: string;
  }) => {
    if (!user) return;
    const { error } = await supabase.from('confessions').insert({
      user_id: user.id,
      ...data,
    });
    if (!error) {
      // Auto-delete prep notes if setting enabled
      if (settings.auto_delete_prep) {
        await supabase.from('confession_prep_notes').delete().eq('user_id', user.id);
      }
      await fetchAll();
    }
    return { error };
  };

  const deleteConfession = async (id: string) => {
    const { error } = await supabase.from('confessions').delete().eq('id', id);
    if (!error) await fetchAll();
    return { error };
  };

  const savePrepNote = async (category: string, checkedItems: string[], notes: string | null) => {
    if (!user) return;
    // Upsert by category
    const existing = prepNotes.find((n) => n.category === category);
    if (existing) {
      await supabase.from('confession_prep_notes').update({
        checked_items: checkedItems as any,
        notes,
        updated_at: new Date().toISOString(),
      }).eq('id', existing.id);
    } else {
      await supabase.from('confession_prep_notes').insert({
        user_id: user.id,
        category,
        checked_items: checkedItems as any,
        notes,
      });
    }
    await fetchAll();
  };

  const deleteAllPrepNotes = async () => {
    if (!user) return;
    await supabase.from('confession_prep_notes').delete().eq('user_id', user.id);
    setPrepNotes([]);
  };

  const updateSettings = async (newSettings: Partial<ConfessionSettings>) => {
    if (!user) return;
    const merged = { ...settings, ...newSettings };
    const { data: existing } = await supabase
      .from('confession_settings')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      await supabase.from('confession_settings').update({
        ...merged,
        updated_at: new Date().toISOString(),
      }).eq('user_id', user.id);
    } else {
      await supabase.from('confession_settings').insert({
        user_id: user.id,
        ...merged,
      });
    }
    setSettings(merged);
  };

  const lastConfession = confessions.length > 0 ? confessions[0] : null;
  const daysSinceLastConfession = lastConfession
    ? Math.floor((Date.now() - new Date(lastConfession.confession_date + 'T00:00:00').getTime()) / 86400000)
    : null;

  const targetDays = settings.target_rhythm === 'weekly' ? 7
    : settings.target_rhythm === 'biweekly' ? 14
    : settings.target_rhythm === 'monthly' ? 30
    : 30;

  const onTrack = daysSinceLastConfession !== null && daysSinceLastConfession <= targetDays;

  return {
    confessions,
    prepNotes,
    settings,
    loading,
    lastConfession,
    daysSinceLastConfession,
    targetDays,
    onTrack,
    logConfession,
    deleteConfession,
    savePrepNote,
    deleteAllPrepNotes,
    updateSettings,
    refetch: fetchAll,
  };
}
