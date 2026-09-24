# Jogo dos Pares — colunas pedagógicas

## Regra corrigida

Antes, as categorias eram embaralhadas juntas; o nível 2 ainda usava pizzas,
e o nível 3 era uma pergunta com alternativas visuais. Agora todos os níveis
usam três pares em duas colunas fixas, tanto no celular quanto no desktop:

| Nível | Esquerda | Direita |
|---|---|---|
| 1 | Pizza SVG | Fração exatamente representada |
| 2 | Fração | Fração equivalente escrita de outra forma |
| 3 | Soma de frações | Resultado em forma de fração |

Cada coluna é embaralhada independentemente. Se todos os pares ficarem alinhados,
a coluna direita é rotacionada. Cada valor tem exatamente um parceiro naquela
rodada: valores duplicados são descartados durante a seleção, e a rodada pronta
é validada novamente antes de renderizar. Cinco rodadas completam um nível.

Um clique em outro cartão da mesma coluna troca a seleção. Colunas opostas
permitem a tentativa, começando de qualquer lado. Erros bloqueiam tentativas
por 800 ms, sem mostrar a resposta; acertos ficam visíveis, desabilitados, com
borda e fundo verde suave e um ✓ no canto. aria-pressed descreve a seleção e
o nome acessível informa pares concluídos. Não há rótulos repetidos nos cartões.

## Matemática e SVG

Todos os cartões possuem numerator e denominator. IDs apenas localizam cartões;
a equivalência é sempre `a.numerator * b.denominator === b.numerator * a.denominator`.
Operações calculam seu resultado a partir das parcelas; não mantêm uma resposta
manual independente. O nível atual usa parcelas com denominadores iguais.

`FractionView.pizza({numerator, denominator})` é o único desenhista de pizzas.
Ele cria denominator setores de ângulo 2π/denominator e preenche numerator deles.
Os setores usam arcos de raio 48, no viewBox 0 0 104 104, começando no topo.
Denominador 1 usa um círculo. A descrição acessível informa preenchidos e total.
Não há imagens prontas nem associação manual entre desenho e valor.

`FractionView.fraction({numerator, denominator})` gera a notação vertical.
Ambos usam o mesmo objeto matemático do cartão. Frações suportadas: zero até
um inteiro, numeradores/denominadores inteiros e denominador positivo.

## Conteúdo extensível

Edite `app/frontend/data/jogo-dos-pares.js`:

```js
// Nível visual (type: 'match'):
{ numerator: 4, denominator: 5 }
// Equivalência (type: 'equivalence'):
{ numerator: 2, denominator: 5,
  equivalent: { numerator: 4, denominator: 10 } }
// Operação (type: 'operation'); resultado calculado pelo motor:
{ terms: [
  { numerator: 1, denominator: 4 },
  { numerator: 2, denominator: 4 }
] }
```

Novos níveis recebem id único, title, type e items. Cada nível deve fornecer
pelo menos três valores matemáticos distintos. No nível de equivalência,
os dois lados precisam ter o mesmo valor, mas numerador/denominador diferentes.
O seletor detecta os níveis automaticamente. Tipos novos exigem regras e UI novas.

## Arquivos desta correção

- `app/frontend/data/jogo-dos-pares.js`: objetos matemáticos e níveis.
- `app/frontend/js/jogo-dos-pares-engine.js`: colunas, validação e seleção.
- `app/frontend/js/fractions.js`: renderização pelo objeto matemático.
- `app/frontend/js/jogo-dos-pares.js`: interface e estados compactos.
- `app/frontend/jogo-dos-pares.html`: cabeçalhos das colunas e ajuda.
- `app/frontend/css/jogo-dos-pares.css`: duas colunas em todas as larguras.
- `tests/frontend/jogo-dos-pares.test.js`: testes de regras e gráficos.
- Este documento.

Nenhuma alteração no menu, cabeçalho, demais jogos, backend, Docker ou storage.
O pedido posterior sobre o HERO foi tratado separadamente em index.html e
css/home.css: remove título/slogan visual do HERO e sobrepõe marca decorativa
no caderno, sem modificar a ilustração original nem seu enquadramento.

## Validação

Chrome: seis SVGs inspecionados visualmente (1/2, 1/3, 2/3, 3/4, 4/5, 5/6),
cinco equivalências solicitadas e três pares falsos. 300 rodadas geradas,
verificando colunas, parceiros únicos, conteúdo, seleção e bloqueio.
15 rodadas completas pela UI, passando pelos três níveis; erro com recuperação
após 800 ms e troca de seleção dentro da mesma coluna. Capturas em 360×640,
390×844, 768×1024 e 1366×768: duas colunas e ausência de scroll horizontal.
Não equivale a testes em aparelhos físicos.
