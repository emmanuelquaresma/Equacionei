/* Testes educativos: compara estados completos, sem reimplementar regras. */
function testChessLearningModel(L, catalog) {
    let count=0;
    const assert=(v,m)=>{if(!v)throw Error(m);count++;};
    const json=v=>JSON.stringify(v),pos=s=>({row:8-Number(s[1]),col:'abcdefgh'.indexOf(s[0])});
    const move=(a,b)=>({from:pos(a),to:pos(b)});
    const throws=(fn,m)=>{let failed=false;try{fn();}catch(_){failed=true;}assert(failed,m);};
    assert(catalog.topics.length===15,'15 temas catalogados');
    assert(catalog.lessons.length===1&&catalog.topics.filter(t=>t.available).length===1,'somente uma lição publicada');
    for(const topic of catalog.topics)assert(topic.id&&topic.title,'tema estruturado');
    assert(Object.isFrozen(catalog)&&Object.isFrozen(catalog.lessons[0].demo.position.pieces),'dados imutáveis');
    const definition=catalog.lessons[0],s=L.createSession(definition),other=L.createSession(definition);
    const original=s.getSnapshot(),position=structuredClone(definition.demo.position);
    assert(original.demoIndex===0&&!original.complete,'sessão inicial');
    assert(original.demoState.positionHistory.length===1&&original.exerciseState.positionHistory.length===1,'históricos próprios');
    assert(!original.demoState.castlingRights.white.king&&!original.demoState.enPassantTarget,'direitos próprios');
    const leaked=s.getSnapshot();leaked.demoState.board[4][3]=null;
    assert(s.getSnapshot().demoState.board[4][3]?.type==='r','snapshot não expõe referência');
    const first=s.demonstrate();assert(first.kind==='correct','demonstração validada');
    assert(s.getSnapshot().demoState.board[2][3]?.type==='r','avanço vertical');
    assert(s.getSnapshot().demoState.currentPlayer==='black','turno respeitado');
    assert(json(other.getSnapshot())===json(original),'sessões independentes');
    assert(json(s.getSnapshot().exerciseState)===json(original.exerciseState),'demonstração não altera exercício');
    assert(s.rewindDemo(),'voltar demonstração');
    assert(json(s.getSnapshot())===json(original),'voltar restaura estado completo');
    assert(!s.rewindDemo(),'limite da primeira etapa');
    for(let i=0;i<3;i++)assert(s.demonstrate().kind==='correct','sequência legal');
    assert(s.getSnapshot().demoState.board[2][5]?.type==='r','movimento horizontal');
    const finalDemo=json(s.getSnapshot());
    assert(s.demonstrate().kind==='complete'&&json(s.getSnapshot())===finalDemo,'limite final');
    assert(s.rewindDemo()&&s.getSnapshot().demoState.board[2][3]?.type==='r','voltar etapa horizontal');
    s.resetDemo();assert(json(s.getSnapshot())===json(original),'reinício completo da demonstração');
    const before=json(s.getSnapshot());
    assert(s.attempt(move('d4','d5')).kind==='incorrect','jogada legal incorreta');
    assert(json(s.getSnapshot())===before,'erro legal mantém todo estado');
    assert(s.attempt(move('d4','e5')).kind==='illegal','diagonal recusada pelo motor');
    assert(json(s.getSnapshot())===before,'jogada ilegal mantém todo estado');
    assert(s.attempt(move('h8','h7')).kind==='illegal','peça do outro turno recusada');
    assert(s.attempt(null).kind==='illegal','entrada sem movimento recusada');
    assert(json(s.getSnapshot())===before,'entradas inválidas não alteram estado');
    assert(!s.nextExercise()&&!s.canNext(),'não avança antes de concluir');
    const correct=s.attempt(move('d4','g4'));
    assert(correct.kind==='correct'&&correct.complete,'resposta correta conclui');
    assert(s.getSnapshot().exerciseState.moveHistory.length===1,'histórico próprio registra acerto');
    assert(s.getSnapshot().exerciseState.halfmoveClock===1,'contador próprio');
    assert(json(s.getSnapshot().demoState)===json(original.demoState),'exercício não altera demonstração');
    const complete=json(s.getSnapshot());
    assert(s.attempt(move('g4','g5')).kind==='complete'&&json(s.getSnapshot())===complete,'conclusão não permite novas jogadas');
    assert(!s.canNext()&&!s.nextExercise(),'último exercício sem avanço');
    s.resetExercise();assert(json(s.getSnapshot())===json(original),'tentar novamente restaura sessão');
    const multi=structuredClone(definition);
    multi.exercises.push({...structuredClone(multi.exercises[0]),id:'test-only-second',target:'d5',solution:[{from:'d4',to:'d5'}]});
    const multiple=L.createSession(multi);
    multiple.attempt(move('d4','g4'));assert(multiple.canNext()&&multiple.nextExercise(),'suporte a próximo exercício');
    assert(multiple.getSnapshot().exerciseIndex===1&&!multiple.getSnapshot().complete,'estado novo no próximo');
    assert(multiple.attempt(move('d4','d5')).complete&&!multiple.canNext(),'segundo exercício de fixture concluído');
    const invalidDemo=structuredClone(definition);invalidDemo.demo.moves=[{from:'d4',to:'e5'}];
    const invalid=L.createSession(invalidDemo),invalidBefore=json(invalid.getSnapshot());
    assert(invalid.demonstrate().kind==='error'&&json(invalid.getSnapshot())===invalidBefore,'demonstração ilegal não corrompe estado');
    assert(L.createPosition({standard:true}).board.flat().filter(Boolean).length===32,'posição padrão futura');
    throws(()=>L.createPosition({...position,pieces:[...position.pieces,{square:'d4',type:'r',color:'white'}]}),'casa duplicada');
    throws(()=>L.createPosition({...position,pieces:[{square:'z9',type:'k',color:'white'}]}),'casa inválida');
    throws(()=>L.createPosition({...position,pieces:position.pieces.filter(p=>p.color==='white')}),'rei ausente');
    throws(()=>L.createPosition({...position,currentPlayer:'purple'}),'turno inválido');
    throws(()=>L.createPosition({...position,halfmoveClock:-1}),'contador inválido');
    const noExercise=structuredClone(definition);noExercise.exercises=[];
    assert(L.createSession(noExercise).getSnapshot().exerciseState===null,'lição sem exercício suportada');
    assert(json(definition.demo.position)===json(position),'dados originais preservados');
    return count+' verificações do modelo educativo passaram.';
}

