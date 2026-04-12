import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Shield, Clock, ChevronRight, CheckCircle, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useConfession } from '@/hooks/useConfession';
import { useSpiritualGrowth, type ConfessionPrep } from '@/hooks/useSpiritualGrowth';
import { Progress } from '@/components/ui/progress';

const RHYTHM_LABELS: Record<string, string> = {
  weekly: 'Weekly',
  biweekly: 'Every 2 weeks',
  monthly: 'Monthly',
  custom: 'Custom',
};

const ConfessionDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const {
    lastConfession,
    daysSinceLastConfession,
    targetDays,
    onTrack,
    settings,
    loading,
    updateSettings,
  } = useConfession();
  const { generateConfessionPrep, actionLoading, entryCount } = useSpiritualGrowth();
  const [confessionPrep, setConfessionPrep] = useState<ConfessionPrep | null>(null);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  const progressPercent = daysSinceLastConfession !== null
    ? Math.max(0, Math.min(100, 100 - (daysSinceLastConfession / targetDays) * 100))
    : 0;

  const handleGeneratePrep = async () => {
    const result = await generateConfessionPrep();
    if (result) setConfessionPrep(result);
  };

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
        <h1 className="font-serif text-lg font-medium text-foreground">Confession Tracker</h1>
        <button
          onClick={() => navigate('/confession/privacy')}
          className="ml-auto flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
          aria-label="Privacy settings"
        >
          <Shield className="h-4 w-4" />
        </button>
      </header>

      <main className="flex-1 px-6 py-6 space-y-5">
        {/* Status card */}
        <div className="rounded-xl border border-gold/20 bg-card p-5 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${onTrack ? 'bg-gold/10' : 'bg-destructive/10'}`}>
              {onTrack ? (
                <CheckCircle className="h-5 w-5 text-gold" />
              ) : (
                <AlertCircle className="h-5 w-5 text-destructive" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {daysSinceLastConfession !== null
                  ? `${daysSinceLastConfession} day${daysSinceLastConfession !== 1 ? 's' : ''} since last confession`
                  : 'No confessions logged yet'}
              </p>
              {lastConfession && (
                <p className="text-xs text-muted-foreground">
                  Last: {new Date(lastConfession.confession_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              )}
            </div>
          </div>
          <Progress value={progressPercent} className="h-2" />
          <p className="mt-2 text-xs text-muted-foreground">
            Target: {RHYTHM_LABELS[settings.target_rhythm]}
          </p>
        </div>

        {/* Rhythm selector */}
        <div className="rounded-xl border border-border bg-card p-4 animate-fade-in">
          <p className="text-xs text-muted-foreground mb-3">Confession rhythm</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(RHYTHM_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => updateSettings({ target_rhythm: key })}
                className={`rounded-lg border px-3 py-2 text-sm transition-all ${
                  settings.target_rhythm === key
                    ? 'border-gold/40 bg-gold/10 text-gold'
                    : 'border-border text-muted-foreground hover:border-gold/20'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Personalized Confession Prep — powered by Spiritual Growth Engine */}
        {entryCount > 0 && (
          <div className="rounded-xl border border-gold/20 bg-card p-5 animate-fade-in space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-gold" />
              <h2 className="font-serif text-sm font-medium text-foreground">Personalized Preparation</h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Based on your Daily Examen reflections, receive tailored examination questions for confession.
            </p>

            {!confessionPrep && (
              <button
                onClick={handleGeneratePrep}
                disabled={actionLoading === 'confession'}
                className="w-full rounded-xl bg-gold py-3 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {actionLoading === 'confession' ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Preparing…</>
                ) : (
                  '✨ Generate Personalized Prep'
                )}
              </button>
            )}

            {confessionPrep && (
              <div className="space-y-4 animate-fade-in">
                {/* Encouragement */}
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <p className="text-sm text-foreground/80 italic leading-relaxed">{confessionPrep.encouragement}</p>
                </div>

                {/* Examination Points */}
                <div>
                  <h3 className="font-serif text-xs text-gold uppercase tracking-wider mb-3">Examination Points</h3>
                  <div className="space-y-3">
                    {confessionPrep.examination_points.map((pt, i) => (
                      <div key={i} className="rounded-xl border border-border bg-background p-4 space-y-1.5">
                        <p className="text-[10px] uppercase tracking-wider text-amber-400 font-medium">{pt.struggle}</p>
                        <p className="text-sm text-foreground font-medium">{pt.question}</p>
                        <p className="text-xs text-muted-foreground italic">{pt.reflection}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Act of Contrition Focus */}
                <div className="rounded-xl border border-gold/20 bg-gold/5 p-4">
                  <p className="text-xs text-gold uppercase tracking-wider mb-2">Act of Contrition Focus</p>
                  <p className="text-sm text-foreground/80 leading-relaxed">{confessionPrep.act_of_contrition_focus}</p>
                </div>

                {/* Penance Intentions */}
                <div className="rounded-xl border border-border bg-card p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Suggested Penance Intentions</p>
                  <ul className="space-y-1.5">
                    {confessionPrep.suggested_penance_intentions.map((pi, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                        <span className="text-gold mt-0.5">•</span>
                        {pi}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Preparation Prayer */}
                <div className="rounded-xl border border-gold/30 bg-gold/5 p-4">
                  <p className="text-xs text-gold uppercase tracking-wider mb-2">Prayer Before Confession</p>
                  <p className="text-sm text-foreground/80 italic leading-relaxed">{confessionPrep.preparation_prayer}</p>
                </div>

                {/* Regenerate */}
                <button
                  onClick={handleGeneratePrep}
                  disabled={actionLoading === 'confession'}
                  className="w-full rounded-xl border border-gold/30 py-2.5 text-xs font-medium text-gold transition-all hover:bg-gold/10 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {actionLoading === 'confession' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                  Regenerate
                </button>
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-3 animate-fade-in">
          <button
            onClick={() => navigate('/confession/examine')}
            className="group w-full rounded-xl border border-gold/20 bg-card p-4 text-left transition-all hover:border-gold/40 active:scale-[0.98]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10">
                  <Calendar className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Prepare for Confession</p>
                  <p className="text-xs text-muted-foreground">Guided examination of conscience</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </button>

          <button
            onClick={() => navigate('/confession/log')}
            className="group w-full rounded-xl border border-gold/20 bg-card p-4 text-left transition-all hover:border-gold/40 active:scale-[0.98]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10">
                  <CheckCircle className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Log Confession</p>
                  <p className="text-xs text-muted-foreground">Record your visit to the sacrament</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </button>

          <button
            onClick={() => navigate('/confession/history')}
            className="group w-full rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-gold/20 active:scale-[0.98]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Confession History</p>
                  <p className="text-xs text-muted-foreground">View past confessions and reflections</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </button>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-muted-foreground italic px-4 animate-fade-in">
          This is a spiritual aid to help you prepare. It is not a substitute for the Sacrament of Reconciliation.
        </p>
      </main>
    </div>
  );
};

export default ConfessionDashboard;
