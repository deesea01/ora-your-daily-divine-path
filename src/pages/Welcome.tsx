import { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import logoImg from '@/assets/logo.png';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n';
import { lovable } from '@/integrations/lovable/index';
import SEO from '@/components/SEO';
import { isNativeIOS } from '@/lib/platform';
import { nativeOAuthSignIn } from '@/lib/nativeAuth';
import { toast } from 'sonner';

const Welcome = () => {
  const { user, loading } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [error, setError] = useState('');
  const onIos = isNativeIOS();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  // If already signed in, send to app (Index will route to onboarding if needed)
  if (user) return <Navigate to="/" replace />;

  const runOAuth = async (provider: 'google' | 'apple') => {
    setError('');
    try {
      if (onIos) {
        const { error: nErr } = await nativeOAuthSignIn(provider);
        if (nErr) {
          const msg = nErr.message || `${provider === 'google' ? 'Google' : 'Apple'} sign-in failed`;
          setError(msg);
          toast.error(msg);
        }
        return;
      }
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        const msg = result.error.message || `${provider === 'google' ? 'Google' : 'Apple'} sign-in failed`;
        setError(msg);
        toast.error(msg);
      }
      if (result.redirected) return;
    } catch (err: any) {
      const msg = err?.message || `${provider === 'google' ? 'Google' : 'Apple'} sign-in failed`;
      setError(msg);
      toast.error(msg);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try { await runOAuth('google'); } finally { setGoogleLoading(false); }
  };

  const handleAppleSignIn = async () => {
    setAppleLoading(true);
    try { await runOAuth('apple'); } finally { setAppleLoading(false); }
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
              { '@type': 'Question', name: 'How much does Ora cost?', acceptedAnswer: { '@type': 'Answer', text: 'Ora Premium is $9.99 per month or $59.99 per year. You can begin with a 3-day free trial. A portion of subscriptions supports Catholic charities and ministries.' } },
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

          {onIos && (
            <div className="flex items-center gap-3 py-1">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">{t.or || 'or'}</span>
              <div className="h-px flex-1 bg-border" />
            </div>
          )}

          {onIos && (
            <button
              type="button"
              onClick={handleAppleSignIn}
              disabled={appleLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-foreground py-3.5 text-sm font-medium text-background transition-all hover:opacity-90 disabled:opacity-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 384 512" fill="currentColor" aria-hidden="true">
                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
              </svg>
              {appleLoading ? '...' : 'Continue with Apple'}
            </button>
          )}




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
