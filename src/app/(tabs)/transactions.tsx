import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { money, monthLabel, today } from '../../domain/money';
import { entryLabels as labels, filterEntries } from '../../domain/insights';
import { useFinance } from '../../state/FinanceProvider';
import { Box, Button, Choices, colors, Empty, Field, fonts, Icon, Notice, Page, styles } from '../../ui/components';

export default function Transactions() {
  const { state, mutate, busy } = useFinance();
  const [search, setSearch] = useState(''), [account, setAccount] = useState('all'), [confirm, setConfirm] = useState(''), [message, setMessage] = useState('');
  const params = useLocalSearchParams<{ month?: string }>();
  const validMonth = params.month && /^\d{4}-(0[1-9]|1[0-2])$/.test(params.month) ? params.month : undefined;
  const [period, setPeriod] = useState(validMonth ?? 'all'), [kind, setKind] = useState('all'), [card, setCard] = useState('all');
  useEffect(() => { setPeriod(validMonth ?? 'all'); }, [validMonth]);
  const months = [...new Set([today().slice(0, 7), ...(validMonth ? [validMonth] : []), ...state.entries.map(entry => entry.date.slice(0, 7))])].sort().reverse();
  const entries = filterEntries(state, { search, account, card, kind, month: period });
  async function remove(id: string) { try { await mutate('delete', [{ id }]); setConfirm(''); setMessage('Movimentação excluída.'); } catch (e) { setMessage((e as Error).message); } }
  return <Page title="Movimentações" subtitle="Cada registro conta uma parte da história.">
    <Button title="Nova movimentação" icon="plus" onPress={() => router.push('/entry')} />
    <Field label="Buscar movimentações" value={search} onChangeText={setSearch} placeholder="Descrição, categoria, Pix ou data" />
    <Choices label="Conta" value={account} onChange={setAccount} options={[{ value: 'all', label: 'Todas' }, ...state.accounts.map(a => ({ value: a.id, label: a.name }))]} />
    <Choices label="Período" value={period} onChange={setPeriod} options={[{ value: 'all', label: 'Todo o histórico' }, ...months.map(month => ({ value: month, label: monthLabel(month) }))]} />
    <Choices label="Tipo de movimentação" value={kind} onChange={setKind} options={[{ value: 'all', label: 'Todos os tipos' }, ...Object.entries(labels).map(([value, label]) => ({ value, label }))]} />
    {state.cards.length > 0 && <Choices label="Cartão do filtro" value={card} onChange={setCard} options={[{ value: 'all', label: 'Todos os cartões' }, ...state.cards.map(item => ({ value: item.id, label: item.name }))]} />}
    {(search || account !== 'all' || period !== 'all' || kind !== 'all' || card !== 'all') && <Button title="Limpar filtros" secondary icon="x" onPress={() => { setSearch(''); setAccount('all'); setPeriod('all'); setKind('all'); setCard('all'); }} />}
    {!!message && <Notice>{message}</Notice>}
    {!entries.length && <Box><Empty icon="list" title="Nenhum registro encontrado" detail="Adicione uma movimentação ou importe um extrato. Seus registros aparecerão aqui." /></Box>}
    {!!entries.length && <Box><Text style={styles.muted}>{entries.length} {entries.length === 1 ? 'movimentação encontrada' : 'movimentações encontradas'}</Text>{entries.map(entry => <View key={entry.id} style={[styles.line, { gap: 14 }]}><View style={[styles.row, { alignItems: 'flex-start' }]}><View style={{ flexDirection: 'row', gap: 12, flex: 1, minWidth: 150 }}><View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.pale, alignItems: 'center', justifyContent: 'center' }}><Icon name={entry.kind === 'income' ? 'arrow-down-left' : entry.kind === 'transfer' ? 'repeat' : entry.kind === 'card_purchase' ? 'credit-card' : 'arrow-up-right'} size={18} color={entry.kind === 'income' ? colors.primary : colors.muted} /></View><View style={{ flex: 1 }}><Text style={[styles.text, { fontFamily: fonts.bold }]}>{entry.description}</Text><Text style={styles.muted}>{entry.date.split('-').reverse().join('/')} · {labels[entry.kind]}</Text><Text style={styles.muted}>{state.accounts.find(a => a.id === entry.accountId)?.name ?? state.cards.find(c => c.id === entry.cardId)?.name} · {entry.category} · {entry.method.toUpperCase()}</Text>{entry.source && <Text style={styles.muted}>Origem: {entry.source}</Text>}</View></View><Text style={[styles.heading, { color: entry.kind === 'income' ? colors.primary : colors.ink, fontSize: 16, fontVariant: ['tabular-nums'] }]}>{entry.kind === 'income' ? '+' : entry.kind === 'transfer' ? '' : '−'}{money(entry.amount)}</Text></View>
      {confirm === entry.id ? <><Notice>Excluir “{entry.description}”? Os saldos serão recalculados.</Notice><View style={styles.row}><Button title="Confirmar exclusão" danger disabled={busy} onPress={() => void remove(entry.id)} /><Button title="Cancelar" secondary onPress={() => setConfirm('')} /></View></> : <View style={[styles.row, { justifyContent: 'flex-end', gap: 16 }]}><Button title={`Editar ${entry.description}`} label="Editar" icon="edit-2" secondary onPress={() => router.push({ pathname: '/entry', params: { id: entry.id } })} /><Button title={`Excluir ${entry.description}`} label="Excluir" icon="trash-2" danger disabled={busy} onPress={() => setConfirm(entry.id)} /></View>}
    </View>)}</Box>}
  </Page>;
}
