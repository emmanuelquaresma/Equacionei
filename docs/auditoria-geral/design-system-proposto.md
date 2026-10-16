# Design system proposto

Data de consolidação: **15/10/2026**. Coleta iniciada em 13/10/2026; nomes de diretórios conservam a data inicial. Revisão: `b0a2ef0c01458b1e17fe4b34acdf29ef1acecd73`. Branch ativa no início: `main`; alterações locais preexistentes não são tratadas como aprovação.

Metodologia: inspeção de fonte/Git, hashes SHA-256, Docker e PostgreSQL somente leitura, perfis de navegador isolados, entrada física via CDP/WebDriver e testes em cópias temporárias. **Nenhuma correção, commit, push, publicação ou reinício de container existente nesta etapa.** A auditoria anterior foi preservada. Evidências: [diretório privado](../../private/general-audit-20261013/).

## Status da proposta

Documento de design para revisão, **sem CSS/JS aplicado**. Preserva ∑quacionei, slogan, composição da marca e cores atuais. Tokens/componentes abaixo são proposta de organização da identidade existente. A biblioteca pode ser implementada incrementalmente no stack HTML/CSS/JS atual; não pressupõe migração de framework.

## Tokens propostos

| Categoria | Token semântico proposto | Valor inicial / critério |
|---|---|---|
| Cores | brand / text / muted | #17659a / #163653 / #516a7f — mapeiam cores atuais. |
| Superfícies | background / surface / border | #f7fafc / #ffffff / #dae5ed. |
| Ação | action-soft / action-active | #fff3c9 / #ffe087; botão principal pode usar azul com texto branco se contraste/consistência forem aprovados. |
| Estado | success / success-bg | #47775b / #edf7ef; sem depender só de cor. |
| Estado | error / error-bg | #8b2138 / #fff1f3; mensagem vinculada ao campo. |
| Estado | info / info-bg | #075785 / #e5f1fb; preservar cores de conteúdo e tabuleiros. |
| Tipografia | font-body | "Segoe UI", system-ui, sans-serif; manter fontes do sistema. |
| Tipografia | font-code | ui-monospace, Consolas, monospace; base de editor 16 px para evitar zoom de input involuntário onde aplicável. |
| Escala | caption / small / body / subtitle / title | 12 / 14 / 16 / 20 / 24–32 px; títulos de hero até 40 quando houver espaço. Não reduzir texto essencial para caber. |
| Linha | body / heading / code | ~1,5 / 1,2 / 1,5; limitar largura de leitura por caracteres. |
| Espaçamento | space-1…7 | 4, 8, 12, 16, 24, 32, 48 px; exceções documentadas. |
| Raios | control / panel / dialog | 10 / 16 / 16 px como ponto de partida; tabuleiros têm moldura própria. |
| Sombra | panel / floating | Sutil com ink e baixa opacidade; reservar maior elevação para modal/menu. |
| Larguras | reading / application / game | ~72ch ou até 900 px de leitura; ~1180 px aplicação; jogo por slot e proporção, sem teto único de todos os tipos. |
| Alvos | primary-control / dense-board | 44×44 px para controles comuns; grades densas devem respeitar mínimo/spacing aplicáveis e oferecer teclado/zoom, sem alegar que cada casa de 8×8 cabe em 44 px numa tela de 320 px. |
| Foco | focus-ring | 3 px azul com offset 2–3 px; contraste visível em superfície clara/escura. |
| Camadas | base / sticky-header / floating / modal | Mapa pequeno e documentado de z-index; usar top-layer de dialog quando apropriado, não elevar botões para mascarar fluxo quebrado. |

Os valores são candidatos de compatibilidade com o visual atual, não uma aprovação automática de todos os pares de contraste. Mapear as variáveis existentes --site-* como aliases durante transição evita mudança simultânea de todos os módulos. Não alterar chaves de localStorage, IDs de testes, regras ou URLs para padronizar aparência.

## Componentes e contratos

