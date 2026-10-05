import { useState } from 'react';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { statement } from '../../domain/finance';
import { addMonth, money, parseMoney, today } from '../../domain/money';
import { newId, useFinance } from '../../state/FinanceProvider';
import { Box, Button, Field, Notice, Page, styles } from '../../ui/components';
export default function Cards() {
  const { state, mutate, busy } = useFinance();
  const [month, setMonth] = useState(today().slice(0, 7)), [name, setName] = useState(''), [limit, setLimit] = useState(''), [closing, setClosing] = useState('10'), [due, setDue] = useState('17'), [message, setMessage] = useState('');
  async function save() { setMessage(''); try { await mutate('card', [{ id: newId(), name: name.trim(), limit: parseMoney(limit), closingDay: Number(closing), dueDay: Number(due) }]); setName(''); setLimit(''); setMessage('Cartão adicionado.'); } catch (e) { setMessage((e as Error).message); } }
  return <Page title="Cartões" subtitle="Veja o que já está comprometido.">
    <View style={styles.row}><Button title="Fatura anterior" secondary onPress={() => setMonth(addMonth(month, -1))} /><Text style={styles.text}>{month}</Text><Button title="Próxima fatura" secondary onPress={() => setMonth(addMonth(month, 1))} /></View>
    <Notice>Faturas estimadas a partir das compras registradas. Compras na data de fechamento entram no próximo mês; vencimento no mês seguinte se o dia for anterior ou igual ao fechamento.</Notice>
    {state.cards.map(card => { const bill = statement(state, card.id, month); return <Box key={card.id} title={card.name}>
      <Text style={styles.muted}>Fatura estimada · fecha dia {card.closingDay} · vence dia {card.dueDay}{card.dueDay <= card.closingDay ? ' do mês seguinte' : ''}</Text><Text style={styles.value}>{money(bill.remaining)} em aberto</Text>
      <View style={styles.row}><Text style={styles.muted}>Total {money(bill.total)}</Text><Text style={styles.muted}>Pago {money(bill.paid)}</Text><Text style={styles.muted}>Limite cadastrado {money(card.limit)}</Text></View>
      {bill.items.map(item => <View key={`${item.entry.id}-${item.index}`} style={styles.row}><Text style={styles.text}>{item.entry.description} · {item.index}/{item.count}</Text><Text style={styles.text}>{money(item.amount)}</Text></View>)}
      {!bill.items.length && <Text style={styles.muted}>Nenhuma compra nesta fatura.</Text>}
      <Button title={`Registrar compra em ${card.name}`} onPress={() => router.push({ pathname: '/entry', params: { kind: 'card_purchase', cardId: card.id } })} />
      {!!bill.remaining && <Button title={`Pagar fatura de ${card.name}`} secondary disabled={!state.accounts.length || busy} onPress={() => router.push({ pathname: '/entry', params: { kind: 'card_payment', cardId: card.id, month } })} />}
    </Box>; })}
    <Box title="Adicionar cartão"><Field label="Nome do cartão" value={name} onChangeText={setName} maxLength={80} /><Field label="Limite cadastrado (R$)" value={limit} onChangeText={setLimit} keyboardType="decimal-pad" /><Field label="Dia de fechamento (1 a 28)" value={closing} onChangeText={setClosing} keyboardType="number-pad" /><Field label="Dia de vencimento (1 a 28)" value={due} onChangeText={setDue} keyboardType="number-pad" /><Text style={styles.muted}>Cadastre apenas o nome de identificação. Não precisamos do número, CVV ou senha do cartão.</Text><Button title="Salvar cartão" disabled={busy} onPress={() => void save()} /></Box>
    {!!message && <Notice>{message}</Notice>}
  </Page>;
}
