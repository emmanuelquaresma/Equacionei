# Ambientes, APIs e processo de publicação

Data de consolidação: **15/10/2026**. Coleta iniciada em 13/10/2026; nomes de diretórios conservam a data inicial. Revisão: `b0a2ef0c01458b1e17fe4b34acdf29ef1acecd73`. Branch ativa no início: `main`; alterações locais preexistentes não são tratadas como aprovação.

Metodologia: inspeção de fonte/Git, hashes SHA-256, Docker e PostgreSQL somente leitura, perfis de navegador isolados, entrada física via CDP/WebDriver e testes em cópias temporárias. **Nenhuma correção, commit, push, publicação ou reinício de container existente nesta etapa.** A auditoria anterior foi preservada. Evidências: [diretório privado](../../private/general-audit-20261013/).

## Estado dos ambientes

| Ambiente/ref | Porta e APP_ENV | Imagem real | Integridade e ressalvas |
|---|---|---|---|
| equacionei-dev-backend-1 | {'8000/tcp': [{'HostIp': '127.0.0.1', 'HostPort': '8000'}]} / development | sha256:5e22c4288259b3ffb5ea9d8f33cd451e12aa6939fcaa37f46b7ffee19d3896d0 | 7 fontes divergentes do Git; duas correções na camada gravável |
| equacionei-test-backend-1 | {'8000/tcp': [{'HostIp': '127.0.0.1', 'HostPort': '8002'}]} / test | sha256:061961c7c4ae243b9140ef5b6e972fcb95606c8aff278e4f95eae668e2ab6648 | 125 arquivos de aplicação/requisitos conferem com Git |
| equacionei-prod-backend-1 | {'8000/tcp': [{'HostIp': '127.0.0.1', 'HostPort': '8001'}]} / production | sha256:061961c7c4ae243b9140ef5b6e972fcb95606c8aff278e4f95eae668e2ab6648 | 125 arquivos de aplicação/requisitos conferem com Git |
| postgres | {'5432/tcp': [{'HostIp': '0.0.0.0', 'HostPort': '5432'}, {'HostIp': '::', 'HostPort': '5432'}]} / — | sha256:67f41722b7a8cbdb868a44a4995c846eddfdc2973bccb291ce937dce88ad5675 | PostgreSQL 17.11, serviço independente; volume persistente |

Git remoto e local: main=staging=develop=b0a2ef0; o runtime não lê automaticamente a branch. APP_ENV não carrega Git, não substitui o build e não altera por si só os limites/origens. A imagem de PROD/TESTE é a mesma: `equacionei-backend@sha256:061961c7c4ae243b9140ef5b6e972fcb95606c8aff278e4f95eae668e2ab6648` (~738 MB). DEV é imagem anterior (~735 MB), com label e765b43-dirty e mudanças locais.

DEV diverge em `routes/dama.py`, `css/game-layout.css`, `css/xadrez.css`, `data/xadrez-lessons.js`, `js/xadrez-board.js`, `js/xadrez-learning.js`, `xadrez.html` (paths relativos aos respectivos src/frontend). As duas primeiras são correções da etapa anterior, não implementações desta auditoria. Os 125 arquivos foram lidos por processo isolado e comparados ao Git/workspace; `docker diff` distingue camada gravável de imagem. Recriar a partir da imagem antiga perde os dois ajustes; rollback por tag/digest não reescreve Git.

## Saúde, HTTP e exposição

Health respondeu 200 nas quatro origens. Foram coletadas 96 respostas por origem (384 no total), incluindo páginas, JS/CSS/WASM, OpenAPI e metadados de ML. A consulta sem token à sala inexistente respondeu 401 como esperado. As URLs de frontend usam `/static/…`; `/` e `/menu` usam FileResponse. A integridade do runtime inclui arquivos não medidos separadamente por HTTP, como .mjs e licenças. Hashes de assets de fornecedores também foram conferidos com o manifesto local.

8000, 8001 e 8002 estão vinculadas a 127.0.0.1. O domínio público está acessível via HTTPS/Cloudflare. Não se declara que um celular consiga acessar TESTE diretamente, nem que o hostname público abra as portas internas. Não foi aberto túnel adicional nem alterada configuração de Cloudflare. A lista de serviços indica cloudflared ativo; os dois caminhos-padrão de config inspecionados não continham o ingress. O mapeamento físico exato do domínio à porta é limitação de inspeção, embora a release HTTP corresponda ao Git de PROD/TESTE.

## Endpoints e contratos

15 caminhos HTTP customizados constam do OpenAPI, mais WS da Dama no fonte. Docs gerados (`/openapi.json`, `/docs`, `/redoc`, `/docs/oauth2-redirect`) e montagem `/static/*` são inventariados à parte. Não há endpoint de execução Python, alunos, notas ou DB.

