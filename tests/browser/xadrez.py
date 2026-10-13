"""Regressão local do xadrez: python3 -B tests/browser/xadrez.py."""
import json
import time
from pathlib import Path
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread
from chrome_driver import Chrome

ROOT = Path(__file__).resolve().parents[2]
SIZES = [(320, 568), (360, 640), (390, 844), (430, 932), (768, 1024), (1024, 768), (1366, 900)]


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT / "app/frontend"), **kwargs)

    def do_GET(self):
        if self.path.startswith("/static/"):
            self.path = self.path[7:]
        # Prevent an unrelated favicon 404 from polluting the log.
        if self.path == "/favicon.ico":
            self.send_response(204)
            self.end_headers()
            return
        super().do_GET()

    def log_message(self, *args):
        pass



def test_native_keyboard(chrome, js):
    """CDP emits real key events, rather than synthetic DOM keydown alone."""
    count = 0

    def check(expression, message):
        nonlocal count
        assert js(expression), message
        count += 1

    def key(name, shift=False):
        mapping = {
            "Enter": ("Enter", 13, "\r"), "Space": (" ", 32, " "),
            "Tab": ("Tab", 9, None), "Escape": ("Escape", 27, None),
            "ArrowUp": ("ArrowUp", 38, None), "ArrowRight": ("ArrowRight", 39, None),
        }
        value, code, text = mapping[name]
        params = {"key": value, "code": name, "windowsVirtualKeyCode": code,
                  "modifiers": 8 if shift else 0}
        if text is not None:
            params.update(text=text, unmodifiedText=text)
        chrome.call("Input.dispatchKeyEvent", {"type": "keyDown", **params})
        chrome.call("Input.dispatchKeyEvent", {"type": "keyUp", **params})

    def ax_dialog(name, description):
        nonlocal count
        tree = chrome.call("Accessibility.getFullAXTree")["result"]["nodes"]
        matches = [n for n in tree if not n.get("ignored")
                   and n.get("role", {}).get("value") == "dialog"
                   and n.get("name", {}).get("value") == name]
        assert len(matches) == 1, (name, matches)
        assert description in matches[0].get("description", {}).get("value", ""), matches
        count += 2

    js("restartChessForTest();document.getElementById('chess-board').children[52].focus()")
    key("Enter")
    check("document.querySelector('.chess-selected').getAttribute('aria-label').includes('peão branco')", "Enter seleciona")
    key("ArrowUp")
    check("document.activeElement===document.getElementById('chess-board').children[44]", "seta move foco para e3")
    key("Space")
    check("document.getElementById('chess-turn').textContent==='Pretas' && document.getElementById('chess-history').children.length===1", "Espaço executa jogada")
    js("document.getElementById('chess-restart').focus()")
    key("Enter")
    check("document.getElementById('chess-restart-dialog').open && document.activeElement.id==='chess-restart-cancel'", "Enter abre confirmação segura")
    ax_dialog("Reiniciar esta partida?", "serão apagadas")
    key("Tab", shift=True)
    check("document.activeElement.id==='chess-restart-confirm'", "Shift+Tab envolve confirmação")
    key("Tab")
    check("document.activeElement.id==='chess-restart-cancel'", "Tab envolve confirmação")
    key("Escape")
    check("!document.getElementById('chess-restart-dialog').open && document.activeElement.id==='chess-restart' && document.getElementById('chess-history').children.length===1", "Escape preserva partida e foco")
    key("Enter")
    key("Tab")
    key("Enter")
    check("!document.getElementById('chess-restart-dialog').open && document.activeElement===document.getElementById('chess-board').children[56] && !document.getElementById('chess-history').children.length", "Enter confirma reinício")

    js("""window.__chessKeyboardStart=Chess.restartGame;
        Chess.restartGame=()=>{
            const s=window.__chessKeyboardStart();s.board=Array.from({length:8},()=>Array(8).fill(null));
            s.board[7][4]={type:'k',color:'white'};s.board[0][4]={type:'k',color:'black'};s.board[1][0]={type:'p',color:'white'};
            s.castlingRights={white:{king:false,queen:false},black:{king:false,queen:false}};
            s.positionHistory=[Chess.positionKey(s)];return s;
        };
        restartChessForTest();document.getElementById('chess-board').children[8].focus();
    """)
    try:
        key("Enter")
        key("ArrowUp")
        key("Enter")
        check("document.getElementById('promotion').open && document.activeElement.dataset.promote==='q'", "foco inicial de promoção")
        ax_dialog("Escolha a promoção", "sem executar")
        # Check every option receives focus with native Tab before wrapping.
        for expected in ["r", "b", "n"]:
            key("Tab")
            check("document.activeElement.dataset.promote===" + json.dumps(expected), "Tab para " + expected)
        key("Tab")
        check("document.activeElement.id==='promotion-cancel'", "Tab chega ao cancelamento")
        key("Tab")
        check("document.activeElement.dataset.promote==='q'", "Tab não sai da promoção")
        key("Tab", shift=True)
        check("document.activeElement.id==='promotion-cancel'", "Shift+Tab não sai da promoção")
        key("Escape")
        check("!document.getElementById('promotion').open && document.activeElement===document.getElementById('chess-board').children[8] && !document.getElementById('chess-history').children.length", "Escape retorna ao peão")
        key("Enter")
        key("ArrowUp")
        key("Enter")
        key("Enter")
        check("!document.getElementById('promotion').open && document.activeElement===document.getElementById('chess-board').children[0] && document.activeElement.getAttribute('aria-label').includes('dama branca')", "promoção por Enter e retorno ao destino")
        check("document.getElementById('chess-history').children.length===1", "promoção executada só uma vez")
    finally:
        js("Chess.restartGame=window.__chessKeyboardStart;delete window.__chessKeyboardStart;restartChessForTest()")

    js("""const b=document.getElementById('chess-board');
        for(const [from,to] of [[52,36],[11,27],[36,27]]){b.children[from].click();b.children[to].click();}
    """)
    tree = chrome.call("Accessibility.getFullAXTree")["result"]["nodes"]
    assert any(not n.get("ignored") and n.get("role", {}).get("value") == "list"
               and n.get("name", {}).get("value") == "Capturadas pelas brancas" for n in tree), "Lista acessível de capturas"
    count += 1
    assert any(not n.get("ignored") and n.get("role", {}).get("value") == "StaticText"
               and n.get("name", {}).get("value") == "peão preto" for n in tree), "Nome da peça capturada na árvore acessível"
    count += 1
    js("restartChessForTest()")
    return f"{count} verificações de teclado nativo/árvore acessível passaram."


