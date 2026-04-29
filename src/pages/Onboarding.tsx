import { useEffect, useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Check, Loader2, Sparkles } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useOnboardingResponses } from '@/hooks/useOnboardingResponses';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n';
import logoImg from '@/assets/logo.png';

const TOTAL_STEPS = 10; // 0..9 visible progress (added recap)

const GOALS = [
  { value: 'peace', label: 'Peace', emoji: '🕊️' },
  { value: 'prayer_habit', label: 'Stronger prayer habit', emoji: '🕯️' },
  { value: 'healing', label: 'Healing', emoji: '💛' },
  { value: 'guidance', label: 'Guidance', emoji: '🧭' },
  { value: 'overcoming_temptation', label: 'Overcoming temptation', emoji: '⚔️' },
  { value: 'gratitude', label: 'Gratitude', emoji: '🌿' },
  { value: 'devotion', label: 'Deeper Catholic devotion', emoji: '✝️' },
  { value: 'return_to_faith', label: 'Return to faith', emoji: '🏠' },
  { value: 'grief', label: 'Help through grief', emoji: '🤍' },
  { value: 'discernment', label: 'Discernment', emoji: '🌟' },
  { value: 'family', label: 'Marriage / family growth', emoji: '👨‍👩‍👧' },
  { value: 'purpose', label: 'Purpose', emoji: '🌅' },
];

const STAGES = [
  { value: 'exploring', label: 'Exploring faith', desc: 'Curious and beginning to seek' },
  { value: 'returning', label: 'Returning to prayer', desc: 'Coming back to a rhythm' },
  { value: 'occasionally', label: 'Pray occasionally', desc: 'In moments of need or quiet' },
  { value: 'regularly', label: 'Pray regularly', desc: 'A steady part of my week' },
  { value: 'deep', label: 'Deep devotional life', desc: 'Daily prayer and sacraments' },
];

const BURDENS = [
  { value: 'anxiety', label: 'Anxiety' },
  { value: 'loneliness', label: 'Loneliness' },
  { value: 'grief', label: 'Grief' },
  { value: 'lust', label: 'Lust / temptation' },
  { value: 'anger', label: 'Anger' },
  { value: 'forgiveness', label: 'Forgiveness' },
  { value: 'financial', label: 'Financial stress' },
  { value: 'marriage', label: 'Marriage struggles' },
  { value: 'parenting', label: 'Parenting worries' },
  { value: 'doubt', label: 'Doubt' },
  { value: 'vocation', label: 'Vocational uncertainty' },
  { value: 'burnout', label: 'Burnout' },
  { value: 'other', label: 'Other' },
];

const STYLES = [
  { value: 'structured', label: 'Structured prayer', emoji: '📿' },
  { value: 'saint', label: 'Saint devotion', emoji: '✨' },
  { value: 'scripture', label: 'Scripture meditation', emoji: '📖' },
  { value: 'rosary', label: 'Rosary', emoji: '🌹' },
  { value: 'examen', label: 'Journaling / Examen', emoji: '✍️' },
  { value: 'contemplative', label: 'Contemplative prayer', emoji: '🕯️' },
  { value: 'audio', label: 'Guided audio prayer', emoji: '🎧' },
];

const COMMITMENTS = [
  { value: '5', label: '5 minutes', desc: 'A gentle daily breath', goal: 1 },
  { value: '10', label: '10 minutes', desc: 'A steady morning rhythm', goal: 2 },
  { value: '20', label: '20 minutes', desc: 'A deeper anchor in your day', goal: 3 },
  { value: 'deep', label: 'Deep devotional life', desc: 'Multiple devotions throughout the day', goal: 4 },
];

