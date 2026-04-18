import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";

const FREE_DAILY_CHAT_LIMIT = 3;

// Free saint key — only this guide is allowed for non-subscribers
export const FREE_GUIDE_KEY = "monk";

// Free prayers (IDs from src/lib/prayerLibrary.ts)
export const FREE_PRAYER_IDS = new Set<string>([
  "our_father",
  "hail_mary",
  "glory_be",
  "apostles_creed",
  "guardian_angel",
]);

export function isPremiumGuide(key: string | null | undefined) {
  return !!key && key !== FREE_GUIDE_KEY;
}

export function isPremiumPrayer(prayerId: string) {
  return !FREE_PRAYER_IDS.has(prayerId);
}

export function useEntitlement() {
  const { user } = useAuth();
  const { isActive, loading: subLoading, subscription } = useSubscription();
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

  const isPremium = isActive;
  const chatRemaining = isPremium
    ? Infinity
    : Math.max(0, FREE_DAILY_CHAT_LIMIT - chatCountToday);
  const canChat = isPremium || chatRemaining > 0;

  return {
    isPremium,
    loading: subLoading || loadingCount,
    subscription,
    chatCountToday,
    chatRemaining,
    canChat,
    chatLimit: FREE_DAILY_CHAT_LIMIT,
    refreshChatCount,
  };
}
