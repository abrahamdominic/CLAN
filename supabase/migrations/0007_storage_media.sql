-- Storage policies for the public "media" bucket.
-- The bucket itself ("media", public) must be created in the Supabase
-- dashboard (or via the admin API). This migration secures access to it:
-- anyone can read, but only staff can upload / replace / delete files.

create policy "media_public_read" on storage.objects
  for select
  using (bucket_id = 'media');

create policy "media_staff_insert" on storage.objects
  for insert
  with check (bucket_id = 'media' and public.is_staff());

create policy "media_staff_update" on storage.objects
  for update
  using (bucket_id = 'media' and public.is_staff());

create policy "media_staff_delete" on storage.objects
  for delete
  using (bucket_id = 'media' and public.is_staff());