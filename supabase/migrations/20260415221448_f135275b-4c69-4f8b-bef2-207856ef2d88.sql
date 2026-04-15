
CREATE TABLE public.journal_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  mood TEXT,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  entry_type TEXT NOT NULL DEFAULT 'free',
  examen_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_journal_entries_user_date ON public.journal_entries (user_id, created_at DESC);

ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own journal entries"
ON public.journal_entries FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own journal entries"
ON public.journal_entries FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal entries"
ON public.journal_entries FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journal entries"
ON public.journal_entries FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE TABLE public.spiritual_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  summary TEXT,
  patterns JSONB NOT NULL DEFAULT '[]'::jsonb,
  strengths JSONB NOT NULL DEFAULT '[]'::jsonb,
  suggested_focus TEXT,
  entry_count INTEGER NOT NULL DEFAULT 0,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_spiritual_insights_user ON public.spiritual_insights (user_id, generated_at DESC);

ALTER TABLE public.spiritual_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own insights"
ON public.spiritual_insights FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own insights"
ON public.spiritual_insights FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own insights"
ON public.spiritual_insights FOR DELETE TO authenticated
USING (auth.uid() = user_id);
