import { useState } from 'react';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { balance, monthlySummary, statement } from '../../domain/finance';
import { addMonth, money, today } from '../../domain/money';
import { useFinance } from '../../state/FinanceProvider';
import { Box, Button, Notice, Page, styles } from '../../ui/components';
export default function Dashboard() {
  const { state } = useFinance(), [month, setMonth] = useState(today().slice(0, 7));
  const summary = monthlySummary(state, month);
  const label = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${month}-01T12:00:00Z`));
  return <Page title="Visão geral" subtitle="Dê direção ao seu dinheiro.">
    <View style={styles.row}><Button title="Mês anterior" secondary onPress={() => setMonth(addMonth(month, -1))} /><Text style={styles.text}>{label}</Text><Button title="Próximo mês" secondary onPress={() => setMonth(addMonth(month, 1))} /></View>
    <Box><Text style={styles.muted}>Saldo registrado · todas as contas</Text><Text style={[styles.value, { fontSize: 38 }]}>{money(state.accounts.reduce((sum, account) => sum + balance(state, account.id, today()), 0))}</Text><Text style={styles.muted}>Saldo inicial + movimentações registradas até hoje. Não é saldo consultado no banco.</Text><Button title="Adicionar movimentação" onPress={() => router.push('/entry')} /></Box>
    <View style={styles.row}>{[{ label: 'Entradas do mês', value: summary.income }, { label: 'Gastos do mês', value: summary.expense }, { label: 'Resultado do mês', value: summary.result }].map(item => <View key={item.label} style={[styles.box, { flexGrow: 1, flexBasis: 210 }]}><Text style={styles.muted}>{item.label}</Text><Text style={styles.value}>{money(item.value)}</Text></View>)}</View>
    <Notice>Os gastos do cartão entram pelas parcelas da fatura do mês. Transferências próprias e pagamentos de fatura não são contados novamente.</Notice>
    <Box title="Onde você está gastando">{Object.entries(summary.byCategory).sort((a, b) => b[1] - a[1]).map(([category, value]) => <View key={category} style={{ gap: 6 }}><View style={styles.row}><Text style={styles.text}>{category}</Text><Text style={styles.text}>{money(value)}</Text></View><View style={{ height: 6, borderRadius: 4, backgroundColor: '#E3EAE6' }}><View style={{ height: 6, borderRadius: 4, backgroundColor: '#12624C', width: `${summary.expense ? value / summary.expense * 100 : 0}%` }} /></View></View>)}{!summary.expense && <Text style={styles.muted}>Seus gastos por categoria aparecerão aqui.</Text>}</Box>
    <Box title="Faturas projetadas">{state.cards.map(card => <View key={card.id} style={styles.row}><Text style={styles.text}>{card.name}</Text><Text style={styles.text}>{money(statement(state, card.id, month).remaining)} em aberto</Text></View>)}{!state.cards.length && <Text style={styles.muted}>Cadastre um cartão para acompanhar seus compromissos.</Text>}<Button title="Ver cartões" secondary onPress={() => router.push('/cards')} /></Box>
  </Page>;
}