def test_learning_keyboard(chrome, js):
    count = 0
    def check(expression, message):
        nonlocal count
        assert js(expression), message
        count += 1
    def key(name):
        mapping = {"Enter": ("Enter", 13, "\r"), "Space": (" ", 32, " "),
                   "Tab": ("Tab", 9, None), "ArrowRight": ("ArrowRight", 39, None),
                   "ArrowUp": ("ArrowUp", 38, None), "Escape": ("Escape", 27, None),
                   "Home": ("Home", 36, None), "End": ("End", 35, None)}
        value, code, text = mapping[name]
        params = {"key": value, "code": name, "windowsVirtualKeyCode": code}
        if text is not None: params.update(text=text, unmodifiedText=text)
        for event in ["keyDown", "keyUp"]:
            chrome.call("Input.dispatchKeyEvent", {"type": event, **params})
    js("""(()=>{ChessLearning.setMode('play');restartChessForTest();ChessLearning.loadLesson('rooks');
        const b=document.getElementById('chess-board');
        for(const [a,z] of [[52,36],[8,16],[36,28],[11,27]]){b.children[a].click();b.children[z].click();}
        b.children[28].click();window.__learningMain=JSON.stringify(ChessGame.getSnapshot());
        document.getElementById('chess-mode-play').focus();})();""")
    key("ArrowRight")
    check("document.activeElement.id==='chess-mode-learn' && !document.getElementById('chess-learn-panel').hidden", "seta abre Aprender")
    js("document.getElementById('chess-demo-next').focus()")
    key("Enter")
    check("ChessLearning.getSnapshot().session.demoIndex===1", "Enter avança demonstração")
    js("document.getElementById('chess-demo-previous').focus()")
    key("Space")
    check("ChessLearning.getSnapshot().session.demoIndex===0", "Espaço volta demonstração")
    check("document.activeElement.id==='chess-demo-next'", "foco sai do botão Voltar desabilitado")
    for _ in range(3): key("Enter")
    check("ChessLearning.getSnapshot().session.demoIndex===3 && document.activeElement.id==='chess-demo-previous'", "foco sai do botão Avançar desabilitado")
    js("document.getElementById('chess-mode-learn').focus()")
    key("End")
    check("document.activeElement.id==='chess-mode-practice'", "End abre Praticar")
    key("Tab")
    check("document.activeElement===document.getElementById('chess-practice-board').children[35]", "Tab entra na torre")
    key("Enter")
    check("document.getElementById('chess-practice-board').children[35].getAttribute('aria-pressed')==='true'", "Enter seleciona torre")
    for _ in range(3): key("ArrowRight")
    check("document.activeElement===document.getElementById('chess-practice-board').children[38]", "setas chegam a g4")
    key("Space")
    check("ChessLearning.getSnapshot().session.complete", "Espaço conclui exercício")
    js("document.getElementById('chess-practice-retry').focus()")
    key("Enter")
    check("document.activeElement===document.getElementById('chess-practice-board').children[35] && !ChessLearning.getSnapshot().session.complete", "reinício devolve foco")
    key("Enter"); key("ArrowUp"); key("Space")
    check("document.getElementById('chess-practice-feedback').dataset.kind==='incorrect' && ChessLearning.getSnapshot().session.exerciseState.moveHistory.length===0", "erro legal por teclado preservado")
    key("ArrowRight"); key("Space")
    check("document.getElementById('chess-practice-feedback').dataset.kind==='illegal' && ChessLearning.getSnapshot().session.exerciseState.halfmoveClock===0", "diagonal por teclado recusada")
    key("Escape")
    check("!document.getElementById('chess-practice-board').querySelector('.chess-selected')", "Escape limpa seleção educativa")
    tree = chrome.call("Accessibility.getFullAXTree")["result"]["nodes"]
    active = [n for n in tree if not n.get("ignored")]
    assert any(n.get("role",{}).get("value")=="tab" and n.get("name",{}).get("value")=="Praticar" for n in active)
    count += 1
    assert any(n.get("role",{}).get("value")=="group" and n.get("name",{}).get("value")=="Tabuleiro do exercício" for n in active)
    count += 1
    assert any(n.get("role",{}).get("value")=="button" and "Casa g4:" in n.get("name",{}).get("value","") and "objetivo do exercício" in n.get("name",{}).get("value","") for n in active)
    count += 1
    js("document.getElementById('chess-practice-retry').click();document.getElementById('chess-practice-board').scrollIntoView({block:'center'})")
    chrome.call("Emulation.setTouchEmulationEnabled", {"enabled": True, "maxTouchPoints": 1})
    for index in [35, 38]:
        point = js(f"(()=>{{const r=document.getElementById('chess-practice-board').children[{index}].getBoundingClientRect();return {{x:r.x+r.width/2,y:r.y+r.height/2}};}})()")
        chrome.call("Input.dispatchTouchEvent", {"type": "touchStart", "touchPoints": [{**point, "id": 1}]})
        chrome.call("Input.dispatchTouchEvent", {"type": "touchEnd", "touchPoints": []})
    check("ChessLearning.getSnapshot().session.complete", "toque real conclui exercício")
    check("JSON.stringify(ChessGame.getSnapshot())===window.__learningMain", "interações nativas preservam partida completa")
    js("document.querySelector('#chess-practice-panel [data-chess-return]').focus()")
    key("Enter")
    check("document.activeElement===document.getElementById('chess-board').children[28] && JSON.stringify(ChessGame.getSnapshot())===window.__learningMain", "retorno à partida e foco original")
    return f"{count} verificações educativas de teclado real/toque/árvore acessível passaram."


