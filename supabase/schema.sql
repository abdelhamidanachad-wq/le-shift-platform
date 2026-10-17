-- Le Shift — initial catalogue schema
-- Run in Supabase Dashboard > SQL Editor after creating a project.
create extension if not exists pgcrypto;

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  category text not null,
  kind text not null check (kind in ('Skill Claude', 'Serveur MCP')),
  impact text not null default 'Productivité',
  time_saved text,
  price_label text not null default 'Gratuit',
  price_amount numeric(10,2),
  currency text not null default 'EUR',
  tag text,
  accent text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  featured boolean not null default false,
  website_url text,
  documentation_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists skills_status_category_idx
  on public.skills (status, category);
create index if not exists skills_featured_idx
  on public.skills (featured desc, created_at desc);

alter table public.skills enable row level security;

-- Visitors can only read listings explicitly published by an administrator.
drop policy if exists "Public can read published skills" on public.skills;
create policy "Public can read published skills"
  on public.skills for select
  to anon, authenticated
  using (status = 'published');

-- No public INSERT, UPDATE, or DELETE policy is intentionally created.
-- Catalogue management should be added behind authenticated admin authorization.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists skills_set_updated_at on public.skills;
create trigger skills_set_updated_at
  before update on public.skills
  for each row execute function public.set_updated_at();
