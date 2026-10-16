# Estabilização A003 e A004

Data de fechamento: 16/10/2026 (America/Sao_Paulo). Coleta iniciada em 15/10. Base Git de develop/staging verificada: `e553e64a3a16f393502d750d88b3699ff1808ca1`, revisão funcional anterior `89a119f2f08d69735d8602ebd4c5d2a1edb540bf`, imagem `sha256:7c0f269b220b02eb84b1114aa5f68e97baa7de3c4f95dc2f20be1e273b46d0e2`. Main/PRODUÇÃO permanecem em `b0a2ef0` e imagem `sha256:061961c7c4ae243b9140ef5b6e972fcb95606c8aff278e4f95eae668e2ab6648`.

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

Não inclui branding, infraestrutura, novas atividades, padronização visual ou refatoração de outros módulos.

## Evidências antes e depois

Antes: red-before-fix.json reproduz TypeError de elapsedTime e Worker quadrático encerrado em 500 ms. red-specific.json: progresso 2/18 cenários aprovados, 16 reprovados; quadrática 11/23 aprovados, 12 reprovados. A falha original e o intervalo de dois milhões de inteiros foram isolados em Worker terminado em até 750 ms, protegendo o processo/browser principal.

Depois: green-specific.json registra progresso 18/18, 117 verificações; quadrática 23/23. Casos: primeiro acesso, válido, null, vazio, JSON inválido, objeto/array inesperado, campos ausentes, tipos inválidos, versão anterior/futura, quota/backup ocupado e gravação indisponível; raízes distintas/duplas/inexistentes, a=0, negativos/decimais, 1e200/1e-200, próximos de zero, vazio/letras/Infinity/NaN, overflow/underflow e intervalos extremos. Evidências exploratórias de 320 px foram preservadas antes do ajuste da tabela.

## Gates e publicação

Candidata deve passar testes específicos e regressão isolada antes de DEV. DEV deve passar antes de TESTE. Mesma imagem reproduzível, derivada da imagem anterior homologada e sem reinstalar dependências flutuantes. Snapshot independente de cada ambiente deve preservar a camada gravável e ser verificado sem rede antes de concluir a promoção. Compose permanece intacto; overrides de imagem são privados. Não publicar, reiniciar ou alterar PRODUÇÃO; não fazer push/merge de main.

Resultados finais, revisão/imagem e rollbacks serão acrescentados após execução dos gates. Não há declaração antecipada de homologação.
