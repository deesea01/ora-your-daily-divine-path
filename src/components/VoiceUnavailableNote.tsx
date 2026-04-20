import { useMemo } from 'react';
import { Sparkles } from 'lucide-react';

interface VoiceUnavailableNoteProps {
  /** Optional dismiss handler. If provided, a subtle close affordance is shown. */
  onDismiss?: () => void;
  className?: string;
}

const MESSAGES = [
  {
    body: 'In moments of silence, the Lord often speaks most clearly. Continue your prayer here.',
    citation: null as string | null,
  },
  {
    body: '“Be still, and know that I am God.”',
    citation: 'Psalm 46:10',
    sub: 'Audio will return shortly — continue in prayer below.',
  },
] as const;

export function VoiceUnavailableNote({ onDismiss, className = '' }: VoiceUnavailableNoteProps) {
  // Pick one message per mount — stable while visible, fresh on next occurrence.
  const msg = useMemo(() => MESSAGES[Math.floor(Math.random() * MESSAGES.length)], []);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`rounded-xl border border-gold/20 bg-gold/5 px-4 py-3 text-center animate-fade-in ${className}`}
      onClick={onDismiss}
    >
      <Sparkles className="mx-auto mb-1.5 h-3.5 w-3.5 text-gold/70" aria-hidden="true" />
      <p className="font-serif text-sm leading-relaxed text-foreground">
        {msg.body}
        {msg.citation && (
          <span className="block mt-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">
            {msg.citation}
          </span>
        )}
      </p>
      {'sub' in msg && msg.sub && (
        <p className="mt-1.5 text-xs text-muted-foreground">{msg.sub}</p>
      )}
    </div>
  );
}
