# Plano inicial — aplicativo de gestão financeira

Atualizado em 05/10/2026. Status: planejamento; nenhuma integração ou implementação validada.

## Direção confirmada

Produto para outras pessoas, com piloto inicialmente usado pelo fundador. Aplicativo de finanças pessoais no Brasil, em BRL, com React Native e banco Supabase. Sincronização automática desejada; importação de CSV, PDF e outros formatos como alternativa. Android e iOS são a proposta inicial, com prioridade de plataforma ainda pendente.

O piloto deve usar a arquitetura de isolamento de usuários do produto desde o início. Não contratar serviços, criar projetos externos, conectar bancos ou enviar extratos a terceiros nesta fase de planejamento.

Bancos informados para o piloto: Banco do Brasil, Mercado Pago, PicPay e Inter. Tipos de conta (PF/PJ) e cartões efetivamente usados ainda não confirmados.

## Resultado esperado

Mostrar dinheiro disponível, despesas por categoria, faturas e compromissos futuros. O usuário deve conseguir registrar ou importar movimentações, revisar a classificação e entender a origem e a atualização dos dados.

## Escopo do MVP

- Autenticação, recuperação de acesso e perfil.
- Contas, saldo inicial, receitas, despesas, transferências e categorias.
- Registro de Pix recebido/enviado, sem iniciação de pagamentos.
- Cartões, compras parceladas, fechamento, vencimento, faturas, estornos e pagamentos parciais.
- Orçamento mensal por categoria, recorrências e lembretes.
- Dashboard, filtros, exportação e controle das fontes de dados.
- CSV com mapeamento de colunas e revisão antes de confirmar.
- OFX como formato adicional, após validar amostras dos bancos do piloto.
- PDF com texto extraível para layouts explicitamente suportados.
- Prova de integração Open Finance em sandbox; teste com banco real condicionado a acesso de produção e consentimento.

PDF de imagem/OCR, investimentos, contas compartilhadas familiares, IA financeira, sincronização offline completa, cobrança de assinatura e iniciação de Pix ficam para decisões posteriores. PDFs protegidos precisam de uma experiência de desbloqueio definida; senhas não serão persistidas. Não prometer suporte universal a PDFs.

## Viabilidade de Open Finance

O Banco Central informa que a participação direta no ecossistema é reservada a instituições autorizadas. Para este produto, avaliar um provedor e suas condições comerciais/regulatórias, em vez de implementar uma participação direta.

Isso não significa que só existam APIs de agregadores: os bancos também oferecem APIs proprietárias oficiais, com escopo e elegibilidade próprios. Avaliar APIs diretas antes de decidir pela contratação de um agregador.

### APIs oficiais dos bancos do piloto

Pesquisa documental em 05/10/2026; nenhuma credencial ou chamada autenticada foi usada.

| Banco | O que foi encontrado | Limite da conclusão |
| --- | --- | --- |
| Banco do Brasil | Portal oficial lista API Extratos para débitos/créditos de conta corrente | Elegibilidade da conta PF do piloto e acesso a faturas não confirmados na documentação pública consultada |
| Inter | FAQ oficial informa integrações via API apenas para conta PJ e menciona consulta de extrato | Não usar essa API como promessa de sincronização de conta PF |
| Mercado Pago | Documentação oficial oferece relatório Dinheiro em conta e endpoints de geração de relatórios | Validar acesso da conta do piloto, cobertura de Pix/transferências e escopo comercial; não presumir que inclui fatura de cartão pessoal |
| PicPay | Documentação pública encontrada é orientada a soluções de pagamento/e-commerce | Não foi encontrada nessa pesquisa uma API pública de extrato completo de conta PF; ausência na pesquisa não prova inexistência de parceria privada |

APIs de pagamento, cartões salvos para checkout e faturas de assinatura não equivalem a extrato/fatura do cartão de crédito do correntista. A estratégia pode ser híbrida: API oficial direta onde viável, arquivos e Open Finance para os demais casos. Um provedor pode integrar o fluxo ao próprio app, sem exigir outro aplicativo de gestão financeira.

### Candidatos pesquisados

| Candidato | Evidência pública consultada | O que falta validar |
| --- | --- | --- |
| Pluggy | API de contas/cartões/transações; sandbox; página comercial anuncia Dados a partir de R$ 2.500/mês e teste de produção por 15 dias | Bancos do piloto, campos de fatura/parcelas, volume incluso, preço final, suporte e contratação |
| Belvo | Produto de agregação Open Finance Brasil; sandbox com dados fictícios; documentação descreve liberação/certificação de produção | Cobertura dos bancos/cartões do piloto, condições comerciais, requisitos de entrada e histórico disponível |

