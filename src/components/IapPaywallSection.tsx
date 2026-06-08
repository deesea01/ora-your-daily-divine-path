import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, RefreshCw, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useRevenueCat, type IapPlan } from '@/hooks/useRevenueCat';
import { useAuth } from '@/hooks/useAuth';


/**
 * iOS-only paywall surface, swapped in by `Paywall.tsx` when `isNativeIOS()`.
 *
 * Uses RevenueCat to render Apple's native StoreKit purchase sheet. Includes
 * the "Restore Purchases" button required by App Store Review Guideline 3.1.1.
 *
 * Web users never see this — the existing Paddle UI in `Paywall.tsx` is shown
 * instead. Auth + subscription gating logic is identical for both.
 */
export function IapPaywallSection() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { ready, loading, plans, error, hasPremiumEntitlement, purchase, restore } = useRevenueCat();
  const [busyId, setBusyId] = useState<string | null>(null);

  const handlePurchase = async (plan: IapPlan) => {
    setBusyId(plan.identifier);
    try {
      const info = await purchase(plan);
      if (info?.entitlements?.active?.['premium']) {
        toast.success('Welcome to Ora Premium ✦');
        // Take the user into the app immediately once Apple confirms the
        // purchase. Without this, the user is left on the paywall waiting
        // for the RevenueCat → Supabase webhook to flip `isPremium`.
        navigate('/', { replace: true });
      }
    } catch (e: any) {
      toast.error(e?.message ?? 'Purchase failed');
    } finally {
      setBusyId(null);
    }
  };

  const handleRestore = async () => {
    setBusyId('restore');
    try {
      const info = await restore();
      if (info?.entitlements?.active?.['premium']) {
        toast.success('Premium restored');
        navigate('/', { replace: true });
      } else {
        toast('No previous purchase found on this Apple ID', {
          description: 'If you bought Premium with a different Apple ID, sign in to that ID in iOS Settings and try again.',
        });
      }
    } catch (e: any) {
      toast.error(e?.message ?? 'Restore failed');
    } finally {
      setBusyId(null);
    }
  };

  // Not signed in yet — RevenueCat needs an appUserID. Show a sign-in CTA
  // instead of an infinite spinner so Apple reviewers (and new users landing
  // on /paywall from "View pricing") always have a clear next step.
  if (!authLoading && !user) {
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-border bg-card p-4 text-sm text-foreground">
          Sign in to view subscription options and unlock your prayer life.
        </div>
        <button
          onClick={() => navigate('/auth?mode=signup&redirect=%2Fpaywall')}
          className="w-full rounded-xl bg-gold py-4 font-medium text-primary-foreground transition-all active:scale-[0.98]"
        >
          Sign in to continue
        </button>
      </div>
    );
  }

  // Loading state — block all purchase UI until offerings actually arrive.
  if (authLoading || loading || (!ready && !error)) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <p className="text-xs">Loading subscription options…</p>
      </div>
    );
  }

  if (hasPremiumEntitlement) {
    return (
      <div className="rounded-xl border border-gold/40 bg-gold/10 p-4 text-sm text-foreground">
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-gold" />
          <span>You have Ora Premium.</span>
        </div>
      </div>
    );
  }

  // Setup error or empty offerings — show friendly message, still expose Restore.
  if (error || plans.length === 0) {
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          {error
            ? error
            : "Subscription plans aren't available right now. Please check your connection and try again in a moment."}
        </div>
        <button
          onClick={handleRestore}
          disabled={busyId !== null}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-transparent py-3 text-sm text-muted-foreground transition-all active:scale-[0.98] disabled:opacity-60"
        >
          {busyId === 'restore' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Restore Purchases
        </button>
      </div>
    );
  }


  return (
    <div className="space-y-3">
      {plans.map((plan) => (
        <button
          key={plan.identifier}
          onClick={() => handlePurchase(plan)}
          disabled={busyId !== null}
          className="flex w-full items-center justify-between rounded-xl border-2 border-border bg-card px-4 py-4 text-left transition-all active:scale-[0.98] disabled:opacity-60"
        >
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              {plan.period === 'yearly' ? 'Yearly' : plan.period === 'monthly' ? 'Monthly' : plan.title}
            </p>
            <p className="mt-1 font-serif text-2xl text-foreground">{plan.priceString}</p>
            {plan.introPeriod && plan.introPriceString && plan.introPriceString !== 'Free' && (
              <p className="mt-1 text-[11px] text-gold">
                {`${plan.introPriceString} for ${plan.introPeriod}, then ${plan.priceString}`}
              </p>
            )}
          </div>
          {busyId === plan.identifier ? (
            <Loader2 className="h-5 w-5 animate-spin text-gold" />
          ) : (
            <span className="rounded-full bg-gold px-4 py-2 text-sm font-medium text-primary-foreground">Unlock</span>
          )}
        </button>
      ))}

      <button
        onClick={handleRestore}
        disabled={busyId !== null}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-transparent py-3 text-sm text-muted-foreground transition-all active:scale-[0.98] disabled:opacity-60"
      >
        {busyId === 'restore' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="h-4 w-4" />
        )}
        Restore Purchases
      </button>

      <p className="px-2 pt-2 text-[11px] leading-relaxed text-muted-foreground">
        Subscriptions auto-renew unless cancelled at least 24 hours before the end of the period. Manage or
        cancel anytime in your Apple ID settings. Payment is charged to your Apple ID account at confirmation.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 pt-1 text-[11px] text-muted-foreground">
        <Link to="/terms-of-service" className="underline underline-offset-2 hover:text-gold">Terms of Service</Link>
        <span aria-hidden>·</span>
        <Link to="/privacy-policy" className="underline underline-offset-2 hover:text-gold">Privacy Policy</Link>
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
  );
}
