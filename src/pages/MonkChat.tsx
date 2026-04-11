import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import { useUserProfile } from '@/hooks/useUserProfile';
import { SaintAvatar } from '@/components/SaintAvatar';
import { SPIRITUAL_GUIDES, SpiritualGuideKey } from '@/lib/guides';

type Msg = { role: 'user' | 'assistant'; content: string };

const SUGGESTED_PROMPTS = [
  'Help me pray',
  'I feel anxious',
  'Guide my reflection',
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/monk-chat`;

async function streamChat({
  messages,
  preferences,
  onDelta,
  onDone,
}: {
  messages: Msg[];
  preferences?: { seeking?: string[]; experience_level?: string; spiritual_guide?: string };
  onDelta: (t: string) => void;
  onDone: () => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages, preferences }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: 'Something went wrong.' }));
    throw new Error(err.error || 'Failed to connect.');
  }

  if (!resp.body) throw new Error('No response stream.');

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  let done = false;

  while (!done) {
    const { done: rd, value } = await reader.read();
    if (rd) break;
    buf += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = buf.indexOf('\n')) !== -1) {
      let line = buf.slice(0, idx);
      buf = buf.slice(idx + 1);
      if (line.endsWith('\r')) line = line.slice(0, -1);
      if (!line.startsWith('data: ') || line.trim() === '' || line.startsWith(':')) continue;
      const json = line.slice(6).trim();
      if (json === '[DONE]') { done = true; break; }
      try {
        const p = JSON.parse(json);
        const c = p.choices?.[0]?.delta?.content;
        if (c) onDelta(c);
      } catch { buf = line + '\n' + buf; break; }
    }
  }
  onDone();
}

const MonkChat = () => {
  const { user, loading } = useAuth();
  const { profile } = useUserProfile();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const guideKey = (profile?.spiritual_guide || 'monk') as SpiritualGuideKey;
  const guide = SPIRITUAL_GUIDES[guideKey] || SPIRITUAL_GUIDES.monk;

  // Load history
  useEffect(() => {
    if (!user) return;
    supabase
      .from('chat_messages')
      .select('role, content')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) setMessages(data as Msg[]);
        setHistoryLoaded(true);
      });
  }, [user]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  const send = async (text: string) => {
    if (!text.trim() || isStreaming) return;
    const userMsg: Msg = { role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);

    // Save user message
    supabase.from('chat_messages').insert({ user_id: user.id, role: 'user', content: userMsg.content });

    let assistantContent = '';
    const upsert = (chunk: string) => {
      assistantContent += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantContent } : m));
        }
        return [...prev, { role: 'assistant', content: assistantContent }];
      });
    };

    try {
      await streamChat({
        messages: [...messages, userMsg],
        preferences: profile ? { seeking: profile.seeking, experience_level: profile.experience_level, spiritual_guide: profile.spiritual_guide } : undefined,
        onDelta: upsert,
        onDone: () => {
          setIsStreaming(false);
          // Save assistant message
          if (assistantContent) {
            supabase.from('chat_messages').insert({ user_id: user.id, role: 'assistant', content: assistantContent });
          }
        },
      });
    } catch (e: any) {
      setIsStreaming(false);
      toast.error(e.message || 'Something went wrong.');
    }
  };

  const showSuggestions = messages.length === 0 && historyLoaded;

  // Determine avatar state
  const lastMsg = messages[messages.length - 1];
  const avatarState = isStreaming
    ? (lastMsg?.role === 'assistant' ? 'speaking' : 'listening')
    : messages.length > 0
      ? 'reflecting'
      : 'idle';

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header with avatar */}
      <header className="flex items-center gap-3 border-b border-border px-4 py-3">
        <button
          onClick={() => navigate('/')}
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <SaintAvatar guideKey={guideKey} size="sm" state={avatarState as any} />
        <div className="flex-1">
          <h1 className="font-serif text-base font-medium text-foreground">{guide.label}</h1>
          <p className="text-[10px] text-muted-foreground">
            {isStreaming
              ? (lastMsg?.role === 'assistant' ? 'Speaking…' : 'Listening…')
              : 'Spiritual guidance, anytime'}
          </p>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {showSuggestions && (
          <div className="flex flex-col items-center justify-center h-full gap-6 animate-fade-in">
            <SaintAvatar guideKey={guideKey} size="xl" state="idle" showName showQuote />
            <div className="text-center mt-2">
              <h2 className="font-serif text-lg text-foreground">How can I help you today?</h2>
              <p className="text-xs text-muted-foreground mt-1">Ask anything about prayer or faith</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTED_PROMPTS.map(p => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  className="rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground transition-all hover:border-primary/40 hover:glow-gold active:scale-95"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex items-end gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className="shrink-0 mb-1">
                <SaintAvatar
                  guideKey={guideKey}
                  size="sm"
                  state={
                    isStreaming && i === messages.length - 1
                      ? 'speaking'
                      : 'reflecting'
                  }
                  className="h-8 w-8 [&>div>div:first-child]:h-8 [&>div>div:first-child]:w-8"
                />
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-md'
                  : 'bg-card text-card-foreground rounded-bl-md border border-border'
              }`}
            >
              {m.role === 'assistant' ? (
                <div className="prose prose-sm prose-invert max-w-none [&_p]:m-0">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              ) : (
                m.content
              )}
            </div>
          </div>
        ))}

        {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex items-end gap-2 justify-start">
            <div className="shrink-0 mb-1">
              <SaintAvatar
                guideKey={guideKey}
                size="sm"
                state="listening"
                className="h-8 w-8 [&>div>div:first-child]:h-8 [&>div>div:first-child]:w-8"
              />
            </div>
            <div className="rounded-2xl rounded-bl-md bg-card border border-border px-4 py-2.5">
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse" />
                <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse [animation-delay:0.2s]" />
                <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border px-4 py-3 pb-safe">
        <form
          onSubmit={e => { e.preventDefault(); send(input); }}
          className="flex items-end gap-2"
        >
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }
            }}
            placeholder={`Ask ${guide.label}...`}
            rows={1}
            className="flex-1 resize-none rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-40 active:scale-95"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default MonkChat;
