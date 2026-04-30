import { useEffect, useState } from 'react';
import { Download, Share, X } from 'lucide-react';

const DISMISS_KEY = 'ora:install:dismissed-at';
const INSTALLED_KEY = 'ora:install:installed';
const DISMISS_COOLDOWN_DAYS = 7;

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  // iOS Safari uses navigator.standalone
  // @ts-ignore
  if (window.navigator?.standalone) return true;
  return window.matchMedia?.('(display-mode: standalone)').matches ?? false;
}

function dismissedRecently(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const ts = Number(raw);
    if (!Number.isFinite(ts)) return false;
    return Date.now() - ts < DISMISS_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
  } catch { return false; }
}

function isIos(): boolean {
  return typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent);
}

/**
 * Gentle "Add to Home Screen" prompt.
 *  - Android/Chrome: uses native beforeinstallprompt event
 *  - iOS Safari: shows manual instructions (Share → Add to Home Screen)
 *  - Hidden inside iframes, when already installed, or recently dismissed
 */
export function InstallPrompt() {
  const [evt, setEvt] = useState<BIPEvent | null>(null);
  const [showIos, setShowIos] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isStandalone()) return;
    try { if (window.self !== window.top) return; } catch { return; }
    if (localStorage.getItem(INSTALLED_KEY) === '1') return;
    if (dismissedRecently()) return;

    const onBIP = (e: Event) => {
      e.preventDefault();
      setEvt(e as BIPEvent);
    };
    const onInstalled = () => {
      try { localStorage.setItem(INSTALLED_KEY, '1'); } catch {}
      setEvt(null);
      setShowIos(false);
    };
    window.addEventListener('beforeinstallprompt', onBIP);
    window.addEventListener('appinstalled', onInstalled);

    // iOS fallback: show after a short delay if no BIP event arrives
    let iosTimer: number | undefined;
    if (isIos()) {
      iosTimer = window.setTimeout(() => setShowIos(true), 4000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBIP);
      window.removeEventListener('appinstalled', onInstalled);
      if (iosTimer) window.clearTimeout(iosTimer);
    };
  }, []);

  const dismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch {}
    setEvt(null);
    setShowIos(false);
  };

  const install = async () => {
    if (!evt) return;
    try {
      await evt.prompt();
      const result = await evt.userChoice;
      if (result.outcome === 'accepted') {
        try { localStorage.setItem(INSTALLED_KEY, '1'); } catch {}
      } else {
        dismiss();
      }
    } catch {
      dismiss();
    } finally {
      setEvt(null);
    }
  };

  if (!evt && !showIos) return null;

  return (
    <div className="fixed inset-x-0 bottom-20 z-40 mx-auto w-full max-w-sm px-4 sm:bottom-6">
      <div className="surface-elegant flex items-start gap-3 rounded-xl border border-gold/30 bg-card/95 p-4 shadow-2xl backdrop-blur">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
          <Download className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <p className="font-serif text-sm text-foreground">Add Ora to your Home Screen</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {evt
              ? 'Open Ora in one tap, like a native app.'
              : (
                <>
                  Tap <Share className="mx-0.5 inline h-3.5 w-3.5" aria-hidden="true" /> Share, then
                  <span className="font-medium text-foreground"> Add to Home Screen</span>.
                </>
              )}
          </p>
          {evt && (
            <button
              onClick={install}
              className="mt-2 rounded-md bg-gold px-3 py-1.5 text-xs font-medium text-background transition hover:bg-gold/90"
            >
              Install
            </button>
          )}
        </div>
        <button
          onClick={dismiss}
          aria-label="Dismiss install prompt"
          className="rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default InstallPrompt;
