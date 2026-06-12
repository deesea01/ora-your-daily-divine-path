import Foundation

/// Legacy native bootstrap placeholder.
///
/// The `@revenuecat/purchases-capacitor` plugin must be initialized through
/// its Capacitor bridge (`Purchases.configure(...)` in `src/hooks/useRevenueCat.ts`).
/// Direct native SDK configuration from AppDelegate can leave
/// PurchasesHybridCommon unconfigured and crash when the plugin is called.
///
/// Entitlement identifier is `premium` (lowercase, no space) to match:
///   - JS:      `customerInfo.entitlements.active['premium']`
///   - Webhook: `supabase/functions/revenuecat-webhook` PREMIUM_ENTITLEMENT
enum RevenueCatBootstrap {
    /// Runtime RevenueCat configuration is performed in JS via the Capacitor
    /// plugin using `VITE_REVENUECAT_IOS_API_KEY`. No native key is bundled
    /// here so the legacy sandbox/test key cannot be shipped accidentally.

    /// MUST match the entitlement ID configured in the RevenueCat dashboard
    /// and the `PREMIUM_ENTITLEMENT` constant in the revenuecat-webhook edge function.
    static let premiumEntitlement = "premium"

    static func configure() {
        NSLog("[RC] Native bootstrap skipped; Capacitor plugin configures RevenueCat from JS.")
    }
}
