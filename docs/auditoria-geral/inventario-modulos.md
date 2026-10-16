# Inventário de módulos

Data de consolidação: **15/10/2026**. Coleta iniciada em 13/10/2026; nomes de diretórios conservam a data inicial. Revisão: `b0a2ef0c01458b1e17fe4b34acdf29ef1acecd73`. Branch ativa no início: `main`; alterações locais preexistentes não são tratadas como aprovação.

Metodologia: inspeção de fonte/Git, hashes SHA-256, Docker e PostgreSQL somente leitura, perfis de navegador isolados, entrada física via CDP/WebDriver e testes em cópias temporárias. **Nenhuma correção, commit, push, publicação ou reinício de container existente nesta etapa.** A auditoria anterior foi preservada. Evidências: [diretório privado](../../private/general-audit-20261013/).

## Critério de contagem e validação

Foram identificadas **35 unidades lógicas**: páginas, jogos, famílias de conteúdo, componentes compartilhados, serviços e scaffolds explicitamente presentes. Editor e laboratório Python são uma unidade; modos de jogos são subfunções; cada um dos quatro assuntos matemáticos é catalogado e seu motor compartilhado é uma unidade transversal. As dez prévias de Data Science são agrupadas em uma unidade, não dez cursos funcionais. A contagem não equivale a 35 páginas HTML.

18 funcionais e validadas no escopo exercitado; 12 funcionais com ressalvas; 5 parcialmente implementadas; 0 totalmente não funcionais como unidade integral; 0 sem qualquer análise/checagem. Isso **não** significa que todos os cenários foram testados: CLI está quebrado, scaffolds não têm operação completa, campanha natural de Labirinto, leitores de tela/aparelhos reais e treinos em PRODUÇÃO continuam sem validação. Aprovação funcional não é certificação irrestrita de acessibilidade/compatibilidade.

| ID | Unidade | Classificação | Referências de problemas |
|---|---|---|---|
| M01 | Página inicial | Funcional e validado | V004/V006: oportunidades de padronização, sem bloqueio comprovado. |
| M02 | Navegação global e carrosséis | Funcional e validado | V004/V005: aproveitamento e alvos das setas; sem evidência de link quebrado do último jogo. |
| M03 | Apresentação compartilhada dos jogos | Funcional com ressalvas | A002; V001/V002/V003/V006: controles, limites de altura e cascata CSS. |
| M04 | Armazenamento local e progresso | Funcional com ressalvas | A003/A007: registro nulo bloqueia Python; dados locais não têm sincronização/backup central. |
| M05 | Sobre | Funcional e validado | V006: convenções visuais/rodapé. |
| M06 | Entrada de Desenvolvimento | Funcional e validado | V004: tamanho/ocupação dos cartões. |
| M07 | Xadrez e curso educativo | Funcional com ressalvas | A005/A007/V002: curso antigo em DEV; progresso educativo em memória; reinício distante no celular. |
| M08 | Dama local, IA e online | Funcional com ressalvas | A001/AC001: WS recusa portas 8001/8002; foco cai no BODY após Enter; V002. |
| M09 | Labirinto Matemático | Funcional com ressalvas | AC002/V001/V002: Canvas sem mapa textual; mapa reduzido no desktop; controles e textos empilhados. |
| M10 | Desafio Relâmpago | Funcional e validado | A007: recordes/histórico são locais, conforme o aviso do produto. |
| M11 | Jogo dos Pares | Funcional e validado | V002: em 375×667 o reinício fica parcialmente abaixo da primeira tela, mas é alcançável. |
| M12 | Queda Matemática | Funcional com ressalvas | A002: Pausar/Reiniciar encobertos em telas horizontais na publicação; correção local prévia só em DEV. |
| M13 | Racha-Cuca | Funcional e validado | V002: parte dos controles requer rolagem; não é falha de início. |
| M14 | Motor de Prática Matemática | Funcional e validado | A007: progresso dessas práticas é da visita, sem conta central. |
| M15 | Frações | Funcional e validado | Escopo inicial de três exercícios por assunto; não equivale a currículo completo. |
| M16 | Multiplicação e Divisão | Funcional e validado | Escopo inicial de três exercícios por assunto; não equivale a currículo completo. |
| M17 | Potenciação | Funcional e validado | Escopo inicial de três exercícios por assunto; não equivale a currículo completo. |
| M18 | Expressões Algébricas | Funcional e validado | Escopo inicial de três exercícios por assunto; não equivale a currículo completo. |
| M19 | Função do 1º Grau | Funcional e validado | V006/A015: cabeçalho/título repetido e dependência síncrona do gráfico. |
| M20 | Função do 2º Grau | Funcional com ressalvas | A004/A010: laços sem teto/progresso garantido; campo vazio é convertido em zero. |
| M21 | Laboratório e editor Python | Funcional com ressalvas | A003: registro nulo de exercício impede inicialização; A007; biblioteca limitada intencionalmente. |
| M22 | Hub de Data Science | Funcional com ressalvas | V003/V004: muitos padrões de cartões e grande altura; parte da trilha é prévia. |
| M23 | Fundamentos de Data Science | Funcional e validado | A007/V003: progresso local e diferentes contratos visuais; exercícios não fazem SQL no servidor. |
| M24 | Meus Dados | Funcional e validado | A007: somente dois jogos alimentam tentativas; não é histórico central de alunos. |
| M25 | Laboratório de Dados | Funcional e validado | Conteúdo didático fictício; sem integração com pandas ou banco real. |
| M26 | Treine sua IA — k-NN | Funcional e validado | Limitação didática explícita: altura/peso não classificam espécies de verdade. |
| M27 | Laboratório XGBoost | Funcional com ressalvas | A008/A009/S004: capacidade efêmera/global e risco de rate limit compartilhado. |
| M28 | Serviço e API da Dama | Funcional com ressalvas | A001/A007/S004: origens locais ausentes na versão publicada; estado por processo; proxy/IP precisa validação. |
| M29 | Serviço e APIs de Machine Learning | Funcional com ressalvas | A008/S004/A009: capacidade compartilhada, limites por processo/IP e build não fixado. |
| M30 | Notebook de Fundamentos | Funcional e validado | Jupyter não está integrado ao site; dependência isolada jupyter não fixada. |
| M31 | Pacote offline de Dama e treinamento | Parcialmente implementado | A012/A016: equacionei_dama.cli não existe; motores paralelos exigem contrato/paridade. |
| M32 | PostgreSQL e persistência relacional | Parcialmente implementado | S001/A011: bind externo e SSL off; estratégia de backup/restore não comprovada. |
| M33 | Construção, publicação e CI | Parcialmente implementado | A005/A006/A009/A013: DEV drift, CI vazia, deps não fixadas e documentação-base incompleta. |
| M34 | Prévias e roadmap de Data Science | Parcialmente implementado | Não é falha o rótulo Em breve; não contabilizar prévias como cursos operacionais. |
| M35 | Infraestrutura de assets de branding | Parcialmente implementado | A014: contrato do teste não existe; favicon 404. Não alterar/aprovar branding nesta etapa. |

## M01 — Página inicial

