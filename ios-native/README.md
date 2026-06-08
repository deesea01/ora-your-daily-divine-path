# iOS Native Bootstrap Files

These Swift files belong inside the Xcode project once you run `npx cap add ios`.
They cannot live inside `ios/App/App/` in this repo because the `ios/` folder
is generated locally on your Mac (and is in `.gitignore`).

## Files in this folder

| File | What it is | Where it goes |
|---|---|---|
| `RevenueCatBootstrap.swift` | Single source of truth for `Purchases.configure(...)` | `ios/App/App/RevenueCatBootstrap.swift` |
| `AppDelegate.swift` | Drop-in AppDelegate that calls `RevenueCatBootstrap.configure()` at launch | `ios/App/App/AppDelegate.swift` (overwrite the default) |

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
5. Drag **`AppDelegate.swift`** from this folder into `ios/App/App/` and
   choose **Replace** when Xcode warns about the existing file. Same target
   options as above. (Or, if you have customised your AppDelegate, just
   paste the single line `RevenueCatBootstrap.configure()` as the FIRST
   statement inside `application(_:didFinishLaunchingWithOptions:)`, and
   add `import RevenueCat` at the top.)
6. Verify both Swift files appear under **App target → Build Phases →
   Compile Sources**. If either is missing, click `+` and add it. Without
   this, the file will silently not be compiled and the bootstrap will
   never run.
7. Clean build folder (⇧⌘K) and run.

## How to confirm the bootstrap actually ran

In the Xcode console you should see, immediately on launch:

```
[Purchases] - INFO: Configuring Purchases SDK
```

Then when the paywall opens, the JS-side hook will log:

```
[RC] SDK already configured (native bootstrap).
[RC] init: fetching offerings…
[RC] init: offerings loaded { hasCurrent: true, packageCount: N, ... }
```

If instead you see `[RC] Configuring SDK from JS fallback` — the native
bootstrap did NOT run. Re-check steps 4–6 above (most often the Swift file
is in the project but not in the App target's Compile Sources).

## Why configure natively (and only natively)?

The JS-side `useRevenueCat` hook will only call `Purchases.configure(...)`
as a safety-net fallback when `Purchases.isConfigured` is false. Configuring
twice resets the SDK singleton and breaks the StoreKit2 transaction
listener, causing missed renewals and orphaned purchases. The native
bootstrap is the one and only intended configuration entry point.

## Entitlement key

The single canonical entitlement ID is **`premium`** (lowercase, no space).
It must match in four places:
- `RevenueCatBootstrap.premiumEntitlement` in this folder
- `customerInfo.entitlements.active['premium']` in `src/hooks/useRevenueCat.ts`
  and `src/components/IapPaywallSection.tsx`
- `PREMIUM_ENTITLEMENT = "premium"` in `supabase/functions/revenuecat-webhook/index.ts`
- The Entitlement created in the RevenueCat dashboard

## Before App Review

Replace the sandbox key in `RevenueCatBootstrap.swift`:

```swift
static let apiKey = "appl_xxx_PRODUCTION_PUBLIC_IOS_SDK_KEY"
```

Use the **public iOS SDK key** from the RevenueCat dashboard (Project Settings →
API keys → "Public app-specific" for the iOS app). Never paste a secret key.
