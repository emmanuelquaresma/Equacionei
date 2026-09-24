# Trilha Data Science — ∑quacionei

## Etapa B: Fundamentos

Página: `/static/data-science/fundamentos.html`. O módulo contém dez tópicos de estatística e oito de Python básico. Sugestão: leia o conceito, compare com SQL, execute o exemplo e resolva o exercício. Se a sintaxe for nova, visite primeiro os tópicos de Python básico.

- `modulo1_fundamentos/01_introducao.ipynb`: notebook com os mesmos exemplos das aulas, exercícios e espaços para anotações.
- `../app/frontend/data/data-science/fundamentos.js`: catálogo das aulas e contrato dos exercícios do laboratório.
- `../app/frontend/js/data-science-fundamentos.js`: navegação das aulas.

### Executar o notebook

A partir da raiz do projeto, em uma máquina de estudo:

```sh
python3 -m venv data-science/.venv
data-science/.venv/bin/python -m pip install -r data-science/requirements.txt
data-science/.venv/bin/jupyter notebook data-science/modulo1_fundamentos/01_introducao.ipynb
```

No Windows, os executáveis ficam em `.venv/Scripts`. O Jupyter é instalado somente neste ambiente virtual. A instalação inicial precisa de internet. Este requirements segue o mecanismo simples do projeto; não é um lockfile e não garante versões idênticas entre instalações. Não foi instalado Jupyter globalmente nem modificado Docker. Não exponha o servidor de notebooks como executor público de alunos.

Os exemplos usam dados pequenos e fictícios, sem pandas ou downloads de datasets. As células de exercícios são rascunhos para completar, não soluções prontas. Os exemplos foram conferidos com Python 3; os notebooks podem ser executados em ordem sem bibliotecas científicas. A interface Jupyter não faz parte do site público.

### Laboratório compartilhado

`/static/python.html?trail=fundamentos&exercise=ds-fund-media` seleciona um exercício conhecido do catálogo, sem aceitar código pela URL. O mesmo editor e runtime MicroPython local executam os exercícios. Os cinco exercícios de Desenvolvimento continuam disponíveis pela URL Python normal.

Os IDs `ds-fund-*` mantêm rascunhos e estatísticas separados dos exercícios antigos dentro da chave existente `matematica.python.progress.v1`. Há um último exercício compartilhado; abrir um link explícito seleciona o tópico solicitado sem apagar outros rascunhos. Aulas não são marcadas como concluídas simplesmente por serem abertas. O progresso de exercícios aparece no laboratório.

A validação confere saída, não demonstra que o aluno usou a técnica pedida nem avalia explicações conceituais. Compare suas soluções e anotações com o enunciado. A dica aberta na aula é leitura; o contador de dicas permanece relativo ao botão de dica do laboratório.

### Continuidade

Etapas C–H permanecem em preparação. Datasets reais, pandas, scikit-learn e o ambiente científico serão tratados nessas etapas. MicroPython não deve ser apresentado como compatível com essas bibliotecas. Preserve no conteúdo futuro as diferenças entre SQL e Python (NULL/None, ordenação e divisões), as convenções estatísticas e a separação entre associação e causalidade.
