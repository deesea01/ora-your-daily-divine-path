import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useNavigate } from 'react-router-dom';
import { LogOut, MessageCircle, Cross, Flame, ChevronRight, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/useUserProfile';
import { SPIRITUAL_GUIDES, SpiritualGuideKey } from '@/lib/guides';
import PrayerCard from '@/components/PrayerCard';

const prayers = [
  { title: 'Morning Lauds', subtitle: 'Start your day in grace', time: 'morning' as const },
  { title: 'Midday Angelus', subtitle: 'Pause and remember', time: 'midday' as const },
  { title: 'Night Compline', subtitle: 'Rest in His peace', time: 'night' as const },
];

function computeStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const unique = [...new Set(dates)].sort().reverse();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if the most recent completed day is today or yesterday
  const mostRecent = new Date(unique[0] + 'T00:00:00');
  const diffFromToday = Math.floor((today.getTime() - mostRecent.getTime()) / 86400000);
  if (diffFromToday > 1) return 0;

  let streak = 1;
  for (let i = 0; i < unique.length - 1; i++) {
    const curr = new Date(unique[i] + 'T00:00:00');
    const prev = new Date(unique[i + 1] + 'T00:00:00');
    const diff = Math.floor((curr.getTime() - prev.getTime()) / 86400000);
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useUserProfile();
  const [completions, setCompletions] = useState<Set<string>>(new Set());
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];

    // Fetch today's completions
    supabase
      .from('prayer_completions')
      .select('prayer_type')
      .eq('user_id', user.id)
      .eq('prayer_date', today)
      .then(({ data }) => {
        if (data) setCompletions(new Set(data.map((d: any) => d.prayer_type)));
      });

    // Fetch dates where all 3 prayers were completed for streak calculation
    supabase
      .from('prayer_completions')
      .select('prayer_date, prayer_type')
      .eq('user_id', user.id)
      .order('prayer_date', { ascending: false })
      .limit(500)
      .then(({ data }) => {
        if (!data) return;
        // Any prayer on a given day counts toward the streak
        const uniqueDays = [...new Set(data.map((r: any) => r.prayer_date))];
        setStreak(computeStreak(uniqueDays));
      });
  }, [user]);

  if (loading || profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (!profile?.onboarding_completed) return <Navigate to="/onboarding" replace />;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const todayCompleted = completions.size;
  const guideKey = (profile?.spiritual_guide || 'monk') as SpiritualGuideKey;
  const guideData = SPIRITUAL_GUIDES[guideKey];

  return (
    <div className="min-h-screen bg-background px-6 pb-8 pt-safe">
      {/* Header */}
      <header className="flex items-center justify-between pb-6 pt-6 animate-fade-in">
        <div>
          <p className="text-sm text-muted-foreground">{greeting}</p>
          <h1 className="font-serif text-2xl font-light text-foreground">Ora</h1>
        </div>
        <button
          onClick={signOut}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground hover:border-gold/30"
          aria-label="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </header>

      {/* Streak + Progress Card */}
      <section className="mb-8 animate-fade-in">
        <div className="rounded-xl border border-gold/20 bg-card p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${streak > 0 ? 'bg-gold/15' : 'bg-secondary'}`}>
                <Flame className={`h-6 w-6 ${streak > 0 ? 'text-gold' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <p className="font-serif text-2xl font-medium text-foreground">
                  {streak} <span className="text-base font-normal text-muted-foreground">{streak === 1 ? 'day' : 'days'}</span>
                </p>
                <p className="text-xs text-muted-foreground">Prayer streak</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{todayCompleted}/3</p>
              <p className="text-xs text-muted-foreground">today</p>
            </div>
          </div>
          {/* Mini progress bar */}
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
        </div>
      </section>

      {/* Prayer Path */}
      <section className="mb-8">
        <h2 className="mb-1 font-serif text-xl text-gold animate-fade-in">Today's Prayer Path</h2>
        <p className="mb-5 text-sm text-muted-foreground animate-fade-in">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>

        <div className="space-y-3">
          {prayers.map((prayer, i) => (
            <PrayerCard key={prayer.time} {...prayer} index={i} completed={completions.has(prayer.time)} />
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="mb-8 flex items-center gap-3 animate-fade-in-delay-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-gold/40 animate-pulse-soft">✝</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Holy Rosary */}
      <section className="mb-4 animate-fade-in-delay-3">
        <button onClick={() => navigate('/rosary')} className="group w-full rounded-xl border border-gold/20 bg-card p-5 text-left transition-all hover:border-gold/40 hover:glow-gold active:scale-[0.98]">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold/10">
              <Cross className="h-5 w-5 text-gold" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-medium text-foreground">Holy Rosary</h3>
              <p className="text-sm text-muted-foreground">Guided decade by decade</p>
            </div>
          </div>
        </button>
      </section>

      {/* Talk to a Monk / Guide */}
      <section className="mb-4 animate-fade-in-delay-3">
        <button onClick={() => navigate('/monk-chat')} className="group w-full rounded-xl border border-gold/20 bg-card p-5 text-left transition-all hover:border-gold/40 hover:glow-gold active:scale-[0.98]">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold/10">
              <MessageCircle className="h-5 w-5 text-gold" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-medium text-foreground">
                Talk to {guideData.label}
              </h3>
              <p className="text-sm text-muted-foreground">Spiritual guidance, anytime</p>
            </div>
          </div>
        </button>
      </section>

      {/* Spiritual Guide Picker */}
      <section className="mb-4 animate-fade-in-delay-3">
        <button onClick={() => navigate('/guide')} className="group w-full rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-gold/20 active:scale-[0.98]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">{guideData.emoji}</span>
              <div>
                <p className="text-sm font-medium text-foreground">Your Guide: {guideData.label}</p>
                <p className="text-xs text-muted-foreground">{guideData.description}</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </button>
      </section>

      {/* Impact */}
      <section className="animate-fade-in-delay-3">
        <button onClick={() => navigate('/impact')} className="group w-full rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-gold/20 active:scale-[0.98]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/10">
                <Heart className="h-4 w-4 text-gold" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Impact</p>
                <p className="text-xs text-muted-foreground">See how your subscription gives back</p>
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
