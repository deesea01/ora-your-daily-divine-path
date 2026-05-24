import { useCallback, useEffect, useState } from 'react';
import {
  Purchases,
  LOG_LEVEL,
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
 * NOTE: `Purchases.configure(...)` is intentionally NOT called here.
 *
 * The native iOS shell (see `ios/App/App/RevenueCatBootstrap.swift`) configures
 * the SDK during `application(_:didFinishLaunchingWithOptions:)`, before the
 * Capacitor webview boots. Configuring again from JS would reset the singleton
 * and break the in-flight StoreKit2 transaction listener.
 *
 * On non-iOS platforms this hook short-circuits via `isNativeIOS()`.
 */
async function ensureConfigured(_appUserID: string) {
  // No-op: native bootstrap owns configuration.
  return;
}

export interface IapPlan {
  identifier: string; // RevenueCat package ID, e.g. "$rc_monthly"
  productId: string; // App Store product ID, e.g. "ora_premium_monthly"
  title: string;
  priceString: string;
  period: 'monthly' | 'yearly' | 'other';
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

        const list: IapPlan[] = (current?.availablePackages ?? []).map((p) => ({
          identifier: p.identifier,
          productId: p.product.identifier,
          title: p.product.title,
          priceString: p.product.priceString,
          period: inferPeriod(p),
          rcPackage: p,
        }));

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
    if (!isNativeIOS()) throw new Error('IAP is only available in the iOS app.');
    setError(null);
    setLoading(true);
    try {
      const result = await Purchases.purchasePackage({ aPackage: plan.rcPackage });
      setCustomerInfo(result.customerInfo);
      if (user) await syncEntitlement(user.id, result.customerInfo);
      return result.customerInfo;
    } catch (e: any) {
      // RevenueCat sets userCancelled when the user dismisses the sheet.
      if (e?.userCancelled) return null;
      setError(e?.message ?? 'Purchase failed');
      throw e;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const restore = useCallback(async () => {
    if (!isNativeIOS()) return null;
    setError(null);
    setLoading(true);
    try {
      const result = await Purchases.restorePurchases();
      setCustomerInfo(result.customerInfo);
      if (user) await syncEntitlement(user.id, result.customerInfo);
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
