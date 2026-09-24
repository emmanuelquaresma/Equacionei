# Mapa dos materiais de estudo — ∑quacionei

Levantamento em 23/09/2026. Origem: `/home/emmanuel/Documentos/Data Science/`.
Status: curadoria e proposta de organização; estes materiais ainda não foram publicados no site.

## O que foi conferido

Inventário de 55 arquivos fora das configurações internas do Spyder: 26 PDFs, 18 planilhas Excel, 6 scripts Python, 3 CSVs, 1 ZIP e 1 imagem. Há 37 conteúdos binários distintos por SHA-256; isso não significa 37 materiais pedagógicos distintos, pois vários PDFs têm o mesmo texto e arquivos binariamente diferentes.

Foram extraídos os textos dos 26 PDFs e examinados os temas por página, as seções dos scripts, os nomes das abas, os cabeçalhos e amostras das planilhas e do CSV. O caderno de anotações teve conferência visual de uma página interna e da imagem de instruções. A contagem de linhas das planilhas representa linhas XML, descontado o cabeçalho; não é uma auditoria de qualidade de todas as observações. Scripts e macros não foram executados. Os originais foram preservados.

## Separação por assuntos

| Ordem | Assunto para o site | Conteúdo identificado no acervo | Uso proposto |
|---|---|---|---|
| 1 | Dados e estatística descritiva | Variáveis qualitativas e quantitativas; frequências; média, mediana, moda; quartis, decis e percentis; amplitude, variância, desvio padrão, erro padrão, coeficiente de variação; assimetria e curtose | Fundamentos, com aulas curtas e exercícios progressivos |
| 2 | Python desde o início | Ambiente, scripts, operações, importações, objetos, tipos, listas, dicionários, comparações, funções, condicionais e repetições | Desenvolvimento → Python; exercícios reutilizados pela trilha de Data Science |
| 3 | Preparação e manipulação de dados | NumPy, Series e DataFrames; CSV e Excel; seleção, índices, conversões, ausentes, filtros, agrupamentos, ordenação e renomeação | Módulo Manipulação de Dados, depois do Python básico |
| 4 | Visualização de dados | Barras, setores, histogramas, dispersão, linhas, mapas de calor, boxplots, pairplots; Matplotlib, Seaborn e Plotly | Módulo Visualização; cada gráfico ligado a uma pergunta |
| 5 | Probabilidade e distribuições | Uniforme discreta, Bernoulli, binomial, binomial negativa, Poisson, normal, qui-quadrado, t de Student, F e graus de liberdade | Aprofundamento de Estatística, depois da descrição dos dados |
| 6 | Inferência e relações entre variáveis | Hipóteses, testes uni/bilaterais, erros I/II, significância, p-valor, intervalos de confiança, associação qui-quadrado, Pearson, testes Z/t e comparação de variâncias | Módulo próprio; não comprimir em uma única aula inicial |
| 7 | Introdução ao Machine Learning | Noções de aprendizado de máquina, estrutura de bases, tipos de variáveis e distinção supervisionado/não supervisionado | Introdução conceitual; o acervo não constitui um curso prático completo de ML |
| 8 | Modelagem e tomada de decisão | Pesquisa operacional, alternativas, critérios, matriz de decisão, AHP, comparações par a par, normalização, consistência e AHP-Gaussiano | Trilha de aplicações; pressupõe estatística básica e matrizes |

A organização acima é uma proposta editorial. Os nomes I, II e III das pastas não representam três módulos independentes em todos os casos: há muitas cópias do mesmo conjunto.

## Fontes de trabalho e localização dos assuntos

Os caminhos abaixo são relativos à pasta de origem. As páginas são as posições no PDF, começando em 1.

### Estatística

Fonte principal: `Estatistica I/6db94909-8eb7-4315-95a3-ee294c3c587d.pdf`, 102 páginas, Fundamentos de Estatística, professor Wilson Tarantin Junior.

| Páginas | Conteúdo |
|---|---|
| 3–5 | Tipos de variáveis |
| 6–28 | Frequências, posição, dispersão e forma |
| 29–61 | Probabilidades, distribuições e graus de liberdade |
| 62–73 | Fundamentos dos testes de hipóteses |
| 75–84 | Associação entre categorias e correlação de Pearson |
| 86–99 | Testes para médias, frequências e variâncias; intervalos de confiança |

