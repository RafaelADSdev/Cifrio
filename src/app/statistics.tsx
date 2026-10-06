import { useState } from 'react';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { monthlyInsights } from '../domain/insights';
import { addMonth, money, monthLabel, today } from '../domain/money';
import { useFinance } from '../state/FinanceProvider';
import { Box, Button, colors, Empty, fonts, MonthPicker, Page, styles } from '../ui/components';
import { ShareBar } from '../ui/motion';

export default function Statistics() {
  const { state, mode } = useFinance();
  const params = useLocalSearchParams<{ month?: string }>();
  const [month, setMonth] = useState(params.month && /^\d{4}-(0[1-9]|1[0-2])$/.test(params.month) ? params.month : today().slice(0, 7));
  if (mode === 'welcome') return <Redirect href="/" />;
  const data = monthlyInsights(state, month);
  const maximum = Math.max(1, ...data.trend.flatMap(item => [item.income, item.expense]));
  return <Page title="Estatísticas" subtitle="Veja como o seu dinheiro se move ao longo dos meses.">
    <Button title="Voltar" secondary icon="arrow-left" onPress={() => router.canGoBack() ? router.back() : router.replace('/')} />
    <MonthPicker month={month} previous={() => setMonth(addMonth(month, -1))} next={() => setMonth(addMonth(month, 1))} />
    <Box title="Resumo do período"><View style={styles.row}>
      {[{ label: 'Receitas', value: data.current.income }, { label: 'Despesas e parcelas', value: data.current.expense }, { label: 'Resultado', value: data.current.result }].map(item => <View key={item.label} style={{ gap: 8, flexGrow: 1, minWidth: 160 }}><Text style={styles.muted}>{item.label}</Text><Text style={styles.value}>{money(item.value)}</Text></View>)}
    </View><Text style={styles.muted}>{data.expenseChange === 0 ? 'Mesmo gasto do mês anterior.' : `${money(Math.abs(data.expenseChange))} ${data.expenseChange > 0 ? 'a mais' : 'a menos'} em gastos que no mês anterior.`}{data.expenseChangePercent !== null ? ` Variação: ${data.expenseChangePercent.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%.` : ' Sem base de despesas no mês anterior para calcular uma variação percentual.'}</Text></Box>
    <Box title="Evolução em seis meses"><Text style={styles.muted}>Receitas e gastos em reais. A escala é a mesma em todos os meses.</Text>
      {data.trend.map(item => <View key={item.month} style={{ gap: 8 }}><View style={styles.row}><Text style={[styles.text, { fontFamily: fonts.bold, textTransform: 'capitalize' }]}>{monthLabel(item.month)}</Text><Button title={`Ver ${monthLabel(item.month)}`} label="Ver mês" secondary onPress={() => setMonth(item.month)} /></View>
        <View accessible accessibilityLabel={`Receitas: ${money(item.income)}`} style={{ gap: 4 }}><Text style={styles.muted}>Receitas · {money(item.income)}</Text><ShareBar ratio={item.income / maximum} color={colors.primary} track={colors.pale} /></View>
        <View accessible accessibilityLabel={`Gastos: ${money(item.expense)}`} style={{ gap: 4 }}><Text style={styles.muted}>Gastos · {money(item.expense)}</Text><ShareBar ratio={item.expense / maximum} color={colors.negative} track={colors.pale} /></View>
      </View>)}
    </Box>
    <Box title="Distribuição dos gastos">
      {data.breakdown.map(item => <View key={item.category} style={{ gap: 8 }}><View style={styles.row}><Text style={[styles.text, { fontFamily: fonts.bold }]}>{item.category}</Text><Text style={styles.text}>{money(item.amount)} · {(item.ratio * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%</Text></View><ShareBar ratio={item.ratio} color={colors.primary} track={colors.pale} /></View>)}
      {!data.breakdown.length && <Empty icon="pie-chart" title="Sem gastos neste período" detail="Despesas e parcelas registradas aparecem por categoria aqui." />}
      <Button title="Abrir extrato deste período" secondary icon="list" onPress={() => router.push({ pathname: '/transactions', params: { month } })} />
      <Text style={styles.muted}>Compras no cartão entram pela competência da parcela. Transferências e pagamentos de fatura não contam como novas despesas. O extrato filtra a data do registro e pode ter totais diferentes.</Text>
    </Box>
  </Page>;
}
