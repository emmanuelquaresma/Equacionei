# Estabilização A003 e A004

**Estado final:** DEV e TESTE atualizados e homologados no escopo A003/A004; PRODUÇÃO preservada. O bloqueio operacional descrito neste documento é histórico e foi resolvido pela remoção específica autorizada e pelo novo verificador isolado.

Fechamento da retomada: 17/10/2026 (America/Sao_Paulo). Implementação e primeira tentativa em 16/10; coleta iniciada em 15/10. Base Git de develop/staging verificada: `e553e64a3a16f393502d750d88b3699ff1808ca1`, revisão funcional anterior `89a119f2f08d69735d8602ebd4c5d2a1edb540bf`, imagem `sha256:7c0f269b220b02eb84b1114aa5f68e97baa7de3c4f95dc2f20be1e273b46d0e2`. Main/PRODUÇÃO permanecem em `b0a2ef0` e imagem `sha256:061961c7c4ae243b9140ef5b6e972fcb95606c8aff278e4f95eae668e2ab6648`.

Relatórios anteriores foram consultados e preservados. Esta etapa não os substitui. Evidências privadas: `private/estabilizacao-a003-a004-20261015/`, ignorado pelo Git, fora do frontend e com permissão 0700. Implementação na worktree `/tmp/equacionei-estabilizacao-a003-a004`, branch `fix/estabilizacao-a003-a004`. A árvore principal em main e seus materiais não relacionados permanecem intactos.

## A003 — diagnóstico e causa raiz

A chave compartilhada é `matematica.python.progress.v1`. PythonProgress.create verificava somente version/exercises, aceitando arrays e registros individuais nulos ou com tipos incorretos. PythonProgress.row devolvia null se o ID já existisse. A inicialização em python-learning.js chama select → accountTime → progress.time; ao acessar elapsedTime do registro nulo, ocorria TypeError, interrompendo título, exercícios e preparação do executor. JSON inválido já era capturado, mas não havia normalização estrutural nem recuperação informada. sessionStorage não armazena esse progresso; o compartilhamento com Fundamentos/Hub usa localStorage e os IDs existentes.

## A003 — correção e preservação

Normalização na leitura: objeto simples para a coleção, registros por ID, contadores inteiros seguros não negativos, tempo finito não negativo, completed booleano e draft string quando presente. Campos adicionais e exercícios válidos são mantidos; IDs arbitrários não alteram protótipos da coleção. Não houve alteração nas chaves/IDs dos exercícios, critérios educativos ou validação de saída.

Antes de substituir um registro recuperado, preservar seus bytes em `matematica.python.progress.v1.recovery`. Nunca sobrescrever backup diferente. Se o backup não puder ser confirmado, a gravação do progresso original fica bloqueada: o laboratório funciona em memória e informa a limitação. Quota/armazenamento bloqueado não causam limpeza global. Versão futura (>1) não é rebaixada nem sobrescrita. Um objeto marcado com versão anterior pode recuperar campos compatíveis após backup; isso não afirma existência de um contrato v0 histórico documentado. Campos desconhecidos são preservados.

Aviso de recuperação usa o role=status existente. Falha de persistência informa que os dados anteriores foram preservados e que a atividade pode continuar na página. Não se garante persistência se o navegador proibir gravação ou se o backup reservado já contiver outro registro; nesses casos preservar o original tem prioridade sobre sobrescrever dados. Nenhum outro módulo é apagado ou regravado.

## A004 — diagnóstico e causa raiz

Em app.js, calcular gerava pontos por `x += passo` e criarTabela por `x++`. Para xmin=10000000000000000 e xmax=10000000000000100, o incremento pode ser inferior à distância entre números representáveis: x deixa de avançar. Intervalos grandes também criavam tabelas arbitrariamente extensas. Number de string vazia virava zero; Infinity/NaN e overflow/underflow do discriminante não eram validados.

## A004 — correção algorítmica

Validação explícita de todos os campos, formato decimal/exponencial e finitude; a diferente de zero e xmin menor que xmax. Conversão que perde um valor não zero por underflow é rejeitada. Coeficientes originais não são limitados, arredondados ou substituídos silenciosamente.

