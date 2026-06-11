import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { isNative } from '@/lib/platform';
import { NATIVE_URL_SCHEME } from '@/lib/authRedirect';

/** iOS Safari (NOT the native shell — the in-app case is handled by useAuthDeepLinks). */
function isIOSBrowser(): boolean {
  if (isNative()) return false;
  const ua = navigator.userAgent;
  const isIOSDevice =
    /iPad|iPhone|iPod/.test(ua) ||
    // iPadOS 13+ reports as Mac but has touch support.
    (ua.includes('Macintosh') && navigator.maxTouchPoints > 1);
  return isIOSDevice;
}

/**
 * Auth email callback ("bounce" page).
 *
 * Supabase verification / recovery emails redirect here (an https URL that is
 * always allow-listed). Behavior:
 *
 *  - iOS browser: forward the raw auth params (code / token_hash / hash
 *    tokens) into the native app via `oradevotion://auth/callback`. The app's
 *    deep-link handler (useAuthDeepLinks) restores the session inside the
 *    WKWebView. Fallback buttons let the user retry or continue on the web.
 *  - Desktop / Android web: complete verification here and route into the
 *    web app (existing behavior, unchanged).
 */
const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const [mode, setMode] = useState<'working' | 'app-bounce' | 'error'>('working');
  const [errorMsg, setErrorMsg] = useState('');
  const startedRef = useRef(false);

  // Deep-link URL preserving query string AND hash fragment (implicit tokens).
  const appUrl = `${NATIVE_URL_SCHEME}://auth/callback${location.search}${location.hash}`;

  const hasAuthParams = Boolean(
    params.get('code') ||
      params.get('token_hash') ||
      params.get('token') ||
      location.hash.includes('access_token') ||
      params.get('type'),
  );

  const runWebFlow = async () => {
    setMode('working');
    try {
      const errorDescription = params.get('error_description') ?? params.get('error');
      if (errorDescription) throw new Error(errorDescription);

      const code = params.get('code');
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) throw error;
      } else {
        const tokenHash = params.get('token_hash') ?? params.get('token');
        const type = params.get('type') as any;
        if (tokenHash && type) {
          const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
          if (error) throw error;
        } else if (location.hash.includes('access_token')) {
          const hash = new URLSearchParams(location.hash.replace(/^#/, ''));
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

      const type = params.get('type');
      if (type === 'recovery') {
        navigate('/reset-password', { replace: true });
        return;
      }
      navigate('/', { replace: true });
    } catch (err: any) {
      navigate(`/auth?error=${encodeURIComponent(err?.message ?? 'Verification failed')}`, { replace: true });
    }
  };

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const errorDescription = params.get('error_description') ?? params.get('error');
    if (errorDescription) {
      setErrorMsg(errorDescription);
      setMode('error');
      return;
    }

    if (isIOSBrowser() && hasAuthParams) {
      // Bounce raw params into the native app — do NOT consume the token here,
      // so the in-app deep-link handler can establish the session in the app.
      setMode('app-bounce');
      window.location.href = appUrl;
      return;
    }

    void runWebFlow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (mode === 'app-bounce') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 bg-background">
        <div className="w-full max-w-sm text-center space-y-6">
          <h1 className="font-serif text-2xl text-foreground">Email verified</h1>
          <p className="text-sm text-muted-foreground">Opening the Ora app…</p>
          <div className="space-y-3">
            <a
              href={appUrl}
              className="block w-full rounded-md bg-gold px-4 py-3 text-center text-sm font-medium text-background"
            >
              Open the Ora app
            </a>
            <button
              onClick={() => void runWebFlow()}
              className="block w-full rounded-md border border-border px-4 py-3 text-center text-sm text-muted-foreground"
            >
              Continue in the browser instead
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'error') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 bg-background">
        <div className="w-full max-w-sm text-center space-y-4">
          <h1 className="font-serif text-2xl text-foreground">Verification issue</h1>
          <p className="text-sm text-muted-foreground">{errorMsg}</p>
          <button
            onClick={() => navigate('/auth', { replace: true })}
            className="w-full rounded-md bg-gold px-4 py-3 text-sm font-medium text-background"
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-6 w-6 rounded-full border-2 border-gold border-t-transparent animate-spin" />
    </div>
  );
};

export default AuthCallback;
