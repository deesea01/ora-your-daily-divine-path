-- 1) Add provider column with default 'paddle' for backfill, then drop the default.
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS provider text NOT NULL DEFAULT 'paddle';

-- 2) Make paddle-specific columns optional so RevenueCat rows can omit them.
ALTER TABLE public.subscriptions
  ALTER COLUMN paddle_subscription_id DROP NOT NULL,
  ALTER COLUMN paddle_customer_id DROP NOT NULL;

-- 3) Backfill existing rows: anything with a paddle_subscription_id is from Paddle.
UPDATE public.subscriptions
   SET provider = 'paddle'
 WHERE provider IS NULL OR provider = '';

-- 4) The previous unique constraint on (user_id, environment) is too tight —
--    a user might have Paddle on web (env='live') AND RevenueCat on iOS
--    (env='ios_iap') at the same time. Replace it with a per-(user, provider, env)
--    constraint so each provider+env combo is unique per user.
ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_user_id_environment_key;

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_user_provider_env_key
  ON public.subscriptions (user_id, provider, environment);

-- 5) Index for fast lookup by RevenueCat app_user_id (which we store in
--    paddle_customer_id for IAP rows to keep the existing schema).
CREATE INDEX IF NOT EXISTS idx_subscriptions_provider
  ON public.subscriptions (provider);

-- 6) Update the entitlement helper so it counts ANY active provider as premium,
--    not just the env that was passed in. This means iOS purchases unlock
--    premium even when the web client is checking for env='live'.
CREATE OR REPLACE FUNCTION public.has_active_subscription(user_uuid uuid, check_env text DEFAULT 'live'::text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = user_uuid
      AND status IN ('active', 'trialing')
      AND (current_period_end IS NULL OR current_period_end > now())
  );
$function$;