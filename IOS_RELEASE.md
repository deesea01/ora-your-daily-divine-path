# Ora — iOS App Store Release Guide

This document walks you through wrapping the existing Ora web app as a native
iOS app and submitting it to the App Store. Nothing in the web app changes —
the same React build runs inside a Capacitor WebView, with native plugins
layered on top for splash, status bar, local notifications, and Apple In-App
Purchases.

## What's already wired up in code

✅ **Capacitor scaffold** — `capacitor.config.ts` (bundle ID `app.lovable.402451b9e2f440359c315d5149811cd4`, app name `Ora`).
✅ **Native plugins installed** — `@capacitor/ios`, `@capacitor/splash-screen`, `@capacitor/status-bar`, `@capacitor/local-notifications`, `@capacitor/app`, `@capacitor/preferences`.
✅ **App icon + splash artwork** — `resources/icon.png`, `resources/splash.png` (sacred minimalist gold cross). Run `npx capacitor-assets generate --ios` to fan them out into every required size.
✅ **Splash hide + status bar** — `useNativeShell` hook, mounted in `App.tsx`, no-op on web.
✅ **Local prayer reminders** — `useNativeNotifications` schedules daily on-device notifications for Morning / Midday / Night using your existing `usePrayerReminders` time preferences. Tap → deep links to `/prayer/:slot`.
✅ **iOS-only paywall via RevenueCat** — `IapPaywallSection` swaps in for Paddle when `isNativeIOS()`. Includes the **Restore Purchases** button required by App Review Guideline 3.1.1.
✅ **Subscription mirroring** — `subscriptions` table now has a `provider` column. Apple IAP rows use `provider='revenuecat_ios'`, `environment='ios_iap'`. The existing `useSubscription` / `RequirePremium` flow reads them transparently.
✅ **RevenueCat webhook** — `supabase/functions/revenuecat-webhook/index.ts` mirrors entitlement changes into the DB, gated by a shared bearer secret (`REVENUECAT_WEBHOOK_AUTH`).
✅ **Safe areas** — `pt-safe` / `pb-safe` / `px-safe` utility classes respect the iPhone notch and home indicator.
✅ **Auth & session persistence** — Supabase `localStorage` persistence already configured; works inside the WKWebView with no changes.
✅ **Privacy + Terms links** — Already in `/settings`.

## Prerequisites you need

1. **Mac with Xcode 15+** installed
2. **Apple Developer Program membership** ($99/year) — https://developer.apple.com/programs/enroll/
3. **App Store Connect access** — created automatically with your dev account
4. **RevenueCat account** (free tier is fine) — https://app.revenuecat.com

---

## Step 1 — Export to GitHub and clone locally

In Lovable: **GitHub → Connect to GitHub → Create repository**. Then on your Mac:

```bash
git clone https://github.com/<you>/<repo>.git ora
cd ora
npm install     # or bun install
```

## Step 2 — Add the iOS native project

```bash
npx cap add ios
npx cap sync ios
```

This creates `ios/App/` containing the Xcode project. Commit it.

## Step 3 — Generate every icon + splash size

```bash
npx capacitor-assets generate --ios
```

This reads `resources/icon.png` (the final Ora gold-cross icon, 1024×1024) and
`resources/splash.png` and produces every size iOS demands — iPhone home
screen, iPad, App Store marketing 1024, notification, settings, spotlight,
plus all @2x/@3x variants. Re-run whenever you change the source artwork.

If you'd rather skip the generator, the repo also ships a prebuilt
`ios-appicon/AppIcon.appiconset/` you can drop straight into
`ios/App/App/Assets.xcassets/` (see `ios-appicon/README.md`). Either path
guarantees the build icon matches the App Store Connect listing and not the
generic Capacitor placeholder.

## Step 4 — Open in Xcode and configure signing

```bash
npx cap open ios
```

In Xcode:
1. Select the **App** target → **Signing & Capabilities**.
2. Set **Team** to your Apple Developer team.
3. Bundle Identifier: `app.lovable.402451b9e2f440359c315d5149811cd4` (or change to your preferred reverse-DNS — must be unique on App Store Connect).
4. Add capability: **In-App Purchase**.
5. Add capability: **Sign In with Apple** (required by the iOS auth flow and by App Review Guideline 4.8 since the app also offers Google sign-in).
6. Add capability: **Push Notifications** *only* if you later add APNs (not needed for local notifications).

### 4a. Register the OAuth custom URL scheme (CRITICAL for Google / Apple sign-in)

Without this, native sign-in dies silently — Supabase tries to redirect back to
`app.lovable.402451b9e2f440359c315d5149811cd4://oauth-callback` and iOS has no
idea which app to hand the URL to.

In Xcode → **App target → Info → URL Types → +**:
- **Identifier:** `oauth`
- **URL Schemes:** `app.lovable.402451b9e2f440359c315d5149811cd4`
- **Role:** Editor

