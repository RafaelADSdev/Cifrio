import { afterAll, beforeAll, expect, it } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
const A = '00000000-0000-4000-8000-000000000001', B = '00000000-0000-4000-8000-000000000002';
const pathA = `${A}/10000000-0000-4000-8000-000000000001.png`, pathB = `${B}/10000000-0000-4000-8000-000000000002.png`;
let db: PGlite;
async function owner(id: string) { await db.exec(`reset role; set role authenticated; set request.jwt.claim.sub = '${id}';`); }
beforeAll(async () => {
  db = new PGlite();
  await db.exec(`create role authenticated; create role anon; create schema auth; create schema storage;
    create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
    create function storage.foldername(text) returns text[] language sql immutable as $$select (string_to_array($1,'/'))[1:array_length(string_to_array($1,'/'),1)-1]$$;
    create table storage.buckets(id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
    create table storage.objects(bucket_id text, name text, primary key(bucket_id,name)); alter table storage.objects enable row level security;
    grant usage on schema storage,auth to authenticated,anon; grant execute on function auth.uid(),storage.foldername(text) to authenticated,anon; grant select,insert,update,delete on storage.objects to authenticated; grant select on storage.objects to anon;`);
  await db.exec(readFileSync('supabase/migrations/20261005164334_profile_avatars.sql','utf8'));
  await owner(A); await db.query('insert into storage.objects values ($1,$2)', ['profile-avatars',pathA]);
  await owner(B); await db.query('insert into storage.objects values ($1,$2)', ['profile-avatars',pathB]);
}, 30000);
afterAll(async () => { await db.close(); });
it('private bucket has size and MIME restrictions', async () => {
  await db.exec('reset role'); const result = await db.query<{ public: boolean; file_size_limit: number; allowed_mime_types: string[] }>('select public,file_size_limit,allowed_mime_types from storage.buckets');
  expect(result.rows[0]).toMatchObject({ public: false, file_size_limit: 2000000, allowed_mime_types: ['image/jpeg','image/png','image/webp'] });
});
it('owner sees only own photo, cannot insert cross-user or invalid path, cannot update owner', async () => {
  await owner(A); expect((await db.query('select name from storage.objects')).rows).toEqual([{ name: pathA }]);
  await expect(db.query('insert into storage.objects values ($1,$2)', ['profile-avatars',`${B}/20000000-0000-4000-8000-000000000001.png`])).rejects.toThrow();
  await expect(db.query('insert into storage.objects values ($1,$2)', ['profile-avatars',`${A}/../unsafe.svg`])).rejects.toThrow();
  expect((await db.query('update storage.objects set name=$1 returning name', [pathB])).rows).toHaveLength(0);
});
it('other owner cannot delete the photo; anon sees no private objects', async () => {
  await owner(B); expect((await db.query('delete from storage.objects where name=$1 returning name',[pathA])).rows).toHaveLength(0);
  await db.exec('reset role; set role anon'); expect((await db.query('select * from storage.objects')).rows).toHaveLength(0);
  await owner(A); expect((await db.query('delete from storage.objects where name=$1 returning name',[pathA])).rows).toHaveLength(1);
});
