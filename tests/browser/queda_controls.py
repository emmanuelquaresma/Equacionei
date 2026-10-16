"""Reproduz controles encobertos após iniciar Queda em telas baixas.
python3 tests/browser/queda_controls.py --origin http://127.0.0.1:8000 --output /tmp/queda
Também testa com servidor local do workspace quando --origin é omitido.
"""
import argparse,base64,json,time
from pathlib import Path
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from threading import Thread
from chrome_driver import Chrome
p=argparse.ArgumentParser();p.add_argument('--origin');p.add_argument('--output',default='/tmp/queda-controls');a=p.parse_args();out=Path(a.output);out.mkdir(parents=True,exist_ok=True)
server=None
if not a.origin:
 class Handler(SimpleHTTPRequestHandler):
  def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(Path(__file__).resolve().parents[2]/'app/frontend'),**kwargs)
  def do_GET(self):
   if self.path.startswith('/static/'):self.path=self.path[7:]
   super().do_GET()
  def log_message(self,*args):pass
 server=ThreadingHTTPServer(('127.0.0.1',0),Handler);Thread(target=server.serve_forever,daemon=True).start();a.origin=f'http://127.0.0.1:{server.server_port}'
c=Chrome();rows=[];failures=[]
def js(s):
 r=c.js(s)['result'];assert 'exceptionDetails' not in r,r
 return r['result'].get('value')
def tap(s,mobile):
 q=json.dumps(s);js(f'document.querySelector({q}).scrollIntoView({{block:"center",behavior:"instant"}})');time.sleep(.04)
 r=js(f'(()=>{{const b=document.querySelector({q}),r=b.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2,t=document.elementFromPoint(x,y);return {{x,y,hit:b.contains(t),obstruction:t?.outerHTML.slice(0,250),disabled:b.disabled}}}})()')
 assert r['hit'] and not r['disabled'],(s,r)
 if mobile:
  c.call('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':r['x'],'y':r['y']}]});c.call('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
 else:
  for t in ['mousePressed','mouseReleased']:c.call('Input.dispatchMouseEvent',{'type':t,'x':r['x'],'y':r['y'],'button':'left','clickCount':1})
 time.sleep(.05)
try:
 for w,h in [(568,320),(640,360),(667,375),(844,390),(852,393),(915,412),(932,430),(320,568),(360,640),(375,667),(390,844),(393,852),(412,915),(430,932),(1024,768),(1366,900)]:
  mobile=min(w,h)<=430;row={'url':a.origin+'/static/queda-matematica.html','width':w,'height':h,'mobile_emulation':mobile,'error':None}
  try:
   c.call('Emulation.setDeviceMetricsOverride',{'width':w,'height':h,'deviceScaleFactor':1,'mobile':mobile});c.call('Emulation.setTouchEmulationEnabled',{'enabled':mobile});c.call('Page.navigate',{'url':row['url']})
   for _ in range(150):
    if js("document.readyState==='complete' && !!document.querySelector('#q-start')"):break
    time.sleep(.04)
   tap('#q-start',mobile)
   assert js("!document.querySelector('#q-play').hidden && document.querySelectorAll('.q-option').length===4")
   # A geometria prova a causa; hit testing e toque provam a consequência funcional.
   row['geometry']=js("(()=>{const r=s=>{const b=document.querySelector(s).getBoundingClientRect();return {top:b.top,bottom:b.bottom,height:b.height}};return {panel:r('#q-play'),actions:r('.q-actions'),following:r('#q-play + p')}})()")
   assert row['geometry']['following']['top']>=row['geometry']['actions']['bottom'],row['geometry']
   tap('#q-pause',mobile);assert js("!document.querySelector('#q-overlay').hidden")
   tap('#q-resume',mobile);assert js("document.querySelector('#q-overlay').hidden")
   tap('#q-restart',mobile);assert js("document.querySelector('#q-errors').textContent==='0'")
   if w in [640,390,1366]:out.joinpath(f'queda-{w}x{h}.png').write_bytes(base64.b64decode(c.call('Page.captureScreenshot',{'format':'png','captureBeyondViewport':True})['result']['data']))
   if mobile:
    c.call('Emulation.setDeviceMetricsOverride',{'width':h,'height':w,'deviceScaleFactor':1,'mobile':True});time.sleep(.1)
    tap('#q-pause',True);assert js("!document.querySelector('#q-overlay').hidden");tap('#q-resume',True)
  except Exception as e:
   row['error']=str(e);failures.append(row)
   out.joinpath(f'queda-{w}x{h}-failure.png').write_bytes(base64.b64decode(c.call('Page.captureScreenshot',{'format':'png','captureBeyondViewport':True})['result']['data']))
  rows.append(row)
 out.joinpath('results.json').write_text(json.dumps(rows,indent=2,ensure_ascii=False))
 print(json.dumps({'cases':len(rows),'failures':failures},ensure_ascii=False),flush=True)
 assert not failures,f'{len(failures)} controles encobertos'
finally:
 c.close()
 if server:server.shutdown();server.server_close()
