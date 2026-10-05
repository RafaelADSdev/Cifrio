# Estado da primeira entrega — 05/10/2026

## Implementado e verificado localmente

React Native/Expo 57 com navegação em cinco abas, formulários em português e modo local explícito. Contas, receitas/despesas/Pix manual, transferências, edição/exclusão, cartões, parcelas, pagamento de faturas, resumo mensal, categorias, CSV/OFX e exportação JSON.

28 testes de domínio/importação/PostgreSQL passaram. Sete testes de navegador passaram após o remake: jornada financeira com persistência e exportação, CSV/reimportação, responsividade e checagem axe das cinco abas em 320, 390, 768 e 1440 pixels, além de foco/erro local/navegação mensal. A revisão de CSV populada também passa no axe. Sem overflow horizontal de documento nas larguras verificadas. Revisão automática não é certificação de acessibilidade nem teste com leitor de tela nativo.

TypeScript passou; export web passou; bundles de Android/iOS foram gerados. Expo Doctor passou nos 21 checks após fixar peers compatíveis. Não há APK/IPA publicado ou compilado, teste em celular, nem evidência de autenticação Supabase real.

Migração PostgreSQL executada em PGlite com auth simulado: RLS com dois usuários, referências cruzadas bloqueadas, lotes atômicos, idempotência e invariantes de fatura. Snapshot de leitura evita truncar extrato no limite de linhas da Data API. Nenhuma alteração aplicada no Supabase hospedado.

## Configuração externa

- Mapa de acessos fornecido não encontrado neste computador.
- Conector Supabase consultado em leitura: apenas projeto de outro produto. Não foi alterado nem reutilizado.
- Projeto informado pelo usuário: `dhoptxnfzxpocgxmgdrs`. URL/chave publicável configuradas no `.env` local ignorado pelo Git. Auth settings respondeu HTTP 200: cadastro por e-mail habilitado, confirmação obrigatória. Formulário online aparece na prévia sem erros de navegador.
- Conector administrativo recusou acesso ao projeto informado. Nenhuma migração ou alteração remota foi executada. API retorna PGRST205 para `finance_accounts` e PGRST202 para `read_finance`: objetos não encontrados no schema cache. Aplicação/verificação do schema, login real e leitura/escrita autenticada continuam pendentes.
- Fornecedor de Open Finance não escolhido. Sandbox real e conexão bancária não executados.
- Tipos PF/PJ, cartões e amostras bancárias reais ainda necessários para validar cobertura.

## Pendências do plano

Tarefa 1 documentada; tarefa 2 apenas pesquisa documental. Tarefa 3 tem código e testes PostgreSQL locais, mas login/recuperação em aparelho e isolamento via Supabase hospedado continuam abertos. Tarefas 4–6 têm fluxos locais; tarefa 7 tem pagamento, sem estorno explícito. Tarefas 8–9 têm CSV/OFX com fixtures sintéticas, sem homologação por banco. Tarefa 10 (PDF) não implementada. Tarefa 11 tem dashboard, sem orçamento por categoria. Tarefa 12 (recorrências/notificações) pendente. Tarefa 13 (Open Finance real) pendente. Tarefa 14 tem exportação, sem restauração/backup gerenciado; os originais não são enviados ou retidos no servidor. Tarefa 15 (beta nativo/comercial) pendente.

## Dependências

`npm audit` após correção compatível de decode-uri-component: 27 alertas (19 high, 8 moderate), propagados de três dependências-base: braces, node-forge e uuid, na árvore do Expo/Metro/Xcode. A sugestão automática inclui downgrade incompatível do Expo; não foi aplicada. As versões publicadas consultadas de braces/node-forge permanecem nas faixas alertadas. UUID na ferramenta Xcode requer revisão específica de uso/API antes de override de major. Nenhuma afirmação de prontidão para produção enquanto esses alertas e a validação nativa/online estiverem pendentes.

## Documentação

Sistema visual atual: `../DESIGN.md`, `../.impeccable/design.json`. Direção do remake e referências: `REMAKE-BRIEF.md`. Produto: `../PRODUCT.md` e `PRODUCT.md`. Banco e integrações: `OPEN-FINANCE.md`. Instruções para executar/configurar/testar: `../README.md`. Capturas com registros sintéticos: `../.impeccable/review/` e `evidence/`.

## Remake visual

Identidade substituída com autorização: acabamento da Tekton e organização do Conta Gotas como referências, sem copiar marcas. Manrope, Feather, azul profundo/verde funcional, seletor de mês horizontal, dashboard hierárquico, extrato em linhas, cartões manuais e formulários consistentes. Safe areas Android existentes preservadas. Primeira review da prévia web retornou `fix` para welcome alto demais e sidebar mínima automática; corrigidos em uma rodada, com regressões cobertas por teste. Resultado da conferência visual final registrado em `../.impeccable/review/REVIEW.md`.

Build web, bundles Android/iOS e TypeScript passaram novamente. Expo Doctor: 21/21 checks. Sem teste em aparelho, APK/IPA, homologação de leitor de tela ou dark mode; a revisão visual não amplia a evidência externa do Supabase/Open Finance. Auditoria de dependências permanece com 27 alertas (19 high, 8 moderate); remake não removeu esse gate de produção.
