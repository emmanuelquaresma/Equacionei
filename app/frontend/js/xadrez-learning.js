/* Motor funcional compartilhado; estados e progresso exclusivamente educativos. */
const ChessLearning = (() => {
    const copy=value=>structuredClone(value),newGame=Chess.restartGame;
    const modes=['play','learn','practice'];
    function square(name) {
        if(typeof name!=='string'||!/^[a-h][1-8]$/.test(name))throw Error('Casa inválida na atividade.');
        return {row:8-Number(name[1]),col:'abcdefgh'.indexOf(name[0])};
    }
    const engineMove=m=>({from:square(m.from),to:square(m.to),...(m.promotion?{promotion:m.promotion}:{})});
    const sameMove=(a,b)=>a?.from?.row===b.from.row&&a?.from?.col===b.from.col&&a?.to?.row===b.to.row&&a?.to?.col===b.to.col&&a.promotion===b.promotion;
    function createPosition(definition) {
        const state=newGame();
        if(!definition)return state;
        if(!definition.standard) {
            state.board=Array.from({length:8},()=>Array(8).fill(null));
            for(const piece of definition.pieces??[]) {
                const p=square(piece.square);
                if(!['p','r','n','b','q','k'].includes(piece.type)||!['white','black'].includes(piece.color)||state.board[p.row][p.col])
                    throw Error('Peça inválida ou casa duplicada na atividade.');
                if(piece.type==='p'&&(p.row===0||p.row===7))throw Error('Um peão na última fileira precisa estar promovido.');
                state.board[p.row][p.col]={type:piece.type,color:piece.color};
            }
            state.castlingRights=copy(definition.castlingRights??{white:{king:false,queen:false},black:{king:false,queen:false}});
        } else if(definition.castlingRights)state.castlingRights=copy(definition.castlingRights);
        for(const color of ['white','black'])
            if(state.board.flat().filter(p=>p?.type==='k'&&p.color===color).length!==1)throw Error('A atividade precisa de um rei de cada cor.');
        const a=Chess.kingPosition(state,'white'),b=Chess.kingPosition(state,'black');
        if(Math.max(Math.abs(a.row-b.row),Math.abs(a.col-b.col))<=1)throw Error('Os reis não podem ser vizinhos.');
        state.currentPlayer=definition.currentPlayer??'white';
        if(!['white','black'].includes(state.currentPlayer))throw Error('Jogador da atividade inválido.');
        state.enPassantTarget=definition.enPassantTarget?square(definition.enPassantTarget):null;
        state.halfmoveClock=definition.halfmoveClock??0;
        if(!Number.isInteger(state.halfmoveClock)||state.halfmoveClock<0)throw Error('Contador inválido na atividade.');
        state.check=Chess.isKingInCheck(state,state.currentPlayer);
        if(Chess.isKingInCheck(state,state.currentPlayer==='white'?'black':'white'))throw Error('O lado que acabou de jogar não pode deixar seu próprio rei em xeque.');
        state.positionHistory=[Chess.positionKey(state)];
        let prepared=state;
        for(const step of definition.setup??[]) {
            const m=engineMove(step),next=Chess.movePiece(prepared,m.from,m.to,m.promotion);
            if(!next)throw Error('Preparação da atividade contém jogada ilegal.');
            prepared=next;
        }
        return prepared;
    }
    function classifyPosition(state) {
        if(Chess.isCheckmate(state))return 'checkmate';
        if(Chess.isStalemate(state))return 'stalemate';
        if(Chess.isDeadPosition(state))return 'deadPosition';
        if(state.status==='draw')return state.drawReason;
        return 'playing';
    }
    function createSession(definition) {
        const lesson=copy(definition),exercises=lesson.exercises??[];
        let demoState=createPosition(lesson.demo.position),demoIndex=0;
        let frames=[{state:copy(demoState),highlights:[],forbidden:[]}],exerciseIndex=0;
        const records=exercises.map(e=>({state:createPosition(e.position),step:0,complete:false}));
        const exercise=()=>exercises[exerciseIndex]??null,record=()=>records[exerciseIndex]??null;
        function resetExercise() {
            const r=record();if(!r)return;
            r.state=createPosition(exercise().position);r.step=0;r.complete=false;
        }
        function demonstrate() {
            const step=lesson.demo.moves[demoIndex];
            if(!step)return {kind:'complete',message:'Demonstração concluída.'};
            const start=step.position?createPosition(step.position):demoState;
            let next;
            if(step.kind==='observe')next=copy(start);
            else {
                const m=engineMove(step);next=Chess.movePiece(start,m.from,m.to,m.promotion);
                if(!next)return {kind:'error',message:'A demonstração contém uma jogada inválida. Reinicie a atividade.'};
            }
            demoState=next;demoIndex++;
            frames.push({state:copy(next),highlights:step.highlight??(step.to?[step.from,step.to]:[]),forbidden:step.forbidden??[],from:step.kind==='observe'?step.from:null,forbiddenOrigin:step.forbidden?step.from:null});
            return {kind:'correct',message:step.caption??'Etapa demonstrada.'};
        }
        function attempt(input) {
            const r=record(),e=exercise();
            if(!r||r.complete)return {kind:'complete',message:'A atividade já foi concluída ou não está disponível.'};
            let correct=false,next=r.state;
            if((e.type??'move')==='move') {
                next=Chess.movePiece(r.state,input?.from,input?.to,input?.promotion);
                if(!next)return {kind:'illegal',message:e.feedback.illegal};
                if(e.criterion?.type==='resolve-check')correct=!Chess.isKingInCheck(next,e.criterion.color);
                else if(e.criterion?.type==='checkmate')correct=Chess.isCheckmate(next);
                else correct=sameMove(input,engineMove(e.solution[r.step]));
            } else if(e.type==='select') {
                const p=input?.select;
                if(!p||!Number.isInteger(p.row)||!Number.isInteger(p.col)||p.row<0||p.row>7||p.col<0||p.col>7)
                    return {kind:'incorrect',message:e.feedback.incorrect};
                const piece=r.state.board[p.row][p.col],answer=e.answer;
                correct=(!answer.square||Chess.squareName(p)===answer.square)&&(!answer.type||piece?.type===answer.type)&&(!answer.color||piece?.color===answer.color);
            } else if(e.type==='choice') {
                const value=input?.choice;
                if(e.choices.some(c=>c.value===value)) {
                    if(e.criterion.type==='draw-claim')correct=value===e.criterion.reason&&Chess.getDrawClaims(r.state).includes(value);
                    else correct=value===classifyPosition(r.state);
                }
            }
            if(!correct)return {kind:'incorrect',message:e.feedback.incorrect};
            r.state=next;r.step++;
            r.complete=e.type==='select'||e.type==='choice'||Boolean(e.criterion)||r.step===e.solution.length;
            return {kind:'correct',message:e.feedback.correct,complete:r.complete};
        }
        function getDemoView() {
            const step=lesson.demo.moves[demoIndex],last=frames.at(-1);
            const origin=step?.from&&!step.position?step.from:last.from;
            const selected=origin?square(origin):null;
            const legal=selected?Chess.getLegalMoves(demoState,selected.row,selected.col):[];
            const highlights=(demoIndex===0?step?.highlight:last.highlights)??[];
            const proposed=(step?.forbidden??(origin===last.forbiddenOrigin?last.forbidden:[]))??[];
            const forbidden=selected?proposed.map(square).filter(p=>!legal.some(m=>m.to.row===p.row&&m.to.col===p.col)):[];
            return copy({state:demoState,selected,legal,highlights:highlights.map(square),forbidden});
        }
        return Object.freeze({
            getSnapshot:()=>copy({lessonId:lesson.id,demoState,demoIndex,exerciseState:record()?.state??null,exerciseIndex,exerciseStep:record()?.step??0,complete:record()?.complete??false}),
            getLesson:()=>copy(lesson),getExercise:()=>copy(exercise()),getDemoView,
            getExerciseSnapshot:id=>{const i=exercises.findIndex(e=>e.id===id);return i<0?null:copy(records[i]);},
            demonstrate,attempt,resetExercise,
            rewindDemo:()=>{if(!demoIndex)return false;frames.pop();demoState=copy(frames.at(-1).state);demoIndex--;return true;},
            resetDemo:()=>{demoState=createPosition(lesson.demo.position);demoIndex=0;frames=[{state:copy(demoState),highlights:[],forbidden:[]}];},
            canNext:()=>Boolean(record()?.complete)&&exerciseIndex+1<exercises.length,
            nextExercise:()=>{if(!record()?.complete||exerciseIndex+1>=exercises.length)return false;exerciseIndex++;return true;},
            selectExercise:id=>{const i=exercises.findIndex(e=>e.id===id);if(i<0)return false;exerciseIndex=i;return true;}
        });
    }
    function createProgress(lessons,saved=[]) {
        const allowed=new Set(lessons.flatMap(l=>l.exercises.map(e=>l.id+'/'+e.id)));
        const resolved=new Set(saved.filter(k=>allowed.has(k)));
        return Object.freeze({
            record:(lessonId,exerciseId)=>{const key=lessonId+'/'+exerciseId;if(!allowed.has(key))return false;const fresh=!resolved.has(key);resolved.add(key);return fresh;},
            has:(lessonId,exerciseId)=>resolved.has(lessonId+'/'+exerciseId),
            getSnapshot:()=>copy({version:1,resolved:[...resolved].sort(),solved:resolved.size,total:allowed.size,
                lessons:lessons.map(l=>({id:l.id,solved:l.exercises.filter(e=>resolved.has(l.id+'/'+e.id)).length,total:l.exercises.length,
                    complete:l.exercises.every(e=>resolved.has(l.id+'/'+e.id))})),complete:allowed.size>0&&resolved.size===allowed.size})
        });
    }
    const root=document.getElementById('chess-learning');
    if(!root)return Object.freeze({createPosition,createSession,createProgress,classifyPosition});
    const $=id=>document.getElementById(id),available=ChessLessons.lessons;
    const sessions=new Map(),views=new Map(),progress=createProgress(available);
    let mode='play',lessonIndex=0,session;
    let demoFocus=56,practiceFocus=56,practiceSelected=null,practiceLegal=[];
    const setText=(id,text)=>{if($(id).textContent!==text)$(id).textContent=text;};
    function announce(id,result){setText(id,result.message);$(id).dataset.kind=result.kind??'info';}
    function firstDemoIndex() {
        const step=session.getLesson().demo.moves[0],from=step?.from??step?.highlight?.[0]??'a1';
        return ChessBoard.visualIndex(square(from));
    }
    function resetPracticeView() {
        practiceSelected=null;practiceLegal=[];
        const e=session.getExercise(),first=e?.solution?.[0];
        practiceFocus=first?ChessBoard.visualIndex(square(first.from)):56;
        $('chess-practice-promotion').value='q';
    }
    function renderProgress() {
        const state=progress.getSnapshot(),current=state.lessons[lessonIndex];
        $('chess-course-progress').hidden=mode==='play';
        setText('chess-course-summary',`Lição ${lessonIndex+1} de ${available.length} · ${state.solved} de ${state.total} exercícios resolvidos · ${state.lessons.filter(l=>l.complete).length} lições concluídas.`);
        $('chess-course-meter').max=state.total;$('chess-course-meter').value=state.solved;
        setText('chess-lesson-completion',current.complete?'Lição concluída. Você pode revisar e tentar novamente.':`Nesta lição: ${current.solved} de ${current.total} exercícios resolvidos.`);
        $('chess-course-finish').hidden=!state.complete;
        setText('chess-course-finish',`Parabéns! Você concluiu as ${available.length} lições e resolveu os ${state.total} exercícios. Continue revisando ou volte à partida.`);
        for(const option of $('chess-lesson-select').options) {
            const l=available.find(l=>l.id===option.value),status=state.lessons.find(s=>s.id===option.value);
            option.textContent=l.title+(status.complete?' — concluída':'');
        }
    }
    function renderDemo() {
        const view=session.getDemoView(),snapshot=session.getSnapshot();
        ChessBoard.render($('chess-demo-board'),{...view.state,selectedPiece:view.selected,legalMoves:view.legal},{
            highlights:view.highlights,forbidden:view.forbidden,focusIndex:demoFocus,onFocus:i=>{demoFocus=i;}
        });
        $('chess-demo-next').disabled=snapshot.demoIndex>=session.getLesson().demo.moves.length;
        $('chess-demo-previous').disabled=snapshot.demoIndex===0;
        if(document.activeElement===$('chess-demo-next')&&$('chess-demo-next').disabled)$('chess-demo-previous').focus();
        else if(document.activeElement===$('chess-demo-previous')&&$('chess-demo-previous').disabled)$('chess-demo-next').focus();
        setText('chess-demo-progress',`Etapa ${snapshot.demoIndex} de ${session.getLesson().demo.moves.length}`);
    }
    function markResult(result) {
        if(result.kind==='correct'&&result.complete)progress.record(session.getLesson().id,session.getExercise().id);
        announce('chess-practice-feedback',result);
    }
    function renderPractice() {
        const snapshot=session.getSnapshot(),e=session.getExercise(),kind=e?.type??'move';
        setText('chess-practice-title',e?.title??'Sem exercício nesta lição');
        setText('chess-practice-objective',e?.objective??'Escolha outra lição.');
        setText('chess-practice-help',(e?.instructions??'Selecione uma peça e o destino.')+' Use as setas para navegar, Enter ou Espaço para selecionar e Escape para limpar a seleção. ◎ indica o destino quando ele é informado.');
        $('chess-practice-board').hidden=!snapshot.exerciseState;
        $('chess-practice-hint').hidden=!e?.hint;$('chess-practice-retry').disabled=!e;
        $('chess-practice-next').disabled=!session.canNext();
        $('chess-practice-next-lesson').disabled=lessonIndex===available.length-1;
        $('chess-practice-finish').hidden=!snapshot.complete;
        setText('chess-practice-finish','Exercício concluído! Você pode escolher outra atividade, avançar de lição ou tentar novamente.');
        $('chess-practice-promotion-control').hidden=kind!=='move'||!practiceLegal.some(m=>m.promotion);
        const select=$('chess-exercise-select');
        select.replaceChildren();
        for(const [i,exercise] of session.getLesson().exercises.entries()) {
            const option=document.createElement('option');option.value=exercise.id;
            option.textContent=`${i+1}. ${exercise.title}`+(progress.has(session.getLesson().id,exercise.id)?' — resolvido':'');
            select.append(option);
        }
        select.value=e?.id??'';
        const choices=$('chess-practice-choices'),active=document.activeElement,activeValue=active?.dataset.choice;
        const hadChoiceFocus=choices.contains(active);
        choices.replaceChildren();choices.hidden=kind!=='choice';
        for(const choice of kind==='choice'?e.choices:[]) {
            const button=document.createElement('button');button.type='button';button.dataset.choice=choice.value;
            button.textContent=choice.label;button.disabled=snapshot.complete;
            button.addEventListener('click',()=>{markResult(session.attempt({choice:choice.value}));renderPractice();renderProgress();});
            choices.append(button);
        }
        if(hadChoiceFocus) {
            if(snapshot.complete)$('chess-practice-retry').focus();
            else [...choices.children].find(b=>b.dataset.choice===activeValue)?.focus();
        }
        if(snapshot.exerciseState)ChessBoard.render($('chess-practice-board'),{...snapshot.exerciseState,selectedPiece:practiceSelected,legalMoves:practiceLegal},{
            goal:e.target?square(e.target):null,focusIndex:practiceFocus,onFocus:i=>{practiceFocus=i;},
            onSelect:kind==='choice'?undefined:selectPractice,onEscape:()=>{practiceSelected=null;practiceLegal=[];renderPractice();}
        });
    }
    function selectPractice(row,col) {
        const snapshot=session.getSnapshot(),state=snapshot.exerciseState,e=session.getExercise();
        if(!state||snapshot.complete)return;
        if(e.type==='select')markResult(session.attempt({select:{row,col}}));
        else if(state.board[row][col]?.color===state.currentPlayer) {
            practiceSelected={row,col};practiceLegal=Chess.getLegalMoves(state,row,col);
            announce('chess-practice-feedback',{message:practiceLegal.length?'Escolha um destino para a peça selecionada.':'Essa peça não tem movimentos legais.'});
        } else if(practiceSelected) {
            const promotion=practiceLegal.find(m=>m.to.row===row&&m.to.col===col)?.promotion;
            const result=session.attempt({from:practiceSelected,to:{row,col},...(promotion?{promotion:$('chess-practice-promotion').value}:{})});
            markResult(result);if(result.kind==='correct'){practiceSelected=null;practiceLegal=[];}
        } else announce('chess-practice-feedback',{message:'Selecione primeiro uma peça do jogador da vez.'});
        renderPractice();renderProgress();
    }
    function renderLesson() {
        const l=session.getLesson();$('chess-lesson-select').value=l.id;
        setText('chess-lesson-title',l.title);$('chess-lesson-explanation').replaceChildren();
        for(const text of l.explanation){const p=document.createElement('p');p.textContent=text;$('chess-lesson-explanation').append(p);}
        $('chess-lesson-previous').disabled=lessonIndex===0;$('chess-lesson-next').disabled=lessonIndex===available.length-1;
        renderDemo();renderPractice();renderProgress();
    }
    function loadLesson(id) {
        const index=available.findIndex(l=>l.id===id);
        if(index<0){$('chess-lesson-select').value=available[lessonIndex].id;announce('chess-demo-feedback',{kind:'error',message:'Esta lição ainda não está disponível.'});return false;}
        try {
            const next=sessions.get(id)??createSession(available[index]);
            if(session)views.set(session.getLesson().id,copy({demoFocus,practiceFocus,practiceSelected,practiceLegal}));
            session=next;sessions.set(id,next);lessonIndex=index;
            const saved=views.get(id);
            if(saved)({demoFocus,practiceFocus,practiceSelected,practiceLegal}=saved);
            else {demoFocus=firstDemoIndex();resetPracticeView();}
            announce('chess-demo-feedback',{message:session.getSnapshot().demoIndex?'Demonstração retomada. Você pode voltar ou reiniciar.':'Demonstração pronta. Use Avançar etapa.'});
            announce('chess-practice-feedback',{message:session.getSnapshot().complete?'Atividade já concluída. Use Tentar novamente para revisar.':'Leia o objetivo e resolva a atividade.'});
            renderLesson();return true;
        } catch(error){announce('chess-demo-feedback',{kind:'error',message:'Não foi possível abrir a atividade: '+error.message});return false;}
    }
    function setMode(next,returnToBoard=false) {
        if(!modes.includes(next)||!ChessGame.canLeave())return false;
        mode=next;
        for(const name of modes){$('chess-'+name+'-panel').hidden=name!==mode;$('chess-mode-'+name).setAttribute('aria-selected',String(name===mode));$('chess-mode-'+name).tabIndex=name===mode?0:-1;}
        if(mode==='learn')renderDemo();if(mode==='practice')renderPractice();renderProgress();
        if(returnToBoard&&mode==='play')ChessGame.focus();else $('chess-mode-'+mode).focus();
        return true;
    }
    function focusActivity() {
        if(session.getExercise()?.type==='choice')([...$('chess-practice-choices').children].find(b=>!b.disabled)??$('chess-practice-retry')).focus();
        else ChessBoard.focus($('chess-practice-board'),practiceFocus);
    }
    for(const [i,name] of modes.entries()) {
        const tab=$('chess-mode-'+name);tab.addEventListener('click',()=>setMode(name));
        tab.addEventListener('keydown',event=>{
            let next;
            if(['ArrowRight','ArrowDown'].includes(event.key))next=(i+1)%3;
            if(['ArrowLeft','ArrowUp'].includes(event.key))next=(i+2)%3;
            if(event.key==='Home')next=0;if(event.key==='End')next=2;
            if(next!==undefined){event.preventDefault();setMode(modes[next]);}
        });
    }
    $('chess-open-learning').addEventListener('click',()=>setMode('learn'));
    document.querySelectorAll('[data-chess-return]').forEach(b=>b.addEventListener('click',()=>setMode('play',true)));
    $('chess-lesson-select').addEventListener('change',e=>loadLesson(e.target.value));
    $('chess-lesson-previous').addEventListener('click',()=>{if(lessonIndex>0){loadLesson(available[lessonIndex-1].id);$('chess-lesson-select').focus();}});
    $('chess-lesson-next').addEventListener('click',()=>{if(lessonIndex+1<available.length){loadLesson(available[lessonIndex+1].id);$('chess-lesson-select').focus();}});
    $('chess-demo-next').addEventListener('click',()=>{announce('chess-demo-feedback',session.demonstrate());renderDemo();});
    $('chess-demo-previous').addEventListener('click',()=>{if(session.rewindDemo()){announce('chess-demo-feedback',{message:'Etapa anterior recuperada apenas na demonstração.'});renderDemo();}});
    $('chess-demo-reset').addEventListener('click',()=>{session.resetDemo();demoFocus=firstDemoIndex();announce('chess-demo-feedback',{message:'Demonstração reiniciada.'});renderDemo();});
    $('chess-go-practice').addEventListener('click',()=>setMode('practice'));
    $('chess-practice-hint').addEventListener('click',()=>announce('chess-practice-feedback',{message:session.getExercise()?.hint??'Esta atividade não possui dica.'}));
    $('chess-practice-retry').addEventListener('click',()=>{session.resetExercise();resetPracticeView();announce('chess-practice-feedback',{message:'Atividade reiniciada. Seu progresso anterior foi mantido.'});renderPractice();renderProgress();focusActivity();});
    $('chess-practice-next').addEventListener('click',()=>{if(session.nextExercise()){resetPracticeView();renderPractice();renderProgress();announce('chess-practice-feedback',{message:'Próxima atividade pronta.'});focusActivity();}});
    $('chess-exercise-select').addEventListener('change',e=>{if(session.selectExercise(e.target.value)){resetPracticeView();renderPractice();announce('chess-practice-feedback',{message:'Atividade selecionada. Você pode revisar com Tentar novamente.'});}});
    $('chess-practice-next-lesson').addEventListener('click',()=>{if(lessonIndex+1<available.length){loadLesson(available[lessonIndex+1].id);focusActivity();}});
    for(const topic of ChessLessons.topics){const option=document.createElement('option');option.value=topic.id;option.disabled=!topic.available;option.textContent=topic.title;$('chess-lesson-select').append(option);}
    loadLesson(available[0].id);
    return Object.freeze({createPosition,createSession,createProgress,classifyPosition,
        getSnapshot:()=>copy({mode,lessonIndex,session:session.getSnapshot(),progress:progress.getSnapshot()}),setMode,loadLesson});
})();
