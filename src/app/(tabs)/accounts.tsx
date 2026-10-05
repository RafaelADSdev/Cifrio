import { useState } from 'react';
import { Text, View } from 'react-native';
import { balance } from '../../domain/finance';
import { banks } from '../../domain/model';
import { money, parseMoney, today } from '../../domain/money';
import { newId, useFinance } from '../../state/FinanceProvider';
import { exportRecords } from '../../lib/export';
import { Box, Button, Choices, colors, Empty, Field, fonts, Icon, Notice, Page, styles } from '../../ui/components';
export default function Accounts() {
  const { state, mutate, busy, mode, leave, refresh } = useFinance();
  const [name, setName] = useState(''), [bank, setBank] = useState(banks[0]), [opening, setOpening] = useState('0'), [message, setMessage] = useState('');
  async function save() {
    setMessage('');
    try { await mutate('account', [{ id: newId(), name: name.trim(), bank, openingBalance: parseMoney(opening) }]); setName(''); setOpening('0'); setMessage('Conta adicionada.'); }
    catch (e) { setMessage((e as Error).message); }
  }
  return <Page title="Suas contas" subtitle="Um lugar para cada parte do seu dinheiro.">
    <Box title="Saldos registrados">{state.accounts.map(account => <View style={[styles.row, styles.line]} key={account.id}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, minWidth: 140 }}><View style={{ width: 40, height: 40, backgroundColor: colors.pale, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}><Icon name="briefcase" color={colors.primary} /></View><View style={{ flex: 1 }}><Text style={[styles.heading, { fontSize: 16 }]}>{account.name}</Text><Text style={styles.muted}>{account.bank}</Text></View></View><Text style={[styles.value, { fontSize: 23 }]}>{money(balance(state, account.id, today()))}</Text></View>)}{!state.accounts.length && <Empty icon="briefcase" title="Seu dinheiro começa aqui" detail="Adicione sua primeira conta abaixo, com o saldo anterior aos seus registros." />}</Box>
    <Box title="Adicionar conta"><Field label="Nome da conta" value={name} onChangeText={setName} placeholder="Ex.: Conta do dia a dia" maxLength={80} /><Choices label="Instituição" options={banks.map(b => ({ value: b, label: b }))} value={bank} onChange={setBank} /><Field label="Saldo inicial (R$)" value={opening} onChangeText={setOpening} keyboardType="decimal-pad" /><Text style={styles.muted}>Use o saldo anterior às movimentações que você vai registrar ou importar.</Text><Button title="Salvar conta" onPress={() => void save()} disabled={busy} /></Box>
    {!!message && <Notice>{message}</Notice>}
    <Box title="Conexões bancárias"><Text style={styles.muted}>Banco do Brasil, Mercado Pago, PicPay e Inter estão no piloto. Sincronização automática ainda depende da validação de acesso e do fornecedor.</Text><Text style={styles.text}>Nenhum banco conectado.</Text></Box>
    <Box title="Seu acesso"><Text style={styles.muted}>{mode === 'demo' ? 'Teste local. Não use este armazenamento como cofre de dados reais.' : 'Dados associados à sua conta Supabase.'}</Text><Button title="Exportar registros (JSON)" secondary disabled={busy} onPress={() => void exportRecords(state).catch(e => setMessage(e.message))} />{mode === 'remote' && <Button title="Atualizar dados" secondary onPress={() => void refresh()} disabled={busy} />}<Button title="Sair" secondary disabled={busy} onPress={() => void leave().catch(e => setMessage(e.message))} /></Box>
  </Page>;
}
