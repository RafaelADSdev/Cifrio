# APK Android do Cifrio

## Entrega 2.3.0 verificada — 06/10/2026

- Arquivo: `artifacts/cifrio-2.3.0-arm64.apk`, 45.277.686 bytes (45,3 MB).
- Inclui refinamento de interface e movimentos com UI/UX Pro Max e Design Motion Principles, editor de limites recolhível, suporte a alterações de movimento reduzido com o app aberto e correção de sobreposição entre seções no celular.
- `aapt dump badging`: nome Cifrio, pacote `com.cifrio.app`, versão `2.3.0`, versionCode `8`, ABI `arm64-v8a`, minSdk 24 (Android 7.0), targetSdk 36.
- Gradle `:app:assembleRelease`, incluindo `lintVitalRelease`: BUILD SUCCESSFUL em 11m06s; 541 tarefas executadas e 28 atualizadas.
- `apksigner verify --verbose --print-certs`: assinatura APK v2 válida, certificado Android Debug SHA-256 `fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c`, igual às entregas anteriores e compatível com atualização sobre 2.2.1.
- Bundle JavaScript/Hermes incorporado: `assets/index.android.bundle`, 3.997.376 bytes. Bibliotecas `libreanimated.so` e `libworklets.so` presentes para ARM64.
- SHA-256: `2B4DBF38E3BA53CB6ED23B73A2FF5FCDBCF00D8AE0E425B14C27A0149C2414EC`. Arquivo entregue idêntico ao APK original compilado.
- Fontes, assets e configurações sincronizados em `C:\CifrioBuild\b-7c677980\app`, com prebuild Android executado antes da compilação. Integridade dos arquivos de UI/movimento e metadados conferida contra o projeto. Log: `.project/evidence/apk-2.3.0-build.log`.
- Mantida a versão da entrega 2.3.0 e os contadores Android/iOS 8. Verificações de código, testes e exports estão em `UI-MOTION-2.3.0.md`; nenhum novo incremento por compilar esta mesma entrega.
- Nenhum dispositivo conectado por ADB. Instalação e execução nativas ainda não verificadas. APK de instalação direta com assinatura de teste, conforme os limites de distribuição abaixo.

## Entrega 2.2.1 verificada — 06/10/2026

- Arquivo: `artifacts/cifrio-2.2.1-arm64.apk`, 45.272.562 bytes (45,3 MB).
- Correções visuais: ícone de instalação centralizado e seleção da barra inferior em cápsula tonal apenas ao redor do ícone. Destinos, módulos e funções preservados.
- `aapt dump badging`: pacote `com.cifrio.app`, nome Cifrio, versão `2.2.1`, versionCode `7`, ABI `arm64-v8a`, minSdk 24 e targetSdk 36.
- Gradle `:app:assembleRelease`, incluindo `lintVitalRelease`: BUILD SUCCESSFUL em 12m28s; 541 tarefas executadas e 28 atualizadas.
- Assinatura APK v2 válida, certificado SHA-256 `fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c`, igual às entregas anteriores e compatível com atualização.
- Bundle Hermes presente, 3.992.252 bytes. Ícone foreground mapeado em `aapt dump resources`, extraído de `res/5c.webp` e conferido em `.project/evidence/launcher-2.2.1-apk.webp`: símbolo centralizado no canvas de 432×432px.
- SHA-256: `F3AFD4DC2AA3386FE08BBEA5C258E5A4BAAF53C146497B6BD955E07768EDFFA9`. Arquivo em artifacts idêntico ao original compilado.
- Fontes e assets atuais sincronizados na cópia ASCII `C:\CifrioBuild\b-7c677980\app`; dependências não alteradas, prebuild executado e intermediários existentes usados pelo Gradle. Log: `.project/evidence/apk-2.2.1-build.log`.
- Versões Expo/package/lock/Android sincronizadas em 2.2.1; contadores Android/iOS 7. TypeScript e quatro testes de navegador passaram em 320/390/768/1440px. Aparência da barra conferida na prévia web; sem aparelho ou emulador disponível, instalação e execução nativas ainda não verificadas.

## Entrega 2.2.0 verificada — 06/10/2026

