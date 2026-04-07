CREATE TABLE public.prayer_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  prayer_date date NOT NULL DEFAULT CURRENT_DATE,
  prayer_type text NOT NULL CHECK (prayer_type IN ('morning', 'midday', 'night')),
  completed_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, prayer_date, prayer_type)
);

ALTER TABLE public.prayer_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own completions"
ON public.prayer_completions FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own completions"
ON public.prayer_completions FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own completions"
ON public.prayer_completions FOR DELETE TO authenticated
USING (auth.uid() = user_id);