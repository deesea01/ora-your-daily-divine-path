import { useEffect, useRef, useState } from 'react';

type Slot = 'morning' | 'midday' | 'night';

interface Props {
  slot: Slot;
  /** Called when the pause completes (timer ends) or is skipped. */
  onContinue: () => void;
  /** Default duration in seconds. User can toggle 5 / 10. */
  defaultSeconds?: 5 | 10;
}

const COPY: Record<Slot, { greeting: string; sub: string }> = {
  morning: {
    greeting: 'Good morning.',
    sub: 'Be still for a moment and place this day before God.',
  },
  midday: {
    greeting: 'Pause.',
    sub: "In the middle of your day, remember God's presence.",
  },
  night: {
    greeting: 'The day is ending.',
    sub: "Rest now in God's peace.",
  },
};

/**
 * Reverent full-screen pause shown before a guided prayer.
 * Honors prefers-reduced-motion and unmounts cleanly on skip/finish.
 */
export function SacredPause({ slot, onContinue, defaultSeconds = 10 }: Props) {
  const [seconds, setSeconds] = useState<5 | 10>(defaultSeconds);
  const [remaining, setRemaining] = useState<number>(defaultSeconds);
  const finishedRef = useRef(false);

  // Reset remaining when user toggles duration (only before it ends).
  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  // Tick down once per second.
  useEffect(() => {
    if (finishedRef.current) return;
    if (remaining <= 0) {
      finishedRef.current = true;
      onContinue();
      return;
    }
    const id = window.setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => window.clearTimeout(id);
  }, [remaining, onContinue]);

  const skip = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onContinue();
  };

  const copy = COPY[slot];

  return (
    <div
      role="dialog"
      aria-label="A sacred pause before prayer"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-background"
    >
      {/* Slot-specific ambient animation */}
      <div className="pointer-events-none absolute inset-0">
        {slot === 'morning' && <MorningGlow />}
        {slot === 'midday' && <MiddayGlow />}
        {slot === 'night' && <NightGlow />}
      </div>

      {/* Content */}
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center px-6 text-center">
        <p className="mb-3 text-[10px] uppercase tracking-[0.32em] text-gold/70 animate-fade-in">
          A Sacred Pause
        </p>
        <h2 className="font-serif text-3xl text-foreground animate-fade-in">{copy.greeting}</h2>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground animate-fade-in">
          {copy.sub}
        </p>

        {/* Duration toggle */}
        <div
          className="mt-10 inline-flex rounded-full border border-border/70 bg-card/40 p-1 backdrop-blur-sm"
          role="radiogroup"
          aria-label="Silence timer"
        >
          {[5, 10].map((s) => (
            <button
              key={s}
              role="radio"
              aria-checked={seconds === s}
              onClick={() => setSeconds(s as 5 | 10)}
              className={[
                'rounded-full px-4 py-1.5 text-[11px] uppercase tracking-[0.18em] transition-colors',
                seconds === s
                  ? 'bg-gold/15 text-gold'
                  : 'text-muted-foreground hover:text-foreground',
              ].join(' ')}
            >
              {s} sec
            </button>
          ))}
        </div>

        {/* Countdown */}
        <p className="mt-6 font-serif text-xs tabular-nums text-muted-foreground/70">
          {remaining > 0 ? `${remaining}` : '·'}
        </p>

        {/* Skip */}
        <button
          onClick={skip}
          className="mt-8 text-[11px] uppercase tracking-[0.22em] text-muted-foreground/70 transition-colors hover:text-gold"
        >
          Skip
        </button>
      </div>
    </div>
  );
}

/* ---------- Ambient backgrounds ---------- */

function MorningGlow() {
  return (
    <>
      {/* Warm sunrise wash */}
      <div
        className="absolute left-1/2 top-[-20%] h-[120%] w-[140%] -translate-x-1/2 rounded-full opacity-40 blur-3xl motion-safe:animate-[pulse_6s_ease-in-out_infinite]"
        style={{
          background:
            'radial-gradient(closest-side, hsl(var(--gold) / 0.55), hsl(var(--gold) / 0.12) 55%, transparent 75%)',
        }}
      />
      {/* Stained glass shafts */}
      <div className="absolute inset-0 opacity-[0.18] mix-blend-screen">
        <div className="absolute left-[18%] top-0 h-full w-1 rotate-[8deg] bg-gradient-to-b from-gold/80 to-transparent" />
        <div className="absolute left-[42%] top-0 h-full w-[2px] rotate-[4deg] bg-gradient-to-b from-amber-200/70 to-transparent" />
        <div className="absolute left-[68%] top-0 h-full w-1 -rotate-[6deg] bg-gradient-to-b from-gold/60 to-transparent" />
      </div>
    </>
  );
}

function MiddayGlow() {
  return (
    <>
      {/* Warm noon orb */}
      <div
        className="absolute left-1/2 top-1/2 h-[80vmin] w-[80vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50 blur-3xl motion-safe:animate-[pulse_5s_ease-in-out_infinite]"
        style={{
          background:
            'radial-gradient(closest-side, hsl(var(--gold) / 0.45), hsl(var(--gold) / 0.08) 60%, transparent 80%)',
        }}
      />
      {/* Soft ringing rings */}
      <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/20 motion-safe:animate-ping" />
      <div
        className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/10 motion-safe:animate-ping"
        style={{ animationDuration: '3s' }}
      />
    </>
  );
}

function NightGlow() {
  return (
    <>
      {/* Cool deep-night wash */}
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(60% 50% at 50% 60%, hsl(var(--gold) / 0.10), transparent 70%), radial-gradient(120% 80% at 50% 0%, hsl(var(--background)) 0%, transparent 60%)',
        }}
      />
      {/* Candle flame */}
      <div className="absolute left-1/2 top-[58%] -translate-x-1/2">
        <div
          className="h-16 w-8 rounded-full opacity-80 blur-md motion-safe:animate-[pulse_2.4s_ease-in-out_infinite]"
          style={{
            background:
              'radial-gradient(closest-side, hsl(45 100% 70% / 0.95), hsl(35 90% 55% / 0.5) 55%, transparent 75%)',
          }}
        />
        <div className="mx-auto mt-[-6px] h-1.5 w-1.5 rounded-full bg-gold/80" />
      </div>
      {/* Tiny stars */}
      <div className="absolute inset-0">
        {[
          { l: '12%', t: '20%', d: '0s' },
          { l: '78%', t: '28%', d: '0.6s' },
          { l: '34%', t: '14%', d: '1.2s' },
          { l: '62%', t: '12%', d: '0.3s' },
          { l: '88%', t: '52%', d: '0.9s' },
          { l: '8%', t: '46%', d: '1.5s' },
        ].map((s, i) => (
          <span
            key={i}
            className="absolute h-[2px] w-[2px] rounded-full bg-foreground/60 motion-safe:animate-pulse"
            style={{ left: s.l, top: s.t, animationDelay: s.d, animationDuration: '3s' }}
          />
        ))}
      </div>
    </>
  );
}

export default SacredPause;
