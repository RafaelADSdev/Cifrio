---
name: Cifrio — extensão de contas
description: Registro visual localizado de contas, fundos e recorrências; extensão da identidade existente.
colors:
  bg: "#F4F8FC"
  surface: "#FFFFFF"
  ink: "#042453"
  muted: "#3E5674"
  primary: "#0474E0"
  soft: "#D7E9FB"
  border: "#D5E3F0"
  negative: "#B2403B"
  pale: "#E7F2FC"
  errorSurface: "#FAECEB"
typography:
  display:
    fontFamily: "Manrope_800ExtraBold"
    fontSize: "28px"
    fontWeight: 800
    letterSpacing: "-0.7px"
  headline:
    fontFamily: "Manrope_700Bold"
    fontSize: "18px"
    fontWeight: 700
  value:
    fontFamily: "Manrope_800ExtraBold"
    fontSize: "23px"
    fontWeight: 800
    letterSpacing: "-0.6px"
    fontFeature: "tnum"
  body:
    fontFamily: "Manrope_400Regular"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: "23px"
  muted:
    fontFamily: "Manrope_400Regular"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "21px"
  label:
    fontFamily: "Manrope_500Medium"
    fontSize: "13px"
    fontWeight: 500
  button:
    fontFamily: "Manrope_700Bold"
    fontSize: "14px"
    fontWeight: 700
    lineHeight: "20px"
rounded:
  chip: "10px"
  control: "12px"
  container: "16px"
spacing:
  tight: "8px"
  row: "12px"
  group: "16px"
  panel: "20px"
  section: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "12px 18px"
  button-secondary:
    backgroundColor: "{colors.pale}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "12px 18px"
  button-danger:
    backgroundColor: "{colors.errorSurface}"
    textColor: "{colors.negative}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "12px 18px"
  field:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "14px"
  choice:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.chip}"
    padding: "10px 14px"
  choice-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
    typography: "{typography.label}"
    rounded: "{rounded.chip}"
    padding: "10px 14px"
  box:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.container}"
    padding: "{spacing.panel}"
  navigation-desktop-active:
    backgroundColor: "{colors.soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
  navigation-mobile-active:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
---

# Design System: Cifrio — extensão de contas

## Overview

**Creative North Star: "Mesa financeira"**

Este registro prolonga a direção incumbente: valores legíveis, contexto próximo e ações explícitas. Contas e recorrências usam linhas dentro dos containers compartilhados, com formulários inline e avisos recuperáveis. A extensão não estabelece uma nova paleta nem substitui o DESIGN.md da raiz.

O vocabulário vem do código atual e da direção aprovada em `.impeccable/surfaces/accounts-extension.md`. A evidência visual é a prévia web; não há homologação em emulador ou aparelho. Recorrências online dependem da migração SQL ainda pendente no projeto hospedado.

**Key Characteristics:**

- Superfícies claras e hierarquia financeira em azul.
- Controles compartilhados e formulários inline.
- Previsão e registro diferenciados por texto explícito.
- Navegação adaptativa com contraste contextual.

## Colors

A paleta existente combina azul de ação, tinta azul profunda e superfícies frias. O frontmatter registra somente os tokens usados nesta extensão.

### Primary

- **Azul de ação** (`primary`): confirmar, salvar, foco de campos/botões e destino ativo na navegação inferior.

### Tertiary

- **Vermelho de atenção** (`negative`): texto e ícones destrutivos ou de erro.
- **Rosa de recuperação** (`errorSurface`): apoio de erro e confirmação destrutiva.

### Neutral

- **Tinta azul** (`ink`): títulos, números, escolhas selecionadas e destino ativo lateral.
- **Tinta secundária** (`muted`): contexto, previsão, instituição e navegação inativa.
- **Papel azul** (`bg`): página e campos em repouso.
- **Branco de superfície** (`surface`): containers, navegação e texto sobre ação/seleção.
- **Azul suave** (`soft`): destino ativo lateral e faixa de teste local.
- **Azul de apoio** (`pale`): botão secundário e aviso informativo.
- **Linha azul** (`border`): contornos e divisores.

**The Contrast Rule.** O destino ativo lateral usa tinta azul sobre azul suave; o destino ativo inferior usa azul de ação sobre branco. Não aplique a combinação inferior ao fundo lateral.

## Typography

Manrope mantém a identidade existente. Os identificadores do frontmatter são nomes Expo; no iOS o corpo regular usa a fonte do sistema. Unidades `px` traduzem os números React Native para documentação portátil.

