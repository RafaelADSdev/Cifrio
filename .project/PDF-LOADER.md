# Leitor PDF fora do Metro

O navegador carrega PDF.js 5.4.296 e worker como ESM estático da própria origem (`/pdfjs/5.4.296/`). Não há CDN nem envio do arquivo original a servidor. Só bytes locais são entregues ao worker. Regras de valores/datas, exclusão de totais e revisão antes da gravação permanecem preservadas.

Identificação atual de titulares: tenta as palavras do nome do perfil em ordem, ignorando acentos, caixa, partículas (de/da/do etc.) e iniciais isoladas. Cada palavra precisa corresponder a uma palavra inteira no cabeçalho do titular, não a um trecho. Sem correspondência, tenta o próximo nome. Ao identificar um único titular, mantém todos os cartões desse titular; com nomes repetidos entre titulares, os nomes seguintes refinam apenas esses candidatos. Ambiguidade final bloqueia a importação, sem misturar pessoas. Esta é uma heurística para organizar a revisão, não prova de identidade ou autorização.

`scripts/prepare-pdfjs.mjs` copia a versão instalada/lockada e licença para `public/pdfjs/`, diretório gerado ignorado pelo Git. Executado automaticamente por `npm run dev`, `npm run web` e `npm run build`. Se usar `npx expo` diretamente, execute antes `node scripts/prepare-pdfjs.mjs`. Publique o `dist` inteiro, incluindo esses módulos e worker com MIME JavaScript; CSP precisa permitir script/worker da própria origem. Caminho atualmente considera publicação na raiz, não subdiretório.

Não há import de execução de PDF.js no código do app; o adapter real Node fica somente no setup Vitest, fora do grafo Metro. Em React Native sem DOM, PDF explica a necessidade da versão web; CSV/OFX continuam disponíveis. Não foi adicionada conversão Python, OCR ou dependência nova.

Limites preservados: 8 MB, 30 páginas, 500 linhas de extrato; PDF sem texto/scan e com senha não geram revisão/gravação. Layouts/fontes incomuns podem exigir suporte específico e a leitura precisa de revisão humana. Erro ao carregar módulos informa falha recuperável; tente novamente ou recarregue após restabelecer os assets. O número de versão nos caminhos é intencional: upgrades exigem atualização e revalidação conjunta de biblioteca/worker.

Verificação: teste de proteção contra imports Metro; testes existentes de PDF/CSV/OFX, incluindo amostra pessoal somente local e sem cópia em evidências; teste Chromium com fatura multicarteira sintética, filtro pelo perfil, compra/crédito, revisão/gravação e rejeição de PDF vazio/protegido. Dados pessoais do PDF exemplo não são incluídos em logs, snapshots ou commits.

Referência de API: [PDF.js — exemplos oficiais](https://mozilla.github.io/pdf.js/examples/).
