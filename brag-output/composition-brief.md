# Hyperframes Composition Brief: Cifrio

Criar a apresentação descrita em brag-plan.md, em português, 1920x1080, 22s, 30fps. Saída composition/ e brag.mp4. Tom app-store, marca e Manrope reais; fundo claro #F4F8FC, texto #042453, azul #0474E0 e acento #23D2BF.

Fontes: README, DESIGN, Dashboard, SpendingChart, CommittedSpending e Entry. Usar elementos visuais e rótulos reais; recriações em HTML com valores fictícios identificados permanentemente. Sem alegações de consulta bancária, ganhos ou integração automática.

Storyboard: gancho 0–3; registro manual 3–8; pizza e legenda 8–14; próximos três meses 14–19; logo e frase final 19–22. Adaptar escala dos componentes ao vídeo, manter frases breves e pausas legíveis. Simular seleção do botão Salvar e confirmação, sem acessar contas reais.

Áudio local: música bundled vol-1 e SFX Kenney CC0, escolhidos por baixo risco de agudos. Preset de cues lido. Marcar beat-grid e beat-locked na implementação. Fades de música via data-automation. Sem voz.

Extração audio-reactive indisponível nesta máquina: não há Python executável/numpy instalado. O helper oficial exige ambos. Sem pulsação inventada como se fosse reação ao áudio; motion da marca é coreografado.

Contrato: um root main, clips cronometrados, um timeline pausado GSAP e assets locais. Validar lint/runtime/layout/contraste via hyperframes check, revisar snapshots antes da renderização. Renderização local autorizada pelo pedido “faça um vídeo”. Não publicar.

Entrega: brag.mp4, melhor quadro brag.jpg incorporado como frame 0, share-copy.txt e fontes da composição. Música fornecida pela skill; licença para publicação deve ser confirmada conforme assets/music/README.md da skill (não há termos exatos anexados).
