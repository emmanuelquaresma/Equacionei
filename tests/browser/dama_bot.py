"""python3 tests/browser/dama_bot.py — Chrome, servidor local e perfil isolado."""
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from threading import Thread
import base64
import json
import time
from chrome_driver import Chrome
ROOT = Path(__file__).resolve().parents[2]
class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs): super().__init__(*args, directory=str(ROOT/'app/frontend'), **kwargs)
    def do_GET(self):
        if self.path.startswith('/static/'): self.path = self.path[7:]
        super().do_GET()
    def log_message(self, *args): pass
server = ThreadingHTTPServer(('127.0.0.1',0), Handler)
Thread(target=server.serve_forever, daemon=True).start()
c = Chrome()
def js(source):
    r = c.js(source)['result']
    assert 'exceptionDetails' not in r, r
    return r['result'].get('value')
def wait(source):
    for _ in range(100):
        if js(source): return
        time.sleep(.05)
    raise AssertionError(source)
def click(selector): js('document.querySelector('+json.dumps(selector)+').click()')
def select(id,value): js(f"document.getElementById('{id}').value={json.dumps(value)};document.getElementById('{id}').dispatchEvent(new Event('change'))")
def square(r,col): click(f'#checkers-board .square:nth-child({r*8+col+1})')
def fixture(player,pieces):
    # Inject only in this test profile, via the existing factory; no production fixture API.
    js('''DamaRules.initialState = () => {
        const state = originalFactory(); state.board = Array.from({length:8},()=>Array(8).fill(null));
        state.currentPlayer = '''+str(player)+''';
        for(const [r,c,p,k=false] of '''+json.dumps(pieces)+''') state.board[r][c]={player:p,king:k};
        return state;
    }''')
    click('#restart-game')
def state(): return js('DamaLocal.getState()')
def shot(name):
    Path('/tmp/'+name+'.png').write_bytes(base64.b64decode(c.call('Page.captureScreenshot',{'format':'png'})['result']['data']))
