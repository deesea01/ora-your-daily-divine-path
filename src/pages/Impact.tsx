import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Globe, Users } from 'lucide-react';

const CAUSES = [
  {
    name: 'Catholic Relief Services',
    description: 'Emergency aid and community development worldwide',
    donated: '$2,450',
    icon: Globe,
  },
  {
    name: 'St. Vincent de Paul Society',
    description: 'Direct aid to families in poverty across the U.S.',
    donated: '$1,800',
    icon: Users,
  },
  {
    name: 'Missionary Childhood Association',
    description: 'Supporting children and families in mission territories',
    donated: '$1,200',
    icon: Heart,
  },
  {
    name: 'Caritas Internationalis',
    description: 'Catholic humanitarian network serving the most vulnerable',
    donated: '$980',
    icon: Globe,
  },
];

const Impact = () => {
  const navigate = useNavigate();
  const totalDonated = '$6,430';
  const causesSupported = CAUSES.length;

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

      <main className="flex-1 px-6 py-6">
        {/* Mission statement */}
        <div className="mb-6 rounded-xl border border-gold/20 bg-card p-5 text-center animate-fade-in">
          <p className="font-serif text-base text-foreground leading-relaxed">
            Ora donates a portion of every subscription to charitable, faith-based causes.
          </p>
          <p className="mt-2 text-sm text-muted-foreground italic">
            Build your prayer life and community.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-3 animate-fade-in">
          <div className="rounded-xl border border-gold/20 bg-card p-5 text-center">
            <p className="font-serif text-2xl font-medium text-gold">{totalDonated}</p>
            <p className="mt-1 text-xs text-muted-foreground">Total Donated</p>
          </div>
          <div className="rounded-xl border border-gold/20 bg-card p-5 text-center">
            <p className="font-serif text-2xl font-medium text-gold">{causesSupported}</p>
            <p className="mt-1 text-xs text-muted-foreground">Causes Supported</p>
          </div>
        </div>

        {/* Causes */}
        <h2 className="mb-4 font-serif text-lg text-foreground animate-fade-in">Where It Goes</h2>
        <div className="space-y-3">
          {CAUSES.map((cause, i) => (
            <div
              key={cause.name}
              className="flex items-start gap-4 rounded-xl border border-border bg-card p-4 animate-fade-in"
              style={{ animationDelay: `${(i + 1) * 100}ms`, animationFillMode: 'both' }}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/10">
                <cause.icon className="h-5 w-5 text-gold" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{cause.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{cause.description}</p>
              </div>
              <p className="text-sm font-medium text-gold">{cause.donated}</p>
            </div>
          ))}
        </div>

        {/* Footer message */}
        <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: '500ms', animationFillMode: 'both' }}>
          <p className="text-xs text-muted-foreground">
            Every prayer matters. Every subscription gives back.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Impact;
