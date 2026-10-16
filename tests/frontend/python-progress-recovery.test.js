function testPythonProgressRecovery() {
 const failures=[],cases=[];let assertions=0;
 const assert=(v,m)=>{assertions++;if(!v)throw Error(m);};
 const valid={attempts:3,executionErrors:1,wrongAnswers:1,hintsUsed:2,completed:true,elapsedTime:12.5,draft:'print(42)',updatedAt:'2026-10-15T12:00:00Z',extension:'preservar'};
 const samples=[['first',undefined],['valid',JSON.stringify({version:1,lastExercise:'sum',exercises:{sum:valid}})],['null','null'],['empty',''],['json','{invalid'],['object','{}'],['array','[]'],['missing',JSON.stringify({version:1})],['rows-null',JSON.stringify({version:1,exercises:{print:null,sum:valid}})],['rows-array',JSON.stringify({version:1,exercises:[]})],['types',JSON.stringify({version:1,lastExercise:42,exercises:{print:{attempts:'9',elapsedTime:-4,completed:'false',hintsUsed:1e300,draft:42},sum:valid}})],['previous',JSON.stringify({version:0,exercises:{sum:valid}})],['future',JSON.stringify({version:2,exercises:{sum:valid}})],['primitive','7'],['row-array',JSON.stringify({version:1,exercises:{print:[]}})]];
 for(const [name,raw] of samples){try{
  const db=new Map([['other-module','untouched'],['matematica.learning.v1','sentinel']]);if(raw!==undefined)db.set(PythonProgress.KEY,raw);
  const storage={getItem:k=>db.has(k)?db.get(k):null,setItem:(k,v)=>db.set(k,v)};let recovered=0;
  const p=PythonProgress.create(storage,()=>{},()=>recovered++);p.time('print',1);const r=p.row('print');
  assert(Number.isFinite(r.elapsedTime)&&r.elapsedTime>=0,name+' elapsedTime');assert(typeof r.completed==='boolean',name+' boolean');assert(Number.isSafeInteger(r.attempts)&&r.attempts>=0,name+' attempts');
  if(name==='types'){assert(r.completed===false,'string false is not completion');assert(r.attempts===0&&r.hintsUsed===0,'invalid counters');assert(!('draft' in r),'invalid draft');}
  if(['valid','rows-null','types','previous'].includes(name)){const kept=p.row('sum');assert(kept.draft===valid.draft&&kept.completed&&kept.attempts===3&&kept.extension==='preservar','valid sibling preserved');}
  p.draft('print','print(15)');p.result('print',{status:'done',error:''},true);p.select('print');p.save();
  if(name!=='future'){const loaded=PythonProgress.create(storage).row('print');assert(loaded.draft==='print(15)'&&loaded.completed,'reload and draft');}
  else assert(db.get(PythonProgress.KEY)===raw,'future schema never overwritten');
  assert(db.get('other-module')==='untouched'&&db.get('matematica.learning.v1')==='sentinel','other keys preserved');
  if(!['first','valid','future'].includes(name))assert(recovered>0,'recovery notification');
  if(!['first','valid','future'].includes(name))assert([...db.values()].includes(raw),'original raw retained');
  cases.push(name);
 }catch(e){failures.push({case:name,error:String(e)});}}
 for(const mode of ['unavailable','quota','backup-occupied']){try{
  const raw='{"version":1,"exercises":{"print":null}}',db=new Map([[PythonProgress.KEY,raw],[PythonProgress.KEY+'.recovery','older-backup']]);let errors=0;
  const storage=mode==='unavailable'?undefined:{getItem:k=>mode==='quota'?k===PythonProgress.KEY?raw:null:db.get(k)||null,setItem(k,v){if(mode==='quota')throw Error('quota');db.set(k,v);}};
  const p=PythonProgress.create(storage,()=>errors++);p.draft('print','kept in memory');p.result('print',{status:'done'},true);p.time('print',NaN);assert(Number.isFinite(p.row('print').elapsedTime),'nonfinite time rejected');assert(p.row('print').draft==='kept in memory','memory remains usable');if(mode!=='unavailable')assert(db.get(PythonProgress.KEY)===raw,'unbacked original untouched');assert(errors>0,'persistence warning');cases.push(mode);
 }catch(e){failures.push({case:mode,error:String(e)});}}
 return {cases:cases.length+failures.length,passed:cases.length,assertions,failures};
}
