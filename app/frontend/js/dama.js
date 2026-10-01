(() => {
    "use strict";
    let gameState = DamaRules.initialState();
    let mode = 'pvp', active = false, thinking = false, generation = 0;
    let worker = null, delayTimer = null, watchdog = null, animationTimer = null;
    let suspended = false, botNotice = '';
    const BOT_DELAY = 450, JUMP_DELAY = 150, WORKER_LIMIT = 1600;
    const $ = id => document.getElementById(id);
    const boardElement = $('checkers-board'), messageElement = $('game-message');
    const turnElement = $('turn-indicator'), winnerCard = $('winner-card'), winnerMessage = $('winner-message');
    const counts = { 1: $('player-one-pieces'), 2: $('player-two-pieces') };
    const captureCounts = { 1: $('player-one-captures'), 2: $('player-two-captures') };
    const isPlayable = (row, col) => (row + col) % 2 === 1;
    const nomeDasPecas = player => player === 1 ? 'peças brancas' : 'peças pretas';
    const isBotTurn = () => mode === 'bot' && gameState.currentPlayer === 2 && !gameState.winner;
    function cancelBot() {
        generation++;
        clearTimeout(delayTimer); clearTimeout(watchdog); clearTimeout(animationTimer);
        delayTimer = watchdog = animationTimer = null;
        if (worker) { worker.terminate(); worker = null; }
        thinking = false;
    }
    function scheduleBot() {
        if (!active || suspended || document.hidden || !isBotTurn() || thinking) return;
        DamaRules.finish(gameState);
        if (gameState.winner) { renderizar(); return; }
        thinking = true;
        const ticket = ++generation, snapshot = DamaRules.clone(gameState), started = performance.now();
        const current = () => ticket === generation && active && !suspended && isBotTurn();
        let settled = false;
        function deliver(moves, fallback = false, info = null) {
            if (settled || !current()) return;
            settled = true;
            clearTimeout(watchdog);
            if (worker) { worker.terminate(); worker = null; }
            // Valida a sequência inteira no motor antes de animar qualquer movimento.
            try {
                let check = snapshot;
                if (!Array.isArray(moves) || !moves.length) throw new Error('Sem jogada');
                for (const move of moves) check = DamaRules.applyMove(check, move, 2);
                if (check.forcedPiece || check.currentPlayer === 2) throw new Error('Turno incompleto');
            } catch (_) { moves = DamaRules.firstTurn(snapshot); fallback = true; }
            botNotice = fallback ? 'Busca indisponível; o computador usou uma jogada legal simplificada.' : info ? `${info.algorithm} · ${info.simulations ? info.simulations + ' simulações' : 'profundidade ' + info.depth + ' · ' + info.nodes + ' posições'} · ${Math.round(info.elapsed)} ms${info.estimate != null ? ' · estimativa do modelo: ' + Math.round(info.estimate * 100) + '%' : ''}` : '';
            let index = 0;
            function step() {
                if (!current()) return;
                if (!moves.length) { DamaRules.finish(gameState); thinking = false; renderizar(); return; }
                gameState = DamaRules.applyMove(gameState, moves[index++], 2);
                gameState.selectedPiece = gameState.forcedPiece;
                if (index < moves.length) animationTimer = setTimeout(step, JUMP_DELAY);
                else thinking = false;
                renderizar();
            }
            delayTimer = setTimeout(step, Math.max(0, BOT_DELAY - (performance.now() - started)));
        }
        renderizar();
        try {
            worker = new Worker('/static/js/dama-ai-worker.js');
            worker.onmessage = ({ data }) => {
                if (data.ticket !== ticket || !current()) return;
                deliver(data.error ? DamaRules.firstTurn(snapshot) : data.moves, !!data.error, data);
            };
            worker.onerror = event => { event.preventDefault(); deliver(DamaRules.firstTurn(snapshot), true); };
            watchdog = setTimeout(() => deliver(DamaRules.firstTurn(snapshot), true), WORKER_LIMIT);
            worker.postMessage({ ticket, state: snapshot, difficulty: $('bot-difficulty').value });
        } catch (_) { deliver(DamaRules.firstTurn(snapshot), true); }
    }
    function onSquareClick(row, col) {
        if (!active || gameState.winner || isBotTurn()) return;
        botNotice = '';
        const legal = DamaRules.legalMoves(gameState);
        const move = legal.find(item => DamaRules.same(item.from, gameState.selectedPiece) && item.to.row === row && item.to.col === col);
        if (move) {
            gameState = DamaRules.applyMove(gameState, move);
            gameState.selectedPiece = gameState.forcedPiece;
            gameState.message = gameState.forcedPiece ? 'Capture novamente com a mesma peça.' : '';
        } else if (legal.some(item => item.from.row === row && item.from.col === col)) {
            gameState.selectedPiece = { row, col };
            gameState.message = 'Peça selecionada. Escolha uma casa destacada.';
        } else gameState.message = gameState.forcedPiece ? 'Você precisa continuar a sequência de capturas.' : 'Escolha uma peça sua que tenha um movimento válido.';
        renderizar(); scheduleBot();
    }
    function criarTabuleiro() {
        boardElement.replaceChildren();
        const targets = gameState.selectedPiece && !isBotTurn() ? DamaRules.legalMoves(gameState).filter(move => DamaRules.same(move.from, gameState.selectedPiece)) : [];
        gameState.board.forEach((line, row) => line.forEach((piece, col) => {
            const square = document.createElement("button"); square.type = "button"; square.className = `square ${isPlayable(row, col) ? "square--dark" : "square--light"}`; square.setAttribute("role", "gridcell");
            const isTarget = targets.some((move) => move.to.row === row && move.to.col === col);
            if (isTarget) square.classList.add("square--target");
            square.setAttribute("aria-label", piece ? `Linha ${row + 1}, coluna ${col + 1}: ${piece.player === 1 ? "peça branca" : "peça preta"}${piece.king ? ", dama" : ""}` : `Linha ${row + 1}, coluna ${col + 1}${isTarget ? ", destino possível" : ""}`);
            if (piece) { const token = document.createElement("span"); token.className = `piece piece--${piece.player}${piece.king ? " piece--king" : ""}${gameState.selectedPiece?.row === row && gameState.selectedPiece?.col === col ? " piece--selected" : ""}`; token.setAttribute("aria-hidden", "true"); square.append(token); }
            square.disabled = !!gameState.winner || isBotTurn();
            square.addEventListener("click", () => onSquareClick(row, col)); boardElement.append(square);
        }));
    }
    function renderizar() {
        criarTabuleiro();
        const pieces = DamaRules.counts(gameState);
        for (const player of [1, 2]) { counts[player].textContent = pieces[player]; captureCounts[player].textContent = gameState.captures[player]; }
        const turn = gameState.winner ? 'Partida finalizada' : isBotTurn() ? 'Computador pensando...' : mode === 'bot' ? 'Sua vez' : `Vez das ${nomeDasPecas(gameState.currentPlayer)}`;
        turnElement.textContent = turn;
        turnElement.classList.toggle('turn-indicator--two', gameState.currentPlayer === 2 && !gameState.winner);
        const won = mode === 'bot' ? (gameState.winner === 1 ? 'Você venceu!' : 'O computador venceu!') : `As ${nomeDasPecas(gameState.winner)} venceram!`;
        messageElement.textContent = gameState.winner ? won : isBotTurn() ? turn : gameState.message || turn;
        $('bot-notice').textContent = botNotice;
        $('local-matchup').textContent = mode === 'bot' ? 'Jogador × Computador' : 'Jogador × Jogador';
        $('difficulty-control').hidden = mode !== 'bot';
        $('bot-explanation').hidden = mode !== 'bot';
        const descriptions = { easy: 'Regressão logística: avalia um turno à frente com pesos treinados em partidas simuladas.', medium: 'MCTS: simula partidas e usa UCB1 para equilibrar exploração e aproveitamento. O número de simulações depende do tempo disponível.', hard: 'TD + Minimax: avaliação aprendida por autojogo, com busca e poda alfa-beta até 6 turnos à frente.' };
        $('bot-algorithm').textContent = descriptions[$('bot-difficulty').value];
        $('local-mode').value = mode;
        boardElement.setAttribute('aria-busy', String(thinking));
        winnerCard.hidden = !gameState.winner;
        if (gameState.winner) winnerMessage.textContent = won;
    }
    function reiniciarPartida() {
        cancelBot(); botNotice = ''; gameState = DamaRules.initialState();
        renderizar(); scheduleBot();
    }
    function setMode(value) {
        const next = value === 'bot' ? 'bot' : 'pvp';
        if (mode !== next) { mode = next; reiniciarPartida(); }
        else { renderizar(); scheduleBot(); }
    }
    function setActive(value) {
        active = value;
        if (!active) cancelBot();
        else { renderizar(); scheduleBot(); }
    }
    // Ponte apenas para o seletor de modos existente; não altera sessões online.
    window.DamaLocal = { setMode, setActive, getState: () => DamaRules.clone(gameState) };
    $('local-mode').addEventListener('change', event => setMode(event.target.value));
    $('bot-difficulty').addEventListener('change', () => { cancelBot(); scheduleBot(); renderizar(); });
    $('restart-game').addEventListener('click', reiniciarPartida);
    $('play-again').addEventListener('click', reiniciarPartida);
    window.addEventListener('pagehide', () => { suspended = true; cancelBot(); });
    window.addEventListener('pageshow', () => { suspended = false; scheduleBot(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden) cancelBot(); else scheduleBot(); });
    reiniciarPartida();
})();
