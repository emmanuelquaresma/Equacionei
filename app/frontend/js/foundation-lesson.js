/* Blocos pedagógicos opcionais: aulas sem learning mantêm a apresentação existente. */
const FoundationLesson = (() => {
    function node(tag, text, className) {
        const element = document.createElement(tag);
        if (text !== undefined) element.textContent = text;
        if (className) element.className = className;
        return element;
    }
    function section(title, text) {
        const block = node('section', undefined, 'ds-learning-block');
        block.append(node('h3', title), node('p', text));
        return block;
    }
    function salesExperiment(lastSale, dataset) {
        const values = dataset.rows.map(row => row[1]);
        values[values.length - 1] = lastSale;
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const ordered = [...values].sort((a, b) => a - b);
        const middle = Math.floor(ordered.length / 2);
        const median = ordered.length % 2 ? ordered[middle] : (ordered[middle - 1] + ordered[middle]) / 2;
        return {mean, median, code: `vendas = [${values.join(', ')}]\nmedia = sum(vendas) / len(vendas)\nmediana = sorted(vendas)[3]\nprint(round(media, 2))\nprint(mediana)`};
    }
    function render(row, datasets) {
        const content = row.learning;
        if (!content) return;
        const concept = document.getElementById('lesson-concept');
        concept.before(section('Objetivo', content.objective));
        concept.before(node('h3', 'Conceito'));
        // O conceito e exemplo anteriores continuam disponíveis abaixo como revisão.
        concept.textContent = content.concept;
        const blocks = node('div');
        blocks.id = 'lesson-learning';
        blocks.append(section('Exemplo intuitivo', content.intuitiveExample));
        const dataset = datasets.find(item => item.id === content.datasetId);
        if (dataset) {
            const dataBlock = node('section', undefined, 'ds-learning-block');
            dataBlock.append(node('h3', 'Dados'), node('p', dataset.description));
            const table = node('table');
            table.append(node('caption', dataset.name));
            const head = node('thead'), header = node('tr');
            dataset.variables.forEach(variable => {const th = node('th', variable.name); th.scope = 'col'; header.append(th);});
            head.append(header);
            const body = node('tbody');
            dataset.rows.forEach(values => {
                const tr = node('tr');
                values.forEach(value => tr.append(node('td', String(value))));
                body.append(tr);
            });
            table.append(head, body);
            dataBlock.append(table, node('p', dataset.source, 'ds-course-note'));
            blocks.append(dataBlock, section('Observe os dados', content.observe));
            const experiment = section('Experimente', 'Mude apenas a venda do sétimo dia. A tabela acima é a amostra original; os resultados e o código abaixo acompanham sua simulação.');
            const label = node('label', 'Venda do dia 7 (R$)');
            label.htmlFor = 'lesson-sale';
            const input = node('input');
            input.type = 'number'; input.id = 'lesson-sale'; input.min = '0'; input.max = '2000'; input.step = '1'; input.value = '900';
            input.setAttribute('aria-describedby', 'lesson-sale-help');
            const help = node('p', 'Use um valor inteiro de 0 a 2.000. Comece comparando 900 com 100.', 'ds-course-note'); help.id = 'lesson-sale-help';
            const output = node('p'); output.id = 'lesson-simulation'; output.setAttribute('aria-live', 'polite');
            experiment.append(label, input, help, output);
            const python = section('Experimente com Python', content.codeExplanation);
            const pre = node('pre'), code = node('code'); code.id = 'lesson-sales-code'; pre.tabIndex = 0; pre.setAttribute('aria-label', 'Código Python da simulação'); pre.append(code);
            const result = node('pre'); result.id = 'lesson-sales-output'; result.tabIndex = 0; result.setAttribute('aria-label', 'Saída esperada: média e mediana');
            python.append(pre, node('h3', 'Resultado esperado: média e mediana'), result,
                node('p', 'Para executar esta simulação, copie o código para o editor do laboratório. Ela é uma exploração livre; o exercício de conclusão continua sendo a média de 5, 10 e 15.', 'ds-course-note'));
            function update() {
                if (!input.value || !input.checkValidity()) {
                    output.textContent = 'Digite um valor inteiro entre 0 e 2.000. O código mantém a última simulação válida.';
                    input.setAttribute('aria-invalid', 'true'); return;
                }
                input.removeAttribute('aria-invalid');
                const sample = salesExperiment(Number(input.value), dataset);
                const money = number => number.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
                output.textContent = `Média: ${money(sample.mean)}. Mediana: ${money(sample.median)}. ` +
                    (sample.mean > sample.median + 20 ? 'A média está bem acima do centro dos dias: observe a influência da venda maior.' : 'A distância entre os dois resumos é menor. Compare com a venda de R$ 900.');
                code.textContent = sample.code;
                const rounded = Number(sample.mean.toFixed(2));
                result.textContent = (Number.isInteger(rounded) ? rounded.toFixed(1) : String(rounded)) + '\n' + sample.median;
            }
            input.addEventListener('input', update); update();
            blocks.append(experiment, python);
        }
        blocks.append(section('Interpretação da amostra original', content.interpretation), section('Sua vez: investigue', content.tryIt));
        concept.after(blocks);
        const bridge = document.querySelector('.ds-course-bridge');
        const original = document.querySelector('.ds-course-example');
        const review = node('details', undefined, 'ds-learning-review');
        review.append(node('summary', 'Revisão: exemplo inicial e ponte com SQL'), node('p', row.explanation));
        blocks.after(review); review.append(bridge, original);
        document.querySelector('.ds-course-exercise h3').textContent = 'Exercício de conclusão';
        const ending = section('Aplicação', content.application);
        const summary = node('section', undefined, 'ds-learning-block');
        summary.append(node('h3', 'Resumo'));
        const list = node('ul'); content.summary.forEach(text => list.append(node('li', text))); summary.append(list);
        document.querySelector('.ds-course-navigation').before(ending, summary);
    }
    return {render, salesExperiment};
})();
