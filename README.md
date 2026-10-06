<p align="center">
  <img src="assets/brand/cifrio-mark.png" alt="Marca Cifrio" width="88" />
</p>

<h1 align="center">Cifrio</h1>

<p align="center">
  <strong>Seu dinheiro, com clareza.</strong><br />
  Contas, gastos e o que ainda está por vir — num só lugar, em centavos, sem número inventado.
</p>

<p align="center">
  <img alt="React Native" src="https://img.shields.io/badge/React_Native-0.86-042453?style=flat-square" />
  <img alt="Expo" src="https://img.shields.io/badge/Expo-SDK_57-0474E0?style=flat-square" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-6-23D2BF?style=flat-square&labelColor=042453" />
  <img alt="Supabase" src="https://img.shields.io/badge/Supabase-Auth_%2B_Postgres-3E5674?style=flat-square" />
</p>

Cifrio é o piloto de finanças pessoais: uma mesa clara para registrar o que entrou, o que saiu e o que o cartão ainda vai cobrar. Nada de saldo “consultado no banco” disfarçado de lançamento manual. Nada de dashboard preenchido com dinheiro fictício. Você coloca o dado. O app mostra o mês.

Identidade de trabalho: azul profundo, verde de acento, Manrope. Marca e domínio ainda não estão validados.

---

## Patch notes

Histórico das atualizações documentadas, com a versão mais nova primeiro. Após toda atualização, esta seção deve ser atualizada com a versão, a data e as mudanças realizadas. A regra permanente está em [AGENTS.md](AGENTS.md).

### 2.2.1 — 06/10/2026

- Corrigido o alinhamento do ícone de instalação, com o símbolo centralizado e margens equilibradas.
- Removido o bloco quadrado da aba ativa na barra inferior. A seleção agora usa uma cápsula arredondada ao redor do ícone, com rótulos alinhados e símbolo de casa em Início.
- Preservados os módulos, os destinos da navegação e as funções existentes.
- APK ARM64 gerado com contador de instalação 7 e assinatura compatível com as versões anteriores. Tipo e versão do pacote, assinatura e ícone incorporado foram conferidos.
- TypeScript e quatro testes de navegador passaram em 320, 390, 768 e 1440px. Aparência conferida na prévia web; instalação e execução em celular ainda não verificadas.
- Adicionados os patch notes ao README, incluindo o histórico documentado das primeiras entregas, e a regra de atualizá-los após toda atualização do projeto.

### 2.2.0 — 06/10/2026

- Substituído o gráfico de gastos por uma pizza com animação suave, legenda, valores e percentuais, respeitando a preferência de movimento reduzido.
- Reorganizado o bloco “Já comprometido”, com total em aberto dos próximos três meses e detalhamento por mês e parcela.
- Simplificada a barra inferior para Início, Extrato, Cartões, Contas e Mais. Importação e assinaturas continuam acessíveis pelo menu Mais; desktop mantém a navegação lateral.
- Atualizados os testes para os novos caminhos de navegação. TypeScript, 87 testes locais, 13 testes de navegador e exports web/Android/iOS passaram.
- APK ARM64 gerado com contador de instalação 6 e assinatura verificada. Sem teste de instalação ou execução em celular nesta entrega.

### 2.1.1 — 06/10/2026

- Restauradas as cores originais do Cifrio: fundos claros, branco, azul-marinho, azul e ciano.
- Corrigido o contraste dos textos, botões e estados selecionados, preservando o layout compacto, a marca e o login Google.
- Atualização do código; nenhum APK específico desta versão foi entregue.

### 2.1.0 — 06/10/2026

- Melhorado o início compacto, com atalhos de movimentação, resumo mensal e faixa horizontal de cartões.
- Adicionados bandeira, tema e últimos quatro dígitos opcionais aos cartões, com seleção e abertura da fatura correspondente.
- Recolhido o formulário após salvar um cartão e corrigida a navegação direta para a tela de cartões sem sessão.
- Atualização do código; nenhum APK específico desta versão foi entregue.

### 1.1.1 — 05/10/2026

