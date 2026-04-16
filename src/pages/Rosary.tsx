import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, ChevronLeft, Loader2, Cross, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSaintVoice } from '@/hooks/useSaintVoice';
import { SpiritualGuideKey } from '@/lib/guides';
import { useUserProfile } from '@/hooks/useUserProfile';
import { notifyAdminError } from '@/lib/notifyAdmin';

const MYSTERIES: Record<string, { label: string; names: string[] }> = {
  joyful: {
    label: 'Joyful',
    names: ['The Annunciation', 'The Visitation', 'The Nativity of Jesus', 'The Presentation in the Temple', 'The Finding of Jesus in the Temple'],
  },
  sorrowful: {
    label: 'Sorrowful',
    names: ['The Agony in the Garden', 'The Scourging at the Pillar', 'The Crowning with Thorns', 'The Carrying of the Cross', 'The Crucifixion and Death of Jesus'],
  },
  glorious: {
    label: 'Glorious',
    names: ['The Resurrection', 'The Ascension', 'The Descent of the Holy Spirit', 'The Assumption of Mary', 'The Coronation of Mary'],
  },
  luminous: {
    label: 'Luminous',
    names: ['The Baptism of Jesus', 'The Wedding at Cana', 'The Proclamation of the Kingdom', 'The Transfiguration', 'The Institution of the Eucharist'],
  },
};

const PRAYERS = {
  signOfCross: `In the name of the Father, and of the Son, and of the Holy Spirit. Amen.`,
  apostlesCreed: `I believe in God, the Father Almighty, Creator of heaven and earth; and in Jesus Christ, His only Son, our Lord; who was conceived by the Holy Spirit, born of the Virgin Mary; suffered under Pontius Pilate, was crucified, died, and was buried. He descended into hell; the third day He rose again from the dead; He ascended into heaven, and is seated at the right hand of God the Father Almighty; from thence He shall come to judge the living and the dead. I believe in the Holy Spirit, the Holy Catholic Church, the communion of Saints, the forgiveness of sins, the resurrection of the body, and life everlasting. Amen.`,
  ourFather: `Our Father, who art in heaven, hallowed be Thy name; Thy kingdom come; Thy will be done on earth as it is in heaven. Give us this day our daily bread; and forgive us our trespasses as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.`,
  hailMary: `Hail Mary, full of grace, the Lord is with thee. Blessed art thou amongst women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.`,
  gloryBe: `Glory be to the Father, and to the Son, and to the Holy Spirit, as it was in the beginning, is now, and ever shall be, world without end. Amen.`,
  fatimaPrayer: `O my Jesus, forgive us our sins, save us from the fires of hell. Lead all souls to Heaven, especially those in most need of Thy mercy. Amen.`,
  hailHolyQueen: `Hail, Holy Queen, Mother of Mercy, our life, our sweetness, and our hope. To thee do we cry, poor banished children of Eve. To thee do we send up our sighs, mourning and weeping in this valley of tears. Turn then, most gracious Advocate, thine eyes of mercy toward us, and after this our exile, show unto us the blessed fruit of thy womb, Jesus. O clement, O loving, O sweet Virgin Mary. Pray for us, O Holy Mother of God, that we may be made worthy of the promises of Christ. Amen.`,
};

type StepType =
  | { kind: 'intro' }
  | { kind: 'openingOurFather' }
  | { kind: 'openingHailMarys' }
  | { kind: 'openingGloryBe' }
  | { kind: 'mystery'; decade: number }
  | { kind: 'decadeOurFather'; decade: number }
  | { kind: 'decadeHailMarys'; decade: number }
  | { kind: 'decadeGloryBe'; decade: number }
  | { kind: 'fatimaPrayer'; decade: number }
  | { kind: 'closing' };

