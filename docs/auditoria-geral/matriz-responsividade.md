# Matriz de responsividade e compatibilidade

Data de consolidação: **15/10/2026**. Coleta iniciada em 13/10/2026; nomes de diretórios conservam a data inicial. Revisão: `b0a2ef0c01458b1e17fe4b34acdf29ef1acecd73`. Branch ativa no início: `main`; alterações locais preexistentes não são tratadas como aprovação.

Metodologia: inspeção de fonte/Git, hashes SHA-256, Docker e PostgreSQL somente leitura, perfis de navegador isolados, entrada física via CDP/WebDriver e testes em cópias temporárias. **Nenhuma correção, commit, push, publicação ou reinício de container existente nesta etapa.** A auditoria anterior foi preservada. Evidências: [diretório privado](../../private/general-audit-20261013/).

## Escopo e evidências

760 combinações efetivamente medidas: 31 estados públicos × 19 perfis e nove estados prioritários em DEV × 19. Evidências privadas: visual-matrix.json/CSV, visual-summary.json e screenshots. Nenhum overflow horizontal global nesses cenários; isso não certifica todos os estados possíveis.

Perfis verticais: 320×568, 360×640, 375×667, 390×844, 393×852, 412×915, 430×932, 768×1024, 820×1180, 1024×768, 1366×900. Complementos horizontais: 568×320, 640×360, 667×375, 844×390, 852×393, 915×412, 932×430 e 1180×820.

## Resultado funcional de geometria

Queda publicada: pausa encoberta em 640×360; pausa/reinício encobertos em 667×375. DEV com correção prévia não apresentou esses bloqueios. Hit testing e interação real por CDP foram usados; presença de botão não conta como aprovação. Outros controles requerem rolagem normal em telas pequenas, detalhada em padrao-layout-jogos.md. Testes não devem confundir rolagem de centralização do driver com rolagem mínima necessária.

Chrome desktop com emulação móvel/toque reproduzido; nenhum iPhone ou Android físico validado. Firefox headless: 21 cenários, 20 aprovados e um bloqueio confirmado da Queda em 640×360. O Firefox impôs largura mínima: solicitações de 375 foram medidas em 500 px; não constituem validação Firefox a 375 px. Safari/WebKit indisponível. Barras dinâmicas reais, teclado virtual do sistema, safe areas físicas e leitor de tela humano continuam pendentes. Houve teste limitado de viewport reduzida e pinch/zoom, que não substitui esses dispositivos.
