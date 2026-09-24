/* Catálogo inicial de dados próprios. Carregado apenas nas aulas que o usam. */
const LearningDatasets = [{
    id: 'eq-vendas-semana-v1',
    name: 'Uma semana de vendas de uma loja fictícia',
    description: 'Sete valores sintéticos para comparar média e mediana. Não representa uma empresa real.',
    origin: 'educacional-proprio',
    officialSource: null,
    source: 'Dados sintéticos criados para esta aula do ∑quacionei.',
    license: null,
    licenseNote: 'Sem licença de redistribuição declarada nesta etapa. Não há fonte externa.',
    version: '1',
    accessDate: null,
    rowCount: 7,
    columnCount: 2,
    variables: [
        {id: 'dia', name: 'Dia', type: 'ordinal', unit: null},
        {id: 'vendas', name: 'Vendas (R$)', type: 'quantitativa', unit: 'BRL'}
    ],
    level: 'Iniciante',
    relatedModules: ['fundamentos', 'manipulacao-visualizacao'],
    rows: [[1, 80], [2, 90], [3, 95], [4, 100], [5, 105], [6, 110], [7, 900]]
}];