| Método | Rota | Responsabilidade/entrada | Autorização e respostas relevantes |
|---|---|---|---|
| GET | / | Home HTML | Público; 200. |
| GET | /menu | Catálogo de atividades/jogos; hash pertence ao cliente | Público; 200. |
| GET | /health | Saúde básica do processo | Público; 200 {status:ok}; não prova saúde de banco/WS/ML. |
| POST | /api/dama/rooms | Criar sala e token de sessão | Público; 201; 429 limite 10/min; capacidade limitada. |
| POST | /api/dama/rooms/{room_id}/join | Entrar pelo código da sala | Convite/código; 201,404,409; token novo. |
| GET | /api/dama/rooms/{room_id} | Snapshot da própria sessão | Bearer; 200,401,404. |
| POST | /api/dama/rooms/{room_id}/leave | Retirar a própria participação e fechar seus sockets | Bearer; 200,401,404. |
| POST | /api/dama/rooms/{room_id}/swap-colors | Trocar cores no pré-jogo | Bearer participante; 200,401,404,409. |
| POST | /api/dama/rooms/{room_id}/start | Iniciar quando dois participantes conectados | Bearer criador; 200,401,403,404,409. |
| WS | /ws/dama/{room_id} | Origin permitido; primeira mensagem authenticate/session_token; ping/move/revision | Token na mensagem, nunca URL; close 1008; antes do accept a rejeição aparece como HTTP 403; move_rejected para ação inválida. |
| GET | /api/ml/datasets | Demos e limites | Público; 200; sem carga externa. |
| POST | /api/ml/datasets/demo/{name} | Iris, Breast Cancer, Wine, Diabetes | Público; capacidade-ID aleatório; 200,422,503. |
| POST | /api/ml/datasets/upload?filename=… | Corpo CSV UTF-8; nome .csv até 255; 2 MiB padrão | Público; ID-capacidade; 200,413,422,503; sem gravar arquivo no disco. |
| POST | /api/ml/xgboost/train | dataset_id, target, features, model_type, test_size, parameters | ID-capacidade, sem conta; 200,404,408,422,429,503; erros genéricos 500 tratados. |
| POST | /api/ml/xgboost/predict | model_id e dict de todas as features | ID-capacidade; 200,404,422; finitos e tamanho de texto validados. |
| POST | /api/ml/release | dataset_id e/ou model_id | Quem possui IDs; 200; libera só IDs enviados. |
| GET | /openapi.json; /docs; /redoc; /docs/oauth2-redirect | Contrato e UI de documentação gerados | Públicos; exposição informacional deliberada a revisar. |
| GET/HEAD | /static/* | Arquivos do frontend por StaticFiles | Públicos; 200/304/404 conforme arquivo/cache; nenhuma credencial de raiz foi servida nesses testes. |

Schemas ML: extras proibidos; JSON até 32.768 B; IDs 20–100 caracteres, target/coluna até 80, features 1–40. Parâmetros: árvores 1–200, profundidade 1–8, learning_rate 0,01–1, subsample/colsample 0,1–1, seed inteira não negativa, test_size 0,1–0,4 (padrões podem ser reduzidos/configurados por ML_*). max_rows 5.000, max_categories 32, max_classes 20, min_rows 10; MemoryStore 12 entradas por dataset/modelo e TTL 1.800 s; treino cooperativo 30 s, concorrência 1. Esses valores vêm da configuração real padrão, não de capacidade comprovada por carga.

APIs dependem de RAM/CPU e bibliotecas locais, não PostgreSQL ou APIs externas. HTTP de ML executa operações via threadpool e trata LabError; exceptions internas devolvem erro genérico e vão ao log. O servidor não carrega bibliotecas Python do aluno: isso é no navegador.

## Build, publicação e rollback

O Dockerfile instala requirements sem lock completo sobre base python:3.11-slim; uma reconstrução futura pode selecionar versões distintas. A Etapa 5 preservou dependências de imagem base auditada, copiou o Git aprovado e promoveu um único digest. Os Compose atuais continuam com instrução de build e sem fixação da imagem de release no arquivo-base. As sobreposições operacionais privadas fazem parte do processo manual e devem ser consideradas: usar somente o Compose-base pode reconstruir/selecionar outro artefato.

Rollbacks observados e preservados: TESTE `rollback-before-b0a2ef0` → `sha256:fca93c0688830fa5a99c6ce43821f306d1babb4c0772345df5845d6996cff38b`; PROD → `sha256:3dd6fc502b5c3388885acb1c0a62cc8a9102e74fbfcaaf1e3957caf28923fa50`. Há tags históricas adicionais no inventário. Nenhum rollback foi ensaiado nos containers existentes. A ausência de política de restart nos serviços da aplicação e de limites Docker também deve integrar revisão operacional.

Proposta de gate: revisão aprovada → fontes/lock/base identificáveis → testes seguros → hash do artefato → DEV equivalente → TESTE autorizado → mesma imagem em PROD autorizado → smoke real e rollback verificado em ambiente isolado. A aprovação do inventário não aprova patches preexistentes nem inicia essa sequência.

Logs foram resumidos sem interpretar ausência de mensagens como aprovação geral. A janela inicial de duas horas tinha 0 erros/5xx inesperados nos logs inspecionados; foram depois provocadas somente requisições/partidas de auditoria, sem reiniciar serviços. Verificação final de preservação registra IDs/StartedAt/digests e fontes.
