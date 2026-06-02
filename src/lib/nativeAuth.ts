/**
 * Native (Capacitor / iOS) OAuth flow.
 *
 * On the web, `lovable.auth.signInWithOAuth` works because `window.location.origin`
 * is a real https URL the provider can redirect to. Inside the Capacitor WebView the
 * origin is `capacitor://localhost`, which Google / Apple reject — sign-in just dies
 * silently or 404s.
 *
 * Fix: bypass the Lovable JS wrapper on native, drive Supabase auth directly with
 * `skipBrowserRedirect`, open the provider URL in an SFSafariViewController
 * (`@capacitor/browser`), and finish the session when Supabase redirects back to our
 * custom URL scheme (`app.lovable.<id>://oauth-callback`) via Capacitor's
 * `appUrlOpen` event.
 *
 * Requirements (done outside this file):
 *   1. Info.plist registers the custom scheme — see IOS_RELEASE.md.
 *   2. Supabase Auth → URL Configuration → Redirect URLs allow-lists the scheme.
 *   3. Google / Apple OAuth providers point at the Supabase callback
 *      `https://<ref>.supabase.co/auth/v1/callback`.
 */
import { Browser } from '@capacitor/browser';
import { App, type URLOpenListenerEvent } from '@capacitor/app';
import { supabase } from '@/integrations/supabase/client';

export const NATIVE_OAUTH_SCHEME = 'app.lovable.402451b9e2f440359c315d5149811cd4';
export const NATIVE_OAUTH_REDIRECT = `${NATIVE_OAUTH_SCHEME}://oauth-callback`;

let urlListener: Awaited<ReturnType<typeof App.addListener>> | null = null;

async function clearListener() {
  if (urlListener) {
    try { await urlListener.remove(); } catch {}
    urlListener = null;
  }
}

async function completeFromUrl(rawUrl: string): Promise<{ error?: Error }> {
  try { await Browser.close(); } catch {}
  try {
    // Custom-scheme URLs aren't always parseable by URL(); normalize first.
    const normalized = rawUrl.replace(`${NATIVE_OAUTH_SCHEME}://`, 'https://lovable.local/');
    const url = new URL(normalized);

    const errParam = url.searchParams.get('error_description') || url.searchParams.get('error');
    if (errParam) return { error: new Error(decodeURIComponent(errParam)) };

    const code = url.searchParams.get('code');
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) return { error };
      return {};
    }

    // Implicit / hash-fragment flow fallback.
    const hash = url.hash.startsWith('#') ? url.hash.slice(1) : url.hash;
    if (hash) {
      const params = new URLSearchParams(hash);
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');
      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({ access_token, refresh_token });
        if (error) return { error };
        return {};
      }
    }

    return { error: new Error('OAuth callback missing code or tokens.') };
  } catch (e: any) {
    return { error: e instanceof Error ? e : new Error(String(e)) };
  }
}

export async function nativeOAuthSignIn(
  provider: 'google' | 'apple',
): Promise<{ error?: Error }> {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: NATIVE_OAUTH_REDIRECT,
        skipBrowserRedirect: true,
      },
    });
    if (error) throw error;
    if (!data?.url) throw new Error('No OAuth URL returned by auth provider.');

    await clearListener();
    urlListener = await App.addListener('appUrlOpen', async (event: URLOpenListenerEvent) => {
      if (!event.url.startsWith(`${NATIVE_OAUTH_SCHEME}://`)) return;
      const result = await completeFromUrl(event.url);
      await clearListener();
      if (result.error) {
        console.error('[nativeAuth] callback failed:', result.error);
      }
    });

    await Browser.open({ url: data.url, presentationStyle: 'popover' });
    return {};
  } catch (err: any) {
    await clearListener();
    return { error: err instanceof Error ? err : new Error(String(err)) };
  }
}
