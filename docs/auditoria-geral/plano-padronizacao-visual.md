# Plano de padronização visual

Data de consolidação: **15/10/2026**. Coleta iniciada em 13/10/2026; nomes de diretórios conservam a data inicial. Revisão: `b0a2ef0c01458b1e17fe4b34acdf29ef1acecd73`. Branch ativa no início: `main`; alterações locais preexistentes não são tratadas como aprovação.

Metodologia: inspeção de fonte/Git, hashes SHA-256, Docker e PostgreSQL somente leitura, perfis de navegador isolados, entrada física via CDP/WebDriver e testes em cópias temporárias. **Nenhuma correção, commit, push, publicação ou reinício de container existente nesta etapa.** A auditoria anterior foi preservada. Evidências: [diretório privado](../../private/general-audit-20261013/).

## Ordem proposta, sem implementação

| Prioridade | Problema e solução proposta | Arquivos envolvidos | Impacto / risco | Validação |
|---|---|---|---|---|
| A | Controles da Queda encobertos: preservar altura intrínseca do painel | css/game-layout.css | Desbloqueia pausa/reinício; risco médio de rolagem | Regressão 640×360/667×375, 16 perfis, rotação e toque |
| B | Labirinto pequeno no desktop: experimentar painel lateral e medição por área disponível | css/labirinto-matematico.css; js/labirinto-ui.js e função resizeGameBoard | Aumenta mapa; risco alto de coordenadas e orientação | Canvas/DPR, teclado, swipe, 320–1366 e fases |
| B | Controles distantes: recolher informação secundária e aproximar ações | HTML/CSS de Xadrez, Dama, Pares, Racha | Menos rolagem; risco médio de ordem de foco | Tab, hit testing, vitória, ajuda, modais |
| C | Cores/espaçamentos repetidos: extrair tokens preservando valores da marca | css/site.css; css/game-layout.css; estilos específicos | Consistência; risco alto de cascata compartilhada | Comparação visual antes/depois em todos os módulos |
| C | Carrossel de Aplicações ocupa tela com pouco conteúdo: avaliar densidade, cartões e próximos itens | css/carousel.css; css/menu.css; js/menu-carousel.js | Melhor orientação; risco médio de navegação | Toque, setas, teclado, foco, quantidade por viewport |
| D | Cabeçalhos, feedback, formulários e rodapés divergentes: contratos comuns graduais | HTMLs; site-ui.js; CSS compartilhado | Manutenção; risco médio/alto | Rotas, contraste, reduced-motion, zoom e acessibilidade |

Aprovar primeiro protótipos medidos no SE 375×667, Android compacto 320/360, Android grande 393–430, tablets 768/820 e desktop 1024/1366. Não impor uma porcentagem universal de arena. Preservar proporção, mecânicas, marca, alvos de toque e conteúdo. Só migrar o próximo módulo após regressão do anterior. Design system proposto não é autorização de código ou publicação.
