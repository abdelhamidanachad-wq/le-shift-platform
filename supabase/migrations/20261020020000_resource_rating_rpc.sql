-- Store ratings through a narrow RPC so anonymous clients never read individual ratings.
drop policy if exists "Public can submit resource ratings" on public.resource_ratings;
drop policy if exists "Public can update resource ratings" on public.resource_ratings;
revoke all on public.resource_ratings from anon;
grant select on public.resource_ratings to authenticated;

create or replace function public.save_resource_rating(
  p_skill_id uuid,
  p_visitor_id uuid,
  p_rating smallint
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_rating < 1 or p_rating > 5 then
    raise exception 'Rating must be between 1 and 5';
  end if;
  if not exists (select 1 from public.skills where id = p_skill_id and status = 'published') then
    raise exception 'Resource is not available for rating';
  end if;
  insert into public.resource_ratings(skill_id, visitor_id, rating)
  values (p_skill_id, p_visitor_id, p_rating)
  on conflict (skill_id, visitor_id)
  do update set rating = excluded.rating, updated_at = now();
end;
$$;
revoke all on function public.save_resource_rating(uuid, uuid, smallint) from public;
grant execute on function public.save_resource_rating(uuid, uuid, smallint) to anon, authenticated;
