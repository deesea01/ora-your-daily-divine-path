import { Capacitor } from '@capacitor/core';

/**
 * Single source of truth for "are we running inside the native iOS shell?".
 *
 * Used to:
 *  - swap the paywall to Apple In-App Purchases on iOS (Apple requires it)
 *  - schedule on-device LocalNotifications instead of toast-only reminders
 *  - hide the PWA install prompt
 *  - apply iOS safe-area padding
 */
export function isNative(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

export function isIOS(): boolean {
  try {
    return Capacitor.getPlatform() === 'ios';
  } catch {
    return false;
  }
}

export function isAndroid(): boolean {
  try {
    return Capacitor.getPlatform() === 'android';
  } catch {
    return false;
  }
}

/** True when we should show Apple IAP UI instead of Paddle checkout. */
export function isNativeIOS(): boolean {
  return isNative() && isIOS();
}
