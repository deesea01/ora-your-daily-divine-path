alter table public.prayer_completions
  drop constraint if exists prayer_completions_prayer_type_check;

alter table public.prayer_completions
  add constraint prayer_completions_prayer_type_check
  check (prayer_type = any (array['morning'::text, 'midday'::text, 'night'::text, 'rosary'::text]));