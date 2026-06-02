# Ora — Prebuilt iOS AppIcon set

This directory contains the final Ora app icon, pre-rendered at every size
iOS requires (iPhone, iPad, App Store marketing, notification, settings,
spotlight). The source artwork lives at `resources/icon.png` (1024×1024).

## Two ways to install into your Xcode project

### Option A — Auto-generate from the source (recommended)

After `npx cap add ios`, run:

```bash
npx capacitor-assets generate --ios
```

This reads `resources/icon.png` and writes every size into
`ios/App/App/Assets.xcassets/AppIcon.appiconset/`.

### Option B — Drop in this prebuilt set

If you'd rather skip the generator, copy this folder over the placeholder:

```bash
rm -rf ios/App/App/Assets.xcassets/AppIcon.appiconset
cp -R ios-appicon/AppIcon.appiconset ios/App/App/Assets.xcassets/AppIcon.appiconset
npx cap sync ios
```

Either way: open Xcode, select the **App** target → **General** → **App Icons
and Launch Images**, confirm **App Icon Source** is `AppIcon`, then build.
The home-screen, settings, spotlight, notification, and App Store Connect
icons will all show the gold cross on matte-black, not the generic Capacitor
placeholder.

## Updating the icon later

Replace `resources/icon.png` with a new 1024×1024 PNG (square, no rounded
corners — iOS applies the mask) and re-run either step above.
