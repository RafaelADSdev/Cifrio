import { useState } from 'react';
import { Text, View } from 'react-native';
import { balance } from '../domain/finance';
import { accountDeleteReason } from '../domain/recurring';
import { money, parseMoney, today } from '../domain/money';
import { newId, useFinance } from '../state/FinanceProvider';
import { Button, Choices, Empty, Field, Notice, styles } from './components';

export function AccountActions() {
  const { state, mutate, busy } = useFinance();
  const [fundId, setFundId] = useState(''), [deleteId, setDeleteId] = useState(''), [amount, setAmount] = useState(''), [description, setDescription] = useState('Entrada de fundos'), [date, setDate] = useState(today()), [method, setMethod] = useState<'pix' | 'cash' | 'debit'>('pix'), [message, setMessage] = useState(''), [failed, setFailed] = useState(false);
  async function funds() {
    setMessage(''); setFailed(false);
    try {
      if (date > today()) throw new Error('Para dinheiro futuro, cadastre uma recorrência. Use hoje ou uma data anterior.');
      await mutate('entries', [{ id: newId(), kind: 'income', accountId: fundId, amount: parseMoney(amount), date, description: description.trim(), category: 'Outros', method }]);
      setFundId(''); setAmount(''); setMessage('Fundos registrados no extrato.');
    } catch (error) { setFailed(true); setMessage((error as Error).message); }
  }
  async function remove() {
    setMessage(''); setFailed(false);
    try { await mutate('account_delete', [{ id: deleteId }]); setDeleteId(''); setMessage('Conta excluída dos seus registros.'); }
    catch (error) { setFailed(true); setMessage((error as Error).message); }
  }
  return <>
    {state.accounts.map(account => <View style={[styles.line, { gap: 12 }]} key={account.id}>
      <View style={styles.row}><View style={{ flex: 1, minWidth: 140 }}><Text style={[styles.heading, { fontSize: 16 }]}>{account.name}</Text><Text style={styles.muted}>{account.bank}</Text></View><Text style={[styles.value, { fontSize: 23 }]}>{money(balance(state, account.id, today()))}</Text></View>
      <View style={[styles.row, { justifyContent: 'flex-start' }]}><Button title={`Adicionar fundos a ${account.name}`} label="Adicionar fundos" secondary icon="plus" disabled={busy} onPress={() => { setFundId(account.id); setDeleteId(''); setMessage(''); }} /><Button title={`Excluir conta ${account.name}`} label="Excluir" secondary danger icon="trash-2" disabled={busy} onPress={() => { const reason = accountDeleteReason(state, account.id); setFundId(''); setMessage(reason); setFailed(!!reason); setDeleteId(reason ? '' : account.id); }} /></View>
      {fundId === account.id && <View style={{ gap: 16 }}><Text style={styles.heading}>Entrada em {account.name}</Text><Text style={styles.muted}>Cria uma receita no extrato. Se veio de outra conta sua, registre uma transferência no Extrato para não contar como renda.</Text><Field label="Valor dos fundos (R$)" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" /><Field label="Descrição dos fundos" value={description} onChangeText={setDescription} maxLength={120} /><Field label="Data dos fundos (AAAA-MM-DD)" value={date} onChangeText={setDate} /><Choices label="Forma de entrada" value={method} options={[{ value: 'pix', label: 'Pix' }, { value: 'debit', label: 'Depósito' }, { value: 'cash', label: 'Dinheiro' }]} onChange={setMethod} /><Button title="Registrar fundos" icon="check" disabled={busy} onPress={() => void funds()} /><Button title="Cancelar entrada de fundos" secondary disabled={busy} onPress={() => setFundId('')} /></View>}
      {deleteId === account.id && <View style={{ gap: 12 }}><Notice error>Excluir {account.name} remove o cadastro e seu saldo inicial de {money(account.openingBalance)}. Isso não altera nada no banco. Só é permitido sem histórico e sem recorrências.</Notice><Button title={`Confirmar exclusão de ${account.name}`} label="Excluir esta conta" danger disabled={busy} onPress={() => void remove()} /><Button title="Cancelar exclusão" secondary disabled={busy} onPress={() => setDeleteId('')} /></View>}
    </View>)}
    {!state.accounts.length && <Empty icon="briefcase" title="Seu dinheiro começa aqui" detail="Adicione sua primeira conta abaixo, com o saldo anterior aos seus registros." />}
    {!!message && <Notice error={failed}>{message}</Notice>}
  </>;
}
