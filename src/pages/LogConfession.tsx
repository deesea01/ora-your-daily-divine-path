import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useConfession } from '@/hooks/useConfession';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { localDateStr } from '@/lib/utils';

const MOODS = [
  { key: 'peaceful', emoji: '☮️', label: 'Peaceful' },
  { key: 'relieved', emoji: '😌', label: 'Relieved' },
  { key: 'encouraged', emoji: '💪', label: 'Encouraged' },
  { key: 'emotional', emoji: '🥹', label: 'Emotional' },
  { key: 'grateful', emoji: '🙏', label: 'Grateful' },
];

const LogConfession = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { logConfession, loading } = useConfession();

  const [date, setDate] = useState(localDateStr());
  const [parish, setParish] = useState('');
  const [priest, setPriest] = useState('');
  const [reflection, setReflection] = useState('');
  const [mood, setMood] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Only block the page on auth resolution. We intentionally do NOT gate on
  // `useConfession().loading` here — that flips true during `logConfession`'s
  // post-insert refetch and would replace the form with a spinner mid-submit,
  // causing the page to appear frozen until refetch resolved.
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }


  if (!user) return <Navigate to="/auth" replace />;

  const handleSubmit = async () => {
    setSubmitting(true);
    const result = await logConfession({
      confession_date: date,
      parish_name: parish || undefined,
      priest_name: priest || undefined,
      reflection: reflection || undefined,
      mood: mood || undefined,
    });
    setSubmitting(false);
    if (!result?.error) {
      setSuccess(true);
      setTimeout(() => navigate('/confession'), 1500);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 animate-fade-in">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/15 mb-4">
          <Check className="h-8 w-8 text-gold" />
        </div>
        <p className="font-serif text-xl text-foreground">Confession Logged</p>
        <p className="text-sm text-muted-foreground mt-2">Go in peace. God bless you.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border px-4 py-4">
        <button
          onClick={() => navigate('/confession')}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="font-serif text-lg font-medium text-foreground">Log Confession</h1>
      </header>

      <main className="flex-1 px-6 py-6 space-y-5">
        {/* Date */}
        <div className="space-y-2 animate-fade-in">
          <label className="text-sm text-muted-foreground">Date of confession</label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-card border-border text-foreground"
          />
        </div>

        {/* Parish */}
        <div className="space-y-2 animate-fade-in">
          <label className="text-sm text-muted-foreground">Parish / Church <span className="text-xs italic">(optional)</span></label>
          <Input
            value={parish}
            onChange={(e) => setParish(e.target.value)}
            placeholder="e.g. St. Joseph's"
            className="bg-card border-border"
            maxLength={255}
          />
        </div>

        {/* Priest */}
        <div className="space-y-2 animate-fade-in">
          <label className="text-sm text-muted-foreground">Priest <span className="text-xs italic">(optional)</span></label>
          <Input
            value={priest}
            onChange={(e) => setPriest(e.target.value)}
            placeholder="e.g. Fr. Michael"
            className="bg-card border-border"
            maxLength={255}
          />
        </div>

        {/* Mood */}
        <div className="space-y-2 animate-fade-in">
          <label className="text-sm text-muted-foreground">How do you feel? <span className="text-xs italic">(optional)</span></label>
          <div className="flex flex-wrap gap-2">
            {MOODS.map((m) => (
              <button
                key={m.key}
                onClick={() => setMood(mood === m.key ? null : m.key)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-all ${
                  mood === m.key
                    ? 'border-gold/40 bg-gold/10 text-gold'
                    : 'border-border text-muted-foreground hover:border-gold/20'
                }`}
              >
                <span>{m.emoji}</span>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reflection */}
        <div className="space-y-2 animate-fade-in">
          <label className="text-sm text-muted-foreground">Private reflection <span className="text-xs italic">(optional)</span></label>
          <Textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="How did you feel? What graces did you receive?"
            className="min-h-[100px] bg-card border-border resize-none"
            maxLength={1000}
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full rounded-xl bg-gold py-3 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50 active:scale-[0.98]"
        >
          {submitting ? 'Saving…' : 'Log Confession'}
        </button>

        <p className="text-center text-xs text-muted-foreground italic">
          All details are private and only visible to you.
        </p>
      </main>
    </div>
  );
};

export default LogConfession;
