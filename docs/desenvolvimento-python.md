# Desenvolvimento — Python MVP

## Integração

Frontend estático do projeto, servido pelo `/static` existente. Não há endpoint
executor, alteração em FastAPI, Docker, banco, Jogos ou Data Science.
`site-ui.js` adiciona Desenvolvimento como sexta área e mantém sua seleção ativa
em `desenvolvimento.html` e `python.html`. O menu passa ao hamburger em 1150 px,
sem espremer os links. A HOME inclui cartões irmãos para Aplicações Matemáticas e Desenvolvimento.
O catálogo `/menu` preserva os carrosséis, sem cartão Desenvolvimento abaixo deles.

## Arquitetura

- `data/python-exercises.js`: cinco exercícios, explicação, exemplo, rascunho,
  desafio, resultado, dica e tipo de validador.
- `js/python-learning.js`: editor, navegação, console e feedback.
- `js/python-core.js`: validação e progresso; sem conhecimento do runtime.
- `js/python-runner.js`: carregamento e fronteiras de execução no navegador.
- `vendor/micropython/`: MicroPython 1.27.0, licença, hashes e origem.
- `scripts/limit-python-wasm.py`: transformação reproduzível da memória WASM.

O editor é um textarea de fonte monoespaçada, multilinha, sem autocorreção.
Ctrl/Cmd+Enter executa; o botão “+ 4 espaços” ajuda a indentar no touch.
Tab mantém sua função acessível de mover o foco. Restaurar exige confirmação
quando altera o rascunho. Código limitado a 16.000 caracteres.

Os validadores OUTPUT_EQUALS e OUTPUT_CONTAINS comparam comportamento, não
código-fonte. Os cinco desafios usam OUTPUT_EQUALS e aceitam soluções diferentes.
Isso NÃO comprova uso de variáveis/if: a interface informa essa limitação.
CUSTOM_VALIDATOR e TEST_CASES podem ser acrescentados na camada de validação,
mas não são implementados nem aceitos silenciosamente nesta versão.

## Execução e isolamento

1. O pai confiável carrega os dois arquivos locais (~542 KB) ao abrir a página Python e mantém os bytes em memória para as próximas.
2. Cria iframe `sandbox="allow-scripts"`, SEM `allow-same-origin`.
3. Uma CSP no srcdoc nega recursos por padrão. Scripts inline/data e eval são
   permitidos dentro dessa origem opaca para o runtime; workers apenas data;
   conexões apenas blob. Rede HTTP(S), formulários e navegação do pai não recebem
   autorização. A CSP NÃO é relaxada na página principal.
4. O iframe cria um module Worker descartável com código e módulo via URLs data autocontidas e WASM via blob.
5. O Worker roda Python e devolve stdout/stderr. O pai aceita mensagens somente
   da janela do iframe criado, limita os textos e os mostra com textContent.
6. Após sucesso/erro, Parar ou timeout, Worker/iframe são descartados. Novo run
   não herda variáveis nem arquivos virtuais da execução anterior.

Tempo de código: 3 segundos. Inicialização: até 30 segundos. Saída: 16 KB.
Memória linear WASM: máximo 32 MiB, imposto na declaração binária de memória.
Esse limite foi necessário: o teste demonstrou que heapsize sozinho cresce.

O runtime não recebe cookies, dados de progresso, objetos da página ou arquivos
servidor. MicroPython possui filesystem virtual volátil em memória, que NÃO é o
filesystem do servidor ou dispositivo. Módulos disponíveis como math funcionam;
não há pip, pandas, numpy ou execução de processos do host.

A ponte `import js` existe no runtime. Ela fica confinada ao Worker de origem
opaca e à CSP. O isolamento não é um bloqueio de palavras em código Python.
Mesmo via ponte JS, DOM, IndexedDB da aplicação e rede não são disponibilizados.
Não há garantia de limite absoluto do processo do navegador: alocações nativas
JavaScript, falhas do navegador e esgotamento do dispositivo são riscos residuais.
As medidas não representam uma auditoria de segurança independente. Progresso é
local e manipulável, não adequado a prova/ranking confiável.

## input e compatibilidade

