import { useState } from 'react';
import { Text, View } from 'react-native';
import { categories, Recurring, RecurringPlan } from '../domain/model';
import { recurringDate, recurringEntry, recurringKey, recurringPlan } from '../domain/recurring';
import { addMonth, money, parseMoney, today } from '../domain/money';
import { newId, useFinance } from '../state/FinanceProvider';
import { Box, Button, Choices, Field, MonthPicker, Notice, styles } from './components';

const copy: Record<RecurringPlan, { title: string; intro: string; empty: string; add: string; save: string }> = {
  fixed: {
    title: 'Salário e contas fixas',
    intro: 'Planeje entradas e gastos mensais. Não fazemos débito automático nem registramos dinheiro futuro como saldo.',
    empty: 'Nenhuma recorrência aqui. Cadastre salário, aluguel e outras contas fixas.',
    add: 'Adicionar recorrência mensal',
    save: 'Recorrência salva. O saldo só muda após confirmar o mês.',
  },
  subscription: {
    title: 'Assinaturas',
    intro: 'Streaming, apps, clubes e outros valores que se repetem todo mês. Confirme o pagamento quando sair da conta.',
    empty: 'Nenhuma assinatura cadastrada. Adicione Netflix, Spotify, academia e similares.',
    add: 'Adicionar assinatura',
    save: 'Assinatura salva. O saldo só muda após confirmar o pagamento do mês.',
  },
};

