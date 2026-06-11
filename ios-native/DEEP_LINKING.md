# iOS Deep-Link Setup for Supabase Auth Emails (custom scheme: `ora://`)

Email verification uses the **custom URL scheme** `ora://` so the iOS app
opens directly from the verification email — no Safari bounce, no Universal
Links required.

```
Sign up in app
  → Supabase sends email (redirect_to = ora://auth/callback)
  → User taps link in Mail
  → iOS opens Ora via the registered URL scheme
  → AppDelegate → ApplicationDelegateProxy → JS `appUrlOpen` event
  → useAuthDeepLinks parses params and restores the Supabase session
  → User lands inside the app (existing onboarding / paywall guards)
```

## 1. `ios/App/App/Info.plist` (required)

Register the `ora` scheme inside the top-level `<dict>`:

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleTypeRole</key>
        <string>Editor</string>
        <key>CFBundleURLName</key>
        <string>app.lovable.402451b9e2f440359c315d5149811cd4</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>ora</string>
        </array>
    </dict>
</array>
```

The scheme MUST be lowercase and MUST match `NATIVE_URL_SCHEME` in
`src/lib/authRedirect.ts`.

## 2. AppDelegate

`ios-native/AppDelegate.swift` already forwards
`application(_:open:options:)` to `ApplicationDelegateProxy`, which emits the
JS `appUrlOpen` event. No additional native code is needed — the
`@capacitor/app` plugin's `App.addListener('appUrlOpen', ...)` is wired up in
`src/hooks/useAuthDeepLinks.ts`.

## 3. Supabase Auth → URL Configuration (REQUIRED)

In the backend Auth settings, add the custom-scheme callbacks to the
**Additional Redirect URLs** allow-list, otherwise Supabase silently rewrites
the redirect to the Site URL and the email link will open the website
instead of the app.

- **Site URL:** `https://oradevotion.com`
- **Additional Redirect URLs:**
  - `ora://auth/callback`
  - `ora://reset-password`
  - `https://oradevotion.com/auth/callback`
  - `https://oradevotion.com/reset-password`
  - `https://www.oradevotion.com/auth/callback`
  - `https://ora-sacred-path.lovable.app/auth/callback`
  - `https://ora-sacred-path.lovable.app/reset-password`

The https entries cover web signups and act as a fallback bounce page (see
`src/pages/AuthCallback.tsx`) for users who tap the link on a non-iOS device.

## 4. Code touchpoints

| File | Purpose |
| --- | --- |
| `src/lib/authRedirect.ts` | Returns `ora://auth/callback` on native iOS, https origin on web. |
| `src/hooks/useAuth.tsx` | Passes `emailRedirectTo` to `signUp` and `resetPasswordForEmail`. |
| `src/hooks/useAuthDeepLinks.ts` | `App.addListener('appUrlOpen', ...)`, parses `code` / `token_hash` / hash tokens and calls `exchangeCodeForSession` / `verifyOtp` / `setSession`. |
| `src/pages/AuthCallback.tsx` | Web fallback — if a user opens the link on desktop or somehow lands on https, it completes the flow or bounces to `ora://`. |
| `ios-native/AppDelegate.swift` | Forwards `open url` to the Capacitor proxy (already correct). |

Login (password), logout, and RevenueCat purchase flows are untouched.

## 5. TestFlight / device testing

1. `git pull && npm install && npm run build && npx cap sync ios`.
2. In Xcode, open `ios/App/App.xcworkspace`, confirm `Info.plist` contains
   the `CFBundleURLTypes` block above with scheme `ora`.
3. Archive → upload to TestFlight (or Run on a physical device).
4. **Scheme smoke test:** in Safari on the device, type
   `ora://auth/callback` in the address bar → iOS should prompt
   "Open in Ora?". If nothing happens, the scheme isn't registered —
   recheck Info.plist and rebuild.
5. In the app, sign up with a fresh email.
6. Open the verification email in the iOS Mail app and tap the link.
7. iOS opens Ora directly (no Safari). The first time it may show an
   "Open in Ora?" system prompt — tap Open.
8. Expected landing:
   - Non-premium verified user → onboarding / paywall (existing guards).
   - Entitled user → Home.
9. Xcode console: look for the `appUrlOpen` event and either a successful
   `exchangeCodeForSession` / `verifyOtp` call. On failure, the hook logs
   `[auth deeplink] failed to restore session` and routes to `/auth` with
   the error.
10. Regression checks:
    - Email + password sign in still works.
    - Sign out still works.
    - RevenueCat purchase + restore still works.
