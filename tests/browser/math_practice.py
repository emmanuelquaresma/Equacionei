"""Run: python3 tests/browser/math_practice.py (Chrome/Chromium required)."""
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from threading import Thread
import base64
import json
import time
from chrome_driver import Chrome

ROOT = Path(__file__).resolve().parents[2]

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT / 'app/frontend'), **kwargs)

    def do_GET(self):
        if self.path.startswith('/static/'):
            self.path = self.path[7:]
        if self.path.split('?')[0] == '/menu':
            self.path = '/pages/menu.html'
        super().do_GET()

    def log_message(self, *args):
        pass

server = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
Thread(target=server.serve_forever, daemon=True).start()
browser = Chrome()

def js(source):
    result = browser.js(source)['result']
    assert 'exceptionDetails' not in result, result
    return result['result'].get('value')

def wait(source):
    for _ in range(150):
        if js(source):
            return
        time.sleep(.1)
    raise AssertionError(source)

def nav(path):
    url = f'http://127.0.0.1:{server.server_port}{path}'
    browser.call('Page.navigate', {'url': url})
    wait('location.href === ' + json.dumps(url) + " && document.readyState === 'complete'")

def click(selector):
    js('document.querySelector(' + json.dumps(selector) + ').click()')

def fill(value):
    js("document.getElementById('answer').value=" + json.dumps(value) + ";document.getElementById('answer').dispatchEvent(new Event('input',{bubbles:true}))")

def text(id):
    return js('document.getElementById(' + json.dumps(id) + ').textContent')

def key(value, code):
    for event in ['keyDown', 'keyUp']:
        params = {'type': event, 'key': value, 'code': value, 'windowsVirtualKeyCode': code}
        if value == 'Enter' and event == 'keyDown':
            params['text'] = '\r'
        browser.call('Input.dispatchKeyEvent', params)

def shot(width):
    result = browser.call('Page.captureScreenshot', {'format': 'png'})
    Path(f'/tmp/math-practice-{width}.png').write_bytes(base64.b64decode(result['result']['data']))

