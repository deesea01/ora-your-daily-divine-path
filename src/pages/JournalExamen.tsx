import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, ChevronLeft, Check, Loader2, Mic, MicOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useJournal } from '@/hooks/useJournal';
import { useSpiritualGrowth, ReflectionAnalysis } from '@/hooks/useSpiritualGrowth';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useUserProfile } from '@/hooks/useUserProfile';
import { EXAMEN_STEPS } from '@/lib/journalData';
import { Textarea } from '@/components/ui/textarea';

const JournalExamen = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { examenEntries, saveExamenStep, completeExamen, loading } = useJournal();
  const { analyzeReflection, actionLoading } = useSpiritualGrowth();
  const { profile } = useUserProfile();
  const { isListening, transcript, interimTranscript, isSupported, toggle, resetTranscript } = useSpeechRecognition(true, profile?.preferred_language || 'en');

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

  // Append speech transcript to current step's response
  useEffect(() => {
    if (transcript) {
      const step = EXAMEN_STEPS[currentStep];
      setResponses(prev => {
        const existing = prev[step.number] || '';
        const separator = existing && !existing.endsWith(' ') ? ' ' : '';
        return { ...prev, [step.number]: existing + separator + transcript };
      });
      resetTranscript();
    }
  }, [transcript, currentStep, resetTranscript]);

  // Stop listening when changing steps
  useEffect(() => {
    if (isListening) {
      toggle();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

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
      <div className="flex min-h-screen flex-col bg-background px-6 py-8 overflow-y-auto">
        <div className="flex flex-col items-center animate-fade-in mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/15 mb-4">
            <Check className="h-8 w-8 text-gold" />
          </div>
          <p className="font-serif text-xl text-foreground">Examen Complete</p>
          <p className="text-sm text-muted-foreground mt-2 text-center">Go in peace. The Lord walks with you.</p>
        </div>

        {/* AI Analysis */}
        {actionLoading === 'analyze' && (
          <div className="flex items-center justify-center gap-2 py-8 animate-fade-in">
            <Loader2 className="h-4 w-4 animate-spin text-gold" />
            <p className="text-sm text-muted-foreground">Reflecting on your words…</p>
          </div>
        )}

        {analysis && (
          <div className="space-y-4 animate-fade-in">
            {analysis.affirmation && (
              <div className="rounded-xl border border-emerald-500/20 bg-card p-4">
                <p className="text-xs text-emerald-400 uppercase tracking-wider mb-2">Affirmation</p>
                <p className="text-sm text-foreground/80 leading-relaxed">{analysis.affirmation}</p>
              </div>
            )}

            {analysis.gentle_correction && (
              <div className="rounded-xl border border-amber-500/20 bg-card p-4">
                <p className="text-xs text-amber-400 uppercase tracking-wider mb-2">Gentle Correction</p>
                <p className="text-sm text-foreground/80 leading-relaxed">{analysis.gentle_correction}</p>
              </div>
            )}

            {analysis.scripture && (
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs text-gold uppercase tracking-wider mb-2">Scripture</p>
                <p className="text-sm text-foreground/80 italic leading-relaxed">{analysis.scripture}</p>
              </div>
            )}

            {analysis.actionable_step && (
              <div className="rounded-xl border border-gold/20 bg-card p-4">
                <p className="text-xs text-gold uppercase tracking-wider mb-2">For Tomorrow</p>
                <p className="text-sm text-foreground/80 leading-relaxed">{analysis.actionable_step}</p>
              </div>
            )}

            {analysis.personalized_prayer && (
              <div className="rounded-xl border border-gold/20 bg-gold/5 p-4">
                <p className="text-xs text-gold uppercase tracking-wider mb-2">Prayer for You</p>
                <p className="text-sm text-foreground/80 italic leading-relaxed">{analysis.personalized_prayer}</p>
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {analysis.detected_virtues.map(v => (
                <span key={v} className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-400 capitalize">{v}</span>
              ))}
              {analysis.detected_struggles.map(s => (
                <span key={s} className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] text-amber-400 capitalize">{s}</span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-col items-center gap-3">
          <button onClick={() => navigate('/journal/insights')} className="text-sm text-gold underline">View Insights</button>
          <button onClick={() => navigate('/journal')} className="text-sm text-muted-foreground underline">Return to Journal</button>
        </div>
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

          {/* Response area with voice input */}
          <div className="relative">
            <Textarea
              value={(responses[step.number] || '') + (interimTranscript ? (responses[step.number] ? ' ' : '') + interimTranscript : '')}
              onChange={e => setResponses(prev => ({ ...prev, [step.number]: e.target.value }))}
              placeholder={isListening ? 'Listening… speak from the heart' : 'Write or speak from the heart…'}
              className={`min-h-[150px] bg-card border-border resize-none font-serif text-sm pr-12 transition-all ${isListening ? 'border-gold/50 ring-1 ring-gold/20' : ''}`}
              maxLength={2000}
              readOnly={isListening}
            />

            {/* Mic button */}
            {isSupported && (
              <button
                onClick={toggle}
                className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full transition-all ${
                  isListening
                    ? 'bg-destructive/15 text-destructive animate-pulse'
                    : 'bg-gold/10 text-gold hover:bg-gold/20'
                }`}
                aria-label={isListening ? 'Stop recording' : 'Start voice input'}
                type="button"
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
            )}
          </div>

          {/* Voice indicator */}
          {isListening && (
            <div className="mt-2 flex items-center gap-2 animate-fade-in">
              <div className="flex gap-0.5">
                <div className="h-2 w-0.5 rounded-full bg-gold animate-pulse" style={{ animationDelay: '0ms' }} />
                <div className="h-3 w-0.5 rounded-full bg-gold animate-pulse" style={{ animationDelay: '150ms' }} />
                <div className="h-2 w-0.5 rounded-full bg-gold animate-pulse" style={{ animationDelay: '300ms' }} />
                <div className="h-4 w-0.5 rounded-full bg-gold animate-pulse" style={{ animationDelay: '100ms' }} />
                <div className="h-2 w-0.5 rounded-full bg-gold animate-pulse" style={{ animationDelay: '250ms' }} />
              </div>
              <p className="text-xs text-gold">Listening…</p>
            </div>
          )}

          {!isListening && (
            <button onClick={handleSaveDraft} disabled={saving} className="mt-2 text-xs text-gold underline disabled:opacity-50">
              {saving ? 'Saving…' : 'Save draft'}
            </button>
          )}
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
