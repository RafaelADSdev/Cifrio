import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { entryLabels, filterEntries } from '../domain/insights';
import { FinanceState } from '../domain/model';
import { money } from '../domain/money';
import { Button, colors, Empty, fonts, Icon, IconName, styles } from './components';
import { CardVisual } from './CardVisual';
import { statement } from '../domain/finance';

function Shortcut({ title, label, icon, onPress }: { title: string; label: string; icon: IconName; onPress: () => void }) {
  const [focused, setFocused] = useState(false);
  return <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={onPress} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={({ pressed }) => ({ flex: 1, minHeight: 72, alignItems: 'center', gap: 6, opacity: pressed ? 0.7 : 1, borderRadius: 12, outlineWidth: focused ? 2 : 0, outlineColor: colors.primary, outlineOffset: 3 })}>
    <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.soft, alignItems: 'center', justifyContent: 'center' }}><Icon name={icon} color={colors.primary} size={22} /></View><Text style={{ fontFamily: fonts.medium, fontSize: 11, color: colors.ink, textAlign: 'center' }}>{label}</Text>
  </Pressable>;
}

export function QuickActions() {
  return <View accessibilityLabel="Acesso rápido" style={{ flexDirection: 'row', gap: 8 }}>
    <Shortcut title="Registrar receita" label="Receita" icon="arrow-down-left" onPress={() => router.push({ pathname: '/entry', params: { kind: 'income' } })} />
    <Shortcut title="Registrar despesa" label="Despesa" icon="arrow-up-right" onPress={() => router.push({ pathname: '/entry', params: { kind: 'expense' } })} />
    <Shortcut title="Registrar transferência" label="Transferir" icon="repeat" onPress={() => router.push({ pathname: '/entry', params: { kind: 'transfer' } })} />
    <Shortcut title="Ver estatísticas" label="Estatísticas" icon="bar-chart-2" onPress={() => router.push('/statistics')} />
  </View>;
}
export function HomeCards({ state, month }: { state: FinanceState; month: string }) {
  return <View style={{ gap: 12 }}>
    <View style={styles.row}><Text accessibilityRole="header" aria-level={2} style={styles.heading}>Seus cartões</Text><Button title="Gerenciar cartões" label={state.cards.length ? 'Ver todos' : 'Adicionar'} secondary icon={state.cards.length ? 'arrow-right' : 'plus'} onPress={() => router.push('/cards')} /></View>
    {state.cards.length > 0 ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 4 }}>
      {state.cards.map(card => <Pressable key={card.id} accessibilityRole="button" accessibilityLabel={`Ver fatura de ${card.name}`} onPress={() => router.push({ pathname: '/cards', params: { cardId: card.id } })} style={({ pressed }) => ({ width: 270, opacity: pressed ? 0.8 : 1 })}><CardVisual card={card} remaining={statement(state, card.id, month).remaining} compact /></Pressable>)}
    </ScrollView> : <Text style={styles.muted}>Cadastre um cartão para acompanhar a fatura por aqui.</Text>}
    <View style={[styles.row, { justifyContent: 'flex-start' }]}><Button title="Importar extrato" label="Importar" secondary icon="download" onPress={() => router.push('/imports')} /><Button title="Ver assinaturas" label="Assinaturas" secondary icon="tv" onPress={() => router.push('/subscriptions')} /></View>
  </View>;
}
export function HomeActivity({ state, month }: { state: FinanceState; month: string }) {
  const entries = filterEntries(state, { month }).slice(0, 5);
  return <View style={{ gap: 12 }}><View style={styles.row}><Text accessibilityRole="header" aria-level={2} style={styles.heading}>Atividade recente</Text><Button title="Ver extrato do mês" label="Ver tudo" secondary onPress={() => router.push({ pathname: '/transactions', params: { month } })} /></View>
    {entries.map(entry => <Pressable key={entry.id} accessibilityRole="button" accessibilityLabel={`Abrir movimentação ${entry.description}`} onPress={() => router.push({ pathname: '/entry', params: { id: entry.id } })} style={({ pressed }) => ({ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 12, padding: 16, opacity: pressed ? 0.75 : 1 })}><View style={[styles.row, { flexWrap: 'nowrap' }]}>
      <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.soft, alignItems: 'center', justifyContent: 'center' }}><Icon name={entry.kind === 'income' ? 'arrow-down-left' : entry.kind === 'transfer' ? 'repeat' : entry.kind === 'card_purchase' ? 'credit-card' : 'arrow-up-right'} color={colors.primary} /></View>
      <View style={{ flex: 1, minWidth: 0 }}><Text style={[styles.text, { fontFamily: fonts.bold }]}>{entry.description}</Text><Text style={[styles.muted, { fontSize: 11 }]}>{entry.date.split('-').reverse().join('/')} · {entryLabels[entry.kind]}</Text></View>
      <Text style={[styles.text, { fontFamily: fonts.bold, fontSize: 13, flexShrink: 1, color: entry.kind === 'income' ? colors.primary : entry.kind === 'transfer' ? colors.ink : colors.negative }]}>{entry.kind === 'income' ? '+' : entry.kind === 'transfer' ? '' : '−'}{money(entry.amount)}</Text>
    </View></Pressable>)}
    {!entries.length && <Empty icon="list" title="Nenhuma movimentação neste mês" detail="Registre uma movimentação para acompanhar sua atividade recente." />}
    <Text style={styles.muted}>Valores dos registros na data da movimentação. As estatísticas distribuem compras no cartão pelas parcelas.</Text>
  </View>;
}
