async function testQuadraticBounds(source) {
 const rows=[];const defaults={a:'1',b:'-4',c:'3',xmin:'-10',xmax:'10'};
 const tests=[['distinct',{},true],['double',{b:'-2',c:'1'},true],['no-real',{b:'0',c:'1'},true],['a-zero',{a:'0'},false],['negative',{a:'-1',b:'4',c:'-3'},true],['decimal',{a:'.5',b:'-2',c:'1.5'},true],['large',{a:'1e200',b:'-4e200',c:'3e200'},true],['small',{a:'1e-200',b:'-4e-200',c:'3e-200'},true],['near-zero',{a:'1e-12',b:'-4e-12',c:'3e-12'},true],['empty-a',{a:''},false],['empty-b',{b:''},false],['spaces',{c:'  '},false],['letters',{b:'abc'},false],['infinity',{a:'Infinity'},false],['nan',{c:'NaN'},false],['overflow',{a:'1e309'},false],['underflow',{a:'1e-999'},false],['extreme-original',{a:'1',b:'0',c:'0',xmin:'10000000000000000',xmax:'10000000000000100'},true],['huge-span',{xmin:'-1000000',xmax:'1000000'},true],['overflow-graph',{xmin:'-1e308',xmax:'1e308'},false],['invalid-interval',{xmin:'10',xmax:'-10'},false],['empty-interval',{xmin:''},false],['fraction-range',{xmin:'.1',xmax:'.9'},true]];
 for(const [name,fields,valid] of tests){
  const code=`const fields=${JSON.stringify({...defaults,...fields})};const elements={};let chartConfig=null;const alerts=[];const alert=s=>alerts.push(s);const document={getElementById(id){return elements[id]??=( {value:fields[id]??'',hidden:true,textContent:'',children:[],set innerHTML(v){this.html=v;this.children=[]},get innerHTML(){return this.html||''},appendChild(n){this.children.push(n)},getContext(){return {}}})},createElement(){return {innerHTML:''}}};const Chart=function(c,config){chartConfig=config;this.destroy=()=>{}};`+source+`;postMessage({error:alerts[0]||(!document.getElementById('calculo-erro').hidden&&document.getElementById('calculo-erro').textContent)||null,roots:document.getElementById('raizes').textContent||document.getElementById('raizes').innerHTML,points:chartConfig?.data.datasets[0].data||[],labels:chartConfig?.data.labels||[],table:document.getElementById('tabelaValores').children.length,notice:document.getElementById('tabela-aviso').textContent});`;
  const result=await new Promise(resolve=>{const url=URL.createObjectURL(new Blob([code],{type:'text/javascript'})),w=new Worker(url);const finish=v=>{clearTimeout(timer);w.terminate();URL.revokeObjectURL(url);resolve(v)};const timer=setTimeout(()=>finish({timeout:true}),750);w.onmessage=e=>finish(e.data);w.onerror=e=>{e.preventDefault();finish({workerError:e.message})}});
  let error=null;
  if(result.timeout||result.workerError)error='worker timeout/error: '+JSON.stringify(result);
  else if(valid&&result.error)error='unexpected rejection: '+result.error;
  else if(!valid&&!result.error)error='invalid input accepted';
  else if(valid&&(result.points.length>101||result.points.length<2||!result.points.every(Number.isFinite)||result.table>201))error='unbounded/nonfinite output';
  else if(['distinct','negative','decimal','large','small','near-zero'].includes(name)&&(!result.roots.includes('1.0000')||!result.roots.includes('3.0000')))error='incorrect roots: '+result.roots;
  else if(name==='huge-span'&&!result.notice)error='missing sampling notice';
  rows.push({name,valid,error,result:{...result,points:result.points?.length,labels:result.labels?.length}});
 }
 return {cases:rows.length,passed:rows.filter(r=>!r.error).length,rows};
}
