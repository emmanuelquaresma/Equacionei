""".venv/bin/python tests/browser/xgboost_lab.py — API real + Chrome isolado."""
from pathlib import Path
import base64
import json
import os
import socket
import subprocess
import sys
import time
import urllib.request
from chrome_driver import Chrome
ROOT=Path(__file__).resolve().parents[2]
with socket.socket() as sock:
    sock.bind(('127.0.0.1',0)); port=sock.getsockname()[1]
log=open('/tmp/equacionei-xgboost-test.log','w')
server=subprocess.Popen([sys.executable,'-m','uvicorn','main:app','--host','127.0.0.1','--port',str(port)],
                        cwd=ROOT/'app/backend/src',stdout=log,stderr=log,env={**os.environ,'ML_MAX_ENTRIES':'24'})
c=None
origin=f'http://127.0.0.1:{port}'
try:
    for _ in range(150):
        try:
            urllib.request.urlopen(origin+'/health',timeout=1).close();break
        except OSError: time.sleep(.1)
    else: raise RuntimeError(Path(log.name).read_text())
    c=Chrome()
    def js(source):
        r=c.js(source)['result']
        assert 'exceptionDetails' not in r,r
        return r['result'].get('value')
    def wait(source):
        for _ in range(300):
            if js(source): return
            time.sleep(.05)
        raise AssertionError((source,js("document.getElementById('ml-error')?.textContent")))
    def click(selector): js('document.querySelector('+json.dumps(selector)+').click()')
    def choose(id,value): js(f"document.getElementById({json.dumps(id)}).value={json.dumps(value)};document.getElementById({json.dumps(id)}).dispatchEvent(new Event('change',{{bubbles:true}}))")
    def train():
        click('#train');wait("!document.getElementById('results').hidden && !document.getElementById('training-controls').disabled")
        assert not js("document.getElementById('ml-error').textContent")
    def predict():
        click('#predict');wait("document.getElementById('prediction-result').textContent.includes('Previsão:') && !document.getElementById('prediction-controls').disabled")
    def widths(tag):
        for width in [320,360,375,390,393,412,430,768,1024,1366]:
            c.call('Emulation.setDeviceMetricsOverride',{'width':width,'height':844 if width<768 else 1024,'deviceScaleFactor':3 if width<768 else 1,'mobile':width<768})
            time.sleep(.15)
            assert js('document.documentElement.scrollWidth<=innerWidth'),(tag,width)
            assert js("[...document.querySelectorAll('.ml-metric strong')].every(e=>e.scrollWidth<=e.clientWidth+1)"),(tag,width,'metric overflow')
            assert js("[...document.querySelectorAll('#train,#predict')].every(b=>b.getBoundingClientRect().height>=44)"),(tag,width)
            if width in [375,768,1366]:
                js("document.getElementById('results').scrollIntoView()")
                raw=c.call('Page.captureScreenshot',{'format':'png'})['result']['data']
                Path(f'/tmp/xgboost-{tag}-{width}.png').write_bytes(base64.b64decode(raw))
                js("document.getElementById('evaluation-title').scrollIntoView({block:'start'})")
                raw=c.call('Page.captureScreenshot',{'format':'png'})['result']['data']
                Path(f'/tmp/xgboost-{tag}-chart-{width}.png').write_bytes(base64.b64decode(raw))
    c.call('Page.navigate',{'url':origin+'/static/data-science.html'})
    wait("document.readyState==='complete'")
    assert js("document.querySelectorAll('a[href=\"/static/data-science/machine-learning/xgboost.html\"]').length===2")
    titles=js("[...document.querySelectorAll('.ds-stage-grid > .ds-trail-card .ds-trail-card__title')].map(n=>n.textContent)")
    assert titles==['Fundamentos','Análise de Dados','Preparação de Dados','Machine Learning','Avaliação de Modelos','Comunicação e Negócio','Produção e Deploy','Projeto completo'],titles
    assert js("document.querySelectorAll('.ds-stage-map a').length===8 && [...document.querySelectorAll('.ds-stage-map a')].every(a=>document.querySelector(a.getAttribute('href')))")
    assert js("document.querySelectorAll('.ds-lab-carousel .subject-card').length===3")
    assert js("document.querySelectorAll('.ds-lab-carousel a[href=\"/static/data-science/machine-learning/xgboost.html\"]').length===1")
    assert js("document.querySelectorAll('#data-track > a').length===3")
    assert js("[...document.querySelectorAll('#data-track > a')].map(a=>a.getAttribute('href')).join(',')==='#dados,#laboratorio,#ia'")
    assert js("document.getElementById('my-dataset').hidden")
    assert js("[...document.querySelectorAll('#data-track > a')].map(a=>a.getAttribute('href')).join(',')==='#dados,#laboratorio,#ia'")
    assert urllib.request.urlopen(origin+'/static/data-science/fundamentos.html').status==200
    # Progresso de uma sessão anterior é lido pela chave original e nunca regravado/migrado.
    js("localStorage.setItem('matematica.python.progress.v1',JSON.stringify({version:1,lastExercise:'ds-fund-mediana',exercises:{'ds-fund-media':{completed:true,attempts:1}}}))")
    original_progress=js("localStorage.getItem('matematica.python.progress.v1')")
    js('DataScienceHubProgress.refresh()')
    assert js("document.getElementById('continue-title').textContent==='Continue de onde parou'")
    assert js("document.getElementById('hub-progress').value===1 && document.getElementById('hub-progress-label').textContent==='5% · 1 de 18 aulas'")
    assert js("document.getElementById('continue-link').getAttribute('href').endsWith('#ds-fund-mediana')")
    assert js("document.getElementById('foundation-card-progress').textContent==='1 de 18 aulas concluídas'")
    assert js("localStorage.getItem('matematica.python.progress.v1')") == original_progress
    for target in ['dados','laboratorio','ia']:
        click('#data-track > a[href="#'+target+'"]')
        wait("!document.getElementById("+json.dumps(target)+").hidden")
        click('#'+target+' .ds-back');wait("!document.getElementById('inicio').hidden")
    for i in range(7):
        js(f"document.querySelectorAll('.ds-stage-grid details summary')[{i}].click()")
        assert js(f"document.querySelectorAll('.ds-stage-grid details')[{i}].open")
        js(f"document.querySelectorAll('.ds-stage-grid details summary')[{i}].click()")
    for width in [320,360,375,390,393,412,430,768,1024,1366]:
        c.call('Emulation.setDeviceMetricsOverride',{'width':width,'height':844 if width<768 else 1024,'deviceScaleFactor':3 if width<768 else 1,'mobile':width<768})
        time.sleep(.1)
        layout=js("""(()=>{const grid=document.querySelector('.ds-trail-grid'),cards=[...grid.children],card=cards.at(-1),surface=card.matches('details')?card.querySelector('summary'):card,first=cards[0],r=card.getBoundingClientRect(),style=getComputedStyle(card),firstStyle=getComputedStyle(first),surfaceStyle=getComputedStyle(surface);return {cols:getComputedStyle(grid).gridTemplateColumns.split(' ').length,w:r.width,firstWidth:first.getBoundingClientRect().width,x:r.x,h:r.height,overflow:document.documentElement.scrollWidth>innerWidth,title:parseFloat(getComputedStyle(card.querySelector('.ds-trail-card__title')).fontSize),description:parseFloat(getComputedStyle(card.querySelector('.ds-trail-card__description')).fontSize),same:['borderRadius','boxShadow'].every(k=>style[k]===firstStyle[k])&&parseFloat(surfaceStyle.paddingTop)>0,icon:!!card.querySelector('.ds-trail-card__icon')};})()""")
        assert not layout['overflow'] and layout['same'] and layout['icon'],(width,layout)
        assert layout['cols']==(4 if width>=1000 else 2 if width>=600 else 1),(width,layout)
        assert abs(layout['w']-layout['firstWidth'])<1 and layout['x']>=0 and layout['x']+layout['w']<=width,(width,layout)
        stage_count=js("document.querySelectorAll('.ds-stage-grid > .ds-trail-card').length")
        assert stage_count==8,(width,stage_count)
        if width < 600:
            peek=js("(()=>{const r=document.querySelector('.ds-lab-carousel .carousel-track').getBoundingClientRect(),n=document.querySelectorAll('.ds-lab-carousel .subject-card')[1].getBoundingClientRect();return {inside:n.left<r.right&&n.right>r.right,clipped:document.documentElement.scrollWidth<=innerWidth}})()")
            assert peek['inside'] and peek['clipped'],(width,peek)
        assert layout['h']>=44 and layout['title']>=15 and layout['description']>=13,(width,layout)
        if width in [375,768,1366]:
            js("document.querySelector('.ds-stage-grid').lastElementChild.scrollIntoView({block:'center'})")
            raw=c.call('Page.captureScreenshot',{'format':'png'})['result']['data']
            Path(f'/tmp/xgboost-card-{width}.png').write_bytes(base64.b64decode(raw))
    print('Hub, progresso anterior, 8 etapas, experiências, card XGBoost, carrossel e breakpoints responsivos: OK',flush=True)
    # As experiências existentes continuam operacionais.
    old_tests=(ROOT/'tests/frontend/data-science.test.js').read_text()
    print(js(old_tests+'\ntestDataScience(DataScience)'),flush=True)
    js("document.querySelector('.ds-lab-carousel > .carousel-track > a[href=\"/static/data-science/machine-learning/xgboost.html\"]').scrollIntoView({block:'center'})")
    point=js("(()=>{const r=document.querySelector('.ds-lab-carousel > .carousel-track > a[href=\"/static/data-science/machine-learning/xgboost.html\"]').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()")
    c.call('Input.dispatchMouseEvent',{'type':'mousePressed','button':'left','clickCount':1,**point})
    c.call('Input.dispatchMouseEvent',{'type':'mouseReleased','button':'left','clickCount':1,**point})
    wait("document.getElementById('load-demo') && !document.getElementById('load-demo').disabled")
    c.call('Emulation.setDeviceMetricsOverride',{'width':375,'height':667,'deviceScaleFactor':3,'mobile':True})
    click('#load-demo');wait("!document.getElementById('train-form').hidden")
    assert js("[...document.querySelectorAll('#features input')].find(i=>i.value==='target').disabled")
    assert not js("[...document.querySelectorAll('#features input:checked')].some(i=>i.value==='target')")
    train();predict();widths('classification')
    assert js("document.querySelectorAll('#evaluation-chart tbody tr').length===3")
    assert js("document.querySelectorAll('#importance .ds-bar-row').length===4")
    # Alterar a configuração invalida o modelo exibido e exige novo treino.
    js("document.getElementById('max_depth').value=3;document.getElementById('max_depth').dispatchEvent(new Event('input',{bubbles:true}))")
    assert js("document.getElementById('prediction').hidden && document.getElementById('results').hidden")
    choose('demo','diabetes');click('#load-demo')
    wait("document.getElementById('dataset-title').textContent==='Diabetes' && !document.getElementById('dataset-controls').disabled")
    assert js("document.getElementById('model-type').value==='regression'")
    train();predict();widths('regression')
    assert js("!!document.querySelector('#evaluation-chart svg circle')")
    assert js("document.querySelectorAll('#metrics .ml-metric').length===4")
    # Upload real, campos categóricos e nulos.
    upload=Path('/tmp/xgboost-browser.csv')
    upload.write_text('idade,grupo,target\n'+'\n'.join(f'{20+i},{"A" if i%3 else ""},{"sim" if i%2 else "não"}' for i in range(40)))
    doc=c.call('DOM.getDocument')['result']['root']['nodeId']
    node=c.call('DOM.querySelector',{'nodeId':doc,'selector':'#csv'})['result']['nodeId']
    c.call('DOM.setFileInputFiles',{'nodeId':node,'files':[str(upload)]})
    wait("!document.getElementById('upload').disabled")
    click('#upload');wait("document.getElementById('dataset-title').textContent==='CSV enviado' && !document.getElementById('dataset-controls').disabled")
    train();predict()
    assert js("!!document.querySelector('#prediction-fields input[list]')")
    assert not js('document.documentElement.scrollWidth>innerWidth')
    # Erro amigável e recuperação, sem exibir exceção técnica.
    upload.write_text('a,a\n1,2')
    c.call('DOM.setFileInputFiles',{'nodeId':node,'files':[str(upload)]})
    click('#upload');wait("!document.getElementById('ml-error').hidden && !document.getElementById('dataset-controls').disabled")
    assert 'ValueError' not in js("document.getElementById('ml-error').textContent")
    click('#clear-experiment');assert js("document.getElementById('train-form').hidden")
    assert not [e for e in c.events if e.get('method')=='Runtime.exceptionThrown']
    print('Classificação, regressão, upload, previsão, invalidação, erro e limpeza: OK',flush=True)
    print('Sem overflow em 320, 360, 375, 390, 393, 412, 430, 768, 1024 e 1366px; botões >=44px: OK',flush=True)
finally:
    if c:c.close()
    server.terminate()
    try:server.wait(timeout=10)
    except subprocess.TimeoutExpired:server.kill();server.wait()
    log.close()
