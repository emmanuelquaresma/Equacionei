# Data Science — auditoria e primeira aula enriquecida

Data: 23/09/2026. Implementação incremental, sem publicação remota nesta etapa.

## Diagnóstico antes das alterações

| Item | Implementação encontrada |
|---|---|
| Página principal | `app/frontend/data-science.html`; seis cartões nativos, um link disponível e cinco `details/summary`; experiências existentes abaixo |
| Experiências | `js/data-science.js`, cálculos em `js/data-science-core.js`, coleta em `js/learning-data.js` |
| Fundamentos | `data-science/fundamentos.html`, catálogo `data/data-science/fundamentos.js`, navegação em `js/data-science-fundamentos.js` |
| Aulas/exercícios | 18 objetos compartilhados; ID, título, explicação, ponte SQL, exemplo, saída, enunciado, rascunho, resultado esperado, dica e validador |
| Progresso | Conclusão do exercício no laboratório; leitura por ID nas aulas; abrir conteúdo não conclui |
| Laboratório | `python.html`, `js/python-learning.js`, `js/python-core.js`, `js/python-runner.js`; seleção `?trail=fundamentos&exercise=<id>` |
| Estilos | `css/site.css` compartilhado; `css/data-science.css`, `css/data-science-trilha.css` e `css/desenvolvimento.css` específicos; carrosséis em `css/carousel.css` |
| Responsividade | Mapa: 1 coluna, 2 a partir de 600 px, 3 a partir de 1000 px; aulas em uma coluna; código com rolagem interna |
| Testes existentes | `tests/frontend/data-science.test.js`, `data-science-fundamentos.test.js`, `python-learning.test.js`; funções executadas em navegador |
| Dados existentes | Exemplos sintéticos embutidos, dados didáticos de animais, tentativas locais dos jogos, notebook próprio `data-science/modulo1_fundamentos/01_introducao.ipynb` |
| Referências externas | Mapeadas em `docs/mapa-materiais-estudo.md`; cinco bases no diretório pessoal, não no diretório público |

O teste de catálogo fornecia resultados sem `status: 'done'`, mas o validador já exige esse campo. Corrigida a fixture do teste, sem afrouxar a validação de respostas.

### Chaves de armazenamento

- `matematica.python.progress.v1`: versão 1, `lastExercise`, `exercises[id]`; guarda rascunho, tentativas, erros de execução, respostas incorretas, dicas, conclusão, tempo ativo e atualização.
- `matematica.learning.attempts.v1`: até 1.000 tentativas dos jogos participantes.
- `matematica.learning.progress.v1`: conquistas e experiências de Data Science, exemplos de treino e execuções do modelo.

Nenhuma chave nova foi criada. Não há gravação de progresso ao mover o controle da simulação. A leitura compartilhada do progresso usa apenas IDs conhecidos, respeita `completed === true`, sinaliza armazenamento indisponível e não altera dados inválidos/versões desconhecidas.

## Estado do Git

HEAD encontrado: `28e5233` (`Evolui interface e multiplayer dos jogos matematicos`). Havia alterações staged e unstaged em interface/menu e muitos arquivos não rastreados, incluindo toda a nova área de Data Science, laboratório e jogos. `git status`, `git diff`, `git diff --cached` e `git log` foram conferidos; esse trabalho foi preservado. Os diffs anteriores e cópias dos arquivos diretamente editados foram guardados em `/tmp` como auxílio local, não como backup permanente.

`.gitignore` já cobria venv, chaves privadas, logs e alguns `.env`, mas não todos os sufixos de ambiente. Foram acrescentados `.env.*` com exceção dos dois modelos existentes, diretórios de referência privada, configurações Spyder, checkpoints de notebooks e nomes usuais de JSON de credenciais. Regras por diretório não detectam dados pessoais automaticamente: todo arquivo candidato a publicação ainda precisa de revisão.

Nenhum PDF, XLSX, CSV ou ZIP de referência apareceu entre os arquivos rastreados. Nenhum original foi copiado nesta etapa. Os dados de exemplo acrescentados são sintéticos próprios. Arquivos privados devem permanecer fora de `app/frontend`, pois o Docker copia essa pasta inteira e o FastAPI a serve como estáticos. `.gitignore` não impede publicação de arquivos copiados manualmente para lá.

Não foram feitos commit, tag ou push. Após revisar e registrar o conjunto completo atualmente não versionado, um checkpoint sugerido é `v0.1-ds-fundamentos`; criar essa tag antes do commit não representaria a versão funcional atual.