O MVP não oferece stdin interativo. input(prompt) foi configurado para mostrar
o prompt e lançar EOFError explícito de entrada indisponível, sem esperar para
sempre ou fabricar uma resposta. Não há exercício de input neste conjunto.
MicroPython implementa Python, mas difere de CPython em bibliotecas e detalhes.
Não prometer compatibilidade integral com futuros cursos de Data Science.

Requer navegadores atuais com WebAssembly, module Workers, iframe sandbox, CSP
e dialog. Firefox foi testado em execução real. Android/iPhone físicos e Chrome,
Edge e Safari ainda exigem testes próprios; falhas de carregamento são exibidas
na interface. Não há promessa de funcionamento offline: os arquivos precisam
estar disponíveis no servidor/cache. Nenhuma dependência de CDN em produção.

## Progresso

Chave `matematica.python.progress.v1`, schema version 1:
último exercício e registros por ID com draft, attempts, executionErrors,
wrongAnswers, hintsUsed, completed, elapsedTime (segundos ativos) e updatedAt.
Paradas/timeouts contam como tentativa com erro. Dica conta uma vez por abertura
no exercício. Tempo é salvo ao executar, trocar de exercício, ocultar/sair da
página. Não é rastreamento com precisão de auditoria; fechamento abrupto pode
perder a última parcela do tempo. Rascunho salva em cada alteração.
Falha de storage informa que os dados ficam somente em memória.
Nenhum dado é enviado ao servidor. Não há sincronização entre dispositivos,
contas, PostgreSQL, ML ou integração automática com Meus Dados.

## Validação

`tests/frontend/python-learning.test.js` expõe `testPythonRunner()` para execução
na página python.html em um perfil de teste. Carregar esse arquivo como script
na página e aguardar a Promise; ele também testa validador e persistência em
storage falso. Não executar na sessão de um aluno.

Suíte real de navegador: cinco soluções, saída incorreta, SyntaxError, NameError,
acentos, múltiplos prints, dica, confirmação/cancelamento de restauração,
Ctrl+Enter, próximo, reload e recuperação de rascunho/progresso.
Isolamento: loop infinito, Parar, reinício após cancelamento, imports, tentativa
de ler /etc/passwd e /.env, os.system, socket, DOM, IndexedDB, XHR bloqueado por
CSP, memória excessiva, limite de saída e EOF de input.
Responsividade: 360×640, 375×667, 390×844, 412×915, 430×932, tablet 768×1024,
1100×800, 1366×768, 1440×900 e 1920×1080. Sem overflow horizontal; editor inicia
por volta de 318 px no mobile, 166 px em 1366×768. Capturas verificadas.
Regressão: catálogo, Data Science, Dama e menu de seis áreas abrem.

## Evolução

Adicionar stdin interativo, mais validadores/exercícios e ampliar testes entre
navegadores. SQL/JavaScript/Web só entram como novas trilhas posteriormente.
Contas, turmas, sincronização e histórico centralizado exigem modelagem e
aprovação de persistência antes de qualquer banco/API novos.

## Correção de compatibilidade e preparação

Reproduzido no Google Chrome: um module Worker carregado por URL blob criada
na origem opaca do iframe srcdoc falhava antes de iniciar o Python. O tratamento
worker.onerror escondia o diagnóstico na mensagem genérica. A comparação com o
mesmo executor usando URL data para o Worker executou print normalmente.
Não era falta de Pyodide, CDN ou download dos arquivos locais.

Agora prepare() inicializa o runtime sem executar código do aluno. A interface
exibe “Preparando ambiente Python…” e só libera Executar após o evento started
confirmar a inicialização. Após execução/interrupção prepara um ambiente novo.
Falhas de download/inicialização são registradas no console com detalhes; a UI
oferece nova tentativa. HTTP 503 seguido de recuperação foi testado.

Chrome: preparação, print, UTF-8, soma de lista (30), SyntaxError, NameError,
interrupção, recuperação e testes de isolamento passaram. As telas foram
verificadas em 360×640, 390×844 e 1366×768. Emulação de viewport não substitui
teste em aparelho Android/iPhone real ou no binário Edge.

No celular: abra Desenvolvimento → Python, aguarde “Python pronto para executar”,
digite print("Teste") e execute. Depois teste print(sum([10, 20])) (resultado 30).
Sem CDN; os dois arquivos de vendor/micropython devem ser publicados junto do site.

A suíte de 22 verificações do executor também passou no Firefox após a correção.
