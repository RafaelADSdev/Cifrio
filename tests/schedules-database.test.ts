import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { beforeAll, afterAll, expect, it } from 'vitest';
const A = '00000000-0000-4000-8000-000000000001', B = '00000000-0000-4000-8000-000000000002';
const account = '10000000-0000-4000-8000-000000000001', id = '20000000-0000-4000-8000-000000000001';
let db: PGlite;
const salary = { id, accountId: account, kind: 'income', description: 'Salário teste', amount: 100000, category: 'Salário', day: 31, startMonth: '2026-10', active: true };
async function owner(value: string) { await db.exec(`reset role; set role authenticated; set request.jwt.claim.sub = '${value}';`); }
beforeAll(async () => {
  db = new PGlite();
  await db.exec(`create role authenticated; create role anon; create schema auth; create table auth.users(id uuid primary key); insert into auth.users values ('${A}'),('${B}'); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema auth,public to authenticated,anon; grant execute on function auth.uid() to authenticated,anon;`);
  await db.exec(readFileSync('supabase/migrations/20261005151013_financial_core.sql', 'utf8'));
  await db.exec(readFileSync('supabase/migrations/20261005200529_monthly_schedules.sql', 'utf8'));
  await owner(A);
  await db.query('select public.mutate_finance($1,$2::jsonb,$3::uuid)', ['account', JSON.stringify([{ id: account, name: 'Conta teste', bank: 'BB', openingBalance: 0 }]), randomUUID()]);
}, 30000);
afterAll(async () => { await db.close(); });
it('salva recorrência privada e inclui no snapshot, sem criar lançamento', async () => {
  await owner(A);
  await db.query('insert into public.finance_schedules(id,data) values($1,$2::jsonb)', [id, JSON.stringify(salary)]);
  const result = await db.query<{ state: { recurring: unknown[]; entries: unknown[] } }>('select public.read_finance() as state');
  expect(result.rows[0].state.recurring).toHaveLength(1);
  expect(result.rows[0].state.entries).toHaveLength(0);
});
it('bloqueia outro titular, reatribuição, tipos inválidos e exclusão da conta vinculada', async () => {
  await owner(B);
  expect((await db.query('select id from public.finance_schedules')).rows).toHaveLength(0);
  await expect(db.query('insert into public.finance_schedules(id,data) values($1,$2::jsonb)', [randomUUID(), JSON.stringify({ ...salary, id: randomUUID() })])).rejects.toThrow();
  await owner(A);
  await expect(db.query('update public.finance_schedules set user_id=$1 where id=$2', [B, id])).rejects.toThrow();
  await expect(db.query('update public.finance_schedules set data=$1::jsonb where id=$2', [JSON.stringify({ ...salary, amount: '1000' }), id])).rejects.toThrow();
  await expect(db.query('delete from public.finance_accounts where id=$1', [account])).rejects.toThrow();
  await db.query('delete from public.finance_schedules where id=$1', [id]);
  expect((await db.query('delete from public.finance_accounts where id=$1 returning id', [account])).rows).toHaveLength(1);
});
it('nega acesso anônimo', async () => {
  await db.exec('reset role; set role anon;');
  await expect(db.query('select * from public.finance_schedules')).rejects.toThrow();
});