Página usa Display; containers e recorrências usam Headline. O nome de conta reduz Headline a (16). Saldos de conta usam Value, com números tabulares. Corpo explica a origem do dinheiro; Muted registra instituição, data prevista e estado. Campos/seleções usam Label e ações usam Button. Nenhuma família nova foi adicionada.

## Layout

Conteúdo central com máximo de (1120), intervalo de seção (24) e espaço inferior (40). Padding horizontal: (16) abaixo de (360), (20) intermediário e (36) acima de (900). Linhas permitem quebra com intervalo (12); identificação da conta tem mínimo de (140). Formulários inline usam intervalo (16); não dependem de largura fixa.

Navegação lateral a partir de (1000), largura (188), padding horizontal (12), superior (28) e itens de pelo menos (52). Abaixo desse ponto, navegação inferior de (68) mais inset de sistema. Botões têm mínimo de (48), campos de (52). Safe areas continuam sob responsabilidade do shell e do Page existentes.

## Elevation & Depth

O código compartilhado atual usa sombra discreta nos containers e seletor de mês: `0 8px 18px rgba(4, 36, 83, 0.08)`, com `elevation: 2` no Box. Este é o estado observado nesta extensão; a descrição antiga de ausência de sombras na documentação global não foi alterada. Divisores e apoios tonais continuam organizando o conteúdo.

Pressionado reduz opacidade; desabilitado reduz opacidade a (0,5). Não há movimento ornamental acrescentado pelos componentes de contas. O seletor de mês reutiliza o SlidingLabel existente, sem estabelecer novos tokens de movimento.

## Shapes

Containers suavemente arredondados usam Container; controles usam Control e escolhas usam Chip. Campos, escolhas e linhas têm contorno/divisor de (1). A lista mantém a geometria compartilhada sem criar um card independente para cada conta ou previsão.

## Components

### Buttons

Primário azul, secundário tonal e destrutivo rosa/vermelho compartilham altura mínima, padding e tipografia do frontmatter. Ícone opcional Feather (18). Pressionado usa opacidade (0,75); foco de botão usa outline azul (2) com offset (3). O runtime não define mudança de cor no hover.

### Inputs / Fields

Rótulo persistente acima do campo, intervalo (8), texto (16), contorno frio e altura mínima compartilhada. Foco muda o contorno para Primary e fundo para Surface. Avisos comunicam falhas; não documentar variante inline de erro inexistente.

### Chips

Choices usa radios com rótulo de grupo, quebra de linha e intervalo (8). Selecionado usa Ink/Surface; repouso usa Bg/Ink com Border. Não depende só da cor para semântica acessível.

### Cards / Containers

Box branco com intervalo (16), título Headline e sombra compartilhada. Registros internos usam divisor inferior, padding vertical (14) e ações que quebram conforme a largura. Notice associa ícone e texto; erro anuncia feedback acessível.

### Navigation

Feather (21), rótulos Bold (13) lateral e (10) inferior. Contas mantém seu destino existente. A correção lateral reutiliza Ink sobre Soft para contraste; os demais tokens da identidade permanecem os mesmos.

### AccountActions and RecurringAccounts

Saldo registrado precede ações. Adicionar fundos expande campos no lugar; exclusão apresenta aviso e confirmação. Recorrência apresenta valor, conta, tipo e estado textual, com confirmação mensal explícita. Pausar/remover não apaga lançamentos já registrados. Previsto nunca assume o estilo ou o significado de saldo disponível.

## Do's and Don'ts

### Do:

- **Do** reutilizar os tokens e controles compartilhados existentes.
- **Do** manter previsão, registro e origem do valor explícitos em português brasileiro.
- **Do** preservar quebra de linha, alvos de toque e safe areas.
- **Do** distinguir evidência web de validação nativa ou hospedada.

### Don't:

- **Don't** transformar previsões em saldo antes da confirmação.
- **Don't** declarar conexão bancária, débito automático ou migração hospedada validada.
- **Don't** adicionar uma nova paleta para esta extensão.
- **Don't** interpretar este registro localizado como substituição do DESIGN.md global.

Fontes: `src/ui/components.tsx`, `src/ui/AccountActions.tsx`, `src/ui/RecurringAccounts.tsx`, `src/app/(tabs)/accounts.tsx`, `src/app/(tabs)/_layout.tsx`. Revisão web com disposição `ship`: `.impeccable/review/accounts-new-mobile.png`, `accounts-new-desktop.png`, `recurring-mobile.png`, `funds-mobile.png`. O sidecar local traduz componentes em HTML/CSS ilustrativo para documentação; não é código runtime nem prova de suporte nativo.
