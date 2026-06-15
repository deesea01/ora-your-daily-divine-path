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
 * Contract:
 *  - Entitlement identifier: `premium` (must match RevenueCat dashboard
 *    Entitlements → "premium").
 *  - Expected product identifiers (App Store Connect):
 *      • ora_premium_monthly
 *      • ora_premium_yearly
 *    Plus the RevenueCat package identifiers $rc_monthly / $rc_annual.
 *  - No introductory offer is consumed or surfaced — only the standard
 *    monthly + yearly prices are shown.
 */

const ENTITLEMENT_ID = 'premium';
let configurePromise: Promise<void> | null = null;
let customerInfoUpdateListenerRegistered = false;
let alignedRevenueCatAppUserID: string | null = null;
let identityPromise: Promise<CustomerInfo> | null = null;
let identityPromiseUserID: string | null = null;

// ---- Module-level shared CustomerInfo cache --------------------------------
// useRevenueCat is called from multiple components (IapPaywallSection AND
// useEntitlement, which is consumed by Index / Paywall / RequirePremium).
// Without a shared cache, only the hook instance that initiated the purchase
// sees the updated CustomerInfo, while every other consumer keeps reporting
// `hasPremiumEntitlement=false` — that is the root cause of "user stays stuck
// on the paywall after a successful purchase".
let cachedCustomerInfo: CustomerInfo | null = null;
let customerInfoRevision = 0;
const customerInfoListeners = new Set<(info: CustomerInfo | null, revision: number) => void>();
function broadcastCustomerInfo(info: CustomerInfo | null, source = 'unknown') {
  cachedCustomerInfo = info;
  customerInfoRevision += 1;
  const hasPremium = !!info?.entitlements?.active?.[ENTITLEMENT_ID];
  console.info('[RC] broadcastCustomerInfo', {
    source,
    revision: customerInfoRevision,
    listeners: customerInfoListeners.size,
    hasPremium,
    activeEntitlementKeys: info ? Object.keys(info.entitlements.active ?? {}) : [],
  });
  customerInfoListeners.forEach((l) => {
    try { l(info, customerInfoRevision); } catch { /* noop */ }
  });
  if (hasPremium && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('ora:premium-entitlement-active', {
      detail: {
        source,
        revision: customerInfoRevision,
        entitlementId: ENTITLEMENT_ID,
      },
    }));
  }
}

/**
 * Register a single global RevenueCat customerInfoUpdate listener that
 * broadcasts background StoreKit/RC updates to every hook instance. Without
 * this, post-purchase entitlement propagation that arrives *after* our
 * polling window expires never updates React state and the user is stuck
 * on the paywall.
 */
async function ensureCustomerInfoUpdateListener() {
  if (customerInfoUpdateListenerRegistered) return;
  customerInfoUpdateListenerRegistered = true;
  try {
    await Purchases.addCustomerInfoUpdateListener((info: CustomerInfo) => {
      console.info('[RC] customerInfoUpdate listener fired', {
        hasPremium: !!info?.entitlements?.active?.[ENTITLEMENT_ID],
      });
      broadcastCustomerInfo(info, 'customerInfoUpdateListener');
    });
    console.info('[RC] customerInfoUpdate listener registered');
  } catch (e) {
    customerInfoUpdateListenerRegistered = false;
    console.warn('[RC] failed to register customerInfoUpdate listener', e);
  }
}

function getRevenueCatIosApiKey(): string {
  const key = (import.meta.env.VITE_REVENUECAT_IOS_API_KEY as string | undefined)?.trim();
  if (!key) {
    // Fail loudly instead of silently falling back to a shared sandbox key.
    // A missing key here is the single most common cause of "offerings are
    // empty" / "entitlement never activates" on TestFlight builds.
    throw new Error(
      'RC_MISSING_API_KEY: VITE_REVENUECAT_IOS_API_KEY is not set. Add it to .env.production and rebuild before `npx cap sync ios`.',
    );
  }
  return key;
}

/**
 * Ensure the Capacitor RevenueCat plugin is configured before any other call.
 * Configure via the plugin itself; do not rely on direct native SDK setup from
 * AppDelegate, which does not initialise the plugin bridge consistently.
 */