| Componente | Contrato visual e de interação | Estados/verificações |
|---|---|---|
| Cabeçalho | Marca/contexto, navegação, toggle, altura natural medida; variante compacta durante atividade. | Menu aberto/fechado, foco/Escape, zoom, texto maior, safe area e retorno ao acionador. |
| Container de página | Variantes leitura, aplicação e jogo; gutter 12/16 móvel e 24 desktop, sem padding duplicado em filhos. | 320 px, landscape curto, tablet, largura máxima e sem overflow global. |
| Título/contexto | Um H1 semanticamente estável; identificação pode ser visualmente compacta durante jogo. | Sem repetição ornamental ocupando a primeira tela; nome acessível preservado. |
| Botão primário/secundário/discreto | Altura mínima e padding comuns; ícone com nome; sem tornar todo link um botão. | Normal, hover, focus-visible, pressed, loading, disabled; manter indicação além de cor. |
| Campos/seletores | Label explícito, ajuda/erro por aria-describedby, fontes legíveis; largura por conteúdo. | Vazio/inválido/válido, teclado, virtual keyboard, dados preservados após erro. |
| Card/painel | Cabeçalho, corpo e ações com espaçamento comum; variantes de conteúdo independentes de altura fixa. | Texto longo, tradução, imagem ausente, preview Em breve e foco. |
| Carrossel | Lista semântica, indicação de posição, setas/dots com alvos adequados; scroll nativo por toque. | Todos os itens, teclado Home/End/setas, drag, último item, resize e reduced-motion. |
| Placar | Grade compacta com valores legíveis e labels menores; itens prioritários na primeira linha. | Número grande, vidas/tempo/score, erro/pausa, wrapping e atualização anunciada com parcimônia. |
| Área de jogo | Slot com proporção e orçamento de espaço próprios; Canvas/SVG com dimensão lógica separada do bitmap. | Pointer/touch, DPR, rotação, zoom e números/peças legíveis. |
| Painel de instruções | Resumo curto e details para conteúdo secundário; instruções essenciais disponíveis no início. | Expansão por teclado, foco, volta à atividade e alturas pequenas. |
| Dialog | Título/descrição, foco inicial, Escape/cancelar, retorno ao acionador e background inerte. | Promoção, reinício, confirmação de restauração, teclado e viewport reduzida. |
| Feedback/progresso | Mensagem junto da tarefa, ícone/texto além da cor; progress com label/value. | Erro, acerto, carregamento, indisponibilidade de storage/API; sem anúncio contínuo do cronômetro. |
| Retorno/rodapé | Ação consistente de voltar ao catálogo/trilha; rodapé opcional fora da área de gestos. | Nunca esconder saída, nunca duplicar bloco de marca decorativo durante jogo. |

## Organização proposta de implementação

Após aprovação, considerar `css/tokens.css` e `css/components.css` (arquivos ainda inexistentes), ou consolidação equivalente dos --site-* e componentes atuais. Ordem explícita: tokens/base → componentes → módulo → adaptações locais documentadas. Antes de mover regras, comparar especificidade e consumidores. Modelos JS de foco/medição devem ser pequenos, com APIs que preservem os handlers dos jogos; não reescrever renderização/estado por causa de estilo.

Breakpoints devem responder ao conteúdo e à altura útil, com famílias propostas: compacto até ~599, intermediário 600–999, amplo a partir de ~1000, mais orientação/altura curta. Esses intervalos são critérios de layout a prototipar, não substituição cega de 430/767/1000/1200 atuais. A matriz inclui bordas para detectar saltos. Container queries podem ser avaliadas com fallback e compatibilidade definida, não assumida.

## Critérios de aceitação da biblioteca

Identidade preservada; campos/controles utilizáveis com teclado/toque; nenhum novo erro/overlay; todos os jogos iniciam e recebem interação; primeiro/último item do carrossel alcançáveis; nenhuma perda de progresso ou mudança de mecânica; textos/frações/números legíveis; dialogs restauram foco; barras/safe areas e redução de altura não escondem ações; resultados antes/depois comparados nas mesmas condições. Sem porcentagem obrigatória universal para área de jogo.
