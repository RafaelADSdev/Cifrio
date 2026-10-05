# Contas, fundos e recorrências mensais

## Como usar

- Em **Contas → Saldos registrados**, escolha **Adicionar fundos**. Valor, descrição e data criam uma receita no extrato; o saldo inicial não é reescrito. Dinheiro entre suas próprias contas deve ser registrado como transferência no Extrato.
- **Excluir** exige confirmação. Contas com movimentações, inclusive como destino de transferência, ou com recorrências vinculadas não podem ser excluídas. Remover uma conta elegível retira seu saldo inicial dos registros; não altera o banco.
- Em **Salário e contas fixas**, cadastre receita/salário ou despesa, conta, valor, categoria, dia previsto e primeiro mês.
- Cada mês fica como previsão até **Recebi neste mês** ou **Paguei neste mês**. Uma previsão não aumenta nem reduz o saldo. Confirmação antes da data prevista não é permitida.
- Dias 29–31 usam o último dia disponível nos meses curtos. Pausar impede novas confirmações; retomar reativa a regra. Remover a previsão mantém os lançamentos já registrados.
- A confirmação utiliza Pix como forma de lançamento nesta versão. O lançamento pode ser corrigido no Extrato. Não há débito bancário automático, agendamento em background, frequência semanal/anual ou valor variável.

## Persistência e segurança

O modo local salva templates em `gestao.demo.v1`, junto aos registros existentes. Esse modo é teste, não um cofre seguro.

Online, a nova tabela `finance_schedules` utiliza proprietário relacional (`user_id`), RLS com `auth.uid()`, chave composta e vínculo de conta do mesmo usuário. Anônimos não recebem acesso. `read_finance` continua SECURITY INVOKER e acrescenta o campo `recurring`. Fundos e confirmação mensal usam o caminho já existente de lançamentos.

Chave `recurring:<id>:<AAAA-MM>` evita repetir a mesma confirmação. O índice de origem existente no banco cobre repetição por conta. Essa deduplicação **não** identifica automaticamente um salário/pagamento que já foi importado: confira o extrato antes de confirmar uma previsão.

Exclusão é filtrada por id, sujeita a RLS e vínculos relacionais. Uma resposta sem linha afetada não é tratada como sucesso. Sem migração, salvar recorrência online apresenta erro; não fazemos fallback silencioso para armazenamento local.

## Ativação no Supabase — pendente

A migração foi preparada e testada localmente, **não aplicada ao projeto hospedado**:

`supabase/migrations/20261005200529_monthly_schedules.sql`

Ela depende da migração financeira `20261005151013_financial_core.sql`, incluindo `private.lock_finance_owner`. Antes de aplicar, confira projeto de destino, migrações já executadas e backup. Aplique a nova migração pelo fluxo administrativo habitual; não execute todas as migrações pendentes cegamente contra um banco existente.

Após aplicar: testar com duas contas autenticadas, conferir isolamento, criação/leitura/pausa/exclusão de templates, confirmação única e bloqueio de exclusão da conta com vínculos. Testes PGlite e mocks não substituem esse teste pela API hospedada. Fazer auditoria RLS/advisors no projeto real.

## Verificação desta entrega

- TypeScript e 72 testes unitários/integração passaram: regras financeiras existentes, recorrências, migração em PostgreSQL local PGlite e chamadas do adaptador mockadas.
- A suíte completa passou com 12 testes de navegador, incluindo contas, CSV, PDF, perfil e OAuth simulado. A jornada nova cobre fundos, confirmação/cancelamento de exclusão, bloqueio por histórico, salário/despesa mensal, pausa, remoção sem apagar histórico e persistência após recarregar.
- Axe e overflow verificados em 320, 390, 768 e 1440 px. Capturas em `.impeccable/review/accounts-new-mobile.png`, `accounts-new-desktop.png`, `recurring-mobile.png` e `funds-mobile.png`.
- Build web exportado pelo Expo. Revisão visual independente: `ship` para prévia web, não aprovação de aparelho nativo ou backend hospedado.

## Próximas ideias pesquisadas, não implementadas

1. **Conciliação de recorrências e importação**: vincular a previsão ao lançamento já existente, em vez de registrar uma segunda vez. Prioridade para proteger o saldo. Referência: [YNAB Glossary — reconciliation](https://support.ynab.com/en_us/ynab-glossary-a-guide-BJd80SORq).
2. **Metas de reserva por conta**: separar objetivo planejado do dinheiro efetivamente disponível; acompanhar aportes sem contá-los novamente como receita. Referência: [YNAB — Goal Tracking](https://www.ynab.com/features/goal-tracking).
3. **Contas arquivadas**: ocultar da rotina contas com histórico, sem apagar registros. Ideia derivada da proteção de histórico implementada aqui.
4. **Calendário e lembretes de vencimento**: mostrar próximos compromissos e risco de saldo insuficiente sem executar pagamentos. Referência: [Actual Budget — Starting Fresh](https://actualbudget.org/docs/getting-started/starting-fresh/) para schedules e conciliação; alertas são proposta para o Cifrio.
