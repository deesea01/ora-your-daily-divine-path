
-- Reflection analyses: AI analysis of each journal/examen entry
CREATE TABLE public.reflection_analyses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  entry_id uuid REFERENCES public.journal_entries(id) ON DELETE CASCADE,
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  reflection_text text,
  detected_emotions text[] NOT NULL DEFAULT '{}',
  detected_virtues text[] NOT NULL DEFAULT '{}',
  detected_struggles text[] NOT NULL DEFAULT '{}',
  emotional_tone text,
  ai_summary text,
  affirmation text,
  gentle_correction text,
  scripture text,
  actionable_step text,
  personalized_prayer text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.reflection_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own analyses" ON public.reflection_analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own analyses" ON public.reflection_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own analyses" ON public.reflection_analyses FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own analyses" ON public.reflection_analyses FOR DELETE USING (auth.uid() = user_id);

-- Spiritual patterns: cached pattern recognition results
CREATE TABLE public.spiritual_patterns (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  analysis_period_start date NOT NULL,
  analysis_period_end date NOT NULL,
  recurring_struggles jsonb NOT NULL DEFAULT '[]',
  growing_virtues jsonb NOT NULL DEFAULT '[]',
  common_triggers jsonb NOT NULL DEFAULT '[]',
  emotional_trends jsonb NOT NULL DEFAULT '[]',
  entry_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.spiritual_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own patterns" ON public.spiritual_patterns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own patterns" ON public.spiritual_patterns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own patterns" ON public.spiritual_patterns FOR DELETE USING (auth.uid() = user_id);

-- Weekly reports
CREATE TABLE public.weekly_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  week_start date NOT NULL,
  week_end date NOT NULL,
  overall_summary text,
  growth_areas text,
  struggle_patterns text,
  divine_invitation text,
  weekly_focus text,
  full_report jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.weekly_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reports" ON public.weekly_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own reports" ON public.weekly_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reports" ON public.weekly_reports FOR DELETE USING (auth.uid() = user_id);

-- Growth plans
CREATE TABLE public.growth_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'Your 3-Day Spiritual Plan',
  day1_action text,
  day2_action text,
  day3_action text,
  scripture_anchor text,
  plan_prayer text,
  focus_area text,
  is_active boolean NOT NULL DEFAULT true,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.growth_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own plans" ON public.growth_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own plans" ON public.growth_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own plans" ON public.growth_plans FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own plans" ON public.growth_plans FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_reflection_analyses_user_date ON public.reflection_analyses(user_id, entry_date DESC);
CREATE INDEX idx_spiritual_patterns_user ON public.spiritual_patterns(user_id, created_at DESC);
CREATE INDEX idx_weekly_reports_user ON public.weekly_reports(user_id, week_start DESC);
CREATE INDEX idx_growth_plans_user ON public.growth_plans(user_id, is_active, created_at DESC);