function ProgressDots({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-center gap-1.5 pt-8 pb-4">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          className={`h-1 rounded-full transition-all duration-500 ${
            i < step ? 'w-6 bg-gold' : i === step ? 'w-6 bg-gold/60' : 'w-3 bg-secondary'
          }`}
        />
      ))}
    </div>
  );
}

function StepHeader({ step, label, title, subtitle }: { step: number; label: string; title: string; subtitle?: string }) {
  return (
    <>
      <p className="text-xs font-medium uppercase tracking-widest text-gold/60 mb-2">
        Step {step} of {TOTAL_STEPS - 1} · {label}
      </p>
      <h1 className="font-serif text-2xl text-foreground mb-2 leading-snug">{title}</h1>
      {subtitle && <p className="text-sm text-muted-foreground mb-6">{subtitle}</p>}
    </>
  );
}

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { saveProfile, profile, loading: profileLoading } = useUserProfile();
  const { save: saveResponses } = useOnboardingResponses();

  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState('');
  const [goals, setGoals] = useState<string[]>([]);
  const [stage, setStage] = useState<string>('');
  const [burdens, setBurdens] = useState<string[]>([]);
  const [styles, setStyles] = useState<string[]>([]);
  const [commitment, setCommitment] = useState<string>('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user === null) navigate('/auth', { replace: true });
  }, [user, navigate]);

  // Auto-advance loading screen → reveal
  useEffect(() => {
    if (step !== 7) return;
    const t = setTimeout(() => setStep(8), 2600);
    return () => clearTimeout(t);
  }, [step]);

  const toggleArr = (val: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.includes(val) ? list.filter((v) => v !== val) : [...list, val]);
  };

  const back = () => setStep((s) => Math.max(0, s - 1));
  const next = () => setStep((s) => Math.min(TOTAL_STEPS, s + 1));

  // Persist progress along the way (best-effort)
  useEffect(() => {
    if (!user || step <= 1) return;
    saveResponses({
      intent: goals[0],
      prayer_life_state: stage || undefined,
      struggles: burdens,
      growth_focus: goals,
      voice_style: styles[0],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const buildPlanAndSave = async () => {
    setSaving(true);
    const goalCount = COMMITMENTS.find((c) => c.value === commitment)?.goal ?? 2;
    const level =
      stage === 'deep' || stage === 'regularly' ? 'advanced' : stage === 'occasionally' || stage === 'returning' ? 'intermediate' : 'beginner';
    await saveProfile(goals, level, goalCount, displayName.trim(), termsAccepted);
    await saveResponses(
      {
        intent: goals[0],
        prayer_life_state: stage,
        struggles: burdens,
        growth_focus: goals,
        voice_style: styles[0],
      },
      true,
    );
    setSaving(false);
    setStep(7); // loading screen
  };

  const goToPaywall = () => navigate('/paywall', { replace: true });

  if (authLoading || profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }
  if (user && profile?.onboarding_completed) {
    return <Navigate to="/" replace />;
  }

  // Build plan summary text
  const topGoal = GOALS.find((g) => g.value === goals[0])?.label ?? 'a deeper prayer life';
  const recommendedSaint = pickSaint(goals, burdens);
  const cadence = burdens.includes('lust') || burdens.includes('anger') ? 'Confession every 2 weeks' : 'Confession monthly';
  const scripture = pickScripture(goals, burdens);

  return (
    <div className="flex min-h-screen flex-col bg-background px-6 pb-8 pt-safe">
      <OnboardingTopBar />
      {step < 7 && <ProgressDots step={step} />}

      {/* Step 0 — Welcome */}
      {step === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center text-center animate-fade-in">
          <div className="mb-8 text-5xl">🕊️</div>
          <h1 className="font-serif text-3xl text-foreground mb-3 leading-tight">
            Grow closer to God, one prayer at a time.
          </h1>
          <p className="text-sm text-muted-foreground max-w-xs mb-12">
            A guided spiritual path — sacred, personal, and made for the life you're living.
          </p>
          <button
            onClick={next}
            className="w-full rounded-xl bg-gold py-4 font-medium text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98]"
          >
            Begin your path
          </button>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your first name (optional)"
            maxLength={50}
            className="mt-4 w-full rounded-xl border border-border bg-card px-5 py-3 text-foreground placeholder:text-muted-foreground focus:border-gold/50 focus:outline-none text-sm text-center"
          />
        </div>
      )}

      {/* Step 1 — Spiritual goals */}
      {step === 1 && (
        <StepShell onBack={back} onNext={next} disabled={goals.length === 0}>
          <StepHeader step={1} label="Your hopes" title="What are you seeking?" subtitle="Choose any that move you. There are no wrong answers." />
          <div className="grid grid-cols-2 gap-3">
            {GOALS.map((opt) => (
              <ChipCard key={opt.value} active={goals.includes(opt.value)} onClick={() => toggleArr(opt.value, goals, setGoals)} emoji={opt.emoji} label={opt.label} />
            ))}
          </div>
        </StepShell>
      )}

      {/* Step 2 — Spiritual stage */}
      {step === 2 && (
        <StepShell onBack={back} onNext={next} disabled={!stage}>
          <StepHeader step={2} label="Where you are" title="Where are you in your prayer life?" subtitle="A starting point — not a label." />
          <div className="space-y-3">
            {STAGES.map((opt) => (
              <SelectCard key={opt.value} active={stage === opt.value} onClick={() => setStage(opt.value)} label={opt.label} desc={opt.desc} />
            ))}
          </div>
        </StepShell>
      )}

      {/* Step 3 — Burdens (optional, private) */}
      {step === 3 && (
        <StepShell onBack={back} onNext={next} disabled={false} ctaLabel={burdens.length === 0 ? 'Skip' : 'Continue'}>
          <StepHeader
            step={3}
            label="Held in confidence"
            title="What burdens are you carrying right now?"
            subtitle="This is private and stays between you and Ora. Optional."
          />
          <div className="grid grid-cols-2 gap-2.5">
            {BURDENS.map((opt) => (
              <ChipCard key={opt.value} active={burdens.includes(opt.value)} onClick={() => toggleArr(opt.value, burdens, setBurdens)} label={opt.label} />
            ))}
          </div>
        </StepShell>
      )}

      {/* Step 4 — Devotional style */}
      {step === 4 && (
        <StepShell onBack={back} onNext={next} disabled={styles.length === 0}>
          <StepHeader step={4} label="Your devotional style" title="How do you like to pray?" subtitle="Choose any that feel like home — or that you'd like to learn." />
          <div className="space-y-2.5">
            {STYLES.map((opt) => (
              <SelectCard key={opt.value} active={styles.includes(opt.value)} onClick={() => toggleArr(opt.value, styles, setStyles)} emoji={opt.emoji} label={opt.label} />
            ))}
          </div>
        </StepShell>
      )}

      {/* Step 5 — Commitment */}
      {step === 5 && (
        <StepShell onBack={back} onNext={next} disabled={!commitment}>
          <StepHeader step={5} label="Daily commitment" title="How much time can you give each day?" subtitle="Small and faithful is greater than large and rare." />
          <div className="space-y-3">
            {COMMITMENTS.map((opt) => (
              <SelectCard key={opt.value} active={commitment === opt.value} onClick={() => setCommitment(opt.value)} label={opt.label} desc={opt.desc} />
            ))}
          </div>
        </StepShell>
      )}

      {/* Step 6 — Terms & build */}
      {step === 6 && (
        <div className="flex flex-1 flex-col animate-fade-in">
          <div className="flex-1 flex flex-col justify-center">
            <StepHeader step={6} label="Almost there" title="Ready to build your devotional path?" subtitle="Ora will craft prayers, saints, and scripture chosen for you." />
            <div className="mt-2 flex items-start gap-3 rounded-xl border border-border bg-card p-4">
              <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(c) => setTermsAccepted(c === true)} className="mt-0.5" />
              <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                I agree to the{' '}
                <Link to="/privacy-policy" className="text-gold hover:underline" target="_blank">Privacy Policy</Link>{' '}
                and{' '}
                <Link to="/terms-of-service" className="text-gold hover:underline" target="_blank">Terms of Service</Link>.
              </label>
            </div>
          </div>
          <div className="mt-8 flex gap-3">
            <button onClick={back} className="rounded-xl border border-border px-4 py-4 text-muted-foreground transition-colors hover:text-foreground" aria-label="Back">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              onClick={buildPlanAndSave}
              disabled={!termsAccepted || saving}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gold py-4 font-medium text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-40"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Build my devotional path'}
            </button>
          </div>
        </div>
      )}

      {/* Step 7 — Loading reveal */}
      {step === 7 && (
        <div className="flex flex-1 flex-col items-center justify-center text-center animate-fade-in">
          <div className="relative mb-8">
            <div className="h-16 w-16 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
            <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-gold/80" />
          </div>
          <h1 className="font-serif text-2xl text-foreground mb-3">Building your devotional path…</h1>
          <p className="text-sm text-muted-foreground max-w-xs">
            Choosing prayers, scripture, and a saint to walk with you.
          </p>
          <div className="mt-8 space-y-2 text-xs text-muted-foreground/70">
            <p className="animate-pulse">✦ Listening to your hopes</p>
            <p className="animate-pulse" style={{ animationDelay: '300ms' }}>✦ Pairing you with a saint</p>
            <p className="animate-pulse" style={{ animationDelay: '600ms' }}>✦ Setting your daily rhythm</p>
          </div>
        </div>
      )}

      {/* Step 8 — Plan reveal */}
      {step === 8 && (
        <div className="flex flex-1 flex-col animate-fade-in pt-4">
          <div className="flex-1">
            <p className="text-xs font-medium uppercase tracking-widest text-gold/60 mb-2 text-center">Your devotional path</p>
            <h1 className="font-serif text-3xl text-foreground mb-2 text-center leading-tight">
              {displayName ? `${displayName}, your` : 'Your'} path is ready.
            </h1>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Drawn from your hopes, your stage, and what you carry today.
            </p>

            <div className="space-y-3">
              <PlanCard label="Your guide" title={recommendedSaint.name} desc={recommendedSaint.reason} />
              <PlanCard label="Daily focus" title={topGoal} desc={`We'll center your daily prayer around ${topGoal.toLowerCase()}.`} />
              <PlanCard label="Scripture anchor" title={scripture.ref} desc={`"${scripture.text}"`} />
              <PlanCard label="Confession cadence" title={cadence} desc="A gentle rhythm for the sacrament — never a burden." />
              <PlanCard
                label="Daily rhythm"
                title={COMMITMENTS.find((c) => c.value === commitment)?.label ?? '10 minutes'}
                desc="Morning prayer · midday pause · evening Examen."
              />
            </div>
          </div>

          <button
            onClick={() => setStep(9)}
            className="mt-8 w-full rounded-xl bg-gold py-4 font-medium text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98]"
          >
            Review my plan
          </button>
        </div>
      )}

      {/* Step 9 — Recap & edit */}
      {step === 9 && (
        <div className="flex flex-1 flex-col animate-fade-in pt-4">
          <div className="flex-1">
            <p className="text-xs font-medium uppercase tracking-widest text-gold/60 mb-2 text-center">Review your path</p>
            <h1 className="font-serif text-3xl text-foreground mb-2 text-center leading-tight">
              Does this feel like you?
            </h1>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Edit anything before you continue. Nothing is locked in.
            </p>

            <div className="space-y-3">
              <RecapRow
                label="Your hopes"
                value={goals.map((g) => GOALS.find((x) => x.value === g)?.label).filter(Boolean).join(' · ') || 'Not set'}
                onEdit={() => setStep(1)}
              />
              <RecapRow
                label="Where you are"
                value={STAGES.find((s) => s.value === stage)?.label || 'Not set'}
                onEdit={() => setStep(2)}
              />
              <RecapRow
                label="What you carry"
                value={burdens.length ? burdens.map((b) => BURDENS.find((x) => x.value === b)?.label).filter(Boolean).join(' · ') : 'None shared'}
                onEdit={() => setStep(3)}
              />
              <RecapRow
                label="Devotional style"
                value={styles.map((s) => STYLES.find((x) => x.value === s)?.label).filter(Boolean).join(' · ') || 'Not set'}
                onEdit={() => setStep(4)}
              />
              <RecapRow
                label="Daily commitment"
                value={COMMITMENTS.find((c) => c.value === commitment)?.label || 'Not set'}
                onEdit={() => setStep(5)}
              />
              <RecapRow
                label="Your guide"
                value={recommendedSaint.name}
                hint="Chosen for you based on your selections"
              />
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              onClick={() => setStep(8)}
              className="rounded-xl border border-border px-4 py-4 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              onClick={goToPaywall}
              className="flex-1 rounded-xl bg-gold py-4 font-medium text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98]"
            >
              Looks good — continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

function StepShell({
  children,
  onBack,
  onNext,
  disabled,
  ctaLabel = 'Continue',
}: {
  children: React.ReactNode;
  onBack: () => void;
  onNext: () => void;
  disabled: boolean;
  ctaLabel?: string;
}) {
  return (
    <div className="flex flex-1 flex-col animate-fade-in">
      <div className="flex-1 flex flex-col justify-center">{children}</div>
      <div className="mt-8 flex gap-3">
        <button onClick={onBack} className="rounded-xl border border-border px-4 py-4 text-muted-foreground transition-colors hover:text-foreground" aria-label="Back">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <button
          onClick={onNext}
          disabled={disabled}
          className="flex-1 rounded-xl bg-gold py-4 font-medium text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-40"
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}

function SelectCard({ active, onClick, label, desc, emoji }: { active: boolean; onClick: () => void; label: string; desc?: string; emoji?: string }) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-xl border px-5 py-4 text-left transition-all active:scale-[0.98] flex items-center gap-3 ${
        active ? 'border-gold/60 bg-gold/10' : 'border-border bg-card hover:border-gold/20'
      }`}
    >
      {emoji && <span className="text-xl">{emoji}</span>}
      <div className="flex-1">
        <p className="font-serif text-base text-foreground">{label}</p>
        {desc && <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>}
      </div>
      {active && <Check className="h-4 w-4 text-gold" />}
    </button>
  );
}

function ChipCard({ active, onClick, label, emoji }: { active: boolean; onClick: () => void; label: string; emoji?: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl border px-3 py-3.5 text-left transition-all active:scale-[0.97] ${
        active ? 'border-gold/60 bg-gold/10' : 'border-border bg-card hover:border-gold/20'
      }`}
    >
      {emoji && <span className="text-lg">{emoji}</span>}
      <span className="font-medium text-sm text-foreground leading-tight">{label}</span>
    </button>
  );
}

