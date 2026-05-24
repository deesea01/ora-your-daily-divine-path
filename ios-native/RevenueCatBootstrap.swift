import Foundation
import RevenueCat

/// Single source of truth for RevenueCat configuration on iOS.
///
/// Called from `AppDelegate.application(_:didFinishLaunchingWithOptions:)`
/// BEFORE Capacitor boots its webview. The JS-side `useRevenueCat` hook
/// intentionally does NOT call `Purchases.configure(...)` again — doing so
/// would reset the singleton and drop the StoreKit2 transaction listener.
///
/// Entitlement identifier is `premium` (lowercase, no space) to match:
///   - JS:      `customerInfo.entitlements.active['premium']`
///   - Webhook: `supabase/functions/revenuecat-webhook` PREMIUM_ENTITLEMENT
enum RevenueCatBootstrap {
    /// Test (sandbox) key. Swap to the production public iOS key before App Review.
    /// Prefer reading from Info.plist via an xcconfig so test/prod is build-driven.
    static let apiKey = "test_UJIsLopWOTwGmpsbwrrDYAvSHGa"

    /// MUST match the entitlement ID configured in the RevenueCat dashboard
    /// and the `PREMIUM_ENTITLEMENT` constant in the revenuecat-webhook edge function.
    static let premiumEntitlement = "premium"

    static func configure() {
        guard !Purchases.isConfigured else { return }
        Purchases.logLevel = .warn
        Purchases.configure(
            with: Configuration.Builder(withAPIKey: apiKey)
                .with(storeKitVersion: .storeKit2)
                .build()
        )
    }
}
