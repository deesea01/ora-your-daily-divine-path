import { useEffect, useState } from 'react';
import { Bell, BellOff, Sun, CloudSun, Moon, Mail, Phone, Loader2 } from 'lucide-react';
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
import { useReminderPrefs } from '@/hooks/useReminderPrefs';

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

const E164_RE = /^\+[1-9][0-9]{6,14}$/;

export function PrayerRemindersCard() {
  const [enabled, setEnabled] = useState<boolean>(getRemindersEnabled());
  const [times, setTimes] = useState<ReminderTime[]>(getReminderTimes());
  const { prefs, loading, saving, update } = useReminderPrefs();

  // Local mirrors so typing feels instant; commit to server on blur.
  const [emailDraft, setEmailDraft] = useState<string>('');
  const [phoneDraft, setPhoneDraft] = useState<string>('');

  useEffect(() => {
    setEmailDraft(prefs.email_address ?? '');
    setPhoneDraft(prefs.phone_e164 ?? '');
  }, [prefs.email_address, prefs.phone_e164]);

  // Whenever the user changes a local time, also push to server prefs so
  // server-side reminders use the same schedule.
  const updateTime = (slot: ReminderSlot, value: string) => {
    const parsed = parseTime(value);
    if (!parsed) return;
    const next = times.map((t) => (t.slot === slot ? { ...t, ...parsed } : t));
    setTimes(next);
    setReminderTimes(next);
    update({
      [`${slot}_hour`]: parsed.hour,
      [`${slot}_minute`]: parsed.minute,
    } as any);
  };

  const toggleEnabled = () => {
    const next = !enabled;
    setEnabled(next);
    setRemindersEnabled(next);
    update({ enabled: next });
    toast(next ? 'Prayer reminders on' : 'Prayer reminders off', {
      description: next
        ? 'Gentle nudges across in-app, email, and SMS at each prayer time.'
        : 'You can turn them back on anytime.',
    });
  };

  const restoreDefaults = () => {
    setTimes(DEFAULT_REMINDERS);
    setReminderTimes(DEFAULT_REMINDERS);
    update({
      morning_hour: 7, morning_minute: 0,
      midday_hour: 12, midday_minute: 0,
      night_hour: 21, night_minute: 0,
    });
    toast('Default times restored', { description: '7:00 AM · 12:00 PM · 9:00 PM' });
  };

  const commitEmail = () => {
    const trimmed = emailDraft.trim();
    if (trimmed && !trimmed.includes('@')) {
      toast.error('Please enter a valid email');
      setEmailDraft(prefs.email_address ?? '');
      return;
    }
    if (trimmed !== (prefs.email_address ?? '')) {
      update({ email_address: trimmed || null });
    }
  };

  const commitPhone = () => {
    const trimmed = phoneDraft.trim();
    if (trimmed && !E164_RE.test(trimmed)) {
      toast.error('Use international format, e.g. +14155550100');
      setPhoneDraft(prefs.phone_e164 ?? '');
      return;
    }
    if (trimmed !== (prefs.phone_e164 ?? '')) {
      update({ phone_e164: trimmed || null });
    }
  };

  const toggleEmailChannel = () => {
    if (!prefs.email_enabled && !(prefs.email_address || emailDraft.trim())) {
      toast.error('Add your email address first');
      return;
    }
    update({ email_enabled: !prefs.email_enabled });
  };

  const togglePhoneChannel = () => {
    if (!prefs.sms_enabled && !(prefs.phone_e164 || E164_RE.test(phoneDraft.trim()))) {
      toast.error('Add a phone number in international format first');
      return;
    }
    update({ sms_enabled: !prefs.sms_enabled });
  };

  return (
    <div className="surface-elegant rounded-xl p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
            {enabled ? <Bell className="h-4 w-4 text-gold" /> : <BellOff className="h-4 w-4 text-muted-foreground" />}
          </div>
          <div>
            <h3 className="font-serif text-lg font-medium text-foreground">Prayer Reminders</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Gentle nudges in-app, by email, and by SMS at Morning, Midday & Night.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(saving || loading) && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
          <button
            role="switch"
            aria-checked={enabled}
            onClick={toggleEnabled}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${enabled ? 'bg-gold' : 'bg-secondary'}`}
          >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-background shadow transition-transform ${enabled ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>

      <div className={`space-y-2 transition-opacity ${enabled ? 'opacity-100' : 'opacity-50'}`}>
        {times.map((t) => {
          const Icon = ICONS[t.slot];
          return (
            <label key={t.slot} className="flex items-center justify-between rounded-lg border border-border bg-card/60 px-3 py-2.5">
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

      <div className={`mt-4 space-y-3 border-t border-border pt-4 transition-opacity ${enabled ? 'opacity-100' : 'opacity-50'}`}>
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Delivery channels</p>

        {/* Email */}
        <div className="rounded-lg border border-border bg-card/60 p-3">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-sm text-foreground">
              <Mail className="h-4 w-4 text-gold/80" />
              Email
            </span>
            <button
              role="switch"
              aria-checked={prefs.email_enabled}
              onClick={toggleEmailChannel}
              disabled={!enabled}
              className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${prefs.email_enabled ? 'bg-gold' : 'bg-secondary'} disabled:opacity-50`}
            >
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-background shadow transition-transform ${prefs.email_enabled ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <input
            type="email"
            inputMode="email"
            placeholder="you@example.com"
            value={emailDraft}
            onChange={(e) => setEmailDraft(e.target.value)}
            onBlur={commitEmail}
            disabled={!enabled}
            className="mt-2 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold/60 focus:outline-none disabled:opacity-60"
          />
        </div>

        {/* SMS */}
        <div className="rounded-lg border border-border bg-card/60 p-3">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-sm text-foreground">
              <Phone className="h-4 w-4 text-gold/80" />
              SMS
            </span>
            <button
              role="switch"
              aria-checked={prefs.sms_enabled}
              onClick={togglePhoneChannel}
              disabled={!enabled}
              className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${prefs.sms_enabled ? 'bg-gold' : 'bg-secondary'} disabled:opacity-50`}
            >
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-background shadow transition-transform ${prefs.sms_enabled ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <input
            type="tel"
            inputMode="tel"
            placeholder="+14155550100"
            value={phoneDraft}
            onChange={(e) => setPhoneDraft(e.target.value)}
            onBlur={commitPhone}
            disabled={!enabled}
            className="mt-2 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold/60 focus:outline-none disabled:opacity-60"
          />
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            Include country code, e.g. <span className="text-foreground/80">+1</span> for US.
          </p>
        </div>

        <label className="flex items-center justify-between rounded-lg border border-border bg-card/60 px-3 py-2.5">
          <span className="text-sm text-foreground">Follow up on unfinished prayers</span>
          <input
            type="checkbox"
            checked={prefs.unfinished_followup}
            disabled={!enabled}
            onChange={(e) => update({ unfinished_followup: e.target.checked })}
            className="h-4 w-4 accent-gold"
          />
        </label>
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
