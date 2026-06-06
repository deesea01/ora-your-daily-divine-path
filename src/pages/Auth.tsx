import { useState } from 'react';
import logoImg from '@/assets/logo.png';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useSearchParams, Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n';
import SEO from '@/components/SEO';

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
