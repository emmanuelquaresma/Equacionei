# Relatório executivo da auditoria

Data de consolidação: **15/10/2026**. Coleta iniciada em 13/10/2026; nomes de diretórios conservam a data inicial. Revisão: `b0a2ef0c01458b1e17fe4b34acdf29ef1acecd73`. Branch ativa no início: `main`; alterações locais preexistentes não são tratadas como aprovação.

Metodologia: inspeção de fonte/Git, hashes SHA-256, Docker e PostgreSQL somente leitura, perfis de navegador isolados, entrada física via CDP/WebDriver e testes em cópias temporárias. **Nenhuma correção, commit, push, publicação ou reinício de container existente nesta etapa.** A auditoria anterior foi preservada. Evidências: [diretório privado](../../private/general-audit-20261013/).

## Resultado observado antes da consolidação

35 unidades lógicas inventariadas: {'Funcional e validado': 18, 'Funcional com ressalvas': 12, 'Parcialmente implementado': 5}. Classificações dizem respeito aos cenários registrados, não certificação integral de todas as combinações. Problemas: {'P1': 6, 'P2': 15, 'P3': 7}; nenhum P0 confirmado. Inventário inclui módulos de plataforma e infraestrutura, além das telas.

Prioridades: origens WebSocket bloqueiam Dama pelas portas 8001/8002; controles de Queda publicados ficam encobertos em duas telas horizontais; registro nulo em progresso impede inicialização do Python; intervalo numérico extremo pode bloquear o cálculo quadrático. DEV tem imagem anterior do Xadrez e duas correções na camada gravável. PostgreSQL publicado em todas as interfaces exige revisão de alcance/proteção; não foi comprovada exposição externa nem exploração.

TESTE e PRODUÇÃO correspondem ao Git b0a2ef0 no conjunto de 125 arquivos de aplicação/dependências comparados. As correções locais não estavam nessas imagens. Portas dos aplicativos são loopback; domínio público responde via Cloudflare. Não confundir acessibilidade local das portas com exposição externa. PostgreSQL foi somente inspecionado, sem alterações.

Testes: 760 combinações visuais; 30 fluxos completos registrados; 21 cenários Firefox; seis suítes principais aprovadas; testes adicionais de Queda/Racha e backend; teste de branding incompleto reprovado e regressão de origem reproduzida no código publicado. Contagens de métodos, assertivas e cenários são separadas em matriz-testes.md. Falhas exploratórias do próprio harness foram preservadas e corrigidas antes da medição final.

Não houve dispositivo físico, Safari/WebKit, leitor de tela humano, Lighthouse ou teste de carga. Não há certificação WCAG/Core Web Vitals. O inventário OSV encontrou sete advisories em ferramentas de build (pip/setuptools), sem demonstrar exploração pela aplicação. Há lacunas de backup comprovado, CI executável, persistência central de alunos, CLI offline e dependências fixadas.

Recomendação: estabilização antes de novas funcionalidades; corrigir bloqueios funcionais, depois persistência/integrações, compatibilidade e padronização. Ver plano-acao.md e os cinco documentos visuais. Esta auditoria retrata a coleta anterior à consolidação; mudanças posteriores e autorização de publicação pertencem ao relatório docs/releases/inventario-consolidacao-ambientes.md.
