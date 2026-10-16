/* Validação comportamental e persistência local, independentes do executor. */
const PythonValidator = (() => {
 const normalize = value => String(value).replace(/\r\n/g,'\n').replace(/\n+$/,'');
 const validators = {
  OUTPUT_EQUALS: (exercise, result) => normalize(result.stdout) === normalize(exercise.expectedOutput),
  OUTPUT_CONTAINS: (exercise, result) => normalize(result.stdout).includes(exercise.expectedOutput)
 };
 return {validate(exercise,result) {
  if(result.error || result.status !== 'done') return false;
  if(!validators[exercise.validator]) throw Error('Validador não disponível.');
  return validators[exercise.validator](exercise,result);
 }};
})();
const PythonProgress = (() => {
 const KEY='matematica.python.progress.v1';
 const record=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
 const defaults=()=>({attempts:0,executionErrors:0,wrongAnswers:0,hintsUsed:0,completed:false,elapsedTime:0});
 function create(storage,onError=()=>{},onRecovery=()=>{}) {
  let data={version:1,lastExercise:'print',exercises:Object.create(null)},raw=null,recovered=false,writable=true;
  function normalize(value) {
   const result=record(value)?{...value}:{};
   if(!record(value))recovered=true;
   for(const [key,fallback] of Object.entries(defaults())) {
    const v=result[key],valid=key==='completed'?typeof v==='boolean':typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=Number.MAX_SAFE_INTEGER&&(key==='elapsedTime'||Number.isSafeInteger(v));
    if(!valid){result[key]=fallback;recovered=true;}
   }
   if(Object.hasOwn(result,'draft')&&typeof result.draft!=='string'){delete result.draft;recovered=true;}
   return result;
  }
  try {
   raw=storage?.getItem(KEY)??null;
   if(raw!==null) {
    let saved;try{saved=JSON.parse(raw);}catch{recovered=true;}
    if(record(saved)) {
     // Unknown newer schemas are never downgraded or overwritten.
     if(typeof saved.version==='number'&&saved.version>1){writable=false;onError();}
     data={...saved,version:1,lastExercise:typeof saved.lastExercise==='string'&&saved.lastExercise?saved.lastExercise:'print',exercises:Object.create(null)};
     if(saved.version!==1||data.lastExercise!==saved.lastExercise||!record(saved.exercises))recovered=true;
     if(record(saved.exercises))for(const id of Object.keys(saved.exercises))data.exercises[id]=normalize(saved.exercises[id]);
    } else recovered=true;
   }
  } catch {writable=false;onError();}
  function row(id) {
   if(!Object.hasOwn(data.exercises,id))data.exercises[id]=defaults();
   return data.exercises[id];
  }
  function save(){
   if(!writable)return;
   try {if(!storage)throw Error();storage.setItem(KEY,JSON.stringify(data));}catch{onError();}
  }
  if(recovered) {
   onRecovery();
   if(!writable)onError();
   if(writable)try {
    // Keep the original bytes before replacing this key; never clear other modules.
    const backup=storage.getItem(KEY+'.recovery');
    if(backup!==null&&backup!==raw)throw Error('Recovery backup occupied');
    if(backup===null)storage.setItem(KEY+'.recovery',raw);
    if(storage.getItem(KEY+'.recovery')!==raw)throw Error('Recovery backup unavailable');
    save();
   } catch {writable=false;onError();}
  }
  return {data,row,save,select(id){data.lastExercise=id;save();},draft(id,code){row(id).draft=code;save();},hint(id){row(id).hintsUsed++;save();},
   result(id,result,correct){const r=row(id);r.attempts++;if(result.status!=='done'||result.error)r.executionErrors++;else if(!correct)r.wrongAnswers++;r.completed ||= correct;r.updatedAt=new Date().toISOString();save();},
   time(id,seconds){if(Number.isFinite(seconds)&&seconds>=0){const r=row(id),next=r.elapsedTime+seconds;if(Number.isFinite(next)&&next<=Number.MAX_SAFE_INTEGER)r.elapsedTime=next;}save();}};
 }

 return {create,KEY};
})();
