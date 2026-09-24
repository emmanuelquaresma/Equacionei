(() => {
    const $=id=>document.getElementById(id),store=window.LearningData;
    const num=value=>Number(value).toLocaleString('pt-BR',{maximumFractionDigits:1});
    const pct=value=>value===null?'—':num(value*100)+'%';
    const names={'+':'Soma','-':'Subtração','*':'Multiplicação','/':'Divisão',mixed:'Operações combinadas'};
    let progress=store.loadProgress();
    progress.examples=progress.examples.filter(DataScience.validExample);
    progress.runs=progress.runs.filter(r=>r&&Number.isInteger(r.count)&&Number.isFinite(r.accuracy)&&r.accuracy>=0&&r.accuracy<=1);
    const done=id=>progress.activities.includes(id);
    const labDone=level=>[0,1,2].every(i=>done(`lab-${level}-${i}`));
    const badges=[['Explorador de Dados',()=>done('explore'),'Responda à descoberta em Meus Dados.'],
        ['Mestre dos Gráficos',()=>labDone('easy'),'Conclua as três perguntas do nível Fácil.'],
        ['Estatístico Iniciante',()=>labDone('medium')&&labDone('hard'),'Conclua os níveis Médio e Difícil.'],
        ['Treinador de IA',()=>done('train'),'Treine um modelo com exemplos das duas classes.'],
        ['Cientista de Dados',()=>done('explore')&&labDone('easy')&&labDone('medium')&&labDone('hard')&&done('compare'),'Complete o laboratório e compare dois treinamentos diferentes.']];
    function persistenceNote() {$('storage-note').textContent=store.isPersistent()?'':'O armazenamento está indisponível. Os dados desta sessão podem se perder ao fechar a página.';}
    function save() {store.saveProgress(progress);renderBadges();persistenceNote();}
    function complete(id) {if(!done(id))progress.activities.push(id);save();}
    function renderBadges() {
        $('badges').replaceChildren();let earned=0;
        badges.forEach(([name,condition,hint])=>{const unlocked=condition(),li=document.createElement('li');if(unlocked)earned++;
            li.className=unlocked?'earned':'';li.textContent=`${unlocked?'🏅':'○'} ${name} — ${unlocked?'Conquistado!':hint}`;$('badges').append(li);});
        $('progress-summary').textContent=`${earned} de ${badges.length} conquistas desbloqueadas.`;
    }
    function bar(container,label,value,max,detail) {
        const row=document.createElement('div');row.className='ds-bar-row';
        const text=document.createElement('p');text.textContent=`${label}: ${detail}`;
        const outer=document.createElement('div');outer.className='ds-bar';outer.setAttribute('aria-hidden','true');
        const inner=document.createElement('span');inner.style.width=`${max?Math.min(100,value/max*100):0}%`;outer.append(inner);row.append(text,outer);container.append(row);
    }
    function renderData() {
        const game=$('data-game').value,rows=store.attempts().filter(r=>game==='all'||r.game===game),summary=DataScience.summarize(rows);
        $('data-empty').hidden=rows.length>0;$('data-metrics').replaceChildren();
        for(const [label,value] of [['Exercícios diferentes',summary.questions],['Respostas registradas',summary.total],['Acertos',summary.hits],['Acurácia',pct(summary.accuracy)],['Tempo médio até a tentativa',summary.meanMs===null?'—':num(summary.meanMs/1000)+' s'],['Questões sem resposta a tempo',summary.timeouts]]) {
            const box=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;box.append(dt,dd);$('data-metrics').append(box);
        }
        $('data-definition').textContent='Acurácia = acertos ÷ respostas registradas. Cada tentativa conta, inclusive repetições na mesma questão. Tempo medido desde a apresentação da questão; pausas do Queda são excluídas. Questões expiradas não entram na acurácia nem no tempo médio.';
        $('operation-chart').replaceChildren();
        for(const [key,label] of Object.entries(names)) {
            const group=summary.groups[key];bar($('operation-chart'),label,group?group.hits/group.total:0,1,group?`${pct(group.hits/group.total)} (${group.hits}/${group.total})`:'Sem respostas ainda');
        }
        $('recent-attempts').replaceChildren();rows.slice(-10).reverse().forEach(row=>{
            const li=document.createElement('li');li.textContent=`${row.game==='queda'?'Queda Matemática':'Desafio Relâmpago'} · ${row.level} · ${row.question} → ${row.answer===null?'sem resposta':row.answer} · esperado: ${row.expected} · ${row.correct?'acerto':row.outcome==='timeout'?'tempo esgotado':'erro'} · ${num(row.responseMs/1000)} s · ${new Date(row.timestamp).toLocaleString('pt-BR')}`;$('recent-attempts').append(li);
        });persistenceNote();
    }
    $('data-game').addEventListener('change',renderData);$('refresh-data').addEventListener('click',renderData);
    $('data-quiz').querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>{
        if(button.dataset.correct){$('data-feedback').textContent='Isso! Acertos divididos pelo total de respostas.';complete('explore');}
        else $('data-feedback').textContent='Tente novamente. A acurácia mede a proporção de respostas corretas.';
    }));
    $('clear-data').addEventListener('click',()=>{$('clear-confirm').hidden=false;});
    $('cancel-clear').addEventListener('click',()=>{$('clear-confirm').hidden=true;});
    $('confirm-clear').addEventListener('click',()=>{store.clearAttempts();$('clear-confirm').hidden=true;renderData();});

    const fruitNames=['Maçã','Banana','Morango','Uva'];let votes=[4,3,2,1],values=[2,4,4,6,9],questionIndex=0;
    function choices(correct,unit='') {
        const items=new Set([correct]);for(const offset of [1,-1,2,-2,5]) {items.add(Math.round((correct+offset)*10)/10);if(items.size===4)break;}
        return [...items].sort((a,b)=>a-b).map(value=>({label:num(value)+unit,correct:value===correct}));
    }
    function renderLab() {
        const level=$('lab-level').value,easy=level==='easy',data=easy?votes:values,total=votes.reduce((a,b)=>a+b,0),stats=DataScience.statistics(values);
        $('lab-controls').replaceChildren();$('lab-chart').replaceChildren();
        $('lab-title').textContent=easy?`${total} votos em frutas favoritas`:'Quantidade de livros lidos por cinco alunos';
        data.forEach((value,i)=>{
            const row=document.createElement('div');row.className='ds-control';row.setAttribute('role','row');const label=document.createElement('span');label.textContent=easy?fruitNames[i]:`Aluno ${i+1}`;
            const minus=document.createElement('button'),plus=document.createElement('button'),output=document.createElement('output');minus.type=plus.type='button';minus.textContent='−';plus.textContent='+';output.textContent=value;
            minus.setAttribute('aria-label',`Diminuir ${label.textContent}`);plus.setAttribute('aria-label',`Aumentar ${label.textContent}`);
            minus.disabled=value===0;plus.disabled=value===20;
            minus.addEventListener('click',()=>{data[i]--;renderLab();$('lab-controls').children[i].querySelector('button').focus();});plus.addEventListener('click',()=>{data[i]++;renderLab();$('lab-controls').children[i].querySelectorAll('button')[1].focus();});
            [label,minus,output,plus].forEach(element=>{const cell=document.createElement('div');cell.setAttribute('role','cell');cell.append(element);row.append(cell);});$('lab-controls').append(row);
        });
        if(easy)votes.forEach((v,i)=>bar($('lab-chart'),fruitNames[i],v,Math.max(...votes),`${v} votos · ${pct(total?v/total:0)}`));
        else if(level==='hard')stats.counts.forEach(([value,frequency])=>bar($('lab-chart'),`${value} livros`,frequency,5,`${frequency} aluno(s)`));
        else values.forEach((v,i)=>bar($('lab-chart'),`Aluno ${i+1}`,v,Math.max(...values),`${v} livros`));
        const modes=stats.modes.length?stats.modes.map(num).join(' e '):'Sem moda';
        $('lab-statistics').textContent=easy?'Frequência é a quantidade de votos de cada fruta. Porcentagem é a parte dividida pelo total, vezes 100.':
            `Média: ${num(stats.mean)} · Mediana: ${num(stats.median)} · Moda: ${modes} · Mínimo: ${stats.min} · Máximo: ${stats.max}. Mediana é o centro da lista ordenada: ${[...values].sort((a,b)=>a-b).join(', ')}.`;
        let question,answers;
        if(easy) {
            if(questionIndex===0){question='Qual fruta recebeu mais votos? Em empate, qualquer líder vale.';answers=votes.map((v,i)=>({label:fruitNames[i],correct:v===Math.max(...votes)}));}
            if(questionIndex===1){question='Qual porcentagem dos votos foi para banana? Arredonde para uma casa decimal.';answers=choices(total?Math.round(votes[1]/total*1000)/10:0,'%');}
            if(questionIndex===2){question='Quantos votos receberam maçã e morango juntos?';answers=choices(votes[0]+votes[2]);}
        } else if(level==='medium') {
            const qs=[['Qual é a média de livros? Arredonde para uma casa decimal.',Math.round(stats.mean*10)/10],['Qual é a mediana?',stats.median],['Qual é o maior valor?',stats.max]];
            [question]=qs[questionIndex];answers=choices(qs[questionIndex][1]);
        } else {
            if(questionIndex===0){question='Qual é a moda (valor ou valores mais frequentes)?';answers=[...new Set([modes,'Sem moda',String(stats.max),'Todos os valores'])].map(label=>({label,correct:label===modes}));}
            if(questionIndex===1){question='Qual é a amplitude: máximo menos mínimo?';answers=choices(stats.max-stats.min);}
            if(questionIndex===2){question='Qual porcentagem dos alunos leu pelo menos 6 livros?';answers=choices(values.filter(v=>v>=6).length/5*100,'%');}
        }
        $('lab-counter').textContent=`Pergunta ${questionIndex+1} de 3 · ${['easy','medium','hard'].indexOf(level)+1}º nível`;
        $('lab-question').textContent=easy&&!total?'Adicione pelo menos um voto para experimentar.':question;
        $('lab-answers').replaceChildren();$('lab-feedback').textContent='';$('lab-next').hidden=true;
        answers.forEach(answer=>{const b=document.createElement('button');b.type='button';b.textContent=answer.label;b.disabled=easy&&!total;
            b.addEventListener('click',()=>{
                $('lab-answers').querySelectorAll('button').forEach(button=>button.disabled=true);
                $('lab-feedback').textContent=answer.correct?'Muito bem! Você interpretou os dados.':`Vamos observar de novo. Resposta: ${answers.filter(a=>a.correct).map(a=>a.label).join(' ou ')}.`;
                if(answer.correct)complete(`lab-${level}-${questionIndex}`);$('lab-next').hidden=false;
            });$('lab-answers').append(b);});
    }
    $('lab-level').addEventListener('change',()=>{questionIndex=0;renderLab();});
    $('lab-next').addEventListener('click',()=>{questionIndex=(questionIndex+1)%3;renderLab();});

    let model=null;
    const animalName=label=>label==='cat'?'Gato':'Cachorro';
    const point=()=>({height:Number($('animal-height').value),weight:Number($('animal-weight').value)});
    function invalidateModel() {model=null;$('predict-model').disabled=true;$('evaluation').replaceChildren();$('test-results').replaceChildren();$('prediction').textContent='';$('training-feedback').textContent='Os dados mudaram. Treine novamente para usar estes exemplos.';}
    function drawTraining() {
        const svg=$('training-plot'),ns='http://www.w3.org/2000/svg';svg.replaceChildren();
        function shape(type,attrs,text) {const node=document.createElementNS(ns,type);for(const [k,v] of Object.entries(attrs))node.setAttribute(k,v);if(text)node.textContent=text;svg.append(node);return node;}
        shape('path',{d:'M40 15 V240 H345',fill:'none',stroke:'#667f92'});
        shape('text',{x:140,y:270,fill:'#12345b','font-size':13},'Altura (10–80 cm)');shape('text',{x:5,y:12,fill:'#12345b','font-size':12},'Peso (1–40 kg)');
        progress.examples.forEach(e=>{
            const x=40+(e.height-10)/70*295,y=240-(e.weight-1)/39*215;
            const node=e.label==='cat'?shape('circle',{cx:x,cy:y,r:5,fill:'#17659a'}):shape('rect',{x:x-5,y:y-5,width:10,height:10,fill:'#9a6500'});
            const title=document.createElementNS(ns,'title');title.textContent=`${animalName(e.label)}: ${e.height} cm, ${e.weight} kg`;node.append(title);
        });
    }
    function renderExamples() {
        $('example-count').textContent=`${progress.examples.length} / 100 exemplos de treinamento.`;
        $('add-example').disabled=progress.examples.length>=100;
        $('training-list').replaceChildren();progress.examples.forEach((e,i)=>{
            const li=document.createElement('li');li.textContent=`${animalName(e.label)} · ${e.height} cm · ${e.weight} kg`;
            const b=document.createElement('button');b.type='button';b.textContent='Remover';b.setAttribute('aria-label',`Remover exemplo ${i+1}`);
            b.addEventListener('click',()=>{progress.examples.splice(i,1);invalidateModel();save();renderExamples();});li.append(b);$('training-list').append(li);
        });drawTraining();
    }
    function updatePoint() {$('height-label').textContent=point().height+' cm';$('weight-label').textContent=point().weight+' kg';}
    $('animal-height').addEventListener('input',updatePoint);$('animal-weight').addEventListener('input',updatePoint);
    $('add-example').addEventListener('click',()=>{
        if(progress.examples.length>=100)return;
        progress.examples.push({...point(),label:$('animal-label').value});$('example-feedback').textContent='Exemplo adicionado. Você pode mudar o rótulo dos próximos exemplos para experimentar.';
        invalidateModel();save();renderExamples();
    });
    $('sample-examples').addEventListener('click',()=>{
        const samples=[{height:20,weight:2,label:'cat'},{height:28,weight:4,label:'cat'},{height:34,weight:7,label:'cat'},
            {height:40,weight:12,label:'dog'},{height:55,weight:22,label:'dog'},{height:70,weight:33,label:'dog'}];
        for(const e of samples)if(progress.examples.length<100&&!progress.examples.some(x=>x.height===e.height&&x.weight===e.weight&&x.label===e.label))progress.examples.push(e);
        invalidateModel();save();renderExamples();$('example-feedback').textContent='Exemplos fictícios sugeridos adicionados. Altere ou remova exemplos para comparar.';
    });
    $('ai-level').addEventListener('change',invalidateModel);
    function renderRuns() {
        $('training-history').replaceChildren();progress.runs.slice(-10).reverse().forEach(run=>{const li=document.createElement('li');li.textContent=`${run.count} exemplos · ${run.k} vizinho(s) · ${run.hits}/10 acertos no teste · ${pct(run.accuracy)}`;$('training-history').append(li);});
    }
    $('train-model').addEventListener('click',()=>{
        try {
            const k={easy:1,medium:3,hard:5}[$('ai-level').value];model=DataScience.train(progress.examples,k);
            const evaluation=DataScience.evaluate(model),signature=JSON.stringify({examples:progress.examples,k});
            const previous=progress.runs.at(-1);
            $('training-feedback').textContent=`Treinamento concluído com ${model.examples.length} exemplos. O modelo consulta até ${model.k} vizinho(s).`;
            $('evaluation').textContent=`Treino: ${model.examples.length} exemplos seus. Teste: ${evaluation.total} exemplos separados. Acertos: ${evaluation.hits}/${evaluation.total}. Acurácia: ${pct(evaluation.accuracy)}.${previous?` Treinamento anterior: ${pct(previous.accuracy)}.`:''}`;
            $('test-results').replaceChildren();evaluation.results.forEach(({example,prediction},i)=>{
                const p=document.createElement('p');p.textContent=`Teste ${i+1}: ${example.height} cm, ${example.weight} kg → previsão ${animalName(prediction.label)}; rótulo esperado ${animalName(example.label)} · ${prediction.label===example.label?'acertou':'errou'}`;$('test-results').append(p);
            });
            if(previous&&previous.signature!==signature)complete('compare');
            progress.runs.push({count:model.examples.length,k:model.k,hits:evaluation.hits,accuracy:evaluation.accuracy,signature});progress.runs=progress.runs.slice(-20);
            complete('train');renderRuns();$('predict-model').disabled=false;
        }catch(error){$('training-feedback').textContent=error.message;}
    });
    $('predict-model').addEventListener('click',()=>{
        if(!model)return;const prediction=DataScience.predict(model,point());
        $('prediction').textContent=`Minha previsão: ${animalName(prediction.label)}. Votos dos vizinhos: ${prediction.votes}/${prediction.total} (${pct(prediction.votes/prediction.total)}). Isso mostra concordância entre exemplos próximos, não uma probabilidade garantida de acerto.`;
    });
    function navigate() {
        const name=['dados','laboratorio','ia'].includes(location.hash.slice(1))?location.hash.slice(1):'inicio';
        document.querySelectorAll('.ds-section').forEach(section=>section.hidden=section.id!==name);
        if(name==='dados')renderData();
    }
    window.addEventListener('hashchange',navigate);window.addEventListener('storage',()=>{renderData();});
    renderBadges();renderLab();renderExamples();renderRuns();navigate();persistenceNote();
})();