A `Planilha Suporte - Fundamentos de Estatística.xlsx` tem 17 abas temáticas. A `Lista de Exercícios - Complementares.xlsx` tem 12 abas de exercícios; várias incluem resultados e cálculos, devendo ser tratadas como apoio de correção, não como desafios inéditos sem resposta. O PDF `5dbb099f-2c58-4408-aedc-523c56fe68c9.pdf` contém os enunciados complementares em 4 páginas.

### Python, dados e gráficos

Fonte prática principal: `Introdução a programação a Python I/Introdução Programação Python/(1) Introdução Programação Python.py`, com aproximadamente 1.300 linhas.

| Linhas aproximadas | Conteúdo |
|---|---|
| 8–384 | Ambiente, operações, pacotes, objetos, tipos, Series, dicionários e DataFrames |
| 385–633 | Importação e estruturas de programação; funções, condições e repetições |
| 634–878 | Manipulação e exploração de dados com o PISA |
| 879–1300 | Gráficos e exemplos com as bases fornecidas |

Fonte conceitual: `Introdução a programação a Python I/1e4b2122-e533-4466-b8f8-65bfa529c1cd.pdf`, 25 páginas. Páginas 3–17 apresentam dados, variáveis e uma visão introdutória de ML; páginas 19–24 apresentam Python, ambiente e bibliotecas. O conteúdo prático está principalmente no script, não nesses slides.

O tutorial `7131e3f2-2e38-4522-b151-f57fee3af84d.pdf`, 7 páginas, aborda instalação de Python/Spyder via Anaconda. Antes de produzir uma aula de instalação atual, conferir as instruções nas fontes oficiais. O script de tradução de comentários é uma ferramenta auxiliar e não faz parte do núcleo da trilha.

### Modelagem e decisão

- `Modelagem Matemática e Estruturação de Problemas Complexos I/1eddc42e-f003-44b5-8796-737273ae5ae6.pdf`: 119 páginas, professor Marcos dos Santos. Introdução e matriz de decisão nas páginas 11–20; AHP e fundamentos nas páginas 21–46; aplicação, normalização e consistência nas páginas 47–89. Parte final: ferramentas, casos e referências.
- `Modelagem Matemática e Estruturação de Problemas Complexos II/681d4242-807a-47b5-a062-0acf90ebca30.pdf`: 129 páginas. Revisão de decisão/AHP nas páginas 28–46; AHP-Gaussiano e aplicação nas páginas 47–79; formulação de outro problema nas páginas 108–109. Há páginas institucionais, exemplos de aplicações e referências.
- O PDF complementar de 2 páginas em Modelagem I é uma indicação de leitura sobre Borda e AHP; não é uma apostila completa sobre Borda.

## Bases para projetos

Todas estão no diretório `Introdução a programação a Python I/Introdução Programação Python/`, também repetidas em II e III.

| Arquivo | Dimensão observada | Projeto possível |
|---|---|---|
| `(2) notas_pisa.csv` | 96 registros, 8 colunas | Comparar resultados de matemática, leitura e ciências em 2018/2022; examinar ausentes e diferenças entre grupos |
| `(2) comercio_global.xlsx` | 51.290 linhas de dados, 21 colunas | Explorar vendas, lucro, descontos, regiões e categorias |
| `(2) atlas_ambiental.xlsx` | 96 linhas de dados, 11 colunas | Explorar indicadores dos distritos de São Paulo e relações entre variáveis |
| `(2) receita_empresas.xlsx` | 30 linhas de dados, 3 colunas | Comparar séries de receita por empresa e ano |
| `(2) vendas_regiao.xlsx` | 15 linhas de dados, 4 colunas | Comparar produtos e filiais com barras e mapas de calor |

O script atribui o PISA à OECD e o comércio a uma adaptação do Global Super Store. Não foi feita verificação externa da procedência, licença, atualidade ou representatividade das bases. Não apresentar todas como dados reais verificados. Para uma primeira atividade pequena, receitas ou vendas por região são opções manejáveis; PISA permite um projeto posterior de limpeza e comparação.

## Como encaixar no site atual

