create schema if not exists private;
grant usage on schema private to authenticated;

create function private.valid_entry(d jsonb) returns boolean language plpgsql immutable strict
set search_path = '' as $$
begin
  if not coalesce(
    jsonb_typeof(d) = 'object' and d->>'kind' in ('income','expense','transfer','card_purchase','card_payment')
    and d->>'method' in ('pix','debit','cash','credit')
    and jsonb_typeof(d->'description') = 'string' and jsonb_typeof(d->'category') = 'string'
    and length(trim(d->>'description')) between 1 and 160 and length(trim(d->>'category')) between 1 and 80
    and jsonb_typeof(d->'amount') = 'number' and (d->>'amount') ~ '^[0-9]+$' and (d->>'amount')::bigint between 1 and 100000000000
    and (d->>'date') ~ '^\d{4}-\d{2}-\d{2}$'
    and (d->>'date')::date is not null
    and (d->>'kind' = 'card_purchase' or d->>'accountId' is not null)
    and (d->>'kind' <> 'transfer' or (d->>'destinationId' is not null and d->>'destinationId' <> d->>'accountId'))
    and (d->>'kind' not in ('card_purchase','card_payment') or d->>'cardId' is not null)
    and (d->>'kind' <> 'card_purchase' or (jsonb_typeof(d->'installments') = 'number' and (d->>'installments') ~ '^[0-9]+$' and (d->>'installments')::int between 1 and 48 and (d->>'installments')::int <= (d->>'amount')::bigint))
    and (d->>'kind' <> 'card_payment' or (d->>'statementMonth') ~ '^\d{4}-(0[1-9]|1[0-2])$'), false)
  then return false; end if;
  return true;
exception when others then return false;
end;
$$;

create table public.finance_accounts (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  data jsonb not null,
  unique(user_id,id),
  check (coalesce(data->>'id' = id::text and jsonb_typeof(data->'name') = 'string' and jsonb_typeof(data->'bank') = 'string' and length(trim(data->>'name')) between 1 and 80 and length(trim(data->>'bank')) between 1 and 80
    and jsonb_typeof(data->'openingBalance') = 'number' and (data->>'openingBalance') ~ '^-?[0-9]+$' and abs((data->>'openingBalance')::bigint) <= 100000000000, false))
);
create table public.finance_cards (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  data jsonb not null,
  unique(user_id,id),
  check (coalesce(data->>'id' = id::text and jsonb_typeof(data->'name') = 'string' and length(trim(data->>'name')) between 1 and 80
    and jsonb_typeof(data->'closingDay') = 'number' and (data->>'closingDay') ~ '^[0-9]+$' and (data->>'closingDay')::int between 1 and 28
    and jsonb_typeof(data->'dueDay') = 'number' and (data->>'dueDay') ~ '^[0-9]+$' and (data->>'dueDay')::int between 1 and 28
    and jsonb_typeof(data->'limit') = 'number' and (data->>'limit') ~ '^[0-9]+$' and (data->>'limit')::bigint between 1 and 100000000000, false))
);
create table public.finance_entries (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  data jsonb not null check (coalesce(data->>'id' = id::text and private.valid_entry(data),false)),
  account_id uuid generated always as ((data->>'accountId')::uuid) stored,
  destination_id uuid generated always as ((data->>'destinationId')::uuid) stored,
  card_id uuid generated always as ((data->>'cardId')::uuid) stored,
  source_key text generated always as (data->>'sourceKey') stored,
  foreign key(user_id,account_id) references public.finance_accounts(user_id,id),
  foreign key(user_id,destination_id) references public.finance_accounts(user_id,id),
  foreign key(user_id,card_id) references public.finance_cards(user_id,id),
  unique(user_id,account_id,source_key)
);
create table public.finance_operations (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  id uuid not null,
  primary key(user_id,id)
);

alter table public.finance_accounts enable row level security;
alter table public.finance_cards enable row level security;
alter table public.finance_entries enable row level security;
alter table public.finance_operations enable row level security;
create policy owner on public.finance_accounts to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy owner on public.finance_cards to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy owner on public.finance_entries to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy owner on public.finance_operations to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
revoke all on public.finance_accounts,public.finance_cards,public.finance_entries,public.finance_operations from anon,public;
grant select,insert,update,delete on public.finance_accounts,public.finance_cards,public.finance_entries to authenticated;
grant select,insert on public.finance_operations to authenticated;

-- Serializes all mutations for one owner, including direct Data API writes.
create function private.lock_finance_owner() returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(auth.uid()::text,0));
  if tg_op = 'DELETE' then return old; end if;
  return new;
