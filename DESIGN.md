---
name: Gestão
description: Mesa financeira clara para contas, registros e compromissos pessoais.
colors:
  bg: "#F4F6F8"
  surface: "#FFFFFF"
  ink: "#172B42"
  muted: "#56677B"
  primary: "#17664F"
  soft: "#E8F2ED"
  border: "#DDE4EA"
  negative: "#B2403B"
  dark: "#142A40"
  onDark: "#FFFFFF"
  mutedDark: "#BACBD8"
  accent: "#D9EFB6"
  pale: "#EDF1F5"
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
    fontSize: "28px"
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
  badge: "8px"
  chip: "10px"
  control: "12px"
  container: "16px"
spacing:
  compact: "4px"
  tight: "8px"
  row: "12px"
  group: "16px"
  panel: "20px"
  section: "24px"
  generous: "28px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.onDark}"
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
    backgroundColor: "{colors.dark}"
    textColor: "{colors.onDark}"
    typography: "{typography.label}"
    rounded: "{rounded.chip}"
    padding: "10px 14px"
  box:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.container}"
    padding: "{spacing.panel}"
  wallet:
    backgroundColor: "{colors.dark}"
    textColor: "{colors.onDark}"
    rounded: "{rounded.container}"
    padding: "{spacing.section}"
  month-picker:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0px 4px"
  navigation:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.muted}"
    typography: "{typography.label}"
---

# Design System: Gestão

## Overview

**Creative North Star: "Mesa financeira"**

A interface organiza dinheiro registrado, movimentações e compromissos como uma mesa financeira: valores alinhados, contexto perto do número e ações fáceis de encontrar. A identidade substitui a direção anterior com autorização do usuário, apoiada no acabamento da Tekton e na organização operacional do Conta Gotas, sem reproduzir suas marcas. Gestão permanece um nome provisório.

Superfícies claras, azul profundo e verde funcional sustentam uma leitura diária calma e precisa. A hierarquia distingue saldo registrado, resultado do mês e fatura estimada. O sistema visual é claro; painéis escuros locais não representam um modo escuro. Esta descrição e os nomes qualitativos das cores foram propostos pelo implementador a partir do código e do contrato aprovado, sem atribuí-los como escolhas literais do usuário.

**Key Characteristics:**

- Hierarquia forte para valores e contexto financeiro explícito.
- Superfícies claras com painéis de destaque em azul profundo.
- Manrope, números tabulares e ícones Feather consistentes.
- Controles confortáveis, navegação adaptativa e estados vazios úteis.
- Distinção visível entre teste local, conta online e conexão bancária pendente.

## Colors

A paleta combina papel frio e tinta azul com um verde de ação; vermelho sinaliza erro e saída quando o contexto exige, acompanhado de texto ou símbolo. Os valores normativos estão no frontmatter e correspondem ao código compartilhado.

### Primary

- **Verde operacional** (`primary`): ações principais, receitas, resultado positivo, foco e seleção da navegação.
- **Verde suave** (`soft`): faixa de teste local e fundo do item ativo na navegação lateral.

### Secondary

- **Azul profundo** (`dark`): saldo, apresentação inicial e fatura estimada; também escolha selecionada.
- **Lima suave** (`accent`): ícones dentro dos painéis escuros.

### Tertiary

- **Vermelho de atenção** (`negative`): erro, exclusão e indicadores de gasto/resultado negativo.
- **Rosa de recuperação** (`errorSurface`): fundo de aviso de erro e ação destrutiva.

### Neutral

- **Papel frio** (`bg`): página e campos em repouso.
- **Branco de superfície** (`surface`): containers e navegação; `onDark` é seu papel de conteúdo claro.
- **Tinta azul** (`ink`): títulos, texto e valores gerais.
- **Tinta secundária** (`muted`): contexto, legendas e navegação inativa.
- **Linha fria** (`border`): divisores e contornos.
- **Azul claro de contexto** (`pale`): avisos, ações secundárias e apoios de ícones.
- **Texto sobre azul** (`mutedDark`): legendas dos painéis escuros.

Há dois detalhes locais compartilhados entre telas: divisor sobre azul (`#405365`) e categoria secundária (`#738B9C`). Não constituem uma escala adicional de identidade.

**The Context Rule.** Cor nunca substitui o rótulo: saldo registrado, fatura estimada, receita, despesa e teste local devem continuar explícitos.

## Typography

**Display Font:** Manrope ExtraBold. **Body Font:** Manrope Regular no Android/web; o corpo regular usa a fonte do sistema no iOS porque `fonts.regular` é indefinido nessa plataforma. Medium, Bold e ExtraBold continuam referenciando Manrope. Os nomes no frontmatter são identificadores registrados pelo carregador Expo, não nomes CSS de fontes. Unidades `px` são a tradução portátil dos estilos React Native para ferramentas de design.

### Hierarchy

- **Display:** título de página pelo token `display`; apresentação usa variação (32, entrelinha 39, tracking −0,8).
- **Headline:** títulos de containers pelo token `headline`.
- **Value:** números tabulares pelo token `value`; saldo dominante (36, tracking −1), entradas/saídas (23; 20 abaixo de 360), saldos por conta (23).
- **Body:** explicações e linhas pelo token `body`.
- **Muted:** subtítulos e contexto pelo token `muted`; legendas escuras (12/19 ou 12/20).
- **Label:** campos e escolhas pelo token `label`; navegação inferior (10, Bold), lateral (13, Bold), botão pelo token `button`.

