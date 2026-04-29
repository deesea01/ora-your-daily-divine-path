import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Loader2, Shield, Sparkles, BookOpen, BarChart3, Users, Heart, Compass, Bell } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePaddleCheckout } from '@/hooks/usePaddleCheckout';
import { MissionNote } from '@/components/MissionNote';
import SEO from '@/components/SEO';

const FEATURES = [
  { icon: Users, text: 'Unlimited Saint companions' },
  { icon: Compass, text: 'Personalized spiritual plans' },
  { icon: BarChart3, text: 'Faith Journey analytics' },
  { icon: Heart, text: 'Prayer Vault — remember God\u2019s faithfulness' },
  { icon: BookOpen, text: 'Premium guided audio prayers' },
  { icon: Sparkles, text: 'Exclusive novenas & devotionals' },
  { icon: Bell, text: 'Early access to new features' },
];

const Paywall = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openCheckout, loading } = usePaddleCheckout();
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [reminderOn, setReminderOn] = useState(true);

  const handleStartTrial = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    const priceId = plan === 'yearly' ? 'ora_premium_yearly' : 'ora_premium_monthly';
    try {
      await openCheckout({
        priceId,
        customerEmail: user.email,
        customData: { userId: user.id, reminderOn: String(reminderOn) },
        successUrl: `${window.location.origin}/checkout/success`,
      });
    } catch (e) {
      console.error('Checkout failed', e);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background px-6 pb-8 pt-safe">
      <SEO title="Pricing & Premium | Ora" description="Unlock unlimited saints, advanced reflections, and full prayer history with Ora Premium." canonicalPath="/paywall" />
      <div className="flex-1 flex flex-col">
        <div className="pt-10 text-center">
          <div className="mb-4 text-4xl">✨</div>
          <h1 className="font-serif text-3xl text-foreground mb-2">Begin Your New Journey</h1>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            A guided life of prayer, devotion, and spiritual growth.
          </p>
        </div>

        {/* Value stack */}
        <div className="mt-8 space-y-3">
          {FEATURES.map((f, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/10">
                <f.icon className="h-4 w-4 text-gold" />
              </div>
              <p className="text-sm text-foreground">{f.text}</p>
            </div>
          ))}
        </div>

        {/* Plan selector */}
        <div className="mt-8 grid grid-cols-2 gap-3">
          <button
            onClick={() => setPlan('yearly')}
            className={`relative rounded-xl border-2 px-4 py-4 text-left transition-all active:scale-[0.98] ${
              plan === 'yearly' ? 'border-gold bg-gold/10' : 'border-border bg-card'
            }`}
          >
            <span className="absolute -top-2 right-3 rounded-full bg-gold px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
              Best value
            </span>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Yearly</p>
            <p className="mt-1 font-serif text-2xl text-foreground">$70<span className="text-sm text-muted-foreground">/yr</span></p>
            <p className="mt-1 text-[11px] text-muted-foreground">Just $5.83/mo · save 42%</p>
          </button>
          <button
            onClick={() => setPlan('monthly')}
            className={`rounded-xl border-2 px-4 py-4 text-left transition-all active:scale-[0.98] ${
              plan === 'monthly' ? 'border-gold bg-gold/10' : 'border-border bg-card'
            }`}
          >
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Monthly</p>
            <p className="mt-1 font-serif text-2xl text-foreground">$10<span className="text-sm text-muted-foreground">/mo</span></p>
            <p className="mt-1 text-[11px] text-muted-foreground">Cancel anytime</p>
          </button>
        </div>

        {/* Trust strip */}
        <div className="mt-6 space-y-2 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Check className="h-3.5 w-3.5 text-gold" />
            <span>3 days free — then ${plan === 'yearly' ? '70/year' : '10/month'}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Check className="h-3.5 w-3.5 text-gold" />
            <span>Cancel anytime, no questions asked</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5 text-gold" />
            <span>Secure checkout · taxes handled for you</span>
          </div>
          <label className="flex items-center justify-between pt-2 cursor-pointer">
            <span className="text-xs text-foreground">Remind me before my trial ends</span>
            <input
              type="checkbox"
              checked={reminderOn}
              onChange={(e) => setReminderOn(e.target.checked)}
              className="h-4 w-4 accent-gold"
            />
          </label>
        </div>

        {/* Mission + sponsor */}
        <div className="mt-6">
          <MissionNote />
        </div>
      </div>

      {/* CTAs */}
      <div className="mt-6 space-y-3">
        <button
          disabled={loading}
          onClick={handleStartTrial}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold py-4 font-medium text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Begin Premium Journey'}
        </button>
      </div>
    </div>
  );
};

export default Paywall;
