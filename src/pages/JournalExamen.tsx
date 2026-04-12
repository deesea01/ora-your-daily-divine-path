import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, ChevronLeft, Check, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useJournal } from '@/hooks/useJournal';
import { useSpiritualGrowth, ReflectionAnalysis } from '@/hooks/useSpiritualGrowth';
import { EXAMEN_STEPS } from '@/lib/journalData';
import { Textarea } from '@/components/ui/textarea';

const JournalExamen = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { examenEntries, saveExamenStep, completeExamen, loading } = useJournal();
  const { analyzeReflection, actionLoading } = useSpiritualGrowth();

  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [analysis, setAnalysis] = useState<ReflectionAnalysis | null>(null);

  // Hydrate from existing drafts
  useEffect(() => {
    if (examenEntries.length > 0) {
      const r: Record<number, string> = {};
      examenEntries.forEach(e => { r[e.step_number] = e.response || ''; });
      setResponses(r);
    }
  }, [examenEntries]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;

  const step = EXAMEN_STEPS[currentStep];

  const handleSaveDraft = async () => {
    setSaving(true);
    await saveExamenStep(step.number, step.name, responses[step.number] || '', true);
    setSaving(false);
  };

  const handleNext = async () => {
    await handleSaveDraft();
    if (currentStep < EXAMEN_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleComplete = async () => {
    setSaving(true);
    await saveExamenStep(step.number, step.name, responses[step.number] || '', false);
    await completeExamen();
    setSaving(false);
    setCompleted(true);

    // Trigger AI analysis in background
    const fullReflection = EXAMEN_STEPS.map(s => `**${s.name}**: ${responses[s.number] || ''}`).filter(r => r.length > 10).join('\n\n');
    if (fullReflection.length > 20) {
      analyzeReflection(fullReflection).then(result => {
        if (result) setAnalysis(result);
      });
    }
  };

  if (completed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 animate-fade-in">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/15 mb-4">
          <Check className="h-8 w-8 text-gold" />
        </div>
        <p className="font-serif text-xl text-foreground">Examen Complete</p>
        <p className="text-sm text-muted-foreground mt-2 text-center">Go in peace. The Lord walks with you.</p>
        <button onClick={() => navigate('/journal')} className="mt-6 text-sm text-gold underline">Return to Journal</button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border px-4 py-4">
        <button onClick={() => navigate('/journal')} className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground" aria-label="Back">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1">
          <h1 className="font-serif text-lg font-medium text-foreground">Daily Examen</h1>
          <p className="text-xs text-muted-foreground">Step {currentStep + 1} of {EXAMEN_STEPS.length}</p>
        </div>
      </header>

      {/* Progress */}
      <div className="flex gap-1 px-4 pt-3">
        {EXAMEN_STEPS.map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= currentStep ? 'bg-gold' : 'bg-secondary'}`} />
        ))}
      </div>

      <main className="flex-1 px-6 py-6 flex flex-col">
        {/* Step content */}
        <div className="flex-1 animate-fade-in" key={currentStep}>
          <div className="mb-6">
            <p className="text-xs text-gold uppercase tracking-wider mb-2">Step {step.number}</p>
            <h2 className="font-serif text-xl text-foreground mb-2">{step.title}</h2>
            <p className="text-sm text-muted-foreground italic leading-relaxed">{step.description}</p>
          </div>

          {/* Prompts */}
          <div className="mb-4 space-y-2">
            {step.prompts.map((prompt, i) => (
              <div key={i} className="rounded-lg border border-border bg-card/50 p-3">
                <p className="text-xs text-foreground/70 italic">{prompt}</p>
              </div>
            ))}
          </div>

          {/* Response */}
          <Textarea
            value={responses[step.number] || ''}
            onChange={e => setResponses(prev => ({ ...prev, [step.number]: e.target.value }))}
            placeholder="Write from the heart…"
            className="min-h-[150px] bg-card border-border resize-none font-serif text-sm"
            maxLength={2000}
          />

          <button onClick={handleSaveDraft} disabled={saving} className="mt-2 text-xs text-gold underline disabled:opacity-50">
            {saving ? 'Saving…' : 'Save draft'}
          </button>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="flex items-center gap-1 text-sm text-muted-foreground disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>

          {currentStep < EXAMEN_STEPS.length - 1 ? (
            <button onClick={handleNext} className="flex items-center gap-1 rounded-lg bg-gold px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 active:scale-95">
              Next <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button onClick={handleComplete} disabled={saving} className="rounded-lg bg-gold px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 active:scale-95 disabled:opacity-50">
              {saving ? 'Saving…' : 'Complete Examen'}
            </button>
          )}
        </div>
      </main>
    </div>
  );
};

export default JournalExamen;
