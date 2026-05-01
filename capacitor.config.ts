import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor config for Ora iOS native wrapper.
 *
 * Two modes:
 *  - DEV (with `server.url`): the native shell loads the Lovable preview so you
 *    can iterate on the JS in Lovable and see updates in the iOS Simulator
 *    instantly. Uncomment `server` block below for hot-reload during dev.
 *  - PROD (no `server.url`): the native shell loads the bundled `dist/` build.
 *    This is what you ship to TestFlight / the App Store.
 *
 * Bundle ID is locked to the Lovable project ID so future re-exports stay
 * consistent. App name "Ora" matches the brand.
 */
const config: CapacitorConfig = {
  appId: 'app.lovable.402451b9e2f440359c315d5149811cd4',
  appName: 'Ora',
  webDir: 'dist',
  ios: {
    contentInset: 'always',
    // Allow the WKWebView to play TTS / audio without a user gesture every time.
    backgroundColor: '#0b0a08',
    limitsNavigationsToAppBoundDomains: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      backgroundColor: '#0b0a08',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0b0a08',
      overlaysWebView: false,
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#c9a84c',
      sound: 'beep.wav',
    },
  },
  // Uncomment for live reload from Lovable preview while developing in Xcode:
  // server: {
  //   url: 'https://402451b9-e2f4-4035-9c31-5d5149811cd4.lovableproject.com?forceHideBadge=true',
  //   cleartext: true,
  // },
};

export default config;
