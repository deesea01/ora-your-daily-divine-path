import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { MissionNote } from '@/components/MissionNote';
import SEO from '@/components/SEO';

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const { isActive, refresh } = useSubscription();

  useEffect(() => {
    // Webhook may take a few seconds — poll briefly
    const t = setInterval(refresh, 2000);
    const stop = setTimeout(() => clearInterval(t), 20000);
    return () => {
      clearInterval(t);
      clearTimeout(stop);
    };
  }, [refresh]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gold/10">
        <CheckCircle2 className="h-9 w-9 text-gold" />
      </div>
      <h1 className="font-serif text-3xl text-foreground mb-3">Welcome to Ora.</h1>
      <p className="text-sm text-muted-foreground max-w-xs mb-2">
        Your 3-day trial has started. We'll remind you before it ends.
      </p>
      {isActive && <p className="text-xs text-gold mb-6">✓ Subscription active</p>}

      <div className="w-full max-w-xs mt-2">
        <MissionNote />
      </div>

      <button
        onClick={() => navigate('/', { replace: true })}
        className="mt-6 w-full max-w-xs rounded-xl bg-gold py-4 font-medium text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98]"
      >
        Enter Your Path
      </button>
    </div>
  );
};

export default CheckoutSuccess;
