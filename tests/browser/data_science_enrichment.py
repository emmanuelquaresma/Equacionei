"""Run: python3 tests/browser/data_science_enrichment.py. Requires Chrome/Chromium.
Uses local files, a temporary profile and no student storage. Screenshots/report: /tmp.
"""
from chrome_driver import Chrome
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from threading import Thread
import time,json,base64
ROOT=Path(__file__).resolve().parents[2]
class Handler(SimpleHTTPRequestHandler):
 def __init__(self,*a,**kw):super().__init__(*a,directory=str(ROOT/'app/frontend'),**kw)
 def do_GET(self):
  if self.path.startswith('/static/'):self.path=self.path[7:]
  if self.path=='/':self.path='/index.html'
  if self.path=='/menu':self.path='/pages/menu.html'
  super().do_GET()
 def log_message(self,*a):pass
server=ThreadingHTTPServer(('127.0.0.1',0),Handler);Thread(target=server.serve_forever,daemon=True).start()
c=Chrome();report=[]
def js(s):
 r=c.js(s)['result']
 if 'exceptionDetails' in r:raise AssertionError(r['exceptionDetails'])
 return r['result'].get('value')
def nav(path):
 url=f'http://127.0.0.1:{server.server_port}/static/'+path
 c.call('Page.navigate',{'url':url});wait('location.href==='+json.dumps(url)+" && document.readyState==='complete'")
def wait(expr):
 for _ in range(200):
  if js(expr):return
  time.sleep(.1)
 raise AssertionError(expr)
def ok(s):report.append(s);print(s,flush=True)
def shot(name):
 Path('/tmp/'+name+'.png').write_bytes(base64.b64decode(c.call('Page.captureScreenshot',{'format':'png'})['result']['data']))
