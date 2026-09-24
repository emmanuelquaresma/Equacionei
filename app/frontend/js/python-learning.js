(() => {
 const params=new URLSearchParams(location.search);
 const foundations=params.get('trail')==='fundamentos';
 const $=id=>document.getElementById('py-'+id), exercises=foundations?DataScienceFundamentals:PythonExercises;
 if(foundations){
  const back=document.createElement('a');back.href='/static/data-science/fundamentos.html';back.textContent='← Aulas de Fundamentos';back.className='dev-lab-back';
  document.querySelector('.dev-page').prepend(back);
 }
 let storage;try{storage=localStorage;}catch{}
 const progress=PythonProgress.create(storage,()=>{$('storage').textContent='Não foi possível salvar neste navegador. Seu progresso permanece apenas nesta página.';});
 const runner=PythonRunner.create();let current=exercises[0],busy=false,ready=false,lastTime=performance.now();
 const get=id=>exercises.find(e=>e.id===id);
 function accountTime(){const now=performance.now();if(!document.hidden)progress.time(current.id,(now-lastTime)/1000);lastTime=now;}
 function trail(){
  $('progress').textContent=`Sua trilha: ${exercises.filter(e=>progress.row(e.id).completed).length} de ${exercises.length} concluídos`;
  $('trail').replaceChildren(...exercises.map(e=>{const li=document.createElement('li'),b=document.createElement('button');b.type='button';b.disabled=busy;b.textContent=`${progress.row(e.id).completed?'✓':'○'} ${e.module} — ${e.title}`;if(e===current)b.setAttribute('aria-current','step');b.onclick=()=>select(e.id);li.append(b);return li;}));
 }
 function select(id){
  if(busy)return;accountTime();current=get(id)||exercises[0];progress.select(current.id);lastTime=performance.now();
  const index=exercises.indexOf(current);$('count').textContent=`Exercício ${index+1} de ${exercises.length}`;
  for(const [id,key] of [['title','title'],['description','description'],['expected','expectedOutput'],['explanation','explanation'],['example','example']])$(id).textContent=current[key];
  $('code').value=typeof progress.row(current.id).draft==='string'?progress.row(current.id).draft:current.starterCode;
  $('hint-text').hidden=true;$('output').textContent='';$('error').hidden=true;$('feedback').textContent='Escreva seu código e execute.';
  $('next').hidden=!progress.row(current.id).completed||index===exercises.length-1;trail();
 }
 function setBusy(value){busy=value;$('run').disabled=value||!ready;$('stop').hidden=!value;$('restore').disabled=value;$('code').readOnly=value;$('indent').disabled=value;$('next').disabled=value;trail();}
 async function execute(){
  if(busy||!ready)return;accountTime();const exercise=current,code=$('code').value;progress.draft(exercise.id,code);setBusy(true);$('error').hidden=true;$('output').textContent='';
  try {
   const result=await runner.run(code,status=>$('feedback').textContent=status);
   const correct=PythonValidator.validate(exercise,result);progress.result(exercise.id,result,correct);
   $('output').textContent=result.stdout;$('error').textContent=result.error;$('error').hidden=!result.error;
   $('feedback').textContent=correct?'✓ Muito bem! Seu programa produziu o resultado esperado.':result.error?'✕ Seu programa encontrou um erro ou foi interrompido.':'Seu código executou, mas o resultado ainda não é o esperado. Compare com o desafio.';
   if(correct&&current===exercises.at(-1))$('feedback').textContent+=' Você chegou ao último desafio!';
   $('next').hidden=!progress.row(exercise.id).completed||exercise===exercises.at(-1);
  } catch(error){$('feedback').textContent='Não foi possível executar. Tente novamente.';$('error').textContent=String(error.message);$('error').hidden=false;}
  finally {accountTime();ready=false;setBusy(false);prepare();}
 }
 async function prepare(){
  ready=false;$('run').disabled=true;$('retry').hidden=true;
  const result=await runner.prepare(status=>$('runtime').textContent=status);
  ready=result.status==='ready';$('run').disabled=busy||!ready;
  if(!ready){$('runtime').textContent=result.error;$('retry').hidden=false;}
 }
 $('retry').onclick=prepare;
 function draft(){progress.draft(current.id,$('code').value);}
 function indent(){if(busy)return;const el=$('code');el.setRangeText('    ',el.selectionStart,el.selectionEnd,'end');draft();el.focus();}
 $('run').onclick=execute;$('stop').onclick=()=>runner.stop();$('indent').onclick=indent;
 $('code').addEventListener('input',draft);
 $('code').addEventListener('keydown',event=>{if(event.key==='Enter'&&(event.ctrlKey||event.metaKey)){event.preventDefault();execute();}});
 $('hint').onclick=()=>{if($('hint-text').hidden){progress.hint(current.id);$('hint-text').textContent=current.hint;$('hint-text').hidden=false;}};
 $('restore').onclick=()=>{if($('code').value!==current.starterCode){$('confirm').returnValue='';$('confirm').showModal();}else $('code').focus();};
 $('confirm').addEventListener('close',()=>{if($('confirm').returnValue==='restore'){$('code').value=current.starterCode;draft();$('code').focus();}});
 $('next').onclick=()=>{const next=exercises[exercises.indexOf(current)+1];if(next){select(next.id);$('title').scrollIntoView({block:'start'});}};
 document.addEventListener('visibilitychange',()=>{if(document.hidden){progress.time(current.id,(performance.now()-lastTime)/1000);progress.save();}lastTime=performance.now();});
 window.addEventListener('pagehide',()=>{accountTime();draft();runner.stop();});
 select(get(params.get('exercise'))?.id||get(progress.data.lastExercise)?.id||exercises[0].id);
 prepare();
 window.addEventListener('pageshow',event=>{if(event.persisted)prepare();});
})();
