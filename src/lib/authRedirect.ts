import { isNativeIOS } from '@/lib/platform';

/**
 * Custom URL scheme registered in the iOS app (Info.plist → CFBundleURLSchemes).
 */
export const NATIVE_URL_SCHEME = 'oradevotion';
export const NATIVE_AUTH_CALLBACK_URL = `${NATIVE_URL_SCHEME}://auth/callback`;

/**
 * Canonical production web origin. The native app's verification emails point
 * here (an https URL) because:
 *  1. Supabase only redirects to allow-listed URLs — https web origins are
 *     already allow-listed, while custom schemes are often stripped by email
 *     clients or rejected, silently falling back to the Site URL (the bug
 *     where users got stranded on the website).
 *  2. The web /auth/callback page detects iOS and "bounces" the auth params
 *     into the app via the oradevotion:// deep link, where the session is
 *     restored inside the WKWebView.
 */
export const PROD_WEB_ORIGIN = 'https://oradevotion.com';

/**
 * Returns the `emailRedirectTo` value for signup / magic-link / password-reset
 * emails.
 *
 * - Native iOS: always the production web `/auth/callback` bounce page. It
 *   forwards tokens into the app (oradevotion://auth/callback) and handles
 *   `type=recovery` by routing to the reset-password flow.
 * - Web: the current origin + path (works for preview, published, and custom
 *   domains since Lovable allow-lists all project origins).
 */
export function getAuthEmailRedirectTo(_path: '/auth/callback' | '/reset-password' = '/auth/callback'): string {
  if (isNativeIOS()) {
    return `${PROD_WEB_ORIGIN}/auth/callback`;
  }
  return `${window.location.origin}${_path}`;
}
