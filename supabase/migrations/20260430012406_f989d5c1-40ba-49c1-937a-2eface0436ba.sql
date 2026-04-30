ALTER TABLE public.prayer_completions
  ADD COLUMN IF NOT EXISTS saint_key text,
  ADD COLUMN IF NOT EXISTS themes text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS scripture_ref text,
  ADD COLUMN IF NOT EXISTS reflection text;

CREATE INDEX IF NOT EXISTS idx_prayer_completions_user_date
  ON public.prayer_completions (user_id, prayer_date DESC);