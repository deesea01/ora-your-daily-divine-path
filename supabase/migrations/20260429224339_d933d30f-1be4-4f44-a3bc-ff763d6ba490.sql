ALTER TABLE public.spiritual_profiles 
  ADD COLUMN IF NOT EXISTS devotional_plan jsonb NOT NULL DEFAULT '{}'::jsonb;