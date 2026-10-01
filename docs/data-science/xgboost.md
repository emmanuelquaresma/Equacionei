# Laboratório XGBoost — Fase 1

Ambiente educacional de Machine Learning: **dataset → target → features → preparação → treino → avaliação → interpretação → previsão**. Entrada pela página Data Science existente, no mesmo `.ds-trail-grid` dos seis módulos anteriores. O cartão Laboratório XGBoost reutiliza `.ds-trail-card--available`, a estrutura de Fundamentos e o ícone ⚙ já utilizado em Machine Learning, sem CSS ou biblioteca de ícones adicional. Mantém uma coluna em celular, duas a partir de 600px e três a partir de 1000px. O módulo Machine Learning também contém um link para o laboratório. URL: `/static/data-science/machine-learning/xgboost.html`.

## Arquitetura e arquivos

Mantém HTML/CSS/JavaScript sem framework e FastAPI/Python 3.11. Sem banco, fila, autenticação adicional ou serviço de ML externo.

Novos arquivos:

- `app/frontend/data-science/machine-learning/xgboost.html`: etapas e conteúdo educacional.
- `app/frontend/css/ml-lab.css`: estilos locais, formulários responsivos, scroll interno de tabelas.
- `app/frontend/js/ml-lab.js`: cliente da API, estados, gráficos SVG/HTML e formulário de previsão.
- `app/backend/src/config/ml.py`: configuração central, variáveis de ambiente.
- `app/backend/src/schemas/ml.py`: contratos Pydantic de treino, previsão e liberação.
- `app/backend/src/routes/ml.py`: limites dos corpos HTTP, mensagens de erro, delegação ao threadpool.
- `app/backend/src/services/ml/__init__.py`: pacote dos serviços.
- `app/backend/src/services/ml/datasets.py`: CSV e demonstrações, validação, amostra e sugestões.
- `app/backend/src/services/ml/preprocessing.py`: imputação, one-hot, campos de previsão e agregação de importância.
- `app/backend/src/services/ml/algorithms.py`: fábrica de modelos; registro extensível `ALGORITHMS`.
- `app/backend/src/services/ml/metrics.py`: métricas e dados dos gráficos.
- `app/backend/src/services/ml/service.py`: orquestração do experimento e previsão.
- `app/backend/src/services/ml/store.py`: cache temporário limitado, com IDs aleatórios.
- `app/backend/src/services/ml/errors.py`: erros educacionais.
- `app/backend/tests/unit/test_ml_api.py`: testes ASGI e treinamento real.
- `tests/browser/xgboost_lab.py`: fluxo real no navegador com API local.

Arquivos existentes modificados:

- `app/frontend/data-science.html`: links e disponibilidade do módulo.
- `app/backend/src/main.py`: registro do router ML e fallback do caminho estático para execução pelo checkout (o caminho do Docker permanece o mesmo).
- `app/backend/requirements.txt`: dependências científicas do backend.

Jogos, estilos globais e Docker Compose não foram alterados por esta implementação.

## Dependências e execução

Novas dependências diretas: `numpy>=1.26,<3`, `pandas>=2.2,<3`, `scikit-learn>=1.5,<1.8`, `xgboost-cpu>=3.0,<3.2`. A distribuição oficial `xgboost-cpu` fornece o módulo Python `xgboost`, com tamanho menor e sem CUDA. Ambiente validado: NumPy 2.4.6, pandas 2.3.3, scikit-learn 1.7.2 e XGBoost CPU 3.1.3. Dependências transitivas são resolvidas pelo pip.

Na raiz, em ambiente virtual Python 3.11:

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r app/backend/requirements.txt
.venv/bin/python -m uvicorn main:app --app-dir app/backend/src --host 127.0.0.1 --port 8000
```

Abra `http://127.0.0.1:8000/static/data-science.html`.

O Dockerfile existente já instala o requirements e copia backend e frontend. Para desenvolvimento com Docker:

