import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let initialized = false;
    let mounted = true;

    const finishInit = (s: Session | null, source: string) => {
      if (!mounted) return;
      initialized = true;
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
      console.info('[auth] initialized', { source, hasSession: !!s, userId: s?.user?.id });
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.info('[auth] onAuthStateChange', {
        event,
        hasSession: !!newSession,
        userId: newSession?.user?.id,
        initialized,
      });
      // IMPORTANT: ignore INITIAL_SESSION for state — getSession() below is the
      // authoritative source for the restored session. On iPadOS the
      // INITIAL_SESSION event can fire with a null session before storage has
      // finished hydrating, which would otherwise flash `user=null` and bounce
      // an authenticated user back to /welcome (the App Review loop).
      if (event === 'INITIAL_SESSION') return;
      if (!mounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);
      // Any post-init auth event (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, etc.)
      // confirms the SDK is live — safe to clear the loading gate.
      if (!initialized) initialized = true;
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session: s }, error }) => {
      if (error) console.error('[auth] getSession error', error);
      finishInit(s ?? null, 'getSession');
    }).catch((err) => {
      console.error('[auth] getSession threw', err);
      finishInit(null, 'getSession-error');
    });

    // Safety: never strand the app on the launch/loading screen forever.
    const timeoutId = window.setTimeout(() => {
      if (!initialized && mounted) {
        console.warn('[auth] session restore timed out after 8s — proceeding without session');
        finishInit(null, 'timeout');
      }
    }, 8000);

    return () => {
      mounted = false;
      window.clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    const { getAuthEmailRedirectTo } = await import('@/lib/authRedirect');
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: getAuthEmailRedirectTo('/auth/callback') },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPasswordForEmail = async (email: string) => {
    const { getAuthEmailRedirectTo } = await import('@/lib/authRedirect');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getAuthEmailRedirectTo('/reset-password'),
    });
    return { error };
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error };
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut, resetPasswordForEmail, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
