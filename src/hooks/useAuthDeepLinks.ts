import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { App, type URLOpenListenerEvent } from '@capacitor/app';
import { supabase } from '@/integrations/supabase/client';
import { isNative } from '@/lib/platform';
import { NATIVE_URL_SCHEME } from '@/lib/authRedirect';

/**
 * Listens for `oradevotion://` deep links opened from Supabase auth emails
 * (signup verification, magic link, password reset) and restores the session
 * inside the WKWebView.
 *
 * Without this hook, tapping the verification link opens Safari and the
 * native app never receives the session — leaving the user stuck on the
 * sign-in screen after verifying their email.
 */
export function useAuthDeepLinks() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isNative()) return;

    const handlerPromise = App.addListener('appUrlOpen', async (event: URLOpenListenerEvent) => {
      const raw = event.url ?? '';
      if (!raw.toLowerCase().startsWith(`${NATIVE_URL_SCHEME}://`)) return;

      try {
        // URL parsing for custom schemes: replace scheme with https for URL ctor.
        const normalized = raw.replace(/^[^:]+:\/\//, 'https://');
        const parsed = new URL(normalized);
        const query = parsed.searchParams;
        const hash = new URLSearchParams(
          parsed.hash.startsWith('#') ? parsed.hash.slice(1) : parsed.hash,
        );

        // Surface auth errors from the email link.
        const errorDescription =
          query.get('error_description') ?? hash.get('error_description') ?? query.get('error');
        if (errorDescription) {
          console.warn('[auth deeplink] error:', errorDescription);
          navigate(`/auth?error=${encodeURIComponent(errorDescription)}`, { replace: true });
          return;
        }

        // 1. PKCE / code exchange flow (`?code=...`).
        const code = query.get('code');
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else {
          // 2. Email OTP / verification (`?token_hash=...&type=signup|recovery|...`).
          const tokenHash = query.get('token_hash') ?? query.get('token');
          const type = (query.get('type') ?? '') as
            | 'signup'
            | 'email'
            | 'recovery'
            | 'invite'
            | 'magiclink'
            | 'email_change'
            | '';
          if (tokenHash && type) {
            const { error } = await supabase.auth.verifyOtp({
              token_hash: tokenHash,
              type: type as any,
            });
            if (error) throw error;
          } else {
            // 3. Implicit flow tokens in hash (`#access_token=...&refresh_token=...`).
            const accessToken = hash.get('access_token');
            const refreshToken = hash.get('refresh_token');
            if (accessToken && refreshToken) {
              const { error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
              if (error) throw error;
            }
          }
        }

        // Special-case password recovery → reset form.
        const type = query.get('type') ?? hash.get('type');
        if (type === 'recovery') {
          navigate('/reset-password', { replace: true });
          return;
        }

        // Route to root; existing guards (Welcome → onboarding → paywall → home)
        // will redirect non-premium verified users to the paywall.
        navigate('/', { replace: true });
      } catch (err) {
        console.error('[auth deeplink] failed to restore session', err);
        navigate(`/auth?error=${encodeURIComponent('Verification link could not be processed. Please sign in.')}`, {
          replace: true,
        });
      }
    });

    return () => {
      void handlerPromise.then((sub) => sub.remove());
    };
  }, [navigate]);
}
