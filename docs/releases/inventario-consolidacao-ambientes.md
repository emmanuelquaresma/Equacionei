# Inventário, consolidação e sincronização dos ambientes

Data: 15/10/2026. Base Git: `b0a2ef0c01458b1e17fe4b34acdf29ef1acecd73`. Inventário prévio: auditoria coletada desde 13/10, documentação em `docs/auditoria-geral/`. Evidências extensas e rollback em `private/consolidacao-20261015/`, ignorado no Git e fora do frontend público.

## Critério da candidata

Consolidar somente as duas correções já implementadas e validadas: origens WebSocket exatas de loopback nas portas documentadas; altura intrínseca do painel da Queda para não encobrir controles em landscape. Manter a versão completa do Xadrez já existente no Git/TESTE/PROD, ausente na imagem antiga de DEV. Não implementar padronização visual, branding ou funcionalidades novas.

A aprovação técnica é delimitada à candidata e regressão; não significa homologação integral da plataforma. Pendências preexistentes A003 (progresso Python nulo), A004 (intervalos extremos da quadrática) e demais itens da auditoria permanecem abertas. PRODUÇÃO depende de decisão sobre essas pendências e de autorização explícita posterior. Nenhuma autorização de PRODUÇÃO recebida nesta tarefa.

## Estado anterior

Branches locais/remotas develop, staging e main em b0a2ef0; árvore principal main com três arquivos modificados e arquivos novos preservados. DEV: imagem 5e22c4288259, revisão declarada e765b437-dirty, cinco arquivos antigos do Xadrez e dois patches na camada gravável. TESTE/PROD: imagem 061961c7c4ae, revisão b0a2ef0, 125 arquivos comparados correspondem ao Git. Apps escutam apenas em 127.0.0.1:8000/8002/8001; público via HTTPS/Cloudflare. Inspeção local não comprova acesso externo direto às portas.

Antes de recriar DEV/TESTE serão preservadas imagens de rollback contendo suas camadas graváveis; nenhum volume é usado pelos aplicativos. PostgreSQL/volumes, Compose, Cloudflare e imagens antigas permanecem intactos. Salas e modelos são voláteis por processo: recriar o serviço encerra essas sessões; não há banco de alunos integrado. Não há alegação de continuidade das conexões WebSocket durante a troca.

## Inventário de módulos

“Implementado” não equivale a “aprovado pelo usuário”. Publicação anterior não é autorização nova. Colunas DEV/TESTE/PROD abaixo retratam o estado final; as ressalvas e classificações continuam vinculadas aos cenários da auditoria. A tabela anterior foi preservada no primeiro commit da candidata.

