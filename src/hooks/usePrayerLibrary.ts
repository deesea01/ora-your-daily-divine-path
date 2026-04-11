import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface PrayerProgressData {
  prayer_id: string;
  difficulty: string;
  practice_count: number;
  last_practiced_at: string | null;
}

export function usePrayerLibrary() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState<Map<string, PrayerProgressData>>(new Map());
  const [routines, setRoutines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);

    const [favRes, progRes, routRes] = await Promise.all([
      supabase.from('prayer_favorites').select('prayer_id').eq('user_id', user.id),
      supabase.from('prayer_progress').select('*').eq('user_id', user.id),
      supabase.from('prayer_routines').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    ]);

    if (favRes.data) setFavorites(new Set(favRes.data.map((f: any) => f.prayer_id)));
    if (progRes.data) {
      const map = new Map<string, PrayerProgressData>();
      progRes.data.forEach((p: any) => map.set(p.prayer_id, p));
      setProgress(map);
    }
    if (routRes.data) setRoutines(routRes.data);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const toggleFavorite = async (prayerId: string) => {
    if (!user) return;
    if (favorites.has(prayerId)) {
      await supabase.from('prayer_favorites').delete().eq('user_id', user.id).eq('prayer_id', prayerId);
      setFavorites(prev => { const n = new Set(prev); n.delete(prayerId); return n; });
    } else {
      await supabase.from('prayer_favorites').insert({ user_id: user.id, prayer_id: prayerId });
      setFavorites(prev => new Set(prev).add(prayerId));
    }
  };

  const recordPractice = async (prayerId: string) => {
    if (!user) return;
    const existing = progress.get(prayerId);
    const newCount = (existing?.practice_count || 0) + 1;
    let newDifficulty = 'beginner';
    if (newCount >= 20) newDifficulty = 'memorized';
    else if (newCount >= 5) newDifficulty = 'familiar';

    const { data: ex } = await supabase.from('prayer_progress').select('id').eq('user_id', user.id).eq('prayer_id', prayerId).maybeSingle();
    if (ex) {
      await supabase.from('prayer_progress').update({
        practice_count: newCount,
        difficulty: newDifficulty,
        last_practiced_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq('id', ex.id);
    } else {
      await supabase.from('prayer_progress').insert({
        user_id: user.id,
        prayer_id: prayerId,
        practice_count: 1,
        difficulty: 'beginner',
        last_practiced_at: new Date().toISOString(),
      });
    }
    setProgress(prev => {
      const n = new Map(prev);
      n.set(prayerId, { prayer_id: prayerId, difficulty: newDifficulty, practice_count: newCount, last_practiced_at: new Date().toISOString() });
      return n;
    });
  };

  const markMemorized = async (prayerId: string) => {
    if (!user) return;
    const { data: ex } = await supabase.from('prayer_progress').select('id').eq('user_id', user.id).eq('prayer_id', prayerId).maybeSingle();
    if (ex) {
      await supabase.from('prayer_progress').update({ difficulty: 'memorized', updated_at: new Date().toISOString() }).eq('id', ex.id);
    } else {
      await supabase.from('prayer_progress').insert({ user_id: user.id, prayer_id: prayerId, difficulty: 'memorized' });
    }
    setProgress(prev => {
      const n = new Map(prev);
      const old = n.get(prayerId);
      n.set(prayerId, { prayer_id: prayerId, difficulty: 'memorized', practice_count: old?.practice_count || 0, last_practiced_at: old?.last_practiced_at || null });
      return n;
    });
  };

  const saveRoutine = async (name: string, description: string, prayerIds: string[]) => {
    if (!user) return;
    await supabase.from('prayer_routines').insert({ user_id: user.id, name, description, prayer_ids: prayerIds });
    await fetchAll();
  };

  const deleteRoutine = async (id: string) => {
    await supabase.from('prayer_routines').delete().eq('id', id);
    await fetchAll();
  };

  return {
    favorites,
    progress,
    routines,
    loading,
    toggleFavorite,
    recordPractice,
    markMemorized,
    saveRoutine,
    deleteRoutine,
    refetch: fetchAll,
  };
}
