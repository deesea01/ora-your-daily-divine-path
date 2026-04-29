import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Recommendation {
  type: "prayer" | "scripture" | "sacrament" | "saint" | "devotion";
  title: string;
  reason: string;
  action_label?: string;
  action_route?: string;
  priority?: number;
}

export interface SaintAffinity {
  saint_key: string;
  interaction_count: number;
}

export interface SpiritualProfile {
  id: string;
  user_id: string;
  growth_areas: string[];
  struggles: string[];
  devotional_consistency: number;
  top_saint: string | null;
  saints_affinity: SaintAffinity[];
  preferred_devotional_time: string | null;
  recommendations: Recommendation[];
  ai_summary: string | null;
  ai_invitation: string | null;
  last_refreshed_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useSpiritualProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<SpiritualProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("spiritual_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (data) setProfile(data as any);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(async (mode: "rules" | "full" = "rules") => {
    if (!user) return null;
    setRefreshing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/spiritual-memory`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ mode }),
        },
      );
      if (!resp.ok) return null;
      const json = await resp.json();
      if (json?.profile) {
        setProfile(json.profile);
        return json.profile as SpiritualProfile;
      }
      return null;
    } finally {
      setRefreshing(false);
    }
  }, [user]);

  return { profile, loading, refreshing, refresh, reload: load };
}