| Módulo | Implementado | Testado | DEV | TESTE | PROD | Pendências |
|---|---|---|---|---|---|---|
| Página inicial | Sim | 31 estados visuais; fluxos por navegação normal; teclado/AX. | Candidata presente; cenários registrados | Mesma candidata; cenários registrados | Base anterior; ressalvas da auditoria | V004/V006: oportunidades de padronização, sem bloqueio comprovado. |
| Navegação global e carrosséis | Sim | math_practice; xgboost_lab; navegação física em functional-flows. | Candidata presente; cenários registrados | Mesma candidata; cenários registrados | Base anterior; ressalvas da auditoria | V004/V005: aproveitamento e alvos das setas; sem evidência de link quebrado do último jogo. |
| Apresentação compartilhada dos jogos | Sim | 760 combinações de tela/viewport; geometria e hit testing. | Candidata presente; cenários registrados | Mesma candidata; cenários registrados | Base anterior; ressalvas da auditoria | A002; V001/V002/V003/V006: controles, limites de altura e cascata CSS. |
| Armazenamento local e progresso | Sim | data_science_enrichment; storage-shapes; eventos reais entre abas. | Candidata presente; cenários registrados | Mesma candidata; cenários registrados | Base anterior; ressalvas da auditoria | A003/A007: registro nulo bloqueia Python; dados locais não têm sincronização/backup central. |
| Sobre | Sim | Chrome em 19 viewports; AX/teclado. | Candidata presente; cenários registrados | Mesma candidata; cenários registrados | Base anterior; ressalvas da auditoria | V006: convenções visuais/rodapé. |
| Entrada de Desenvolvimento | Sim | Navegação normal até Python; 19 viewports. | Candidata presente; cenários registrados | Mesma candidata; cenários registrados | Base anterior; ressalvas da auditoria | V004: tamanho/ocupação dos cartões. |
| Xadrez e curso educativo | Sim | suite-head-xadrez: motor/perft, empates, 15 lições/30 exercícios, teclado, toque e AX; Firefox com jogada real. | 15 lições / 30 exercícios validados | 15 lições / 30 exercícios validados | 15 lições / 30 exercícios da base | A005/A007/V002: curso antigo em DEV; progresso educativo em memória; reinício distante no celular. |
| Dama local, IA e online | Sim | dama_bot; backend; dama-online; teclado físico; Firefox. | Local/IA/online; WS8000 validado | Local/IA/online; WS8002 validado | Público inicia; WS8001 direto rejeita | A001/AC001: WS recusa portas 8001/8002; foco cai no BODY após Enter; V002. |
| Labirinto Matemático | Sim | 3365 verificações do motor; UI com relógio/fixtures; movimento/pausa reais; Firefox. | Candidata presente; cenários registrados | Mesma candidata; cenários registrados | Base anterior; ressalvas da auditoria | AC002/V001/V002: Canvas sem mapa textual; mapa reduzido no desktop; controles e textos empilhados. |
| Desafio Relâmpago | Sim | math_practice/menu-game; dez acertos com entrada física, replay e dados no hub. | Candidata presente; cenários registrados | Mesma candidata; cenários registrados | Base anterior; ressalvas da auditoria | A007: recordes/histórico são locais, conforme o aviso do produto. |
| Jogo dos Pares | Sim | 300 rodadas do motor; três níveis completos por toque/mouse; replay real. | Candidata presente; cenários registrados | Mesma candidata; cenários registrados | Base anterior; ressalvas da auditoria | V002: em 375×667 o reinício fica parcialmente abaixo da primeira tela, mas é alcançável. |
| Queda Matemática | Sim | 3000 conjuntos de opções; UI com relógio controlado; hit testing em 19 viewports; Firefox. | 3 modos; pausa/reinício validados | 3 modos; pausa/reinício validados | Landscape com controles encobertos | A002: Pausar/Reiniciar encobertos em telas horizontais na publicação; correção local prévia só em DEV. |
| Racha-Cuca | Sim | 2847 verificações de regras; UI dos temas; quebra-cabeça textual 3×3 resolvido por movimentos legais até a vitória, com replay. | Candidata presente; cenários registrados | Mesma candidata; cenários registrados | Base anterior; ressalvas da auditoria | V002: parte dos controles requer rolagem; não é falha de início. |
| Motor de Prática Matemática | Sim | math_practice em dez larguras; 12 exercícios resolvidos; navegação física. | Candidata presente; cenários registrados | Mesma candidata; cenários registrados | Base anterior; ressalvas da auditoria | A007: progresso dessas práticas é da visita, sem conta central. |
| Frações | Sim | Três exercícios por assunto; acerto, erro, dica, resolução, resumo e retorno. | Candidata presente; cenários registrados | Mesma candidata; cenários registrados | Base anterior; ressalvas da auditoria | Escopo inicial de três exercícios por assunto; não equivale a currículo completo. |
| Multiplicação e Divisão | Sim | Três exercícios por assunto; acerto, erro, dica, resolução, resumo e retorno. | Candidata presente; cenários registrados | Mesma candidata; cenários registrados | Base anterior; ressalvas da auditoria | Escopo inicial de três exercícios por assunto; não equivale a currículo completo. |
| Potenciação | Sim | Três exercícios por assunto; acerto, erro, dica, resolução, resumo e retorno. | Candidata presente; cenários registrados | Mesma candidata; cenários registrados | Base anterior; ressalvas da auditoria | Escopo inicial de três exercícios por assunto; não equivale a currículo completo. |
| Expressões Algébricas | Sim | Três exercícios por assunto; acerto, erro, dica, resolução, resumo e retorno. | Candidata presente; cenários registrados | Mesma candidata; cenários registrados | Base anterior; ressalvas da auditoria | Escopo inicial de três exercícios por assunto; não equivale a currículo completo. |
| Função do 1º Grau | Sim | primeiro-grau.test.js; math_practice; cálculo normal por navegação. | Candidata presente; cenários registrados | Mesma candidata; cenários registrados | Base anterior; ressalvas da auditoria | V006/A015: cabeçalho/título repetido e dependência síncrona do gráfico. |
| Função do 2º Grau | Sim | Cálculo real de raízes 1/3; Firefox; casos extremos em Worker com limite de tempo. | Candidata presente; cenários registrados | Mesma candidata; cenários registrados | Base anterior; ressalvas da auditoria | A004/A010: laços sem teto/progresso garantido; campo vazio é convertido em zero. |
| Laboratório e editor Python | Sim | 22 verificações do executor; cinco exercícios originais; 18 exemplos de DS; código correto/incorreto e reload. | Candidata presente; cenários registrados | Mesma candidata; cenários registrados | Base anterior; ressalvas da auditoria | A003: registro nulo de exercício impede inicialização; A007; biblioteca limitada intencionalmente. |
| Hub de Data Science | Sim | xgboost_lab; data_science_enrichment; navegação/AX/19 viewports. | Candidata presente; cenários registrados | Mesma candidata; cenários registrados | Base anterior; ressalvas da auditoria | V003/V004: muitos padrões de cartões e grande altura; parte da trilha é prévia. |
| Fundamentos de Data Science | Sim | 18 exemplos executados; simuladores; erro/acerto, reload, 18/18 por fixture e eventos de storage. | Candidata presente; cenários registrados | Mesma candidata; cenários registrados | Base anterior; ressalvas da auditoria | A007/V003: progresso local e diferentes contratos visuais; exercícios não fazem SQL no servidor. |
| Meus Dados | Sim | data_science_enrichment; geração real de dez acertos e leitura no hub. | Candidata presente; cenários registrados | Mesma candidata; cenários registrados | Base anterior; ressalvas da auditoria | A007: somente dois jogos alimentam tentativas; não é histórico central de alunos. |
| Laboratório de Dados | Sim | Suíte DS e cliques reais em valores/perguntas. | Candidata presente; cenários registrados | Mesma candidata; cenários registrados | Base anterior; ressalvas da auditoria | Conteúdo didático fictício; sem integração com pandas ou banco real. |
| Treine sua IA — k-NN | Sim | Motor estatístico; UI; treino/previsão física por navegação normal. | Candidata presente; cenários registrados | Mesma candidata; cenários registrados | Base anterior; ressalvas da auditoria | Limitação didática explícita: altura/peso não classificam espécies de verdade. |
| Laboratório XGBoost | Sim | xgboost_lab isolado: classificação, regressão, upload, nulos/categorias, erro/invalidação; treino real em DEV. | Candidata presente; cenários registrados | Mesma candidata; cenários registrados | Base anterior; ressalvas da auditoria | A008/A009/S004: capacidade efêmera/global e risco de rate limit compartilhado. |
| Serviço e API da Dama | Sim | Backend em processos isolados; dois navegadores reais e saída das salas de auditoria. | Candidata presente; cenários registrados | Mesma candidata; cenários registrados | Base anterior; ressalvas da auditoria | A001/A007/S004: origens locais ausentes na versão publicada; estado por processo; proxy/IP precisa validação. |
| Serviço e APIs de Machine Learning | Sim | 11 métodos de ML na suíte backend; servidor HTTP isolado; treino/previsão em DEV. | Candidata presente; cenários registrados | Mesma candidata; cenários registrados | Base anterior; ressalvas da auditoria | A008/S004/A009: capacidade compartilhada, limites por processo/IP e build não fixado. |
| Notebook de Fundamentos | Sim | 36 células executadas sequencialmente sem erro, sem rede/arquivos pessoais. | Candidata presente; cenários registrados | Mesma candidata; cenários registrados | Base anterior; ressalvas da auditoria | Jupyter não está integrado ao site; dependência isolada jupyter não fixada. |
| Pacote offline de Dama e treinamento | Parcial | Smoke: sete ações iniciais, transição legal, minimax/MCTS; inspeção do entrypoint. | Parcial; sem nova funcionalidade publicada | Parcial; sem nova funcionalidade publicada | Parcial; sem nova funcionalidade publicada | A012/A016: equacionei_dama.cli não existe; motores paralelos exigem contrato/paridade. |
| PostgreSQL e persistência relacional | Parcial | Consultas READ ONLY de catálogo, tabelas, FKs, autenticação e SSL. | Serviço independente preservado; sem integração app | Serviço independente preservado; sem integração app | Serviço independente preservado; sem integração app | S001/A011: bind externo e SSL off; estratégia de backup/restore não comprovada. |
| Construção, publicação e CI | Parcial | Inspeção dos três containers, 125 arquivos por ambiente, refs remotas e imagens. | Parcial; sem nova funcionalidade publicada | Parcial; sem nova funcionalidade publicada | Parcial; sem nova funcionalidade publicada | A005/A006/A009/A013: DEV drift, CI vazia, deps não fixadas e documentação-base incompleta. |
| Prévias e roadmap de Data Science | Parcial | Inspeção do HTML; abertura de details na suíte xgboost_lab. | Parcial; sem nova funcionalidade publicada | Parcial; sem nova funcionalidade publicada | Parcial; sem nova funcionalidade publicada | Não é falha o rótulo Em breve; não contabilizar prévias como cursos operacionais. |
| Infraestrutura de assets de branding | Parcial | Teste local isolado branding_assets: reprovado, global EQUACIONEI_BRANDING_ASSETS inexistente. | Parcial; sem nova funcionalidade publicada | Parcial; sem nova funcionalidade publicada | Parcial; sem nova funcionalidade publicada | A014: contrato do teste não existe; favicon 404. Não alterar/aprovar branding nesta etapa. |

