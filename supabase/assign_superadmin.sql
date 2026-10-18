-- Run AFTER creating the Auth user in Supabase Dashboard > Authentication > Users.
-- The email must match the superadmin account exactly.
insert into public.admin_users (user_id, email)
select id, lower(email)
from auth.users
where lower(email) = lower('abdel@leshift.fr')
on conflict (email) do update
set user_id = excluded.user_id;
