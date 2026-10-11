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
        # No document/window is passed to this function; rules remain independent.
        isolated = js("new Function(" + json.dumps(
            rules + "\n" + source + "\n" + draws
            + "\nreturn [testChess(Chess),testChessDraws(Chess)];"
        ) + ")()")
        print("Motor sem DOM:", json.dumps(isolated, ensure_ascii=False), flush=True)

        for width, height in SIZES:
            chrome.call("Emulation.setDeviceMetricsOverride", {
                "width": width, "height": height, "deviceScaleFactor": 1,
                "mobile": width < 768,
            })
            chrome.call("Page.navigate", {
                "url": f"http://127.0.0.1:{server.server_port}/static/xadrez.html?viewport={width}"
            })
            for _ in range(100):
                if js(f"location.search==='?viewport={width}' && document.readyState==='complete' && document.querySelectorAll('.chess-square').length===64"):
                    break
                time.sleep(.05)
            else:
                raise AssertionError("Xadrez não inicializou")
            result = js(source + "\n" + draws + "\n" + accessibility
                        + "\nJSON.stringify([testChess(Chess),testChessDraws(Chess),testChessUI(),testChessDrawUI(Chess),testChessAccessibility(Chess)])")
            native_result = test_native_keyboard(chrome, js)
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
