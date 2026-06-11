# iOS Deep-Link Setup for Supabase Auth Emails

The native iOS app must register the custom URL scheme `oradevotion` so that
Supabase verification / password-reset emails open back inside the app
(WKWebView) instead of stranding the user in Safari.

## 1. `ios/App/App/Info.plist`

Add the following `CFBundleURLTypes` block inside the top-level `<dict>`:

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
to `ApplicationDelegateProxy`, which Capacitor uses to emit the JS
`appUrlOpen` event. No additional native code required.

## 3. Supabase Auth → URL Configuration

In the Lovable Cloud / Supabase Auth settings:

- **Site URL:** `https://oradevotion.com`
- **Additional Redirect URLs** (add all of these):
  - `https://oradevotion.com/auth/callback`
  - `https://oradevotion.com/reset-password`
  - `https://ora-sacred-path.lovable.app/auth/callback`
  - `https://ora-sacred-path.lovable.app/reset-password`
  - `oradevotion://auth/callback`
  - `oradevotion://reset-password`

The web origins are kept for desktop/PWA users; the `oradevotion://` entries
allow Supabase to issue verification links that deep-link into the iOS app.

## 4. Verify

1. `npx cap sync ios` and rebuild in Xcode.
2. Sign up a fresh account on a physical device.
3. Tap the verification link in Mail. iOS should switch into the Ora app and
   land on the post-verification route (paywall for non-premium users).
4. Xcode console should show no `appUrlOpen` errors; the JS console should
   log a successful `supabase.auth` session restore.
