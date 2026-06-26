import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ExternalLink, X, AlertTriangle, RotateCcw, Apple } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { MissionNote } from "@/components/MissionNote";
import { getPaddleEnvironment } from "@/lib/paddle";
import { isNativeIOS } from "@/lib/platform";

export function SubscriptionCard() {
  const navigate = useNavigate();
  const { subscription, isActive, isPastDue, loading, refresh } = useSubscription();
  const [busy, setBusy] = useState<"portal" | "cancel" | "resume" | "switch" | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const env = getPaddleEnvironment();
  const onIos = isNativeIOS();
  // Apple's anti-steering rules: when the subscription was purchased via
  // Apple IAP, OR when the user is in the native iOS app, all subscription
  // management must happen in Apple's Manage Subscriptions UI — never via
  // an external (Paddle) checkout/portal.
  const isAppleManaged = onIos || (subscription as any)?.provider === "revenuecat_ios";

  if (loading) return null;

  if (!isActive) {
    return (
      <div className="rounded-xl border border-gold/30 bg-gradient-to-br from-gold/5 to-transparent p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10">
            <Sparkles className="h-5 w-5 text-gold" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">No active subscription</p>
            <p className="text-xs text-muted-foreground">Premium required · Monthly or yearly</p>
          </div>
        </div>
        <button
          onClick={() => navigate("/paywall")}
          className="w-full mt-2 rounded-lg bg-gold py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Unlock Your Prayer Life
        </button>
        <div className="mt-3"><MissionNote variant="compact" /></div>
      </div>
    );
  }

  const invoke = async (name: string, body?: any) => {
    return supabase.functions.invoke(`${name}?env=${env}` as any, { body });
  };

  const openPortal = async () => {
    setBusy("portal");
    try {
      const { data, error } = await invoke("paddle-portal");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank", "noopener,noreferrer");
      else throw new Error("No portal URL");
    } catch (e: any) {
      toast({ title: "Could not open billing portal", description: String(e?.message || e), variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const cancelSub = async () => {
    setBusy("cancel");
    try {
      const { error } = await invoke("paddle-cancel");
      if (error) throw error;
      toast({ title: "Subscription canceled", description: "You'll keep access until the end of your billing period." });
      setConfirmCancel(false);
      await refresh();
    } catch (e: any) {
      toast({ title: "Could not cancel", description: String(e?.message || e), variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const resumeSub = async () => {
    setBusy("resume");
    try {
      const { error } = await invoke("paddle-resume");
      if (error) throw error;
      toast({ title: "Subscription resumed", description: "Your plan will continue renewing." });
      await refresh();
    } catch (e: any) {
      toast({ title: "Could not resume", description: String(e?.message || e), variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const switchPlan = async () => {
    const target = subscription?.price_id === "ora_premium_yearly" ? "ora_premium_monthly" : "ora_premium_yearly";
    const targetLabel = target === "ora_premium_yearly" ? "yearly ($59.99/yr)" : "monthly ($9.99/mo)";
    if (!confirm(`Switch to ${targetLabel}? Your billing will be prorated immediately.`)) return;
    setBusy("switch");
    try {
      const { error } = await invoke("paddle-update-plan", { newPriceId: target });
      if (error) throw error;
      toast({ title: "Plan updated", description: `You're now on the ${targetLabel} plan.` });
      await refresh();
    } catch (e: any) {
      toast({ title: "Could not change plan", description: String(e?.message || e), variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const periodEnd = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })
    : null;

  const isYearly = subscription?.price_id === "ora_premium_yearly";

  return (
    <div className="rounded-xl border border-gold/30 bg-card p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10">
          <Sparkles className="h-5 w-5 text-gold" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">
            Premium · {isYearly ? "Yearly" : "Monthly"}
          </p>
          <p className="text-xs text-muted-foreground">
            {subscription?.cancel_at_period_end
              ? `Access until ${periodEnd ?? "period end"}`
              : periodEnd ? `Renews ${periodEnd}` : "Active"}
          </p>
        </div>
      </div>

      {isPastDue && (
        <div className="rounded-lg border border-gold/40 bg-gold/10 p-3 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-gold mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-foreground font-medium">Your payment needs attention</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Your access continues while we retry. Update your card to keep your subscription.</p>
            <button onClick={openPortal} disabled={busy !== null} className="mt-2 text-xs font-medium text-gold hover:underline">
              Update payment method →
            </button>
          </div>
        </div>
      )}

      {isAppleManaged ? (
        <>
          <a
            href="itms-apps://apps.apple.com/account/subscriptions"
            className="w-full rounded-lg border border-border bg-background py-2.5 text-sm font-medium text-foreground hover:border-gold/40 flex items-center justify-center gap-2"
          >
            <Apple className="h-4 w-4" />
            Manage in Apple Settings
          </a>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Your subscription is managed through your Apple ID. Change plans, view receipts, or cancel anytime from Settings → Apple ID → Subscriptions.
          </p>
        </>
      ) : (
        <>
          <button
            onClick={openPortal}
            disabled={busy !== null}
            className="w-full rounded-lg border border-border bg-background py-2.5 text-sm font-medium text-foreground hover:border-gold/40 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            {busy === "portal" ? "Opening..." : "Manage billing"}
          </button>

          {!subscription?.cancel_at_period_end && (
            <button
              onClick={switchPlan}
              disabled={busy !== null}
              className="w-full rounded-lg border border-border bg-background py-2.5 text-sm font-medium text-foreground hover:border-gold/40 disabled:opacity-50"
            >
              {busy === "switch" ? "Updating..." : isYearly ? "Switch to monthly" : "Switch to yearly · save 50%"}
            </button>
          )}

          {subscription?.cancel_at_period_end ? (
            <button
              onClick={resumeSub}
              disabled={busy !== null}
              className="w-full rounded-lg bg-gold/10 border border-gold/30 py-2 text-xs font-medium text-gold hover:bg-gold/20 disabled:opacity-50 flex items-center justify-center gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              {busy === "resume" ? "Resuming..." : "Resume subscription"}
            </button>
          ) : confirmCancel ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 space-y-2">
              <p className="text-xs text-foreground">Cancel subscription? You'll keep access until {periodEnd ?? "the end of your period"}.</p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmCancel(false)} disabled={busy !== null} className="flex-1 rounded-lg border border-border py-2 text-xs text-muted-foreground">Keep</button>
                <button onClick={cancelSub} disabled={busy !== null} className="flex-1 rounded-lg bg-destructive py-2 text-xs font-medium text-destructive-foreground disabled:opacity-50">
                  {busy === "cancel" ? "Canceling..." : "Confirm cancel"}
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setConfirmCancel(true)} className="w-full rounded-lg py-2 text-xs text-muted-foreground hover:text-destructive flex items-center justify-center gap-1">
              <X className="h-3 w-3" /> Cancel subscription
            </button>
          )}
        </>
      )}

      <div className="pt-1"><MissionNote variant="compact" /></div>
    </div>
  );
}
