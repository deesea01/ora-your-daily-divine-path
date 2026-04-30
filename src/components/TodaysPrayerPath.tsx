import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, CloudSun, Moon, Check, ChevronRight, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import type { DevotionalPlan, PlanPrayer } from '@/lib/devotionalPlan';

type Slot = 'morning' | 'midday' | 'night';

interface SlotConfig {
  slot: Slot;
  label: string;
  range: string;
  startHour: number;
  endHour: number;
  Icon: typeof Sun;
}

/**
 * Local-time scheduler.
 * morning: 04:00–11:59
 * midday:  12:00–16:59
 * night:   17:00–03:59
 */
export function getActiveSlot(date = new Date()): Slot {
  const h = date.getHours();
  if (h >= 4 && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'midday';
  return 'night';
}

const SLOTS: SlotConfig[] = [
  { slot: 'morning', label: 'Morning', range: '4–12', startHour: 4, endHour: 12, Icon: Sun },
  { slot: 'midday', label: 'Midday', range: '12–5', startHour: 12, endHour: 17, Icon: CloudSun },
  { slot: 'night', label: 'Night', range: '5pm+', startHour: 17, endHour: 28, Icon: Moon },
];

/**
 * Map plan prayer slots → display slots.
 * The plan uses 'morning' | 'midday' | 'evening' | 'anytime'.
 * UI uses 'morning' | 'midday' | 'night'. 'anytime' is bucketed into the active slot.
 */
function bucketPlanPrayers(plan: DevotionalPlan | null, active: Slot): Record<Slot, PlanPrayer[]> {
  const buckets: Record<Slot, PlanPrayer[]> = { morning: [], midday: [], night: [] };
  if (!plan?.prayers?.length) return buckets;
  for (const p of plan.prayers) {
    if (p.slot === 'morning') buckets.morning.push(p);
    else if (p.slot === 'midday') buckets.midday.push(p);
    else if (p.slot === 'evening') buckets.night.push(p);
    else if (p.slot === 'anytime') buckets[active].push(p);
  }
  return buckets;
}

function defaultStepsFor(slot: Slot, t: any): { title: string; subtitle: string } {
  if (slot === 'morning') return { title: t.morningLauds ?? 'Morning Prayer', subtitle: t.morningLaudsDesc ?? 'Begin the day with God' };
  if (slot === 'midday') return { title: t.middayAngelus ?? 'Midday Angelus', subtitle: t.middayAngelusDesc ?? 'A pause to remember His presence' };
  return { title: t.nightCompline ?? 'Night Prayer', subtitle: t.nightComplineDesc ?? 'Rest the day in His peace' };
}

interface Props {
  /** Already-fetched completion keys for today (e.g. 'morning', 'midday', 'night', or prayer_ids). */
  completions: Set<string>;
  /** Tick every minute so the active slot updates live. */
  tickMs?: number;
}

export function TodaysPrayerPath({ completions, tickMs = 60_000 }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [plan, setPlan] = useState<DevotionalPlan | null>(null);
  const [now, setNow] = useState<Date>(new Date());

  // Live clock — re-pick active slot when the boundary is crossed.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), tickMs);
    return () => clearInterval(id);
  }, [tickMs]);

  // Load the persisted devotional plan (best-effort).
  useEffect(() => {
    if (!user) return;
    supabase
      .from('spiritual_profiles')
      .select('devotional_plan')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        const raw = (data as any)?.devotional_plan;
        if (raw && typeof raw === 'object' && Array.isArray(raw.prayers)) {
          setPlan(raw as DevotionalPlan);
        }
      });
  }, [user]);

  const active = useMemo(() => getActiveSlot(now), [now]);
  const buckets = useMemo(() => bucketPlanPrayers(plan, active), [plan, active]);
  const locale = language === 'tl' ? 'fil' : language;
  const userTz = typeof Intl !== 'undefined'
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : undefined;

  return (
    <section className="mb-8">
      <div className="mb-1 flex items-end justify-between animate-fade-in">
        <h2 className="font-serif text-xl text-gold">{t.todaysPrayerPath ?? "Today's Prayer Path"}</h2>
        <span className="text-[10px] uppercase tracking-[0.2em] text-gold/70">
          Now · {SLOTS.find((s) => s.slot === active)?.label}
        </span>
      </div>
      <p className="mb-5 text-sm text-muted-foreground animate-fade-in">
        {now.toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric', timeZone: userTz })}
      </p>

      <div className="space-y-3">
        {SLOTS.map((cfg, i) => {
          const isActive = cfg.slot === active;
          const isPast = !isActive && cfg.endHour <= now.getHours() && cfg.slot !== 'night';
          const isFuture = !isActive && !isPast;
          const completed = completions.has(cfg.slot);
          const steps = buckets[cfg.slot];
          const fallback = defaultStepsFor(cfg.slot, t);
          const headline = steps[0]?.title ?? fallback.title;
          const subtitle = steps[0]?.reason ?? fallback.subtitle;

          return (
            <button
              key={cfg.slot}
              onClick={() => navigate(`/prayer/${cfg.slot}`)}
              className={[
                'w-full rounded-xl border p-4 text-left transition-all active:scale-[0.98]',
                'animate-fade-in-delay-' + (i + 1),
                isActive
                  ? 'border-gold/60 bg-card shadow-[0_0_24px_-12px_hsl(var(--gold)/0.5)] hover:border-gold'
                  : isPast
                    ? 'border-border bg-card/60 opacity-70 hover:opacity-100'
                    : 'border-border bg-card hover:border-gold/30',
              ].join(' ')}
              aria-current={isActive ? 'time' : undefined}
            >
              <div className="flex items-center gap-4">
                <div
                  className={[
                    'flex h-12 w-12 shrink-0 items-center justify-center rounded-full',
                    isActive ? 'bg-gold/15 ring-1 ring-gold/40' : 'bg-secondary',
                  ].join(' ')}
                >
                  <cfg.Icon className={`h-5 w-5 ${isActive ? 'text-gold' : 'text-muted-foreground'}`} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      {cfg.label}
                    </p>
                    {isActive && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-gold">
                        <Sparkles className="h-2.5 w-2.5" /> Now
                      </span>
                    )}
                    {isFuture && (
                      <span className="text-[9px] uppercase tracking-wider text-muted-foreground/60">
                        Upcoming
                      </span>
                    )}
                    {isPast && !completed && (
                      <span className="text-[9px] uppercase tracking-wider text-muted-foreground/60">
                        Earlier
                      </span>
                    )}
                  </div>
                  <h3 className="mt-0.5 truncate font-serif text-lg font-medium text-foreground">
                    {headline}
                  </h3>
                  <p className="truncate text-xs text-muted-foreground">{subtitle}</p>

                  {/* Step preview when this slot is active and we have plan prayers */}
                  {isActive && steps.length > 1 && (
                    <ul className="mt-2 space-y-0.5">
                      {steps.slice(1, 4).map((s) => (
                        <li
                          key={s.prayer_id}
                          className="flex items-center gap-1.5 text-[11px] text-muted-foreground/80"
                        >
                          <span className="h-1 w-1 rounded-full bg-gold/50" />
                          <span className="truncate">{s.title}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {completed ? (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/15">
                    <Check className="h-4 w-4 text-gold" />
                  </div>
                ) : (
                  <ChevronRight
                    className={`h-4 w-4 shrink-0 ${isActive ? 'text-gold' : 'text-muted-foreground/60'}`}
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default TodaysPrayerPath;