## Alterações incluídas e excluídas

Incluídas: dois patches funcionais mínimos, regressão de origens no backend, três runners de navegador, relatório anterior de início dos jogos e os 14 documentos de auditoria. Origem/finalidade dos patches e reprodução: auditoria-inicio-jogos.md. Rejeição de origens desconhecidas permanece testada; ALLOWED_ORIGINS explícito continua soberano.

Excluídos: `app/frontend/assets/branding/**`, `docs/branding-assets.md` e `tests/browser/branding_assets.py`: infraestrutura incompleta; contrato global esperado pelo teste não existe. Preservados no diretório original. Nenhum descarte automático de arquivos não versionados. Arquivos privados/ignorados e segredos não entram no Git nem no contexto de build. Padronização visual é proposta documental, não implementada. Não há Tetris/Pac-Man autônomos no inventário; nomes sugeridos não provam implementação.

A árvore principal permanece em main, com suas alterações locais preservadas. Preparação ocorre em worktree isolado. Branch histórica fix/fase-0-preparatoria tem divergência própria (3 locais/1 remoto) e não será modificada; branches de etapas/branding ficam intactas.

## Testes e gates

Evidências prévias: 36 métodos backend locais aprovados; regressão nova contra imagem publicada reproduziu um método com quatro subcenários reprovados. Seis suítes principais de navegador aprovadas, testes de motor e 760 medições documentados na auditoria. Branding incompleto reprova e fica excluído. A candidata deve passar novamente backend, início/interação de todos os sete jogos, regressões de Queda e Dama online, curso de Xadrez, conteúdos/Python/DS/ML e responsividade em DEV e TESTE. Resultados desta consolidação serão anexados abaixo após a execução real.

