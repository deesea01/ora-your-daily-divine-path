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
    if (!user) {
      navigate(`/auth?mode=signup&redirect=${encodeURIComponent('/paywall?autoStart=1')}`);
      return;
    }
    setBusyId(plan.identifier);
    try {
      const info = await purchase(plan);
      if (info?.entitlements?.active?.['premium']) {
        toast.success('Welcome to Ora Premium ✦');
        navigate('/', { replace: true });
      }
    } catch (e: any) {
      toast.error(e?.message ?? 'Purchase failed');
    } finally {
      setBusyId(null);
    }
  };

  const handleRestore = async () => {
    if (!user) {
      navigate(`/auth?mode=login&redirect=${encodeURIComponent('/paywall')}`);
      return;
    }
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

  // Unauthenticated visitors can still view the plans. Sign-in is prompted
  // only when they actually tap Purchase or Restore (see handlers above).


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

  // Setup error or empty offerings — show diagnosable message, still expose Restore.
  // IMPORTANT: do NOT navigate away from /paywall on error. Apple reviewers must
  // be able to see the failure context here, not get bounced to /auth.
  if (error || plans.length === 0) {
    const rawMessage = error ?? 'No subscription plans were returned by the App Store / RevenueCat.';
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          <p className="mb-2 font-medium text-foreground">We couldn't load subscription options.</p>
          <p className="mb-3">
            This usually means the App Store products aren't ready yet, or the device isn't signed
            into a sandbox / production Apple ID that can purchase them.
          </p>
          <details className="rounded-md border border-border/60 bg-background/40 p-2 text-[11px]">
            <summary className="cursor-pointer text-muted-foreground">Technical details (share with support)</summary>
            <pre className="mt-2 whitespace-pre-wrap break-words text-[11px] leading-relaxed text-foreground/80">
              {rawMessage}
            </pre>
            <button
              type="button"
              onClick={() => {
                try {
                  navigator.clipboard?.writeText(rawMessage);
                  toast.success('Error copied');
                } catch {
                  /* noop */
                }
              }}
              className="mt-2 rounded border border-border px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground"
            >
              Copy error
            </button>
          </details>
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
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 pt-2 text-[11px] text-muted-foreground">
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