def test_learning_layout(js, width):
    for mode, board in [("learn","chess-demo-board"), ("practice","chess-practice-board")]:
        js(f"ChessLearning.setMode('{mode}');window.scrollTo(0,0)")
        result = js("""(()=>{
            const b=document.getElementById("""+json.dumps(board)+"""),r=b.getBoundingClientRect();
            const controls=[...document.querySelectorAll('.chess-mode-tabs button,.chess-learning-actions button,.chess-learning-card button,.chess-learning-card select')]
                .filter(e=>e.getClientRects().length).map(e=>({width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height}));
            return {scroll:document.documentElement.scrollWidth,x:r.x,width:r.width,height:r.height,
                panels:['play','learn','practice'].filter(m=>!document.getElementById('chess-'+m+'-panel').hidden).length,
                tabsFit:[...document.querySelectorAll('.chess-mode-tabs button')].every(e=>e.scrollWidth<=e.clientWidth),controls,cells:[...b.children].map(e=>({width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height}))};
        })()""")
        assert result["tabsFit"], ("rótulos das abas",mode,width,result)
        assert result["scroll"] <= width and result["x"] >= 0 and result["x"]+result["width"] <= width+.1, (mode,width,result)
        assert abs(result["width"]-result["height"]) < 1 and result["panels"] == 1, result
        assert all(c["width"]>=44 and c["height"]>=44 for c in result["controls"]), result
        assert all(abs(c["width"]-c["height"])<1 for c in result["cells"]), result
    js("ChessLearning.setMode('play');window.scrollTo(0,0)")
    return "Aprender/Praticar: geometria, alvos de toque e ausência de overflow OK"


