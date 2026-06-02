import { useState, useEffect } from 'react';
import logoImg from '@/assets/logo.png';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useSearchParams, Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n';
import { lovable } from '@/integrations/lovable/index';
import SEO from '@/components/SEO';
import { isNativeIOS } from '@/lib/platform';
import { nativeOAuthSignIn } from '@/lib/nativeAuth';
import { toast } from 'sonner';

const Auth = () => {
  const { user, loading, signIn, signUp, resetPasswordForEmail } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get('mode') === 'signup');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const onIos = isNativeIOS();

  const runOAuth = async (provider: 'google' | 'apple') => {
    setError('');
    const label = provider === 'google' ? 'Google' : 'Apple';
    try {
      if (onIos) {
        const { error: nErr } = await nativeOAuthSignIn(provider);
        if (nErr) {
          const msg = nErr.message || `${label} sign-in failed`;
          setError(msg);
          toast.error(msg);
        }
        return;
      }
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: `${window.location.origin}/auth${window.location.search}`,
      });
      if (result.error) {
        const msg = result.error.message || `${label} sign-in failed`;
        setError(msg);
        toast.error(msg);
      }
      if (result.redirected) return;
    } catch (err: any) {
      const msg = err?.message || `${label} sign-in failed`;
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
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  if (user) {
    const redirectParam = searchParams.get('redirect');
    // Only honor relative paths to prevent open-redirect.
    const safeRedirect = redirectParam && redirectParam.startsWith('/') && !redirectParam.startsWith('//')
      ? redirectParam
      : '/';
    return <Navigate to={safeRedirect} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (isForgotPassword) {
      const { error } = await resetPasswordForEmail(email);
      if (error) {
        setError(error.message);
      } else {
        setResetSent(true);
      }
      setSubmitting(false);
      return;
    }

    const { error } = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password);

    if (error) {
      setError(error.message);
    } else if (isSignUp) {
      setSignUpSuccess(true);
    }
    setSubmitting(false);
  };

  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === language);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 bg-background">
      <SEO
        title={isSignUp ? 'Create your Ora account — Daily Catholic Prayer' : 'Sign in to Ora — Daily Catholic Prayer'}
        description="Sign in or create your free Ora account to begin a guided daily Catholic prayer life with the rosary, saints, and personalized devotion."
        canonicalPath="/auth"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: isSignUp ? 'Create your Ora account' : 'Sign in to Ora',
          url: 'https://oradevotion.com/auth',
          publisher: { '@type': 'Organization', name: 'Ora Devotion LLC' },
        }}
      />
      <div className="w-full max-w-sm animate-fade-in">
        {/* Language picker - top right */}
        <div className="flex justify-end mb-4">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-gold/50"
          >
            {SUPPORTED_LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.nativeLabel}
              </option>
            ))}
          </select>
        </div>

        {/* Logo area */}
        <div className="mb-2 text-center">
          <div className="inline-flex items-center justify-center w-44 h-44 mb-1">
            <img src={logoImg} alt="Ora logo" className="w-44 h-44 object-contain" />
          </div>
          <h1 className="font-serif text-2xl text-foreground mb-1">
            {isForgotPassword ? t.resetPassword : isSignUp ? t.createAccount : t.signIn}
          </h1>
          <p className="text-sm text-muted-foreground">{t.authSubtitle}</p>
        </div>

        {signUpSuccess ? (
          <div className="text-center animate-fade-in">
            <p className="text-gold mb-2">{t.checkEmail}</p>
            <p className="text-sm text-muted-foreground">{t.checkEmailDesc}</p>
          </div>
        ) : resetSent ? (
          <div className="text-center animate-fade-in">
            <p className="text-gold mb-2">{t.passwordResetSent}</p>
            <p className="text-sm text-muted-foreground">{t.passwordResetSentDesc}</p>
            <button
              type="button"
              onClick={() => { setResetSent(false); setIsForgotPassword(false); }}
              className="mt-4 text-gold hover:underline text-sm"
            >
              {t.signIn}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Apple Sign-In — required on iOS (Guideline 4.8) when other social logins are offered */}
            {onIos && (
              <button
                type="button"
                onClick={handleAppleSignIn}
                disabled={appleLoading}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-foreground py-3 text-sm font-medium text-background transition-all hover:opacity-90 disabled:opacity-50"
              >
                <svg className="h-4 w-4" viewBox="0 0 384 512" fill="currentColor" aria-hidden="true">
                  <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                </svg>
                {appleLoading ? '...' : (isSignUp ? 'Sign up with Apple' : 'Sign in with Apple')}
              </button>
            )}

            {onIos && (
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">{t.or || 'or'}</span>
                <div className="h-px flex-1 bg-border" />
              </div>
            )}

            <div>
              <input
                type="email"
                placeholder={t.email}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-colors"
              />
            </div>
            {!isForgotPassword && (
              <div>
                <input
                  type="password"
                  placeholder={t.password}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-colors"
                />
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-gold py-3 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? '...' : isForgotPassword ? t.resetPassword : isSignUp ? t.createAccount : t.signIn}
            </button>

            {!isForgotPassword && !isSignUp && (
              <p className="text-center text-sm">
                <button
                  type="button"
                  onClick={() => { setIsForgotPassword(true); setError(''); }}
                  className="text-muted-foreground hover:text-gold hover:underline"
                >
                  {t.forgotPassword}
                </button>
              </p>
            )}

            <p className="text-center text-sm text-muted-foreground">
              {isForgotPassword ? (
                <button
                  type="button"
                  onClick={() => { setIsForgotPassword(false); setError(''); }}
                  className="text-gold hover:underline"
                >
                  {t.signIn}
                </button>
              ) : (
                <>
                  {isSignUp ? t.alreadyHaveAccount : t.dontHaveAccount}{' '}
                  <button
                    type="button"
                    onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                    className="text-gold hover:underline"
                  >
                    {isSignUp ? t.signIn : t.signUp}
                  </button>
                </>
              )}
            </p>

            <p className="text-center text-[11px] text-muted-foreground leading-relaxed pt-2">
              By continuing, you agree to our{' '}
              <Link to="/terms-of-service" className="text-gold hover:underline">Terms</Link>{' '}
              and{' '}
              <Link to="/privacy-policy" className="text-gold hover:underline">Privacy Policy</Link>.
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default Auth;
