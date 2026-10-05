# Tarefas propostas — gestão financeira mobile

Status: backlog de planejamento, sem implementação iniciada. Os arquivos abaixo são destinos sugeridos; a estrutura será confirmada ao iniciar o projeto. Comandos de testes/build serão definidos com o scaffold, sem apresentar comandos inexistentes como executados.

## 1. Fechar contrato do piloto

Definir bancos/cartões prioritários, plataformas, regras de relatório e amostras de extrato sem segredos versionados.

- [ ] Público e escopo do piloto registrados.
- [ ] Matriz de bancos, formatos e orçamento preenchida ou explicitamente pendente.
- [ ] Fluxos de despesa, parcela e importação descritos.

Verificação: revisão dos fluxos com exemplos de valores conhecidos.
Dependências: nenhuma. Escopo: pequeno. Arquivos: `tasks/plan.md`, `.project/PRODUCT.md`.

## 2. Prova técnica e comercial de Open Finance

Avaliar primeiro elegibilidade e cobertura das APIs oficiais de Banco do Brasil, Mercado Pago, PicPay e Inter (PF/PJ ainda pendente). Investigar também um adapter de fornecedor, consentimento e retorno ao mobile em ambiente simulado. A execução depende de conta e credenciais apropriadas, não obtidas nesta fase.

- [ ] Consentimento e retorno ao app testados em sandbox.
- [ ] Contas, transações e recursos de cartão avaliados, inclusive campos ausentes.
- [ ] Cobertura e condições de produção documentadas sem confundir sandbox com banco real.

Verificação: registrar evidência simulada de sucesso, recusa e reconexão; cotejar com documentação e proposta comercial disponível.
Dependências: 1. Escopo: médio. Arquivos: `src/integrations/banking/adapter.ts`, `src/integrations/banking/sandbox.ts`, `tests/banking-adapter.test.ts`, `.project/OPEN-FINANCE.md`.

## Checkpoint A — escopo

- [ ] Revisar direção e riscos antes da implementação do MVP.
- [ ] Escolha de provedor permanece provisória até teste real e custo confirmado.

## 3. Autenticação e dados isolados

Entregar login/recuperação e conta financeira por usuário com Supabase Auth e RLS.

- [ ] Login, logout e recuperação funcionam em aparelho.
- [ ] Usuário A não lê ou altera dados do usuário B, inclusive por referência cruzada.
- [ ] Segredos administrativos não estão no bundle mobile.

Verificação: testes de autorização com dois usuários e tentativa de acesso direto à API; inspeção do bundle/configuração.
Dependências: 1. Escopo: médio. Arquivos: `src/app/(auth)/index.tsx`, `src/lib/supabase.ts`, `src/features/accounts/service.ts`, migração gerada pelo CLI, `tests/rls.test.ts`.

## 4. Registrar receita e despesa

Entregar inclusão, edição, exclusão e consulta de movimentações na conta, incluindo Pix manual.

- [ ] Lançamentos persistem e aparecem no histórico filtrado.
- [ ] Saldo confere com saldo inicial e movimentações realizadas.
- [ ] Valores, sinais e datas são validados sem erros de arredondamento.

Verificação: cenários determinísticos de saldo e jornada mobile de criar/editar/excluir.
Dependências: 3. Escopo: médio. Arquivos: `src/features/transactions/form.tsx`, `src/features/transactions/service.ts`, `src/features/transactions/money.ts`, migração gerada pelo CLI, `tests/transactions.test.ts`.

## 5. Transferir entre contas

Entregar movimentação atômica entre duas contas do proprietário.

- [ ] Saída e entrada são gravadas juntas ou nenhuma é gravada.
- [ ] Transferência não altera totais de receita e despesa.
- [ ] Repetição de requisição não duplica a operação.

