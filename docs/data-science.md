# ∑quacionei — Data Science

Entrada: `/static/data-science.html`, integrada ao carrossel. FastAPI serve os arquivos estáticos existentes; não há novos serviços, dependências, banco ou endpoints.

## Camadas

- `learning-data.js`: armazenamento local versionado, limitado a 1.000 tentativas. Falhas de armazenamento não interrompem os jogos. Chaves exclusivas `matematica.learning.attempts.v1` e `matematica.learning.progress.v1`.
- `data-science-core.js`: estatística, agregação, treinamento k-NN e avaliação, sem DOM ou armazenamento.
- `data-science.js`: experiências, gráficos SVG/HTML, conquistas e navegação por âncoras.

## Dados reais

Desafio Relâmpago registra a tentativa única de cada questão. Queda registra cada resposta e cada expiração. Campos: versão, id, identificador da questão, aluno local, jogo, dificuldade, operadores, expressão, resposta, resultado esperado, resultado da tentativa, duração em ms, instante ISO.

Nenhum nome, token de sessão ou dado da Dama é lido. O perfil é o navegador, não uma identidade autenticada; aparelhos compartilhados misturam resultados. Não existe sincronização. Não se reconstituem tentativas a partir dos recordes antigos.

Acurácia = respostas certas / respostas enviadas. Expirações são separadas. Exercícios são questões distintas. Tempo médio = tempo desde a apresentação até cada tentativa respondida; no Queda exclui pausas. Expressões com mais de um tipo de operador ficam em operações combinadas. Nenhuma recomendação automática de conteúdo é emitida.

## Modelo didático real

k-NN usa distância euclidiana quadrática em altura e peso, normalizados por amplitudes fixas 70 cm e 39 kg. Fácil usa até 1 vizinho, Médio até 3, Difícil até 5. Em empate, vence a classe do vizinho mais próximo (ordem de inserção desempata distâncias iguais). O treinamento copia os exemplos, e alterações exigem treinar de novo.

Dados de animais são fictícios. As dez observações de teste são fixas e não entram automaticamente no treino. Acurácia é calculada a cada treinamento. Os votos dos vizinhos não são probabilidades calibradas. Observar repetidamente o mesmo teste pode orientar escolhas e enviesar sua avaliação; a interface explica essa limitação. Mais dados não garantem melhor resultado.

## Progresso

Conquistas dependem de atividades concluídas: pergunta em Meus Dados, três perguntas fáceis, seis perguntas médias/difíceis, treinamento válido e comparação de configurações distintas. Progresso, até 100 exemplos e até 20 treinamentos permanecem locais. O botão de apagar histórico remove apenas tentativas, preservando recordes, conquistas e sessões de outros jogos.

## Próximas etapas

Regressão, separação configurável treino/teste, conta do aluno, armazenamento persistente no servidor e recomendações baseadas em desempenho estão fora desta primeira versão. A interface de coleta permite substituir o armazenamento sem alterar os cálculos dos jogos.

## Validação

`tests/frontend/data-science.test.js` contém funções executáveis em runtime JavaScript e navegador: `testDataScience(DataScience)`, `testLearningData(source)` e `testDataScienceUI()` em página de teste com armazenamento isolado. Os testes existentes dos jogos continuam válidos sem a camada opcional de registro.

## Trilha de estudos — etapa A

A entrada permanece em `/static/data-science.html`. Seis cartões apresentam a progressão: Fundamentos; Manipulação e Visualização de Dados; Machine Learning; Avaliação de Modelos; Storytelling e Negócio; Tópicos Complementares.

Nesta etapa, os cartões são elementos nativos `details/summary`: abrem uma prévia dos assuntos por toque, clique ou teclado, com o estado “Em preparação”. Não anunciam aulas já disponíveis nem apontam para páginas inexistentes. Não há progresso de módulos simulado.

Abaixo, “Experimente agora” mantém as experiências e as âncoras `#dados`, `#laboratorio` e `#ia`; `#inicio` retorna ao catálogo. Conquistas e armazenamento permanecem intactos. O laboratório Python não foi alterado.

O HTML usa classes `ds-trail-*`, definidas no CSS exclusivo de Data Science. Os cartões usam uma coluna em celulares, duas a partir de 600px e três a partir de 1000px. Não foram adicionadas dependências, rotas de backend ou alterações no menu compartilhado.

Próxima etapa: B — Fundamentos. As demais aulas, notebooks, datasets e ambiente científico continuam planejados para as etapas seguintes.

Validação da etapa A: Chrome headless nas larguras 360, 390, 430, 1366 e 1920px, sem rolagem horizontal; revisão visual em mobile e desktop; abertura das prévias por teclado, menu mobile e âncoras existentes. Testes existentes de estatística, k-NN, laboratório, conquistas e persistência passaram. A emulação não substitui testes em aparelhos físicos.

## Etapa B — Fundamentos disponível

O primeiro cartão agora leva a `/static/data-science/fundamentos.html`; os outros cinco continuam como prévias em preparação. O módulo tem 18 aulas e 18 exercícios, com conteúdo em `data/data-science/fundamentos.js`, navegação em `js/data-science-fundamentos.js` e CSS isolado em `css/data-science-trilha.css`.

O laboratório Python existente aceita `?trail=fundamentos&exercise=<id conhecido>`. Não há outro editor, mudança de runtime, dependência científica no navegador ou execução de código no backend. IDs próprios preservam os rascunhos dos exercícios anteriores. O menu mantém Data Science ativo na aula e nesse contexto do laboratório; a entrada Python normal continua em Desenvolvimento.

Notebook e instruções de ambiente local: `data-science/README.md`. As aulas específicas mantêm o título Fundamentos em desktop e mobile.

## Catálogo de aulas e progresso

Fundamentos abre com uma lista numerada das 18 aulas existentes, com descrição, exemplo, duração estimada e exercício Python. Um hash de aula abre seu conteúdo; “Todas as aulas” retorna ao catálogo. A sequência e os IDs dos exercícios foram preservados.

A barra conta apenas os exercícios dessas aulas com `completed: true` em `matematica.python.progress.v1`, versão 1. Abrir uma aula não a conclui. O contador é atualizado ao retornar à página e quando o armazenamento muda em outra aba. Armazenamento inválido ou indisponível exibe uma mensagem sem impedir o estudo.

Verificação em Chrome: navegação e ausência de overflow em 360, 390, 768 e 1366 px; progresso vazio, oito conclusões e armazenamento inválido em perfil isolado.

## Primeira aula enriquecida

A aula Média agora inclui blocos pedagógicos opcionais, dados sintéticos próprios e comparação interativa de média/mediana. Seus campos originais e exercício foram preservados. O cartão do módulo lê o progresso já existente para começar, continuar ou revisar. Auditoria, IDs, motor Python, arquivos alterados e resultados de testes estão em [data-science-enriquecimento.md](data-science-enriquecimento.md).

### Continuação: Mediana

A segunda aula também utiliza os blocos pedagógicos, com comparação entre períodos de seis e sete dias e cálculo Python para quantidades pares/ímpares. O exercício `ds-fund-mediana` e seu progresso permanecem compatíveis. As demais 16 aulas seguem no formato anterior.
