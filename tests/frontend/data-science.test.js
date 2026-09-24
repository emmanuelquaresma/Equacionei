function testDataScience(Core) {
    const assert=(v,m)=>{if(!v)throw Error(m);};
    let s=Core.statistics([2,4,4,6,9]);assert(s.mean===5&&s.median===4&&s.modes[0]===4&&s.min===2&&s.max===9,'estatísticas');
    s=Core.statistics([1,1,2,2]);assert(s.median===1.5&&s.modes.length===2,'multimodal e mediana par');
    assert(Core.statistics([])===null&&Core.statistics([1,2]).modes.length===0,'vazio e sem moda');
    const rows=[{game:'queda',questionId:'1',answer:2,expected:2,outcome:'answer',responseMs:1000,operations:['+']},
        {game:'queda',questionId:'1',answer:3,expected:2,outcome:'answer',responseMs:2000,operations:['+','*']},
        {game:'queda',questionId:'2',answer:null,expected:2,outcome:'timeout',responseMs:5000,operations:['/']}];
    const summary=Core.summarize(rows);assert(summary.questions===2&&summary.total===2&&summary.hits===1&&summary.accuracy===.5&&summary.meanMs===1500&&summary.timeouts===1,'agregação e denominadores');
    assert(summary.groups.mixed.total===1,'expressão mista não atribuída a uma operação');
    assert(Core.summarize([]).accuracy===null,'sem dados não inventa acurácia');
    let failed=false;try{Core.train([{height:20,weight:3,label:'cat'}]);}catch(_){failed=true;}assert(failed,'exige duas classes');
    const samples=[{height:20,weight:2,label:'cat'},{height:28,weight:4,label:'cat'},{height:34,weight:7,label:'cat'},
        {height:40,weight:12,label:'dog'},{height:55,weight:22,label:'dog'},{height:70,weight:33,label:'dog'}];
    const model=Core.train(samples,3);samples[0].label='dog';assert(model.examples[0].label==='cat','snapshot treino');
    assert(Core.predict(model,{height:24,weight:3}).label==='cat','classifica gato');
    assert(Core.predict(model,{height:65,weight:32}).label==='dog','classifica cachorro');
    const result=Core.evaluate(model);assert(result.total===10&&result.accuracy===result.hits/10,'teste real separado');
    const reversed=Core.train(model.examples.map(e=>({...e,label:e.label==='cat'?'dog':'cat'})),3);
    assert(Core.evaluate(reversed).hits<result.hits,'rótulos ruins podem piorar');
    assert(model.examples.length===6,'teste não inserido no treino');
    return 'Estatística, agregação, treino/teste, k-NN e qualidade dos rótulos: OK';
}
function testLearningData(source) {
    const memory=new Map(),window={};let blocked=false;
    const storage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>{if(blocked)throw Error('quota');memory.set(k,v);}};
    new Function('window','localStorage',source)(window,storage);
    const S=window.LearningData,assert=(v,m)=>{if(!v)throw Error(m);};
    const row={game:'queda',level:'easy',questionId:'q1',question:'3 - 10',operations:['-'],answer:-7,expected:-7,outcome:'answer',responseMs:500};
    assert(S.record(row)&&S.attempts()[0].correct,'negativos registrados');
    assert(!S.record({...row,responseMs:NaN}),'rejeita duração inválida');
    memory.set('unrelated-record','preserve');S.saveProgress({activities:['train'],examples:[],runs:[]});
    S.clearAttempts();assert(S.attempts().length===0&&S.loadProgress().activities[0]==='train'&&memory.get('unrelated-record')==='preserve','exclusão isolada');
    for(let i=0;i<1005;i++)S.record({...row,questionId:String(i)});
    assert(S.attempts().length===1000&&S.attempts()[0].questionId==='5','limite de armazenamento');
    blocked=true;assert(S.record({...row,questionId:'offline'})&&S.attempts().at(-1).questionId==='offline'&&!S.isPersistent(),'quota mantém memória e não lança erro');
    return 'Persistência, limite, exclusão isolada e falha de armazenamento: OK';
}
function testDataScienceUI() {
    const $=id=>document.getElementById(id),assert=(v,m)=>{if(!v)throw Error(m);};
    assert($('badges').children.length===5,'cinco conquistas');
    $('sample-examples').click();assert($('training-list').children.length===6,'adiciona exemplos');
    $('train-model').click();assert($('evaluation').textContent.includes('Teste: 10')&&!$('predict-model').disabled,'treina e avalia');
    $('predict-model').click();assert($('prediction').textContent.includes('Minha previsão'),'prevê');
    $('animal-height').value='72';$('animal-weight').value='30';$('animal-label').value='cat';$('add-example').click();
    assert($('predict-model').disabled,'mudança exige retreino');$('train-model').click();assert($('training-history').children.length===2,'compara treinamentos');
    $('lab-answers').querySelector('button').click();assert($('lab-feedback').textContent.includes('Muito bem'),'resposta laboratório');
    $('data-quiz').querySelector('[data-correct]').click();assert($('badges').querySelectorAll('.earned').length>=2,'conquistas por atividades');
    return 'Exemplos, treino, previsão, retreino, comparação, laboratório e conquistas: OK';
}
