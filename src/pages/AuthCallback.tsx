import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

/**
 * Web-side auth email callback. Handles `?code=...` (PKCE) and
 * `?token_hash=...&type=...` (OTP) returned from Supabase verification emails
 * when the user opens them on a desktop browser. The native iOS deep-link
 * handler (`useAuthDeepLinks`) covers the in-app case.
 */
const AuthCallback = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    (async () => {
      try {
        const code = params.get('code');
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else {
          const tokenHash = params.get('token_hash') ?? params.get('token');
          const type = params.get('type') as any;
          if (tokenHash && type) {
            const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
            if (error) throw error;
          }
        }
        const type = params.get('type');
        if (type === 'recovery') {
          navigate('/reset-password', { replace: true });
          return;
        }
        navigate('/', { replace: true });
      } catch (err: any) {
        navigate(`/auth?error=${encodeURIComponent(err?.message ?? 'Verification failed')}`, { replace: true });
      }
    })();
  }, [navigate, params]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-6 w-6 rounded-full border-2 border-gold border-t-transparent animate-spin" />
    </div>
  );
};

export default AuthCallback;
