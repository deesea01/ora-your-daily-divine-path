import { cn } from '@/lib/utils';
import { SPIRITUAL_GUIDES, SpiritualGuideKey } from '@/lib/guides';

type AvatarState = 'idle' | 'listening' | 'speaking' | 'reflecting' | 'encouraging';

interface SaintAvatarProps {
  guideKey: SpiritualGuideKey;
  state?: AvatarState;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showName?: boolean;
  showQuote?: boolean;
  /** When true, plays a gentle reverent reveal (scale + halo fade-in). */
  reverent?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 'h-12 w-12',
  md: 'h-20 w-20',
  lg: 'h-28 w-28',
  xl: 'h-36 w-36',
};

const glowMap: Record<AvatarState, string> = {
  idle: 'shadow-[0_0_12px_hsl(var(--gold)/0.2)]',
  listening: 'shadow-[0_0_18px_hsl(var(--gold)/0.35)]',
  speaking: 'shadow-[0_0_24px_hsl(var(--gold)/0.5)]',
  reflecting: 'shadow-[0_0_14px_hsl(var(--gold)/0.25)]',
  encouraging: 'shadow-[0_0_20px_hsl(var(--gold)/0.4)]',
};

export function SaintAvatar({
  guideKey,
  state = 'idle',
  size = 'md',
  showName = false,
  showQuote = false,
  reverent = false,
  className,
}: SaintAvatarProps) {
  const guide = SPIRITUAL_GUIDES[guideKey] || SPIRITUAL_GUIDES.monk;

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div className={cn('relative', reverent && 'animate-saint-reveal')}>
        {/* Soft golden halo (reverent mode) */}
        {reverent && (
          <>
            <div
              className="pointer-events-none absolute -inset-6 rounded-full blur-2xl animate-halo-soft"
              style={{
                background:
                  'radial-gradient(closest-side, hsl(var(--gold) / 0.55), hsl(var(--gold) / 0.12) 60%, transparent 80%)',
              }}
              aria-hidden
            />
            {/* Slow rotating outer ring with conic gold gradient */}
            <div
              className="pointer-events-none absolute -inset-3 rounded-full opacity-70 animate-halo-rotate-slow"
              style={{
                background:
                  'conic-gradient(from 0deg, transparent 0deg, hsl(var(--gold) / 0.55) 60deg, transparent 140deg, hsl(var(--gold) / 0.35) 220deg, transparent 320deg)',
                WebkitMask:
                  'radial-gradient(circle, transparent 60%, black 62%, black 70%, transparent 72%)',
                mask:
                  'radial-gradient(circle, transparent 60%, black 62%, black 70%, transparent 72%)',
              }}
              aria-hidden
            />
            {/* Reverse-rotating filigree ring (dotted) */}
            <div
              className="pointer-events-none absolute -inset-5 rounded-full opacity-50 animate-halo-rotate-reverse"
              style={{
                background:
                  'repeating-conic-gradient(hsl(var(--gold) / 0.6) 0deg 2deg, transparent 2deg 14deg)',
                WebkitMask:
                  'radial-gradient(circle, transparent 66%, black 68%, black 70%, transparent 72%)',
                mask:
                  'radial-gradient(circle, transparent 66%, black 68%, black 70%, transparent 72%)',
              }}
              aria-hidden
            />
          </>
        )}
        <div
          className={cn(
            'relative rounded-full overflow-hidden border-2 border-gold/40 transition-shadow duration-700',
            sizeMap[size],
            glowMap[state],
            !reverent && state === 'idle' && 'animate-[avatar-breathe_4s_ease-in-out_infinite]',
            !reverent && state === 'speaking' && 'animate-[avatar-pulse_1.5s_ease-in-out_infinite]',
            reverent && 'animate-[avatar-breathe_6s_ease-in-out_infinite]',
            state === 'reflecting' && 'opacity-90',
          )}
        >
          <img
            src={guide.avatar}
            alt={`${guide.label} — devotional portrait`}
            className="h-full w-full object-cover"
            loading="lazy"
            width={512}
            height={512}
          />
          {/* Gentle inner gold rim light */}
          <div
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              boxShadow:
                'inset 0 0 18px hsl(var(--gold) / 0.25), inset 0 0 2px hsl(var(--gold) / 0.5)',
            }}
            aria-hidden
          />
        </div>
        {/* Halo glow overlay (non-reverent baseline) */}
        {!reverent && (
          <div
            className={cn(
              'pointer-events-none absolute -inset-1 rounded-full',
              'bg-gradient-radial from-gold/10 to-transparent opacity-60',
              state === 'speaking' && 'opacity-100',
            )}
          />
        )}
      </div>

      {showName && (
        <p className="font-serif text-sm font-medium text-foreground">{guide.label}</p>
      )}
      {showQuote && (
        <p className="max-w-48 text-center text-xs italic text-muted-foreground">
          {guide.quote}
        </p>
      )}
    </div>
  );
}
