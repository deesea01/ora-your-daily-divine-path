import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface ReminderPrefs {
  enabled: boolean;
  email_enabled: boolean;
  sms_enabled: boolean;
  email_address: string | null;
  phone_e164: string | null;
  timezone: string;
  morning_hour: number;
  morning_minute: number;
  midday_hour: number;
  midday_minute: number;
  night_hour: number;
  night_minute: number;
  unfinished_followup: boolean;
}

export const DEFAULT_PREFS: ReminderPrefs = {
  enabled: true,
  email_enabled: false,
  sms_enabled: false,
  email_address: null,
  phone_e164: null,
  timezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC' : 'UTC',
  morning_hour: 7,
  morning_minute: 0,
  midday_hour: 12,
  midday_minute: 0,
  night_hour: 21,
  night_minute: 0,
  unfinished_followup: true,
};

export function useReminderPrefs() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<ReminderPrefs>(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('reminder_prefs')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (cancelled) return;
      if (data) {
        setPrefs({
          enabled: data.enabled,
          email_enabled: data.email_enabled,
          sms_enabled: data.sms_enabled,
          email_address: data.email_address,
          phone_e164: data.phone_e164,
          timezone: data.timezone,
          morning_hour: data.morning_hour,
          morning_minute: data.morning_minute,
          midday_hour: data.midday_hour,
          midday_minute: data.midday_minute,
          night_hour: data.night_hour,
          night_minute: data.night_minute,
          unfinished_followup: data.unfinished_followup,
        });
      } else {
        setPrefs({
          ...DEFAULT_PREFS,
          email_address: user.email ?? null,
        });
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user]);

  const update = useCallback(async (patch: Partial<ReminderPrefs>) => {
    if (!user) return;
    const next = { ...prefs, ...patch };
    setPrefs(next);
    setSaving(true);
    try {
      await supabase
        .from('reminder_prefs')
        .upsert(
          {
            user_id: user.id,
            ...next,
          },
          { onConflict: 'user_id' },
        );
    } finally {
      setSaving(false);
    }
  }, [prefs, user]);

  return { prefs, loading, saving, update };
}

export default useReminderPrefs;
