# Diagnóstico e priorização de problemas

Data de consolidação: **15/10/2026**. Coleta iniciada em 13/10/2026; nomes de diretórios conservam a data inicial. Revisão: `b0a2ef0c01458b1e17fe4b34acdf29ef1acecd73`. Branch ativa no início: `main`; alterações locais preexistentes não são tratadas como aprovação.

Metodologia: inspeção de fonte/Git, hashes SHA-256, Docker e PostgreSQL somente leitura, perfis de navegador isolados, entrada física via CDP/WebDriver e testes em cópias temporárias. **Nenhuma correção, commit, push, publicação ou reinício de container existente nesta etapa.** A auditoria anterior foi preservada. Evidências: [diretório privado](../../private/general-audit-20261013/).

## Prioridade e nível de evidência

P0: indisponibilidade/perda de dados/exploração grave confirmadas. P1: bloqueio importante ou configuração de risco alto. P2: falha parcial, integração, responsividade/acessibilidade ou confiabilidade. P3: manutenção/apresentação/melhoria. Nenhuma exploração ofensiva foi realizada. “Ausência de comprovação” e “hipótese” não são apresentadas como incidente confirmado.

| P0 | P1 | P2 | P3 | Total |
|---|---|---|---|---|
| 0 | 6 | 15 | 7 | 28 |

| ID | Prioridade | Escopo | Problema | Evidência/certeza | Complexidade |
|---|---|---|---|---|---|
| A001 | P1 | Dama online; TESTE 8002/PROD 8001 | Sala criada e participantes entram, mas o WebSocket não conecta e a partida não inicia em desktop ou móvel. | Confirmado | P |
| A002 | P1 | Queda; TESTE/PROD/público | Pausar e, em 667×375, Reiniciar ficam encobertos. | Confirmado | P |
| A003 | P1 | Python; DEV/público; mesmo fonte em TESTE/PROD | Progresso JSON com registro de exercício nulo impede preparar o laboratório. | Confirmado | M |
| A004 | P1 | Função do 2º Grau; fonte comum nos quatro ambientes | Intervalos válidos de grande magnitude podem manter o laço sem progresso e travar a aba. | Confirmado | M |
| A005 | P1 | DEV e processo de publicação | DEV não representa develop/HEAD e contém duas alterações só na camada gravável. | Confirmado | M |
| S001 | P1 | PostgreSQL/host | Porta 5432 publicada em todas as interfaces IPv4/IPv6 com SSL do PostgreSQL desativado. | Configuração confirmada; alcance externo/exploração não comprovados | M |
| A006 | P2 | CI e publicação | Não há workflow executável de integração contínua. | Confirmado | M |
| A007 | P2 | Persistência, salas, ML e educação | Reinícios/TTL descartam salas/modelos; troca/limpeza do navegador perde progresso e rascunhos. | Restrição de produto confirmada; não é corrupção de PostgreSQL | M |
| A008 | P2 | ML e escala do backend | Datasets/modelos e salas são globais por processo; capacidade do ML pode ser ocupada por visitantes diferentes. | Confirmado | M |
| A009 | P2 | Dependências e construção | Reconstruir o Dockerfile pode selecionar versões diferentes das homologadas. | Confirmado | M |
| S002 | P2 | Headers de segurança; quatro ambientes | Headers defensivos relevantes não foram observados nas respostas HTML amostradas. | Confirmado | M |
| A010 | P2 | Função do 2º Grau | Campos numéricos vazios podem ser aceitos como zero sem feedback. | Confirmado | P |
| A011 | P2 | Backup/recuperação | Não foi comprovado backup e restauração do PostgreSQL nem de dados locais dos alunos. | Lacuna de comprovação; não se afirma inexistência de todos os backups | M |
| A012 | P2 | Laboratório offline de Dama | O entrypoint dama-lab referencia módulo inexistente. | Confirmado | P |
| AC001 | P2 | Dama local; teclado e ARIA | Selecionar peça com Enter remove o foco do tabuleiro. | Confirmado | M |
| AC002 | P2 | Labirinto e gráficos | O mapa do Canvas não fornece uma representação textual equivalente dos números/posições. | Ausência estrutural confirmada; uso com leitor de tela não certificado | M |
| V001 | P2 | Labirinto; tablet/desktop | Reserva vertical dos controles reduz o mapa apesar do espaço lateral disponível. | Confirmado | M |
| V002 | P2 | Jogos compactos; SE/Android pequeno | Controles importantes podem ficar abaixo da primeira tela, sobretudo Xadrez/Dama/Pares. | Confirmado | M |
| V003 | P2 | CSS e componentes | Tokens e contratos de componentes estão distribuídos em 19 CSS, com muitas sobreposições de seletores. | Confirmado | M |
| S003 | P2 | Ferramentas de build nas imagens | OSV associa pip 24.0 e setuptools 79.0.1 a avisos de segurança. | Correspondência de versão confirmada; exploração remota do app não demonstrada | M |
| S004 | P2 | Rate limiting atrás do proxy | Clientes públicos podem compartilhar o mesmo request.client.host e o mesmo limite. | Hipótese fundamentada; identidade externa não comprovada | M |
| V004 | P3 | Menus e cartões | Carrosséis têm densidade/altura distintas; o catálogo usa um cartão mesmo com espaço para vários. | Confirmado | M |
| V005 | P3 | Alvos de toque dos carrosséis | Algumas setas têm 32 px de largura, abaixo do alvo confortável de 44 px proposto. | Confirmado | P |
| V006 | P3 | Títulos, retorno e rodapés | Páginas semelhantes usam títulos/espaçamentos e navegação de retorno diferentes. | Confirmado | M |
| A013 | P3 | Documentação e scaffolds | Arquitetura/banco/testes e arquivos frontend Docker/nginx existentes são placeholders. | Confirmado | P |
| A014 | P3 | Branding e favicon | Teste local de assets exige um contrato ausente; favicon retorna 404. | Confirmado | P |
| A015 | P3 | Carregamento das funções matemáticas | Chart.js local é carregado sincronamente no head. | Confirmado | P |
| A016 | P3 | Regras e contratos entre componentes | Há motores de Dama em JS, backend Python e pacote offline, além de globais JS dependentes da ordem de scripts. | Confirmado | M |

