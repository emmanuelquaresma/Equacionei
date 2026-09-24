(() => {
    const card = document.querySelector('.ds-trail-card--available');
    function refresh() {
        const progress = FoundationProgress.read(DataScienceFundamentals);
        const done = progress.completed.length;
        card.querySelector('.ds-trail-card__status').textContent = '18 aulas • 18 exercícios';
        card.querySelector('.ds-trail-card__action').textContent =
            done === 18 ? 'Revisar módulo →' : progress.started ? 'Continuar módulo →' : 'Começar módulo →';
        document.getElementById('foundation-card-progress').textContent = progress.unavailable
            ? 'Progresso indisponível neste navegador.' : `${done} de 18 aulas concluídas`;
        card.href = '/static/data-science/fundamentos.html' + (progress.started && done < 18 ? '#' + progress.nextId : '');
    }
    window.addEventListener('pageshow', refresh);
    window.addEventListener('storage', refresh);
    refresh();
})();