DEV só será atualizado após validação isolada da candidata. TESTE só será atualizado após os gates de DEV. Falha relevante nova interrompe promoção. A aprovação integral de TESTE para PRODUÇÃO não será declarada enquanto houver bloqueios abertos sem decisão explícita.

## Artefato e rollback planejados

Build offline a partir da imagem aprovada 061961c7c4ae, com dependências já homologadas e verificadas; fontes extraídas exclusivamente do commit candidato. Não reconstruir dependências flutuantes do Dockerfile original nem incluir a árvore de trabalho suja. Manifesto privado terá hashes de todos os arquivos candidatos, pacotes, imagem final e revisão OCI. Dois builds idênticos serão comparados. Overrides de imagem ficam em diretório privado; nenhum Compose versionado será alterado. Publicar o mesmo ID de imagem em DEV e TESTE.

Rollback independente por ambiente: usar snapshot anterior registrado, override privado de rollback e `docker compose -p equacionei-dev/test -f docker-compose.yml -f docker-compose.dev/test.yml -f <override-rollback> up -d --no-build --no-deps backend`. Não executar down, prune ou alterações no PostgreSQL. Snapshot conserva arquivos graváveis, mas não memória das partidas/modelos.

## Estado final e pendências

Consolidação funcional executada em DEV e TESTE. PRODUÇÃO e main permanecem em b0a2ef0/061961c7c4ae; autorização de publicação não foi recebida. Resultados efetivos abaixo.

