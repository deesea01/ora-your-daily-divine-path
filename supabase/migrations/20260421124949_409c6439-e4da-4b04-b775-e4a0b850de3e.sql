-- Index to efficiently find trials ending soon
CREATE INDEX IF NOT EXISTS idx_subscriptions_trialing_end
  ON public.subscriptions (status, current_period_end)
  WHERE status = 'trialing';

-- Track trial-ending email sends so we don't double-send
CREATE TABLE IF NOT EXISTS public.subscription_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL,
  user_id uuid NOT NULL,
  kind text NOT NULL, -- 'trial_ending' | 'receipt' | 'past_due'
  sent_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  UNIQUE (subscription_id, kind, sent_at)
);

CREATE INDEX IF NOT EXISTS idx_sub_notifications_lookup
  ON public.subscription_notifications (subscription_id, kind);

ALTER TABLE public.subscription_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages notifications"
  ON public.subscription_notifications FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Users can view their notifications"
  ON public.subscription_notifications FOR SELECT
  USING (auth.uid() = user_id);