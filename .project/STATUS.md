# Estado da primeira entrega — 05/10/2026

## Implementado e verificado localmente

React Native/Expo 57 com navegação em cinco abas, formulários em português e modo local explícito. Contas, receitas/despesas/Pix manual, transferências, edição/exclusão, cartões, parcelas, pagamento de faturas, resumo mensal, categorias, CSV/OFX e exportação JSON.

28 testes de domínio/importação/PostgreSQL passaram. Seis testes de navegador passaram: jornada financeira com persistência e exportação, CSV/reimportação e revisão de responsividade/acessibilidade do dashboard em 320, 390, 768 e 1440 pixels. As cinco abas foram percorridas nas quatro larguras sem overflow horizontal de documento. Revisão automática não é certificação de acessibilidade nem teste com leitor de tela nativo.

TypeScript passou; export web passou; bundles de Android/iOS foram gerados. Expo Doctor passou nos 21 checks após fixar peers compatíveis. Não há APK/IPA publicado ou compilado, teste em celular, nem evidência de autenticação Supabase real.

Migração PostgreSQL executada em PGlite com auth simulado: RLS com dois usuários, referências cruzadas bloqueadas, lotes atômicos, idempotência e invariantes de fatura. Snapshot de leitura evita truncar extrato no limite de linhas da Data API. Nenhuma alteração aplicada no Supabase hospedado.

## Configuração externa

- Mapa de acessos fornecido não encontrado neste computador.
- Conector Supabase consultado em leitura: apenas projeto de outro produto. Não foi alterado nem reutilizado.
- Projeto de desenvolvimento e variáveis publicáveis continuam pendentes.
- Fornecedor de Open Finance não escolhido. Sandbox real e conexão bancária não executados.
- Tipos PF/PJ, cartões e amostras bancárias reais ainda necessários para validar cobertura.

## Pendências do plano

Tarefa 1 documentada; tarefa 2 apenas pesquisa documental. Tarefa 3 tem código e testes PostgreSQL locais, mas login/recuperação em aparelho e isolamento via Supabase hospedado continuam abertos. Tarefas 4–6 têm fluxos locais; tarefa 7 tem pagamento, sem estorno explícito. Tarefas 8–9 têm CSV/OFX com fixtures sintéticas, sem homologação por banco. Tarefa 10 (PDF) não implementada. Tarefa 11 tem dashboard, sem orçamento por categoria. Tarefa 12 (recorrências/notificações) pendente. Tarefa 13 (Open Finance real) pendente. Tarefa 14 tem exportação, sem restauração/backup gerenciado; os originais não são enviados ou retidos no servidor. Tarefa 15 (beta nativo/comercial) pendente.

## Dependências

`npm audit` após correção compatível de decode-uri-component: 27 alertas (19 high, 8 moderate), propagados de três dependências-base: braces, node-forge e uuid, na árvore do Expo/Metro/Xcode. A sugestão automática inclui downgrade incompatível do Expo; não foi aplicada. As versões publicadas consultadas de braces/node-forge permanecem nas faixas alertadas. UUID na ferramenta Xcode requer revisão específica de uso/API antes de override de major. Nenhuma afirmação de prontidão para produção enquanto esses alertas e a validação nativa/online estiverem pendentes.

## Documentação

Direção e fluxos: `DESIGN.md`, `PRODUCT.md`. Banco e integrações: `OPEN-FINANCE.md`. Instruções para executar/configurar/testar: `../README.md`. Artefatos visuais sintéticos: `evidence/`.
