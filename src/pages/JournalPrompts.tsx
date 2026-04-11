import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft, Shuffle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { JOURNAL_PROMPTS, JOURNAL_PROMPT_CATEGORIES } from '@/lib/journalData';

const JournalPrompts = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;

  const filteredPrompts = selectedCategory
    ? JOURNAL_PROMPTS.filter(p => p.category === selectedCategory)
    : JOURNAL_PROMPTS;

  const randomPrompt = () => {
    const p = filteredPrompts[Math.floor(Math.random() * filteredPrompts.length)];
    navigate(`/journal/write?prompt=${encodeURIComponent(p.text)}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border px-4 py-4">
        <button onClick={() => navigate('/journal')} className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground" aria-label="Back">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="font-serif text-lg font-medium text-foreground">Journal Prompts</h1>
        <button onClick={randomPrompt} className="ml-auto flex h-9 w-9 items-center justify-center rounded-full border border-gold/30 text-gold hover:bg-gold/10" aria-label="Random prompt">
          <Shuffle className="h-4 w-4" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto">
        {/* Category filter */}
        <div className="px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar">
          <button onClick={() => setSelectedCategory(null)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs transition-all ${!selectedCategory ? 'border-gold/40 bg-gold/10 text-gold' : 'border-border text-muted-foreground'}`}>
            All
          </button>
          {JOURNAL_PROMPT_CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs transition-all whitespace-nowrap ${selectedCategory === cat ? 'border-gold/40 bg-gold/10 text-gold' : 'border-border text-muted-foreground'}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Prompts */}
        <div className="px-4 pb-6 space-y-2">
          {filteredPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => navigate(`/journal/write?prompt=${encodeURIComponent(prompt.text)}`)}
              className="w-full rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-gold/20 active:scale-[0.98] animate-fade-in"
              style={{ animationDelay: `${i * 25}ms`, animationFillMode: 'both' }}
            >
              <p className="font-serif text-sm text-foreground italic leading-relaxed">"{prompt.text}"</p>
              <p className="text-[10px] text-gold mt-2">{prompt.category}</p>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default JournalPrompts;
