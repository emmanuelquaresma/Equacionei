# Divergências confirmadas no baseline arquitetural

Baseline inspecionado: `a1733bed69d5ea3255792f5f8f9f49816b90e9cf`.
Este registro descreve o código antes das correções da Fase 0; o código
executável continua sendo a fonte de verdade.

| Tema | Especificação/descrição | Código no baseline | Decisão para a Fase 0 |
|---|---|---|---|
| Salas da Dama | Limite e expiração automática | `RoomService` mantinha salas sem limite nem rotina de limpeza | Adicionar limite configurável e limpeza periódica/por operação, sem mudar regras de jogo. |
| Origem WebSocket | Allowlist | O socket aceitava qualquer Origin | Validar `Origin` antes do handshake usando `ALLOWED_ORIGINS`; em configuração local, aceitar apenas origens locais explicitamente listadas. |
| Rate limit | Limite por IP para criação de sala e treino | Não existia limitação | Implementar janelas em memória por IP, documentando o limite por processo e a dependência de configurar IP real atrás de proxy confiável. |
| Função do 1º Grau | Página funcional | HTML chamava `calcularFuncao()`, mas `js/primeiro-grau.js` não existia | Criar somente o script esperado e teste. |
| Teste de layout matemático | Critério de responsividade confiável | O teste verificava altura máxima fixa do trilho em viewports de desktop também | Preservar validação de visibilidade; medir overflow e critério de altura apenas em viewports móveis pertinentes. |
| Chart.js | Não deveria depender da rede externa | Ambas páginas de funções carregavam `https://cdn.jsdelivr.net/npm/chart.js` | Fixar cópia local versionada, mantendo a API usada pelas páginas. |
| Nome OpenAPI | Equacionei | `FastAPI(title="Matemática pra Todos")` | Atualizar apenas o título da aplicação. |
| Contagem de assuntos | Quatro conteúdos ainda faltantes | O catálogo atual tinha quatro assuntos; faltavam quatro para a lista de oito | Registrar a contagem correta: 4 existentes, 4 faltantes. |
| IA da Dama | Metadado `rolloutCutoff=200` | O agente médio no browser limita cada rollout a 60 turnos | Documentar a divergência; não alterar comportamento nesta fase. |
| Banco | Estrutura de diretórios `database/` poderia sugerir DB presente | Diretórios continham apenas `.gitkeep`; sem DB/ORM/migrations | Não tratar diretórios vazios como infraestrutura existente. |

## Notas de escopo

Este documento registra divergências do baseline e não representa implementação
de PostgreSQL, autenticação, sincronização ou persistência durável. Os controles
em memória adicionados na Fase 0 não substituem limites compartilhados entre
processos nem armazenamento durável.