1. **Nome/classificação:** Página inicial — Funcional e validado.
2. **Objetivo:** Apresentar a plataforma e acessar as áreas.
3. **Arquivos:** index.html; css/home.css; css/site.css (frontend relativo a app/frontend; backend explicitado).
4. **Rotas/URLs:** / — domínio público ou origem local do ambiente.
5. **Dependências:** site-ui; banner WebP.
6. **Implementado:** Marca em texto, ilustração, entradas de Matemática, Jogos, Data Science e Desenvolvimento.
7. **Incompleto/limites:** Sem lacuna obrigatória comprovada no fluxo principal; a validação é limitada aos cenários registrados.
8. **Integração:** site-ui; banner WebP; contratos e persistência detalhados em arquitetura.md. Ausência de DB não implica conexão oculta com PostgreSQL.
9. **Testes/evidências:** 31 estados visuais; fluxos por navegação normal; teclado/AX.
10. **Problemas:** V004/V006: oportunidades de padronização, sem bloqueio comprovado.
11. **Riscos:** dependências/estado/compatibilidade limitam a classificação; os IDs citados distinguem confirmação, hipótese e limite em diagnostico-problemas.md.
12. **Recomendação:** aplicar a prioridade dos IDs vinculados no plano, preservar dados/contratos e exigir regressão do fluxo principal; funcionalidades novas só na Fase E autorizada.

## M02 — Navegação global e carrosséis

1. **Nome/classificação:** Navegação global e carrosséis — Funcional e validado.
2. **Objetivo:** Conectar áreas e cartões com mouse, toque e teclado.
3. **Arquivos:** pages/menu.html; js/site-ui.js; js/menu-carousel.js; css/carousel.css; css/menu.css (frontend relativo a app/frontend; backend explicitado).
4. **Rotas/URLs:** /menu#atividades; /menu#jogos; hashes no hub — domínio público ou origem local do ambiente.
5. **Dependências:** Cabeçalhos duplicados no HTML; ResizeObserver; matchMedia.
6. **Implementado:** Menu recolhível, área ativa, setas, pontos, arraste de mouse e scroll nativo por toque.
7. **Incompleto/limites:** Sem lacuna obrigatória comprovada no fluxo principal; a validação é limitada aos cenários registrados.
8. **Integração:** Cabeçalhos duplicados no HTML; ResizeObserver; matchMedia; contratos e persistência detalhados em arquitetura.md. Ausência de DB não implica conexão oculta com PostgreSQL.
9. **Testes/evidências:** math_practice; xgboost_lab; navegação física em functional-flows.
10. **Problemas:** V004/V005: aproveitamento e alvos das setas; sem evidência de link quebrado do último jogo.
11. **Riscos:** dependências/estado/compatibilidade limitam a classificação; os IDs citados distinguem confirmação, hipótese e limite em diagnostico-problemas.md.
12. **Recomendação:** aplicar a prioridade dos IDs vinculados no plano, preservar dados/contratos e exigir regressão do fluxo principal; funcionalidades novas só na Fase E autorizada.

## M03 — Apresentação compartilhada dos jogos

1. **Nome/classificação:** Apresentação compartilhada dos jogos — Funcional com ressalvas.
2. **Objetivo:** Oferecer cabeçalho contextual e espaço para interação.
3. **Arquivos:** css/site.css; css/game-layout.css; cabeçalhos dos sete HTMLs (frontend relativo a app/frontend; backend explicitado).
4. **Rotas/URLs:** Sete rotas de jogos — domínio público ou origem local do ambiente.
5. **Dependências:** Estilos específicos; site-ui; --game-header-height.
6. **Implementado:** Identidade comum, ajuda recolhível, adaptação móvel e ocultação visual de títulos repetidos.
7. **Incompleto/limites:** Sem lacuna obrigatória comprovada no fluxo principal; a validação é limitada aos cenários registrados.
8. **Integração:** Estilos específicos; site-ui; --game-header-height; contratos e persistência detalhados em arquitetura.md. Ausência de DB não implica conexão oculta com PostgreSQL.
9. **Testes/evidências:** 760 combinações de tela/viewport; geometria e hit testing.
10. **Problemas:** A002; V001/V002/V003/V006: controles, limites de altura e cascata CSS.
11. **Riscos:** dependências/estado/compatibilidade limitam a classificação; os IDs citados distinguem confirmação, hipótese e limite em diagnostico-problemas.md.
12. **Recomendação:** aplicar a prioridade dos IDs vinculados no plano, preservar dados/contratos e exigir regressão do fluxo principal; funcionalidades novas só na Fase E autorizada.

## M04 — Armazenamento local e progresso

1. **Nome/classificação:** Armazenamento local e progresso — Funcional com ressalvas.
2. **Objetivo:** Manter tentativas, rascunhos, recordes e retomada neste navegador.
3. **Arquivos:** js/learning-data.js; python-core.js; foundation-progress.js; data-science-*-progress.js; labirinto-services.js (frontend relativo a app/frontend; backend explicitado).
4. **Rotas/URLs:** Sem API de alunos; armazenamento por origem/perfil — domínio público ou origem local do ambiente.
5. **Dependências:** localStorage; memória; eventos storage/pageshow/pagehide.
6. **Implementado:** Até 1.000 tentativas de Queda/Relâmpago; trilhas Python/DS, recordes e sessões da Dama.
7. **Incompleto/limites:** Conta, sincronização e persistência do aluno no servidor não existem; algumas práticas/Xadrez permanecem apenas na visita.
8. **Integração:** localStorage; memória; eventos storage/pageshow/pagehide; contratos e persistência detalhados em arquitetura.md. Ausência de DB não implica conexão oculta com PostgreSQL.
9. **Testes/evidências:** data_science_enrichment; storage-shapes; eventos reais entre abas.
10. **Problemas:** A003/A007: registro nulo bloqueia Python; dados locais não têm sincronização/backup central.
11. **Riscos:** dependências/estado/compatibilidade limitam a classificação; os IDs citados distinguem confirmação, hipótese e limite em diagnostico-problemas.md.
12. **Recomendação:** aplicar a prioridade dos IDs vinculados no plano, preservar dados/contratos e exigir regressão do fluxo principal; funcionalidades novas só na Fase E autorizada.

## M05 — Sobre

1. **Nome/classificação:** Sobre — Funcional e validado.
2. **Objetivo:** Explicar a identidade e o propósito da plataforma.
3. **Arquivos:** sobre.html; css/site.css (frontend relativo a app/frontend; backend explicitado).
4. **Rotas/URLs:** /static/sobre.html — domínio público ou origem local do ambiente.
5. **Dependências:** Navegação compartilhada.
6. **Implementado:** Conteúdo institucional e retorno.
7. **Incompleto/limites:** Sem lacuna obrigatória comprovada no fluxo principal; a validação é limitada aos cenários registrados.
8. **Integração:** Navegação compartilhada; contratos e persistência detalhados em arquitetura.md. Ausência de DB não implica conexão oculta com PostgreSQL.
9. **Testes/evidências:** Chrome em 19 viewports; AX/teclado.
10. **Problemas:** V006: convenções visuais/rodapé.
11. **Riscos:** dependências/estado/compatibilidade limitam a classificação; os IDs citados distinguem confirmação, hipótese e limite em diagnostico-problemas.md.
12. **Recomendação:** aplicar a prioridade dos IDs vinculados no plano, preservar dados/contratos e exigir regressão do fluxo principal; funcionalidades novas só na Fase E autorizada.

## M06 — Entrada de Desenvolvimento

1. **Nome/classificação:** Entrada de Desenvolvimento — Funcional e validado.
2. **Objetivo:** Encaminhar para a trilha de programação.
3. **Arquivos:** desenvolvimento.html; css/desenvolvimento.css (frontend relativo a app/frontend; backend explicitado).
4. **Rotas/URLs:** /static/desenvolvimento.html — domínio público ou origem local do ambiente.
5. **Dependências:** site-ui; Python.
6. **Implementado:** Cartão de acesso ao laboratório.
7. **Incompleto/limites:** Sem lacuna obrigatória comprovada no fluxo principal; a validação é limitada aos cenários registrados.
8. **Integração:** site-ui; Python; contratos e persistência detalhados em arquitetura.md. Ausência de DB não implica conexão oculta com PostgreSQL.
9. **Testes/evidências:** Navegação normal até Python; 19 viewports.
10. **Problemas:** V004: tamanho/ocupação dos cartões.
11. **Riscos:** dependências/estado/compatibilidade limitam a classificação; os IDs citados distinguem confirmação, hipótese e limite em diagnostico-problemas.md.
12. **Recomendação:** aplicar a prioridade dos IDs vinculados no plano, preservar dados/contratos e exigir regressão do fluxo principal; funcionalidades novas só na Fase E autorizada.