## A001 — P1

- **Módulo/ambiente:** Dama online; TESTE 8002/PROD 8001.
- **Descrição/impacto:** Sala criada e participantes entram, mas o WebSocket não conecta e a partida não inicia em desktop ou móvel.
- **Evidência:** dama-online.json; origin-regression-against-deployed.log; routes/dama.py em private/general-audit-20261013, ou arquivos relativos ao frontend/backend.
- **Reprodução:** Abrir duas sessões na porta 8002/8001; Online → criar/entrar; observar Reconectando e início desabilitado.
- **Causa:** Lista padrão de Origin contém 8000 e domínio público, mas não 8001/8002; não há override nos containers.
- **Grau de certeza:** Confirmado.
- **Solução proposta:** Revisar a correção local anterior de origens exatas; validar e construir artefato para promoção autorizada.
- **Dependências:** Revisão e autorização posterior.
- **Complexidade relativa:** P (P=pequena, M=média; não é estimativa em horas).
- **Risco da correção:** Médio.
- **Testes exigidos:** Duas sessões, handshake, início, movimento/reconexão/saída em origens permitidas; origem externa/vazia/porta 8003 rejeitadas.

## A002 — P1

- **Módulo/ambiente:** Queda; TESTE/PROD/público.
- **Descrição/impacto:** Pausar e, em 667×375, Reiniciar ficam encobertos.
- **Evidência:** visual-summary.json; screenshots/public-queda-matematica-play-640x360.png; firefox.json em private/general-audit-20261013, ou arquivos relativos ao frontend/backend.
- **Reprodução:** Iniciar Queda em 640×360 ou 667×375 e tocar Pausar; elementFromPoint retorna o parágrafo/link posterior.
- **Causa:** game-layout.css torna painel estático, mantém altura limitada ao viewport e deixa overflow visible; filhos ultrapassam a caixa.
- **Grau de certeza:** Confirmado.
- **Solução proposta:** Revisar a correção local anterior height:auto/min-height; validar os controles em rotação antes de promoção.
- **Dependências:** Revisão e autorização posterior.
- **Complexidade relativa:** P (P=pequena, M=média; não é estimativa em horas).
- **Risco da correção:** Médio.
- **Testes exigidos:** Hit testing e toque em 320–430, 640×360, 667×375 e desktop; pausa, retomar, reiniciar e game over.

## A003 — P1

- **Módulo/ambiente:** Python; DEV/público; mesmo fonte em TESTE/PROD.
- **Descrição/impacto:** Progresso JSON com registro de exercício nulo impede preparar o laboratório.
- **Evidência:** storage-shapes.json; python-core.js row/time; python-learning.js accountTime em private/general-audit-20261013, ou arquivos relativos ao frontend/backend.
- **Reprodução:** Em perfil isolado, gravar versão 1 com exercises:{print:null}; abrir Python. Título vazio, Executar desabilitado, TypeError elapsedTime.
- **Causa:** Contrato do objeto externo é parcialmente validado; row() retorna null já existente e time() o acessa.
- **Grau de certeza:** Confirmado.
- **Solução proposta:** Validar/normalizar registros por exercício; preservar rascunhos válidos e informar recuperação; evitar limpeza global do storage.
- **Dependências:** Revisão e autorização posterior.
- **Complexidade relativa:** M (P=pequena, M=média; não é estimativa em horas).
- **Risco da correção:** Médio.
- **Testes exigidos:** Null, array, tipos de campos incorretos, quota/security error, rascunhos válidos e retomada entre Python/DS.

