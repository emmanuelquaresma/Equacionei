/* Navegação de aulas; execução e progresso pertencem ao laboratório compartilhado. */
(() => {
    const topics = document.getElementById('foundation-topics');
    const lesson = document.getElementById('foundation-lesson');
    const rows = DataScienceFundamentals;
    rows.forEach((row, index) => {
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = '#' + row.id;
        const number = document.createElement('span');
        number.className = 'ds-lesson-number';
        number.textContent = String(index + 1).padStart(2, '0');
        const content = document.createElement('span');
        content.className = 'ds-lesson-content';
        const title = document.createElement('strong');
        title.textContent = row.title;
        const description = document.createElement('span');
        description.textContent = row.summary || row.explanation.split('. ')[0] + '.';
        const example = document.createElement('span');
        example.className = 'ds-lesson-example';
        example.textContent = 'Exemplo: ' + (row.context || row.description);
        const meta = document.createElement('span');
        meta.className = 'ds-lesson-meta';
        meta.textContent = `${row.minutes || 8} min estimados · Exercício Python`;
        const state = document.createElement('span');
        state.className = 'ds-lesson-state';
        state.dataset.exercise = row.id;
        content.append(title, description, example, meta, state);
        link.append(number, content);
        item.append(link);
        topics.append(item);
    });
    function refreshProgress() {
        const progress = FoundationProgress.read(rows);
        const note = document.getElementById('foundation-progress-note');
        note.textContent = progress.unavailable
            ? 'Não foi possível ler o progresso salvo neste navegador. Você pode continuar estudando.'
            : 'Cada aula é concluída ao resolver seu exercício no laboratório. Progresso salvo neste navegador.';
        const completed = progress.completed.length;
        document.getElementById('foundation-progress').max = rows.length;
        document.getElementById('foundation-progress').value = completed;
        document.getElementById('foundation-progress-label').textContent = `${completed} de ${rows.length} aulas`;
        topics.querySelectorAll('[data-exercise]').forEach(state => {
            const done = progress.completed.includes(state.dataset.exercise);
            state.textContent = done ? '✓ Concluída' : '○ A fazer';
            state.classList.toggle('is-complete', done);
        });
    }
    function show(focus = false) {
        const selected = rows.find(row => '#' + row.id === location.hash);
        lesson.hidden = !selected;
        topics.parentElement.hidden = Boolean(selected);
        if (!selected) {
            topics.querySelectorAll('[aria-current]').forEach(link => link.removeAttribute('aria-current'));
            if (focus) {
                const first = topics.querySelector('a');
                first.focus();
            }
            return;
        }
        const row = selected;
        const index = rows.indexOf(row);
        topics.querySelectorAll('a').forEach(link => {
            if (link.hash === '#' + row.id) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
        });
        lesson.innerHTML = `<a class="ds-course-back" href="#aulas">← Todas as aulas</a><p class="ds-course-kicker" id="lesson-position"></p>
<h2 id="lesson-title" tabindex="-1"></h2><p id="lesson-concept"></p>
<aside class="ds-course-bridge"><h3>Ponte com SQL</h3><p id="lesson-bridge"></p></aside>
<div class="ds-course-example"><section><h3>Experimente em Python</h3><pre tabindex="0" aria-label="Código Python"><code id="lesson-code"></code></pre></section>
<section><h3>Resultado esperado</h3><pre tabindex="0" aria-label="Resultado do exemplo" id="lesson-output"></pre></section></div>
<p id="lesson-note" class="ds-course-note"></p>
<section class="ds-course-exercise"><h3>Sua vez</h3><p id="lesson-challenge"></p><a id="lesson-practice" class="ds-course-button">Praticar no laboratório →</a><details><summary>Dica</summary><p id="lesson-hint"></p></details></section>
<nav class="ds-course-navigation" aria-label="Navegar entre tópicos"><a id="lesson-prev">← Anterior</a><a id="lesson-next">Próxima aula →</a></nav>`;
        const fields = {'position': `Aula ${index + 1} de ${rows.length} · ${row.module}`, title: row.title, concept: row.explanation, bridge: row.bridge, code: row.example, output: row.exampleOutput, note: row.note, challenge: row.description, hint: row.hint};
        for (const [key, text] of Object.entries(fields)) document.getElementById('lesson-' + key).textContent = text;
        document.getElementById('lesson-note').hidden = !row.note;
        document.getElementById('lesson-practice').href = '/static/python.html?trail=fundamentos&exercise=' + encodeURIComponent(row.id);
        const prev = document.getElementById('lesson-prev');
        prev.hidden = !index;
        if (index) prev.href = '#' + rows[index - 1].id;
        const next = document.getElementById('lesson-next');
        next.href = index < rows.length - 1 ? '#' + rows[index + 1].id : '/static/data-science.html';
        if (index === rows.length - 1) next.textContent = 'Voltar à trilha →';
        FoundationLesson.render(row, LearningDatasets);
        if (focus) document.getElementById('lesson-title').focus();
    }
    window.addEventListener('hashchange', () => show(true));
    window.addEventListener('storage', refreshProgress);
    window.addEventListener('pageshow', refreshProgress);
    refreshProgress();
    show();
})();
