import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useRevenueCat } from "@/hooks/useRevenueCat";
import { isNativeIOS } from "@/lib/platform";
import { isFounderEmail } from "@/lib/founders";

// Ora is now fully premium after onboarding. These exports are retained for
// backwards compatibility with existing imports but everything is treated as
// premium-gated.
export const FREE_GUIDE_KEY = "st_francis"; // default guide if any
export const FREE_PRAYER_IDS = new Set<string>();

export function isPremiumGuide(_key: string | null | undefined) {
  // Every Saint is premium now.
  return true;
}

export function isPremiumPrayer(_prayerId: string) {
  return true;
}

export function useEntitlement() {
  const { user } = useAuth();
  const { isActive, loading: subLoading, subscription } = useSubscription();
  const { hasPremiumEntitlement, loading: iapLoading } = useRevenueCat();
  const [chatCountToday, setChatCountToday] = useState<number>(0);
  const [loadingCount, setLoadingCount] = useState(true);

  const refreshChatCount = useCallback(async () => {
    if (!user) {
      setChatCountToday(0);
      setLoadingCount(false);
      return;
    }
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const { count } = await supabase
      .from("chat_messages")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("role", "user")
      .gte("created_at", start.toISOString());
    setChatCountToday(count ?? 0);
    setLoadingCount(false);
  }, [user]);

  useEffect(() => {
    refreshChatCount();
  }, [refreshChatCount]);

  const isFounder = isFounderEmail(user?.email);
  const isPremium = isActive || hasPremiumEntitlement || isFounder;
  // No more free chat allowance — premium-only.
  const chatRemaining = isPremium ? Infinity : 0;
  const canChat = isPremium;

  return {
    isPremium,
    loading: subLoading || loadingCount || (isNativeIOS() && iapLoading && !isActive),
    subscription,
    chatCountToday,
    chatRemaining,
    canChat,
    chatLimit: 0,
    refreshChatCount,
  };
}
