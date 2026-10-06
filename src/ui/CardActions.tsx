import { useState } from 'react';
import { Text, View } from 'react-native';
import { Card, CardNetwork, CardTheme } from '../domain/model';
import { CardAppearanceFields } from './CardVisual';
import { cardDeleteReason } from '../domain/finance';
import { money, parseMoney } from '../domain/money';
import { useFinance } from '../state/FinanceProvider';
import { Button, Field, Notice, styles } from './components';

type Props = { card: Card };

export function CardActions({ card }: Props) {
  const { state, mutate, busy } = useFinance();
  const [editId, setEditId] = useState(''), [deleteId, setDeleteId] = useState('');
  const [name, setName] = useState(''), [limit, setLimit] = useState(''), [closing, setClosing] = useState('10'), [due, setDue] = useState('17');
  const [message, setMessage] = useState(''), [failed, setFailed] = useState(false);
  const [network, setNetwork] = useState<CardNetwork>('none'), [theme, setTheme] = useState<CardTheme>('forest'), [lastFour, setLastFour] = useState('');

  function startEdit() {
    setEditId(card.id); setDeleteId(''); setMessage(''); setFailed(false);
    setName(card.name); setLimit((card.limit / 100).toFixed(2).replace('.', ',')); setClosing(String(card.closingDay)); setDue(String(card.dueDay));
    setNetwork(card.network ?? 'none'); setTheme(card.theme ?? 'forest'); setLastFour(card.lastFour ?? '');
  }

  async function save() {
    setMessage(''); setFailed(false);
    try {
      await mutate('card', [{ ...card, name: name.trim(), limit: parseMoney(limit), closingDay: Number(closing), dueDay: Number(due), network, theme, lastFour: lastFour.trim() }]);
      setEditId(''); setMessage('Cartão atualizado.');
    } catch (error) { setFailed(true); setMessage((error as Error).message); }
  }

  async function remove() {
    setMessage(''); setFailed(false);
    try {
      await mutate('card_delete', [{ id: deleteId }]);
      setDeleteId(''); setMessage('Cartão excluído dos seus registros.');
    } catch (error) { setFailed(true); setMessage((error as Error).message); }
  }

  return <View style={{ gap: 12 }}>
    <View style={[styles.row, { justifyContent: 'flex-start' }]}>
      <Button title={`Editar ${card.name}`} label="Editar" secondary icon="edit-2" disabled={busy} onPress={startEdit} />
      <Button title={`Excluir cartão ${card.name}`} label="Excluir" secondary danger icon="trash-2" disabled={busy} onPress={() => {
        const reason = cardDeleteReason(state, card.id);
        setEditId(''); setMessage(reason); setFailed(!!reason); setDeleteId(reason ? '' : card.id);
      }} />
    </View>
    {editId === card.id && <View style={{ gap: 16 }}>
      <Text style={styles.heading}>Editar {card.name}</Text>
      <Field label="Nome do cartão" value={name} onChangeText={setName} maxLength={80} />
      <Field label="Limite cadastrado (R$)" value={limit} onChangeText={setLimit} keyboardType="decimal-pad" />
      <Field label="Dia de fechamento (1 a 28)" value={closing} onChangeText={setClosing} keyboardType="number-pad" />
      <Field label="Dia de vencimento (1 a 28)" value={due} onChangeText={setDue} keyboardType="number-pad" />
      <CardAppearanceFields network={network} theme={theme} lastFour={lastFour} onNetwork={setNetwork} onTheme={setTheme} onLastFour={setLastFour} />
      <Button title="Salvar alterações do cartão" label="Salvar alterações" icon="check" disabled={busy} onPress={() => void save()} />
      <Button title="Cancelar edição do cartão" secondary disabled={busy} onPress={() => setEditId('')} />
    </View>}
    {deleteId === card.id && <View style={{ gap: 12 }}>
      <Notice error>Excluir {card.name} remove o cadastro e o limite de {money(card.limit)}. Isso não altera nada no banco. Só é permitido sem compras ou pagamentos vinculados.</Notice>
      <Button title={`Confirmar exclusão de ${card.name}`} label="Excluir este cartão" danger disabled={busy} onPress={() => void remove()} />
      <Button title="Cancelar exclusão" secondary disabled={busy} onPress={() => setDeleteId('')} />
    </View>}
    {!!message && <Notice error={failed}>{message}</Notice>}
  </View>;
}
