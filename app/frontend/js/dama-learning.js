/* Contrato compartilhado pelo treino offline e pela inferência no Worker. */
const DamaLearning = (() => {
    const names = ['dif_pedras', 'dif_damas', 'dif_avanco', 'dif_centro', 'dif_retaguarda', 'dif_bordas'];
    function features(state) {
        const x = [0, 0, 0, 0, 0, 0];
        state.board.forEach((line, r) => line.forEach((p, c) => {
            if (!p) return;
            const side = p.player === 1 ? 1 : -1;
            x[p.king ? 1 : 0] += side;
            if (!p.king) {
                x[2] += side * (p.player === 1 ? 7 - r : r) / 10;
                if (r === (p.player === 1 ? 7 : 0)) x[4] += side;
            }
            if (r >= 2 && r <= 5 && c >= 2 && c <= 5) x[3] += side;
            if (c === 0 || c === 7) x[5] += side;
        }));
        return x;
    }
    const logit = (model, x) => model.w.reduce((sum, w, i) => sum + w * x[i], model.b);
    const sigmoid = z => 1 / (1 + Math.exp(-Math.max(-30, Math.min(30, z))));
    const probability = (model, state) => sigmoid(logit(model, features(state)));
    function validate(bundle) {
        if (bundle?.ruleset !== 'equacionei-short-v1' || JSON.stringify(bundle.features) !== JSON.stringify(names)) throw Error('Contrato de modelo incompatível');
        for (const key of ['regression', 'td']) {
            const m = bundle[key];
            if (!m || m.w?.length !== names.length || !m.w.every(Number.isFinite) || !Number.isFinite(m.b)) throw Error('Modelo inválido');
        }
        return bundle;
    }
    return { features, names, logit, sigmoid, probability, validate };
})();