Verificação: falha durante gravação, reenvio e contas de titulares distintos.
Dependências: 4. Escopo: médio. Arquivos: `src/features/transfers/form.tsx`, `src/features/transfers/service.ts`, migração gerada pelo CLI, `tests/transfers.test.ts`.

## Checkpoint B — núcleo financeiro

- [ ] Isolamento e cálculos passam nos testes focados.
- [ ] Jornada de movimentações funciona em build de desenvolvimento.

## 6. Compras e parcelas no cartão

Entregar cartão, compras e projeção de parcelas por fatura.

- [ ] Soma das parcelas coincide com a compra, incluindo restos de centavos.
- [ ] Datas de fechamento e virada de mês seguem regra documentada.
- [ ] Fatura estimada é distinguida de fatura recebida do banco.

Verificação: compra de valor indivisível, ano novo e compra próxima ao fechamento.
Dependências: 4. Escopo: médio. Arquivos: `src/features/cards/form.tsx`, `src/features/cards/purchases.ts`, `src/features/cards/installments.ts`, migração gerada pelo CLI, `tests/installments.test.ts`.

## 7. Pagar e ajustar faturas

Entregar pagamento parcial/integral e estorno vinculado à compra.

- [ ] Pagamento atualiza conta e obrigação atomicamente.
- [ ] Relatório não conta compra e pagamento como duas despesas.
- [ ] Estorno e saldo restante da fatura são demonstráveis.

Verificação: pagamento parcial seguido de integral e estorno em outra competência.
Dependências: 5, 6. Escopo: médio. Arquivos: `src/features/cards/statement.tsx`, `src/features/cards/payments.ts`, migração gerada pelo CLI, `tests/statements.test.ts`.

## 8. Importar CSV com revisão

Entregar upload privado, mapeamento, prévia e confirmação idempotente.

- [ ] CSV com vírgula decimal, delimitadores distintos e datas locais é normalizado.
- [ ] Linhas inválidas e candidatos a duplicidade são revisáveis.
- [ ] Reimportação não duplica lançamentos; arquivos não são acessíveis por outro usuário.

Verificação: fixtures sintéticas, reimportação, falha de confirmação e acesso ao Storage com dois usuários.
Dependências: 4, 7. Escopo: médio. Arquivos: `src/features/imports/csv.ts`, `src/features/imports/review.tsx`, `src/features/imports/service.ts`, migração gerada pelo CLI, `tests/imports.test.ts`.

## Checkpoint C — cartões e importação

- [ ] Relatórios conferem antes/depois de importar.
- [ ] Transferência e pagamento de fatura não duplicam despesas.

## 9. Importar OFX

Adicionar um adapter OFX sem mudar o fluxo de revisão.

- [ ] Fixtures representativas dos bancos prioritários são interpretadas.
- [ ] IDs de origem são preservados e datas/sinais normalizados.
- [ ] Arquivo incompatível falha sem criar movimentações.

Verificação: fixtures sintéticas e comparação de totais com amostras locais autorizadas.
Dependências: 8. Escopo: pequeno. Arquivos: `src/features/imports/ofx.ts`, `src/features/imports/formats.ts`, `tests/ofx.test.ts`.

## 10. Importar um layout de PDF com texto

Entregar parser para um layout prioritário, com processamento assíncrono quando necessário.

- [ ] Linhas, cabeçalhos e totais não são confundidos.
- [ ] Prévia permite corrigir ou rejeitar a extração.
- [ ] PDF de imagem, protegido ou desconhecido informa a limitação sem gravar dados.

Verificação: fixtures sintéticas com quebra de página, sinais e tabelas; comparação de lançamentos/totais.
Dependências: 8, definição do banco/layout. Escopo: médio por layout. Arquivos: `workers/imports/pdf.ts`, `workers/imports/layouts/first-bank.ts`, `src/features/imports/pdf-status.tsx`, `tests/pdf-import.test.ts`.

## 11. Dashboard e orçamento

