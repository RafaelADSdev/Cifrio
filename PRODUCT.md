# Cifrio

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Users

Produto de finanças pessoais, com o fundador como primeiro usuário de teste. Aplicativo mobile em React Native/Expo, com prévia web para desenvolvimento.

## Product Purpose

Acompanhar dinheiro em contas, movimentações e compromissos de cartão sem duplicar despesas. Consulta do mês, registro manual e importação revisada de extratos.

## Capabilities and Constraints

Contas, receitas/despesas/Pix manual, transferências, compras parceladas, faturas projetadas, pagamentos, edição/exclusão, CSV/OFX e exportação JSON. Dados só entram por ação explícita; não carregar números fictícios para preencher o dashboard. Modo local identificado, não seguro para informações sensíveis. Banco do Brasil, Mercado Pago, PicPay e Inter são prioridades, não conexões ativas. Supabase configurado no cliente; schema remoto e testes autenticados pendentes. PDF, Open Finance, recorrências e orçamentos ainda pendentes. Dias de fechamento e vencimento limitados a 1–28.

## Brand Commitments

Cifrio é a identidade de trabalho autorizada pelo pedido de nome e logo; ainda sem validação de marca ou domínio. Símbolo C azul-marinho com detalhe verde, com origem em `assets/brand/README.md`. Voz em português brasileiro. Usuário aprovou substituir a identidade visual usando acabamento da Tekton e organização do Conta Gotas como referências principais, sem copiar marcas.

## Evidence on Hand

Domínio financeiro e jornadas de navegador existentes. Pesquisa de referências em `.project/REMAKE-BRIEF.md`. Perfil permite editar nome e escolher/remover foto, com armazenamento local separado no piloto e Storage privado previsto no online. Login Google implementado via Supabase OAuth PKCE; provider remoto habilitado e início de autorização verificado, mas login real e retorno nativo não testados. Migration de avatars ainda não aplicada no projeto remoto. Configuração e limites em `.project/GOOGLE-PROFILE-SETUP.md`. Validação web não significa validação em aparelho. Preservar ajustes prévios de safe area Android.

## Product Principles

- Registro manual não é saldo consultado no banco.
- Projeção de fatura não é documento bancário.
- Separar dados locais e sessão online.
- Preservar precisão em centavos e revisão antes da importação.
