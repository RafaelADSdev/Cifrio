---
name: Cifrio
description: Mesa financeira clara, com identidade azul Cifrio e acento ciano.
colors:
  bg: "#F4F8FC"
  surface: "#FFFFFF"
  ink: "#042453"
  muted: "#3E5674"
  primary: "#0474E0"
  onPrimary: "#FFFFFF"
  soft: "#D7E9FB"
  border: "#D5E3F0"
  negative: "#B2403B"
  dark: "#042453"
  onDark: "#FFFFFF"
  mutedDark: "#D5E4F5"
  accent: "#23D2BF"
  pale: "#E7F2FC"
  lineOnDark: "#5C8FBE"
  errorSurface: "#FAECEB"
  cardForest: "#042453"
  cardForestMuted: "#D5E4F5"
  cardForestBorder: "#5C8FBE"
  cardForestAccent: "#23D2BF"
  cardCarbon: "#0D2F57"
  cardCarbonMuted: "#D5E4F5"
  cardCarbonBorder: "#416F99"
  cardCarbonAccent: "#86C8FF"
  cardOcean: "#075880"
  cardOceanMuted: "#D5EFF8"
  cardOceanBorder: "#478BAC"
  cardOceanAccent: "#23D2BF"
  cardPlum: "#0646A2"
  cardPlumMuted: "#D7E9FB"
  cardPlumBorder: "#447DC0"
  cardPlumAccent: "#83CAFF"
typography:
  display: {fontFamily: "Manrope_800ExtraBold", fontSize: "28px", fontWeight: 800, letterSpacing: "-0.6px"}
  headline: {fontFamily: "Manrope_800ExtraBold", fontSize: "26px", fontWeight: 800, letterSpacing: "-0.6px"}
  title: {fontFamily: "Manrope_700Bold", fontSize: "18px", fontWeight: 700}
  body: {fontFamily: "Manrope_400Regular", fontSize: "15px", fontWeight: 400, lineHeight: "23px"}
  label: {fontFamily: "Manrope_400Regular", fontSize: "13px", fontWeight: 400, lineHeight: "21px"}
rounded:
  badge: "8px"
  choice: "10px"
  field: "12px"
  panel: "16px"
  pill: "24px"
  navigation: "32px"
spacing:
  small: "8px"
  compact: "12px"
  medium: "16px"
  panel: "20px"
  section: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.onPrimary}"
    rounded: "{rounded.pill}"
    padding: "12px 20px"
  button-secondary:
    backgroundColor: "{colors.pale}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "12px 20px"
  button-danger:
    backgroundColor: "{colors.errorSurface}"
    textColor: "{colors.negative}"
    rounded: "{rounded.pill}"
    padding: "12px 20px"
  field:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "14px"
  choice-selected:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.onPrimary}"
    rounded: "{rounded.choice}"
    padding: "10px 14px"
  panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "20px"
  wallet:
    backgroundColor: "{colors.dark}"
    textColor: "{colors.onDark}"
    rounded: "{rounded.panel}"
    padding: "12px"
---

# Design System: Cifrio

## Overview

**Creative North Star: "Mesa financeira clara"**

Cifrio organiza registros financeiros pessoais em superfícies claras, tinta azul-marinho, ações azuis e detalhes ciano. Números destacados, controles compactos e listas legíveis dão prioridade à consulta e ao registro diário. Esta documentação descreve a implementação da versão 2.2.1.

As cores originais Cifrio são a autoridade visual, conforme `.project/ORIGINAL-COLORS.md`. A organização compacta inspirada na Finza permanece, mas a paleta verde e preta daquela demo foi rejeitada pelo usuário. O símbolo raster, o nome Cifrio e o login Google permanecem. Composição e jornada estão nos contratos de superfície; não definem um modo global de design.

**Key Characteristics:**

- Fundo azul muito claro e superfícies brancas com bordas discretas.
- Azul de ação com texto branco; ciano como detalhe de apoio.
- Carteira e cartões azuis com texto branco explícito.
- Valores tabulares, cápsulas, círculos e painéis de curvas moderadas.
- Português brasileiro e estados vazios sem números ilustrativos.

## Colors

Os valores normativos do frontmatter vêm de `src/ui/components.tsx` e `src/ui/CardVisual.tsx`. Os nomes técnicos de tema de cartão preservam compatibilidade com os dados existentes; não descrevem a cor atual.

### Primary
- **Azul Cifrio** (`primary`): ações, escolhas selecionadas, foco e destaques mensais.
- **Branco de ação** (`onPrimary`): texto e ícones sobre azul de ação.

### Secondary
- **Ciano** (`accent`): detalhes e ícones de apoio em painéis azul-marinho; não substitui a cor de ação.

