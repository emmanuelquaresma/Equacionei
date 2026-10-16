"""A003/A004: isolated profiles, native CDP input, bounded Worker regression and geometry.
Use --origin (DEV/TESTE or temporary isolated server) and --output.
"""
import argparse,json,time,base64,traceback
from pathlib import Path
from chrome_driver import Chrome
p=argparse.ArgumentParser();p.add_argument('--origin',required=True);p.add_argument('--output',required=True);a=p.parse_args();assert a.origin in ['http://127.0.0.1:18000','http://127.0.0.1:18001','http://127.0.0.1:8000','http://127.0.0.1:8002'];O=Path(a.output);O.mkdir(parents=True,exist_ok=True);ROOT=Path(__file__).resolve().parents[2];c=Chrome();rows=[];KEY='matematica.python.progress.v1'
def js(s):
 r=c.js(s)['result'];assert 'exceptionDetails' not in r,r;return r['result'].get('value')
def wait(s):
 for _ in range(600):
  if js(s):return
  time.sleep(.05)
 raise AssertionError(s)
def nav(path):
 c.events=[];c.call('Page.navigate',{'url':a.origin+path});wait('location.href==='+json.dumps(a.origin+path)+"&&document.readyState==='complete'")
def tap(sel,mobile):
 q=json.dumps(sel);js(f'document.querySelector({q}).scrollIntoView({{block:"center",inline:"center",behavior:"instant"}})');time.sleep(.04)
 r=js(f'(()=>{{const b=document.querySelector({q}),r=b.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;return {{x,y,hit:b.contains(document.elementFromPoint(x,y)),disabled:!!b.disabled}}}})()');assert r['hit'] and not r['disabled'],(sel,r)
 if mobile:
  c.call('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':r['x'],'y':r['y']}]});c.call('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
 else:
  for t in ['mousePressed','mouseReleased']:c.call('Input.dispatchMouseEvent',{'type':t,'x':r['x'],'y':r['y'],'button':'left','clickCount':1})
def fill(sel,text,mobile):
 tap(sel,mobile);js('document.querySelector('+json.dumps(sel)+').value=""');c.call('Input.insertText',{'text':str(text)})
def record(name,fn):
 row={'case':name,'origin':a.origin,'error':None}
 try:fn(row);assert not [e for e in c.events if e.get('method')=='Runtime.exceptionThrown'],'Unhandled JS exception'
 except Exception as e:
  row['error']=repr(e);row['traceback']=traceback.format_exc();row['diagnostic']=js("({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,inputs:[...document.querySelectorAll('input')].map(e=>({id:e.id,value:e.value})),error:document.querySelector('#calculo-erro')?.textContent,hidden:document.querySelector('#calculo-erro')?.hidden,roots:document.querySelector('#raizes')?.textContent})")
  try:O.joinpath(name+'.png').write_bytes(base64.b64decode(c.call('Page.captureScreenshot',{'format':'png','captureBeyondViewport':True})['result']['data']))
  except Exception:pass
 rows.append(row);O.joinpath('results.json').write_text(json.dumps(rows,indent=2,ensure_ascii=False));print(json.dumps(row,ensure_ascii=False),flush=True)
try:
 nav('/static/python.html');wait("!document.querySelector('#py-run').disabled")
 def memory(row):
  r=js((ROOT/'tests/frontend/python-progress-recovery.test.js').read_text()+';testPythonProgressRecovery()');row['result']=r;assert not r['failures']
 record('progress-structure',memory)
 def numeric(row):
  source=js("fetch('/static/js/app.js').then(r=>r.text())");r=js((ROOT/'tests/frontend/quadratic-bounds.test.js').read_text()+';testQuadraticBounds('+json.dumps(source)+')');row['result']=r;assert r['passed']==r['cases']
 record('bounded-numeric',numeric)
 variants=[None,'null','','{invalid','{}','[]','{"version":1}','{"version":1,"exercises":[]}','{"version":1,"exercises":{"print":null}}','{"version":1,"exercises":{"print":{"attempts":"a","elapsedTime":-1,"completed":"false"}}}','{"version":0,"exercises":{"print":{"draft":"print(42)"}}}']
 for i,raw in enumerate(variants):
  def recovery(row):
   # A new fixture only in this disposable browser profile. No real user's storage is touched.
   seed="localStorage.removeItem("+json.dumps(KEY+'.recovery')+");localStorage.setItem('audit.other','preserve');"+("localStorage.removeItem("+json.dumps(KEY)+');' if raw is None else 'localStorage.setItem('+json.dumps(KEY)+','+json.dumps(raw)+');')
   ident=c.call('Page.addScriptToEvaluateOnNewDocument',{'source':seed})['result']['identifier'];nav('/static/python.html');c.call('Page.removeScriptToEvaluateOnNewDocument',{'identifier':ident});wait("!document.querySelector('#py-run').disabled")
   assert js("document.querySelector('#py-title').textContent.length>0");assert js("localStorage.getItem('audit.other')==='preserve'")
   if i>0:assert 'recuperad' in js("document.querySelector('#py-storage').textContent")
   row['message']=js("document.querySelector('#py-storage').textContent");row['ready']=True
  record('browser-recovery-'+str(i),recovery)
 for width,height in [(320,568),(360,640),(375,667),(390,844),(412,915),(430,932),(768,1024),(1024,768),(1366,900)]:
  mobile=width<=430;c.call('Emulation.setDeviceMetricsOverride',{'width':width,'height':height,'deviceScaleFactor':1,'mobile':mobile});c.call('Emulation.setTouchEmulationEnabled',{'enabled':mobile})
  def python_ui(row):
   nav('/static/python.html');wait("!document.querySelector('#py-run').disabled");fill('#py-code','print("Olá, Matemática para Todos!")',mobile);tap('#py-run',mobile);wait("document.querySelector('#py-feedback').textContent.includes('Muito bem') && !document.querySelector('#py-run').disabled")
   fill('#py-code','print(inexistente)',mobile);tap('#py-run',mobile);wait("!document.querySelector('#py-run').disabled && document.querySelector('#py-error').textContent.includes('NameError')")
   fill('#py-code','print(42) # rascunho preservado',mobile);c.call('Page.reload');wait("document.readyState==='complete' && !document.querySelector('#py-run').disabled");assert 'rascunho preservado' in js("document.querySelector('#py-code').value")
   title=js("document.querySelector('#py-title').textContent");tap('.dev-trail summary',mobile);tap('#py-trail li:nth-child(2) button',mobile);assert title!=js("document.querySelector('#py-title').textContent");tap('#py-trail li:first-child button',mobile);assert 'rascunho preservado' in js("document.querySelector('#py-code').value")
   assert not js('document.documentElement.scrollWidth>innerWidth');row['ready']=row['execution']=row['reload']=True
   if width in [375,1366]:O.joinpath(f'python-{width}.png').write_bytes(base64.b64decode(c.call('Page.captureScreenshot',{'format':'png','captureBeyondViewport':True})['result']['data']))
  record(f'python-{width}x{height}',python_ui)
  def quadratic_ui(row):
   nav('/static/segundo-grau.html');assert '1.0000' in js("document.querySelector('#raizes').textContent")
   for sel,val in [('#a','1'),('#b','0'),('#c','0'),('#xmin','10000000000000000'),('#xmax','10000000000000100')]:fill(sel,val,mobile)
   tap('button[onclick]',mobile);assert js("document.querySelector('#calculo-erro').hidden && graficoAtual.data.labels.length<=101 && document.querySelectorAll('#tabelaValores tr').length<=201")
   previous=js("document.querySelector('#raizes').textContent");fill('#b','',mobile);tap('button[onclick]',mobile);assert js("!document.querySelector('#calculo-erro').hidden");assert previous==js("document.querySelector('#raizes').textContent")
   c.call('Page.reload');wait("document.readyState==='complete' && document.querySelector('#raizes').textContent.includes('1.0000')");assert not js('document.documentElement.scrollWidth>innerWidth');tap('button[onclick]',mobile)
   row['chart']=js("({points:graficoAtual.data.labels.length,rows:document.querySelectorAll('#tabelaValores tr').length,width:document.querySelector('canvas').getBoundingClientRect().width})");assert row['chart']['width']<=width;row['responsive']=True
   if width in [375,1366]:O.joinpath(f'quadratic-{width}.png').write_bytes(base64.b64decode(c.call('Page.captureScreenshot',{'format':'png','captureBeyondViewport':True})['result']['data']))
  record(f'quadratic-{width}x{height}',quadratic_ui)
 # Real Chart.js must remain responsive with scaled discriminants, not only the Worker mock.
 def chart_extremes(row):
  nav('/static/segundo-grau.html');timings=[]
  for scale in ['1e200','1e-200','1e-12','1']:
   js(f"document.querySelector('#a').value={json.dumps(scale)};document.querySelector('#b').value=String(-4*Number({json.dumps(scale)}));document.querySelector('#c').value=String(3*Number({json.dumps(scale)}));")
   ms=js("(()=>{const t=performance.now();calcular();return performance.now()-t})()");timings.append(ms);assert ms<1000;assert js("document.querySelector('#calculo-erro').hidden && document.querySelector('#raizes').textContent.includes('1.0000')")
  row['synchronous_ms']=timings
 record('real-chart-extremes',chart_extremes)
 def keyboard_ui(row):
  nav('/static/python.html');wait("!document.querySelector('#py-run').disabled");fill('#py-code','print("Olá, Matemática para Todos!")',False)
  for kind in ['keyDown','keyUp']:c.call('Input.dispatchKeyEvent',{'type':kind,'key':'Enter','code':'Enter','windowsVirtualKeyCode':13,'modifiers':2})
  wait("document.querySelector('#py-feedback').textContent.includes('Muito bem') && !document.querySelector('#py-run').disabled")
  nav('/static/segundo-grau.html');tap('#xmax',False)
  for kind in ['keyDown','keyUp']:c.call('Input.dispatchKeyEvent',{'type':kind,'key':'Tab','code':'Tab','windowsVirtualKeyCode':9})
  assert js("document.activeElement.matches('button[onclick]')")
  for kind in ['keyDown','keyUp']:c.call('Input.dispatchKeyEvent',{'type':kind,'key':'Enter','code':'Enter','windowsVirtualKeyCode':13})
  assert js("document.querySelector('#calculo-erro').hidden && document.querySelector('#raizes').textContent.includes('1.0000')");row['python_ctrl_enter']=row['quadratic_tab_enter']=True
 record('native-keyboard',keyboard_ui)
finally:c.close()
raise SystemExit(any(r['error'] for r in rows))
