import { useState, useEffect } from 'react';
import logoImg from '@/assets/logo.png';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useNavigate } from 'react-router-dom';
import { MessageCircle, Cross, Flame, ChevronRight, Heart, Shield, BookOpen, PenLine, Settings, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/useUserProfile';
import { SPIRITUAL_GUIDES, SpiritualGuideKey } from '@/lib/guides';
import { useLanguage } from '@/contexts/LanguageContext';
import { useWeeklyRecaps } from '@/hooks/useWeeklyRecaps';
import { useEntitlement } from '@/hooks/useEntitlement';

import PrayerCard from '@/components/PrayerCard';
import SEO from '@/components/SEO';
import FaithJourneyCard from '@/components/FaithJourneyCard';
import SaintCompanionsCarousel from '@/components/SaintCompanionsCarousel';
import TodaysPrayerPath from '@/components/TodaysPrayerPath';

function computeStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const unique = [...new Set(dates)].sort().reverse();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const mostRecent = new Date(unique[0] + 'T00:00:00');
  const diffFromToday = Math.floor((today.getTime() - mostRecent.getTime()) / 86400000);
  if (diffFromToday > 1) return 0;
  let streak = 1;
  for (let i = 0; i < unique.length - 1; i++) {
    const curr = new Date(unique[i] + 'T00:00:00');
    const prev = new Date(unique[i + 1] + 'T00:00:00');
    const diff = Math.floor((curr.getTime() - prev.getTime()) / 86400000);
    if (diff === 1) { streak++; } else { break; }
  }
  return streak;
}

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { profile, loading: profileLoading, setDailyPrayerGoal } = useUserProfile();
  const { t, language } = useLanguage();
  const { latest: latestRecap } = useWeeklyRecaps();
  const { isPremium, loading: entLoading } = useEntitlement();
  const [completions, setCompletions] = useState<Set<string>>(new Set());
  const [streak, setStreak] = useState(0);
  const [showGoalPicker, setShowGoalPicker] = useState(false);

  useEffect(() => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    supabase
      .from('prayer_completions')
      .select('prayer_type')
      .eq('user_id', user.id)
      .eq('prayer_date', today)
      .then(({ data }) => {
        if (data) setCompletions(new Set(data.map((d: any) => d.prayer_type)));
      });
    supabase
      .from('prayer_completions')
      .select('prayer_date, prayer_type')
      .eq('user_id', user.id)
      .order('prayer_date', { ascending: false })
      .limit(500)
      .then(({ data }) => {
        if (!data) return;
        const uniqueDays = [...new Set(data.map((r: any) => r.prayer_date))];
        setStreak(computeStreak(uniqueDays));
      });
  }, [user]);

  if (loading || profileLoading || entLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/welcome" replace />;
  if (!profile?.onboarding_completed) return <Navigate to="/onboarding" replace />;
  if (!isPremium) return <Navigate to="/paywall" replace />;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t.goodMorning : hour < 17 ? t.goodAfternoon : t.goodEvening;
  const dailyGoal = profile?.daily_prayer_goal || 3;
  const todayCompleted = completions.size;
  const guideKey = (profile?.spiritual_guide || 'monk') as SpiritualGuideKey;
  const guideData = SPIRITUAL_GUIDES[guideKey];

  const allPrayers = [
    { title: t.morningLauds, subtitle: t.morningLaudsDesc, time: 'morning' as const },
    { title: t.middayAngelus, subtitle: t.middayAngelusDesc, time: 'midday' as const },
    { title: t.nightCompline, subtitle: t.nightComplineDesc, time: 'night' as const },
  ];
  const prayers = allPrayers.slice(0, dailyGoal);

  const locale = language === 'tl' ? 'fil' : language;

  return (
    <div className="min-h-screen bg-background px-6 pb-8 pt-safe">
      <SEO title="Ora — Daily Catholic Prayer App for Devotion, Rosary & Saints" description="Your personalized daily devotion: Catholic prayers, the rosary, the saints, Examen, and reflections to help you grow closer to God." canonicalPath="/" />
      <header className="flex items-center justify-between pb-6 pt-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <img src={logoImg} alt="Ora" className="w-10 h-10 object-contain" />
          <div>
            <p className="text-sm text-muted-foreground">{greeting}{profile?.display_name ? `, ${profile.display_name}` : ''}</p>
            <h1 className="font-serif text-2xl font-light text-foreground">Ora</h1>
          </div>
        </div>
        <button
          onClick={() => navigate('/settings')}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground hover:border-gold/30"
          aria-label="Settings"
        >
          <Settings className="h-4 w-4" />
        </button>
      </header>

      <section className="mb-8 animate-fade-in">
        <div className="rounded-xl border border-gold/20 bg-card p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${streak > 0 ? 'bg-gold/15' : 'bg-secondary'}`}>
                <Flame className={`h-6 w-6 ${streak > 0 ? 'text-gold' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <p className="font-serif text-2xl font-medium text-foreground">
                  {streak} <span className="text-base font-normal text-muted-foreground">{streak === 1 ? t.day : t.days}</span>
                </p>
                <p className="text-xs text-muted-foreground">{t.prayerStreak}</p>
              </div>
            </div>
            <div className="text-right">
              <button
                onClick={() => setShowGoalPicker(!showGoalPicker)}
                className="text-sm font-medium text-foreground hover:text-gold transition-colors"
              >
                {todayCompleted}/{dailyGoal}
              </button>
              <p className="text-xs text-muted-foreground">{t.today}</p>
            </div>
          </div>
          <div className="mt-4 flex gap-1.5">
            {prayers.map((p) => (
              <div
                key={p.time}
                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                  completions.has(p.time) ? 'bg-gold' : 'bg-secondary'
                }`}
              />
            ))}
          </div>
          {showGoalPicker && (
            <div className="mt-3 flex items-center justify-between rounded-lg border border-border bg-background p-3 animate-fade-in">
              <p className="text-xs text-muted-foreground">{t.dailyPrayerGoal || 'Daily prayer goal'}</p>
              <div className="flex gap-2">
                {[1, 2, 3].map((g) => (
                  <button
                    key={g}
                    onClick={async () => { await setDailyPrayerGoal(g); setShowGoalPicker(false); }}
                    className={`h-8 w-8 rounded-full border text-xs font-medium transition-all ${
                      dailyGoal === g
                        ? 'border-gold bg-gold/20 text-gold'
                        : 'border-border text-muted-foreground hover:border-gold/30'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <FaithJourneyCard streak={streak} />

      {latestRecap && (
        <section className="mb-8 animate-fade-in">
          <button
            onClick={() => navigate('/recap')}
            className="group w-full overflow-hidden rounded-xl border border-gold/30 bg-gradient-to-br from-gold/10 via-card to-card p-5 text-left transition-all hover:border-gold/60 active:scale-[0.98]"
          >
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-gold">
              <Sparkles className="h-3 w-3" /> Your week with God
            </div>
            <h3 className="mt-2 font-serif text-xl text-foreground">{latestRecap.headline || 'Your weekly recap is ready'}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Tap to play your story →
            </p>
          </button>
        </section>
      )}

      <TodaysPrayerPath completions={completions} />

      <div className="mb-8 flex items-center gap-3 animate-fade-in-delay-3">
        <div className="h-px flex-1 bg-border" />
        <img src={logoImg} alt="Ora" className="w-6 h-6 object-contain opacity-40 animate-pulse-soft" />
        <div className="h-px flex-1 bg-border" />
      </div>

      <section className="mb-4 animate-fade-in-delay-3">
        <button onClick={() => navigate('/rosary')} className="group w-full rounded-xl border border-gold/20 bg-card p-5 text-left transition-all hover:border-gold/40 hover:glow-gold active:scale-[0.98]">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold/10">
              <Cross className="h-5 w-5 text-gold" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-medium text-foreground">{t.holyRosary}</h3>
              <p className="text-sm text-muted-foreground">{t.holyRosaryDesc}</p>
            </div>
          </div>
        </button>
      </section>

      <section className="mb-4 animate-fade-in-delay-3">
        <button onClick={() => navigate('/prayer-library')} className="group w-full rounded-xl border border-gold/20 bg-card p-5 text-left transition-all hover:border-gold/40 hover:glow-gold active:scale-[0.98]">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold/10">
              <BookOpen className="h-5 w-5 text-gold" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-medium text-foreground">{t.prayerLibrary}</h3>
              <p className="text-sm text-muted-foreground">{t.prayerLibraryDesc}</p>
            </div>
          </div>
        </button>
      </section>

      <section className="mb-4 animate-fade-in-delay-3">
        <button onClick={() => navigate('/journal')} className="group w-full rounded-xl border border-gold/20 bg-card p-5 text-left transition-all hover:border-gold/40 hover:glow-gold active:scale-[0.98]">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold/10">
              <PenLine className="h-5 w-5 text-gold" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-medium text-foreground">Spiritual Journal</h3>
              <p className="text-sm text-muted-foreground">Reflect, give thanks, and grow closer to God</p>
            </div>
          </div>
        </button>
      </section>

      <section className="mb-4 animate-fade-in-delay-3">
        <button onClick={() => navigate('/confession')} className="group w-full rounded-xl border border-gold/20 bg-card p-5 text-left transition-all hover:border-gold/40 hover:glow-gold active:scale-[0.98]">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold/10">
              <Shield className="h-5 w-5 text-gold" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-medium text-foreground">{t.confessionTracker}</h3>
              <p className="text-sm text-muted-foreground">{t.confessionTrackerDesc}</p>
            </div>
          </div>
        </button>
      </section>

      <section className="mb-4 animate-fade-in-delay-3">
        <button onClick={() => navigate('/monk-chat')} className="group w-full rounded-xl border border-gold/20 bg-card p-5 text-left transition-all hover:border-gold/40 hover:glow-gold active:scale-[0.98]">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold/10">
              <MessageCircle className="h-5 w-5 text-gold" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-medium text-foreground">
                {t.talkTo} {guideData.label}
              </h3>
              <p className="text-sm text-muted-foreground">{t.spiritualGuidance}</p>
            </div>
          </div>
        </button>
      </section>

      <section className="mb-4 animate-fade-in-delay-3">
        <button onClick={() => navigate('/guide')} className="group w-full rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-gold/20 active:scale-[0.98]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">{guideData.emoji}</span>
              <div>
                <p className="text-sm font-medium text-foreground">{t.yourGuide}: {guideData.label}</p>
                <p className="text-xs text-muted-foreground">{guideData.description}</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </button>
      </section>

      <SaintCompanionsCarousel />

      <section className="animate-fade-in-delay-3">
        <button onClick={() => navigate('/impact')} className="group w-full rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-gold/20 active:scale-[0.98]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/10">
                <Heart className="h-4 w-4 text-gold" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{t.impact}</p>
                <p className="text-xs text-muted-foreground">{t.impactDesc}</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </button>
      </section>
    </div>
  );
};

export default Index;