1. **Fundamentos:** introduzir dados, tipos de variáveis e população/amostra antes das medidas numéricas. Usar a lista de aulas e o progresso já implementados.
2. **Python:** manter um único laboratório e referenciar os exercícios existentes quando forem pré-requisitos das aulas de dados.
3. **Manipulação e Visualização:** dividir o cartão atual em duas unidades internas, com aulas próprias e projetos.
4. **Probabilidade e Inferência:** criar unidades específicas de estatística após Fundamentos.
5. **Machine Learning:** começar com a introdução e as experiências existentes; preparar conteúdo adicional para treino/teste, modelos e avaliação.
6. **Modelagem e Decisão:** acomodar inicialmente em Tópicos Complementares; pode ganhar trilha própria conforme o conteúdo for produzido.

O laboratório atual usa MicroPython e não executa pandas, NumPy, Matplotlib, Seaborn ou Plotly Python. As aulas básicas podem rodar nele; os exercícios científicos precisam de notebooks para o ambiente local já previsto no projeto ou de uma futura solução compatível. Não anunciar esses exercícios como executáveis no editor atual.

## Proposta de Fundamentos em 18 aulas

Esta é uma proposta de sequência futura, ainda não aplicada. É uma síntese editorial dos temas, com introduções e atividades novas a escrever; não corresponde a 18 aulas prontas presentes nos PDFs.

1. O que são dados? Da observação à informação.
2. Tipos de dados: categorias, ordem, contagens e medidas.
3. População e amostra: alcance das conclusões.
4. Tabelas: linhas, colunas e perguntas de análise.
5. Primeiro contato com Python: operações e saída.
6. Variáveis e tipos em Python.
7. Listas e dicionários para representar dados.
8. Condições e repetições para analisar registros.
9. Funções para organizar uma análise.
10. Frequências e proporções.
11. Média, mediana e moda.
12. Quartis e percentis.
13. Amplitude, variância e desvio padrão.
14. Distribuição dos dados e valores extremos.
15. Escolha e leitura de gráficos.
16. Associação, correlação e limites de interpretação.
17. Dados ausentes e revisão da qualidade.
18. Projeto guiado: formular uma pergunta, analisar dados e comunicar uma conclusão.

O projeto pode usar um recorte de base com procedência confirmada, disponibilizado com contexto e dicionário de dados. A implementação precisará manter os exercícios antigos acessíveis e definir como o progresso se relaciona às novas aulas; não se deve reaproveitar o ID de um exercício antigo para um desafio diferente.

Probabilidade aprofundada, testes de hipóteses, pandas e AHP ficam nos módulos seguintes. As durações só devem ser estimadas depois da redação e execução das atividades.

## Formato de cada material

Cada aula deve ter objetivo, pré-requisitos, explicação original, exemplo contextualizado, exercício, feedback ou solução comentada, referências e indicação do ambiente necessário. Downloads e notebooks são complementos à leitura no site. O progresso deve refletir uma atividade real concluída.

## Duplicações e itens auxiliares

- As duas planilhas de Estatística são cópias binárias idênticas entre I, II e III.
- Os dois scripts e as cinco bases Python são cópias binárias idênticas entre I, II e III.
- Os slides de Estatística de 102 páginas e os exercícios de 4 páginas têm o mesmo texto extraído nas três pastas, apesar de hashes diferentes.
- Os PDFs Python repetem slides de 25 páginas, bibliografia de 2 páginas, tutorial de instalação de 7 páginas e tutorial de bibliotecas de 14 páginas. A comparação textual indica repetições; imagens e metadados não foram comparados integralmente.
- O ZIP é um pacote do material Python; não deve contar como um novo módulo.
- Caderno do aluno, instruções para anotações, tutorial de acesso a bibliotecas institucionais e configurações `.spyproject` são apoio ao curso original, não aulas do site.

## Preparação para publicação

Os slides contêm aviso explícito de reprodução restrita e marcas d'água com identificação pessoal. A proposta é escrever explicações, exemplos e exercícios próprios e registrar referências. A análise não incluiu copiar os PDFs ou bases para o diretório público do site. Para eventual distribuição dos originais ou das bases, conferir as permissões aplicáveis e a procedência de cada item.

Não é necessário transportar a marca do curso original, dados pessoais ou telas institucionais para as aulas do ∑quacionei.
