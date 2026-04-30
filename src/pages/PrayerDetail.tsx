import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft, Check, Sun, CloudSun, Moon, Loader2, RotateCcw, Circle, CheckCircle2, Play, Pause, Volume2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/useUserProfile';
import ReactMarkdown from 'react-markdown';
import { notifyAdminError } from '@/lib/notifyAdmin';
import { usePrayerNarration } from '@/hooks/usePrayerNarration';

const prayerMeta = {
  morning: { title: 'Morning Lauds', subtitle: 'Start your day in grace', Icon: Sun },
  midday: { title: 'Midday Angelus', subtitle: 'Pause and remember', Icon: CloudSun },
  night: { title: 'Night Compline', subtitle: 'Rest in His peace', Icon: Moon },
} as const;

type PrayerType = keyof typeof prayerMeta;

interface PrayerStage {
  id: string;
  title: string;
  body: string;
}

interface SavedProgress {
  date: string;
  content: string;
  completedStageIds: string[];
  updatedAt: number;
}

const todayStr = () => new Date().toISOString().split('T')[0];
const storageKey = (userId: string, type: string) => `ora:prayer-progress:${userId}:${type}`;

/**
 * Parse streamed markdown into ordered stages by `##` (or `#`) headings.
 * If no headings exist, returns one stage containing the full body.
 */
