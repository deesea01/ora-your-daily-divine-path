# iOS Native Bootstrap Files

These Swift files belong inside the Xcode project once you run `npx cap add ios`.

## Setup steps

1. From the project root:
   ```bash
   npx cap add ios
   npx cap sync ios
   ```
2. Open `ios/App/App.xcworkspace` in Xcode.
3. **File → Add Package Dependencies…**
   - URL: `https://github.com/RevenueCat/purchases-ios-spm.git`
   - Rule: Up to Next Major Version from `5.0.0`
   - Add products `RevenueCat` and `RevenueCatUI` to the **App** target.
4. Drag `RevenueCatBootstrap.swift` from this folder into `ios/App/App/` in Xcode
   (check "Copy items if needed", target: App).
5. Edit `ios/App/App/AppDelegate.swift` and add:
   ```swift
   import RevenueCat
   ```
   Then at the top of `application(_:didFinishLaunchingWithOptions:)`:
   ```swift
   RevenueCatBootstrap.configure()
   ```
   This MUST run before `return true` and before any Capacitor view loads.

## Why configure natively?

The JS-side `useRevenueCat` hook no longer calls `Purchases.configure(...)`.
Configuring twice resets the SDK singleton and breaks the StoreKit2
transaction listener, causing missed renewals and orphaned purchases.
Native bootstrap is the one and only configuration entry point.

## Entitlement key

The single canonical entitlement ID is **`premium`** (lowercase, no space).
It must match in three places:
- `RevenueCatBootstrap.premiumEntitlement` in this folder
- `customerInfo.entitlements.active['premium']` in `src/hooks/useRevenueCat.ts`
  and `src/components/IapPaywallSection.tsx`
- `PREMIUM_ENTITLEMENT = "premium"` in `supabase/functions/revenuecat-webhook/index.ts`
- The Entitlement created in the RevenueCat dashboard
