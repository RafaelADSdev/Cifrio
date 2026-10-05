import { useState } from 'react';
import { router } from 'expo-router';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { balance, statement } from '../../domain/finance';
import { addMonth, money, monthLabel, parseMoney, today } from '../../domain/money';
import { categories } from '../../domain/model';
import { budgetStatus, installmentAgenda, monthReadings } from '../../domain/planning';
import { useFinance } from '../../state/FinanceProvider';
import { Box, Button, Choices, colors, Empty, Field, fonts, Icon, MonthPicker, Notice, Page, styles } from '../../ui/components';
import { Desk, Ledger, ShareBar } from '../../ui/motion';

export default function Dashboard() {
  const { state, mutate, busy } = useFinance(), [month, setMonth] = useState(today().slice(0, 7)), [direction, setDirection] = useState(1), { width } = useWindowDimensions();
  const [budgetCategory, setBudgetCategory] = useState(categories[0]), [budgetAmount, setBudgetAmount] = useState(''), [budgetMessage, setBudgetMessage] = useState('');
  function turn(delta: 1 | -1) { setDirection(delta); setMonth(current => addMonth(current, delta)); }
  const readings = monthReadings(state, month), wide = width >= 800;
  const total = state.accounts.reduce((sum, account) => sum + balance(state, account.id, today()), 0);
  const spending = budgetStatus(state, month).filter(item => item.used > 0 || item.limit > 0);
  const ahead = installmentAgenda(state, addMonth(month, 1), 3).filter(row => row.remaining > 0);
  const selectedLimit = state.budgets?.some(item => item.category === budgetCategory);
  async function saveBudget(raw: string | 0) {
    setBudgetMessage('');
    try {
      const limit = raw === 0 ? 0 : parseMoney(raw);
      await mutate('budget', [{ category: budgetCategory, limit }]);
      setBudgetAmount('');
      setBudgetMessage(limit ? 'Limite salvo neste dispositivo.' : 'Limite removido.');
    } catch (error) { setBudgetMessage((error as Error).message); }
  }
  return <Page title="Visão geral" subtitle="Seu mês. Suas escolhas.">
    <MonthPicker month={month} previous={() => turn(-1)} next={() => turn(1)} />
    <Ledger month={month} direction={direction}><View style={[s.overview, wide && { flexDirection: 'row' }]}>
      <View style={[s.wallet, { flex: wide ? 1.2 : undefined }]}>
        <View style={styles.row}><Text style={s.lightLabel}>Saldo registrado · todas as contas</Text><Icon name="briefcase" color={colors.accent} /></View>
        <Text style={[styles.value, s.balance]}>{money(total)}</Text>
        <View style={s.walletFooter}><Text style={s.caption}>{state.accounts.length} {state.accounts.length === 1 ? 'conta cadastrada' : 'contas cadastradas'} · até hoje</Text><Text style={s.caption}>Não é saldo consultado no banco.</Text></View>
      </View>
      <View style={[s.month, { flex: wide ? 1 : undefined }]}>
        <View style={s.flows}>
          {[{ key: 'income', label: 'Entradas do mês', value: readings.income, icon: 'arrow-down-left' as const, color: colors.primary }, { key: 'expense', label: 'Gasto do mês', value: readings.spent, icon: 'arrow-up-right' as const, color: colors.negative }].map(item => <View key={item.key} testID={`monthly-${item.key}`} style={{ flex: 1, gap: 8 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><Icon name={item.icon} size={16} color={item.color} /><Text style={styles.muted}>{item.label}</Text></View><Text style={[styles.value, { fontSize: width < 360 ? 20 : 23 }]}>{money(item.value)}</Text></View>)}
        </View>
        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 16 }]}><Text style={styles.muted}>Resultado do mês</Text><Text style={[styles.heading, { color: readings.result < 0 ? colors.negative : colors.primary, fontVariant: ['tabular-nums'] }]}>{money(readings.result)}</Text></View>
        <View testID="monthly-cash" style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 16 }]}><Text style={styles.muted}>Saiu das contas</Text><Text style={[styles.heading, { fontVariant: ['tabular-nums'] }]}>{money(readings.cashOut)}</Text></View>
        <Text style={styles.muted}>Gasto do mês inclui as parcelas da fatura. Saiu das contas soma despesas e pagamentos de fatura. Transferência entre suas contas não entra.</Text>
      </View>
    </View></Ledger>
    <Button title="Adicionar movimentação" icon="plus" onPress={() => router.push('/entry')} />
    <Desk>
    {!state.accounts.length && <Box><Empty icon="briefcase" title="Comece pela sua primeira conta" detail="Cadastre o saldo inicial. Depois registre seus gastos ou importe um extrato."><Button title="Cadastrar conta" secondary icon="plus" onPress={() => router.push('/accounts')} /></Empty></Box>}
    <View style={[s.columns, wide && { flexDirection: 'row' }]}>
      <View style={{ flex: 1 }}><Box title="Onde você está gastando">
        {spending.map(item => <View key={item.category} style={{ gap: 8 }}><View style={styles.row}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.over ? colors.negative : colors.primary }} /><Text style={styles.text}>{item.category}</Text></View><Text style={[styles.text, { fontFamily: fonts.bold }]}>{item.limit ? `${money(item.used)} de ${money(item.limit)}` : money(item.used)}{item.over ? ' · acima do limite' : ''}</Text></View><ShareBar ratio={item.limit ? item.used / item.limit : readings.spent ? item.used / readings.spent : 0} color={item.over ? colors.negative : colors.primary} track={colors.pale} /></View>)}
        {!spending.length && <Empty icon="pie-chart" title="Seu mês ainda está em branco" detail="As categorias aparecem conforme você registra despesas e parcelas." />}
        <Text style={styles.muted}>O limite acompanha a parcela da fatura, no mês em que ela vence. Pagamento da fatura não conta de novo.</Text>
        <Choices label="Categoria do limite" value={budgetCategory} options={categories.filter(category => category !== 'Outros').map(category => ({ value: category, label: category }))} onChange={setBudgetCategory} />
        <Field label="Limite mensal (R$)" value={budgetAmount} onChangeText={setBudgetAmount} keyboardType="decimal-pad" placeholder="0,00" />
        <Button title={`Salvar limite de ${budgetCategory}`} label="Salvar limite" disabled={busy} onPress={() => void saveBudget(budgetAmount)} />
        {selectedLimit && <Button title={`Remover limite de ${budgetCategory}`} label="Remover limite" secondary disabled={busy} onPress={() => void saveBudget(0)} />}
        {!!budgetMessage && <Notice error={!budgetMessage.startsWith('Limite')}>{budgetMessage}</Notice>}
      </Box></View>
      <View style={{ flex: 1 }}><Box title="Faturas projetadas">
        {state.cards.map(card => <View key={card.id} style={[styles.line, styles.row]}><View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}><Icon name="credit-card" color={colors.primary} /><View><Text style={styles.text}>{card.name}</Text><Text style={styles.muted}>Vencimento · dia {card.dueDay}</Text></View></View><Text style={[styles.text, { fontFamily: fonts.bold }]}>{money(statement(state, card.id, month).remaining)} em aberto</Text></View>)}
        {!state.cards.length && <Empty icon="credit-card" title="Seus compromissos, à vista" detail="Cadastre um cartão para acompanhar compras, parcelas e faturas estimadas." />}
        <Button title="Ver cartões" secondary icon="arrow-right" onPress={() => router.push('/cards')} />
      </Box></View>
    </View>
    <Box title="Já comprometido">
      {ahead.map(row => <View key={row.month} style={{ gap: 8 }}><View style={styles.row}><Text style={[styles.text, { fontFamily: fonts.bold, textTransform: 'capitalize' }]}>{monthLabel(row.month)}</Text><Text style={[styles.text, { fontFamily: fonts.bold }]}>{money(row.remaining)} em aberto</Text></View>{row.items.slice(0, 2).map(item => <Text key={`${item.entryId}-${item.index}`} style={styles.muted}>{item.cardName} · {item.description} · {item.index}/{item.count} · vence dia {item.dueDay}</Text>)}{row.items.length > 2 && <Text style={styles.muted}>+ {row.items.length - 2} parcelas neste mês</Text>}</View>)}
      {!ahead.length && <Empty icon="calendar" title="Nada parcelado pela frente" detail="Quando uma compra tiver parcelas nos próximos meses, o valor em aberto aparece aqui." />}
      <Text style={styles.muted}>Soma das parcelas já lançadas. Não é uma consulta ao banco.</Text>
    </Box>
    {state.accounts.length > 0 && <Box title="Suas contas">{state.accounts.map(account => <View key={account.id} style={[styles.line, styles.row]}><View><Text style={[styles.text, { fontFamily: fonts.bold }]}>{account.name}</Text><Text style={styles.muted}>{account.bank}</Text></View><Text style={[styles.heading, { fontVariant: ['tabular-nums'] }]}>{money(balance(state, account.id, today()))}</Text></View>)}</Box>}
    </Desk>
    <Text style={styles.muted}>Os valores refletem os registros do app. A sincronização bancária ainda não está habilitada.</Text>
  </Page>;
}
const s = StyleSheet.create({
  overview: { gap: 12 }, wallet: { backgroundColor: colors.dark, borderRadius: 16, padding: 24, gap: 16, boxShadow: '0 12px 24px rgba(4, 36, 83, 0.16)' },
  balance: { color: colors.onDark, fontSize: 36, letterSpacing: -1 }, lightLabel: { fontFamily: fonts.medium, color: colors.mutedDark, fontSize: 12, lineHeight: 20, flexShrink: 1 },
  caption: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 19, color: colors.mutedDark }, walletFooter: { borderTopWidth: 1, borderTopColor: colors.lineOnDark, paddingTop: 12, gap: 4 },
  month: { backgroundColor: colors.surface, borderRadius: 16, padding: 20, gap: 20, boxShadow: '0 8px 18px rgba(20, 42, 64, 0.08)' }, flows: { flexDirection: 'row', gap: 12 }, columns: { gap: 16 },
});
