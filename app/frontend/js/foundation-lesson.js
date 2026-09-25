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
    function salesExperiment(lastSale, dataset, includeLast = true, generalMedian = false) {
        const values = dataset.rows.map(row => row[1]);
        values[values.length - 1] = lastSale;
        if (!includeLast) values.pop();
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const ordered = [...values].sort((a, b) => a - b);
        const middle = Math.floor(ordered.length / 2);
        const median = ordered.length % 2 ? ordered[middle] : (ordered[middle - 1] + ordered[middle]) / 2;
        const medianCode = generalMedian || !includeLast
            ? 'ordenadas = sorted(vendas)\nmeio = len(ordenadas) // 2\nif len(ordenadas) % 2:\n    mediana = ordenadas[meio]\nelse:\n    mediana = (ordenadas[meio - 1] + ordenadas[meio]) / 2'
            : 'mediana = sorted(vendas)[3]';
        return {mean, median, count: values.length, code: `vendas = [${values.join(', ')}]\nmedia = sum(vendas) / len(vendas)\n${medianCode}\nprint(round(media, 2))\nprint(mediana)`};
    }
    function modeExperiment(dataset, addCafe = false) {
        const values = dataset.rows.map(row => row[0]);
        if (addCafe) values.push('café');
        const counts = new Map();
        values.forEach(value => counts.set(value, (counts.get(value) || 0) + 1));
        const maximum = Math.max(...counts.values());
        const modes = [...counts].filter(([, count]) => count === maximum).map(([value]) => value).sort();
        const code = `produtos = ${JSON.stringify(values)}\nfrequencias = {}\nfor produto in produtos:\n    frequencias[produto] = frequencias.get(produto, 0) + 1\nmaior = max(frequencias.values())\nmodas = sorted([produto for produto in frequencias if frequencias[produto] == maior])\nprint(modas)`;
        return {counts, modes, maximum, code, values};
    }
    function render(row, datasets) {
        const content = row.learning;
        if (!content) return;
        const isMedian = content.experiment === 'median';
        const isMode = content.experiment === 'mode';
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
            const experiment = section('Experimente', isMode
                ? 'Observe qual produto aparece mais vezes. Depois inclua mais um pedido de café e veja se a moda muda ou se há empate.'
                : isMedian
                ? 'Compare o relatório de sete dias com o dos primeiros seis dias. A tabela acima permanece como referência; o código e os resultados acompanham o período selecionado.'
                : 'Mude apenas a venda do sétimo dia. A tabela acima é a amostra original; os resultados e o código abaixo acompanham sua simulação.');
            let input, includeLast;
            if (isMode) {
                const toggleLabel = node('label', undefined, 'ds-learning-toggle');
                input = node('input'); input.type = 'checkbox'; input.id = 'lesson-add-cafe';
                toggleLabel.append(input, node('span', 'Adicionar mais um pedido de café'));
                experiment.append(toggleLabel);
            } else {
                const label = node('label', 'Venda do dia 7 (R$)');
                label.htmlFor = 'lesson-sale';
                input = node('input');
                input.type = 'number'; input.id = 'lesson-sale'; input.min = '0'; input.max = '2000'; input.step = '1'; input.value = '900';
                input.setAttribute('aria-describedby', 'lesson-sale-help');
                const help = node('p', 'Use um valor inteiro de 0 a 2.000. Comece comparando 900 com 100.', 'ds-course-note'); help.id = 'lesson-sale-help';
                experiment.append(label, input, help);
            }
            const output = node('p'); output.id = 'lesson-simulation'; output.setAttribute('aria-live', 'polite');
            experiment.append(output);
            if (isMedian) {
                const toggleLabel = node('label', undefined, 'ds-learning-toggle');
                includeLast = node('input'); includeLast.type = 'checkbox'; includeLast.id = 'lesson-include-last'; includeLast.checked = true;
                toggleLabel.append(includeLast, node('span', 'Incluir o dia 7 no relatório'));
                experiment.insertBefore(toggleLabel, output);
            }
            const python = section('Experimente com Python', content.codeExplanation);
            const pre = node('pre'), code = node('code'); code.id = 'lesson-sales-code'; pre.tabIndex = 0; pre.setAttribute('aria-label', 'Código Python da simulação'); pre.append(code);
            const result = node('pre'); result.id = 'lesson-sales-output'; result.tabIndex = 0; result.setAttribute('aria-label', 'Saída esperada: média e mediana');
            python.append(pre, node('h3', isMode ? 'Resultado esperado: moda' : 'Resultado esperado: média e mediana'), result,
                node('p', `Para executar esta simulação, copie o código para o editor do laboratório. Ela é uma exploração livre. Exercício de conclusão: ${row.description}`, 'ds-course-note'));
            function update() {
                if (isMode) {
                    const sample = modeExperiment(dataset, input.checked);
                    const frequencies = [...sample.counts].map(([value, count]) => `${value}: ${count}`).join(' · ');
                    output.textContent = `Frequências: ${frequencies}. Moda${sample.modes.length > 1 ? 's' : ''}: ${sample.modes.join(' e ')} (${sample.maximum} pedidos${sample.modes.length > 1 ? ' cada' : ''}).`;
                    code.textContent = sample.code;
                    result.textContent = JSON.stringify(sample.modes);
                    return;
                }
                const included = includeLast ? includeLast.checked : true;
                input.disabled = !included;
                if (included && (!input.value || !input.checkValidity())) {
                    output.textContent = 'Digite um valor inteiro entre 0 e 2.000. O código mantém a última simulação válida.';
                    input.setAttribute('aria-invalid', 'true'); return;
                }
                input.removeAttribute('aria-invalid');
                const sample = salesExperiment(Number(input.value), dataset, included, isMedian);
                const money = number => number.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
                output.textContent = `Média: ${money(sample.mean)}. Mediana: ${money(sample.median)}. ` +
                    (isMedian ? `${sample.count} dias: ${included ? 'a mediana é o quarto valor depois de ordenar.' : 'a mediana é a média entre R$ 95 e R$ 100, os dois valores centrais.'}` :
                    sample.mean > sample.median + 20 ? 'A média está bem acima do centro dos dias: observe a influência da venda maior.' : 'A distância entre os dois resumos é menor. Compare com a venda de R$ 900.');
                code.textContent = sample.code;
                const rounded = Number(sample.mean.toFixed(2));
                result.textContent = (Number.isInteger(rounded) ? rounded.toFixed(1) : String(rounded)) + '\n' + sample.median;
            }
            input.addEventListener('input', update);
            includeLast?.addEventListener('change', update);
            update();
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
    return {render, salesExperiment, modeExperiment};
})();
