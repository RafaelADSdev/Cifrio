# Versionamento do aplicativo

Aplicar sempre a regra X.Y.Z definida pelo usuário, usando a última versão entregue como base:

- X — MAJOR: mudança drástica, reformulação visual completa, novos recursos que mudam a forma de usar o app, alteração estrutural incompatível ou remoção de funções antigas. Incrementar X e zerar Y e Z.
- Y — MINOR: novas funcionalidades ou melhorias significativas que preservam o funcionamento existente. Incrementar Y e zerar Z.
- Z — PATCH: correções de bugs e otimizações de segurança ou desempenho, sem novas funcionalidades. Incrementar apenas Z.
- Quando uma entrega contiver mudanças de mais de um tipo, usar o nível mais alto presente.
- Exemplos a partir de 1.1.1: correções → 1.1.2; funcionalidades compatíveis → 1.2.0; mudança maior → 2.0.0.
- Sincronizar expo.version em app.json, version em package.json, versão raiz e packages[""] em package-lock.json, metadados nativos e nome do APK cifrio-X.Y.Z-arm64.apk.
- versionCode do Android e buildNumber do iOS são contadores de instalação separados; incrementá-los para uma nova versão entregue.
- Recompilar a mesma entrega não exige incrementar X.Y.Z. Uma versão explicitamente solicitada pelo usuário deve ser respeitada.
- Alterar a versão não autoriza renomear o aplicativo ou mudar o identificador do pacote.
- Antes de entregar o APK, conferir sua versão, contador de instalação e assinatura, e registrar a entrega em .project/ANDROID-APK.md.

# Patch notes obrigatórios no README

- Após toda atualização do projeto, atualizar a seção `Patch notes` do `README.md` no mesmo conjunto de mudanças, antes de considerar a tarefa concluída ou entregar um APK.
- Registrar versão, data em `DD/MM/AAAA` e um resumo em português do que mudou para o usuário: funcionalidades, melhorias visuais, correções, desempenho, segurança ou documentação, conforme a atualização.
- Manter as versões mais recentes primeiro e preservar o histórico anterior. Não substituir o histórico apenas pela última atualização.
- Usar a versão da entrega conforme a regra X.Y.Z acima. Ao complementar ou recompilar a mesma entrega, atualizar sua entrada sem duplicá-la nem incrementar a versão apenas para escrever os patch notes.
- Distinguir mudanças no código de APKs realmente compilados e entregues. Só registrar testes, compilações e validações que tenham sido executados; mencionar limitações relevantes.
- O histórico no README é obrigatório mesmo quando houver registros complementares em `.project/ANDROID-APK.md` ou outros documentos.
- Formato de entrada: `### X.Y.Z — DD/MM/AAAA`, seguido de tópicos curtos sobre a atualização.
