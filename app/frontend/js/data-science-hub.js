/* Resume o progresso dos Fundamentos usando as chaves e os IDs que já existem. */
(() => {
    'use strict';
    const $ = id => document.getElementById(id);
    const continueLink = $('continue-link');
    function refresh() {
        const progress = FoundationProgress.read(DataScienceFundamentals);
        const done = progress.completed.length, total = DataScienceFundamentals.length;
        const percent = Math.floor(done / total * 100);
        const ongoing = progress.started && done < total;
        const completed = done === total;
        $('continue-title').textContent = ongoing ? 'Continue de onde parou' : completed ? 'Fundamentos concluídos' : 'Novo por aqui?';
        $('continue-detail').textContent = ongoing ? `Etapa 01 · Fundamentos · ${DataScienceFundamentals.find(row => row.id === progress.nextId)?.title || 'Próxima aula'}`
            : completed ? 'Você concluiu as 18 aulas. Revise ou explore o próximo laboratório.'
            : progress.unavailable ? 'O progresso salvo não está disponível neste navegador. Você ainda pode começar os Fundamentos.'
            : 'Comece pela Etapa 01 e avance no seu ritmo.';
        $('hub-progress').value = done;
        $('hub-progress-label').textContent = `${percent}% · ${done} de ${total} aulas`;
        document.querySelector('.ds-continue-progress').hidden = !progress.started && !completed;
        continueLink.href = '/static/data-science/fundamentos.html' + (ongoing && progress.nextId ? '#' + encodeURIComponent(progress.nextId) : '');
        continueLink.replaceChildren();
        continueLink.append(document.createTextNode(ongoing ? 'Continuar' : completed ? 'Revisar Fundamentos' : 'Comece pela Etapa 01'));
        const arrow = document.createElement('span'); arrow.setAttribute('aria-hidden','true'); arrow.textContent='→'; continueLink.append(arrow);
        $('foundation-card-progress').textContent = `${done} de ${total} aulas concluídas`;
    }
    window.DataScienceHubProgress = { refresh };
    refresh();
    window.addEventListener('pageshow', refresh);
    window.addEventListener('storage', refresh);
})();
