import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useConfession } from '@/hooks/useConfession';
import { EXAMINATION_CATEGORIES } from '@/lib/examination';
import { Textarea } from '@/components/ui/textarea';

const ExaminationOfConscience = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { prepNotes, savePrepNote, loading } = useConfession();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [localChecked, setLocalChecked] = useState<Record<string, string[]>>({});
  const [localNotes, setLocalNotes] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  // Hydrate local state from fetched prep notes
  useEffect(() => {
    if (prepNotes.length > 0) {
      const checked: Record<string, string[]> = {};
      const notes: Record<string, string> = {};
      prepNotes.forEach((n) => {
        checked[n.category] = n.checked_items;
        notes[n.category] = n.notes || '';
      });
      setLocalChecked(checked);
      setLocalNotes(notes);
    }
  }, [prepNotes]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  const toggleItem = (category: string, item: string) => {
    setLocalChecked((prev) => {
      const arr = prev[category] || [];
      return {
        ...prev,
        [category]: arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item],
      };
    });
  };

  const handleSave = async (category: string) => {
    setSaving(category);
    await savePrepNote(category, localChecked[category] || [], localNotes[category] || null);
    setSaving(null);
  };

  const totalChecked = Object.values(localChecked).reduce((sum, arr) => sum + arr.length, 0);

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
        <div>
          <h1 className="font-serif text-lg font-medium text-foreground">Examination of Conscience</h1>
          <p className="text-xs text-muted-foreground">{totalChecked} item{totalChecked !== 1 ? 's' : ''} marked</p>
        </div>
      </header>

      <main className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {/* Disclaimer */}
        <div className="rounded-lg border border-gold/20 bg-card p-3 mb-3 animate-fade-in">
          <p className="text-xs text-muted-foreground italic text-center">
            This examination is a spiritual aid to help you reflect. It is not a substitute for the Sacrament of Reconciliation. Your notes are private and secure.
          </p>
        </div>

        {EXAMINATION_CATEGORIES.map((cat, i) => {
          const isExpanded = expandedCategory === cat.key;
          const checkedItems = localChecked[cat.key] || [];
          const hasContent = checkedItems.length > 0 || (localNotes[cat.key]?.trim() || '').length > 0;

          return (
            <div
              key={cat.key}
              className="rounded-xl border border-border bg-card overflow-hidden animate-fade-in"
              style={{ animationDelay: `${i * 30}ms`, animationFillMode: 'both' }}
            >
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : cat.key)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div className="flex items-center gap-3">
                  {hasContent && (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gold/20">
                      <Check className="h-3 w-3 text-gold" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-foreground">{cat.label}</span>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>

              <div
                className="transition-all duration-300 ease-in-out"
                style={{
                  display: 'grid',
                  gridTemplateRows: isExpanded ? '1fr' : '0fr',
                }}
              >
                <div className="overflow-hidden">
                  <div className="px-4 pb-4 space-y-3">
                    <p className="text-xs text-gold italic">{cat.prompt}</p>

                    <div className="space-y-2">
                      {cat.items.map((item) => {
                        const isChecked = checkedItems.includes(item);
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => toggleItem(cat.key, item)}
                            className="flex w-full items-start gap-3 text-left py-2 -my-1 rounded-md group active:bg-gold/5 transition-colors"
                          >
                            <div
                              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all ${
                                isChecked
                                  ? 'border-gold bg-gold/20'
                                  : 'border-muted-foreground/30 group-hover:border-gold/40'
                              }`}
                            >
                              {isChecked && <Check className="h-3.5 w-3.5 text-gold" />}
                            </div>
                            <span className={`text-sm ${isChecked ? 'text-foreground' : 'text-foreground/80'}`}>{item}</span>
                          </button>
                        );
                      })}
                    </div>

                    <Textarea
                      placeholder="Private notes…"
                      value={localNotes[cat.key] || ''}
                      onChange={(e) =>
                        setLocalNotes((prev) => ({ ...prev, [cat.key]: e.target.value }))
                      }
                      className="min-h-[60px] bg-background text-sm border-border resize-none"
                    />

                    <button
                      onClick={() => handleSave(cat.key)}
                      disabled={saving === cat.key}
                      className="w-full rounded-lg border border-gold/30 bg-gold/10 py-2 text-xs text-gold transition-all hover:bg-gold/20 disabled:opacity-50"
                    >
                      {saving === cat.key ? 'Saving…' : 'Save Draft'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* View summary button */}
        {totalChecked > 0 && (
          <button
            onClick={() => navigate('/confession/prep')}
            className="mt-4 w-full rounded-xl border border-gold/30 bg-gold/10 py-3 text-sm font-medium text-gold transition-all hover:bg-gold/20"
          >
            View Preparation Summary
          </button>
        )}
      </main>
    </div>
  );
};

export default ExaminationOfConscience;
