import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft, Shield, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useJournal } from '@/hooks/useJournal';
import { Switch } from '@/components/ui/switch';

const JournalPrivacy = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { settings, updateSettings, entries, deleteJournalEntry, deleteAllEntries, loading } = useJournal();
  const [confirmWipe, setConfirmWipe] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showEntries, setShowEntries] = useState(false);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;

  const handleWipe = async () => {
    await deleteAllEntries();
    setConfirmWipe(false);
    navigate('/journal');
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border px-4 py-4">
        <button onClick={() => navigate('/journal')} className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground" aria-label="Back">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="font-serif text-lg font-medium text-foreground">Journal Privacy</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
        {/* Shield */}
        <div className="flex flex-col items-center py-4 animate-fade-in">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 mb-3">
            <Shield className="h-7 w-7 text-gold" />
          </div>
          <p className="font-serif text-base text-foreground text-center">Your journal is sacred</p>
          <p className="text-xs text-muted-foreground text-center mt-1 max-w-xs">
            All entries are encrypted, private, and only accessible by you. Ora will never read, share, or expose your reflections.
          </p>
        </div>

        {/* Settings */}
        <div className="space-y-1 animate-fade-in">
          <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
            <div className="pr-4">
              <p className="text-sm font-medium text-foreground">Hide text previews</p>
              <p className="text-xs text-muted-foreground mt-0.5">Hides entry previews on the journal home</p>
            </div>
            <Switch checked={settings.hide_previews} onCheckedChange={v => updateSettings({ hide_previews: v })} />
          </div>

          <div className="relative flex items-center justify-between rounded-xl border border-border bg-card p-4 opacity-60">
            <div className="pr-4">
              <p className="text-sm font-medium text-foreground">Require passcode / biometric</p>
              <p className="text-xs text-muted-foreground mt-0.5">Lock your journal behind device authentication</p>
              <p className="text-[10px] text-gold mt-1">Coming soon</p>
            </div>
            <Switch checked={settings.passcode_enabled} disabled />
          </div>

          <div className="relative flex items-center justify-between rounded-xl border border-border bg-card p-4 opacity-60">
            <div className="pr-4">
              <p className="text-sm font-medium text-foreground">Store data locally only</p>
              <p className="text-xs text-muted-foreground mt-0.5">Keep all journal data on this device only</p>
              <p className="text-[10px] text-gold mt-1">Coming soon</p>
            </div>
            <Switch checked={settings.local_only} disabled />
          </div>
        </div>

        {/* Manage entries */}
        <div className="animate-fade-in">
          <button onClick={() => setShowEntries(!showEntries)} className="text-xs text-gold underline mb-3">
            {showEntries ? 'Hide entries' : `Manage entries (${entries.length})`}
          </button>

          {showEntries && entries.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {entries.map(entry => (
                <div key={entry.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
                  <div>
                    <p className="text-xs text-foreground">{entry.title || 'Untitled'}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(entry.entry_date + 'T00:00:00').toLocaleDateString()}</p>
                  </div>
                  {deletingId === entry.id ? (
                    <div className="flex gap-1">
                      <button onClick={() => setDeletingId(null)} className="text-[10px] text-muted-foreground px-2 py-1 border border-border rounded">Cancel</button>
                      <button onClick={() => { deleteJournalEntry(entry.id); setDeletingId(null); }} className="text-[10px] text-destructive px-2 py-1 border border-destructive/30 rounded bg-destructive/5">Delete</button>
                    </div>
                  ) : (
                    <button onClick={() => setDeletingId(entry.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Wipe all */}
        <div className="animate-fade-in">
          {confirmWipe ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-center space-y-3">
              <p className="text-sm text-foreground">Delete ALL journal data?</p>
              <p className="text-xs text-muted-foreground">This permanently removes all entries and examens. This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmWipe(false)} className="flex-1 rounded-lg border border-border py-2 text-sm text-muted-foreground">Cancel</button>
                <button onClick={handleWipe} className="flex-1 rounded-lg bg-destructive py-2 text-sm text-destructive-foreground">Delete Everything</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setConfirmWipe(true)} className="w-full flex items-center justify-center gap-2 rounded-xl border border-destructive/20 py-3 text-sm text-destructive transition-all hover:bg-destructive/5">
              <Trash2 className="h-4 w-4" /> Delete All Journal Data
            </button>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground italic px-4 pt-2">
          Your spiritual journey is between you and God. Ora treats it with the utmost discretion.
        </p>
      </main>
    </div>
  );
};

export default JournalPrivacy;
