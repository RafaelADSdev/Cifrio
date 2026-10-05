-- Private profile photos. Presentation metadata is stored in Auth, never used for authorization.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('profile-avatars', 'profile-avatars', false, 2000000, array['image/jpeg','image/png','image/webp']);

create policy "profile_avatar_read_own" on storage.objects for select to authenticated
using (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "profile_avatar_insert_own" on storage.objects for insert to authenticated
with check (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text
  and name ~ '^[a-f0-9-]{36}/[a-f0-9-]{36}\.(jpg|png|webp)$');
create policy "profile_avatar_delete_own" on storage.objects for delete to authenticated
using (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
-- No UPDATE/upsert: each replacement creates a new object and deletes the old after metadata commits.
