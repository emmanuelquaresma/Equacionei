"""Treino reproduzível com o motor JS real: python3 data-science/dama/web/train.py.
Requer Chrome/Chromium instalado; não requer servidor, numpy ou Node.
"""
import json
from pathlib import Path
import sys
ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / 'tests/browser'))
from chrome_driver import Chrome

if __name__ == '__main__':
    chrome = Chrome()
    try:
        sources = [ROOT/'app/frontend/js/dama-rules.js', ROOT/'app/frontend/js/dama-learning.js', Path(__file__).with_name('train.js')]
        result = chrome.js('\n'.join(p.read_text() for p in sources) + '\ntrainDama()')['result']
        if 'exceptionDetails' in result:
            raise RuntimeError(result['exceptionDetails'])
        bundle = result['result']['value']
        target = ROOT/'app/frontend/js/dama-models.js'
        target.write_text('/* Gerado por data-science/dama/web/train.py. */\nconst DamaModels = ' + json.dumps(bundle, ensure_ascii=False, indent=2) + ';\n')
        print(json.dumps(bundle['metadata'], indent=2))
    finally:
        chrome.close()
