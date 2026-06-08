import UIKit
import Capacitor
import RevenueCat

/// Drop-in replacement for the default Capacitor `AppDelegate.swift`.
///
/// Copy this file's contents over `ios/App/App/AppDelegate.swift` (or just
/// paste the `RevenueCatBootstrap.configure()` line into your existing
/// `application(_:didFinishLaunchingWithOptions:)`).
///
/// IMPORTANT:
///   - `RevenueCatBootstrap.configure()` MUST run BEFORE `return true` and
///     BEFORE Capacitor loads its WKWebView. That is exactly what we do
///     below: it is the first call in `didFinishLaunchingWithOptions`.
///   - Do NOT also call `Purchases.configure(...)` from JS. The JS hook
///     (`src/hooks/useRevenueCat.ts`) only configures as a safety-net
///     fallback when `Purchases.isConfigured` is false.
///   - `RevenueCatBootstrap.swift` MUST be added to the **App** target's
///     "Compile Sources" build phase (Xcode → App target → Build Phases →
///     Compile Sources → "+"). Otherwise this file will not compile.
@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        // === RevenueCat bootstrap — must be the first thing we do. ===
        // Configures the StoreKit2 transaction listener before the webview
        // boots, so App Store-initiated and renewal transactions are caught.
        RevenueCatBootstrap.configure()

        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {}
    func applicationDidEnterBackground(_ application: UIApplication) {}
    func applicationWillEnterForeground(_ application: UIApplication) {}
    func applicationDidBecomeActive(_ application: UIApplication) {}
    func applicationWillTerminate(_ application: UIApplication) {}

    func application(
        _ app: UIApplication,
        open url: URL,
        options: [UIApplication.OpenURLOptionsKey: Any] = [:]
    ) -> Bool {
        // Capacitor deep-link / universal-link handler.
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(
        _ application: UIApplication,
        continue userActivity: NSUserActivity,
        restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
    ) -> Bool {
        return ApplicationDelegateProxy.shared.application(
            application,
            continue: userActivity,
            restorationHandler: restorationHandler
        )
    }
}
