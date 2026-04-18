import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface OnboardingPayload {
  intent?: string;
  prayer_life_state?: string;
  struggles?: string[];
  growth_focus?: string[];
  voice_style?: string;
  chosen_guide?: string;
}

export function useOnboardingResponses() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  const save = async (payload: OnboardingPayload, complete = false) => {
    if (!user) return { error: new Error("Not authenticated") };
    setSaving(true);
    try {
      const { error } = await supabase
        .from("onboarding_responses")
        .upsert(
          {
            user_id: user.id,
            ...payload,
            ...(complete ? { completed_at: new Date().toISOString() } : {}),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        );
      return { error };
    } finally {
      setSaving(false);
    }
  };

  return { save, saving };
}
