import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Calendar, Flame } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useConfession } from '@/hooks/useConfession';

function computeConfessionStreak(dates: string[]): number {
  if (dates.length < 2) return dates.length;
  // Streak = how many consecutive confessions were within their target window
  // Simplified: count how many confessions exist
  return dates.length;
}

function computeAverageGap(dates: string[]): number | null {
  if (dates.length < 2) return null;
  const sorted = [...dates].sort();
  let totalGap = 0;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1] + 'T00:00:00');
    const curr = new Date(sorted[i] + 'T00:00:00');
    totalGap += Math.floor((curr.getTime() - prev.getTime()) / 86400000);
  }
  return Math.round(totalGap / (sorted.length - 1));
}

const MOOD_EMOJI: Record<string, string> = {
  peaceful: '☮️',
  relieved: '😌',
  encouraged: '💪',
  emotional: '🥹',
  grateful: '🙏',
};

const ConfessionHistory = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { confessions, deleteConfession, settings, loading } = useConfession();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  const dates = confessions.map((c) => c.confession_date);
  const streak = computeConfessionStreak(dates);
  const avgGap = computeAverageGap(dates);

  const handleDelete = async (id: string) => {
    await deleteConfession(id);
    setDeletingId(null);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border px-4 py-4">
        <button
          onClick={() => navigate('/confession')}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="font-serif text-lg font-medium text-foreground">Confession History</h1>
      </header>

      <main className="flex-1 px-6 py-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 animate-fade-in">
          <div className="rounded-xl border border-gold/20 bg-card p-4 text-center">
            <p className="font-serif text-xl font-medium text-gold">{confessions.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Total</p>
          </div>
          <div className="rounded-xl border border-gold/20 bg-card p-4 text-center">
            <div className="flex items-center justify-center gap-1">
              <Flame className="h-4 w-4 text-gold" />
              <p className="font-serif text-xl font-medium text-gold">{streak}</p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Logged</p>
          </div>
          <div className="rounded-xl border border-gold/20 bg-card p-4 text-center">
            <p className="font-serif text-xl font-medium text-gold">{avgGap ?? '—'}</p>
            <p className="text-xs text-muted-foreground mt-1">Avg days</p>
          </div>
        </div>

        {/* Entries */}
        {confessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
            <Calendar className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No confessions logged yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {confessions.map((c, i) => (
              <div
                key={c.id}
                className="rounded-xl border border-border bg-card p-4 animate-fade-in"
                style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {new Date(c.confession_date + 'T00:00:00').toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                    {c.parish_name && !settings.hide_previews && (
                      <p className="text-xs text-muted-foreground mt-0.5">{c.parish_name}</p>
                    )}
                    {c.mood && (
                      <span className="inline-flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        {MOOD_EMOJI[c.mood] || ''} {c.mood}
                      </span>
                    )}
                  </div>
                  {deletingId === c.id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setDeletingId(null)}
                        className="text-xs text-muted-foreground px-2 py-1 border border-border rounded"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="text-xs text-destructive px-2 py-1 border border-destructive/30 rounded bg-destructive/5"
                      >
                        Delete
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeletingId(c.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {c.reflection && !settings.hide_previews && (
                  <p className="mt-2 text-xs text-muted-foreground italic border-t border-border pt-2">
                    {c.reflection}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ConfessionHistory;
