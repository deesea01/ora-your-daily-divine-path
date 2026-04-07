import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useNavigate } from 'react-router-dom';
import { LogOut, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import PrayerCard from '@/components/PrayerCard';

const prayers = [
  { title: 'Morning Lauds', subtitle: 'Start your day in grace', time: 'morning' as const },
  { title: 'Midday Angelus', subtitle: 'Pause and remember', time: 'midday' as const },
  { title: 'Night Compline', subtitle: 'Rest in His peace', time: 'night' as const },
];

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [completions, setCompletions] = useState<Set<string>>(new Set());

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
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen bg-background px-6 pb-8 pt-safe">
      {/* Header */}
      <header className="flex items-center justify-between pb-8 pt-6 animate-fade-in">
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

      {/* Talk to a Monk */}
      <section className="animate-fade-in-delay-3">
        <button onClick={() => navigate('/monk-chat')} className="group w-full rounded-xl border border-gold/20 bg-card p-5 text-left transition-all hover:border-gold/40 hover:glow-gold active:scale-[0.98]">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold/10">
              <MessageCircle className="h-5 w-5 text-gold" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-medium text-foreground">Talk to a Monk</h3>
              <p className="text-sm text-muted-foreground">Spiritual guidance, anytime</p>
            </div>
          </div>
        </button>
      </section>
    </div>
  );
};

export default Index;
