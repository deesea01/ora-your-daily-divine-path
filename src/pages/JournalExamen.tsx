import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useJournal } from '@/hooks/useJournal';

const EXAMEN_STEPS = [
  { key: 'gratitude', title: 'Gratitude', prompt: 'Where did you see God today? What are you grateful for?' },
  { key: 'review', title: 'Review', prompt: 'What stood out in your day? What moments were significant?' },
  { key: 'failures', title: 'Shortcomings', prompt: 'Where did you fall short today? What would you do differently?' },
  { key: 'patterns', title: 'Patterns', prompt: 'What keeps happening? Do you notice any recurring themes?' },
  { key: 'resolution', title: 'Resolution', prompt: 'What will you do tomorrow? How will you grow?' },
];

const JournalExamen = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { saveEntry, saving } = useJournal();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;

  const current = EXAMEN_STEPS[step];
  const isLast = step === EXAMEN_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      handleSave();
    } else {
      setStep(s => s + 1);
    }
  };

  const handleSave = async () => {
    const combined = EXAMEN_STEPS
      .map(s => `**${s.title}:** ${answers[s.key] || '(skipped)'}`)
      .join('\n\n');

    const result = await saveEntry(combined, undefined, ['examen'], 'examen', answers);
    if (!result?.error) {
      navigate('/journal', { replace: true });
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background px-6 pb-8 pt-safe">
      <header className="flex items-center gap-3 pt-6 pb-4 pr-14">
        <button
          onClick={() => step > 0 ? setStep(s => s - 1) : navigate('/journal')}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="font-serif text-xl text-foreground">Daily Examen</h1>
          <p className="text-xs text-muted-foreground">Step {step + 1} of {EXAMEN_STEPS.length}</p>
        </div>
      </header>

      {/* Progress */}
      <div className="flex gap-1.5 mb-6">
        {EXAMEN_STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
              i <= step ? 'bg-gold' : 'bg-secondary'
            }`}
          />
        ))}
      </div>

      <div className="flex-1 flex flex-col animate-fade-in" key={step}>
        <div className="flex-1 flex flex-col justify-center">
          <p className="text-xs font-medium uppercase tracking-widest text-gold/60 mb-2">{current.title}</p>
          <h2 className="font-serif text-2xl text-foreground mb-6">{current.prompt}</h2>

          <textarea
            value={answers[current.key] || ''}
            onChange={(e) => setAnswers(prev => ({ ...prev, [current.key]: e.target.value.slice(0, 2000) }))}
            placeholder="Take a moment to reflect…"
            maxLength={2000}
            className="w-full min-h-[180px] resize-none rounded-xl border border-border bg-card p-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold/50 focus:outline-none"
            autoFocus
          />
        </div>

        <div className="mt-6 flex gap-3">
          {!isLast && (
            <button
              onClick={handleNext}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gold py-4 font-medium text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98]"
            >
              Continue
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
          {isLast && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gold py-4 font-medium text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Complete Examen'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default JournalExamen;