try:
    # Handwritten expected responses, independent of the catalog's answer keys.
    answers = {
        'fracoes': [' 2 / 3 ', '5/6', 'x = 24'],
        'multiplicacao-divisao': ['56', '−24', '7'],
        'potenciacao': ['16', 2, 3],
        'expressoes-algebricas': [2, 1, 3],
    }
    for width, height in [(320, 740), (390, 844), (768, 1024), (1366, 900)]:
        browser.call('Emulation.setDeviceMetricsOverride', {'width': width, 'height': height, 'deviceScaleFactor': 1, 'mobile': width < 500})
        nav('/menu#atividades')
        assert js("document.querySelectorAll('#math-track .subject-card').length") == 6
        assert js("document.querySelectorAll('#math-track .carousel-dot').length") == 0
        assert js("document.querySelectorAll('#atividades .carousel-dot').length") == 6
        assert js("document.querySelectorAll('#activity-track .subject-card').length") == 7
        assert not js('document.documentElement.scrollWidth > innerWidth')
        # Keyboard navigation reaches the original cards as well as new ones.
        js("document.getElementById('math-track').focus()")
        key('End', 35)
        assert js("document.activeElement.getAttribute('href')") == '/static/segundo-grau.html'
        assert js("document.getElementById('math-track').clientHeight >= document.activeElement.offsetHeight + 60")
        key('Home', 36)
        assert 'assunto=fracoes' in js('document.activeElement.href')
        js("location.hash='jogos'")
        wait("document.getElementById('atividades').hidden && !document.getElementById('jogos').hidden")
        js("location.hash='atividades'")
        wait("!document.getElementById('atividades').hidden")
        js('window.scrollTo(0, 0)')
        time.sleep(.4)
        assert js("document.querySelector('#math-track').clientHeight < 450")
        assert js("document.querySelector('#math-track .subject-card__link').getBoundingClientRect().bottom < innerHeight")
        capture = browser.call('Page.captureScreenshot', {'format': 'png'})
        Path(f'/tmp/math-menu-{width}.png').write_bytes(base64.b64decode(capture['result']['data']))
        click('#math-track a')
        wait("!!document.getElementById('answer') && !document.getElementById('practice').hidden")
        assert js("document.querySelector('.site-nav [aria-current]').dataset.area") == 'activities'
        assert js("document.getElementById('answer').getBoundingClientRect().bottom < innerHeight")
        shot(width)
        if width < 1200:
            click('.site-toggle')
            assert js("document.querySelector('.site-toggle').getAttribute('aria-expanded')") == 'true'
            js("document.querySelector('.site-toggle').focus()")
            key('Escape', 27)
            assert js("document.querySelector('.site-toggle').getAttribute('aria-expanded')") == 'false'
        for subject, responses in answers.items():
            nav('/static/fundamentos-matematicos.html?assunto=' + subject)
            for i, answer in enumerate(responses):
                assert f'Exercício {i+1} de 3' in text('exercise-position')
                click('#answer-form button')
                assert 'Responda antes' in text('feedback')
                if isinstance(answer, int):
                    click(f'#choice-options input[value="{(answer+1)%4}"]')
                else:
                    fill('12/18' if subject == 'fracoes' and i == 0 else '999')
                click('#answer-form button')
                assert 'Ainda não' in text('feedback')
                click('#hint-toggle')
                assert js("!document.getElementById('hint').hidden")
                click('#solution-toggle')
                assert js("document.querySelectorAll('#solution-steps li').length >= 3")
                assert js("!document.getElementById('solution').hidden")
                if subject == 'potenciacao' and i == 2:
                    assert '(−7)²' in text('solution') and 'duas soluções' in text('solution')
                assert not js('document.documentElement.scrollWidth > innerWidth')
                if isinstance(answer, int):
                    click(f'#choice-options input[value="{answer}"]')
                    click('#answer-form button')
                else:
                    fill(answer)
                    js("document.getElementById('answer').focus()")
                    key('Enter', 13)
                assert 'Correto!' in text('feedback'), (subject, i, answer, text('feedback'))
                click('#next')
            assert '3 de 3' in text('summary-text')
            click('#restart')
            assert 'Correto!' in text('feedback'), (subject, i, answer, text('feedback'))
            click('#next')
            click('#previous')
            assert 'Exercício 1 de 3' in text('exercise-position')
            assert js('document.activeElement.id') == 'exercise-title'
        print(f'{width}px: 12 exercícios, feedback, resoluções, navegação, menu e overflow OK', flush=True)
    # Editing a verified answer removes its correctness; skipping does not mark completion.
    nav('/static/fundamentos-matematicos.html?assunto=fracoes')
    fill('2/3')
    click('#answer-form button')
    fill('1/3')
    for _ in range(3):
        click('#next')
    assert '0 de 3' in text('summary-text')
    nav('/static/fundamentos-matematicos.html?assunto=inexistente')
    assert js("!document.getElementById('subject-error').hidden && document.getElementById('practice').hidden")
    nav('/static/fundamentos-matematicos.html')
    assert js("!document.getElementById('subject-error').hidden")
    exceptions = [event for event in browser.events if event.get('method') == 'Runtime.exceptionThrown']
    assert not exceptions, exceptions
    print('Novas páginas: nenhum erro JavaScript não tratado.', flush=True)
    nav('/static/desafio-relampago.html')
    test = (ROOT / 'tests/frontend/menu-game.test.js').read_text()
    source = (ROOT / 'app/frontend/js/menu-game.js').read_text()
    print(js(test + '\nrunMenuGameTests(' + json.dumps(source) + ')'), flush=True)
    nav('/static/jogo-dos-pares.html')
    test = (ROOT / 'tests/frontend/jogo-dos-pares.test.js').read_text()
    print('Jogo dos Pares: ' + str(js(test + '\ntestPairGame()')), flush=True)
    # Existing function pages are not changed. Record their actual local behavior.
    nav('/static/primeiro-grau.html')
    print('1º grau: calcularFuncao = ' + js('typeof calcularFuncao') + ' (arquivo ausente antes desta entrega).', flush=True)
    nav('/static/segundo-grau.html')
    assert '1.0000' in text('raizes') and '3.0000' in text('raizes')
    if js('typeof Chart') != 'undefined':
        assert js("document.querySelectorAll('#tabelaValores tr').length") == 21
        js("document.getElementById('b').value='0';document.getElementById('c').value='-4';calcular()")
        assert '2.0000' in text('raizes') and '-2.0000' in text('raizes')
        print('2º grau: cálculo, gráfico e tabela existentes OK.', flush=True)
    else:
        print('2º grau: resultados calculados; Chart.js externo indisponível neste ambiente.', flush=True)
finally:
    browser.close()
    server.shutdown()
