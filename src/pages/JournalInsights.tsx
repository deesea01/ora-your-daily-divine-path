import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft, Flame, Heart, TrendingUp, BookOpen, Target, Calendar, Sparkles, ChevronRight, Loader2, Download } from 'lucide-react';
import { exportWeeklyReportPdf, exportGrowthPlanPdf } from '@/lib/exportPdf';
import { useAuth } from '@/hooks/useAuth';
import { useJournal } from '@/hooks/useJournal';
import { useSpiritualGrowth } from '@/hooks/useSpiritualGrowth';
import { EMOTIONAL_STATES, SPIRITUAL_STATES } from '@/lib/journalData';

const JournalInsights = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { entries, streak, loading } = useJournal();
  const {
    analyses, patterns, weeklyReport, growthPlan,
    loading: growthLoading, actionLoading,
    generatePatterns, generateWeeklyReport, generateGrowthPlan,
    hasEnoughForPatterns, entryCount,
  } = useSpiritualGrowth();

  const [activeTab, setActiveTab] = useState<'overview' | 'patterns' | 'report' | 'plan'>('overview');

  if (authLoading || loading || growthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;

  // Basic stats
  const emotionCounts: Record<string, number> = {};
  const spiritualCounts: Record<string, number> = {};
  const tagCounts: Record<string, number> = {};

  entries.forEach(e => {
    if (e.emotional_state) emotionCounts[e.emotional_state] = (emotionCounts[e.emotional_state] || 0) + 1;
    if (e.spiritual_state) spiritualCounts[e.spiritual_state] = (spiritualCounts[e.spiritual_state] || 0) + 1;
    e.tags.forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; });
  });

  const topEmotions = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topSpiritual = Object.entries(spiritualCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const examenCount = entries.filter(e => e.entry_type === 'examen').length;
  const intentionCount = entries.filter(e => e.prayer_intention?.trim()).length;

  // AI-analyzed virtue/struggle aggregation
  const virtueCounts: Record<string, number> = {};
  const struggleCounts: Record<string, number> = {};
  analyses.forEach(a => {
    a.detected_virtues.forEach(v => { virtueCounts[v] = (virtueCounts[v] || 0) + 1; });
    a.detected_struggles.forEach(s => { struggleCounts[s] = (struggleCounts[s] || 0) + 1; });
  });
  const topVirtues = Object.entries(virtueCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topStruggles = Object.entries(struggleCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const tabs = [
    { key: 'overview' as const, label: 'Overview', icon: TrendingUp },
    { key: 'patterns' as const, label: 'Patterns', icon: Target, locked: !hasEnoughForPatterns },
    { key: 'report' as const, label: 'Report', icon: Calendar },
    { key: 'plan' as const, label: 'Plan', icon: Sparkles },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border px-4 py-4">
        <button onClick={() => navigate('/journal')} className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground" aria-label="Back">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="font-serif text-lg font-medium text-foreground">Spiritual Growth</h1>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-border px-4">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-3 text-xs font-medium border-b-2 transition-all ${
              activeTab === tab.key
                ? 'border-gold text-gold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
            {tab.locked && <span className="text-[10px] text-muted-foreground">🔒</span>}
          </button>
        ))}
      </div>

      <main className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <>
            {entries.length < 3 ? (
              <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
                <TrendingUp className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground text-center">Keep journaling to unlock insights.</p>
                <p className="text-xs text-muted-foreground mt-1">At least 3 entries needed.</p>
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
                    <p className="font-serif text-xl font-medium text-gold">{entryCount}</p>
                    <p className="text-xs text-muted-foreground mt-1">Analyzed</p>
                  </div>
                </div>

                {/* AI Virtues & Struggles */}
                {topVirtues.length > 0 && (
                  <div className="animate-fade-in">
                    <h2 className="font-serif text-base text-foreground mb-3">🌿 Growing Virtues</h2>
                    <div className="space-y-2">
                      {topVirtues.map(([v, count]) => {
                        const pct = Math.round((count / Math.max(entryCount, 1)) * 100);
                        return (
                          <div key={v} className="flex items-center gap-3">
                            <p className="text-xs text-foreground flex-1 capitalize">{v}</p>
                            <div className="w-24 h-2 rounded-full bg-secondary overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
                            </div>
                            <p className="text-xs text-muted-foreground w-8 text-right">{count}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {topStruggles.length > 0 && (
                  <div className="animate-fade-in">
                    <h2 className="font-serif text-base text-foreground mb-3">⚡ Areas for Growth</h2>
                    <div className="space-y-2">
                      {topStruggles.map(([s, count]) => {
                        const pct = Math.round((count / Math.max(entryCount, 1)) * 100);
                        return (
                          <div key={s} className="flex items-center gap-3">
                            <p className="text-xs text-foreground flex-1 capitalize">{s}</p>
                            <div className="w-24 h-2 rounded-full bg-secondary overflow-hidden">
                              <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
                            </div>
                            <p className="text-xs text-muted-foreground w-8 text-right">{count}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Emotions */}
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
                              <div className="h-full bg-gold rounded-full" style={{ width: `${pct}%` }} />
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

                {/* Recent AI Analysis */}
                {analyses.length > 0 && (
                  <div className="animate-fade-in">
                    <h2 className="font-serif text-base text-foreground mb-3">Recent Reflections</h2>
                    <div className="space-y-3">
                      {analyses.slice(0, 3).map(a => (
                        <div key={a.id} className="rounded-xl border border-border bg-card p-4 space-y-2">
                          <p className="text-xs text-muted-foreground">{new Date(a.entry_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                          <p className="text-sm text-foreground/80 italic">{a.ai_summary}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {a.detected_virtues.map(v => (
                              <span key={v} className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-400 capitalize">{v}</span>
                            ))}
                            {a.detected_struggles.map(s => (
                              <span key={s} className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] text-amber-400 capitalize">{s}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* PATTERNS TAB */}
        {activeTab === 'patterns' && (
          <>
            {!hasEnoughForPatterns ? (
              <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
                <Target className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground text-center">Complete your Daily Examen 5 times to unlock spiritual patterns.</p>
                <p className="text-xs text-muted-foreground mt-1">{entryCount}/5 analyzed entries</p>
              </div>
            ) : (
              <>
                <button
                  onClick={generatePatterns}
                  disabled={actionLoading === 'patterns'}
                  className="w-full rounded-xl bg-gold py-3 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {actionLoading === 'patterns' ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing…</> : '✨ Discover Your Patterns'}
                </button>

                {patterns && (
                  <div className="space-y-5 animate-fade-in">
                    <p className="text-xs text-muted-foreground text-center">
                      Based on {patterns.entry_count} entries ({patterns.analysis_period_start} — {patterns.analysis_period_end})
                    </p>

                    {/* Recurring struggles */}
                    {patterns.recurring_struggles.length > 0 && (
                      <div className="rounded-xl border border-amber-500/20 bg-card p-5">
                        <h3 className="font-serif text-sm text-foreground mb-3">⚡ Recurring Struggles</h3>
                        <div className="space-y-3">
                          {patterns.recurring_struggles.map((s: any, i: number) => (
                            <div key={i}>
                              <p className="text-sm font-medium text-foreground capitalize">{s.name}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Growing virtues */}
                    {patterns.growing_virtues.length > 0 && (
                      <div className="rounded-xl border border-emerald-500/20 bg-card p-5">
                        <h3 className="font-serif text-sm text-foreground mb-3">🌿 Growing Virtues</h3>
                        <div className="space-y-3">
                          {patterns.growing_virtues.map((v: any, i: number) => (
                            <div key={i}>
                              <p className="text-sm font-medium text-foreground capitalize">{v.name}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{v.evidence}</p>
                              <p className="text-xs text-gold mt-0.5 italic">{v.growth_note}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Triggers */}
                    {patterns.common_triggers.length > 0 && (
                      <div className="rounded-xl border border-border bg-card p-5">
                        <h3 className="font-serif text-sm text-foreground mb-3">🔍 Common Triggers</h3>
                        <div className="space-y-2">
                          {patterns.common_triggers.map((t: any, i: number) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className="text-xs text-gold mt-0.5">•</span>
                              <p className="text-xs text-foreground/80"><strong>{t.trigger}:</strong> {t.context}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Emotional trends */}
                    {patterns.emotional_trends.length > 0 && (
                      <div className="rounded-xl border border-border bg-card p-5">
                        <h3 className="font-serif text-sm text-foreground mb-3">💛 Emotional Trends</h3>
                        <div className="space-y-2">
                          {patterns.emotional_trends.map((t: any, i: number) => (
                            <div key={i}>
                              <p className="text-sm font-medium text-foreground">{t.trend}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* WEEKLY REPORT TAB */}
        {activeTab === 'report' && (
          <>
            <button
              onClick={generateWeeklyReport}
              disabled={actionLoading === 'report'}
              className="w-full rounded-xl bg-gold py-3 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {actionLoading === 'report' ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</> : '📅 Generate Weekly Report'}
            </button>

            {weeklyReport && (
              <div className="space-y-4 animate-fade-in">
                <p className="text-xs text-muted-foreground text-center">
                  {weeklyReport.week_start} — {weeklyReport.week_end}
                </p>

                <div className="rounded-xl border border-gold/20 bg-card p-5">
                  <h3 className="font-serif text-sm text-gold mb-2">This Week with God</h3>
                  <p className="text-sm text-foreground/80 leading-relaxed">{weeklyReport.overall_summary}</p>
                </div>

                <div className="rounded-xl border border-emerald-500/20 bg-card p-5">
                  <h3 className="font-serif text-sm text-emerald-400 mb-2">Where You Grew</h3>
                  <p className="text-sm text-foreground/80 leading-relaxed">{weeklyReport.growth_areas}</p>
                </div>

                <div className="rounded-xl border border-amber-500/20 bg-card p-5">
                  <h3 className="font-serif text-sm text-amber-400 mb-2">Where You Struggled</h3>
                  <p className="text-sm text-foreground/80 leading-relaxed">{weeklyReport.struggle_patterns}</p>
                </div>

                <div className="rounded-xl border border-blue-500/20 bg-card p-5">
                  <h3 className="font-serif text-sm text-blue-400 mb-2">God May Be Inviting You To…</h3>
                  <p className="text-sm text-foreground/80 leading-relaxed italic">{weeklyReport.divine_invitation}</p>
                </div>

                <div className="rounded-xl border border-gold/30 bg-gold/5 p-5">
                  <h3 className="font-serif text-sm text-gold mb-2">🎯 Focus for Next Week</h3>
                  <p className="text-sm text-foreground leading-relaxed font-medium">{weeklyReport.weekly_focus}</p>
                </div>

                <button
                  onClick={() => exportWeeklyReportPdf(weeklyReport)}
                  className="w-full rounded-xl border border-gold/30 py-3 text-sm font-medium text-gold transition-all hover:bg-gold/10 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" /> Export as PDF
                </button>
              </div>
            )}

            {!weeklyReport && !actionLoading && (
              <div className="flex flex-col items-center py-12 animate-fade-in">
                <Calendar className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground text-center">Generate a report to see how God moved in your week.</p>
              </div>
            )}
          </>
        )}

        {/* GROWTH PLAN TAB */}
        {activeTab === 'plan' && (
          <>
            <button
              onClick={generateGrowthPlan}
              disabled={actionLoading === 'plan'}
              className="w-full rounded-xl bg-gold py-3 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {actionLoading === 'plan' ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating…</> : '🌱 Create 3-Day Growth Plan'}
            </button>

            {growthPlan && (
              <div className="space-y-4 animate-fade-in">
                <div className="text-center">
                  <h2 className="font-serif text-lg text-foreground">{growthPlan.title}</h2>
                  <p className="text-xs text-gold mt-1 capitalize">Focus: {growthPlan.focus_area}</p>
                </div>

                {[
                  { day: 'Day 1', label: 'Action', action: growthPlan.day1_action, icon: '🏃' },
                  { day: 'Day 2', label: 'Prayer & Reflection', action: growthPlan.day2_action, icon: '🙏' },
                  { day: 'Day 3', label: 'Challenge', action: growthPlan.day3_action, icon: '⚔️' },
                ].map((d, i) => (
                  <div key={i} className="rounded-xl border border-gold/20 bg-card p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{d.icon}</span>
                      <div>
                        <p className="text-xs text-gold font-medium">{d.day}</p>
                        <p className="text-[10px] text-muted-foreground">{d.label}</p>
                      </div>
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed">{d.action}</p>
                  </div>
                ))}

                {growthPlan.scripture_anchor && (
                  <div className="rounded-xl border border-border bg-card p-5">
                    <p className="text-xs text-gold uppercase tracking-wider mb-2">Scripture Anchor</p>
                    <p className="text-sm text-foreground/80 italic leading-relaxed">{growthPlan.scripture_anchor}</p>
                  </div>
                )}

                {growthPlan.plan_prayer && (
                  <div className="rounded-xl border border-gold/20 bg-gold/5 p-5">
                    <p className="text-xs text-gold uppercase tracking-wider mb-2">Prayer</p>
                    <p className="text-sm text-foreground/80 italic leading-relaxed">{growthPlan.plan_prayer}</p>
                  </div>
                )}

                <button
                  onClick={() => exportGrowthPlanPdf(growthPlan)}
                  className="w-full rounded-xl border border-gold/30 py-3 text-sm font-medium text-gold transition-all hover:bg-gold/10 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" /> Export as PDF
                </button>
              </div>
            )}

            {!growthPlan && !actionLoading && (
              <div className="flex flex-col items-center py-12 animate-fade-in">
                <Sparkles className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground text-center">Create a personalized plan based on your spiritual journey.</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default JournalInsights;
