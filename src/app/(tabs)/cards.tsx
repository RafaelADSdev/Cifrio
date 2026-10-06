import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { statement } from '../../domain/finance';
import { addMonth, money, parseMoney, today } from '../../domain/money';
import { InstallmentAgendaCalendar } from '../../ui/InstallmentAgendaCalendar';
import { newId, useFinance } from '../../state/FinanceProvider';
import { Box, Button, Choices, Empty, Field, MonthPicker, Notice, Page, styles } from '../../ui/components';
import { CardActions } from '../../ui/CardActions';
import { CardNetwork, CardTheme } from '../../domain/model';
import { CardAppearanceFields, CardVisual } from '../../ui/CardVisual';
export default function Cards() {
  const { state, mutate, busy } = useFinance();
  const { cardId } = useLocalSearchParams<{ cardId?: string }>();
  const active = state.cards.find(card => card.id === cardId) ?? state.cards[0];
  const [month, setMonth] = useState(today().slice(0, 7)), [name, setName] = useState(''), [limit, setLimit] = useState(''), [closing, setClosing] = useState('10'), [due, setDue] = useState('17'), [message, setMessage] = useState('');
  const [network, setNetwork] = useState<CardNetwork>('none'), [theme, setTheme] = useState<CardTheme>('forest'), [lastFour, setLastFour] = useState(''), [adding, setAdding] = useState(!state.cards.length);
  async function save() { setMessage(''); try { const id = newId(); await mutate('card', [{ id, name: name.trim(), limit: parseMoney(limit), closingDay: Number(closing), dueDay: Number(due), network, theme, lastFour: lastFour.trim() }]); router.setParams({ cardId: id }); setName(''); setLimit(''); setLastFour(''); setAdding(false); setMessage('Cartão adicionado.'); } catch (e) { setMessage((e as Error).message); } }
  return <Page title="Cartões" subtitle="Veja o que já está comprometido." compact>
    <MonthPicker month={month} previous={() => setMonth(addMonth(month, -1))} next={() => setMonth(addMonth(month, 1))} labelPrevious="Fatura anterior" labelNext="Próxima fatura" />
    <Button title={adding ? 'Fechar cadastro de cartão' : 'Adicionar cartão'} secondary icon={adding ? 'x' : 'plus'} onPress={() => setAdding(current => !current)} />
    {state.cards.length > 1 && <Choices label="Selecionar cartão" value={active?.id ?? ''} options={state.cards.map(card => ({ value: card.id, label: card.name }))} onChange={id => router.setParams({ cardId: id })} />}
    {!state.cards.length && <Empty icon="credit-card" title="Uma visão de cada compromisso" detail="Adicione um cartão abaixo. Não precisamos de número, CVV ou senha." />}
    {(active ? [active] : []).map(card => { const bill = statement(state, card.id, month); return <Box key={card.id} title={card.name}>
      <CardVisual card={card} remaining={bill.remaining} />
      <Text style={styles.muted}>Fecha dia {card.closingDay} · vence dia {card.dueDay}{card.dueDay <= card.closingDay ? ' do mês seguinte' : ''}</Text>
      <View style={styles.row}><Text style={styles.muted}>Total {money(bill.total)}</Text><Text style={styles.muted}>Pago {money(bill.paid)}</Text><Text style={styles.muted}>Limite cadastrado {money(card.limit)}</Text></View>
      {bill.items.map(item => <View key={`${item.entry.id}-${item.index}`} style={[styles.line, styles.row]}><Text style={[styles.text, { flex: 1 }]}>{item.entry.description} · {item.index}/{item.count}</Text><Text style={styles.text}>{money(item.amount)}</Text></View>)}
      {!bill.items.length && <Text style={styles.muted}>Nenhuma compra nesta fatura.</Text>}
      <Button title={`Registrar compra em ${card.name}`} label="Registrar compra" icon="plus" onPress={() => router.push({ pathname: '/entry', params: { kind: 'card_purchase', cardId: card.id } })} />
      {!!bill.remaining && <Button title={`Pagar fatura de ${card.name}`} label="Registrar pagamento" icon="check" secondary disabled={!state.accounts.length || busy} onPress={() => router.push({ pathname: '/entry', params: { kind: 'card_payment', cardId: card.id, month } })} />}
      <CardActions card={card} />
    </Box>; })}
    <InstallmentAgendaCalendar state={state} />
    {adding && <Box title="Adicionar cartão"><Field label="Nome do cartão" value={name} onChangeText={setName} maxLength={80} /><Field label="Limite cadastrado (R$)" value={limit} onChangeText={setLimit} keyboardType="decimal-pad" /><Field label="Dia de fechamento (1 a 28)" value={closing} onChangeText={setClosing} keyboardType="number-pad" /><Field label="Dia de vencimento (1 a 28)" value={due} onChangeText={setDue} keyboardType="number-pad" /><CardAppearanceFields network={network} theme={theme} lastFour={lastFour} onNetwork={setNetwork} onTheme={setTheme} onLastFour={setLastFour} /><Text style={styles.muted}>Bandeira e final são opcionais. Não informe número completo, CVV ou senha do cartão.</Text><Button title="Salvar cartão" disabled={busy} onPress={() => void save()} /></Box>}
    {!!message && <Notice>{message}</Notice>}
    <Notice>Faturas estimadas a partir das compras registradas. Compras na data de fechamento entram no próximo mês; vencimento no mês seguinte se o dia for anterior ou igual ao fechamento.</Notice>
  </Page>;
}