async function ensureConfigured(): Promise<void> {
  if (!configurePromise) {
    configurePromise = (async () => {
      const apiKey = getRevenueCatIosApiKey();
      console.info('[RC] configure: initializing Capacitor plugin', {
        entitlement: ENTITLEMENT_ID,
        identityMode: 'explicit-logIn-required',
      });
      await Purchases.configure({
        apiKey,
        appUserID: null,
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

function logEntitlementSnapshot(scope: string, info: CustomerInfo | null) {
  const ent = info?.entitlements?.active?.[ENTITLEMENT_ID];
  console.info(`[RC] ${scope}: entitlement snapshot`, {
    appUserId: info?.originalAppUserId,
    hasPremium: !!ent,
    productIdentifier: ent?.productIdentifier,
    expirationDate: ent?.expirationDate,
    willRenew: ent?.willRenew,
    activeEntitlementKeys: info ? Object.keys(info.entitlements.active ?? {}) : [],
  });
}

async function getCurrentRevenueCatAppUserID(scope: string): Promise<string | null> {
  try {
    const { appUserID } = await Purchases.getAppUserID();
    console.info(`[RC] ${scope}: current RevenueCat appUserID`, { appUserID });
    return appUserID;
  } catch (e) {
    logRcError(`${scope}: Purchases.getAppUserID`, e);
    return null;
  }
}

async function ensureRevenueCatIdentity(supabaseUserID: string, source: string): Promise<CustomerInfo> {
  if (identityPromise && identityPromiseUserID === supabaseUserID) return identityPromise;

  identityPromiseUserID = supabaseUserID;
  identityPromise = (async () => {
    await ensureConfigured();
    await ensureCustomerInfoUpdateListener();

    console.info('[RC] identity: Supabase user id', { supabaseUserID, source });
    const beforeAppUserID = await getCurrentRevenueCatAppUserID('identity before logIn');
    console.info('[RC] identity: RevenueCat appUserID before logIn', {
      appUserID: beforeAppUserID,
      supabaseUserID,
      source,
    });

    if (beforeAppUserID !== supabaseUserID) {
      const loginResult = await Purchases.logIn({ appUserID: supabaseUserID });
      console.info('[RC] identity: Purchases.logIn completed', {
        supabaseUserID,
        created: loginResult.created,
        source,
      });
      logEntitlementSnapshot('identity logIn', loginResult.customerInfo);
      broadcastCustomerInfo(loginResult.customerInfo, 'identity-logIn');
    } else {
      console.info('[RC] identity: already aligned before logIn', { supabaseUserID, source });
    }

    const afterAppUserID = await getCurrentRevenueCatAppUserID('identity after logIn');
    console.info('[RC] identity: RevenueCat appUserID after logIn', {
      appUserID: afterAppUserID,
      supabaseUserID,
      source,
    });
    if (afterAppUserID !== supabaseUserID) {
      throw new Error(`RC_IDENTITY_MISMATCH: RevenueCat appUserID ${afterAppUserID ?? 'unknown'} does not match authenticated Ora user ${supabaseUserID}.`);
    }
    alignedRevenueCatAppUserID = afterAppUserID;

    const refreshed = await Purchases.getCustomerInfo();
    console.info('[RC] identity: CustomerInfo refreshed after logIn', {
      appUserID: afterAppUserID,
      premiumActive: !!refreshed.customerInfo.entitlements.active?.[ENTITLEMENT_ID],
      activeEntitlementKeys: Object.keys(refreshed.customerInfo.entitlements.active ?? {}),
    });
    logEntitlementSnapshot('identity refresh', refreshed.customerInfo);
    broadcastCustomerInfo(refreshed.customerInfo, 'identity-refresh');
    return refreshed.customerInfo;
  })().finally(() => {
    identityPromise = null;
    identityPromiseUserID = null;
  });

  return identityPromise;
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
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(cachedCustomerInfo);
  const [customerInfoRevisionState, setCustomerInfoRevision] = useState(customerInfoRevision);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Subscribe every hook instance to the shared CustomerInfo cache so that
  // a purchase / restore in one component instantly updates entitlement
  // status everywhere (Paywall, Index, RequirePremium…).
  useEffect(() => {
    const l = (info: CustomerInfo | null, revision: number) => {
      setCustomerInfo(info);
      setCustomerInfoRevision(revision);
    };
    customerInfoListeners.add(l);
    return () => { customerInfoListeners.delete(l); };
  }, []);

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
        await ensureCustomerInfoUpdateListener();
        if (user) {
          try {
            await Purchases.logIn({ appUserID: user.id });
            console.info('[RC] init: logged in', { appUserId: user.id });
          } catch (e) {
            logRcError('Purchases.logIn', e);
          }
        }

        console.info('[RC] init: fetching offerings…');
        const offerings = await Purchases.getOfferings();
        const current: PurchasesOffering | null = offerings.current ?? null;
        console.info('[RC] init: offerings loaded', {
          currentOfferingId: current?.identifier,
          hasCurrent: !!current,
          packageCount: current?.availablePackages?.length ?? 0,
          allOfferingKeys: Object.keys((offerings as any).all ?? {}),
          packages: (current?.availablePackages ?? []).map((p) => ({
            id: p.identifier,
            productId: p.product.identifier,
            price: p.product.priceString,
          })),
        });

        if (!current) {
          throw new Error(
            'RC_NO_CURRENT_OFFERING: RevenueCat returned no "current" offering. Publish an offering with packages in the RevenueCat dashboard and ensure the App Store products are in "Ready to Submit".',
          );
        }

        // Standard monthly + yearly only — intro pricing is intentionally
        // ignored. No filtering by intro/non-intro; whatever the offering
        // exposes as $rc_monthly / $rc_annual (or equivalent) is shown.
        const list: IapPlan[] = (current?.availablePackages ?? []).map((p) => ({
          identifier: p.identifier,
          productId: p.product.identifier,
          title: p.product.title,
          priceString: p.product.priceString,
          period: inferPeriod(p),
          rcPackage: p,
        }));

        const info = await Purchases.getCustomerInfo();
        logEntitlementSnapshot('init', info.customerInfo);
        if (cancelled) return;
        setPlans(list);
        broadcastCustomerInfo(info.customerInfo, 'init');
        setReady(true);
        if (user) {
          void syncEntitlement(user.id, info.customerInfo);
        }
      } catch (e: any) {
        logRcError('init', e);
        if (!cancelled) {
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
    console.info('[RC] purchase: starting', { package: plan.identifier, productId: plan.productId });
    try {
      await ensureConfigured(user.id);
      const result = await Purchases.purchasePackage({ aPackage: plan.rcPackage });
      console.info('[RC] purchase: completed', { package: plan.identifier });
      logEntitlementSnapshot('purchase', result.customerInfo);
      broadcastCustomerInfo(result.customerInfo, 'purchase');
      console.info('[RC] purchase: entitlement broadcast', {
        hasPremium: !!result.customerInfo.entitlements.active?.[ENTITLEMENT_ID],
      });
      await syncEntitlement(user.id, result.customerInfo);
      return result.customerInfo;
    } catch (e: any) {
      if (e?.userCancelled) {
        console.info('[RC] purchase: user cancelled');
        return null;
      }
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
    console.info('[RC] restore: starting');
    try {
      await ensureConfigured(user.id);
      const result = await Purchases.restorePurchases();
      logEntitlementSnapshot('restore', result.customerInfo);
      const isActive = !!result.customerInfo.entitlements.active?.[ENTITLEMENT_ID];
      console.info('[RC] restore: completed', { isActive });
      broadcastCustomerInfo(result.customerInfo, 'restore');
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

  /**
   * Force-refresh CustomerInfo from RevenueCat, optionally polling until the
   * `premium` entitlement appears. Used immediately after a successful
   * purchase to absorb any propagation lag between StoreKit, RevenueCat, and
   * our cache before we route the user to Home.
   */
  const refreshCustomerInfo = useCallback(
    async (opts?: { waitForPremium?: boolean; attempts?: number; intervalMs?: number }) => {
      if (!isNativeIOS()) return null;
      const attempts = opts?.attempts ?? (opts?.waitForPremium ? 10 : 1);
      const intervalMs = opts?.intervalMs ?? 1500;
      for (let i = 0; i < attempts; i++) {
        try {
          const res = await Purchases.getCustomerInfo();
          broadcastCustomerInfo(res.customerInfo, 'refresh');
          const active = !!res.customerInfo.entitlements.active?.[ENTITLEMENT_ID];
          console.info('[RC] refresh: customerInfo returned', { attempt: i + 1, entitlementActive: active });
          if (!opts?.waitForPremium || active) return res.customerInfo;
        } catch (e) {
          logRcError(`refresh (attempt ${i + 1})`, e);
        }
        if (i < attempts - 1) await new Promise((r) => setTimeout(r, intervalMs));
      }
      return cachedCustomerInfo;
    },
    [],
  );

  const hasPremiumEntitlement = !!customerInfo?.entitlements?.active?.[ENTITLEMENT_ID];

  return { ready, loading, error, plans, customerInfo, customerInfoRevision: customerInfoRevisionState, hasPremiumEntitlement, purchase, restore, refreshCustomerInfo };
}

/**
 * Mirror RevenueCat entitlement state into the `subscriptions` table so the
 * server-side `has_active_subscription` helper stays in sync. The authoritative
 * source remains the RevenueCat webhook; this is an optimistic update so the
 * server agrees with the device immediately after purchase / restore.
 *
 * Only writes when RC reports an active premium entitlement. Never writes a
 * fake "active" row from a non-entitled customer.
 */
async function syncEntitlement(userId: string, info: CustomerInfo) {
  const ent = info.entitlements.active?.[ENTITLEMENT_ID];
  if (!ent) return;
  try {
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
  } catch (e) {
    console.warn('[RC] optimistic entitlement sync failed', e);
  }
}
