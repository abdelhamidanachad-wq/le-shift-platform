-- Ads management, privacy-conscious site analytics, and aggregate resource ratings.
create extension if not exists pgcrypto;

create table if not exists public.ad_placements (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  provider text not null default 'static' check (provider in ('static','adsense')),
  placement text not null default 'sitewide_top' check (placement in ('sitewide_top','catalogue_inline','resource_detail','diagnostic','footer')),
  enabled boolean not null default false,
  headline text,
  body text,
  image_url text,
  destination_url text,
  alt_text text,
  adsense_client text,
  adsense_slot text,
  starts_at timestamptz,
  ends_at timestamptz,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ad_static_has_image check (provider <> 'static' or image_url is null or image_url ~ '^https?://'),
  constraint ad_destination_url check (destination_url is null or destination_url ~ '^https?://'),
  constraint ad_image_url check (image_url is null or image_url ~ '^https?://')
);
alter table public.ad_placements enable row level security;
drop policy if exists "Public reads active ad placements" on public.ad_placements;
create policy "Public reads active ad placements" on public.ad_placements for select to anon, authenticated
  using (enabled = true and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at > now()));
drop policy if exists "Admins manage ad placements" on public.ad_placements;
create policy "Admins manage ad placements" on public.ad_placements for all to authenticated using (public.is_shift_admin()) with check (public.is_shift_admin());

create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  event_type text not null check (event_type in ('page_view','page_exit','diagnostic_start','diagnostic_complete','ad_impression','ad_click')),
  visitor_id uuid not null,
  session_id uuid not null,
  path text not null default '/',
  referrer text,
  duration_seconds integer not null default 0 check (duration_seconds between 0 and 86400),
  locale text,
  timezone text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists analytics_events_created_at_idx on public.analytics_events(created_at desc);
create index if not exists analytics_events_session_idx on public.analytics_events(session_id);
create index if not exists analytics_events_path_idx on public.analytics_events(path);
alter table public.analytics_events enable row level security;
drop policy if exists "Public can record anonymous analytics" on public.analytics_events;
create policy "Public can record anonymous analytics" on public.analytics_events for insert to anon, authenticated
  with check (
    event_type in ('page_view','page_exit','diagnostic_start','diagnostic_complete','ad_impression','ad_click')
    and length(path) <= 500 and duration_seconds between 0 and 86400
    and length(coalesce(locale,'')) <= 40 and length(coalesce(timezone,'')) <= 100
  );
drop policy if exists "Admins read analytics events" on public.analytics_events;
create policy "Admins read analytics events" on public.analytics_events for select to authenticated using (public.is_shift_admin());

create table if not exists public.resource_ratings (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid not null references public.skills(id) on delete cascade,
  visitor_id uuid not null,
  rating smallint not null check (rating between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(skill_id, visitor_id)
);
create index if not exists resource_ratings_skill_idx on public.resource_ratings(skill_id);
alter table public.resource_ratings enable row level security;
drop policy if exists "Public can submit resource ratings" on public.resource_ratings;
create policy "Public can submit resource ratings" on public.resource_ratings for insert to anon, authenticated
  with check (rating between 1 and 5);
drop policy if exists "Public can update resource ratings" on public.resource_ratings;
create policy "Public can update resource ratings" on public.resource_ratings for update to anon, authenticated
  using (true) with check (rating between 1 and 5);
drop policy if exists "Admins read resource ratings" on public.resource_ratings;
create policy "Admins read resource ratings" on public.resource_ratings for select to authenticated using (public.is_shift_admin());

create or replace view public.resource_rating_summary as
  select skill_id, round(avg(rating)::numeric, 1) as average_rating, count(*)::integer as rating_count
  from public.resource_ratings group by skill_id;
grant select on public.resource_rating_summary to anon, authenticated;

grant insert on public.analytics_events to anon, authenticated;
grant select, insert, update, delete on public.ad_placements to authenticated;
grant select, insert, update on public.resource_ratings to anon, authenticated;
