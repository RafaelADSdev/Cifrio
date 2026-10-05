# Habilitar e homologar Google/perfil online

## Evidência desta entrega

Consulta em leitura do projeto informado: Auth settings HTTP200, `external.google = true`. Início OAuth respondeu HTTP302 para `accounts.google.com`, callback Google apontando para o Auth deste projeto. Sem consentimento, conta real ou código de acesso trocado nesta verificação. PKCE completo foi testado somente com fixtures interceptadas pelo Playwright.

## URLs de retorno

No Supabase correto, Authentication → URL Configuration, permita as URLs exatas:

- `http://localhost:8081/auth/callback` para esta prévia local.
- `gestao://auth/callback` para o development build nativo atual.
- A URL HTTPS real de produção, terminando em `/auth/callback`, quando houver domínio.

O scheme `gestao` foi preservado para não quebrar configuração já existente. O nome exibido é Cifrio; scheme/slug não implicam outro produto. Use dev build registrado; não há homologação em Expo Go, APK/IPA ou aparelho nesta entrega.

Google Cloud: conferir consentimento/audience/test users, escopos `openid`, `userinfo.email`, `userinfo.profile` e OAuth client. Client Secret fica apenas no painel Auth do Supabase, jamais em `.env` público ou no app. O callback autorizado do Google é `https://dhoptxnfzxpocgxmgdrs.supabase.co/auth/v1/callback`; é diferente da URL de retorno do aplicativo.

## Foto privada

Revisar e aplicar **no projeto correto**, com acesso administrativo, a migração `supabase/migrations/20261005164334_profile_avatars.sql`. Ela cria o bucket privado `profile-avatars`, limite de 2 MB, MIME JPEG/PNG/WebP, SELECT/INSERT/DELETE só no prefixo do UID autenticado, sem UPDATE/upsert. Não há overwrite silencioso de um bucket existente: migração falha se o nome já existir, para revisão explícita.

A migração financeira anterior ainda precisa de verificação/aplicação no servidor para usar o extrato online. Esta nova migração não substitui a anterior. Nenhuma alteração remota foi feita nesta entrega.

Nome e referências de avatar são metadados editáveis de apresentação em Auth, não grants/roles nem base para autorização. Upload cria objeto novo; confirma metadados antes de apagar a foto anterior. Limpeza malsucedida é informada. URLs assinadas duram 1 hora e o perfil atualiza a cada 45 minutos. Foto Google inicial só aceita HTTPS em googleusercontent.com. Perfil de teste local não é enviado ao servidor e não é cofre de PII.

## Checklist real pendente

1. Login Google com usuário de teste autorizado, consentimento e retorno correto em web e aparelho.
2. Salvar/ler nome e foto, substituir/remover; sessão atualizada sem perder o extrato.
3. Dois usuários: tentar ler/apagar/uploadar fora do próprio prefixo, anon sem acesso.
4. Confirmar advisors, políticas, redirects, falhas de rede, cancelamento e sessão expirada.
5. Revisar limpeza de fotos órfãs, exclusão de conta/retensão/backups e auditoria de dependências antes do beta comercial.

Referências oficiais consultadas: [Google no Supabase](https://supabase.com/docs/guides/auth/social-login/auth-google), [deep linking](https://supabase.com/docs/guides/auth/native-mobile-deep-linking), [PKCE](https://supabase.com/docs/guides/auth/sessions/pkce-flow), [ImagePicker](https://docs.expo.dev/versions/latest/sdk/imagepicker/), [WebBrowser](https://docs.expo.dev/versions/latest/sdk/webbrowser/). Checklist auxiliar `../../references/security-checklist.md` apontado pela skill não está instalado; aplicada a checklist principal da skill e os padrões de autenticação/upload acessíveis, sem dispensar revisão de produção.
