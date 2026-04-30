import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type ReminderSlot = 'morning' | 'midday' | 'night';

export interface ReminderTime {
  slot: ReminderSlot;
  /** 24-hour, local time. */
  hour: number;
  minute: number;
  label: string;
  message: string;
}

/** Default cadence (per user's chosen schedule). */
export const DEFAULT_REMINDERS: ReminderTime[] = [
  { slot: 'morning', hour: 7, minute: 0, label: 'Morning Lauds', message: 'Begin your day in grace.' },
  { slot: 'midday', hour: 12, minute: 0, label: 'Midday Angelus', message: 'Pause and remember the Incarnation.' },
  { slot: 'night', hour: 21, minute: 0, label: 'Night Compline', message: 'Close the day in His peace.' },
];

const ENABLED_KEY = 'ora:reminders:enabled';
const TIMES_KEY = 'ora:reminders:times';
const FIRED_KEY = 'ora:reminders:fired'; // { [slot]: 'YYYY-MM-DD' }
const TICK_MS = 30_000; // poll twice a minute — light, accurate enough
const WINDOW_MIN = 30; // fire if we enter the window within 30 minutes of target

const todayStr = () => new Date().toISOString().split('T')[0];

/* ------------------------------- preferences ------------------------------ */

export function getRemindersEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  const v = localStorage.getItem(ENABLED_KEY);
  // Default ON — gentle, easy to turn off in Settings.
  return v === null ? true : v === '1';
}

export function setRemindersEnabled(enabled: boolean) {
  try { localStorage.setItem(ENABLED_KEY, enabled ? '1' : '0'); } catch {}
}

export function getReminderTimes(): ReminderTime[] {
  if (typeof window === 'undefined') return DEFAULT_REMINDERS;
  try {
    const raw = localStorage.getItem(TIMES_KEY);
    if (!raw) return DEFAULT_REMINDERS;
    const parsed = JSON.parse(raw) as Partial<ReminderTime>[];
    return DEFAULT_REMINDERS.map((d) => {
      const override = parsed.find((p) => p.slot === d.slot);
      return override ? { ...d, hour: override.hour ?? d.hour, minute: override.minute ?? d.minute } : d;
    });
  } catch {
    return DEFAULT_REMINDERS;
  }
}

export function setReminderTimes(times: ReminderTime[]) {
  try {
    localStorage.setItem(TIMES_KEY, JSON.stringify(times.map(({ slot, hour, minute }) => ({ slot, hour, minute }))));
  } catch {}
}

function getFiredMap(): Record<string, string> {
  try {
    const raw = localStorage.getItem(FIRED_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function markFiredToday(slot: ReminderSlot) {
  const map = getFiredMap();
  map[slot] = todayStr();
  try { localStorage.setItem(FIRED_KEY, JSON.stringify(map)); } catch {}
}

function wasFiredToday(slot: ReminderSlot): boolean {
  return getFiredMap()[slot] === todayStr();
}

/* --------------------------------- hook ----------------------------------- */

/**
 * In-app prayer reminders. While Ora is open, watches the clock and surfaces a
 * gentle toast when the user enters a prayer window (Morning, Midday, Night)
 * — but only if the user hasn't already completed that slot today and the
 * reminder hasn't fired yet today.
 *
 * Mount once near the app root (e.g. inside <Index/>). No system permissions
 * required; safe in iframes; honors the user's enable/disable preference.
 */
export function usePrayerReminders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const completedTodayRef = useRef<Set<ReminderSlot>>(new Set());
  const lastCheckedDayRef = useRef<string>(todayStr());

  // Refresh today's completed slots whenever user changes or day rolls over.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const loadCompletions = async () => {
      const { data } = await supabase
        .from('prayer_completions')
        .select('prayer_type')
        .eq('user_id', user.id)
        .eq('prayer_date', todayStr());
      if (cancelled) return;
      completedTodayRef.current = new Set(
        (data ?? []).map((r: any) => r.prayer_type).filter(Boolean) as ReminderSlot[],
      );
    };
    loadCompletions();
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const tick = () => {
      if (!getRemindersEnabled()) return;

      const now = new Date();
      const day = todayStr();

      // Day rollover — clear in-memory completion cache so next day starts fresh.
      if (day !== lastCheckedDayRef.current) {
        lastCheckedDayRef.current = day;
        completedTodayRef.current = new Set();
      }

      const times = getReminderTimes();
      const minutesNow = now.getHours() * 60 + now.getMinutes();

      for (const r of times) {
        const target = r.hour * 60 + r.minute;
        const delta = minutesNow - target;
        // Fire if we're within 0..WINDOW_MIN minutes after the target.
        if (delta < 0 || delta > WINDOW_MIN) continue;
        if (wasFiredToday(r.slot)) continue;
        if (completedTodayRef.current.has(r.slot)) continue;

        // Mark fired *before* showing so duplicate ticks don't double-toast.
        markFiredToday(r.slot);

        toast(`Time for ${r.label}`, {
          description: r.message,
          duration: 9000,
          action: {
            label: 'Pray now',
            onClick: () => navigate(`/prayer/${r.slot}`),
          },
        });
      }
    };

    // Run once on mount (handles "user opens app inside the window" case),
    // then poll lightly.
    tick();
    const id = window.setInterval(tick, TICK_MS);

    // Re-check immediately when the tab becomes visible again.
    const onVisible = () => { if (document.visibilityState === 'visible') tick(); };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [user, navigate]);
}

export default usePrayerReminders;
