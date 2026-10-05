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
  const { error } = await supabase.rpc('mutate_finance', { p_action: operation.action, p_records: operation.records, p_operation_id: operation.id });
  if (error) throw new Error('Não foi possível salvar. Confira os dados, a conexão e as permissões do projeto.');
}
