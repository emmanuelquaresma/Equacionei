/* Sem dependências: testRachaCuca(Engine, Math, Texts, Verses). UI: testRachaCucaUI(). */
function testRachaCuca(E, M, texts, verses) {
    let count = 0;
    const assert = (value, message) => { if (!value) throw Error(message); count++; };
    const seeded = seed => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
    for (const size of [3, 4]) {
        const solved = E.createSolvedBoard(size);
        assert(E.checkVictory(solved), 'estado resolvido');
        assert(E.getValidMoves(solved).length === 2, 'canto possui dois vizinhos');
        assert(E.move(solved, 0) === null, 'movimento distante recusado');
        assert(E.move(solved, solved.length - size - 2) === null, 'diagonal recusada');
        for (const level of ['easy', 'medium', 'hard']) for (let seed = 1; seed <= 60; seed++) {
            const shuffled = E.shuffleBoard(size, level, seeded(seed));
            assert(!E.checkVictory(shuffled.board), 'não começa resolvido');
            assert(new Set(shuffled.board).size === size * size && shuffled.board.includes(0), 'todas as peças e um vazio');
            let board = shuffled.board;
            for (const index of shuffled.solution) { board = E.move(board, index); if (!board) throw Error('solução contém movimento inválido'); }
            assert(E.checkVictory(board), 'caminho inverso resolve embaralhamento');
        }
        const shifted = E.move(solved, solved.length - 2);
        const empty = shifted.indexOf(0);
        assert(!E.getValidMoves(shifted).includes(empty - size + 1), 'não atravessa borda');
    }
    for (const level of ['easy', 'medium', 'hard']) for (const mode of ['sequence', 'multiplication', 'operations', 'equations']) {
        for (let table = 2; table <= 10; table++) {
            const c = M.challenge(mode, level, table); E.validateChallenge(c);
            assert(c.tiles.length === 15 && new Set(c.tiles.map(t => t.result)).size === 15, 'quinze resultados únicos');
            for (const tile of c.tiles) {
                if (mode === 'sequence') assert(Number(tile.display) === tile.order, 'sequência');
                if (mode === 'multiplication') assert(Number(tile.display) === tile.order * table, 'tabuada');
                if (mode === 'operations') {
                    // Avaliador restrito dos testes, sem eval: primeiro produtos, depois soma/subtração.
                    const tokens = tile.display.split(' '); let sum = 0, term = Number(tokens[0]), sign = 1;
                    for (let i = 1; i < tokens.length; i += 2) {
                        if (tokens[i] === '×') term *= Number(tokens[i + 1]);
                        else { sum += sign * term; sign = tokens[i] === '−' ? -1 : 1; term = Number(tokens[i + 1]); }
                    }
                    assert(sum + sign * term === tile.order, 'operação com resultado correto');
                }
                if (mode === 'equations') {
                    const [left, right] = tile.display.split(' = ');
                    const value = left.includes(' + ') ? tile.order + Number(left.split(' + ')[1]) : left.includes(' − ') ? tile.order - Number(left.split(' − ')[1]) : Number(left.replace('x', '')) * tile.order;
                    assert(value === Number(right), 'equação com solução única correta');
                }
            }
        }
    }
    for (const [theme, contents] of [['texts', texts], ['verses', verses]]) for (const c of contents) {
        assert(c.parts.join(' ') === c.text, 'trechos recompõem texto integral');
        E.validateChallenge({ ...c, theme, tiles: c.parts.map((display, i) => ({ order: i + 1, display })) });
        assert(c.parts.length === c.size ** 2 - 1, 'sem peças artificiais');
    }
    const c = M.challenge('sequence', 'easy', 2);
    let s = E.createGame(c, 'easy', 1000, seeded(1)); const initial = [...s.board];
    assert(s.moves === 0 && s.elapsed === 0 && s.hints === 0, 'começo zerado');
    E.updateTimer(s, 4100); assert(s.elapsed === 3100, 'cronômetro começa no início');
    const snapshot = JSON.stringify(s); assert(!E.moveTile(s, s.board.indexOf(0), 4200) && JSON.stringify(s) === snapshot, 'inválida não altera contagem ou estado');
    assert(E.moveTile(s, E.getValidMoves(s.board)[0], 5000) && s.moves === 1, 'um movimento válido');
    const beforeHint = [...s.board]; const hint = E.hint(s);
    assert(s.hints === 1 && hint.tile.order === hint.index + 1 && JSON.stringify(beforeHint) === JSON.stringify(s.board), 'dica não move nem revela tudo');
    s = E.resetGame(s, 6000);
    assert(s.moves === 0 && s.hints === 0 && s.elapsed === 0 && JSON.stringify(s.board) === JSON.stringify(initial), 'reinício repete o tabuleiro');
    s.board = E.move(E.createSolvedBoard(4), 14);
    assert(E.moveTile(s, 15, 7000) && s.victory && !s.running, 'vitória');
    E.updateTimer(s, 9000); assert(s.elapsed === 1000, 'vitória para cronômetro');
    assert(!E.moveTile(s, 14, 10000) && E.hint(s) === null, 'vitória bloqueia movimentos e dicas');
    assert(E.formatTime(62000) === '01:02' && E.formatTime(3661000) === '01:01:01', 'formato horas');
    const memory = new Map([['other-game', 'preservar']]); const store = { getItem: key => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, value) };
    let archive = E.createArchive(store); archive.start(); archive.save(s);
    archive = E.createArchive(store);
    assert(archive.loadRecord(c, 'easy').moves === 1 && archive.snapshot().games === 1, 'recorde após reload');
    assert(!archive.loadRecord(c, 'hard'), 'dificuldades separadas');
    assert(E.recordKey(c, 'easy') !== E.recordKey({ ...c, theme: 'verses' }, 'easy'), 'temas separados');
    assert(E.recordKey(M.challenge('multiplication','easy',2),'easy') !== E.recordKey(M.challenge('multiplication','easy',3),'easy'), 'tabuadas separadas');
    assert(E.better({moves: 1,elapsed: 5}, {moves: 2,elapsed: 1}) && E.better({moves: 1,elapsed: 5},{moves: 1,elapsed: 6}), 'critério movimentos e tempo');
    for (let i = 0; i < 105; i++) archive.save(s);
    assert(archive.snapshot().history.length === 100 && memory.get('other-game') === 'preservar', 'histórico limitado sem alterar outros jogos');
    let failed = false; archive = E.createArchive({getItem(){throw Error('blocked');}}, () => {failed = true;}); archive.start(); archive.save(s);
    assert(failed && archive.loadRecord(c, 'easy').moves === 1, 'storage indisponível não quebra jogo');
    let refused = false;
    try { E.createGame({...c, size:3}, 'easy', 0); } catch {refused = true;}
    assert(refused, 'conteúdo incompleto recusado');
    // Mesmo conteúdo textual em duas peças não muda a identidade lógica.
    const duplicate = {...c,tiles:c.tiles.map(t=>({...t,display:'palavra'}))};
    s = E.createGame(duplicate,'easy',0,seeded(1));
    assert(!E.checkVictory(s.board), 'vitória nunca depende do texto');
    return `${count} verificações do motor, conteúdos e armazenamento: OK`;
}

