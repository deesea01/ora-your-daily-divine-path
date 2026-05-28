DO $$
DECLARE
  reviewer_id uuid;
BEGIN
  SELECT id INTO reviewer_id FROM auth.users WHERE lower(email) = 'appreview@oradevotion.com' LIMIT 1;
  IF reviewer_id IS NULL THEN
    RAISE NOTICE 'appreview@oradevotion.com not found';
    RETURN;
  END IF;
  INSERT INTO public.user_profiles (user_id, onboarding_completed, spiritual_guide, experience_level, seeking, display_name, terms_accepted_at)
  VALUES (reviewer_id, true, 'st_francis', 'beginner', ARRAY['peace','growth'], 'App Review', now())
  ON CONFLICT (user_id) DO UPDATE
    SET onboarding_completed = true,
        terms_accepted_at = COALESCE(public.user_profiles.terms_accepted_at, now()),
        spiritual_guide = CASE WHEN public.user_profiles.spiritual_guide = 'monk' THEN 'st_francis' ELSE public.user_profiles.spiritual_guide END;
END $$;