Valores e condições são uma fotografia de 05/10/2026 e precisam ser reconfirmados antes de contratar. O plano de Dados da Pluggy é distinto do plano de Pagamentos. O portal pessoal Meu Pluggy não é a arquitetura proposta para o produto comercial.

A Pluggy distingue conectores regulados de Open Finance e conectores diretos. A avaliação inicial prioriza conectores regulados; qualquer mudança deve ser explícita. A FAQ informa que novas transações em conectores regulados podem levar até 24 horas para ficar disponíveis. Exibir última atualização e estado de conexão; não prometer monitoramento instantâneo.

### Prova de viabilidade

1. Identificar bancos e cartões do piloto e orçamento mensal aceitável.
2. Testar consentimento, retorno ao aplicativo, contas, transações e faturas em sandbox.
3. Avaliar campos ausentes, identificação de Pix, histórico, parcelas e limites de atualização.
4. Testar reenvio de webhook, duplicidade, consentimento revogado e reconexão.
5. Com produção disponível, executar piloto consentido em um banco real e comparar com extrato/fatura.
6. Escolher fornecedor apenas após cobertura, qualidade e custo por usuário serem conhecidos.

Sandbox comprova o fluxo técnico simulado. Não comprova sincronização real, cobertura de um banco ou disponibilidade de produção. Nenhuma conta de fornecedor foi criada nesta pesquisa.

## Arquitetura proposta

- Mobile: React Native, Expo e TypeScript, com Expo Router. Testar integrações nativas em development builds.
- Supabase Auth: identidade e sessões. Escolher armazenamento de sessão apropriado para mobile durante a implementação.
- Supabase PostgreSQL: autoridade sobre dados financeiros, regras e importações confirmadas.
- RLS: isolamento por proprietário em todas as tabelas expostas; validar também referências entre entidades do mesmo usuário.
- Supabase Storage: bucket privado para arquivos temporários de importação, com políticas por usuário e retenção definida.
- Supabase Edge Functions: emitir tokens temporários do widget, receber eventos e executar chamadas leves ao provedor com segredos no servidor.
- Fila e worker: processamento assíncrono de arquivos ou sincronizações extensas. Worker separado para parsing pesado/OCR; não assumir que cabe nos limites de CPU e memória das Edge Functions.
- Adapter por fornecedor: converter dados externos para o modelo interno sem acoplar dashboard e regras financeiras a um provedor.

CRUD comum pode usar o cliente Supabase com RLS. Operações financeiras compostas precisam ser atômicas no banco/servidor, por exemplo confirmar uma importação ou pagar uma fatura. Não manter um segundo backend amplo apenas para repetir o CRUD do Supabase.

## Modelo de domínio inicial

Proposta conceitual, ainda sem schema ou migrações:

| Entidade | Responsabilidade |
| --- | --- |
| profiles | Preferências do proprietário |
| accounts / balance_snapshots | Contas, saldo inicial e snapshots de saldo externo |
| categories / budgets | Classificação e limites mensais |
| transactions / transaction_sources | Lançamentos canônicos e sua proveniência manual/arquivo/provedor |
| transfers | Vincular saída e entrada de uma transferência própria |
| credit_cards / purchases / installments | Dados dos cartões e compromissos futuros |
| statements / statement_payments | Faturas e pagamentos vinculados à conta de origem |
| recurring_rules | Regras de recorrência e prevenção de geração repetida |
| imports / import_rows | Arquivo, processamento, prévia e confirmação |
| bank_connections / sync_runs / webhook_events | Consentimentos, execução, erros e idempotência |

Segredos do provedor não são campos acessíveis pelo cliente. Tabelas internas de processamento não precisam ser expostas na Data API.

## Regras que guiam o modelo

- Dinheiro em centavos inteiros ou decimal exato; nunca usar ponto flutuante para somar valores financeiros.
- Distinguir data da operação, contabilização, competência, vencimento e horário do evento. Usar datas locais para vencimentos e instantes com fuso para eventos.
- Transferência própria não é receita/despesa; tarifas podem ser despesas separadas.
- Pagamento de fatura reduz saldo e obrigação, sem contabilizar novamente as compras como gastos.
- Padrão proposto do relatório mensal: parcela/fatura do mês para cartão; informar a regra na interface. Visão por data de compra é uma visão distinta.
- Saldo externo é um snapshot de reconciliação; não somá-lo novamente ao histórico. Histórico incompleto não pode ser apresentado como saldo calculado completo.
- Limite total do cartão e limite disponível são conceitos distintos; usar dado externo quando disponível e identificar estimativas.
- Respeitar faturas e datas retornadas pelo banco. A alocação manual no fechamento precisa de regra explícita e possibilidade de ajuste.
- Repetição de arquivo, job ou webhook não pode duplicar lançamentos.
- Não deduplicar cegamente por data e valor: duas compras legítimas podem coincidir. Usar IDs estáveis quando existirem e enviar correspondências incertas para revisão.
- Ao conectar um banco já importado, reconciliar as fontes e preservar categorias e correções do usuário.
- Dados parciais ou indisponíveis devem aparecer como tal; não inventar parcelas ou identificar Pix apenas por heurística silenciosa.

