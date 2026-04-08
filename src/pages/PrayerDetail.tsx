import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft, Check, Sun, CloudSun, Moon, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/useUserProfile';
import ReactMarkdown from 'react-markdown';

const prayerMeta = {
  morning: { title: 'Morning Lauds', subtitle: 'Start your day in grace', Icon: Sun },
  midday: { title: 'Midday Angelus', subtitle: 'Pause and remember', Icon: CloudSun },
  night: { title: 'Night Compline', subtitle: 'Rest in His peace', Icon: Moon },
} as const;

type PrayerType = keyof typeof prayerMeta;

const PrayerDetail = () => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [marking, setMarking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const prayerType = type as PrayerType;
  const meta = prayerMeta[prayerType];

  // Check completion status
  useEffect(() => {
    if (!user || !meta) return;
    const today = new Date().toISOString().split('T')[0];
    supabase
      .from('prayer_completions')
      .select('id')
      .eq('user_id', user.id)
      .eq('prayer_date', today)
      .eq('prayer_type', prayerType)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setCompleted(true);
      });
  }, [user, prayerType]);

  // Fetch AI-generated prayer
  useEffect(() => {
    if (!user || !meta) return;
    setLoading(true);
    setContent('');

    const fetchPrayer = async () => {
      try {
        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
        const res = await fetch(
          `https://${projectId}.supabase.co/functions/v1/prayer-guide`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({ prayerType }),
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
      } catch (err) {
        console.error(err);
        setContent('_Unable to load prayer. Please try again._');
      } finally {
        setLoading(false);
      }
    };
    fetchPrayer();
  }, [user, prayerType]);

  // Auto-scroll as content streams
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [content]);

  const markComplete = async () => {
    if (!user || completed || marking) return;
    setMarking(true);
    const today = new Date().toISOString().split('T')[0];
    const { error } = await supabase.from('prayer_completions').insert({
      user_id: user.id,
      prayer_date: today,
      prayer_type: prayerType,
    });
    if (!error) setCompleted(true);
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

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/80 px-4 py-4 backdrop-blur-md">
        <button
          onClick={() => navigate('/')}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
            <Icon className="h-4 w-4 text-gold" />
          </div>
          <div>
            <h1 className="font-serif text-lg font-medium text-foreground">{meta.title}</h1>
            <p className="text-xs text-muted-foreground">{meta.subtitle}</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-6 py-6">
        {loading && !content && (
          <div className="flex flex-col items-center gap-3 pt-16 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-gold" />
            <p className="text-sm text-muted-foreground">Preparing your prayer…</p>
          </div>
        )}

        {content && (
          <article className="prose prose-invert prose-sm max-w-none animate-fade-in prose-headings:font-serif prose-headings:text-gold prose-headings:font-medium prose-p:text-foreground/90 prose-p:leading-relaxed prose-li:text-foreground/90 prose-strong:text-foreground prose-em:text-gold/70">
            <ReactMarkdown>{content}</ReactMarkdown>
          </article>
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
          ) : (
            <span>Mark as Complete</span>
          )}
        </button>
      </footer>
    </div>
  );
};

export default PrayerDetail;
