# Tela inicial — 2.2.0

Preservar identidade Cifrio e cálculos financeiros existentes. Pizza SVG em Android/iOS/web, legenda com valores e percentuais e entrada com escala, rotação e fade em 650ms. Movimento reduzido remove a animação.

Compromissos: total em aberto no horizonte de três meses e cartões por mês, em coluna mobile e linha a partir de 800px. Barras comparam o maior valor do horizonte, não um limite financeiro.

Navegação mobile: Início, Extrato, Cartões, Contas e Mais. Importar e Assinaturas em Mais e atalhos existentes. Desktop mantém seis destinos laterais. Safe area na margem inferior sem duplicação dentro da barra.

MINOR por melhoria significativa compatível: 2.2.0, contadores 6. APK compilado e verificado em 06/10/2026; registro em `ANDROID-APK.md`.

## Conferência em 06/10/2026

- Código visual conferido com capturas mobile e desktop. Pizza, legenda, total futuro e navegação aprovados nos testes em 320, 390, 768 e 1440px, incluindo ausência de overflow e análise de acessibilidade.
- TypeScript e 87 testes locais passaram. Exportação web e bundles Android/iOS passaram; isso não comprova renderização ou instalação em aparelho.
- Nove testes de navegador adicionais passaram: movimentações, parcelas, persistência, CSV, PDF sintético, assinaturas, teclado e layouts responsivos.
- Corrigidos testes antigos que procuravam Importar/Assinaturas na barra mobile: agora usam Mais; os destinos laterais de desktop permanecem cobertos.
- Versão 2.2.0 sincronizada em Expo, package, lock e Android nativo; contadores Android/iOS 6. APK `artifacts/cifrio-2.2.0-arm64.apk` gerado após a conferência, com versão, contador e assinatura verificados. Validação em celular continua pendente.