Cálculo do discriminante com escala comum e fórmula estável das raízes reduz overflow/underflow e cancelamento. Vértice/raízes/pontos devem ser finitos; resultados fora da faixa representável são rejeitados com mensagem. O discriminante fora da faixa Number pode ser exibido em notação científica, a partir da escala; não é biblioteca de precisão arbitrária. Coeficientes com diferenças que inviabilizam representação segura são recusados explicitamente.

Gráfico: até 101 pontos por índice inteiro, eliminando dependência de avanço de x. Coordenadas repetidas pelo arredondamento são descartadas; tabela inteira conserva o comportamento nos intervalos pequenos (máximo 201 linhas). Em intervalos amplos/inseguros para enumeração, tabela usa os mesmos pontos amostrados e informa isso ao usuário. Número de iterações e memória de saída são limitados independentemente da extensão do intervalo. Timeout existe somente nos testes de regressão, não como solução do algoritmo.

Entradas inválidas mantêm o último gráfico/resultados válidos e apresentam erro explicando essa retenção. Mensagens de erro/amostragem têm semântica acessível. Formulário não possuía botão de reset; restauração dos padrões foi testada por recarregamento, sem acrescentar funcionalidade nova. Números longos causaram overflow em 320 px durante o teste; a tabela passou a ter rolagem local com região nomeada e foco de teclado, sem mudança global de CSS ou identidade visual.

## Arquivos desta candidata

- app/frontend/js/python-core.js
- app/frontend/js/python-learning.js
- app/frontend/js/app.js
- app/frontend/segundo-grau.html
- tests/frontend/python-progress-recovery.test.js
- tests/frontend/quadratic-bounds.test.js
- tests/browser/stabilization_a003_a004.py
- docs/releases/estabilizacao-a003-a004.md
- scripts/verify-rollback-image.py (correção operacional autorizada na retomada)

Não inclui branding, infraestrutura, novas atividades, padronização visual ou refatoração de outros módulos.

## Evidências antes e depois

Antes: red-before-fix.json reproduz TypeError de elapsedTime e Worker quadrático encerrado em 500 ms. red-specific.json: progresso 2/18 cenários aprovados, 16 reprovados; quadrática 11/23 aprovados, 12 reprovados. A falha original e o intervalo de dois milhões de inteiros foram isolados em Worker terminado em até 750 ms, protegendo o processo/browser principal.

Depois: green-specific.json registra progresso 18/18, 117 verificações; quadrática 23/23. Casos: primeiro acesso, válido, null, vazio, JSON inválido, objeto/array inesperado, campos ausentes, tipos inválidos, versão anterior/futura, quota/backup ocupado e gravação indisponível; raízes distintas/duplas/inexistentes, a=0, negativos/decimais, 1e200/1e-200, próximos de zero, vazio/letras/Infinity/NaN, overflow/underflow e intervalos extremos. Evidências exploratórias de 320 px foram preservadas antes do ajuste da tabela.

## Gates e publicação

Candidata deve passar testes específicos e regressão isolada antes de DEV. DEV deve passar antes de TESTE. Mesma imagem reproduzível, derivada da imagem anterior homologada e sem reinstalar dependências flutuantes. Snapshot independente de cada ambiente deve preservar a camada gravável e ser verificado sem rede antes de concluir a promoção. Compose permanece intacto; overrides de imagem são privados. Não publicar, reiniciar ou alterar PRODUÇÃO; não fazer push/merge de main.

Resultados finais, revisão/imagem e rollbacks serão acrescentados após execução dos gates. Não há declaração antecipada de homologação.


## Bloqueio operacional — promoção interrompida

A regressão isolada terminou aprovada: 36 métodos de backend; dez grupos de navegador, incluindo os 33 cenários específicos A003/A004 e 70 cenários de início/interação dos jogos. Revisão funcional `bed64e895df7a07c5d6ec261da93c0f5a6e04bd7`; imagem reproduzível em dois builds independentes: `sha256:fe8438b6a8fb15a38fa5dbda6a745073eb7c202a759f9792196ffbaf454bb76b`.

A atualização de DEV foi interrompida por conflito de containers do Compose, antes de publicar a candidata. Containers de verificação de rollback criados na etapa anterior herdaram os labels com.docker.compose.project/service das imagens snapshot. O Compose os considera instâncias do serviço backend, tenta recriá-los e encontra o nome equacionei-dev-backend-1 já ocupado. A tentativa automática de rollback pelo mesmo Compose reproduziu o conflito. Logs completos: dev-deploy.log e dev-rollback-execution.log no diretório privado desta etapa.

