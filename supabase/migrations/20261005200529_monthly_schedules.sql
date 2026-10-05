-- Monthly templates are plans, not cash movements. Ownership is relational, never metadata-based.
create table public.finance_schedules (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  id uuid not null,
  data jsonb not null,
  account_id uuid generated always as ((data->>'accountId')::uuid) stored,
  primary key(user_id,id),
  foreign key(user_id,account_id) references public.finance_accounts(user_id,id),
  check (coalesce(jsonb_typeof(data) = 'object' and (data->>'id')::uuid = id
    and account_id is not null and data->>'kind' in ('income','expense')
    and char_length(btrim(data->>'description')) between 1 and 120
    and data->>'category' in ('Alimentação','Moradia','Transporte','Saúde','Lazer','Compras','Salário','Outros')
    and jsonb_typeof(data->'amount') = 'number' and (data->>'amount')::numeric between 1 and 100000000000
    and (data->>'amount')::numeric = trunc((data->>'amount')::numeric)
    and jsonb_typeof(data->'day') = 'number' and (data->>'day')::numeric between 1 and 31
    and (data->>'day')::numeric = trunc((data->>'day')::numeric)
    and data->>'startMonth' ~ '^20[0-9]{2}-(0[1-9]|1[0-2])$'
    and jsonb_typeof(data->'active') = 'boolean', false))
);
alter table public.finance_schedules enable row level security;
create policy owner on public.finance_schedules to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
revoke all on public.finance_schedules from anon,public;
grant select,insert,update,delete on public.finance_schedules to authenticated;
create trigger lock_owner before insert or update or delete on public.finance_schedules
for each row execute function private.lock_finance_owner();

create or replace function public.read_finance() returns jsonb language sql stable security invoker set search_path = '' as $$
  select jsonb_build_object(
    'accounts', coalesce((select jsonb_agg(data order by id) from public.finance_accounts where user_id = auth.uid()),'[]'::jsonb),
    'cards', coalesce((select jsonb_agg(data order by id) from public.finance_cards where user_id = auth.uid()),'[]'::jsonb),
    'entries', coalesce((select jsonb_agg(data order by id) from public.finance_entries where user_id = auth.uid()),'[]'::jsonb),
    'recurring', coalesce((select jsonb_agg(data order by id) from public.finance_schedules where user_id = auth.uid()),'[]'::jsonb)
  );
$$;
revoke all on function public.read_finance() from public,anon;
grant execute on function public.read_finance() to authenticated;