- Corrigida a recuperação da sessão ao reabrir o aplicativo. Eventos repetidos de autenticação da mesma conta deixam de limpar os dados financeiros já carregados.
- Melhorado o tratamento de carregamento, falhas de recuperação, troca de conta e saída, evitando que respostas antigas sejam aplicadas à conta atual.
- Substituída a abertura padrão do Expo pela marca do Cifrio, com fundo claro e espera pelo carregamento das fontes.
- Ajustada a compilação Android para usar caminhos curtos no Windows e reaplicar a configuração nativa da abertura.
- APK ARM64 entregue com contador de instalação 2. Versão interna, bundle e assinatura v2 foram conferidos; mantida a assinatura do pacote anterior.
- TypeScript e 86 testes locais passaram antes da compilação. Instalação e reabertura em celular não foram verificadas nesta entrega.

### 0.1.0 — 05/10/2026 — primeiro APK

- Disponibilizado o primeiro APK Android do Cifrio, com contas, movimentações, cartões e faturas, resumo mensal, importação revisada de arquivos e autenticação.
- Configurado o fluxo de compilação local para Windows, com ajustes de caminhos e uso de memória necessários à geração do APK.
- APK ARM64 gerado com contador de instalação 1, pacote `com.cifrio.app` e nome Cifrio. Compilação, verificações de release, versão, arquitetura e assinatura v2 passaram.
- Uma recompilação desta versão incorporou as correções de sessão e abertura posteriormente entregues como 1.1.1. Não houve teste de execução em celular.

O primeiro pacote registrado usa a versão **0.1.0**. Não há registro de entregas independentes como **1.0.0** ou **1.1.0** nos documentos consultados.

Detalhes de compilação e entregas anteriores: [histórico de APKs](.project/ANDROID-APK.md). A correção de sessão e abertura está detalhada em [SESSION-RESTORE.md](.project/SESSION-RESTORE.md).

---

## O que ele faz

| | |
| --- | --- |
| **Contas** | Saldo inicial e saldo registrado até hoje. |
| **Movimentações** | Receita, despesa, Pix manual, transferência entre contas. Editar e excluir. |
| **Cartões** | Nome, compras parceladas, faturas projetadas, pagamento parcial ou integral. |
| **Mês** | Relatório por categoria. Parcela entra. Transferência e pagamento de fatura não viram gasto duas vezes. |
| **Importar** | CSV, OFX e PDF de texto, com revisão antes de gravar. Reimportar não duplica. |
| **Exportar** | JSON dos registros, valores em centavos. |
| **Conta** | Login e cadastro no Supabase, Google via OAuth PKCE, perfil com nome e foto. |

Fechamento manual: compra no dia do fechamento cai na competência seguinte. Dias de fechamento e vencimento vão de 1 a 28. Fatura projetada é estimativa, não o PDF do banco. Limite cadastrado não é limite disponível.

PDF de foto, com senha ou de layout desconhecido não entra. Fatura com mais de um cartão só importa a parte de quem está no perfil.

---

## Como rodar

Node.js 24, npm e um navegador. Dependências e lockfile estão fixados.

```powershell
npm.cmd ci
npm.cmd run web
```

Abra a URL do Expo e escolha **Abrir teste local**. A sessão nasce vazia: cadastre contas e cartões. Os dados da prévia ficam no aparelho, via AsyncStorage. Esse modo não é cofre para extrato real.

| Comando | Para quê |
| --- | --- |
| `npm.cmd run web` | Prévia no navegador. |
| `npm.cmd run dev` | Servidor Expo, inclusive celular. |
| `npm.cmd run android` / `ios` | Atalhos do mesmo servidor. Não geram APK nem IPA. |
| `npm.cmd run check` | Typecheck e testes. |
| `npm.cmd run test:browser` | Jornada no Chromium. Antes: `npx.cmd playwright install chromium`. |
| `npm.cmd run build` | Export web. |

No Windows, o APK Android pode ser compilado localmente com JDK 21 e Android SDK: `powershell.exe -ExecutionPolicy Bypass -File scripts/build-apk.ps1`. O script usa uma cópia em caminho curto, limita o consumo de memória e salva o APK em `artifacts/`. A configuração atual usa assinatura de teste. Compilar iOS localmente exige macOS e Xcode. Instruções e limites: [APK Android](.project/ANDROID-APK.md).

---

## Importar sem se arrepender

O arquivo é lido no dispositivo. O original não sobe. No modo online, só o lançamento que você confirmar vai para o Supabase.

