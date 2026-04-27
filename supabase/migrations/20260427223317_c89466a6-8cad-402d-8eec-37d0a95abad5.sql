-- Weekly Wrapped-style recaps (Saint relationships, virtues, struggles, prayer stats)
CREATE TABLE public.weekly_recaps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,

  -- Saint relationship
  top_saint TEXT,
  saint_message_count INTEGER NOT NULL DEFAULT 0,
  saint_minutes_estimate INTEGER NOT NULL DEFAULT 0,
  saint_breakdown JSONB NOT NULL DEFAULT '[]'::jsonb,  -- [{guide, messages, minutes}]

  -- Virtues & struggles (from reflection_analyses + confessions)
  top_virtues JSONB NOT NULL DEFAULT '[]'::jsonb,      -- [{name, count}]
  recurring_struggles JSONB NOT NULL DEFAULT '[]'::jsonb,
  overcome_struggles JSONB NOT NULL DEFAULT '[]'::jsonb,
  emotional_tone TEXT,

  -- Prayer stats
  prayer_completions_count INTEGER NOT NULL DEFAULT 0,
  prayers_by_type JSONB NOT NULL DEFAULT '{}'::jsonb,   -- {morning: 3, rosary: 2, ...}
  rosaries_completed INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak_this_week INTEGER NOT NULL DEFAULT 0,
  journal_entries_count INTEGER NOT NULL DEFAULT 0,
  confessions_count INTEGER NOT NULL DEFAULT 0,

  -- AI narrative
  headline TEXT,
  reflection TEXT,
  scripture TEXT,

  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

  UNIQUE (user_id, week_start)
);

CREATE INDEX idx_weekly_recaps_user_week ON public.weekly_recaps(user_id, week_start DESC);

ALTER TABLE public.weekly_recaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own recaps"
  ON public.weekly_recaps FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recaps"
  ON public.weekly_recaps FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage recaps"
  ON public.weekly_recaps FOR ALL
  TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');