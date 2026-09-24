# Identidade ∑quacionei

Marca: **∑quacionei**. O caractere ∑ (U+2211) substitui o E; não há ícone
de somatório separado. Slogan: **Matemática • Exatas • Ciência de Dados**.
Leitura acessível do link: Equacionei — Matemática, Exatas e Ciência de Dados — início.
Nas páginas de jogos o nome contextual continua acessível no cabeçalho.

## Alterações de apresentação

- Cabeçalhos de fallback atualizados nas 14 páginas existentes. A composição
  `.site-brand__identity`, `.site-brand__name`, `.site-brand__sum` e
  `.site-brand__tagline` usa um único conjunto de estilos em site.css.
- site-ui.js mantém navegação e acrescenta o contexto do jogo na nova composição.
- Títulos estáticos e título dinâmico do catálogo usam “∑quacionei | área”.
- Sobre e rodapés das aplicações apresentam a nova identidade.
- HOME apresenta marca e slogan em HTML; a ilustração original da família é
  enquadrada por CSS para não mostrar o lettering antigo. O arquivo não foi alterado.
- O fundo secundário usa seu gradiente existente, sem a imagem que tinha a marca antiga.
- Aplicações Matemáticas e Desenvolvimento são cartões irmãos na HOME; os
  carrosséis e seus itens foram preservados. Jogos continua no menu global.

## Arquivos da mudança de marca

Todos os caminhos abaixo são relativos a `app/frontend/`:

- index.html
- pages/menu.html
- desenvolvimento.html
- python.html
- data-science.html
- sobre.html
- primeiro-grau.html
- segundo-grau.html
- dama.html
- xadrez.html
- queda-matematica.html
- desafio-relampago.html
- racha-cuca.html
- labirinto-matematico.html
- css/site.css
- css/home.css
- js/site-ui.js
- js/menu-carousel.js

A correção Python e da HOME já em andamento também alterou:
`js/python-runner.js`, `js/python-learning.js`, `css/desenvolvimento.css`,
`tests/frontend/python-learning.test.js` e `docs/desenvolvimento-python.md`.

## Referências antigas mantidas intencionalmente

- `data/python-exercises.js`: enunciado e saída esperada do primeiro exercício,
  para preservar a validação e os rascunhos/progresso existentes.
- `tests/frontend/python-learning.test.js`: texto correspondente no teste UTF-8.
- `img/banner/banner-matematica-pra-todos.webp`: arquivo original preservado;
  apenas a região ilustrada é exibida na HOME.
- README histórico, título técnico FastAPI, caminhos, scripts, chaves de storage,
  diretórios e configurações: não fazem parte desta renomeação visual.
- “Data Science para Todos” permanece como nome da área educacional, não como marca global.

## Verificação

Google Chrome: 15 rotas (incluindo os dois estados do catálogo) em 360×640,
390×844 e 1366×768, totalizando 45 combinações. Conferidos marca, title,
item ativo, ausência de overflow horizontal e separação entre marca e hamburger.
Menu aberto/fechado nas telas pequenas. Capturas de HOME, Python e Racha-Cuca
inspecionadas visualmente. Cabeçalho compacto, slogan legível e nome sem quebra.

Abertura das páginas de jogos e aplicações verificada; motores e regras não
foram modificados pela mudança de marca. Testes de viewport não equivalem a
certificação em aparelhos físicos ou em todos os navegadores.
