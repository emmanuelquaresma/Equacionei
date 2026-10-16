# Segurança e análise de risco

Data de consolidação: **15/10/2026**. Coleta iniciada em 13/10/2026; nomes de diretórios conservam a data inicial. Revisão: `b0a2ef0c01458b1e17fe4b34acdf29ef1acecd73`. Branch ativa no início: `main`; alterações locais preexistentes não são tratadas como aprovação.

Metodologia: inspeção de fonte/Git, hashes SHA-256, Docker e PostgreSQL somente leitura, perfis de navegador isolados, entrada física via CDP/WebDriver e testes em cópias temporárias. **Nenhuma correção, commit, push, publicação ou reinício de container existente nesta etapa.** A auditoria anterior foi preservada. Evidências: [diretório privado](../../private/general-audit-20261013/).

## Escopo e resultados

A auditoria foi passiva/funcional com entradas sintéticas. Não foram tentados bypass de autenticação, exploração de uploads, brute force, varredura de rede ou carga. Nenhum valor de senha, token de sessão, chave privada ou credencial foi incluído nestes documentos. JSON/logs extensos estão em diretório privado e devem ser revisados antes de compartilhamento externo.

## Credenciais e exposição

Varredura por padrões no código versionado encontrou apenas atribuições de tokens fictícios em testes, não credenciais reais confirmadas. A inspeção do histórico alcançou 19 commits e 275 blobs textuais; os três matches de padrões eram tokens fictícios de testes. Arquivos .env versionados eram exemplos, sem segredo real confirmado. Essa varredura não prova ausência universal de segredos em todos os blobs/históricos/artefatos. `.env.dev.local` é ignorado e tem permissão 0600; valores não foram coletados para o relatório. O ambiente PostgreSQL possui chaves de credenciais, cujos valores foram omitidos.

Portas 8000/8001/8002 estão em loopback, uma proteção relevante. PostgreSQL 5432 está em 0.0.0.0 e [::], com ssl=off e autenticação host scram-sha-256; regras locais trust foram observadas. Não foi comprovada alcançabilidade externa, pois o firewall não pôde ser auditado pelas ferramentas disponíveis. Não se conclui bypass de senha. Revisar S001 com responsável pela infraestrutura; não alterar binds/roles nesta etapa.

## WebSockets, autorização e limites

Dama autentica token bearer para HTTP protegido e primeira mensagem do WS; token não vai em URL. O servidor valida participantes, cor autoritativa, turno, captura, revisão e início pelo criador. A validação estrita de Origin existe, mas sua lista publicada bloqueia os próprios ambientes locais 8001/8002 (A001). Os testes mantêm rejeição a origens externas/vazias. Não há middleware CORS; APIs são utilizadas pela mesma origem. Não foi aplicado allow-all ou alterado Origin para contornar teste.

Criação de salas tem limite de 10/min por IP/processo; treino tem 20/600 s. A implementação remove buckets expirados. Semáforo de treino, limite de salas e TTL ajudam a conter uso. Upload/demo/predict/release não têm quotas equivalentes por aluno; stores globais e proxy/IP exigem desenho para múltiplos visitantes (A008/S004). A hipótese de IP compartilhado não foi testada com duas redes externas.

## CSV e ML

Corpo CSV é limitado em streaming a 2 MiB por padrão, 5.000 linhas/40 colunas, células de 200 caracteres e nomes de 80; extensão CSV/UTF-8/controles/duplicidades/separadores/números finitos são verificados. Nome não vira caminho de arquivo; não há pickle/modelo arbitrário carregado, execução de fórmulas ou extração de ZIP. JSON de configuração tem teto de 32.768 B, extras proibidos e números finitos/limites estritos. IDs aleatórios são capacidades; quem possui o ID pode operar o experimento, sem conta de aluno. Não é autorização por identidade pessoal.

Treino é CPU, uma tarefa por processo, XGBoost n_jobs=1, deadline cooperativo de 30 s por callback. Não é sandbox de processo para todas as etapas de parsing/preprocessamento/fit; não houve teste de exaustão contra PRODUÇÃO. O caminho de erro genérico devolve mensagem amigável, enquanto logs podem conter traceback interno; esses logs não devem ser publicados sem revisão.

## Execução Python no navegador