- Arquivo: `artifacts/cifrio-2.2.0-arm64.apk`, 45.291.618 bytes (45,3 MB).
- Inclui gráfico de pizza animado, resumo mensal de valores já comprometidos e navegação mobile com cinco destinos e menu Mais.
- `aapt dump badging`: nome Cifrio, pacote `com.cifrio.app`, versão `2.2.0`, versionCode `6`, ABI `arm64-v8a`, Android mínimo API 24 (7.0), target API 36.
- Gradle `:app:assembleRelease`, incluindo `lintVitalRelease`: BUILD SUCCESSFUL em 19m53s, 569 tarefas executadas.
- `apksigner verify --verbose --print-certs`: assinatura APK v2 válida, certificado Android Debug SHA-256 `fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c`, idêntico ao APK 1.1.1. Assinatura compatível com atualização sobre a entrega anterior.
- Bundle Hermes incorporado: `assets/index.android.bundle`, 3.992.056 bytes. Bibliotecas ARM64 do aplicativo e das animações presentes.
- SHA-256 do APK: `346EC3F9ABF00B139BCE979AC4CBB8C8480771E56A2D436F49E4284AB2AB84BB`. Hash do arquivo em artifacts idêntico ao original compilado.
- Cópia de compilação: `C:\CifrioBuild\b-7c677980\app`. Log: `.project/evidence/apk-2.2.0-build.log`.
- Metadados conferidos no caminho ASCII da cópia de build porque o aapt não aceita o acento do caminho Gestão neste ambiente.
- Configuração Expo/package/lock/Android sincronizada em 2.2.0; Android versionCode 6 e iOS buildNumber 6. Sem novo incremento por compilar a mesma entrega.
- Nenhum dispositivo conectado por ADB. Instalação e execução em celular ainda não verificadas. APK para instalação direta; assinatura atual é de teste, conforme os limites abaixo.

## Correção das cores originais — 2.1.1

Paleta azul/ciano/clara restaurada, mantendo layout e funções compactas. Configurações Expo/package/lock/native Android em 2.1.1, versionCode 5, iOS buildNumber 5. Próximo APK esperado: cifrio-2.1.1-arm64.apk. Não há APK novo compilado ou entregue nesta correção. Histórico anterior abaixo.

## Código da melhoria compacta — 2.1.0

Início com atalhos e faixa de cartões; bandeira, tema e final opcionais. Versões sincronizadas: Expo/package/lock/native Android 2.1.0, versionCode 4, iOS buildNumber 4. Próximo APK esperado pelo script: cifrio-2.1.0-arm64.apk. Nenhum APK novo compilado ou entregue nesta melhoria; registros anteriores abaixo permanecem históricos.

## Código da reformulação Finza — 2.0.0

Configuração da nova direção visual sincronizada em app.json, package.json, package-lock.json e Android nativo: versão 2.0.0, Android versionCode 3, iOS buildNumber 3. Nome Cifrio e pacote com.cifrio.app preservados. Fundo e splash escuros, com ícones claros nas barras do sistema.

O script de build nomeia o próximo artefato como artifacts/cifrio-2.0.0-arm64.apk. Esta atualização de código não entrega um APK novo; os pacotes antigos abaixo continuam pertencendo às entregas anteriores. Antes de distribuir 2.0.0, compilar e conferir versão, contador e assinatura. Não há aparelho conectado por ADB nesta sessão.

## Gerar no Windows

Requisitos: dependencias npm instaladas, JDK 21 e Android SDK com plataforma 36, Build Tools 36.0.0, NDK 27.1.12297006 e CMake 3.22.1.

```powershell
powershell.exe -ExecutionPolicy Bypass -File scripts/build-apk.ps1
```

Para instalacoes em outros caminhos, passe `-JavaPath`, `-AndroidSdk` e, se necessario, `-BuildRoot` ao script. Use uma pasta fisica curta e sem acentos para o build.

O script copia o projeto para uma pasta exclusiva em `C:\CifrioBuild` (configuravel em `-BuildRoot`), aplica `expo prebuild` para sincronizar a configuracao nativa e compila `:app:assembleRelease` para `arm64-v8a`. O caminho fisico curto evita acentos, limite de caminhos do Ninja e conflito de unidades no codegen do React Native. Metro, Gradle e CMake usam concorrencia limitada para evitar falta de memoria. As variaveis de ambiente sao restauradas ao terminar; a copia de compilacao permanece no caminho informado pelo script.

Saida: `artifacts/cifrio-<versao>-arm64.apk`, acompanhada do hash SHA-256 exibido no terminal. Os APKs sao ignorados pelo Git. As variaveis publicas existentes no `.env` sao incorporadas ao bundle pelo Expo; nenhuma chave administrativa deve entrar nesse arquivo.

## Instalar

Transfira o APK para um celular Android ARM64 com Android 7.0 ou superior. Abra o arquivo e autorize a instalacao pelo aplicativo usado para abri-lo quando o Android solicitar.

O bundle JavaScript e os assets ficam dentro do APK. O servidor Expo e o Expo Go nao sao necessarios. Login e sincronizacao online continuam dependendo de rede e da configuracao do Supabase.

## Limites desta versao