## M07 — Xadrez e curso educativo

1. **Nome/classificação:** Xadrez e curso educativo — Funcional com ressalvas.
2. **Objetivo:** Jogar localmente e aprender regras em atividades.
3. **Arquivos:** xadrez.html; js/xadrez*.js; data/xadrez-lessons.js; css/xadrez.css (frontend relativo a app/frontend; backend explicitado).
4. **Rotas/URLs:** /static/xadrez.html — domínio público ou origem local do ambiente.
5. **Dependências:** Chess; ChessBoard; ChessLearning; catálogo de lições.
6. **Implementado:** Partida local; promoção; empates; histórico; reinício; 15 lições/30 exercícios em Git/TESTE/PROD.
7. **Incompleto/limites:** Leitor de tela humano e detector completo de posições mortas arbitrárias não foram certificados.
8. **Integração:** Chess; ChessBoard; ChessLearning; catálogo de lições; contratos e persistência detalhados em arquitetura.md. Ausência de DB não implica conexão oculta com PostgreSQL.
9. **Testes/evidências:** suite-head-xadrez: motor/perft, empates, 15 lições/30 exercícios, teclado, toque e AX; Firefox com jogada real.
10. **Problemas:** A005/A007/V002: curso antigo em DEV; progresso educativo em memória; reinício distante no celular.
11. **Riscos:** dependências/estado/compatibilidade limitam a classificação; os IDs citados distinguem confirmação, hipótese e limite em diagnostico-problemas.md.
12. **Recomendação:** aplicar a prioridade dos IDs vinculados no plano, preservar dados/contratos e exigir regressão do fluxo principal; funcionalidades novas só na Fase E autorizada.

## M08 — Dama local, IA e online

