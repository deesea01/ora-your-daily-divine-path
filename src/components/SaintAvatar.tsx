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
          <div
            className="pointer-events-none absolute -inset-4 rounded-full blur-2xl animate-halo-soft"
            style={{
              background:
                'radial-gradient(closest-side, hsl(var(--gold) / 0.45), hsl(var(--gold) / 0.10) 60%, transparent 80%)',
            }}
            aria-hidden
          />
        )}
        <div
          className={cn(
            'relative rounded-full overflow-hidden border-2 border-gold/40 transition-shadow duration-700',
            sizeMap[size],
            glowMap[state],
            !reverent && state === 'idle' && 'animate-[avatar-breathe_4s_ease-in-out_infinite]',
            !reverent && state === 'speaking' && 'animate-[avatar-pulse_1.5s_ease-in-out_infinite]',
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