A operação parou o container original de DEV. Sua disponibilidade foi restaurada por docker start do ID original, sem recriação, remoção ou mudança de imagem; /health voltou a 200. DEV, TESTE, PRODUÇÃO e PostgreSQL foram conferidos em execução com seus IDs e imagens originais, registrados em blocked-operational-state.json. A candidata não está publicada em DEV/TESTE; nenhuma branch remota foi promovida nesta etapa. Main/PRODUÇÃO não sofreram alteração. O snapshot de DEV desta etapa foi preservado em dev-snapshot.json, junto às imagens históricas.

A candidata, os testes e as evidências permanecem disponíveis para revisão. Não há homologação antecipada de DEV/TESTE. O relatório está atualizado localmente; o commit bed64e8 contém o código e a versão inicial do relatório, e este adendo ainda não foi commitado.

### Ação proposta para desbloqueio, ainda não autorizada

Confirmar novamente IDs/estado/ausência de volumes e remover somente dois artefatos de verificação: o container parcial criado pela tentativa falha (`58eb2254e6e4_equacionei-dev-backend-1`, Created) e a verificação antiga de TESTE (`equacionei-rollback-verificacao-test-20261015`, Exited). Sem -f, sem -v, sem remover imagens, volumes ou containers dos serviços originais. A execução exige autorização específica devido à restrição de comandos destrutivos e à instrução de interromper diante de bloqueio técnico.

Antes de retomar, corrigir o verificador de rollback para substituir os labels de projeto/serviço herdados por labels de auditoria próprios; isso não modifica Compose, infraestrutura ou a aplicação. Revalidar a equivalência do snapshot em container isolado, retomar DEV e só depois TESTE. Se os metadados ou volumes não corresponderem ao esperado, parar novamente. Não repetir o deploy antes desse saneamento controlado.


## Retomada autorizada — saneamento concluído

O usuário autorizou exclusivamente a remoção dos dois artefatos identificados. Antes da remoção, foram reconferidos os IDs completos 00ad1883ba26cc0390370ec8a76f39a0dde604c26571f3475131c264276f4c2b (Created) e a70c32779a5d8262885978c881beee49b5e1252596150e61bdc699bfae0d0de8 (Exited), nomes, imagens, labels, ausência de mounts/volumes e referências de containers ativos. Nenhuma divergência foi observada.

Foram removidos somente esses dois IDs, sem force e sem opção de volumes. O inventário posterior confirmou preservação de todas as imagens/tags, redes, volumes e outros containers. A comparação inicial de IDs curtos/completos exigiu normalização no conferidor; não houve remoção adicional. Evidências: retomada-autorizada/before-removal.json, removal.log e after-removal.json.

O novo procedimento versionado scripts/verify-rollback-image.py substitui todos os labels Compose herdados e identifica a verificação como projeto equacionei-rollback-audit, serviço verification e oneoff=True. Confere essa identidade e exclusão dos seletores dos projetos DEV/TESTE/PRODUÇÃO antes de iniciar o container. Usa --network none, raiz somente leitura, sem volumes, e mantém o container parado como evidência. Não remove recursos automaticamente. A publicação também exige exatamente um backend esperado no seletor Compose antes de prosseguir.

O rollback anterior de DEV foi reconferido com esse procedimento: 124 arquivos idênticos à linha de base; verificador fora dos seletores dos ambientes ativos. O deploy verificará o snapshot antes de cada troca. Os registros anteriores de bloqueio permanecem acima como histórico; esta autorização resolve somente o saneamento operacional, sem antecipar homologação dos novos ambientes.

## Resultado final observado após a retomada autorizada

Revisão funcional: `bed64e895df7a07c5d6ec261da93c0f5a6e04bd7`. Imagem: `sha256:fe8438b6a8fb15a38fa5dbda6a745073eb7c202a759f9792196ffbaf454bb76b`; tag local `equacionei-backend:candidata-bed64e8`. Dois builds sem cache, usando base imutável anterior e SOURCE_DATE_EPOCH/timestamps normalizados, produziram esse mesmo ID. Os 31 pacotes instalados são idênticos aos da imagem anterior; requirements e os 124 arquivos de aplicação foram conferidos por hash. A reprodução depende da base local identificada, não de uma nova resolução de dependências no índice.

