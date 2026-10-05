import { useState } from 'react';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { money } from '../../domain/money';
import { useFinance } from '../../state/FinanceProvider';
import { Box, Button, Choices, Field, Notice, Page, styles } from '../../ui/components';
const labels = { income: 'Receita', expense: 'Despesa', transfer: 'Transferência', card_purchase: 'Compra no cartão', card_payment: 'Pagamento de fatura' };
export default function Transactions() {
  const { state, mutate, busy } = useFinance();
  const [search, setSearch] = useState(''), [account, setAccount] = useState('all'), [confirm, setConfirm] = useState(''), [message, setMessage] = useState('');
  const entries = state.entries.filter(e => (account === 'all' || e.accountId === account || e.destinationId === account) && `${e.description} ${e.category} ${e.method} ${e.date}`.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR'))).sort((a, b) => b.date.localeCompare(a.date));
  async function remove(id: string) { try { await mutate('delete', [{ id }]); setConfirm(''); setMessage('Movimentação excluída.'); } catch (e) { setMessage((e as Error).message); } }
  return <Page title="Movimentações" subtitle="Cada registro conta uma parte da história.">
    <Button title="Nova movimentação" onPress={() => router.push('/entry')} />
    <Field label="Buscar movimentações" value={search} onChangeText={setSearch} placeholder="Descrição, categoria, Pix ou data" />
    <Choices label="Conta" value={account} onChange={setAccount} options={[{ value: 'all', label: 'Todas' }, ...state.accounts.map(a => ({ value: a.id, label: a.name }))]} />
    {!!message && <Notice>{message}</Notice>}
    {!entries.length && <Box title="Nenhum registro encontrado"><Text style={styles.muted}>Adicione uma movimentação ou importe um extrato.</Text></Box>}
    {entries.map(entry => <Box key={entry.id}><View style={styles.row}><View style={{ flex: 1 }}><Text style={styles.heading}>{entry.description}</Text><Text style={styles.muted}>{entry.date.split('-').reverse().join('/')} · {labels[entry.kind]}</Text><Text style={styles.muted}>{state.accounts.find(a => a.id === entry.accountId)?.name ?? state.cards.find(c => c.id === entry.cardId)?.name} · {entry.category} · {entry.method.toUpperCase()}</Text>{entry.source && <Text style={styles.muted}>Origem: {entry.source}</Text>}</View><Text style={[styles.heading, { fontVariant: ['tabular-nums'] }]}>{entry.kind === 'income' ? '+' : entry.kind === 'transfer' ? '↔ ' : '−'}{money(entry.amount)}</Text></View>
      {confirm === entry.id ? <><Notice>Excluir “{entry.description}”? Os saldos serão recalculados.</Notice><View style={styles.row}><Button title="Confirmar exclusão" disabled={busy} onPress={() => void remove(entry.id)} /><Button title="Cancelar" secondary onPress={() => setConfirm('')} /></View></> : <View style={styles.row}><Button title={`Editar ${entry.description}`} secondary onPress={() => router.push({ pathname: '/entry', params: { id: entry.id } })} /><Button title={`Excluir ${entry.description}`} secondary disabled={busy} onPress={() => setConfirm(entry.id)} /></View>}
    </Box>)}
  </Page>;
}
