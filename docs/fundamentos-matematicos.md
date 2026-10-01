# Fundamentos Matemáticos

A página `/static/fundamentos-matematicos.html?assunto=fracoes` serve os quatro assuntos novos. O carrossel existente em `app/frontend/pages/menu.html` mantém as duas aplicações de funções e seus links. Os quatro novos cards usam as mesmas classes e o mesmo controlador de carrossel. O atributo opcional `data-fit-active` ajusta a altura ao card ativo em `menu-carousel.js` e `carousel.css`, evitando que os cards novos herdem espaços vazios dos antigos. Os carrosséis de jogos e Data Science mantêm o comportamento anterior.

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

Limitação anterior identificada: `primeiro-grau.html` referencia `js/primeiro-grau.js`, ausente no repositório antes desta implementação. A página e seu link foram preservados, mas seu cálculo não pode ser confirmado funcional. As aplicações de funções dependem também do Chart.js externo.

Validação local: 12 exercícios em 320, 390, 768 e 1366 px; interação por teclado, dicas, resoluções, resumo e ausência de overflow. As suítes existentes de Desafio Relâmpago e Jogo dos Pares também foram executadas. A função de 2º grau manteve cálculo, gráfico e tabela. Testes em Chrome headless com viewport emulado; aparelhos físicos não foram usados.