Não existe endpoint de execução arbitrária no servidor. Runtime é MicroPython local em Worker dentro de iframe sandbox opaco sem allow-same-origin. Parent valida event.source, limita código a 16.000 caracteres e saída a 16 KiB, encerra execução em 3 s; WASM tem teto de memória linear de 32 MiB. Preparação tem timeout separado de 30 s. Hashes dos assets locais conferem. CSP interna permite os recursos necessários ao Worker e bloqueia rede externa no caminho testado. Isso não certifica todos os cenários de escape ou segurança do navegador; os 22 ensaios existentes são evidência limitada.

Progresso local é alterável pelo usuário e validação educativa compara saída. Isso não é sistema antifraude ou autenticação. Um registro nulo no progresso bloqueia inicialização (A003); corrigir preservando dados válidos, sem reset global. Em equipamentos compartilhados, rascunhos/histórico pertencem ao perfil/origem e exigem política de privacidade do produto.

## Dependências e advisories

Foram consultadas **32 combinações pacote/versão** na [API oficial OSV](https://google.github.io/osv.dev/api/). Resultado bruto: vulnerability-advisories.json. Deduplicando aliases GHSA/PYSEC/CVE: seis avisos para pip 24.0 e um para setuptools 79.0.1. São ferramentas de instalação/build nas imagens; não foi demonstrado que uma chamada ao aplicativo alcance esses caminhos. O aviso de setuptools trata colisão Unicode em macOS e não é automaticamente aplicável ao runtime Linux.

| Pacote | Advisory | Contexto |
|---|---|---|
| pip 24.0 | [GHSA-4xh5-x5gv-qwph](https://osv.dev/vulnerability/GHSA-4xh5-x5gv-qwph) | pip's fallback tar extraction doesn't check symbolic links point to extraction directory |
| pip 24.0 | [GHSA-58qw-9mgm-455v](https://osv.dev/vulnerability/GHSA-58qw-9mgm-455v) | pip has an interpretation conflict due to handling both concatenated tar and ZIP files as ZIP files |
| pip 24.0 | [GHSA-6vgw-5pg2-w6jp](https://osv.dev/vulnerability/GHSA-6vgw-5pg2-w6jp) | pip Path Traversal vulnerability |
| pip 24.0 | [GHSA-jp4c-xjxw-mgf9](https://osv.dev/vulnerability/GHSA-jp4c-xjxw-mgf9) | pip Vulnerable to Inclusion of Functionality from Untrusted Control Sphere |
| pip 24.0 | [GHSA-qwm4-qh6w-59xr](https://osv.dev/vulnerability/GHSA-qwm4-qh6w-59xr) | pip would incorrectly handle doubly-encoded package URLs from indexes |
| pip 24.0 | [GHSA-wf93-45jw-7689](https://osv.dev/vulnerability/GHSA-wf93-45jw-7689) |  pip: Path traversal in console_scripts/gui_scripts entry point names allows installing scripts outside of target directory |
| setuptools 79.0.1 | [GHSA-h35f-9h28-mq5c](https://osv.dev/vulnerability/GHSA-h35f-9h28-mq5c) | setuptools: MANIFEST.in exclusion bypass in sdist via Unicode normalization collision (NFC/NFD) on macOS APFS/HFS+ |

Nenhuma correspondência foi retornada para as demais combinações consultadas; isso não é certificado de ausência de vulnerabilidades. Pacotes de SO, imagem base, kernel, cloudflared, PostgreSQL e runtime WASM modificado não receberam scanner CVE completo. Locks/base imutável e verificação periódica são propostas, sem atualização nesta etapa. Severidade do fornecedor não se converte automaticamente em exploração remota do site.

## Headers e container

Nas respostas HTML amostradas não foram observados CSP geral, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy e Permissions-Policy. O domínio usa HTTPS com certificado aceito normalmente pelo navegador; isso não equivale a validar toda a configuração TLS. A CSP do srcdoc Python é distinta da CSP do documento. Propor Report-Only, mapear inline handlers/scripts e as necessidades de iframe/Worker antes de bloquear fontes.

Imagens da aplicação executam sem USER específico, filesystem gravável, sem teto Docker de memória/CPU/PIDs e sem política de restart. Não são privilegiadas. Esses dados indicam hardening a planejar, sem alegar escape de container ou indisponibilidade atual. O digest de release foi preservado; atualizar pacotes ou remover ferramentas exige novo artefato homologado.

Prioridade: S001, A001/A003/A004, revisão de build e headers, políticas de capacidade/proxy e comprovação de backup. Mudanças de infraestrutura/Cloudflare/DB exigem autorização específica posterior.
