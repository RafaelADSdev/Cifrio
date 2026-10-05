# Cifrio, perfil e Google — contrato de implementação

Pedido: nome/logo originais, perfil editável com nome/foto e login Google. Continuação do remake aprovado, sem trocar a direção visual.

Cifrio é nome de trabalho inspirado em cifra. Pesquisa inicial em 05/10/2026 não encontrou app financeiro claramente homônimo; não é busca de disponibilidade de marca/INPI/domínio. Logo gerada como símbolo simples C, azul e verde, destinada à interface; palavra desenhada com Manrope já carregada.

Perfil: nome de exibição de 1–80 caracteres, foto opcional, remover/substituir foto, feedback de gravação. Teste local separado em AsyncStorage; dados pessoais sensíveis não recomendados. Online: metadados de apresentação do próprio usuário Auth, jamais usados para autorização; avatar privado em Storage, prefixo do UID e nome aleatório, URL assinada temporária. Foto PNG/JPEG/WebP até 2 MB, verificação de assinatura e não somente extensão. Nome/foto Google usados como valores iniciais validados. Remoção da foto limpa referência e tenta remover objeto anterior; falha de limpeza informada, não mascarada. Perfil exportável separadamente.

Google: Supabase OAuth PKCE, sem Client Secret no mobile. Web retorna a `/auth/callback`, guarda somente verifier temporário em sessionStorage (sessão/tokens em memória); nativo usa SecureStore e navegador de autenticação. Callback validado contra origem/esquema/caminho esperado, erro genérico, código não registrado em logs. Cancelamento recuperável. Sessão atualizada por edição do perfil não pode apagar o extrato.

Trust boundaries: parâmetros OAuth, metadados do usuário, bytes de imagem, arquivo de teste local, Auth/Storage externos. Abusos a testar: callback de origem/caminho errados, metadados malformados, URL externa não permitida, upload falso ou grande, caminho de avatar de outro usuário, acesso anon/entre usuários, replay de callback e falha de persistência. Foto e nome são PII para apresentação, não telemetria; envio ao Storage somente após salvar. Remoção/correção/exportação do perfil nesta entrega; exclusão global de conta/backups continua pendente.

Verificação remota em leitura: Auth settings HTTP200 indica Google habilitado. Isso não comprova consentimento, redirect allowlist ou retorno autenticado. Admin do projeto anteriormente indisponível; nenhuma migração remota presumida. Storage exige migração e teste real antes de declarar upload online homologado. Dev build/scheme registrado exigido para retorno nativo; Expo Go não homologado.
