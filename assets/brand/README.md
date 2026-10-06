# Cifrio — símbolo de trabalho

`cifrio-logo.png`: logo fornecida para o produto, com símbolo C e a palavra cifrio. Fundo transparente, sem o ponto vermelho do arquivo original. `cifrio-mark.png` é só o símbolo, recortado dessa mesma logo, para usos pequenos. Os pixels da marca permanecem preservados. Em 2.1.1 a interface recupera a paleta original de azul-marinho, azul, ciano e fundos claros; o wordmark em texto acompanha a tinta azul-marinho.

Original preservado em `C:/Users/auzen/.codex/generated_images/01a10c86-3680-7e23-92d4-6df5ea10b1b2/exec-087ab57a-68ad-4753-aad6-0f8200c9f493.png`. A versão consumida pela aplicação está neste repositório. Não há foto de usuário incluída nos assets; imagens dos testes são sintéticas.

Os arquivos `.png.json` registram a procedência dos assets preexistentes sem alterar suas imagens. A derivação exata de `icon.png` e `adaptive-icon.png` não estava registrada. Nenhuma imagem foi gerada nesta reformulação.

`google-g.png`: símbolo oficial do Google, obtido sem alteração visual de `https://developers.google.com/identity/images/g-logo.png`, usado exclusivamente no controle de autenticação. Origem incorporada no PNG, não faz parte da marca Cifrio.

## Ícone de instalação — correção 2.2.1

`launcher-foreground-centered.png` e `launcher-centered.png` corrigem o alinhamento após o pedido de 06/10/2026. A primeira tem transparência para o ícone adaptativo Android; a segunda usa o fundo original #F4F8FC. Ambas têm 1024×1024px, símbolo com 440px de altura e centro em (512, 512), dentro da área segura do ícone adaptativo.

Derivação de `adaptive-icon.png` pelo imagegen para corrigir o posicionamento e limpar as bordas, seguida de normalização do canvas e do recorte alfa pelo System.Drawing. Original gerado preservado em `C:/Users/auzen/.codex/generated_images/01a10f33-e8e2-7f90-9cdf-e6f75e84b032/exec-bd2f5642-ff04-4343-81d9-d888b89acd8c.png`. Assets anteriores, logo e símbolo dentro do aplicativo, splash e botão Google permanecem preservados.
