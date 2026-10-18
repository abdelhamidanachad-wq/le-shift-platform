-- Public banner storage for the LeSHIFT admin advertising studio.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('ad-banners', 'ad-banners', true, 5242880, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view LeSHIFT ad banners" on storage.objects;
create policy "Public can view LeSHIFT ad banners"
on storage.objects for select to anon, authenticated
using (bucket_id = 'ad-banners');

drop policy if exists "Superadmins upload LeSHIFT ad banners" on storage.objects;
create policy "Superadmins upload LeSHIFT ad banners"
on storage.objects for insert to authenticated
with check (bucket_id = 'ad-banners' and public.is_shift_admin());

drop policy if exists "Superadmins update LeSHIFT ad banners" on storage.objects;
create policy "Superadmins update LeSHIFT ad banners"
on storage.objects for update to authenticated
using (bucket_id = 'ad-banners' and public.is_shift_admin())
with check (bucket_id = 'ad-banners' and public.is_shift_admin());

drop policy if exists "Superadmins delete LeSHIFT ad banners" on storage.objects;
create policy "Superadmins delete LeSHIFT ad banners"
on storage.objects for delete to authenticated
using (bucket_id = 'ad-banners' and public.is_shift_admin());
