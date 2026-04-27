import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

/**
 * Footer fallback CTA for sign-in / sign-up.
 * Only shown when logged out. Provides redundancy if top nav fails to render.
 */
const HIDDEN_ROUTES = ['/auth', '/reset-password'];

export const AuthFooterFallback = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading || user) return null;
  if (HIDDEN_ROUTES.includes(location.pathname)) return null;

  return (
    <div
      data-testid="auth-footer-fallback"
      className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 rounded-full border border-border bg-card/90 backdrop-blur px-4 py-2 text-xs shadow-md"
    >
      <span className="text-muted-foreground hidden sm:inline">Account:</span>
      <Link to="/auth?mode=login" className="text-foreground hover:text-gold">Sign In</Link>
      <span className="text-border">·</span>
      <Link to="/auth?mode=signup" className="text-gold hover:underline">Create Account</Link>
    </div>
  );
};

export default AuthFooterFallback;