function buildSteps(): StepType[] {
  const steps: StepType[] = [
    { kind: 'intro' },
    { kind: 'openingOurFather' },
    { kind: 'openingHailMarys' },
    { kind: 'openingGloryBe' },
  ];
  for (let d = 0; d < 5; d++) {
    steps.push(
      { kind: 'mystery', decade: d },
      { kind: 'decadeOurFather', decade: d },
      { kind: 'decadeHailMarys', decade: d },
      { kind: 'decadeGloryBe', decade: d },
      { kind: 'fatimaPrayer', decade: d },
    );
  }
  steps.push({ kind: 'closing' });
  return steps;
}

const ALL_STEPS = buildSteps();

function getPrayerTextForStep(
  step: StepType,
  prayers: typeof PRAYERS,
  mysteries?: { label: string; names: string[] },
  beadCount?: number,
  explanation?: string
): string {
  switch (step.kind) {
    case 'intro': return `${prayers.signOfCross} ${prayers.apostlesCreed}`;
    case 'openingOurFather': case 'decadeOurFather': return prayers.ourFather;
    case 'openingHailMarys': case 'decadeHailMarys': return prayers.hailMary;
    case 'openingGloryBe': case 'decadeGloryBe': return prayers.gloryBe;
    case 'fatimaPrayer': return prayers.fatimaPrayer;
    case 'closing': return `${prayers.hailHolyQueen} ${prayers.signOfCross}`;
    case 'mystery':
      const name = mysteries?.names[step.decade] || '';
      return explanation ? `${name}. ${explanation}` : name;
    default: return '';
  }
}

// Suggest a mystery set based on day of week (traditional assignment)
function suggestedSet(): string {
  const day = new Date().getDay();
  if (day === 1 || day === 6) return 'joyful'; // Mon, Sat
  if (day === 2 || day === 5) return 'sorrowful'; // Tue, Fri
  if (day === 3 || day === 0) return 'glorious'; // Wed, Sun
  return 'luminous'; // Thu
}

