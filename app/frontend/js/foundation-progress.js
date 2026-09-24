/* Leitura compartilhada, sem gravações nem migração: os IDs existentes são estáveis. */
const FoundationProgress = (() => {
    const KEY = 'matematica.python.progress.v1';
    function read(rows, storage) {
        let saved = null;
        try {
            const source = storage === undefined ? window.localStorage : storage;
            saved = JSON.parse(source.getItem(KEY) || 'null');
            if (saved !== null && (saved.version !== 1 || !saved.exercises ||
                typeof saved.exercises !== 'object' || Array.isArray(saved.exercises))) throw Error('Formato inválido');
        } catch {
            return {completed: [], started: false, nextId: rows[0]?.id, unavailable: true};
        }
        const records = saved?.exercises || {};
        const completed = rows.filter(row => records[row.id]?.completed === true).map(row => row.id);
        const started = rows.some(row => {
            const record = records[row.id];
            return record?.completed === true || record?.attempts > 0 || typeof record?.draft === 'string';
        });
        const last = rows.find(row => row.id === saved?.lastExercise && !completed.includes(row.id));
        return {completed, started, nextId: (last || rows.find(row => !completed.includes(row.id)) || rows[0])?.id, unavailable: false};
    }
    return {KEY, read};
})();