def test_course_keyboard(chrome, js):
    count = 0
    def check(expression, message):
        nonlocal count
        assert js(expression), message
        count += 1
    def key(name):
        mapping = {"Enter": ("Enter",13,"\r"),"Space": (" ",32," "),"ArrowRight": ("ArrowRight",39,None),
                   "ArrowUp": ("ArrowUp",38,None),"ArrowLeft": ("ArrowLeft",37,None),
                   "End": ("End",35,None),"Home": ("Home",36,None)}
        value,code,text = mapping[name]
        params = {"key":value,"code":name,"windowsVirtualKeyCode":code}
        if text is not None: params.update(text=text,unmodifiedText=text)
        for event in ["keyDown","keyUp"]: chrome.call("Input.dispatchKeyEvent", {"type":event,**params})
    js("ChessLearning.setMode('play');window.__courseMain=JSON.stringify(ChessGame.getSnapshot());window.__courseFocus=ChessGame.getSnapshot().focusIndex;ChessLearning.loadLesson('pieces');ChessLearning.setMode('practice')")
    js("document.getElementById('chess-exercise-select').value='identify-k';document.getElementById('chess-exercise-select').dispatchEvent(new Event('change'));document.getElementById('chess-practice-retry').focus()")
    key("Enter")
    check("document.activeElement===document.getElementById('chess-practice-board').children[56]", "reinício de identificação foca o tabuleiro")
    for _ in range(4): key("ArrowRight")
    key("Enter")
    check("ChessLearning.getSnapshot().session.complete && ChessLearning.getSnapshot().session.exerciseState.moveHistory.length===0", "identificação por teclado não movimenta")
    check("JSON.stringify(ChessGame.getSnapshot())===window.__courseMain", "identificação preserva partida")
    js("document.getElementById('chess-mode-practice').focus()")
    key("Home");key("ArrowRight")
    js("document.getElementById('chess-lesson-select').focus()")
    key("Home")
    check("ChessLearning.getSnapshot().lessonIndex===0", "Home no catálogo abre primeira lição")
    js("ChessLearning.loadLesson('promotion');ChessLearning.setMode('practice');document.getElementById('chess-exercise-select').value='promote-knight';document.getElementById('chess-exercise-select').dispatchEvent(new Event('change'));document.getElementById('chess-practice-retry').focus()")
    key("Enter");key("Enter")
    check("!document.getElementById('chess-practice-promotion-control').hidden", "seleção do peão mostra promoção")
    js("document.getElementById('chess-practice-promotion').focus()")
    key("End")
    check("document.getElementById('chess-practice-promotion').value==='n'", "End escolhe Cavalo nativamente")
    js("document.getElementById('chess-practice-board').children[6].focus()")
    key("Enter")
    check("ChessLearning.getSnapshot().session.complete && ChessLearning.getSnapshot().session.exerciseState.board[0][6].type==='n'", "subpromoção por teclado")
    check("JSON.stringify(ChessGame.getSnapshot())===window.__courseMain", "promoção preserva partida")
    js("ChessLearning.loadLesson('en-passant');ChessLearning.setMode('practice');document.getElementById('chess-practice-retry').focus()")
    key("Enter");key("Enter");key("ArrowUp");key("ArrowLeft");key("Space")
    check("ChessLearning.getSnapshot().session.complete && !ChessLearning.getSnapshot().session.exerciseState.board[3][3] && ChessLearning.getSnapshot().session.exerciseState.captured.white.length===1", "en passant por teclado")
    js("document.getElementById('chess-practice-next-lesson').focus()")
    key("Enter")
    check("ChessLearning.getSnapshot().lessonIndex===13", "próxima lição por teclado")
    js("ChessLearning.loadLesson('draws');ChessLearning.setMode('practice');document.getElementById('chess-exercise-select').value='recognize-stalemate';document.getElementById('chess-exercise-select').dispatchEvent(new Event('change'));document.getElementById('chess-practice-retry').focus()")
    key("Enter")
    check("document.activeElement.dataset.choice==='playing'", "reinício da classificação foca respostas")
    js("document.getElementById('chess-practice-board').children[56].focus()")
    key("Enter")
    check("!ChessLearning.getSnapshot().session.complete", "tabuleiro de classificação é somente inspeção")
    js("document.querySelector('#chess-practice-choices [data-choice=stalemate]').focus()")
    key("Enter")
    check("ChessLearning.getSnapshot().session.complete && document.activeElement.id==='chess-practice-retry'", "classificação correta e retorno de foco")
    tree=chrome.call("Accessibility.getFullAXTree")["result"]["nodes"]
    active=[n for n in tree if not n.get("ignored")]
    assert any(n.get("role",{}).get("value")=="progressbar" and n.get("name",{}).get("value")=="Exercícios resolvidos" for n in active)
    count += 1
    assert any(n.get("role",{}).get("value")=="group" and n.get("name",{}).get("value")=="Escolha uma resposta" for n in active)
    count += 1
    check("ChessLearning.getSnapshot().progress.solved===30 && !document.getElementById('chess-course-finish').hidden", "revisão mantém conclusão sem duplicar progresso")
    js("ChessLearning.loadLesson('castling');ChessLearning.setMode('learn');document.getElementById('chess-demo-reset').click();for(let i=0;i<4;i++)document.getElementById('chess-demo-next').click()")
    check("document.getElementById('chess-demo-board').children[62].getAttribute('aria-label').includes('destino proibido')", "observação final mantém roque proibido acessível")
    check("JSON.stringify(ChessGame.getSnapshot())===window.__courseMain", "todas as interações nativas preservam partida")
    js("document.querySelector('#chess-learn-panel [data-chess-return]').focus()")
    key("Enter")
    check("document.activeElement===document.getElementById('chess-board').children[window.__courseFocus] && JSON.stringify(ChessGame.getSnapshot())===window.__courseMain", "retorno mantém foco e seleção originais")
    return f"{count} verificações de teclado real e acessibilidade do curso passaram."