function testRachaCucaUI() {
    const $ = id => document.getElementById('rc-' + id), E = RachaCucaEngine;
    const assert = (value, message) => { if (!value) throw Error(message); };
    const click = id => $(id).click();
    const seeded = seed => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
    const original = E.createGame;
    let current, solution;
    // Geração determinística apenas no teste; interações reais passam pelos handlers da página.
    E.createGame = (c, level, now) => {
        solution = E.shuffleBoard(c.size, level, seeded(33)).solution;
        current = original(c, level, now, seeded(33)); return current;
    };
    try {
        assert(!$('themes').hidden && $('setup').hidden, 'seleção de tema inicial');
        for (const theme of ['math', 'texts', 'verses']) {
            document.querySelector(`[data-rc-theme="${theme}"]`).click();
            if (theme === 'math') {
                for (const mode of ['sequence', 'multiplication', 'operations', 'equations']) {
                    $('mode').value = mode; $('mode').dispatchEvent(new Event('change'));
                    $('setup').requestSubmit();
                    assert($('board').children.length === 16, 'matemática 4×4');
                    click('config'); document.querySelector('[data-rc-theme="math"]').click();
                }
                $('mode').value = 'sequence';
            }
            $('setup').requestSubmit();
            assert($('full-text').textContent === '', 'não mostra texto completo antes de resolver');
            const before = [...current.board], oldMoves = $('moves').textContent;
            const invalid = current.board.findIndex((id,i) => id && !E.getValidMoves(current.board).includes(i));
            $('board').children[invalid].click();
            assert($('moves').textContent === oldMoves, 'clique inválido não conta');
            click('hint'); assert($('hints').textContent === '1' && $('hint-text').textContent.length > 0, 'dica exibida e contada');
            // Move o vazio por teclado e reinicia, recuperando o tabuleiro inicial.
            const empty = current.board.indexOf(0), target = E.getValidMoves(current.board)[0], delta = target - empty;
            const key = delta === 1 ? 'ArrowRight' : delta === -1 ? 'ArrowLeft' : delta > 0 ? 'ArrowDown' : 'ArrowUp';
            const event = new KeyboardEvent('keydown',{key,bubbles:true,cancelable:true}); $('board').dispatchEvent(event);
            assert(event.defaultPrevented && $('moves').textContent === '1', 'teclado move sem scroll');
            click('reset');
            assert($('moves').textContent === '0' && $('hints').textContent === '0', 'reset zera');
            assert([...$('board').children].map(t=>t.textContent).join('|') === before.map(id=>id ? current.challenge.tiles[id-1].display : '').join('|'), 'reset preserva início');
            for (const index of solution) $('board').children[index].click();
            assert(!$('win').hidden && $('hint').disabled, 'vitória e bloqueio');
            assert($('record').textContent !== '—', 'recorde salvo');
            if (theme !== 'math') {
                assert($('full-text').textContent === current.challenge.text, 'texto integral após vitória');
                const oldId = current.challenge.id; click('next');
                assert(current.challenge.id !== oldId && $('win').hidden && $('full-text').textContent === '', 'próximo desafio');
            } else { click('again'); assert($('win').hidden && $('moves').textContent === '0', 'jogar novamente'); }
            click('config');
        }
        return 'Interface: temas, 4 modalidades, clique, inválida, teclado, dica, reset, vitória, recordes e próximo desafio: OK';
    } finally { E.createGame = original; }
}