def click(selector):js('document.querySelector('+json.dumps(selector)+').click()');time.sleep(.1)
try:
 nav('data-science/fundamentos.html')
 code=(ROOT/'tests/frontend/data-science-fundamentos.test.js').read_text()
 ok(js(code+'\ntestFundamentalsEnrichment(DataScienceFundamentals,FoundationProgress,FoundationLesson,LearningDatasets)'))
 for width,height,cols in [(360,800,1),(390,844,1),(768,1024,2),(1366,900,3)]:
  c.call('Emulation.setDeviceMetricsOverride',{'width':width,'height':height,'deviceScaleFactor':1,'mobile':width<500})
  nav('data-science.html')
  assert js("document.querySelectorAll('.ds-trail-card').length")==6
  assert js("getComputedStyle(document.querySelector('.ds-trail-grid')).gridTemplateColumns.split(' ').length")==cols
  assert not js('document.documentElement.scrollWidth>innerWidth')
  assert not js("performance.getEntriesByType('resource').some(r=>/micropython|datasets.js/.test(r.name))")
  click('.ds-trail-card--available');wait("typeof FoundationLesson!=='undefined'")
  click('#foundation-topics a');wait("!!document.getElementById('lesson-sale')")
  assert js("document.activeElement.id")=='lesson-title'
  assert not js('document.documentElement.scrollWidth>innerWidth')
  assert js("document.querySelectorAll('#lesson-learning tbody tr').length")==7
  assert '211,43' in js("document.getElementById('lesson-simulation').textContent")
  js("document.getElementById('lesson-sale').value='100';document.getElementById('lesson-sale').dispatchEvent(new Event('input'))")
  assert '97,14' in js("document.getElementById('lesson-simulation').textContent")
  assert js("document.getElementById('foundation-progress').value")==0
  js("document.getElementById('lesson-sale').value='120';document.getElementById('lesson-sale').dispatchEvent(new Event('input'))")
  assert js("document.getElementById('lesson-sales-output').textContent")=='100.0\n100'
  js("document.getElementById('lesson-sale').value='-1';document.getElementById('lesson-sale').dispatchEvent(new Event('input'))")
  assert js("document.getElementById('lesson-sale').getAttribute('aria-invalid')")=='true'
  c.call('Page.reload');wait("!!document.getElementById('lesson-sale')")
  assert js("document.getElementById('lesson-sale').value")=='900'
  js("document.getElementById('lesson-sale').focus()")
  c.call('Input.dispatchKeyEvent',{'type':'keyDown','key':'Tab','code':'Tab','windowsVirtualKeyCode':9});c.call('Input.dispatchKeyEvent',{'type':'keyUp','key':'Tab','code':'Tab','windowsVirtualKeyCode':9})
  assert js("document.activeElement.tagName")=='PRE'
  if width in [360,1366]:
   js("document.getElementById('lesson-title').scrollIntoView({block:'start'})");shot(f'enrichment-{width}-concept')
   js("document.getElementById('lesson-sale').scrollIntoView({block:'center'})");shot(f'enrichment-{width}-experiment')
  click('#lesson-next');assert js("document.getElementById('lesson-title').textContent")=='Mediana'
  assert js("!!document.getElementById('lesson-include-last')")
  click('#lesson-include-last')
  assert '97,50' in js("document.getElementById('lesson-simulation').textContent")
  assert js("document.getElementById('lesson-sale').disabled")
  assert js("document.getElementById('lesson-sales-output').textContent")=='96.67\n97.5'
  assert not js('document.documentElement.scrollWidth>innerWidth')
  if width in [360,1366]:
   js("document.getElementById('lesson-include-last').scrollIntoView({block:'center'})");shot(f'mediana-{width}')
  click('#lesson-next');assert js("document.getElementById('lesson-title').textContent")=='Moda'
  assert not js("!!document.getElementById('lesson-sale')")
  click('#lesson-prev')
  click('#lesson-prev');assert js("!!document.getElementById('lesson-sale')")
  click('#foundation-lesson .ds-course-back');assert js("document.activeElement.closest('#foundation-topics')!==null")
  ok(f'{width}px: {cols} colunas no mapa; aula, teclado, ida/volta, reload, simulação e overflow OK')
 nav('data-science/fundamentos.html#ds-fund-media')
 experiments=js("[...[900,100,0,120,2000].map(v=>FoundationLesson.salesExperiment(v,LearningDatasets[0])),FoundationLesson.salesExperiment(900,LearningDatasets[0],false,true),FoundationLesson.salesExperiment(0,LearningDatasets[0],true,true)]")
 js("localStorage.setItem('unrelated-record','preserve');localStorage.setItem('matematica.python.progress.v1',JSON.stringify({version:1,lastExercise:'ds-fund-media',exercises:{print:{completed:true,draft:'print(42)'},'ds-fund-media':{draft:'print(0)',attempts:2,hintsUsed:1,elapsedTime:12,completed:false}}}))")
 click('#lesson-practice');wait("typeof PythonRunner!=='undefined' && !document.getElementById('py-run').disabled")
 assert js("document.getElementById('py-code').value")=='print(0)'
 click('#py-run');wait("document.getElementById('py-feedback').textContent.includes('não é o esperado')")
 assert not js("JSON.parse(localStorage.getItem('matematica.python.progress.v1')).exercises['ds-fund-media'].completed")
 wait("!document.getElementById('py-run').disabled")
 js("document.getElementById('py-code').value='valores = [5, 10, 15]\\nprint(sum(valores) / len(valores))';document.getElementById('py-code').dispatchEvent(new Event('input'))")
 click('#py-run');wait("document.getElementById('py-feedback').textContent.includes('Muito bem')")
 c.call('Page.reload');wait("typeof PythonRunner!=='undefined' && !document.getElementById('py-run').disabled")
 assert 'sum(valores)' in js("document.getElementById('py-code').value")
 assert js("JSON.parse(localStorage.getItem('matematica.python.progress.v1')).exercises.print.draft")=='print(42)'
 assert js("localStorage.getItem('unrelated-record')")=='preserve'
 ok('Laboratório: rascunho anterior, erro sem conclusão, acerto, reload e dados alheios preservados')
 ok(js(code+'\ntestFundamentals(DataScienceFundamentals,PythonValidator)'))
 ok(js('testFundamentalsRuntime(DataScienceFundamentals,PythonRunner)'))
 for e in experiments:
  result=js('PythonRunner.create().run('+json.dumps(e['code'])+')')
  assert result['status']=='done' and abs(float(result['stdout'].splitlines()[0])-e['mean'])<.006 and float(result['stdout'].splitlines()[1])==e['median'],result
 ok('Sete cenários de Média e Mediana executados no MicroPython: resultados conferem')
 imports=js("(async()=>{const r=PythonRunner.create(),out=[];for(const name of ['numpy','pandas','matplotlib','sklearn']){const result=await r.run('import '+name);out.push({name,error:result.error});}return out;})()")
 assert all('ImportError' in r['error'] for r in imports)
 ok('Ausência de NumPy, pandas, Matplotlib e scikit-learn confirmada no motor atual')
 suite=(ROOT/'tests/frontend/python-learning.test.js').read_text()
 runtime=js(suite+'\ntestPythonRunner()');ok(f'Suíte existente Python: {len(runtime)} verificações OK')
 click('.dev-lab-back');wait("typeof FoundationProgress!=='undefined'")
 assert js("document.getElementById('foundation-progress').value")==1
 nav('data-science.html');assert 'Continuar' in js("document.querySelector('.ds-trail-card--available').textContent")
 assert js("document.querySelector('.ds-trail-card--available').hash")=='#ds-fund-mediana'
 click('.ds-trail-card--available');wait("!!document.getElementById('lesson-title')")
 assert js("document.getElementById('lesson-title').textContent")=='Mediana'
 ok('Retorno ao módulo: 1/18; cartão Continuar retoma Mediana')
 click('#lesson-practice');wait("typeof PythonRunner!=='undefined' && !document.getElementById('py-run').disabled")
 assert js("document.getElementById('py-title').textContent")=='Mediana'
 js("document.getElementById('py-code').value='valores = sorted([9, 1, 5])\\nprint(valores[1])';document.getElementById('py-code').dispatchEvent(new Event('input'))")
 click('#py-run');wait("document.getElementById('py-feedback').textContent.includes('Muito bem')")
 click('.dev-lab-back');wait("typeof FoundationProgress!=='undefined'")
 assert js("document.getElementById('foundation-progress').value")==2
 c.call('Page.reload');wait("document.getElementById('foundation-progress').value===2")
 ok('Mediana: exercício original concluído, retorno e reload mostram 2/18')
 nav('data-science.html')
 tests=(ROOT/'tests/frontend/data-science.test.js').read_text();source=(ROOT/'app/frontend/js/learning-data.js').read_text()
 ok(js(tests+'\n[testDataScience(DataScience),testDataScienceUI(),testLearningData('+json.dumps(source)+')].join("; ")'))
 js("localStorage.setItem('matematica.python.progress.v1','invalid');dispatchEvent(new Event('storage'))")
 assert 'indisponível' in js("document.getElementById('foundation-card-progress').textContent")
 nav('data-science/fundamentos.html');assert 'Não foi possível' in js("document.getElementById('foundation-progress-note').textContent")
 js("localStorage.setItem('matematica.python.progress.v1',JSON.stringify({version:1,exercises:Object.fromEntries(DataScienceFundamentals.map(r=>[r.id,{completed:true}]))}));dispatchEvent(new Event('storage'))")
 assert js("document.getElementById('foundation-progress').value")==18
 nav('data-science.html');assert 'Revisar' in js("document.querySelector('.ds-trail-card--available').textContent")
 nav('python.html');wait("!document.getElementById('py-run').disabled")
 assert js("document.querySelectorAll('#py-trail button').length")==5
 ok('Storage inválido, 18/18, revisão e cinco exercícios originais de Python OK')
 nav('data-science.html')
 js("const other=document.createElement('iframe');other.src='/static/data-science/fundamentos.html';other.id='other-storage';other.hidden=true;document.body.append(other)")
 wait("document.getElementById('other-storage').contentDocument.readyState==='complete'")
 js("document.getElementById('other-storage').contentWindow.localStorage.setItem('matematica.python.progress.v1',JSON.stringify({version:1,exercises:{'ds-fund-media':{completed:true}}}))")
 wait("document.getElementById('foundation-card-progress').textContent==='1 de 18 aulas concluídas'")
 ok('Evento storage real entre duas páginas atualiza o cartão')
 c.call('Page.addScriptToEvaluateOnNewDocument',{'source':"Object.defineProperty(window,'localStorage',{get(){throw new DOMException('blocked','SecurityError')}})"})
 nav('data-science/fundamentos.html#ds-fund-media')
 assert js("document.getElementById('foundation-progress-note').textContent.includes('Não foi possível')")
 assert js("!!document.getElementById('lesson-sale')")
 ok('Storage indisponível no navegador não impede a aula')
 errors=[e for e in c.events if e.get('method')=='Runtime.exceptionThrown'];assert not errors,errors
 ok('Sem exceções JavaScript não tratadas. Erros Python/CSP provocados apenas pela suíte de isolamento.')
finally:
 c.close();server.shutdown();Path('/tmp/equacionei-enrichment-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
