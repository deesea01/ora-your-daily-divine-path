import { Globe } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useLanguage } from '@/contexts/LanguageContext';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n';
import { useState } from 'react';

export function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const current = SUPPORTED_LANGUAGES.find(l => l.code === language);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="group w-full rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-gold/20 active:scale-[0.98]"
          title={t.changeLanguage}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/10">
                <Globe className="h-4 w-4 text-gold" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{t.language}</p>
                <p className="text-xs text-muted-foreground">{current?.flag} {current?.nativeLabel}</p>
              </div>
            </div>
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-1" align="center">
        {SUPPORTED_LANGUAGES.map(lang => (
          <button
            key={lang.code}
            onClick={() => { setLanguage(lang.code); setOpen(false); }}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
              language === lang.code
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-foreground hover:bg-muted'
            }`}
          >
            <span className="text-lg">{lang.flag}</span>
            <span>{lang.nativeLabel}</span>
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
