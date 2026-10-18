-- Le Shift commerce, product packs, diagnostics and weekly discovery.
alter table public.skills
  add column if not exists checkout_url text,
  add column if not exists pricing_model text not null default 'free';

do $$ begin
  alter table public.skills add constraint skills_pricing_model_check
    check (pricing_model in ('free','one_time','subscription','lead_magnet'));
exception when duplicate_object then null; end $$;

create table if not exists public.resource_packs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  price_amount numeric(10,2) not null default 0 check (price_amount >= 0),
  currency text not null default 'EUR',
  billing_interval text not null default 'one_time' check (billing_interval in ('one_time','monthly','yearly')),
  checkout_url text,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resource_pack_items (
  id uuid primary key default gen_random_uuid(),
  pack_id uuid not null references public.resource_packs(id) on delete cascade,
  skill_id uuid references public.skills(id) on delete set null,
  resource_slug text,
  position integer not null default 0,
  unique(pack_id, resource_slug)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  customer_email text,
  product_type text not null check (product_type in ('skill','pack','subscription')),
  product_id text not null,
  product_title text,
  amount numeric(10,2) not null default 0,
  currency text not null default 'EUR',
  payment_provider text not null default 'lemon_squeezy',
  provider_order_id text unique,
  status text not null default 'pending' check (status in ('pending','paid','refunded','failed','cancelled')),
  checkout_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  customer_email text not null,
  plan_slug text not null,
  plan_name text not null,
  payment_provider text not null default 'lemon_squeezy',
  provider_subscription_id text unique,
  status text not null default 'pending' check (status in ('pending','active','past_due','cancelled','expired')),
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.lead_diagnostics (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  full_name text,
  company text,
  role text,
  ai_maturity text not null,
  weekly_hours numeric(6,2) not null default 0,
  team_size integer not null default 1,
  tasks text[] not null default '{}',
  hourly_value numeric(10,2) not null default 0,
  estimated_hours_saved numeric(7,2) not null default 0,
  estimated_annual_value numeric(12,2) not null default 0,
  readiness_score integer not null default 0,
  consent_marketing boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.resource_watch_items (
  id uuid primary key default gen_random_uuid(),
  source_name text not null,
  source_url text not null,
  watch_type text not null default 'resource' check (watch_type in ('competitor','resource','repository','newsletter')),
  active boolean not null default true,
  notes text,
  last_checked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.weekly_resource_suggestions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null,
  kind text not null check (kind in ('Skill Claude','Serveur MCP','Agent IA','Plugin / Extension','Workflow')),
  category text not null default 'À classer',
  description text not null,
  source text not null default 'Veille éditoriale',
  relevance_score integer not null default 3 check (relevance_score between 1 and 5),
  week_start date not null default date_trunc('week', current_date)::date,
  status text not null default 'suggested' check (status in ('suggested','approved','rejected','added')),
  created_at timestamptz not null default now()
);

create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists subscriptions_status_idx on public.subscriptions(status);
create index if not exists lead_diagnostics_created_at_idx on public.lead_diagnostics(created_at desc);
create index if not exists weekly_suggestions_week_idx on public.weekly_resource_suggestions(week_start desc);
create unique index if not exists weekly_suggestions_url_week_uidx on public.weekly_resource_suggestions(url, week_start);

alter table public.resource_packs enable row level security;
alter table public.resource_pack_items enable row level security;
alter table public.orders enable row level security;
alter table public.subscriptions enable row level security;
alter table public.lead_diagnostics enable row level security;
alter table public.resource_watch_items enable row level security;
alter table public.weekly_resource_suggestions enable row level security;

drop policy if exists "Published packs are public" on public.resource_packs;
create policy "Published packs are public" on public.resource_packs for select to anon, authenticated using (status = 'published');
drop policy if exists "Admins manage packs" on public.resource_packs;
create policy "Admins manage packs" on public.resource_packs for all to authenticated using (public.is_shift_admin()) with check (public.is_shift_admin());

drop policy if exists "Published pack contents are public" on public.resource_pack_items;
create policy "Published pack contents are public" on public.resource_pack_items for select to anon, authenticated using (
  exists (select 1 from public.resource_packs p where p.id = pack_id and p.status = 'published')
);
drop policy if exists "Admins manage pack contents" on public.resource_pack_items;
create policy "Admins manage pack contents" on public.resource_pack_items for all to authenticated using (public.is_shift_admin()) with check (public.is_shift_admin());

drop policy if exists "Admins manage orders" on public.orders;
create policy "Admins manage orders" on public.orders for all to authenticated using (public.is_shift_admin()) with check (public.is_shift_admin());
drop policy if exists "Admins manage subscriptions" on public.subscriptions;
create policy "Admins manage subscriptions" on public.subscriptions for all to authenticated using (public.is_shift_admin()) with check (public.is_shift_admin());

drop policy if exists "Public can submit AI diagnostics" on public.lead_diagnostics;
create policy "Public can submit AI diagnostics" on public.lead_diagnostics for insert to anon, authenticated with check (
  length(trim(email)) between 5 and 254 and weekly_hours between 0 and 100 and team_size between 1 and 100000
);
drop policy if exists "Admins read AI diagnostics" on public.lead_diagnostics;
create policy "Admins read AI diagnostics" on public.lead_diagnostics for select to authenticated using (public.is_shift_admin());

drop policy if exists "Admins manage resource watch" on public.resource_watch_items;
create policy "Admins manage resource watch" on public.resource_watch_items for all to authenticated using (public.is_shift_admin()) with check (public.is_shift_admin());
drop policy if exists "Admins manage weekly suggestions" on public.weekly_resource_suggestions;
create policy "Admins manage weekly suggestions" on public.weekly_resource_suggestions for all to authenticated using (public.is_shift_admin()) with check (public.is_shift_admin());

insert into public.resource_packs (slug,title,description,price_amount,currency,billing_interval,status,featured)
values
 ('ai-workday-starter','AI Workday Starter','Une sélection de skills, MCP et workflows pour éliminer les tâches répétitives du quotidien professionnel.',19,'EUR','one_time','published',true),
 ('marketing-growth-stack','Marketing & Growth Stack','Recherche, veille concurrentielle, contenu et analyse de performance pour les équipes marketing.',39,'EUR','one_time','published',true),
 ('developer-automation-stack','Developer Automation Stack','Outils de dépôt, navigation web, tests et orchestration pour les équipes produit et tech.',49,'EUR','one_time','published',false)
on conflict (slug) do nothing;

insert into public.resource_pack_items(pack_id,resource_slug,position)
select p.id, x.slug, x.position
from (values
 ('ai-workday-starter','anthropics-skills',1),
 ('ai-workday-starter','mcp-servers',2),
 ('marketing-growth-stack','n8n',1),
 ('developer-automation-stack','github-mcp-server',1),
 ('developer-automation-stack','playwright-mcp',2),
 ('developer-automation-stack','langgraph',3)
) as x(pack_slug,slug,position)
join public.resource_packs p on p.slug=x.pack_slug
on conflict (pack_id,resource_slug) do nothing;

insert into public.resource_watch_items(source_name,source_url,watch_type,notes)
values
 ('Anthropic Skills','https://github.com/anthropics/skills','repository','Nouveaux skills, exemples et évolutions de format'),
 ('Model Context Protocol Servers','https://github.com/modelcontextprotocol/servers','repository','Nouveaux serveurs et intégrations MCP'),
 ('GitHub MCP Server','https://github.com/github/github-mcp-server','competitor','Connecteurs et capacités GitHub'),
 ('Smithery','https://smithery.ai/','competitor','Catalogue et tendances des serveurs MCP'),
 ('Glama MCP','https://glama.ai/mcp/servers','competitor','Découverte et classement des serveurs MCP'),
 ('MCP.so','https://mcp.so/','competitor','Répertoire communautaire MCP')
on conflict do nothing;

insert into public.weekly_resource_suggestions(title,url,kind,category,description,source,relevance_score)
values
 ('Anthropic Skills','https://github.com/anthropics/skills','Skill Claude','Claude Skills','Répertoire officiel de skills et exemples d’instructions réutilisables. Vérifier licence et prérequis avant une offre payante.','GitHub officiel',5),
 ('GitHub MCP Server','https://github.com/github/github-mcp-server','Serveur MCP','Développement','Serveur MCP officiel pour interagir avec dépôts, issues et pull requests via des clients compatibles.','GitHub officiel',5),
 ('Playwright MCP','https://github.com/microsoft/playwright-mcp','Serveur MCP','Automatisation web','Serveur MCP de navigateur pour automatiser des tâches web et explorer des pages avec des outils structurés.','GitHub officiel',4),
 ('LangGraph','https://github.com/langchain-ai/langgraph','Agent IA','Orchestration','Framework pour construire des agents et workflows IA avec état et contrôle d’exécution.','GitHub officiel',4),
 ('n8n','https://github.com/n8n-io/n8n','Workflow','Automatisation','Plateforme d’automatisation de workflows et d’intégrations pour les opérations.','GitHub officiel',4)
on conflict do nothing;

grant select on public.resource_packs, public.resource_pack_items to anon, authenticated;
grant insert on public.lead_diagnostics to anon, authenticated;
grant select, insert, update, delete on public.resource_packs, public.resource_pack_items, public.orders, public.subscriptions, public.resource_watch_items, public.weekly_resource_suggestions to authenticated;
