/* Carregar na página python.html, em perfil de teste. Não executa código no servidor. */
async function testPythonRunner() {
 const runner=PythonRunner.create(),results=[];
 const assert=(value,message)=>{if(!value)throw Error(message);};
 const savedFetch=window.fetch;
 try {
  window.fetch=()=>new Promise(()=>{});
  const loading=runner.run('print(1)');runner.stop();
  assert((await loading).status==='stopped','Parar durante carregamento');results.push('Parar durante carregamento');
 } finally {window.fetch=savedFetch;}
 assert((await runner.prepare()).status==='ready','Preparação sem executar código');results.push('Preparação assíncrona');
 const run=async (name,code,check)=>{const r=await runner.run(code);assert(check(r),name+': '+JSON.stringify(r));results.push(name);return r;};
 await run('print e UTF-8','print("Olá, Matemática para Todos!")',r=>r.status==='done'&&r.stdout==='Olá, Matemática para Todos!\n');
 await run('soma de lista','numeros = [10, 20]\nresultado = sum(numeros)\nprint(resultado)',r=>r.stdout==='30\n');
 await run('múltiplos prints','print(1)\nprint(2)',r=>r.stdout==='1\n2\n');
 await run('sintaxe','if True print(1)',r=>r.error.includes('SyntaxError'));
 await run('execução','print(inexistente)',r=>r.error.includes('NameError'));
 await run('import educacional','import math\nprint(math.sqrt(16))',r=>r.status==='done'&&Number(r.stdout)===4);
 await run('filesystem do host indisponível','print(open("/etc/passwd").read())',r=>!!r.error);
 await run('secrets indisponíveis','print(open("/.env").read())',r=>!!r.error);
 await run('processos indisponíveis','import os\nos.system("echo escape")',r=>!!r.error);
 await run('rede Python indisponível','import socket\nsocket.socket()',r=>!!r.error);
 await run('origem opaca','import js\nprint(js.location.origin)',r=>r.stdout==='null\n');
 await run('DOM indisponível','import js\nprint(js.document.cookie)',r=>!!r.error);
 await run('storage isolado','import js\nprint(js.indexedDB.open("escape"))',r=>r.error.includes('SecurityError'));
 await run('memória Python limitada','a = "x" * 100000000',r=>r.error.includes('MemoryError'));
 await run('limite de saída','print("x" * 20000)',r=>!!r.error);
 await run('input sem dados','nome=input("Nome: ")',r=>r.error.includes('EOFError'));
 await run('loop interrompido','while True:\n    pass',r=>r.status==='timeout');
 let pending=runner.run('while True:\n    pass',status=>{if(status==='Executando…')setTimeout(()=>runner.stop(),100);});
 assert((await pending).status==='stopped','Parar');results.push('Parar');
 await run('runtime novo após interrupção','print(42)',r=>r.stdout==='42\n');
 // Mesmo a ponte JS continua confinada à origem opaca e à CSP do Worker.
 await run('requisição bloqueada por CSP','import js\nr = js.XMLHttpRequest.new()\nr.open("GET", "http://127.0.0.1:8767/probe-network", False)\nr.send()',r=>r.error.includes('NetworkError'));
 const normalize={status:'done',stdout:'15\n',error:''};
 assert(PythonValidator.validate({validator:'OUTPUT_EQUALS',expectedOutput:'15'},normalize),'comparação de saída');
 assert(!PythonValidator.validate({validator:'OUTPUT_EQUALS',expectedOutput:'20'},normalize),'saída incorreta');
 const db=new Map(),storage={getItem:k=>db.get(k),setItem:(k,v)=>db.set(k,v)};
 const p=PythonProgress.create(storage);p.draft('sum','print(15)');p.hint('sum');p.time('sum',12);p.result('sum',normalize,true);
 const loaded=PythonProgress.create(storage).row('sum');assert(loaded.draft==='print(15)'&&loaded.completed&&loaded.hintsUsed===1&&loaded.elapsedTime===12,'persistência');
 return results;
}
