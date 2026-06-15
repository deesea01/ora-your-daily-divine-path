import { Heart } from 'lucide-react';

interface MissionNoteProps {
  /** Compact = single line for tight UIs (modals). Default = full card. */
  variant?: 'card' | 'compact';
  /** Deprecated: sponsor CTA has been removed. Kept for backwards-compatible props. */
  showSponsor?: boolean;
}

export function MissionNote({ variant = 'card' }: MissionNoteProps) {
  if (variant === 'compact') {
    return (
      <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
        <Heart className="inline h-3 w-3 text-gold mr-1 -mt-0.5" />
        10% of all profits support faith-based causes.
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-gold/20 bg-gold/5 p-4 text-center">
      <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-gold/15">
        <Heart className="h-4 w-4 text-gold" />
      </div>
      <p className="text-sm font-medium text-foreground">
        10% of all profits go to faith-based causes.
      </p>
      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
        Your subscription helps fund ministries, charities, and Catholic missions around the world.
      </p>
    </div>
  );
}