## Pipeline de importação

Selecionar arquivo e conta → validar tipo/tamanho → extrair linhas → normalizar datas/valores → detectar candidatos a duplicidade → mostrar prévia e erros → confirmar atomicamente → atualizar relatórios.

CSV: delimitadores, cabeçalhos, vírgula decimal, sinal e codificação variáveis, com mapeamento de colunas. OFX: adapter próprio. PDF: parser por layout/banco e validação de linhas/totais; totais podem ser usados como conferência sem virar transações. Um comprovante Pix representa uma operação, não um extrato completo.

Arquivos ambíguos não geram lançamentos automaticamente. Reter o original apenas pelo tempo necessário e definido, manter metadados de auditoria sem copiar conteúdo sensível para logs. Envio a serviços de OCR/IA externos exige decisão explícita sobre fornecedor e tratamento dos dados.

## Fases e dependências

1. Contrato de produto e investigação de Open Finance em sandbox.
2. Acesso isolado, contas e registro de despesas.
3. Transferências e cartões/faturas.
4. Importação CSV e depois OFX/PDF suportado.
5. Dashboard, orçamentos e lembretes.
6. Piloto real de Open Finance, se viável comercialmente.
7. Beta em aparelhos e preparação para distribuição.

Detalhamento e critérios em `tasks/todo.md`. A prova de Open Finance é antecipada; o lançamento do núcleo não depende de contratar sincronização. Não há estimativa fechada de prazo enquanto cobertura bancária e layouts de PDF estiverem indefinidos.

## Riscos e decisões pendentes

| Risco | Tratamento proposto |
| --- | --- |
| Custo mínimo da integração incompatível com piloto | Importação funcional e prova comercial antes da contratação |
| Bancos/cartões com campos ausentes | Matriz de cobertura e teste real com os bancos prioritários |
| Duplicação entre arquivo e sincronização | Proveniência, IDs e reconciliação revisável |
| PDF interpretado incorretamente | Layouts suportados, prévia obrigatória e nenhuma gravação silenciosa |
| Vazamento entre usuários | RLS e testes com dois usuários desde a primeira etapa |
| Processamento pesado exceder Edge Functions | Jobs persistidos e worker apropriado |

Pendências: tipo PF/PJ das contas Banco do Brasil, Mercado Pago, PicPay e Inter e cartões do piloto; Android/iOS prioritário; orçamento de integração; formatos reais de extrato; identidade/nome do produto; política de retenção; requisitos de privacidade e distribuição comercial; projeto Supabase de desenvolvimento. Não buscar credenciais antes de precisar configurar serviços.

## Fontes consultadas

- Banco do Brasil, catálogo de APIs: https://www.bb.com.br/site/developers/
- Inter, elegibilidade da API: https://developers.inter.co/duvidas-frequentes
- Mercado Pago, relatório Dinheiro em conta: https://www.mercadopago.com.br/developers/pt/docs/reports/account-money/introduction
- Mercado Pago, geração por API: https://www.mercadopago.com.br/developers/pt/reference/settlements-report/create-report/post
- PicPay, documentação de pagamentos: https://developers-business.picpay.com/

- Banco Central, participação e consentimento: https://www.bcb.gov.br/meubc/faqs/s/open-finance
- Pluggy, preços e teste: https://www.pluggy.ai/precos
- Pluggy, FAQ e atualização: https://docs.pluggy.ai/en/docs/get-started/faq
- Pluggy, sandbox: https://docs.pluggy.ai/en/docs/guides/sandbox
- Pluggy, diferenças de campos: https://docs.pluggy.ai/en/docs/connections/open-finance-vs-direct-fields
- Belvo, agregação Brasil: https://developers.belvo.com/pt-br/products/aggregation_brazil/aggregation-brazil-introduction
- Belvo, ambientes: https://developers.belvo.com/apis/belvoopenapispec/section/introduction/sandbox
- Supabase, React Native Auth: https://supabase.com/docs/guides/auth/quickstarts/react-native
- Supabase, RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase, Storage: https://supabase.com/docs/guides/storage/security/access-control
- Supabase, limites de funções: https://supabase.com/docs/guides/functions/limits
