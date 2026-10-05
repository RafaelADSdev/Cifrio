param(
  [string]$JavaPath = 'C:\Program Files\Java\jdk-21.0.12',
  [string]$AndroidSdk = "$env:LOCALAPPDATA\Android\Sdk"
)

$ErrorActionPreference = 'Stop'
$projectPath = Split-Path $PSScriptRoot -Parent
if (!(Test-Path -LiteralPath "$JavaPath\bin\java.exe")) { throw 'Informe o JDK em -JavaPath.' }
if (!(Test-Path -LiteralPath "$AndroidSdk\platform-tools\adb.exe")) { throw 'Informe o Android SDK em -AndroidSdk.' }

# A separate ASCII path avoids Windows C++ failures on accented project paths.
# Each build gets its own copy so deleted source files cannot survive in staging.
$stageRoot = Join-Path "$env:LOCALAPPDATA\CifrioBuild" ("build-" + [guid]::NewGuid().ToString('N').Substring(0, 12))
$stagePath = Join-Path $stageRoot 'app'
New-Item -ItemType Directory -Path $stagePath -Force | Out-Null
& robocopy $projectPath $stagePath /E /R:1 /W:1 /NFL /NDL /NJH /NJS /NP /XD "$projectPath\.git" "$projectPath\.idea" "$projectPath\.expo" "$projectPath\.impeccable" "$projectPath\dist" "$projectPath\dist-native" "$projectPath\test-results" "$projectPath\artifacts" "$projectPath\android\build" "$projectPath\android\.gradle" /XF *.pdf *.apk
if ($LASTEXITCODE -ge 8) { throw 'Falha ao preparar a copia de compilacao.' }
$buildDrive = @('R', 'S', 'T', 'U', 'V') | Where-Object { !(Test-Path "${_}:\") } | Select-Object -First 1
if (!$buildDrive) { throw 'Nenhuma unidade temporaria disponivel (R a V).' }
& subst "${buildDrive}:" $stageRoot
if ($LASTEXITCODE -ne 0) { throw 'Falha ao encurtar o caminho de compilacao.' }

$environmentNames = @('JAVA_HOME', 'ANDROID_HOME', 'ANDROID_SDK_ROOT', 'NODE_ENV', 'NODE_OPTIONS')
$savedEnvironment = @{}
foreach ($name in $environmentNames) { $savedEnvironment[$name] = [Environment]::GetEnvironmentVariable($name, 'Process') }
$locationPushed = $false
try {
  $env:JAVA_HOME = $JavaPath
  $env:ANDROID_HOME = $AndroidSdk
  $env:ANDROID_SDK_ROOT = $AndroidSdk
  $env:NODE_ENV = 'production'
  $env:NODE_OPTIONS = '--max-old-space-size=768'
  Push-Location "${buildDrive}:\app"
  $locationPushed = $true
  if (!(Test-Path 'android\gradlew.bat')) {
    & npx.cmd expo prebuild --platform android --no-install
    if ($LASTEXITCODE -ne 0) { throw 'Falha ao gerar o projeto Android.' }
  }
  Set-Location android
  & .\gradlew.bat :app:assembleRelease -I (Join-Path $PSScriptRoot 'android-low-memory.gradle') '-PreactNativeArchitectures=arm64-v8a' '-Dorg.gradle.jvmargs=-Xmx768m -XX:MaxMetaspaceSize=512m -XX:+UseSerialGC -XX:ReservedCodeCacheSize=64m -Dfile.encoding=UTF-8' --max-workers=1 --no-parallel --no-daemon --console=plain
  if ($LASTEXITCODE -ne 0) { throw 'Falha ao compilar o APK.' }
  $artifactDirectory = Join-Path $projectPath 'artifacts'
  New-Item -ItemType Directory -Path $artifactDirectory -Force | Out-Null
  $version = (Get-Content -LiteralPath (Join-Path $projectPath 'app.json') -Raw | ConvertFrom-Json).expo.version
  $apkPath = Join-Path $artifactDirectory "cifrio-$version-arm64.apk"
  Copy-Item -LiteralPath 'app\build\outputs\apk\release\app-release.apk' -Destination $apkPath
  & "$AndroidSdk\build-tools\36.0.0\apksigner.bat" verify --verbose $apkPath
  if ($LASTEXITCODE -ne 0) { throw 'A assinatura do APK nao passou na verificacao.' }
  Write-Output "APK: $apkPath"
  Get-FileHash -LiteralPath $apkPath -Algorithm SHA256
} finally {
  if ($locationPushed) { Pop-Location }
  foreach ($name in $environmentNames) { [Environment]::SetEnvironmentVariable($name, $savedEnvironment[$name], 'Process') }
  & subst "${buildDrive}:" /D
  Write-Output "Copia local de compilacao: $stagePath"
}
