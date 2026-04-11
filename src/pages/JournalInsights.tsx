import { useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft, Flame, Heart, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useJournal } from '@/hooks/useJournal';
import { EMOTIONAL_STATES, SPIRITUAL_STATES } from '@/lib/journalData';

const JournalInsights = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { entries, streak, loading } = useJournal();

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;

  // Compute insights
  const emotionCounts: Record<string, number> = {};
  const spiritualCounts: Record<string, number> = {};
  const tagCounts: Record<string, number> = {};
  const typeCounts: Record<string, number> = {};

  entries.forEach(e => {
    if (e.emotional_state) emotionCounts[e.emotional_state] = (emotionCounts[e.emotional_state] || 0) + 1;
    if (e.spiritual_state) spiritualCounts[e.spiritual_state] = (spiritualCounts[e.spiritual_state] || 0) + 1;
    e.tags.forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; });
    typeCounts[e.entry_type] = (typeCounts[e.entry_type] || 0) + 1;
  });

  const topEmotions = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topSpiritual = Object.entries(spiritualCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);

  const intentionCount = entries.filter(e => e.prayer_intention?.trim()).length;
  const examenCount = entries.filter(e => e.entry_type === 'examen').length;

  // Generate encouragements
  const encouragements: string[] = [];
  if (topEmotions.length > 0) {
    const topEm = EMOTIONAL_STATES.find(e => e.key === topEmotions[0][0]);
    if (topEm) encouragements.push(`You often feel ${topEm.label.toLowerCase()} when you journal — that's a beautiful sign of awareness.`);
  }
  if (examenCount > 3) encouragements.push('Your commitment to the Daily Examen is building real depth in your spiritual life.');
  if (intentionCount > 3) encouragements.push('You frequently bring intentions before the Lord — He hears every one.');
  if (topTags.some(([t]) => t.toLowerCase().includes('family'))) encouragements.push('You frequently bring family and healing before the Lord.');
  if (topTags.some(([t]) => t.toLowerCase().includes('gratitude'))) encouragements.push('You often mention gratitude — this is the heart of prayer.');
  if (streak >= 7) encouragements.push('Peace tends to rise after consistent journaling and examen.');

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border px-4 py-4">
        <button onClick={() => navigate('/journal')} className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground" aria-label="Back">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="font-serif text-lg font-medium text-foreground">Spiritual Insights</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
        {entries.length < 3 ? (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <TrendingUp className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground text-center">Keep journaling to unlock spiritual insights.</p>
            <p className="text-xs text-muted-foreground mt-1">At least 3 entries are needed.</p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 animate-fade-in">
              <div className="rounded-xl border border-gold/20 bg-card p-4 text-center">
                <div className="flex items-center justify-center gap-1">
                  <Flame className="h-4 w-4 text-gold" />
                  <p className="font-serif text-xl font-medium text-gold">{streak}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Streak</p>
              </div>
              <div className="rounded-xl border border-gold/20 bg-card p-4 text-center">
                <p className="font-serif text-xl font-medium text-gold">{entries.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Entries</p>
              </div>
              <div className="rounded-xl border border-gold/20 bg-card p-4 text-center">
                <p className="font-serif text-xl font-medium text-gold">{examenCount}</p>
                <p className="text-xs text-muted-foreground mt-1">Examens</p>
              </div>
            </div>

            {/* Encouragements */}
            {encouragements.length > 0 && (
              <div className="rounded-xl border border-gold/20 bg-card p-5 animate-fade-in">
                <p className="text-xs text-gold uppercase tracking-wider mb-3">Gentle Observations</p>
                <div className="space-y-3">
                  {encouragements.map((msg, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Heart className="h-3.5 w-3.5 text-gold shrink-0 mt-0.5" />
                      <p className="text-sm text-foreground/80 italic">{msg}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top emotions */}
            {topEmotions.length > 0 && (
              <div className="animate-fade-in">
                <h2 className="font-serif text-base text-foreground mb-3">Most Common Feelings</h2>
                <div className="space-y-2">
                  {topEmotions.map(([key, count]) => {
                    const em = EMOTIONAL_STATES.find(e => e.key === key);
                    const pct = Math.round((count / entries.length) * 100);
                    return em ? (
                      <div key={key} className="flex items-center gap-3">
                        <span className="text-sm w-6">{em.emoji}</span>
                        <p className="text-xs text-foreground flex-1">{em.label}</p>
                        <div className="w-20 h-2 rounded-full bg-secondary overflow-hidden">
                          <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-xs text-muted-foreground w-8 text-right">{count}</p>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {/* Top spiritual states */}
            {topSpiritual.length > 0 && (
              <div className="animate-fade-in">
                <h2 className="font-serif text-base text-foreground mb-3">Spiritual Themes</h2>
                <div className="space-y-2">
                  {topSpiritual.map(([key, count]) => {
                    const sp = SPIRITUAL_STATES.find(s => s.key === key);
                    const pct = Math.round((count / entries.length) * 100);
                    return sp ? (
                      <div key={key} className="flex items-center gap-3">
                        <span className="text-sm w-6">{sp.emoji}</span>
                        <p className="text-xs text-foreground flex-1">{sp.label}</p>
                        <div className="w-20 h-2 rounded-full bg-secondary overflow-hidden">
                          <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-xs text-muted-foreground w-8 text-right">{count}</p>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {/* Tags */}
            {topTags.length > 0 && (
              <div className="animate-fade-in">
                <h2 className="font-serif text-base text-foreground mb-3">Your Themes</h2>
                <div className="flex flex-wrap gap-2">
                  {topTags.map(([tag, count]) => (
                    <span key={tag} className="rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground">
                      {tag} <span className="text-muted-foreground">({count})</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Prayer intentions */}
            {intentionCount > 0 && (
              <div className="rounded-xl border border-border bg-card p-4 animate-fade-in">
                <p className="text-xs text-muted-foreground">You've placed <span className="text-gold font-medium">{intentionCount}</span> prayer intention{intentionCount !== 1 ? 's' : ''} before the Lord.</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default JournalInsights;