Entregar resumo do mês, compromissos futuros e limites por categoria.

- [ ] Totais conferem com os lançamentos canônicos.
- [ ] Saldo disponível, previsto e fatura aparecem como conceitos distintos.
- [ ] Categoria corrigida pelo usuário permanece após atualização da fonte.

Verificação: fixtures com transferências, cartão e diferentes origens; jornada em aparelho e acessibilidade básica.
Dependências: 5, 7, 8. Escopo: médio. Arquivos: `src/features/dashboard/screen.tsx`, `src/features/dashboard/queries.ts`, `src/features/budgets/screen.tsx`, `tests/dashboard.test.ts`.

## 12. Recorrências e lembretes

Entregar regras recorrentes e notificações de vencimento com permissão do usuário.

- [ ] Regra não gera duas obrigações no mesmo período.
- [ ] Previsão não aparece como despesa paga antes da confirmação.
- [ ] Lembrete funciona em aparelho e respeita desativação/permissões.

Verificação: reexecução, mudança de mês, fuso e permissões negadas.
Dependências: 11. Escopo: médio. Arquivos: `src/features/recurring/service.ts`, `src/features/reminders/service.ts`, migração gerada pelo CLI, `tests/recurring.test.ts`.

## 13. Piloto de sincronização real

Ativar um provedor após condições e acesso de produção confirmados. Separar o ingest de eventos e o adapter em subtarefas se exceder cinco arquivos.

- [ ] Conta e cartão reais do piloto conferem com extrato e fatura.
- [ ] Reenvio, reconexão e revogação não duplicam operações nem vazam dados.
- [ ] Dados já importados são reconciliados e última atualização aparece no app.

Verificação: jornada consentida real; logs sem dados sensíveis; revisão de custo e cobertura.
Dependências: 2, 8, 11, acesso de produção. Escopo: médio por adapter. Arquivos: `src/integrations/banking/provider.ts`, `supabase/functions/bank-webhook/index.ts`, `workers/banking/sync.ts`, `tests/bank-sync.test.ts`, `.project/OPEN-FINANCE.md`.

## Checkpoint D — prontidão do piloto

- [ ] Distinguir evidência local, sandbox e produção real.
- [ ] Importação permanece funcional se sincronização estiver indisponível.

## 14. Exportação e retenção

Entregar exportação dos registros e execução da política de arquivos temporários.

- [ ] Exportação contém dados apenas do proprietário.
- [ ] Arquivos temporários expiram conforme política definida.
- [ ] Recuperação por backup é testada no ambiente de teste.

Verificação: teste de exportação com dois usuários e ensaio de recuperação sem afetar produção.
Dependências: 8, 11. Escopo: médio. Arquivos: `src/features/export/service.ts`, `workers/imports/retention.ts`, `tests/export.test.ts`, `.project/DATA-LIFECYCLE.md`.

## 15. Beta e preparação comercial

Validar o piloto em aparelhos e registrar pendências para distribuição.

- [ ] Jornadas essenciais verificadas nas plataformas escolhidas.
- [ ] Privacidade, exclusão de conta, observabilidade e custos têm decisões registradas.
- [ ] Limitações e falhas recuperáveis estão claras ao usuário.

Verificação: roteiro mobile, revisão de autorização e ensaio de erro/recuperação. Publicação e cobrança ficam fora desta tarefa de planejamento.
Dependências: 10, 12, 14; 13 se sincronização for parte do beta. Escopo: médio para documentação/QA; correções descobertas viram tarefas pequenas próprias. Arquivos: `.project/BETA.md`, `.project/RELEASE.md`, `.project/PRIVACY.md`, `tests/mobile/journey.yaml`.

## Checkpoint final

- [ ] Critérios de cada entrega cumpridos e evidenciados.
- [ ] Separar custos e dependências ainda pendentes das funcionalidades validadas.
- [ ] Revisar o resultado antes de publicação ou contratação.
