# UI e movimento — Cifrio 2.3.0

Data: 06/10/2026. Melhorias compatíveis de interface, sem mudança dos módulos ou das regras financeiras. Base entregue: 2.2.1; versão preparada: 2.3.0, Android versionCode 8 e iOS buildNumber 8.

## Direção aplicada

UI/UX Pro Max: consultas focadas em movimento reduzido e feedback acessível em React Native, usando a biblioteca global `C:\Users\auzen\Skills`. Design Motion Principles: Jakub Krehel como referência principal de acabamento de produto e Emil Kowalski como referência de rapidez e contenção. Nenhuma dependência foi adicionada.

Preservados branco, azul-marinho, azul e ciano, Manrope, marca, cinco destinos móveis e navegação lateral. Cartões gerais têm raio de 20px e sombra discreta. O painel de compromissos distingue total futuro, mês, valor e estado em aberto. A legenda da pizza tem separadores leves. O editor de limites abre por ação explícita e preserva o rascunho ao fechar; salvar continua usando a validação e o armazenamento existentes.

## Movimento funcional

| Interação | Tempo | Propósito |
| --- | --- | --- |
| Pressão do botão | 90ms | Confirmar toque com escala 0,98 |
| Retorno do botão / cápsula ativa | 160ms | Restaurar o controle / identificar o destino |
| Troca de mês | 220ms | Orientar a leitura com deslocamento de 12px |
| Abrir controles de limite | 240ms | Introduzir o conteúdo solicitado |
| Atualização de barras | 260ms | Acompanhar a mudança de proporção |
| Atualização da pizza | 320ms | Tornar a mudança de dados perceptível, sem giro |

Curva compartilhada `cubic-bezier(0.22, 1, 0.36, 1)`; somente `transform` e `opacity` são animados. Sem pulsos, animação de layout ou entrada decorativa da tela inteira. Mudanças rápidas de mês podem substituir o movimento em andamento. Reativar animações não repete a apresentação da pizza se os dados não mudaram.

Uma assinatura central acompanha as preferências. No navegador, `matchMedia` acompanha movimento reduzido e teclado desativa movimento até a próxima interação por ponteiro. No dispositivo, `AccessibilityInfo.reduceMotionChanged` acompanha alterações da configuração do sistema, além da consulta inicial. Animações em andamento voltam ao estado final quando desativadas. A navegação de telas e o modal das parcelas também usam esse estado.

Referências: [Reanimated useReducedMotion](https://docs.swmansion.com/react-native-reanimated/docs/device/useReducedMotion/) (valor inicial não acompanha alterações por re-render) e [React Native AccessibilityInfo](https://reactnative.dev/docs/accessibilityinfo) (consulta e evento de mudança).

## Verificação realizada

- `npm.cmd run typecheck`: passou.
- `npm.cmd test`: 87 testes em 17 arquivos passaram.
- `npm.cmd run build`: export web passou.
- `npx.cmd expo export --platform android --platform ios --output-dir dist-native`: ambos os bundles Hermes passaram.
- Navegador Chromium: 25 testes passaram no build web exportado, servido localmente na porta 8094, com `PLAYWRIGHT_PORT=8094` e `--grep-invert 'OAuth PKCE'`. A execução levou 1,2 minuto. O cenário OAuth PKCE simulado passou separadamente na porta 8081, origem autorizada pela configuração existente, com `--grep 'OAuth PKCE'`.
- Verificados contraste WCAG AA com axe, ausência de overflow e navegação em 320/390/768/1440px, importação CSV/PDF, persistência de registros, parcelas, contas, perfil e assinaturas.
- Teste novo confirma expansão acessível do editor, preservação de limites salvos e rascunhos, feedback de pressão, interrupção desse feedback ao ativar movimento reduzido sem recarga e navegação por teclado com gráfico no estado final.
- Capturas atualizadas de pizza e compromissos em `.project/evidence/`. Sem prova de execução em celular, OAuth real ou serviços hospedados nesta tarefa.

A prévia Metro apresentou timeouts intermitentes de recarga. A verificação final dos fluxos locais usou o export compilado, que passou integralmente; a configuração de testes aceita `PLAYWRIGHT_PORT` e os testes de PDF/painel preservam essa origem quando não há override explícito.

## Entrega

No layout vertical, os dois blocos passam a usar a altura do próprio conteúdo; o compartilhamento por `flex: 1` fica restrito à composição lado a lado. Isso remove a sobreposição do bloco de faturas sobre os controles de limites em telas móveis.

APK ARM64 2.3.0 compilado e entregue em 06/10/2026, com contador 8, metadados e assinatura v2 conferidos. O certificado é o mesmo das entregas anteriores; o hash da cópia entregue corresponde ao original compilado. Registro completo em [ANDROID-APK.md](ANDROID-APK.md). Exports e compilação APK não comprovam execução em celular; nenhum dispositivo estava conectado por ADB nesta entrega.
