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
  const motes = [
    { l: '12%', t: '70%', d: '0s', dx: '14px', dur: '7s' },
    { l: '28%', t: '82%', d: '1.4s', dx: '-10px', dur: '9s' },
    { l: '46%', t: '76%', d: '2.6s', dx: '8px', dur: '8s' },
    { l: '62%', t: '85%', d: '0.9s', dx: '-16px', dur: '10s' },
    { l: '78%', t: '72%', d: '3.1s', dx: '12px', dur: '7.5s' },
    { l: '88%', t: '80%', d: '1.8s', dx: '-6px', dur: '8.5s' },
  ];
  return (
    <>
      {/* Warm sunrise wash */}
      <div
        className="absolute left-1/2 top-[-20%] h-[120%] w-[140%] -translate-x-1/2 rounded-full opacity-50 blur-3xl motion-safe:animate-[pulse_6s_ease-in-out_infinite]"
        style={{
          background:
            'radial-gradient(closest-side, hsl(var(--gold) / 0.6), hsl(var(--gold) / 0.14) 55%, transparent 75%)',
        }}
      />
      {/* Slow rotating sun rays */}
      <div
        className="pointer-events-none absolute left-1/2 top-[18%] h-[80vmin] w-[80vmin] -translate-x-1/2 -translate-y-1/2 opacity-25 motion-safe:animate-halo-rotate-slow"
        style={{
          background:
            'conic-gradient(from 0deg, transparent 0deg, hsl(var(--gold) / 0.5) 8deg, transparent 24deg, transparent 60deg, hsl(var(--gold) / 0.35) 68deg, transparent 84deg, transparent 120deg, hsl(var(--gold) / 0.45) 128deg, transparent 144deg, transparent 200deg, hsl(var(--gold) / 0.4) 208deg, transparent 224deg, transparent 280deg, hsl(var(--gold) / 0.35) 288deg, transparent 304deg)',
        }}
      />
      {/* Stained glass shafts */}
      <div className="absolute inset-0 opacity-[0.22] mix-blend-screen">
        <div className="absolute left-[18%] top-0 h-full w-1 rotate-[8deg] bg-gradient-to-b from-gold/80 to-transparent motion-safe:animate-[sun-ray-sweep_5s_ease-in-out_infinite]" />
        <div
          className="absolute left-[42%] top-0 h-full w-[2px] rotate-[4deg] bg-gradient-to-b from-amber-200/70 to-transparent motion-safe:animate-[sun-ray-sweep_6s_ease-in-out_infinite]"
          style={{ animationDelay: '0.8s' }}
        />
        <div
          className="absolute left-[68%] top-0 h-full w-1 -rotate-[6deg] bg-gradient-to-b from-gold/60 to-transparent motion-safe:animate-[sun-ray-sweep_7s_ease-in-out_infinite]"
          style={{ animationDelay: '1.6s' }}
        />
      </div>
      {/* Floating gold motes — like dust in morning light */}
      <div className="pointer-events-none absolute inset-0">
        {motes.map((m, i) => (
          <span
            key={i}
            className="absolute h-[3px] w-[3px] rounded-full bg-gold/80 blur-[1px] motion-safe:animate-[ember-drift_var(--dur)_ease-out_infinite]"
            style={{
              left: m.l,
              top: m.t,
              animationDelay: m.d,
              ['--dx' as any]: m.dx,
              ['--dur' as any]: m.dur,
            }}
          />
        ))}
      </div>
    </>
  );
}

