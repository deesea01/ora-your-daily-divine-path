import { useCallback, useEffect, useState } from 'react';
import {
  LOG_LEVEL,
  Purchases,
  STOREKIT_VERSION,
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
 * RevenueCat must be configured through the Capacitor plugin's
 * `Purchases.configure(...)` API before any offerings/customer calls. Native
 * AppDelegate configuration alone can leave PurchasesHybridCommon unready and
 * crash with "Purchases has not been configured".
 */

const REVENUECAT_IOS_PUBLIC_KEY_FALLBACK = 'test_UJIsLopWOTwGmpsbwrrDYAvSHGa';
let configurePromise: Promise<void> | null = null;

function getRevenueCatIosApiKey() {
  return (
    (import.meta.env.VITE_REVENUECAT_IOS_API_KEY as string | undefined)?.trim()
    || REVENUECAT_IOS_PUBLIC_KEY_FALLBACK
  );
}

/**
 * Ensure the Capacitor RevenueCat plugin is configured before any other call.
 * Configure via the plugin itself; do not rely on direct native SDK setup from
 * AppDelegate, which does not initialise the plugin bridge consistently.
 */
async function ensureConfigured(appUserID?: string): Promise<void> {
  if (!configurePromise) {
    configurePromise = (async () => {
      const apiKey = getRevenueCatIosApiKey();
      console.info('[RC] configure: initializing Capacitor plugin', {
        hasUser: !!appUserID,
        source: import.meta.env.VITE_REVENUECAT_IOS_API_KEY ? 'env' : 'public-fallback',
      });
      await Purchases.configure({
        apiKey,
        appUserID: appUserID ?? null,
        storeKitVersion: STOREKIT_VERSION.STOREKIT_2,
      });
      await Purchases.setLogLevel({ level: LOG_LEVEL.WARN });
      const { isConfigured } = await Purchases.isConfigured();
      console.info('[RC] configure: Capacitor plugin configured', { isConfigured });
    })().catch((e) => {
      configurePromise = null;
      throw e;
    });
  }
  await configurePromise;
}

function logRcError(scope: string, e: any) {
  // Capture every RC/StoreKit field we know about so the Xcode console shows
  // something actionable instead of a generic "There was an issue".
  try {
    console.error(`[RC] ${scope} failed`, {
      message: e?.message,
      code: e?.code,
      underlyingErrorMessage: e?.underlyingErrorMessage,
      readableErrorCode: e?.readableErrorCode,
      userCancelled: e?.userCancelled,
      raw: e,
    });
  } catch {
    console.error(`[RC] ${scope} failed (unserialisable)`, e);
  }
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

  // Configure & load offerings on iOS. Offerings can be loaded with an
  // anonymous appUserID so unauthenticated visitors can browse subscription
  // plans on /paywall before signing in (App Store reviewer flow).
  useEffect(() => {
    let cancelled = false;
    if (!isNativeIOS()) {
      setReady(false);
      return;
    }
    (async () => {
      try {
        setLoading(true);
        const appUserID = user?.id;
        console.info('[RC] init: ensuring SDK configured', { appUserID, hasUser: !!user });
        await ensureConfigured(appUserID);
        if (user) {
          try {
            await Purchases.logIn({ appUserID: user.id });
          } catch (e) {
            logRcError('Purchases.logIn', e);
          }
        }

        console.info('[RC] init: fetching offerings…');
        const offerings = await Purchases.getOfferings();
        const current: PurchasesOffering | null = offerings.current ?? null;
        console.info('[RC] init: offerings loaded', {
          hasCurrent: !!current,
          packageCount: current?.availablePackages?.length ?? 0,
          allOfferingKeys: Object.keys((offerings as any).all ?? {}),
        });

        if (!current) {
          throw new Error(
            'RC_NO_CURRENT_OFFERING: RevenueCat returned no "current" offering. Publish an offering with packages in the RevenueCat dashboard and ensure the App Store products are in "Ready to Submit".',
          );
        }

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
        if (user) {
          void syncEntitlement(user.id, info.customerInfo);
        }
      } catch (e: any) {
        logRcError('init', e);
        if (!cancelled) {
          // Surface the raw RC error so the on-screen message is diagnosable
          // during App Review / TestFlight instead of a generic string.
          const code = e?.code ? ` (code ${e.code})` : '';
          setError(`${e?.message ?? 'Failed to load subscriptions'}${code}`);
        }
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
      if (e?.userCancelled) return null;
      logRcError('purchase', e);
      const code = e?.code ? ` (code ${e.code})` : '';
      setError(`${e?.message ?? 'Purchase failed'}${code}`);
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
      logRcError('restore', e);
      const code = e?.code ? ` (code ${e.code})` : '';
      setError(`${e?.message ?? 'Restore failed'}${code}`);
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
        { onConflict: 'user_id,provider,environment' },
      );
    }
  } catch (e) {
    console.warn('[RevenueCat] optimistic entitlement sync failed', e);
  }
}
