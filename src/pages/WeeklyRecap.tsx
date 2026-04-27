import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Flame, Cross, Heart, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useWeeklyRecaps } from '@/hooks/useWeeklyRecaps';
import { SPIRITUAL_GUIDES } from '@/lib/guides';
import WeeklyRecapStory from '@/components/WeeklyRecapStory';

export default function WeeklyRecap() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isActive: isPremium } = useSubscription();
  const { recaps, latest, loading, generating, generateForLastWeek } = useWeeklyRecaps();
  const [storyRecapId, setStoryRecapId] = useState<string | null>(null);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/welcome" replace />;

  const storyRecap = recaps.find((r) => r.id === storyRecapId) || null;

  return (
    <div className="min-h-screen bg-background px-6 pb-12 pt-safe">
      <header className="flex items-center justify-between pt-6 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="font-serif text-xl text-foreground">Your Wrapped</h1>
        <div className="w-10" />
      </header>

      {!latest ? (
        <div className="mt-12 rounded-2xl border border-gold/20 bg-card p-8 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-gold" />
          <h2 className="mt-4 font-serif text-2xl text-foreground">No recap yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Pray, journal, or chat with a Saint this week. Your first recap unlocks Sunday morning.
          </p>
          <button
            onClick={generateForLastWeek}
            disabled={generating}
            className="mt-6 rounded-full bg-gold px-6 py-3 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {generating ? 'Generating…' : 'Generate now'}
          </button>
        </div>
      ) : (
        <>
          {/* Featured latest */}
          <button
            onClick={() => setStoryRecapId(latest.id)}
            className="group mb-8 block w-full overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-br from-card to-background p-6 text-left transition-all hover:border-gold/60"
          >
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-gold">
              <Sparkles className="h-3 w-3" /> This week
            </div>
            <h2 className="mt-3 font-serif text-3xl text-foreground">{latest.headline || 'A Week of Grace'}</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {new Date(latest.week_start).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} —{' '}
              {new Date(latest.week_end).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </p>

            <div className="mt-5 flex items-center gap-4">
              {latest.top_saint && SPIRITUAL_GUIDES[latest.top_saint as keyof typeof SPIRITUAL_GUIDES] ? (
                <img
                  src={SPIRITUAL_GUIDES[latest.top_saint as keyof typeof SPIRITUAL_GUIDES].avatar}
                  alt=""
                  className="h-14 w-14 rounded-full object-cover ring-2 ring-gold/40"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/15">
                  <Heart className="h-5 w-5 text-gold" />
                </div>
              )}
              <div className="flex-1">
                <p className="font-serif text-lg text-foreground">
                  {latest.top_saint
                    ? SPIRITUAL_GUIDES[latest.top_saint as keyof typeof SPIRITUAL_GUIDES]?.label
                    : 'No top Saint yet'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {latest.saint_message_count} msgs • ~{latest.saint_minutes_estimate} min
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <Stat icon={<Flame className="h-3.5 w-3.5 text-gold" />} label="Streak" value={`${latest.current_streak}d`} />
              <Stat icon={<Cross className="h-3.5 w-3.5 text-gold" />} label="Prayers" value={latest.prayer_completions_count} />
              <Stat icon={<Sparkles className="h-3.5 w-3.5 text-gold" />} label="Rosaries" value={latest.rosaries_completed} />
            </div>

            {!isPremium && (
              <div className="mt-5 flex items-center gap-2 rounded-lg border border-gold/20 bg-gold/5 px-3 py-2 text-xs text-gold">
                <Lock className="h-3 w-3" />
                Virtues, struggles, and reflection unlock with premium.
              </div>
            )}

            <p className="mt-5 text-center text-xs text-muted-foreground">Tap to play your story →</p>
          </button>

          {/* Premium-only sections inline preview */}
          {isPremium && latest.top_virtues.length > 0 && (
            <section className="mb-6">
              <h3 className="mb-3 font-serif text-lg text-gold">Where you grew</h3>
              <div className="flex flex-wrap gap-2">
                {latest.top_virtues.map((v) => (
                  <span
                    key={v.name}
                    className="rounded-full border border-gold/30 bg-card px-3 py-1.5 text-xs capitalize text-foreground"
                  >
                    {v.name} <span className="text-gold">×{v.count}</span>
                  </span>
                ))}
              </div>
            </section>
          )}

          {isPremium && latest.reflection && (
            <section className="mb-8 rounded-xl border border-border bg-card p-5">
              <p className="font-serif text-sm leading-relaxed text-foreground">{latest.reflection}</p>
              {latest.scripture && <p className="mt-3 text-xs italic text-muted-foreground">{latest.scripture}</p>}
            </section>
          )}

          {/* Archive */}
          {recaps.length > 1 && (
            <section>
              <h3 className="mb-3 font-serif text-lg text-foreground">Past weeks</h3>
              <div className="space-y-2">
                {recaps.slice(1).map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setStoryRecapId(r.id)}
                    className="flex w-full items-center justify-between rounded-xl border border-border bg-card p-4 text-left hover:border-gold/30"
                  >
                    <div>
                      <p className="font-serif text-base text-foreground">{r.headline || 'Weekly recap'}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(r.week_start).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} —{' '}
                        {new Date(r.week_end).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">{r.prayer_completions_count} prayers</div>
                  </button>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {storyRecap && (
        <WeeklyRecapStory recap={storyRecap} isPremium={isPremium} onClose={() => setStoryRecapId(null)} />
      )}
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3 text-center">
      <div className="mb-1 flex justify-center">{icon}</div>
      <p className="font-serif text-xl text-foreground">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}
