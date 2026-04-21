export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_error_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          function_name: string
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          function_name: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          function_name?: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      confession_prep_notes: {
        Row: {
          category: string
          checked_items: Json
          created_at: string
          id: string
          is_draft: boolean
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          checked_items?: Json
          created_at?: string
          id?: string
          is_draft?: boolean
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          checked_items?: Json
          created_at?: string
          id?: string
          is_draft?: boolean
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      confession_settings: {
        Row: {
          auto_delete_prep: boolean
          created_at: string
          hide_previews: boolean
          id: string
          local_only: boolean
          passcode_enabled: boolean
          target_rhythm: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_delete_prep?: boolean
          created_at?: string
          hide_previews?: boolean
          id?: string
          local_only?: boolean
          passcode_enabled?: boolean
          target_rhythm?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_delete_prep?: boolean
          created_at?: string
          hide_previews?: boolean
          id?: string
          local_only?: boolean
          passcode_enabled?: boolean
          target_rhythm?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      confessions: {
        Row: {
          confession_date: string
          created_at: string
          id: string
          mood: string | null
          parish_name: string | null
          priest_name: string | null
          reflection: string | null
          user_id: string
        }
        Insert: {
          confession_date?: string
          created_at?: string
          id?: string
          mood?: string | null
          parish_name?: string | null
          priest_name?: string | null
          reflection?: string | null
          user_id: string
        }
        Update: {
          confession_date?: string
          created_at?: string
          id?: string
          mood?: string | null
          parish_name?: string | null
          priest_name?: string | null
          reflection?: string | null
          user_id?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      growth_plans: {
        Row: {
          created_at: string
          day1_action: string | null
          day2_action: string | null
          day3_action: string | null
          focus_area: string | null
          id: string
          is_active: boolean
          plan_prayer: string | null
          scripture_anchor: string | null
          start_date: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          day1_action?: string | null
          day2_action?: string | null
          day3_action?: string | null
          focus_area?: string | null
          id?: string
          is_active?: boolean
          plan_prayer?: string | null
          scripture_anchor?: string | null
          start_date?: string
          title?: string
          user_id: string
        }
        Update: {
          created_at?: string
          day1_action?: string | null
          day2_action?: string | null
          day3_action?: string | null
          focus_area?: string | null
          id?: string
          is_active?: boolean
          plan_prayer?: string | null
          scripture_anchor?: string | null
          start_date?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          content: string
          created_at: string
          entry_type: string
          examen_data: Json | null
          id: string
          mood: string | null
          tags: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          entry_type?: string
          examen_data?: Json | null
          id?: string
          mood?: string | null
          tags?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          entry_type?: string
          examen_data?: Json | null
          id?: string
          mood?: string | null
          tags?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      onboarding_responses: {
        Row: {
          chosen_guide: string | null
          completed_at: string | null
          created_at: string
          growth_focus: string[]
          id: string
          intent: string | null
          prayer_life_state: string | null
          struggles: string[]
          updated_at: string
          user_id: string
          voice_style: string | null
        }
        Insert: {
          chosen_guide?: string | null
          completed_at?: string | null
          created_at?: string
          growth_focus?: string[]
          id?: string
          intent?: string | null
          prayer_life_state?: string | null
          struggles?: string[]
          updated_at?: string
          user_id: string
          voice_style?: string | null
        }
        Update: {
          chosen_guide?: string | null
          completed_at?: string | null
          created_at?: string
          growth_focus?: string[]
          id?: string
          intent?: string | null
          prayer_life_state?: string | null
          struggles?: string[]
          updated_at?: string
          user_id?: string
          voice_style?: string | null
        }
        Relationships: []
      }
      prayer_completions: {
        Row: {
          completed_at: string
          id: string
          prayer_date: string
          prayer_type: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          prayer_date?: string
          prayer_type: string
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          prayer_date?: string
          prayer_type?: string
          user_id?: string
        }
        Relationships: []
      }
      prayer_favorites: {
        Row: {
          created_at: string
          id: string
          prayer_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          prayer_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          prayer_id?: string
          user_id?: string
        }
        Relationships: []
      }
      prayer_progress: {
        Row: {
          created_at: string
          difficulty: string
          id: string
          last_practiced_at: string | null
          practice_count: number
          prayer_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          difficulty?: string
          id?: string
          last_practiced_at?: string | null
          practice_count?: number
          prayer_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          difficulty?: string
          id?: string
          last_practiced_at?: string | null
          practice_count?: number
          prayer_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      prayer_routines: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          prayer_ids: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          prayer_ids?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          prayer_ids?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reflection_analyses: {
        Row: {
          actionable_step: string | null
          affirmation: string | null
          ai_summary: string | null
          created_at: string
          detected_emotions: string[]
          detected_struggles: string[]
          detected_virtues: string[]
          emotional_tone: string | null
          entry_date: string
          entry_id: string | null
          gentle_correction: string | null
          id: string
          personalized_prayer: string | null
          reflection_text: string | null
          scripture: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          actionable_step?: string | null
          affirmation?: string | null
          ai_summary?: string | null
          created_at?: string
          detected_emotions?: string[]
          detected_struggles?: string[]
          detected_virtues?: string[]
          emotional_tone?: string | null
          entry_date?: string
          entry_id?: string | null
          gentle_correction?: string | null
          id?: string
          personalized_prayer?: string | null
          reflection_text?: string | null
          scripture?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          actionable_step?: string | null
          affirmation?: string | null
          ai_summary?: string | null
          created_at?: string
          detected_emotions?: string[]
          detected_struggles?: string[]
          detected_virtues?: string[]
          emotional_tone?: string | null
          entry_date?: string
          entry_id?: string | null
          gentle_correction?: string | null
          id?: string
          personalized_prayer?: string | null
          reflection_text?: string | null
          scripture?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      spiritual_insights: {
        Row: {
          entry_count: number
          generated_at: string
          id: string
          patterns: Json
          strengths: Json
          suggested_focus: string | null
          summary: string | null
          user_id: string
        }
        Insert: {
          entry_count?: number
          generated_at?: string
          id?: string
          patterns?: Json
          strengths?: Json
          suggested_focus?: string | null
          summary?: string | null
          user_id: string
        }
        Update: {
          entry_count?: number
          generated_at?: string
          id?: string
          patterns?: Json
          strengths?: Json
          suggested_focus?: string | null
          summary?: string | null
          user_id?: string
        }
        Relationships: []
      }
      spiritual_patterns: {
        Row: {
          analysis_period_end: string
          analysis_period_start: string
          common_triggers: Json
          created_at: string
          emotional_trends: Json
          entry_count: number
          growing_virtues: Json
          id: string
          recurring_struggles: Json
          user_id: string
        }
        Insert: {
          analysis_period_end: string
          analysis_period_start: string
          common_triggers?: Json
          created_at?: string
          emotional_trends?: Json
          entry_count?: number
          growing_virtues?: Json
          id?: string
          recurring_struggles?: Json
          user_id: string
        }
        Update: {
          analysis_period_end?: string
          analysis_period_start?: string
          common_triggers?: Json
          created_at?: string
          emotional_trends?: Json
          entry_count?: number
          growing_virtues?: Json
          id?: string
          recurring_struggles?: Json
          user_id?: string
        }
        Relationships: []
      }
      subscription_notifications: {
        Row: {
          id: string
          kind: string
          metadata: Json | null
          sent_at: string
          subscription_id: string
          user_id: string
        }
        Insert: {
          id?: string
          kind: string
          metadata?: Json | null
          sent_at?: string
          subscription_id: string
          user_id: string
        }
        Update: {
          id?: string
          kind?: string
          metadata?: Json | null
          sent_at?: string
          subscription_id?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          paddle_customer_id: string
          paddle_subscription_id: string
          price_id: string
          product_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          paddle_customer_id: string
          paddle_subscription_id: string
          price_id: string
          product_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          paddle_customer_id?: string
          paddle_subscription_id?: string
          price_id?: string
          product_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string
          daily_prayer_goal: number
          display_name: string | null
          experience_level: string
          id: string
          onboarding_completed: boolean
          preferred_language: string
          seeking: string[]
          spiritual_guide: string
          terms_accepted_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          daily_prayer_goal?: number
          display_name?: string | null
          experience_level?: string
          id?: string
          onboarding_completed?: boolean
          preferred_language?: string
          seeking?: string[]
          spiritual_guide?: string
          terms_accepted_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          daily_prayer_goal?: number
          display_name?: string | null
          experience_level?: string
          id?: string
          onboarding_completed?: boolean
          preferred_language?: string
          seeking?: string[]
          spiritual_guide?: string
          terms_accepted_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      weekly_reports: {
        Row: {
          created_at: string
          divine_invitation: string | null
          full_report: Json
          growth_areas: string | null
          id: string
          overall_summary: string | null
          struggle_patterns: string | null
          user_id: string
          week_end: string
          week_start: string
          weekly_focus: string | null
        }
        Insert: {
          created_at?: string
          divine_invitation?: string | null
          full_report?: Json
          growth_areas?: string | null
          id?: string
          overall_summary?: string | null
          struggle_patterns?: string | null
          user_id: string
          week_end: string
          week_start: string
          weekly_focus?: string | null
        }
        Update: {
          created_at?: string
          divine_invitation?: string | null
          full_report?: Json
          growth_areas?: string | null
          id?: string
          overall_summary?: string | null
          struggle_patterns?: string | null
          user_id?: string
          week_end?: string
          week_start?: string
          weekly_focus?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      has_active_subscription: {
        Args: { check_env?: string; user_uuid: string }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
