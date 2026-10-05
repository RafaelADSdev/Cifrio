import { FinanceState } from '../domain/model';
import { Operation } from '../domain/operations';
import { supabase } from './supabase';
export async function loadRemote(): Promise<FinanceState> {
  if (!supabase) throw new Error('Supabase não configurado.');
  const { data, error } = await supabase.rpc('read_finance');
  if (error || !data) throw new Error('Não foi possível carregar os dados. Confira a configuração e a migração do projeto.');
  return data as FinanceState;
}
export async function saveRemote(operation: Operation) {
  if (!supabase) throw new Error('Supabase não configurado.');
  if (operation.action === 'account_delete' || operation.action === 'recurring_delete') {
    const id = (operation.records[0] as { id: string }).id;
    const table = operation.action === 'account_delete' ? 'finance_accounts' : 'finance_schedules';
    const { data, error } = await supabase.from(table).delete().eq('id', id).select('id');
    if (error || !data?.length) throw new Error('Não foi possível excluir. Atualize os dados; confira vínculos, permissões e a migração de recorrências.');
    return;
  }
  if (operation.action === 'recurring') {
    const item = operation.records[0] as { id: string };
    const { data, error } = await supabase.from('finance_schedules').upsert({ id: item.id, data: item }, { onConflict: 'user_id,id' }).select('id');
    if (error || !data?.length) throw new Error('Não foi possível salvar a recorrência. Confira a conexão e aplique a migração de recorrências no Supabase.');
    return;
  }
  const { error } = await supabase.rpc('mutate_finance', { p_action: operation.action, p_records: operation.records, p_operation_id: operation.id });
  if (error) throw new Error('Não foi possível salvar. Confira os dados, a conexão e as permissões do projeto.');
}
