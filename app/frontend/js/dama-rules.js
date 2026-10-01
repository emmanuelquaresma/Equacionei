/* Regras extraídas da Dama local: dama curta, captura frontal dos peões,
 * captura obrigatória sem regra da maior captura, promoção imediata.
 * Não há regra de empate nesta variante existente. Sem DOM ou rede. */
const DamaRules = (() => {
    'use strict';
    const inside = (r, c) => Number.isInteger(r) && Number.isInteger(c) && r >= 0 && r < 8 && c >= 0 && c < 8;
    const same = (a, b) => !!a && !!b && a.row === b.row && a.col === b.col;
    const clone = state => ({ ...state, board: state.board.map(line => line.map(piece => piece ? { ...piece } : null)),
        captures: { ...state.captures }, forcedPiece: state.forcedPiece ? { ...state.forcedPiece } : null });
    function initialState() {
        const board = Array.from({ length: 8 }, () => Array(8).fill(null));
        for (let row = 0; row < 8; row++) for (let col = 0; col < 8; col++) {
            if ((row + col) % 2 && (row < 3 || row > 4)) board[row][col] = { player: row < 3 ? 2 : 1, king: false };
        }
        return { board, currentPlayer: 1, forcedPiece: null, winner: null, captures: { 1: 0, 2: 0 } };
    }
    function pieceMoves(board, row, col, capturesOnly = false) {
        if (!inside(row, col)) return [];
        const piece = board[row][col];
        if (!piece) return [];
        const directions = piece.king ? [[-1,-1],[-1,1],[1,-1],[1,1]] : [[piece.player === 1 ? -1 : 1,-1],[piece.player === 1 ? -1 : 1,1]];
        const moves = [];
        for (const [dr, dc] of directions) {
            const nr = row + dr, nc = col + dc;
            if (!inside(nr, nc)) continue;
            const other = board[nr][nc];
            if (!other && !capturesOnly) moves.push({ from: { row, col }, to: { row: nr, col: nc }, capture: null });
            if (other && other.player !== piece.player && inside(nr + dr, nc + dc) && !board[nr + dr][nc + dc]) {
                moves.push({ from: { row, col }, to: { row: nr + dr, col: nc + dc }, capture: { row: nr, col: nc } });
            }
        }
        return moves;
    }
    function playerMoves(board, player) {
        const moves = [];
        board.forEach((line, row) => line.forEach((piece, col) => {
            if (piece?.player === player) moves.push(...pieceMoves(board, row, col));
        }));
        const captures = moves.filter(move => move.capture);
        return captures.length ? captures : moves;
    }
    function legalMoves(state) {
        if (state.winner) return [];
        if (state.forcedPiece) {
            const { row, col } = state.forcedPiece;
            return state.board[row][col]?.player === state.currentPlayer ? pieceMoves(state.board, row, col, true) : [];
        }
        return playerMoves(state.board, state.currentPlayer);
    }
    function finish(state) {
        if (!state.winner && !legalMoves(state).length) state.winner = 3 - state.currentPlayer;
        return state;
    }
    function applyMove(state, requested, player = state.currentPlayer) {
        if (player !== state.currentPlayer || state.winner) throw new Error('Aguarde sua vez ou inicie uma nova partida.');
        const move = legalMoves(state).find(item => same(item.from, requested?.from) && same(item.to, requested?.to));
        if (!move) throw new Error('Jogada inválida. Respeite as capturas obrigatórias.');
        const next = clone(state), { from, to, capture } = move;
        const piece = next.board[from.row][from.col];
        next.board[from.row][from.col] = null;
        next.board[to.row][to.col] = piece;
        if (capture) { next.board[capture.row][capture.col] = null; next.captures[player]++; }
        if (to.row === (player === 1 ? 0 : 7)) piece.king = true;
        if (capture && pieceMoves(next.board, to.row, to.col, true).length) next.forcedPiece = { ...to };
        else { next.forcedPiece = null; next.currentPlayer = 3 - player; finish(next); }
        return next;
    }
    // Cada entrada é um turno completo. Saltos da mesma captura não consomem profundidade.
    function turns(state, check = () => {}) {
        const result = [];
        function expand(current, path) {
            check();
            for (const move of legalMoves(current)) {
                check();
                const next = applyMove(current, move);
                const steps = [...path, move];
                if (next.forcedPiece && !next.winner) expand(next, steps);
                else result.push({ moves: steps, state: next });
            }
        }
        if (!state.winner) expand(state, []);
        return result;
    }
    // Alternativa linear caso o Worker não esteja disponível: nunca enumera a árvore.
    function firstTurn(state) {
        let next = state;
        const moves = [];
        do {
            const move = legalMoves(next)[0];
            if (!move) break;
            next = applyMove(next, move); moves.push(move);
        } while (next.forcedPiece && !next.winner);
        return moves;
    }
    function counts(state) {
        const result = { 1: 0, 2: 0 };
        state.board.flat().forEach(piece => { if (piece) result[piece.player]++; });
        return result;
    }
    return { initialState, clone, inside, same, pieceMoves, playerMoves, legalMoves, applyMove, turns, firstTurn, finish, counts };
})();
