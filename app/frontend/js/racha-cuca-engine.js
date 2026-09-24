/* Um motor para todos os temas. Não conhece matemática, textos ou elementos DOM. */
const RachaCucaEngine = (() => {
    const shuffleSteps = { easy: 40, medium: 100, hard: 200 };
    function createSolvedBoard(size) {
        if (![3, 4].includes(size)) throw new Error('Use um tabuleiro 3×3 ou 4×4.');
        return Array.from({ length: size * size }, (_, i) => (i + 1) % (size * size));
    }
    const checkVictory = board => board.every((n, i) => n === (i + 1) % board.length);
    function getValidMoves(board) {
        const size = Math.sqrt(board.length), empty = board.indexOf(0);
        return board.map((_, i) => i).filter(i => Math.abs(Math.floor(i / size) - Math.floor(empty / size)) + Math.abs(i % size - empty % size) === 1);
    }
    function move(board, index) {
        if (!getValidMoves(board).includes(index)) return null;
        const result = [...board], empty = result.indexOf(0);
        [result[index], result[empty]] = [result[empty], result[index]];
        return result;
    }
    function shuffleBoard(size, level, random = Math.random) {
        if (!(level in shuffleSteps)) throw new Error('Dificuldade inválida.');
        let board = createSolvedBoard(size), previous = -1;
        const solution = [];
        for (let n = 0; n < shuffleSteps[level] || checkVictory(board); n++) {
            const choices = getValidMoves(board).filter(i => i !== previous);
            const target = choices[Math.floor(random() * choices.length)];
            previous = board.indexOf(0);
            solution.push(previous);
            board = move(board, target);
        }
        return { board, solution: solution.reverse() };
    }
    function validateChallenge(challenge) {
        const count = createSolvedBoard(challenge.size).length - 1;
        if (challenge.tiles.length !== count || !challenge.id || !challenge.theme || challenge.tiles.some((t, i) => t.order !== i + 1 || typeof t.display !== 'string' || !t.display.trim())) {
            throw new Error(`O desafio precisa de ${count} peças ordenadas e não vazias.`);
        }
    }
    function createGame(challenge, level, now = performance.now(), random = Math.random) {
        validateChallenge(challenge);
        const initial = shuffleBoard(challenge.size, level, random).board;
        return { challenge, level, initial, board: [...initial], moves: 0, hints: 0, elapsed: 0, started: now, running: true, victory: false };
    }
    function updateTimer(state, now) {
        if (state.running) state.elapsed = Math.max(0, now - state.started);
        return state.elapsed;
    }
    function stopTimer(state, now) { updateTimer(state, now); state.running = false; }
    function resetGame(state, now) {
        return { ...state, board: [...state.initial], moves: 0, hints: 0, elapsed: 0, started: now, running: true, victory: false };
    }
    function moveTile(state, index, now) {
        if (!state.running) return false;
        const next = move(state.board, index);
        if (!next) return false;
        updateTimer(state, now);
        state.board = next; state.moves++;
        state.victory = checkVictory(next);
        if (state.victory) state.running = false;
        return true;
    }
    function hint(state) {
        if (!state.running) return null;
        const index = state.board.findIndex((value, i) => i < state.board.length - 1 && value !== i + 1);
        if (index < 0) return null;
        state.hints++;
        return { index, tile: state.challenge.tiles[index] };
    }
    const recordKey = (challenge, level) => JSON.stringify([challenge.theme, challenge.id, level, challenge.size, challenge.table ?? null]);
    const better = (a, b) => !b || a.moves < b.moves || (a.moves === b.moves && a.elapsed < b.elapsed);
    function formatTime(ms) {
        const total = Math.floor(ms / 1000), parts = [Math.floor(total / 60) % 60, total % 60];
        if (total >= 3600) parts.unshift(Math.floor(total / 3600));
        return parts.map(n => String(n).padStart(2, '0')).join(':');
    }
    function result(state, timestamp = new Date().toISOString()) {
        const c = state.challenge;
        return { theme: c.theme, challenge: c.id, mode: c.mode ?? null, table: c.table ?? null, size: c.size, difficulty: state.level,
            startedAt: state.startedAt, finishedAt: timestamp, elapsed: state.elapsed, moves: state.moves, hints: state.hints, victory: state.victory };
    }
    // Persistência encapsulada para permitir um adaptador de API no futuro.
    function createArchive(storage, onError = () => {}) {
        const key = 'matematica.rachaCuca.v1';
        let data = { version: 1, games: 0, records: {}, history: [] };
        let persistent = true;
        function fail() { persistent = false; onError(); }
        try {
            const parsed = JSON.parse(storage.getItem(key));
            if (parsed?.version === 1 && Number.isInteger(parsed.games) && parsed.games >= 0 && parsed.records && typeof parsed.records === 'object' && !Array.isArray(parsed.records) && Array.isArray(parsed.history)) {
                data = { ...parsed, history: parsed.history.slice(-100) };
            }
        } catch { fail(); }
        function persist() { if (persistent) { try { storage.setItem(key, JSON.stringify(data)); } catch { fail(); } } }
        function loadRecord(challenge, level) {
            const r = data.records[recordKey(challenge, level)];
            return r && r.victory === true && Number.isInteger(r.moves) && r.moves > 0 && Number.isFinite(r.elapsed) && r.elapsed >= 0 && Number.isInteger(r.hints) && r.hints >= 0 ? { ...r } : null;
        }
        return {
            start() { data.games++; persist(); },
            loadRecord,
            save(state) {
                const entry = result(state);
                data.history.push(entry); data.history = data.history.slice(-100);
                const isRecord = state.victory && better(entry, loadRecord(state.challenge, state.level));
                if (isRecord) data.records[recordKey(state.challenge, state.level)] = entry;
                persist(); return isRecord;
            },
            snapshot: () => JSON.parse(JSON.stringify(data))
        };
    }
    return { createSolvedBoard, checkVictory, getValidMoves, move, shuffleBoard, validateChallenge, createGame, updateTimer, stopTimer, resetGame, moveTile, hint, recordKey, better, formatTime, result, createArchive };
})();
