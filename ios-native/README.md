# iOS Native Bootstrap Files

These Swift files belong inside the Xcode project once you run `npx cap add ios`.
They cannot live inside `ios/App/App/` in this repo because the `ios/` folder
is generated locally on your Mac (and is in `.gitignore`).

## Files in this folder

| File | What it is | Where it goes |
|---|---|---|
| `RevenueCatBootstrap.swift` | Compatibility placeholder; runtime config happens through the Capacitor plugin | `ios/App/App/RevenueCatBootstrap.swift` |
| `AppDelegate.swift` | Standard Capacitor AppDelegate with deep-link handlers | `ios/App/App/AppDelegate.swift` (overwrite only if needed) |

## One-time setup

1. From the project root on your Mac:
   ```bash
   npx cap add ios
   npx cap sync ios
   ```
2. Open `ios/App/App.xcworkspace` in Xcode.
3. **File → Add Package Dependencies…**
   - URL: `https://github.com/RevenueCat/purchases-ios-spm.git`
   - Rule: Up to Next Major Version from `5.0.0`
   - Add the **`RevenueCat`** product to the **App** target.
4. Drag **`RevenueCatBootstrap.swift`** from this folder into `ios/App/App/`
   in Xcode. In the dialog:
   - ✅ "Copy items if needed"
   - ✅ Target membership: **App**
5. Do **not** configure RevenueCat directly in `AppDelegate.swift`. The
   `@revenuecat/purchases-capacitor` plugin is configured from
   `src/hooks/useRevenueCat.ts` via `Purchases.configure(...)` before any
   offerings/customer-info calls. This is the required initialization path for
   the hybrid plugin.
6. Verify both Swift files appear under **App target → Build Phases →
   Compile Sources**. If either is missing, click `+` and add it. Without
   this, the file will silently not be compiled.
7. Clean build folder (⇧⌘K) and run.

## How to confirm the bootstrap actually ran

In the Xcode console you should see, immediately on launch:

```
[RC] Native bootstrap skipped; Capacitor plugin configures RevenueCat from JS.
```

Then when the paywall opens, the JS-side hook will log:

```
[RC] configure: initializing Capacitor plugin ...
[RC] configure: Capacitor plugin configured { isConfigured: true }
[RC] init: fetching offerings…
[RC] init: offerings loaded { hasCurrent: true, packageCount: N, ... }
```

## Why configure through the Capacitor plugin?

`@revenuecat/purchases-capacitor` exposes its own `Purchases.configure(...)`
bridge. Calling the native iOS SDK directly from `AppDelegate.swift` can make
the app build successfully while the hybrid plugin still reports
"Purchases has not been configured" and crashes in PurchasesHybridCommon.
The app now initializes RevenueCat from JS through the plugin before calling
`getOfferings`, `getCustomerInfo`, `purchasePackage`, or `restorePurchases`.

## Entitlement key

The single canonical entitlement ID is **`premium`** (lowercase, no space).
It must match in four places:
- `RevenueCatBootstrap.premiumEntitlement` in this folder
- `customerInfo.entitlements.active['premium']` in `src/hooks/useRevenueCat.ts`
  and `src/components/IapPaywallSection.tsx`
- `PREMIUM_ENTITLEMENT = "premium"` in `supabase/functions/revenuecat-webhook/index.ts`
- The Entitlement created in the RevenueCat dashboard

## Before App Review

Set `VITE_REVENUECAT_IOS_API_KEY` to the **public iOS SDK key** from RevenueCat
(Project Settings → API keys → "Public app-specific" for the iOS app), then run
`npx cap sync ios`. Never paste a secret key. If the env var is absent, the app
uses the existing public sandbox key fallback for local testing.
