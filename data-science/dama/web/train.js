/* Executado offline por train.py; usa exatamente o motor publicado no site. */
function trainDama(seed = 20260927, games = 400, episodes = 600) {
    let rng = seed >>> 0;
    const random = () => { rng = (Math.imul(1664525, rng) + 1013904223) >>> 0; return rng / 4294967296; };
    const pick = xs => xs[Math.floor(random() * xs.length)];
    const fresh = () => ({ w: Array(6).fill(0), b: 0 });
    const L = DamaLearning, R = DamaRules, train = [], test = [];
    let decisive = 0, truncated = 0;
    for (let game = 0; game < games; game++) {
        let state = R.initialState(); const rows = [];
        for (let ply = 0; ply < 200 && !state.winner; ply++) {
            const turns = R.turns(state);
            let turn;
            if (random() < .6) turn = pick(turns);
            else {
                const side = state.currentPlayer === 1 ? 1 : -1;
                const scores = turns.map(t => { const f = L.features(t.state); return side * (f[0] + 3*f[1]) + random()*.1; });
                turn = turns[scores.indexOf(Math.max(...scores))];
            }
            state = turn.state;
            if (ply >= 6) rows.push(L.features(state));
        }
        if (!state.winner) { truncated++; continue; }
        decisive++;
        // Separação por partida: posições da mesma partida nunca vazam para teste.
        const target = game % 5 === 0 ? test : train;
        for (const x of rows) target.push({ x, y: Number(state.winner === 1) });
    }
    if (!train.some(r => r.y === 0) || !train.some(r => r.y === 1) || !test.length) throw Error('Dataset insuficiente');
    const regression = fresh();
    for (let epoch = 0; epoch < 400; epoch++) {
        const gradient = Array(6).fill(0); let bias = 0;
        for (const {x,y} of train) {
            const error = L.sigmoid(L.logit(regression, x)) - y;
            for (let j = 0; j < 6; j++) gradient[j] += error * x[j];
            bias += error;
        }
        for (let j = 0; j < 6; j++) regression.w[j] -= .05 * (gradient[j] / train.length + .001 * regression.w[j]);
        regression.b -= .05 * bias / train.length;
    }
    const td = fresh();
    for (let ep = 0; ep < episodes; ep++) {
        let state = R.initialState();
        for (let ply = 0; ply < 200 && !state.winner; ply++) {
            const turns = R.turns(state);
            const side = state.currentPlayer === 1 ? 1 : -1;
            const scores = turns.map(t => side * L.logit(td, L.features(t.state)));
            const best = Math.max(...scores);
            const turn = random() < .15 ? pick(turns) : pick(turns.filter((_,i) => Math.abs(scores[i]-best)<1e-9));
            const next = turn.state;
            const x = L.features(state), value = L.sigmoid(L.logit(td,x));
            const target = next.winner ? Number(next.winner === 1) : ply === 199 ? .5 : L.probability(td,next);
            const delta = .1 * (target-value) * value * (1-value);
            for (let j = 0; j < 6; j++) td.w[j] += delta*x[j];
            td.b += delta;
            state = next;
        }
    }
    const accuracy = test.filter(({x,y}) => Number(L.sigmoid(L.logit(regression,x)) >= .5) === y).length / test.length;
    return { ruleset: 'equacionei-short-v1', features: L.names, regression, td,
        metadata: { seed, games, episodes, decisive, truncated, trainPositions: train.length, testPositions: test.length,
            split: 'game-index-mod-5', testAccuracy: accuracy, rolloutCutoff: 200, trainer: 'web/train.js' } };
}
