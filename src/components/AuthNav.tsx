import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { User, Settings as SettingsIcon, CreditCard, LogOut } from 'lucide-react';

/**
 * Persistent site-wide auth navigation (top-right).
 * SYSTEM CRITICAL: Do not remove unless explicitly instructed.
 * - Logged out: Sign In + Create Account
 * - Logged in: avatar menu with Account, Subscription, Logout
 */
const HIDDEN_ROUTES = ['/auth', '/reset-password'];

export const AuthNav = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  if (HIDDEN_ROUTES.includes(location.pathname)) return null;
  if (loading) return null;
  if (!user) return null;

  const handleLogout = async () => {
    await signOut();
    navigate('/welcome');
  };

  const initial = (user?.email || 'U').charAt(0).toUpperCase();

  return (
    <div
      data-testid="auth-nav"
      className="fixed top-3 right-3 z-50 flex items-center gap-2"
    >
      {!user ? (
        <>
          <Link
            to="/auth?mode=login"
            data-testid="auth-nav-signin"
            className="rounded-lg border border-border bg-card/80 backdrop-blur px-3 py-1.5 text-xs font-medium text-foreground hover:border-gold/40 transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/auth?mode=signup"
            data-testid="auth-nav-signup"
            className="rounded-lg bg-gold px-3 py-1.5 text-xs font-medium text-primary-foreground hover:brightness-110 transition-all"
          >
            Create Account
          </Link>
        </>
      ) : (
        <div ref={ref} className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            data-testid="auth-nav-profile"
            aria-label="Account menu"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/80 backdrop-blur text-xs font-medium text-foreground hover:border-gold/40"
          >
            {initial}
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card shadow-lg overflow-hidden animate-fade-in">
              <div className="px-3 py-2 border-b border-border">
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
              <Link
                to="/settings"
                className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent"
              >
                <SettingsIcon className="h-4 w-4" /> Account Settings
              </Link>
              <Link
                to="/settings#subscription"
                className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent"
              >
                <CreditCard className="h-4 w-4" /> Subscription / Billing
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent border-t border-border"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AuthNav;
