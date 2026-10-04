let graficoPrimeiroGrau = null;

function calcularFuncao() {
    const a = Number(document.getElementById('a').value);
    const b = Number(document.getElementById('b').value);
    const inicio = Number(document.getElementById('xInicial').value);
    const fim = Number(document.getElementById('xFinal').value);
    if (['a', 'b', 'xInicial', 'xFinal'].some(id => document.getElementById(id).value.trim() === ''))
        return alert('Preencha todos os campos numéricos.');
    if (![a, b, inicio, fim].every(Number.isFinite)) return alert('Informe valores numéricos válidos.');
    if (a === 0) return alert('O coeficiente a deve ser diferente de zero.');
    if (inicio >= fim) return alert('X inicial deve ser menor que X final.');

    const root = -b / a;
    const set = (id, value) => { document.getElementById(id).textContent = value; };
    set('equacao', `f(x) = ${a}x ${b < 0 ? '−' : '+'} ${Math.abs(b)}`);
    set('raiz', `x = ${Number.isInteger(root) ? root : root.toFixed(4)}`);
    set('coefAngular', String(a));
    set('coefLinear', String(b));
    set('comportamento', a > 0 ? 'Crescente' : 'Decrescente');
    set('interceptoY', `(0, ${b})`);

    const labels = [], data = [];
    for (let i = 0; i <= 100; i++) {
        const x = inicio + (fim - inicio) * i / 100;
        labels.push(Number(x.toFixed(2)));
        data.push(a * x + b);
    }
    const context = document.getElementById('grafico').getContext('2d');
    graficoPrimeiroGrau?.destroy();
    graficoPrimeiroGrau = new Chart(context, {
        type: 'line', data: {labels, datasets: [{label: 'f(x)', data, borderColor: '#17659a', borderWidth: 2, pointRadius: 0}]},
        options: {responsive: true, scales: {x: {title: {display: true, text: 'x'}}, y: {title: {display: true, text: 'f(x)'}}}}
    });
}
