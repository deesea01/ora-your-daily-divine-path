import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams, Navigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Heart, Play, Pause, SkipForward, Volume2, RotateCcw, Gauge, BookOpen, Repeat } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePrayerLibrary } from '@/hooks/usePrayerLibrary';
import { getPrayerById, SAINT_VOICE_THEMES, PRAYERS, GUIDE_TO_VOICE_THEME } from '@/lib/prayerLibrary';
import { getPrayerTranslation } from '@/lib/prayerTranslations';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useSaintVoice } from '@/hooks/useSaintVoice';
import { SpiritualGuideKey } from '@/lib/guides';

type PlaybackMode = 'normal' | 'slow' | 'line-by-line';

function splitLines(text: string): string[] {
  return text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
}

const PrayerView = () => {
  const { user, loading: authLoading } = useAuth();
  const { prayerId } = useParams<{ prayerId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { favorites, toggleFavorite, recordPractice, loading } = usePrayerLibrary();
  const { language, t } = useLanguage();
  const { profile } = useUserProfile();

  const prayer = prayerId ? getPrayerById(prayerId) : undefined;

  // Get localized prayer content
  const localizedPrayer = prayer ? (() => {
    const tr = getPrayerTranslation(prayer.id, language);
    if (!tr) return prayer;
    return {
      ...prayer,
      title: tr.title,
      description: tr.description,
      text: tr.text,
      lines: splitLines(tr.text),
    };
  })() : undefined;

  const [tab, setTab] = useState<'read' | 'listen' | 'practice'>('read');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLine, setCurrentLine] = useState(-1);
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>('normal');
  const [repeatMode, setRepeatMode] = useState(false);

  // Auto-select voice theme based on user's spiritual guide
  const defaultVoiceTheme = profile?.spiritual_guide
    ? GUIDE_TO_VOICE_THEME[profile.spiritual_guide] || null
    : null;
  const [voiceTheme, setVoiceTheme] = useState<string | null>(defaultVoiceTheme);
  const [showThemes, setShowThemes] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const playingRef = useRef(false);

  // Update voice theme when profile loads
  useEffect(() => {
    if (profile?.spiritual_guide && voiceTheme === null) {
      const mapped = GUIDE_TO_VOICE_THEME[profile.spiritual_guide];
      if (mapped) setVoiceTheme(mapped);
    }
  }, [profile?.spiritual_guide]);

  // Routine queue
  const routineIds: string[] = (() => {
    try {
      const r = searchParams.get('routine');
      return r ? JSON.parse(r) : [];
    } catch { return []; }
  })();
  const currentRoutineIndex = routineIds.indexOf(prayerId || '');
  const nextInRoutine = currentRoutineIndex >= 0 && currentRoutineIndex < routineIds.length - 1 ? routineIds[currentRoutineIndex + 1] : null;

  const stopSpeech = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setCurrentLine(-1);
    playingRef.current = false;
  }, []);

  useEffect(() => {
    return () => { window.speechSynthesis.cancel(); };
  }, []);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (!prayer || !localizedPrayer) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Prayer not found.</p>
      </div>
    );
  }

  const isFav = favorites.has(prayer.id);
  const theme = voiceTheme ? SAINT_VOICE_THEMES.find(t => t.key === voiceTheme) : null;

  // Get the guide label for display
  const guideLabel = profile?.spiritual_guide
    ? (() => {
      const mapped = GUIDE_TO_VOICE_THEME[profile.spiritual_guide];
      const found = SAINT_VOICE_THEMES.find(t => t.key === mapped);
      return found ? `${found.emoji} ${found.label}` : null;
    })()
    : null;

  const speakLine = (lineIndex: number) => {
    if (lineIndex >= localizedPrayer.lines.length) {
      if (repeatMode) {
        speakLine(0);
      } else {
        setIsPlaying(false);
        setCurrentLine(-1);
        playingRef.current = false;
      }
      return;
    }

    setCurrentLine(lineIndex);
    const utterance = new SpeechSynthesisUtterance(localizedPrayer.lines[lineIndex]);
    utterance.rate = playbackMode === 'slow' ? 0.65 : (theme?.rate ?? 0.85);
    utterance.pitch = theme?.pitch ?? 0.9;

    // Set language for proper pronunciation
    const langMap: Record<string, string> = {
      en: 'en-US', es: 'es-ES', it: 'it-IT', pt: 'pt-BR', fr: 'fr-FR', tl: 'fil-PH'
    };
    utterance.lang = langMap[language] || 'en-US';

    utterance.onend = () => {
      if (!playingRef.current) return;
      if (playbackMode === 'line-by-line') {
        setIsPlaying(false);
        playingRef.current = false;
        setCurrentLine(lineIndex);
      } else {
        speakLine(lineIndex + 1);
      }
    };
    utterance.onerror = () => {
      setIsPlaying(false);
      playingRef.current = false;
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handlePlay = () => {
    if (isPlaying) {
      stopSpeech();
      return;
    }
    setIsPlaying(true);
    playingRef.current = true;
    const startLine = currentLine >= 0 && playbackMode === 'line-by-line' ? currentLine + 1 : 0;
    speakLine(startLine);
  };

  const handleNextLine = () => {
    if (playbackMode === 'line-by-line' && currentLine >= 0) {
      stopSpeech();
      setIsPlaying(true);
      playingRef.current = true;
      speakLine(currentLine + 1);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border px-4 py-4">
        <button onClick={() => navigate('/prayer-library')} className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground" aria-label={t.back}>
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-serif text-lg font-medium text-foreground truncate">{localizedPrayer.title}</h1>
          <p className="text-xs text-muted-foreground">{localizedPrayer.estimatedMinutes} min</p>
        </div>
        <button onClick={() => toggleFavorite(prayer.id)} className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground">
          <Heart className={`h-4 w-4 ${isFav ? 'text-gold fill-gold' : ''}`} />
        </button>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {(['read', 'listen', 'practice'] as const).map(tabKey => (
          <button
            key={tabKey}
            onClick={() => { setTab(tabKey); if (tabKey !== 'listen') stopSpeech(); }}
            className={`flex-1 py-3 text-xs font-medium capitalize transition-all ${tab === tabKey ? 'text-gold border-b-2 border-gold' : 'text-muted-foreground'}`}
          >
            {tabKey === 'read' && <BookOpen className="inline h-3.5 w-3.5 mr-1" />}
            {tabKey === 'listen' && <Volume2 className="inline h-3.5 w-3.5 mr-1" />}
            {tabKey === 'practice' && <Gauge className="inline h-3.5 w-3.5 mr-1" />}
            {tabKey === 'read' ? t.readPrayer : tabKey === 'listen' ? t.listenPrayer : t.practicePrayer}
          </button>
        ))}
      </div>

      <main className="flex-1 overflow-y-auto px-6 py-6">
        {tab === 'read' && (
          <div className="animate-fade-in space-y-4">
            <div className="rounded-xl border border-gold/20 bg-card p-5">
              <p className="font-serif text-base text-foreground leading-relaxed whitespace-pre-line">{localizedPrayer.text}</p>
            </div>
            <p className="text-xs text-muted-foreground italic text-center">{localizedPrayer.description}</p>
          </div>
        )}

        {tab === 'listen' && (
          <div className="animate-fade-in space-y-4">
            {/* Voice theme selector */}
            <button
              onClick={() => setShowThemes(!showThemes)}
              className="w-full rounded-xl border border-border bg-card p-3 text-left text-xs"
            >
              <p className="text-muted-foreground">
                Voice theme: <span className="text-foreground">{theme ? theme.label : 'Default'}</span>
                {voiceTheme === defaultVoiceTheme && defaultVoiceTheme && (
                  <span className="text-gold ml-1">(your guide)</span>
                )}
              </p>
            </button>

            {showThemes && (
              <div className="space-y-1 animate-fade-in">
                <button
                  onClick={() => { setVoiceTheme(null); setShowThemes(false); }}
                  className={`w-full rounded-lg border p-3 text-left text-xs transition-all ${!voiceTheme ? 'border-gold/40 bg-gold/10' : 'border-border'}`}
                >
                  <p className="font-medium text-foreground">Default Voice</p>
                  <p className="text-muted-foreground mt-0.5">Standard narration</p>
                </button>
                {SAINT_VOICE_THEMES.map(st => {
                  const isGuideTheme = st.key === defaultVoiceTheme;
                  return (
                    <button
                      key={st.key}
                      onClick={() => { setVoiceTheme(st.key); setShowThemes(false); }}
                      className={`w-full rounded-lg border p-3 text-left text-xs transition-all ${voiceTheme === st.key ? 'border-gold/40 bg-gold/10' : 'border-border'}`}
                    >
                      <p className="font-medium text-foreground">
                        {st.emoji} {st.label}
                        {isGuideTheme && <span className="text-gold ml-1 text-[10px]">★ Your Guide</span>}
                      </p>
                      <p className="text-muted-foreground mt-0.5">{st.description}</p>
                    </button>
                  );
                })}
                <p className="text-[10px] text-muted-foreground italic text-center pt-2">
                  These are devotional narration styles inspired by each saint's spirituality — not literal voices.
                </p>
              </div>
            )}

            {/* Playback modes */}
            <div className="flex gap-2">
              {([['normal', 'Normal'], ['slow', 'Slow'], ['line-by-line', 'Line by Line']] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => { setPlaybackMode(key); stopSpeech(); }}
                  className={`flex-1 rounded-lg border py-2 text-xs transition-all ${playbackMode === key ? 'border-gold/40 bg-gold/10 text-gold' : 'border-border text-muted-foreground'}`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Prayer text with highlighting */}
            <div className="rounded-xl border border-gold/20 bg-card p-5">
              {localizedPrayer.lines.map((line, i) => (
                <p
                  key={i}
                  className={`font-serif text-base leading-relaxed transition-all duration-300 ${
                    currentLine === i ? 'text-gold font-medium' : 'text-foreground/70'
                  } ${i > 0 ? 'mt-1' : ''}`}
                >
                  {line}
                </p>
              ))}
            </div>

            {/* Playback controls */}
            <div className="flex items-center justify-center gap-4 py-4">
              <button onClick={() => { stopSpeech(); }} className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
              <button onClick={handlePlay} className="flex h-14 w-14 items-center justify-center rounded-full bg-gold text-primary-foreground shadow-lg hover:opacity-90 transition-all active:scale-95">
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
              </button>
              {playbackMode === 'line-by-line' && (
                <button onClick={handleNextLine} className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground">
                  <SkipForward className="h-4 w-4" />
                </button>
              )}
              <button onClick={() => setRepeatMode(!repeatMode)} className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all ${repeatMode ? 'border-gold/40 bg-gold/10 text-gold' : 'border-border text-muted-foreground'}`}>
                <Repeat className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {tab === 'practice' && (
          <PracticeMode prayer={localizedPrayer} recordPractice={recordPractice} />
        )}
      </main>

      {/* Next in routine */}
      {nextInRoutine && (
        <div className="border-t border-border px-4 py-3 bg-card">
          <button
            onClick={() => navigate(`/prayer-library/${nextInRoutine}?routine=${searchParams.get('routine')}`)}
            className="w-full flex items-center justify-between rounded-xl border border-gold/20 bg-gold/5 p-3"
          >
            <div>
              <p className="text-xs text-muted-foreground">Next in routine</p>
              <p className="text-sm font-medium text-foreground">
                {(() => {
                  const np = PRAYERS.find(p => p.id === nextInRoutine);
                  if (!np) return '';
                  const tr = getPrayerTranslation(np.id, language);
                  return tr?.title || np.title;
                })()}
              </p>
            </div>
            <SkipForward className="h-4 w-4 text-gold" />
          </button>
        </div>
      )}
    </div>
  );
};

// Practice mode component
function PracticeMode({ prayer, recordPractice }: { prayer: { id: string; lines: string[]; title: string }; recordPractice: (id: string) => Promise<void> }) {
  const [mode, setMode] = useState<'full' | 'fill-blank' | 'progressive' | 'first-letter' | 'tap-reveal'>('full');
  const [revealedLines, setRevealedLines] = useState<Set<number>>(new Set());
  const [hideLevel, setHideLevel] = useState(0);
  const [completed, setCompleted] = useState(false);

  const handleComplete = async () => {
    await recordPractice(prayer.id);
    setCompleted(true);
  };

  const processLine = (line: string, index: number): string => {
    if (mode === 'full') return line;

    if (mode === 'tap-reveal') {
      return revealedLines.has(index) ? line : '• • •';
    }

    if (mode === 'first-letter') {
      return line.split(' ').map(w => w.charAt(0) + '___').join(' ');
    }

    if (mode === 'fill-blank') {
      return line.split(' ').map((w, i) => i % 3 === 1 ? '____' : w).join(' ');
    }

    if (mode === 'progressive') {
      const words = line.split(' ');
      const hidePercent = (hideLevel + 1) * 0.25;
      return words.map((w, i) => {
        const shouldHide = (i / words.length) < hidePercent && i > 0;
        return shouldHide ? '____' : w;
      }).join(' ');
    }

    return line;
  };

  if (completed) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/15 mb-4">
          <BookOpen className="h-8 w-8 text-gold" />
        </div>
        <p className="font-serif text-xl text-foreground">Practice Complete!</p>
        <p className="text-sm text-muted-foreground mt-2">"{prayer.title}" recorded.</p>
        <button onClick={() => { setCompleted(false); setRevealedLines(new Set()); }} className="mt-4 text-xs text-gold underline">
          Practice Again
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-4">
      {/* Mode selector */}
      <div className="flex flex-wrap gap-2">
        {([
          ['full', 'Full Text'],
          ['fill-blank', 'Fill-in-Blank'],
          ['progressive', 'Progressive Hide'],
          ['first-letter', 'First Letter'],
          ['tap-reveal', 'Tap to Reveal'],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => { setMode(key); setRevealedLines(new Set()); setHideLevel(0); }}
            className={`rounded-full border px-3 py-1.5 text-xs transition-all ${mode === key ? 'border-gold/40 bg-gold/10 text-gold' : 'border-border text-muted-foreground'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Progressive hide level */}
      {mode === 'progressive' && (
        <div className="flex items-center gap-2">
          <p className="text-xs text-muted-foreground">Difficulty:</p>
          {[0, 1, 2, 3].map(lvl => (
            <button
              key={lvl}
              onClick={() => setHideLevel(lvl)}
              className={`h-7 w-7 rounded-full border text-xs transition-all ${hideLevel === lvl ? 'border-gold bg-gold/20 text-gold' : 'border-border text-muted-foreground'}`}
            >
              {lvl + 1}
            </button>
          ))}
        </div>
      )}

      {/* Prayer text */}
      <div className="rounded-xl border border-gold/20 bg-card p-5 space-y-1">
        {prayer.lines.map((line, i) => (
          <p
            key={i}
            onClick={() => {
              if (mode === 'tap-reveal') {
                setRevealedLines(prev => new Set(prev).add(i));
              }
            }}
            className={`font-serif text-base leading-relaxed transition-all ${
              mode === 'tap-reveal' && !revealedLines.has(i)
                ? 'text-gold/40 cursor-pointer hover:text-gold/60'
                : 'text-foreground'
            }`}
          >
            {processLine(line, i)}
          </p>
        ))}
      </div>

      {/* Complete button */}
      <button
        onClick={handleComplete}
        className="w-full rounded-xl bg-gold py-3 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
      >
        Mark Practice Complete
      </button>
    </div>
  );
}

export default PrayerView;
