# Auditoria visual e aproveitamento de tela

Data de consolidação: **15/10/2026**. Coleta iniciada em 13/10/2026; nomes de diretórios conservam a data inicial. Revisão: `b0a2ef0c01458b1e17fe4b34acdf29ef1acecd73`. Branch ativa no início: `main`; alterações locais preexistentes não são tratadas como aprovação.

Metodologia: inspeção de fonte/Git, hashes SHA-256, Docker e PostgreSQL somente leitura, perfis de navegador isolados, entrada física via CDP/WebDriver e testes em cópias temporárias. **Nenhuma correção, commit, push, publicação ou reinício de container existente nesta etapa.** A auditoria anterior foi preservada. Evidências: [diretório privado](../../private/general-audit-20261013/).

## Abrangência e evidência

31 estados de tela foram amostrados em 19 combinações no público (589 capturas). Nove estados prioritários foram repetidos em DEV (171), totalizando **760 capturas e medições**. Há 21 cenários adicionais Firefox. As imagens são de navegador headless; não há equivalência com aparelho físico. Não vieram anexos de screenshots do usuário nesta conversa; a referência disponível foi a auditoria anterior e as capturas próprias atuais. Não foi implementada qualquer alteração visual.

Ver [galeria comparativa local](../../private/general-audit-20261013/galeria-visual.html), [matriz CSV](../../private/general-audit-20261013/visual-matrix.csv) e [JSON de geometria/cores/fontes](../../private/general-audit-20261013/visual-matrix.json). Os links privados locais não estarão disponíveis num clone que só contenha os Markdown.

## Comparação das quatro telas prioritárias

| Tela | 375×667 — compacta | 393×852 — ampla | 1366×900 — desktop |
|---|---|---|---|
| Aplicações Matemáticas | [captura](../../private/general-audit-20261013/screenshots/public-applications-375x667.png) | [captura](../../private/general-audit-20261013/screenshots/public-applications-393x852.png) | [captura](../../private/general-audit-20261013/screenshots/public-applications-1366x900.png) |
| Queda Matemática | [captura](../../private/general-audit-20261013/screenshots/public-queda-matematica-play-375x667.png) | [captura](../../private/general-audit-20261013/screenshots/public-queda-matematica-play-393x852.png) | [captura](../../private/general-audit-20261013/screenshots/public-queda-matematica-play-1366x900.png) |
| Labirinto Matemático | [captura](../../private/general-audit-20261013/screenshots/public-labirinto-matematico-play-375x667.png) | [captura](../../private/general-audit-20261013/screenshots/public-labirinto-matematico-play-393x852.png) | [captura](../../private/general-audit-20261013/screenshots/public-labirinto-matematico-play-1366x900.png) |
| Jogo dos Pares | [captura](../../private/general-audit-20261013/screenshots/public-jogo-dos-pares-play-375x667.png) | [captura](../../private/general-audit-20261013/screenshots/public-jogo-dos-pares-play-393x852.png) | [captura](../../private/general-audit-20261013/screenshots/public-jogo-dos-pares-play-1366x900.png) |

| Aplicações Matemáticas | Jogo dos Pares |
|---|---|
| ![Aplicações em 375×667](../../private/general-audit-20261013/screenshots/public-applications-375x667.png) | ![Pares em 375×667](../../private/general-audit-20261013/screenshots/public-jogo-dos-pares-play-375x667.png) |

## Inventário por estado

A tabela registra valores computados em 375×667; o JSON contém todos os tamanhos. `max-width` é regra computada, não largura útil medida; o padding do main não inclui margens/títulos externos. Rodapé 0 significa ausência de `<footer>` nesse documento, não falha obrigatória. A coluna de controle é uma amostra, não catálogo completo de botões.

