import { useState } from 'react';
import { cn } from '@/lib/utils';
import { SPIRITUAL_GUIDES, SpiritualGuideKey } from '@/lib/guides';
import { ChevronDown } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface GuideSwitcherProps {
  currentGuide: SpiritualGuideKey;
  onSelect: (key: SpiritualGuideKey) => void;
}

export function GuideSwitcher({ currentGuide, onSelect }: GuideSwitcherProps) {
  const [open, setOpen] = useState(false);
  const guide = SPIRITUAL_GUIDES[currentGuide] || SPIRITUAL_GUIDES.monk;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-card hover:text-foreground">
          <span>{guide.emoji}</span>
          <ChevronDown className="h-3 w-3" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <p className="px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Switch Guide
        </p>
        <div className="mt-1 space-y-0.5">
          {(Object.keys(SPIRITUAL_GUIDES) as SpiritualGuideKey[]).map((key) => {
            const g = SPIRITUAL_GUIDES[key];
            const isActive = key === currentGuide;
            return (
              <button
                key={key}
                onClick={() => {
                  onSelect(key);
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm transition-colors',
                  isActive
                    ? 'bg-primary/10 text-foreground'
                    : 'text-muted-foreground hover:bg-card hover:text-foreground'
                )}
              >
                <img
                  src={g.avatar}
                  alt={g.label}
                  className="h-8 w-8 rounded-full border border-border object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{g.emoji} {g.label}</p>
                  <p className="truncate text-[10px] text-muted-foreground">{g.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
