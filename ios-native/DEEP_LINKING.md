# iOS Deep-Link Setup for Supabase Auth Emails

Email verification uses an **https bounce flow** — the most reliable pattern
for Supabase + Capacitor iOS:

```
Sign up in app
  → Supabase sends email (redirect_to = https://oradevotion.com/auth/callback)
  → User taps link in Mail → Safari opens Supabase verify endpoint
  → Verify succeeds → Safari lands on /auth/callback (bounce page)
  → Bounce page detects iOS → redirects to oradevotion://auth/callback?...
  → iOS opens the Ora app → useAuthDeepLinks restores the session in WKWebView
  → User continues to onboarding / paywall (existing routing guards)
```

Why not put `oradevotion://` directly in the email redirect? Email clients and
Supabase's allow-list frequently reject custom schemes, silently falling back
to the Site URL — which stranded users on the website. The https bounce page is
always allow-listed and forwards the raw tokens into the app without consuming
them, so the session is created **inside the app**, not in Safari.

## 1. `ios/App/App/Info.plist` (required)

Register the custom URL scheme inside the top-level `<dict>`:

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
            <string>oradevotion</string>
        </array>
    </dict>
</array>
```

## 2. AppDelegate

`ios-native/AppDelegate.swift` already forwards `application(_:open:options:)`
to `ApplicationDelegateProxy`, which emits the JS `appUrlOpen` event. No
additional native code required.

## 3. Supabase Auth → URL Configuration

- **Site URL:** `https://oradevotion.com`
- **Additional Redirect URLs:**
  - `https://oradevotion.com/auth/callback`
  - `https://oradevotion.com/reset-password`
  - `https://www.oradevotion.com/auth/callback`
  - `https://ora-sacred-path.lovable.app/auth/callback`
  - `https://ora-sacred-path.lovable.app/reset-password`

Custom-scheme entries (`oradevotion://...`) are no longer needed for the email
flow but are harmless if present.

## 4. Publish requirement (dev + prod)

The bounce page lives on the **published** website. After any change to
`src/pages/AuthCallback.tsx` or `src/lib/authRedirect.ts`, re-publish the
Lovable project so `https://oradevotion.com/auth/callback` serves the latest
bounce logic. Native dev builds and TestFlight builds both depend on the
published page.

## 5. TestFlight testing steps

1. `git pull`, `npm install`, `npm run build`, `npx cap sync ios`.
2. Confirm `Info.plist` has the `CFBundleURLTypes` block above.
3. Archive and upload to TestFlight (or run on a physical device via Xcode).
4. **Scheme smoke test:** in Safari on the device, type
   `oradevotion://auth/callback` in the address bar → iOS should prompt to
   open Ora. If not, the URL scheme isn't registered — recheck Info.plist.
5. Sign up with a fresh email in the app.
6. Open the verification email in Mail and tap the link.
7. Safari briefly opens, shows "Email verified — Opening the Ora app…", then
   iOS switches into Ora ("Open in Ora?" prompt may appear once).
8. The app should land past sign-in: onboarding/paywall for non-premium users,
   Home for entitled users (existing guards unchanged).
9. If the auto-bounce doesn't fire, tap the **"Open the Ora app"** button on
   the bounce page.
10. Xcode console: look for `appUrlOpen` and a successful session restore; on
    failure the app logs `[auth deeplink] failed to restore session`.
