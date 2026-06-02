import { useCallback, useEffect, useState } from 'react';
import {
  Purchases,
  type CustomerInfo,
  type PurchasesPackage,
  type PurchasesOffering,
} from '@revenuecat/purchases-capacitor';
import { isNativeIOS } from '@/lib/platform';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

/**
 * RevenueCat client hook for the iOS native shell.
 *
 * Web (Paddle) is unaffected — `isNativeIOS()` short-circuits everything,
 * so on the web this hook is essentially a no-op and the existing
 * `usePaddleCheckout` flow runs untouched.
 *
 * RevenueCat is configured with the user's Supabase user_id as the
 * `appUserID` so the server-side webhook can map purchases back to the
 * `subscriptions` row. The iOS public SDK key is provided to JS through
 * `import.meta.env.VITE_REVENUECAT_IOS_API_KEY` (set in `.env`); the
 * server-side `REVENUECAT_IOS_API_KEY` secret is used by edge functions.
 */

/**
 * Ensure the RevenueCat SDK is configured before any other call.
 *
 * Primary path: the native iOS shell (`ios/App/App/RevenueCatBootstrap.swift`)
 * calls `Purchases.configure(...)` during `didFinishLaunchingWithOptions`,
 * before the Capacitor webview boots. That is the preferred place because
 * it lets StoreKit2's transaction listener attach in time to catch
 * App Store-initiated purchases.
 *
 * Safety net (this function): if for any reason the native bootstrap did
 * not run (e.g. dev builds without the Swift file, hot-reload edge cases,
 * or a TestFlight build missing the bootstrap), we configure from JS using
 * `VITE_REVENUECAT_IOS_API_KEY`. This prevents the
 * "Purchases must be configured before calling this function" runtime error.
 *
 * Throws a descriptive error if neither the native bootstrap nor a JS key
 * is available — callers surface that as a friendly setup message.
 */
async function ensureConfigured(appUserID: string): Promise<void> {
  try {
    const { isConfigured } = await Purchases.isConfigured();
    if (isConfigured) return;
  } catch {
    // Older SDKs may not expose isConfigured — fall through and try to configure.
  }
  const apiKey = (import.meta.env.VITE_REVENUECAT_IOS_API_KEY as string | undefined)?.trim();
  if (!apiKey) {
    throw new Error(
      'In-app purchases are not set up on this build. Please update the app from the App Store.',
    );
  }
  await Purchases.configure({ apiKey, appUserID });
}


export interface IapPlan {
  identifier: string; // RevenueCat package ID, e.g. "$rc_monthly"
  productId: string; // App Store product ID, e.g. "ora_premium_monthly"
  title: string;
  priceString: string;
  period: 'monthly' | 'yearly' | 'other';
  introPriceString?: string; // e.g. "Free" or "$0.00"
  introPeriod?: string; // e.g. "3 days"
  rcPackage: PurchasesPackage;
}

function inferPeriod(p: PurchasesPackage): IapPlan['period'] {
  const id = p.identifier?.toLowerCase() ?? '';
  if (id.includes('annual') || id.includes('yearly') || id.includes('year')) return 'yearly';
  if (id.includes('monthly') || id.includes('month')) return 'monthly';
  return 'other';
}

