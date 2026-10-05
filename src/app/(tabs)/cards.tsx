import { useState } from 'react';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { statement } from '../../domain/finance';
import { addMonth, money, monthLabel, parseMoney, today } from '../../domain/money';
import { installmentAgenda } from '../../domain/planning';
import { newId, useFinance } from '../../state/FinanceProvider';
import { Box, Button, colors, Empty, Field, fonts, Icon, MonthPicker, Notice, Page, styles } from '../../ui/components';
export default function Cards() {
  const { state, mutate, busy } = useFinance();
  const [month, setMonth] = useState(today().slice(0, 7)), [name, setName] = useState(''), [limit, setLimit] = useState(''), [closing, setClosing] = useState('10'), [due, setDue] = useState('17'), [message, setMessage] = useState('');
  const ahead = installmentAgenda(state, addMonth(month, 1), 6).filter(row => row.remaining > 0);
  async function save() { setMessage(''); try { await mutate('card', [{ id: newId(), name: name.trim(), limit: parseMoney(limit), closingDay: Number(closing), dueDay: Number(due) }]); setName(''); setLimit(''); setMessage('Cartão adicionado.'); } catch (e) { setMessage((e as Error).message); } }
  return <Page title="Cartões" subtitle="Veja o que já está comprometido.">
    <MonthPicker month={month} previous={() => setMonth(addMonth(month, -1))} next={() => setMonth(addMonth(month, 1))} labelPrevious="Fatura anterior" labelNext="Próxima fatura" />
    {!state.cards.length && <Empty icon="credit-card" title="Uma visão de cada compromisso" detail="Adicione um cartão abaixo. Não precisamos de número, CVV ou senha." />}
    {state.cards.map(card => { const bill = statement(state, card.id, month); return <Box key={card.id} title={card.name}>
      <View style={{ backgroundColor: colors.dark, borderRadius: 12, padding: 24, gap: 20 }}><View style={styles.row}><Text style={{ fontFamily: fonts.medium, color: colors.mutedDark, fontSize: 13 }}>Fatura estimada</Text><Icon name="credit-card" size={26} color={colors.accent} /></View><Text style={[styles.value, { color: colors.onDark }]}>{money(bill.remaining)} em aberto</Text><Text style={{ fontFamily: fonts.regular, color: colors.mutedDark, fontSize: 12, lineHeight: 20 }}>Fecha dia {card.closingDay} · vence dia {card.dueDay}{card.dueDay <= card.closingDay ? ' do mês seguinte' : ''}</Text></View>
      <View style={styles.row}><Text style={styles.muted}>Total {money(bill.total)}</Text><Text style={styles.muted}>Pago {money(bill.paid)}</Text><Text style={styles.muted}>Limite cadastrado {money(card.limit)}</Text></View>
      {bill.items.map(item => <View key={`${item.entry.id}-${item.index}`} style={[styles.line, styles.row]}><Text style={[styles.text, { flex: 1 }]}>{item.entry.description} · {item.index}/{item.count}</Text><Text style={styles.text}>{money(item.amount)}</Text></View>)}
      {!bill.items.length && <Text style={styles.muted}>Nenhuma compra nesta fatura.</Text>}
      <Button title={`Registrar compra em ${card.name}`} label="Registrar compra" icon="plus" onPress={() => router.push({ pathname: '/entry', params: { kind: 'card_purchase', cardId: card.id } })} />
      {!!bill.remaining && <Button title={`Pagar fatura de ${card.name}`} label="Registrar pagamento" icon="check" secondary disabled={!state.accounts.length || busy} onPress={() => router.push({ pathname: '/entry', params: { kind: 'card_payment', cardId: card.id, month } })} />}
    </Box>; })}
    <Box title="Agenda de parcelas">
      {ahead.map(row => <View key={row.month} style={{ gap: 8 }}><View style={styles.row}><Text style={[styles.text, { fontFamily: fonts.bold, textTransform: 'capitalize' }]}>{monthLabel(row.month)}</Text><Text style={[styles.text, { fontFamily: fonts.bold }]}>{money(row.remaining)} em aberto</Text></View>{row.items.map(item => <View key={`${item.entryId}-${item.index}`} style={[styles.line, styles.row]}><Text style={[styles.text, { flex: 1 }]}>{item.cardName} · {item.description} · {item.index}/{item.count}</Text><Text style={styles.text}>{money(item.amount)}</Text></View>)}</View>)}
      {!ahead.length && <Text style={styles.muted}>Nenhuma parcela nos próximos meses.</Text>}
      <Text style={styles.muted}>Cada linha é a parcela daquela fatura. O valor em aberto desconta o que você já registrou como pago.</Text>
    </Box>
    <Box title="Adicionar cartão"><Field label="Nome do cartão" value={name} onChangeText={setName} maxLength={80} /><Field label="Limite cadastrado (R$)" value={limit} onChangeText={setLimit} keyboardType="decimal-pad" /><Field label="Dia de fechamento (1 a 28)" value={closing} onChangeText={setClosing} keyboardType="number-pad" /><Field label="Dia de vencimento (1 a 28)" value={due} onChangeText={setDue} keyboardType="number-pad" /><Text style={styles.muted}>Cadastre apenas o nome de identificação. Não precisamos do número, CVV ou senha do cartão.</Text><Button title="Salvar cartão" disabled={busy} onPress={() => void save()} /></Box>
    {!!message && <Notice>{message}</Notice>}
    <Notice>Faturas estimadas a partir das compras registradas. Compras na data de fechamento entram no próximo mês; vencimento no mês seguinte se o dia for anterior ou igual ao fechamento.</Notice>
  </Page>;
}
