let graficoAtual = null;

/* Work is bounded by integer indices, never by floating-point progress. */
const QuadraticFunction = (() => {
    const POINTS = 100, MAX_TABLE = 201;
    function number(raw, label) {
        const text = String(raw).trim();
        if (!text) throw Error('Preencha todos os campos numéricos.');
        if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(text))
            throw Error(`Informe um número válido em ${label}.`);
        const value = Number(text);
        if (!Number.isFinite(value)) throw Error('Informe números finitos dentro da faixa suportada.');
        if (value === 0 && /[1-9]/.test(text.split(/e/i)[0]))
            throw Error('Um valor é pequeno demais para ser representado com segurança.');
        return value;
    }
    const format = value => value !== 0 && (Math.abs(value) < 0.0001 || Math.abs(value) >= 1e8)
        ? value.toExponential(4) : value.toFixed(4);
    function calculate(fields) {
        const [a,b,c,xmin,xmax] = ['a','b','c','xmin','xmax'].map(key => number(fields[key], key));
        if (a === 0) throw Error('O valor de a deve ser diferente de zero.');
        if (xmin >= xmax) throw Error('X inicial deve ser menor que X final.');
        // Scaling avoids overflow/underflow of b² and 4ac without changing input coefficients.
        const scale = Math.max(Math.abs(a),Math.abs(b),Math.abs(c));
        const A=a/scale, B=b/scale, C=c/scale, d=B*B-4*A*C;
        if (A===0 || (d===0 && ((B!==0 && B*B===0)||(C!==0 && A*C===0))))
            throw Error('A diferença entre os coeficientes excede a precisão numérica suportada.');
        let roots=[];
        if (d===0) roots=[-B/(2*A)];
        else if (d>0) {
            const q=-0.5*(B+(B<0?-1:1)*Math.sqrt(d));
            roots=B<=0?[q/A,C/q]:[C/q,q/A];
        }
        const xv=-B/(2*A), yv=(-d/(4*A))*scale;
        if (![xv,yv,...roots].every(Number.isFinite))
            throw Error('Raízes ou vértice excedem a faixa numérica suportada.');
        const evaluate=x => {
            const y=(a*x+b)*x+c;
            if (!Number.isFinite(y)) throw Error('Este intervalo produz valores fora da faixa do gráfico. Reduza o intervalo ou os coeficientes.');
            return y;
        };
        const labels=[],values=[],span=xmax-xmin;
        for (let i=0;i<=POINTS;i++) {
            const t=i/POINTS;
            const x=i===0?xmin:i===POINTS?xmax:Number.isFinite(span)?xmin+span*t:xmin*(1-t)+xmax*t;
            if (!Number.isFinite(x)) throw Error('Este intervalo não pode ser representado com segurança.');
            // Closely spaced large numbers may round to the same coordinate.
            if (labels.length && x<=labels.at(-1)) continue;
            labels.push(x);values.push(evaluate(x));
        }
        if (!Number.isFinite(Math.max(...values)-Math.min(...values)))
            throw Error('A variação deste intervalo excede a faixa do gráfico. Reduza o intervalo.');
        const lo=Math.ceil(xmin),hi=Math.floor(xmax),count=hi-lo+1;
        const sampled=!(Number.isSafeInteger(lo)&&Number.isSafeInteger(hi)&&count<=MAX_TABLE);
        const table=sampled?labels.map((x,i)=>[x,values[i]]):[];
        if (!sampled) for(let i=0;i<Math.max(0,count);i++){const x=lo+i;table.push([x,evaluate(x)]);}
        const actualDelta=(scale*d)*scale;
        const delta=Number.isFinite(actualDelta)&&(actualDelta!==0||d===0)?String(actualDelta):
            (()=>{const log=Math.log10(Math.abs(d))+2*Math.log10(scale),exponent=Math.floor(log);return `${d<0?'-':''}${(10**(log-exponent)).toFixed(4)}e${exponent>=0?'+':''}${exponent}`;})();
        return {a,b,c,roots,xv,yv,delta,labels,values,table,sampled};
    }
    return {calculate,format};
})();

function calcular() {
    const error=document.getElementById('calculo-erro');
    let result;
    try {
        result=QuadraticFunction.calculate(Object.fromEntries(['a','b','c','xmin','xmax'].map(id=>[id,document.getElementById(id).value])));
    } catch (e) {
        error.textContent=e.message+' Os últimos resultados válidos, se houver, foram mantidos.';
        error.hidden=false;
        return;
    }
    error.hidden=true;error.textContent='';
    const {a,b,c,roots,xv,yv,delta,labels,values,table,sampled}=result, format=QuadraticFunction.format;
    const set=(id,text)=>{document.getElementById(id).textContent=text;};
    set('equacao',`Equação: f(x) = ${a}x² + ${b}x + ${c}`);
    set('delta',`Δ: ${delta}`);
    set('raizes',roots.length===2?`Raízes: x₁ = ${format(roots[0])} | x₂ = ${format(roots[1])}`:roots.length===1?`Raiz dupla: x = ${format(roots[0])}`:'A função não possui raízes reais.');
    set('vertice',`Vértice: V(${format(xv)}, ${format(yv)})`);
    set('concavidade',`Concavidade: ${a>0?'para cima':'para baixo'}`);
    criarGrafico(labels,values);
    criarTabela(table);
    set('tabela-aviso',sampled?'Intervalo amplo: tabela amostrada em até 101 pontos, nos mesmos pontos do gráfico.':'Tabela dos valores inteiros do intervalo.');
}

function criarGrafico(valoresX,valoresY) {
    const contexto=document.getElementById('grafico').getContext('2d');
    if(graficoAtual)graficoAtual.destroy();
    graficoAtual=new Chart(contexto,{
        type:'line',data:{labels:valoresX.map(x=>String(Number.isInteger(x)?x:Number(x.toPrecision(12)))),datasets:[{label:'f(x)',data:valoresY,borderWidth:2,pointRadius:0,tension:0}]},
        options:{responsive:true,maintainAspectRatio:false,interaction:{intersect:false,mode:'index'},
            scales:{x:{title:{display:true,text:'x'}},y:{title:{display:true,text:'f(x)'}}}}
    });
}
function criarTabela(rows) {
    const tabela=document.getElementById('tabelaValores');tabela.innerHTML='';
    for(const [x,y] of rows) {
        const linha=document.createElement('tr');
        linha.innerHTML=`<td>${x}</td><td>${QuadraticFunction.format(y)}</td>`;
        tabela.appendChild(linha);
    }
}
calcular();
