# Direção visual Finza para Cifrio

Pedido: usar a estética da demo Finza. Modo Operate. Caminho direto em código, referência pública definida pelo usuário. Semente 7a9af249: a referência fixada pelo usuário prevalece sobre a direção sorteada e os challengers. Não propor mundos visuais alternativos.

## Direction contract

THESIS: controle pessoal com a estética da carteira digital Finza, substituindo o tema claro.

OWN-WORLD: preto, carvão, verde-floresta, lima, números claros, controles arredondados e listas compactas.

STORY: entender o saldo e o mês, registrar uma operação e consultar o histórico sem confundir registros com banco conectado.

FIRST VIEWPORT: marca e avatar compactos; título e mês; carteira verde com saldo e ação principal; duas leituras do mês e atalhos circulares.

FORM: direção Finza fixada pelo usuário; semente 7a9af249 subordinada à referência. Caminho direto em código.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## WORLD
Preto quase absoluto, superfícies carvão, painéis verde-floresta e ação em verde-lima. Branco para números e títulos, verde acinzentado legível no contexto. O nome Cifrio e o símbolo existente permanecem; a palavra cifrio passa a texto claro no cabeçalho.

## FIRST VIEWPORT
Marca compacta e avatar, título e período, carteira verde com saldo registrado e ação principal. Resumo mensal em superfície escura e atalhos circulares. Sem números ilustrativos no runtime.

## VISITOR PATH
Resumo > registrar movimentação ou consultar atividade > extrato/cartões/contas. Abas atuais preservadas e estilizadas; desktop usa barra lateral, mobile navegação arredondada com safe area existente.

## SIGNATURE INTERACTION
Troca de mês existente com deslocamento suave e respeito à preferência de redução de movimento; seleção e foco em lima. Ações circulares apontam para formulários existentes.

## CROSS-SURFACE
Campos, escolhas, avisos, perfil, importação, estatísticas, assinaturas e calendários recebem os mesmos tokens escuros. Botão Google mantém branco e sua marca oficial.

## RISK
Texto claro sobre lima exige tinta escura. Gráficos não podem usar navy sobre carvão. Navegação com seis destinos pede validação em 320px. A adaptação é estética, não uma cópia de marcas ou dados fictícios da demo.

## Referência observada
Screenshot público em .project/evidence/finza-reference-home.png, capturado de https://finza-nextjs.vercel.app/home em 390x844 em 05/10/2026. CSS público consultado confirma --color-primary:#66fe4c e --color-primary-dark:#071605. Referência é inspiração, não comp para cópia pixel a pixel.

## Versionamento
Reformulação visual completa: 2.0.0 sobre 1.1.1. Android versionCode 3 e iOS buildNumber 3. Pacote com.cifrio.app e nome Cifrio preservados. Script existente nomeia eventual APK cifrio-2.0.0-arm64.apk; nenhum novo APK gerado nesta tarefa até registro explícito de compilação.

## Skill de scraping
Verificados .claude/skills, .claude/plugins e skills sincronizadas do Claude Desktop no pacote MSIX. Nenhuma skill scrap/scraping/firecrawl encontrada nesses locais. Consulta direta de CSS e captura pública usadas para esta referência.

## Validação da entrega

- TypeScript aprovado; 86 testes unitários em 17 arquivos aprovados.
- Suíte completa do navegador: 20 testes aprovados. Após o ajuste final de altura do início: 12 jornadas de Finza e regressão aprovadas.
- Acessibilidade com axe e ausência de overflow horizontal verificadas em 320, 390, 768 e 1440 px.
- Exportação web e bundle Android/Hermes aprovados. O Metro recuperou automaticamente um cache de leitura inválido durante a exportação Android.
- Capturas finais do início: .impeccable/review/mobile.png (390x844) e desktop.png (1440x1000); contas e cartões também capturados na jornada.
- Revisão visual independente: ship no escopo da prévia web, sem correções materiais nas capturas e fontes fornecidas. Documentação do sistema extraída após a revisão.
- Marca preexistente preservada; procedência em assets/brand/README.md e sidecars. Nenhum raster novo para a interface.
- Nenhum novo APK gerado, nenhum teste visual em dispositivo Android/iOS e nenhuma implantação remota nesta entrega.
