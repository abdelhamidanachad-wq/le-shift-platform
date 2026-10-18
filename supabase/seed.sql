-- The production Supabase catalogue currently contains 103 distinct public GitHub repository entries.
-- Placeholder/demo listings were removed. Do not seed invented resources into production.
-- Curated records are managed in public.skills and can be moderated from /admin.
select count(*) as published_resources
from public.skills
where status = 'published';
