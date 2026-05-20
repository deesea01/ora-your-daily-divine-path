import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft, Plus, Sparkles, BookOpen, Loader2, Trash2, ChevronDown, Lock, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useJournal } from '@/hooks/useJournal';
import { useEntitlement } from '@/hooks/useEntitlement';
import { humanizeLabel } from '@/lib/utils';
import { getVerseForMood, type ScriptureVerse } from '@/lib/scriptureByMood';
import { getSaintQuoteForMood, getBriefPrayerForMood, type SaintQuote, type BriefPrayer } from '@/lib/reflectionByMood';
import { VerseActions } from '@/components/VerseActions';
import SEO from '@/components/SEO';

const MOOD_OPTIONS = [
  { value: 'peaceful', label: '🕊️ Peaceful' },
  { value: 'grateful', label: '🙏 Grateful' },
  { value: 'struggling', label: '😔 Struggling' },
  { value: 'neutral', label: '😐 Neutral' },
  { value: 'joyful', label: '😊 Joyful' },
];

const TAG_SUGGESTIONS = ['gratitude', 'anger', 'patience', 'prayer', 'temptation', 'hope', 'forgiveness', 'anxiety'];

const JournalHome = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { entries, insight, loading, saving, analyzing, hasMore, saveEntry, deleteEntry, loadMore, analyzePatterns } = useJournal();
  const { isPremium, loading: entLoading } = useEntitlement();
  const [showWrite, setShowWrite] = useState(false);
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [savedVerse, setSavedVerse] = useState<ScriptureVerse | null>(null);
  const [savedQuote, setSavedQuote] = useState<SaintQuote | null>(null);
  const [savedPrayer, setSavedPrayer] = useState<BriefPrayer | null>(null);

  if (authLoading || loading || entLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-background px-6 pb-8 pt-safe flex flex-col">
        <header className="flex items-center gap-3 pt-4 pb-6 pr-14">
          <button onClick={() => navigate('/')} className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /></button>
          <h1 className="font-serif text-xl text-foreground">Spiritual Journal</h1>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gold/10">
            <Lock className="h-7 w-7 text-gold" />
          </div>
          <h2 className="font-serif text-2xl text-foreground mb-2">Reflect deeper, with the saints.</h2>
          <p className="text-sm text-muted-foreground max-w-xs mb-8">
            The journal, daily Examen, and AI-guided spiritual insights are part of premium. Start your 3-day free trial.
          </p>
          <button onClick={() => navigate('/paywall')} className="w-full max-w-xs rounded-xl bg-gold py-4 font-medium text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98]">
            Start your 3-day free trial
          </button>
        </div>
      </div>
    );
  }


  const handleSubmit = async () => {
    const chosenMood = mood;
    const result = await saveEntry(content, chosenMood || undefined, selectedTags);
    if (!result?.error) {
      setContent('');
      setSelectedTags([]);
      // Reveal a mood-matched verse, saint quote, and brief prayer in place of the form.
      const moodKey = chosenMood || 'neutral';
      setSavedVerse(getVerseForMood(moodKey));
      setSavedQuote(getSaintQuoteForMood(moodKey));
      setSavedPrayer(getBriefPrayerForMood(moodKey));
      setMood('');
    }
  };

  const closeWriteModal = () => {
    setShowWrite(false);
    setSavedVerse(null);
    setSavedQuote(null);
    setSavedPrayer(null);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  return (
    <div className="min-h-screen bg-background px-6 pb-8 pt-safe">
      <SEO title="Spiritual Journal — Daily Examen | Ora" description="Reflect on your day with the Ignatian Examen, voice journaling, and AI-guided spiritual insights." canonicalPath="/journal" noindex />
      <header className="flex items-center justify-between pt-6 pb-4 pr-14">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} aria-label="Back to home" className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="font-serif text-xl text-foreground">Spiritual Journal</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/journal/examen')}
            aria-label="Start daily Examen"
            className="flex h-10 items-center gap-1.5 rounded-full border border-gold/30 px-3 text-xs text-gold hover:bg-gold/10 transition-colors"
          >
            <BookOpen className="h-3.5 w-3.5" />
            Examen
          </button>
          <button
            onClick={() => setShowWrite(true)}
            aria-label="New journal entry"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gold text-primary-foreground"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Insight card */}
      {insight && (
        <section className="mb-6 animate-fade-in">
          <div className="rounded-xl border border-gold/20 bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-gold" />
              <h3 className="text-sm font-medium text-foreground">Your Current Focus</h3>
            </div>
            {insight.suggested_focus && (
              <p className="text-sm text-gold mb-2">{insight.suggested_focus}</p>
            )}
            {insight.summary && (
              <p className="text-xs text-muted-foreground mb-3">{insight.summary}</p>
            )}
            <div className="flex flex-wrap gap-1.5">
              {(insight.patterns as string[]).slice(0, 3).map((p, i) => (
                <span key={i} className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-[10px] text-destructive capitalize">{humanizeLabel(p)}</span>
              ))}
              {(insight.strengths as string[]).slice(0, 3).map((s, i) => (
                <span key={i} className="rounded-full bg-gold/10 px-2.5 py-0.5 text-[10px] text-gold capitalize">{humanizeLabel(s)}</span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Analyze button */}
      {entries.length >= 3 && (
        <button
          onClick={analyzePatterns}
          disabled={analyzing}
          className="mb-6 w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-sm text-muted-foreground hover:text-foreground hover:border-gold/30 transition-colors disabled:opacity-50"
        >
          {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {analyzing ? 'Analyzing your journey…' : 'Analyze My Journey'}
        </button>
      )}

      {/* Write modal */}
      {showWrite && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background pt-safe">
          <div className="flex items-center justify-between px-6 pt-6 pb-4 pr-16">
            {savedVerse ? (
              <button
                onClick={closeWriteModal}
                aria-label="Back to journal"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={closeWriteModal}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            )}
            <h2 className="font-serif text-lg text-foreground">{savedVerse ? 'A Word for You' : 'New Entry'}</h2>
            {savedVerse ? (
              <span className="w-10" />
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!content.trim() || saving}
                className="text-sm font-medium text-gold disabled:opacity-40"
              >
                {saving ? '...' : 'Save'}
              </button>
            )}
          </div>

          {savedVerse ? (
            <div className="flex-1 overflow-y-auto px-6 pb-12 animate-fade-in">
              <div className="mx-auto flex max-w-md flex-col items-center text-center pt-2">
                <Sparkles className="h-5 w-5 text-gold mb-4" />
                <p className="text-[10px] uppercase tracking-[0.32em] text-gold/70 mb-3">Scripture for this moment</p>
                <p className="font-serif text-xl text-foreground leading-relaxed">
                  &ldquo;{savedVerse.text}&rdquo;
                </p>
                <p className="mt-4 text-xs uppercase tracking-[0.2em] text-gold/80">{savedVerse.ref}</p>
                <div className="mt-6">
                  <VerseActions verse={savedVerse} theme={mood || null} />
                </div>

                {savedQuote && (
                  <div className="mt-10 w-full rounded-xl border border-gold/15 bg-card/60 p-5">
                    <p className="text-[10px] uppercase tracking-[0.28em] text-gold/70 mb-3">From the Saints</p>
                    <p className="font-serif text-base italic text-foreground/90 leading-relaxed">
                      &ldquo;{savedQuote.text}&rdquo;
                    </p>
                    <p className="mt-3 text-xs uppercase tracking-[0.2em] text-gold/80">— {savedQuote.saint}</p>
                  </div>
                )}

                {savedPrayer && (
                  <div className="mt-6 w-full rounded-xl border border-border bg-card/40 p-5">
                    <p className="text-[10px] uppercase tracking-[0.28em] text-gold/70 mb-3">{savedPrayer.title}</p>
                    <p className="font-serif text-base text-foreground/90 leading-relaxed">
                      {savedPrayer.text}
                    </p>
                  </div>
                )}

                <button
                  onClick={closeWriteModal}
                  className="mt-10 rounded-xl border border-gold/30 px-6 py-3 text-sm text-gold hover:bg-gold/10 transition-colors"
                >
                  Carry this with me
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto px-6 pb-8">
              <label htmlFor="journal-entry" className="sr-only">Journal entry</label>
              <textarea
                id="journal-entry"
                value={content}
                onChange={(e) => setContent(e.target.value.slice(0, 5000))}
                placeholder="Where did you feel close to God today? Where did you struggle?"
                maxLength={5000}
                aria-label="Journal entry"
                className="w-full min-h-[200px] resize-none rounded-xl border border-border bg-card p-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold/50 focus:outline-none"
                autoFocus
              />
              <p className="mt-1 text-right text-[10px] text-muted-foreground">{content.length}/5000</p>

              <div className="mt-4">
                <p className="text-xs text-muted-foreground mb-2">How are you feeling?</p>
                <div className="flex flex-wrap gap-2">
                  {MOOD_OPTIONS.map(m => (
                    <button
                      key={m.value}
                      onClick={() => setMood(mood === m.value ? '' : m.value)}
                      className={`rounded-full border px-3 py-1.5 text-xs transition-all ${
                        mood === m.value ? 'border-gold/50 bg-gold/10 text-foreground' : 'border-border text-muted-foreground hover:border-gold/20'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs text-muted-foreground mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {TAG_SUGGESTIONS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`rounded-full border px-3 py-1.5 text-xs transition-all ${
                        selectedTags.includes(tag) ? 'border-gold/50 bg-gold/10 text-foreground' : 'border-border text-muted-foreground hover:border-gold/20'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Entries list */}
      <section>
        {entries.length === 0 && !loading && (
          <div className="text-center py-16">
            <BookOpen className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Begin your spiritual journal</p>
            <button
              onClick={() => setShowWrite(true)}
              className="mt-4 rounded-xl bg-gold px-6 py-3 text-sm font-medium text-primary-foreground"
            >
              Write First Entry
            </button>
          </div>
        )}

        <div className="space-y-3">
          {entries.map(entry => (
            <div key={entry.id} className="rounded-xl border border-border bg-card p-4 animate-fade-in">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {entry.mood && <span className="text-sm">{MOOD_OPTIONS.find(m => m.value === entry.mood)?.label.split(' ')[0]}</span>}
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(entry.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  {entry.entry_type === 'examen' && (
                    <span className="rounded-full bg-gold/10 px-2 py-0.5 text-[10px] text-gold">Examen</span>
                  )}
                </div>
                <button onClick={() => deleteEntry(entry.id)} aria-label="Delete entry" className="text-muted-foreground/40 hover:text-destructive transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="text-sm text-foreground/80 line-clamp-4 whitespace-pre-wrap">{entry.content}</p>
              {entry.tags && (entry.tags as string[]).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {(entry.tags as string[]).map((tag, i) => (
                    <span key={i} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {hasMore && (
          <button
            onClick={loadMore}
            className="mt-4 w-full flex items-center justify-center gap-1 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronDown className="h-4 w-4" />
            Load older entries
          </button>
        )}
      </section>
    </div>
  );
};

export default JournalHome;
