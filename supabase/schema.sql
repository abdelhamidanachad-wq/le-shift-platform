-- Le Shift production schema. Apply in Supabase SQL Editor for a fresh project.
create extension if not exists pgcrypto;

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  category text not null,
  kind text not null check (kind in ('Skill Claude','Serveur MCP','Agent IA','Plugin / Extension','Workflow')),
  impact text not null default 'Productivité',
  time_saved text,
  price_label text not null default 'À vérifier',
  price_amount numeric(10,2),
  currency text not null default 'EUR',
  tag text,
  accent text,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  featured boolean not null default false,
  website_url text,
  documentation_url text,
  repository_url text,
  compatibility text[] not null default array['Claude','ChatGPT','MCP']::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists skills_status_category_idx on public.skills(status,category);
create index if not exists skills_featured_idx on public.skills(featured desc,created_at desc);
alter table public.skills enable row level security;

create table if not exists public.resource_submissions (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 120),
  url text not null check (url ~ '^https?://'),
  kind text not null check (kind in ('Skill Claude','Serveur MCP','Agent IA','Plugin / Extension','Workflow')),
  category text not null check (char_length(category) between 2 and 80),
  description text not null check (char_length(description) between 20 and 1500),
  submitter_email text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);
alter table public.resource_submissions enable row level security;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;

create or replace function public.is_shift_admin()
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.admin_users a
    where a.user_id = auth.uid()
      and lower(a.email) = lower(coalesce(auth.jwt() ->> 'email',''))
      and lower(a.email) = 'abdel@leshift.fr'
  );
$$;
revoke all on function public.is_shift_admin() from public, anon;
grant execute on function public.is_shift_admin() to authenticated;

drop policy if exists "Public can read published skills" on public.skills;
create policy "Public can read published skills" on public.skills
  for select to anon, authenticated using (status = 'published');
drop policy if exists "Admins manage skills" on public.skills;
create policy "Admins manage skills" on public.skills
  for all to authenticated using (public.is_shift_admin()) with check (public.is_shift_admin());

drop policy if exists "Public can submit pending resources" on public.resource_submissions;
create policy "Public can submit pending resources" on public.resource_submissions
  for insert to anon, authenticated with check (status = 'pending');
drop policy if exists "Admins read submissions" on public.resource_submissions;
create policy "Admins read submissions" on public.resource_submissions
  for select to authenticated using (public.is_shift_admin());
drop policy if exists "Admins update submissions" on public.resource_submissions;
create policy "Admins update submissions" on public.resource_submissions
  for update to authenticated using (public.is_shift_admin()) with check (public.is_shift_admin());
drop policy if exists "Admins delete submissions" on public.resource_submissions;
create policy "Admins delete submissions" on public.resource_submissions
  for delete to authenticated using (public.is_shift_admin());

drop policy if exists "Admin reads own admin record" on public.admin_users;
create policy "Admin reads own admin record" on public.admin_users
  for select to authenticated using (user_id = auth.uid());

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public, pg_temp
as $$ begin new.updated_at = now(); return new; end; $$;
drop trigger if exists skills_set_updated_at on public.skills;
create trigger skills_set_updated_at before update on public.skills
  for each row execute function public.set_updated_at();