function MiddayGlow() {
  return (
    <>
      {/* Warm noon orb */}
      <div
        className="absolute left-1/2 top-1/2 h-[80vmin] w-[80vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-55 blur-3xl motion-safe:animate-[pulse_5s_ease-in-out_infinite]"
        style={{
          background:
            'radial-gradient(closest-side, hsl(var(--gold) / 0.5), hsl(var(--gold) / 0.1) 60%, transparent 80%)',
        }}
      />
      {/* Slow rotating conic halo */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 motion-safe:animate-halo-rotate-slow"
        style={{
          background:
            'conic-gradient(from 0deg, transparent 0deg, hsl(var(--gold) / 0.6) 70deg, transparent 150deg, hsl(var(--gold) / 0.4) 230deg, transparent 320deg)',
          WebkitMask: 'radial-gradient(circle, transparent 55%, black 60%, black 78%, transparent 82%)',
          mask: 'radial-gradient(circle, transparent 55%, black 60%, black 78%, transparent 82%)',
        }}
      />
      {/* Soft expanding rings */}
      <div className="absolute left-1/2 top-1/2 h-40 w-40 rounded-full border border-gold/30 motion-safe:animate-[ring-expand_4.5s_ease-out_infinite]" />
      <div
        className="absolute left-1/2 top-1/2 h-40 w-40 rounded-full border border-gold/20 motion-safe:animate-[ring-expand_4.5s_ease-out_infinite]"
        style={{ animationDelay: '1.5s' }}
      />
      <div
        className="absolute left-1/2 top-1/2 h-40 w-40 rounded-full border border-gold/15 motion-safe:animate-[ring-expand_4.5s_ease-out_infinite]"
        style={{ animationDelay: '3s' }}
      />
      {/* Steady inner gold dot */}
      <div
        className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/70 blur-[2px] motion-safe:animate-pulse"
      />
    </>
  );
}

function NightGlow() {
  const stars = [
    { l: '8%', t: '14%', d: '0s' },
    { l: '22%', t: '8%', d: '1.1s' },
    { l: '34%', t: '20%', d: '0.4s' },
    { l: '48%', t: '6%', d: '1.7s' },
    { l: '62%', t: '14%', d: '0.9s' },
    { l: '76%', t: '10%', d: '2.2s' },
    { l: '88%', t: '22%', d: '0.6s' },
    { l: '14%', t: '38%', d: '1.4s' },
    { l: '82%', t: '40%', d: '0.3s' },
    { l: '6%', t: '52%', d: '2s' },
    { l: '92%', t: '54%', d: '1.2s' },
    { l: '28%', t: '30%', d: '2.8s' },
    { l: '70%', t: '32%', d: '0.8s' },
  ];

  return (
    <>
      {/* Cool deep-night wash */}
      <div
        className="absolute inset-0 opacity-80"
        style={{
          background:
            'radial-gradient(60% 50% at 50% 60%, hsl(var(--gold) / 0.12), transparent 70%), radial-gradient(120% 80% at 50% 0%, hsl(var(--background)) 0%, transparent 60%)',
        }}
      />

      {/* Incense plumes — slow, drifting, very faint */}
      <div className="absolute left-[36%] bottom-[32%]">
        <div
          className="h-24 w-10 rounded-full bg-gold/40 blur-2xl motion-safe:animate-[incense-rise_9s_ease-out_infinite]"
          style={{ animationDelay: '0s' }}
        />
      </div>
      <div className="absolute left-[44%] bottom-[34%]">
        <div
          className="h-28 w-12 rounded-full bg-gold/30 blur-2xl motion-safe:animate-[incense-rise_12s_ease-out_infinite]"
          style={{ animationDelay: '2s' }}
        />
      </div>
      <div className="absolute left-[58%] bottom-[38%]">
        <div
          className="h-20 w-8 rounded-full bg-foreground/40 blur-2xl motion-safe:animate-[incense-rise_11s_ease-out_infinite]"
          style={{ animationDelay: '3.5s' }}
        />
      </div>
      <div className="absolute left-[64%] bottom-[34%]">
        <div
          className="h-24 w-10 rounded-full bg-foreground/30 blur-2xl motion-safe:animate-[incense-rise_13s_ease-out_infinite]"
          style={{ animationDelay: '5s' }}
        />
      </div>

      {/* Candle */}
      <div className="absolute left-1/2 top-[58%] -translate-x-1/2">
        {/* Outer halo glow */}
        <div
          className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl motion-safe:animate-[flame-glow_3.6s_ease-in-out_infinite]"
          style={{
            background:
              'radial-gradient(closest-side, hsl(45 100% 70% / 0.6), hsl(35 90% 55% / 0.18) 55%, transparent 80%)',
          }}
        />
        {/* Outer flame */}
        <div
          className="absolute left-1/2 -top-2 h-20 w-10 -translate-x-1/2 rounded-[50%/55%_55%_45%_45%] blur-md motion-safe:animate-[flame-flicker_2.1s_ease-in-out_infinite]"
          style={{
            background:
              'radial-gradient(60% 70% at 50% 70%, hsl(40 100% 70% / 0.95) 0%, hsl(30 100% 55% / 0.7) 45%, hsl(15 90% 45% / 0.0) 80%)',
            transformOrigin: '50% 100%',
          }}
        />
        {/* Inner flame core */}
        <div
          className="absolute left-1/2 top-0 h-12 w-5 -translate-x-1/2 rounded-[50%/60%_60%_45%_45%] blur-[2px] motion-safe:animate-[flame-flicker_1.6s_ease-in-out_infinite]"
          style={{
            background:
              'radial-gradient(60% 70% at 50% 75%, hsl(60 100% 92% / 0.95) 0%, hsl(45 100% 70% / 0.85) 45%, hsl(30 100% 55% / 0.0) 90%)',
            transformOrigin: '50% 100%',
            animationDelay: '0.3s',
          }}
        />
        {/* Tiny rising embers */}
        <div className="pointer-events-none absolute left-1/2 -top-4 -translate-x-1/2">
          {[
            { dx: '6px', d: '0s', dur: '4.5s' },
            { dx: '-8px', d: '1.1s', dur: '5s' },
            { dx: '4px', d: '2.3s', dur: '4s' },
            { dx: '-3px', d: '3.4s', dur: '5.5s' },
          ].map((e, i) => (
            <span
              key={i}
              className="absolute left-0 top-0 h-[3px] w-[3px] rounded-full bg-amber-200/90 blur-[1px] motion-safe:animate-[ember-drift_var(--dur)_ease-out_infinite]"
              style={{
                animationDelay: e.d,
                ['--dx' as any]: e.dx,
                ['--dur' as any]: e.dur,
              }}
            />
          ))}
        </div>
        {/* Wick */}
        <div className="mx-auto mt-10 h-2 w-[3px] rounded-full bg-foreground/70" />
        {/* Candle body suggestion */}
        <div className="mx-auto mt-0 h-10 w-2 rounded-b-sm bg-foreground/15" />
      </div>

      {/* Twinkling constellation */}
      <div className="absolute inset-0">
        {stars.map((s, i) => (
          <span
            key={i}
            className="absolute h-[2px] w-[2px] rounded-full bg-foreground/70 motion-safe:animate-[star-twinkle_4s_ease-in-out_infinite]"
            style={{ left: s.l, top: s.t, animationDelay: s.d }}
          />
        ))}
      </div>
    </>
  );
}

export default SacredPause;
