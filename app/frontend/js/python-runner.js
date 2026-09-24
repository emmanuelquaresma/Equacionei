/* Browser boundary: parent never evaluates learner code. Each run gets an opaque
   sandbox frame + fresh module Worker, prepared asynchronously before execution. CSP permits only in-memory runtime blobs. */
const PythonRunner = (() => {
 const BASE = new URL('../vendor/micropython/',document.currentScript.src).href;
 let assets;
 function workerMain() {
  let python;
  let stdout='',stderr='',count=0;
  self.onmessage=async ({data})=>{
   const decoders={out:new TextDecoder(),err:new TextDecoder()};
   const write=kind=>bytes=>{
    count+=bytes.length;if(count>16384)throw Error('Limite de saída: 16 KB.');
    const text=decoders[kind].decode(bytes,{stream:true});if(kind==='out')stdout+=text;else stderr+=text;
   };
   try {
    if(data.type==='init'){
    const moduleURL='data:text/javascript;base64,'+btoa(unescape(encodeURIComponent(data.runtime)));
    const wasmURL=URL.createObjectURL(new Blob([data.wasm],{type:'application/wasm'}));
    const {loadMicroPython}=await import(moduleURL);
    python=await loadMicroPython({url:wasmURL,heapsize:4*1024*1024,pystack:2048,linebuffer:false,stdout:write('out'),stderr:write('err'),stdin:()=>4});
    // MVP sem stdin interativo: input informa explicitamente EOF, sem esperar uma tecla.
    python.runPython('import builtins\ndef _empty_input(prompt=""):\n    if prompt:\n        print(prompt, end="")\n    raise EOFError("Entrada interativa indisponivel nesta versao.")\nbuiltins.input = _empty_input\ndel _empty_input\ndel builtins');
    // No application objects or files are exposed to Python. FS is volatile WASM memory.
    self.postMessage({type:'started'});return;
    }
    if(data.type!=='execute'||!python)return;
    python.runPython(data.code);
    self.postMessage({type:'result',status:'done',stdout,error:stderr});
   } catch(error) {
    self.postMessage({type:'result',status:'error',stdout,error:(stderr+'\n'+String(error.name && error.name!=='PythonError' ? error.name+': '+error.message : error.message||error)).trim().slice(0,16384)});
   }
  };
 }
 function frameMain() {
  let worker;
  const send=value=>parent.postMessage(value,'*');
  addEventListener('message',event=>{
   if(event.source!==parent)return;
   if(event.data.type==='stop'){worker?.terminate();return;}
   if(event.data.type==='execute'){worker?.postMessage(event.data);return;}
   if(event.data.type!=='init'||worker)return;
   try {
   const url='data:text/javascript;base64,'+btoa(unescape(encodeURIComponent(event.data.worker)));
   worker=new Worker(url,{type:'module'});
   worker.onmessage=e=>send(e.data);
   worker.onerror=e=>{console.error('Python Worker:',e.message,e.filename,e.lineno,e.error);send({type:'result',status:'error',stdout:'',error:'Não foi possível iniciar o runtime Python neste navegador. '+(e.message||'Worker module loading failed')});};
   worker.postMessage(event.data);
   }catch(error){console.error('[Python Worker]',error);send({type:'result',status:'error',error:String(error.stack||error)});}
  });
  send({type:'ready'});
 }
 function create() {
  let active=null;
  function prepare(onStatus=()=>{}) {
   if(active)return active.prepared;
   const frame=document.createElement('iframe');frame.hidden=true;frame.title='Executor Python isolado';frame.setAttribute('sandbox','allow-scripts');
   let resolveReady;
   const job={frame,prepared:new Promise(resolve=>resolveReady=resolve),ready:false,running:false};active=job;
   function finish(value){
    if(active!==job)return;
    clearTimeout(job.timer);removeEventListener('message',job.listener);
    frame.contentWindow?.postMessage({type:'stop'},'*');frame.remove();active=null;
    if(!job.ready){assets=null;resolveReady(value);}
    job.resolveRun?.(value);
   }
   job.finish=finish;
   const fail=error=>{
    console.error('[Python runtime] Falha de inicialização',error);
    finish({status:'error',stdout:'',error:'Não foi possível preparar Python. Tente novamente.',diagnostic:String(error.stack||error.message||error)});
   };
   onStatus('Preparando ambiente Python…');
   job.timer=setTimeout(()=>fail(new Error('Timeout de inicialização (30 segundos).')),30000);
   (async()=>{try {
    assets ||= Promise.all(['micropython.mjs','micropython.wasm'].map(async name=>{
     const response=await fetch(BASE+name);
     if(!response.ok)throw Error(`${name}: HTTP ${response.status} em ${response.url}`);
     return name.endsWith('mjs')?response.text():response.arrayBuffer();
    })).catch(error=>{assets=null;throw error;});
    const [runtime,wasm]=await assets;if(active!==job)return;
    job.listener=event=>{
     if(event.source!==frame.contentWindow||active!==job)return;
     const d=event.data;if(!d||typeof d!=='object')return;
     if(d.type==='ready')frame.contentWindow.postMessage({type:'init',runtime,wasm,worker:`(${workerMain.toString()})();`},'*');
     if(d.type==='started'&&!job.ready){job.ready=true;clearTimeout(job.timer);onStatus('Python pronto para executar.');resolveReady({status:'ready'});}
     if(d.type==='result'){
      if(!job.ready){fail(new Error(d.error));return;}
      finish({status:d.status==='done'?'done':'error',stdout:String(d.stdout||'').slice(0,16384),error:String(d.error||'').slice(0,16384)});
     }
    };
    addEventListener('message',job.listener);
    // Opaque origin remains mandatory. Data module URLs avoid Chromium's
    // failed blob module-worker loading from a sandboxed srcdoc origin.
    frame.srcdoc=`<!doctype html><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' data:; worker-src data:; connect-src blob:; style-src 'none'; form-action 'none'; base-uri 'none';"><script>(${frameMain.toString()})();<\/script>`;
    document.body.append(frame);
   }catch(error){if(active===job)fail(error);}})();
   return job.prepared;
  }
  async function run(code,onStatus=()=>{}) {
   if(active?.running)throw Error('Já existe uma execução em andamento.');
   if(code.length>16000)return {status:'error',stdout:'',error:'Limite de código: 16.000 caracteres.'};
   const readiness=await prepare(onStatus);
   if(readiness.status!=='ready')return readiness;
   const job=active;
   if(!job)return {status:'stopped',stdout:'',error:'Execução interrompida.'};
   if(job.running)throw Error('Já existe uma execução em andamento.');
   job.running=true;onStatus('Executando…');
   return new Promise(resolve=>{
    job.resolveRun=resolve;
    job.timer=setTimeout(()=>job.finish({status:'timeout',stdout:'',error:'Execução interrompida após 3 segundos. Revise os laços do programa.'}),3000);
    job.frame.contentWindow.postMessage({type:'execute',code},'*');
   });
  }
  return {prepare,run,stop(){active?.finish({status:'stopped',stdout:'',error:'Execução interrompida por você.'});}};
 }
 return {create};
})();
