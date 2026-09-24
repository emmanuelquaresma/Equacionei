/* Estatística e classificação puras: sem DOM, armazenamento ou rede. */
const DataScience = (() => {
    function statistics(values) {
        const sorted=values.filter(Number.isFinite).sort((a,b)=>a-b);
        if(!sorted.length)return null;
        const n=sorted.length,counts=new Map();sorted.forEach(v=>counts.set(v,(counts.get(v)||0)+1));
        const frequency=Math.max(...counts.values());
        return {mean:sorted.reduce((a,b)=>a+b,0)/n,median:(sorted[Math.floor((n-1)/2)]+sorted[Math.floor(n/2)])/2,
            modes:frequency===1?[]:[...counts].filter(([,n])=>n===frequency).map(([v])=>v),min:sorted[0],max:sorted[n-1],counts:[...counts],n};
    }
    function summarize(rows) {
        const answers=rows.filter(r=>r.outcome==='answer');
        const hits=answers.filter(r=>r.answer===r.expected).length;
        const groups={};
        for(const row of answers) {
            const operations=[...new Set(row.operations)];
            const key=operations.length===1?operations[0]:'mixed';
            groups[key]??={total:0,hits:0};groups[key].total++;if(row.answer===row.expected)groups[key].hits++;
        }
        return {questions:new Set(rows.map(r=>`${r.game}:${r.questionId}`)).size,total:answers.length,hits,
            accuracy:answers.length?hits/answers.length:null,meanMs:answers.length?answers.reduce((s,r)=>s+r.responseMs,0)/answers.length:null,
            timeouts:rows.filter(r=>r.outcome==='timeout').length,groups};
    }
    const validExample = e => e&&['cat','dog'].includes(e.label)&&Number.isFinite(e.height)&&e.height>=10&&e.height<=80&&Number.isFinite(e.weight)&&e.weight>=1&&e.weight<=40;
    const TEST = Object.freeze([
        {height:22,weight:3,label:'cat'},{height:27,weight:5,label:'cat'},{height:32,weight:6,label:'cat'},
        {height:36,weight:8,label:'cat'},{height:29,weight:4,label:'cat'},
        {height:25,weight:7,label:'dog'},{height:39,weight:13,label:'dog'},{height:50,weight:19,label:'dog'},
        {height:63,weight:29,label:'dog'},{height:72,weight:35,label:'dog'}
    ].map(e=>Object.freeze(e)));
    function train(examples,k=3) {
        const rows=examples.filter(validExample);
        if(rows.length<2||!rows.some(e=>e.label==='cat')||!rows.some(e=>e.label==='dog'))throw Error('Adicione pelo menos um gato e um cachorro.');
        // k-NN memoriza exemplos e vota pelos vizinhos; não ajusta uma rede neural.
        return {examples:rows.map(e=>({...e})),k:Math.min(k,rows.length)};
    }
    function predict(model,point) {
        const neighbors=model.examples.map((e,index)=>({...e,index,distance:((e.height-point.height)/70)**2+((e.weight-point.weight)/39)**2}))
            .sort((a,b)=>a.distance-b.distance||a.index-b.index).slice(0,model.k);
        const cats=neighbors.filter(e=>e.label==='cat').length,dogs=neighbors.length-cats;
        const label=cats===dogs?neighbors[0].label:cats>dogs?'cat':'dog';
        return {label,votes:label==='cat'?cats:dogs,total:neighbors.length,neighbors};
    }
    function evaluate(model,test=TEST) {
        const results=test.map(example=>({example,prediction:predict(model,example)}));
        const hits=results.filter(r=>r.example.label===r.prediction.label).length;
        return {hits,total:test.length,accuracy:test.length?hits/test.length:null,results};
    }
    return {statistics,summarize,validExample,train,predict,evaluate,TEST};
})();