def main():
    server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
    Thread(target=server.serve_forever, daemon=True).start()
    chrome = None
    try:
        chrome = Chrome()

        def js(source):
            result = chrome.js(source)["result"]
            assert "exceptionDetails" not in result, result
            return result["result"].get("value")

        source = (ROOT / "tests/frontend/xadrez.test.js").read_text()
        draws = (ROOT / "tests/frontend/xadrez-draws.test.js").read_text()
        rules = (ROOT / "app/frontend/js/xadrez-rules.js").read_text()
        accessibility = (ROOT / "tests/frontend/xadrez-accessibility.test.js").read_text()
        learning_data = (ROOT / 'app/frontend/data/xadrez-lessons.js').read_text()
        learning_controller = (ROOT / 'app/frontend/js/xadrez-learning.js').read_text()
        learning_tests = (ROOT / 'tests/frontend/xadrez-learning.test.js').read_text()
        # No document/window is passed to this function; rules remain independent.
        isolated = js("new Function(" + json.dumps(
            rules + "\n" + source + "\n" + draws
            + "\nreturn [testChess(Chess),testChessDraws(Chess)];"
        ) + ")()")
        print("Motor sem DOM:", json.dumps(isolated, ensure_ascii=False), flush=True)
        learning_model = js("new Function('document'," + json.dumps(rules+"\n"+learning_data+"\n"+learning_controller+"\n"+learning_tests+"\nreturn [testChessLearningModel(ChessLearning,chessStage4Fixture(ChessLessons)),testChessCourseModel(ChessLearning,ChessLessons,Chess)];") + ")({getElementById:()=>null})")
        print(learning_model, flush=True)

        for width, height in SIZES:
            chrome.call("Emulation.setDeviceMetricsOverride", {
                "width": width, "height": height, "deviceScaleFactor": 1,
                "mobile": width < 768,
            })
            chrome.call("Page.navigate", {
                "url": f"http://127.0.0.1:{server.server_port}/static/xadrez.html?viewport={width}"
            })
            for _ in range(100):
                if js(f"location.search==='?viewport={width}' && document.readyState==='complete' && document.getElementById('chess-board')?.children.length===64"):
                    break
                time.sleep(.05)
            else:
                raise AssertionError("Xadrez não inicializou")
            result = js(source + "\n" + draws + "\n" + accessibility
                        + "\nJSON.stringify([testChess(Chess),testChessDraws(Chess),testChessUI(),testChessDrawUI(Chess),testChessAccessibility(Chess)])")
            native_result = test_native_keyboard(chrome, js)
            learning_ui = js(learning_tests + "\ntestChessLearningUI()")
            learning_native = test_learning_keyboard(chrome, js)
            course_ui = js("testChessCourseUI()")
            print(course_ui, test_course_keyboard(chrome, js), flush=True)
            learning_layout = test_learning_layout(js, width)
            print(learning_ui, learning_native, learning_layout, flush=True)
            js("window.scrollTo(0,0)")
            time.sleep(.05)
            geometry = js("""(()=>{
                const b=document.getElementById('chess-board'),r=b.getBoundingClientRect();
                if(document.documentElement.scrollWidth>Number(new URLSearchParams(location.search).get('viewport')))throw Error('Overflow');
                if(r.y<document.querySelector('.site-header').getBoundingClientRect().bottom)throw Error('Tabuleiro sob cabeçalho');
                if(Math.abs(r.width-r.height)>=1)throw Error('Tabuleiro não quadrado');
                const cells=[...b.children].map(e=>e.getBoundingClientRect());
                if(!cells.every(c=>Math.abs(c.width-c.height)<1&&Math.abs(c.width-cells[0].width)<1))
                    throw Error('Casas não são quadradas/iguais');
                return {x:r.x,y:r.y,width:r.width,height:r.height};
            })()""")
            expected = {320:300, 360:340, 390:370, 430:410, 768:410, 1024:588, 1366:700}
            assert abs(geometry["width"]-expected[width]) < 1, geometry
            print(f"{width}x{height}:", result, native_result, "geometria:", json.dumps(geometry), flush=True)

        errors = [e for e in chrome.events if e.get("method") == "Runtime.exceptionThrown"]
        assert not errors, errors
        resource_errors = [
            e for e in chrome.events
            if e.get("method") == "Log.entryAdded"
            and e.get("params", {}).get("entry", {}).get("level") == "error"
        ]
        assert not resource_errors, resource_errors
        print("Chrome: todas as validações passaram, sem erros JavaScript/recursos.", flush=True)
    finally:
        if chrome is not None:
            chrome.close()
        server.shutdown()
        server.server_close()


if __name__ == "__main__":
    main()
