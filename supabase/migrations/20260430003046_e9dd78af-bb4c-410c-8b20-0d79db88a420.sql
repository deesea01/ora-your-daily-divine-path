
CREATE TABLE IF NOT EXISTS public.reminder_prefs (
  user_id           uuid PRIMARY KEY,
  enabled           boolean NOT NULL DEFAULT true,
  email_enabled     boolean NOT NULL DEFAULT false,
  sms_enabled       boolean NOT NULL DEFAULT false,
  email_address     text,
  phone_e164        text,
  timezone          text NOT NULL DEFAULT 'UTC',
  morning_hour      smallint NOT NULL DEFAULT 7,
  morning_minute    smallint NOT NULL DEFAULT 0,
  midday_hour       smallint NOT NULL DEFAULT 12,
  midday_minute     smallint NOT NULL DEFAULT 0,
  night_hour        smallint NOT NULL DEFAULT 21,
  night_minute      smallint NOT NULL DEFAULT 0,
  unfinished_followup boolean NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT reminder_prefs_phone_chk CHECK (phone_e164 IS NULL OR phone_e164 ~ '^\+[1-9][0-9]{6,14}$'),
  CONSTRAINT reminder_prefs_email_chk CHECK (email_address IS NULL OR position('@' in email_address) > 1),
  CONSTRAINT reminder_prefs_hour_chk CHECK (
    morning_hour BETWEEN 0 AND 23 AND midday_hour BETWEEN 0 AND 23 AND night_hour BETWEEN 0 AND 23
    AND morning_minute BETWEEN 0 AND 59 AND midday_minute BETWEEN 0 AND 59 AND night_minute BETWEEN 0 AND 59
  )
);

ALTER TABLE public.reminder_prefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own reminder prefs" ON public.reminder_prefs
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own reminder prefs" ON public.reminder_prefs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own reminder prefs" ON public.reminder_prefs
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service role manages reminder prefs" ON public.reminder_prefs
  FOR ALL TO public USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE TRIGGER reminder_prefs_touch
  BEFORE UPDATE ON public.reminder_prefs
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE IF NOT EXISTS public.reminder_send_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL,
  slot        text NOT NULL,
  channel     text NOT NULL,
  kind        text NOT NULL DEFAULT 'scheduled',
  sent_for_date date NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT reminder_send_log_slot_chk CHECK (slot IN ('morning','midday','night','unfinished')),
  CONSTRAINT reminder_send_log_channel_chk CHECK (channel IN ('email','sms')),
  CONSTRAINT reminder_send_log_kind_chk CHECK (kind IN ('scheduled','unfinished'))
);

CREATE UNIQUE INDEX IF NOT EXISTS reminder_send_log_unique
  ON public.reminder_send_log (user_id, slot, channel, kind, sent_for_date);

ALTER TABLE public.reminder_send_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages reminder log" ON public.reminder_send_log
  FOR ALL TO public USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Users view own reminder log" ON public.reminder_send_log
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
