# Matriz de testes e limites de comprovação

Data de consolidação: **15/10/2026**. Coleta iniciada em 13/10/2026; nomes de diretórios conservam a data inicial. Revisão: `b0a2ef0c01458b1e17fe4b34acdf29ef1acecd73`. Branch ativa no início: `main`; alterações locais preexistentes não são tratadas como aprovação.

Metodologia: inspeção de fonte/Git, hashes SHA-256, Docker e PostgreSQL somente leitura, perfis de navegador isolados, entrada física via CDP/WebDriver e testes em cópias temporárias. **Nenhuma correção, commit, push, publicação ou reinício de container existente nesta etapa.** A auditoria anterior foi preservada. Evidências: [diretório privado](../../private/general-audit-20261013/).

## Inventário e execução dos testes

As unidades de contagem são distintas: método unittest, suíte de navegador, fluxo funcional e medição de layout não são somados como “testes unitários”. Sem cobertura por linhas instrumentada, nenhum percentual é apresentado.

| Grupo | Executados | Aprovados | Reprovados | Ignorados/bloqueados | Observação |
|---|---|---|---|---|---|
| Backend workspace em DEV | 36 métodos | 36 | 0 | 0 | Processo isolado; fontes de teste pela memória; sem escrever no serviço. |
| Backend Git em TESTE | 35 métodos | 35 | 0 | 0 | Mesmas dependências da imagem publicada; estado do processo de teste separado. |
| Nova API regression contra código publicado | 6 métodos | 5 | 1 método / 4 subcenários | 0 | Rejeição de 8001/8002; esperado pelo diagnóstico; mostra lacuna da suíte antiga. |
| Seis runners principais existentes | 6 suítes | 6 | 0 | 0 | Xadrez, Dama IA, Matemática, responsividade, Python/DS, XGBoost em snapshots. |
| Grupos adicionais Racha/Queda | 2 grupos JS | 2 | 0 | 0 | Incluem relógio controlado/fixtures; não substituem toque/hit testing. |
| Branding local não versionado | 1 suíte | 0 | 1 | 0 | Contrato de assets esperado pelo teste está ausente; não é aprovação de branding. |
| Notebook | 36 células de código | 36 | 0 | 0 | Execução sequencial sem arquivos pessoais/rede. |
| Dama offline | Smoke de motor/agentes | Ações/transições e 2 agentes | CLI inexistente | Treino exportador não executado | CLI é lacuna de implementação; treinar sobrescreveria modelo JS. |
| Chrome visual | 760 combinações | 760 medições concluídas | 2 combinações com controles encobertos | 0 transporte na rodada final | Não é aprovação funcional de 760 partidas. |
| Firefox | 21 cenários | 20 sem erro do executor | 1 clique bloqueado na Queda | 375 solicitado virou 500 efetivos | Desktop Gecko; não é iPhone/Android. |
| Acessibilidade | 44 estados + 12 Tabs/estado | 528 transições sem foco oculto nos percursos | Dama perde foco em prova específica | Leitor de tela humano não executado | Sem nomes vazios nos controles amostrados; contraste computado com limitações. |
| Dama online real | 8 cenários | 4 | 4 | 0 | DEV/público passam; 8002/8001 falham em móvel/desktop. |
| Formato de progresso | 8 cenários | Baselines/recuperações registradas | 2 registros nulos bloqueiam Python | Latência de preparação não é falha | Matriz por origem e formato em storage-shapes.json. |

Total de backend: **77 execuções de métodos**, com **76 aprovadas e 1 método reprovado**, que contém quatro subcenários reprovados. Não contar os quatro subcenários outra vez como quatro métodos. As 35/36 suítes completas passam, apesar das falhas de interface encontradas; teste que só chama click() no DOM ou mede existência não detecta uma camada que recebe o toque antes do botão.

As 15 famílias de testes JS versionadas foram alcançadas pelos seis runners e dois grupos adicionais. Exemplos de evidência: perft 20/400/8902 no Xadrez e curso de 15 lições/30 exercícios; Dama IA com 1324 asserções nesta amostra e Workers sob CPU 4x; Labirinto com 3365 verificações; Pares com 300 rodadas; Queda com 3000 conjuntos de opções; Racha com 2847 verificações. Contadores de busca/asserções são diferentes de casos e podem variar entre execuções.

## Fluxos funcionais e conclusão

