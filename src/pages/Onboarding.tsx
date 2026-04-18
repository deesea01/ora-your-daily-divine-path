import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useOnboardingResponses } from '@/hooks/useOnboardingResponses';
import { useAuth } from '@/hooks/useAuth';

const TOTAL_STEPS = 10;

const INTENTS = [
  { value: 'closer_to_god', label: 'Grow closer to God', emoji: '✝️' },
  { value: 'daily_habit', label: 'Build a daily prayer habit', emoji: '🕯️' },
  { value: 'peace_clarity', label: 'Find peace and clarity', emoji: '🕊️' },
  { value: 'overcome_struggles', label: 'Overcome struggles or sin', emoji: '⚔️' },
  { value: 'learn_faith', label: 'Learn more about the faith', emoji: '📖' },
];

const PRAYER_STATES = [
  { value: 'consistent', label: 'Consistent', desc: 'Prayer is part of my daily rhythm' },
  { value: 'on_off', label: 'On and off', desc: 'Some weeks strong, others quiet' },
  { value: 'starting', label: 'Just getting started', desc: 'New to a real prayer life' },
  { value: 'struggling', label: 'Struggling to stay committed', desc: 'I want to, but it slips' },
];

const STRUGGLES = [
  { value: 'anxiety', label: 'Anxiety', emoji: '🌊' },
  { value: 'discipline', label: 'Discipline', emoji: '⛓️' },
  { value: 'lust', label: 'Lust / temptation', emoji: '🔥' },
  { value: 'purpose', label: 'Lack of purpose', emoji: '🧭' },
  { value: 'stress', label: 'Stress', emoji: '⚡' },
  { value: 'doubts', label: 'Faith doubts', emoji: '❓' },
];

const GROWTH = [
  { value: 'discipline', label: 'Discipline', emoji: '⚔️' },
  { value: 'peace', label: 'Peace', emoji: '🕊️' },
  { value: 'faith', label: 'Deeper Faith', emoji: '✝️' },
  { value: 'strength', label: 'Strength', emoji: '🛡️' },
  { value: 'healing', label: 'Healing', emoji: '💛' },
  { value: 'purpose', label: 'Purpose', emoji: '🌟' },
];

const SAINTS = [
  { value: 'monk', label: 'The Monk', tier: 'Free', desc: 'A quiet companion for daily prayer' },
  { value: 'st_francis', label: 'St. Francis of Assisi', tier: 'Premium', desc: 'Joyful poverty, peace, creation' },
  { value: 'st_augustine', label: 'St. Augustine', tier: 'Premium', desc: 'Restless heart turned toward God' },
  { value: 'st_thomas_aquinas', label: 'St. Thomas Aquinas', tier: 'Premium', desc: 'Reason, clarity, deep theology' },
  { value: 'st_teresa', label: 'St. Teresa of Ávila', tier: 'Premium', desc: 'Interior castle and contemplation' },
  { value: 'st_michael', label: 'St. Michael', tier: 'Premium', desc: 'Spiritual warfare and protection' },
  { value: 'st_padre_pio', label: 'St. Padre Pio', tier: 'Premium', desc: 'Suffering, mercy, the confessional' },
  { value: 'st_joan_of_arc', label: 'St. Joan of Arc', tier: 'Premium', desc: 'Courage, mission, holy boldness' },
];

const VOICE_STYLES = [
  { value: 'gentle', label: 'Gentle & Compassionate', desc: 'Warm, slow, encouraging' },
  { value: 'direct', label: 'Direct & Disciplined', desc: 'Honest, firm, accountable' },
  { value: 'wise', label: 'Wise Teacher', desc: 'Thoughtful, patient, instructive' },
];

