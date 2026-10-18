-- Interactive AI diagnostic: quiz results, preferences and skill-map snapshot.
alter table public.lead_diagnostics
  add column if not exists quiz_score integer not null default 0,
  add column if not exists skill_map jsonb not null default '{}'::jsonb,
  add column if not exists preferences jsonb not null default '{}'::jsonb;
