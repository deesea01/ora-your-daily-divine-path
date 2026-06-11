import { isNativeIOS } from '@/lib/platform';

/**
 * Custom URL scheme registered in the iOS app (Info.plist → CFBundleURLSchemes).
 * Must match the value the user adds to Supabase Auth → URL Configuration →
 * Redirect URLs.
 */
export const NATIVE_URL_SCHEME = 'oradevotion';
export const NATIVE_AUTH_CALLBACK_URL = `${NATIVE_URL_SCHEME}://auth/callback`;

/**
 * Returns the `emailRedirectTo` value to use for signup / magic-link /
 * password-reset emails. On the native iOS shell we deep-link back into the
 * app so the WKWebView restores the Supabase session instead of opening
 * Safari and stranding the user.
 */
export function getAuthEmailRedirectTo(path: '/auth/callback' | '/reset-password' = '/auth/callback'): string {
  if (isNativeIOS()) {
    return `${NATIVE_URL_SCHEME}://${path.replace(/^\//, '')}`;
  }
  return `${window.location.origin}${path}`;
}