[functional-flows.json](../../private/general-audit-20261013/functional-flows.json) contém 30 fluxos de navegação/interação, em DEV e público, móvel/desktop. Foram completados dez acertos do Relâmpago e replay, cinco rodadas em cada um dos três níveis de Pares, puzzle textual 3×3 de Racha até a vitória, 12 exercícios matemáticos com resumo, Python correto/incorreto e rascunho/reload, simuladores/k-NN e cálculos 1º/2º grau. ML por navegação normal treina/prevê apenas em DEV; a suíte isolada também cobre classificação/regressão/upload/erros.

Os jogos de Dama/Xadrez usam jogadas reais e testes explícitos de vitórias/empates/promoções com fixtures. Xadrez conclui atividades educativas de fato. Labirinto tem início/pausa/movimento reais e conclusão de campanha em fixture/motor; não se apresenta isso como campanha natural jogada por uma pessoa. Racha 4×4 e todas as tabuadas/textos não foram resolvidos naturalmente. A Queda tem estados finais verificados com relógio controlado, além de arena real/hit testing.

## Matriz resumida por módulo

| Unidade | Origem executada | Funcionalidade/evidência | Resultado |
|---|---|---|---|
| Página inicial | Git/DEV/público conforme cenário | 31 estados visuais; fluxos por navegação normal; teclado/AX. | Funcional e validado |
| Navegação global e carrosséis | Git/DEV/público conforme cenário | math_practice; xgboost_lab; navegação física em functional-flows. | Funcional e validado |
| Apresentação compartilhada dos jogos | Git/DEV/público conforme cenário | 760 combinações de tela/viewport; geometria e hit testing. | Funcional com ressalvas |
| Armazenamento local e progresso | Git/DEV/público conforme cenário | data_science_enrichment; storage-shapes; eventos reais entre abas. | Funcional com ressalvas |
| Sobre | Git/DEV/público conforme cenário | Chrome em 19 viewports; AX/teclado. | Funcional e validado |
| Entrada de Desenvolvimento | Git/DEV/público conforme cenário | Navegação normal até Python; 19 viewports. | Funcional e validado |
| Xadrez e curso educativo | Git/DEV/público conforme cenário | suite-head-xadrez: motor/perft, empates, 15 lições/30 exercícios, teclado, toque e AX; Firefox com jogada real. | Funcional com ressalvas |
| Dama local, IA e online | Git/DEV/público conforme cenário | dama_bot; backend; dama-online; teclado físico; Firefox. | Funcional com ressalvas |
| Labirinto Matemático | Git/DEV/público conforme cenário | 3365 verificações do motor; UI com relógio/fixtures; movimento/pausa reais; Firefox. | Funcional com ressalvas |
| Desafio Relâmpago | Git/DEV/público conforme cenário | math_practice/menu-game; dez acertos com entrada física, replay e dados no hub. | Funcional e validado |
| Jogo dos Pares | Git/DEV/público conforme cenário | 300 rodadas do motor; três níveis completos por toque/mouse; replay real. | Funcional e validado |
| Queda Matemática | Git/DEV/público conforme cenário | 3000 conjuntos de opções; UI com relógio controlado; hit testing em 19 viewports; Firefox. | Funcional com ressalvas |
| Racha-Cuca | Git/DEV/público conforme cenário | 2847 verificações de regras; UI dos temas; quebra-cabeça textual 3×3 resolvido por movimentos legais até a vitória, com replay. | Funcional e validado |
| Motor de Prática Matemática | Git/DEV/público conforme cenário | math_practice em dez larguras; 12 exercícios resolvidos; navegação física. | Funcional e validado |
| Frações | Git/DEV/público conforme cenário | Três exercícios por assunto; acerto, erro, dica, resolução, resumo e retorno. | Funcional e validado |
| Multiplicação e Divisão | Git/DEV/público conforme cenário | Três exercícios por assunto; acerto, erro, dica, resolução, resumo e retorno. | Funcional e validado |
| Potenciação | Git/DEV/público conforme cenário | Três exercícios por assunto; acerto, erro, dica, resolução, resumo e retorno. | Funcional e validado |
| Expressões Algébricas | Git/DEV/público conforme cenário | Três exercícios por assunto; acerto, erro, dica, resolução, resumo e retorno. | Funcional e validado |
| Função do 1º Grau | Git/DEV/público conforme cenário | primeiro-grau.test.js; math_practice; cálculo normal por navegação. | Funcional e validado |
| Função do 2º Grau | Git/DEV/público conforme cenário | Cálculo real de raízes 1/3; Firefox; casos extremos em Worker com limite de tempo. | Funcional com ressalvas |
| Laboratório e editor Python | Git/DEV/público conforme cenário | 22 verificações do executor; cinco exercícios originais; 18 exemplos de DS; código correto/incorreto e reload. | Funcional com ressalvas |
| Hub de Data Science | Git/DEV/público conforme cenário | xgboost_lab; data_science_enrichment; navegação/AX/19 viewports. | Funcional com ressalvas |
| Fundamentos de Data Science | Git/DEV/público conforme cenário | 18 exemplos executados; simuladores; erro/acerto, reload, 18/18 por fixture e eventos de storage. | Funcional e validado |
| Meus Dados | Git/DEV/público conforme cenário | data_science_enrichment; geração real de dez acertos e leitura no hub. | Funcional e validado |
| Laboratório de Dados | Git/DEV/público conforme cenário | Suíte DS e cliques reais em valores/perguntas. | Funcional e validado |
| Treine sua IA — k-NN | Git/DEV/público conforme cenário | Motor estatístico; UI; treino/previsão física por navegação normal. | Funcional e validado |
| Laboratório XGBoost | Git/DEV/público conforme cenário | xgboost_lab isolado: classificação, regressão, upload, nulos/categorias, erro/invalidação; treino real em DEV. | Funcional com ressalvas |
| Serviço e API da Dama | Git/DEV/público conforme cenário | Backend em processos isolados; dois navegadores reais e saída das salas de auditoria. | Funcional com ressalvas |
| Serviço e APIs de Machine Learning | Git/DEV/público conforme cenário | 11 métodos de ML na suíte backend; servidor HTTP isolado; treino/previsão em DEV. | Funcional com ressalvas |
| Notebook de Fundamentos | Git/DEV/público conforme cenário | 36 células executadas sequencialmente sem erro, sem rede/arquivos pessoais. | Funcional e validado |
| Pacote offline de Dama e treinamento | Inspeção/smoke isolado | Smoke: sete ações iniciais, transição legal, minimax/MCTS; inspeção do entrypoint. | Parcialmente implementado |
| PostgreSQL e persistência relacional | Inspeção/smoke isolado | Consultas READ ONLY de catálogo, tabelas, FKs, autenticação e SSL. | Parcialmente implementado |
| Construção, publicação e CI | Inspeção/smoke isolado | Inspeção dos três containers, 125 arquivos por ambiente, refs remotas e imagens. | Parcialmente implementado |
| Prévias e roadmap de Data Science | Inspeção/smoke isolado | Inspeção do HTML; abertura de details na suíte xgboost_lab. | Parcialmente implementado |
| Infraestrutura de assets de branding | Inspeção/smoke isolado | Teste local isolado branding_assets: reprovado, global EQUACIONEI_BRANDING_ASSETS inexistente. | Parcialmente implementado |

