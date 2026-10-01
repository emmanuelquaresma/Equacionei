# Bots no jogo do site

O modo **Contra o computador** em `/static/dama.html` usa três famílias de algoritmos:

- Fácil: regressão logística, um turno completo à frente.
- Médio: MCTS adversarial com UCB1, até 1.500 simulações ou 450 ms. Rollouts param em 60 turnos; no corte, usam estimativa contínua por material, não uma vitória fictícia.
- Difícil: avaliação TD(0) aprendida por autojogo, Minimax com alfa-beta e aprofundamento iterativo até 6 turnos ou 650 ms. Capturas podem estender a busca em até 6 turnos.

A implementação adapta a proposta Python às **regras já existentes no site**: dama curta, captura frontal de pedras, captura obrigatória sem lei da maioria e promoção imediata. Não implementa as regras brasileiras nem altera partidas online. O jogo local não tem adjudicação automática de empate; o corte de 200 turnos é apenas do treinamento.

O Worker carrega `dama-rules.js`, `dama-learning.js`, `dama-models.js` e `dama-ai.js`. Não há treino durante o jogo nem serviço Python em produção. Se o Worker falhar ou ultrapassar o limite de segurança, a interface informa que usou uma jogada legal simplificada.

## Reproduzir o treinamento

Na raiz do repositório, com Python 3 e Chrome/Chromium instalado:

```sh
python3 data-science/dama/web/train.py
```

O treinador usa o motor JavaScript real, seis features da proposta original e semente fixa. Gera 400 partidas com política aleatória/material e treina regressão por 400 épocas; separa partidas inteiras entre treino e teste. Partidas truncadas são excluídas do conjunto supervisionado. TD começa com pesos zero, joga 600 episódios com epsilon 0,15 e taxa 0,1, usando recompensa terminal e alvo 0,5 no limite de treino. Empates numéricos são sorteados.

`app/frontend/js/dama-models.js` contém pesos reais e metadados: 18.891 posições de treino, 5.102 de teste e acurácia de aproximadamente 72,6% nesta geração. Isso mede previsão sobre partidas da política geradora, não força contra humanos nem calibração de probabilidades. Não há evidência de torneio que garanta Fácil < Médio < Difícil em força.

## Verificar

```sh
python3 tests/browser/dama_bot.py
```

Valida regras, turnos completos, seleção supervisionada, execução de MCTS/Minimax, imutabilidade, Worker, troca de modos, reinício, fallback e interação em telas móveis e desktop.
