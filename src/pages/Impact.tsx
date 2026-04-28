import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import SEO from '@/components/SEO';

const Impact = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SEO title="Our Impact | Ora" description="Learn how Ora supports Catholic charities and ministries through your subscription." canonicalPath="/impact" />
      <header className="flex items-center gap-3 border-b border-border px-4 py-4">
        <button
          onClick={() => navigate('/')}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
          aria-label={t.back}
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="font-serif text-lg font-medium text-foreground">{t.impactTitle}</h1>
      </header>

      <main className="flex-1 px-6 py-6 flex items-start justify-center">
        <div className="rounded-xl border border-gold/20 bg-card p-5 text-center animate-fade-in max-w-md">
          <p className="font-serif text-base text-foreground leading-relaxed">
            {t.impactMessage}
          </p>
        </div>
      </main>
    </div>
  );
};

export default Impact;