end; $$;
create trigger lock_owner before insert or update or delete on public.finance_accounts for each row execute function private.lock_finance_owner();
create trigger lock_owner before insert or update or delete on public.finance_cards for each row execute function private.lock_finance_owner();
create trigger lock_owner before insert or update or delete on public.finance_entries for each row execute function private.lock_finance_owner();

-- Deferred: a batch is validated as a whole, so purchase + payment is atomic.
create function private.assert_statement_totals() returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if exists (
    with purchases as (
      select e.card_id,
        to_char(date_trunc('month',(e.data->>'date')::date) + make_interval(months => n.i + case when extract(day from (e.data->>'date')::date) >= (c.data->>'closingDay')::int then 1 else 0 end),'YYYY-MM') as month,
        (e.data->>'amount')::bigint / (e.data->>'installments')::int + case when n.i < (e.data->>'amount')::bigint % (e.data->>'installments')::int then 1 else 0 end as amount
      from public.finance_entries e join public.finance_cards c on c.id = e.card_id and c.user_id = e.user_id
      cross join lateral generate_series(0,(e.data->>'installments')::int-1) as n(i)
      where e.user_id = auth.uid() and e.data->>'kind' = 'card_purchase'
    ), totals as (select card_id,month,sum(amount) as total from purchases group by card_id,month),
    payments as (select card_id,data->>'statementMonth' as month,sum((data->>'amount')::bigint) as paid from public.finance_entries where user_id = auth.uid() and data->>'kind' = 'card_payment' group by card_id,data->>'statementMonth')
    select 1 from payments p left join totals t on t.card_id = p.card_id and t.month = p.month where p.paid > coalesce(t.total,0)
  ) then raise exception 'Statement overpayment: adjust payment first'; end if;
  return null;
end; $$;
create constraint trigger statement_totals after insert or update or delete on public.finance_entries deferrable initially deferred for each row execute function private.assert_statement_totals();
create constraint trigger statement_totals after update or delete on public.finance_cards deferrable initially deferred for each row execute function private.assert_statement_totals();

create function public.mutate_finance(p_action text,p_records jsonb,p_operation_id uuid) returns void language plpgsql security invoker set search_path = '' as $$
declare d jsonb;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_operation_id is null or jsonb_typeof(p_records) <> 'array' or jsonb_array_length(p_records) not between 1 and 500 then raise exception 'Invalid batch'; end if;
  if p_action not in ('account','card','entries','edit','delete') then raise exception 'Invalid action'; end if;
  if p_action <> 'entries' and jsonb_array_length(p_records) <> 1 then raise exception 'Single record required'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(auth.uid()::text,0));
  if exists(select 1 from public.finance_operations where user_id = auth.uid() and id = p_operation_id) then return; end if;
  for d in select value from jsonb_array_elements(p_records) loop
    if p_action = 'account' then
      insert into public.finance_accounts(id,data) values ((d->>'id')::uuid,d);
    elsif p_action = 'card' then
      insert into public.finance_cards(id,data) values ((d->>'id')::uuid,d);
    elsif p_action = 'entries' then
      insert into public.finance_entries(id,data) values ((d->>'id')::uuid,d) on conflict do nothing;
    elsif p_action = 'edit' then
      update public.finance_entries set data = d where id = (d->>'id')::uuid and user_id = auth.uid();
      if not found then raise exception 'Entry not found'; end if;
    elsif p_action = 'delete' then
      delete from public.finance_entries where id = (d->>'id')::uuid and user_id = auth.uid();
      if not found then raise exception 'Entry not found'; end if;
    end if;
  end loop;
  insert into public.finance_operations(id) values(p_operation_id);
end; $$;
revoke all on function public.mutate_finance(text,jsonb,uuid) from public,anon;
grant execute on function public.mutate_finance(text,jsonb,uuid) to authenticated;
revoke all on function private.valid_entry(jsonb),private.lock_finance_owner(),private.assert_statement_totals() from public;
grant execute on function private.valid_entry(jsonb),private.lock_finance_owner(),private.assert_statement_totals() to authenticated;

-- One MVCC snapshot, without Data API row-limit truncation of the ledger.
create function public.read_finance() returns jsonb language sql stable security invoker set search_path = '' as $$
  select jsonb_build_object(
    'accounts', coalesce((select jsonb_agg(data order by id) from public.finance_accounts where user_id = auth.uid()),'[]'::jsonb),
    'cards', coalesce((select jsonb_agg(data order by id) from public.finance_cards where user_id = auth.uid()),'[]'::jsonb),
    'entries', coalesce((select jsonb_agg(data order by id) from public.finance_entries where user_id = auth.uid()),'[]'::jsonb)
  );
$$;
revoke all on function public.read_finance() from public,anon;
grant execute on function public.read_finance() to authenticated;
