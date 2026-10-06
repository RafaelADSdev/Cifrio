import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { FinanceState } from '../domain/model';
import { addMonth, money, monthLabel, today } from '../domain/money';
import { AgendaItem, agendaItemsByDueMonth, installmentProgress, monthlyDueLoad } from '../domain/planning';
import { Box, Button, colors, fonts, Icon, MonthPicker, styles } from './components';
import { useMotionSettings } from './motionPreferences';

const weekdays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

function calendarGrid(month: string) {
  const [year, number] = month.split('-').map(Number);
  const first = new Date(Date.UTC(year, number - 1, 1));
  const start = (first.getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(year, number, 0)).getUTCDate();
  const cells: (number | null)[] = [...Array(start).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function dateKey(month: string, day: number) {
  return `${month}-${String(day).padStart(2, '0')}`;
}

function Stat({ label, value }: { label: string; value: number }) {
  return <View style={{ flex: 1, backgroundColor: colors.pale, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 8, alignItems: 'center', gap: 4 }}>
    <Text style={[styles.muted, { textAlign: 'center' }]}>{label}</Text>
    <Text style={{ fontFamily: fonts.display, fontSize: 22, color: colors.ink, fontVariant: ['tabular-nums'] }}>{value}</Text>
  </View>;
}

export function InstallmentAgendaCalendar({ state }: { state: FinanceState }) {
  const { disabled: motionDisabled } = useMotionSettings();
  const { height } = useWindowDimensions();
  const [month, setMonth] = useState(today().slice(0, 7));
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [entryId, setEntryId] = useState('');
  const items = useMemo(() => agendaItemsByDueMonth(state, month), [state, month]);
  const load = useMemo(() => monthlyDueLoad(state, month), [state, month]);
  const progress = entryId ? installmentProgress(state, entryId) : null;
  const byDate = useMemo(() => items.reduce<Record<string, AgendaItem[]>>((acc, item) => {
    (acc[item.dueDate] ??= []).push(item);
    return acc;
  }, {}), [items]);
  const cells = useMemo(() => calendarGrid(month), [month]);
  const visibleItems = selectedDay ? (byDate[dateKey(month, selectedDay)] ?? []) : items;

  return <Box title="Agenda de parcelas">
    <MonthPicker month={month} previous={() => { setMonth(addMonth(month, -1)); setSelectedDay(null); }} next={() => { setMonth(addMonth(month, 1)); setSelectedDay(null); }} labelPrevious="Mês anterior na agenda" labelNext="Próximo mês na agenda" />
    <View style={{ gap: 8 }}>
      <View style={styles.row}>
        <Text style={[styles.text, { fontFamily: fonts.medium }]}>Limite do mês (vencimentos)</Text>
        <Text style={[styles.text, { fontFamily: fonts.bold }, load.over && { color: colors.negative }]}>{money(load.committed)} / {load.limit ? money(load.limit) : '—'}</Text>
      </View>
      {load.limit > 0 && <View style={{ height: 8, borderRadius: 4, backgroundColor: colors.pale, overflow: 'hidden' }}>
        <View style={{ height: '100%', width: `${Math.min(100, (load.committed / load.limit) * 100)}%`, backgroundColor: load.over ? colors.negative : colors.primary }} />
      </View>}
      <Text style={styles.muted}>Soma das parcelas com vencimento neste mês, comparada ao limite cadastrado dos cartões.</Text>
    </View>
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: 'row' }}>{weekdays.map(label => <Text key={label} style={[styles.muted, { flex: 1, textAlign: 'center', fontFamily: fonts.medium }]}>{label}</Text>)}</View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {cells.map((day, index) => {
          if (!day) return <View key={`empty-${index}`} style={{ width: `${100 / 7}%`, aspectRatio: 1, padding: 2 }} />;
          const key = dateKey(month, day);
          const count = byDate[key]?.length ?? 0;
          const selected = selectedDay === day;
          return <Pressable key={key} accessibilityRole="button" accessibilityLabel={count ? `${day}: ${count} vencimento${count === 1 ? '' : 's'}` : `${day}`} onPress={() => setSelectedDay(day === selectedDay ? null : day)} style={{ width: `${100 / 7}%`, aspectRatio: 1, padding: 2 }}>
            <View style={{ flex: 1, borderRadius: 10, alignItems: 'center', justifyContent: 'center', gap: 2, backgroundColor: selected ? colors.dark : count ? colors.pale : colors.bg, borderWidth: 1, borderColor: count ? colors.primary : colors.border }}>
              <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: selected ? colors.onDark : colors.ink }}>{day}</Text>
              {!!count && <View style={{ minWidth: 6, height: 6, borderRadius: 3, backgroundColor: selected ? colors.accent : colors.primary }} />}
            </View>
          </Pressable>;
        })}
      </View>
      {selectedDay && <Text style={styles.muted}>Dia {String(selectedDay).padStart(2, '0')} · {visibleItems.length ? `${visibleItems.length} parcela(s) com vencimento` : 'nenhum vencimento neste dia'}</Text>}
    </View>
    <View style={{ gap: 8 }}>
      <Text style={[styles.text, { fontFamily: fonts.bold, textTransform: 'capitalize' }]}>{monthLabel(month)}</Text>
      {visibleItems.map(item => <Pressable key={`${item.entryId}-${item.index}`} accessibilityRole="button" accessibilityLabel={`${item.description}, parcela ${item.index} de ${item.count}`} onPress={() => setEntryId(item.entryId)} style={[styles.line, styles.row, { borderBottomWidth: 1 }]}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={styles.text}>{item.description}</Text>
          <Text style={styles.muted}>{item.cardName} · vence {item.dueDate.split('-').reverse().join('/')}</Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 6 }}>
          <View style={styles.badge}><Text style={[styles.muted, { fontFamily: fonts.bold }]}>{item.index}/{item.count}</Text></View>
          <Text style={[styles.text, { fontFamily: fonts.bold }]}>{money(item.amount)}</Text>
        </View>
      </Pressable>)}
      {!visibleItems.length && <Text style={styles.muted}>Nenhuma parcela neste período.</Text>}
    </View>
    <Modal visible={!!progress} transparent animationType={motionDisabled ? 'none' : 'fade'} onRequestClose={() => setEntryId('')}>
      <Pressable accessibilityRole="button" accessibilityLabel="Fechar detalhes da parcela" onPress={() => setEntryId('')} style={{ flex: 1, backgroundColor: 'rgba(4, 36, 83, 0.45)', justifyContent: 'center', padding: 16 }}>
        <Pressable onPress={e => e.stopPropagation()} style={[styles.box, { maxWidth: 480, alignSelf: 'center', width: '100%', maxHeight: height * 0.88, padding: 0, overflow: 'hidden' }]}>
          {progress && <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, gap: 16 }}>
            <View style={{ gap: 8 }}>
              <View style={[styles.row, { alignItems: 'flex-start' }]}>
                <Text accessibilityRole="header" style={[styles.heading, { flex: 1, flexShrink: 1 }]} numberOfLines={4}>{progress.description}</Text>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.pale, alignItems: 'center', justifyContent: 'center' }}><Icon name="credit-card" color={colors.primary} size={20} /></View>
              </View>
              <Text style={styles.muted}>{progress.cardName}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Stat label="Pagas" value={progress.paidInstallments} />
              <Stat label="Faltam" value={progress.remainingInstallments} />
              <Stat label="Total" value={progress.total} />
            </View>
            <Text style={styles.muted}>Uma parcela conta como paga quando a fatura daquele mês está quitada nos seus registros.</Text>
            <View style={{ gap: 4 }}>
              {progress.parts.map(part => <View key={part.month} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                  <Text style={[styles.text, { fontFamily: fonts.bold }]}>{part.index}/{progress.total}</Text>
                  <Text style={styles.muted} numberOfLines={2}>{monthLabel(part.month)}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Text style={[styles.text, { fontFamily: fonts.bold }]}>{money(part.amount)}</Text>
                  <Icon name={part.paid ? 'check-circle' : 'circle'} color={part.paid ? colors.primary : colors.muted} size={20} />
                </View>
              </View>)}
            </View>
            <Button title="Fechar detalhes da compra parcelada" label="Fechar" secondary onPress={() => setEntryId('')} />
          </ScrollView>}
        </Pressable>
      </Pressable>
    </Modal>
  </Box>;
}