function testChessLearningUI() {
    let count=0,comparisons=0;
    const assert=(v,m)=>{if(!v)throw Error(m);count++;};
    const $=id=>document.getElementById(id),j=v=>JSON.stringify(v);
    const board=$('chess-board'),clickSquare=(b,name)=>b.children[(8-Number(name[1]))*8+'abcdefgh'.indexOf(name[0])].click();
    const play=(a,b)=>{clickSquare(board,a);clickSquare(board,b);};
    const main=()=>j(ChessGame.getSnapshot());
    const education=()=>ChessLearning.getSnapshot().session;
    function actionsForCurrentGame() {
        const before=main();
        const safe=(action,label)=>{action();assert(main()===before,'partida completa preservada: '+label);comparisons++;};
        safe(()=>$('chess-open-learning').click(),'abrir ajuda');
        assert(!$('chess-learn-panel').hidden&&$('chess-play-panel').hidden,'modo Aprender');
        assert(document.activeElement.id==='chess-mode-learn','foco no modo');
        assert($('chess-lesson-select').options.length===15,'catálogo visível');
        assert([...$('chess-lesson-select').options].filter(o=>!o.disabled).length===15,'15 temas disponíveis');
        safe(()=>ChessLearning.loadLesson('rooks'),'abrir lição');
        assert($('chess-demo-board').children.length===64,'tabuleiro demonstrativo');
        assert($('chess-demo-board').querySelectorAll('.chess-target').length>0,'destinos demonstrativos pelo motor');
        const initial=education().demoState;
        safe(()=>$('chess-demo-next').click(),'demonstração vertical');
        assert(education().demoState.board[2][3]?.type==='r','torre em d6');
        safe(()=>$('chess-demo-previous').click(),'voltar etapa');
        assert(j(education().demoState)===j(initial),'voltar restaura histórico/direitos/contadores');
        for(let i=0;i<3;i++)safe(()=>$('chess-demo-next').click(),'avançar demonstração '+i);
        assert($('chess-demo-next').disabled,'limite final da demonstração');
        safe(()=>$('chess-demo-reset').click(),'reiniciar demonstração');
        assert(j(education().demoState)===j(initial),'reinício demonstrativo completo');
        safe(()=>ChessLearning.loadLesson('id-inexistente'),'lição não disponível');
        assert($('chess-demo-feedback').dataset.kind==='error','lição indisponível explicada');
        safe(()=>$('chess-go-practice').click(),'Praticar');
        const exercise=$('chess-practice-board');
        assert(!$('chess-practice-panel').hidden&&$('chess-learn-panel').hidden,'modo Praticar');
        assert(exercise.children[38].getAttribute('aria-label').includes('objetivo do exercício'),'destino nomeado');
        const state=j(education().exerciseState);
        safe(()=>clickSquare(exercise,'d4'),'selecionar torre');
        assert(exercise.children[35].getAttribute('aria-pressed')==='true','seleção acessível');
        safe(()=>clickSquare(exercise,'e5'),'diagonal ilegal');
        assert($('chess-practice-feedback').dataset.kind==='illegal'&&j(education().exerciseState)===state,'erro ilegal sem corrupção');
        safe(()=>clickSquare(exercise,'d5'),'destino legal errado');
        assert($('chess-practice-feedback').dataset.kind==='incorrect'&&j(education().exerciseState)===state,'erro legal sem corrupção');
        safe(()=>$('chess-practice-hint').click(),'dica');
        assert($('chess-practice-feedback').textContent.includes('g4'),'dica educativa');
        safe(()=>clickSquare(exercise,'g4'),'resposta correta');
        assert(education().complete&&education().exerciseState.board[4][6]?.type==='r','conclusão educativa');
        assert(!$('chess-practice-finish').hidden&&$('chess-practice-next').disabled,'único exercício concluído');
        safe(()=>$('chess-practice-retry').click(),'tentar novamente');
        assert(!education().complete&&j(education().exerciseState)===state,'reinício preserva dados iniciais');
        assert(document.activeElement===exercise.children[35],'foco retorna à torre');
        safe(()=>$('chess-mode-play').click(),'Jogar');
        assert(!$('chess-play-panel').hidden,'partida restaurada');
        safe(()=>$('chess-mode-learn').click(),'reabrir educação');
        safe(()=>document.querySelector('#chess-learn-panel [data-chess-return]').click(),'fechar educação');
        assert(board.contains(document.activeElement),'retorno de foco ao tabuleiro');
        safe(()=>$('chess-mode-practice').click(),'reabrir exercício');
        safe(()=>document.querySelector('#chess-practice-panel [data-chess-return]').click(),'retorno do exercício');
        const leaked=ChessGame.getSnapshot();leaked.gameState.board[0][0]=null;
        assert(main()===before,'snapshot principal não permite escrita');
    }
    restartChessForTest();
    for(const [a,b] of [['e2','e4'],['a7','a6'],['e4','e5'],['d7','d5']])play(a,b);
    clickSquare(board,'e5');
    assert(ChessGame.getSnapshot().gameState.enPassantTarget?.row===2,'partida de teste com en passant');
    actionsForCurrentGame();
    restartChessForTest();
    for(const [a,b] of [['e2','e4'],['d7','d5'],['e4','d5'],['g8','f6'],['g1','f3'],['h7','h6'],['h2','h3'],['b8','c6'],['h1','h2'],['a8','b8']])play(a,b);
    clickSquare(board,'f3');
    const rich=ChessGame.getSnapshot().gameState;
    assert(rich.captured.white.length===1&&!rich.castlingRights.white.king&&!rich.castlingRights.black.queen&&rich.halfmoveClock===3,'partida com captura/direitos perdidos/contador');
    actionsForCurrentGame();
    const before=main();
    $('chess-restart').click();
    assert($('chess-restart-dialog').open,'confirmação principal aberta');
    assert(!ChessLearning.setMode('learn')&&main()===before,'modal principal bloqueia mudança de modo');
    $('chess-restart-cancel').click();
    assert(main()===before,'cancelamento mantém partida');
    for(const name of ['play','learn','practice']) {
        assert($('chess-mode-'+name).getAttribute('role')==='tab','modo acessível');
        assert($('chess-'+name+'-panel').getAttribute('role')==='tabpanel','painel acessível');
    }
    return count+' verificações da interface educativa passaram; '+comparisons+' comparações completas da partida.';
}

