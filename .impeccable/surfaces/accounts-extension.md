# Suas contas — extensão operacional

Direção incumbente `4a6b2fab`, Operate, code-led. Sem troca de marca/tokens. Alvo `src/app/(tabs)/accounts.tsx`, relacionados `src/ui/AccountActions.tsx`, `src/ui/RecurringAccounts.tsx`. Qualidade: DESIGN.md atual e capturas accounts-mobile do remake, organização Conta Gotas/Tekton já aprovadas.

## FIRST VIEWPORT

Conta e saldo registrado, ação Adicionar fundos ao lado da exclusão protegida. Primeiro viewport móvel dá acesso a ações sem precisar caçar formulários. Múltiplas contas em linhas, não coleção de novos cards decorativos.

## VISITOR PATH

Escolher conta → adicionar fundos com data/valor e confirmar → entrada visível no extrato. Exclusão só após confirmação e apenas sem vínculos. Abaixo, planejar salário/despesa mensal e confirmar ocorrência do mês, distinguindo previsto de registrado.

## SIGNATURE INTERACTION

Expansão inline do formulário de fundos, sem modal. Recorrência passa de pendente para registrado por chave estável mensal; saldo só muda após confirmação. Pausar/remove regra sem apagar histórico.

## MOTION GRAMMAR

Feedback compartilhado de pressionado/carregamento; nenhum movimento ornamental novo. Conteúdo nunca oculto por animação para captura.

## RESPONSIVE BEHAVIOR

Preservar navegação/safe areas. Linhas e ações quebram em 320/390; formulário legível até desktop. Testar quatro larguras e axe. Evidência nesta entrega é web, não homologação em aparelho.

## CONTENT AND STATES

Dados vazios reais, dados sintéticos somente em testes. Previsto não é saldo. Sem débito automático ou execução em background. Dias 29–31 ajustam ao fim do mês. Bloquear saldo/histórico incorreto, falha de persistência, duplicação, conta com movimentações/transferências/recorrências. Recorrência online exige nova migração não presumida aplicada. Nenhum segredo ou dado de outro projeto reutilizado.