### Neutral
- **Azul de fundo** (`bg`): tela, campos em repouso e canvas web.
- **Branco** (`surface`): caixas, atividades, seletor de mês e navegação.
- **Azul-marinho** (`ink`, `dark`): texto principal e painéis de carteira/entrada, respectivamente.
- **Branco sobre painel** (`onDark`): texto e valores dentro da carteira e dos cartões.
- **Azul suave** (`soft`, `pale`): apoio a atalhos, itens selecionados laterais, ações secundárias e avisos.
- **Azul de metadados** (`muted`, `mutedDark`): explicações em superfícies claras ou azuis, respectivamente.
- **Bordas azuis** (`border`, `lineOnDark`): contornos e divisores em superfícies claras ou azul-marinho.
- **Vermelho de atenção** (`negative`): saídas em listas, resultados negativos e erros; `errorSurface` apoia avisos e ações de risco.

**The Contraste por Superfície Rule.** Usar `ink` sobre superfícies claras e `onDark` sobre painéis azuis; ações primárias usam `onPrimary`.

As paletas de cartão identificam cadastros com variações de azul/ciano. Cores adicionais em `SpendingChart.tsx` identificam categorias e não são acentos alternativos para controles. O botão Google mantém branco e identidade oficial.

## Typography

**Display Font:** Manrope ExtraBold.
**Body Font:** Manrope Regular; o token regular usa o padrão do sistema no iOS.

Manrope é carregada nos pesos 400, 500, 700 e 800. Feather fornece ícones de linha. Texto, controles e valores compartilham a família, diferenciados pelo peso.

- **Display:** valores gerais (28px, peso 800); saldo da carteira (26px abaixo de 360px, 30px nas demais larguras) e mensagem de entrada (32px, entrelinha 39px) são variantes de superfície.
- **Headline:** título de página (26px, peso 800, espaçamento -0.6px).
- **Title:** títulos de caixas (18px, peso 700).
- **Body:** texto principal (15px, peso 400, entrelinha 23px).
- **Label:** metadados (13px, peso 400, entrelinha 21px); campos usam peso 500, botões peso 700 (14px, entrelinha 20px).
- **Microtexto:** atalhos e informações compactas (11–12px); abas mobile (10px).

Valores destacados usam números tabulares. Rótulos curtos não substituem os nomes acessíveis completos das ações.

## Layout

O conteúdo ocupa toda a largura até 1120px, centralizado, com intervalo padrão de 20px. O preenchimento lateral é 16px abaixo de 360px, 20px normalmente e 36px acima de 900px. Caixas usam 20px de preenchimento; painéis compactos usam 12–16px. Page compacto, usado no início e em cartões, tem intervalo de 12px e preenchimento superior de 16px; a entrada mantém o padrão.

Dashboard e entrada passam para duas colunas em 800px. Em 1000px, cinco abas inferiores dão lugar à barra lateral de 188px. A cápsula mobile tem margem horizontal de 12px, altura de 72px e margem inferior de 12px acrescida do inset do sistema. O inset não é aplicado novamente dentro da barra.

Preservar safe areas, incluindo a reserva Android existente quando o sistema informa inset zero. Textos, linhas e escolhas podem quebrar; a faixa horizontal de cartões tem rolagem própria. Na web, fundo, seleção, caret e foco acompanham a paleta clara. A barra de status usa ícones escuros.

A revisão desta entrega cobre prévia web do início compacto e de cartões em mobile e desktop. Ela não certifica a aparência nativa nem a entrega de APK.

## Elevation & Depth

A profundidade vem de camadas tonais e contornos de 1px, sem sombras decorativas compartilhadas. Branco organiza conteúdo sobre o fundo azul claro; azul-marinho destaca a carteira. Não adicionar gradientes ou sombras apenas para separar caixas que já têm tom e borda próprios.

Mês e valores deslizam 28px em 420ms com curva `cubic-bezier(0.16, 1, 0.3, 1)` e fade de 280ms. Movimento reduzido remove o deslocamento mensal e usa fade de 160ms. Entrada de seções e barras preservam os caminhos reduzidos existentes.

## Shapes

Caixas têm cantos de 16px; campos, avisos e atividades compactas usam 12px. Escolhas usam 10px e badges 8px. Botões e seletor de mês formam cápsulas de 24px; navegação inferior usa 32px. Avatares e atalhos são círculos verdadeiros.

## Components

### Buttons
Ações têm altura mínima de 48px, preenchimento de 12px por 20px e texto centralizado. A primária usa azul e branco; hover e pressão passam o fundo a azul-marinho mantendo branco, sem reduzir opacidade. Secundárias usam `pale` e tinta azul-marinho, passando a `soft` no hover e na pressão. Risco usa vermelho sobre `errorSurface`; desabilitado usa opacidade 0.5. Foco tem contorno azul de 2px, afastado 3px.

O botão Google mantém fundo branco, borda oficial, símbolo raster e texto escuro. Preservar sua identidade e a autenticação existente.

### Chips
Escolhas têm altura mínima de 48px, borda de 1px e raio de 10px. Seleção usa azul e texto branco; repouso usa fundo claro e tinta azul-marinho. Preservar semântica de radio e estado selecionado.

