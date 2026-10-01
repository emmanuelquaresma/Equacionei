/* Uma página para todos os assuntos. Respostas são comparadas como dados, nunca executadas. */
(() => {
    const byId = id => document.getElementById(id);
    const subjectId = new URLSearchParams(location.search).get('assunto');
    const subject = MathSubjects.find(item => item.id === subjectId);
    if (!subject) {
        byId('subject-error').hidden = false;
        return;
    }
    const normalize = value => value.trim().toLowerCase().replace(/[−–]/g, '-').replace(/\s+/g, '');
    let index = 0;
    // Estado apenas desta visita; não altera o progresso dos jogos ou do laboratório Python.
    const states = subject.exercises.map(() => ({ answer: '', correct: false, feedback: '', hint: false, solution: false }));
    byId('subject-title').textContent = subject.title;
    document.title = `∑quacionei | ${subject.title}`;

    function disclosure(name, visible) {
        byId(name).hidden = !visible;
        byId(`${name}-toggle`).setAttribute('aria-expanded', String(visible));
    }
    function render(focus = false) {
        const exercise = subject.exercises[index], state = states[index];
        byId('practice').hidden = false;
        byId('summary').hidden = true;
        byId('exercise-position').textContent = `Exercício ${index + 1} de ${subject.exercises.length} · ${exercise.level} · ${exercise.schoolYear}º ano`;
        byId('exercise-title').textContent = exercise.title;
        byId('exercise-question').textContent = exercise.question;
        byId('text-answer').hidden = !!exercise.choices;
        byId('answer').disabled = !!exercise.choices;
        byId('choices').hidden = !exercise.choices;
        byId('answer').value = state.answer;
        byId('answer-format').textContent = exercise.format || '';
        byId('choice-options').replaceChildren();
        (exercise.choices || []).forEach((text, i) => {
            const label = document.createElement('label');
            const radio = document.createElement('input');
            radio.type = 'radio'; radio.name = 'answer-choice'; radio.value = String(i);
            radio.checked = state.answer === String(i);
            radio.setAttribute('aria-describedby', 'feedback');
            const span = document.createElement('span'); span.textContent = text;
            label.append(radio, span);
            byId('choice-options').append(label);
        });
        byId('hint').textContent = exercise.hint;
        byId('solution-steps').replaceChildren(...exercise.steps.map((text, i) => {
            const item = document.createElement('li');
            const title = document.createElement('strong'); title.textContent = `Passo ${i + 1}: `;
            item.append(title, document.createTextNode(text));
            return item;
        }));
        byId('solution-answer').textContent = `Resultado: ${exercise.answer}`;
        disclosure('hint', state.hint);
        disclosure('solution', state.solution);
        feedback(state.feedback, state.correct);
        byId('previous').disabled = index === 0;
        byId('next').textContent = index === subject.exercises.length - 1 ? 'Finalizar →' : 'Próximo →';
        byId('next').setAttribute('aria-label', index === subject.exercises.length - 1 ? 'Finalizar prática' : 'Próximo exercício');
        if (focus) byId('exercise-title').focus();
    }
    function feedback(text, correct) {
        byId('feedback').textContent = text;
        byId('feedback').className = `math-feedback${text ? correct ? ' is-correct' : ' is-wrong' : ''}`;
    }
    byId('answer-form').addEventListener('input', event => {
        states[index].answer = event.target.value;
        states[index].correct = false;
        states[index].feedback = '';
        feedback('', false);
    });
    byId('answer-form').addEventListener('submit', event => {
        event.preventDefault();
        const exercise = subject.exercises[index], state = states[index];
        state.answer = exercise.choices ? (document.querySelector('input[name="answer-choice"]:checked')?.value ?? '') : byId('answer').value;
        state.correct = exercise.choices ? state.answer === String(exercise.correct) : exercise.accepted.some(answer => normalize(answer) === normalize(state.answer));
        state.feedback = !state.answer.trim() ? 'Responda antes de verificar.' : state.correct ? 'Correto! Você pode conferir os passos na resolução.' : 'Ainda não. Tente novamente ou use a dica para rever o raciocínio.';
        feedback(state.feedback, state.correct);
    });
    ['hint', 'solution'].forEach(name => byId(`${name}-toggle`).addEventListener('click', () => {
        states[index][name] = !states[index][name];
        disclosure(name, states[index][name]);
    }));
    byId('previous').addEventListener('click', () => { if (index > 0) { index--; render(true); } });
    byId('next').addEventListener('click', () => {
        if (index < subject.exercises.length - 1) { index++; render(true); return; }
        byId('practice').hidden = true;
        byId('summary').hidden = false;
        const count = states.filter(state => state.correct).length;
        byId('summary-text').textContent = `${count} de ${states.length} exercícios com resposta correta verificada nesta visita. ${count === states.length ? 'Você pode revisar os passos ou continuar.' : 'Revise os exercícios pendentes para continuar praticando.'}`;
        const nextSubject = MathSubjects[MathSubjects.indexOf(subject) + 1];
        const link = byId('next-subject');
        link.href = nextSubject ? `/static/fundamentos-matematicos.html?assunto=${nextSubject.id}` : '/menu#atividades';
        link.textContent = nextSubject ? `Continuar: ${nextSubject.title} →` : 'Voltar às aplicações →';
        byId('summary-title').focus();
    });
    byId('restart').addEventListener('click', () => { index = 0; render(true); });
    render();
})();