try:
    c.call('Page.navigate',{'url':f'http://127.0.0.1:{server.server_port}/static/dama.html'})
    wait("typeof DamaLocal !== 'undefined' && document.readyState === 'complete'")
    source = '\n'.join((ROOT/f'app/frontend/js/{name}.js').read_text() for name in ['dama-learning', 'dama-models', 'dama-ai'])+'\n'+(ROOT/'tests/frontend/dama-ai.test.js').read_text()
    result = js(source+'\nrunDamaAITests()')
    print('Regras / IA:',json.dumps(result),flush=True)
    source = (ROOT/'tests/frontend/dama-multiplayer.test.js').read_text()
    multiplayer = (ROOT/'app/frontend/js/dama-multiplayer.js').read_text()
    print(js(source+'\nrunDamaMultiplayerTests('+json.dumps(multiplayer)+')'),flush=True)
    js('window.originalFactory = DamaRules.initialState')
    click('#choose-local'); square(5,0); square(4,1)
    assert state()['currentPlayer'] == 2
    square(2,1); square(3,0)
    assert state()['currentPlayer'] == 1
    print('Dois jogadores locais: ambas as cores movem.',flush=True)
    click('#local-back'); click('#choose-computer')
    for width,height in [(320,640),(390,844),(768,1024),(1366,900),(740,390)]:
        c.call('Emulation.setDeviceMetricsOverride',{'width':width,'height':height,'deviceScaleFactor':1,'mobile':width<800})
        click('#restart-game')
        assert state()['currentPlayer']==1
        assert js("!document.getElementById('difficulty-control').hidden")
        assert not js('document.documentElement.scrollWidth>innerWidth')
        assert js("document.getElementById('checkers-board').getBoundingClientRect().bottom<=innerHeight"), (width,height)
        shot(f'dama-bot-{width}')
        # Real touch on mobile; native click semantics on desktop.
        if width < 800:
            for r,col in [(5,0),(4,1)]:
                point=js(f"(()=>{{const r=document.querySelectorAll('#checkers-board .square')[{r*8+col}].getBoundingClientRect();return {{x:r.x+r.width/2,y:r.y+r.height/2}};}})()")
                c.call('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[point]})
                c.call('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
        else: square(5,0); square(4,1)
        assert state()['currentPlayer']==2
        assert 'pensando' in js("document.getElementById('game-message').textContent")
        assert js("[...document.querySelectorAll('#checkers-board button')].every(b=>b.disabled)")
        before=state(); square(2,1); square(3,0); assert state()==before
        wait('DamaLocal.getState().currentPlayer===1')
        time.sleep(.5); assert state()['currentPlayer']==1
    print('Mobile, toque, bloqueio durante BOT, turno único e tabuleiro visível: OK',flush=True)
    c.call('Emulation.setDeviceMetricsOverride',{'width':390,'height':844,'deviceScaleFactor':1,'mobile':True})
    # Both stronger difficulties execute in a Worker while the main event loop stays responsive.
    js("window.botReports=[];window.RealWorker=Worker;window.Worker=class extends RealWorker{constructor(...args){super(...args);this.addEventListener('message',e=>botReports.push(e.data));}}")
    for level in ['medium','hard']:
        select('bot-difficulty',level); click('#restart-game')
        js("window.framesDuringSearch=0;window.countFrames=true;(function frame(){if(countFrames){framesDuringSearch++;requestAnimationFrame(frame);}})()")
        square(5,0); square(4,1)
        wait('DamaLocal.getState().currentPlayer===1')
        js('window.countFrames=false')
        assert js('framesDuringSearch>3')
        assert any(name in js("document.getElementById('bot-notice').textContent") for name in ['MCTS / UCB1', 'TD + Minimax'])
    print('Workers médio/difícil:',js('botReports'),flush=True)
    c.call('Emulation.setCPUThrottlingRate', {'rate': 4})
    click('#restart-game'); square(5,0); square(4,1)
    wait('DamaLocal.getState().currentPlayer===1')
    assert any(name in js("document.getElementById('bot-notice').textContent") for name in ['MCTS / UCB1', 'TD + Minimax'])
    print('CPU 4x: busca limitada, interface devolve turno:',js('botReports.at(-1)'),flush=True)
    c.call('Emulation.setCPUThrottlingRate', {'rate': 1})
    # Restart and mode changes invalidate a pending result.
    click('#restart-game'); square(5,0); square(4,1)
    assert state()['currentPlayer']==2
    click('#restart-game'); time.sleep(1)
    assert state()['currentPlayer']==1 and len([p for row in state()['board'] for p in row if p])==24
    assert js("document.getElementById('local-mode').value")=='bot' and js("document.getElementById('bot-difficulty').value")=='hard'
    square(5,0); square(4,1); select('local-mode','pvp'); time.sleep(.8)
    assert state()['currentPlayer']==1
    select('local-mode','bot'); square(5,0); square(4,1); click('#local-back')
    before=state(); time.sleep(.8); assert state()==before
    click('#choose-computer'); wait('DamaLocal.getState().currentPlayer===1')
    print('Reinício, mudança de modo e saída durante busca: OK',flush=True)
    select('bot-difficulty','easy')
    fixture(2,[[2,1,2],[3,2,1],[7,0,1]])
    wait('DamaLocal.getState().currentPlayer===1'); assert state()['captures']['2']==1
    fixture(2,[[5,0,2],[6,1,1],[6,3,1]])
    wait('DamaLocal.getState().winner===2')
    assert state()['captures']['2']==2 and state()['board'][5][4]['king']
    assert js("!!document.querySelector('#checkers-board .piece--king')")
    before=state(); time.sleep(.6); square(5,4); assert state()==before
    assert 'computador venceu' in js("document.getElementById('winner-message').textContent")
    fixture(2,[[5,0,2],[6,1,1],[6,3,1]])
    wait('DamaLocal.getState().captures[2]===1')
    js('DamaRules.initialState=originalFactory'); click('#restart-game'); time.sleep(.7)
    assert state()['captures']['2']==0 and state()['currentPlayer']==1 and state()['winner'] is None
    fixture(1,[[5,0,1],[4,1,2]])
    square(5,0); square(3,2)
    assert state()['winner']==1 and 'Você venceu' in js("document.getElementById('winner-message').textContent")
    fixture(2,[[7,0,2],[5,2,1]])
    assert state()['winner']==1
    fixture(2,[[3,2,2,True],[0,1,1]])
    wait('DamaLocal.getState().currentPlayer===1')
    assert sum(1 for row in state()['board'] for p in row if p and p['king'])==1
    # Fallback stays legal if Worker creation fails.
    js("window.Worker=class{constructor(){throw Error('blocked for test')}}")
    fixture(2,[[5,0,2],[6,1,1],[6,3,1]])
    wait('DamaLocal.getState().winner===2')
    assert 'simplificada' in js("document.getElementById('bot-notice').textContent")
    print('Capturas, promoção encadeada, dama, vitórias, bloqueio e fallback: OK',flush=True)
    errors=[event for event in c.events if event.get('method')=='Runtime.exceptionThrown']
    assert not errors, errors
    print('Sem exceções JavaScript não tratadas.',flush=True)
finally:
    c.close(); server.shutdown()