const Rosary = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile } = useUserProfile();
  const [mysterySet, setMysterySet] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [beadCount, setBeadCount] = useState(0);
  const [mysteryExplanation, setMysteryExplanation] = useState('');
  const [loadingMystery, setLoadingMystery] = useState(false);
  const guideKey = (profile?.spiritual_guide as SpiritualGuideKey) || 'monk';
  const { isSpeaking, isEnabled, play, stop, toggle } = useSaintVoice(guideKey);

  const step = ALL_STEPS[stepIndex];
  const progress = ((stepIndex + 1) / ALL_STEPS.length) * 100;

  // Fetch AI mystery explanation
  useEffect(() => {
    if (!mysterySet || step.kind !== 'mystery') return;
    setLoadingMystery(true);
    setMysteryExplanation('');

    const fetchExplanation = async () => {
      try {
        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
        const { data: { session } } = await supabase.auth.getSession();
        const accessToken = session?.access_token;
        if (!accessToken) return;

        const res = await fetch(
          `https://${projectId}.supabase.co/functions/v1/rosary-mystery`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              mysterySet,
              decadeIndex: step.decade,
              preferences: profile ? { seeking: profile.seeking, experience_level: profile.experience_level, spiritual_guide: profile.spiritual_guide } : undefined,
            }),
          }
        );
        if (res.ok) {
          const data = await res.json();
          setMysteryExplanation(data.explanation || '');
        }
      } catch (err: any) {
        console.error('Rosary mystery error:', err);
        notifyAdminError('rosary-mystery', err?.message || String(err), user?.id, { mysterySet, stepIndex });
        setMysteryExplanation('Peace be with you. Take a moment to pray quietly and reflect.');
      } finally {
        setLoadingMystery(false);
      }
    };
    fetchExplanation();
  }, [mysterySet, stepIndex]);

  // Auto-read prayer text when step changes and audio is enabled
  useEffect(() => {
    if (!isEnabled || !mysterySet) return;
    const prayerText = getPrayerTextForStep(step, PRAYERS, mysterySet ? MYSTERIES[mysterySet] : undefined, beadCount, mysteryExplanation);
    if (prayerText) play(prayerText, 'prayer');
  }, [stepIndex, beadCount, isEnabled, mysteryExplanation]);

  const goNext = () => {
    stop();
    if (step.kind === 'decadeHailMarys' || step.kind === 'openingHailMarys') {
      const max = step.kind === 'openingHailMarys' ? 3 : 10;
      if (beadCount < max - 1) {
        setBeadCount((b) => b + 1);
        return;
      }
    }
    setBeadCount(0);
    if (stepIndex < ALL_STEPS.length - 1) setStepIndex((i) => i + 1);
  };

  const goPrev = () => {
    stop();
    setBeadCount(0);
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;

  // Mystery set picker
  if (!mysterySet) {
    const suggested = suggestedSet();
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
          <h1 className="font-serif text-lg font-medium text-foreground">Holy Rosary</h1>
        </header>
        <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/10">
            <Cross className="h-7 w-7 text-gold" />
          </div>
          <div className="text-center">
            <h2 className="font-serif text-xl text-foreground">Choose Your Mysteries</h2>
            <p className="mt-1 text-sm text-muted-foreground">Today's suggestion: <span className="text-gold">{MYSTERIES[suggested].label}</span></p>
          </div>
          <div className="grid w-full max-w-xs gap-3">
            {Object.entries(MYSTERIES).map(([key, val]) => (
              <button
                key={key}
                onClick={() => setMysterySet(key)}
                className={`rounded-xl border px-5 py-4 text-left transition-all active:scale-[0.98] ${
                  key === suggested
                    ? 'border-gold/40 bg-gold/5 hover:border-gold/60'
                    : 'border-border bg-card hover:border-gold/30'
                }`}
              >
                <p className="font-serif text-base font-medium text-foreground">{val.label} Mysteries</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{val.names[0]}, {val.names[1]}…</p>
              </button>
            ))}
          </div>
        </main>
      </div>
    );
  }

  const mysteries = MYSTERIES[mysterySet];

  const renderStepContent = () => {
    switch (step.kind) {
      case 'intro':
        return (
          <div className="space-y-6">
            <p className="text-xs font-medium uppercase tracking-widest text-gold/60">Opening</p>
            <h2 className="font-serif text-xl text-gold">Sign of the Cross</h2>
            <p className="leading-relaxed text-foreground/90">{PRAYERS.signOfCross}</p>
            <h2 className="mt-4 font-serif text-xl text-gold">Apostles' Creed</h2>
            <p className="leading-relaxed text-foreground/90">{PRAYERS.apostlesCreed}</p>
          </div>
        );
      case 'openingOurFather':
        return (
          <div className="space-y-4">
            <p className="text-xs font-medium uppercase tracking-widest text-gold/60">Opening</p>
            <h2 className="font-serif text-xl text-gold">Our Father</h2>
            <p className="leading-relaxed text-foreground/90">{PRAYERS.ourFather}</p>
          </div>
        );
      case 'openingHailMarys':
        return (
          <div className="space-y-4">
            <p className="text-xs font-medium uppercase tracking-widest text-gold/60">Opening · Hail Mary {beadCount + 1} of 3</p>
            <h2 className="font-serif text-xl text-gold">Hail Mary</h2>
            <p className="leading-relaxed text-foreground/90">{PRAYERS.hailMary}</p>
            <BeadIndicator current={beadCount} total={3} />
          </div>
        );
      case 'openingGloryBe':
        return (
          <div className="space-y-4">
            <p className="text-xs font-medium uppercase tracking-widest text-gold/60">Opening</p>
            <h2 className="font-serif text-xl text-gold">Glory Be</h2>
            <p className="leading-relaxed text-foreground/90">{PRAYERS.gloryBe}</p>
          </div>
        );
      case 'mystery':
        return (
          <div className="space-y-4">
            <p className="text-xs font-medium uppercase tracking-widest text-gold/60">
              {mysteries.label} Mysteries · Decade {step.decade + 1}
            </p>
            <h2 className="font-serif text-xl text-gold">{mysteries.names[step.decade]}</h2>
            {loadingMystery ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">The monk is reflecting…</span>
              </div>
            ) : mysteryExplanation ? (
              <div className="rounded-xl border border-gold/20 bg-gold/5 p-4">
                <p className="text-sm italic leading-relaxed text-foreground/80">{mysteryExplanation}</p>
              </div>
            ) : null}
          </div>
        );
      case 'decadeOurFather':
        return (
          <div className="space-y-4">
            <p className="text-xs font-medium uppercase tracking-widest text-gold/60">Decade {step.decade + 1} · {mysteries.names[step.decade]}</p>
            <h2 className="font-serif text-xl text-gold">Our Father</h2>
            <p className="leading-relaxed text-foreground/90">{PRAYERS.ourFather}</p>
          </div>
        );
      case 'decadeHailMarys':
        return (
          <div className="space-y-4">
            <p className="text-xs font-medium uppercase tracking-widest text-gold/60">Decade {step.decade + 1} · Hail Mary {beadCount + 1} of 10</p>
            <h2 className="font-serif text-xl text-gold">Hail Mary</h2>
            <p className="leading-relaxed text-foreground/90">{PRAYERS.hailMary}</p>
            <BeadIndicator current={beadCount} total={10} />
          </div>
        );
      case 'decadeGloryBe':
        return (
          <div className="space-y-4">
            <p className="text-xs font-medium uppercase tracking-widest text-gold/60">Decade {step.decade + 1}</p>
            <h2 className="font-serif text-xl text-gold">Glory Be</h2>
            <p className="leading-relaxed text-foreground/90">{PRAYERS.gloryBe}</p>
          </div>
        );
      case 'fatimaPrayer':
        return (
          <div className="space-y-4">
            <p className="text-xs font-medium uppercase tracking-widest text-gold/60">Decade {step.decade + 1}</p>
            <h2 className="font-serif text-xl text-gold">Fatima Prayer</h2>
            <p className="leading-relaxed text-foreground/90">{PRAYERS.fatimaPrayer}</p>
          </div>
        );
      case 'closing':
        return (
          <div className="space-y-6">
            <p className="text-xs font-medium uppercase tracking-widest text-gold/60">Closing</p>
            <h2 className="font-serif text-xl text-gold">Hail, Holy Queen</h2>
            <p className="leading-relaxed text-foreground/90">{PRAYERS.hailHolyQueen}</p>
            <h2 className="mt-4 font-serif text-xl text-gold">Sign of the Cross</h2>
            <p className="leading-relaxed text-foreground/90">{PRAYERS.signOfCross}</p>
          </div>
        );
    }
  };

  const isLast = stepIndex === ALL_STEPS.length - 1;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="text-center">
            <p className="font-serif text-sm font-medium text-foreground">Holy Rosary</p>
            <p className="text-xs text-muted-foreground">{mysteries.label} Mysteries</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
                isEnabled
                  ? 'border-gold/40 bg-gold/10 text-gold'
                  : 'border-border text-muted-foreground hover:text-foreground'
              }`}
              aria-label={isEnabled ? 'Disable audio' : 'Enable audio'}
            >
              {isEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            <div className="w-9" />
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-gold transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {/* Content */}
      <main className="flex flex-1 flex-col justify-center px-6 py-8 animate-fade-in" key={`${stepIndex}-${beadCount}`}>
        {renderStepContent()}
      </main>

      {/* Navigation */}
      <footer className="sticky bottom-0 flex items-center gap-3 border-t border-border bg-background/80 px-6 py-4 backdrop-blur-md">
        <button
          onClick={goPrev}
          disabled={stepIndex === 0}
          className="flex h-12 w-12 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={isLast ? () => navigate('/') : goNext}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-gold font-medium text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98]"
        >
          <span>{isLast ? 'Finish' : 'Continue'}</span>
          {!isLast && <ChevronRight className="h-4 w-4" />}
        </button>
      </footer>
    </div>
  );
};

const BeadIndicator = ({ current, total }: { current: number; total: number }) => (
  <div className="flex items-center justify-center gap-1.5 pt-2">
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
          i <= current ? 'bg-gold scale-110' : 'bg-secondary'
        }`}
      />
    ))}
  </div>
);

export default Rosary;