/* O catálogo de uma lição mantém a regressão original da Etapa4; o curso é validado separadamente. */
function chessStage4Fixture(catalog) {
    return Object.freeze({topics:Object.freeze(catalog.topics.map(t=>Object.freeze({...t,available:t.id==='rooks'}))),
        lessons:Object.freeze([catalog.lessons.find(l=>l.id==='rooks')])});
}
function testChessCourseModel(L,catalog,C) {
    let n=0;
    const assert=(v,m)=>{if(!v)throw Error(m);n++;},json=v=>JSON.stringify(v);
    const pos=s=>({row:8-Number(s[1]),col:'abcdefgh'.indexOf(s[0])});
    const move=m=>({from:pos(m.from),to:pos(m.to),...(m.promotion?{promotion:m.promotion}:{})});
    assert(catalog.lessons.length===15&&catalog.topics.every(t=>t.available),'15 lições funcionais');
    assert(new Set(catalog.lessons.map(l=>l.id)).size===15,'identificadores únicos');
    const total=catalog.lessons.reduce((v,l)=>v+l.exercises.length,0);
    assert(total===30,'30 exercícios');
    let demonstrations=0,exercises=0,wrongLegal=0;
    function valid(state) {
        const a=C.kingPosition(state,'white'),b=C.kingPosition(state,'black');
        assert(Math.max(Math.abs(a.row-b.row),Math.abs(a.col-b.col))>1,'reis não vizinhos');
        assert(!C.isKingInCheck(state,state.currentPlayer==='white'?'black':'white'),'lado anterior não ficou em xeque');
        assert(!state.board[0].some(p=>p?.type==='p')&&!state.board[7].some(p=>p?.type==='p'),'sem peão não promovido na última fileira');
    }
    for(const lesson of catalog.lessons) {
        assert(lesson.explanation.length>=3&&lesson.exercises.length>0,'conteúdo e exercício: '+lesson.id);
        const s=L.createSession(lesson),initial=s.getSnapshot();
        valid(initial.demoState);
        for(const step of lesson.demo.moves) {
            const before=json(s.getSnapshot()),exerciseBefore=json(s.getSnapshot().exerciseState);
            const view=s.getDemoView();
            for(const p of view.forbidden)assert(!view.legal.some(m=>m.to.row===p.row&&m.to.col===p.col),'marcação proibida confirmada pelo motor');
            assert(s.demonstrate().kind==='correct','demonstração legal: '+lesson.id);
            valid(s.getSnapshot().demoState);
            if(step.kind==='observe'&&step.from&&step.forbidden)assert(s.getDemoView().forbidden.length===step.forbidden.length,'observação final preserva destinos proibidos');
            assert(json(s.getSnapshot().exerciseState)===exerciseBefore,'demonstração não altera exercício');
            assert(s.rewindDemo()&&json(s.getSnapshot())===before,'voltar recupera estado completo');
            assert(s.demonstrate().kind==='correct','reexecutar etapa');demonstrations++;
        }
        s.resetDemo();assert(json(s.getSnapshot())===json(initial),'reiniciar demonstração completa');
        for(const e of lesson.exercises) {
            assert(s.selectExercise(e.id),'selecionar atividade');
            s.resetExercise();
            const before=json(s.getSnapshot()),original=json(s.getSnapshot().exerciseState);
            const others=lesson.exercises.filter(x=>x.id!==e.id).map(x=>[x.id,json(s.getExerciseSnapshot(x.id))]);
            valid(s.getSnapshot().exerciseState);
            assert(e.hint&&e.feedback.correct&&e.feedback.incorrect&&e.instructions,'instruções/dica/feedback');
            if((e.type??'move')==='move') {
                const from=pos(e.solution[0].from);
                assert(s.attempt({from,to:from}).kind==='illegal','jogada imóvel é ilegal');
                assert(json(s.getSnapshot())===before,'ilegal preserva todo estado');
                const legal=C.allLegalMoves(s.getSnapshot().exerciseState);
                const negative=legal.find(m=>{
                    const next=C.movePiece(s.getSnapshot().exerciseState,m.from,m.to,m.promotion);
                    if(e.criterion?.type==='resolve-check')return C.isKingInCheck(next,e.criterion.color);
                    if(e.criterion?.type==='checkmate')return !C.isCheckmate(next);
                    const expected=move(e.solution[0]);
                    return json(m.from)!==json(expected.from)||json(m.to)!==json(expected.to)||m.promotion!==expected.promotion;
                });
                if(negative) {
                    assert(s.attempt(negative).kind==='incorrect','jogada legal errada rejeitada');
                    assert(json(s.getSnapshot())===before,'erro legal preserva todo estado');wrongLegal++;
                }
                for(const step of e.solution)assert(s.attempt(move(step)).kind==='correct','solução legal: '+e.id);
            } else if(e.type==='select') {
                const state=s.getSnapshot().exerciseState;
                const correct=p=>(!e.answer.square||C.squareName(p)===e.answer.square)&&(!e.answer.type||state.board[p.row][p.col]?.type===e.answer.type)&&(!e.answer.color||state.board[p.row][p.col]?.color===e.answer.color);
                const cells=Array.from({length:64},(_,i)=>({row:Math.floor(i/8),col:i%8}));
                assert(s.attempt({select:cells.find(p=>!correct(p))}).kind==='incorrect','identificação errada');
                assert(json(s.getSnapshot())===before,'erro de identificação sem mutação');
                assert(s.attempt({select:cells.find(correct)}).complete,'identificação correta');
                assert(json(s.getSnapshot().exerciseState)===original,'identificação não movimenta peças');
            } else {
                const expected=e.criterion.type==='draw-claim'?e.criterion.reason:L.classifyPosition(s.getSnapshot().exerciseState);
                assert(s.attempt({choice:e.choices.find(c=>c.value!==expected).value}).kind==='incorrect','classificação errada');
                assert(json(s.getSnapshot())===before,'erro de classificação sem mutação');
                assert(s.attempt({choice:expected}).complete,'classificação pelo motor');
                assert(json(s.getSnapshot().exerciseState)===original,'classificação não muda estado');
            }
            assert(s.getSnapshot().complete,'conclusão de atividade: '+e.id);
            for(const [id,value] of others)assert(json(s.getExerciseSnapshot(id))===value,'outras atividades independentes');
            s.resetExercise();assert(json(s.getSnapshot().exerciseState)===original&&!s.getSnapshot().complete,'reinício de exercício');
            exercises++;
        }
        assert(!s.selectExercise('id-inexistente'),'atividade inexistente recusada');
    }
    const p=L.createProgress(catalog.lessons);
    assert(p.getSnapshot().solved===0&&p.getSnapshot().total===30,'progresso inicial');
    for(const l of catalog.lessons)for(const e of l.exercises) {
        assert(p.record(l.id,e.id),'primeira resolução registrada');
        assert(!p.record(l.id,e.id),'revisão não duplica resolução');
    }
    assert(p.getSnapshot().complete&&p.getSnapshot().lessons.every(l=>l.complete),'curso concluído');
    assert(!p.record('unknown','unknown')&&p.getSnapshot().solved===30,'progresso desconhecido recusado');
    const restored=L.createProgress(catalog.lessons,[...p.getSnapshot().resolved,'invalid/id']);
    assert(restored.getSnapshot().solved===30,'estado preparado para futura restauração validada');
    const leaked=p.getSnapshot();leaked.resolved.length=0;
    assert(p.getSnapshot().solved===30,'snapshot de progresso não expõe estado');
    const ep=L.createSession(catalog.lessons.find(l=>l.id==='en-passant')).getSnapshot().exerciseState;
    assert(ep.moveHistory.length===1&&ep.enPassantTarget&&C.getLegalMoves(ep,3,4).some(m=>m.enPassant),'en passant decorre de jogada real');
    const castle=L.createSession(catalog.lessons.find(l=>l.id==='castling'));
    castle.attempt(move(castle.getExercise().solution[0]));
    assert(castle.getSnapshot().exerciseState.board[7][5]?.type==='r'&&castle.getSnapshot().exerciseState.board[7][6]?.type==='k','roque move rei e torre');
    const promotion=L.createSession(catalog.lessons.find(l=>l.id==='promotion'));
    promotion.selectExercise('promote-knight');promotion.attempt(move(promotion.getExercise().solution[0]));
    assert(promotion.getSnapshot().exerciseState.board[0][6]?.type==='n','subpromoção real');
    assert(wrongLegal>=10,'negativos legais para exercícios de movimento');
    return n+' verificações do curso passaram; '+demonstrations+' etapas e '+exercises+' exercícios.';
}
function testChessCourseUI() {
    let count=0,comparisons=0;
    const assert=(v,m)=>{if(!v)throw Error(m);count++;},json=v=>JSON.stringify(v);
    const $=id=>document.getElementById(id),sq=s=>({row:8-Number(s[1]),col:'abcdefgh'.indexOf(s[0])});
    const click=(board,p)=>board.children[p.row*8+p.col].click();
    const main=$('chess-board');
    const scenarios=[
        [['e2','e4'],['a7','a6'],['e4','e5'],['d7','d5']],
        [['e2','e4'],['d7','d5'],['e4','d5'],['g8','f6'],['g1','f3'],['h7','h6'],['h2','h3'],['b8','c6'],['h1','h2'],['a8','b8']]
    ];
    for(const [index,sequence] of scenarios.entries()) {
        ChessLearning.setMode('play');restartChessForTest();
        for(const [a,b] of sequence){click(main,sq(a));click(main,sq(b));}
        click(main,sq(index?'f3':'e5'));
        const before=json(ChessGame.getSnapshot());
        const safe=(fn,label)=>{fn();assert(json(ChessGame.getSnapshot())===before,'partida íntegra: '+label);comparisons++;};
        for(const lesson of ChessLessons.lessons) {
            safe(()=>ChessLearning.loadLesson(lesson.id),'abrir '+lesson.id);
            safe(()=>ChessLearning.setMode('learn'),'Aprender');
            safe(()=>$('chess-demo-reset').click(),'reiniciar demonstração');
            const first=json(ChessLearning.getSnapshot().session.demoState);
            for(const step of lesson.demo.moves)safe(()=>$('chess-demo-next').click(),'etapa '+lesson.id);
            assert($('chess-demo-next').disabled,'fim da demonstração');
            safe(()=>$('chess-demo-previous').click(),'voltar etapa');
            safe(()=>$('chess-demo-reset').click(),'reiniciar após voltar');
            assert(json(ChessLearning.getSnapshot().session.demoState)===first,'demonstração restaurada');
            safe(()=>ChessLearning.setMode('practice'),'Praticar');
            for(const e of lesson.exercises) {
                safe(()=>{$('chess-exercise-select').value=e.id;$('chess-exercise-select').dispatchEvent(new Event('change'));},'selecionar '+e.id);
                safe(()=>$('chess-practice-retry').click(),'reiniciar atividade');
                const state=ChessLearning.getSnapshot().session.exerciseState,initial=json(state),board=$('chess-practice-board');
                safe(()=>$('chess-practice-hint').click(),'dica');
                assert($('chess-practice-feedback').textContent===e.hint,'dica correta');
                if((e.type??'move')==='move') {
                    const from=sq(e.solution[0].from);
                    safe(()=>click(board,from),'seleção');
                    const invalid=Array.from({length:64},(_,i)=>({row:Math.floor(i/8),col:i%8})).find(p=>!state.board[p.row][p.col]&&!Chess.getLegalMoves(state,from.row,from.col).some(m=>m.to.row===p.row&&m.to.col===p.col));
                    if(invalid)safe(()=>click(board,invalid),'destino ilegal');
                    assert(json(ChessLearning.getSnapshot().session.exerciseState)===initial,'ilegal não alterou exercício');
                    for(const step of e.solution) {
                        safe(()=>click(board,sq(step.from)),'origem correta');
                        if(step.promotion)safe(()=>{$('chess-practice-promotion').value=step.promotion;},'escolha de promoção');
                        safe(()=>click(board,sq(step.to)),'destino correto');
                    }
                } else if(e.type==='select') {
                    const correct=p=>(!e.answer.square||Chess.squareName(p)===e.answer.square)&&(!e.answer.type||state.board[p.row][p.col]?.type===e.answer.type)&&(!e.answer.color||state.board[p.row][p.col]?.color===e.answer.color);
                    const cells=Array.from({length:64},(_,i)=>({row:Math.floor(i/8),col:i%8}));
                    safe(()=>click(board,cells.find(p=>!correct(p))),'identificação errada');
                    assert($('chess-practice-feedback').dataset.kind==='incorrect'&&json(ChessLearning.getSnapshot().session.exerciseState)===initial,'erro de identificação preservado');
                    safe(()=>click(board,cells.find(correct)),'identificação correta');
                } else {
                    const expected=e.criterion.type==='draw-claim'?e.criterion.reason:ChessLearning.classifyPosition(state);
                    safe(()=>[...$('chess-practice-choices').children].find(b=>b.dataset.choice!==expected).click(),'classificação errada');
                    assert($('chess-practice-feedback').dataset.kind==='incorrect'&&json(ChessLearning.getSnapshot().session.exerciseState)===initial,'erro de classificação preservado');
                    safe(()=>[...$('chess-practice-choices').children].find(b=>b.dataset.choice===expected).click(),'classificação correta');
                }
                assert(ChessLearning.getSnapshot().session.complete,'exercício concluído: '+e.id);
                assert($('chess-practice-feedback').dataset.kind==='correct','feedback acessível correto');
                assert(ChessLearning.getSnapshot().progress.solved<=30,'sem duplicação de progresso');
            }
            safe(()=>ChessLearning.setMode('play',true),'retorno à partida');
            assert(main.contains(document.activeElement),'foco retorna ao tabuleiro original');
        }
        assert(ChessLearning.getSnapshot().progress.solved===30&&ChessLearning.getSnapshot().progress.complete,'curso completo em memória');
        safe(()=>ChessLearning.setMode('learn'),'exibir conclusão');
        assert(!$('chess-course-finish').hidden&&$('chess-course-summary').textContent.includes('30 de 30'),'conclusão visível');
        safe(()=>ChessLearning.loadLesson('pieces'),'revisar lição anterior');
        assert(!$('chess-lesson-select').options[0].disabled,'acesso livre');
        safe(()=>ChessLearning.setMode('play',true),'voltar após revisão');
    }
    return count+' verificações da interface do curso passaram; '+comparisons+' comparações integrais da partida.';
}
