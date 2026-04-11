import { useState } from 'react';
import { useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useJournal } from '@/hooks/useJournal';
import { EMOTIONAL_STATES, SPIRITUAL_STATES } from '@/lib/journalData';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const TYPE_LABELS: Record<string, string> = {
  freeform: 'Free Journal',
  gratitude: 'Gratitude Entry',
  intention: 'Prayer Intention',
  wins: 'Spiritual Wins / Challenges',
};

const JournalWrite = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { saveJournalEntry, loading } = useJournal();

  const entryType = searchParams.get('type') || 'freeform';
  const promptText = searchParams.get('prompt') || '';

  const [title, setTitle] = useState('');
  const [body, setBody] = useState(promptText ? `Prompt: "${promptText}"\n\n` : '');
  const [tags, setTags] = useState('');
  const [emotionalState, setEmotionalState] = useState<string | null>(null);
  const [spiritualState, setSpiritualState] = useState<string | null>(null);
  const [prayerIntention, setPrayerIntention] = useState('');
  const [scriptureVerse, setScriptureVerse] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;

  const handleSave = async () => {
    setSaving(true);
    const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
    await saveJournalEntry({
      title: title || TYPE_LABELS[entryType] || 'Untitled',
      body,
      tags: tagArray,
      emotional_state: emotionalState || undefined,
      spiritual_state: spiritualState || undefined,
      prayer_intention: prayerIntention || undefined,
      scripture_verse: scriptureVerse || undefined,
      entry_type: entryType,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => navigate('/journal'), 1500);
  };

  if (saved) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 animate-fade-in">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/15 mb-4">
          <Check className="h-8 w-8 text-gold" />
        </div>
        <p className="font-serif text-xl text-foreground">Entry Saved</p>
        <p className="text-sm text-muted-foreground mt-2">Your reflection is kept safe.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border px-4 py-4">
        <button onClick={() => navigate('/journal')} className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground" aria-label="Back">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="font-serif text-lg font-medium text-foreground">{TYPE_LABELS[entryType] || 'Journal Entry'}</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        {/* Title */}
        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title (optional)" className="bg-card border-border font-serif" maxLength={200} />

        {/* Body */}
        <Textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder={entryType === 'gratitude' ? 'What am I grateful for today?' : entryType === 'intention' ? 'What intention do I place before the Lord?' : entryType === 'wins' ? 'Where did I see God working today? What was hard?' : 'Write freely…'}
          className="min-h-[200px] bg-card border-border resize-none font-serif text-sm leading-relaxed"
          maxLength={5000}
        />

        {/* Emotional state */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">How are you feeling?</p>
          <div className="flex flex-wrap gap-2">
            {EMOTIONAL_STATES.map(e => (
              <button key={e.key} onClick={() => setEmotionalState(emotionalState === e.key ? null : e.key)}
                className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs transition-all ${emotionalState === e.key ? 'border-gold/40 bg-gold/10 text-gold' : 'border-border text-muted-foreground'}`}>
                <span>{e.emoji}</span> {e.label}
              </button>
            ))}
          </div>
        </div>

        {/* Spiritual state */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Spiritual state</p>
          <div className="flex flex-wrap gap-2">
            {SPIRITUAL_STATES.map(s => (
              <button key={s.key} onClick={() => setSpiritualState(spiritualState === s.key ? null : s.key)}
                className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs transition-all ${spiritualState === s.key ? 'border-gold/40 bg-gold/10 text-gold' : 'border-border text-muted-foreground'}`}>
                <span>{s.emoji}</span> {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Prayer intention */}
        <div>
          <p className="text-xs text-muted-foreground mb-1">Prayer intention <span className="italic">(optional)</span></p>
          <Input value={prayerIntention} onChange={e => setPrayerIntention(e.target.value)} placeholder="What do you want to bring before the Lord?" className="bg-card border-border text-sm" maxLength={500} />
        </div>

        {/* Scripture */}
        <div>
          <p className="text-xs text-muted-foreground mb-1">Scripture verse <span className="italic">(optional)</span></p>
          <Input value={scriptureVerse} onChange={e => setScriptureVerse(e.target.value)} placeholder="e.g. Philippians 4:13" className="bg-card border-border text-sm" maxLength={200} />
        </div>

        {/* Tags */}
        <div>
          <p className="text-xs text-muted-foreground mb-1">Tags <span className="italic">(comma-separated)</span></p>
          <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g. gratitude, family, lent" className="bg-card border-border text-sm" maxLength={200} />
        </div>

        {/* Save */}
        <button onClick={handleSave} disabled={saving || !body.trim()} className="w-full rounded-xl bg-gold py-3 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50 active:scale-[0.98]">
          {saving ? 'Saving…' : 'Save Entry'}
        </button>

        <p className="text-center text-xs text-muted-foreground italic">Your journal is private and only visible to you.</p>
      </main>
    </div>
  );
};

export default JournalWrite;
