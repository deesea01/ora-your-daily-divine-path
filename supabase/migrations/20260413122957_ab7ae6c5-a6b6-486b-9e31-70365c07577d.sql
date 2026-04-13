
-- Fix spiritual_patterns: drop public-role policies, recreate as authenticated
DROP POLICY IF EXISTS "Users can view their own patterns" ON public.spiritual_patterns;
DROP POLICY IF EXISTS "Users can insert their own patterns" ON public.spiritual_patterns;
DROP POLICY IF EXISTS "Users can delete their own patterns" ON public.spiritual_patterns;

CREATE POLICY "Users can view their own patterns" ON public.spiritual_patterns FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own patterns" ON public.spiritual_patterns FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own patterns" ON public.spiritual_patterns FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Fix reflection_analyses: drop public-role policies, recreate as authenticated
DROP POLICY IF EXISTS "Users can view their own analyses" ON public.reflection_analyses;
DROP POLICY IF EXISTS "Users can insert their own analyses" ON public.reflection_analyses;
DROP POLICY IF EXISTS "Users can update their own analyses" ON public.reflection_analyses;
DROP POLICY IF EXISTS "Users can delete their own analyses" ON public.reflection_analyses;

CREATE POLICY "Users can view their own analyses" ON public.reflection_analyses FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own analyses" ON public.reflection_analyses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own analyses" ON public.reflection_analyses FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own analyses" ON public.reflection_analyses FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Fix growth_plans: drop public-role policies, recreate as authenticated
DROP POLICY IF EXISTS "Users can view their own plans" ON public.growth_plans;
DROP POLICY IF EXISTS "Users can insert their own plans" ON public.growth_plans;
DROP POLICY IF EXISTS "Users can update their own plans" ON public.growth_plans;
DROP POLICY IF EXISTS "Users can delete their own plans" ON public.growth_plans;

CREATE POLICY "Users can view their own plans" ON public.growth_plans FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own plans" ON public.growth_plans FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own plans" ON public.growth_plans FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own plans" ON public.growth_plans FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Fix weekly_reports: drop public-role policies, recreate as authenticated
DROP POLICY IF EXISTS "Users can view their own reports" ON public.weekly_reports;
DROP POLICY IF EXISTS "Users can insert their own reports" ON public.weekly_reports;
DROP POLICY IF EXISTS "Users can delete their own reports" ON public.weekly_reports;

CREATE POLICY "Users can view their own reports" ON public.weekly_reports FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own reports" ON public.weekly_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reports" ON public.weekly_reports FOR DELETE TO authenticated USING (auth.uid() = user_id);
