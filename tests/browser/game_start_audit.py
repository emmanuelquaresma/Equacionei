"""Auditoria com entradas CDP reais; não usa element.click() para jogar.
python3 tests/browser/game_start_audit.py --origin http://127.0.0.1:8000 --output /tmp/audit
"""
import argparse,base64,json,time,hashlib
from pathlib import Path
from chrome_driver import Chrome
p=argparse.ArgumentParser();p.add_argument('--origin',action='append',required=True);p.add_argument('--output',required=True);p.add_argument('--quick',action='store_true');p.add_argument('--representative',action='store_true');p.add_argument('--storage-blocked',action='store_true');a=p.parse_args()
out=Path(a.output);out.mkdir(parents=True,exist_ok=True)
c=Chrome();c.call('Network.enable');results=[]
if a.storage_blocked:c.call('Page.addScriptToEvaluateOnNewDocument',{'source':"for(const key of ['localStorage','sessionStorage'])Object.defineProperty(window,key,{get(){throw new DOMException('Blocked for regression','SecurityError')}});"})
def js(s):
 r=c.js(s)['result']
 if 'exceptionDetails' in r:raise AssertionError(r['exceptionDetails'])
 return r['result'].get('value')
def check(s):
 assert js(s),s

def tap(sel):
 q=json.dumps(sel)
 js(f'document.querySelector({q})?.scrollIntoView({{block:"center",inline:"center",behavior:"instant"}})')
 time.sleep(.04)
 r=js(f'''(()=>{{const b=document.querySelector({q});if(!b)return {{error:'missing'}};const r=b.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2,t=document.elementFromPoint(x,y);return {{x,y,disabled:b.disabled,w:r.width,h:r.height,hit:b===t||b.contains(t),top:t?.outerHTML.slice(0,250)}}}})()''')
 assert r.get('w',0)>0 and r.get('h',0)>0 and not r.get('disabled') and r.get('hit'),(sel,r)
 if mobile:
  c.call('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':r['x'],'y':r['y'],'radiusX':1,'radiusY':1}]})
  c.call('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
 else:
  c.call('Input.dispatchMouseEvent',{'type':'mousePressed','x':r['x'],'y':r['y'],'button':'left','clickCount':1})
  c.call('Input.dispatchMouseEvent',{'type':'mouseReleased','x':r['x'],'y':r['y'],'button':'left','clickCount':1})
 time.sleep(.15)

def select(sel,value):
 # CDP keyboard drives the native select, including its change listener.
 values=js(f'[...document.querySelector({json.dumps(sel)}).options].map(o=>o.value)')
 js(f'document.querySelector({json.dumps(sel)}).focus()')
 key('Home')
 for _ in range(values.index(value)):key('ArrowDown')
 key('Tab');time.sleep(.03)
 check(f'document.querySelector({json.dumps(sel)}).value==={json.dumps(value)}')
def key(k):
 code={'Home':36,'ArrowDown':40,'ArrowRight':39,'Tab':9,'Enter':13}.get(k,ord(k.upper()) if len(k)==1 else 0)
 c.call('Input.dispatchKeyEvent',{'type':'keyDown','key':k,'windowsVirtualKeyCode':code})
 c.call('Input.dispatchKeyEvent',{'type':'keyUp','key':k,'windowsVirtualKeyCode':code})
def nav(url):
 c.events=[];c.call('Page.navigate',{'url':url})
 for _ in range(150):
  if js('location.href==='+json.dumps(url)+"&&document.readyState==='complete'"):break
  time.sleep(.04)
 else:raise AssertionError('navigation timeout '+url)
 time.sleep(.07)
 check("document.title.includes('quacionei')")

def errors():
 es=[]
 for e in c.events:
  m=e.get('method');v=e.get('params',{})
  if m=='Runtime.exceptionThrown':es.append(e)
  elif m=='Network.loadingFailed' and not v.get('canceled'):es.append(e)
  elif m=='Network.responseReceived' and v['response']['status']>=400:es.append(e)
  elif m=='Log.entryAdded' and v['entry']['level']=='error':es.append(e)
 return es

def shot(name):
 out.joinpath(name+'.png').write_bytes(base64.b64decode(c.call('Page.captureScreenshot',{'format':'png','captureBeyondViewport':True})['result']['data']))

profiles=[(320,568),(360,640),(375,667),(390,844),(393,852),(412,915),(430,932),(1024,768),(1366,900)]
profiles+= [(h,w) for w,h in profiles[:7]]
if a.quick:profiles=[(390,844),(1366,900)]
cases=[('dama','pvp'),('dama','easy'),('dama','medium'),('dama','hard'),('dama','online-entry'),('xadrez','play'),('xadrez','learn'),('xadrez','practice')]
cases += [('queda-matematica',x) for x in ['easy','medium','hard']]
cases += [('racha-cuca',t+':'+m+':'+l) for t,ms in [('math',['sequence','multiplication','operations','equations']),('texts',['sequence']),('verses',['sequence'])] for m in ms for l in ['easy','medium','hard']]
cases += [('labirinto-matematico','campaign')]
cases += [('jogo-dos-pares',x) for x in ['match','equivalence','operation']]+[('desafio-relampago','standard')]
if a.representative:cases=[('dama','pvp'),('xadrez','play'),('queda-matematica','easy'),('racha-cuca','math:sequence:easy'),('labirinto-matematico','campaign'),('jogo-dos-pares','match'),('desafio-relampago','standard')]
try:
 for origin in a.origin:
  env=origin.rsplit(':',1)[-1] if origin.startswith('http:') else 'public'
  for w,h in profiles:
   mobile=min(w,h)<=430
   c.call('Emulation.setDeviceMetricsOverride',{'width':w,'height':h,'deviceScaleFactor':1,'mobile':mobile})
   c.call('Emulation.setTouchEmulationEnabled',{'enabled':mobile,'maxTouchPoints':5 if mobile else 1})
   for game,mode in [('menu','navigation')]+cases:
    url=origin+('/menu#jogos' if game=='menu' else '/static/'+game+'.html')
    row=dict(game=game,mode=mode,environment=env,url=url,browser='Chrome desktop '+('mobile emulation; CDP touch' if mobile else 'mouse/keyboard'),width=w,height=h,storage_blocked=a.storage_blocked,page=False,starts=False,interaction=False,controls=False,error=None)
    try:
     nav(url);row['page']=True
     if game=='menu':
      check("!document.querySelector('#jogos').hidden")
      tap('#jogos .subject-card.is-active');check("location.pathname.endsWith('/dama.html')");row['starts']=row['interaction']=row['controls']=True
     elif game=='dama':
      if mode=='online-entry':
       tap('#choose-online');check("document.querySelector('#create-room').getClientRects().length>0");tap('#entry-back');check("document.querySelector('#choose-online').getClientRects().length>0")
       row['starts']='entry only; API tested separately';row['interaction']='return only';row['controls']=True
      else:
       tap('#choose-local' if mode=='pvp' else '#choose-computer')
       if mode!='pvp':select('#bot-difficulty',mode)
       check("document.querySelector('#checkers-board').getClientRects().length>0 && document.querySelectorAll('#checkers-board .square').length===64");row['starts']=True
       tap('#checkers-board .square:nth-child(41)');check("document.querySelectorAll('.square--target').length>0")
       black_before=js("[...document.querySelectorAll('#checkers-board .piece--2')].map(p=>p.parentElement.getAttribute('aria-label'))")
       tap('.square--target')
       if mode!='pvp':
        for _ in range(80):
         if js("document.querySelector('#turn-indicator').textContent==='Sua vez'"):break
         time.sleep(.05)
        check("document.querySelector('#turn-indicator').textContent==='Sua vez'")
        check("JSON.stringify([...document.querySelectorAll('#checkers-board .piece--2')].map(p=>p.parentElement.getAttribute('aria-label')))!=="+json.dumps(json.dumps(black_before,ensure_ascii=False,separators=(',',':'))))
       check("document.querySelector('#checkers-board .square:nth-child(41) .piece')===null");row['interaction']=True
       tap('#restart-game');check("document.querySelector('#checkers-board .square:nth-child(41) .piece')!==null")
       tap('#local-back');check("document.querySelector('#choose-local').getClientRects().length>0");row['controls']=True
     elif game=='xadrez':
      if mode=='play':
       check("document.querySelectorAll('#chess-board button').length===64");row['starts']=True
       tap('#chess-board button:nth-child(53)');tap('#chess-board .chess-target');check("document.querySelectorAll('#chess-history li').length===1");row['interaction']=True
       if not mobile:key('ArrowRight');check("document.activeElement.closest('#chess-board')!==null")
       tap('#chess-restart');tap('#chess-restart-confirm');check("document.querySelectorAll('#chess-history li').length===0");row['controls']=True
      elif mode=='learn':
       tap('#chess-mode-learn');check("!document.querySelector('#chess-learn-panel').hidden");row['starts']=True
       old=js("document.querySelector('#chess-demo-progress').textContent");tap('#chess-demo-next');check('document.querySelector("#chess-demo-progress").textContent!=='+json.dumps(old));row['interaction']=True
       tap('#chess-demo-reset');tap('#chess-learn-panel [data-chess-return]');check("!document.querySelector('#chess-play-panel').hidden");row['controls']=True
      else:
       tap('#chess-mode-practice');check("!document.querySelector('#chess-practice-panel').hidden");row['starts']=True
       exercise=js("ChessLessons.lessons.find(l=>l.id===ChessLearning.getSnapshot().session.lessonId).exercises[0]")
       if exercise.get('solution'):
        for move in exercise['solution']:
         for square in [move['from'],move['to']]:tap('#chess-practice-board [aria-label^="Casa '+square+':"]')
       else:tap('#chess-practice-board [aria-label*="rei branco"]')
       check("document.querySelector('#chess-practice-feedback').textContent.includes('Correto') || document.querySelector('#chess-practice-feedback').textContent.includes('Muito bem')");row['interaction']=True
       tap('#chess-practice-retry');tap('#chess-practice-panel [data-chess-return]');row['controls']=True
     elif game=='queda-matematica':
      select('#q-level',mode);tap('#q-start');check("!document.querySelector('#q-play').hidden && document.querySelectorAll('.q-option').length===4");row['starts']=True
      before=js("document.querySelector('#q-errors').textContent+':'+document.querySelector('#q-hits').textContent");tap('.q-option');check('document.querySelector("#q-errors").textContent+":"+document.querySelector("#q-hits").textContent!=='+json.dumps(before));row['interaction']=True
      tap('#q-pause');check("!document.querySelector('#q-overlay').hidden");tap('#q-resume');check("document.querySelector('#q-overlay').hidden")
      tap('#q-restart');check("document.querySelector('#q-hits').textContent==='0' && document.querySelector('#q-errors').textContent==='0'");row['controls']=True
     elif game=='racha-cuca':
      theme,m,l=mode.split(':');tap('[data-rc-theme="'+theme+'"]')
      if theme=='math':select('#rc-mode',m)
      select('#rc-level',l);tap('#rc-setup button[type=submit]');check("!document.querySelector('#rc-play').hidden && document.querySelectorAll('.rc-tile').length>=9");row['starts']=True
      tap('.rc-movable');check("document.querySelector('#rc-moves').textContent==='1'");row['interaction']=True
      tap('#rc-reset');check("document.querySelector('#rc-moves').textContent==='0'");tap('#rc-config');check("!document.querySelector('#rc-themes').hidden");row['controls']=True
     elif game=='labirinto-matematico':
      js("(()=>{const update=MathMazeGame.update;MathMazeGame.update=(state,dt)=>{window.auditMazeState=state;return update(state,dt)}})()");tap('#m-start');check("!document.querySelector('#m-play').hidden");row['starts']=True
      if js("!document.querySelector('#m-dialog').hidden"):tap('#m-continue')
      time.sleep(.05)
      before=js("({row:auditMazeState.player.row,col:auditMazeState.player.col})")
      direction=js("(()=>{const s=auditMazeState,p=s.player;return Object.entries({up:[-1,0],down:[1,0],left:[0,-1],right:[0,1]}).find(([k,[r,c]])=>s.grid[p.row+r]?.[p.col+c]===0)?.[0]})()")
      assert direction,'no available maze direction'
      tap('[data-direction="'+direction+'"]');time.sleep(.25)
      check('auditMazeState.player.row!=='+str(before['row'])+'||auditMazeState.player.col!=='+str(before['col']));row['interaction']=True
      tap('#m-pause');check("!document.querySelector('#m-dialog').hidden");tap('#m-continue');check("document.querySelector('#m-dialog').hidden");row['controls']=True
     elif game=='jogo-dos-pares':
      # IDs of levels come from the page rather than assuming labels are values.
      idx=['match','equivalence','operation'].index(mode);v=js(f'document.querySelector("#pair-level").options[{idx}].value');select('#pair-level',v)
      check("document.querySelectorAll('.pair-card').length===6");row['starts']=True
      tap('.pair-card[data-side="left"]');check("document.querySelector('.pair-card.is-selected')!==null");tap('.pair-card[data-side="right"]');check("document.querySelector('#pair-message').textContent.length>0");row['interaction']=True
      tap('#pair-restart');check("document.querySelector('#pair-count').textContent==='0 de 3 pares'");row['controls']=True
     elif game=='desafio-relampago':
      tap('#game-start');check("!document.querySelector('#game-answer').disabled && document.querySelector('#game-start').hidden");row['starts']=True
      tap('#game-answer');c.call('Input.insertText',{'text':'99999'});tap('#game-form button');check("document.querySelector('#game-errors').textContent==='1'");row['interaction']=True;row['controls']='no pause/restart while active'
     row['overflow']=js('document.documentElement.scrollWidth>innerWidth')
     es=errors();row['events']=es
     if [e for e in es if 'favicon.ico' not in json.dumps(e)]:raise AssertionError('JS/HTTP errors')
    except Exception as e:
     row['error']=str(e);row['events']=errors()
     try:shot(f'{env}-{game}-{mode.replace(":","-")}-{w}x{h}')
     except Exception:pass
    results.append(row)
    out.joinpath('matrix.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))
    if row['error']:print(json.dumps(row,ensure_ascii=False),flush=True)
   print(f'{env} {w}x{h}: {len(results)} cases, {sum(bool(r["error"]) for r in results)} failures',flush=True)
finally:c.close()
failures=[r for r in results if r['error']]
print(json.dumps({'cases':len(results),'failures':len(failures)}),flush=True)
raise SystemExit(1 if failures else 0)
