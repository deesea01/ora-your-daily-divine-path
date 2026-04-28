import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { SPIRITUAL_GUIDES, SpiritualGuideKey } from '@/lib/guides';
import { SaintAvatar } from '@/components/SaintAvatar';
import { toast } from 'sonner';
import { useEntitlement, isPremiumGuide } from '@/hooks/useEntitlement';
import { UpgradePrompt } from '@/components/UpgradePrompt';
import SEO from '@/components/SEO';

const GUIDE_PREVIEWS: Record<string, { question: string; answer: string }> = {
  monk: {
    question: "I feel anxious about the future.",
    answer: "Take a breath. Return to the present moment — that is where God dwells. Say slowly: \"Lord, I trust in You.\" Repeat it until stillness settles. Anxiety pulls you forward; prayer draws you back to now.",
  },
  st_francis: {
    question: "I feel anxious about the future.",
    answer: "Dear friend, look at the birds — they do not worry about tomorrow, yet your Father feeds them. Let go of what you cannot carry. Be content with this moment, for it is a gift. Peace begins with trust.",
  },
  st_augustine: {
    question: "I feel anxious about the future.",
    answer: "I know this restlessness well — I lived in it for years. Your heart reaches for certainty it cannot grasp. But hear this: our hearts are restless until they rest in God. Let your anxiety become a prayer of longing.",
  },
  st_thomas_aquinas: {
    question: "I feel anxious about the future.",
    answer: "Anxiety arises when the mind attempts to control what belongs to Providence. Consider: God, who orders all things wisely, holds your future. Faith does not remove uncertainty — it provides a foundation to stand upon within it.",
  },
  st_teresa: {
    question: "I feel anxious about the future.",
    answer: "Come, let us go inward together. Close your eyes. God is not in the future — He is here, in the interior castle of your soul. Let nothing disturb you. All things pass, but God does not change. Patience obtains all things.",
  },
  st_michael: {
    question: "I feel anxious about the future.",
    answer: "Stand firm. Anxiety is not from God — it is a weapon of the enemy to paralyze you. You were not given a spirit of fear, but of power. Name the fear, face it, and take the next step with courage. God fights with you.",
  },
  st_padre_pio: {
    question: "I feel anxious about the future.",
    answer: "Pray, hope, and don't worry. Worry is useless — God knows your needs before you speak them. Offer your anxiety to Him as a small sacrifice, united to the Cross. He will carry what you cannot.",
  },
  st_joan_of_arc: {
    question: "I feel anxious about the future.",
    answer: "Do not be afraid. God has called you, and He does not abandon those He calls. Even when the path is dark and the voices of doubt are loud, trust that He who began this work in you will see it through. Be brave — He is with you.",
  },
};

const GuideSelect = () => {
  const navigate = useNavigate();
  const { profile, setGuide } = useUserProfile();
  const { isPremium } = useEntitlement();
  const current = (profile?.spiritual_guide || 'monk') as SpiritualGuideKey;
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const handleSelect = async (key: string) => {
    if (key === current) return;
    if (!isPremium && isPremiumGuide(key)) {
      setUpgradeOpen(true);
      return;
    }
    const result = await setGuide(key);
    if (!result?.error) {
      toast.success(`${SPIRITUAL_GUIDES[key as SpiritualGuideKey].label} is now your guide`);
    }
  };

  const togglePreview = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedKey(prev => (prev === key ? null : key));
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SEO title="Choose Your Spiritual Guide | Ora" description="Select your Catholic saint companion — from Francis of Assisi to Thérèse of Lisieux — to walk alongside your prayer life." canonicalPath="/guide" />
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
          {Object.entries(SPIRITUAL_GUIDES).map(([key, guide]) => {
            const preview = GUIDE_PREVIEWS[key];
            const isExpanded = expandedKey === key;

            return (
              <div key={key}
                className={`overflow-hidden rounded-xl border transition-all ${
                  key === current
                    ? 'border-gold/50 bg-gold/10'
                    : 'border-border bg-card'
                }`}
              >
                <button
                  onClick={() => handleSelect(key)}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left active:scale-[0.98]"
                >
                  <SaintAvatar guideKey={key as SpiritualGuideKey} size="sm" />
                  <div className="flex-1">
                    <p className="font-serif text-base font-medium text-foreground">{guide.label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{guide.era} · {guide.description}</p>
                  </div>
                  {key === current && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gold">
                      <Check className="h-3.5 w-3.5 text-primary-foreground" />
                    </div>
                  )}
                  {key !== current && !isPremium && isPremiumGuide(key) && (
                    <Lock className="h-4 w-4 text-gold/70" />
                  )}
                </button>

                {preview && (
                  <>
                    <button
                      onClick={(e) => togglePreview(key, e)}
                      className="flex w-full items-center gap-1.5 px-5 pb-3 pt-0 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      <span>{isExpanded ? 'Hide' : 'Preview'} example response</span>
                    </button>

                    <div
                      className="grid transition-all duration-300 ease-out"
                      style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr' }}
                    >
                      <div className="overflow-hidden">
                        <div className={`mx-5 mb-4 rounded-lg border border-border bg-background p-4 space-y-3 transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                          {/* Bio section */}
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {guide.biography}
                          </p>
                          <div className="flex flex-wrap gap-2 text-[10px]">
                            <span className="rounded-full bg-gold/10 px-2 py-0.5 text-gold">{guide.prayerSpecialty.split(',')[0]}</span>
                          </div>
                          <hr className="border-border" />
                          {/* Preview conversation */}
                          <p className="text-xs font-medium text-muted-foreground italic">
                            "{preview.question}"
                          </p>
                          <p className="text-sm text-foreground leading-relaxed">
                            {preview.answer}
                          </p>
                          <p className="text-[10px] text-muted-foreground/60 italic">
                            {guide.disclaimer}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default GuideSelect;
