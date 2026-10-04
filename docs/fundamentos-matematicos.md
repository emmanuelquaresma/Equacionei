# Fundamentos Matemáticos

A página `/static/fundamentos-matematicos.html?assunto=fracoes` serve quatro assuntos de prática matemática e 12 exercícios no total. No baseline de 2026-10-01, quatro assuntos da lista planejada ainda não existem: Números Inteiros, Razão e Proporção, Equação do 1º Grau e Equação do 2º Grau. O carrossel existente em `app/frontend/pages/menu.html` mantém as duas páginas independentes de funções e seus links. Os quatro cards matemáticos usam as mesmas classes e o mesmo controlador de carrossel. O atributo opcional `data-fit-active` ajusta a altura ao card ativo em `menu-carousel.js` e `carousel.css`.

## Catálogo e extensão

`app/frontend/data/math-subjects.js` contém assuntos com `id`, `title`, `description`, `icon` e `exercises`. Cada exercício tem ID estável, título, pergunta, resposta para a resolução, dica, lista de passos, nível e ano escolar de referência. Os anos expressam dificuldade sugerida; não constituem uma declaração de alinhamento curricular. A sequência inclui desafios preparatórios de álgebra.

Para adicionar um exercício, acrescente um objeto a `exercises` do assunto:

```js
{
    id: 'id-unico', title: 'Título da atividade', question: 'Pergunta',
    answer: 'Resultado explicado', hint: 'Uma pista',
    steps: ['Primeiro passo.', 'Segundo passo.'], level: 'Inicial', schoolYear: 6,
    accepted: ['resposta aceita'], format: 'Instrução sobre como responder.'
}
```

Para alternativas, substitua `accepted` e `format` por `choices: ['A', 'B', 'C']` e `correct: 1` (índice iniciado em zero). A página não executa texto digitado nem tenta interpretar álgebra arbitrária. Respostas escritas aceitam espaços, diferenças de caixa e sinal de menos tipográfico; demais variações precisam ser declaradas em `accepted`. As frações desta etapa pedem forma simplificada. Para novas formas de entrada, amplie o validador e seus testes deliberadamente.

Para adicionar um assunto, acrescente seus dados ao catálogo e um link no carrossel, seguindo o mesmo `subject-card`, com destino `?assunto=novo-id`. O controlador calcula quantidades e a continuação automaticamente. Não é necessário criar outra página, CSS ou controlador. Mantenha título, descrição e ícone do card coerentes com o catálogo.

`js/math-practice.js` renderiza e verifica os dados. `css/math-practice.css` limita os estilos à nova prática. O cabeçalho e o menu usam `site.css` e `site-ui.js`. Dicas e resoluções são expansíveis; respostas são preservadas ao voltar a um exercício durante a visita. Avançar e abrir resolução não contam como acerto. O resumo conta apenas respostas verificadas corretas. Recarregar reinicia a visita; não há persistência nova nem alteração no progresso anterior.

## Verificação

Execute `python3 tests/browser/math_practice.py` com Chrome/Chromium instalado. A suíte usa servidor e perfil temporários, percorre os 12 exercícios e verifica erros, acertos, dicas, resolução, navegação, teclado, menu e dimensões mobile/desktop. Capturas ficam em `/tmp/math-practice-*.png`.

Fase 0: a página de Função do 1º Grau agora possui o script que o HTML esperava. As duas páginas de funções usam cópia local fixa do Chart.js 4.4.7 em `app/frontend/vendor/`; não dependem mais do CDN para carregar gráficos.

O teste browser percorre os 12 exercícios e verifica respostas, dicas, resoluções, navegação, teclado e overflow. Ele não representa a implementação dos quatro assuntos planejados acima; as dimensões e resultados efetivamente validados devem ser registrados por execução, não presumidos a partir deste texto.
