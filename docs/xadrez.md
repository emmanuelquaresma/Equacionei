# Xadrez — motor e regras de empate

O motor local está em `app/frontend/js/xadrez-rules.js`; o controlador permanece em `app/frontend/js/xadrez.js`.
A apresentação compartilhada está em `app/frontend/js/xadrez-board.js`. Os scripts clássicos são carregados na ordem regras, apresentação e controlador em `xadrez.html`. Não há dependência nova, backend ou armazenamento persistente.

## Referência

[FIDE Laws of Chess](https://handbook.fide.com/chapter/E012023), artigos 5.2.1, 5.2.2 e 9.2–9.6.

- Terceira repetição e 50 lances de cada jogador permitem reivindicar; não encerram automaticamente.
- Quinta repetição e 75 lances de cada jogador encerram automaticamente.
- Xeque-mate tem precedência sobre 75 lances.
- Reivindicação pode se basear na posição atual ou numa jogada legal declarada, antes de executá-la.
- Não há relógio, árbitro, penalidades ou regra de peça tocada nesta interface local; selecionar uma peça não é compromisso de jogada.

## Estado e API

- `halfmoveClock`: meias-jogadas desde a última captura ou movimento de peão; limites 100/150.
- `positionHistory`: chaves da posição inicial e de cada movimento legal confirmado.
- `positionKey(state)`: peças, cor, casas, jogador da vez, quatro direitos de roque e alvo en passant apenas se há captura legal, incluindo segurança do rei.
- `getDrawClaims(state, intendedMove?)`: motivos `threefold` e/ou `fiftyMove` disponíveis ao jogador da vez.
- `claimDraw(state, reason, intendedMove?)`: novo estado encerrado, ou `null` se indisponível; não executa uma jogada declarada.
- `drawClaim`: registra jogador e jogada declarada; `drawReason` explica o resultado.
- `isDeadPosition(state)`: retorna verdadeiro somente quando há prova da impossibilidade de mate.
- `applyUnchecked` é primitiva de simulação: atualiza peças/direitos/contador, mas não registra histórico nem adjudica resultados. Partidas reais devem usar `movePiece`.

As funções de consulta não alteram o estado. Movimentos e reivindicações inválidos não alteram tabuleiro, histórico ou contadores.
Fixtures que substituem o tabuleiro devem inicializar `positionHistory = [Chess.positionKey(state)]`; o motor também descarta uma chave final incompatível com o estado atual.

## Posições mortas: cobertura e limites

Certificadas:
- Rei contra rei.
- Rei e um único bispo ou cavalo contra rei.
- Somente reis e qualquer quantidade de bispos, todos em casas da mesma cor.
- Somente reis e peões bloqueados, quando a exploração completa das posições alcançáveis dos reis não encontra mate, avanço de peão nem captura que abra a posição.

A busca não usa empate por repetição, contador de lances, avaliação de vantagem nem minimax para concluir que uma posição é morta. Na classe de peões fixos, há menos de 8192 estados possíveis de localização dos dois reis e jogador da vez.

Dois cavalos, bispos de cores opostas e bispo contra cavalo não são automaticamente mortos: mate cooperativo pode ser possível. Não conseguir forçar mate é diferente de mate impossível.

**Limitação remanescente:** não há detector completo de todas as posições mortas arbitrárias (por exemplo, fortalezas com torres/bispos bloqueados por peões). Fora das classes certificadas, o motor deixa a partida continuar, sem declarar falsamente impossibilidade de mate. A implementação não deve ser apresentada como adjudicação completa de toda posição morta possível.

## Testes locais

Executar `python3 -B tests/browser/xadrez.py` com Chrome/Chromium disponível. O executor serve somente arquivos locais numa porta efêmera, usa perfil temporário e não acessa TESTE/PROD.
Inclui os 41 testes originais, perft 20/400/8902, regressões de empate, motor sem DOM e interface em 320, 360, 390, 430, 768, 1024 e 1366 px.

## Interação e acessibilidade

- Setas respeitam as bordas de cada linha/coluna, com uma única casa na sequência de Tab.
- Enter/Espaço ativam os botões nativos; Escape limpa a seleção.
- Coordenadas visuais ficam dentro dos cantos das casas, sem reduzir o tabuleiro, e não duplicam a leitura das casas.
- Nomes acessíveis informam casa, peça/cor, seleção, captura legal e rei em xeque.
- Capturadas são listas nomeadas com glifos visuais ocultos da árvore acessível e nomes textuais das peças.
- Seleção, destino e xeque têm formas/símbolos diferentes, além de cor, com bordas de contraste e descrição textual.
- Promoção usa diálogo nativo modal, foco inicial em Dama e Tab/Shift+Tab contidos. Cancelar/Escape volta ao peão sem jogar; escolher promoção volta ao destino.
- Reiniciar uma partida com jogadas registradas abre confirmação. O foco inicial é Continuar partida; Cancelar/Escape preserva a partida e retorna ao acionador. Confirmar reinicia e retorna à casa a1.
- A posição inicial sem jogadas e uma partida encerrada podem reiniciar diretamente.
- Controles de ação têm ao menos 44 px de altura. Em 320 px, oito casas de 44 px não caberiam: as casas aproveitam a largura disponível (aproximadamente 36 px) sem rolagem horizontal.

Os testes verificam DOM/árvore acessível, foco real e teclado do Chrome. Isso não substitui uma avaliação humana com leitores de tela (NVDA/VoiceOver/TalkBack). O motor e a limitação anterior de posições mortas permanecem intactos.

## Registro histórico da estrutura educativa — Etapa 4

A página oferece **Jogar**, **Aprender** e **Praticar**. Apenas a lição da torre está disponível; os outros 14 temas aparecem como em preparação. Não há IA nem níveis de dificuldade de Xadrez.

### Arquitetura e isolamento

- `xadrez-rules.js`: motor funcional existente, sem alterações.
- `xadrez-board.js`: apresentação compartilhada dos três tabuleiros; a marca opcional de objetivo é somente visual/acessível.
- `data/xadrez-lessons.js`: catálogo congelado, posição, sequência ilustrativa, objetivos, dicas, feedback e critérios de conclusão.
- `xadrez-learning.js`: cria estados próprios para demonstração e exercício usando o mesmo motor; não recebe referências ao estado da partida.
- `ChessGame.getSnapshot()` fornece uma cópia completa do estado da partida e do contexto de interação para verificação, sem acesso de escrita.

O motor não usa construtores: cada nova chamada a `Chess.restartGame()` cria um estado independente. Demonstração, exercício e partida compartilham funções de regras, mas nunca o mesmo estado. Históricos, capturas, turno, direitos, en passant e contadores são próprios. A interface educativa mantém sua seleção separada do estado de regras. Uma resposta legal errada é simulada pelo motor e descartada; a resposta certa é a única que avança o exercício.

Voltar na demonstração recupera uma cópia da etapa anterior, incluindo todo o histórico e contadores. Trocar de modo conserva a partida e a atividade atual; abrir novamente uma lição reinicia apenas seus estados educativos. Diálogos de promoção/reinício da partida bloqueiam a troca de modo até serem resolvidos. Voltar à partida recupera o foco da casa anterior.

### Lição e exercício de referência

A posição contém rei branco em a1, rei preto em h8 e torre branca em d4. A sequência legal mostra d4 → d6 (vertical), h8 → h7 (turno das pretas) e d6 → f6 (horizontal). O texto explica que a torre não anda na diagonal. Avançar, voltar e reiniciar usam estados completos validados pelo motor.

O exercício solicita d4 → g4, com a casa g4 indicada por ◎ e nome acessível. Há seleção, destinos legais, feedback de acerto/erro, dica e tentar novamente. Conclusão fica apenas na sessão educativa em memória. Próximo exercício só é habilitado quando há outra atividade; esse caminho é coberto por fixture de teste, sem publicar uma segunda atividade.

### Verificação

`tests/frontend/xadrez-learning.test.js` cobre modelo e interface. O executor `python3 -B tests/browser/xadrez.py` preserva as verificações anteriores e testa os três modos em 320, 360, 390, 430, 768, 1024 e 1366 px, incluindo teclado real, árvore acessível e toque CDP.

Comparações completas antes/depois de cada interação usam partidas com en passant efetivo, captura, direitos de roque perdidos, contador não zero e peça selecionada. A geometria do tabuleiro principal permanece idêntica à base publicada.

### Limites e publicação

Esta etapa é somente local na branch `feature/xadrez-etapa4-educativo`, sem commit, push ou promoção para TESTE/PROD. A imagem DEV deve identificar o conteúdo como não commitado (`-dirty`) e registrar a revisão base e o manifesto dos arquivos. Não é correto apresentar esse conteúdo como idêntico ao commit e765b43.

Não há catálogo completo, persistência de progresso ou exercícios adicionais. A avaliação humana com NVDA/VoiceOver/TalkBack permanece recomendada. A limitação do motor para posições mortas arbitrárias continua a mesma. A expansão do conteúdo depende da autorização da Etapa 5.

## Curso educativo — Etapa 5

O conteúdo local atual substitui o catálogo limitado da Etapa 4: há 15 lições disponíveis, 64 etapas demonstrativas e 30 exercícios. A seção anterior registra o escopo histórico da Etapa 4, não o estado atual do curso.

| Lição | Exercícios |
|---|---:|
| Objetivo do Xadrez | 1 |
| Organização inicial do tabuleiro | 2 |
| Identificação das peças | 6 |
| Movimento do peão | 2 |
| Torre | 1 |
| Cavalo | 1 |
| Bispo | 1 |
| Dama | 1 |
| Rei | 1 |
| Capturas | 1 |
| Xeque e xeque-mate | 2 |
| Roque | 2 |
| En passant | 1 |
| Promoção | 2 |
| Empate e afogamento | 6 |

As atividades incluem identificação de peças/casas, movimentos legais e classificação de posições pelo motor. Respostas erradas preservam o estado. Roque move rei e torre, en passant deriva de um avanço duplo real no histórico e promoção oferece escolha, incluindo cavalo. As demonstrações podem usar novos diagramas explicitamente identificados no texto.

Cada lição mantém sua sessão ao alternar entre assuntos. O progresso é separado dos estados do motor e fica somente em memória: resolver novamente não duplica a contagem; tentar novamente reinicia o exercício sem apagar o progresso. Recarregar a página perde esse progresso. Aprender e Praticar preservam integralmente a partida, incluindo seleção, capturas, histórico, turno, roque, en passant e contadores.

### Execução e resultados locais

`python3 -B tests/browser/xadrez.py` executa JavaScript no Chrome/Chromium por CDP, sem exigir Node.js nem instalar dependências. Serve arquivos locais em uma porta efêmera de localhost e usa perfil temporário. Em uma sessão que bloqueie sockets ou o navegador, a execução exige permissão para sair desse isolamento.

Na retomada de homologação, passaram 41 verificações do motor (incluindo perft 20/400/8902), 87 de empate, 64 do modelo educativo de referência e 1034 do modelo completo (64 etapas e 30 exercícios efetivamente resolvidos). Em cada uma das sete resoluções, passaram 1104 verificações da interface do curso, 101 da interface educativa, 84 de interação/acessibilidade, 19 da interface de empate e 63 verificações de teclado real/toque/árvore acessível. Os testes também repetem motor e empate em cada resolução e verificam geometria e ausência de overflow e erros JavaScript/recursos.

As resoluções verificadas são 320×568, 360×640, 390×844, 430×932, 768×1024, 1024×768 e 1366×900. A automação de acessibilidade não equivale a uma avaliação humana com NVDA/VoiceOver/TalkBack. A limitação do detector de posições mortas continua documentada acima.

### Estado da publicação

Esses resultados são locais e não homologam uma revisão em TESTE ou PRODUÇÃO. A consolidação e a promoção permanecem condicionadas à conclusão das regressões e à homologação do ambiente anterior. Arquivos de branding presentes no diretório de trabalho ficam fora do escopo desta entrega.
