create or replace function public.mutate_finance(p_action text,p_records jsonb,p_operation_id uuid) returns void language plpgsql security invoker set search_path = '' as $$
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
      insert into public.finance_accounts(id,data) values ((d->>'id')::uuid,d)
      on conflict (id) do update set data = excluded.data where public.finance_accounts.user_id = auth.uid();
    elsif p_action = 'card' then
      insert into public.finance_cards(id,data) values ((d->>'id')::uuid,d)
      on conflict (id) do update set data = excluded.data where public.finance_cards.user_id = auth.uid();
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
