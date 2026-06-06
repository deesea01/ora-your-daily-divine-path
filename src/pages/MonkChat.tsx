import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Send, Mic, MicOff, Volume2, VolumeX, Trash2, Play, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import { useUserProfile } from '@/hooks/useUserProfile';
import { SaintAvatar } from '@/components/SaintAvatar';
import { GuideSwitcher } from '@/components/GuideSwitcher';
import { SPIRITUAL_GUIDES, SpiritualGuideKey } from '@/lib/guides';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSaintVoice, SaintMood } from '@/hooks/useSaintVoice';
import { useLanguage } from '@/contexts/LanguageContext';
import { notifyAdminError } from '@/lib/notifyAdmin';
import { useEntitlement, isPremiumGuide, FREE_GUIDE_KEY } from '@/hooks/useEntitlement';
import { UpgradePrompt } from '@/components/UpgradePrompt';
import { VoiceUnavailableNote } from '@/components/VoiceUnavailableNote';
import SEO from '@/components/SEO';

const MOODS: { value: SaintMood; label: string }[] = [
  { value: 'casual', label: 'Casual' },
  { value: 'prayer', label: 'Prayer' },
  { value: 'confession', label: 'Confession' },
  { value: 'reflection', label: 'Reflection' },
];

const SPEED_OPTIONS = [0.75, 1, 1.25];

