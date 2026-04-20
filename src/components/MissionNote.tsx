import { Heart } from 'lucide-react';

interface MissionNoteProps {
  /** Compact = single line for tight UIs (modals). Default = full card. */
  variant?: 'card' | 'compact';
  /** Show the "Sponsor an account" CTA. Default true. */
  showSponsor?: boolean;
}

const SPONSOR_EMAIL = 'sponsor@oradevotion.com';

export function MissionNote({ variant = 'card', showSponsor = true }: MissionNoteProps) {
  const handleSponsor = () => {
    const subject = encodeURIComponent('I’d like to sponsor an Ora account');
    const body = encodeURIComponent(
      "Hi Ora team,\n\nI'd like to sponsor a subscription for someone in need. Please let me know how to set that up.\n\nThank you.",
    );
    window.location.href = `mailto:${SPONSOR_EMAIL}?subject=${subject}&body=${body}`;
  };

  if (variant === 'compact') {
    return (
      <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
        <Heart className="inline h-3 w-3 text-gold mr-1 -mt-0.5" />
        10% of all profits support faith-based causes.{' '}
        {showSponsor && (
          <button onClick={handleSponsor} className="text-gold hover:underline">
            Sponsor someone in need
          </button>
        )}
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
      {showSponsor && (
        <button
          onClick={handleSponsor}
          className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-card px-3 py-1.5 text-xs font-medium text-gold transition-all hover:bg-gold/10 active:scale-[0.98]"
        >
          <Heart className="h-3 w-3" />
          Sponsor an account for someone in need
        </button>
      )}
    </div>
  );
}
