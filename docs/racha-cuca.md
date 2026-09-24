# Racha-Cuca

Página: `/static/racha-cuca.html`. O card único do carrossel abre uma seleção de Matemática, Textos e Versículos Bíblicos. Não há API, banco, bibliotecas externas ou alterações nos outros jogos.

## Arquitetura

- `js/racha-cuca-engine.js`: movimentos, embaralhamento, tempo, dicas, vitória e adaptador de armazenamento; não depende do DOM ou de um tema.
- `js/racha-cuca.js`: registro de temas/adaptadores e interface compartilhada.
- `data/racha-cuca-matematica.js`: gerador de sequência, tabuada 2–10, operações e equações com resultados únicos 1–15 (múltiplos na tabuada).
- `data/racha-cuca-textos.js`: três textos originais, dois 3×3 e um 4×4.
- `data/racha-cuca-versiculos.js`: Gênesis 1:1 e Salmos 23:1, 3×3. Texto de Almeida 1911 com grafia atualizada. Referência visível antes da vitória; texto completo e fonte após a resolução.

Fontes dos versículos: [Gênesis](https://bibliaalmeida.com/genesis/1/) e [Salmos](https://church.com/pt/bible/psalms/23?version=ALM).

Cada conteúdo tem `id`, `title`, `text`, `parts`, `size`, `difficulty` sugerida e, quando pertinente, `reference`, `source` e `translation`. O adaptador entrega `tiles: [{order, display}]` ao motor. A ordem lógica nunca depende do texto. Um desafio 3×3 precisa de oito trechos; um 4×4 precisa de quinze. Conteúdos menores devem ser segmentados editorialmente para essas dimensões, sem peças de preenchimento. A dificuldade sugerida do conteúdo é metadado; o jogador escolhe o nível de embaralhamento.

Para adicionar textos/versículos, acrescente registros nos arquivos de dados. Para outro tema, registre seu fornecedor em `RachaCucaThemes` e seu botão na seleção: não é necessário duplicar os movimentos ou a interface da partida.

## Partida

Embaralhamento começa resolvido e executa 40/100/200 movimentos legais, sem desfazer imediatamente o anterior e sem terminar resolvido. Esses números não representam a distância mínima até a solução.

Somente vizinhos ortogonais movem. Setas, com foco no tabuleiro, deslocam o vazio na direção indicada; Enter/Space ativam o botão focado. Toque não exige teclado virtual. O cronômetro começa em Iniciar jogo e para ao resolver/sair do desafio. Inclui tempo com a aba em segundo plano. Reiniciar repete peças e posições; nova partida embaralha o mesmo conteúdo. A página recarregada preserva recordes, mas não retoma uma partida em andamento.

Dica revela por oito segundos o conteúdo da primeira posição final ainda incorreta. Não é um solucionador automático nem promete um movimento imediato. Dicas são contadas e não alteram peças ou movimentos. Ao vencer, movimentos/dicas ficam bloqueados e o texto completo aparece. Próximo desafio/versículo percorre circularmente o catálogo.

## Persistência local

Chave exclusiva: `matematica.rachaCuca.v1`. Contém versão, total de partidas iniciadas, recordes e até 100 resultados recentes. Resultados incluem tema, desafio, modalidade, tabuada, dimensão, dificuldade, início/fim ISO, duração em milissegundos, movimentos, dicas e vitória. Partidas interrompidas voluntariamente são registradas sem vitória. Fechamento forçado do navegador pode impedir o evento final de gravação.

Recordes separados por tema/desafio/dificuldade/dimensão/tabuada. Prioridade: menos movimentos; empate: menos tempo. Dicas são exibidas, mas não alteram esse critério. Somente vitórias registram recorde. Sem armazenamento disponível, funciona em memória e avisa. Não usa chaves de Dama, Queda ou Data Science; não envia dados para servidores. `createArchive()` encapsula o adaptador para futura integração planejada.

## Validação

`tests/frontend/racha-cuca.test.js` não exige bibliotecas:
- `testRachaCuca(RachaCucaEngine, RachaCucaMath, RachaCucaTexts, RachaCucaVerses)` testa motor, conteúdo e storage com 360 embaralhamentos reversíveis, todas as modalidades e níveis.
- `testRachaCucaUI()` roda na página em perfil de navegador de teste, usando geração determinística apenas durante o teste; exercita os handlers reais, vitória e persistência. Não executar no perfil pessoal: a função grava partidas de teste.

Validado em Firefox headless com arquivos locais (sem servidor/Docker): controles, vitória, recordes após reload e layout em 320/390/820/1440 px. Testes em dispositivos Android/iPhone físicos ficam para homologação. Áudio opcional não foi incluído nesta entrega.