## A004 — P1

- **Módulo/ambiente:** Função do 2º Grau; fonte comum nos quatro ambientes.
- **Descrição/impacto:** Intervalos válidos de grande magnitude podem manter o laço sem progresso e travar a aba.
- **Evidência:** quadratic-safe-extremes.json; js/app.js calcular/criarTabela em private/general-audit-20261013, ou arquivos relativos ao frontend/backend.
- **Reprodução:** a=1,b=0,c=0,xmin=10000000000000000,xmax=10000000000000100; Worker com DOM mock não termina em 500 ms.
- **Causa:** Incremento em ponto flutuante x+=passo pode arredondar para o mesmo x; tabela usa x++ sem teto, também sem progresso em magnitudes altas.
- **Grau de certeza:** Confirmado.
- **Solução proposta:** Amostragem por índice com quantidade fixa, teto de linhas e validação de resultados/intervalo; preservar a explicação pedagógica.
- **Dependências:** Revisão e autorização posterior.
- **Complexidade relativa:** M (P=pequena, M=média; não é estimativa em horas).
- **Risco da correção:** Médio.
- **Testes exigidos:** Magnitude alta, passo abaixo do ULP, intervalo largo, fracionário/negativo, overflow, limites invertidos e casos normais de raízes.

## A005 — P1

- **Módulo/ambiente:** DEV e processo de publicação.
- **Descrição/impacto:** DEV não representa develop/HEAD e contém duas alterações só na camada gravável.
- **Evidência:** runtime.json; infrastructure-extra.json; 125 hashes por container em private/general-audit-20261013, ou arquivos relativos ao frontend/backend.
- **Reprodução:** Comparar refs b0a2ef0 e fontes de DEV; inspecionar docker diff sem recriar.
- **Causa:** Imagem e765b43-dirty tem cinco arquivos antigos de Xadrez; Dama/CSS foram copiados diretamente em auditoria anterior.
- **Grau de certeza:** Confirmado.
- **Solução proposta:** Definir revisão aprovada de DEV, construir artefato reproduzível e validar a integridade; não depender de docker cp.
- **Dependências:** Revisão humana das três alterações versionadas pendentes e dos arquivos não versionados; sem deploy automático.
- **Complexidade relativa:** M (P=pequena, M=média; não é estimativa em horas).
- **Risco da correção:** Alto.
- **Testes exigidos:** Hashes do commit/artefato/container/HTTP, curso completo, regressões e plano de rollback.

## S001 — P1

- **Módulo/ambiente:** PostgreSQL/host.
- **Descrição/impacto:** Porta 5432 publicada em todas as interfaces IPv4/IPv6 com SSL do PostgreSQL desativado.
- **Evidência:** runtime.json ports/listen/postgres auth em private/general-audit-20261013, ou arquivos relativos ao frontend/backend.
- **Reprodução:** Inspecionar bind Docker/ss e SHOW ssl em transação READ ONLY.
- **Causa:** Serviço de banco separado do Compose atual publica 0.0.0.0/[::]; listen_addresses=*; ssl=off.
- **Grau de certeza:** Configuração confirmada; alcance externo/exploração não comprovados.
- **Solução proposta:** Aprovar separadamente restrição de acesso/bind e política TLS/roles; auditar firewall e backups antes de mudar a infraestrutura.
- **Dependências:** Revisão e autorização posterior.
- **Complexidade relativa:** M (P=pequena, M=média; não é estimativa em horas).
- **Risco da correção:** Alto.
- **Testes exigidos:** Conectividade autorizada, regras de rede, TLS, permissões mínimas e recuperação sem afetar outros consumidores.

## A006 — P2

- **Módulo/ambiente:** CI e publicação.
- **Descrição/impacto:** Não há workflow executável de integração contínua.
- **Evidência:** history-and-scaffolds.json; .github/workflows/ci.yml em private/general-audit-20261013, ou arquivos relativos ao frontend/backend.
- **Reprodução:** Ler workflow: só comentário, sem jobs/steps.
- **Causa:** Estrutura criada como placeholder; validação depende de comandos manuais.
- **Grau de certeza:** Confirmado.
- **Solução proposta:** Propor pipeline que rode testes/integridade e produza artefato imutável, com gates manuais para ambientes.
- **Dependências:** Revisão e autorização posterior.
- **Complexidade relativa:** M (P=pequena, M=média; não é estimativa em horas).
- **Risco da correção:** Médio.
- **Testes exigidos:** Pipeline em branch de trabalho, falha deliberada bloqueando promoção, artefato e rollback comprovados.

