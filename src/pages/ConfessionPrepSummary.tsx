import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft, EyeOff, Eye, Trash2, BookOpen } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useConfession } from '@/hooks/useConfession';
import { EXAMINATION_CATEGORIES } from '@/lib/examination';

const ConfessionPrepSummary = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { prepNotes, deleteAllPrepNotes, loading } = useConfession();
  const [hidden, setHidden] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  const notesWithContent = prepNotes.filter(
    (n) => (n.checked_items && n.checked_items.length > 0) || (n.notes?.trim())
  );

  const getCategoryLabel = (key: string) =>
    EXAMINATION_CATEGORIES.find((c) => c.key === key)?.label || key;

  const handleDeleteAll = async () => {
    await deleteAllPrepNotes();
    setConfirmDelete(false);
    navigate('/confession');
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border px-4 py-4">
        <button
          onClick={() => navigate('/confession/examine')}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="font-serif text-lg font-medium text-foreground">Preparation Summary</h1>
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setHidden(!hidden)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
            aria-label={hidden ? 'Show details' : 'Hide details'}
          >
            {hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
        </div>
      </header>

      <main className="flex-1 px-6 py-6 space-y-4">
        {hidden ? (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <EyeOff className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">Details hidden for privacy</p>
            <button
              onClick={() => setHidden(false)}
              className="mt-3 text-xs text-gold underline"
            >
              Tap to reveal
            </button>
          </div>
        ) : notesWithContent.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <p className="text-sm text-muted-foreground">No preparation notes yet.</p>
            <button
              onClick={() => navigate('/confession/examine')}
              className="mt-3 text-xs text-gold underline"
            >
              Begin examination
            </button>
          </div>
        ) : (
          <>
            {notesWithContent.map((note, i) => (
              <div
                key={note.id}
                className="rounded-xl border border-border bg-card p-4 animate-fade-in"
                style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}
              >
                <p className="text-xs text-gold font-medium mb-2">{getCategoryLabel(note.category)}</p>
                {note.checked_items.length > 0 && (
                  <ul className="space-y-1 mb-2">
                    {note.checked_items.map((item) => (
                      <li key={item} className="text-sm text-foreground/80 flex items-start gap-2">
                        <span className="text-gold mt-1 text-xs">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
                {note.notes && (
                  <p className="text-xs text-muted-foreground italic border-t border-border pt-2 mt-2">
                    {note.notes}
                  </p>
                )}
              </div>
            ))}

            {/* Delete all */}
            <div className="pt-4">
              {confirmDelete ? (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-center space-y-3">
                  <p className="text-sm text-foreground">Delete all preparation notes?</p>
                  <p className="text-xs text-muted-foreground">This cannot be undone.</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="flex-1 rounded-lg border border-border py-2 text-sm text-muted-foreground"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteAll}
                      className="flex-1 rounded-lg bg-destructive py-2 text-sm text-destructive-foreground"
                    >
                      Delete All
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-destructive/20 py-3 text-sm text-destructive transition-all hover:bg-destructive/5"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete All Preparation Notes
                </button>
              )}
            </div>
          </>
        )}

        <p className="text-center text-xs text-muted-foreground italic px-4 pt-4">
          Your notes are private and stored securely. Only you can see them.
        </p>
      </main>
    </div>
  );
};

export default ConfessionPrepSummary;
