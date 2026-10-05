---
version: 1
slug: "src-app-tabs-index-tsx"
primary_target: "src/app/(tabs)/index.tsx"
related_targets: ["src/ui/components.tsx","src/app/(tabs)/_layout.tsx"]
---

# Remake visual — pesquisa inicial

Estado: usuário aprovou Tekton + Conta Gotas e substituição da identidade. Execução direta e revisão da prévia web; nenhuma alegação de homologação nativa.

## Pedido e limites

Refazer o visual com as skills Impeccable e Frontend UI Engineering, usando os projetos anteriores como referência de qualidade. Preservar dados, cálculos, importação, navegação funcional e a distinção entre teste local e Supabase. Não apresentar banco conectado, gráfico ou métrica fictícia. Preservar os ajustes existentes de safe area Android e root layout; há alterações prévias nessas áreas.

## Evidências inspecionadas

- Gestão: `src/ui/components.tsx`, dashboard, layouts, `.project/evidence/dashboard-mobile.png`. Primeiro viewport dominado por seletores de mês quebrados em múltiplas linhas e painéis largos; estatísticas ficam abaixo. Tipografia do sistema, glifos Unicode na navegação, containers visualmente equivalentes.
- Tekton institusional: `DESIGN.md` e `.impeccable/review/mobile.png`. Hierarquia tipográfica expressiva, contrastes materiais, regras de alinhamento, ação destacada. Aproveitar disciplina, não paleta violeta ou composição de landing page.
- Conta Gotas / Hubon: `Projetos/Conta Gotas/Conta Gotas ESTILO VISUAL PRA COPIAR OU USAR COMO BASE/DESIGN.md`. Shell operacional, Manrope/Inter, controles consistentes, densidade e navegação móvel. As regras de preservação desse repositório não definem a identidade de Gestão.
- Projeto Jairo Rocha: `DESIGN.md`. Composição aberta, leitura editorial, Manrope e tipografia numérica contextualizada. Não reutilizar fotografias, selo, vermelho ou identidade imobiliária.
- Lara / Espelhos Digitais: `Projetos/Lara/DESIGN.md`. Um título dominante por dobra, alternância consciente de densidade e explicação contextual dos dados.

## Hipótese a confirmar

Direção de produto financeiro pessoal: navegação nativa compacta; início com visão do mês e acesso rápido a registrar movimentação; hierarquia forte entre saldo, entradas/saídas e compromissos; extrato com linhas precisas, não painel por item; cartões com identidade própria de cartão cadastrado, não falsas conexões bancárias; formulários limpos e agrupados. Obter personalidade do rigor visual da Tekton e organização operacional do Conta Gotas, com identidade original e ícones de uma biblioteca consistente.

## Próximas ações

Confirmar referência prioritária e liberdade para substituir identidade. Seguir os passos de direção da Impeccable, registrar contrato, implementar sistema compartilhado e telas, validar jornadas existentes e navegador em larguras móveis/desktop, realizar finish review e documentar sistema efetivamente construído. Teste em navegador não substitui validação em aparelho.

## Direction contract

THESIS: Controle diário legível em uma tela; recusar a pilha de painéis equivalentes.

OWN-WORLD: Superfícies claras, azul profundo, tinta verde funcional, Manrope; linhas alinhadas e controles de 48 pontos.

STORY: Entender o mês, conferir contas e compromissos, registrar ou revisar uma movimentação.

FIRST VIEWPORT: Cabeçalho compacto; seletor de mês horizontal; saldo e resultado contextualizados; entradas/saídas pareadas; ação de registro visível. Desktop abre colunas; telefone preserva navegação inferior.

FORM: Mesa financeira, direção fixada pelo usuário sobre o sorteio `4a6b2fab`. Interação assinatura: mês percorre números e categorias conjuntamente, sem animação obrigatória. Risco: dados vazios pedem orientação, não decoração.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Semente e critérios

Lista fundamentada: mesa financeira, agenda de compromissos, recibo organizado, carteira de contas, boletim de saldos, quadro de conciliação, catálogo de faturas. A semente atribuiu índice 5; a direção já aprovada pelo usuário prevalece. Console grafite: competitivo em precisão, rejeitado como tema permanente para leitura diária; manter isolamento de exclusão. Feed vertical, mapa e sleeve codificado perdem clareza operacional; manter prioridade por viewport, legenda textual e identificação explícita. Espécime de grade e folhas de exposição perdem familiaridade; manter alinhamento e gradação tonal. Sem apropriação de motivos, fundos ou componentes dessas referências.
