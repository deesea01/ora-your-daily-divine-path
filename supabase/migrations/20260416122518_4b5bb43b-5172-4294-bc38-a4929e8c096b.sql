CREATE TABLE public.ai_error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name text NOT NULL,
  error_message text,
  user_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.ai_error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only" ON public.ai_error_logs
  FOR ALL TO service_role USING (true) WITH CHECK (true);