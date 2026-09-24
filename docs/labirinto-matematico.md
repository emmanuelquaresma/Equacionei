# Labirinto Matemático

Página: `/static/labirinto-matematico.html`, no carrossel **Jogos**. Canvas desenha o tabuleiro e personagens geométricos originais; HTML mantém HUD, controles, tutorial e resultados. Reutiliza `site.css` e `site-ui.js`. Sem backend, banco, dependências, imagens ou sons externos.

## Responsabilidades

- `js/labirinto-mapa.js`: DFS/backtracking, ciclos, BFS/conectividade, posições e caminhos; não conhece pontos ou tabuadas.
- `js/labirinto-engine.js`: regras matemáticas e motor puro de grid, estados e estatísticas.
- `js/labirinto-services.js`: armazenamento isolado e efeitos originais sintetizados pela Web Audio API.
- `js/labirinto-matematico.js`: input, HUD, Canvas e loop rAF.
- `css/labirinto-matematico.css`: layout próprio sem duplicar o header global.
- `tests/frontend/labirinto.test.js`: testes de motor, serviços e interface.

## Mapas e matemática

Cada fase gera um grid 13×13 por DFS aleatório. Abre até onze passagens adicionais, mantendo bordas fechadas. BFS valida todos os corredores. Nascimento do jogador em (1,1); Operadores começam a pelo menos dez passos. Quatro poderes em regiões próximas dos cantos. Objetivos distribuídos alternando quadrantes.

Há exatamente doze números corretos únicos, de n×1 a n×12. A validação exige inteiro positivo, múltiplo e limite pedagógico; zero, negativos e n×13 não valem. Distratores plausíveis são amostrados do intervalo, excluindo corretos. Não ficam a dois passos ou menos do jogador. Cada distrator é testado como parede junto dos anteriores: o mapa remanescente precisa continuar conectado, permitindo contornar TODOS os erros. Itens, poderes e nascimentos não se sobrepõem.

Mapas são procedurais, sem catálogo fixo. A fase seguinte repete a geração se obtiver a mesma estrutura imediata (até oito tentativas). Como qualquer geração aleatória finita, não se promete exclusividade mundial entre partidas.

## Regras

- Tabuadas 2→12, onze fases. Acerto +100; todos os doze acertos encerram a fase, independentemente dos distratores restantes.
- Bônus por fase +500; sem perder vida na fase, mais +300.
- Três vidas. Erro ou contato com Operador normal custa uma vida e reposiciona o jogador; Operadores retornam a seus pontos seguros. Proteção de dois segundos, inclusive no nascimento. Durante proteção, números errados não são consumidos nem penalizados.
- Operadores: + persegue, − antecipa até duas casas, × é mais rápido, ÷ escolhe corredores aleatoriamente. Quantidade cresce de dois até quatro; intervalo diminui suavemente de 650 a 420 ms, com fator .8 para ×.
- Poder: seis segundos no início, reduzido gradualmente até 4,4 s. Operadores vulneráveis fogem e exibem ◇; capturas rendem 200/400/800/1600, com teto de 1600 nas seguintes durante o mesmo poder. Novo poder renova duração e sequência.
- Capturado entra em RETURNING, usa BFS até sua origem sem causar dano, e volta NORMAL, mesmo se ainda houver poder global.
- Movimento lógico por casas com direção antecipada e passos fixos de 10 ms; jogador avança a cada 180 ms. Verifica colisão após cada passo, evitando que entidades atravessem umas às outras sem contato. Renderização interpola em 80 ms; movimento reduzido desativa a interpolação.
- Pausa congela estado, proteção, poder e movimento. P, botão, aba oculta e interrupção longa pausam. Retorno exige Continuar. Nenhum tempo pausado entra no motor.

## Controles e apresentação

Setas/WASD, D-pad com alvos de pelo menos 44 px e swipe por Pointer Events. Apenas o Canvas usa `touch-action: none`; a página continua rolável fora dele. O menu global permanece disponível. Som começa desligado e pode ser ligado por gesto do usuário; efeitos são tons sintetizados originais. Se o navegador não oferecer áudio, o jogo continua silenciosamente.

Não há sprites, mapas ou amostras de jogos comerciais. Números corretos e errados têm o mesmo estilo para não revelar a solução pela cor. Estados dos Operadores também usam símbolos. O Canvas é uma experiência visual: aria-label, feedback ao vivo e controles por teclado não equivalem a um modo completo para jogadores cegos.

## Persistência e estatísticas

- `mathMazeHighScore`: `{score, highestTable}`.
- `mathMazePreferences`: `{sound, tutorial}`.
- `mathMazeSessions`: até 20 sessões, com atualizações da sessão em andamento identificadas por `startedAt`.

Resumo inclui score, highestTable, correctNumbers, wrongNumbers, livesLost, operatorsCaptured, byTable (`correct`, `wrong`), elapsed em ms, status, início/fim ISO. Grava nas transições, pausa, fim e saída da página. Não restaura o mapa após reload. Falha de armazenamento mantém dados em memória com aviso. Não transmite dados, não altera as chaves dos outros jogos e não integra ML nesta fase.

## Testes

Funções sem bibliotecas:

- `testMathMaze(MazeGenerator, MazeMath, MathMazeGame)`: 330 mapas, conectividade, distratores contornáveis, ciclos, distribuição, matemática, movimentos, buffer, equivalência de FPS, colisões, proteção, captura, expiração, retorno, pausa e campanha.
- `testMazeServices(MathMazeStorage, MathMazeAudio)`: storage isolado, reload, falha, som ligado/desligado com contexto de áudio simulado.
- `testMazeUI(advanceTest)`: executada em perfil isolado do Firefox com relógio/rAF controlados; eventos reais dos handlers de interface. A conclusão das fases posiciona o jogador nos objetivos para testar o fluxo da campanha sem tentar jogar autonomamente todas as perseguições.

Firefox em larguras 1440/768/430/390/360/320 px; validação de Canvas quadrado, D-pad, HUD, menu ativo e ausência de overflow. A campanha automatizada confirma regras/transições, não substitui partidas humanas para calibrar dificuldade. Homologação física em Android/iPhone e avaliação auditiva em dispositivos reais ficam para a próxima etapa.