Equivalent Info.plist snippet:
```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLName</key><string>oauth</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>app.lovable.402451b9e2f440359c315d5149811cd4</string>
    </array>
  </dict>
</array>
```

### 4b. Allow-list the scheme in Lovable Cloud auth

Lovable Cloud → **Users → Auth Settings → URL Configuration → Redirect URLs → Add**:
```
app.lovable.402451b9e2f440359c315d5149811cd4://oauth-callback
```

### 4c. Provider console redirect URIs

Google Cloud Console (only required if using your own Google credentials — managed
mode just works) and Apple Developer Services ID must both point at the Supabase
auth callback, **not** the custom scheme:
```
https://lrrsmihlulzuhdqndinw.supabase.co/auth/v1/callback
```

Run on a simulator with **▶︎ Run** to confirm the app boots, the splash hides, and the dark status bar shows.

## Step 5 — RevenueCat + App Store Connect IAP setup

This is the longest step. You only do it once.

### 5a. Create the subscription products in App Store Connect

1. https://appstoreconnect.apple.com → My Apps → **+** → New App
   - Bundle ID: same as above
   - Name: **Ora**
   - SKU: `ora-ios`
   - Primary language: English
2. App → **Features → In-App Purchases → +**
3. Create an **Auto-Renewable Subscription** group called `Ora Premium`.
4. Inside the group, create two products:
   - **Product ID: `ora_premium_monthly`** — $9.99/month, 3-day free trial
   - **Product ID: `ora_premium_yearly`** — $59.99/year, 3-day free trial
5. Add a localized name + description for each.
6. Under each product → **App Store Promotion** → upload a 1024×1024 promo image.

> **Important:** the product IDs (`ora_premium_monthly`, `ora_premium_yearly`) match what RevenueCat and the app expect. Don't rename them.

### 5b. Get your App Store Shared Secret

App Store Connect → **Users and Access → Integrations → App-Specific Shared Secret → Generate**. Copy it.

### 5c. Set up RevenueCat

1. https://app.revenuecat.com → New Project → name it **Ora**.
2. **Project Settings → Apps → + New → App Store**.
   - Bundle ID: `app.lovable.402451b9e2f440359c315d5149811cd4`
   - App-specific shared secret: paste from 5b.
3. **Products** → Import from App Store → import both products.
4. **Entitlements** → **+ New** → identifier: `premium`. Attach both products to it.
5. **Offerings** → create the **default** offering with two packages:
   - `$rc_monthly` → `ora_premium_monthly`
   - `$rc_annual` → `ora_premium_yearly`
6. **API keys** (Project Settings → API keys) → copy the **Public iOS SDK key** (starts with `appl_…`).

### 5d. Wire the keys into Lovable

The two server secrets are already added in Lovable Cloud:
- `REVENUECAT_IOS_API_KEY` ← paste the iOS public SDK key
- `REVENUECAT_WEBHOOK_AUTH` ← any random string (used as a shared bearer secret)

You also need the iOS SDK key on the **client**. Add this to `.env.production` and `.env.development` (or set as a build secret):

```
VITE_REVENUECAT_IOS_API_KEY=appl_xxxxxxxxxxxxxxxxxxxxxxxx
```

It is the **public** SDK key — safe to ship in the bundle.

### 5e. Configure the RevenueCat webhook

RevenueCat dashboard → **Project Settings → Integrations → Webhooks → Add new**:
- URL: `https://lrrsmihlulzuhdqndinw.functions.supabase.co/revenuecat-webhook`
- Authorization header: `Bearer <REVENUECAT_WEBHOOK_AUTH value>`
- Event types: leave all enabled

Send a test event from the dashboard. You should see a row appear in `subscriptions` with `provider='revenuecat_ios'`.

## Step 6 — Test the full purchase flow

1. In Xcode: **Product → Scheme → Edit Scheme → Run → Options → StoreKit Configuration** — leave as `None` and use the App Store sandbox.
2. App Store Connect → **Users and Access → Sandbox → Test Accounts** → create one (use a fresh email).
3. On your iPhone or simulator: **Settings → App Store → Sandbox Account → Sign In** with that test user.
4. In Ora: open `/paywall`, tap a plan, complete the StoreKit sheet. Confirm:
   - Purchase succeeds
   - `RequirePremium` unlocks gated routes
   - A row appears in `subscriptions` with `provider='revenuecat_ios'`, `environment='ios_iap'`, `status='active'`
5. Tap **Restore Purchases** after deleting and reinstalling — the same row should reappear.

## Step 7 — App Privacy + Privacy Manifest

App Store Connect → **App Privacy → Get Started**. Disclose:
- **Identifiers** (User ID) — linked to user, used for App Functionality
- **Purchases** — linked to user, used for App Functionality
- **User Content** (journal entries, prayer logs) — linked to user, used for App Functionality
- **Diagnostics** — not linked, used for App Functionality

Privacy Manifest: Xcode → File → New → File → **App Privacy** → fill in any tracking SDKs you've added (RevenueCat needs a small entry; copy from https://www.revenuecat.com/docs/dashboard-and-metrics/apple-privacy-manifest).