**CSV** — UTF-8, até 2 MB e 500 linhas. Você escolhe as colunas. Data `DD/MM/AAAA` ou `AAAA-MM-DD`. Positivo é receita, negativo é despesa. Exemplo sintético: [`samples/extrato-teste.csv`](samples/extrato-teste.csv). A reimportação é idempotente por arquivo, conta e linha.

**OFX** — blocos `STMTTRN` com `DTPOSTED`, `TRNAMT`, `MEMO`/`NAME` e `FITID` opcional. O `FITID` evita repetir o mesmo lançamento na mesma conta. Não é uma promessa de ler todo banco do país. Períodos sobrepostos pedem olho humano. Data e valor iguais, sozinhos, não são descartados.

**PDF** — texto selecionável, até 500 movimentações. Data e valor na mesma linha; saldo, subtotal e total ficam de fora. Crédito e débito respeitam o sinal, o sufixo `C`/`D` e, em fatura de cartão, o sentido da compra. Fatura com vários portadores usa o nome do perfil para ficar só com a sua parte.

A extração não adivinha Pix. Categoria inicial: Outros. Classifique depois.

Extratos e faturas reais estão no `.gitignore` (`*.pdf`). O teste que lê uma fatura de exemplo só roda se o arquivo estiver na sua máquina.

---

## Conta online

Copie [`.env.example`](.env.example) para `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sua-chave-publicavel
```

O app recusa chave que não seja publicável. `service_role`, secret e credencial bancária não entram em `EXPO_PUBLIC_*`.

1. Revise `supabase/migrations/` e aplique no projeto de desenvolvimento certo.
2. Confira advisors, grants e schema cache.
3. Reinicie o Expo. Teste cadastro, login e duas contas de pessoas diferentes.
4. Google: siga [`.project/GOOGLE-PROFILE-SETUP.md`](.project/GOOGLE-PROFILE-SETUP.md). Sem client secret no aplicativo.

RLS e dono em toda tabela exposta. Conta e cartão referenciam o proprietário. RPCs são `SECURITY INVOKER`. A leitura usa um snapshot atômico para o extrato não ser cortado no limite da Data API. Schema novo = migração nova. Não edite migração já aplicada.

Sessão nativa usa SecureStore. Na web, o token da prévia fica em memória; só o verificador PKCE temporário usa `sessionStorage`. Fotos de perfil, no online, vão para um bucket privado — a migração existe, a aplicação remota é passo seu.

Testes de banco rodam em PGlite, com a migração real e auth simulado. Isso não substitui Supabase hospedado, PostgREST, login de verdade nem duas sessões PostgreSQL ao mesmo tempo.

---

## Mapa

```text
src/app          telas (Expo Router): entrada, perfil, abas
src/domain       dinheiro: contas, cartão, importação, PDF, perfil
src/state        sessão local e online
src/lib          Supabase, texto de PDF, exportação, foto
src/ui           visual compartilhado
supabase/        migrações
tests/           Vitest e jornada Playwright
samples/         CSV sintético
assets/brand/    símbolo e logo
```

```mermaid
flowchart LR
  tela[Telas] --> estado[Estado]
  estado --> dominio[Domínio em centavos]
  dominio --> local[AsyncStorage no teste local]
  dominio --> remoto[Supabase com RLS]
  arquivo[CSV / OFX / PDF] --> revisao[Revisão na tela]
  revisao --> dominio
```

Início, Extrato, Cartões, Importar, Contas. No largo, a barra vai para a esquerda. No estreito, fica embaixo, com a safe area do Android respeitada.

Visual, voz e decisões: [DESIGN.md](DESIGN.md), [PRODUCT.md](PRODUCT.md), [`.project/REMAKE-BRIEF.md`](.project/REMAKE-BRIEF.md). Plano: [`tasks/plan.md`](tasks/plan.md), [`tasks/todo.md`](tasks/todo.md), [`.project/STATUS.md`](.project/STATUS.md).

---

## O que ainda não é

Orçamento, recorrência, estorno explícito, Open Finance, recuperação e exclusão de conta, política de privacidade, teste em aparelho. Banco do Brasil, Mercado Pago, PicPay e Inter são prioridade de produto, não conexão ligada.

Registro manual não é saldo do banco. Projeção não é fatura oficial. Prévia web não é homologação nativa. JSON exportado não é backup com restauração.

---

<p align="center">
  <sub>Piloto. Feito para ver o mês inteiro sem contar o mesmo real duas vezes.</sub>
</p>
