# Gestão — piloto de finanças pessoais

React Native + Expo + TypeScript, com adapter Supabase Auth/PostgreSQL. Nome e identidade comerciais provisórios.

## Rodar

Requisitos: Node.js 24, npm e navegador. As dependências e o lockfile estão fixados.

```powershell
npm.cmd ci
npm.cmd run web
```

Abra a URL exibida pelo Expo e escolha **Abrir teste local**. A sessão de teste começa vazia; cadastre contas e cartões. Os dados demonstrativos persistem no dispositivo via AsyncStorage. Esse modo não é armazenamento seguro para informações financeiras reais. Não há contas bancárias conectadas nem dados inventados carregados automaticamente.

Para desenvolvimento no celular: `npm.cmd run dev`. Usar development build compatível com SDK 57 para validação nativa. `npm.cmd run android` e `npm.cmd run ios` são atalhos do servidor Expo; não geram APK/IPA. Compilação iOS local depende de macOS/Xcode; o Windows permite trabalhar no código e usar builds por serviço de nuvem quando configurado.

## Funcionalidades desta entrega

- Contas com saldo inicial e saldo registrado até hoje.
- Receitas, despesas, Pix manual, transferências entre contas, edição e exclusão.
- Cartões identificados por nome, compras parceladas, faturas projetadas e pagamentos parciais/integral.
- Relatório mensal por categoria, com parcelas do cartão e exclusão de transferências/pagamentos de fatura dos gastos.
- CSV com mapeamento de colunas, revisão, seleção de linhas e reimportação idempotente por arquivo/conta/linha.
- OFX com preservação de FITID para evitar repetição na mesma conta.
- Exportação dos registros em JSON, valores em centavos. Não é backup gerenciado nem restauração implementada.
- Cliente de login/cadastro Supabase e migração com RLS, referências por proprietário e operações atômicas.

Fechamento manual: compra no dia de fechamento entra na próxima competência. Dias de fechamento/vencimento inicialmente limitados a 1–28. Faturas são estimativas, não documentos obtidos do banco. Limite cadastrado não é limite disponível consultado.

## CSV / OFX

CSV em UTF-8, até 2 MB e 500 linhas. Cabeçalhos livres com seleção das colunas; data `DD/MM/AAAA` ou `AAAA-MM-DD`; valor positivo para receita e negativo para despesa. Exemplo sintético: `samples/extrato-teste.csv`.

O parser OFX aceita blocos STMTTRN com DTPOSTED, TRNAMT, MEMO/NAME e FITID opcional; não se declara suporte a todos os formatos/exportações de cada banco. Arquivos distintos e períodos sobrepostos exigem revisão humana. Data e valor iguais não são descartados automaticamente.

Arquivos são lidos no dispositivo, sem upload do original. No modo online, apenas os lançamentos confirmados vão ao Supabase. A extração não detecta Pix por heurística e usa categoria Outros; classifique após importar. PDF bancário e OCR ainda não implementados.

## Configurar Supabase

Nenhum projeto externo foi alterado. O usuário informou o projeto `dhoptxnfzxpocgxmgdrs`, configurado no `.env` local ignorado pelo Git. A chave foi aceita pelo endpoint de configurações do Auth; cadastro por e-mail está habilitado e requer confirmação. O conector administrativo não tem acesso a esse projeto. A API não encontrou `finance_accounts`/`read_finance` no schema cache; a migração continua pendente. O mapa `C:\Users\alexa\Desktop\Cofre\04-Guias\Acessos-Master.md` não foi encontrado neste computador.

1. Selecionar o projeto correto de desenvolvimento e revisar a migração `supabase/migrations/20261005151013_financial_core.sql` antes de aplicar. Não aplicar em outro produto.
2. Copiar `.env.example` para `.env` e preencher URL HTTPS do projeto e **publishable key**. O app recusa chaves que não sejam publicáveis. Não colocar `service_role`, secret key ou credenciais bancárias em `EXPO_PUBLIC_*`.
3. Aplicar a migração no projeto correto usando a ferramenta Supabase apropriada e verificar advisors/grants/schema cache.
4. Reiniciar o servidor Expo e testar cadastro/login e duas contas de usuários diferentes.
5. Confirmar leitura/escrita real, falhas de rede, sessões mobile e isolamento pela API antes de tratar a integração como validada.

As tabelas expostas têm RLS e ownership; referências de conta/cartão usam chave composta com proprietário. Os RPCs são SECURITY INVOKER. Leitura usa um snapshot atômico para não truncar o extrato no limite de linhas da Data API. Novas versões do schema devem usar nova migração, não editar uma migração já aplicada.

O Storage não é usado nesta entrega, pois o original do extrato não é enviado ao servidor. Sessões nativas usam SecureStore; sessões web da prévia ficam em memória. Recuperação de senha, exclusão de conta, consentimentos e política de retenção ainda são tarefas do produto.

## Verificar

```powershell
npm.cmd run check
npx.cmd playwright install chromium
npm.cmd run test:browser
npm.cmd run build
npx.cmd expo-doctor
npx.cmd expo export --platform android --platform ios --output-dir dist-native
```

Testes de banco usam PGlite (PostgreSQL embarcado) com contexto auth simulado e executam a migração real. Não equivalem a testar Supabase hospedado, PostgREST, autenticação real ou concorrência entre sessões PostgreSQL independentes. Export de bundles Android/iOS não é compilação/distribuição de APK/IPA nem teste em aparelho.

## Sistema visual

Remake com referências reais da Tekton e do Conta Gotas: identidade original em azul profundo/verde, Manrope, Feather e controles compartilhados. Sistema atual em [DESIGN.md](DESIGN.md), contexto em [PRODUCT.md](PRODUCT.md), pesquisa em [.project/REMAKE-BRIEF.md](.project/REMAKE-BRIEF.md) e evidências em [.impeccable/review/](.impeccable/review/). As capturas são da prévia web, com registros sintéticos inseridos pelos testes; não representam conta bancária conectada nem homologação nativa.

## Próximas fases

Orçamentos, recorrências/lembretes, estornos explícitos, PDF por layout, recuperação de conta, política de privacidade, teste nativo e Open Finance. Elegibilidade PF/PJ das contas BB/Mercado Pago/PicPay/Inter e fornecedor ainda pendentes. Detalhes em `tasks/plan.md`, `tasks/todo.md` e `.project/STATUS.md`.
