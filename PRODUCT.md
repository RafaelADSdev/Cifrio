# Cifrio

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Users

Produto de finanças pessoais, com o fundador como primeiro usuário de teste. Aplicativo mobile em React Native/Expo, com prévia web para desenvolvimento.

## Product Purpose

Acompanhar dinheiro em contas, movimentações e compromissos de cartão sem duplicar despesas. Consulta do mês, registro manual e importação revisada de extratos.

## Capabilities and Constraints

Contas, receitas/despesas/Pix manual, transferências, compras parceladas, faturas projetadas, pagamentos, edição/exclusão, CSV/OFX e exportação JSON. Dados só entram por ação explícita; não carregar números fictícios para preencher o dashboard. Modo local identificado, não seguro para informações sensíveis. Banco do Brasil, Mercado Pago, PicPay e Inter são prioridades, não conexões ativas. Supabase configurado no cliente; schema remoto e testes autenticados pendentes. PDF, Open Finance e orçamentos ainda pendentes. Dias de fechamento e vencimento limitados a 1–28.

Extensão de contas: entrada de fundos pelo extrato, exclusão com confirmação e bloqueio por histórico/vínculos, salário e despesas mensais previstas com confirmação manual. Pausar/remover previsões preserva os lançamentos. Recorrências de dia 29–31 ajustam ao último dia do mês; não executam débitos bancários. Modo online depende da migração mensal preparada, ainda sem comprovação de aplicação no projeto hospedado. Funcionamento e limites em `.project/ACCOUNTS-RECURRING.md`.

## Brand Commitments

Cifrio é a identidade de trabalho autorizada pelo pedido de nome e logo; ainda sem validação de marca ou domínio. Símbolo existente com origem em `assets/brand/README.md`, preservado sem recolorir. Voz em português brasileiro. A Finza inspira a organização compacta, os atalhos e a apresentação dos cartões. Em 06/10/2026 o usuário esclareceu que as cores iniciais do Cifrio devem permanecer: fundo claro, branco, azul-marinho, azul e ciano. Verde-lima e fundo preto da interpretação anterior foram descartados. O wordmark usa tinta azul-marinho no fundo claro. Contrato vigente em `.project/ORIGINAL-COLORS.md`; os registros Finza anteriores são históricos.

No refinamento compacto, bandeira e final de quatro dígitos são opcionais e informados pelo usuário. Em 2.1.1 os temas dos cartões usam variações de azul e ciano; os identificadores internos anteriores permanecem para preservar os cadastros. Login Google, funções e layout compacto continuam presentes.

## Evidence on Hand

Domínio financeiro e jornadas de navegador existentes. Pesquisa de referências em `.project/REMAKE-BRIEF.md`. Perfil permite editar nome e escolher/remover foto, com armazenamento local separado no piloto e Storage privado previsto no online. Login Google implementado via Supabase OAuth PKCE; provider remoto habilitado e início de autorização verificado, mas login real e retorno nativo não testados. Migration de avatars ainda não aplicada no projeto remoto. Configuração e limites em `.project/GOOGLE-PROFILE-SETUP.md`. Validação web não significa validação em aparelho. Preservar ajustes prévios de safe area Android.

## Product Principles

- Registro manual não é saldo consultado no banco.
- Projeção de fatura não é documento bancário.
- Separar dados locais e sessão online.
- Preservar precisão em centavos e revisão antes da importação.