| Ambiente | Backend | Grupos navegador | A003/A004 | Resultado |
|---|---|---|---|---|
| isolated | 36 métodos, zero falhas/erros/ignorados | 10 executados | 33 cenários do executor | Aprovados no escopo |
| dev | 36 métodos, zero falhas/erros/ignorados | 14 executados | 33 cenários do executor | Aprovados no escopo |
| test | 36 métodos, zero falhas/erros/ignorados | 14 executados | 33 cenários do executor | Aprovados no escopo |

Os 33 cenários específicos incluem 18 formatos/condições de persistência (117 verificações) e 23 cálculos em Workers limitados a 750 ms, 11 inicializações com armazenamento adverso na interface, nove execuções Python corretas/incorretas com rascunho/reload/troca de exercício, nove cenários de gráfico/entrada inválida/reload e testes adicionais de Chart.js e teclado nativo. Não somar as contagens de suítes, subcasos e asserções como testes distintos. Ctrl+Enter executa Python; Tab/Enter aciona o cálculo; mouse e toque CDP foram usados.

Resoluções dos módulos corrigidos: 320×568, 360×640, 375×667, 390×844, 412×915, 430×932, 768×1024, 1024×768 e 1366×900. Ausência de overflow horizontal da página e hit testing dos controles foram verificados, inclusive após entradas extremas. A tabela pode ter rolagem local intencional para preservar valores completos. Mensagens de erro/reparo foram exercitadas. Recarregamento restaura parâmetros padrão da calculadora e conserva o rascunho Python.

Chrome desktop headless com emulação móvel/toque CDP, não dispositivos físicos. Firefox desktop também foi exercitado na regressão: a largura solicitada de 375 é limitada pelo navegador a 500 px reais. Não há validação em Safari/WebKit, iPhone/Android físicos, teclado virtual real ou leitor de tela humano.

## Regressão geral executada

- dev: 70 cenários de início/interação de todos os modos representados; 152 combinações de jogos/menu em 19 perfis; 2 partidas Dama online com dois clientes e jogada sincronizada; 16 fluxos por navegação normal e conclusão de atividades; 21 cenários Firefox. Zero falhas nos gates.
- test: 70 cenários de início/interação de todos os modos representados; 152 combinações de jogos/menu em 19 perfis; 2 partidas Dama online com dois clientes e jogada sincronizada; 16 fluxos por navegação normal e conclusão de atividades; 21 cenários Firefox. Zero falhas nos gates.

Xadrez: 15 lições/30 exercícios, teclado, toque e motor. Dama local/IA/online, Labirinto, Queda, Relâmpago, Pares e Racha passaram. Fundamentos Matemáticos, 1º grau, Python, Hub/Fundamentos de DS e XGBoost passaram. XGBoost inclui treino/previsão, classificação/regressão/upload/erros; backend cobre HTTP e WebSocket em processo de teste isolado. Não houve treino/carga em PRODUÇÃO. Finais de partidas/campanhas de alguns jogos usam fixtures/relógio controlado conforme auditoria; isso não é campanha natural integral jogada por pessoa.

Logs privados dos novos serviços: zero tracebacks, zero HTTP 5xx e zero linhas ERROR na janela coletada. Respostas 4xx intencionais dos testes inválidos não são indisponibilidade. Artefatos por fase em `{isolated,dev,test}/results.json`, logs e screenshots privados. Execuções de navegador têm timeout externo de 600 s; Workers numéricos têm limite de 750 ms e são terminados/revogados; saída do algoritmo é limitada a 101 pontos/201 linhas. Não foi teste de carga nem medição de Lighthouse/Core Web Vitals.

## Estado final, Git e publicação

DEV (8000) e TESTE (8002) executam a mesma imagem `sha256:fe8438b6a8fb15a38fa5dbda6a745073eb7c202a759f9792196ffbaf454bb76b` com revisão OCI `bed64e895df7a07c5d6ec261da93c0f5a6e04bd7`. A funcionalidade A003/A004 está homologada nos cenários registrados. Um commit documental posterior registra os resultados, sem diferença em app/tests; referências Git finais são registradas em git-sync.json após fast-forward de develop/staging. Main e PRODUÇÃO permanecem em b0a2ef0/061961c7c4ae.

