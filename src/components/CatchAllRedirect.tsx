import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import NotFound from '@/pages/NotFound';

/**
 * Catch-all for unmatched routes.
 * - While auth is loading: render nothing (avoid flashing 404).
 * - Authenticated users: redirect to home ("/") so they never see 404 after login,
 *   checkout, deep links, or stale URLs.
 * - Unauthenticated users: redirect to /welcome for known app-shell paths,
 *   otherwise show the 404 page.
 */
const APP_PATHS = new Set([
  '/home', '/dashboard', '/app', '/index',
  '/pray', '/prayers', '/library', '/saints', '/guide',
  '/journal', '/recap', '/journey', '/confession',
  '/settings', '/paywall', '/checkout', '/checkout/success',
]);

const CatchAllRedirect = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  const path = location.pathname.toLowerCase();
  const isAppPath =
    APP_PATHS.has(path) ||
    [...APP_PATHS].some((p) => path.startsWith(p + '/'));

  if (isAppPath) {
    return <Navigate to={`/auth?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  return <NotFound />;
};

export default CatchAllRedirect;
