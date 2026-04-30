ALTER TABLE public.prayer_progress_sessions
  ADD COLUMN IF NOT EXISTS stage_notes JSONB NOT NULL DEFAULT '{}'::jsonb;