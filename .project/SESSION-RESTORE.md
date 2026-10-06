# Correção da restauração de sessão e da abertura — 05/10/2026

O provedor recebia a mesma conta por `getSession()` e por eventos de autenticação. Cada aviso apagava o estado e incrementava a geração da leitura, mas o efeito só recarregava ao mudar o modo ou o ID do usuário. Um aviso duplicado durante ou depois da leitura deixava a conta vazia até o próximo login.

A transição agora considera o ID do usuário: avisos da mesma conta atualizam a sessão sem limpar o extrato. Eventos de autenticação têm precedência sobre o snapshot inicial atrasado. Uma troca de conta ou saída continua invalidando respostas antigas. A interface exibe carregamento enquanto recupera os dados, e erros de recuperação são apresentados ao usuário.

Sete testes exercitam o FinanceProvider real com respostas controladas: evento inicial durante a leitura, snapshot atrasado, eventos duplicados, renovação inicial, troca de usuário, saída durante leitura e falha de recuperação. O código anterior falhou em quatro testes; o corrigido passou. TypeScript e a suíte de 79 testes passaram, assim como os três testes de navegador de perfil/login com OAuth simulado.

A abertura nativa ainda continha o desenho padrão de círculos. Foi instalado `expo-splash-screen` 57.0.9 e configurado o símbolo local do Cifrio, com fundo #F4F8FC. O splash aguarda as fontes. A geração do APK reaplica o prebuild para sincronizar os plugins mesmo quando a pasta Android já existe. Os recursos nativos gerados foram inspecionados visualmente.

O script de build usa uma pasta física curta em `C:\CifrioBuild` (ou o parâmetro `-BuildRoot`). Isso mantém código e dependências na mesma unidade, evitando o conflito entre caminhos físicos e a antiga unidade `subst` durante o codegen do React Native. JDK, SDK e variáveis de ambiente continuam sendo restaurados ao fim da execução.

A validação automatizada usa respostas de autenticação e dados simuladas; não certifica execução em celular. Sem aparelho conectado por ADB, a confirmação final consiste em instalar o APK por cima da versão anterior, abrir a conta com dados, fechar completamente o app e reabri-lo sem sair da conta, verificando saldo/extrato e a abertura do Cifrio.

APK gerado e verificado: 43467621 bytes; SHA-256 51DD6D2B2D22B0A7AB031DEED0C8BF17BC4B0F7A9E98E474BBEA0A64FE5CE05D. Assinatura v2 e certificado identico ao pacote anterior. A compilacao exigiu encurtar tambem os intermediarios do CMake e definir CMAKE_OBJECT_PATH_MAX=250; o ajuste esta no script android-low-memory.gradle.


Entrega recompilada como 1.1.1, versionCode 2: artifacts/cifrio-1.1.1-arm64.apk, 43.499.337 bytes, SHA-256 A4D09518E1F7A827375B793873CD55B2D6C6F185D0D09FB1047FD9DEFF9957FA. Versão interna, assinatura v2 e bundle conferidos. Esta compilação precede a reformulação 2.0.0 do código atual; detalhes em ANDROID-APK.md.
