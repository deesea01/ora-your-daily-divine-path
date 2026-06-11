import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Loader2, Shield, Sparkles, BookOpen, BarChart3, Users, Heart, Compass, Bell, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useEntitlement } from '@/hooks/useEntitlement';
import { usePaddleCheckout } from '@/hooks/usePaddleCheckout';
import { MissionNote } from '@/components/MissionNote';
import SEO from '@/components/SEO';
import { isNativeIOS } from '@/lib/platform';
import { IapPaywallSection } from '@/components/IapPaywallSection';

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
  const location = useLocation();
  const { user } = useAuth();
  const { isPremium, loading: entitlementLoading } = useEntitlement();
  const { openCheckout, loading } = usePaddleCheckout();
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [reminderOn, setReminderOn] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const autoStartedRef = useRef(false);
  const returnTo = (location.state as { from?: string } | null)?.from;

  const handleStartTrial = async (autoPlan?: 'monthly' | 'yearly') => {
    if (!user) {
      // Send unauthenticated users to /auth and bring them back here to auto-open checkout.
      navigate(`/auth?redirect=${encodeURIComponent('/paywall?autoStart=1')}`);
      return;
    }
    const activePlan = autoPlan ?? plan;
    const priceId = activePlan === 'yearly' ? 'ora_premium_yearly' : 'ora_premium_monthly';
    try {
      await openCheckout({
        priceId,
        customerEmail: user.email,
        customData: { userId: user.id, reminderOn: String(reminderOn), plan: activePlan },
        successUrl: `${window.location.origin}/checkout/success`,
      });
    } catch (e) {
      console.error('Checkout failed', e);
    }
  };

  const onIos = isNativeIOS();

  useEffect(() => {
    if (!user || entitlementLoading || !isPremium) return;
    console.info('[Paywall] dismissing — user is premium', {
      onIos,
      returnTo,
    });
    navigate(returnTo && returnTo !== '/paywall' ? returnTo : '/', { replace: true });
  }, [entitlementLoading, isPremium, navigate, returnTo, user, onIos]);

  // If the user just signed in and we asked to auto-start checkout, open it once.
  useEffect(() => {
    if (autoStartedRef.current) return;
    if (searchParams.get('autoStart') !== '1') return;
    if (!user || onIos) return;
    autoStartedRef.current = true;
    // Clear the flag from the URL so refreshes don't re-trigger.
    const next = new URLSearchParams(searchParams);
    next.delete('autoStart');
    setSearchParams(next, { replace: true });
    handleStartTrial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, onIos]);

  return (
    <div className="flex min-h-screen flex-col bg-background px-6 pb-8 pt-safe app-container-wide">
      <SEO
        title="Ora Premium — Daily Catholic Prayer & Devotion Plans"
        description="Begin a guided life of prayer, devotion, and spiritual growth. Ora Premium is $9.99/month or $59.99/year. Cancel anytime."
        canonicalPath="/paywall"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: 'Ora Premium',
          description: 'Guided Catholic prayer, rosary, saint companions, and personalized devotion plans.',
          brand: { '@type': 'Brand', name: 'Ora' },
          offers: [
            { '@type': 'Offer', name: 'Monthly', price: '9.99', priceCurrency: 'USD', category: 'subscription', url: 'https://oradevotion.com/paywall' },
            { '@type': 'Offer', name: 'Yearly', price: '59.99', priceCurrency: 'USD', category: 'subscription', url: 'https://oradevotion.com/paywall' },
          ],
        }}
      />
      <div className="flex-1 flex flex-col">
        <div className="flex justify-end pt-3">
          <button
            type="button"
            onClick={async () => {
              navigate('/welcome');
            }}
            aria-label="Close"
            className="rounded-full p-2 text-muted-foreground transition-colors hover:text-foreground active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="pt-4 text-center">
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

        {/* iOS: Apple In-App Purchases (App Store policy compliant). Web continues with Paddle below. */}
        {onIos && (
          <div className="mt-8">
            <IapPaywallSection />
            <div className="mt-6">
              <MissionNote />
            </div>
          </div>
        )}

        {/* Web (Paddle) plan selector — hidden on iOS where IapPaywallSection takes over. */}
        {!onIos && (
          <>
            <div className="mt-8 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPlan('yearly')}
                  className={`relative rounded-xl border-2 px-4 py-4 text-left transition-all active:scale-[0.98] ${
                    plan === 'yearly' ? 'border-gold bg-gold/10' : 'border-border bg-card'
                  }`}
                >
                  <span className="absolute -top-2 right-3 rounded-full bg-foreground/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-background">
                    Best value
                  </span>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Yearly</p>
                  <p className="mt-1 font-serif text-2xl text-foreground">$59.99<span className="text-sm text-muted-foreground">/yr</span></p>
                  <p className="mt-1 text-[11px] text-muted-foreground">$5.00/mo · save 50%</p>
                </button>
                <button
                  onClick={() => setPlan('monthly')}
                  className={`rounded-xl border-2 px-4 py-4 text-left transition-all active:scale-[0.98] ${
                    plan === 'monthly' ? 'border-gold bg-gold/10' : 'border-border bg-card'
                  }`}
                >
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Monthly</p>
                  <p className="mt-1 font-serif text-2xl text-foreground">$9.99<span className="text-sm text-muted-foreground">/mo</span></p>
                  <p className="mt-1 text-[11px] text-muted-foreground">Cancel anytime</p>
                </button>
              </div>
            </div>

            {/* Trust strip */}
            <div className="mt-6 space-y-2 rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Check className="h-3.5 w-3.5 text-gold" />
                <span>
                  {plan === 'yearly'
                    ? '$59.99/year, billed annually'
                    : '$9.99/month, billed monthly'}
                </span>
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
                <span className="text-xs text-foreground">Remind me about my subscription</span>
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
          </>
        )}
      </div>

      {/* CTA — Paddle only. iOS purchases happen inline via IapPaywallSection. */}
      {!onIos && (
        <div className="mt-6 space-y-3">
          <button
            disabled={loading}
            onClick={() => handleStartTrial()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold py-4 font-medium text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Unlock Your Prayer Life'}
          </button>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 pt-1 text-[11px] text-muted-foreground">
            <a href="/terms-of-service" className="underline underline-offset-2 hover:text-gold">Terms of Service</a>
            <span aria-hidden>·</span>
            <a href="/privacy-policy" className="underline underline-offset-2 hover:text-gold">Privacy Policy</a>
            <span aria-hidden>·</span>
            <a
              href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-gold"
            >
              EULA (Apple Standard)
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default Paywall;