**The Number Rule.** Valores financeiros usam BRL formatado pelo domínio; preserve números tabulares nos papéis que já os usam e mantenha a explicação próxima do valor.

## Layout

O conteúdo tem largura total, máximo de 1120, alinhamento central, intervalo de seção de 24 e espaço inferior de 40. Padding horizontal: 16 abaixo de 360, 20 nas larguras intermediárias e 36 acima de 900. Linhas quebram quando necessário; o mês permanece horizontal com setas e texto flexível.

A partir de 800, visão geral, colunas complementares e apresentação abrem composição horizontal. Na apresentação, `flex: 1` vale somente na composição larga; no telefone “Abrir teste local” aparece no painel inicial e foi verificado no primeiro viewport. A partir de 1000, os cinco destinos viram navegação lateral com largura e largura mínima de 188. Abaixo disso, navegação inferior mede 68 mais o inset inferior. Itens têm mínimo de 52; botões e setas do mês têm alvos mínimos de 48, campos de 52.

Safe areas são parte da composição. O ajuste Android existente reserva 48 quando o inset informado é zero e não há espaço de sistema suficiente identificado. Telas fora das tabs aplicam seus próprios insets; o shell assume essa responsabilidade dentro das tabs.

**The Priority Rule.** A primeira leitura deve permitir entender o período e alcançar uma ação; dados vazios pedem orientação e cadastro, sem números decorativos.

## Elevation & Depth

O sistema atual não usa sombras compartilhadas. Profundidade vem de página clara, containers brancos, apoios tonais e painéis azul profundo. Divisores delimitam extratos; seleção usa preenchimento e foco de botão usa outline. Não há animação customizada obrigatória nem tokens de movimento definidos: pressionado reduz opacidade, carregamento usa indicador nativo.

**The Flat Rule.** Preserve profundidade tonal; não adicione sombras ou movimento ornamental como padrão de novos containers.

## Shapes

Containers usam o token `container`; controles `control`, escolhas `chip` e badges `badge`. Ícones ficam em pequenos blocos arredondados e não são marcas bancárias. Contornos e divisores de uma unidade delimitam campos, escolhas e registros. A área de importação tem contorno tracejado.

## Components

### Buttons

Primário verde, secundário tonal e destrutivo rosa/vermelho compartilham geometria, altura mínima de 48, ícone opcional de 18 e texto Bold. Pressionado: opacidade 0,75; desabilitado: 0,5. Foco de botão usa outline verde de 2 com offset 3 na prévia web. Não existe variante hover de cor no runtime.

### Inputs / Fields

Rótulo persistente, fundo frio, contorno e padding pelo token `field`, texto (16), mínimo de 52. Foco muda contorno para verde e fundo para branco. Erros recuperáveis aparecem por avisos; não inferir uma variante inline de erro inexistente.

### Chips

Escolhas com semântica de radio, intervalo de 8, quebra de linha e mínimo de 48. Repouso claro com contorno; selecionado azul profundo e texto branco.

### Cards / Containers

Container branco: padding de 20, intervalo de 16. Saldo: painel azul, padding de 24 e contexto de origem. Cartões cadastrados usam painel azul com fatura estimada e datas, sem número, CVV, marca bancária ou vínculo externo. Extrato e contas usam linhas divididas.

### Navigation

Início, Extrato, Cartões, Importar e Contas usam Feather (21), rótulos Bold e verde ativo. Navegação inferior protege inset de sistema; lateral usa fundo tonal no item ativo. Cabeçalho inclui marca tipográfica provisória, símbolo layers e acesso às contas com alvo de 48.

### Month picker, notices and empty states

Mês horizontal com calendário, nome localizado e setas de 48. Avisos combinam ícone e texto; erro usa fundo rosa e anúncio acessível. Vazio usa ícone apoiado, título, explicação centrada limitada a 320 e ação contextual. Importação mantém revisão antes da confirmação.

O sidecar `.impeccable/design.json` contém traduções ilustrativas HTML/CSS dos componentes React Native para o painel de documentação. São autocontidas, não estilos do runtime nem evidência de suporte nativo. Estados CSS traduzem intenção observada; hover não introduz cor nova. Nenhuma imagem autoral ou raster gerado foi adicionado pelo remake; fontes e ícones vêm de bibliotecas.

## Do's and Don'ts

### Do:

- **Do** preservar tema claro, contraste tonal e hierarquia entre saldo, contexto e ação.
- **Do** manter português brasileiro, BRL e origem/limitação dos valores explícitos.
- **Do** manter alvos de 48 ou mais nos controles compartilhados e proteger safe areas.
- **Do** tratar screenshots com números como dados sintéticos criados pelos testes; o aplicativo começa vazio.
- **Do** preservar foco, rótulos acessíveis, feedback recuperável e revisão de importação.

### Don't:

- **Don't** apresentar conta cadastrada como banco conectado ou projeção como documento bancário.
- **Don't** preencher telas vazias com métricas, gráficos ou registros fictícios.
- **Don't** interpretar painéis escuros como modo escuro ou adicionar animação obrigatória.
- **Don't** reutilizar marcas, fotografias ou fundos das referências de qualidade.
- **Don't** declarar validação em aparelho com base somente na prévia web.

Fonte: `src/ui/components.tsx` e telas de entrada/início/cartões/extrato/importação/contas. Contrato: `.project/REMAKE-BRIEF.md`, semente `4a6b2fab`. Finish review em `.impeccable/review/REVIEW.md`: `fix` → `ship`, dois ajustes resolvidos, escopo de prévia web. Homologação nativa permanece pendente.
