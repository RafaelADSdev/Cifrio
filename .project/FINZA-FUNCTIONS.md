# Funções da Finza adaptadas ao Cifrio

Referências públicas consultadas em 05/10/2026:
- https://finza-nextjs.vercel.app/documentation
- https://themeforest.net/item/finza-nextjs-fintech-banking-pwa-app-template/64061920

O iframe do preview aponta para https://finza-nextjs.vercel.app/. A documentação pública enumera 44 páginas e informa que o template é frontend com armazenamento local, sem API centralizada. As telas interativas não foram navegadas nesta sessão: não há navegador CUA conectado e o wrapper retornou Cloudflare. O inventário abaixo vem da documentação, não de uma validação funcional da demo.

## Adaptação

| Grupo da referência | Situação no Cifrio |
| --- | --- |
| Entrada, splash, cadastro, login e perfil | Fluxos existentes preservados |
| Cartões, cadastro, detalhes e limites | Funcionalidades existentes preservadas |
| Enviar dinheiro e pagamentos | Atalhos para registrar receita, despesa e transferência no domínio existente |
| Estatísticas | Nova tela: seis meses, receitas, despesas, resultado, comparação e categorias |
| Atividade e consulta | Cinco registros recentes, detalhes e filtros combináveis de período/tipo/conta/cartão |
| Central de ajuda | Nova tela com regras do produto, acesso pelo perfil |
| Identidade, cidadania, PIN de cartão, emissão de cartão | Não se aplicam ao controle pessoal atual; exigem provedor e escopo bancário |
| QR, beneficiários, câmbio, idiomas e notificações | Sem implementação nesta entrega; extensão de carteira digital depende da preferência solicitada |
| PWA | Não portado de Next.js. O projeto atual é Expo/mobile; não foi alterada a arquitetura de distribuição |

## Contrato visual e de interação

Na primeira etapa funcional, a aparência existente foi preservada. O pedido posterior para usar a estética da Finza substituiu o tema visual; ver FINZA-VISUAL.md e DESIGN.md. Marca Cifrio e comportamento financeiro permanecem. Estatísticas como rota secundária, acessível no início/perfil. Atalhos circulares no início, gráficos de barras horizontais usam a mesma escala, valores sempre disponíveis em texto. Mostrar estado vazio, sem exemplos fictícios. O extrato usa data de registro; estatísticas usam competência da parcela e explicam essa diferença. Não transformar registro manual em pagamento bancário.

## Validação

Verificar TypeScript, testes de domínio e jornadas web nas larguras 320/390/768/1440. Registrar os resultados reais após execução. Não implica validação em aparelho ou implantação remota.

## Resultado verificado em 05/10/2026

- npm.cmd run check: TypeScript sem erros; 17 arquivos de testes e 86 testes aprovados.
- npm.cmd run build: exportação web aprovada.
- npm.cmd run test:browser -- tests/browser/finza.spec.ts tests/browser/journey.spec.ts: 12 jornadas aprovadas em 2 minutos.
- Estatísticas e ajuda verificadas com axe e sem overflow de documento em 320, 390, 768 e 1440 px. Journey existente também verificou as abas nessas larguras.
- Fluxos verificados: atalhos de receita/despesa, detalhes na atividade recente, resumo financeiro, busca sem acentos, filtros, central de ajuda; regressão de contas, Pix manual, transferências, parcelas, pagamentos, persistência, CSV e exportação.
- Capturas: .project/evidence/finza-statistics-{320,390,768,1440}.png, finza-help-{320,390,768,1440}.png e finza-statistics-populated-{390,1440}.png. Inspeção visual das estatísticas em 390/1440 px realizada.
- A contagem de duplicatas no teste CSV foi ajustada para contar ações de edição no extrato: o mesmo texto também aparece na atividade recente da aba Início mantida montada pelo navegador de abas.
- Nenhuma implantação, alteração remota de schema ou teste em aparelho realizado nesta entrega.