## Estrutura preservada das 18 aulas

Cada ID atual identifica a aula e seu único exercício associado. Não há dependência da posição da lista para recuperar progresso.

| Ordem | Aula | ID da aula/exercício |
|---|---|---|
| 01 | Média | `ds-fund-media` |
| 02 | Mediana | `ds-fund-mediana` |
| 03 | Moda | `ds-fund-moda` |
| 04 | Variância | `ds-fund-variancia` |
| 05 | Desvio padrão | `ds-fund-desvio` |
| 06 | Quartis | `ds-fund-quartis` |
| 07 | Distribuições | `ds-fund-distribuicoes` |
| 08 | Probabilidade | `ds-fund-probabilidade` |
| 09 | Correlação | `ds-fund-correlacao` |
| 10 | Correlação x causalidade | `ds-fund-causalidade` |
| 11 | Variáveis | `ds-fund-variaveis` |
| 12 | Tipos de dados | `ds-fund-tipos` |
| 13 | Listas | `ds-fund-listas` |
| 14 | Tuplas | `ds-fund-tuplas` |
| 15 | Dicionários | `ds-fund-dicionarios` |
| 16 | Condicionais | `ds-fund-condicionais` |
| 17 | Laços | `ds-fund-lacos` |
| 18 | Funções | `ds-fund-funcoes` |

Não houve renomeação nem migração. Se uma aula ganhar novos exercícios no futuro, cada novo desafio receberá seu próprio ID semântico, mantendo o atual e uma relação explícita com a aula; não reaproveitar IDs antigos para desafios distintos.

## Primeira aula

Somente Média recebeu o objeto opcional `learning`. Os campos antigos do catálogo foram mantidos, inclusive enunciado, dica, exemplo e saída do exercício. As outras 17 entradas permanecem idênticas ao início desta etapa.

`js/foundation-lesson.js` renderiza os blocos opcionais com elementos semânticos e `textContent`: objetivo, conceito, exemplo intuitivo, dados, pergunta, experimentação, código, resultado, interpretação, investigação, aplicação e resumo. A tabela tem caption e cabeçalhos. O controle numérico possui label, limites, instrução e mensagem de erro textual. A ponte SQL e o exemplo anterior permanecem numa revisão expansível.

A amostra original é `[80, 90, 95, 100, 105, 110, 900]`. O aluno compara média de R$ 211,43 com mediana de R$ 100 e altera a última venda. Ao trocar por 100, a média cai para R$ 97,14 e a mediana permanece 100. A amostra é identificada como fictícia; não se conclui causalidade nem capacidade preditiva. O texto explica por que um extremo não deve ser excluído automaticamente.

A simulação roda em JavaScript, sem carregar interpretador na aula. O código Python equivalente acompanha os valores. O aluno pode copiá-lo para o laboratório como exploração; a conclusão continua exigindo a saída `10.0` do exercício original (média de 5, 10 e 15). Isso é explicitado na interface. O validador compara saída e não comprova domínio conceitual.

O cartão Fundamentos mostra `18 aulas • 18 exercícios` e o total concluído. Começar abre o catálogo; Continuar retoma o último exercício conhecido ainda não concluído ou o primeiro pendente; com 18 conclusões, Revisar abre o catálogo. Rascunhos, tentativas ou conclusões do módulo caracterizam início; registros vazios não. Eventos `pageshow` e `storage` atualizam a apresentação.

## Dados para aprender

`data/data-science/datasets.js` inicia um catálogo de metadados e uma pequena amostra própria, carregado somente em Fundamentos. Contém ID, nome, descrição, origem, fonte, fonte oficial, licença, observação sobre licença, versão, data de acesso, dimensões, variáveis/tipos/unidades, nível e módulos relacionados.

ID inicial: `eq-vendas-semana-v1`. Fonte oficial e data de acesso são `null` por não se tratar de coleta externa. Licença é `null`, explicitamente ainda não declarada: não foi inventada licença de terceiros nem concedida licença de redistribuição em nome do projeto. Novas bases externas só devem entrar após verificação de fonte e licença.

Vendas/receitas são um bom tema-âncora para medidas, filtros e gráficos. A amostra de sete dias serve apenas ao primeiro conceito; não deve ser forçada em inferência ou treinamento de modelos. Nas próximas unidades poderá haver outra base própria, versionada, com datas e regiões. As cinco bases privadas não foram incorporadas.

