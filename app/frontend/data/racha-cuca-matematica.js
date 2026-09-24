/* Conteúdo matemático: independente dos movimentos e da interface. */
const RachaCucaMath = (() => {
    function generate(mode, level, table = 2, random = Math.random) {
        const range = { easy: 4, medium: 9, hard: 15 }[level];
        return Array.from({ length: 15 }, (_, i) => {
            const order = i + 1, n = 1 + Math.floor(random() * range);
            let display = String(order), result = order;
            if (mode === 'multiplication') { result = order * table; display = String(result); }
            if (mode === 'operations') {
                const kind = Math.floor(random() * (level === 'easy' ? 2 : 3));
                if (kind === 0) display = `${order + n} − ${n}`;
                else if (kind === 1) display = `${Math.floor(order / 2)} + ${Math.ceil(order / 2)}`;
                else {
                    const factors = Array.from({ length: order }, (_, j) => j + 1).filter(x => order % x === 0);
                    const factor = factors[Math.floor(random() * factors.length)];
                    display = level === 'hard' ? `${n} × ${order} − ${(n - 1) * order}` : `${factor} × ${order / factor}`;
                }
            }
            if (mode === 'equations') {
                const kind = Math.floor(random() * (level === 'easy' ? 2 : 3));
                display = kind === 0 ? `x + ${n} = ${order + n}` : kind === 1 ? `x − ${n} = ${order - n}` : `${n}x = ${n * order}`;
            }
            return { order, display, result };
        });
    }
    function challenge(mode, level, table) {
        const names = { sequence: 'Sequência', multiplication: 'Tabuada', operations: 'Operações', equations: 'Equações' };
        return { id: mode + (mode === 'multiplication' ? '-' + table : ''), theme: 'math', size: 4,
            title: names[mode] + (mode === 'multiplication' ? ' do ' + table : ''),
            goal: mode === 'equations' ? 'Organize pelo valor de x, de 1 a 15.' : mode === 'multiplication' ? 'Organize os múltiplos do menor ao maior.' : 'Organize pelos resultados, de 1 a 15.',
            tiles: generate(mode, level, table), text: '', mode, table: mode === 'multiplication' ? table : null };
    }
    return { generate, challenge };
})();
