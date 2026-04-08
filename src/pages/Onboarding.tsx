import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';

const SEEKING_OPTIONS = [
  { value: 'peace', label: 'Peace', emoji: '🕊️' },
  { value: 'discipline', label: 'Discipline', emoji: '⚔️' },
  { value: 'faith', label: 'Deeper Faith', emoji: '✝️' },
  { value: 'healing', label: 'Healing', emoji: '💛' },
  { value: 'community', label: 'Community', emoji: '🤝' },
  { value: 'purpose', label: 'Purpose', emoji: '🌟' },
];

const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Just Starting', description: 'New to prayer and Catholic tradition' },
  { value: 'intermediate', label: 'Growing', description: 'Familiar with prayers, seeking depth' },
  { value: 'advanced', label: 'Experienced', description: 'Deep prayer life, looking for guidance' },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { saveProfile } = useUserProfile();
  const [step, setStep] = useState(0);
  const [seeking, setSeeking] = useState<string[]>([]);
  const [experience, setExperience] = useState('');
  const [saving, setSaving] = useState(false);

  const toggleSeeking = (value: string) => {
    setSeeking((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleFinish = async () => {
    setSaving(true);
    await saveProfile(seeking, experience || 'beginner');
    setSaving(false);
    navigate('/', { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background px-6 pb-8 pt-safe">
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 pt-8 pb-4">
        {[0, 1].map((i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i <= step ? 'w-8 bg-gold' : 'w-4 bg-secondary'
            }`}
          />
        ))}
      </div>

      {step === 0 && (
        <div className="flex flex-1 flex-col animate-fade-in">
          <div className="flex-1 flex flex-col justify-center">
            <p className="text-xs font-medium uppercase tracking-widest text-gold/60 mb-2">Step 1 of 2</p>
            <h1 className="font-serif text-2xl text-foreground mb-2">What are you seeking?</h1>
            <p className="text-sm text-muted-foreground mb-8">Select all that resonate with your heart.</p>

            <div className="grid grid-cols-2 gap-3">
              {SEEKING_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => toggleSeeking(opt.value)}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-4 text-left transition-all active:scale-[0.97] ${
                    seeking.includes(opt.value)
                      ? 'border-gold/50 bg-gold/10'
                      : 'border-border bg-card hover:border-gold/20'
                  }`}
                >
                  <span className="text-xl">{opt.emoji}</span>
                  <span className="font-medium text-sm text-foreground">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setStep(1)}
            disabled={seeking.length === 0}
            className="mt-8 w-full rounded-xl bg-gold py-4 font-medium text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-40"
          >
            Continue
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-1 flex-col animate-fade-in">
          <div className="flex-1 flex flex-col justify-center">
            <p className="text-xs font-medium uppercase tracking-widest text-gold/60 mb-2">Step 2 of 2</p>
            <h1 className="font-serif text-2xl text-foreground mb-2">Your prayer experience</h1>
            <p className="text-sm text-muted-foreground mb-8">This helps us guide you at the right pace.</p>

            <div className="space-y-3">
              {EXPERIENCE_LEVELS.map((lvl) => (
                <button
                  key={lvl.value}
                  onClick={() => setExperience(lvl.value)}
                  className={`w-full rounded-xl border px-5 py-4 text-left transition-all active:scale-[0.97] ${
                    experience === lvl.value
                      ? 'border-gold/50 bg-gold/10'
                      : 'border-border bg-card hover:border-gold/20'
                  }`}
                >
                  <p className="font-serif text-base font-medium text-foreground">{lvl.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{lvl.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              onClick={() => setStep(0)}
              className="rounded-xl border border-border px-6 py-4 text-muted-foreground transition-colors hover:text-foreground"
            >
              Back
            </button>
            <button
              onClick={handleFinish}
              disabled={!experience || saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gold py-4 font-medium text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-40"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Begin Your Path'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
