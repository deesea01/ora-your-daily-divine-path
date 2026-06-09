import UIKit
import Capacitor

/// Drop-in replacement for the default Capacitor `AppDelegate.swift`.
///
/// Copy this file's contents over `ios/App/App/AppDelegate.swift` if you need
/// the standard Capacitor deep-link handlers below.
///
/// IMPORTANT:
///   - `@revenuecat/purchases-capacitor` must be configured from JS through
///     the plugin bridge (`Purchases.configure(...)` in `useRevenueCat.ts`).
///   - Direct native SDK configuration in AppDelegate can leave the hybrid
///     plugin unconfigured and crash in PurchasesHybridCommon.
@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        // No direct RevenueCat SDK configuration here. The Capacitor plugin is
        // configured from JS before offerings/customer calls.
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
