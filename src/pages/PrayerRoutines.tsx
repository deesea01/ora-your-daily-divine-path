import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Play, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePrayerLibrary } from '@/hooks/usePrayerLibrary';
import { PRAYERS, PRESET_ROUTINES, getPrayerById } from '@/lib/prayerLibrary';
import { Input } from '@/components/ui/input';

const PrayerRoutines = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { routines, saveRoutine, deleteRoutine, loading } = usePrayerLibrary();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [selectedPrayers, setSelectedPrayers] = useState<string[]>([]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;

  const handleCreate = async () => {
    if (!newName.trim() || selectedPrayers.length === 0) return;
    await saveRoutine(newName.trim(), newDesc.trim(), selectedPrayers);
    setCreating(false);
    setNewName('');
    setNewDesc('');
    setSelectedPrayers([]);
  };

  const togglePrayer = (id: string) => {
    setSelectedPrayers(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const startRoutine = (prayerIds: string[]) => {
    if (prayerIds.length === 0) return;
    navigate(`/prayer-library/${prayerIds[0]}?routine=${encodeURIComponent(JSON.stringify(prayerIds))}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border px-4 py-4">
        <button onClick={() => navigate('/prayer-library')} className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground" aria-label="Back">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="font-serif text-lg font-medium text-foreground">Prayer Routines</h1>
        {!creating && (
          <button onClick={() => setCreating(true)} className="ml-auto flex h-9 w-9 items-center justify-center rounded-full border border-gold/30 text-gold hover:bg-gold/10">
            <Plus className="h-4 w-4" />
          </button>
        )}
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {creating && (
          <div className="rounded-xl border border-gold/20 bg-card p-4 space-y-3 animate-fade-in">
            <h3 className="text-sm font-medium text-foreground">Create Routine</h3>
            <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Routine name" className="bg-background border-border" maxLength={100} />
            <Input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Description (optional)" className="bg-background border-border" maxLength={255} />

            <p className="text-xs text-muted-foreground">Select prayers:</p>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {PRAYERS.map(p => (
                <label key={p.id} className="flex items-center gap-2 cursor-pointer py-1">
                  <div className={`h-4 w-4 rounded border flex items-center justify-center transition-all ${selectedPrayers.includes(p.id) ? 'border-gold bg-gold/20' : 'border-muted-foreground/30'}`}>
                    {selectedPrayers.includes(p.id) && <span className="text-gold text-xs">✓</span>}
                  </div>
                  <span className="text-xs text-foreground">{p.title}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-2">
              <button onClick={() => setCreating(false)} className="flex-1 rounded-lg border border-border py-2 text-xs text-muted-foreground">Cancel</button>
              <button onClick={handleCreate} disabled={!newName.trim() || selectedPrayers.length === 0} className="flex-1 rounded-lg bg-gold py-2 text-xs text-primary-foreground disabled:opacity-50">Create</button>
            </div>
          </div>
        )}

        {/* User routines */}
        {routines.length > 0 && (
          <div>
            <h2 className="font-serif text-base text-foreground mb-3">Your Routines</h2>
            <div className="space-y-2">
              {routines.map((r: any) => (
                <div key={r.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{r.name}</p>
                      {r.description && <p className="text-xs text-muted-foreground mt-0.5">{r.description}</p>}
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {r.prayer_ids.length} prayer{r.prayer_ids.length !== 1 ? 's' : ''}: {r.prayer_ids.map((id: string) => getPrayerById(id)?.title).filter(Boolean).join(', ')}
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => startRoutine(r.prayer_ids)} className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/10 text-gold">
                        <Play className="h-3.5 w-3.5 ml-0.5" />
                      </button>
                      <button onClick={() => deleteRoutine(r.id)} className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preset routines */}
        <div>
          <h2 className="font-serif text-base text-foreground mb-3">Suggested Routines</h2>
          <div className="space-y-2">
            {PRESET_ROUTINES.map((r, i) => (
              <button
                key={r.name}
                onClick={() => startRoutine(r.prayerIds)}
                className="w-full rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-gold/20 active:scale-[0.98] animate-fade-in"
                style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{r.emoji}</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{r.name}</p>
                      <p className="text-[10px] text-muted-foreground">{r.description} · {r.prayerIds.length} prayers</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrayerRoutines;
