import { isNativeIOS } from '@/lib/platform';

/**
 * Custom URL scheme registered in the iOS app
 * (ios/App/App/Info.plist → CFBundleURLTypes → CFBundleURLSchemes).
 *
 * Keep this in sync with Info.plist. The scheme MUST be lowercase and
 * must NOT contain `://` — that's appended when we build the URL.
 */
export const NATIVE_URL_SCHEME = 'ora';
export const NATIVE_AUTH_CALLBACK_URL = `${NATIVE_URL_SCHEME}://auth/callback`;

/**
 * Canonical production web origin (used for web signups + the optional bounce
 * page fallback on /auth/callback).
 */
export const PROD_WEB_ORIGIN = 'https://oradevotion.com';

/**
 * Returns the `emailRedirectTo` value passed to Supabase auth.
 *
 * - Native iOS: `ora://auth/callback` — the custom scheme registered in
 *   Info.plist. iOS opens the Ora app directly when the user taps the
 *   verification link, and `useAuthDeepLinks` restores the session inside
 *   the WKWebView.
 *
 *   NOTE: The exact string `ora://auth/callback` MUST be added to
 *   Supabase Auth → URL Configuration → Additional Redirect URLs, otherwise
 *   Supabase will silently fall back to the Site URL.
 *
 * - Web: the current origin + path.
 */
export function getAuthEmailRedirectTo(
  path: '/auth/callback' | '/reset-password' = '/auth/callback',
): string {
  if (isNativeIOS()) {
    return path === '/reset-password'
      ? `${NATIVE_URL_SCHEME}://reset-password`
      : NATIVE_AUTH_CALLBACK_URL;
  }
  return `${window.location.origin}${path}`;
}