function parseStages(markdown: string): PrayerStage[] {
  if (!markdown.trim()) return [];
  const lines = markdown.split('\n');
  const stages: PrayerStage[] = [];
  let currentTitle = 'Prayer';
  let currentBody: string[] = [];
  let foundHeading = false;
  let idx = 0;

  const flush = () => {
    const body = currentBody.join('\n').trim();
    if (currentTitle || body) {
      stages.push({
        id: `stage-${idx++}-${currentTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 32)}`,
        title: currentTitle,
        body,
      });
    }
  };

  for (const line of lines) {
    const m = line.match(/^#{1,3}\s+(.+?)\s*$/);
    if (m) {
      if (foundHeading) flush();
      else if (currentBody.join('').trim()) flush(); // preamble before first heading
      currentTitle = m[1];
      currentBody = [];
      foundHeading = true;
    } else {
      currentBody.push(line);
    }
  }
  flush();
  return stages.filter((s) => s.body || s.title);
}

const PrayerDetail = () => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile } = useUserProfile();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [marking, setMarking] = useState(false);
  const [completedStageIds, setCompletedStageIds] = useState<string[]>([]);
  const [resumed, setResumed] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const prayerType = type as PrayerType;
  const meta = prayerMeta[prayerType];

  // Load saved progress (today only) before fetching, so we can skip the AI call when resuming
  useEffect(() => {
    if (!user || !meta) return;
    try {
      const raw = localStorage.getItem(storageKey(user.id, prayerType));
      if (!raw) return;
      const saved: SavedProgress = JSON.parse(raw);
      if (saved.date === todayStr() && saved.content) {
        setContent(saved.content);
        setCompletedStageIds(saved.completedStageIds || []);
        setResumed(true);
        setLoading(false);
      } else {
        // stale (different day) — clear
        localStorage.removeItem(storageKey(user.id, prayerType));
      }
    } catch {
      // ignore corrupt storage
    }
  }, [user, prayerType]);

  // Check completion status (DB)
  useEffect(() => {
    if (!user || !meta) return;
    supabase
      .from('prayer_completions')
      .select('id')
      .eq('user_id', user.id)
      .eq('prayer_date', todayStr())
      .eq('prayer_type', prayerType)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setCompleted(true);
      });
  }, [user, prayerType]);

  // Fetch AI-generated prayer (skip if resumed from saved content)
  useEffect(() => {
    if (!user || !meta) return;
    if (resumed) return; // already have content
    if (content) return; // guard against double-fetch in StrictMode
    setLoading(true);

    const fetchPrayer = async () => {
      try {
        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
        const { data: { session } } = await supabase.auth.getSession();
        const accessToken = session?.access_token;
        if (!accessToken) throw new Error('Not authenticated');

        const res = await fetch(
          `https://${projectId}.supabase.co/functions/v1/prayer-guide`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              prayerType,
              preferences: profile ? { seeking: profile.seeking, experience_level: profile.experience_level, spiritual_guide: profile.spiritual_guide } : undefined,
            }),
          }
        );

        if (!res.ok) throw new Error('Failed to fetch prayer');

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) return;

        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            if (!line.startsWith('data: ') || line === 'data: [DONE]') continue;
            try {
              const json = JSON.parse(line.slice(6));
              const delta = json.choices?.[0]?.delta?.content;
              if (delta) setContent((prev) => prev + delta);
            } catch {}
          }
        }
      } catch (err: any) {
        console.error('Prayer generation error:', err);
        notifyAdminError('prayer-guide', err?.message || String(err), user?.id, { prayerType });
        setContent('Peace be with you. Take a moment to pray quietly and reflect.');
      } finally {
        setLoading(false);
      }
    };
    fetchPrayer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, prayerType, resumed]);

  const stages = useMemo(() => parseStages(content), [content]);

  // Persist progress whenever content or completed stages change (today's session only)
  useEffect(() => {
    if (!user || !content || loading) return;
    try {
      const payload: SavedProgress = {
        date: todayStr(),
        content,
        completedStageIds,
        updatedAt: Date.now(),
      };
      localStorage.setItem(storageKey(user.id, prayerType), JSON.stringify(payload));
    } catch {
      // storage full / disabled — silent
    }
  }, [user, prayerType, content, completedStageIds, loading]);

  // Auto-scroll while streaming a fresh prayer (not when resuming)
  useEffect(() => {
    if (loading || !content) return;
    if (resumed) return;
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [content, loading, resumed]);

  const toggleStage = (id: string) => {
    setCompletedStageIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const restart = () => {
    if (!user) return;
    localStorage.removeItem(storageKey(user.id, prayerType));
    setContent('');
    setCompletedStageIds([]);
    setResumed(false);
  };

  const markComplete = async () => {
    if (!user || completed || marking) return;
    setMarking(true);
    const { error } = await supabase.from('prayer_completions').insert({
      user_id: user.id,
      prayer_date: todayStr(),
      prayer_type: prayerType,
    });
    if (!error) {
      setCompleted(true);
      // Clear saved progress — session is done
      try { localStorage.removeItem(storageKey(user.id, prayerType)); } catch {}
    }
    setMarking(false);
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (!meta) return <Navigate to="/" replace />;

  const { Icon } = meta;
  const totalStages = stages.length;
  const doneCount = stages.filter((s) => completedStageIds.includes(s.id)).length;
  const progressPct = totalStages > 0 ? Math.round((doneCount / totalStages) * 100) : 0;

  const narration = usePrayerNarration({
    guide: profile?.spiritual_guide || 'monk',
    mood: 'prayer',
  });
  const ALL_KEY = '__all__';
  const allText = stages.map((s) => `${s.title}. ${s.body}`).join('\n\n');

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-3 px-4 py-4">
          <button
            onClick={() => navigate('/')}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex flex-1 items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
              <Icon className="h-4 w-4 text-gold" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="truncate font-serif text-lg font-medium text-foreground">{meta.title}</h1>
              <p className="truncate text-xs text-muted-foreground">
                {resumed ? 'Resumed where you left off' : meta.subtitle}
              </p>
            </div>
          </div>
          {(content && !completed) && (
            <button
              onClick={restart}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-gold"
              aria-label="Restart prayer"
              title="Start over"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Progress bar */}
        {totalStages > 0 && (
          <div className="px-4 pb-3">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <span>{doneCount} of {totalStages} stages</span>
              <span className="text-gold/80">{progressPct}%</span>
            </div>
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-gold transition-all duration-500 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-6 py-6">
        {loading && !content && (
          <div className="flex flex-col items-center gap-3 pt-16 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-gold" />
            <p className="text-sm text-muted-foreground">Preparing your prayer…</p>
          </div>
        )}

        {stages.length > 0 && (
          <div className="space-y-4 animate-fade-in">
            {stages.map((stage, i) => {
              const done = completedStageIds.includes(stage.id);
              return (
                <section
                  key={stage.id}
                  className={`rounded-2xl border p-5 transition-all ${
                    done
                      ? 'border-gold/40 bg-card/60'
                      : 'border-border bg-card'
                  }`}
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                        Stage {i + 1}
                      </p>
                      <h2 className={`mt-1 font-serif text-lg font-medium ${done ? 'text-gold' : 'text-foreground'}`}>
                        {stage.title}
                      </h2>
                    </div>
                    <button
                      onClick={() => toggleStage(stage.id)}
                      disabled={completed}
                      className="shrink-0 transition-transform active:scale-90 disabled:opacity-60"
                      aria-label={done ? 'Mark stage incomplete' : 'Mark stage complete'}
                    >
                      {done ? (
                        <CheckCircle2 className="h-6 w-6 text-gold" />
                      ) : (
                        <Circle className="h-6 w-6 text-muted-foreground/60" />
                      )}
                    </button>
                  </div>
                  {stage.body && (
                    <article className="prose prose-invert prose-sm max-w-none prose-headings:font-serif prose-headings:text-gold prose-headings:font-medium prose-p:text-foreground/90 prose-p:leading-relaxed prose-li:text-foreground/90 prose-strong:text-foreground prose-em:text-gold/70">
                      <ReactMarkdown>{stage.body}</ReactMarkdown>
                    </article>
                  )}
                </section>
              );
            })}
          </div>
        )}
        <div ref={bottomRef} />
      </main>

      {/* Footer */}
      <footer className="sticky bottom-0 border-t border-border bg-background/80 px-6 py-4 backdrop-blur-md">
        <button
          onClick={markComplete}
          disabled={completed || marking || loading}
          className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-medium transition-all active:scale-[0.98] ${
            completed
              ? 'bg-secondary text-gold'
              : 'bg-gold text-primary-foreground hover:brightness-110'
          } disabled:opacity-60`}
        >
          {marking ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : completed ? (
            <>
              <Check className="h-4 w-4" />
              <span>Completed</span>
            </>
          ) : totalStages > 0 && doneCount < totalStages ? (
            <span>Finish Prayer ({doneCount}/{totalStages})</span>
          ) : (
            <span>Mark as Complete</span>
          )}
        </button>
      </footer>
    </div>
  );
};

export default PrayerDetail;
