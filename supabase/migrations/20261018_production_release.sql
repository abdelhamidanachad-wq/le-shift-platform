-- Apply once to the existing production Supabase project.
create extension if not exists pgcrypto;

alter table public.skills add column if not exists repository_url text;
alter table public.skills add column if not exists compatibility text[] not null default array['Claude','ChatGPT','MCP']::text[];

do $$
declare c record;
begin
  for c in
    select conname
    from pg_constraint
    where conrelid = 'public.skills'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%kind%'
  loop
    execute format('alter table public.skills drop constraint %I', c.conname);
  end loop;
end $$;

alter table public.skills
  add constraint skills_kind_check
  check (kind in ('Skill Claude','Serveur MCP','Agent IA','Plugin / Extension','Workflow'));

do $$
declare c record;
begin
  for c in
    select conname
    from pg_constraint
    where conrelid = 'public.resource_submissions'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%kind%'
  loop
    execute format('alter table public.resource_submissions drop constraint %I', c.conname);
  end loop;
end $$;

alter table public.resource_submissions
  add constraint resource_submissions_kind_check
  check (kind in ('Skill Claude','Serveur MCP','Agent IA','Plugin / Extension','Workflow'));

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;

create or replace function public.is_shift_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users a
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