function StepHeader({ step, label, title, subtitle }: { step: number; label: string; title: string; subtitle?: string }) {
  return (
    <>
      <p className="text-xs font-medium uppercase tracking-widest text-gold/60 mb-2">
        Step {step} of {TOTAL_STEPS} · {label}
      </p>
      <h1 className="font-serif text-2xl text-foreground mb-2">{title}</h1>
      {subtitle && <p className="text-sm text-muted-foreground mb-8">{subtitle}</p>}
    </>
  );
}

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

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { saveProfile, setGuide } = useUserProfile();
  const { save: saveResponses } = useOnboardingResponses();

  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState('');
  const [intent, setIntent] = useState<string>('');
  const [prayerState, setPrayerState] = useState<string>('');
  const [struggles, setStruggles] = useState<string[]>([]);
  const [growth, setGrowth] = useState<string[]>([]);
  const [saint, setSaint] = useState<string>('');
  const [voice, setVoice] = useState<string>('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [saving, setSaving] = useState(false);

  // If user is unauthenticated, send them to /auth
  useEffect(() => {
    if (user === null) navigate('/auth', { replace: true });
  }, [user, navigate]);

  const toggleArr = (val: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.includes(val) ? list.filter((v) => v !== val) : [...list, val]);
  };

  const back = () => setStep((s) => Math.max(0, s - 1));
  const next = () => setStep((s) => Math.min(TOTAL_STEPS - 1, s + 1));

  // Persist after each meaningful step (best-effort, non-blocking)
  useEffect(() => {
    if (!user) return;
    if (step <= 1) return;
    saveResponses({
      intent: intent || undefined,
      prayer_life_state: prayerState || undefined,
      struggles,
      growth_focus: growth,
      voice_style: voice || undefined,
      chosen_guide: saint || undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const finishOnboardingAndGoToFirstPrayer = async () => {
    setSaving(true);
    const goalMap: Record<string, number> = { consistent: 3, on_off: 2, starting: 1, struggling: 1 };
    const goal = goalMap[prayerState] || 2;
    await saveProfile(growth, prayerState === 'consistent' ? 'advanced' : prayerState === 'on_off' ? 'intermediate' : 'beginner', goal, displayName.trim(), termsAccepted);
    if (saint) await setGuide(saint);
    await saveResponses(
      {
        intent,
        prayer_life_state: prayerState,
        struggles,
        growth_focus: growth,
        voice_style: voice,
        chosen_guide: saint,
      },
      true,
    );
    setSaving(false);
    next(); // go to first prayer step (8)
  };

  const saintObj = SAINTS.find((s) => s.value === saint) || SAINTS[0];
  const growthLabels = growth.map((g) => GROWTH.find((x) => x.value === g)?.label).filter(Boolean);

  return (
    <div className="flex min-h-screen flex-col bg-background px-6 pb-8 pt-safe">
      <ProgressDots step={step} />

      {/* Step 0 — Welcome */}
      {step === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center text-center animate-fade-in">
          <div className="mb-8 text-5xl">🕊️</div>
          <h1 className="font-serif text-3xl text-foreground mb-3 leading-tight">
            Grow closer to God in just a few minutes a day.
          </h1>
          <p className="text-sm text-muted-foreground max-w-xs mb-12">
            A guided spiritual path personalized to you — saints, prayer, and reflection that meets you where you are.
          </p>
          <button
            onClick={next}
            className="w-full rounded-xl bg-gold py-4 font-medium text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98]"
          >
            Begin Your Journey
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

      {/* Step 1 — Intent */}
      {step === 1 && (
        <StepShell onBack={back} onNext={next} disabled={!intent}>
          <StepHeader step={1} label="Intent" title="What brings you here today?" subtitle="Choose what resonates most." />
          <div className="space-y-3">
            {INTENTS.map((opt) => (
              <SelectCard key={opt.value} active={intent === opt.value} onClick={() => setIntent(opt.value)} emoji={opt.emoji} label={opt.label} />
            ))}
          </div>
        </StepShell>
      )}

      {/* Step 2 — Current prayer life */}
      {step === 2 && (
        <StepShell onBack={back} onNext={next} disabled={!prayerState}>
          <StepHeader step={2} label="Where you are" title="How would you describe your current prayer life?" />
          <div className="space-y-3">
            {PRAYER_STATES.map((opt) => (
              <SelectCard key={opt.value} active={prayerState === opt.value} onClick={() => setPrayerState(opt.value)} label={opt.label} desc={opt.desc} />
            ))}
          </div>
        </StepShell>
      )}

      {/* Step 3 — Struggles */}
      {step === 3 && (
        <StepShell onBack={back} onNext={next} disabled={struggles.length === 0}>
          <StepHeader step={3} label="Struggles" title="What are you currently struggling with?" subtitle="Select all that apply." />
          <div className="grid grid-cols-2 gap-3">
            {STRUGGLES.map((opt) => (
              <ChipCard key={opt.value} active={struggles.includes(opt.value)} onClick={() => toggleArr(opt.value, struggles, setStruggles)} emoji={opt.emoji} label={opt.label} />
            ))}
          </div>
        </StepShell>
      )}

      {/* Step 4 — Growth */}
      {step === 4 && (
        <StepShell onBack={back} onNext={next} disabled={growth.length === 0}>
          <StepHeader step={4} label="Growth" title="Where do you most want to grow?" subtitle="Select all that resonate." />
          <div className="grid grid-cols-2 gap-3">
            {GROWTH.map((opt) => (
              <ChipCard key={opt.value} active={growth.includes(opt.value)} onClick={() => toggleArr(opt.value, growth, setGrowth)} emoji={opt.emoji} label={opt.label} />
            ))}
          </div>
        </StepShell>
      )}

      {/* Step 5 — Saint */}
      {step === 5 && (
        <StepShell onBack={back} onNext={next} disabled={!saint}>
          <StepHeader step={5} label="Your guide" title="Choose a guide for your journey" subtitle="You can change this anytime." />
          <div className="space-y-2">
            {SAINTS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSaint(opt.value)}
                className={`w-full rounded-xl border px-4 py-3 text-left transition-all active:scale-[0.98] ${
                  saint === opt.value ? 'border-gold/60 bg-gold/10' : 'border-border bg-card hover:border-gold/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-serif text-base text-foreground">{opt.label}</p>
                  <span className={`text-[10px] font-medium uppercase tracking-wider ${opt.tier === 'Free' ? 'text-emerald-400' : 'text-gold/70'}`}>
                    {opt.tier}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{opt.desc}</p>
              </button>
            ))}
          </div>
        </StepShell>
      )}

      {/* Step 6 — Voice */}
      {step === 6 && (
        <StepShell onBack={back} onNext={next} disabled={!voice}>
          <StepHeader step={6} label="Tone" title="How would you like to be guided?" />
          <div className="space-y-3">
            {VOICE_STYLES.map((opt) => (
              <SelectCard key={opt.value} active={voice === opt.value} onClick={() => setVoice(opt.value)} label={opt.label} desc={opt.desc} />
            ))}
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-xl border border-border bg-card p-4">
            <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(c) => setTermsAccepted(c === true)} className="mt-0.5" />
            <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
              I agree to the{' '}
              <Link to="/privacy-policy" className="text-gold hover:underline" target="_blank">Privacy Policy</Link>{' '}
              and{' '}
              <Link to="/terms-of-service" className="text-gold hover:underline" target="_blank">Terms of Service</Link>.
            </label>
          </div>
        </StepShell>
      )}

      {/* Step 7 — Personalization Reveal */}
      {step === 7 && (
        <div className="flex flex-1 flex-col animate-fade-in">
          <div className="flex-1 flex flex-col justify-center">
            <p className="text-xs font-medium uppercase tracking-widest text-gold/60 mb-2 text-center">Step 8 of {TOTAL_STEPS}</p>
            <h1 className="font-serif text-3xl text-foreground mb-2 text-center">Your Spiritual Path is Ready</h1>
            <p className="text-sm text-muted-foreground mb-8 text-center">
              {displayName ? `${displayName}, your` : 'Your'} journey has been prepared.
            </p>

            <div className="rounded-2xl border border-gold/30 bg-gold/5 p-5 mb-4">
              <p className="text-xs uppercase tracking-widest text-gold/60 mb-1">Your guide</p>
              <p className="font-serif text-xl text-foreground">{saintObj.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{saintObj.desc}</p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 mb-4">
              <p className="text-xs uppercase tracking-widest text-gold/60 mb-2">Daily prayer rhythm</p>
              <ul className="space-y-1.5 text-sm text-foreground">
                <li>🌅 <span className="font-medium">Morning Lauds</span> · ~6:30 AM</li>
                <li>☀️ <span className="font-medium">Angelus</span> · 12:00 PM</li>
                <li>🌙 <span className="font-medium">Night Compline</span> · ~9:00 PM</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 mb-6">
              <p className="text-xs uppercase tracking-widest text-gold/60 mb-2">Growth focus</p>
              <p className="text-sm text-foreground">
                With guidance from <span className="text-gold">{saintObj.label}</span>, you'll build{' '}
                <span className="text-gold">{growthLabels.slice(0, 2).join(' and ').toLowerCase() || 'a deeper prayer life'}</span> through daily prayer.
              </p>
            </div>
          </div>

          <button
            disabled={saving}
            onClick={finishOnboardingAndGoToFirstPrayer}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold py-4 font-medium text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Begin First Prayer'}
          </button>
        </div>
      )}

      {/* Step 8 — First Prayer (emotional hook) */}
      {step === 8 && (
        <div className="flex flex-1 flex-col animate-fade-in">
          <div className="flex-1 flex flex-col justify-center text-center">
            <div className="mb-6 text-4xl">🕯️</div>
            <p className="text-xs font-medium uppercase tracking-widest text-gold/60 mb-2">A first breath</p>
            <h1 className="font-serif text-2xl text-foreground mb-6 leading-snug">
              "Be still, and know that I am God."
            </h1>
            <p className="text-sm text-muted-foreground italic mb-2">— Psalm 46:10</p>
            <div className="my-8 rounded-2xl border border-border bg-card p-6 text-left">
              <p className="font-serif text-base text-foreground leading-relaxed">
                {saintObj.label} greets you:
              </p>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                "Welcome{displayName ? `, ${displayName}` : ''}. The path you walk is not walked alone. Take one slow breath. Begin where you are. God is already here."
              </p>
            </div>
          </div>
          <button
            onClick={next}
            className="w-full rounded-xl bg-gold py-4 font-medium text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98]"
          >
            Continue
          </button>
        </div>
      )}

      {/* Step 9 — Soft handoff to paywall */}
      {step === 9 && (
        <div className="flex flex-1 flex-col items-center justify-center text-center animate-fade-in">
          <div className="mb-6 text-4xl">✨</div>
          <h1 className="font-serif text-2xl text-foreground mb-3">Your path begins now.</h1>
          <p className="text-sm text-muted-foreground max-w-xs mb-10">
            Continue with all of Ora — full Saint conversations, the prayer library, journal & examen, and progress insights.
          </p>
          <button
            onClick={() => navigate('/paywall', { replace: true })}
            className="w-full rounded-xl bg-gold py-4 font-medium text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98]"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
};

function StepShell({ children, onBack, onNext, disabled }: { children: React.ReactNode; onBack: () => void; onNext: () => void; disabled: boolean }) {
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
          Continue
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

function ChipCard({ active, onClick, label, emoji }: { active: boolean; onClick: () => void; label: string; emoji: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl border px-4 py-4 text-left transition-all active:scale-[0.97] ${
        active ? 'border-gold/60 bg-gold/10' : 'border-border bg-card hover:border-gold/20'
      }`}
    >
      <span className="text-xl">{emoji}</span>
      <span className="font-medium text-sm text-foreground">{label}</span>
    </button>
  );
}

export default Onboarding;
