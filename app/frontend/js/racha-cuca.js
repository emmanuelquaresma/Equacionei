/* Adaptadores de conteúdo: novos temas podem usar o mesmo contrato challenge(). */
const RachaCucaThemes = {
    math: { title: 'Matemática', challenge: config => RachaCucaMath.challenge(config.mode, config.level, config.table) },
    texts: { title: 'Textos', contents: RachaCucaTexts },
    verses: { title: 'Versículos Bíblicos', contents: RachaCucaVerses }
};
for (const [theme, provider] of Object.entries(RachaCucaThemes)) {
    if (!provider.contents) continue;
    provider.challenge = config => {
        const content = provider.contents.find(c => c.id === config.content) || provider.contents[0];
        return { ...content, theme, goal: 'Organize os trechos na ordem de leitura. Deixe o vazio no canto inferior direito.',
            tiles: content.parts.map((display, i) => ({ order: i + 1, display })) };
    };
}

(() => {
    const $ = id => document.getElementById(`rc-${id}`), E = RachaCucaEngine;
    const levelNames = { easy: 'Fácil', medium: 'Médio', hard: 'Difícil' };
    let state = null, theme = 'math', frame = 0, saved = true, hintTimer = 0;
    let storage;
    function storageWarning() { $('storage').textContent = 'Armazenamento indisponível. Resultados mantidos apenas enquanto esta página estiver aberta.'; }
    try { storage = localStorage; } catch { storageWarning(); }
    const archive = E.createArchive(storage, storageWarning);
    const config = () => ({ mode: $('mode').value, level: $('level').value, table: Number($('table').value), content: $('content').value });
    const challenge = () => RachaCucaThemes[theme].challenge(config());
    function recordText(c, level) {
        const r = archive.loadRecord(c, level);
        return r ? `${r.moves} movimentos · ${E.formatTime(r.elapsed)} · ${r.hints} dicas` : '—';
    }
    function preview() {
        $('table-label').hidden = theme !== 'math' || $('mode').value !== 'multiplication';
        $('preview-record').textContent = `Melhor resultado: ${recordText(challenge(), config().level)}`;
    }
    function chooseTheme(value) {
        theme = value;
        $('themes').hidden = true; $('setup').hidden = false; $('play').hidden = true;
        $('theme-title').textContent = RachaCucaThemes[theme].title;
        $('math-options').hidden = theme !== 'math'; $('content-label').hidden = theme === 'math';
        $('content').replaceChildren();
        for (const item of RachaCucaThemes[theme].contents || []) {
            const option = document.createElement('option'); option.value = item.id;
            option.textContent = `${item.title} · ${item.size}×${item.size}`; $('content').append(option);
        }
        preview(); $('theme-title').focus();
    }
    function tick() {
        if (!state?.running) return;
        $('time').textContent = E.formatTime(E.updateTimer(state, performance.now()));
        frame = requestAnimationFrame(tick);
    }
    function saveResult() { if (!state || saved) return false; saved = true; return archive.save(state); }
    function endCurrent() {
        cancelAnimationFrame(frame); clearTimeout(hintTimer);
        if (state) E.stopTimer(state, performance.now());
        saveResult();
    }
    function renderBoard() {
        const size = state.challenge.size, valid = E.getValidMoves(state.board);
        $('board').style.setProperty('--board-size', size);
        $('board').setAttribute('aria-label', `Quebra-cabeça ${size} por ${size}. Setas deslocam o espaço vazio.`);
        $('board').classList.toggle('rc-text-board', state.challenge.theme !== 'math' || ['operations', 'equations'].includes(state.challenge.mode));
        $('board').replaceChildren(...state.board.map((id, index) => {
            const tile = document.createElement('button'); tile.type = 'button'; tile.dataset.index = index; tile.className = 'rc-tile';
            if (!id) { tile.classList.add('rc-empty'); tile.disabled = true; tile.setAttribute('aria-label', 'Espaço vazio'); }
            else {
                const data = state.challenge.tiles[id - 1], movable = state.running && valid.includes(index);
                const label = document.createElement('span'); label.textContent = data.display; tile.append(label);
                tile.classList.toggle('rc-movable', movable);
                tile.setAttribute('aria-label', `Peça ${data.display}, linha ${Math.floor(index / size) + 1}, coluna ${index % size + 1}. ${movable ? 'Mover para o espaço vazio.' : 'Não pode mover agora.'}`);
                tile.setAttribute('aria-disabled', String(!movable));
                tile.addEventListener('click', () => play(index));
            }
            return tile;
        }));
        $('moves').textContent = state.moves; $('hints').textContent = state.hints;
    }
    function displayVictory(newRecord) {
        $('summary').textContent = `${state.challenge.theme === 'verses' ? 'Você completou o versículo!' : state.challenge.theme === 'texts' ? 'Você organizou corretamente o texto.' : 'Você resolveu o quebra-cabeça!'} Tempo: ${E.formatTime(state.elapsed)}. Movimentos: ${state.moves}. Dicas: ${state.hints}.${newRecord ? ' Novo recorde!' : ''}`;
        $('full-text').textContent = state.challenge.text || '';
        $('reference').textContent = state.challenge.reference || '';
        $('source').hidden = !state.challenge.source;
        if (state.challenge.source) { $('source').href = state.challenge.source; $('source').textContent = state.challenge.translation; }
        $('next').hidden = !RachaCucaThemes[state.challenge.theme].contents;
        $('next').textContent = state.challenge.theme === 'verses' ? 'Próximo versículo' : 'Próximo desafio';
        $('win').hidden = false; $('win').querySelector('h2').focus();
    }
    function play(index) {
        if (!state?.running) return;
        const empty = state.board.indexOf(0);
        if (!E.moveTile(state, index, performance.now())) { $('message').textContent = 'Escolha uma peça imediatamente ao lado do vazio.'; return; }
        renderBoard(); $('board').querySelector(`[data-index="${empty}"]`).focus({ preventScroll: true });
        $('message').textContent = 'Peça movida.';
        if (state.victory) {
            cancelAnimationFrame(frame); clearTimeout(hintTimer); $('hint-text').textContent = ''; $('hint').disabled = true;
            const newRecord = saveResult();
            $('time').textContent = E.formatTime(state.elapsed); $('record').textContent = recordText(state.challenge, state.level);
            displayVictory(newRecord); $('message').textContent = 'Quebra-cabeça resolvido!';
        }
    }
    function startGame(kind = 'new') {
        endCurrent();
        const now = performance.now();
        if (kind === 'reset' && state) state = E.resetGame(state, now);
        else {
            const c = kind === 'setup' || !state ? challenge() : state.challenge;
            const level = kind === 'setup' || !state ? config().level : state.level;
            state = E.createGame(c, level, now);
        }
        saved = false; state.startedAt = new Date().toISOString(); archive.start();
        $('themes').hidden = true; $('setup').hidden = true; $('play').hidden = false; $('win').hidden = true;
        $('full-text').textContent = ''; $('reference').textContent = ''; $('source').hidden = true;
        $('description').textContent = `${RachaCucaThemes[state.challenge.theme].title} · ${state.challenge.title} · ${levelNames[state.level]}`;
        $('goal').textContent = state.challenge.goal;
        $('record').textContent = recordText(state.challenge, state.level);
        $('message').textContent = 'Use o vazio para organizar as peças.'; $('hint-text').textContent = ''; $('hint').disabled = false;
        renderBoard(); tick(); $('board').focus({ preventScroll: true });
    }
    $('board').addEventListener('keydown', event => {
        if (!state?.running) return;
        const size = state.challenge.size, directions = { ArrowUp: -size, ArrowDown: size, ArrowLeft: -1, ArrowRight: 1 };
        if (!(event.key in directions)) return;
        event.preventDefault();
        const target = state.board.indexOf(0) + directions[event.key];
        if (E.getValidMoves(state.board).includes(target)) play(target);
    });
    $('hint').addEventListener('click', () => {
        const hint = E.hint(state); if (!hint) return;
        $('hints').textContent = state.hints;
        $('hint-text').textContent = `Na linha ${Math.floor(hint.index / state.challenge.size) + 1}, coluna ${hint.index % state.challenge.size + 1}, deve ficar: “${hint.tile.display}”. Esta dica indica uma posição final, não necessariamente o próximo movimento.`;
        clearTimeout(hintTimer); hintTimer = setTimeout(() => { $('hint-text').textContent = ''; }, 8000);
    });
    document.querySelectorAll('[data-rc-theme]').forEach(button => button.addEventListener('click', () => chooseTheme(button.dataset.rcTheme)));
    $('setup').addEventListener('submit', event => { event.preventDefault(); startGame('setup'); });
    ['mode', 'level', 'table', 'content'].forEach(id => $(id).addEventListener('change', preview));
    $('back-themes').addEventListener('click', () => { $('setup').hidden = true; $('themes').hidden = false; $('themes').querySelector('button').focus(); });
    $('reset').addEventListener('click', () => startGame('reset'));
    ['new', 'again'].forEach(id => $(id).addEventListener('click', () => startGame()));
    $('config').addEventListener('click', () => { endCurrent(); $('play').hidden = true; $('themes').hidden = false; $('themes').querySelector('button').focus(); });
    $('next').addEventListener('click', () => {
        const list = RachaCucaThemes[theme].contents;
        const index = list.findIndex(c => c.id === state.challenge.id);
        $('content').value = list[(index + 1) % list.length].id;
        startGame('setup');
    });
    window.addEventListener('pagehide', endCurrent);
    window.addEventListener('pageshow', event => { if (event.persisted) { endCurrent(); $('play').hidden = true; $('setup').hidden = true; $('themes').hidden = false; } });
})();