export function useRevenueCat() {
  const { user } = useAuth();
  const [ready, setReady] = useState(false);
  const [plans, setPlans] = useState<IapPlan[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Configure & load offerings whenever a user logs in on iOS.
  useEffect(() => {
    let cancelled = false;
    if (!isNativeIOS() || !user) {
      setReady(false);
      return;
    }
    (async () => {
      try {
        setLoading(true);
        await ensureConfigured(user.id);
        // Make sure the configured user matches the logged-in user (e.g. after re-login).
        await Purchases.logIn({ appUserID: user.id });

        const offerings = await Purchases.getOfferings();
        const current: PurchasesOffering | null = offerings.current ?? null;

        const list: IapPlan[] = (current?.availablePackages ?? []).map((p) => {
          const intro: any = (p.product as any).introPrice;
          const introPeriod = intro?.periodNumberOfUnits && intro?.periodUnit
            ? `${intro.periodNumberOfUnits} ${String(intro.periodUnit).toLowerCase()}${intro.periodNumberOfUnits > 1 ? 's' : ''}`
            : undefined;
          const introPriceString = intro?.price === 0 ? 'Free' : intro?.priceString;
          return {
            identifier: p.identifier,
            productId: p.product.identifier,
            title: p.product.title,
            priceString: p.product.priceString,
            period: inferPeriod(p),
            introPriceString,
            introPeriod,
            rcPackage: p,
          };
        });

        const info = await Purchases.getCustomerInfo();
        if (cancelled) return;
        setPlans(list);
        setCustomerInfo(info.customerInfo);
        setReady(true);
        // Push entitlement state to Supabase so RequirePremium reflects it
        // immediately, even before the RevenueCat webhook lands.
        void syncEntitlement(user.id, info.customerInfo);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? 'Failed to load subscriptions');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const purchase = useCallback(async (plan: IapPlan) => {
    if (!isNativeIOS()) throw new Error('In-app purchases are only available in the iOS app.');
    if (!user) throw new Error('Please sign in before subscribing.');
    if (!ready) throw new Error('Subscriptions are still loading. Please try again in a moment.');
    setError(null);
    setLoading(true);
    try {
      // Defensive: guarantee SDK is configured before invoking purchase.
      await ensureConfigured(user.id);
      const result = await Purchases.purchasePackage({ aPackage: plan.rcPackage });
      setCustomerInfo(result.customerInfo);
      await syncEntitlement(user.id, result.customerInfo);
      return result.customerInfo;
    } catch (e: any) {
      // RevenueCat sets userCancelled when the user dismisses the sheet.
      if (e?.userCancelled) return null;
      setError(e?.message ?? 'Purchase failed');
      throw e;
    } finally {
      setLoading(false);
    }
  }, [user?.id, ready]);

  const restore = useCallback(async () => {
    if (!isNativeIOS()) return null;
    if (!user) throw new Error('Please sign in before restoring purchases.');
    setError(null);
    setLoading(true);
    try {
      await ensureConfigured(user.id);
      const result = await Purchases.restorePurchases();
      setCustomerInfo(result.customerInfo);
      await syncEntitlement(user.id, result.customerInfo);
      return result.customerInfo;
    } catch (e: any) {
      setError(e?.message ?? 'Restore failed');
      throw e;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);


  const hasPremiumEntitlement = !!customerInfo?.entitlements?.active?.['premium'];

  return { ready, loading, error, plans, customerInfo, hasPremiumEntitlement, purchase, restore };
}

/**
 * Mirror RevenueCat entitlement state into the `subscriptions` table so the
 * existing `useSubscription` / `RequirePremium` plumbing keeps working
 * unchanged. The authoritative source is the RevenueCat webhook (more
 * reliable, server-verified) — this is just an optimistic update so the UI
 * unlocks immediately after purchase / restore.
 */
async function syncEntitlement(userId: string, info: CustomerInfo) {
  const ent = info.entitlements.active?.['premium'];
  const isActive = !!ent;
  try {
    if (isActive && ent) {
      await supabase.from('subscriptions').upsert(
        {
          user_id: userId,
          paddle_subscription_id: ent.productIdentifier
            ? `rc_${ent.productIdentifier}_${userId.slice(0, 8)}`
            : `rc_premium_${userId.slice(0, 8)}`,
          paddle_customer_id: info.originalAppUserId,
          product_id: ent.productIdentifier ?? 'ora_premium',
          price_id: ent.productIdentifier ?? 'ora_premium',
          status: 'active',
          current_period_end: ent.expirationDate,
          environment: 'ios_iap',
          provider: 'revenuecat_ios',
        } as any,
        { onConflict: 'user_id,environment' },
      );
    }
  } catch (e) {
    console.warn('[RevenueCat] optimistic entitlement sync failed', e);
  }
}
