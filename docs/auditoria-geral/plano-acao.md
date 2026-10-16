# Plano de ação para revisão e aprovação

Data de consolidação: **15/10/2026**. Coleta iniciada em 13/10/2026; nomes de diretórios conservam a data inicial. Revisão: `b0a2ef0c01458b1e17fe4b34acdf29ef1acecd73`. Branch ativa no início: `main`; alterações locais preexistentes não são tratadas como aprovação.

Metodologia: inspeção de fonte/Git, hashes SHA-256, Docker e PostgreSQL somente leitura, perfis de navegador isolados, entrada física via CDP/WebDriver e testes em cópias temporárias. **Nenhuma correção, commit, push, publicação ou reinício de container existente nesta etapa.** A auditoria anterior foi preservada. Evidências: [diretório privado](../../private/general-audit-20261013/).

## Sequência proposta — não executada

Cada fase exige revisão do resultado concreto e autorização de implementação/publicação. Não iniciar funcionalidades novas antes de estabilizar os fluxos e definir persistência/deploy. Ajustes existentes no workspace continuam candidatos, não aprovados automaticamente.

| Fase | Ordem e escopo | Dependências | Critério objetivo de aprovação | Risco/complexidade |
|---|---|---|---|---|
| A — Estabilização | A003 Python; A004/A010 2º grau; revisar A001/A002; decidir baseline de DEV A005; triagem S001 com infraestrutura. | Casos reproduzíveis, preservação de rascunhos, revisão dos patches locais e responsável operacional. | Python recupera formato inválido sem apagar dados válidos; cálculo finito/limitado; Dama inicia em cada origem aprovada; Queda pausa/reinicia por toque em horizontal; nenhum arquivo de release inesperado. | M; alto para build/base/infra; alterações mínimas isoladas. |
| B — Confiabilidade | CI/artefatos/locks A006/A009; quotas/estado A007/A008; verificar proxy S004; backups A011; CLI A012. | Fase A; requisitos de retenção/usuário; política de acesso e dados. | CI bloqueia regressão; artefato identificável e repetível; cenários de quota/TTL/release e proxy testados; procedimento de restauração isolado comprovado. | M a G; persistência e infraestrutura não entram no mesmo patch de UI. |
| C — Compatibilidade e acessibilidade | AC001/AC002, V001/V002, tokens/contratos visuais e planejamento de headers S002. | Fluxos estáveis e design system aprovado; baseline de screenshots. | Controles alcançáveis e hit testing aprovado; Dama preserva foco; mapa tem estratégia semântica; matrizes de viewport e rotação; leitor de tela e dispositivos reais por pessoa; CSP sem quebrar Python. | M/G; alto risco de CSS comum e Canvas; migrar gradualmente. |
| D — Qualidade técnica | V003/V004/V005/V006; documentação/scaffolds A013; assets A014 conforme aprovação; render-block A015; contratos/paridade A016. | Tokens/ordem de cascata e testes de referência definidos. | Sem alteração de regras/storage/URLs/IDs sem contrato; componentes consistentes; verificação visual e funcional em todos os módulos; testes alinhados ao escopo real. | M; P para documentação; manter etapas pequenas. |
| E — Evolução | Prévias de DS, novos labs, contas/sync/PWA ou novos jogos somente com escopo aprovado. | P1 resolvidos e critérios de B/C atingidos; capacidade/segurança/persistência definidas. | Critérios pedagógicos/funcionais próprios, API e dados especificados, testes e rollback; nenhuma prévia contada como funcional só por existir um card. | Dependente de projeto; não estimado em horas. |

## Gates comuns por mudança

1. Reproduzir com evidência o problema alvo; separar bug de limitação/intenção do produto.
2. Propor correção mínima, arquivos afetados, risco e testes. Reusar artefatos desta auditoria como baseline, sem transformar screenshots em único teste.
3. Implementar apenas após autorização, em revisão/branch de trabalho apropriada. Preservar os arquivos locais e históricos; separar branding e infraestrutura.
4. Verificar fonte/artefato/HTTP e testar fluxos completos. Matriz mínima: 320/360/375/390/393/412/430, 640×360, 667×375, 768/820, 1024/1366; entrada real, rotação, erro, retorno, storage e teclado.
5. Publicar TESTE/PROD apenas com autorização específica e mesmo artefato homologado. Documentar rollback e efeito sobre sessões efêmeras; não reiniciar DB/serviços não relacionados.
6. Atualizar matriz e diagnóstico com resultados observados, incluindo reprovações/pendências. Aprovação exige ausência de novos P1 e cobertura do cenário original, não apenas “página abre”.

## Estratégia de padronização visual

Executar como trilha subordinada à Fase C/D, sem misturar mecânicas ou evolução pedagógica. Revisar [auditoria visual](auditoria-visual.md), [tokens/componentes](design-system-proposto.md), [padrão dos jogos](padrao-layout-jogos.md) e [plano visual](plano-padronizacao-visual.md). Escolher primeiro um caso piloto de baixo acoplamento; componentes de alto impacto (header/carrossel) só depois do contrato e da matriz de regressão.

Não é necessária limpeza de arquivos, mudança de stack ou reescrita geral para iniciar estabilização. Nenhuma ação operacional deste plano foi executada nesta etapa.
