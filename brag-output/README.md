# Apresentação do Cifrio — 06/10/2026

- Vídeo: [brag.mp4](brag.mp4), 22 segundos, 1920x1080, 30fps, H.264 e áudio AAC; 660 quadros e 2.354.566 bytes.
- Capa: [brag.jpg](brag.jpg), extraída do gancho a 1,5s e incorporada somente ao primeiro quadro do MP4.
- Legenda: [share-copy.txt](share-copy.txt).
- Fontes editáveis: [composition/index.html](composition/index.html), roteiro em [brag-plan.md](brag-plan.md) e direção em [composition-brief.md](composition-brief.md).
- Prévia local: http://localhost:3017/#project/composition enquanto o servidor estiver ativo.

Feito com a skill brag e Hyperframes 0.8.137. Telas recriadas em HTML com base nos componentes atuais do aplicativo, adaptadas à escala do vídeo. Valores e descrições são fictícios e identificados na composição. Sem dados pessoais, credenciais ou consulta bancária.

## Verificação

`hyperframes check` passou sem erros de lint, execução, layout e contraste; 96 verificações de texto passaram. Sete avisos estáticos sugerem modularização dos cinco clips e identificam a reutilização do logo; não impediram os checks. Quadros principais revisados visualmente. A checagem de motion sidecar não foi ativada; as animações foram inspecionadas nas capturas.

Render local: captura drawElement com GPU, um worker, 30,7s. A chamada PowerShell retornou código 1 durante redirecionamento de stderr, embora o renderizador tenha concluído e validado o artefato. Conferência independente via FFprobe e recodificação para a capa confirmaram duração, dimensões, 660 quadros e faixa de áudio de 22s. Detalhes em check.json e media-info.json.

## Assets

Marca do projeto e Manrope fornecido pelo pacote @expo-google-fonts/manrope. Música `happy-beats-business-moves-vol-1-by-ende-dot-app.mp3` fornecida pela skill brag, origem ende.app. O README dessa biblioteca pede confirmar os termos exatos antes de publicar ou redistribuir; os termos não estavam anexados. Efeitos de interface Kenney CC0 fornecidos pela mesma skill. Sem narração.

Extração de áudio reativo omitida porque o helper oficial exige Python e numpy, indisponíveis no ambiente. As animações são coreografadas com cues do preset musical.

## Reproduzir localmente

As ferramentas usadas estão em tooling/ e não entram no Git. Instalar `hyperframes@0.8.137` e disponibilizar FFmpeg/FFprobe para reproduzir em outra máquina. Dentro de composition/, executar `npm run check`, `npm run dev` ou `npm run render`. Aplicar a capa ao primeiro quadro após renderizar, conforme a skill brag.