```sh
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

Não executar vários workers Uvicorn nesta fase: dados e modelos pertencem à memória de um único processo. Nenhuma implantação em produção é feita por esses testes.

## API

Todas as respostas normais têm `Cache-Control: no-store`. As operações POST aceitam JSON, exceto o upload, que usa o próprio CSV como corpo. Falhas retornam `{"detail":"mensagem em português"}`; detalhes inesperados ficam nos logs do backend.

| Método | Caminho | Operação |
|---|---|---|
| GET | `/api/ml/datasets` | Demonstrações disponíveis e limites |
| POST | `/api/ml/datasets/demo/{name}` | Carregar `iris`, `breast-cancer`, `wine` ou `diabetes` |
| POST | `/api/ml/datasets/upload?filename=exemplo.csv` | Corpo CSV em UTF-8, `Content-Type: text/csv` |
| POST | `/api/ml/xgboost/train` | Treinar, avaliar e registrar modelo temporário |
| POST | `/api/ml/xgboost/predict` | Prever com o pipeline treinado |
| POST | `/api/ml/release` | Liberar `dataset_id` e/ou `model_id` do experimento |

Carga retorna `dataset_id`, nome, linhas, quantidade de colunas, target inicial, descrição de cada coluna (tipo, nulos, valores distintos e sugestão de tarefa), amostra de até 10 linhas e validade.

Treino:

```json
{
  "dataset_id": "ID retornado pela carga",
  "target": "target",
  "features": ["idade", "renda"],
  "model_type": "classification",
  "test_size": 0.2,
  "parameters": {
    "n_estimators": 100,
    "max_depth": 6,
    "learning_rate": 0.1,
    "subsample": 1.0,
    "colsample_bytree": 1.0,
    "random_state": 42
  }
}
```

Retorno inclui `model_id`, `algorithm`, `model_type`, dataset, target, features, total de linhas, `train_rows`, `test_rows`, parâmetros, métricas, gráfico de avaliação, `feature_importance`, preparação, campos de previsão e validade. Não retorna o pipeline serializado ao cliente.

Previsão:

```json
{"model_id":"ID retornado pelo treino","values":{"idade":35,"renda":4500}}
```

Retorna `prediction`; classificação também retorna `probabilities` com pares `class`/`probability`. A classe exibida é o rótulo original. Campos vazios/null passam pela imputação já aprendida. Categoria inédita resulta em indicadores zero naquela variável; não há reaprendizado.

Erros: 422 para dados/configuração incompatíveis, 413 para corpos acima do limite, 404 para ID inexistente/expirado, 429 para treinamento ocupado, 408 para tempo de treino excedido, 503 para capacidade de cache ocupada, 500 para falha inesperada com mensagem sanitizada.

## Fluxo de dados e decisões

1. Ler e validar o dataset em memória. CSV admite vírgula, ponto e vírgula e tabulação, cabeçalho único, UTF-8 e linhas consistentes. Não executa conteúdo. O nome enviado é usado somente para verificar a extensão; nunca vira caminho de arquivo. Não cria arquivo temporário de upload.
2. Sugerir classificação para textos ou até 10 valores inteiros distintos; demais numéricos sugerem regressão. A escolha continua editável. Isso é uma heurística, não uma decisão definitiva.
3. Exigir target existente, não nulo e separado das features; impedir duplicatas e configurações fora dos limites. Regressão exige números. Classificação exige 2–20 classes, com exemplos suficientes para estratificar.
4. Separar treino/teste com semente fixa; estratificar classificação. O vocabulário dos rótulos não é uma feature.
5. Ajustar `ColumnTransformer` + `Pipeline` somente no treino: mediana para números, categoria `__ausente__` para textos nulos, `OneHotEncoder(handle_unknown='ignore')`. Colunas numéricas totalmente ausentes no treino são mantidas e preenchidas com zero.
6. Treinar XGBoost CPU com `tree_method='hist'`, `n_jobs=1`. O serviço reserva uma vaga antes de treinar e devolve 429 quando ocupado. Treino ocorre no threadpool, deixando o event loop da API disponível.
7. Calcular métricas exclusivamente no teste. Precision/Recall/F1 são médias macro, inclusive para classificação binária, dando peso igual a todas as classes do modelo (zero para uma classe ausente no teste e nas previsões). ROC-AUC binário usa a segunda classe ordenada; multiclasse usa OVR macro. Probabilidades não são calibradas. R² é `null` se o target de teste for constante. Não se usa o teste como `eval_set` para escolher a parada do modelo.
8. Importância: soma de `total_gain` das colunas codificadas, agrupada na feature original e normalizada. Features não usadas têm zero; um modelo sem divisões pode ter todos os valores zero. Não equivale a causalidade.
9. Gerar campos de previsão com exemplos e categorias provenientes do treino. Prever com a mesma instância do pipeline, sem novo fit.

O gráfico de regressão mostra até 250 pares reais/previstos com amostragem determinística. As métricas continuam usando todo o teste. Matriz de confusão em tabela com intensidade e valores, barras de importância em HTML, dispersão em SVG; nenhuma biblioteca de gráficos adicional.

O frontend bloqueia operações simultâneas, preserva mensagens de erro, libera o modelo anterior ao invalidar configurações e libera datasets antigos depois de carregar um novo. A ação “Limpar experimento” libera os IDs atuais. Não salva CSV ou modelo em localStorage. Recarregar a página perde os IDs e exige recarregar/treinar.

## Limites

Definidos em `config/ml.py`; campos configuráveis leem variáveis `ML_*` no início do processo. Para Docker, podem ser fornecidas pelo mecanismo de ambiente do Compose; esta fase não altera arquivos de produção.

| Variável | Padrão |
|---|---:|
| `ML_MAX_UPLOAD_MB` | 2 |
| `ML_MAX_ROWS` | 5000 |
| `ML_MAX_COLUMNS` | 40 |
| `ML_MAX_CATEGORIES` | 32 por feature categórica no treino |
| `ML_MAX_CLASSES` | 20 |
| `ML_MAX_ESTIMATORS` | 200 |
| `ML_MAX_DEPTH` | 8 |
| `ML_MAX_ENTRIES` | 12 datasets e 12 modelos por processo |
| `ML_TTL_SECONDS` | 1800 |
| `ML_TRAIN_SECONDS` | 30 |
| `ML_CONCURRENT_TRAINING` | 1 |

Constantes adicionais centralizadas: 10 linhas mínimas, 10 linhas de amostra, 250 pontos no gráfico, 200 caracteres por célula de texto, 80 por nome de coluna, 32 KiB por corpo JSON. Treino entre 60% e 90%, teste entre 10% e 40%; learning_rate 0,01–1; frações 0,1–1; semente inteira não negativa até 2³¹−1.

IDs têm 256 bits aleatórios e funcionam como capacidades temporárias: quem tiver o ID pode operar sobre aquele dataset/modelo. Não há listagem dos IDs nem autenticação nesta fase. Expiração é absoluta desde a criação e a remoção física ocorre na próxima operação do respectivo cache. Entradas não são removidas para abrir espaço a terceiros; com capacidade cheia, retorna 503. Reiniciar o processo elimina tudo. O prazo de treino é cooperativo, verificado a cada árvore, e não representa cancelamento rígido de uma operação nativa em execução.

## Testes

```sh
PYTHONPATH=app/backend/src .venv/bin/python -m unittest discover -s app/backend/tests/unit -p 'test_ml_api.py' -v
PYTHONPATH=app/backend/src .venv/bin/python -m unittest discover -s app/backend/tests/unit -v
.venv/bin/python tests/browser/xgboost_lab.py
```

Browser requer Chrome/Chromium. O teste inicia Uvicorn temporário na interface local, usa perfil isolado e encerra os processos. Não usa endpoints de produção. Prints em `/tmp/xgboost-*.png`, log em `/tmp/equacionei-xgboost-test.log`.

Cobertura: quatro datasets, treino/predição de classificação e regressão, CSV/nulos/categorias, categoria exclusiva do teste, mediana ajustada apenas no treino, parâmetros inválidos, target inválido/nulo/dentro das features, vazio, limites, sem modelo, expiração, ocupação, limite de tempo, repetibilidade. Browser confere os seis módulos anteriores, links das três experiências, disponibilidade de Fundamentos, estilos compartilhados e colunas do grid; cobre acesso por clique real no card, amostra, targets, resultados, previsão, upload real, invalidação, erros, limpeza e larguras 320/360/375/390/393/412/430/768/1024/1366. Também executa a verificação existente das experiências Data Science.

## Limitações e evolução

- CSV UTF-8 apenas; não faz limpeza avançada de datas, texto livre, separadores decimais locais, IDs ou dados sensíveis.
- Inferência de tipo pode tratar uma coluna numérica com texto como categórica: a tabela de tipos permite conferir antes do treino.
- Demonstração Diabetes é usada para ensinar regressão; este laboratório não é uma ferramenta clínica.
- Divisão aleatória não é adequada a séries temporais ou grupos dependentes; não há validação cruzada nesta fase.
- Uma instância/processo; cache volátil, limites globais sem cotas por usuário. Uma página abandonada consome sua vaga até expirar. Não há persistência de modelos ou comparação de experimentos.
- Validação responsiva por Chrome emulado; Safari/iPhone físico não foi validado.

**Fase 2 (não implementada):** exploração (histogramas, correlação, distribuição, outliers, ausentes), comparação Decision Tree/Random Forest/XGBoost, SHAP, Grid Search, Random Search, Optuna e histórico persistente de experimentos. O registro `ALGORITHMS` e os contratos separados evitam repetir o fluxo inteiro para novos modelos.

**Fase 3 (não implementada):** substituir a chamada de treinamento por um contrato de job, com API → fila → workers Linux separados. Cache, armazenamento de artefatos, limites, isolamento e consulta do estado do job precisariam de implementação própria. Não adicionamos Redis, fila ou workers agora.

## Referências técnicas

- [Instalação CPU do XGBoost](https://xgboost.readthedocs.io/en/release_3.0.0/install.html)
- [API Python XGBoost](https://xgboost.readthedocs.io/en/release_3.1.0/python/python_api.html)
- [ColumnTransformer para tipos mistos](https://scikit-learn.org/stable/auto_examples/compose/plot_column_transformer_mixed_types.html)
- [OneHotEncoder e categorias desconhecidas](https://scikit-learn.org/stable/modules/generated/sklearn.preprocessing.OneHotEncoder.html)

## Resultado da validação desta entrega

- Suíte de backend: 26 testes aprovados, sendo 10 do laboratório e 16 existentes.
- Browser com API real: classificação, regressão, CSV, previsão, erros e limpeza aprovados; sem overflow nas dez larguras listadas.
- `pip check`: nenhuma dependência incompatível.
- Construção Docker: tentativa impedida por falta de permissão no socket `/var/run/docker.sock`, inclusive fora do sandbox. A imagem não foi construída nem executada nesta validação; não houve alteração em produção.
