import { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import logoImg from '@/assets/logo.png';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n';
import { lovable } from '@/integrations/lovable/index';
import SEO from '@/components/SEO';

const Welcome = () => {
  const { user, loading } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  // If already signed in, send to app (Index will route to onboarding if needed)
  if (user) return <Navigate to="/" replace />;

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      const result = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: window.location.origin,
      });
      if (result.error) setError(result.error.message || 'Google sign-in failed');
      if (result.redirected) return;
    } catch (err: any) {
      setError(err?.message || 'Google sign-in failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background px-6 pb-8 pt-safe app-container">
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
              { '@type': 'Question', name: 'How much does Ora cost?', acceptedAnswer: { '@type': 'Answer', text: 'Ora Premium is $10 per month or $70 per year. You can begin with a 3-day free trial. A portion of subscriptions supports Catholic charities and ministries.' } },
            ],
          },
        ]}
      />

      {/* SEO content (visually hidden, indexable) */}
      <section className="sr-only" aria-hidden="true">
        <h2>Daily devotion, the rosary, and the Catholic saints</h2>
        <p>
          Ora is a daily Catholic prayer app that helps you grow closer to God through guided
          daily devotion, the rosary, novenas, the Liturgy of the Hours, and the saints. Build a
          personalized prayer plan and follow Lent and Advent prayer guides chosen for your
          spiritual life.
        </p>
        <h2>How to grow closer to God every day</h2>
        <p>
          Begin with a few minutes of guided morning prayer, pray a decade of the rosary at
          midday, and end the day with the Examen. Ora adapts your daily Catholic prayers to your
          life and pairs you with a saint companion — Francis of Assisi, Augustine, Teresa of
          Ávila, Padre Pio, Thérèse of Lisieux, Joan of Arc, or Thomas Aquinas.
        </p>
        <h2>Available in English, Spanish (oraciones católicas) and Portuguese (oração católica diária)</h2>
        <p>
          Ora supports multilingual Catholic content for an underserved global Church, with daily
          devotion, audio prayer, and saint guidance in multiple languages.
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

          <div className="flex items-center gap-3 py-1">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">{t.or || 'or'}</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-3.5 text-sm font-medium text-foreground transition-all hover:bg-accent disabled:opacity-50"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {googleLoading ? '...' : (t.signInWithGoogle || 'Continue with Google')}
          </button>

          {error && <p className="text-sm text-destructive text-center">{error}</p>}
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