### Cards / Containers
Caixas brancas combinam raio de 16px, borda de 1px, preenchimento de 20px e intervalo de 16px. Carteira usa azul-marinho, branco explícito e preenchimento compacto de 12px; saldo e Adicionar compartilham uma linha que pode quebrar. Resultado e saída das contas ficam lado a lado. Avisos e estados vazios apresentam orientação real sem números fictícios.

### Cartões de crédito
CardVisual oferece Azul Cifrio (`forest`), Azul-marinho (`carbon`), Ciano (`ocean`) e Azul profundo (`plum`). Tema afeta fundo, borda, metadados e ícone; nome, bandeira, final e valor usam `onDark` branco. Sem tema, usar Azul Cifrio. Os IDs históricos são preservados no armazenamento.

Duas geometrias circulares recortadas (160px e 120px, opacidades 0.35 e 0.2) dão detalhe decorativo, sem novos rasters. A versão completa usa preenchimento de 20px, intervalo de 24px e altura mínima de 190px; compacta usa 16px, 16px e 156px. Ambas têm raio de 16px e cabeçalho mínimo de 38px. Nome usa 17px/14px e valor 20px/19px na versão completa/compacta.

No início, cartões de 270px rolam numa faixa própria com intervalo de 12px. Tocar abre o escolhido. A tela mostra uma seleção por vez e recolhe o formulário depois de salvar, mantendo compra, pagamento, edição, exclusão e agenda.

Bandeira e últimos quatro dígitos são opcionais: ausência mostra CRÉDITO e Final não informado. Visa usa texto; Mastercard combina círculos vermelho e laranja com rótulo; demais bandeiras usam o nome informado. Não inventar número ou bandeira. Seleção de tema continua azul de ação.

### Inputs / Fields
Campos têm fundo claro, contorno azul suave, raio de 12px, preenchimento de 14px e altura mínima de 52px. Foco muda a borda para azul de ação e fundo para branco. Manter rótulos visíveis, placeholder `muted` e foco de teclado visível.

### Navigation
Os seis destinos permanecem: Início, Extrato, Cartões, Assinaturas, Importar e Contas. Feather (22px) acompanha Manrope Bold. Mobile usa cinco itens (Início, Extrato, Cartões, Contas e Mais) em cápsula branca. A seleção tem tinta azul-marinho e cápsula `soft` de 52×32px, raio de 16px, apenas ao redor do ícone; o rótulo fica abaixo, sem bloco quadrado de fundo. Inativos usam `muted`; Início usa o símbolo de casa. Importar e Assinaturas ficam em Mais. Desktop usa superfície branca, rótulos ao lado dos ícones e item ativo azul-marinho sobre `soft`.

### Atalhos e atividade
Quatro atalhos têm altura mínima de 72px, círculos de 48px, ícones azuis de 22px e rótulos de 11px. Importar e Assinaturas aparecem como ações secundárias após os cartões. Atividade mostra até cinco registros em linhas brancas e círculos de 44px. Receita usa azul de ação, transferência tinta azul-marinho e saída vermelho; texto complementa a cor.

### Gráficos
Gasto mensal destacado usa azul e branco; isso é decisão do resumo, não semântica global de despesa. Categorias usam pizza SVG em todas as plataformas, entrada discreta de 320ms, sem rotação e legenda com valores e percentuais. Movimento reduzido remove a animação. Gráficos vazios não representam dados existentes. Barras usam trilha `pale` e preenchimento azul ou vermelho ao exceder o limite.

## Do's and Don'ts

### Do:
- **Do** preservar a identidade original clara e azul Cifrio.
- **Do** usar branco explícito dentro de carteira e cartões azuis.
- **Do** preservar os pixels da marca, o login Google, safe areas e movimento reduzido.
- **Do** manter foco visível, rótulos acessíveis e os seis destinos existentes.
- **Do** diferenciar registros pessoais de consulta bancária e deixar estados vazios explícitos.

### Don't:
- **Don't** restaurar o fundo preto e o verde-lima rejeitados pelo usuário.
- **Don't** recolorir o botão Google nem tratar temas de cartão como acentos de interface.
- **Don't** reduzir por opacidade o botão azul no hover ou na pressão.
- **Don't** inventar saldos, números de cartão, bandeiras ou conexão bancária.
- **Don't** tratar a referência Finza como autoridade de cor ou alterar a identidade Cifrio.


### Movimento e leitura — 2.3.0

Priorizar feedback e orientação: pressão 90ms, retorno e seleção da aba 160ms, troca de mês 220ms, revelação de controles 240ms, barras 260ms e gráfico 320ms. Usar a curva cubic-bezier(0.22, 1, 0.36, 1), animando apenas transform e opacity. Sem pulsos, giros ou entrada decorativa de toda a tela. Respeitar movimento reduzido mesmo quando a preferência muda com o app aberto; navegação por teclado deve ser imediata.

Cartões gerais usam raio de 20px, borda suave e sombra discreta. Já comprometido diferencia total futuro, mês e estado em aberto. Limites por categoria abrem por ação explícita; fechar os controles preserva os dados e valores digitados.