function PlanCard({ label, title, desc }: { label: string; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-[10px] uppercase tracking-widest text-gold/60 mb-1">{label}</p>
      <p className="font-serif text-lg text-foreground leading-tight">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

function OnboardingTopBar() {
  const { language, setLanguage } = useLanguage();
  return (
    <div className="flex items-center justify-between pt-2">
      <Link to="/welcome" className="flex items-center gap-2" aria-label="Ora home">
        <img src={logoImg} alt="Ora" className="h-7 w-7 object-contain" />
        <span className="font-serif text-base text-foreground">Ora</span>
      </Link>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as any)}
        className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-gold/50"
        aria-label="Language"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.nativeLabel}
          </option>
        ))}
      </select>
    </div>
  );
}

// Lightweight deterministic recommendations for the reveal
function pickSaint(goals: string[], burdens: string[]): { name: string; reason: string } {
  if (burdens.includes('anxiety') || goals.includes('peace'))
    return { name: 'St. Francis of Assisi', reason: 'A companion of peace, simplicity, and trust.' };
  if (burdens.includes('lust') || burdens.includes('forgiveness'))
    return { name: 'St. Augustine', reason: 'A restless heart turned toward God — he understands your road.' };
  if (goals.includes('discernment') || burdens.includes('vocation'))
    return { name: 'St. Thomas Aquinas', reason: 'Clarity, reason, and quiet wisdom for the path ahead.' };
  if (burdens.includes('grief') || goals.includes('grief'))
    return { name: 'St. Padre Pio', reason: 'A friend in suffering who points always to mercy.' };
  if (goals.includes('overcoming_temptation') || burdens.includes('anger'))
    return { name: 'St. Michael', reason: 'Courage and protection in spiritual battle.' };
  if (goals.includes('devotion') || goals.includes('prayer_habit'))
    return { name: 'St. Teresa of Ávila', reason: 'A teacher of interior prayer and steady devotion.' };
  return { name: 'St. Joan of Arc', reason: 'Holy boldness for the mission God places before you.' };
}

function pickScripture(goals: string[], burdens: string[]): { ref: string; text: string } {
  if (burdens.includes('anxiety')) return { ref: 'Psalm 23', text: 'The Lord is my shepherd; I shall not want.' };
  if (burdens.includes('grief')) return { ref: 'Matthew 5:4', text: 'Blessed are those who mourn, for they shall be comforted.' };
  if (burdens.includes('loneliness')) return { ref: 'Deuteronomy 31:6', text: 'He will not leave you nor forsake you.' };
  if (goals.includes('gratitude')) return { ref: '1 Thessalonians 5:18', text: 'Give thanks in all circumstances.' };
  if (goals.includes('discernment')) return { ref: 'Proverbs 3:5–6', text: 'Trust in the Lord with all your heart.' };
  return { ref: 'Psalm 46:10', text: 'Be still, and know that I am God.' };
}

export default Onboarding;