export function RecurringAccounts({ plan }: { plan: RecurringPlan }) {
  const text = copy[plan];
  const { state, mutate, busy, mode } = useFinance();
  const [open, setOpen] = useState(false), [accountId, setAccountId] = useState(''), [kind, setKind] = useState<'income' | 'expense'>('expense'), [description, setDescription] = useState(''), [amount, setAmount] = useState(''), [day, setDay] = useState('5'), [start, setStart] = useState(today().slice(0, 7)), [category, setCategory] = useState(plan === 'subscription' ? 'Lazer' : 'Outros'), [month, setMonth] = useState(today().slice(0, 7)), [removeId, setRemoveId] = useState(''), [message, setMessage] = useState(''), [failed, setFailed] = useState(false);
  const items = (state.recurring ?? []).filter(item => recurringPlan(item) === plan);
  const plans = items.filter(item => item.active && item.startMonth <= month);
  const income = plans.filter(item => item.kind === 'income').reduce((sum, item) => sum + item.amount, 0);
  const expense = plans.filter(item => item.kind === 'expense').reduce((sum, item) => sum + item.amount, 0);
  async function act(action: () => Promise<void>, success: string) { setMessage(''); setFailed(false); try { await action(); setMessage(success); } catch (error) { setFailed(true); setMessage((error as Error).message); } }
  async function save() {
    await act(async () => {
      const item: Recurring = {
        id: newId(),
        accountId: accountId || state.accounts[0]?.id || '',
        kind: plan === 'subscription' ? 'expense' : kind,
        description: description.trim(),
        amount: parseMoney(amount),
        day: Number(day),
        startMonth: start,
        category,
        active: true,
        plan,
      };
      await mutate('recurring', [item]); setOpen(false); setDescription(''); setAmount('');
    }, text.save);
  }
  async function confirm(item: Recurring) {
    await act(async () => {
      if (recurringDate(item, month) > today()) throw new Error('A data prevista ainda não chegou. Confira o mês antes de registrar.');
      await mutate('entries', [recurringEntry(state, item, month, newId())]);
    }, item.kind === 'income' ? 'Recebimento registrado no extrato.' : 'Pagamento registrado no extrato.');
  }
  return <Box title={text.title}>
    <Text style={styles.muted}>{text.intro}</Text>
    {!!items.length && <>
      <MonthPicker month={month} previous={() => setMonth(addMonth(month, -1))} next={() => setMonth(addMonth(month, 1))} labelPrevious={plan === 'subscription' ? 'Mês anterior das assinaturas' : 'Mês anterior das recorrências'} labelNext={plan === 'subscription' ? 'Próximo mês das assinaturas' : 'Próximo mês das recorrências'} />
      {plan === 'subscription'
        ? <View style={styles.row}><View><Text style={styles.muted}>Total no mês</Text><Text style={styles.heading}>{money(expense)}</Text></View><View><Text style={styles.muted}>Ativas</Text><Text style={styles.heading}>{plans.length}</Text></View></View>
        : <View style={styles.row}><View><Text style={styles.muted}>Receitas previstas</Text><Text style={styles.heading}>{money(income)}</Text></View><View><Text style={styles.muted}>Despesas previstas</Text><Text style={styles.heading}>{money(expense)}</Text></View></View>}
      <Text style={styles.muted}>Antes de confirmar, confira se esse valor já entrou pelo extrato ou importação para não registrá-lo duas vezes.</Text>
    </>}
    {items.map(item => {
      const date = recurringDate(item, month), done = state.entries.some(entry => entry.accountId === item.accountId && entry.sourceKey === recurringKey(item.id, month)), eligible = item.active && month >= item.startMonth && date <= today();
      const account = state.accounts.find(account => account.id === item.accountId);
      return <View key={item.id} style={[styles.line, { gap: 12 }]}>
        <View style={styles.row}><View style={{ flex: 1, minWidth: 140 }}><Text style={styles.heading}>{item.description}</Text><Text style={styles.muted}>{account?.name ?? 'Conta indisponível'}{plan === 'fixed' ? ` · ${item.kind === 'income' ? 'Receita' : 'Despesa'}` : ` · ${item.category}`} · dia {item.day}</Text></View><Text style={styles.heading}>{money(item.amount)}</Text></View>
        <Text style={styles.muted}>{done ? 'Registrado neste mês' : !item.active ? (plan === 'subscription' ? 'Assinatura pausada' : 'Recorrência pausada') : month < item.startMonth ? `Começa em ${item.startMonth}` : `Previsto para ${date}`}</Text>
        <View style={[styles.row, { justifyContent: 'flex-start' }]}>
          <Button title={`${item.kind === 'income' ? 'Confirmar recebimento' : 'Confirmar pagamento'} de ${item.description}`} label={done ? 'Mês registrado' : item.kind === 'income' ? 'Recebi neste mês' : 'Paguei neste mês'} icon="check" disabled={busy || done || !eligible} onPress={() => void confirm(item)} />
          <Button title={`${item.active ? 'Pausar' : 'Retomar'} ${item.description}`} label={item.active ? 'Pausar' : 'Retomar'} secondary disabled={busy} onPress={() => void act(() => mutate('recurring', [{ ...item, active: !item.active }]), item.active ? (plan === 'subscription' ? 'Assinatura pausada.' : 'Recorrência pausada.') : (plan === 'subscription' ? 'Assinatura retomada.' : 'Recorrência retomada.'))} />
          <Button title={plan === 'subscription' ? `Remover assinatura ${item.description}` : `Remover recorrência ${item.description}`} label="Remover" secondary danger disabled={busy} onPress={() => setRemoveId(item.id)} />
        </View>
        {removeId === item.id && <View style={{ gap: 12 }}><Notice>Remove apenas a previsão mensal. Os lançamentos já registrados ficam no extrato.</Notice><Button title={`Confirmar remoção de ${item.description}`} label="Remover previsão" danger disabled={busy} onPress={() => void act(async () => { await mutate('recurring_delete', [{ id: item.id }]); setRemoveId(''); }, 'Previsão removida; histórico preservado.')} /><Button title="Cancelar remoção" secondary disabled={busy} onPress={() => setRemoveId('')} /></View>}
      </View>;
    })}
    {!items.length && <Text style={styles.muted}>{text.empty}</Text>}
    <Button title={text.add} secondary icon={plan === 'subscription' ? 'tv' : 'repeat'} disabled={busy || !state.accounts.length} onPress={() => setOpen(true)} />
    {open && <View style={{ gap: 16 }}>
      <Choices label={plan === 'subscription' ? 'Conta de débito' : 'Conta da recorrência'} value={accountId || state.accounts[0]?.id || ''} options={state.accounts.map(account => ({ value: account.id, label: account.name }))} onChange={setAccountId} />
      {plan === 'fixed' && <Choices label="Tipo de recorrência" value={kind} options={[{ value: 'income', label: 'Receita / salário' }, { value: 'expense', label: 'Despesa fixa' }]} onChange={value => { setKind(value); setCategory(value === 'income' ? 'Salário' : 'Outros'); }} />}
      <Field label={plan === 'subscription' ? 'Nome da assinatura' : 'Descrição da recorrência'} value={description} onChangeText={setDescription} placeholder={plan === 'subscription' ? 'Ex.: Netflix, Spotify, academia' : kind === 'income' ? 'Ex.: Salário mensal' : 'Ex.: Aluguel'} maxLength={120} />
      <Field label="Valor mensal (R$)" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
      <Field label="Dia previsto (1–31)" value={day} onChangeText={setDay} keyboardType="number-pad" />
      <Field label="Primeiro mês (AAAA-MM)" value={start} onChangeText={setStart} />
      <Text style={styles.muted}>Nos meses mais curtos, usamos o último dia disponível.</Text>
      <Choices label={plan === 'subscription' ? 'Categoria' : 'Categoria da recorrência'} value={category} options={categories.filter(value => plan === 'subscription' ? value !== 'Salário' : true).map(value => ({ value, label: value }))} onChange={setCategory} />
      <Button title={plan === 'subscription' ? 'Salvar assinatura' : 'Salvar recorrência'} icon="check" disabled={busy} onPress={() => void save()} /><Button title={plan === 'subscription' ? 'Cancelar nova assinatura' : 'Cancelar nova recorrência'} secondary disabled={busy} onPress={() => setOpen(false)} />
    </View>}
    {!!message && <Notice error={failed}>{message}</Notice>}
    {mode === 'remote' && <Text style={styles.muted}>Para salvar online, o projeto Supabase precisa da migração de recorrências mensais.</Text>}
  </Box>;
}
