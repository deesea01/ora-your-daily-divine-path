import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

/**
 * Gentle, sacred offline indicator. Listens to browser online/offline events
 * (works in WKWebView on iOS too) and shows a slim banner pinned just below
 * the status bar when the device loses connectivity. Required for App Store
 * review — apps must gracefully indicate when network-dependent features
 * (AI reflections, TTS, sync) are unavailable.
 */
export function OfflineBanner() {
  const [online, setOnline] = useState(
    typeof navigator === 'undefined' ? true : navigator.onLine,
  );

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  if (online) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-2 border-b border-gold/20 bg-background/95 px-4 py-2 pt-safe text-xs text-muted-foreground backdrop-blur"
    >
      <WifiOff className="h-3.5 w-3.5 text-gold/80" aria-hidden="true" />
      <span className="font-serif">You're offline — some prayers and reflections may pause until you reconnect.</span>
    </div>
  );
}

export default OfflineBanner;
