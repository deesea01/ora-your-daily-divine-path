import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ExternalLink, X } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export function SubscriptionCard() {
  const navigate = useNavigate();
  const { subscription, isActive, loading, refresh } = useSubscription();
  const [busy, setBusy] = useState<"portal" | "cancel" | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  if (loading) return null;

  // No active subscription — show upgrade CTA
  if (!isActive) {
    return (
      <div className="rounded-xl border border-gold/30 bg-gradient-to-br from-gold/5 to-transparent p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10">
            <Sparkles className="h-5 w-5 text-gold" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Free Plan</p>
            <p className="text-xs text-muted-foreground">3 chats/day · Monk only</p>
          </div>
        </div>
        <button
          onClick={() => navigate("/paywall")}
          className="w-full mt-2 rounded-lg bg-gold py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Start 3-day free trial
        </button>
      </div>
    );
  }

  const openPortal = async () => {
    setBusy("portal");
    try {
      const { data, error } = await supabase.functions.invoke("paddle-portal");
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
      const { error } = await supabase.functions.invoke("paddle-cancel");
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

  const periodEnd = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString(undefined, {
        month: "long", day: "numeric", year: "numeric",
      })
    : null;

  return (
    <div className="rounded-xl border border-gold/30 bg-card p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10">
          <Sparkles className="h-5 w-5 text-gold" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">
            Premium {subscription?.status === "trialing" && "(Trial)"}
          </p>
          <p className="text-xs text-muted-foreground">
            {subscription?.cancel_at_period_end
              ? `Access until ${periodEnd ?? "period end"}`
              : periodEnd
                ? `Renews ${periodEnd}`
                : "Active"}
          </p>
        </div>
      </div>

      <button
        onClick={openPortal}
        disabled={busy !== null}
        className="w-full rounded-lg border border-border bg-background py-2.5 text-sm font-medium text-foreground hover:border-gold/40 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <ExternalLink className="h-4 w-4" />
        {busy === "portal" ? "Opening..." : "Manage billing"}
      </button>

      {!subscription?.cancel_at_period_end && (
        confirmCancel ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 space-y-2">
            <p className="text-xs text-foreground">Cancel subscription? You'll keep access until {periodEnd ?? "the end of your period"}.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmCancel(false)}
                disabled={busy !== null}
                className="flex-1 rounded-lg border border-border py-2 text-xs text-muted-foreground"
              >
                Keep
              </button>
              <button
                onClick={cancelSub}
                disabled={busy !== null}
                className="flex-1 rounded-lg bg-destructive py-2 text-xs font-medium text-destructive-foreground disabled:opacity-50"
              >
                {busy === "cancel" ? "Canceling..." : "Confirm cancel"}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmCancel(true)}
            className="w-full rounded-lg py-2 text-xs text-muted-foreground hover:text-destructive flex items-center justify-center gap-1"
          >
            <X className="h-3 w-3" /> Cancel subscription
          </button>
        )
      )}
    </div>
  );
}