## Resultado efetivo da consolidação

Revisão funcional da candidata: `89a119f2f08d69735d8602ebd4c5d2a1edb540bf`. Imagem homologada para os cenários deste escopo: `sha256:7c0f269b220b02eb84b1114aa5f68e97baa7de3c4f95dc2f20be1e273b46d0e2`; tag local `equacionei-backend:candidata-89a119f`. Dois builds sem cache, com SOURCE_DATE_EPOCH e timestamps de camadas normalizados, produziram o mesmo ID. Fontes vieram de git archive; nenhum arquivo local incompleto entrou na imagem. Os 31 pacotes instalados são iguais aos da imagem aprovada anterior. Não equivale a reconstrução independente de dependências a partir do índice; a base imutável anterior é pré-requisito. A [documentação oficial Docker](https://docs.docker.com/build/exporters/image-registry/) descreve a normalização de timestamps utilizada.

| Gate | Backend | Grupos de navegador | Resultado |
|---|---|---|---|
| isolated | 36 métodos; 0 falhas; 0 erros; 0 ignorados | 9 executados | Todos os gates deste escopo passaram |
| dev | 36 métodos; 0 falhas; 0 erros; 0 ignorados | 13 executados | Todos os gates deste escopo passaram |
| test | 36 métodos; 0 falhas; 0 erros; 0 ignorados | 13 executados | Todos os gates deste escopo passaram |

As contagens de grupos não são somadas aos métodos/asserções como uma única quantidade de testes. Evidências por fase em `private/consolidacao-20261015/{isolated,dev,test}/results.json`, logs e matrizes próprias.

- **isolated:** 70 cenários de início/interação, sem falhas, em 390×844 com toque emulado e 1366×900 com mouse; regressão da Queda em 16 tamanhos/rotações, pausa/retomada/reinício. Os 124 arquivos frontend/backend conferem com a candidata; requirements é conferido separadamente no manifesto.
- **dev:** 70 cenários de início/interação, sem falhas, em 390×844 com toque emulado e 1366×900 com mouse; regressão da Queda em 16 tamanhos/rotações, pausa/retomada/reinício. Os 124 arquivos frontend/backend conferem com a candidata; requirements é conferido separadamente no manifesto.
- **dev, complementos:** 152 combinações de sete jogos/menu × 19 perfis; 2 partidas online temporárias com início e jogada sincronizada entre dois clientes e saída; 16 fluxos por navegação normal e conclusão de atividades; 21 cenários Firefox sem falha.
- **test:** 70 cenários de início/interação, sem falhas, em 390×844 com toque emulado e 1366×900 com mouse; regressão da Queda em 16 tamanhos/rotações, pausa/retomada/reinício. Os 124 arquivos frontend/backend conferem com a candidata; requirements é conferido separadamente no manifesto.
- **test, complementos:** 152 combinações de sete jogos/menu × 19 perfis; 2 partidas online temporárias com início e jogada sincronizada entre dois clientes e saída; 16 fluxos por navegação normal e conclusão de atividades; 21 cenários Firefox sem falha.

Os 19 perfis cobrem 320/360/375/390/393/412/430, tablets 768/820, desktop 1024/1366 e respectivas telas horizontais prioritárias. Xadrez passou em 15 lições/30 exercícios, teclado nativo, toque e árvore acessível. Dama inclui local/IA três dificuldades e online; Labirinto inclui movimento, pausa, swipe e campanha em fixture; Pares conclui cinco rodadas nos três níveis; Relâmpago dez respostas e replay; Racha puzzle textual 3×3 até vitória; Queda pausa/reinício reais e estados finais com relógio controlado. Não apresentar fixture de fim de partida como campanha natural integral jogada por uma pessoa.

Python executou programas e verificou feedback/rascunho/reload; DS incluiu média, simuladores e k-NN; XGBoost incluiu treino/previsão, classificação/regressão, upload e erros intencionais. Não foram feitos testes de carga. Chrome é navegador desktop com emulação móvel e eventos CDP, não aparelho físico. Firefox é desktop headless: o perfil solicitado 375 teve largura real mínima de 500 px. Safari/WebKit, celulares reais, teclado virtual físico e leitor de tela humano continuam pendentes.

A execução exploratória inicial, anterior à recriação, detectou o Xadrez antigo de DEV. Foi interrompida e preservada em dev-before-recreation-exploratory; não integra os gates acima. Erros dos auxiliares de extração/build/snapshot foram corrigidos antes da aprovação, com logs preservados. A verificação de ID da imagem impede misturar resultados do ambiente antigo com o atual.

## Ambientes finais e imagens de rollback

| Ambiente | Porta / revisão funcional | Imagem | Estado |
|---|---|---|---|
| DEV | 8000 / 89a119f | `sha256:7c0f269b220b02eb84b1114aa5f68e97baa7de3c4f95dc2f20be1e273b46d0e2` | Atualizado; gates deste escopo aprovados |
| TESTE | 8002 / 89a119f | `sha256:7c0f269b220b02eb84b1114aa5f68e97baa7de3c4f95dc2f20be1e273b46d0e2` | Atualizado; gates deste escopo aprovados |
| PRODUÇÃO | 8001 / b0a2ef0 | `sha256:061961c7c4ae243b9140ef5b6e972fcb95606c8aff278e4f95eae668e2ab6648` | Intacto; publicação não autorizada |

Snapshots incluem as camadas graváveis anteriores; não apenas as imagens-base.

- dev: `equacionei-dev-backend:rollback-consolidacao-20261015` → `sha256:21c9866b6127858d76738f1a52e33a56fbb373beb12ef9ebea04ad9a130b4779`; anterior `sha256:5e22c4288259b3ffb5ea9d8f33cd451e12aa6939fcaa37f46b7ffee19d3896d0`. Override privado `dev-rollback.json`.
- test: `equacionei-test-backend:rollback-consolidacao-20261015` → `sha256:819e566202a9a00097a26bd90c8b3d29d992d7528f7d1f39366a03490bfb52ed`; anterior `sha256:061961c7c4ae243b9140ef5b6e972fcb95606c8aff278e4f95eae668e2ab6648`. Override privado `test-rollback.json`.

Tags históricas de rollback anteriores foram mantidas. PostgreSQL mantém o mesmo ID/imagem/volume; PRODUÇÃO mantém o mesmo ID/imagem. Os arquivos Compose versionados e branding foram preservados. Rollback de serviço não foi ensaiado nos ambientes existentes, para não provocar uma segunda interrupção; a equivalência dos 124 arquivos de cada snapshot foi verificada em container temporário isolado, sem rede, sem restaurar os serviços em uso. Backup/restauração do PostgreSQL não foi comprovado e não foi alterado nesta tarefa.

## Pendências e liberação de PRODUÇÃO

A001 (WS), A002 (Queda) e A005 (drift de DEV) foram tratados no escopo DEV/TESTE. A001/A002 continuam na imagem de PRODUÇÃO; portanto ainda afetam a publicação atual. As 28 constatações e severidades da auditoria são um retrato anterior: zero P0 confirmado, seis P1, quinze P2 e sete P3, incluindo riscos/hipóteses explicitamente distintos de falhas demonstradas.

Permanecem pendentes: Python bloqueado por registro nulo de progresso (A003); loop quadrático em intervalo extremo (A004); revisão de exposição/TLS de PostgreSQL (S001, alcance externo não comprovado); foco da Dama; alternativa acessível ao Canvas; backup verificável; CI; locks de dependências; advisories de pip/setuptools; persistência/quotas; padronização visual proposta. Nenhuma dessas mudanças foi misturada à candidata. Código incompleto de branding permanece apenas local e fora da imagem/Git desta consolidação. Não houve promoção de novas funcionalidades parciais.

**TESTE passou nos cenários da candidata, mas não se declara aprovação integral da plataforma para PRODUÇÃO.** Antes da publicação pública: decidir o tratamento dos P1 preexistentes e limitações, confirmar rollback/backup exigidos e receber autorização explícita posterior para publicar esta imagem exata. A candidata está disponível localmente; não foi enviada a um registry. O procedimento de promoção futura deve verificar a integridade do artefato e eventual avanço de main; não reconstruir a imagem nem descartar commits exclusivos.

O manifesto privado artifact.json identifica fontes, revisão, base e imagem. Um commit documental posterior registra estes resultados sem alterar app/tests; develop e staging serão sincronizadas por fast-forward, com main preservada. As referências finais são verificadas em git-sync.json. A árvore principal em main continua com os arquivos locais preservados; os patches/testes/documentos incluídos também existem nas branches consolidadas, portanto deixam de ser exclusivos do disco. Apenas os materiais de branding excluídos e configurações privadas continuam fora dessa consolidação. Overrides preparados não executam deploy por si. Próxima etapa recomendada: revisar este relatório e os P1 restantes; aprovar separadamente correções adicionais ou eventual publicação restrita, sem iniciar evolução funcional.


## Verificação operacional final

Logs completos dos novos serviços foram preservados em diretório privado; contagem final: zero tracebacks, zero respostas HTTP 5xx e zero linhas ERROR em DEV e TESTE durante os testes coletados. Respostas 4xx provocadas por cenários inválidos são esperadas; favicon ausente é pendência anterior. GET público com User-Agent de navegador retornou 200 para home, health e CSS; este CSS continua correspondendo à base anterior, diferente da candidata. O cliente Python sem esse User-Agent recebeu 403; isso não foi tratado como indisponibilidade geral do site.

Comandos de rollback documentados, **não executados nos serviços existentes**; executar a partir da raiz do repositório somente quando necessário:

```bash
docker compose -p equacionei-dev -f docker-compose.yml -f docker-compose.dev.yml -f private/consolidacao-20261015/dev-rollback.json up -d --no-build --no-deps --pull never backend
docker compose -p equacionei-test -f docker-compose.yml -f docker-compose.test.yml -f private/consolidacao-20261015/test-rollback.json up -d --no-build --no-deps --pull never backend
```

Os arquivos de override e snapshots pertencem a este servidor; guardar esses artefatos junto ao registro de release. Os 214 arquivos da linha de base da árvore principal mantiveram os mesmos hashes; novos documentos e evidências foram adicionados sem descartar os materiais existentes.
