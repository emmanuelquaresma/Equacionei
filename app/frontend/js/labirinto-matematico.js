/* Interface, renderização e controles; regras ficam em labirinto-engine.js. */
(() => {
    const $=id=>document.getElementById('m-'+id),E=MathMazeGame,canvas=$('board'),ctx=canvas.getContext('2d');
    let browserStorage;try{browserStorage=localStorage;}catch{}
    const store=MathMazeStorage.create(browserStorage,()=>{$('storage').textContent='Armazenamento indisponível; o jogo funciona, mas os resultados ficarão apenas nesta página.';});
    const audio=MathMazeAudio.create(store.soundEnabled());
    let state=null,frame=0,previous=0,lastStatus='',messageUntil=0,tutorial=false;
    const visual=new Map(),reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
    // Mede apenas a apresentação; as coordenadas lógicas permanecem intactas.
    function resizeGameBoard() {
        if (!state || $('play').hidden) return;
        const page = document.querySelector('.maze-page');
        const layout = document.querySelector('.maze-layout');
        const hud = document.querySelector('.maze-hud');
        const controls = document.querySelector('.maze-controls');
        const header = document.querySelector('.site-header');
        const style = getComputedStyle(page), layoutStyle = getComputedStyle(layout);
        const viewport = window.visualViewport?.height || window.innerHeight;
        const landscape = matchMedia('(max-width: 1000px) and (orientation: landscape)').matches;
        const spacing = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)
            + parseFloat(getComputedStyle(hud).marginBottom) + parseFloat(layoutStyle.rowGap);
        // Inclui feedback e legenda: mensagens maiores também cabem na reserva.
        const reservedControls = landscape ? 0 : controls.getBoundingClientRect().height;
        const availableHeight = viewport - header.offsetHeight - hud.offsetHeight - spacing - reservedControls;
        const availableWidth = landscape ? (layout.clientWidth - parseFloat(layoutStyle.columnGap)) / 2 : layout.clientWidth;
        const rows = state.grid.length, columns = state.grid[0].length;
        const cell = Math.max(1, Math.min(availableWidth / columns, availableHeight / rows, 650 / columns));
        page.style.setProperty('--maze-board-width', `${Math.floor(cell * columns)}px`);
    }
    window.addEventListener('resize', resizeGameBoard);
    window.addEventListener('orientationchange', resizeGameBoard);
    window.visualViewport?.addEventListener('resize', resizeGameBoard);
    if (typeof ResizeObserver !== 'undefined') {
        const observer = new ResizeObserver(resizeGameBoard);
        ['.site-header', '.maze-hud', '.maze-controls'].forEach(selector => observer.observe(document.querySelector(selector)));
    }
    function text(id,value){if($(id).textContent!==String(value))$(id).textContent=value;}
    function syncSound(){const on=audio.isEnabled();$('sound').textContent=on?'🔊 Som ligado':'🔇 Som desligado';$('sound').setAttribute('aria-pressed',String(on));}
    function save(){if(state)store.save(E.summary(state));}
    function position(id,p,now){
        let v=visual.get(id);
        if(!v||Math.abs(v.to.row-p.row)+Math.abs(v.to.col-p.col)>1){v={from:{...p},to:{...p},at:now};visual.set(id,v);}
        if(v.to.row!==p.row||v.to.col!==p.col){v={from:{...v.to},to:{...p},at:now};visual.set(id,v);}
        const t=reducedMotion.matches?1:Math.min(1,(now-v.at)/80);
        return {row:v.from.row+(v.to.row-v.from.row)*t,col:v.from.col+(v.to.col-v.from.col)*t};
    }
    function render(now) {
        const cell=canvas.width/state.grid.length;
        ctx.fillStyle='#f5f9fc';ctx.fillRect(0,0,650,650);
        state.grid.forEach((line,row)=>line.forEach((wall,col)=>{if(wall){ctx.fillStyle='#b7d4e8';ctx.fillRect(col*cell+2,row*cell+2,cell-4,cell-4);ctx.fillStyle='#d4e7f4';ctx.fillRect(col*cell+4,row*cell+4,cell-8,4);}}));
        ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='700 25px system-ui';
        for(const [key,value] of state.items){const [r,c]=key.split(',').map(Number);ctx.fillStyle='#fff';ctx.fillRect(c*cell+3,r*cell+7,cell-6,cell-14);ctx.strokeStyle='#d7e5ee';ctx.lineWidth=1;ctx.strokeRect(c*cell+3,r*cell+7,cell-6,cell-14);ctx.fillStyle='#163653';ctx.fillText(value,(c+.5)*cell,(r+.5)*cell,cell-8);}
        for(const key of state.powers){const [r,c]=key.split(',').map(Number);ctx.fillStyle='#ffe087';ctx.beginPath();ctx.arc((c+.5)*cell,(r+.5)*cell,16,0,Math.PI*2);ctx.fill();ctx.fillStyle='#734d00';ctx.font='700 24px system-ui';ctx.fillText('⚡',(c+.5)*cell,(r+.5)*cell);}
        state.operators.forEach((op,i)=>{
            const p=position('operator'+i,op.position,now),x=(p.col+.5)*cell,y=(p.row+.5)*cell;
            ctx.fillStyle=op.state==='VULNERABLE'?'#e5f3d1':op.state==='RETURNING'?'#e4e8ed':'#81553d';
            ctx.strokeStyle=op.state==='VULNERABLE'?'#426323':'#4c362b';ctx.lineWidth=3;
            // Robôs quadrados com parafusos, símbolo central e marca explícita de estado.
            ctx.fillRect(x-18,y-18,36,36);ctx.strokeRect(x-18,y-18,36,36);
            ctx.fillStyle=op.state==='NORMAL'?'#fff':'#253a27';ctx.font='700 27px system-ui';ctx.fillText(op.symbol,x,y);
            if(op.state!=='NORMAL'){ctx.font='700 19px system-ui';ctx.fillText(op.state==='RETURNING'?'↩':'◇',x+16,y-19);}
            ctx.fillStyle='#ffe087';ctx.fillRect(x-15,y-15,4,4);ctx.fillRect(x+11,y+11,4,4);
        });
        const p=position('player',state.player,now),x=(p.col+.5)*cell,y=(p.row+.5)*cell;
        ctx.fillStyle='#17659a';ctx.beginPath();ctx.moveTo(x,y-20);ctx.lineTo(x+19,y);ctx.lineTo(x,y+20);ctx.lineTo(x-19,y);ctx.closePath();ctx.fill();
        ctx.fillStyle='#fff';ctx.fillRect(x-8,y-5,5,5);ctx.fillRect(x+3,y-5,5,5);
        if(state.shield>0){ctx.strokeStyle='#17659a';ctx.lineWidth=3;ctx.setLineDash([4,4]);ctx.strokeRect(x-23,y-23,46,46);ctx.setLineDash([]);}
        if(state.status!=='running'){ctx.fillStyle='#f7fafcb8';ctx.fillRect(0,0,650,650);ctx.fillStyle='#163653';ctx.font='700 32px system-ui';ctx.fillText(state.status==='paused'?'Pausado':state.status==='phaseComplete'?'Fase concluída':state.status==='complete'?'Campanha completa!':'Fim de jogo',325,325);}
        text('target',`×${state.table}`);text('instruction',`Pegue somente os múltiplos de ${state.table}: ${state.table} × 1 até ${state.table} × 12.`);
        text('phase',state.phase);text('score',state.score.toLocaleString('pt-BR'));text('lives','♥ '.repeat(state.lives).trim()||'0');text('remaining',state.remaining);
        text('record',Math.max(store.getRecord().score,state.score).toLocaleString('pt-BR'));text('power',state.power>0?`${(state.power/1000).toFixed(1)} s`:'—');
        $('pause').disabled=!['running','paused'].includes(state.status);text('pause',state.status==='paused'?'Continuar':'Pausar');
        document.querySelectorAll('[data-direction]').forEach(button=>button.disabled=state.status!=='running');
    }
    function showStatus(){
        if(lastStatus===state.status)return;lastStatus=state.status;
        const running=state.status==='running';$('dialog').hidden=running;
        if(running)return;
        audio.stop();save();
        $('again').hidden=!['gameover','complete'].includes(state.status);$('continue').hidden=['gameover','complete'].includes(state.status);
        if(state.status==='paused'){
            text('dialog-title',tutorial?'Primeira missão: tabuada do 2':'Jogo pausado');
            text('dialog-text',tutorial?'Pegue 2, 4, 6, 8… até 24. Evite os outros números. As setas e os botões direcionais movem você; as bolinhas ⚡ deixam os Operadores vulneráveis.':'O mapa, os Operadores e o tempo de poder estão parados.');
        }else {
            text('dialog-title',state.status==='complete'?'🏆 Você completou o Labirinto Matemático!':state.status==='phaseComplete'?`Tabuada do ${state.table} completa!`:'Fim de jogo');
            text('dialog-text',`${state.score.toLocaleString('pt-BR')} pontos · ${state.lives} vidas · Recorde: ${store.getRecord().score.toLocaleString('pt-BR')} · Tabuada alcançada: ${state.stats.highestTable} · Acertos: ${state.stats.correctNumbers} · Erros: ${state.stats.wrongNumbers} · Operadores capturados: ${state.stats.operatorsCaptured}.${state.status==='phaseComplete'?` Próxima tabuada: ${state.table+1}.`:''}`);
        }
        $('dialog-title').focus();
    }
    function consumeEvents(now){
        for(const event of state.events.splice(0)){text('feedback',event.text);messageUntil=now+4000;audio.play(event.type);}
        if(now>messageUntil)text('feedback',state.shield>0?'Proteção ativa.':`Encontre os ${state.remaining} números restantes.`);
    }
    function loop(now){
        if(!state)return;
        const delta=now-previous;previous=now;
        if(delta>1500&&state.status==='running')E.pause(state);else E.update(state,Math.max(0,delta));
        showStatus();consumeEvents(now);render(now);frame=requestAnimationFrame(loop);
    }
    function start(){
        cancelAnimationFrame(frame);save();audio.unlock();state=E.create();visual.clear();lastStatus='';
        $('setup').hidden=true;$('play').hidden=false;tutorial=!store.tutorialSeen();
        if(tutorial)E.pause(state);
        previous=performance.now();showStatus();consumeEvents(previous);render(previous);frame=requestAnimationFrame(loop);
        resizeGameBoard();
        if(!tutorial){canvas.focus({preventScroll:true});$('play').scrollIntoView({block:'start'});}
    }
    function pause(){if(!state)return;if(state.status==='paused')resume();else E.pause(state);showStatus();}
    function resume(){
        audio.unlock();if(tutorial){store.markTutorial();tutorial=false;}
        if(state.status==='phaseComplete'){E.nextPhase(state);visual.clear();}else E.resume(state);
        previous=performance.now();showStatus();resizeGameBoard();canvas.focus({preventScroll:true});$('play').scrollIntoView({block:'start'});
    }
    function input(direction){if(!state)return;audio.unlock();E.setDirection(state,direction);canvas.focus({preventScroll:true});}
    $('start').addEventListener('click',start);$('again').addEventListener('click',start);$('continue').addEventListener('click',resume);$('pause').addEventListener('click',pause);
    $('sound').addEventListener('click',()=>{audio.setEnabled(!audio.isEnabled());store.setSound(audio.isEnabled());syncSound();if(audio.isEnabled())audio.play('correct');});
    const keys={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',a:'left',s:'down',d:'right'};
    document.addEventListener('keydown',event=>{
        if(!state||event.target.closest('.site-header')||event.ctrlKey||event.altKey||event.metaKey)return;
        const key=event.key.length===1?event.key.toLowerCase():event.key;
        if(keys[key]&&state.status==='running'){event.preventDefault();input(keys[key]);}
        if(key==='p'&&!event.repeat&&['running','paused'].includes(state.status)){event.preventDefault();pause();}
    });
    document.querySelectorAll('[data-direction]').forEach(button=>button.addEventListener('click',()=>input(button.dataset.direction)));
    let gesture=null;
    canvas.addEventListener('pointerdown',event=>{if(!state||state.status!=='running')return;gesture={id:event.pointerId,x:event.clientX,y:event.clientY};canvas.setPointerCapture(event.pointerId);});
    canvas.addEventListener('pointerup',event=>{
        if(!gesture||gesture.id!==event.pointerId)return;
        const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y;gesture=null;
        if(Math.max(Math.abs(dx),Math.abs(dy))<16)return;
        input(Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up');
    });
    canvas.addEventListener('pointercancel',()=>{gesture=null;});
    document.addEventListener('visibilitychange',()=>{if(document.hidden&&state?.status==='running'){E.pause(state);showStatus();}});
    window.addEventListener('pagehide',()=>{cancelAnimationFrame(frame);audio.stop();if(state?.status==='running')E.pause(state);save();});
    window.addEventListener('pageshow',event=>{if(event.persisted&&state){previous=performance.now();lastStatus='';showStatus();frame=requestAnimationFrame(loop);}});
    text('initial-record',`Recorde: ${store.getRecord().score.toLocaleString('pt-BR')} pontos · Maior tabuada: ${store.getRecord().highestTable}`);syncSound();
})();
