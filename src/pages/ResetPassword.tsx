import { useState, useEffect } from 'react';
import logoImg from '@/assets/logo.png';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import SEO from '@/components/SEO';

const ResetPassword = () => {
  const { updatePassword } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t.passwordsDoNotMatch);
      return;
    }

    setSubmitting(true);
    const { error } = await updatePassword(password);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => navigate('/auth'), 2000);
    }
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 bg-background">
        <div className="w-full max-w-sm text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-44 h-44 mb-4">
            <img src={logoImg} alt="Ora logo" className="w-44 h-44 object-contain" />
          </div>
          <p className="text-gold mb-2">{t.passwordUpdated}</p>
          <p className="text-sm text-muted-foreground">{t.passwordUpdatedDesc}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 bg-background">
      <SEO
        title="Reset your Ora password"
        description="Reset the password for your Ora Catholic prayer account."
        canonicalPath="/reset-password"
        noindex
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Reset Password',
          url: 'https://oradevotion.com/reset-password',
          publisher: { '@type': 'Organization', name: 'Ora Devotion LLC' },
        }}
      />
      <div className="w-full max-w-sm animate-fade-in">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-44 h-44 mb-4">
            <img src={logoImg} alt="Ora logo" className="w-44 h-44 object-contain" />
          </div>
          <h1 className="font-serif text-4xl font-light tracking-wide text-foreground">{t.resetPassword}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              placeholder={t.newPassword}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-colors"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder={t.confirmNewPassword}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-colors"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-gold py-3 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? '...' : t.updatePassword}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
