import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { beforeAll, afterAll, expect, it } from 'vitest';
let db: PGlite;
const A = '00000000-0000-4000-8000-000000000001', B = '00000000-0000-4000-8000-000000000002';
const accountA = '10000000-0000-4000-8000-000000000001', accountB = '10000000-0000-4000-8000-000000000002';
async function owner(id: string) { await db.exec(`reset role; set role authenticated; set request.jwt.claim.sub = '${id}';`); }
async function mutate(action: string, records: unknown[], operation = randomUUID()) { await db.query('select public.mutate_finance($1,$2::jsonb,$3::uuid)', [action, JSON.stringify(records), operation]); }
beforeAll(async () => {
  db = new PGlite();
  await db.exec(`create role authenticated; create role anon; create schema auth; create table auth.users(id uuid primary key); insert into auth.users values ('${A}'),('${B}'); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema auth,public to authenticated,anon; grant execute on function auth.uid() to authenticated,anon;`);
  await db.exec(readFileSync('supabase/migrations/20261005151013_financial_core.sql', 'utf8'));
  await owner(A); await mutate('account', [{ id: accountA, name: 'BB', bank: 'BB', openingBalance: 100000 }]);
  await owner(B); await mutate('account', [{ id: accountB, name: 'Inter', bank: 'Inter', openingBalance: 0 }]);
}, 30000);
afterAll(async () => { await db.close(); });
it('RLS hides other owners and blocks owner reassignment', async () => {
  await owner(A);
  expect((await db.query('select id from public.finance_accounts')).rows).toEqual([{ id: accountA }]);
  await expect(db.query('update public.finance_accounts set user_id=$1 where id=$2', [B, accountA])).rejects.toThrow();
});
it('foreign keys block cross-owner references even with valid IDs', async () => {
  await owner(A);
  await expect(mutate('entries', [{ id: randomUUID(), kind: 'expense', accountId: accountB, amount: 100, description: 'Bad', category: 'Outros', date: '2026-10-01', method: 'pix' }])).rejects.toThrow();
});
it('snapshot returns only the authenticated owner data', async () => {
  await owner(B);
  const result = await db.query<{ state: { accounts: { id: string }[]; entries: unknown[] } }>('select public.read_finance() as state');
  expect(result.rows[0].state.accounts.map(a => a.id)).toEqual([accountB]);
  expect(result.rows[0].state.entries).toHaveLength(0);
});
it('batch failure rolls back all rows', async () => {
  await owner(A); const id = randomUUID();
  await expect(mutate('entries', [{ id, kind: 'expense', accountId: accountA, amount: 100, description: 'Good', category: 'Outros', date: '2026-10-01', method: 'pix' }, { id: randomUUID(), kind: 'expense', accountId: accountA, amount: -1 }])).rejects.toThrow();
  expect((await db.query('select id from public.finance_entries where id=$1', [id])).rows).toHaveLength(0);
});
it('direct writes reject missing identity and string amounts', async () => {
  await owner(A);
  const data = { kind: 'expense', accountId: accountA, amount: 100, description: 'Compra', category: 'Outros', date: '2026-10-01', method: 'pix' };
  await expect(db.query('insert into public.finance_entries(id,data) values ($1,$2::jsonb)', [randomUUID(), JSON.stringify(data)])).rejects.toThrow();
  await expect(mutate('entries', [{ ...data, id: randomUUID(), amount: '100' }])).rejects.toThrow();
});
it('operation retries and source IDs do not duplicate records', async () => {
  await owner(A); const op = randomUUID(), e = { id: randomUUID(), kind: 'expense', accountId: accountA, amount: 100, description: 'Compra', category: 'Outros', date: '2026-10-01', method: 'pix', sourceKey: 'ofx:stable' };
  await mutate('entries', [e], op); await mutate('entries', [e], op); await mutate('entries', [{ ...e, id: randomUUID() }]);
  expect((await db.query('select id from public.finance_entries where source_key=$1', ['ofx:stable'])).rows).toHaveLength(1);
});
it('database enforces invoice invariants on direct writes and deletes', async () => {
  await owner(A); const cardId = randomUUID(), purchase = randomUUID();
  await mutate('card', [{ id: cardId, name: 'Cartão', limit: 100000, closingDay: 10, dueDay: 17 }]);
  await mutate('entries', [{ id: purchase, kind: 'card_purchase', cardId, amount: 10000, installments: 3, description: 'Compra', category: 'Outros', date: '2026-10-01', method: 'credit' }]);
  const payment = { id: randomUUID(), kind: 'card_payment', accountId: accountA, cardId, amount: 3334, statementMonth: '2026-10', description: 'Pagamento', category: 'Outros', date: '2026-10-01', method: 'pix' };
  await mutate('entries', [payment]);
  await expect(db.query('insert into public.finance_entries(id,data) values ($1,$2::jsonb)', [(payment.id = randomUUID()), JSON.stringify({ ...payment, amount: 1 })])).rejects.toThrow();
  await expect(mutate('delete', [{ id: purchase }])).rejects.toThrow();
});
it('anonymous users cannot read finance tables or call mutations', async () => {
  await db.exec('reset role; set role anon;');
  await expect(db.query('select * from public.finance_accounts')).rejects.toThrow();
  await expect(mutate('account', [])).rejects.toThrow();
});
