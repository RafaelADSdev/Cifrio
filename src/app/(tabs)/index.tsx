import { useState } from 'react';
import { router } from 'expo-router';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { balance, monthlySummary, statement } from '../../domain/finance';
import { addMonth, money, today } from '../../domain/money';
import { useFinance } from '../../state/FinanceProvider';
import { Box, Button, colors, Empty, fonts, Icon, MonthPicker, Page, styles } from '../../ui/components';

export default function Dashboard() {
  const { state } = useFinance(), [month, setMonth] = useState(today().slice(0, 7)), { width } = useWindowDimensions();
  const summary = monthlySummary(state, month), wide = width >= 800;
  const total = state.accounts.reduce((sum, account) => sum + balance(state, account.id, today()), 0);
  const categories = Object.entries(summary.byCategory).sort((a, b) => b[1] - a[1]);
  return <Page title="Visão geral" subtitle="Seu mês. Suas escolhas.">
    <MonthPicker month={month} previous={() => setMonth(addMonth(month, -1))} next={() => setMonth(addMonth(month, 1))} />
    <View style={[s.overview, wide && { flexDirection: 'row' }]}>
      <View style={[s.wallet, { flex: wide ? 1.2 : undefined }]}>
        <View style={styles.row}><Text style={s.lightLabel}>Saldo registrado · todas as contas</Text><Icon name="briefcase" color={colors.accent} /></View>
        <Text style={[styles.value, s.balance]}>{money(total)}</Text>
        <View style={s.walletFooter}><Text style={s.caption}>{state.accounts.length} {state.accounts.length === 1 ? 'conta cadastrada' : 'contas cadastradas'} · até hoje</Text><Text style={s.caption}>Não é saldo consultado no banco.</Text></View>
      </View>
      <View style={[s.month, { flex: wide ? 1 : undefined }]}>
        <View style={s.flows}>
          {[{ key: 'income', label: 'Entradas do mês', value: summary.income, icon: 'arrow-down-left' as const, color: colors.primary }, { key: 'expense', label: 'Gastos do mês', value: summary.expense, icon: 'arrow-up-right' as const, color: colors.negative }].map(item => <View key={item.key} testID={`monthly-${item.key}`} style={{ flex: 1, gap: 8 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><Icon name={item.icon} size={16} color={item.color} /><Text style={styles.muted}>{item.label}</Text></View><Text style={[styles.value, { fontSize: width < 360 ? 20 : 23 }]}>{money(item.value)}</Text></View>)}
        </View>
        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 16 }]}><Text style={styles.muted}>Resultado do mês</Text><Text style={[styles.heading, { color: summary.result < 0 ? colors.negative : colors.primary, fontVariant: ['tabular-nums'] }]}>{money(summary.result)}</Text></View>
      </View>
    </View>
    <Button title="Adicionar movimentação" icon="plus" onPress={() => router.push('/entry')} />
    {!state.accounts.length && <Box><Empty icon="briefcase" title="Comece pela sua primeira conta" detail="Cadastre o saldo inicial. Depois registre seus gastos ou importe um extrato."><Button title="Cadastrar conta" secondary icon="plus" onPress={() => router.push('/accounts')} /></Empty></Box>}
    <View style={[s.columns, wide && { flexDirection: 'row' }]}>
      <View style={{ flex: 1 }}><Box title="Onde você está gastando">
        {categories.map(([category, value], index) => <View key={category} style={{ gap: 8 }}><View style={styles.row}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: index === 0 ? colors.primary : '#738B9C' }} /><Text style={styles.text}>{category}</Text></View><Text style={[styles.text, { fontFamily: fonts.bold }]}>{money(value)}</Text></View><View style={{ height: 5, borderRadius: 3, backgroundColor: colors.pale }}><View style={{ height: 5, borderRadius: 3, backgroundColor: index === 0 ? colors.primary : '#738B9C', width: `${summary.expense ? value / summary.expense * 100 : 0}%` }} /></View></View>)}
        {!summary.expense && <Empty icon="pie-chart" title="Seu mês ainda está em branco" detail="As categorias aparecem conforme você registra despesas e parcelas." />}
        <Text style={styles.muted}>Parcelas do cartão entram no mês da fatura. Transferências e pagamentos não duplicam gastos.</Text>
      </Box></View>
      <View style={{ flex: 1 }}><Box title="Faturas projetadas">
        {state.cards.map(card => <View key={card.id} style={[styles.line, styles.row]}><View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}><Icon name="credit-card" color={colors.primary} /><View><Text style={styles.text}>{card.name}</Text><Text style={styles.muted}>Vencimento · dia {card.dueDay}</Text></View></View><Text style={[styles.text, { fontFamily: fonts.bold }]}>{money(statement(state, card.id, month).remaining)} em aberto</Text></View>)}
        {!state.cards.length && <Empty icon="credit-card" title="Seus compromissos, à vista" detail="Cadastre um cartão para acompanhar compras, parcelas e faturas estimadas." />}
        <Button title="Ver cartões" secondary icon="arrow-right" onPress={() => router.push('/cards')} />
      </Box></View>
    </View>
    {state.accounts.length > 0 && <Box title="Suas contas">{state.accounts.map(account => <View key={account.id} style={[styles.line, styles.row]}><View><Text style={[styles.text, { fontFamily: fonts.bold }]}>{account.name}</Text><Text style={styles.muted}>{account.bank}</Text></View><Text style={[styles.heading, { fontVariant: ['tabular-nums'] }]}>{money(balance(state, account.id, today()))}</Text></View>)}</Box>}
    <Text style={styles.muted}>Os valores refletem os registros do app. A sincronização bancária ainda não está habilitada.</Text>
  </Page>;
}
const s = StyleSheet.create({
  overview: { gap: 12 }, wallet: { backgroundColor: colors.dark, borderRadius: 16, padding: 24, gap: 16 },
  balance: { color: colors.onDark, fontSize: 36, letterSpacing: -1 }, lightLabel: { fontFamily: fonts.medium, color: colors.mutedDark, fontSize: 12, lineHeight: 20, flexShrink: 1 },
  caption: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 19, color: colors.mutedDark }, walletFooter: { borderTopWidth: 1, borderTopColor: '#405365', paddingTop: 12, gap: 4 },
  month: { backgroundColor: colors.surface, borderRadius: 16, padding: 20, gap: 20 }, flows: { flexDirection: 'row', gap: 12 }, columns: { gap: 16 },
});
