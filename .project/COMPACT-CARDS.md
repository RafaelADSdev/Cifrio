# Início compacto e cartões — 2.1.0

Pedido do usuário: seguir mais de perto a ideia compacta da Finza, ampliar atalhos e apresentação dos cartões com bandeira e temas; manter login Google, cores e logo.

## Direction contract

THESIS: abrir o Cifrio para entender o mês e agir por atalhos, com cartões identificáveis e menos altura.

OWN-WORLD: preservar o preto, floresta e lima da adaptação Finza. Cartões podem usar Floresta, Carbono, Oceano e Ameixa, com tinta clara e bandeira informada pelo usuário. Login, botão Google e pixels da logo preservados.

STORY: saldo registrado > resumo mensal > atalhos > cartão e fatura > atividade. Importação e assinaturas ficam acessíveis pelo início.

FIRST VIEWPORT: carteira compacta com saldo e Adicionar na mesma linha quando houver espaço; resumo mensal e atalhos circulares. A faixa de cartões começa logo após os atalhos e continua ao rolar. O início funciona sem cartão cadastrado.

FORM: refinamento da direção Finza fixada pelo usuário, semente 7a9af249 já registrada; sem nova direção ou comp. Prévia web mobile e desktop; não certificar native com screenshots web.

FINISH: revisão independente sobre capturas frescas, registro do sistema visual e testes dos novos caminhos.

## Funções e compatibilidade

- Cartão tem campos opcionais network, theme e lastFour. Os dados existentes sem esses campos usam tema Floresta e não inventam bandeira ou número.
- Últimos dígitos aceitam exatamente quatro números ou campo vazio; não armazenar número completo, CVV, PIN ou senha.
- Cadastro e edição reutilizam o mecanismo de operações existente. Os registros JSON preservam os campos; nenhum esquema ou serviço remoto foi alterado nesta entrega.
- Cartões no início rolam horizontalmente dentro da própria faixa. Tocar em um abre a fatura daquele cartão. A tela de cartões mostra o escolhido e permite trocar entre os cadastros.
- Cadastro de cartão fica recolhido após salvar. Editar, excluir, comprar, pagar e agenda de parcelas seguem os fluxos existentes.
- A jornada de reload revelou um ciclo de navegação na entrada direta de /cards sem sessão. O Stack usa guardas do Expo Router para disponibilizar entrada ou abas segundo o modo atual.

## Referência e versionamento

Referência pública adicional: https://finza-nextjs.vercel.app/my-cards, capturada em .project/evidence/finza-reference-cards.png. Inspiração de apresentação e gestão; funções bancárias da demo não são declaradas como operações reais do Cifrio.

MINOR sobre 2.0.0: nova entrega 2.1.0, Android versionCode 4 e iOS buildNumber 4. Nome e pacote preservados. Nenhum novo APK até registro de compilação em ANDROID-APK.md.

## Evidência final — 06/10/2026

- TypeScript e 87 testes unitários, em 17 arquivos, aprovados.
- Suíte completa de navegador com 21 testes aprovada após corrigir a entrada direta sem sessão. Depois do ajuste final de densidade e seleção por rota: 10 jornadas de cartão e regressão aprovadas.
- Nova jornada verifica bandeira, tema, quatro dígitos, recolhimento do cadastro, recarregamento real do armazenamento local, abertura do cartão correto e reabertura depois de trocar a seleção. Login Google permanece disponível.
- Axe e overflow verificados em 320/390/1440 na jornada nova; jornadas gerais também em 768. As capturas aguardam os 420ms de animação do mês antes de registrar o texto.
- Capturas finais: .impeccable/review/compact-mobile.png, compact-desktop.png e themed-card-mobile.png. O ícone de raio no ambiente de desenvolvimento pertence ao Metro.
- Revisor independente retornou ship no escopo da prévia web, sem correções materiais. Documentação canônica atualizada após a última correção.
- Exportação web e bundle Android/Hermes aprovados. Nenhum novo APK, teste de dispositivo nativo, implantação ou alteração de serviço remoto nesta entrega.