## A007 — P2

- **Módulo/ambiente:** Persistência, salas, ML e educação.
- **Descrição/impacto:** Reinícios/TTL descartam salas/modelos; troca/limpeza do navegador perde progresso e rascunhos.
- **Evidência:** runtime.json; services/dama.py; MemoryStore; LearningData/PythonProgress em private/general-audit-20261013, ou arquivos relativos ao frontend/backend.
- **Reprodução:** Inspecionar armazenamento por processo/origem e testes de TTL/reload; nenhum banco recebe esses dados.
- **Causa:** Arquitetura intencional de MVP sem identidade do aluno ou armazenamento persistente central.
- **Grau de certeza:** Restrição de produto confirmada; não é corrupção de PostgreSQL.
- **Solução proposta:** Documentar contrato/limites; definir quais dados realmente precisam persistência e sincronização antes de projetar esquema/migrações.
- **Dependências:** Revisão e autorização posterior.
- **Complexidade relativa:** M (P=pequena, M=média; não é estimativa em horas).
- **Risco da correção:** Alto.
- **Testes exigidos:** Retomada, exportação/importação se aprovada, perda controlada de sessão, migração preservando chaves existentes.

## A008 — P2

- **Módulo/ambiente:** ML e escala do backend.
- **Descrição/impacto:** Datasets/modelos e salas são globais por processo; capacidade do ML pode ser ocupada por visitantes diferentes.
- **Evidência:** services/ml/store.py; config/ml.py; services/dama.py; testes de capacidade em private/general-audit-20261013, ou arquivos relativos ao frontend/backend.
- **Reprodução:** Revisar max_entries=12 por store, TTL 1800 e semáforo de um treino; fixtures atingem 503/429.
- **Causa:** Memória local e IDs-capacidade sem partição por aluno; múltiplos workers não compartilham estado.
- **Grau de certeza:** Confirmado.
- **Solução proposta:** Definir quotas, política de expiração/liberação e arquitetura de estado antes de aumentar workers; manter limites de upload/treino.
- **Dependências:** Revisão e autorização posterior.
- **Complexidade relativa:** M (P=pequena, M=média; não é estimativa em horas).
- **Risco da correção:** Médio.
- **Testes exigidos:** Isolamento/capacidade em ambiente isolado, liberação, expiração, concorrência pequena e reinício controlado autorizado.

## A009 — P2

- **Módulo/ambiente:** Dependências e construção.
- **Descrição/impacto:** Reconstruir o Dockerfile pode selecionar versões diferentes das homologadas.
- **Evidência:** requirements.txt; Dockerfile; runtime packages em private/general-audit-20261013, ou arquivos relativos ao frontend/backend.
- **Reprodução:** Conferir FastAPI/Uvicorn/WebSockets sem versão e demais faixas; FROM python:3.11-slim sem digest.
- **Causa:** Ausência de lock/SBOM de build e dependências/transitivas selecionadas por índice.
- **Grau de certeza:** Confirmado.
- **Solução proposta:** Propor lock com hashes, base por digest, inventário e política de atualização/homologação.
- **Dependências:** Revisão e autorização posterior.
- **Complexidade relativa:** M (P=pequena, M=média; não é estimativa em horas).
- **Risco da correção:** Médio.
- **Testes exigidos:** Build isolado reprodutível, comparação de pacotes, licenças, hashes e regressão completa.

## S002 — P2

- **Módulo/ambiente:** Headers de segurança; quatro ambientes.
- **Descrição/impacto:** Headers defensivos relevantes não foram observados nas respostas HTML amostradas.
- **Evidência:** http.json headers da raiz/menu em private/general-audit-20261013, ou arquivos relativos ao frontend/backend.
- **Reprodução:** Consultar CSP, HSTS, X-Content-Type-Options, frame policy, Referrer-Policy e Permissions-Policy.
- **Causa:** Não há middleware/configuração correspondente no backend; regras de borda não aparecem nas respostas medidas.
- **Grau de certeza:** Confirmado.
- **Solução proposta:** Planejar rollout em Report-Only e política coerente com iframe opaco/Workers/WASM e scripts existentes; validar TLS e framing.
- **Dependências:** Revisão e autorização posterior.
- **Complexidade relativa:** M (P=pequena, M=média; não é estimativa em horas).
- **Risco da correção:** Alto.
- **Testes exigidos:** Python real e isolamento, gráficos, jogos, menus, erros, cache e embedding autorizado; sem bloquear por CSP genérica.