O atlas de São Paulo examinado possui indicadores por distrito, sem coluna temporal identificada. Portanto, não deve ser anunciado como série histórica para gráficos de evolução; para isso será necessária outra base com tempo e procedência verificados.

## Laboratório Python

MOTOR ATUAL: MicroPython 1.27.0 em WebAssembly, local.

SUPORTA NUMPY: não, neste build.
SUPORTA PANDAS: não.
SUPORTA MATPLOTLIB: não.
SUPORTA SCIKIT-LEARN: não.

Os quatro imports foram incluídos na verificação real desta etapa. JS + WASM somam 541.606 bytes sem compressão, conforme os arquivos locais. O runtime é preparado ao abrir o laboratório, não na página inicial de Data Science nem na aula. Há iframe de origem opaca, Worker descartável, limite WASM de 32 MiB, execução de até 3 segundos, inicialização de até 30 segundos e saída de até 16 KB. Não há stdin interativo, pip científico, contas ou execução no backend. Não há garantia offline nem limite absoluto de memória do processo do navegador.

### Possibilidades futuras, sem migração nesta etapa

Pyodide oferece NumPy, pandas, Matplotlib e scikit-learn em seu catálogo. A integração com o editor existente poderia manter a interface de execução e o contrato dos validadores, mas precisaria de outro adaptador, testes de isolamento, captura de gráficos, limites de execução e política de pacotes. Executar no Worker evita bloquear a interface, mas não resolve por si só isolamento e esgotamento de memória. Fontes: [pacotes Pyodide](https://pyodide.org/en/stable/usage/packages-in-pyodide.html) e [Worker](https://pyodide.org/en/stable/usage/webworker.html).

JupyterLite acrescenta uma experiência de notebooks e gerenciamento de arquivos, com kernel Pyodide possível. É candidato para uma área avançada separada, com maior trabalho de integração de progresso, navegação e testes de interface móvel. Offline exige provisionar os recursos e configurar armazenamento/cache; não decorre apenas de executar Python no navegador. Fontes: [JupyterLite](https://jupyterlite.readthedocs.io/en/stable/), [offline](https://jupyterlite.readthedocs.io/en/stable/howto/configure/advanced/offline.html) e [limitações](https://jupyterlite.readthedocs.io/en/stable/troubleshooting.html).

Avaliação de engenharia para uma prova de conceito futura:

| Critério | Pyodide integrado | JupyterLite separado |
|---|---|---|
| Download inicial | Runtime CPython/WASM e pacotes escolhidos; medir bytes comprimidos da versão fixada | Acrescenta frontend de notebooks, kernel e extensões escolhidas |
| Carregamento | Baixar só quando solicitado; mostrar preparação, erro e nova tentativa | Abrir somente em ação explícita da área avançada |
| Memória | Medir pico com pandas e operações sobre dados pequenos; não herdar teto de 32 MiB sem ensaio | Medir também várias células, saídas e notebooks abertos |
| Celulares | Prototipar no editor simples em Android/iPhone físicos | Avaliar edição de células e navegação em tela pequena antes de adotar |
| Cache | Versionar runtime/pacotes, invalidar cache com atualização | Versionar também frontend, kernel e arquivos de notebooks |
| Offline | Implementar cache completo e testar primeira visita, recarga e perda de armazenamento | Seguir configuração oficial e testar artefato offline e política de armazenamento |
| Integração | Novo adaptador do executor, preservando IDs e validador | Ponte entre conclusões de atividades e progresso atual; não usar posição de célula como ID |
| Manutenção | Revisão de runtime, pacotes, CSP e compatibilidade | Revisão adicional do frontend Jupyter, extensões, kernel e persistência |

Não foram instalados esses motores, portanto não há medições locais honestas de megabytes, segundos ou memória para compará-los. O tamanho depende da versão, compressão, pacotes e cache; não usar números de releases antigos como promessa. A prova de conceito deve medir primeira carga e carga com cache, tamanho transferido, tempo até execução e pico de memória em desktop e celulares antes da escolha.

## Pendências e continuidade

- Validar pedagogicamente esta aula antes de replicar o padrão.
- A sequência atual começa por estatística; a reorganização em 18 aulas proposta no mapa anterior continua apenas proposta.
- As outras 17 aulas mantêm o formato anterior. Depois de aprovar o padrão, enriquecer primeiro Mediana, depois Dispersão e interpretação de gráficos, sempre preservando exercícios/IDs e testando o resultado.
- Não há migração científica, contas, backend novo, dataset externo publicado ou alteração de framework.
- Os testes de viewport não substituem aparelhos físicos, Safari ou revisão com leitor de tela.

## Arquivos desta entrega

| Arquivo (relativo à raiz) | Alteração |
|---|---|
| `.gitignore` | Complemento de exclusões de material privado e ambientes |
| `app/frontend/data-science.html` | Estado real do cartão Fundamentos e scripts leves de progresso |
| `app/frontend/data-science/fundamentos.html` | Inclusão dos blocos e catálogo próprio de dados |
| `app/frontend/data/data-science/fundamentos.js` | Objeto `learning` somente na primeira aula |
| `app/frontend/data/data-science/datasets.js` | Novo dataset próprio e metadados |
| `app/frontend/js/data-science-fundamentos.js` | Leitura compartilhada, renderização opcional e foco no retorno à lista |
| `app/frontend/js/foundation-progress.js` | Nova leitura de progresso por IDs estáveis |
| `app/frontend/js/data-science-module-progress.js` | Estado e retomada no cartão |
| `app/frontend/js/foundation-lesson.js` | Blocos pedagógicos e simulação da primeira aula |
| `app/frontend/css/data-science-trilha.css` | Tabela, controle e espaçamento local da aula |
| `tests/frontend/data-science-fundamentos.test.js` | Fixture corrigida e testes de compatibilidade/simulação |
| `tests/browser/chrome_driver.py` | Driver mínimo de Chrome em perfil descartável |
| `tests/browser/data_science_enrichment.py` | Suíte de navegador reproduzível |
| `docs/data-science-enriquecimento.md` | Auditoria, decisões e resultados |
| `docs/data-science.md` | Referência à auditoria e primeira aula |

## Validação executada

Comando reproduzível, requer Chrome ou Chromium instalado:

```sh
python3 tests/browser/data_science_enrichment.py
```

A suíte usa servidor local em porta livre, perfil temporário e os arquivos do projeto. Não usa sessões do aluno. Relatório e capturas são escritos em `/tmp`.

Resultados da execução final:

- Chrome em 360×800, 390×844, 768×1024 e 1366×900: seis cartões preservados, respectivamente 1/1/2/3 colunas, aula em uma coluna e nenhuma rolagem horizontal da página.
- Tabela com sete observações, simulação, entrada inválida, reload, aula anterior/próxima, retorno à lista e foco por teclado passaram.
- Primeira aula e página principal não requisitam arquivos do interpretador; o dataset novo também não é requisitado pela página principal.
- Progresso: visitante, rascunho anterior, resposta incorreta, acerto, reload, preservação de dados de outros exercícios e retomada da próxima aula passaram.
- Armazenamento inválido e indisponível não impedem leitura da aula; atualização entre duas páginas por evento `storage` real passou; 18/18 oferece revisão.
- Os 18 exemplos passaram em CPython e no MicroPython real; os cinco cenários 0, 100, 120, 900 e 2000 da simulação tiveram saídas conferidas. O caso 120 também verifica a apresentação `100.0`, coerente com Python.
- Suíte existente do executor Python: 22 verificações passaram, incluindo cancelamento, timeout, isolamento, limite de memória/saída e persistência.
- Suítes existentes de estatística, k-NN, laboratório de dados, conquistas e coleta/persistência passaram. Os cinco exercícios originais de Desenvolvimento continuam acessíveis.
- Nenhuma exceção JavaScript não tratada; erros Python e CSP esperados foram provocados pelos testes de isolamento.
- Capturas mobile/desktop revisadas. Contrastes calculados dos textos principais, secundários, links e conclusão sobre os fundos branco e `#f7fafc` ficaram entre 5,39:1 e 12,45:1. Isso não substitui uma auditoria completa de acessibilidade.
- `git diff --check` passou; comparação com a cópia anterior confirmou todos os campos originais das 18 entradas e integralmente as outras 17 aulas. Comparação de hashes não encontrou cópias dos originais privados em frontend, dados do projeto ou documentação.

Durante a criação da suíte, a simulação de storage bloqueado inicialmente não era aplicada ao novo documento: a preparação do protocolo de navegador foi corrigida. A suíte final passou incluindo esse cenário. Não foi uma falha da leitura de progresso da aplicação.

Limites: testes em Chrome headless com emulação de viewport, sem aparelhos físicos, Safari/Edge ou leitor de tela nesta entrega. Backend/Docker não foram alterados nem revalidados por esta suíte de frontend. A versão publicada remotamente não foi modificada nem auditada ao vivo.
