ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS prayer_plan_generated boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS prayer_plan_reviewed boolean NOT NULL DEFAULT false;

-- Back-fill: anyone already marked onboarding_completed has, by definition,
-- already generated and reviewed their plan (under the old flow).
UPDATE public.user_profiles
   SET prayer_plan_generated = true,
       prayer_plan_reviewed = true
 WHERE onboarding_completed = true;