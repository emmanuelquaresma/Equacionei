/* Curso completo: dados separados da apresentação. */
const ChessLessons = (() => {
 function freeze(v){if(v&&typeof v==="object"){Object.values(v).forEach(freeze);Object.freeze(v);}return v;}
 return freeze({
    "topics": [
        {
            "id": "objective",
            "title": "1. Objetivo do Xadrez",
            "available": true
        },
        {
            "id": "setup",
            "title": "2. Organização inicial do tabuleiro",
            "available": true
        },
        {
            "id": "pieces",
            "title": "3. Identificação das peças",
            "available": true
        },
        {
            "id": "pawns",
            "title": "4. Movimento do peão",
            "available": true
        },
        {
            "id": "rooks",
            "title": "5. A torre: linhas e colunas",
            "available": true
        },
        {
            "id": "knights",
            "title": "6. Movimento do cavalo",
            "available": true
        },
        {
            "id": "bishops",
            "title": "7. Movimento do bispo",
            "available": true
        },
        {
            "id": "queen",
            "title": "8. Movimento da dama",
            "available": true
        },
        {
            "id": "king",
            "title": "9. Movimento do rei",
            "available": true
        },
        {
            "id": "captures",
            "title": "10. Captura de peças",
            "available": true
        },
        {
            "id": "check",
            "title": "11. Xeque e xeque-mate",
            "available": true
        },
        {
            "id": "castling",
            "title": "12. Roque",
            "available": true
        },
        {
            "id": "en-passant",
            "title": "13. Captura en passant",
            "available": true
        },
        {
            "id": "promotion",
            "title": "14. Promoção do peão",
            "available": true
        },
        {
            "id": "draws",
            "title": "15. Empate e afogamento",
            "available": true
        }
    ],
    "lessons": [
        {
            "id": "objective",
            "title": "1. Objetivo do Xadrez",
            "description": "O objetivo é dar xeque-mate: atacar o rei adversário de modo que ele não tenha nenhuma defesa legal. O rei nunca é capturado.",
            "objective": "1. Objetivo do Xadrez",
            "explanation": [
                "O objetivo é dar xeque-mate: atacar o rei adversário de modo que ele não tenha nenhuma defesa legal. O rei nunca é capturado.",
                "As brancas começam e os jogadores alternam as jogadas. Você não pode deixar seu próprio rei em xeque; ter mais peças não garante a vitória.",
                "Primeiro identifique os reis. Depois acompanhe um exemplo de mate com dama e bispo. É um exemplo ilustrativo: as pretas poderiam defender de outra maneira; não é uma abertura obrigatória."
            ],
            "demo": {
                "position": {
                    "standard": true
                },
                "moves": [
                    {
                        "kind": "observe",
                        "caption": "Os reis começam em e1 e e8. Proteger seu rei e atacar o adversário são partes do objetivo.",
                        "highlight": [
                            "e1",
                            "e8"
                        ]
                    },
                    {
                        "from": "e2",
                        "to": "e4",
                        "caption": "Jogada 1: e2 → e4. Observe a alternância dos jogadores."
                    },
                    {
                        "from": "e7",
                        "to": "e5",
                        "caption": "Jogada 2: e7 → e5. Observe a alternância dos jogadores."
                    },
                    {
                        "from": "f1",
                        "to": "c4",
                        "caption": "Jogada 3: f1 → c4. Observe a alternância dos jogadores."
                    },
                    {
                        "from": "b8",
                        "to": "c6",
                        "caption": "Jogada 4: b8 → c6. Observe a alternância dos jogadores."
                    },
                    {
                        "from": "d1",
                        "to": "h5",
                        "caption": "Jogada 5: d1 → h5. Observe a alternância dos jogadores."
                    },
                    {
                        "from": "g8",
                        "to": "f6",
                        "caption": "Jogada 6: g8 → f6. Observe a alternância dos jogadores."
                    },
                    {
                        "from": "h5",
                        "to": "f7",
                        "caption": "A dama captura f7, apoiada pelo bispo: o rei preto está em xeque e não há defesa legal. É xeque-mate."
                    }
                ]
            },
            "exercises": [
                {
                    "id": "find-own-king",
                    "type": "select",
                    "title": "Identifique o rei branco.",
                    "objective": "Identifique o rei branco.",
                    "position": {
                        "standard": true
                    },
                    "answer": {
                        "type": "k",
                        "color": "white"
                    },
                    "instructions": "Selecione uma casa ou peça com toque, clique, Enter ou Espaço. Esta atividade não movimenta as peças.",
                    "hint": "Procure a peça com a cruz no alto, na casa e1.",
                    "feedback": {
                        "correct": "Correto! Você identificou a casa ou peça solicitada.",
                        "incorrect": "A resposta ainda não cumpre o objetivo. O exercício foi preservado; observe o tabuleiro e tente novamente.",
                        "illegal": "Essa jogada é ilegal. Seu rei precisa ficar seguro e a peça deve respeitar seus movimentos. O estado do exercício foi preservado."
                    },
                    "completion": {
                        "type": "selection"
                    }
                }
            ],
            "completion": {
                "type": "all-exercises"
            }
        },
        {
            "id": "setup",
            "title": "2. Organização inicial do tabuleiro",
            "description": "O tabuleiro tem 64 casas, oito colunas de a a h e oito fileiras de 1 a 8. Visto pelas brancas, a casa clara fica no canto direito: h1.",
            "objective": "2. Organização inicial do tabuleiro",
            "explanation": [
                "O tabuleiro tem 64 casas, oito colunas de a a h e oito fileiras de 1 a 8. Visto pelas brancas, a casa clara fica no canto direito: h1.",
                "Cada lado começa com 16 peças. Torres ficam nos cantos, depois cavalos e bispos; a dama ocupa uma casa da sua cor, e o rei fica ao lado. Peões ficam nas fileiras 2 e 7.",
                "Não troque rei e dama nem inverta a orientação do tabuleiro. No início várias peças estão bloqueadas pelas suas próprias peças: só peões e cavalos podem jogar."
            ],
            "demo": {
                "position": {
                    "standard": true
                },
                "moves": [
                    {
                        "kind": "observe",
                        "caption": "h1 é a casa clara no canto direito das brancas.",
                        "highlight": [
                            "h1"
                        ]
                    },
                    {
                        "kind": "observe",
                        "caption": "Dama branca em d1 e rei branco em e1; dama preta em d8 e rei preto em e8.",
                        "highlight": [
                            "d1",
                            "e1",
                            "d8",
                            "e8"
                        ]
                    },
                    {
                        "kind": "observe",
                        "caption": "As fileiras 2 e 7 abrigam os peões. Cada lado tem oito.",
                        "highlight": [
                            "a2",
                            "b2",
                            "c2",
                            "d2",
                            "e2",
                            "f2",
                            "g2",
                            "h2",
                            "a7",
                            "b7",
                            "c7",
                            "d7",
                            "e7",
                            "f7",
                            "g7",
                            "h7"
                        ]
                    }
                ]
            },
            "exercises": [
                {
                    "id": "right-light-corner",
                    "type": "select",
                    "title": "Selecione a casa clara no canto direito das brancas.",
                    "objective": "Selecione a casa clara no canto direito das brancas.",
                    "position": {
                        "standard": true
                    },
                    "answer": {
                        "square": "h1"
                    },
                    "instructions": "Selecione uma casa ou peça com toque, clique, Enter ou Espaço. Esta atividade não movimenta as peças.",
                    "hint": "Encontre a coluna h e a fileira 1.",
                    "feedback": {
                        "correct": "Correto! Você identificou a casa ou peça solicitada.",
                        "incorrect": "A resposta ainda não cumpre o objetivo. O exercício foi preservado; observe o tabuleiro e tente novamente.",
                        "illegal": "Essa jogada é ilegal. Seu rei precisa ficar seguro e a peça deve respeitar seus movimentos. O estado do exercício foi preservado."
                    },
                    "completion": {
                        "type": "selection"
                    }
                },
                {
                    "id": "initial-queen",
                    "type": "select",
                    "title": "Selecione a casa inicial da dama branca.",
                    "objective": "Selecione a casa inicial da dama branca.",
                    "position": {
                        "standard": true
                    },
                    "answer": {
                        "square": "d1",
                        "type": "q",
                        "color": "white"
                    },
                    "instructions": "Selecione uma casa ou peça com toque, clique, Enter ou Espaço. Esta atividade não movimenta as peças.",
                    "hint": "A dama branca começa em d1, uma casa clara.",
                    "feedback": {
                        "correct": "Correto! Você identificou a casa ou peça solicitada.",
                        "incorrect": "A resposta ainda não cumpre o objetivo. O exercício foi preservado; observe o tabuleiro e tente novamente.",
                        "illegal": "Essa jogada é ilegal. Seu rei precisa ficar seguro e a peça deve respeitar seus movimentos. O estado do exercício foi preservado."
                    },
                    "completion": {
                        "type": "selection"
                    }
                }
            ],
            "completion": {
                "type": "all-exercises"
            }
        },
        {
            "id": "pieces",
            "title": "3. Identificação das peças",
            "description": "Há seis tipos: rei, dama (rainha), torre, bispo, cavalo e peão. As formas e os nomes acessíveis ajudam a reconhecer cada um.",
            "objective": "3. Identificação das peças",
            "explanation": [
                "Há seis tipos: rei, dama (rainha), torre, bispo, cavalo e peão. As formas e os nomes acessíveis ajudam a reconhecer cada um.",
                "Rei e dama têm funções diferentes. Torres ocupam cantos, cavalos parecem cavalos, bispos têm uma mitra e peões são as peças menores.",
                "Identificar uma peça não significa movê-la. Nesta lição clique nas peças pedidas; tentar selecionar outra cor ou tipo não resolve o exercício."
            ],
            "demo": {
                "position": {
                    "standard": true
                },
                "moves": [
                    {
                        "kind": "observe",
                        "caption": "Rei: uma casa por vez, com segurança.",
                        "highlight": [
                            "e1"
                        ]
                    },
                    {
                        "kind": "observe",
                        "caption": "Dama: linhas, colunas e diagonais.",
                        "highlight": [
                            "d1"
                        ]
                    },
                    {
                        "kind": "observe",
                        "caption": "Torre: linhas e colunas.",
                        "highlight": [
                            "a1",
                            "h1"
                        ]
                    },
                    {
                        "kind": "observe",
                        "caption": "Bispo: diagonais.",
                        "highlight": [
                            "c1",
                            "f1"
                        ]
                    },
                    {
                        "kind": "observe",
                        "caption": "Cavalo: movimento em L e salto.",
                        "highlight": [
                            "b1",
                            "g1"
                        ]
                    },
                    {
                        "kind": "observe",
                        "caption": "Peão: avanço e captura são diferentes.",
                        "highlight": [
                            "a2",
                            "b2",
                            "c2",
                            "d2",
                            "e2",
                            "f2",
                            "g2",
                            "h2"
                        ]
                    }
                ]
            },
            "exercises": [
                {
                    "id": "identify-k",
                    "type": "select",
                    "title": "Identifique o rei branco.",
                    "objective": "Identifique o rei branco.",
                    "position": {
                        "standard": true
                    },
                    "answer": {
                        "type": "k",
                        "color": "white"
                    },
                    "instructions": "Selecione uma casa ou peça com toque, clique, Enter ou Espaço. Esta atividade não movimenta as peças.",
                    "hint": "Rei: e1.",
                    "feedback": {
                        "correct": "Correto! Você identificou a casa ou peça solicitada.",
                        "incorrect": "A resposta ainda não cumpre o objetivo. O exercício foi preservado; observe o tabuleiro e tente novamente.",
                        "illegal": "Essa jogada é ilegal. Seu rei precisa ficar seguro e a peça deve respeitar seus movimentos. O estado do exercício foi preservado."
                    },
                    "completion": {
                        "type": "selection"
                    }
                },
                {
                    "id": "identify-q",
                    "type": "select",
                    "title": "Identifique a dama branca.",
                    "objective": "Identifique a dama branca.",
                    "position": {
                        "standard": true
                    },
                    "answer": {
                        "type": "q",
                        "color": "white"
                    },
                    "instructions": "Selecione uma casa ou peça com toque, clique, Enter ou Espaço. Esta atividade não movimenta as peças.",
                    "hint": "Dama: d1.",
                    "feedback": {
                        "correct": "Correto! Você identificou a casa ou peça solicitada.",
                        "incorrect": "A resposta ainda não cumpre o objetivo. O exercício foi preservado; observe o tabuleiro e tente novamente.",
                        "illegal": "Essa jogada é ilegal. Seu rei precisa ficar seguro e a peça deve respeitar seus movimentos. O estado do exercício foi preservado."
                    },
                    "completion": {
                        "type": "selection"
                    }
                },
                {
                    "id": "identify-r",
                    "type": "select",
                    "title": "Identifique uma torre branca.",
                    "objective": "Identifique uma torre branca.",
                    "position": {
                        "standard": true
                    },
                    "answer": {
                        "type": "r",
                        "color": "white"
                    },
                    "instructions": "Selecione uma casa ou peça com toque, clique, Enter ou Espaço. Esta atividade não movimenta as peças.",
                    "hint": "Torres: a1 ou h1.",
                    "feedback": {
                        "correct": "Correto! Você identificou a casa ou peça solicitada.",
                        "incorrect": "A resposta ainda não cumpre o objetivo. O exercício foi preservado; observe o tabuleiro e tente novamente.",
                        "illegal": "Essa jogada é ilegal. Seu rei precisa ficar seguro e a peça deve respeitar seus movimentos. O estado do exercício foi preservado."
                    },
                    "completion": {
                        "type": "selection"
                    }
                },
                {
                    "id": "identify-b",
                    "type": "select",
                    "title": "Identifique um bispo branco.",
                    "objective": "Identifique um bispo branco.",
                    "position": {
                        "standard": true
                    },
                    "answer": {
                        "type": "b",
                        "color": "white"
                    },
                    "instructions": "Selecione uma casa ou peça com toque, clique, Enter ou Espaço. Esta atividade não movimenta as peças.",
                    "hint": "Bispos: c1 ou f1.",
                    "feedback": {
                        "correct": "Correto! Você identificou a casa ou peça solicitada.",
                        "incorrect": "A resposta ainda não cumpre o objetivo. O exercício foi preservado; observe o tabuleiro e tente novamente.",
                        "illegal": "Essa jogada é ilegal. Seu rei precisa ficar seguro e a peça deve respeitar seus movimentos. O estado do exercício foi preservado."
                    },
                    "completion": {
                        "type": "selection"
                    }
                },
                {
                    "id": "identify-n",
                    "type": "select",
                    "title": "Identifique um cavalo branco.",
                    "objective": "Identifique um cavalo branco.",
                    "position": {
                        "standard": true
                    },
                    "answer": {
                        "type": "n",
                        "color": "white"
                    },
                    "instructions": "Selecione uma casa ou peça com toque, clique, Enter ou Espaço. Esta atividade não movimenta as peças.",
                    "hint": "Cavalos: b1 ou g1.",
                    "feedback": {
                        "correct": "Correto! Você identificou a casa ou peça solicitada.",
                        "incorrect": "A resposta ainda não cumpre o objetivo. O exercício foi preservado; observe o tabuleiro e tente novamente.",
                        "illegal": "Essa jogada é ilegal. Seu rei precisa ficar seguro e a peça deve respeitar seus movimentos. O estado do exercício foi preservado."
                    },
                    "completion": {
                        "type": "selection"
                    }
                },
                {
                    "id": "identify-p",
                    "type": "select",
                    "title": "Identifique um peão branco.",
                    "objective": "Identifique um peão branco.",
                    "position": {
                        "standard": true
                    },
                    "answer": {
                        "type": "p",
                        "color": "white"
                    },
                    "instructions": "Selecione uma casa ou peça com toque, clique, Enter ou Espaço. Esta atividade não movimenta as peças.",
                    "hint": "Peões: qualquer casa da fileira 2.",
                    "feedback": {
                        "correct": "Correto! Você identificou a casa ou peça solicitada.",
                        "incorrect": "A resposta ainda não cumpre o objetivo. O exercício foi preservado; observe o tabuleiro e tente novamente.",
                        "illegal": "Essa jogada é ilegal. Seu rei precisa ficar seguro e a peça deve respeitar seus movimentos. O estado do exercício foi preservado."
                    },
                    "completion": {
                        "type": "selection"
                    }
                }
            ],
            "completion": {
                "type": "all-exercises"
            }
        },
        {
            "id": "pawns",
            "title": "4. Movimento do peão",
            "description": "O peão branco avança em direção à fileira 8; o preto avança para a fileira 1. Normalmente avança uma casa, sem capturar.",
            "objective": "4. Movimento do peão",
            "explanation": [
                "O peão branco avança em direção à fileira 8; o preto avança para a fileira 1. Normalmente avança uma casa, sem capturar.",
                "Na casa inicial pode avançar duas casas se ambas estiverem livres. Depois não pode repetir esse avanço duplo, voltar para trás ou saltar uma peça.",
                "A captura acontece uma casa na diagonal à frente, somente quando há uma peça adversária ali. Uma diagonal vazia não é um avanço comum."
            ],
            "demo": {
                "position": {
                    "pieces": [
                        {
                            "square": "a1",
                            "type": "k",
                            "color": "white"
                        },
                        {
                            "square": "h7",
                            "type": "k",
                            "color": "black"
                        },
                        {
                            "square": "a7",
                            "type": "p",
                            "color": "black"
                        },
                        {
                            "square": "e2",
                            "type": "p",
                            "color": "white"
                        }
                    ],
                    "currentPlayer": "white"
                },
                "moves": [
                    {
                        "from": "e2",
                        "to": "e4",
                        "caption": "Primeiro avanço: e2 → e4 percorre duas casas livres.",
                        "forbidden": [
                            "f3"
                        ]
                    },
                    {
                        "from": "a7",
                        "to": "a6",
                        "caption": "O peão preto avança para uma fileira de número menor."
                    },
                    {
                        "from": "e4",
                        "to": "e5",
                        "caption": "Agora o peão branco avança só uma casa. Não pode voltar a e4."
                    },
                    {
                        "kind": "observe",
                        "caption": "Outro diagrama: o cavalo preto está na diagonal à frente do peão de e4.",
                        "highlight": [
                            "e4",
                            "f5"
                        ],
                        "position": {
                            "pieces": [
                                {
                                    "square": "a1",
                                    "type": "k",
                                    "color": "white"
                                },
                                {
                                    "square": "h7",
                                    "type": "k",
                                    "color": "black"
                                },
                                {
                                    "square": "a7",
                                    "type": "p",
                                    "color": "black"
                                },
                                {
                                    "square": "e4",
                                    "type": "p",
                                    "color": "white"
                                },
                                {
                                    "square": "f5",
                                    "type": "n",
                                    "color": "black"
                                }
                            ],
                            "currentPlayer": "white"
                        }
                    },
                    {
                        "from": "e4",
                        "to": "f5",
                        "caption": "O peão captura o cavalo em f5, na diagonal. Ele não capturaria avançando em linha reta."
                    }
                ]
            },
            "exercises": [
                {
                    "id": "pawn-double",
                    "type": "move",
                    "title": "Avance o peão branco de e2 para e4.",
                    "objective": "Avance o peão branco de e2 para e4.",
                    "position": {
                        "pieces": [
                            {
                                "square": "a1",
                                "type": "k",
                                "color": "white"
                            },
                            {
                                "square": "h7",
                                "type": "k",
                                "color": "black"
                            },
                            {
                                "square": "a7",
                                "type": "p",
                                "color": "black"
                            },
                            {
                                "square": "e2",
                                "type": "p",
                                "color": "white"
                            }
                        ],
                        "currentPlayer": "white"
                    },
                    "target": "e4",
                    "instructions": "Selecione a peça e depois o destino. Apenas uma jogada legal que cumpra o objetivo será aceita.",
                    "solution": [
                        {
                            "from": "e2",
                            "to": "e4"
                        }
                    ],
                    "hint": "Duas casas na coluna e; e3 e e4 precisam estar livres.",
                    "feedback": {
                        "correct": "Correto! Você cumpriu o objetivo com uma jogada legal.",
                        "incorrect": "A resposta ainda não cumpre o objetivo. O exercício foi preservado; observe o tabuleiro e tente novamente.",
                        "illegal": "Essa jogada é ilegal. Seu rei precisa ficar seguro e a peça deve respeitar seus movimentos. O estado do exercício foi preservado."
                    },
                    "completion": {
                        "type": "solution-sequence"
                    }
                },
                {
                    "id": "pawn-diagonal-capture",
                    "type": "move",
                    "title": "Capture o cavalo preto em f5 com o peão de e4.",
                    "objective": "Capture o cavalo preto em f5 com o peão de e4.",
                    "instructions": "Selecione o peão e depois o cavalo na diagonal à frente. O avanço sem captura tem outra direção.",
                    "position": {
                        "pieces": [
                            {
                                "square": "a1",
                                "type": "k",
                                "color": "white"
                            },
                            {
                                "square": "h7",
                                "type": "k",
                                "color": "black"
                            },
                            {
                                "square": "a7",
                                "type": "p",
                                "color": "black"
                            },
                            {
                                "square": "e4",
                                "type": "p",
                                "color": "white"
                            },
                            {
                                "square": "f5",
                                "type": "n",
                                "color": "black"
                            }
                        ],
                        "currentPlayer": "white"
                    },
                    "target": "f5",
                    "solution": [
                        {
                            "from": "e4",
                            "to": "f5"
                        }
                    ],
                    "hint": "O peão branco captura uma casa na diagonal para uma fileira maior.",
                    "feedback": {
                        "correct": "Correto! O peão capturou na diagonal e o cavalo foi removido.",
                        "incorrect": "Esse movimento não realiza a captura pedida. O exercício foi preservado.",
                        "illegal": "A captura precisa estar uma casa na diagonal à frente, sem deixar seu rei em xeque."
                    },
                    "completion": {
                        "type": "solution-sequence"
                    }
                }
            ],
            "completion": {
                "type": "all-exercises"
            }
        },
        {
            "id": "rooks",
            "title": "5. A torre: linhas e colunas",
            "description": "A torre anda em linha reta, na horizontal ou na vertical.",
            "objective": "Reconhecer os destinos legais de uma torre.",
            "explanation": [
                "A torre pode percorrer várias casas na mesma fileira (horizontal) ou coluna (vertical), se o caminho estiver livre. Os pontos no tabuleiro mostram os destinos legais.",
                "Ela não se move na diagonal. Por exemplo, de d4 para e5 a jogada não é permitida.",
                "Avance para ver d4 → d6 e depois d6 → f6. Entre esses exemplos, o rei preto faz uma jogada, respeitando a alternância de turnos. Voltar recupera a posição anterior."
            ],
            "demo": {
                "position": {
                    "pieces": [
                        {
                            "square": "a1",
                            "type": "k",
                            "color": "white"
                        },
                        {
                            "square": "h8",
                            "type": "k",
                            "color": "black"
                        },
                        {
                            "square": "d4",
                            "type": "r",
                            "color": "white"
                        }
                    ],
                    "currentPlayer": "white"
                },
                "moves": [
                    {
                        "from": "d4",
                        "to": "d6",
                        "caption": "Vertical: a torre subiu de d4 para d6, permanecendo na coluna d."
                    },
                    {
                        "from": "h8",
                        "to": "h7",
                        "caption": "É a vez das pretas: o rei vai de h8 para h7. Agora podemos mostrar outro movimento da torre."
                    },
                    {
                        "from": "d6",
                        "to": "f6",
                        "caption": "Horizontal: a torre foi de d6 para f6, permanecendo na fileira 6. Na diagonal, esse movimento não seria legal."
                    }
                ]
            },
            "completion": {
                "type": "all-exercises"
            },
            "exercises": [
                {
                    "id": "rook-target",
                    "title": "Movimente a torre até a casa indicada.",
                    "objective": "Mova a torre branca de d4 até g4 em uma única jogada. A casa g4 está marcada com ◎.",
                    "position": {
                        "pieces": [
                            {
                                "square": "a1",
                                "type": "k",
                                "color": "white"
                            },
                            {
                                "square": "h8",
                                "type": "k",
                                "color": "black"
                            },
                            {
                                "square": "d4",
                                "type": "r",
                                "color": "white"
                            }
                        ],
                        "currentPlayer": "white"
                    },
                    "target": "g4",
                    "solution": [
                        {
                            "from": "d4",
                            "to": "g4"
                        }
                    ],
                    "completion": {
                        "type": "solution-sequence"
                    },
                    "hint": "Selecione a torre em d4 e siga pela mesma fileira até g4: três casas à direita.",
                    "feedback": {
                        "correct": "Correto! A torre foi de d4 até g4 em linha reta, pela fileira 4.",
                        "incorrect": "Essa jogada é legal, mas não chega à casa indicada. O exercício foi preservado; tente chegar a g4.",
                        "illegal": "A jogada não é permitida. A torre não anda na diagonal e não pode atravessar peças. O exercício foi preservado."
                    },
                    "type": "move",
                    "instructions": "Selecione a torre em d4 e depois o destino g4."
                }
            ]
        },
        {
            "id": "knights",
            "title": "6. Movimento do cavalo",
            "description": "O cavalo anda em L: duas casas em uma direção e uma na perpendicular. Troca de cor de casa a cada movimento.",
            "objective": "6. Movimento do cavalo",
            "explanation": [
                "O cavalo anda em L: duas casas em uma direção e uma na perpendicular. Troca de cor de casa a cada movimento.",
                "É a única peça que pode saltar sobre outras. O peão em d5 não impede o salto d4 → f5.",
                "O cavalo não anda em linha reta nem em uma diagonal comum. Não pode terminar em uma casa ocupada por peça da própria cor."
            ],
            "demo": {
                "position": {
                    "pieces": [
                        {
                            "square": "a1",
                            "type": "k",
                            "color": "white"
                        },
                        {
                            "square": "h7",
                            "type": "k",
                            "color": "black"
                        },
                        {
                            "square": "a7",
                            "type": "p",
                            "color": "black"
                        },
                        {
                            "square": "d4",
                            "type": "n",
                            "color": "white"
                        },
                        {
                            "square": "d5",
                            "type": "p",
                            "color": "white"
                        }
                    ],
                    "currentPlayer": "white"
                },
                "moves": [
                    {
                        "from": "d4",
                        "to": "f5",
                        "caption": "Salto em L: duas colunas à direita e uma fileira acima.",
                        "forbidden": [
                            "d5"
                        ]
                    },
                    {
                        "from": "a7",
                        "to": "a6",
                        "caption": "As pretas fazem sua jogada."
                    },
                    {
                        "from": "f5",
                        "to": "h6",
                        "caption": "Outro L: duas colunas à direita e uma fileira acima."
                    }
                ]
            },
            "exercises": [
                {
                    "id": "knight-jump",
                    "type": "move",
                    "title": "Salte com o cavalo de d4 para f5.",
                    "objective": "Salte com o cavalo de d4 para f5.",
                    "position": {
                        "pieces": [
                            {
                                "square": "a1",
                                "type": "k",
                                "color": "white"
                            },
                            {
                                "square": "h7",
                                "type": "k",
                                "color": "black"
                            },
                            {
                                "square": "a7",
                                "type": "p",
                                "color": "black"
                            },
                            {
                                "square": "d4",
                                "type": "n",
                                "color": "white"
                            },
                            {
                                "square": "d5",
                                "type": "p",
                                "color": "white"
                            }
                        ],
                        "currentPlayer": "white"
                    },
                    "target": "f5",
                    "instructions": "Selecione a peça e depois o destino. Apenas uma jogada legal que cumpra o objetivo será aceita.",
                    "solution": [
                        {
                            "from": "d4",
                            "to": "f5"
                        }
                    ],
                    "hint": "O peão em d5 não bloqueia o cavalo; conte duas colunas e uma fileira.",
                    "feedback": {
                        "correct": "Correto! Você cumpriu o objetivo com uma jogada legal.",
                        "incorrect": "A resposta ainda não cumpre o objetivo. O exercício foi preservado; observe o tabuleiro e tente novamente.",
                        "illegal": "Essa jogada é ilegal. Seu rei precisa ficar seguro e a peça deve respeitar seus movimentos. O estado do exercício foi preservado."
                    },
                    "completion": {
                        "type": "solution-sequence"
                    }
                }
            ],
            "completion": {
                "type": "all-exercises"
            }
        },
        {
            "id": "bishops",
            "title": "7. Movimento do bispo",
            "description": "O bispo percorre diagonais e permanece sempre na cor da casa onde começou.",
            "objective": "7. Movimento do bispo",
            "explanation": [
                "O bispo percorre diagonais e permanece sempre na cor da casa onde começou.",
                "Pode andar várias casas se o caminho estiver livre, mas não salta peças. Não anda na horizontal ou vertical.",
                "A diagonal d4 → g7 passa por e5 e f6. As casas devem estar livres até o destino; uma peça adversária no destino pode ser capturada."
            ],
            "demo": {
                "position": {
                    "pieces": [
                        {
                            "square": "a1",
                            "type": "k",
                            "color": "white"
                        },
                        {
                            "square": "h7",
                            "type": "k",
                            "color": "black"
                        },
                        {
                            "square": "a7",
                            "type": "p",
                            "color": "black"
                        },
                        {
                            "square": "d4",
                            "type": "b",
                            "color": "white"
                        }
                    ],
                    "currentPlayer": "white"
                },
                "moves": [
                    {
                        "from": "d4",
                        "to": "g7",
                        "caption": "Diagonal: d4 → e5 → f6 → g7.",
                        "forbidden": [
                            "d5"
                        ]
                    },
                    {
                        "from": "a7",
                        "to": "a6",
                        "caption": "É o turno das pretas."
                    },
                    {
                        "from": "g7",
                        "to": "e5",
                        "caption": "O bispo continua na mesma cor de casa ao voltar pela diagonal."
                    }
                ]
            },
            "exercises": [
                {
                    "id": "bishop-diagonal",
                    "type": "move",
                    "title": "Leve o bispo de d4 para g7.",
                    "objective": "Leve o bispo de d4 para g7.",
                    "position": {
                        "pieces": [
                            {
                                "square": "a1",
                                "type": "k",
                                "color": "white"
                            },
                            {
                                "square": "h7",
                                "type": "k",
                                "color": "black"
                            },
                            {
                                "square": "a7",
                                "type": "p",
                                "color": "black"
                            },
                            {
                                "square": "d4",
                                "type": "b",
                                "color": "white"
                            }
                        ],
                        "currentPlayer": "white"
                    },
                    "target": "g7",
                    "instructions": "Selecione a peça e depois o destino. Apenas uma jogada legal que cumpra o objetivo será aceita.",
                    "solution": [
                        {
                            "from": "d4",
                            "to": "g7"
                        }
                    ],
                    "hint": "Siga a diagonal que passa por e5 e f6.",
                    "feedback": {
                        "correct": "Correto! Você cumpriu o objetivo com uma jogada legal.",
                        "incorrect": "A resposta ainda não cumpre o objetivo. O exercício foi preservado; observe o tabuleiro e tente novamente.",
                        "illegal": "Essa jogada é ilegal. Seu rei precisa ficar seguro e a peça deve respeitar seus movimentos. O estado do exercício foi preservado."
                    },
                    "completion": {
                        "type": "solution-sequence"
                    }
                }
            ],
            "completion": {
                "type": "all-exercises"
            }
        },
        {
            "id": "queen",
            "title": "8. Movimento da dama",
            "description": "A dama combina os movimentos da torre e do bispo: horizontal, vertical e diagonal.",
            "objective": "8. Movimento da dama",
            "explanation": [
                "A dama combina os movimentos da torre e do bispo: horizontal, vertical e diagonal.",
                "Pode percorrer várias casas livres, mas não salta peças, não faz o L do cavalo e não captura peças da própria cor.",
                "Ser uma peça poderosa não permite ignorar a segurança do rei. Os destinos destacados são sempre os que o motor considera legais."
            ],
            "demo": {
                "position": {
                    "pieces": [
                        {
                            "square": "a1",
                            "type": "k",
                            "color": "white"
                        },
                        {
                            "square": "h7",
                            "type": "k",
                            "color": "black"
                        },
                        {
                            "square": "a7",
                            "type": "p",
                            "color": "black"
                        },
                        {
                            "square": "d4",
                            "type": "q",
                            "color": "white"
                        }
                    ],
                    "currentPlayer": "white"
                },
                "moves": [
                    {
                        "from": "d4",
                        "to": "d6",
                        "caption": "Vertical: a dama permanece na coluna d.",
                        "forbidden": [
                            "e6"
                        ]
                    },
                    {
                        "from": "a7",
                        "to": "a6",
                        "caption": "As pretas jogam."
                    },
                    {
                        "from": "d6",
                        "to": "f6",
                        "caption": "Horizontal: permanece na fileira 6."
                    },
                    {
                        "from": "a6",
                        "to": "a5",
                        "caption": "Novo turno das pretas."
                    },
                    {
                        "from": "f6",
                        "to": "h4",
                        "caption": "Diagonal: uma direção que a torre não poderia usar."
                    }
                ]
            },
            "exercises": [
                {
                    "id": "queen-diagonal",
                    "type": "move",
                    "title": "Mova a dama de d4 para f6.",
                    "objective": "Mova a dama de d4 para f6.",
                    "position": {
                        "pieces": [
                            {
                                "square": "a1",
                                "type": "k",
                                "color": "white"
                            },
                            {
                                "square": "h7",
                                "type": "k",
                                "color": "black"
                            },
                            {
                                "square": "a7",
                                "type": "p",
                                "color": "black"
                            },
                            {
                                "square": "d4",
                                "type": "q",
                                "color": "white"
                            }
                        ],
                        "currentPlayer": "white"
                    },
                    "target": "f6",
                    "instructions": "Selecione a peça e depois o destino. Apenas uma jogada legal que cumpra o objetivo será aceita.",
                    "solution": [
                        {
                            "from": "d4",
                            "to": "f6"
                        }
                    ],
                    "hint": "A diagonal sobe duas fileiras e avança duas colunas.",
                    "feedback": {
                        "correct": "Correto! Você cumpriu o objetivo com uma jogada legal.",
                        "incorrect": "A resposta ainda não cumpre o objetivo. O exercício foi preservado; observe o tabuleiro e tente novamente.",
                        "illegal": "Essa jogada é ilegal. Seu rei precisa ficar seguro e a peça deve respeitar seus movimentos. O estado do exercício foi preservado."
                    },
                    "completion": {
                        "type": "solution-sequence"
                    }
                }
            ],
            "completion": {
                "type": "all-exercises"
            }
        },
        {
            "id": "king",
            "title": "9. Movimento do rei",
            "description": "O rei anda uma casa em qualquer direção, quando o destino é seguro.",
            "objective": "9. Movimento do rei",
            "explanation": [
                "O rei anda uma casa em qualquer direção, quando o destino é seguro.",
                "Não pode entrar em uma casa atacada nem ficar ao lado do rei adversário. Dois reis nunca podem ocupar casas vizinhas.",
                "Um movimento de duas casas só pode acontecer no roque e sob suas condições especiais. No exercício, observe a torre preta que ataca a coluna b."
            ],
            "demo": {
                "position": {
                    "pieces": [
                        {
                            "square": "a1",
                            "type": "k",
                            "color": "white"
                        },
                        {
                            "square": "h8",
                            "type": "k",
                            "color": "black"
                        },
                        {
                            "square": "d2",
                            "type": "r",
                            "color": "white"
                        },
                        {
                            "square": "a7",
                            "type": "p",
                            "color": "black"
                        }
                    ],
                    "currentPlayer": "white"
                },
                "moves": [
                    {
                        "from": "a1",
                        "to": "b2",
                        "caption": "Uma casa na diagonal, em segurança.",
                        "forbidden": [
                            "c1"
                        ]
                    },
                    {
                        "from": "a7",
                        "to": "a6",
                        "caption": "As pretas jogam."
                    },
                    {
                        "from": "b2",
                        "to": "c2",
                        "caption": "Uma casa na horizontal."
                    },
                    {
                        "from": "a6",
                        "to": "a5",
                        "caption": "As pretas jogam novamente."
                    },
                    {
                        "from": "c2",
                        "to": "c3",
                        "caption": "Uma casa na vertical."
                    },
                    {
                        "kind": "observe",
                        "caption": "Outro diagrama: o rei preto em g4 controla f4. O rei branco em e4 não pode ir a f4, pois os reis ficariam vizinhos.",
                        "position": {
                            "pieces": [
                                {
                                    "square": "e4",
                                    "type": "k",
                                    "color": "white"
                                },
                                {
                                    "square": "g4",
                                    "type": "k",
                                    "color": "black"
                                },
                                {
                                    "square": "d2",
                                    "type": "r",
                                    "color": "white"
                                },
                                {
                                    "square": "a7",
                                    "type": "p",
                                    "color": "black"
                                }
                            ],
                            "currentPlayer": "white"
                        },
                        "from": "e4",
                        "highlight": [
                            "e4",
                            "g4"
                        ],
                        "forbidden": [
                            "f4"
                        ]
                    }
                ]
            },
            "exercises": [
                {
                    "id": "safe-king",
                    "type": "move",
                    "title": "Mova o rei de a1 para a2 sem entrar na coluna atacada.",
                    "objective": "Mova o rei de a1 para a2 sem entrar na coluna atacada.",
                    "position": {
                        "pieces": [
                            {
                                "square": "a1",
                                "type": "k",
                                "color": "white"
                            },
                            {
                                "square": "h8",
                                "type": "k",
                                "color": "black"
                            },
                            {
                                "square": "d2",
                                "type": "r",
                                "color": "white"
                            },
                            {
                                "square": "b8",
                                "type": "r",
                                "color": "black"
                            }
                        ],
                        "currentPlayer": "white"
                    },
                    "target": "a2",
                    "instructions": "Selecione a peça e depois o destino. Apenas uma jogada legal que cumpra o objetivo será aceita.",
                    "solution": [
                        {
                            "from": "a1",
                            "to": "a2"
                        }
                    ],
                    "hint": "A torre preta em b8 ataca b2. A casa a2 é segura.",
                    "feedback": {
                        "correct": "Correto! Você cumpriu o objetivo com uma jogada legal.",
                        "incorrect": "A resposta ainda não cumpre o objetivo. O exercício foi preservado; observe o tabuleiro e tente novamente.",
                        "illegal": "Essa jogada é ilegal. Seu rei precisa ficar seguro e a peça deve respeitar seus movimentos. O estado do exercício foi preservado."
                    },
                    "completion": {
                        "type": "solution-sequence"
                    }
                }
            ],
            "completion": {
                "type": "all-exercises"
            }
        },
        {
            "id": "captures",
            "title": "10. Captura de peças",
            "description": "Uma captura legal ocupa a casa da peça adversária e a remove do tabuleiro. É parte da jogada, sem um turno extra.",
            "objective": "10. Captura de peças",
            "explanation": [
                "Uma captura legal ocupa a casa da peça adversária e a remove do tabuleiro. É parte da jogada, sem um turno extra.",
                "Torre, bispo, dama, cavalo e rei capturam usando seus movimentos comuns. O peão captura na diagonal, diferente do avanço.",
                "Não capture uma peça sua nem o rei adversário. Uma captura que deixe seu rei em xeque é proibida."
            ],
            "demo": {
                "position": {
                    "pieces": [
                        {
                            "square": "a1",
                            "type": "k",
                            "color": "white"
                        },
                        {
                            "square": "h8",
                            "type": "k",
                            "color": "black"
                        },
                        {
                            "square": "d4",
                            "type": "r",
                            "color": "white"
                        },
                        {
                            "square": "d6",
                            "type": "n",
                            "color": "black"
                        },
                        {
                            "square": "a7",
                            "type": "p",
                            "color": "black"
                        }
                    ],
                    "currentPlayer": "white"
                },
                "moves": [
                    {
                        "from": "d4",
                        "to": "d6",
                        "caption": "A torre captura o cavalo preto em d6; o cavalo sai do tabuleiro.",
                        "forbidden": [
                            "e5"
                        ]
                    },
                    {
                        "from": "a7",
                        "to": "a6",
                        "caption": "O peão preto avança."
                    },
                    {
                        "from": "d6",
                        "to": "a6",
                        "caption": "A torre captura o peão preto na mesma fileira."
                    }
                ]
            },
            "exercises": [
                {
                    "id": "capture-knight",
                    "type": "move",
                    "title": "Capture o cavalo preto em d6 com a torre de d4.",
                    "objective": "Capture o cavalo preto em d6 com a torre de d4.",
                    "position": {
                        "pieces": [
                            {
                                "square": "a1",
                                "type": "k",
                                "color": "white"
                            },
                            {
                                "square": "h8",
                                "type": "k",
                                "color": "black"
                            },
                            {
                                "square": "d4",
                                "type": "r",
                                "color": "white"
                            },
                            {
                                "square": "d6",
                                "type": "n",
                                "color": "black"
                            },
                            {
                                "square": "a7",
                                "type": "p",
                                "color": "black"
                            }
                        ],
                        "currentPlayer": "white"
                    },
                    "target": "d6",
                    "instructions": "Selecione a peça e depois o destino. Apenas uma jogada legal que cumpra o objetivo será aceita.",
                    "solution": [
                        {
                            "from": "d4",
                            "to": "d6"
                        }
                    ],
                    "hint": "A coluna d está livre até o cavalo. Ele deve ser removido após a captura.",
                    "feedback": {
                        "correct": "Correto! Você cumpriu o objetivo com uma jogada legal.",
                        "incorrect": "A resposta ainda não cumpre o objetivo. O exercício foi preservado; observe o tabuleiro e tente novamente.",
                        "illegal": "Essa jogada é ilegal. Seu rei precisa ficar seguro e a peça deve respeitar seus movimentos. O estado do exercício foi preservado."
                    },
                    "completion": {
                        "type": "solution-sequence"
                    }
                }
            ],
            "completion": {
                "type": "all-exercises"
            }
        },
        {
            "id": "check",
            "title": "11. Xeque e xeque-mate",
            "description": "Xeque é um ataque ao rei. A próxima jogada precisa resolver o ataque: mover o rei, capturar a peça atacante ou bloquear a linha, quando possível.",
            "objective": "11. Xeque e xeque-mate",
            "explanation": [
                "Xeque é um ataque ao rei. A próxima jogada precisa resolver o ataque: mover o rei, capturar a peça atacante ou bloquear a linha, quando possível.",
                "Você não pode ignorar um xeque ou fazer uma jogada que deixe seu rei atacado. Um ataque do cavalo não pode ser bloqueado por uma peça no meio.",
                "Xeque-mate é xeque sem nenhuma defesa legal. Compare a saída da coluna e com o mate de dama apoiada por bispo."
            ],
            "demo": {
                "position": {
                    "pieces": [
                        {
                            "square": "e1",
                            "type": "k",
                            "color": "white"
                        },
                        {
                            "square": "a8",
                            "type": "k",
                            "color": "black"
                        },
                        {
                            "square": "e8",
                            "type": "r",
                            "color": "black"
                        },
                        {
                            "square": "h1",
                            "type": "r",
                            "color": "white"
                        }
                    ],
                    "currentPlayer": "white"
                },
                "moves": [
                    {
                        "kind": "observe",
                        "caption": "O rei branco em e1 está em xeque pela torre preta em e8.",
                        "highlight": [
                            "e1",
                            "e8"
                        ],
                        "from": "e1",
                        "forbidden": [
                            "e2"
                        ]
                    },
                    {
                        "from": "e1",
                        "to": "d1",
                        "caption": "O rei sai da coluna atacada. A jogada resolve o xeque."
                    },
                    {
                        "kind": "observe",
                        "caption": "Outro diagrama: a dama em h5 e o bispo em c4 cooperam contra o rei preto.",
                        "highlight": [
                            "h5",
                            "c4",
                            "e8"
                        ],
                        "position": {
                            "standard": true,
                            "setup": [
                                {
                                    "from": "e2",
                                    "to": "e4"
                                },
                                {
                                    "from": "e7",
                                    "to": "e5"
                                },
                                {
                                    "from": "f1",
                                    "to": "c4"
                                },
                                {
                                    "from": "b8",
                                    "to": "c6"
                                },
                                {
                                    "from": "d1",
                                    "to": "h5"
                                },
                                {
                                    "from": "g8",
                                    "to": "f6"
                                }
                            ]
                        }
                    },
                    {
                        "from": "h5",
                        "to": "f7",
                        "caption": "Outro diagrama: a dama captura f7 apoiada pelo bispo e dá mate."
                    }
                ]
            },
            "exercises": [
                {
                    "id": "escape-check",
                    "type": "move",
                    "title": "Defenda o rei branco do xeque com uma jogada legal.",
                    "objective": "Defenda o rei branco do xeque com uma jogada legal.",
                    "position": {
                        "pieces": [
                            {
                                "square": "e1",
                                "type": "k",
                                "color": "white"
                            },
                            {
                                "square": "a8",
                                "type": "k",
                                "color": "black"
                            },
                            {
                                "square": "e8",
                                "type": "r",
                                "color": "black"
                            },
                            {
                                "square": "h1",
                                "type": "r",
                                "color": "white"
                            }
                        ],
                        "currentPlayer": "white"
                    },
                    "target": null,
                    "instructions": "Selecione a peça e depois o destino. Apenas uma jogada legal que cumpra o objetivo será aceita.",
                    "solution": [
                        {
                            "from": "e1",
                            "to": "d1"
                        }
                    ],
                    "hint": "Saia da coluna e para uma casa não atacada.",
                    "feedback": {
                        "correct": "Correto! Seu rei não está mais em xeque.",
                        "incorrect": "A jogada não resolveu o xeque. Observe a linha da torre.",
                        "illegal": "Essa jogada é ilegal. Seu rei precisa ficar seguro e a peça deve respeitar seus movimentos. O estado do exercício foi preservado."
                    },
                    "completion": {
                        "type": "solution-sequence"
                    },
                    "criterion": {
                        "type": "resolve-check",
                        "color": "white"
                    }
                },
                {
                    "id": "mate-in-one",
                    "type": "move",
                    "title": "Encontre um xeque-mate em uma jogada.",
                    "objective": "Encontre um xeque-mate em uma jogada.",
                    "position": {
                        "standard": true,
                        "setup": [
                            {
                                "from": "e2",
                                "to": "e4"
                            },
                            {
                                "from": "e7",
                                "to": "e5"
                            },
                            {
                                "from": "f1",
                                "to": "c4"
                            },
                            {
                                "from": "b8",
                                "to": "c6"
                            },
                            {
                                "from": "d1",
                                "to": "h5"
                            },
                            {
                                "from": "g8",
                                "to": "f6"
                            }
                        ]
                    },
                    "target": null,
                    "instructions": "Selecione a peça e depois o destino. Apenas uma jogada legal que cumpra o objetivo será aceita.",
                    "solution": [
                        {
                            "from": "h5",
                            "to": "f7"
                        }
                    ],
                    "hint": "A dama pode capturar f7 com proteção do bispo de c4.",
                    "feedback": {
                        "correct": "Correto! O motor confirmou xeque-mate.",
                        "incorrect": "Essa jogada é legal, mas não dá xeque-mate. Tente outra sem alterar a posição.",
                        "illegal": "Essa jogada é ilegal. Seu rei precisa ficar seguro e a peça deve respeitar seus movimentos. O estado do exercício foi preservado."
                    },
                    "completion": {
                        "type": "solution-sequence"
                    },
                    "criterion": {
                        "type": "checkmate"
                    }
                }
            ],
            "completion": {
                "type": "all-exercises"
            }
        },
        {
            "id": "castling",
            "title": "12. Roque",
            "description": "No roque o rei anda duas casas em direção à torre, que passa para a casa atravessada pelo rei. É uma única jogada.",
            "objective": "12. Roque",
            "explanation": [
                "No roque o rei anda duas casas em direção à torre, que passa para a casa atravessada pelo rei. É uma única jogada.",
                "Rei e torre escolhida não podem ter se movido; todas as casas entre eles precisam estar livres. O rei não pode estar em xeque, atravessar uma casa atacada ou terminar em xeque.",
                "A torre estar atacada não impede, por si só, o roque. No roque longo, b1 deve estar livre, mas o rei só atravessa d1 e termina em c1; ele não passa por b1.",
                "Se o rei ou a torre se moverem e voltarem, o direito perdido não retorna. Faça a jogada selecionando o rei."
            ],
            "demo": {
                "position": {
                    "pieces": [
                        {
                            "square": "e1",
                            "type": "k",
                            "color": "white"
                        },
                        {
                            "square": "h1",
                            "type": "r",
                            "color": "white"
                        },
                        {
                            "square": "a8",
                            "type": "k",
                            "color": "black"
                        },
                        {
                            "square": "a7",
                            "type": "p",
                            "color": "black"
                        }
                    ],
                    "currentPlayer": "white",
                    "castlingRights": {
                        "white": {
                            "king": true,
                            "queen": false
                        },
                        "black": {
                            "king": false,
                            "queen": false
                        }
                    }
                },
                "moves": [
                    {
                        "from": "e1",
                        "to": "g1",
                        "caption": "Roque curto: rei e1 → g1 e torre h1 → f1."
                    },
                    {
                        "kind": "observe",
                        "caption": "Outro diagrama: o caminho do roque longo está livre entre rei e torre.",
                        "highlight": [
                            "e1",
                            "a1",
                            "d1",
                            "c1"
                        ],
                        "position": {
                            "pieces": [
                                {
                                    "square": "e1",
                                    "type": "k",
                                    "color": "white"
                                },
                                {
                                    "square": "a1",
                                    "type": "r",
                                    "color": "white"
                                },
                                {
                                    "square": "h8",
                                    "type": "k",
                                    "color": "black"
                                },
                                {
                                    "square": "h7",
                                    "type": "p",
                                    "color": "black"
                                }
                            ],
                            "currentPlayer": "white",
                            "castlingRights": {
                                "white": {
                                    "king": false,
                                    "queen": true
                                },
                                "black": {
                                    "king": false,
                                    "queen": false
                                }
                            }
                        }
                    },
                    {
                        "from": "e1",
                        "to": "c1",
                        "caption": "Outro diagrama: roque longo, rei e1 → c1 e torre a1 → d1."
                    },
                    {
                        "kind": "observe",
                        "caption": "Outro diagrama: em xeque pela torre de e8, o rei não pode rocar.",
                        "highlight": [
                            "e1",
                            "e8"
                        ],
                        "position": {
                            "pieces": [
                                {
                                    "square": "e1",
                                    "type": "k",
                                    "color": "white"
                                },
                                {
                                    "square": "h1",
                                    "type": "r",
                                    "color": "white"
                                },
                                {
                                    "square": "a8",
                                    "type": "k",
                                    "color": "black"
                                },
                                {
                                    "square": "e8",
                                    "type": "r",
                                    "color": "black"
                                }
                            ],
                            "currentPlayer": "white",
                            "castlingRights": {
                                "white": {
                                    "king": true,
                                    "queen": false
                                },
                                "black": {
                                    "king": false,
                                    "queen": false
                                }
                            }
                        },
                        "from": "e1",
                        "forbidden": [
                            "g1"
                        ]
                    }
                ]
            },
            "exercises": [
                {
                    "id": "castle-short",
                    "type": "move",
                    "title": "Faça o roque curto das brancas.",
                    "objective": "Faça o roque curto das brancas.",
                    "position": {
                        "pieces": [
                            {
                                "square": "e1",
                                "type": "k",
                                "color": "white"
                            },
                            {
                                "square": "h1",
                                "type": "r",
                                "color": "white"
                            },
                            {
                                "square": "a8",
                                "type": "k",
                                "color": "black"
                            },
                            {
                                "square": "a7",
                                "type": "p",
                                "color": "black"
                            }
                        ],
                        "currentPlayer": "white",
                        "castlingRights": {
                            "white": {
                                "king": true,
                                "queen": false
                            },
                            "black": {
                                "king": false,
                                "queen": false
                            }
                        }
                    },
                    "target": "g1",
                    "instructions": "Selecione a peça e depois o destino. Apenas uma jogada legal que cumpra o objetivo será aceita.",
                    "solution": [
                        {
                            "from": "e1",
                            "to": "g1"
                        }
                    ],
                    "hint": "Selecione o rei em e1 e depois g1. A torre se move junto.",
                    "feedback": {
                        "correct": "Correto! Você cumpriu o objetivo com uma jogada legal.",
                        "incorrect": "A resposta ainda não cumpre o objetivo. O exercício foi preservado; observe o tabuleiro e tente novamente.",
                        "illegal": "Essa jogada é ilegal. Seu rei precisa ficar seguro e a peça deve respeitar seus movimentos. O estado do exercício foi preservado."
                    },
                    "completion": {
                        "type": "solution-sequence"
                    }
                },
                {
                    "id": "castle-long",
                    "type": "move",
                    "title": "Faça o roque longo das brancas.",
                    "objective": "Faça o roque longo das brancas.",
                    "position": {
                        "pieces": [
                            {
                                "square": "e1",
                                "type": "k",
                                "color": "white"
                            },
                            {
                                "square": "a1",
                                "type": "r",
                                "color": "white"
                            },
                            {
                                "square": "h8",
                                "type": "k",
                                "color": "black"
                            },
                            {
                                "square": "h7",
                                "type": "p",
                                "color": "black"
                            }
                        ],
                        "currentPlayer": "white",
                        "castlingRights": {
                            "white": {
                                "king": false,
                                "queen": true
                            },
                            "black": {
                                "king": false,
                                "queen": false
                            }
                        }
                    },
                    "target": "c1",
                    "instructions": "Selecione a peça e depois o destino. Apenas uma jogada legal que cumpra o objetivo será aceita.",
                    "solution": [
                        {
                            "from": "e1",
                            "to": "c1"
                        }
                    ],
                    "hint": "Selecione o rei em e1 e depois c1; a torre vai para d1.",
                    "feedback": {
                        "correct": "Correto! Você cumpriu o objetivo com uma jogada legal.",
                        "incorrect": "A resposta ainda não cumpre o objetivo. O exercício foi preservado; observe o tabuleiro e tente novamente.",
                        "illegal": "Essa jogada é ilegal. Seu rei precisa ficar seguro e a peça deve respeitar seus movimentos. O estado do exercício foi preservado."
                    },
                    "completion": {
                        "type": "solution-sequence"
                    }
                }
            ],
            "completion": {
                "type": "all-exercises"
            }
        },
        {
            "id": "en-passant",
            "title": "13. Captura en passant",
            "description": "Um peão que chega à quinta fileira das brancas (ou quarta das pretas) pode capturar en passant um peão adversário adjacente que acabou de avançar duas casas.",
            "objective": "13. Captura en passant",
            "explanation": [
                "Um peão que chega à quinta fileira das brancas (ou quarta das pretas) pode capturar en passant um peão adversário adjacente que acabou de avançar duas casas.",
                "A captura só pode acontecer imediatamente na jogada seguinte. O capturador vai à casa que o peão atravessou, e o peão adversário é retirado da casa ao lado.",
                "Não basta encontrar dois peões lado a lado: o avanço duplo precisa ter acabado de ocorrer e a captura não pode deixar seu rei em xeque.",
                "Neste exemplo, d7 → d5 cria a oportunidade e e5 → d6 realiza a captura."
            ],
            "demo": {
                "position": {
                    "pieces": [
                        {
                            "square": "a1",
                            "type": "k",
                            "color": "white"
                        },
                        {
                            "square": "h8",
                            "type": "k",
                            "color": "black"
                        },
                        {
                            "square": "e5",
                            "type": "p",
                            "color": "white"
                        },
                        {
                            "square": "d7",
                            "type": "p",
                            "color": "black"
                        }
                    ],
                    "currentPlayer": "black"
                },
                "moves": [
                    {
                        "from": "d7",
                        "to": "d5",
                        "caption": "O peão preto acaba de avançar duas casas. A oportunidade agora existe."
                    },
                    {
                        "from": "e5",
                        "to": "d6",
                        "caption": "En passant: o peão branco vai a d6 e remove o peão preto de d5."
                    }
                ]
            },
            "exercises": [
                {
                    "id": "ep-capture",
                    "type": "move",
                    "title": "Capture en passant: e5 → d6.",
                    "objective": "Capture en passant: e5 → d6.",
                    "position": {
                        "pieces": [
                            {
                                "square": "a1",
                                "type": "k",
                                "color": "white"
                            },
                            {
                                "square": "h8",
                                "type": "k",
                                "color": "black"
                            },
                            {
                                "square": "e5",
                                "type": "p",
                                "color": "white"
                            },
                            {
                                "square": "d7",
                                "type": "p",
                                "color": "black"
                            }
                        ],
                        "currentPlayer": "black",
                        "setup": [
                            {
                                "from": "d7",
                                "to": "d5"
                            }
                        ]
                    },
                    "target": "d6",
                    "instructions": "Selecione a peça e depois o destino. Apenas uma jogada legal que cumpra o objetivo será aceita.",
                    "solution": [
                        {
                            "from": "e5",
                            "to": "d6"
                        }
                    ],
                    "hint": "O histórico já contém d7 → d5. Capture agora na casa d6.",
                    "feedback": {
                        "correct": "Correto! Você cumpriu o objetivo com uma jogada legal.",
                        "incorrect": "A resposta ainda não cumpre o objetivo. O exercício foi preservado; observe o tabuleiro e tente novamente.",
                        "illegal": "Essa jogada é ilegal. Seu rei precisa ficar seguro e a peça deve respeitar seus movimentos. O estado do exercício foi preservado."
                    },
                    "completion": {
                        "type": "solution-sequence"
                    }
                }
            ],
            "completion": {
                "type": "all-exercises"
            }
        },
        {
            "id": "promotion",
            "title": "14. Promoção do peão",
            "description": "Ao chegar à última fileira, o peão deve ser trocado por dama, torre, bispo ou cavalo da mesma cor. A escolha faz parte da jogada.",
            "objective": "14. Promoção do peão",
            "explanation": [
                "Ao chegar à última fileira, o peão deve ser trocado por dama, torre, bispo ou cavalo da mesma cor. A escolha faz parte da jogada.",
                "Não é permitido promover a rei nem manter o peão na última fileira. Você pode escolher uma peça que nunca tenha sido capturada.",
                "A nova peça atua imediatamente. A dama é frequente, mas um cavalo ou outra peça pode ser melhor em certas posições.",
                "No exercício, selecione a peça no controle de promoção antes de confirmar o destino."
            ],
            "demo": {
                "position": {
                    "pieces": [
                        {
                            "square": "a1",
                            "type": "k",
                            "color": "white"
                        },
                        {
                            "square": "a8",
                            "type": "k",
                            "color": "black"
                        },
                        {
                            "square": "g7",
                            "type": "p",
                            "color": "white"
                        },
                        {
                            "square": "d2",
                            "type": "r",
                            "color": "white"
                        }
                    ],
                    "currentPlayer": "white"
                },
                "moves": [
                    {
                        "from": "g7",
                        "to": "g8",
                        "caption": "O peão chega a g8 e vira dama imediatamente.",
                        "promotion": "q"
                    },
                    {
                        "kind": "observe",
                        "caption": "Voltamos a um diagrama com o peão em g7. Agora a escolha será cavalo.",
                        "highlight": [
                            "g7",
                            "g8"
                        ],
                        "position": {
                            "pieces": [
                                {
                                    "square": "a1",
                                    "type": "k",
                                    "color": "white"
                                },
                                {
                                    "square": "a8",
                                    "type": "k",
                                    "color": "black"
                                },
                                {
                                    "square": "g7",
                                    "type": "p",
                                    "color": "white"
                                },
                                {
                                    "square": "d2",
                                    "type": "r",
                                    "color": "white"
                                }
                            ],
                            "currentPlayer": "white"
                        }
                    },
                    {
                        "from": "g7",
                        "to": "g8",
                        "caption": "Outro diagrama: a mesma promoção pode escolher cavalo.",
                        "promotion": "n"
                    }
                ]
            },
            "exercises": [
                {
                    "id": "promote-queen",
                    "type": "move",
                    "title": "Promova o peão de g7 a g8 escolhendo dama.",
                    "objective": "Promova o peão de g7 a g8 escolhendo dama.",
                    "position": {
                        "pieces": [
                            {
                                "square": "a1",
                                "type": "k",
                                "color": "white"
                            },
                            {
                                "square": "a8",
                                "type": "k",
                                "color": "black"
                            },
                            {
                                "square": "g7",
                                "type": "p",
                                "color": "white"
                            },
                            {
                                "square": "d2",
                                "type": "r",
                                "color": "white"
                            }
                        ],
                        "currentPlayer": "white"
                    },
                    "target": "g8",
                    "instructions": "Selecione a peça e depois o destino. Apenas uma jogada legal que cumpra o objetivo será aceita.",
                    "solution": [
                        {
                            "from": "g7",
                            "to": "g8",
                            "promotion": "q"
                        }
                    ],
                    "hint": "Após selecionar o peão, escolha Dama e confirme g8.",
                    "feedback": {
                        "correct": "Correto! Você cumpriu o objetivo com uma jogada legal.",
                        "incorrect": "A resposta ainda não cumpre o objetivo. O exercício foi preservado; observe o tabuleiro e tente novamente.",
                        "illegal": "Essa jogada é ilegal. Seu rei precisa ficar seguro e a peça deve respeitar seus movimentos. O estado do exercício foi preservado."
                    },
                    "completion": {
                        "type": "solution-sequence"
                    },
                    "promotion": "q"
                },
                {
                    "id": "promote-knight",
                    "type": "move",
                    "title": "Promova o peão de g7 a g8 escolhendo cavalo.",
                    "objective": "Promova o peão de g7 a g8 escolhendo cavalo.",
                    "position": {
                        "pieces": [
                            {
                                "square": "a1",
                                "type": "k",
                                "color": "white"
                            },
                            {
                                "square": "a8",
                                "type": "k",
                                "color": "black"
                            },
                            {
                                "square": "g7",
                                "type": "p",
                                "color": "white"
                            },
                            {
                                "square": "d2",
                                "type": "r",
                                "color": "white"
                            }
                        ],
                        "currentPlayer": "white"
                    },
                    "target": "g8",
                    "instructions": "Selecione a peça e depois o destino. Apenas uma jogada legal que cumpra o objetivo será aceita.",
                    "solution": [
                        {
                            "from": "g7",
                            "to": "g8",
                            "promotion": "n"
                        }
                    ],
                    "hint": "Use a opção Cavalo no controle de promoção.",
                    "feedback": {
                        "correct": "Correto! Você cumpriu o objetivo com uma jogada legal.",
                        "incorrect": "A resposta ainda não cumpre o objetivo. O exercício foi preservado; observe o tabuleiro e tente novamente.",
                        "illegal": "Essa jogada é ilegal. Seu rei precisa ficar seguro e a peça deve respeitar seus movimentos. O estado do exercício foi preservado."
                    },
                    "completion": {
                        "type": "solution-sequence"
                    },
                    "promotion": "n"
                }
            ],
            "completion": {
                "type": "all-exercises"
            }
        },
        {
            "id": "draws",
            "title": "15. Empate e afogamento",
            "description": "Afogamento é quando o jogador da vez não está em xeque, mas não tem nenhuma jogada legal. É empate; se estiver em xeque sem defesa, é mate.",
            "objective": "15. Empate e afogamento",
            "explanation": [
                "Afogamento é quando o jogador da vez não está em xeque, mas não tem nenhuma jogada legal. É empate; se estiver em xeque sem defesa, é mate.",
                "Uma posição morta também é empate: nenhum dos lados pode dar mate por qualquer sequência legal. Apenas dois reis é um exemplo. Não conseguir forçar mate não prova que uma posição seja morta.",
                "Três repetições da mesma posição ou 50 lances de cada jogador sem mover peão nem capturar permitem reivindicar empate. Não encerram automaticamente. Repetição considera turno, peças, roque e possibilidade efetiva de en passant.",
                "Cinco repetições ou 75 lances de cada jogador nessas condições encerram automaticamente. Se a última jogada der mate, o mate tem precedência sobre 75 lances.",
                "As posições de contador são diagramas de estudo. O contador representa meias-jogadas: 100 corresponde a 50 lances de cada jogador e 150 corresponde a 75.",
                "O jogo reconhece classes certificadas de posições mortas, mas ainda não detecta todas as fortalezas arbitrárias. Empate por acordo existe no xadrez; esta interface não oferece negociação nem relógio."
            ],
            "demo": {
                "position": {
                    "pieces": [
                        {
                            "square": "c6",
                            "type": "k",
                            "color": "white"
                        },
                        {
                            "square": "a8",
                            "type": "k",
                            "color": "black"
                        },
                        {
                            "square": "c7",
                            "type": "q",
                            "color": "white"
                        }
                    ],
                    "currentPlayer": "white"
                },
                "moves": [
                    {
                        "from": "c7",
                        "to": "b6",
                        "caption": "A dama vai a b6: as pretas não estão em xeque, mas não podem jogar. Afogamento."
                    },
                    {
                        "kind": "observe",
                        "caption": "Outro diagrama: apenas reis; nenhum mate pode ocorrer.",
                        "highlight": [
                            "a1",
                            "h8"
                        ],
                        "position": {
                            "pieces": [
                                {
                                    "square": "a1",
                                    "type": "k",
                                    "color": "white"
                                },
                                {
                                    "square": "h8",
                                    "type": "k",
                                    "color": "black"
                                }
                            ],
                            "currentPlayer": "white"
                        }
                    },
                    {
                        "kind": "observe",
                        "caption": "Outro exemplo: três posições iguais permitem reivindicação, sem encerramento automático.",
                        "highlight": [
                            "g1",
                            "g8"
                        ],
                        "position": {
                            "standard": true,
                            "setup": [
                                {
                                    "from": "g1",
                                    "to": "f3"
                                },
                                {
                                    "from": "g8",
                                    "to": "f6"
                                },
                                {
                                    "from": "f3",
                                    "to": "g1"
                                },
                                {
                                    "from": "f6",
                                    "to": "g8"
                                },
                                {
                                    "from": "g1",
                                    "to": "f3"
                                },
                                {
                                    "from": "g8",
                                    "to": "f6"
                                },
                                {
                                    "from": "f3",
                                    "to": "g1"
                                },
                                {
                                    "from": "f6",
                                    "to": "g8"
                                }
                            ]
                        }
                    },
                    {
                        "kind": "observe",
                        "caption": "Diagrama com contador 100: 50 lances permitem reivindicar.",
                        "highlight": [
                            "d4"
                        ],
                        "position": {
                            "pieces": [
                                {
                                    "square": "a1",
                                    "type": "k",
                                    "color": "white"
                                },
                                {
                                    "square": "h8",
                                    "type": "k",
                                    "color": "black"
                                },
                                {
                                    "square": "d4",
                                    "type": "r",
                                    "color": "white"
                                }
                            ],
                            "currentPlayer": "white",
                            "halfmoveClock": 100
                        }
                    },
                    {
                        "kind": "observe",
                        "caption": "Após cinco repetições o empate é automático.",
                        "highlight": [
                            "g1",
                            "g8"
                        ],
                        "position": {
                            "standard": true,
                            "setup": [
                                {
                                    "from": "g1",
                                    "to": "f3"
                                },
                                {
                                    "from": "g8",
                                    "to": "f6"
                                },
                                {
                                    "from": "f3",
                                    "to": "g1"
                                },
                                {
                                    "from": "f6",
                                    "to": "g8"
                                },
                                {
                                    "from": "g1",
                                    "to": "f3"
                                },
                                {
                                    "from": "g8",
                                    "to": "f6"
                                },
                                {
                                    "from": "f3",
                                    "to": "g1"
                                },
                                {
                                    "from": "f6",
                                    "to": "g8"
                                },
                                {
                                    "from": "g1",
                                    "to": "f3"
                                },
                                {
                                    "from": "g8",
                                    "to": "f6"
                                },
                                {
                                    "from": "f3",
                                    "to": "g1"
                                },
                                {
                                    "from": "f6",
                                    "to": "g8"
                                },
                                {
                                    "from": "g1",
                                    "to": "f3"
                                },
                                {
                                    "from": "g8",
                                    "to": "f6"
                                },
                                {
                                    "from": "f3",
                                    "to": "g1"
                                },
                                {
                                    "from": "f6",
                                    "to": "g8"
                                }
                            ]
                        }
                    },
                    {
                        "kind": "observe",
                        "caption": "Contador 150: a última jogada encerrou por 75 lances, sem mate.",
                        "highlight": [
                            "d5"
                        ],
                        "position": {
                            "pieces": [
                                {
                                    "square": "a1",
                                    "type": "k",
                                    "color": "white"
                                },
                                {
                                    "square": "h8",
                                    "type": "k",
                                    "color": "black"
                                },
                                {
                                    "square": "d4",
                                    "type": "r",
                                    "color": "white"
                                }
                            ],
                            "currentPlayer": "white",
                            "halfmoveClock": 149,
                            "setup": [
                                {
                                    "from": "d4",
                                    "to": "d5"
                                }
                            ]
                        }
                    }
                ]
            },
            "exercises": [
                {
                    "id": "recognize-stalemate",
                    "type": "choice",
                    "title": "Qual é a situação deste tabuleiro?",
                    "objective": "Qual é a situação deste tabuleiro?",
                    "position": {
                        "pieces": [
                            {
                                "square": "c6",
                                "type": "k",
                                "color": "white"
                            },
                            {
                                "square": "a8",
                                "type": "k",
                                "color": "black"
                            },
                            {
                                "square": "c7",
                                "type": "q",
                                "color": "white"
                            }
                        ],
                        "currentPlayer": "white",
                        "setup": [
                            {
                                "from": "c7",
                                "to": "b6"
                            }
                        ]
                    },
                    "criterion": {
                        "type": "position-class"
                    },
                    "instructions": "Observe o tabuleiro e escolha uma resposta abaixo. As setas permitem inspecionar as casas sem movimentar peças.",
                    "choices": [
                        {
                            "value": "playing",
                            "label": "Há jogadas legais; a partida continua"
                        },
                        {
                            "value": "checkmate",
                            "label": "Xeque-mate: rei em xeque e sem defesa legal"
                        },
                        {
                            "value": "stalemate",
                            "label": "Afogamento: sem xeque e sem jogada legal"
                        },
                        {
                            "value": "deadPosition",
                            "label": "Posição morta: nenhum mate é possível"
                        }
                    ],
                    "hint": "O rei preto em a8 não está em xeque e não tem destino legal.",
                    "feedback": {
                        "correct": "Correto! A classificação foi confirmada pelo motor.",
                        "incorrect": "A resposta ainda não cumpre o objetivo. O exercício foi preservado; observe o tabuleiro e tente novamente.",
                        "illegal": "Essa jogada é ilegal. Seu rei precisa ficar seguro e a peça deve respeitar seus movimentos. O estado do exercício foi preservado."
                    },
                    "completion": {
                        "type": "engine-condition"
                    }
                },
                {
                    "id": "recognize-dead",
                    "type": "choice",
                    "title": "Qual é a situação com apenas dois reis?",
                    "objective": "Qual é a situação com apenas dois reis?",
                    "position": {
                        "pieces": [
                            {
                                "square": "a1",
                                "type": "k",
                                "color": "white"
                            },
                            {
                                "square": "h8",
                                "type": "k",
                                "color": "black"
                            }
                        ],
                        "currentPlayer": "white"
                    },
                    "criterion": {
                        "type": "position-class"
                    },
                    "instructions": "Observe o tabuleiro e escolha uma resposta abaixo. As setas permitem inspecionar as casas sem movimentar peças.",
                    "choices": [
                        {
                            "value": "playing",
                            "label": "Há jogadas legais; a partida continua"
                        },
                        {
                            "value": "checkmate",
                            "label": "Xeque-mate: rei em xeque e sem defesa legal"
                        },
                        {
                            "value": "stalemate",
                            "label": "Afogamento: sem xeque e sem jogada legal"
                        },
                        {
                            "value": "deadPosition",
                            "label": "Posição morta: nenhum mate é possível"
                        }
                    ],
                    "hint": "Nenhum rei pode dar mate sozinho.",
                    "feedback": {
                        "correct": "Correto! A classificação foi confirmada pelo motor.",
                        "incorrect": "A resposta ainda não cumpre o objetivo. O exercício foi preservado; observe o tabuleiro e tente novamente.",
                        "illegal": "Essa jogada é ilegal. Seu rei precisa ficar seguro e a peça deve respeitar seus movimentos. O estado do exercício foi preservado."
                    },
                    "completion": {
                        "type": "engine-condition"
                    }
                },
                {
                    "id": "recognize-threefold",
                    "type": "choice",
                    "title": "O que três repetições permitem?",
                    "objective": "O que três repetições permitem?",
                    "position": {
                        "standard": true,
                        "setup": [
                            {
                                "from": "g1",
                                "to": "f3"
                            },
                            {
                                "from": "g8",
                                "to": "f6"
                            },
                            {
                                "from": "f3",
                                "to": "g1"
                            },
                            {
                                "from": "f6",
                                "to": "g8"
                            },
                            {
                                "from": "g1",
                                "to": "f3"
                            },
                            {
                                "from": "g8",
                                "to": "f6"
                            },
                            {
                                "from": "f3",
                                "to": "g1"
                            },
                            {
                                "from": "f6",
                                "to": "g8"
                            }
                        ]
                    },
                    "criterion": {
                        "type": "draw-claim",
                        "reason": "threefold"
                    },
                    "instructions": "Observe o tabuleiro e escolha uma resposta abaixo. As setas permitem inspecionar as casas sem movimentar peças.",
                    "choices": [
                        {
                            "value": "threefold",
                            "label": "Permite reivindicar empate; posso continuar"
                        },
                        {
                            "value": "fivefold",
                            "label": "Encerra automaticamente agora"
                        },
                        {
                            "value": "playing",
                            "label": "Não permite nenhuma reivindicação"
                        }
                    ],
                    "hint": "A partida não acabou: o jogador pode reivindicar.",
                    "feedback": {
                        "correct": "Correto! A classificação foi confirmada pelo motor.",
                        "incorrect": "A resposta ainda não cumpre o objetivo. O exercício foi preservado; observe o tabuleiro e tente novamente.",
                        "illegal": "Essa jogada é ilegal. Seu rei precisa ficar seguro e a peça deve respeitar seus movimentos. O estado do exercício foi preservado."
                    },
                    "completion": {
                        "type": "engine-condition"
                    }
                },
                {
                    "id": "recognize-fifty",
                    "type": "choice",
                    "title": "O contador mostra 50 lances de cada jogador. O que isso permite?",
                    "objective": "O contador mostra 50 lances de cada jogador. O que isso permite?",
                    "position": {
                        "pieces": [
                            {
                                "square": "a1",
                                "type": "k",
                                "color": "white"
                            },
                            {
                                "square": "h8",
                                "type": "k",
                                "color": "black"
                            },
                            {
                                "square": "d4",
                                "type": "r",
                                "color": "white"
                            }
                        ],
                        "currentPlayer": "white",
                        "halfmoveClock": 100
                    },
                    "criterion": {
                        "type": "draw-claim",
                        "reason": "fiftyMove"
                    },
                    "instructions": "Observe o tabuleiro e escolha uma resposta abaixo. As setas permitem inspecionar as casas sem movimentar peças.",
                    "choices": [
                        {
                            "value": "fiftyMove",
                            "label": "Permite reivindicar empate; posso continuar"
                        },
                        {
                            "value": "seventyFiveMove",
                            "label": "Encerra automaticamente agora"
                        },
                        {
                            "value": "playing",
                            "label": "Não permite nenhuma reivindicação"
                        }
                    ],
                    "hint": "100 meias-jogadas permitem reivindicar; não é automático.",
                    "feedback": {
                        "correct": "Correto! A classificação foi confirmada pelo motor.",
                        "incorrect": "A resposta ainda não cumpre o objetivo. O exercício foi preservado; observe o tabuleiro e tente novamente.",
                        "illegal": "Essa jogada é ilegal. Seu rei precisa ficar seguro e a peça deve respeitar seus movimentos. O estado do exercício foi preservado."
                    },
                    "completion": {
                        "type": "engine-condition"
                    }
                },
                {
                    "id": "recognize-fivefold",
                    "type": "choice",
                    "title": "O que ocorreu após cinco repetições?",
                    "objective": "O que ocorreu após cinco repetições?",
                    "position": {
                        "standard": true,
                        "setup": [
                            {
                                "from": "g1",
                                "to": "f3"
                            },
                            {
                                "from": "g8",
                                "to": "f6"
                            },
                            {
                                "from": "f3",
                                "to": "g1"
                            },
                            {
                                "from": "f6",
                                "to": "g8"
                            },
                            {
                                "from": "g1",
                                "to": "f3"
                            },
                            {
                                "from": "g8",
                                "to": "f6"
                            },
                            {
                                "from": "f3",
                                "to": "g1"
                            },
                            {
                                "from": "f6",
                                "to": "g8"
                            },
                            {
                                "from": "g1",
                                "to": "f3"
                            },
                            {
                                "from": "g8",
                                "to": "f6"
                            },
                            {
                                "from": "f3",
                                "to": "g1"
                            },
                            {
                                "from": "f6",
                                "to": "g8"
                            },
                            {
                                "from": "g1",
                                "to": "f3"
                            },
                            {
                                "from": "g8",
                                "to": "f6"
                            },
                            {
                                "from": "f3",
                                "to": "g1"
                            },
                            {
                                "from": "f6",
                                "to": "g8"
                            }
                        ]
                    },
                    "criterion": {
                        "type": "position-class"
                    },
                    "instructions": "Observe o tabuleiro e escolha uma resposta abaixo. As setas permitem inspecionar as casas sem movimentar peças.",
                    "choices": [
                        {
                            "value": "threefold",
                            "label": "Três repetições: pode reivindicar empate"
                        },
                        {
                            "value": "fiftyMove",
                            "label": "50 lances: pode reivindicar empate"
                        },
                        {
                            "value": "fivefold",
                            "label": "Cinco repetições: empate automático"
                        },
                        {
                            "value": "seventyFiveMove",
                            "label": "75 lances: empate automático"
                        }
                    ],
                    "hint": "Veja o motivo registrado pelo motor: cinco repetições.",
                    "feedback": {
                        "correct": "Correto! A classificação foi confirmada pelo motor.",
                        "incorrect": "A resposta ainda não cumpre o objetivo. O exercício foi preservado; observe o tabuleiro e tente novamente.",
                        "illegal": "Essa jogada é ilegal. Seu rei precisa ficar seguro e a peça deve respeitar seus movimentos. O estado do exercício foi preservado."
                    },
                    "completion": {
                        "type": "engine-condition"
                    }
                },
                {
                    "id": "recognize-seventyfive",
                    "type": "choice",
                    "title": "O que ocorreu após 75 lances sem peão nem captura?",
                    "objective": "O que ocorreu após 75 lances sem peão nem captura?",
                    "position": {
                        "pieces": [
                            {
                                "square": "a1",
                                "type": "k",
                                "color": "white"
                            },
                            {
                                "square": "h8",
                                "type": "k",
                                "color": "black"
                            },
                            {
                                "square": "d4",
                                "type": "r",
                                "color": "white"
                            }
                        ],
                        "currentPlayer": "white",
                        "halfmoveClock": 149,
                        "setup": [
                            {
                                "from": "d4",
                                "to": "d5"
                            }
                        ]
                    },
                    "criterion": {
                        "type": "position-class"
                    },
                    "instructions": "Observe o tabuleiro e escolha uma resposta abaixo. As setas permitem inspecionar as casas sem movimentar peças.",
                    "choices": [
                        {
                            "value": "threefold",
                            "label": "Três repetições: pode reivindicar empate"
                        },
                        {
                            "value": "fiftyMove",
                            "label": "50 lances: pode reivindicar empate"
                        },
                        {
                            "value": "fivefold",
                            "label": "Cinco repetições: empate automático"
                        },
                        {
                            "value": "seventyFiveMove",
                            "label": "75 lances: empate automático"
                        }
                    ],
                    "hint": "O motor registrou 150 meias-jogadas e encerrou automaticamente.",
                    "feedback": {
                        "correct": "Correto! A classificação foi confirmada pelo motor.",
                        "incorrect": "A resposta ainda não cumpre o objetivo. O exercício foi preservado; observe o tabuleiro e tente novamente.",
                        "illegal": "Essa jogada é ilegal. Seu rei precisa ficar seguro e a peça deve respeitar seus movimentos. O estado do exercício foi preservado."
                    },
                    "completion": {
                        "type": "engine-condition"
                    }
                }
            ],
            "completion": {
                "type": "all-exercises"
            }
        }
    ]
});
})();