| Estado | Cabeçalho | Main: máximo/padding | Título visível | Controle: fonte/fundo/texto | Footer | Evidência |
|---|---|---|---|---|---|---|
| about | 65.0 px | none; 16px 24px 40px | 25.6px; Sobre o ∑quacionei | 13.3333px; rgb(255, 255, 255); rgb(22, 54, 83) | 0 | [375×667](../../private/general-audit-20261013/screenshots/public-about-375x667.png) |
| applications | 65.0 px | none; 16px 18px 28px | 25.6px; Aplicações matemáticas | 13.3333px; rgb(255, 255, 255); rgb(22, 54, 83) | 0 | [375×667](../../private/general-audit-20261013/screenshots/public-applications-375x667.png) |
| dama-play | 76.6 px | none; 8px 10px 28px | — | 13.3333px; rgb(255, 255, 255); rgb(22, 54, 83) | 0 | [375×667](../../private/general-audit-20261013/screenshots/public-dama-play-375x667.png) |
| dama-setup | 76.6 px | none; 8px 10px 28px | 24px; Modo de jogo | 13.3333px; rgb(255, 255, 255); rgb(22, 54, 83) | 0 | [375×667](../../private/general-audit-20261013/screenshots/public-dama-setup-375x667.png) |
| desafio-relampago-play | 76.6 px | none; 12px 10px 28px | — | 13.3333px; rgb(255, 255, 255); rgb(22, 54, 83) | 0 | [375×667](../../private/general-audit-20261013/screenshots/public-desafio-relampago-play-375x667.png) |
| desafio-relampago-setup | 76.6 px | none; 12px 10px 28px | — | 13.3333px; rgb(255, 255, 255); rgb(22, 54, 83) | 0 | [375×667](../../private/general-audit-20261013/screenshots/public-desafio-relampago-setup-375x667.png) |
| development | 65.0 px | 1120px; 16px 10px 24px | 25.6px; Desenvolvimento | 13.3333px; rgb(255, 255, 255); rgb(22, 54, 83) | 0 | [375×667](../../private/general-audit-20261013/screenshots/public-development-375x667.png) |
| ds-ai | 65.0 px | 1180px; 16px 12px 48px | 28.8px; DATA SCIENCE | 16px; rgb(255, 255, 255); rgb(22, 54, 83) | 0 | [375×667](../../private/general-audit-20261013/screenshots/public-ds-ai-375x667.png) |
| ds-foundations | 65.0 px | 1120px; 12px 16px 40px | 25.6px; Fundamentos | 13.3333px; rgb(255, 255, 255); rgb(22, 54, 83) | 0 | [375×667](../../private/general-audit-20261013/screenshots/public-ds-foundations-375x667.png) |
| ds-hub | 65.0 px | 1180px; 16px 12px 48px | 28.8px; DATA SCIENCE | 16px; rgb(255, 255, 255); rgb(22, 54, 83) | 0 | [375×667](../../private/general-audit-20261013/screenshots/public-ds-hub-375x667.png) |
| ds-lab | 65.0 px | 1180px; 16px 12px 48px | 28.8px; DATA SCIENCE | 16px; rgb(255, 255, 255); rgb(22, 54, 83) | 0 | [375×667](../../private/general-audit-20261013/screenshots/public-ds-lab-375x667.png) |
| ds-lesson | 65.0 px | 1120px; 12px 16px 40px | 25.6px; Fundamentos | 13.3333px; rgb(255, 255, 255); rgb(22, 54, 83) | 0 | [375×667](../../private/general-audit-20261013/screenshots/public-ds-lesson-375x667.png) |
| ds-my-data | 65.0 px | 1180px; 16px 12px 48px | 28.8px; DATA SCIENCE | 16px; rgb(255, 255, 255); rgb(22, 54, 83) | 0 | [375×667](../../private/general-audit-20261013/screenshots/public-ds-my-data-375x667.png) |
| games-menu | 65.0 px | none; 16px 18px 28px | 25.6px; Jogos educativos | 13.3333px; rgb(255, 255, 255); rgb(22, 54, 83) | 0 | [375×667](../../private/general-audit-20261013/screenshots/public-games-menu-375x667.png) |
| home | 65.0 px | none; 12px | 20.8px; Aprender exatas pode ser diferente. | 13.3333px; rgb(255, 255, 255); rgb(22, 54, 83) | 0 | [375×667](../../private/general-audit-20261013/screenshots/public-home-375x667.png) |
| jogo-dos-pares-play | 76.6 px | 760px; 12px 10px 24px | 12.8px; Representação | 13.3333px; rgb(255, 255, 255); rgb(22, 54, 83) | 0 | [375×667](../../private/general-audit-20261013/screenshots/public-jogo-dos-pares-play-375x667.png) |
| labirinto-matematico-play | 76.6 px | 1050px; 8px 10px | — | 13.3333px; rgb(255, 255, 255); rgb(22, 54, 83) | 0 | [375×667](../../private/general-audit-20261013/screenshots/public-labirinto-matematico-play-375x667.png) |
| labirinto-matematico-setup | 76.6 px | 1050px; 12px 10px 28px | — | 13.3333px; rgb(255, 255, 255); rgb(22, 54, 83) | 0 | [375×667](../../private/general-audit-20261013/screenshots/public-labirinto-matematico-setup-375x667.png) |
| linear | 65.0 px | 1100px; 0px 20px | 29.6px; Função do 1º Grau | 16px; rgb(255, 255, 255); rgb(22, 54, 83) | 1 | [375×667](../../private/general-audit-20261013/screenshots/public-linear-375x667.png) |
| math-expressoes-algebricas | 65.0 px | none; 10px 12px 24px | 23.2px; Expressões Algébricas | 13.3333px; rgb(255, 255, 255); rgb(22, 54, 83) | 0 | [375×667](../../private/general-audit-20261013/screenshots/public-math-expressoes-algebricas-375x667.png) |
| math-fracoes | 65.0 px | none; 10px 12px 24px | 23.2px; Frações | 13.3333px; rgb(255, 255, 255); rgb(22, 54, 83) | 0 | [375×667](../../private/general-audit-20261013/screenshots/public-math-fracoes-375x667.png) |
| math-multiplicacao-divisao | 65.0 px | none; 10px 12px 24px | 23.2px; Multiplicação e Divisão | 13.3333px; rgb(255, 255, 255); rgb(22, 54, 83) | 0 | [375×667](../../private/general-audit-20261013/screenshots/public-math-multiplicacao-divisao-375x667.png) |
| math-potenciacao | 65.0 px | none; 10px 12px 24px | 23.2px; Potenciação | 13.3333px; rgb(255, 255, 255); rgb(22, 54, 83) | 0 | [375×667](../../private/general-audit-20261013/screenshots/public-math-potenciacao-375x667.png) |
| python | 65.0 px | 1120px; 8px 10px 24px | 16.8px; Olá, Python! | 13.3333px; rgb(255, 255, 255); rgb(22, 54, 83) | 0 | [375×667](../../private/general-audit-20261013/screenshots/public-python-375x667.png) |
| quadratic | 65.0 px | 1100px; 0px 20px | 29.6px; Função do 2º Grau | 16px; rgb(255, 255, 255); rgb(22, 54, 83) | 1 | [375×667](../../private/general-audit-20261013/screenshots/public-quadratic-375x667.png) |
| queda-matematica-play | 76.6 px | 1050px; 12px 10px 24px | — | 16px; rgb(255, 255, 255); rgb(22, 54, 83) | 0 | [375×667](../../private/general-audit-20261013/screenshots/public-queda-matematica-play-375x667.png) |
| queda-matematica-setup | 76.6 px | 1050px; 12px 10px 24px | 24px; Escolha a dificuldade | 16px; rgb(255, 255, 255); rgb(22, 54, 83) | 0 | [375×667](../../private/general-audit-20261013/screenshots/public-queda-matematica-setup-375x667.png) |
| racha-cuca-play | 76.6 px | none; 12px 10px 30px | — | 13.3333px; rgb(255, 255, 255); rgb(22, 54, 83) | 0 | [375×667](../../private/general-audit-20261013/screenshots/public-racha-cuca-play-375x667.png) |
| racha-cuca-setup | 76.6 px | none; 12px 10px 30px | 24px; Escolha seu desafio | 13.3333px; rgb(255, 255, 255); rgb(22, 54, 83) | 0 | [375×667](../../private/general-audit-20261013/screenshots/public-racha-cuca-setup-375x667.png) |
| xadrez-play | 76.6 px | 1120px; 12px 10px 22px | 16px; Capturadas pelas brancas | 13.3333px; rgb(255, 255, 255); rgb(22, 54, 83) | 0 | [375×667](../../private/general-audit-20261013/screenshots/public-xadrez-play-375x667.png) |
| xgboost-setup | 65.0 px | 1100px; 22px 12px | 26.4px; Laboratório XGBoost | 16px; rgb(255, 255, 255); rgb(22, 54, 83) | 0 | [375×667](../../private/general-audit-20261013/screenshots/public-xgboost-setup-375x667.png) |