- A configuracao Android atual assina o release com `android/app/debug.keystore`. E uma compilacao para teste e instalacao direta. Publicacao na Play Store exige assinatura propria e um fluxo de release separado.
- A leitura de PDF esta disponivel apenas na web. No aplicativo nativo, use CSV ou OFX.
- Compilacao e verificacao do pacote nao substituem a validacao dos fluxos em aparelho: login/retorno OAuth, importacao de arquivos, compartilhamento, foto de perfil e persistencia.
- Esta tarefa nao aplica migrations nem altera o Supabase hospedado.

Referencia: [APK no Expo](https://docs.expo.dev/build-reference/apk/).

## Primeiro pacote verificado em 05/10/2026 (anterior a correcao da abertura)

- Arquivo: `artifacts/cifrio-0.1.0-arm64.apk`.
- Tamanho: 43.103.487 bytes (43,1 MB).
- Pacote: `com.cifrio.app`, nome Cifrio, versao `0.1.0`, versionCode `1`.
- Android minimo: API 24 (Android 7.0); target API 36; ABI `arm64-v8a`.
- Gradle `:app:assembleRelease`: BUILD SUCCESSFUL, incluindo `lintVitalRelease`.
- `apksigner verify --verbose --print-certs`: assinatura APK v2 valida, certificado Android Debug.
- `aapt dump badging`: pacote, versao, atividade inicial e arquitetura conferidos.
- ZIP inspecionado: `assets/index.android.bundle` presente (3.798.588 bytes).
- SHA-256: `2354114FDD97F49CDCDC1BA596161380C15EF5381F807CFC6E1CF512C1873B8D`.
- Sem teste de instalacao ou execucao em aparelho nesta entrega.

A primeira compilacao exigiu evitar o acento em `Gestao`, encurtar caminhos para respeitar o limite do Ninja no Windows e limitar a concorrencia C++ separadamente dos workers do Gradle. O script incorpora esses ajustes. A copia usada na entrega permanece em `%LOCALAPPDATA%\CifrioBuild\project`.


## Pacote com correcao de sessao e abertura — 05/10/2026

- Arquivo atualizado: artifacts/cifrio-0.1.0-arm64.apk (43467621 bytes).
- Gradle :app:assembleRelease e lintVitalRelease: BUILD SUCCESSFUL.
- Assinatura APK v2 valida e certificado SHA-256 identico ao pacote anterior; permite atualizar por cima da instalacao anterior.
- Pacote com.cifrio.app, versao 0.1.0, Android ARM64, minSdk 24 e targetSdk 36.
- Bundle Android presente; mensagem da correcao encontrada na tabela UTF-16 do Hermes.
- Recurso drawable/splashscreen_logo mapeado para 5 imagens otimizadas; amostra extraida em .project/evidence/cifrio-splash-apk.png.
- SHA-256: 51DD6D2B2D22B0A7AB031DEED0C8BF17BC4B0F7A9E98E474BBEA0A64FE5CE05D.
- Build em C:\CifrioBuild\b-5a349158, com intermediarios CMake em c/<modulo> e CMAKE_OBJECT_PATH_MAX=250 para permitir encurtamento de caminhos.
- Sem dispositivo conectado por ADB; fechar/reabrir com conta real e observar a abertura ainda requer validacao no aparelho.
- Detalhes da correcao e dos testes: .project/SESSION-RESTORE.md.

## Entrega 1.1.1 verificada — 05/10/2026

Este pacote corresponde à compilação anterior à reformulação 2.0.0 registrada acima. O código atual da reformulação não foi usado nesta compilação.

- Arquivo: `artifacts/cifrio-1.1.1-arm64.apk`.
- Tamanho: 43.499.337 bytes.
- Pacote `com.cifrio.app`, nome Cifrio, versão `1.1.1`, Android versionCode `2`, ABI `arm64-v8a`.
- Gradle `:app:assembleRelease`, incluindo `lintVitalRelease`: BUILD SUCCESSFUL.
- TypeScript e 86 testes em 17 arquivos passaram antes da compilação.
- `aapt dump badging` confirmou a versão e o contador dentro do APK.
- Assinatura APK v2 válida; certificado SHA-256 `fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c`, igual às entregas anteriores.
- Bundle Hermes presente (3.838.260 bytes), com a mensagem da correção de recuperação de sessão.
- SHA-256 do APK: `A4D09518E1F7A827375B793873CD55B2D6C6F185D0D09FB1047FD9DEFF9957FA`.
- Hash da cópia em artifacts idêntico ao arquivo compilado.
- Sem teste de instalação ou execução em aparelho nesta entrega.
- Regra X.Y.Z registrada em `AGENTS.md` e `.cursor/rules/versioning.mdc`; versão semântica e contadores nativos são tratados separadamente.
