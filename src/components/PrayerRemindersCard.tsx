import { useState } from 'react';
import { Bell, BellOff, Sun, CloudSun, Moon } from 'lucide-react';
import { toast } from 'sonner';
import {
  DEFAULT_REMINDERS,
  ReminderSlot,
  ReminderTime,
  getRemindersEnabled,
  getReminderTimes,
  setRemindersEnabled,
  setReminderTimes,
} from '@/hooks/usePrayerReminders';

const ICONS: Record<ReminderSlot, typeof Sun> = {
  morning: Sun,
  midday: CloudSun,
  night: Moon,
};

function formatTime(h: number, m: number) {
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function parseTime(value: string): { hour: number; minute: number } | null {
  const m = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const hour = Math.max(0, Math.min(23, parseInt(m[1], 10)));
  const minute = Math.max(0, Math.min(59, parseInt(m[2], 10)));
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
  return { hour, minute };
}

export function PrayerRemindersCard() {
  const [enabled, setEnabled] = useState<boolean>(getRemindersEnabled());
  const [times, setTimes] = useState<ReminderTime[]>(getReminderTimes());

  const toggleEnabled = () => {
    const next = !enabled;
    setEnabled(next);
    setRemindersEnabled(next);
    toast(next ? 'Prayer reminders on' : 'Prayer reminders off', {
      description: next
        ? 'A gentle nudge will appear at each prayer time when Ora is open.'
        : 'You can turn them back on anytime.',
    });
  };

  const updateTime = (slot: ReminderSlot, value: string) => {
    const parsed = parseTime(value);
    if (!parsed) return;
    const next = times.map((t) => (t.slot === slot ? { ...t, ...parsed } : t));
    setTimes(next);
    setReminderTimes(next);
  };

  const restoreDefaults = () => {
    setTimes(DEFAULT_REMINDERS);
    setReminderTimes(DEFAULT_REMINDERS);
    toast('Default times restored', {
      description: '7:00 AM · 12:00 PM · 9:00 PM',
    });
  };

  return (
    <div className="surface-elegant rounded-xl p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
            {enabled ? (
              <Bell className="h-4 w-4 text-gold" />
            ) : (
              <BellOff className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <div>
            <h3 className="font-serif text-lg font-medium text-foreground">Prayer Reminders</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Gentle nudges for Morning, Midday & Night while Ora is open.
            </p>
          </div>
        </div>
        <button
          role="switch"
          aria-checked={enabled}
          onClick={toggleEnabled}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
            enabled ? 'bg-gold' : 'bg-secondary'
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-background shadow transition-transform ${
              enabled ? 'translate-x-[22px]' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      <div className={`space-y-2 transition-opacity ${enabled ? 'opacity-100' : 'opacity-50'}`}>
        {times.map((t) => {
          const Icon = ICONS[t.slot];
          return (
            <label
              key={t.slot}
              className="flex items-center justify-between rounded-lg border border-border bg-card/60 px-3 py-2.5"
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-gold/80" />
                <span className="text-sm text-foreground">{t.label}</span>
              </span>
              <input
                type="time"
                value={formatTime(t.hour, t.minute)}
                onChange={(e) => updateTime(t.slot, e.target.value)}
                disabled={!enabled}
                className="rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground focus:border-gold/60 focus:outline-none disabled:opacity-60"
              />
            </label>
          );
        })}
      </div>

      <button
        onClick={restoreDefaults}
        disabled={!enabled}
        className="mt-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-gold disabled:opacity-50"
      >
        Restore defaults
      </button>
    </div>
  );
}

export default PrayerRemindersCard;
