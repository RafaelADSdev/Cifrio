import { Redirect, router } from 'expo-router';
import { Text } from 'react-native';
import { useFinance } from '../state/FinanceProvider';
import { Box, Button, Page, styles } from '../ui/components';

const answers = [
  ['Como os saldos são calculados?', 'O saldo registrado soma o saldo inicial e as entradas e saídas da conta. Compras no cartão entram na fatura; pagamentos de fatura saem da conta.'],
  ['Uma transferência aumenta meus gastos?', 'Transferir entre suas contas muda os saldos, mas não altera receitas e despesas nas estatísticas. Registre os dois lados usando o tipo Transferência.'],
  ['Por que a compra no cartão aparece em outro mês?', 'Cada parcela entra na competência da fatura. Compras a partir do dia de fechamento começam na fatura seguinte. O extrato mostra a data original da compra.'],
  ['Pagar a fatura conta como outra despesa?', 'Não. A despesa já está nas parcelas. O pagamento reduz o saldo da conta e o valor em aberto da fatura.'],
  ['Como importar um extrato?', 'Cadastre a conta, abra Importar e escolha CSV, OFX ou PDF com texto. Revise linhas, categorias e duplicatas antes de confirmar. PDFs sem texto podem não ser reconhecidos.'],
  ['O Cifrio envia Pix ou consulta o banco?', 'Os registros e transferências são controle financeiro dentro do app. Não enviam dinheiro nem consultam o saldo bancário. A sincronização depende de uma integração bancária.'],
  ['Onde ficam os dados do teste local?', 'Os registros do teste local ficam neste dispositivo. Não há garantia de backup. Você pode exportar um JSON pela tela Contas; exportar não cria uma sincronização automática.'],
];
export default function Help() {
  const { mode } = useFinance();
  if (mode === 'welcome') return <Redirect href="/" />;
  return <Page title="Central de ajuda" subtitle="Entenda seus registros e os recursos do Cifrio.">
    <Button title="Voltar" secondary icon="arrow-left" onPress={() => router.canGoBack() ? router.back() : router.replace('/')} />
    {answers.map(([question, answer]) => <Box key={question} title={question}><Text style={styles.text}>{answer}</Text></Box>)}
    <Button title="Ver estatísticas" secondary icon="bar-chart-2" onPress={() => router.push('/statistics')} />
  </Page>;
}
