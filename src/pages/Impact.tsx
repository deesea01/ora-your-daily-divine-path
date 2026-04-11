import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Impact = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border px-4 py-4">
        <button
          onClick={() => navigate('/')}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="font-serif text-lg font-medium text-foreground">Impact</h1>
      </header>

      <main className="flex-1 px-6 py-6 flex items-start justify-center">
        <div className="rounded-xl border border-gold/20 bg-card p-5 text-center animate-fade-in max-w-md">
          <p className="font-serif text-base text-foreground leading-relaxed">
            Ora donates a portion of every subscription to charitable, faith-based causes.
          </p>
          <p className="mt-2 text-sm text-muted-foreground italic">
            Build your prayer life and community.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Impact;