PRODUÇÃO mantém o mesmo ID de container/imagem, assim como PostgreSQL; portanto não houve recriação/reinício desses serviços nesta tarefa. Compose, Cloudflare, volumes, branding e branches históricas não foram modificados. A003/A004 continuam no artefato público anterior até autorização e publicação futuras.

## Rollback independente

- dev: `equacionei-dev-backend:rollback-estabilizacao-a003-a004-20261015` → `sha256:cbf74759a3f3b3295b5b2b4692a4e5c24068e439ebcc606d76533c045bb95e76`; snapshot da camada gravável anterior. Verificado em container isolado sem rede: 124 arquivos iguais à linha de base. Imagem original anterior `sha256:7c0f269b220b02eb84b1114aa5f68e97baa7de3c4f95dc2f20be1e273b46d0e2` também preservada.
- test: `equacionei-test-backend:rollback-estabilizacao-a003-a004-20261015` → `sha256:7cad8f294763e60bd9ce1d77f30dc0748d7be130cf86462cf5fa49587c291945`; snapshot da camada gravável anterior. Verificado em container isolado sem rede: 124 arquivos iguais à linha de base. Imagem original anterior `sha256:7c0f269b220b02eb84b1114aa5f68e97baa7de3c4f95dc2f20be1e273b46d0e2` também preservada.

Comandos documentados, não executados nos ambientes em uso, a partir da raiz do repositório:

```bash
docker compose -p equacionei-dev -f docker-compose.yml -f docker-compose.dev.yml -f private/estabilizacao-a003-a004-20261015/dev-rollback.json up -d --no-build --no-deps --pull never backend
docker compose -p equacionei-test -f docker-compose.yml -f docker-compose.test.yml -f private/estabilizacao-a003-a004-20261015/test-rollback.json up -d --no-build --no-deps --pull never backend
```

Snapshots não preservam memória de partidas/modelos/conexões; recriar aplicativos encerra sessões voláteis. localStorage pertence ao navegador/origem e não é apagado pela troca de imagem. Rollbacks históricos e relatórios anteriores permanecem preservados. Na retomada autorizada não foi necessário reverter a candidata. O incidente inicial, a tentativa automática de rollback e a restauração do DEV original estão documentados na seção histórica do bloqueio.

## Riscos e pendências restantes

O cálculo usa Number/precisão dupla; não é matemática arbitrária. Há rejeição explícita quando resultados/representação não são seguros. A tabela de intervalos amplos é amostrada e sinalizada. Recuperação Python prioriza preservação do original e do backup; se persistência falhar ou o backup já guardar outro registro, continua em memória com aviso. Não há migração de schema futuro nem sincronização central de alunos.

Persistem os outros achados da auditoria: configuração/exposição de PostgreSQL a revisar sem alteração nesta tarefa, backups/restauração não comprovados, CI, dependências, acessibilidade e propostas visuais. Isso não impede registrar a aprovação limitada a A003/A004, mas não equivale à homologação integral de toda a plataforma. Publicação em PRODUÇÃO exige autorização explícita posterior e revisão desses requisitos. Nenhuma autorização para PRODUÇÃO foi usada ou inferida.

## Commits e saneamento operacional final

Revisão funcional `bed64e895df7a07c5d6ec261da93c0f5a6e04bd7`; procedimento de rollback corrigido no commit `442a6c3` (sem diferença em app/tests). O commit documental de fechamento e as pontas remotas verificadas são registrados em git-sync.json. A imagem permanece a mesma testada em todos os ambientes; não houve rebuild para documentos ou procedimento externo ao runtime.

A autorização de saneamento foi aplicada somente aos IDs previamente conferidos. Imagens/tags, redes e volumes originais foram preservados. Os backends DEV/TESTE foram recriados como parte da publicação autorizada; PRODUÇÃO/PostgreSQL mantiveram seus IDs originais. A conferência final registra exatamente um backend de cada projeto Compose e verifica que os containers temporários de rollback são one-off, sem rede, sem volumes e fora desses seletores. Evidências em retomada-autorizada/.
