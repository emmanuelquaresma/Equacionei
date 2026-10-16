# Inventário do sistema

Data de consolidação: **15/10/2026**. Coleta iniciada em 13/10/2026; nomes de diretórios conservam a data inicial. Revisão: `b0a2ef0c01458b1e17fe4b34acdf29ef1acecd73`. Branch ativa no início: `main`; alterações locais preexistentes não são tratadas como aprovação.

Metodologia: inspeção de fonte/Git, hashes SHA-256, Docker e PostgreSQL somente leitura, perfis de navegador isolados, entrada física via CDP/WebDriver e testes em cópias temporárias. **Nenhuma correção, commit, push, publicação ou reinício de container existente nesta etapa.** A auditoria anterior foi preservada. Evidências: [diretório privado](../../private/general-audit-20261013/).

## Estrutura real

| Caminho | Responsabilidade e situação |
|---|---|
| app/frontend/ | 18 HTMLs, 19 CSS, JS nativo, catálogos e fornecedores locais; servido por FastAPI. |
| app/backend/src/ | FastAPI: rotas de salas/ML, schemas, motores e stores em memória. |
| app/backend/tests/unit/ | Seis arquivos unittest; 35 métodos em Git e 36 no workspace. |
| tests/frontend/ | 15 arquivos JS de testes, executados dentro de navegador por funções/harness. |
| tests/browser/ | 11 arquivos Python, incluindo helper CDP e testes não versionados; não há runner CI unificado. |
| database/ | init, migrations e seeds contêm apenas .gitkeep. |
| data-science/ | Notebook de Fundamentos, requirements Jupyter isolado e pacote offline de Dama. |
| scripts/limit-python-wasm.py | Ferramenta que grava um WASM com teto de memória; inspecionada, não executada sobre o asset. |
| config/ | Sem arquivo de configuração implementado. |
| docs/ | 23 Markdown versionados; alguns placeholders; documentos locais anteriores preservados. |
| private/releases/b0a2ef0/ | Manifestos, logs, hashes e rollback da Etapa 5; ignorado pelo Git. |
| private/game-start-audit/ | Evidências da auditoria anterior; não sobrescritas nesta etapa. |
| private/general-audit-20261013/ | Coleta atual, screenshots, métricas, resultados e versões preservadas dos relatórios. |
| .github/workflows/ci.yml | Somente comentário; sem pipeline executável. |
| .env* | Dois exemplos versionados; exemplos DEV/PROD e .env.dev.local fora do Git. Valores não publicados. |

Inventário inicial: **202 arquivos versionados** e **214 arquivos existentes** fora de Git interno, venv, private e caches. A contagem inclui arquivos ignorados; não os classifica como descartáveis. [Inventário completo com caminhos/tamanhos/hashes](../../private/general-audit-20261013/repository.json). Não foram encontrados duplicados byte a byte acima de 100 bytes nesse conjunto; isso não exclui duplicação lógica.

| Extensão | Versionados |
|---|---|
| (sem extensão) | 21 |
| .conf | 1 |
| .css | 19 |
| .example | 2 |
| .html | 18 |
| .ipynb | 1 |
| .js | 66 |
| .json | 1 |
| .md | 23 |
| .mjs | 1 |
| .py | 38 |
| .toml | 1 |
| .txt | 3 |
| .wasm | 1 |
| .webp | 1 |
| .yml | 5 |

## Stack e dependências

Frontend: HTML5, CSS, JavaScript sem bundler/framework SPA; Canvas/SVG, Web Workers, Web Audio, localStorage, API de foco, ResizeObserver e media queries. Chart.js 4.4.7 é local. MicroPython 1.27.0 é local: JS 107.864 B + WASM 433.742 B; os dois SHA-256 conferem com SHA256SUMS. A memória linear do WASM foi limitada previamente a 32 MiB; não é um limite de toda a memória do navegador.

Backend: Python 3.11.17; FastAPI 0.143.0; Starlette 1.7.0; Uvicorn 0.54.0; WebSockets 17.2; Pydantic 2.14.1; NumPy 2.4.6; pandas 2.3.3; scikit-learn 1.7.2; xgboost-cpu 3.1.3. Mesmas versões observadas nos três containers da aplicação. Inventário completo de distribuições em runtime.json. PostgreSQL 17.11 é serviço separado e não é dependência do backend atual. Jupyter e pacote NumPy offline têm requirements próprios, sem instalação no container do site.

As dependências de runtime/build não estão integralmente fixadas por lock; os artefatos existentes têm digest. O Dockerfile frontend e nginx.conf contêm apenas comentários; não há evidência de Nginx executando o site. O serviço cloudflared está ativo, e o domínio responde com servidor Cloudflare. A configuração exata do túnel não foi localizada nos dois caminhos inspecionados.

## Situação Git e arquivos locais

Refs locais e remotas verificadas por `git ls-remote` sem fetch: develop=staging=main=b0a2ef0. Nenhum commit exclusivo entre as três. A branch histórica fix/fase-0-preparatoria está 3 à frente/1 atrás de sua referência remota; não foi alterada. Outras branches de feature locais estão inventariadas em repository.json.

Alterações versionadas já presentes: `app/backend/src/routes/dama.py`, `app/backend/tests/unit/test_dama_api.py`, `app/frontend/css/game-layout.css`. Não versionados: pastas de assets de branding, docs/branding-assets.md, docs/auditoria-inicio-jogos.md, tests/browser/branding_assets.py, dama_online_start.py, game_start_audit.py e queda_controls.py. Também existem arquivos ignorados de configuração local. Todos foram preservados; nenhum foi automaticamente aprovado, incluído em commit ou descartado.

## Código e publicação

TESTE e PRODUÇÃO conferem com os 125 arquivos de aplicação/requisitos do Git. DEV diverge em sete: cinco de Xadrez mais duas correções anteriores na camada gravável. Esses dois ajustes não existem no artefato aprovado de TESTE/PROD. O código novo de branding esperado pelo teste local não está implementado/publicado. No domínio, o menu pode conter beacon de métricas inserido pela borda; isso não deve ser confundido com divergência de fonte dos jogos.

## Candidatos à revisão humana

- frontend/Dockerfile, nginx.conf, diretórios config/controllers/utils e placeholders de DB/docs: scaffolds, sem utilidade operacional comprovada hoje.
- Teste de assets e pastas não versionadas: trabalho incompleto; não remover nem aprovar sem revisão.
- Pacote offline de Dama: motores funcionam em smoke, mas CLI declarado está ausente.
- Regras CSS repetidas e três motores de Dama: possível redução de duplicação exige análise de contrato; não são arquivos descartáveis.
- Não foram encontrados Tetris Matemático, Pac-Man independente, manifest/service worker/PWA, autenticação de alunos ou Jupyter servido. O Labirinto existente é uma implementação própria; não foi contado duas vezes como Pac-Man.

Dependências entre componentes estão em [arquitetura](arquitetura.md), módulos em [inventário](inventario-modulos.md), APIs e infraestrutura em [ambientes/deploy](ambientes-deploy.md). Nenhuma dessas constatações autoriza limpeza ou refatoração.
