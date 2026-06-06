import { Navigate, useNavigate, Link } from 'react-router-dom';
import logoImg from '@/assets/logo.png';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n';
import SEO from '@/components/SEO';

const Welcome = () => {
  const { user, loading } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  // If already signed in, send to app (Index will route to onboarding if needed)
  if (user) return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-screen flex-col bg-background px-6 pb-8 pt-safe app-container-wide">
      <SEO
        title="Daily Catholic Prayer App — Grow Closer to God with Ora"
        description="Start a daily devotion with guided Catholic prayers, the rosary, and saint-led reflections. Ora helps you grow closer to God with a personalized spiritual path."
        canonicalPath="/welcome"
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Ora Devotion',
            url: 'https://oradevotion.com',
            logo: 'https://oradevotion.com/icon-512.png',
          },
          {
            '@context': 'https://schema.org',
            '@type': 'MobileApplication',
            name: 'Ora — Daily Catholic Prayer',
            applicationCategory: 'LifestyleApplication',
            operatingSystem: 'iOS, Android, Web',
            offers: { '@type': 'Offer', price: '10.00', priceCurrency: 'USD' },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              { '@type': 'Question', name: 'What is the best Catholic prayer app for daily devotion?', acceptedAnswer: { '@type': 'Answer', text: 'Ora is a daily Catholic prayer app that guides you through morning prayer, the rosary, the Examen, and saint-led reflections. Each day\u2019s devotion is personalized to your prayer life so you can grow closer to God consistently.' } },
              { '@type': 'Question', name: 'How can I grow closer to God every day?', acceptedAnswer: { '@type': 'Answer', text: 'Begin with a small, faithful daily devotion: a few minutes of guided prayer, a Scripture passage, and an evening Examen. Ora builds this rhythm for you and pairs you with a saint companion.' } },
              { '@type': 'Question', name: 'Does Ora include daily Catholic prayers and the rosary?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Ora includes 30+ traditional and modern Catholic prayers, a fully guided rosary with all four sets of mysteries, novenas, the Liturgy of the Hours moments, Lent and Advent guides, and saint-led reflections.' } },
              { '@type': 'Question', name: 'Is Ora available in Spanish and Portuguese?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Ora supports English, Spanish (oraciones cat\u00f3licas) and Portuguese (ora\u00e7\u00e3o cat\u00f3lica di\u00e1ria), with localized prayers, audio, and saint guidance.' } },
              { '@type': 'Question', name: 'How much does Ora cost?', acceptedAnswer: { '@type': 'Answer', text: 'Ora Premium is $9.99 per month or $59.99 per year. A portion of subscriptions supports Catholic charities and ministries.' } },
            ],
          },
        ]}
      />

      {/* SEO content (visually hidden, indexable) */}
      <section className="sr-only" aria-hidden="true">
        <h2>Daily devotion, the rosary, and the Catholic saints</h2>
        <p>
          Ora is a daily Catholic prayer app that helps you grow closer to God through guided
          daily devotion, the rosary, novenas, the Liturgy of the Hours, and the saints.
        </p>
      </section>

      {/* Top bar: language picker */}
      <div className="flex justify-end pt-4">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as any)}
          className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-gold/50"
          aria-label="Language"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.nativeLabel}
            </option>
          ))}
        </select>
      </div>

      {/* Hero */}
      <div className="flex flex-1 flex-col items-center justify-center text-center animate-fade-in">
        <img src={logoImg} alt="Ora" className="w-56 h-56 object-contain mb-4" />
        <h1 className="font-serif text-3xl text-foreground mb-3 max-w-xs">
          {t.welcomeHeadline}
        </h1>
        <p className="text-sm text-muted-foreground mb-10 max-w-xs">
          {t.welcomeSubheading}
        </p>

        <div className="w-full max-w-sm space-y-3">
          <button
            onClick={() => navigate('/auth?mode=signup')}
            className="w-full rounded-xl bg-gold py-4 font-medium text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98]"
          >
            {t.getStarted || 'Get Started'}
          </button>

          <button
            onClick={() => navigate('/auth?mode=login')}
            className="w-full rounded-xl border border-border bg-card py-4 text-sm font-medium text-foreground transition-all hover:border-gold/40 active:scale-[0.98]"
          >
            {t.signIn || 'Log In'}
          </button>
        </div>

        <Link
          to="/paywall"
          className="mt-6 text-xs text-muted-foreground hover:text-gold underline underline-offset-4"
        >
          View pricing
        </Link>

        <p className="mt-6 px-4 text-[11px] leading-relaxed text-muted-foreground max-w-xs">
          By continuing, you agree to our{' '}
          <Link to="/terms-of-service" className="text-gold hover:underline">Terms of Service</Link>,{' '}
          <Link to="/privacy-policy" className="text-gold hover:underline">Privacy Policy</Link>, and{' '}
          <Link to="/refund-policy" className="text-gold hover:underline">Refund Policy</Link>.
        </p>
      </div>
    </div>
  );
};

export default Welcome;
