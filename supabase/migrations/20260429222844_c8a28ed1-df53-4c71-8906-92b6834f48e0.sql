-- Migrate monk users to St. Francis
UPDATE public.user_profiles SET spiritual_guide = 'st_francis' WHERE spiritual_guide = 'monk';
UPDATE public.onboarding_responses SET chosen_guide = 'st_francis' WHERE chosen_guide = 'monk';

-- Intentions
CREATE TABLE public.intentions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  text text NOT NULL,
  category text,
  answered boolean NOT NULL DEFAULT false,
  answered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.intentions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own intentions" ON public.intentions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own intentions" ON public.intentions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own intentions" ON public.intentions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own intentions" ON public.intentions FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER intentions_touch BEFORE UPDATE ON public.intentions FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Scripture saves
CREATE TABLE public.scripture_saves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  reference text NOT NULL,
  passage_text text,
  theme text,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.scripture_saves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own scripture" ON public.scripture_saves FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own scripture" ON public.scripture_saves FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own scripture" ON public.scripture_saves FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Saint interactions log
CREATE TABLE public.saint_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  saint_key text NOT NULL,
  interaction_type text NOT NULL DEFAULT 'chat',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.saint_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own saint interactions" ON public.saint_interactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own saint interactions" ON public.saint_interactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE INDEX saint_interactions_user_idx ON public.saint_interactions(user_id, created_at DESC);

-- Spiritual profile (one per user)
CREATE TABLE public.spiritual_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  growth_areas jsonb NOT NULL DEFAULT '[]'::jsonb,
  struggles jsonb NOT NULL DEFAULT '[]'::jsonb,
  devotional_consistency numeric DEFAULT 0,
  top_saint text,
  saints_affinity jsonb NOT NULL DEFAULT '[]'::jsonb,
  preferred_devotional_time text,
  recommendations jsonb NOT NULL DEFAULT '[]'::jsonb,
  ai_summary text,
  ai_invitation text,
  last_refreshed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.spiritual_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own spiritual profile" ON public.spiritual_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own spiritual profile" ON public.spiritual_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own spiritual profile" ON public.spiritual_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service role manages spiritual profiles" ON public.spiritual_profiles FOR ALL TO public USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE TRIGGER spiritual_profiles_touch BEFORE UPDATE ON public.spiritual_profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();