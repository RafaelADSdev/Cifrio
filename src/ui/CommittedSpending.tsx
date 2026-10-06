import { Text, useWindowDimensions, View } from 'react-native';
import { AgendaMonth } from '../domain/planning';
import { money, monthLabel } from '../domain/money';
function monthTitle(month: string) {
  const label = monthLabel(month);
  return label.charAt(0).toLocaleUpperCase('pt-BR') + label.slice(1);
}
import { Box, colors, Empty, fonts, Icon, styles } from './components';
import { ShareBar } from './motion';

export function CommittedSpending({ months }: { months: AgendaMonth[] }) {
  const wide = useWindowDimensions().width >= 800;
  const total = months.reduce((sum, row) => sum + row.remaining, 0);
  const maximum = Math.max(...months.map(row => row.remaining), 1);
  return <Box title="Já comprometido">
    {months.length > 0 ? <>
      <View style={{ backgroundColor: colors.pale, borderRadius: 12, padding: 16, gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Icon name="calendar" size={18} color={colors.primary} /><Text style={styles.muted}>Em aberto nos próximos 3 meses</Text></View>
        <Text style={styles.value}>{money(total)}</Text>
        <Text style={styles.muted}>Parcelas já registradas após o mês selecionado</Text>
      </View>
      <View style={{ flexDirection: wide ? 'row' : 'column', gap: 12 }}>
        {months.map(row => <View key={row.month} style={{ flex: wide ? 1 : undefined, minWidth: 0, backgroundColor: colors.bg, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 16, gap: 12 }}>
          <View style={{ gap: 4 }}><Text style={[styles.text, { fontFamily: fonts.bold }]}>{monthTitle(row.month)}</Text><Text style={[styles.value, { fontSize: 22 }]}>{money(row.remaining)}</Text><Text style={[styles.muted, { fontSize: 11 }]}>em aberto</Text></View>
          <ShareBar ratio={row.remaining / maximum} color={colors.primary} />
          {row.items.slice(0, 2).map(item => <View key={item.entryId + '-' + item.index} style={{ gap: 2 }}>
            <Text style={[styles.text, { fontSize: 13, fontFamily: fonts.medium }]}>{item.description}</Text>
            <Text style={[styles.muted, { fontSize: 11 }]}>{item.cardName} · parcela {item.index}/{item.count} · dia {item.dueDay}</Text>
          </View>)}
          {row.items.length > 2 && <Text style={[styles.muted, { fontSize: 11 }]}>+ {row.items.length - 2} parcelas neste mês</Text>}
        </View>)}
      </View>
    </> : <Empty icon="check-circle" title="Nada parcelado pela frente" detail="Suas próximas parcelas aparecem aqui, organizadas por mês." />}
    <Text style={[styles.muted, { fontSize: 11 }]}>Valores em aberto das faturas registradas. Não é uma consulta ao banco.</Text>
  </Box>;
}
