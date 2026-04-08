import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { SPIRITUAL_GUIDES, SpiritualGuideKey } from '@/lib/guides';
import { toast } from 'sonner';

const GuideSelect = () => {
  const navigate = useNavigate();
  const { profile, setGuide } = useUserProfile();
  const current = (profile?.spiritual_guide || 'monk') as SpiritualGuideKey;

  const handleSelect = async (key: string) => {
    if (key === current) return;
    const result = await setGuide(key);
    if (!result?.error) {
      toast.success(`${SPIRITUAL_GUIDES[key as SpiritualGuideKey].label} is now your guide`);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border px-4 py-4">
        <button
          onClick={() => navigate('/')}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="font-serif text-lg font-medium text-foreground">Spiritual Guide</h1>
      </header>

      <main className="flex-1 px-6 py-6">
        <p className="mb-6 text-sm text-muted-foreground">
          Choose a spiritual guide to shape your AI experience — tone, prayers, and reflections will adapt to their character.
        </p>

        <div className="space-y-3">
          {Object.entries(SPIRITUAL_GUIDES).map(([key, guide]) => (
            <button
              key={key}
              onClick={() => handleSelect(key)}
              className={`flex w-full items-center gap-4 rounded-xl border px-5 py-4 text-left transition-all active:scale-[0.98] ${
                key === current
                  ? 'border-gold/50 bg-gold/10'
                  : 'border-border bg-card hover:border-gold/20'
              }`}
            >
              <span className="text-2xl">{guide.emoji}</span>
              <div className="flex-1">
                <p className="font-serif text-base font-medium text-foreground">{guide.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{guide.description}</p>
              </div>
              {key === current && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gold">
                  <Check className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
              )}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default GuideSelect;
