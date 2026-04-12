import { useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft, Flame, PenLine, Heart, Crosshair, Trophy, AlertCircle, ChevronRight, Shield, BookOpen, TrendingUp, Calendar, Target, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useJournal } from '@/hooks/useJournal';
import { useSpiritualGrowth } from '@/hooks/useSpiritualGrowth';
import { getDailyPrompt, EMOTIONAL_STATES } from '@/lib/journalData';

const JournalHome = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { entries, streak, todayEntry, hasExamenToday, settings, loading } = useJournal();
  const { analyses, weeklyReport, growthPlan, hasEnoughForPatterns, entryCount } = useSpiritualGrowth();

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;

  const dailyPrompt = getDailyPrompt();
  const recentEntries = entries.slice(0, 5);

  // Mood trend (last 7 entries)
  const moodTrend = entries.slice(0, 7).map(e => e.emotional_state).filter(Boolean);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border px-4 py-4">
        <button onClick={() => navigate('/')} className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground" aria-label="Back">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="font-serif text-lg font-medium text-foreground">Spiritual Journal</h1>
        <div className="ml-auto flex gap-2">
          <button onClick={() => navigate('/journal/insights')} className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground" aria-label="Insights">
            <BookOpen className="h-4 w-4" />
          </button>
          <button onClick={() => navigate('/journal/privacy')} className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground" aria-label="Privacy">
            <Shield className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
        {/* Status card */}
        <div className="rounded-xl border border-gold/20 bg-card p-5 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${streak > 0 ? 'bg-gold/15' : 'bg-secondary'}`}>
                <Flame className={`h-5 w-5 ${streak > 0 ? 'text-gold' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <p className="font-serif text-2xl font-medium text-foreground">
                  {streak} <span className="text-base font-normal text-muted-foreground">{streak === 1 ? 'day' : 'days'}</span>
                </p>
                <p className="text-xs text-muted-foreground">Journal streak</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{entries.length}</p>
              <p className="text-xs text-muted-foreground">total entries</p>
            </div>
          </div>
          {todayEntry ? (
            <p className="mt-3 text-xs text-gold">✓ You've journaled today</p>
          ) : (
            <p className="mt-3 text-xs text-muted-foreground">You haven't journaled today yet</p>
          )}
        </div>

        {/* Daily prompt */}
        <div className="rounded-xl border border-gold/20 bg-card p-4 animate-fade-in">
          <p className="text-[10px] text-gold uppercase tracking-wider mb-2">Today's Prompt</p>
          <p className="font-serif text-sm text-foreground italic leading-relaxed">"{dailyPrompt.text}"</p>
          <p className="text-[10px] text-muted-foreground mt-2">{dailyPrompt.category}</p>
        </div>

        {/* Quick actions */}
        <div className="space-y-2 animate-fade-in">
          <h2 className="font-serif text-base text-foreground">Start Writing</h2>

          <button onClick={() => navigate('/journal/examen')} className="w-full rounded-xl border border-gold/20 bg-card p-4 text-left transition-all hover:border-gold/40 active:scale-[0.98]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10">
                  <Crosshair className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Daily Examen</p>
                  <p className="text-xs text-muted-foreground">Guided Ignatian reflection {hasExamenToday ? '· ✓ Done' : ''}</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </button>

          <button onClick={() => navigate('/journal/write')} className="w-full rounded-xl border border-gold/20 bg-card p-4 text-left transition-all hover:border-gold/40 active:scale-[0.98]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10">
                  <PenLine className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Free Journal</p>
                  <p className="text-xs text-muted-foreground">Write freely from the heart</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </button>

          <button onClick={() => navigate('/journal/write?type=gratitude')} className="w-full rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-gold/20 active:scale-[0.98]">
            <div className="flex items-center gap-3">
              <Heart className="h-4 w-4 text-gold" />
              <p className="text-sm text-foreground">Gratitude Entry</p>
            </div>
          </button>

          <button onClick={() => navigate('/journal/write?type=intention')} className="w-full rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-gold/20 active:scale-[0.98]">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-4 w-4 text-gold" />
              <p className="text-sm text-foreground">Prayer Intention</p>
            </div>
          </button>

          <button onClick={() => navigate('/journal/write?type=wins')} className="w-full rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-gold/20 active:scale-[0.98]">
            <div className="flex items-center gap-3">
              <Trophy className="h-4 w-4 text-gold" />
              <p className="text-sm text-foreground">Spiritual Wins / Challenges</p>
            </div>
          </button>

          <button onClick={() => navigate('/journal/prompts')} className="w-full rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-gold/20 active:scale-[0.98]">
            <div className="flex items-center gap-3">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-foreground">Browse Prompts</p>
            </div>
          </button>
        </div>

        {/* Spiritual Growth */}
        <div className="space-y-2 animate-fade-in">
          <h2 className="font-serif text-base text-foreground">Spiritual Growth</h2>

          <button onClick={() => navigate('/journal/insights')} className="w-full rounded-xl border border-gold/20 bg-card p-4 text-left transition-all hover:border-gold/40 active:scale-[0.98]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10">
                  <Sparkles className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Insights & Patterns</p>
                  <p className="text-xs text-muted-foreground">
                    {hasEnoughForPatterns ? 'View your spiritual patterns' : `${entryCount}/5 reflections to unlock`}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </button>

          <button onClick={() => navigate('/journal/insights?tab=report')} className="w-full rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-gold/20 active:scale-[0.98]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gold" />
                <div>
                  <p className="text-sm text-foreground">Weekly Report</p>
                  {weeklyReport && (
                    <p className="text-xs text-muted-foreground line-clamp-1">{weeklyReport.weekly_focus || 'View your latest report'}</p>
                  )}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </button>

          <button onClick={() => navigate('/journal/insights?tab=plan')} className="w-full rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-gold/20 active:scale-[0.98]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Target className="h-4 w-4 text-gold" />
                <div>
                  <p className="text-sm text-foreground">Growth Plan</p>
                  {growthPlan && (
                    <p className="text-xs text-muted-foreground line-clamp-1">{growthPlan.title}</p>
                  )}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </button>
        </div>

        {/* Mood trend */}
        {moodTrend.length > 0 && (
          <div className="animate-fade-in">
            <h2 className="font-serif text-base text-foreground mb-2">Recent Spiritual Weather</h2>
            <div className="flex gap-2 flex-wrap">
              {moodTrend.map((mood, i) => {
                const em = EMOTIONAL_STATES.find(e => e.key === mood);
                return em ? (
                  <span key={i} className="text-lg" title={em.label}>{em.emoji}</span>
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* Recent entries */}
        {recentEntries.length > 0 && (
          <div className="animate-fade-in">
            <h2 className="font-serif text-base text-foreground mb-3">Recent Entries</h2>
            <div className="space-y-2">
              {recentEntries.map((entry, i) => (
                <div key={entry.id} className="rounded-xl border border-border bg-card p-3" style={{ animationDelay: `${i * 40}ms` }}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-3">
                      <p className="text-xs text-muted-foreground">{new Date(entry.entry_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {entry.entry_type}</p>
                      <p className="text-sm font-medium text-foreground mt-0.5">{entry.title || 'Untitled'}</p>
                      {!settings.hide_previews && entry.body && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{entry.body.substring(0, 120)}</p>
                      )}
                    </div>
                    {entry.emotional_state && (
                      <span className="text-sm">{EMOTIONAL_STATES.find(e => e.key === entry.emotional_state)?.emoji}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default JournalHome;
