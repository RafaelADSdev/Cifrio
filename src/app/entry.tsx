import { useState } from 'react';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { Entry, EntryKind, categories } from '../domain/model';
import { parseMoney, today } from '../domain/money';
import { statement } from '../domain/finance';
import { newId, useFinance } from '../state/FinanceProvider';
import { Box, Button, Choices, Field, Notice, Page } from '../ui/components';
const kinds: { value: EntryKind; label: string }[] = [{ value: 'expense', label: 'Despesa' }, { value: 'income', label: 'Receita' }, { value: 'transfer', label: 'Transferência' }, { value: 'card_purchase', label: 'Compra no cartão' }, { value: 'card_payment', label: 'Pagamento de fatura' }];
export default function EntryForm() {
  const params = useLocalSearchParams<{ id?: string; kind?: EntryKind; cardId?: string; month?: string }>();
  const { state, mode, mutate, busy } = useFinance(), existing = state.entries.find(e => e.id === params.id);
  const [kind, setKind] = useState<EntryKind>(existing?.kind ?? (kinds.some(k => k.value === params.kind) ? params.kind! : 'expense'));
  const [id] = useState(existing?.id ?? newId());
  const [operationId] = useState(newId());
  const [accountId, setAccount] = useState(existing?.accountId ?? state.accounts[0]?.id ?? ''), [destinationId, setDestination] = useState(existing?.destinationId ?? state.accounts[1]?.id ?? '');
  const [cardId, setCard] = useState(existing?.cardId ?? params.cardId ?? state.cards[0]?.id ?? ''), [month, setMonth] = useState(existing?.statementMonth ?? params.month ?? today().slice(0, 7));
  const [amount, setAmount] = useState(existing ? (existing.amount / 100).toFixed(2).replace('.', ',') : ''), [description, setDescription] = useState(existing?.description ?? ''), [date, setDate] = useState(existing?.date ?? today()), [category, setCategory] = useState(existing?.category ?? categories[0]);
  const [method, setMethod] = useState<Entry['method']>(existing?.method ?? 'pix'), [parts, setParts] = useState(String(existing?.installments ?? 1)), [message, setMessage] = useState('');
  if (mode === 'welcome') return <Redirect href="/" />;
  async function save() {
    setMessage('');
    try {
      const entry: Entry = { id, kind, amount: parseMoney(amount), description: description.trim() || (kind === 'card_payment' ? 'Pagamento de fatura' : ''), date, category, method: kind === 'card_purchase' ? 'credit' : method,
        ...(kind !== 'card_purchase' && { accountId }), ...(kind === 'transfer' && { destinationId }), ...(kind.startsWith('card_') && { cardId }), ...(kind === 'card_purchase' && { installments: Number(parts) }), ...(kind === 'card_payment' && { statementMonth: month }), ...(existing?.source && { source: existing.source, sourceKey: existing.sourceKey }) };
      await mutate(existing ? 'edit' : 'entries', [entry], operationId);
      if (router.canGoBack()) router.back(); else router.replace('/transactions');
    } catch (e) { setMessage((e as Error).message); }
  }
  return <Page title={existing ? 'Editar movimentação' : 'Nova movimentação'} subtitle="Registre agora. Entenda depois.">
    <Button title="Voltar" secondary onPress={() => router.canGoBack() ? router.back() : router.replace('/')} />
    <Box><Choices label="Tipo" options={kinds} value={kind} onChange={setKind} />
      {kind !== 'card_purchase' && (state.accounts.length ? <Choices label="Conta de origem" options={state.accounts.map(a => ({ value: a.id, label: a.name }))} value={accountId} onChange={setAccount} /> : <Notice>Cadastre uma conta na aba Contas antes de registrar.</Notice>)}
      {kind === 'transfer' && <Choices label="Conta de destino" options={state.accounts.map(a => ({ value: a.id, label: a.name }))} value={destinationId} onChange={setDestination} />}
      {kind.startsWith('card_') && <Choices label="Cartão" options={state.cards.map(c => ({ value: c.id, label: c.name }))} value={cardId} onChange={setCard} />}
      {kind === 'card_payment' && <><Field label="Competência da fatura (AAAA-MM)" value={month} onChangeText={setMonth} /><Notice>Saldo em aberto: {(statement(state, cardId, month).remaining / 100).toFixed(2).replace('.', ',')} reais.</Notice></>}
      <Field label="Valor (R$)" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0,00" /><Field label="Descrição" value={description} onChangeText={setDescription} maxLength={160} placeholder="Ex.: Mercado da semana" /><Field label="Data (AAAA-MM-DD)" value={date} onChangeText={setDate} autoCapitalize="none" />
      {!['transfer', 'card_payment'].includes(kind) && <Choices label="Categoria" options={categories.map(c => ({ value: c, label: c }))} value={category} onChange={setCategory} />}
      {kind === 'card_purchase' ? <Field label="Número de parcelas" value={parts} onChangeText={setParts} keyboardType="number-pad" /> : <Choices label="Forma de movimentação" options={[{ value: 'pix', label: 'Pix' }, { value: 'debit', label: 'Débito' }, { value: 'cash', label: 'Dinheiro' }]} value={method} onChange={setMethod} />}
      {!!message && <Notice error>{message}</Notice>}<Button title={busy ? 'Salvando…' : 'Salvar movimentação'} disabled={busy} onPress={() => void save()} />
    </Box>
  </Page>;
}
