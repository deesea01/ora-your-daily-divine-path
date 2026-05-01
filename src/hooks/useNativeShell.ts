import { useEffect } from 'react';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App } from '@capacitor/app';
import { isNative, isIOS } from '@/lib/platform';

/**
 * One-time native shell setup: hides the splash once React has hydrated,
 * configures the status bar to match Ora's dark theme, and wires the
 * Android / iOS hardware back gesture to React Router history.
 *
 * No-op on the web.
 */
export function useNativeShell() {
  useEffect(() => {
    if (!isNative()) return;

    (async () => {
      try {
        if (isIOS()) {
          await StatusBar.setStyle({ style: Style.Dark });
        }
      } catch {}
      try {
        // React has hydrated — fade out the splash.
        await SplashScreen.hide({ fadeOutDuration: 300 });
      } catch {}
    })();

    const backSub = App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) window.history.back();
      else App.exitApp();
    });

    return () => {
      void backSub.then((s) => s.remove());
    };
  }, []);
}
