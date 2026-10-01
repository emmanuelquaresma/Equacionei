"""Regressão de layout: python3 tests/browser/games_responsive.py [--baseline]."""
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from threading import Thread
import base64
import json
import sys
import time
from chrome_driver import Chrome
ROOT = Path(__file__).resolve().parents[2]
BASELINE = '--baseline' in sys.argv
SIZES = [(320,568),(360,640),(375,667),(390,844),(393,852),(412,915),(430,932),(431,800),(768,1024),(1024,768),(1366,900),(390,600)]
class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs): super().__init__(*args,directory=str(ROOT/'app/frontend'),**kwargs)
    def do_GET(self):
        if BASELINE and self.path == '/static/js/labirinto-matematico.js' and '--baseline-source' in sys.argv:
            body=Path(sys.argv[sys.argv.index('--baseline-source')+1]).read_bytes()
            self.send_response(200);self.send_header('Content-Type','text/javascript');self.end_headers();self.wfile.write(body);return
        if self.path.startswith('/static/'): self.path=self.path[7:]
        super().do_GET()
    def log_message(self,*args): pass
server=ThreadingHTTPServer(('127.0.0.1',0),Handler)
Thread(target=server.serve_forever,daemon=True).start()
c=Chrome()
def js(source):
    r=c.js(source)['result']
    assert 'exceptionDetails' not in r,r
    return r['result'].get('value')
def wait(source):
    for _ in range(100):
        if js(source): return
        time.sleep(.03)
    raise AssertionError(source)
def click(selector): js('document.querySelector('+json.dumps(selector)+').click()')
results=[]
try:
    for page in ['labirinto-matematico','dama']:
        c.call('Page.navigate',{'url':f'http://127.0.0.1:{server.server_port}/static/{page}.html'})
        wait("document.readyState==='complete'")
        if page.startswith('labirinto'):
            click('#m-start')
            # O tutorial pausa a simulação, permitindo medir uma posição estável.
            board='#m-board'
        else:
            click('#choose-local'); board='#checkers-board'
        for width,height in SIZES:
            c.call('Emulation.setDeviceMetricsOverride',{'width':width,'height':height,'deviceScaleFactor':3 if width<=430 else 1,'mobile':width<=430})
            time.sleep(.12)
            js('window.scrollTo(0,0)')
            time.sleep(.08)
            data=js('''(()=>{
                const rect=s=>{const r=document.querySelector(s).getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,bottom:r.bottom}};
                const b=document.querySelector('''+json.dumps(board)+''');
                return {board:rect('''+json.dumps(board)+'''), header:rect('.site-header'), scroll:document.documentElement.scrollWidth,
                    dpr:devicePixelRatio, bitmap:b.width||null,
                    controls:document.querySelector('.maze-controls')?rect('.maze-controls'):null,
                    dpad:document.querySelector('.maze-dpad')?rect('.maze-dpad'):null,
                    feedback:document.querySelector('#m-feedback')?rect('#m-feedback'):null,
                    legend:document.querySelector('.maze-legend')?rect('.maze-legend'):null,
                    buttons:[...document.querySelectorAll('.maze-controls button')].map(b=>({w:b.getBoundingClientRect().width,h:b.getBoundingClientRect().height})),
                    square:document.querySelector('.square')?rect('.square'):null,
                    piece:document.querySelector('.piece')?rect('.piece'):null};
            })()''')
            data.update(page=page,width=width,height=height)
            b=data['board']
            assert b['y']>=data['header']['bottom'],(page,width,'header overlap',data)
            assert data['scroll']<=width,(page,width,'overflow',data)
            assert abs(b['w']-b['h'])<1,(page,width,'aspect',b)
            assert b['x']>=0 and b['x']+b['w']<=width+.1,(page,width,'clipping')
            if page.startswith('labirinto'):
                assert all(btn['w']>=44 and btn['h']>=44 for btn in data['buttons'])
                assert data['dpad']['y']>=b['bottom'],data
                assert data['feedback']['y']>=data['dpad']['bottom'],data
                assert data['legend']['y']>=data['feedback']['bottom'],data
                if not BASELINE and width<=430:
                    assert b['w']>=width-21,data
                    assert data['bitmap']>=round(b['w']*data['dpr']),data
            else:
                assert data['square']['w']>=32 and data['square']['h']>=32,data
                assert data['piece']['w']<data['square']['w'],data
            results.append(data)
            if width in (375,393,768,1366):
                shot=c.call('Page.captureScreenshot',{'format':'png','captureBeyondViewport':True})['result']['data']
                Path(f'/tmp/{page}-{width}-{"before" if BASELINE else "after"}.png').write_bytes(base64.b64decode(shot))
        if page.startswith('labirinto'):
            source=(ROOT/'tests/frontend/labirinto.test.js').read_text()
            print(js(source+'\nJSON.stringify([testMathMaze(MazeGenerator,MazeMath,MathMazeGame),testMazeServices(MathMazeStorage,MathMazeAudio)])'),flush=True)
    path=Path('/tmp/games-responsive-before.json' if BASELINE else '/tmp/games-responsive-after.json')
    path.write_text(json.dumps(results,indent=2))
    if not BASELINE:
        before=Path('/tmp/games-responsive-before.json')
        if before.exists():
            previous=json.loads(before.read_text())
            for old,new in zip(previous,results):
                if new['width']>430 or new['page']=='dama':
                    for key in ['board','header','controls','dpad','feedback','legend','square','piece']:
                        assert old[key]==new[key],(new['page'],new['width'],key,old[key],new[key])
            print('Geometria anterior preservada em >430px e na Dama em todas as larguras.',flush=True)
    print(json.dumps([{'page':r['page'],'viewport':f"{r['width']}x{r['height']}",'board':r['board']['w'],'bitmap':r['bitmap']} for r in results]),flush=True)
    if not BASELINE:
        injection=c.call('Page.addScriptToEvaluateOnNewDocument',{'source': '''
            localStorage.clear();
            let nextFrame=0, time=performance.now(); const frames=new Map();
            performance.now=()=>time;
            window.requestAnimationFrame=callback=>{frames.set(++nextFrame,callback);return nextFrame};
            window.cancelAnimationFrame=id=>frames.delete(id);
            window.advanceMaze=delta=>{time+=delta;const batch=[...frames.values()];frames.clear();batch.forEach(callback=>callback(time));};
        '''})['result']['identifier']
        c.call('Page.navigate',{'url':f'http://127.0.0.1:{server.server_port}/static/labirinto-matematico.html'})
        wait("document.readyState==='complete'")
        print(js((ROOT/'tests/frontend/labirinto.test.js').read_text()+'\n testMazeUI(advanceMaze)'),flush=True)
        c.call('Page.removeScriptToEvaluateOnNewDocument',{'identifier':injection})
    assert not [e for e in c.events if e.get('method')=='Runtime.exceptionThrown']
finally:
    c.close();server.shutdown()
