const QuedaOptions = (() => {
    function generate(expression) {
        const result = expression.result;
        const values = new Set([result]);
        const leftToRight = expression.operators.reduce((value, op, i) => {
            const n = expression.numbers[i+1];
            return op==='+' ? value+n : op==='-' ? value-n : op==='*' ? value*n : value/n;
        }, expression.numbers[0]);
        const candidates = [result-1,result+1,result-2,result+2,result-5,result+5,result-10,result+10,-result,leftToRight]
            .filter(Number.isSafeInteger);
        // Fisher–Yates embaralha posição e distratores, sem posição fixa para o acerto.
        const shuffle = array => {
            for(let i=array.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [array[i],array[j]]=[array[j],array[i]]; }
            return array;
        };
        for(const value of shuffle(candidates)) { values.add(value); if(values.size===4) break; }
        return shuffle([...values]);
    }
    return { generate };
})();
(() => {
    const $ = id => document.getElementById('q-'+id);
    const levels = {easy:{name:'Fácil',base:100,duration:22000},medium:{name:'Médio',base:200,duration:17000},hard:{name:'Difícil',base:300,duration:13000}};
    const KEY='quedaMatematicaRecords';
    const state={status:'idle',level:'easy',score:0,hits:0,errors:0,streak:0,bestStreak:0,phase:1,lives:3,elapsed:0,roundTime:0,round:0,options:[],expression:null};
    let frame=0,previous=0,records={};
    try { const saved=JSON.parse(localStorage.getItem(KEY)); if(saved&&typeof saved==='object'&&!Array.isArray(saved)) records=saved; } catch (_) {}
    const format=ms=>`${String(Math.floor(ms/60000)).padStart(2,'0')}:${String(Math.floor(ms/1000)%60).padStart(2,'0')}`;
    const duration=()=>levels[state.level].duration/Math.min(1.8,1+Math.floor(state.hits/5)*.08);
    function showRecords() {
        $('records').replaceChildren();
        for(const [key,level] of Object.entries(levels)) {
            const r=records[key]||{},p=document.createElement('p');
            p.textContent=`${level.name}: ${Number(r.score)||0} pontos • ${Number(r.hits)||0} acertos • Sequência: ${Number(r.streak)||0} • Fase: ${Number(r.phase)||1}`;
            $('records').append(p);
        }
    }
    function saveRecords() {
        const old=records[state.level]||{},next={}; let fresh=false;
        for(const [key,value] of Object.entries({score:state.score,hits:state.hits,streak:state.bestStreak,phase:state.phase})) {
            next[key]=Math.max(Number(old[key])||0,value); if(value>(Number(old[key])||0)) fresh=true;
        }
        records[state.level]=next; $('new-record').hidden=!fresh;
        try { localStorage.setItem(KEY,JSON.stringify(records)); } catch (_) { $('feedback').textContent+=' Não foi possível salvar o recorde.'; }
        showRecords();
    }
    function render() {
        for(const key of ['score','hits','errors','streak','phase']) $(key).textContent=state[key];
        $('lives').textContent='♥ '.repeat(state.lives).trim()||'0';
        $('time').textContent=format(state.elapsed); $('level-name').textContent=levels[state.level].name;
        $('overlay').hidden=state.status!=='paused'; $('pause').disabled=state.status==='finished';
        $('pause').textContent=state.status==='paused'?'Continuar':'Pausar';
        state.options.forEach(option=>{
            const travel=Math.max(0,$('arena').clientHeight-option.element.offsetHeight-20);
            option.element.style.transform=`translateY(${Math.min(1,state.roundTime/duration()*option.speed)*travel}px)`;
            option.element.disabled=state.status!=='running';
        });
    }
    let questionId;
    function recordAttempt(answer,outcome='answer') {
        window.LearningData?.record({game:'queda',level:state.level,questionId,operations:state.expression.operators,
            question:state.expression.text,answer,expected:state.expression.result,outcome,responseMs:state.roundTime});
    }
    function createRound() {
        state.round++; state.roundTime=0; questionId=window.LearningData?.newId();
        state.expression=MathExpressions.generate(state.level,state.phase);
        $('expression').textContent=state.expression.text; $('options').replaceChildren();
        const round=state.round;
        state.options=QuedaOptions.generate(state.expression).map((value,i)=>{
            const element=document.createElement('button');element.type='button';element.className='q-option';
            element.textContent=value;element.style.left=`${2+i*25}%`;
            element.setAttribute('aria-label',`Responder ${value}`);
            element.addEventListener('click',()=>submit(value,round)); $('options').append(element);
            return {value,element,speed:.85+Math.random()*.3};
        });
    }
    function finish() {
        state.status='finished';cancelAnimationFrame(frame);document.body.classList.remove('q-running');
        $('feedback').textContent='Fim de jogo'; $('result').hidden=false;
        $('summary').textContent=`${state.score} pontos • ${state.hits} acertos • ${state.errors} erros • Sequência máxima: ${state.bestStreak} • Fase: ${state.phase} • Tempo: ${format(state.elapsed)}`;
        saveRecords();render();$('again').focus();
    }
    function advance(now) {
        const delta=Math.max(0,now-previous);previous=now;state.elapsed+=delta;state.roundTime+=delta;
        const correct=state.options.find(option=>option.value===state.expression.result);
        if(state.roundTime/duration()*correct.speed>=1) {
            recordAttempt(null,'timeout');
            state.lives--;state.streak=0;$('feedback').textContent='A resposta chegou ao fim. Uma vida a menos.';
            if(!state.lives) finish(); else createRound();
        }
    }
    function tick(now) { if(state.status!=='running')return;advance(now);render();if(state.status==='running')frame=requestAnimationFrame(tick); }
    function submit(value,round) {
        if(state.status!=='running'||round!==state.round)return;
        advance(performance.now());
        if(state.status!=='running'||round!==state.round){render();return;}
        recordAttempt(value);
        if(value===state.expression.result) {
            state.streak++;state.bestStreak=Math.max(state.bestStreak,state.streak);
            const base=levels[state.level].base;
            state.score+=Math.round(base*(1+.5*Math.max(0,1-state.roundTime/duration())+.05*Math.min(state.streak-1,10)));
            state.hits++;state.phase=1+Math.floor(state.hits/10);
            $('feedback').textContent=`Correto! Sequência: ${state.streak}. Fase ${state.phase}.`;createRound();
        } else {
            state.errors++;state.streak=0;state.lives--;
            $('feedback').textContent='Resposta incorreta. Uma vida a menos. Tente outro resultado!';
            if(!state.lives) finish();
        }
        render();
    }
    function start() {
        cancelAnimationFrame(frame);
        Object.assign(state,{status:'running',level:$('level').value,score:0,hits:0,errors:0,streak:0,bestStreak:0,phase:1,lives:3,elapsed:0,roundTime:0});
        $('setup').hidden=true;$('play').hidden=false;$('result').hidden=true;
        document.body.classList.add('q-running');$('feedback').textContent='Encontre a resposta!';
        previous=performance.now();createRound();render();frame=requestAnimationFrame(tick);
    }
    function pause() {
        if(state.status!=='running')return;advance(performance.now());if(state.status==='finished')return;
        state.status='paused';cancelAnimationFrame(frame);render();$('resume').focus();
    }
    function resume() {if(state.status!=='paused')return;state.status='running';previous=performance.now();render();frame=requestAnimationFrame(tick);}
    $('start').addEventListener('click',start);$('restart').addEventListener('click',start);$('again').addEventListener('click',start);
    $('pause').addEventListener('click',()=>state.status==='paused'?resume():pause());$('resume').addEventListener('click',resume);
    $('change').addEventListener('click',()=>{state.status='idle';$('play').hidden=true;$('setup').hidden=false;$('start').focus();});
    document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});showRecords();
})();
