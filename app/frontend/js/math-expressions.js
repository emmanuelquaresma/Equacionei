/* Somente tokens gerados internamente; nenhum texto do usuário é executado. */
const MathExpressions = (() => {
    const integer = (min, max) => Math.floor(Math.random() * (max-min+1)) + min;
    function calculate(numbers, operators) {
        let total = 0, term = numbers[0], sign = 1;
        operators.forEach((op, i) => {
            const n = numbers[i+1];
            if (op === '*') term *= n;
            else if (op === '/') term /= n;
            else { total += sign * term; sign = op === '+' ? 1 : -1; term = n; }
        });
        return total + sign * term;
    }
    function generate(level, phase = 1) {
        const growth = Math.min(8, Math.max(0, phase - 1));
        const count = level === 'easy' ? integer(1,2) : level === 'medium' ? 3 : 4;
        // Cada divisão escolhe um divisor do termo multiplicativo atual.
        for (;;) {
            const numbers = [integer(2,12 + growth)], operators = [];
            let term = numbers[0];
            for (let i=0;i<count;i++) {
                let op = ['+','-','*','/'][integer(0,3)], n = integer(2,9 + growth);
                if(op === '/') {
                    const divisors = Array.from({length:8},(_,j)=>j+2).filter(d=>term%d===0);
                    if(divisors.length) n = divisors[integer(0,divisors.length-1)];
                    else op = '+';
                }
                operators.push(op); numbers.push(n);
                term = op === '*' ? term*n : op === '/' ? term/n : n;
            }
            const result = calculate(numbers,operators);
            if(level === 'easy' && result < 0) continue;
            return { numbers, operators, result, text: numbers.map((n,i)=>i ? `${({'+':'+','-':'−','*':'×','/':'÷'})[operators[i-1]]} ${n}` : n).join(' ') };
        }
    }
    return { calculate, generate };
})();
