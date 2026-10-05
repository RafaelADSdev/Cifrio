# APK Android do Cifrio

## Gerar no Windows

Requisitos: dependencias npm instaladas, JDK 21 e Android SDK com plataforma 36, Build Tools 36.0.0, NDK 27.1.12297006 e CMake 3.22.1.

```powershell
powershell.exe -ExecutionPolicy Bypass -File scripts/build-apk.ps1
```

Para instalacoes em outros caminhos, passe `-JavaPath` e `-AndroidSdk` ao script.

O script copia o projeto para `%LOCALAPPDATA%\CifrioBuild`, mapeia uma unidade temporaria para manter caminhos curtos e sem acentos, e compila `:app:assembleRelease` para `arm64-v8a`. Metro, Gradle e CMake usam concorrencia limitada para evitar falta de memoria. A unidade e as variaveis de ambiente sao restauradas ao terminar; a copia de compilacao permanece no caminho informado pelo script.

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

## Pacote verificado em 05/10/2026

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
