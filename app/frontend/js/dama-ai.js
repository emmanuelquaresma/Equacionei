/* Três agentes independentes da interface, executados no Web Worker. */
const DamaAI = (() => {
    'use strict';
    const LEVELS = Object.freeze({ easy: { depth: 1, ms: 100 }, medium: { depth: 0, ms: 450 }, hard: { depth: 6, ms: 650 } });
    const models = DamaLearning.validate(DamaModels);
    function evaluate(state, player, model = models.td) {
        if (state.winner) return state.winner === player ? 100000 : -100000;
        return (player === 1 ? 1 : -1) * DamaLearning.logit(model, DamaLearning.features(state));
    }
    function choose(state, difficulty = 'easy', random = Math.random) {
        const config = LEVELS[difficulty] || LEVELS.easy, start = performance.now();
        const deadline = start + config.ms, timeout = Symbol('budget');
        const check = () => { if (performance.now() >= deadline) throw timeout; };
        const pick = items => items[Math.min(items.length - 1, Math.floor(random() * items.length))];
        let selected = DamaRules.firstTurn(state), depth = 0, nodes = 0, simulations = 0, estimate = null;
        const algorithm = difficulty === 'medium' ? 'MCTS / UCB1' : difficulty === 'hard' ? 'TD + Minimax' : 'Regressão logística';
        if (!selected.length) return { moves: [], depth, nodes, simulations, algorithm, elapsed: performance.now() - start };
        const player = state.currentPlayer;
        try {
            const roots = DamaRules.turns(state, check);
            if (difficulty === 'medium') {
                const node = (s, turn = null) => ({ state: s, turn, pending: DamaRules.turns(s, check), children: [], visits: 0, total: 0 });
                const root = node(state);
                for (let i = 0; i < 1500; i++) {
                    check();
                    let current = root;
                    const path = [root];
                    while (!current.pending.length && current.children.length) {
                        const sign = current.state.currentPlayer === player ? 1 : -1;
                        const ucb = child => !child.visits ? Infinity : sign * child.total / child.visits + Math.SQRT2 * Math.sqrt(Math.log(Math.max(1, current.visits)) / child.visits);
                        current = current.children.reduce((a, b) => ucb(a) >= ucb(b) ? a : b);
                        path.push(current);
                    }
                    if (current.pending.length) {
                        const index = Math.min(current.pending.length - 1, Math.floor(random() * current.pending.length));
                        const turn = current.pending.splice(index, 1)[0], child = node(turn.state, turn);
                        current.children.push(child); current = child; path.push(child);
                    }
                    let rollout = current.state;
                    for (let step = 0; step < 60 && !rollout.winner; step++) {
                        check(); nodes++;
                        const turns = DamaRules.turns(rollout, check);
                        if (!turns.length) break;
                        rollout = pick(turns).state;
                    }
                    // Corte de simulação: estimativa por material, nunca vitória observada.
                    const f = DamaLearning.features(rollout);
                    const reward = rollout.winner ? (rollout.winner === player ? 1 : -1) : Math.tanh((player === 1 ? 1 : -1) * (f[0] + 3 * f[1]) / 6);
                    for (const ancestor of path) { ancestor.visits++; ancestor.total += reward; }
                    simulations++;
                    const best = root.children.reduce((a, b) => a.visits >= b.visits ? a : b);
                    selected = best.turn.moves;
                }
            } else if (difficulty !== 'hard') {
                let best = -Infinity, ties = [];
                for (const turn of roots) {
                    const score = evaluate(turn.state, player, models.regression); nodes++;
                    if (score > best + 1e-9) { best = score; ties = [turn]; }
                    else if (Math.abs(score - best) < 1e-9) ties.push(turn);
                }
                const turn = pick(ties); selected = turn.moves; depth = 1;
                estimate = turn.state.winner ? Number(turn.state.winner === player) : DamaLearning.sigmoid(best);
            } else {
                function search(current, remaining, alpha, beta) {
                    check(); nodes++;
                    if (current.winner) return evaluate(current, player);
                    const children = DamaRules.turns(current, check);
                    if (!children.length) return current.currentPlayer === player ? -100000 : 100000;
                    if (remaining <= 0 && (!children[0].moves[0].capture || remaining <= -6)) return evaluate(current, player);
                    const maximize = current.currentPlayer === player;
                    let best = maximize ? -Infinity : Infinity;
                    for (const child of children) {
                        const score = search(child.state, remaining - 1, alpha, beta);
                        best = maximize ? Math.max(best, score) : Math.min(best, score);
                        if (maximize) alpha = Math.max(alpha, best); else beta = Math.min(beta, best);
                        if (beta <= alpha) break;
                    }
                    return best;
                }
                for (let d = 1; d <= config.depth; d++) {
                    let best = -Infinity, ties = [];
                    for (const turn of roots) {
                        const score = search(turn.state, d - 1, -Infinity, Infinity);
                        if (score > best + 1e-9) { best = score; ties = [turn]; }
                        else if (Math.abs(score - best) < 1e-9) ties.push(turn);
                    }
                    selected = pick(ties).moves; depth = d;
                }
            }
        } catch (error) { if (error !== timeout) throw error; }
        return { moves: selected, depth, nodes, simulations, estimate, algorithm, elapsed: performance.now() - start };
    }
    return { choose, evaluate, LEVELS };
})();
