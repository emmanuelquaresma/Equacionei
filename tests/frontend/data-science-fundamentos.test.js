/* No navegador: testFundamentals(DataScienceFundamentals, PythonValidator).
   Execução real dos exemplos: await testFundamentalsRuntime(DataScienceFundamentals, PythonRunner). */
function testFundamentals(rows, validator) {
    const assert = (value, message) => { if (!value) throw Error(message); };
    assert(rows.length === 18 && new Set(rows.map(row => row.id)).size === 18, '18 IDs únicos');
    assert(rows.filter(row => row.module === 'Estatística').length === 10, '10 tópicos de estatística');
    assert(rows.filter(row => row.module === 'Python básico').length === 8, '8 tópicos de Python');
    for (const row of rows) {
        assert(row.id.startsWith('ds-fund-'), 'IDs isolados dos exercícios existentes');
        for (const key of ['title', 'explanation', 'bridge', 'example', 'description', 'starterCode', 'expectedOutput', 'hint']) assert(typeof row[key] === 'string' && row[key].length, key);
        assert(validator.validate(row, {status: 'done', stdout: row.expectedOutput, error: ''}), 'saída esperada aceita');
        assert(!validator.validate(row, {status: 'done', stdout: 'resultado incorreto', error: ''}), 'erro de resposta recusado');
        assert(!validator.validate(row, {status: 'done', stdout: row.expectedOutput, error: 'SyntaxError'}), 'erro de execução não conclui exercício');
    }
    return 'Catálogo e validação: OK';
}
async function testFundamentalsRuntime(rows, Runner) {
    const runner = Runner.create();
    for (const row of rows) {
        const result = await runner.run(row.example);
        if (result.error || result.stdout.trim() !== row.exampleOutput) throw Error(row.id + ': ' + (result.error || result.stdout));
    }
    return '18 exemplos no runtime real: OK';
}

/* Executar na página de Fundamentos; usa storage falso, sem tocar no aluno. */
function testFundamentalsEnrichment(rows, Progress, Lesson, datasets) {
    const assert = (value, message) => {if (!value) throw Error(message);};
    let value = null;
    const storage = {getItem: () => value};
    const read = () => Progress.read(rows, storage);
    assert(read().completed.length === 0 && !read().started, 'visitante começa sem progresso');
    value = JSON.stringify({version: 1, lastExercise: 'ds-fund-mediana', exercises: {
        'ds-fund-media': {completed: true, draft: 'print(10.0)', attempts: 1},
        'ds-fund-mediana': {draft: 'valores = [9, 1, 5]'},
        print: {completed: true}, unknown: {completed: true}
    }});
    const before = value;
    assert(read().completed.join() === 'ds-fund-media', 'conta apenas IDs do módulo');
    assert(read().nextId === 'ds-fund-mediana' && read().started, 'retoma rascunho conhecido');
    assert(Progress.read([...rows].reverse(), storage).completed.join() === 'ds-fund-media', 'reordenar não perde conclusão');
    assert(value === before, 'leitura não reescreve dados antigos');
    for (const invalid of ['invalid', '{"version":2,"exercises":{}}', '{"version":1,"exercises":[]}']) {
        value = invalid; assert(read().unavailable, 'informa dados inválidos ou versão desconhecida');
        assert(value === invalid, 'não apaga progresso que não consegue ler');
    }
    assert(Progress.read(rows, {getItem() {throw Error('bloqueado');}}).unavailable, 'storage bloqueado');
    const dataset = datasets.find(d => d.id === rows[0].learning.datasetId);
    assert(dataset.rowCount === dataset.rows.length && dataset.columnCount === dataset.variables.length, 'metadados e dados coerentes');
    const original = JSON.stringify(dataset.rows);
    const extreme = Lesson.salesExperiment(900, dataset), normal = Lesson.salesExperiment(100, dataset);
    assert(Math.abs(extreme.mean - 1480 / 7) < 1e-8 && extreme.median === 100, 'valor extremo');
    assert(Math.abs(normal.mean - 680 / 7) < 1e-8 && normal.median === 100, 'comparação sem extremo');
    assert(JSON.stringify(dataset.rows) === original, 'simulação preserva dataset');
    assert(rows.filter(row => row.learning).length === 1, 'somente a primeira aula enriquecida');
    assert(rows[0].id === 'ds-fund-media' && rows[0].expectedOutput === '10.0', 'contrato do exercício preservado');
    return 'Progresso compatível, retomada, falhas de storage e simulação: OK';
}
