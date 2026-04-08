import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export interface UserProfile {
  seeking: string[];
  experience_level: string;
  onboarding_completed: boolean;
}

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    supabase
      .from('user_profiles')
      .select('seeking, experience_level, onboarding_completed')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        setProfile(data as UserProfile | null);
        setLoading(false);
      });
  }, [user]);

  const saveProfile = async (seeking: string[], experienceLevel: string) => {
    if (!user) return;

    const payload = {
      user_id: user.id,
      seeking,
      experience_level: experienceLevel,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('user_profiles')
      .upsert(payload, { onConflict: 'user_id' });

    if (!error) {
      setProfile({ seeking, experience_level: experienceLevel, onboarding_completed: true });
    }
    return { error };
  };

  return { profile, loading, saveProfile };
}
