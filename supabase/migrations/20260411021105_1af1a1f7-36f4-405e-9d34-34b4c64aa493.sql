
-- Confessions log table
CREATE TABLE public.confessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  confession_date DATE NOT NULL DEFAULT CURRENT_DATE,
  parish_name TEXT,
  priest_name TEXT,
  reflection TEXT,
  mood TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.confessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own confessions"
  ON public.confessions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own confessions"
  ON public.confessions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own confessions"
  ON public.confessions FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Confession prep notes table
CREATE TABLE public.confession_prep_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category TEXT NOT NULL,
  checked_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  is_draft BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.confession_prep_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own prep notes"
  ON public.confession_prep_notes FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own prep notes"
  ON public.confession_prep_notes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prep notes"
  ON public.confession_prep_notes FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prep notes"
  ON public.confession_prep_notes FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Confession settings table
CREATE TABLE public.confession_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  target_rhythm TEXT NOT NULL DEFAULT 'monthly',
  passcode_enabled BOOLEAN NOT NULL DEFAULT false,
  auto_delete_prep BOOLEAN NOT NULL DEFAULT true,
  hide_previews BOOLEAN NOT NULL DEFAULT false,
  local_only BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.confession_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings"
  ON public.confession_settings FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON public.confession_settings FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON public.confession_settings FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