type Msg = { role: 'user' | 'assistant'; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/monk-chat`;

async function streamChat({
  messages,
  preferences,
  onDelta,
  onDone,
}: {
  messages: Msg[];
  preferences?: { seeking?: string[]; experience_level?: string; spiritual_guide?: string; language?: string; mood?: SaintMood };
  onDelta: (t: string) => void;
  onDone: () => void;
}) {
  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token;
  if (!accessToken) throw new Error('Not authenticated');

  const resp = await fetch(CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
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
  const { profile, setGuide } = useUserProfile();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const speech = useSpeechRecognition();
  const { isPremium, canChat, chatRemaining, chatLimit, refreshChatCount } = useEntitlement();
  const storedGuide = (profile?.spiritual_guide || 'st_francis') as SpiritualGuideKey;
  const safeStored: SpiritualGuideKey = SPIRITUAL_GUIDES[storedGuide] ? storedGuide : ('st_francis' as SpiritualGuideKey);
  const guideKey: SpiritualGuideKey = isPremium ? safeStored : (FREE_GUIDE_KEY as SpiritualGuideKey);
  const voice = useSaintVoice(guideKey);

  // Mood: infer from referrer/route, allow user override
  const inferInitialMood = (): SaintMood => {
    if (typeof document === 'undefined') return 'casual';
    const ref = document.referrer || '';
    if (ref.includes('/confession')) return 'confession';
    if (ref.includes('/prayer') || ref.includes('/rosary')) return 'prayer';
    if (ref.includes('/journal')) return 'reflection';
    return 'casual';
  };
  const [mood, setMood] = useState<SaintMood>(inferInitialMood);

  const guide = SPIRITUAL_GUIDES[guideKey] || SPIRITUAL_GUIDES.st_francis;

  const SUGGESTED_PROMPTS = [
    t.helpMePray,
    t.iFeelAnxious,
    t.guideMyReflection,
  ];

  const handleSwitchGuide = async (key: SpiritualGuideKey) => {
    if (!isPremium && isPremiumGuide(key)) {
      setUpgradeOpen(true);
      return;
    }
    await setGuide(key);
  };

  useEffect(() => {
    if (!user) return;
    setHistoryLoaded(false);
    setMessages([]);
    supabase
      .from('chat_messages')
      .select('role, content')
      .eq('user_id', user.id)
      .ilike('content', `%[guide:${guideKey}]%`)
      .order('created_at', { ascending: true })
      .then(({ data: taggedData }) => {
        if (taggedData && taggedData.length > 0) {
          setMessages(taggedData.map(m => ({
            ...m,
            content: m.content.replace(/\s*\[guide:\w+\]\s*/g, ''),
          })) as Msg[]);
          setHistoryLoaded(true);
        } else {
          supabase
            .from('chat_messages')
            .select('role, content')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true })
            .then(({ data }) => {
              if (data) {
                const filtered = data.filter(m => !m.content.match(/\[guide:\w+\]/));
                setMessages(filtered as Msg[]);
              }
              setHistoryLoaded(true);
            });
        }
      });
  }, [user, guideKey]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (speech.transcript) {
      setInput(speech.transcript);
    }
  }, [speech.transcript]);

  useEffect(() => {
    if (!speech.isListening && speech.transcript) {
      send(speech.transcript);
    }
  }, [speech.isListening]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  const clearConversation = async () => {
    if (!user) return;
    await supabase
      .from('chat_messages')
      .delete()
      .eq('user_id', user.id)
      .ilike('content', `%[guide:${guideKey}]%`);
    
    const { data: untagged } = await supabase
      .from('chat_messages')
      .select('id, content')
      .eq('user_id', user.id);
    
    if (untagged) {
      const legacyIds = untagged
        .filter(m => !m.content.match(/\[guide:\w+\]/))
        .map(m => m.id);
      if (legacyIds.length > 0) {
        await supabase
          .from('chat_messages')
          .delete()
          .in('id', legacyIds);
      }
    }

    setMessages([]);
    voice.stop();
    toast.success(t.conversationCleared);
  };

  const send = async (text: string) => {
    if (!text.trim() || isStreaming) return;
    if (!canChat) {
      setUpgradeOpen(true);
      return;
    }
    const userMsg: Msg = { role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);

    // Persist the user message + saint interaction (await so the request actually fires)
    try {
      await Promise.all([
        supabase.from('chat_messages').insert({
          user_id: user.id,
          role: 'user',
          content: `${userMsg.content} [guide:${guideKey}]`,
        }),
        supabase.from('saint_interactions').insert({
          user_id: user.id,
          saint_key: guideKey,
          interaction_type: 'chat',
        }),
      ]);
    } catch (logErr) {
      console.error('Failed to log chat/saint interaction:', logErr);
    }

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
        preferences: profile ? {
          seeking: profile.seeking,
          experience_level: profile.experience_level,
          spiritual_guide: profile.spiritual_guide,
          language,
          mood,
        } : { language, mood },
        onDelta: upsert,
        onDone: async () => {
          setIsStreaming(false);
          if (assistantContent) {
            try {
              await supabase.from('chat_messages').insert({
                user_id: user.id,
                role: 'assistant',
                content: `${assistantContent} [guide:${guideKey}]`,
              });
            } catch (logErr) {
              console.error('Failed to log assistant message:', logErr);
            }
            voice.play(assistantContent, mood);
          }
          refreshChatCount();
        },
      });
    } catch (e: any) {
      setIsStreaming(false);
      const fallback = 'Peace be with you. Take a moment to pray quietly and reflect.';
      upsert(fallback);
      try {
        await supabase.from('chat_messages').insert({
          user_id: user.id,
          role: 'assistant',
          content: `${fallback} [guide:${guideKey}]`,
        });
      } catch (logErr) {
        console.error('Failed to log fallback message:', logErr);
      }
      console.error('AI chat error:', e);
      notifyAdminError('monk-chat', e?.message || String(e), user.id, { guide: guideKey });
      toast.error('Spiritual guidance is temporarily unavailable. Please try again later.');
    }
  };

  const showSuggestions = messages.length === 0 && historyLoaded;

  const lastMsg = messages[messages.length - 1];
  const avatarState = isStreaming
    ? (lastMsg?.role === 'assistant' ? 'speaking' : 'listening')
    : messages.length > 0
      ? 'reflecting'
      : 'idle';

  return (
    <div className="flex h-screen flex-col bg-background">
      <SEO
        title="Talk with a Catholic Saint — Daily Prayer & Reflection | Ora"
        description="Have a sacred conversation with a Catholic saint companion for daily devotion, prayer, scripture, and spiritual guidance. Grow closer to God with Ora."
        canonicalPath="/monk-chat"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Ora — Talk with a Saint',
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Web, iOS',
          description: 'Sacred AI conversations with Catholic saint companions for prayer, reflection, and spiritual guidance.',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        }}
      />
      <h1 className="sr-only">Talk with a Catholic Saint Companion</h1>
      <header className="flex items-center gap-3 border-b border-border px-4 py-3">
        <button
          onClick={() => navigate('/')}
          aria-label="Back to home"
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <SaintAvatar guideKey={guideKey} size="sm" state={avatarState as any} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <h2 className="font-serif text-base font-medium text-foreground truncate">{guide.label}</h2>
            <GuideSwitcher currentGuide={guideKey} onSelect={handleSwitchGuide} />
          </div>
          <p className="text-[10px] text-muted-foreground">
            {isStreaming
              ? (lastMsg?.role === 'assistant' ? t.speaking : t.listening)
              : speech.isListening
                ? t.listeningToYou
                : t.spiritualGuidanceAnytime}
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearConversation}
            aria-label={t.clearConversation}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-destructive"
            title={t.clearConversation}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={voice.toggle}
          aria-label={voice.isEnabled ? t.muteVoice : t.enableVoice}
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
          title={voice.isEnabled ? t.muteVoice : t.enableVoice}
        >
          {voice.isEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {showSuggestions && (
          <div className="flex flex-col items-center justify-center h-full gap-6 animate-fade-in">
            <SaintAvatar guideKey={guideKey} size="xl" state="idle" showName showQuote reverent />
            <div className="text-center mt-2">
              <h2 className="font-serif text-lg text-foreground">{t.helpYouToday}</h2>
              <p className="text-xs text-muted-foreground mt-1">{t.askAnything}</p>
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
                  state={isStreaming && i === messages.length - 1 ? 'speaking' : 'reflecting'}
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
                <>
                  <div className="prose prose-sm prose-invert max-w-none [&_p]:m-0">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                  {m.content && !(isStreaming && i === messages.length - 1) && (
                    <button
                      onClick={() => voice.play(m.content, mood, { force: true })}
                      className="mt-2 inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors"
                      title="Replay voice"
                    >
                      {voice.isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                      <span>Replay</span>
                    </button>
                  )}
                </>
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

      <div className="border-t border-border px-4 py-3 pb-safe space-y-2">
        {!isPremium && (
          <button
            type="button"
            onClick={() => setUpgradeOpen(true)}
            className="w-full text-center text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            {chatRemaining > 0
              ? `${chatRemaining} of ${chatLimit} free chats left today · Unlock the saints`
              : `You've used today's free chats · Unlock your prayer life for unlimited`}
          </button>
        )}
        {voice.isEnabled && (
          <div className="flex items-center justify-between gap-2 text-[11px]">
            <div className="flex flex-wrap gap-1">
              {MOODS.map(m => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMood(m.value)}
                  className={`rounded-full px-2.5 py-0.5 border transition-colors ${
                    mood === m.value
                      ? 'bg-primary/15 border-primary/40 text-primary'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              {SPEED_OPTIONS.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => voice.setSpeed(s)}
                  className={`rounded-full px-2 py-0.5 border transition-colors ${
                    voice.speed === s
                      ? 'bg-primary/15 border-primary/40 text-primary'
                      : 'border-border hover:text-foreground'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        )}
        {voice.isEnabled && voice.isUnavailable && (
          <VoiceUnavailableNote onDismiss={voice.clearUnavailable} className="mb-1" />
        )}
        <form
          onSubmit={e => { e.preventDefault(); send(input); }}
          className="flex items-end gap-2"
        >
          {speech.isSupported && (
            <button
              type="button"
              onClick={speech.toggle}
              aria-label={speech.isListening ? t.stopListening : t.speakToSaint}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all active:scale-95 ${
                speech.isListening
                  ? 'bg-destructive text-destructive-foreground animate-pulse'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              }`}
              title={speech.isListening ? t.stopListening : t.speakToSaint}
            >
              {speech.isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
          )}
          <label htmlFor="monk-chat-input" className="sr-only">Message your saint companion</label>
          <textarea
            id="monk-chat-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }
            }}
            placeholder={speech.isListening ? `${t.listening}` : `${t.askSaint} ${guide.label}...`}
            rows={1}
            aria-label="Message your saint companion"
            className="flex-1 resize-none rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            aria-label="Send message"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-40 active:scale-95"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
      <UpgradePrompt open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </div>
  );
};

export default MonkChat;
