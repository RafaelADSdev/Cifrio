---
version: 1
slug: "src-app-tabs-cards-tsx"
primary_target: "src/app/(tabs)/cards.tsx"
related_targets: ["src/ui/CardVisual.tsx"]
---

# Cores originais — correção 2.1.1

Pedido explícito: "eu quero que mandetenha suas cores iniciais não esse verde com preto". Este contrato prevalece sobre as paletas descritas nos registros anteriores.

THESIS: identidade original Cifrio com a organização compacta inspirada na Finza.

OWN-WORLD: fundo #F4F8FC, superfícies #FFFFFF, tinta/paineis #042453, ação #0474E0, acento #23D2BF. Tons recuperados diretamente de git HEAD:src/ui/components.tsx. Não usar o verde-lima ou fundo preto da demo.

STORY: manter início compacto, atalhos, bandeira/final e seleção de cartão; restaurar cores em todo o app, entrada Google e metadados de splash.

FIRST VIEWPORT: composição 2.1.0 preservada, com superfícies claras, carteira azul-marinho e controles azuis. Cartões com variações de azul/ciano e tinta branca.

FORM: correção de interpretação da referência, sem nova direção ou comp. Semente 7a9af249 histórica não determina a paleta; o pedido explícito e os tokens originais prevalecem.

FINISH: teste de contraste e responsividade, revisão independente das capturas web corrigidas e documentação da identidade original.

## Compatibilidade

- Os IDs de tema forest/carbon/ocean/plum são preservados no armazenamento; a apresentação passa a Azul Cifrio/Azul-marinho/Ciano/Azul profundo.
- Não alterar os pixels da logo, o símbolo oficial do Google, autenticação ou cálculos financeiros.
- Recuperar o contraste branco dos textos dentro dos cartões azuis. Sidebar ativa usa tinta azul-marinho sobre azul claro; estados do botão mantêm contraste, sem clarear por opacidade.
- PATCH 2.1.1 corrige a paleta anterior sem funções novas ou remoções. Android versionCode 5, iOS buildNumber 5; nenhum APK novo.

## Validação em 06/10/2026

- TypeScript e 87 testes unitários aprovados.
- 13 jornadas de navegador aprovadas, incluindo cartão personalizado, persistência, filtros, estatísticas, ajuda, CSV e operações financeiras. Axe e overflow verificados em 320, 390, 768 e 1440 px.
- Contraste corrigido nos estados hover/press dos botões azuis e no item ativo da sidebar, mantendo os tons originais.
- Capturas compact-mobile.png, compact-desktop.png e themed-card-mobile.png atualizadas com a paleta clara/azul. Revisor independente retornou ship para essa restauração na prévia web.
- Exportação web e bundle Android/Hermes aprovados. Sem APK novo, implantação ou validação visual em aparelho nesta correção.
