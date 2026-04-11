import { cn } from '@/lib/utils';
import { SPIRITUAL_GUIDES, SpiritualGuideKey } from '@/lib/guides';
import { SaintAvatar } from '@/components/SaintAvatar';
import { Check } from 'lucide-react';

interface AvatarSelectorProps {
  selected: SpiritualGuideKey;
  onSelect: (key: SpiritualGuideKey) => void;
  className?: string;
}

export function AvatarSelector({ selected, onSelect, className }: AvatarSelectorProps) {
  return (
    <div className={cn('flex flex-wrap justify-center gap-4', className)}>
      {(Object.keys(SPIRITUAL_GUIDES) as SpiritualGuideKey[]).map((key) => {
        const guide = SPIRITUAL_GUIDES[key];
        const isSelected = key === selected;

        return (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={cn(
              'relative flex flex-col items-center gap-1.5 rounded-xl p-3 transition-all',
              isSelected
                ? 'bg-gold/10 ring-1 ring-gold/40'
                : 'hover:bg-card active:scale-95',
            )}
          >
            <SaintAvatar guideKey={key} size="sm" />
            <span className="text-[10px] font-medium text-muted-foreground">
              {guide.label}
            </span>
            {isSelected && (
              <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold">
                <Check className="h-3 w-3 text-primary-foreground" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
