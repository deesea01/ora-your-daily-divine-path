CREATE TABLE public.prayer_progress_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  prayer_type TEXT NOT NULL,
  prayer_date DATE NOT NULL DEFAULT CURRENT_DATE,
  content TEXT NOT NULL DEFAULT '',
  completed_stage_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, prayer_type, prayer_date)
);

CREATE INDEX idx_prayer_progress_sessions_user_date
  ON public.prayer_progress_sessions (user_id, prayer_date);

ALTER TABLE public.prayer_progress_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own prayer progress sessions"
  ON public.prayer_progress_sessions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own prayer progress sessions"
  ON public.prayer_progress_sessions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own prayer progress sessions"
  ON public.prayer_progress_sessions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own prayer progress sessions"
  ON public.prayer_progress_sessions FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER trg_prayer_progress_sessions_updated_at
  BEFORE UPDATE ON public.prayer_progress_sessions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();