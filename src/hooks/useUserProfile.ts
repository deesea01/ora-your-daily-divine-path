import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface UserProfile {
  seeking: string[];
  experience_level: string;
  onboarding_completed: boolean;
  prayer_plan_generated: boolean;
  prayer_plan_reviewed: boolean;
  spiritual_guide: string;
  preferred_language: string;
  daily_prayer_goal: number;
  display_name: string | null;
  terms_accepted_at: string | null;
  timezone: string;
}

function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    // Reset loading whenever the user changes so consumers don't act on stale state
    setLoading(true);
    supabase
      .from('user_profiles')
      .select('seeking, experience_level, onboarding_completed, prayer_plan_generated, prayer_plan_reviewed, spiritual_guide, preferred_language, daily_prayer_goal, display_name, terms_accepted_at, timezone')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error('[useUserProfile] fetch error', error);
        } else {
          setProfile(data as UserProfile | null);
          // Auto-sync detected timezone if missing or stale
          const detected = detectTimezone();
          if (data && (!data.timezone || data.timezone === 'UTC' || data.timezone !== detected)) {
            supabase
              .from('user_profiles')
              .update({ timezone: detected, updated_at: new Date().toISOString() })
              .eq('user_id', user.id)
              .then(({ error: tzErr }) => {
                if (!tzErr && !cancelled) {
                  setProfile((prev) => (prev ? { ...prev, timezone: detected } : prev));
                }
              });
          }
        }
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [user?.id]);

  const saveProfile = async (seeking: string[], experienceLevel: string, dailyGoal?: number, displayName?: string, acceptTerms?: boolean) => {
    if (!user) return;

    const payload: any = {
      user_id: user.id,
      seeking,
      experience_level: experienceLevel,
      onboarding_completed: true,
      timezone: detectTimezone(),
      updated_at: new Date().toISOString(),
    };
    if (dailyGoal !== undefined) payload.daily_prayer_goal = dailyGoal;
    if (displayName !== undefined) payload.display_name = displayName;
    if (acceptTerms) payload.terms_accepted_at = new Date().toISOString();

    const { error } = await supabase
      .from('user_profiles')
      .upsert(payload, { onConflict: 'user_id' });

    if (!error) {
      setProfile((prev) => ({
        ...(prev || { seeking: [], experience_level: 'beginner', onboarding_completed: true, spiritual_guide: 'monk', preferred_language: 'en', daily_prayer_goal: 3, display_name: null, terms_accepted_at: null, timezone: detectTimezone() }),
        seeking,
        experience_level: experienceLevel,
        onboarding_completed: true,
        ...(displayName !== undefined ? { display_name: displayName } : {}),
        ...(acceptTerms ? { terms_accepted_at: new Date().toISOString() } : {}),
      }));
    }
    return { error };
  };

  const setGuide = async (guide: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('user_profiles')
      .update({ spiritual_guide: guide, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);

    if (!error && profile) {
      setProfile({ ...profile, spiritual_guide: guide });
    }
    return { error };
  };

  const setDailyPrayerGoal = async (goal: number) => {
    if (!user) return;

    const { error } = await supabase
      .from('user_profiles')
      .update({ daily_prayer_goal: goal, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);

    if (!error && profile) {
      setProfile({ ...profile, daily_prayer_goal: goal });
    }
    return { error };
  };

  return { profile, loading, saveProfile, setGuide, setDailyPrayerGoal };
}