1. **Nome/classificação:** Dama local, IA e online — Funcional com ressalvas.
2. **Objetivo:** Oferecer partidas locais, IA e sala de dois participantes.
3. **Arquivos:** dama.html; js/dama*.js; css/dama.css (frontend relativo a app/frontend; backend explicitado).
4. **Rotas/URLs:** /static/dama.html; /api/dama/*; /ws/dama/* — domínio público ou origem local do ambiente.
5. **Dependências:** DamaRules; Worker; modelos; serviço de salas.
6. **Implementado:** Duas pessoas; três níveis de IA; sala, cores, início, movimentos autoritativos, reconexão e saída.
7. **Incompleto/limites:** Partida completa com 24 peças iniciais não foi jogada manualmente até o fim; vitórias/capturas/promoções foram exercitadas em fixtures explícitas.
8. **Integração:** DamaRules; Worker; modelos; serviço de salas; contratos e persistência detalhados em arquitetura.md. Ausência de DB não implica conexão oculta com PostgreSQL.
9. **Testes/evidências:** dama_bot; backend; dama-online; teclado físico; Firefox.
10. **Problemas:** A001/AC001: WS recusa portas 8001/8002; foco cai no BODY após Enter; V002.
11. **Riscos:** dependências/estado/compatibilidade limitam a classificação; os IDs citados distinguem confirmação, hipótese e limite em diagnostico-problemas.md.
12. **Recomendação:** aplicar a prioridade dos IDs vinculados no plano, preservar dados/contratos e exigir regressão do fluxo principal; funcionalidades novas só na Fase E autorizada.

## M09 — Labirinto Matemático

1. **Nome/classificação:** Labirinto Matemático — Funcional com ressalvas.
2. **Objetivo:** Coletar múltiplos e progredir entre tabuadas.
3. **Arquivos:** labirinto-matematico.html; js/labirinto-*.js; css/labirinto-matematico.css (frontend relativo a app/frontend; backend explicitado).
4. **Rotas/URLs:** /static/labirinto-matematico.html — domínio público ou origem local do ambiente.
5. **Dependências:** Canvas; gerador; motor; armazenamento/áudio.
6. **Implementado:** Geração de mapas, operadores, vidas, poderes, campanha, tutorial, pausa, D-pad, teclado e swipe.
7. **Incompleto/limites:** Campanha natural integral não foi concluída por uma pessoa; conclusão de fases/campanha é validada em cenários controlados.
8. **Integração:** Canvas; gerador; motor; armazenamento/áudio; contratos e persistência detalhados em arquitetura.md. Ausência de DB não implica conexão oculta com PostgreSQL.
9. **Testes/evidências:** 3365 verificações do motor; UI com relógio/fixtures; movimento/pausa reais; Firefox.
10. **Problemas:** AC002/V001/V002: Canvas sem mapa textual; mapa reduzido no desktop; controles e textos empilhados.
11. **Riscos:** dependências/estado/compatibilidade limitam a classificação; os IDs citados distinguem confirmação, hipótese e limite em diagnostico-problemas.md.
12. **Recomendação:** aplicar a prioridade dos IDs vinculados no plano, preservar dados/contratos e exigir regressão do fluxo principal; funcionalidades novas só na Fase E autorizada.

## M10 — Desafio Relâmpago

1. **Nome/classificação:** Desafio Relâmpago — Funcional e validado.
2. **Objetivo:** Responder dez operações com feedback e tempo.
3. **Arquivos:** desafio-relampago.html; js/menu-game.js; js/learning-data.js; css/menu.css (frontend relativo a app/frontend; backend explicitado).
4. **Rotas/URLs:** /static/desafio-relampago.html — domínio público ou origem local do ambiente.
5. **Dependências:** LearningData; timers; localStorage.
6. **Implementado:** Início; quatro operações; tentativa única; recorde; conclusão e jogar novamente.
7. **Incompleto/limites:** Sem lacuna obrigatória comprovada no fluxo principal; a validação é limitada aos cenários registrados.
8. **Integração:** LearningData; timers; localStorage; contratos e persistência detalhados em arquitetura.md. Ausência de DB não implica conexão oculta com PostgreSQL.
9. **Testes/evidências:** math_practice/menu-game; dez acertos com entrada física, replay e dados no hub.
10. **Problemas:** A007: recordes/histórico são locais, conforme o aviso do produto.
11. **Riscos:** dependências/estado/compatibilidade limitam a classificação; os IDs citados distinguem confirmação, hipótese e limite em diagnostico-problemas.md.
12. **Recomendação:** aplicar a prioridade dos IDs vinculados no plano, preservar dados/contratos e exigir regressão do fluxo principal; funcionalidades novas só na Fase E autorizada.

## M11 — Jogo dos Pares

1. **Nome/classificação:** Jogo dos Pares — Funcional e validado.
2. **Objetivo:** Relacionar gráficos, frações, equivalências e operações.
3. **Arquivos:** jogo-dos-pares.html; js/jogo-dos-pares*.js; js/fractions.js; data/jogo-dos-pares.js (frontend relativo a app/frontend; backend explicitado).
4. **Rotas/URLs:** /static/jogo-dos-pares.html — domínio público ou origem local do ambiente.
5. **Dependências:** PairEngine; FractionView; SVG.
6. **Implementado:** Três níveis, cinco rodadas, três pares por rodada, feedback, bloqueio após erro e reinício.
7. **Incompleto/limites:** Sem lacuna obrigatória comprovada no fluxo principal; a validação é limitada aos cenários registrados.
8. **Integração:** PairEngine; FractionView; SVG; contratos e persistência detalhados em arquitetura.md. Ausência de DB não implica conexão oculta com PostgreSQL.
9. **Testes/evidências:** 300 rodadas do motor; três níveis completos por toque/mouse; replay real.
10. **Problemas:** V002: em 375×667 o reinício fica parcialmente abaixo da primeira tela, mas é alcançável.
11. **Riscos:** dependências/estado/compatibilidade limitam a classificação; os IDs citados distinguem confirmação, hipótese e limite em diagnostico-problemas.md.
12. **Recomendação:** aplicar a prioridade dos IDs vinculados no plano, preservar dados/contratos e exigir regressão do fluxo principal; funcionalidades novas só na Fase E autorizada.

## M12 — Queda Matemática

1. **Nome/classificação:** Queda Matemática — Funcional com ressalvas.
2. **Objetivo:** Selecionar resultados na arena antes que atinjam o limite.
3. **Arquivos:** queda-matematica.html; js/queda-matematica.js; js/math-expressions.js; css/queda-matematica.css (frontend relativo a app/frontend; backend explicitado).
4. **Rotas/URLs:** /static/queda-matematica.html — domínio público ou origem local do ambiente.
5. **Dependências:** requestAnimationFrame; LearningData; estilos compartilhados.
6. **Implementado:** Três dificuldades, fases, placar, vidas, pausa/retomada, resultado e reinício.
7. **Incompleto/limites:** Não houve promoção nesta auditoria; conclusão no navegador é exercitada também por fixture temporal, não apenas por carregamento.
8. **Integração:** requestAnimationFrame; LearningData; estilos compartilhados; contratos e persistência detalhados em arquitetura.md. Ausência de DB não implica conexão oculta com PostgreSQL.
9. **Testes/evidências:** 3000 conjuntos de opções; UI com relógio controlado; hit testing em 19 viewports; Firefox.
10. **Problemas:** A002: Pausar/Reiniciar encobertos em telas horizontais na publicação; correção local prévia só em DEV.
11. **Riscos:** dependências/estado/compatibilidade limitam a classificação; os IDs citados distinguem confirmação, hipótese e limite em diagnostico-problemas.md.
12. **Recomendação:** aplicar a prioridade dos IDs vinculados no plano, preservar dados/contratos e exigir regressão do fluxo principal; funcionalidades novas só na Fase E autorizada.

## M13 — Racha-Cuca

1. **Nome/classificação:** Racha-Cuca — Funcional e validado.
2. **Objetivo:** Ordenar peças matemáticas, textos e versículos.
3. **Arquivos:** racha-cuca.html; js/racha-cuca*.js; data/racha-cuca-*.js; css/racha-cuca.css (frontend relativo a app/frontend; backend explicitado).
4. **Rotas/URLs:** /static/racha-cuca.html — domínio público ou origem local do ambiente.
5. **Dependências:** Engine; conteúdos; arquivo local de resultados.
6. **Implementado:** Três temas; quatro modalidades matemáticas; três dificuldades; dica, movimentos, vitória, reset e novo jogo.
7. **Incompleto/limites:** Todas as combinações de textos/tabuadas e puzzles 4×4 não foram concluídas naturalmente; outras modalidades têm testes de motor/UI.
8. **Integração:** Engine; conteúdos; arquivo local de resultados; contratos e persistência detalhados em arquitetura.md. Ausência de DB não implica conexão oculta com PostgreSQL.
9. **Testes/evidências:** 2847 verificações de regras; UI dos temas; quebra-cabeça textual 3×3 resolvido por movimentos legais até a vitória, com replay.
10. **Problemas:** V002: parte dos controles requer rolagem; não é falha de início.
11. **Riscos:** dependências/estado/compatibilidade limitam a classificação; os IDs citados distinguem confirmação, hipótese e limite em diagnostico-problemas.md.
12. **Recomendação:** aplicar a prioridade dos IDs vinculados no plano, preservar dados/contratos e exigir regressão do fluxo principal; funcionalidades novas só na Fase E autorizada.

## M14 — Motor de Prática Matemática

1. **Nome/classificação:** Motor de Prática Matemática — Funcional e validado.
2. **Objetivo:** Renderizar questões, corrigir respostas e explicar resoluções.
3. **Arquivos:** fundamentos-matematicos.html; js/math-practice.js; data/math-subjects.js (frontend relativo a app/frontend; backend explicitado).
4. **Rotas/URLs:** /static/fundamentos-matematicos.html?assunto=… — domínio público ou origem local do ambiente.
5. **Dependências:** Catálogo MathSubjects; formulários; frações.
6. **Implementado:** Dicas, resolução, feedback, anterior/próximo, resumo e revisão; erro amigável para assunto ausente.
7. **Incompleto/limites:** Sem lacuna obrigatória comprovada no fluxo principal; a validação é limitada aos cenários registrados.
8. **Integração:** Catálogo MathSubjects; formulários; frações; contratos e persistência detalhados em arquitetura.md. Ausência de DB não implica conexão oculta com PostgreSQL.
9. **Testes/evidências:** math_practice em dez larguras; 12 exercícios resolvidos; navegação física.
10. **Problemas:** A007: progresso dessas práticas é da visita, sem conta central.
11. **Riscos:** dependências/estado/compatibilidade limitam a classificação; os IDs citados distinguem confirmação, hipótese e limite em diagnostico-problemas.md.
12. **Recomendação:** aplicar a prioridade dos IDs vinculados no plano, preservar dados/contratos e exigir regressão do fluxo principal; funcionalidades novas só na Fase E autorizada.

## M15 — Frações

1. **Nome/classificação:** Frações — Funcional e validado.
2. **Objetivo:** Ensinar e praticar o assunto em três exercícios.
3. **Arquivos:** data/math-subjects.js; fundamentos-matematicos.html; js/math-practice.js (frontend relativo a app/frontend; backend explicitado).
4. **Rotas/URLs:** /static/fundamentos-matematicos.html?assunto=fracoes — domínio público ou origem local do ambiente.
5. **Dependências:** Motor de Prática Matemática.
6. **Implementado:** Representação/simplificação, soma e equação simples com frações.
7. **Incompleto/limites:** Sem lacuna obrigatória comprovada no fluxo principal; a validação é limitada aos cenários registrados.
8. **Integração:** Motor de Prática Matemática; contratos e persistência detalhados em arquitetura.md. Ausência de DB não implica conexão oculta com PostgreSQL.
9. **Testes/evidências:** Três exercícios por assunto; acerto, erro, dica, resolução, resumo e retorno.
10. **Problemas:** Escopo inicial de três exercícios por assunto; não equivale a currículo completo.
11. **Riscos:** dependências/estado/compatibilidade limitam a classificação; os IDs citados distinguem confirmação, hipótese e limite em diagnostico-problemas.md.
12. **Recomendação:** aplicar a prioridade dos IDs vinculados no plano, preservar dados/contratos e exigir regressão do fluxo principal; funcionalidades novas só na Fase E autorizada.

## M16 — Multiplicação e Divisão

1. **Nome/classificação:** Multiplicação e Divisão — Funcional e validado.
2. **Objetivo:** Ensinar e praticar o assunto em três exercícios.
3. **Arquivos:** data/math-subjects.js; fundamentos-matematicos.html; js/math-practice.js (frontend relativo a app/frontend; backend explicitado).
4. **Rotas/URLs:** /static/fundamentos-matematicos.html?assunto=multiplicacao-divisao — domínio público ou origem local do ambiente.
5. **Dependências:** Motor de Prática Matemática.
6. **Implementado:** Tabuada, sinal de produto e divisão.
7. **Incompleto/limites:** Sem lacuna obrigatória comprovada no fluxo principal; a validação é limitada aos cenários registrados.
8. **Integração:** Motor de Prática Matemática; contratos e persistência detalhados em arquitetura.md. Ausência de DB não implica conexão oculta com PostgreSQL.
9. **Testes/evidências:** Três exercícios por assunto; acerto, erro, dica, resolução, resumo e retorno.
10. **Problemas:** Escopo inicial de três exercícios por assunto; não equivale a currículo completo.
11. **Riscos:** dependências/estado/compatibilidade limitam a classificação; os IDs citados distinguem confirmação, hipótese e limite em diagnostico-problemas.md.
12. **Recomendação:** aplicar a prioridade dos IDs vinculados no plano, preservar dados/contratos e exigir regressão do fluxo principal; funcionalidades novas só na Fase E autorizada.

## M17 — Potenciação

1. **Nome/classificação:** Potenciação — Funcional e validado.
2. **Objetivo:** Ensinar e praticar o assunto em três exercícios.
3. **Arquivos:** data/math-subjects.js; fundamentos-matematicos.html; js/math-practice.js (frontend relativo a app/frontend; backend explicitado).
4. **Rotas/URLs:** /static/fundamentos-matematicos.html?assunto=potenciacao — domínio público ou origem local do ambiente.
5. **Dependências:** Motor de Prática Matemática.
6. **Implementado:** Expoentes, propriedades e alternativas com discussão das soluções.
7. **Incompleto/limites:** Sem lacuna obrigatória comprovada no fluxo principal; a validação é limitada aos cenários registrados.
8. **Integração:** Motor de Prática Matemática; contratos e persistência detalhados em arquitetura.md. Ausência de DB não implica conexão oculta com PostgreSQL.
9. **Testes/evidências:** Três exercícios por assunto; acerto, erro, dica, resolução, resumo e retorno.
10. **Problemas:** Escopo inicial de três exercícios por assunto; não equivale a currículo completo.
11. **Riscos:** dependências/estado/compatibilidade limitam a classificação; os IDs citados distinguem confirmação, hipótese e limite em diagnostico-problemas.md.
12. **Recomendação:** aplicar a prioridade dos IDs vinculados no plano, preservar dados/contratos e exigir regressão do fluxo principal; funcionalidades novas só na Fase E autorizada.

## M18 — Expressões Algébricas

1. **Nome/classificação:** Expressões Algébricas — Funcional e validado.
2. **Objetivo:** Ensinar e praticar o assunto em três exercícios.
3. **Arquivos:** data/math-subjects.js; fundamentos-matematicos.html; js/math-practice.js (frontend relativo a app/frontend; backend explicitado).
4. **Rotas/URLs:** /static/fundamentos-matematicos.html?assunto=expressoes-algebricas — domínio público ou origem local do ambiente.
5. **Dependências:** Motor de Prática Matemática.
6. **Implementado:** Tradução e avaliação de expressões em respostas/alternativas.
7. **Incompleto/limites:** Sem lacuna obrigatória comprovada no fluxo principal; a validação é limitada aos cenários registrados.
8. **Integração:** Motor de Prática Matemática; contratos e persistência detalhados em arquitetura.md. Ausência de DB não implica conexão oculta com PostgreSQL.
9. **Testes/evidências:** Três exercícios por assunto; acerto, erro, dica, resolução, resumo e retorno.
10. **Problemas:** Escopo inicial de três exercícios por assunto; não equivale a currículo completo.
11. **Riscos:** dependências/estado/compatibilidade limitam a classificação; os IDs citados distinguem confirmação, hipótese e limite em diagnostico-problemas.md.
12. **Recomendação:** aplicar a prioridade dos IDs vinculados no plano, preservar dados/contratos e exigir regressão do fluxo principal; funcionalidades novas só na Fase E autorizada.

## M19 — Função do 1º Grau

1. **Nome/classificação:** Função do 1º Grau — Funcional e validado.
2. **Objetivo:** Explorar coeficientes, raiz e gráfico linear.
3. **Arquivos:** primeiro-grau.html; js/primeiro-grau.js; css/style.css (frontend relativo a app/frontend; backend explicitado).
4. **Rotas/URLs:** /static/primeiro-grau.html — domínio público ou origem local do ambiente.
5. **Dependências:** Chart.js local 4.4.7.
6. **Implementado:** Campos, raiz, comportamento, intercepto e gráfico com 101 amostras; validação de vazio/finito/intervalo.
7. **Incompleto/limites:** Sem lacuna obrigatória comprovada no fluxo principal; a validação é limitada aos cenários registrados.
8. **Integração:** Chart.js local 4.4.7; contratos e persistência detalhados em arquitetura.md. Ausência de DB não implica conexão oculta com PostgreSQL.
9. **Testes/evidências:** primeiro-grau.test.js; math_practice; cálculo normal por navegação.
10. **Problemas:** V006/A015: cabeçalho/título repetido e dependência síncrona do gráfico.
11. **Riscos:** dependências/estado/compatibilidade limitam a classificação; os IDs citados distinguem confirmação, hipótese e limite em diagnostico-problemas.md.
12. **Recomendação:** aplicar a prioridade dos IDs vinculados no plano, preservar dados/contratos e exigir regressão do fluxo principal; funcionalidades novas só na Fase E autorizada.

## M20 — Função do 2º Grau

1. **Nome/classificação:** Função do 2º Grau — Funcional com ressalvas.
2. **Objetivo:** Explorar raízes, discriminante, vértice, curva e tabela.
3. **Arquivos:** segundo-grau.html; js/app.js; css/style.css (frontend relativo a app/frontend; backend explicitado).
4. **Rotas/URLs:** /static/segundo-grau.html — domínio público ou origem local do ambiente.
5. **Dependências:** Chart.js local 4.4.7.
6. **Implementado:** Cálculo padrão e tabela de inteiros; alertas para a=0 e limites invertidos.
7. **Incompleto/limites:** Casos extremos não foram executados no thread da página pública para evitar travamento; não há suíte dedicada equivalente à de 1º grau.
8. **Integração:** Chart.js local 4.4.7; contratos e persistência detalhados em arquitetura.md. Ausência de DB não implica conexão oculta com PostgreSQL.
9. **Testes/evidências:** Cálculo real de raízes 1/3; Firefox; casos extremos em Worker com limite de tempo.
10. **Problemas:** A004/A010: laços sem teto/progresso garantido; campo vazio é convertido em zero.
11. **Riscos:** dependências/estado/compatibilidade limitam a classificação; os IDs citados distinguem confirmação, hipótese e limite em diagnostico-problemas.md.
12. **Recomendação:** aplicar a prioridade dos IDs vinculados no plano, preservar dados/contratos e exigir regressão do fluxo principal; funcionalidades novas só na Fase E autorizada.

## M21 — Laboratório e editor Python

1. **Nome/classificação:** Laboratório e editor Python — Funcional com ressalvas.
2. **Objetivo:** Executar programas e praticar cinco desafios ou 18 da trilha de DS.
3. **Arquivos:** python.html; js/python-*.js; data/python-exercises.js; vendor/micropython/ (frontend relativo a app/frontend; backend explicitado).
4. **Rotas/URLs:** /static/python.html; ?trail=fundamentos&exercise=… — domínio público ou origem local do ambiente.
5. **Dependências:** MicroPython 1.27; WASM; iframe opaco; Worker; localStorage.
6. **Implementado:** Editor, execução, parar/restaurar, dica, comparação de saída, trilha e rascunhos.
7. **Incompleto/limites:** input interativo e bibliotecas científicas de CPython não existem neste runtime; editor não é IDE completa; validação verifica saída, não a estratégia usada.
8. **Integração:** MicroPython 1.27; WASM; iframe opaco; Worker; localStorage; contratos e persistência detalhados em arquitetura.md. Ausência de DB não implica conexão oculta com PostgreSQL.
9. **Testes/evidências:** 22 verificações do executor; cinco exercícios originais; 18 exemplos de DS; código correto/incorreto e reload.
10. **Problemas:** A003: registro nulo de exercício impede inicialização; A007; biblioteca limitada intencionalmente.
11. **Riscos:** dependências/estado/compatibilidade limitam a classificação; os IDs citados distinguem confirmação, hipótese e limite em diagnostico-problemas.md.
12. **Recomendação:** aplicar a prioridade dos IDs vinculados no plano, preservar dados/contratos e exigir regressão do fluxo principal; funcionalidades novas só na Fase E autorizada.

## M22 — Hub de Data Science

1. **Nome/classificação:** Hub de Data Science — Funcional com ressalvas.
2. **Objetivo:** Organizar trilha, laboratórios e experiências rápidas.
3. **Arquivos:** data-science.html; js/data-science*.js; css/data-science*.css (frontend relativo a app/frontend; backend explicitado).
4. **Rotas/URLs:** /static/data-science.html — domínio público ou origem local do ambiente.
5. **Dependências:** FoundationProgress; LearningData; carrosséis.
6. **Implementado:** Retomada, oito etapas, laboratório XGBoost, prévias, conquistas e três experimentos.
7. **Incompleto/limites:** As etapas marcadas Em breve não são cursos implementados; ver M34.
8. **Integração:** FoundationProgress; LearningData; carrosséis; contratos e persistência detalhados em arquitetura.md. Ausência de DB não implica conexão oculta com PostgreSQL.
9. **Testes/evidências:** xgboost_lab; data_science_enrichment; navegação/AX/19 viewports.
10. **Problemas:** V003/V004: muitos padrões de cartões e grande altura; parte da trilha é prévia.
11. **Riscos:** dependências/estado/compatibilidade limitam a classificação; os IDs citados distinguem confirmação, hipótese e limite em diagnostico-problemas.md.
12. **Recomendação:** aplicar a prioridade dos IDs vinculados no plano, preservar dados/contratos e exigir regressão do fluxo principal; funcionalidades novas só na Fase E autorizada.

## M23 — Fundamentos de Data Science

1. **Nome/classificação:** Fundamentos de Data Science — Funcional e validado.
2. **Objetivo:** Ensinar 18 tópicos de estatística, dados e Python com ponte SQL.
3. **Arquivos:** data-science/fundamentos.html; data/data-science/fundamentos.js; js/foundation-lesson.js; foundation-progress.js (frontend relativo a app/frontend; backend explicitado).
4. **Rotas/URLs:** /static/data-science/fundamentos.html#ds-fund-… — domínio público ou origem local do ambiente.
5. **Dependências:** Datasets fictícios; Python; progresso compartilhado.
6. **Implementado:** Aulas, exemplos, resultados, simuladores de média/mediana/moda, laboratório contextual e retomada.
7. **Incompleto/limites:** Sem lacuna obrigatória comprovada no fluxo principal; a validação é limitada aos cenários registrados.
8. **Integração:** Datasets fictícios; Python; progresso compartilhado; contratos e persistência detalhados em arquitetura.md. Ausência de DB não implica conexão oculta com PostgreSQL.
9. **Testes/evidências:** 18 exemplos executados; simuladores; erro/acerto, reload, 18/18 por fixture e eventos de storage.
10. **Problemas:** A007/V003: progresso local e diferentes contratos visuais; exercícios não fazem SQL no servidor.
11. **Riscos:** dependências/estado/compatibilidade limitam a classificação; os IDs citados distinguem confirmação, hipótese e limite em diagnostico-problemas.md.
12. **Recomendação:** aplicar a prioridade dos IDs vinculados no plano, preservar dados/contratos e exigir regressão do fluxo principal; funcionalidades novas só na Fase E autorizada.

## M24 — Meus Dados

1. **Nome/classificação:** Meus Dados — Funcional e validado.
2. **Objetivo:** Interpretar as tentativas realizadas nos dois jogos integrados.
3. **Arquivos:** data-science.html#dados; js/data-science.js; data-science-core.js; learning-data.js (frontend relativo a app/frontend; backend explicitado).
4. **Rotas/URLs:** /static/data-science.html#dados — domínio público ou origem local do ambiente.
5. **Dependências:** LearningData de Queda/Relâmpago.
6. **Implementado:** Filtros, acurácia, tempo, operações, últimas respostas, questionário e exclusão confirmada do próprio histórico local.
7. **Incompleto/limites:** Sem lacuna obrigatória comprovada no fluxo principal; a validação é limitada aos cenários registrados.
8. **Integração:** LearningData de Queda/Relâmpago; contratos e persistência detalhados em arquitetura.md. Ausência de DB não implica conexão oculta com PostgreSQL.
9. **Testes/evidências:** data_science_enrichment; geração real de dez acertos e leitura no hub.
10. **Problemas:** A007: somente dois jogos alimentam tentativas; não é histórico central de alunos.
11. **Riscos:** dependências/estado/compatibilidade limitam a classificação; os IDs citados distinguem confirmação, hipótese e limite em diagnostico-problemas.md.
12. **Recomendação:** aplicar a prioridade dos IDs vinculados no plano, preservar dados/contratos e exigir regressão do fluxo principal; funcionalidades novas só na Fase E autorizada.

## M25 — Laboratório de Dados

1. **Nome/classificação:** Laboratório de Dados — Funcional e validado.
2. **Objetivo:** Experimentar porcentagem, média/mediana e moda com valores pequenos.
3. **Arquivos:** data-science.html#laboratorio; js/data-science.js; data-science-core.js (frontend relativo a app/frontend; backend explicitado).
4. **Rotas/URLs:** /static/data-science.html#laboratorio — domínio público ou origem local do ambiente.
5. **Dependências:** SVG/DOM; estatística JS; conquistas locais.
6. **Implementado:** Três níveis, botões de alterar valores, gráfico, perguntas e feedback.
7. **Incompleto/limites:** Sem lacuna obrigatória comprovada no fluxo principal; a validação é limitada aos cenários registrados.
8. **Integração:** SVG/DOM; estatística JS; conquistas locais; contratos e persistência detalhados em arquitetura.md. Ausência de DB não implica conexão oculta com PostgreSQL.
9. **Testes/evidências:** Suíte DS e cliques reais em valores/perguntas.
10. **Problemas:** Conteúdo didático fictício; sem integração com pandas ou banco real.
11. **Riscos:** dependências/estado/compatibilidade limitam a classificação; os IDs citados distinguem confirmação, hipótese e limite em diagnostico-problemas.md.
12. **Recomendação:** aplicar a prioridade dos IDs vinculados no plano, preservar dados/contratos e exigir regressão do fluxo principal; funcionalidades novas só na Fase E autorizada.

## M26 — Treine sua IA — k-NN

1. **Nome/classificação:** Treine sua IA — k-NN — Funcional e validado.
2. **Objetivo:** Ensinar exemplos, rótulos, vizinhos e avaliação.
3. **Arquivos:** data-science.html#ia; js/data-science*.js (frontend relativo a app/frontend; backend explicitado).
4. **Rotas/URLs:** /static/data-science.html#ia — domínio público ou origem local do ambiente.
5. **Dependências:** k-NN em JS; dados fictícios; armazenamento local.
6. **Implementado:** Exemplos, seis sugestões, k=1/3/5, treino, previsão, teste separado e histórico.
7. **Incompleto/limites:** Sem lacuna obrigatória comprovada no fluxo principal; a validação é limitada aos cenários registrados.
8. **Integração:** k-NN em JS; dados fictícios; armazenamento local; contratos e persistência detalhados em arquitetura.md. Ausência de DB não implica conexão oculta com PostgreSQL.
9. **Testes/evidências:** Motor estatístico; UI; treino/previsão física por navegação normal.
10. **Problemas:** Limitação didática explícita: altura/peso não classificam espécies de verdade.
11. **Riscos:** dependências/estado/compatibilidade limitam a classificação; os IDs citados distinguem confirmação, hipótese e limite em diagnostico-problemas.md.
12. **Recomendação:** aplicar a prioridade dos IDs vinculados no plano, preservar dados/contratos e exigir regressão do fluxo principal; funcionalidades novas só na Fase E autorizada.

## M27 — Laboratório XGBoost

1. **Nome/classificação:** Laboratório XGBoost — Funcional com ressalvas.
2. **Objetivo:** Executar classificação e regressão com datasets e previsões.
3. **Arquivos:** data-science/machine-learning/xgboost.html; js/ml-lab.js; css/ml-lab.css (frontend relativo a app/frontend; backend explicitado).
4. **Rotas/URLs:** /static/data-science/machine-learning/xgboost.html — domínio público ou origem local do ambiente.
5. **Dependências:** API ML; scikit-learn; XGBoost CPU.
6. **Implementado:** Demo/CSV, seleção de features/target, parâmetros, treino, métricas/gráficos, importância, previsão e liberação.
7. **Incompleto/limites:** Treino/upload não foram exercitados no serviço de PRODUÇÃO; resultados não sobrevivem a expiração/reinício; não é MLOps produtivo.
8. **Integração:** API ML; scikit-learn; XGBoost CPU; contratos e persistência detalhados em arquitetura.md. Ausência de DB não implica conexão oculta com PostgreSQL.
9. **Testes/evidências:** xgboost_lab isolado: classificação, regressão, upload, nulos/categorias, erro/invalidação; treino real em DEV.
10. **Problemas:** A008/A009/S004: capacidade efêmera/global e risco de rate limit compartilhado.
11. **Riscos:** dependências/estado/compatibilidade limitam a classificação; os IDs citados distinguem confirmação, hipótese e limite em diagnostico-problemas.md.
12. **Recomendação:** aplicar a prioridade dos IDs vinculados no plano, preservar dados/contratos e exigir regressão do fluxo principal; funcionalidades novas só na Fase E autorizada.

## M28 — Serviço e API da Dama

1. **Nome/classificação:** Serviço e API da Dama — Funcional com ressalvas.
2. **Objetivo:** Manter salas e arbitrar movimentos no backend.
3. **Arquivos:** backend/src/routes/dama.py; models/dama.py; schemas/dama.py; services/dama*.py (frontend relativo a app/frontend; backend explicitado).
4. **Rotas/URLs:** /api/dama/*; /ws/dama/{room_id} — domínio público ou origem local do ambiente.
5. **Dependências:** FastAPI; WebSockets; memória; rate limiter.
6. **Implementado:** Token de sessão, autenticação, revisão, cores, início, broadcast, reconexão, TTL e limpeza periódica.
7. **Incompleto/limites:** Sem lacuna obrigatória comprovada no fluxo principal; a validação é limitada aos cenários registrados.
8. **Integração:** FastAPI; WebSockets; memória; rate limiter; contratos e persistência detalhados em arquitetura.md. Ausência de DB não implica conexão oculta com PostgreSQL.
9. **Testes/evidências:** Backend em processos isolados; dois navegadores reais e saída das salas de auditoria.
10. **Problemas:** A001/A007/S004: origens locais ausentes na versão publicada; estado por processo; proxy/IP precisa validação.
11. **Riscos:** dependências/estado/compatibilidade limitam a classificação; os IDs citados distinguem confirmação, hipótese e limite em diagnostico-problemas.md.
12. **Recomendação:** aplicar a prioridade dos IDs vinculados no plano, preservar dados/contratos e exigir regressão do fluxo principal; funcionalidades novas só na Fase E autorizada.

## M29 — Serviço e APIs de Machine Learning

1. **Nome/classificação:** Serviço e APIs de Machine Learning — Funcional com ressalvas.
2. **Objetivo:** Validar dados e executar experimentos limitados em CPU.
3. **Arquivos:** backend/src/routes/ml.py; schemas/ml.py; config/ml.py; services/ml/* (frontend relativo a app/frontend; backend explicitado).
4. **Rotas/URLs:** /api/ml/* — domínio público ou origem local do ambiente.
5. **Dependências:** pandas; NumPy; sklearn; xgboost-cpu; MemoryStore.
6. **Implementado:** CSV UTF-8 delimitado, limites, pré-processamento treinado só no split de treino, classificação/regressão, previsão, release.
7. **Incompleto/limites:** Sem autenticação de aluno, persistência ou escalabilidade multiworker; IDs aleatórios funcionam como capacidades efêmeras.
8. **Integração:** pandas; NumPy; sklearn; xgboost-cpu; MemoryStore; contratos e persistência detalhados em arquitetura.md. Ausência de DB não implica conexão oculta com PostgreSQL.
9. **Testes/evidências:** 11 métodos de ML na suíte backend; servidor HTTP isolado; treino/previsão em DEV.
10. **Problemas:** A008/S004/A009: capacidade compartilhada, limites por processo/IP e build não fixado.
11. **Riscos:** dependências/estado/compatibilidade limitam a classificação; os IDs citados distinguem confirmação, hipótese e limite em diagnostico-problemas.md.
12. **Recomendação:** aplicar a prioridade dos IDs vinculados no plano, preservar dados/contratos e exigir regressão do fluxo principal; funcionalidades novas só na Fase E autorizada.

## M30 — Notebook de Fundamentos

1. **Nome/classificação:** Notebook de Fundamentos — Funcional e validado.
2. **Objetivo:** Oferecer exemplos locais em Python/Jupyter.
3. **Arquivos:** data-science/modulo1_fundamentos/01_introducao.ipynb; data-science/requirements.txt (frontend relativo a app/frontend; backend explicitado).
4. **Rotas/URLs:** Repositório; não há endpoint Jupyter — domínio público ou origem local do ambiente.
5. **Dependências:** Python 3; Jupyter opcional.
6. **Implementado:** 36 células de código com exemplos e ponte SQL.
7. **Incompleto/limites:** Sem lacuna obrigatória comprovada no fluxo principal; a validação é limitada aos cenários registrados.
8. **Integração:** Python 3; Jupyter opcional; contratos e persistência detalhados em arquitetura.md. Ausência de DB não implica conexão oculta com PostgreSQL.
9. **Testes/evidências:** 36 células executadas sequencialmente sem erro, sem rede/arquivos pessoais.
10. **Problemas:** Jupyter não está integrado ao site; dependência isolada jupyter não fixada.
11. **Riscos:** dependências/estado/compatibilidade limitam a classificação; os IDs citados distinguem confirmação, hipótese e limite em diagnostico-problemas.md.
12. **Recomendação:** aplicar a prioridade dos IDs vinculados no plano, preservar dados/contratos e exigir regressão do fluxo principal; funcionalidades novas só na Fase E autorizada.

## M31 — Pacote offline de Dama e treinamento

1. **Nome/classificação:** Pacote offline de Dama e treinamento — Parcialmente implementado.
2. **Objetivo:** Permitir experimentos de agentes/modelos fora do site.
3. **Arquivos:** data-science/dama/src/equacionei_dama/*; pyproject.toml; web/train.py; web/train.js (frontend relativo a app/frontend; backend explicitado).
4. **Rotas/URLs:** Pacote Python; entrada dama-lab declarada — domínio público ou origem local do ambiente.
5. **Dependências:** NumPy; motor próprio; exportação para DamaModels JS.
6. **Implementado:** Estado imutável, agentes random/minimax/MCTS/TD e modelos lineares; geração JS documentada.
7. **Incompleto/limites:** CLI declarado não pode iniciar; não há harness completo de avaliação/treino como comando instalado. train.py não foi executado porque sobrescreve o modelo funcional.
8. **Integração:** NumPy; motor próprio; exportação para DamaModels JS; contratos e persistência detalhados em arquitetura.md. Ausência de DB não implica conexão oculta com PostgreSQL.
9. **Testes/evidências:** Smoke: sete ações iniciais, transição legal, minimax/MCTS; inspeção do entrypoint.
10. **Problemas:** A012/A016: equacionei_dama.cli não existe; motores paralelos exigem contrato/paridade.
11. **Riscos:** dependências/estado/compatibilidade limitam a classificação; os IDs citados distinguem confirmação, hipótese e limite em diagnostico-problemas.md.
12. **Recomendação:** aplicar a prioridade dos IDs vinculados no plano, preservar dados/contratos e exigir regressão do fluxo principal; funcionalidades novas só na Fase E autorizada.

## M32 — PostgreSQL e persistência relacional

1. **Nome/classificação:** PostgreSQL e persistência relacional — Parcialmente implementado.
2. **Objetivo:** Reservar infraestrutura de banco para futuras funções.
3. **Arquivos:** database/init/; migrations/; seeds/ (.gitkeep); container postgres (frontend relativo a app/frontend; backend explicitado).
4. **Rotas/URLs:** Host 5432; nenhum endpoint atual usa DB — domínio público ou origem local do ambiente.
5. **Dependências:** PostgreSQL 17.11; volume Docker.
6. **Implementado:** Serviço e dois bancos acessíveis por inspeção somente leitura.
7. **Incompleto/limites:** Zero tabelas de aplicação e zero FKs nos bancos inspecionados; sem migrations, ORM, driver ou conexão do backend.
8. **Integração:** PostgreSQL 17.11; volume Docker; contratos e persistência detalhados em arquitetura.md. Ausência de DB não implica conexão oculta com PostgreSQL.
9. **Testes/evidências:** Consultas READ ONLY de catálogo, tabelas, FKs, autenticação e SSL.
10. **Problemas:** S001/A011: bind externo e SSL off; estratégia de backup/restore não comprovada.
11. **Riscos:** dependências/estado/compatibilidade limitam a classificação; os IDs citados distinguem confirmação, hipótese e limite em diagnostico-problemas.md.
12. **Recomendação:** aplicar a prioridade dos IDs vinculados no plano, preservar dados/contratos e exigir regressão do fluxo principal; funcionalidades novas só na Fase E autorizada.

## M33 — Construção, publicação e CI

1. **Nome/classificação:** Construção, publicação e CI — Parcialmente implementado.
2. **Objetivo:** Promover o mesmo artefato entre ambientes e permitir rollback.
3. **Arquivos:** Dockerfile backend; docker-compose*.yml; .github/workflows/ci.yml; private/releases/ (frontend relativo a app/frontend; backend explicitado).
4. **Rotas/URLs:** DEV develop/8000; TESTE staging/8002; PROD main/8001 — domínio público ou origem local do ambiente.
5. **Dependências:** Docker; Git; operação manual; túnel público.
6. **Implementado:** Imagens por digest e artefatos de rollback preservados; registros de release.
7. **Incompleto/limites:** Workflow só contém comentário; frontend Dockerfile/nginx.conf são placeholders; não há pipeline executável completo.
8. **Integração:** Docker; Git; operação manual; túnel público; contratos e persistência detalhados em arquitetura.md. Ausência de DB não implica conexão oculta com PostgreSQL.
9. **Testes/evidências:** Inspeção dos três containers, 125 arquivos por ambiente, refs remotas e imagens.
10. **Problemas:** A005/A006/A009/A013: DEV drift, CI vazia, deps não fixadas e documentação-base incompleta.
11. **Riscos:** dependências/estado/compatibilidade limitam a classificação; os IDs citados distinguem confirmação, hipótese e limite em diagnostico-problemas.md.
12. **Recomendação:** aplicar a prioridade dos IDs vinculados no plano, preservar dados/contratos e exigir regressão do fluxo principal; funcionalidades novas só na Fase E autorizada.

## M34 — Prévias e roadmap de Data Science

1. **Nome/classificação:** Prévias e roadmap de Data Science — Parcialmente implementado.
2. **Objetivo:** Comunicar o que ainda será desenvolvido.
3. **Arquivos:** data-science.html; ds-stage-grid; ds-lab-carousel; ds-explore-grid (frontend relativo a app/frontend; backend explicitado).
4. **Rotas/URLs:** Hashes #etapa-02/03/05/06/07/projeto; prévias de laboratórios — domínio público ou origem local do ambiente.
5. **Dependências:** Hub; details/summary.
6. **Implementado:** Prévias de Análise, Preparação, Avaliação, Comunicação, Deploy, Projeto, Decision Tree, Comparador, Séries temporais e NLP.
7. **Incompleto/limites:** Dez prévias/temas futuros não têm implementação operacional independente; ML já possui XGBoost e não é marcado como totalmente ausente.
8. **Integração:** Hub; details/summary; contratos e persistência detalhados em arquitetura.md. Ausência de DB não implica conexão oculta com PostgreSQL.
9. **Testes/evidências:** Inspeção do HTML; abertura de details na suíte xgboost_lab.
10. **Problemas:** Não é falha o rótulo Em breve; não contabilizar prévias como cursos operacionais.
11. **Riscos:** dependências/estado/compatibilidade limitam a classificação; os IDs citados distinguem confirmação, hipótese e limite em diagnostico-problemas.md.
12. **Recomendação:** aplicar a prioridade dos IDs vinculados no plano, preservar dados/contratos e exigir regressão do fluxo principal; funcionalidades novas só na Fase E autorizada.

## M35 — Infraestrutura de assets de branding

1. **Nome/classificação:** Infraestrutura de assets de branding — Parcialmente implementado.
2. **Objetivo:** Preparar entrada futura de logo, banners e favicon oficiais.
3. **Arquivos:** assets/branding/{logo,banners,favicon}/.gitkeep; docs/branding-assets.md; tests/browser/branding_assets.py (frontend relativo a app/frontend; backend explicitado).
4. **Rotas/URLs:** Marca atual em HTML/CSS; favicon solicitado em /favicon.ico — domínio público ou origem local do ambiente.
5. **Dependências:** Trabalho local não versionado; banner existente.
6. **Implementado:** Diretórios reservados e teste antecipado; identidade atual funciona com texto e WebP.
7. **Incompleto/limites:** Não há integração funcional do mecanismo esperado pelo teste; arquivos oficiais não foram instalados/publicados.
8. **Integração:** Trabalho local não versionado; banner existente; contratos e persistência detalhados em arquitetura.md. Ausência de DB não implica conexão oculta com PostgreSQL.
9. **Testes/evidências:** Teste local isolado branding_assets: reprovado, global EQUACIONEI_BRANDING_ASSETS inexistente.
10. **Problemas:** A014: contrato do teste não existe; favicon 404. Não alterar/aprovar branding nesta etapa.
11. **Riscos:** dependências/estado/compatibilidade limitam a classificação; os IDs citados distinguem confirmação, hipótese e limite em diagnostico-problemas.md.
12. **Recomendação:** aplicar a prioridade dos IDs vinculados no plano, preservar dados/contratos e exigir regressão do fluxo principal; funcionalidades novas só na Fase E autorizada.