## A010 — P2

- **Módulo/ambiente:** Função do 2º Grau.
- **Descrição/impacto:** Campos numéricos vazios podem ser aceitos como zero sem feedback.
- **Evidência:** quadratic-safe-extremes.json empty-b; app.js em private/general-audit-20261013, ou arquivos relativos ao frontend/backend.
- **Reprodução:** Limpar b e calcular; equação mostra b=0 e nenhum alerta.
- **Causa:** Number("") retorna zero; validação é incompleta, ao contrário de primeiro-grau.js.
- **Grau de certeza:** Confirmado.
- **Solução proposta:** Especificar campos obrigatórios e validar vazio/finito antes do cálculo, com feedback acessível.
- **Dependências:** Revisão e autorização posterior.
- **Complexidade relativa:** P (P=pequena, M=média; não é estimativa em horas).
- **Risco da correção:** Médio.
- **Testes exigidos:** Vazio, espaços, finito, overflow de resultado, a=0, intervalo inválido e retenção dos últimos resultados válidos.

## A011 — P2

- **Módulo/ambiente:** Backup/recuperação.
- **Descrição/impacto:** Não foi comprovado backup e restauração do PostgreSQL nem de dados locais dos alunos.
- **Evidência:** infrastructure-extra.json; runtime.json pg_settings; database/* em private/general-audit-20261013, ou arquivos relativos ao frontend/backend.
- **Reprodução:** Inspeção de arquivos/cron acessíveis e archive_mode=off; timers genéricos não comprovam pg_dump/restore.
- **Causa:** Não há procedimento implementado no repositório; alcance de cron root/serviços externos é limitado.
- **Grau de certeza:** Lacuna de comprovação; não se afirma inexistência de todos os backups.
- **Solução proposta:** Definir RPO/RTO e política de backup/restore por conjunto de dados; testar restauração isolada após autorização.
- **Dependências:** Revisão e autorização posterior.
- **Complexidade relativa:** M (P=pequena, M=média; não é estimativa em horas).
- **Risco da correção:** Alto.
- **Testes exigidos:** Backup verificável, restore em banco isolado e verificação de integridade; nenhuma alteração no banco atual.

## A012 — P2

- **Módulo/ambiente:** Laboratório offline de Dama.
- **Descrição/impacto:** O entrypoint dama-lab referencia módulo inexistente.
- **Evidência:** pyproject.toml; offline-tests.json cli_present=false em private/general-audit-20261013, ou arquivos relativos ao frontend/backend.
- **Reprodução:** Resolver equacionei_dama.cli:main no pacote.
- **Causa:** cli.py não está no Git; motores/agentes existem e passaram smoke.
- **Grau de certeza:** Confirmado.
- **Solução proposta:** Completar o contrato do CLI ou revisar sua declaração/documentação com aprovação humana.
- **Dependências:** Revisão e autorização posterior.
- **Complexidade relativa:** P (P=pequena, M=média; não é estimativa em horas).
- **Risco da correção:** Médio.
- **Testes exigidos:** Instalação em ambiente isolado, --help, comando mínimo, seeds e saída em diretório temporário.

## AC001 — P2

- **Módulo/ambiente:** Dama local; teclado e ARIA.
- **Descrição/impacto:** Selecionar peça com Enter remove o foco do tabuleiro.
- **Evidência:** board-keyboard-focus.json; js/dama.js criarTabuleiro em private/general-audit-20261013, ou arquivos relativos ao frontend/backend.
- **Reprodução:** Focar linha 6/coluna 1 e pressionar Enter: activeElement vira BODY; Xadrez mantém botão.
- **Causa:** replaceChildren destrói o botão focado sem restauração; 64 botões/grids sem contrato de foco equivalente ao Xadrez.
- **Grau de certeza:** Confirmado.
- **Solução proposta:** Definir navegação e restauração de foco para Dama; revisar grid/rows/aria-selected ou usar grupo de botões corretamente nomeados.
- **Dependências:** Revisão e autorização posterior.
- **Complexidade relativa:** M (P=pequena, M=média; não é estimativa em horas).
- **Risco da correção:** Médio.
- **Testes exigidos:** Partida sem mouse, seleção/movimento/captura/reinício, roving tabindex se adotado e leitor de tela humano.

## AC002 — P2

- **Módulo/ambiente:** Labirinto e gráficos.
- **Descrição/impacto:** O mapa do Canvas não fornece uma representação textual equivalente dos números/posições.
- **Evidência:** labirinto-matematico.html; render em JS; AX e acessibilidade manual de fonte em private/general-audit-20261013, ou arquivos relativos ao frontend/backend.
- **Reprodução:** Inspecionar Canvas com nome/instruções e ausência de modelo navegável de alvos na árvore acessível.
- **Causa:** Representação principal raster, sem saída paralela do estado semântico do mapa.
- **Grau de certeza:** Ausência estrutural confirmada; uso com leitor de tela não certificado.
- **Solução proposta:** Desenhar alternativa textual/auditiva e navegação equivalente antes de declarar acessibilidade do jogo.
- **Dependências:** Revisão e autorização posterior.
- **Complexidade relativa:** M (P=pequena, M=média; não é estimativa em horas).
- **Risco da correção:** Alto.
- **Testes exigidos:** Leitor de tela, teclado sem visão do Canvas, mudanças de fase/vida/poder e equivalência de informação.

## V001 — P2

- **Módulo/ambiente:** Labirinto; tablet/desktop.
- **Descrição/impacto:** Reserva vertical dos controles reduz o mapa apesar do espaço lateral disponível.
- **Evidência:** visual-summary.json; screenshot 1366x900; resizeGameBoard em private/general-audit-20261013, ou arquivos relativos ao frontend/backend.
- **Reprodução:** 1366×900: mapa 450×450, 16,5% da viewport; em 1024×768 o teste mede 318 px.
- **Causa:** resizeGameBoard subtrai toda a altura de controles/legenda; acima de 1000 px o layout volta a empilhar.
- **Grau de certeza:** Confirmado.
- **Solução proposta:** Prototipar mapa+painel lateral em telas largas; calcular área por slots disponíveis mantendo proporção/legibilidade.
- **Dependências:** Revisão e autorização posterior.
- **Complexidade relativa:** M (P=pequena, M=média; não é estimativa em horas).
- **Risco da correção:** Médio.
- **Testes exigidos:** 375/393, 768/820, 1024/1366, rotação, DPR, input mapeado ao Canvas, texto e não sobreposição.

## V002 — P2

- **Módulo/ambiente:** Jogos compactos; SE/Android pequeno.
- **Descrição/impacto:** Controles importantes podem ficar abaixo da primeira tela, sobretudo Xadrez/Dama/Pares.
- **Evidência:** visual-summary.json mínimo geométrico de rolagem; screenshots 375x667 em private/general-audit-20261013, ou arquivos relativos ao frontend/backend.
- **Reprodução:** 375×667: reinício de Pares requer cerca de 23 px para ficar inteiro; Xadrez cerca de 203 px.
- **Causa:** Placar/contexto, board e informações auxiliares empilhados; controles nem sempre vêm antes dos painéis secundários.
- **Grau de certeza:** Confirmado.
- **Solução proposta:** Reordenar controles próximos ao jogo e recolher capturas/legendas/instruções; preservar rolagem e alvos.
- **Dependências:** Revisão e autorização posterior.
- **Complexidade relativa:** M (P=pequena, M=média; não é estimativa em horas).
- **Risco da correção:** Médio.
- **Testes exigidos:** Hit testing inicial/após rolagem, alturas reduzidas, teclado/zoom, modal e estados de vitória/pausa.

## V003 — P2

- **Módulo/ambiente:** CSS e componentes.
- **Descrição/impacto:** Tokens e contratos de componentes estão distribuídos em 19 CSS, com muitas sobreposições de seletores.
- **Evidência:** css-inventory.json; site.css/menu.css/carousel.css/game-layout.css em private/general-audit-20261013, ou arquivos relativos ao frontend/backend.
- **Reprodução:** Inspecionar redefinições de header/nav/cards e larguras/alturas diferentes por página.
- **Causa:** Evolução por regras acrescentadas e resets globais; presença de 164 literais de cor e 192 seletores repetidos como candidatos, não bugs por si só.
- **Grau de certeza:** Confirmado.
- **Solução proposta:** Propor tokens, escopo e ordem da cascata; migrar um componente de cada vez após aprovação.
- **Dependências:** Revisão e autorização posterior.
- **Complexidade relativa:** M (P=pequena, M=média; não é estimativa em horas).
- **Risco da correção:** Alto.
- **Testes exigidos:** Comparação visual de todos os estados e breakpoints; fórmulas, eventos, foco e storage preservados.

## S003 — P2

- **Módulo/ambiente:** Ferramentas de build nas imagens.
- **Descrição/impacto:** OSV associa pip 24.0 e setuptools 79.0.1 a avisos de segurança.
- **Evidência:** vulnerability-advisories.json; consulta de 32 combinações pacote/versão em private/general-audit-20261013, ou arquivos relativos ao frontend/backend.
- **Reprodução:** Consultar versões exatas: seis GHSA para pip e um para setuptools, deduplicando aliases PYSEC/CVE.
- **Causa:** Ferramentas de instalação permanecem na imagem; riscos dependem de instalar/distribuir pacotes; aviso de setuptools é específico de macOS.
- **Grau de certeza:** Correspondência de versão confirmada; exploração remota do app não demonstrada.
- **Solução proposta:** Revisar aplicabilidade e planejar atualização/remoção de ferramentas de build num artefato homologado; não inferir exploração via CSV.
- **Dependências:** Revisão e autorização posterior.
- **Complexidade relativa:** M (P=pequena, M=média; não é estimativa em horas).
- **Risco da correção:** Médio.
- **Testes exigidos:** Build sem novos avisos aplicáveis, scanner de SO separado, pacotes/recursos e regressão completa.

## S004 — P2

- **Módulo/ambiente:** Rate limiting atrás do proxy.
- **Descrição/impacto:** Clientes públicos podem compartilhar o mesmo request.client.host e o mesmo limite.
- **Evidência:** routes/dama.py; routes/ml.py; runtime env/proxy; logs de acesso em private/general-audit-20261013, ou arquivos relativos ao frontend/backend.
- **Reprodução:** Comparar política do Uvicorn/proxy com contagem por request.client.host; não houve teste com dois IPs externos.
- **Causa:** Hipótese de IP não encaminhado/trust incompleto; fontes de rede locais mostram endereços da ponte Docker.
- **Grau de certeza:** Hipótese fundamentada; identidade externa não comprovada.
- **Solução proposta:** Confirmar cadeia de proxies e IP efetivo antes de definir confiança estrita e quotas por sessão/usuário.
- **Dependências:** Revisão e autorização posterior.
- **Complexidade relativa:** M (P=pequena, M=média; não é estimativa em horas).
- **Risco da correção:** Médio.
- **Testes exigidos:** Dois IPs externos autorizados em TESTE; headers forjados rejeitados; fairness e limites mantidos.

## V004 — P3

- **Módulo/ambiente:** Menus e cartões.
- **Descrição/impacto:** Carrosséis têm densidade/altura distintas; o catálogo usa um cartão mesmo com espaço para vários.
- **Evidência:** screenshots/public-applications-375x667.png; 1366x900; CSS de carrosséis em private/general-audit-20261013, ou arquivos relativos ao frontend/backend.
- **Reprodução:** Comparar Aplicações, jogos e experiências do hub nos mesmos viewports.
- **Causa:** Largura em vw, padding de centralização e altura mínima; contratos diferentes entre carrosséis e grade.
- **Grau de certeza:** Confirmado.
- **Solução proposta:** Propor um cartão com indicação de continuidade no celular e 2/3 cartões quando a largura comportar leitura.
- **Dependências:** Revisão e autorização posterior.
- **Complexidade relativa:** M (P=pequena, M=média; não é estimativa em horas).
- **Risco da correção:** Médio.
- **Testes exigidos:** Todos os itens alcançáveis, teclado, swipe, último cartão e reduced motion; sem waits fixos insuficientes.

## V005 — P3

- **Módulo/ambiente:** Alvos de toque dos carrosséis.
- **Descrição/impacto:** Algumas setas têm 32 px de largura, abaixo do alvo confortável de 44 px proposto.
- **Evidência:** visual-summary.json small_buttons; carousel.css/menu.css em private/general-audit-20261013, ou arquivos relativos ao frontend/backend.
- **Reprodução:** Medir setas em 320–430 px; não generalizar esse achado para links inline ou para cada casa do tabuleiro.
- **Causa:** Regra móvel reduz largura para 32 px; cabeçalho usa 44 px.
- **Grau de certeza:** Confirmado.
- **Solução proposta:** Manter área clicável de controles principais de 44×44 sem aumentar ornamentos; tratar grades densas conforme WCAG e alternativa por teclado.
- **Dependências:** Revisão e autorização posterior.
- **Complexidade relativa:** P (P=pequena, M=média; não é estimativa em horas).
- **Risco da correção:** Médio.
- **Testes exigidos:** Hit testing, distância entre alvos e cliques nas bordas; sem encobrir links dos cartões.

## V006 — P3

- **Módulo/ambiente:** Títulos, retorno e rodapés.
- **Descrição/impacto:** Páginas semelhantes usam títulos/espaçamentos e navegação de retorno diferentes.
- **Evidência:** visual-matrix.json headings/styles; HTMLs em private/general-audit-20261013, ou arquivos relativos ao frontend/backend.
- **Reprodução:** Comparar funções 1º/2º grau, práticas, jogos, Python e DS.
- **Causa:** Templates HTML repetidos, estilos de página e seções sem contrato comum.
- **Grau de certeza:** Confirmado.
- **Solução proposta:** Documentar cabeçalho/contexto, níveis de título, retorno e rodapé opcional; preservar semântica e identidade.
- **Dependências:** Revisão e autorização posterior.
- **Complexidade relativa:** M (P=pequena, M=média; não é estimativa em horas).
- **Risco da correção:** Médio.
- **Testes exigidos:** H1/landmarks, foco, leitura, ausência de duplicação visual e regressão das rotas.

## A013 — P3

- **Módulo/ambiente:** Documentação e scaffolds.
- **Descrição/impacto:** Arquitetura/banco/testes e arquivos frontend Docker/nginx existentes são placeholders.
- **Evidência:** docs/arquitetura.md; banco-dados.md; testes.md; frontend/Dockerfile; nginx.conf em private/general-audit-20261013, ou arquivos relativos ao frontend/backend.
- **Reprodução:** Ler conteúdo apenas de comentário; nenhum serviço frontend usa esses arquivos atualmente.
- **Causa:** Estrutura inicial não acompanhou a implementação FastAPI/StaticFiles.
- **Grau de certeza:** Confirmado.
- **Solução proposta:** Manter conteúdo histórico e apontar documentação atual; decidir com revisão humana o destino dos scaffolds.
- **Dependências:** Revisão e autorização posterior.
- **Complexidade relativa:** P (P=pequena, M=média; não é estimativa em horas).
- **Risco da correção:** Médio.
- **Testes exigidos:** Links/documentos, instruções reproduzíveis e distinção entre implementado e planejado.

## A014 — P3

- **Módulo/ambiente:** Branding e favicon.
- **Descrição/impacto:** Teste local de assets exige um contrato ausente; favicon retorna 404.
- **Evidência:** suite-workspace-branding_assets/execution.log; diretórios .gitkeep; logs em private/general-audit-20261013, ou arquivos relativos ao frontend/backend.
- **Reprodução:** Executar o teste em cópia isolada: global EQUACIONEI_BRANDING_ASSETS não existe.
- **Causa:** Teste antecipado e pastas não versionadas sem mecanismo funcional correspondente.
- **Grau de certeza:** Confirmado.
- **Solução proposta:** Revisar escopo desse trabalho e o teste antes de aprovar; manter marca atual e arquivos não versionados intactos.
- **Dependências:** Revisão e autorização posterior.
- **Complexidade relativa:** P (P=pequena, M=média; não é estimativa em horas).
- **Risco da correção:** Médio.
- **Testes exigidos:** Teste alinhado ao escopo aprovado, Home/menu, proporcionalidade, assets/404 e identidade preservada.

## A015 — P3

- **Módulo/ambiente:** Carregamento das funções matemáticas.
- **Descrição/impacto:** Chart.js local é carregado sincronamente no head.
- **Evidência:** HTML primeiro/segundo grau; vendor 205889 bytes; métricas de navegação em private/general-audit-20261013, ou arquivos relativos ao frontend/backend.
- **Reprodução:** Inspecionar script sem defer e dependência de cálculo automático.
- **Causa:** Biblioteca bloqueante por compatibilidade de ordem; cache reduz custo em revisitas.
- **Grau de certeza:** Confirmado.
- **Solução proposta:** Medir carregamento frio; propor defer ordenado com cálculo depois da biblioteca, após autorização.
- **Dependências:** Revisão e autorização posterior.
- **Complexidade relativa:** P (P=pequena, M=média; não é estimativa em horas).
- **Risco da correção:** Médio.
- **Testes exigidos:** Cold/warm, cálculo inicial, Chart.version, ausência de gráficos duplicados e sem regressões de paint.

## A016 — P3

- **Módulo/ambiente:** Regras e contratos entre componentes.
- **Descrição/impacto:** Há motores de Dama em JS, backend Python e pacote offline, além de globais JS dependentes da ordem de scripts.
- **Evidência:** dama-rules.js; services/dama_game.py; offline/state.py; HTMLs em private/general-audit-20261013, ou arquivos relativos ao frontend/backend.
- **Reprodução:** Comparar variantes, promoção, captura e conversão de perspectiva/estado.
- **Causa:** Separação legítima de runtime, com duplicação de regras/representações sem corpus de paridade único identificado.
- **Grau de certeza:** Confirmado.
- **Solução proposta:** Definir contratos e fixtures comuns; modularizar fronteiras incrementalmente sem reescrever motores nesta fase.
- **Dependências:** Revisão e autorização posterior.
- **Complexidade relativa:** M (P=pequena, M=média; não é estimativa em horas).
- **Risco da correção:** Médio.
- **Testes exigidos:** Corpus de posições/transições em três implementações; regras históricas preservadas, import/order e fallback.
