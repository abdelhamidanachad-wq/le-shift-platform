-- Ensure the browser client has SQL privileges; row-level security still controls visible rows.
grant select on public.ad_placements to anon, authenticated;
grant select, insert, update on public.resource_ratings to anon, authenticated;
grant insert on public.analytics_events to anon, authenticated;
grant select on public.analytics_events to authenticated;
grant select, insert, update, delete on public.ad_placements to authenticated;
