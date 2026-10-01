function runDamaAITests() {
    const R = DamaRules, A = DamaAI;
    let assertions = 0;
    const assert = (ok, label) => { assertions++; if (!ok) throw Error(label); };
    const pos = (row, col) => ({ row, col });
    const fixture = (player, pieces) => {
        const state = R.initialState(); state.board = Array.from({ length: 8 }, () => Array(8).fill(null)); state.currentPlayer = player;
        for (const [r, c, p, king = false] of pieces) state.board[r][c] = { player: p, king };
        return state;
    };
    function reject(state, from, to, player = state.currentPlayer) {
        const before = JSON.stringify(state);
        let rejected = false;
        try { R.applyMove(state, { from: pos(...from), to: pos(...to) }, player); } catch (_) { rejected = true; }
        assert(rejected && before === JSON.stringify(state), 'Rejeição atômica');
    }
    function apply(state, from, to) { return R.applyMove(state, { from: pos(...from), to: pos(...to) }); }
    let state = R.initialState();
    assert(R.legalMoves(state).length === 7, 'Sete movimentos iniciais');
    reject(state, [2, 1], [3, 0]); reject(state, [5, 0], [4, 1], 2);
    reject(state, [5, 0], [6, 1]); reject(state, [5, 0], [-1, 1]);
    state = apply(state, [5, 0], [4, 1]);
    assert(state.currentPlayer === 2 && state.board[4][1].player === 1, 'Alterna uma vez');
    reject(state, [4, 1], [3, 2], 1);
    state = fixture(1, [[5,0,1],[5,4,1],[4,1,2],[2,3,2]]);
    reject(state, [5,4], [4,5]);
    const full = R.turns(state);
    assert(full.length === 1 && full[0].moves.length === 2 && full[0].state.winner === 1, 'Sequência completa = um turno');
    state = apply(state, [5,0], [3,2]);
    assert(state.currentPlayer === 1 && R.same(state.forcedPiece, pos(3,2)), 'Mesmo turno durante captura');
    reject(state, [5,4], [4,5]); reject(state, [3,2], [2,1]);
    state = apply(state, [3,2], [1,4]);
    assert(state.winner === 1 && state.captures[1] === 2, 'Vitória humana');
    assert(!R.legalMoves(state).length && !A.choose(state, 'hard').moves.length, 'Não joga após fim');
    reject(state, [1,4], [0,3]);
    state = fixture(2, [[5,0,2],[6,1,1],[6,3,1]]);
    const promotion = R.turns(state)[0];
    assert(promotion.moves.length === 2 && promotion.state.board[5][4].king && promotion.state.winner === 2, 'Promoção imediata e captura para trás');
    state = fixture(1, [[1,2,1],[4,7,2]]);
    state = apply(state, [1,2], [0,1]);
    assert(state.board[0][1].king, 'Promoção sem captura');
    state = fixture(2, [[3,2,2,true],[7,0,1]]);
    assert(R.legalMoves(state).length === 4, 'Dama em quatro direções');
    reject(state, [3,2], [5,4]);
    state = fixture(2, [[3,2,2,true],[4,3,2],[5,4,1]]);
    reject(state, [3,2], [6,5]);
    state = fixture(1, [[5,0,1],[7,0,2]]);
    assert(apply(state,[5,0],[4,1]).winner === 1, 'Vitória por bloqueio');
    state = fixture(2, [[7,0,2],[5,2,1]]);
    assert(!A.choose(state,'hard').moves.length && R.finish(state).winner === 1, 'Nenhuma jogada disponível');
    const cases = [R.initialState(), fixture(2,[[2,1,2],[3,2,1],[7,0,1]]), fixture(2,[[5,0,2],[6,1,1],[6,3,1]]), fixture(2,[[3,2,2,true],[0,1,1]])];
    const performanceReport = [];
    for (const level of ['easy','medium','hard']) for (const original of cases) {
        const before = JSON.stringify(original), result = A.choose(original,level, () => .3);
        let next = original;
        assert(result.moves.length > 0, 'BOT encontra movimento');
        for (const move of result.moves) {
            assert(next.board[move.from.row][move.from.col].player === original.currentPlayer, 'Somente peças próprias');
            next = R.applyMove(next, move, original.currentPlayer);
        }
        assert(next.currentPlayer !== original.currentPlayer && !next.forcedPiece, 'Completa turno sem mover duas vezes');
        assert(before === JSON.stringify(original), 'Busca não modifica estado');
        assert(result.depth <= A.LEVELS[level].depth, 'Respeita profundidade');
        performanceReport.push({ level, depth: result.depth, elapsed: Math.round(result.elapsed), nodes: result.nodes });
    }
    state = R.initialState();
    const first = A.choose(state,'easy',()=>0).moves[0], last = A.choose(state,'easy',()=>.999).moves[0];
    assert(first && last, 'Fácil escolhe entre as melhores avaliações');
    assert(A.choose(state,'easy').algorithm === 'Regressão logística', 'Agente supervisionado');
    assert(A.choose(state,'medium').simulations > 0, 'MCTS completa simulações');
    assert(A.choose(state,'hard').depth > 0, 'Minimax completa uma profundidade');
    assert(DamaModels.metadata.trainPositions > 0 && DamaModels.metadata.episodes > 0, 'Modelos treinados');
    const candidates = R.turns(state), decision = A.choose(state,'easy');
    const chosen = candidates.find(t => JSON.stringify(t.moves) === JSON.stringify(decision.moves));
    assert(A.evaluate(chosen.state,1,DamaModels.regression) >= Math.max(...candidates.map(t=>A.evaluate(t.state,1,DamaModels.regression))) - 1e-9, 'Regressão maximiza valor aprendido');
    assert(DamaLearning.features(state).every(x => Math.abs(x) < 1e-9), 'Features iniciais simétricas');
    // Partidas variadas: toda saída é revalidada pelo motor, até 100 turnos (sem regra de empate).
    for (let game = 0; game < 6; game++) {
        state = R.initialState();
        for (let turn = 0; turn < 100 && !state.winner; turn++) {
            const player = state.currentPlayer, move = A.choose(state,'easy');
            assert(move.moves.length > 0, 'Sem estado travado');
            for (const step of move.moves) {
                const legal = R.legalMoves(state);
                assert(!legal.some(m=>m.capture) || !!step.capture, 'Captura nunca ignorada');
                state = R.applyMove(state, step, player);
            }
            assert(state.currentPlayer !== player, 'Exatamente um turno');
        }
    }
    // Material e posição avaliados de maneira simétrica por cor.
    assert(A.evaluate(R.initialState(),1) === -A.evaluate(R.initialState(),2), 'Avaliação antissimétrica');
    return { assertions, performanceReport };
}
