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

## Escopo da consolidação

Publicação das Etapas 1–3 e da extração estável do componente de apresentação. A Etapa 4 permanece incompleta: não há áreas Aprender/Praticar, lições ou exercícios educativos integrados. A API de cópia de estado do controlador prepara testes futuros de isolamento, sem disponibilizar escrita no estado da partida. Não há IA nem níveis de dificuldade de Xadrez.
