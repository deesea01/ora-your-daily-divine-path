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

            {/* Google Sign-In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-border bg-card py-3 text-sm font-medium text-foreground transition-all hover:bg-accent disabled:opacity-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {googleLoading ? '...' : (isSignUp ? t.signUpWithGoogle || 'Sign up with Google' : t.signInWithGoogle || 'Sign in with Google')}
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">{t.or || 'or'}</span>
              <div className="h-px flex-1 bg-border" />
            </div>

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