## Erros provocados, executor e limites

- 401 em GET de sala sem token é resposta de autorização esperada; favicon 404 é cosmético. Erros Python/CSP intencionais do teste de isolamento não são defeitos novos do site.
- A primeira coleta de imagens encontrou limite no transporte CDP simplificado para mensagens fragmentadas; foi repetida com transporte auditável fora do repositório. A matriz final tem 760 medições sem esse erro; o ensaio foi preservado separadamente.
- Ensaios funcionais iniciais tinham esperas insuficientes de navegação, respostas por índice e limpeza numérica inconsistente. Foram separados como exploratórios e repetidos. A inserção final de campos usa perfil de teste, limpeza explícita e Input.insertText; não se altera lógica do site. Resolver Racha 3×3 não equivale a solver 4×4.
- Não se executaram testes de carga, scanner ofensivo, treino/upload no serviço de PRODUÇÃO, restauração de DB existente, atualização de dependências, execução de train.py/limit-python-wasm.py sobre arquivos reais, nem teste de todos os jogos até fim natural.
- Safari/WebKit/aparelhos reais e teclado virtual de iOS/Android não estavam disponíveis. A janela Firefox não aceitou 375 px efetivos; foram registrados 500×667, 1366×900 e 640×360.
- Sem relatório de coverage/Lighthouse/CWV. Sem teste de leitores de tela por pessoa. Não há testes e2e/integration autônomos nas pastas placeholder; vários testes com nomes “unit” já exercitam API/integração ASGI.

Logs extensos por suíte em `suite-*/execution.log`; estados/capturas e hashes estão no diretório privado. O [plano de ação](plano-acao.md) define gates para corrigir cada lacuna, sem execução automática.
