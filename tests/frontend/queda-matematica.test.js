function testQuedaOptions(math, options) {
    const assert=(v,m)=>{if(!v)throw Error(m);};
    assert(math.calculate([8,4,2],['+','*'])===16,'precedência');
    assert(math.calculate([8,7,5,3,8],['-','*','-','-'])===-38,'negativo');
    for(const level of ['easy','medium','hard'])for(let i=0;i<1000;i++) {
        const expression=math.generate(level,1+i%10),values=options.generate(expression);
        assert(level==='easy' ? expression.operators.length>=1&&expression.operators.length<=2 : expression.operators.length===(level==='medium'?3:4),'nível');
        assert(values.length>=4&&values.length<=6&&new Set(values).size===values.length,'opções distintas');
        assert(values.filter(v=>v===expression.result).length===1,'um acerto');
    }
    const negative=options.generate({numbers:[3,10],operators:['-'],result:-7});assert(negative.includes(-7),'opção negativa');
    return '3.000 conjuntos de opções e negativos OK';
}
function testQuedaGame(advanceTest) {
    const $=id=>document.getElementById('q-'+id), assert=(v,m)=>{if(!v)throw Error(m);};
    const fixture=document.createElement('script');fixture.textContent="MathExpressions.generate=()=>({text:'3 − 10',result:-7,numbers:[3,10],operators:['-']});";document.head.append(fixture);
    const hit=()=>[...$('options').children].find(b=>b.textContent==='-7').click();
    $('start').click();advanceTest(1000);
    [...$('options').children].find(b=>b.textContent!=='-7').click();assert($('errors').textContent==='1'&&$('lives').textContent==='♥ ♥','erro desconta uma vida');
    $('pause').click();advanceTest(5000);hit();assert($('time').textContent==='00:01'&&$('hits').textContent==='0'&&$('lives').textContent==='♥ ♥','pausa não desconta vida');
    $('resume').click();advanceTest(1000);hit();assert($('hits').textContent==='1'&&Number($('score').textContent)>100,'clique negativo correto');
    for(let i=1;i<10;i++){advanceTest(1000);hit();}
    assert($('phase').textContent==='2'&&$('streak').textContent==='10','fase e sequência');
    advanceTest(40000);assert($('lives').textContent==='♥'&&$('streak').textContent==='0','timeout desconta uma vida e zera sequência');
    advanceTest(40000);assert(!$('result').hidden&&$('lives').textContent==='0','fim por combinação de erro e timeout');
    const record=JSON.parse(localStorage.getItem('quedaMatematicaRecords')).easy;
    assert(record.hits>=10&&record.streak>=10&&record.phase>=2&&record.score>1000,'recordes separados');
    $('again').click();
    assert($('lives').textContent==='♥ ♥ ♥','reinício restaura três vidas');
    const wrong=[...$('options').children].find(b=>b.textContent!=='-7');
    wrong.click();wrong.click();wrong.click();
    assert(!$('result').hidden&&$('lives').textContent==='0'&&$('errors').textContent==='3','três erros encerram');
    wrong.click();hit();advanceTest(40000);
    assert($('errors').textContent==='3'&&$('lives').textContent==='0'&&$('hits').textContent==='0','fim bloqueia novos cliques e perdas');
    $('again').click();
    advanceTest(40000);advanceTest(40000);advanceTest(40000);
    assert(!$('result').hidden&&$('errors').textContent==='0'&&$('lives').textContent==='0','três timeouts continuam encerrando');
    return 'cliques, negativos, pausa, relógio, sequência, fase, vidas por erro/timeout e recordes OK';
}