## Diagnóstico visual

- **Identidade:** marca ∑quacionei, slogan, azul/ink e amarelo já são reconhecíveis e devem permanecer. A tipografia do body é compartilhada. Os problemas não exigem redesenhar logotipo ou cores.
- **Cabeçalho/navegação:** páginas comuns medem ~65 px no celular; jogos ~76–77 px pelo contexto adicional. Em 375×667 o cabeçalho dos jogos ocupa ~11,5% da viewport. Não é correto impor a mesma altura fixa a todos os estados: menu aberto, zoom e texto maior precisam crescer.
- **Aplicações/carrossel:** em 375 px o cartão começa perto de y=282, após título, eyebrow, descrição e padding. A altura padrão e a centralização deixam os indicadores próximos do fim da primeira tela. No desktop mantém um cartão central, enquanto o hub adota grade e carrosséis diferentes. Setas móveis de 32 px não seguem o alvo confortável de 44 px.
- **Labirinto:** mapa de 355×355 em 375 px usa praticamente toda a largura disponível; não é pequeno em relação à largura do celular. O problema mais claro é desktop/tablet: controles/legenda empilhados entram no cálculo de altura, reduzindo o mapa a 450 px em 1366×900 e 318 px em 1024×768. Um painel lateral pode aproveitar o espaço sem forçar porcentagem universal.
- **Pares:** cartões têm representação/valor legíveis, duas colunas sem overflow e alvos generosos. O reinício fica parcialmente abaixo da primeira tela de 375×667; a menor rolagem geométrica estimada é ~23 px. Compactar contexto/progresso e aproximar controles é preferível a reduzir frações/alvos.
- **Queda:** o bug de 640×360/667×375 é funcional, não apenas estético; elementos seguintes recebem o toque sobre controles. O cálculo de altura e a caixa de fluxo precisam ser consistentes. DEV já possui a correção prévia e não falhou no mesmo hit testing.
- **Dama/Xadrez:** board quadrado e legibilidade são adequados nos cenários medidos; controles/capturas/informações móveis ficam empilhados e podem exigir rolagem. Capturas/legenda podem ser recolhidas, mas início/reinício/retorno devem continuar acessíveis. Na Dama, perda de foco ao selecionar é problema de acessibilidade separado da aparência.
- **Racha/Relâmpago:** o puzzle usa grande área interativa; descrição, recorde e ações disputam altura. Relâmpago é formulário de pergunta/resposta, portanto não deve ser avaliado pela porcentagem de um tabuleiro quadrado. Feedback e teclado virtual importam mais que “encher” a tela.
- **Conteúdos/Python/DS:** funções de 1º/2º grau reservam ~160–175 px entre header e main para título/descrição e repetem identificação no conteúdo. Python empilha enunciado/editor/ações no celular. O hub tem longa grade de etapas/prévias. Aulas de DS têm largura de leitura própria (900 px desktop), justificável; uniformidade não significa larguras idênticas para texto, editor e jogos.
- **Painéis, botões, modais e formulários:** há raios/paddings/cores e estados definidos por jogo; .q-panel/.maze-panel/.rc-panel/.ds-panel/.dev-* e .card repetem estrutura. Dialogs de promoção/reinício e confirmação Python têm contratos diferentes, mas devem preservar foco, Escape, texto e retorno ao acionador. As suítes existentes exercitam esses estados; não foram capturados todos os modais em todos os tamanhos.
- **CSS:** 19 arquivos, 164 literais de cor e 192 seletores com ocorrências repetidas na busca textual. Isso é sinal de revisão, não 192 conflitos comprovados. Há redefinições de header/nav em 720/1200, regras de layout do Labirinto em 767/1000/430 e CSS global de botões/seletores. A cascata deve ser explicada antes de extrair componentes.

## Acessibilidade, cortes e estados

Não houve overflow horizontal global nas 760 combinações; recortes intencionais dentro de carrosséis e pre/table não devem ser tratados como overflow do documento. O hit testing identificou dois casos públicos de controles encobertos. A navegação de teclado/AX amostrou 44 estados; nomes acessíveis e foco visível nos percursos passaram. Prova específica encontrou perda de foco na Dama. O Canvas do Labirinto continua sem mapa textual equivalente. O contraste computado dos elementos amostrados não acusou baixo contraste; não inclui todos os pixels de Canvas/SVG, imagens, opacidade herdada, hover/disabled e estados finais.

Altura reduzida do editor a 375×400 manteve Executar alcançável/hit-tested; pinch em escala 2 foi registrado. Isso não reproduz o teclado virtual do sistema, safe areas físicas, barras dinâmicas do Safari, zoom de texto ou uso real com leitor de tela. São pendências para a homologação humana, não aprovação presumida.

Ver [design system](design-system-proposto.md), [padrão dos jogos](padrao-layout-jogos.md), [matriz](matriz-responsividade.md) e [plano visual](plano-padronizacao-visual.md).
