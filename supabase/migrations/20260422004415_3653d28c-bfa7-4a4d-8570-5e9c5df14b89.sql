-- Schedule trial-reminders to run daily at 14:00 UTC via pg_cron
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

-- Remove any prior schedule with the same name
do $$
begin
  if exists (select 1 from cron.job where jobname = 'trial-reminders-daily') then
    perform cron.unschedule('trial-reminders-daily');
  end if;
end $$;

select cron.schedule(
  'trial-reminders-daily',
  '0 14 * * *',
  $$
  select net.http_post(
    url := 'https://lrrsmihlulzuhdqndinw.supabase.co/functions/v1/trial-reminders',
    headers := jsonb_build_object('Content-Type','application/json'),
    body := jsonb_build_object('source','cron')
  );
  $$
);