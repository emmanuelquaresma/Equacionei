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
 function create(storage,onError=()=>{}) {
  let data={version:1,lastExercise:'print',exercises:{}};
  try {
   const saved=JSON.parse(storage?.getItem(KEY)||'null');
   if(saved?.version===1 && saved.exercises && typeof saved.exercises==='object') data=saved;
  } catch {onError();}
  function row(id) {
   if(!Object.hasOwn(data.exercises,id)) data.exercises[id]={attempts:0,executionErrors:0,wrongAnswers:0,hintsUsed:0,completed:false,elapsedTime:0};
   return data.exercises[id];
  }
  function save(){try {if(!storage)throw Error();storage.setItem(KEY,JSON.stringify(data));}catch{onError();}}
  return {data,row,save,select(id){data.lastExercise=id;save();},draft(id,code){row(id).draft=code;save();},hint(id){row(id).hintsUsed++;save();},
   result(id,result,correct){const r=row(id);r.attempts++;if(result.status!=='done'||result.error)r.executionErrors++;else if(!correct)r.wrongAnswers++;r.completed ||= correct;r.updatedAt=new Date().toISOString();save();},
   time(id,seconds){row(id).elapsedTime+=Math.max(0,seconds);save();}};
 }
 return {create,KEY};
})();
