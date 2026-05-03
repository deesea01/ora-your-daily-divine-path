import { useState, useRef, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { WeeklyRecap } from '@/hooks/useWeeklyRecaps';
import { SPIRITUAL_GUIDES } from '@/lib/guides';

interface Props {
  recap: WeeklyRecap;
  isPremium: boolean;
  onClose: () => void;
}

const STORY_DURATION_MS = 6500;

export default function WeeklyRecapStory({ recap, isPremium, onClose }: Props) {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(performance.now());

  const topGuide = recap.top_saint
    ? SPIRITUAL_GUIDES[recap.top_saint as keyof typeof SPIRITUAL_GUIDES]
    : null;

  const cards = [
    { id: 'intro', premium: false },
    { id: 'saint', premium: false },
    { id: 'streak', premium: false },
    { id: 'virtues', premium: true },
    { id: 'struggles', premium: true },
    { id: 'breakdown', premium: true },
    { id: 'reflection', premium: true },
  ];

  const current = cards[index];
  const locked = current.premium && !isPremium;

  useEffect(() => {
    if (locked) return;
    startRef.current = performance.now();
    setProgress(0);
    const tick = () => {
      const elapsed = performance.now() - startRef.current;
      const p = Math.min(elapsed / STORY_DURATION_MS, 1);
      setProgress(p);
      if (p >= 1) {
        if (index < cards.length - 1) setIndex(index + 1);
        else onClose();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [index, locked]);

  const next = () => {
    if (index < cards.length - 1) setIndex(index + 1);
    else onClose();
  };
  const prev = () => {
    if (index > 0) setIndex(index - 1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background animate-fade-in">
      {/* Progress bars */}
      <div
        className="absolute left-0 right-0 z-10 flex gap-1 px-3"
        style={{ top: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)' }}
      >
        {cards.map((_, i) => (
          <div key={i} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full bg-gold transition-[width] duration-100"
              style={{
                width: i < index ? '100%' : i === index ? `${progress * 100}%` : '0%',
              }}
            />
          </div>
        ))}
      </div>

      <button
        onClick={onClose}
        className="absolute right-3 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white active:bg-black/70"
        style={{ top: 'calc(env(safe-area-inset-top, 0px) + 1.5rem)' }}
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Tap zones — start below header so they don't block the close button */}
      <button onClick={prev} className="absolute bottom-0 left-0 top-24 z-[5] w-1/3" aria-label="Previous" />
      <button onClick={next} className="absolute bottom-0 right-0 top-24 z-[5] w-1/3" aria-label="Next" />

      {/* Card content */}
      <div className="flex h-full flex-col items-center justify-center px-8 pb-12 pt-24 text-center">
        {locked ? (
          <div className="z-10 flex flex-col items-center gap-4 animate-fade-in">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/15">
              <Lock className="h-7 w-7 text-gold" />
            </div>
            <h2 className="font-serif text-2xl text-foreground">Unlock your full recap</h2>
            <p className="max-w-xs text-sm text-muted-foreground">
              Virtues, struggles, Saint breakdown, and a personal reflection are part of Ora premium.
            </p>
            <button
              onClick={() => { onClose(); navigate('/paywall'); }}
              className="mt-2 rounded-full bg-gold px-6 py-3 text-sm font-medium text-primary-foreground"
            >
              See plans
            </button>
            <button onClick={prev} className="mt-2 text-xs text-muted-foreground underline">
              Back
            </button>
          </div>
        ) : current.id === 'intro' ? (
          <div className="animate-fade-in space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-gold">Your week with God</p>
            <h1 className="font-serif text-4xl text-foreground">{recap.headline || 'A Week of Grace'}</h1>
            <p className="text-xs text-muted-foreground">
              {new Date(recap.week_start).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} —{' '}
              {new Date(recap.week_end).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </p>
          </div>
        ) : current.id === 'saint' ? (
          <div className="animate-fade-in space-y-4">
            {topGuide ? (
              <>
                <img src={topGuide.avatar} alt={topGuide.label} className="mx-auto h-32 w-32 rounded-full object-cover ring-2 ring-gold/40" />
                <p className="text-xs uppercase tracking-[0.3em] text-gold">Most time with</p>
                <h2 className="font-serif text-3xl text-foreground">{topGuide.label}</h2>
                <p className="text-sm text-muted-foreground">
                  {recap.saint_message_count} messages • ~{recap.saint_minutes_estimate} min
                </p>
                <p className="mt-4 max-w-xs text-sm italic text-muted-foreground">{topGuide.quote}</p>
              </>
            ) : (
              <>
                <p className="text-xs uppercase tracking-[0.3em] text-gold">Saint chats</p>
                <h2 className="font-serif text-2xl text-foreground">No conversations this week</h2>
                <p className="text-sm text-muted-foreground">Start a chat to grow with a Saint.</p>
              </>
            )}
          </div>
        ) : current.id === 'streak' ? (
          <div className="animate-fade-in space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-gold">Your rhythm</p>
            <p className="font-serif text-7xl text-gold">{recap.prayer_completions_count}</p>
            <p className="text-sm text-muted-foreground">prayers completed</p>
            <div className="mt-6 grid grid-cols-2 gap-4 text-left">
              <div className="rounded-lg border border-border bg-card p-3">
                <p className="text-xs text-muted-foreground">Streak</p>
                <p className="font-serif text-2xl text-foreground">{recap.current_streak} days</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-3">
                <p className="text-xs text-muted-foreground">Rosaries</p>
                <p className="font-serif text-2xl text-foreground">{recap.rosaries_completed}</p>
              </div>
            </div>
          </div>
        ) : current.id === 'virtues' ? (
          <div className="animate-fade-in space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-gold">Where you grew</p>
            <h2 className="font-serif text-2xl text-foreground">Virtues this week</h2>
            <div className="mt-4 space-y-2">
              {recap.top_virtues.length === 0 ? (
                <p className="text-sm text-muted-foreground">Journal a few entries this week to see your growing virtues.</p>
              ) : (
                recap.top_virtues.map((v) => (
                  <div key={v.name} className="flex items-center justify-between rounded-lg border border-gold/20 bg-card px-4 py-3">
                    <span className="font-serif text-lg capitalize text-foreground">{v.name}</span>
                    <span className="text-xs text-gold">×{v.count}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : current.id === 'struggles' ? (
          <div className="animate-fade-in space-y-3 text-left">
            <p className="text-center text-xs uppercase tracking-[0.3em] text-gold">What you faced</p>
            <div className="space-y-3">
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-xs uppercase text-muted-foreground">Recurring</p>
                <p className="mt-1 text-sm text-foreground">
                  {recap.recurring_struggles.length === 0
                    ? 'No recurring patterns — beautiful.'
                    : recap.recurring_struggles.map((s) => s.name).join(', ')}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-xs uppercase text-muted-foreground">Met just once</p>
                <p className="mt-1 text-sm text-foreground">
                  {recap.overcome_struggles.length === 0 ? '—' : recap.overcome_struggles.map((s) => s.name).join(', ')}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-xs uppercase text-muted-foreground">Confessions logged</p>
                <p className="mt-1 text-sm text-foreground">{recap.confessions_count}</p>
              </div>
            </div>
          </div>
        ) : current.id === 'breakdown' ? (
          <div className="animate-fade-in space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-gold">Your Saints</p>
            <h2 className="font-serif text-2xl text-foreground">Time with each guide</h2>
            <div className="mt-4 w-full max-w-xs space-y-2">
              {recap.saint_breakdown.length === 0 ? (
                <p className="text-sm text-muted-foreground">No chats yet.</p>
              ) : (
                recap.saint_breakdown.map((s) => {
                  const max = recap.saint_breakdown[0]?.messages || 1;
                  const pct = (s.messages / max) * 100;
                  return (
                    <div key={s.guide}>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="text-foreground">{s.label}</span>
                        <span className="text-muted-foreground">{s.minutes} min</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-secondary">
                        <div className="h-full rounded-full bg-gold" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          <div className="animate-fade-in space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-gold">A word for you</p>
            <p className="font-serif text-xl text-foreground">{recap.reflection}</p>
            {recap.scripture && (
              <p className="mt-4 text-sm italic text-muted-foreground">{recap.scripture}</p>
            )}
          </div>
        )}
      </div>

      {/* Side hints */}
      <ChevronLeft className="absolute left-2 top-1/2 z-[4] h-5 w-5 -translate-y-1/2 text-white/20" />
      <ChevronRight className="absolute right-2 top-1/2 z-[4] h-5 w-5 -translate-y-1/2 text-white/20" />
    </div>
  );
}