## Step 8 — Required URLs in App Store Connect listing

- **Privacy Policy URL:** `https://oradevotion.com/privacy-policy`
- **Terms of Use (EULA) URL:** `https://oradevotion.com/terms-of-service`
- **Support URL:** `https://oradevotion.com` (or a dedicated support page)
- **Marketing URL:** `https://oradevotion.com`

These are **required** for any app with auto-renewable subscriptions.

## Step 9 — Screenshots

Required sizes (App Store Connect tells you exactly which devices):
- 6.9" (iPhone 16 Pro Max) — 1320×2868
- 6.5" (iPhone 14 Plus) — 1284×2778
- 5.5" (iPhone 8 Plus, optional but recommended) — 1242×2208

Use the Simulator (`File → Save Screen` ⌘S) on each size, or generate marketing screenshots with frames.

## Step 10 — Build, archive, upload to TestFlight

In Xcode:
1. Top bar: select **Any iOS Device (arm64)**.
2. **Product → Archive** (this takes ~2 minutes).
3. Organizer window opens → **Distribute App → App Store Connect → Upload**.
4. Wait ~10 minutes for processing in App Store Connect.
5. App Store Connect → TestFlight → invite yourself as an internal tester.
6. Install via TestFlight on your device. **Test the IAP again with sandbox account.**

## Step 11 — Submit for review

App Store Connect → App Store tab → fill in:
- App description, keywords, category (Lifestyle, secondary: Reference)
- Age rating questionnaire
- Screenshots (Step 9)
- Subscription review notes — **include sandbox test account credentials**, and note: "Premium unlocks all features. The 3-day free trial converts to $9.99/mo or $59.99/yr. Subscription is managed in iOS Settings."
- App Review notes — explain that web subscriptions exist but iOS users must use Apple IAP per Guideline 3.1.1; restore is supported.

### Reviewer demo account (required — Guideline 2.3)

Apple's reviewer must be able to sign in without creating an account. Provide
this in **App Store Connect → App Information → App Review Information**:

1. **Create a real Ora account** the reviewer can use:
   - Sign up at https://ora-sacred-path.lovable.app/auth?mode=signup
   - Email: `appreview@oradevotion.com` (or any inbox you control)
   - Password: pick a strong one and paste it into App Review Information
   - Complete onboarding once so `onboarding_completed = true` (otherwise the reviewer lands on `/onboarding`, not the home screen).
2. **Mark the account as premium in the database** so reviewers can explore Premium content without needing IAP for non-purchase flows. In Lovable Cloud → SQL editor:
   ```sql
   insert into public.subscriptions (user_id, status, provider, environment, product_id, price_id, paddle_subscription_id, paddle_customer_id, current_period_end)
   select id, 'active', 'review_grant', 'review', 'ora_premium_review', 'ora_premium_review',
          'review_' || id::text, 'review_' || id::text, now() + interval '180 days'
   from auth.users where email = 'appreview@oradevotion.com'
   on conflict (user_id, environment) do update set current_period_end = excluded.current_period_end, status = 'active';
   ```
3. **Paste into App Review Information**:
   - Sign-in required: **Yes**
   - User name: `appreview@oradevotion.com`
   - Password: *(your chosen password)*
   - Notes: "Account is pre-onboarded and pre-granted Premium for review. To exercise the StoreKit purchase + restore flow, please sign in to a Sandbox Apple ID under iOS Settings → App Store → Sandbox Account, then open the in-app paywall (Settings → Manage Subscription or from any premium gate)."
4. **Sandbox Apple ID for IAP testing**: create one at App Store Connect → Users and Access → Sandbox → Test Accounts, then provide its email to reviewers in the notes (Apple requires they use their own sandbox device, but knowing your product IDs (`ora_premium_monthly`, `ora_premium_yearly`) helps them validate the flow).

Submit. Apple typically reviews within 24–48 hours.

---

## Re-syncing after JS changes

Whenever you change the web app and want it in the next iOS build:

```bash
npm run build
npx cap sync ios
```

Then re-archive in Xcode.

For **rapid iteration** during development, uncomment the `server` block in
`capacitor.config.ts` — the iOS shell will load the live Lovable preview URL
and reflect every save instantly. Re-comment before you archive for release.

## Troubleshooting

- **"No products available"** in IAP: confirm you've signed an iOS Paid Apps agreement in App Store Connect → Agreements; banking + tax info must be complete or StoreKit returns an empty product list.
- **Purchase succeeds but Premium doesn't unlock**: check the RevenueCat webhook deliveries in the RC dashboard, then `subscriptions` table for a new row. If the row exists but `RequirePremium` doesn't see it, hard-reload the app (the `useSubscription` realtime channel will pick it up on next session).
- **Splash never hides**: usually means `useNativeShell` errored out. Check Xcode console for `[NativeShell]` errors.
- **Local notifications never fire**: the user denied permission. Reset in iOS Settings → Ora → Notifications.
