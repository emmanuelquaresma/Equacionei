"""Cria uma sala temporária, inicia, sincroniza jogada e sai com dois clientes reais.
Use --origin e --output; celulares são emulação Chrome com toque CDP.
"""
import sys,json,time,base64,argparse
from pathlib import Path
from chrome_driver import Chrome
p=argparse.ArgumentParser();p.add_argument('--origin',action='append',required=True);p.add_argument('--output',default='/tmp/dama-online-start');args=p.parse_args()
out=Path(args.output);out.mkdir(parents=True,exist_ok=True);rows=[]
def js(c,s):
 r=c.js(s)['result'];assert 'exceptionDetails' not in r,r
 return r['result'].get('value')
def wait(c,s):
 for _ in range(180):
  if js(c,s):return
  time.sleep(.05)
 raise AssertionError(s+'; '+js(c,'document.body.innerText').replace('\n',' ')[:700])
def tap(c,s,mobile):
 q=json.dumps(s);js(c,f'document.querySelector({q}).scrollIntoView({{block:"center",behavior:"instant"}})');time.sleep(.08)
 r=js(c,f'(()=>{{const b=document.querySelector({q}),r=b.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;return {{x,y,hit:b.contains(document.elementFromPoint(x,y)),disabled:b.disabled}}}})()');assert r['hit'] and not r['disabled'],r
 if mobile:
  c.call('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':r['x'],'y':r['y']}]});c.call('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
 else:
  for t in ['mousePressed','mouseReleased']:c.call('Input.dispatchMouseEvent',{'type':t,'x':r['x'],'y':r['y'],'button':'left','clickCount':1})
 time.sleep(.1)
for origin in args.origin:
 for mobile in [True,False]:
  clients=[Chrome(),Chrome()];a,b=clients;row={'game':'dama','mode':'online','origin':origin,'device':'Chrome mobile emulation 390x844, CDP touch' if mobile else 'Chrome desktop 1366x900, mouse','page':False,'starts':False,'interaction':False,'return':False,'error':None}
  try:
   for c in clients:
    c.call('Network.enable');c.call('Emulation.setDeviceMetricsOverride',{'width':390 if mobile else 1366,'height':844 if mobile else 900,'deviceScaleFactor':1,'mobile':mobile});c.call('Emulation.setTouchEmulationEnabled',{'enabled':mobile});c.call('Page.navigate',{'url':origin+'/static/dama.html'});wait(c,"document.readyState==='complete' && !!document.querySelector('#choose-online')");tap(c,'#choose-online',mobile)
   row['page']=True;tap(a,'#create-room',mobile);wait(a,"document.querySelector('#online-code').textContent.length>0")
   code=js(a,"document.querySelector('#online-code').textContent");tap(b,'#room-code',mobile);b.call('Input.insertText',{'text':code});tap(b,'#join-room button[type=submit]',mobile)
   wait(a,"!document.querySelector('#start-online').hidden && !document.querySelector('#start-online').disabled");tap(a,'#start-online',mobile)
   for c in clients:wait(c,"document.querySelector('#online-room-status').textContent.includes('andamento')")
   row['starts']=True
   white=a if 'branca' in js(a,"document.querySelector('#online-color').textContent").lower() else b
   tap(white,'#online-board button:nth-child(41)',mobile);tap(white,'#online-board .square--target',mobile)
   for c in clients:wait(c,"!document.querySelector('#online-board button[aria-label^=\"Linha 6, coluna 1\"] .piece')")
   row['interaction']=True
   for c in clients:tap(c,'#leave-room',mobile);wait(c,"!document.querySelector('#choose-online').closest('[hidden]')")
   row['return']=True
  except Exception as e:
   row['error']=str(e)
   for i,c in enumerate(clients):
    try:out.joinpath('online-'+origin.rsplit(':',1)[-1].replace('/','')+'-'+str(mobile)+'-'+str(i)+'.png').write_bytes(base64.b64decode(c.call('Page.captureScreenshot',{'format':'png','captureBeyondViewport':True})['result']['data']))
    except Exception:pass
  finally:
   row['events']=[[e for e in c.events if e.get('method') in ['Runtime.exceptionThrown','Network.loadingFailed'] or e.get('method')=='Network.responseReceived' and e['params']['response']['status']>=400] for c in clients]
   for c in clients:
    try:
     if js(c,"!!document.querySelector('#leave-room') && !document.querySelector('#online-game').hidden"):tap(c,'#leave-room',mobile)
    except Exception:pass
    c.close()
   rows.append(row);out.joinpath('online-confirmed.json').write_text(json.dumps(rows,indent=2,ensure_ascii=False));print(json.dumps({k:v for k,v in row.items() if k!='events'},ensure_ascii=False),flush=True)

raise SystemExit(1 if any(r['error'] for r in rows) else 0)
