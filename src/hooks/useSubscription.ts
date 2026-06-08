import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getPaddleEnvironment } from "@/lib/paddle";

export interface Subscription {
  status: string;
  product_id: string;
  price_id: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  environment: string;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const env = getPaddleEnvironment();

  const isSubscriptionActive = (row: Subscription | null) => {
    if (!row) return false;
    const hasActiveStatus = ["active", "past_due"].includes(row.status);
    const hasGracePeriod = row.status === "canceled" && !!row.current_period_end;
    return (
      (hasActiveStatus || hasGracePeriod) &&
      (!row.current_period_end || new Date(row.current_period_end) > new Date())
    );
  };

  const load = async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("subscriptions")
      .select("status, product_id, price_id, current_period_end, cancel_at_period_end, environment")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) {
      console.error("[useSubscription] fetch error", error);
      setSubscription(null);
      setLoading(false);
      return;
    }
    const rows = (data ?? []) as Subscription[];
    setSubscription(rows.find(isSubscriptionActive) ?? rows[0] ?? null);
    setLoading(false);
  };

  useEffect(() => {
    load();
    if (!user) return;

    const channel = supabase
      .channel(`subs-${user.id}-${Math.random().toString(36).slice(2, 8)}`)
      .on(
        "postgres_changes" as any,
        { event: "*", schema: "public", table: "subscriptions", filter: `user_id=eq.${user.id}` },
        () => load(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const isActive = isSubscriptionActive(subscription);

  const isPastDue = subscription?.status === "past_due";

  return { subscription, loading, isActive, isPastDue, env, refresh: load };
}
