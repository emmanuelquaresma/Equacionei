// Catálogo didático: anos indicam referência de dificuldade, não uma sequência curricular obrigatória.
const MathSubjects = [
    {
        "id": "fracoes",
        "title": "Frações",
        "description": "Aprenda a representar, simplificar e realizar operações com frações.",
        "icon": "½",
        "exercises": [
            {
                "id": "fracoes-simplificar",
                "title": "Simplifique a fração",
                "question": "12/18",
                "answer": "2/3",
                "hint": "Procure um número que divida 12 e 18 ao mesmo tempo.",
                "steps": [
                    "O maior divisor comum de 12 e 18 é 6.",
                    "Dividimos numerador e denominador pelo mesmo número: (12 ÷ 6)/(18 ÷ 6).",
                    "Obtemos 2/3. Como 2 e 3 não têm divisor comum maior que 1, a fração está simplificada."
                ],
                "level": "Inicial",
                "schoolYear": 6,
                "accepted": [
                    "2/3"
                ],
                "format": "Digite a fração simplificada usando /, como 1/2."
            },
            {
                "id": "fracoes-somar",
                "title": "Calcule a soma",
                "question": "2/3 + 1/6",
                "answer": "5/6",
                "hint": "Escreva as duas frações com denominador 6.",
                "steps": [
                    "O menor múltiplo comum de 3 e 6 é 6.",
                    "Multiplicamos numerador e denominador de 2/3 por 2: 2/3 = 4/6.",
                    "Somamos os numeradores e mantemos o denominador: 4/6 + 1/6 = (4 + 1)/6 = 5/6."
                ],
                "level": "Inicial",
                "schoolYear": 6,
                "accepted": [
                    "5/6"
                ],
                "format": "Digite o resultado como fração simplificada, usando /."
            },
            {
                "id": "fracoes-equacao",
                "title": "Encontre o valor de x",
                "question": "x/4 = 6",
                "answer": "x = 24",
                "hint": "Qual operação desfaz a divisão por 4?",
                "steps": [
                    "Multiplicamos os dois lados por 4: 4 × (x/4) = 6 × 4.",
                    "A multiplicação por 4 desfaz a divisão por 4: x = 24.",
                    "Conferimos na equação original: 24/4 = 6."
                ],
                "level": "Inicial",
                "schoolYear": 7,
                "accepted": [
                    "24",
                    "x=24"
                ],
                "format": "Digite o valor de x ou escreva x = valor."
            }
        ]
    },
    {
        "id": "multiplicacao-divisao",
        "title": "Multiplicação e Divisão",
        "description": "Pratique operações, regras de sinais e relações entre multiplicação e divisão.",
        "icon": "× ÷",
        "exercises": [
            {
                "id": "operacoes-produto",
                "title": "Calcule o produto",
                "question": "7 × 8",
                "answer": "56",
                "hint": "Você pode separar 7 em 5 + 2.",
                "steps": [
                    "Decompomos: 7 × 8 = (5 + 2) × 8.",
                    "Calculamos cada parte: 5 × 8 = 40 e 2 × 8 = 16.",
                    "Somamos: 40 + 16 = 56. A operação inversa confirma: 56 ÷ 8 = 7."
                ],
                "level": "Inicial",
                "schoolYear": 5,
                "accepted": [
                    "56"
                ],
                "format": "Digite um número."
            },
            {
                "id": "operacoes-sinais",
                "title": "Observe os sinais",
                "question": "(−6) × 4",
                "answer": "−24",
                "hint": "Um número negativo multiplicado por um positivo dá um resultado negativo.",
                "steps": [
                    "Multiplicamos os valores sem o sinal: 6 × 4 = 24.",
                    "Os fatores têm sinais diferentes; portanto, o produto é negativo.",
                    "Assim, (−6) × 4 = −24."
                ],
                "level": "Inicial",
                "schoolYear": 7,
                "accepted": [
                    "-24"
                ],
                "format": "Digite um número; use - para indicar um valor negativo."
            },
            {
                "id": "operacoes-equacao",
                "title": "Encontre o valor de x",
                "question": "5x = 35",
                "answer": "x = 7",
                "hint": "5x significa 5 × x. Divida os dois lados por 5.",
                "steps": [
                    "Dividimos os dois lados por 5: 5x/5 = 35/5.",
                    "Simplificamos: x = 7.",
                    "Conferimos: 5 × 7 = 35."
                ],
                "level": "Inicial",
                "schoolYear": 7,
                "accepted": [
                    "7",
                    "x=7"
                ],
                "format": "Digite o valor de x ou escreva x = valor."
            }
        ]
    },
    {
        "id": "potenciacao",
        "title": "Potenciação",
        "description": "Entenda potências, expoentes e propriedades fundamentais.",
        "icon": "x²",
        "exercises": [
            {
                "id": "potencias-calculo",
                "title": "Calcule a potência",
                "question": "2⁴",
                "answer": "16",
                "hint": "O expoente indica quantas vezes a base aparece como fator.",
                "steps": [
                    "A base é 2 e o expoente é 4: 2⁴ = 2 × 2 × 2 × 2.",
                    "Multiplicamos: 2 × 2 = 4, depois 4 × 2 = 8.",
                    "Por fim, 8 × 2 = 16. Logo, 2⁴ = 16."
                ],
                "level": "Inicial",
                "schoolYear": 6,
                "accepted": [
                    "16"
                ],
                "format": "Digite o resultado numérico."
            },
            {
                "id": "potencias-produto",
                "title": "Multiplique potências de mesma base",
                "question": "3² × 3³",
                "answer": "3⁵ = 243",
                "hint": "Na multiplicação de potências de mesma base, somamos os expoentes.",
                "steps": [
                    "Mantemos a base 3 e somamos os expoentes: 3² × 3³ = 3²⁺³ = 3⁵.",
                    "Expandimos: 3⁵ = 3 × 3 × 3 × 3 × 3.",
                    "Calculamos: 9 × 27 = 243. Portanto, 3⁵ = 243."
                ],
                "level": "Inicial",
                "schoolYear": 7,
                "choices": [
                    "3⁶ = 729",
                    "6⁵ = 7776",
                    "3⁵ = 243",
                    "3¹ = 3"
                ],
                "correct": 2
            },
            {
                "id": "potencias-raizes",
                "title": "Encontre todas as soluções reais",
                "question": "x² = 49",
                "answer": "x = 7 ou x = −7",
                "hint": "Teste um número positivo e seu oposto. O produto de dois negativos é positivo.",
                "steps": [
                    "Buscamos todos os números reais cujo quadrado é 49.",
                    "O número 7 funciona: 7² = 7 × 7 = 49.",
                    "O número −7 também funciona: (−7)² = (−7) × (−7) = 49.",
                    "Existem duas soluções: x = 7 ou x = −7. A raiz quadrada principal √49 é 7, mas a equação x² = 49 admite os dois valores."
                ],
                "level": "Inicial",
                "schoolYear": 9,
                "choices": [
                    "Somente x = 7",
                    "Somente x = −7",
                    "x = 24,5",
                    "x = 7 ou x = −7"
                ],
                "correct": 3
            }
        ]
    },
    {
        "id": "expressoes-algebricas",
        "title": "Expressões Algébricas",
        "description": "Aprenda a trabalhar com incógnitas, termos semelhantes e propriedade distributiva.",
        "icon": "3x",
        "exercises": [
            {
                "id": "algebra-semelhantes",
                "title": "Reduza os termos semelhantes",
                "question": "3x + 2x",
                "answer": "5x",
                "hint": "Os dois termos têm a mesma parte literal: x.",
                "steps": [
                    "Identificamos os termos semelhantes: 3x e 2x.",
                    "Somamos os coeficientes e mantemos x: (3 + 2)x.",
                    "Como 3 + 2 = 5, o resultado é 5x. Não somamos os expoentes em uma adição."
                ],
                "level": "Inicial",
                "schoolYear": 7,
                "choices": [
                    "5x²",
                    "6x",
                    "5x",
                    "5"
                ],
                "correct": 2
            },
            {
                "id": "algebra-distributiva",
                "title": "Aplique a propriedade distributiva",
                "question": "3(x + 4)",
                "answer": "3x + 12",
                "hint": "Multiplique o 3 por cada termo dentro dos parênteses.",
                "steps": [
                    "Distribuímos o fator 3: 3(x + 4) = 3 × x + 3 × 4.",
                    "Calculamos os produtos: 3 × x = 3x e 3 × 4 = 12.",
                    "Obtemos 3x + 12. Esses termos não são semelhantes e não podem ser somados em um só termo."
                ],
                "level": "Inicial",
                "schoolYear": 7,
                "choices": [
                    "3x + 4",
                    "3x + 12",
                    "7x",
                    "12x"
                ],
                "correct": 1
            },
            {
                "id": "algebra-reduzir",
                "title": "Simplifique a expressão",
                "question": "2x + 5 + 3x − 2",
                "answer": "5x + 3",
                "hint": "Agrupe os termos com x e, separadamente, os números sem x.",
                "steps": [
                    "Reagrupamos, preservando os sinais: (2x + 3x) + (5 − 2).",
                    "Somamos os termos com x: 2x + 3x = 5x.",
                    "Calculamos os números: 5 − 2 = 3.",
                    "A expressão simplificada é 5x + 3."
                ],
                "level": "Inicial",
                "schoolYear": 7,
                "choices": [
                    "5x + 7",
                    "8x",
                    "5x − 3",
                    "5x + 3"
                ],
                "correct": 3
            }
        ]
    }
];
