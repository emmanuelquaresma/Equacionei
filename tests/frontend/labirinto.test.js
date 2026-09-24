function testMathMaze(G,M,E) {
    let count=0;const assert=(v,m)=>{if(!v)throw Error(m);count++;};
    const seeded=seed=>()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
    for(let table=2;table<=12;table++) {
        const numbers=M.getCorrectNumbers(table);
        assert(numbers.length===12&&numbers.every(n=>M.isCorrectNumber(n,table)),'tabuada');
        assert(!M.isCorrectNumber(0,table)&&!M.isCorrectNumber(table*13,table)&&!M.isCorrectNumber(-table,table),'limites pedagógicos');
        assert(M.generateWrongNumbers(table,10,seeded(table)).every(n=>!M.isCorrectNumber(n,table)),'distratores');
        for(let seed=1;seed<=30;seed++) {
            const s=E.create(seeded(seed*table));E.loadPhase(s,table);
            assert(G.validateConnectivity(s.grid,s.spawn),'mapa conectado');
            assert(s.powers.size===4,'quatro poderes');
            assert([...s.items.values()].filter(n=>M.isCorrectNumber(n,table)).length===12,'doze objetivos');
            assert([...s.items.values()].filter(n=>!M.isCorrectNumber(n,table)).length>=4,'distratores suficientes');
            const safe=s.grid.map(row=>[...row]);for(const [key,n] of s.items)if(!M.isCorrectNumber(n,table)){const [r,c]=key.split(',').map(Number);safe[r][c]=1;}
            assert(G.validateConnectivity(safe,s.spawn),'todos os objetivos podem ser alcançados evitando TODOS os distratores');
            const reach=G.distances(s.grid,s.spawn);
            assert(s.operators.every(o=>reach.get(G.key(o.home))>=10),'spawn seguro');
            assert([...s.items.keys(),...s.powers].every(k=>reach.has(k)),'itens alcançáveis');
            assert([...s.powers].every(k=>!s.items.has(k))&&!s.items.has(G.key(s.spawn)),'sem sobreposição');
            assert([...s.items].filter(([k,n])=>!M.isCorrectNumber(n,table)).every(([k])=>reach.get(k)>2),'início sem erro adjacente');
            const floors=G.floors(s.grid),edges=floors.reduce((n,p)=>n+G.neighbors(s.grid,p).length,0)/2;
            assert(edges>=floors.length,'mapa possui ciclos');
        }
    }
    let s=E.create(seeded(4));s.shield=0;s.operators=[];
    E.setDirection(s,'up');E.update(s,180);assert(s.player.row===1,'parede bloqueia');
    // Fixture de corredor aberto isola cada direção sem depender do mapa.
    s.grid=Array.from({length:7},(_,r)=>Array.from({length:7},(_,c)=>r===0||c===0||r===6||c===6?1:0));s.items.clear();s.powers.clear();
    for(const [direction,row,col] of [['right',3,4],['down',4,3],['left',3,2],['up',2,3]]) {
        s.player={row:3,col:3,direction:null,queued:null,clock:0};E.setDirection(s,direction);E.update(s,180);
        assert(s.player.row===row&&s.player.col===col,'direção '+direction);
    }
    // Curva antecipada: sobe assim que encontra a abertura, sem atravessar a parede.
    s.player={row:3,col:2,direction:'right',queued:'up',clock:0};s.grid[2][2]=1;
    E.update(s,180);assert(s.player.row===3&&s.player.col===3&&s.player.queued==='up','buffer aguarda cruzamento');
    E.update(s,180);assert(s.player.row===2&&s.player.col===3,'buffer executa curva');
    const one=E.create(seeded(40)),many=E.create(seeded(40));
    E.setDirection(one,'right');E.setDirection(many,'right');E.update(one,1000);for(let i=0;i<100;i++)E.update(many,10);
    assert(JSON.stringify(one.player)===JSON.stringify(many.player)&&JSON.stringify(one.operators)===JSON.stringify(many.operators),'movimento independente do FPS');
    s=E.create(seeded(2));s.operators=[];let key=[...s.items].find(([k,n])=>M.isCorrectNumber(n,s.table))[0];
    const teleport=k=>{const [row,col]=k.split(',').map(Number);Object.assign(s.player,{row,col});};
    teleport(key);E.collect(s);assert(s.score===100&&s.remaining===11,'acerto');
    s.shield=0;key=[...s.items].find(([k,n])=>!M.isCorrectNumber(n,s.table))[0];teleport(key);E.collect(s);
    assert(s.lives===2&&s.shield===2000&&s.player.row===s.spawn.row&&s.player.col===s.spawn.col,'erro e respawn');
    E.loseLife(s,'teste');assert(s.lives===2,'proteção evita perdas seguidas');
    s=E.create(seeded(3));s.shield=0;s.operators[0].position={row:s.player.row,col:s.player.col};E.collideOperators(s);assert(s.lives===2,'colisão normal');
    key=[...s.powers][0];teleport(key);E.collect(s);assert(s.power===6000&&s.operators.every(o=>o.state==='VULNERABLE'),'poder');
    const op=s.operators[0];op.position={row:s.player.row,col:s.player.col};E.collideOperators(s);assert(op.state==='RETURNING'&&s.stats.operatorsCaptured===1&&s.score===200,'captura');
    const paused=JSON.stringify({...s,random:null});E.pause(s);const clock=s.elapsed,power=s.power;E.update(s,10000);assert(s.elapsed===clock&&s.power===power,'pausa congela timers');E.resume(s);
    s.player.direction=null;s.items.clear();s.shield=20000;E.update(s,6100);assert(s.power===0&&s.operators.every(o=>o.state!=='VULNERABLE'),'poder expira');
    assert(op.state==='NORMAL','retorno à origem');
    s=E.create(seeded(8));const maps=new Set();
    for(let table=2;table<=12;table++) {
        maps.add(JSON.stringify(s.grid));s.operators=[];
        for(const [k,n] of [...s.items])if(M.isCorrectNumber(n,table)){teleport(k);E.collect(s);}
        assert(s.status===(table===12?'complete':'phaseComplete'),'conclusão '+table);
        if(table<12)E.nextPhase(s);
    }
    assert(maps.size===11&&s.stats.correctNumbers===132,'campanha com novos mapas');
    assert(E.difficulty(12).enemyInterval<E.difficulty(2).enemyInterval&&E.difficulty(12).operators===4,'progressão');
    s=E.create(seeded(2));for(let n=0;n<3;n++){s.shield=0;E.loseLife(s,'teste');}
    assert(s.status==='gameover'&&s.lives===0&&s.stats.livesLost===3,'game over');
    const stopped=s.elapsed;E.update(s,1000);assert(s.elapsed===stopped,'fim bloqueia update');
    return `${count} verificações: geração, matemática, movimentos, vida, poder, pausa e campanha OK`;
}

function testMazeServices(Storage,Audio) {
    const assert=(v,m)=>{if(!v)throw Error(m);};
    const data=new Map([['other-game','intacto']]);const memory={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};
    let store=Storage.create(memory);store.setSound(true);store.markTutorial();
    store.save({startedAt:'one',score:900,highestTable:7});store.save({startedAt:'one',score:800,highestTable:6});
    store=Storage.create(memory);
    assert(store.getRecord().score===900&&store.getRecord().highestTable===7&&store.soundEnabled()&&store.tutorialSeen(),'persistência após reload');
    assert(JSON.parse(data.get('mathMazeSessions')).length===1&&data.get('other-game')==='intacto','sessão atualizada sem duplicar ou afetar outros jogos');
    let warned=false;store=Storage.create({getItem(){throw Error('bloqueado');}},()=>warned=true);store.save({startedAt:'a',score:10,highestTable:2});assert(warned&&store.getRecord().score===10,'fallback de storage');
    let tones=0,stops=0;
    class Context {
        constructor(){this.state='running';this.currentTime=0;this.destination={};}
        resume(){return Promise.resolve();}
        createOscillator(){return {frequency:{value:0},connect(){},disconnect(){},start(){tones++;},stop(){stops++;}};}
        createGain(){return {gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}};}
    }
    const audio=Audio.create(false,Context);audio.unlock();audio.play('correct');assert(tones===0,'som desligado');
    audio.setEnabled(true);audio.play('correct');assert(tones===2,'efeito sintetizado');audio.setEnabled(false);audio.play('life');assert(tones===2&&stops>=2,'mute interrompe efeitos');
    return 'Persistência, reload, falha de storage e áudio ligado/desligado: OK';
}

function testMazeUI(advance) {
    const $=id=>document.getElementById('m-'+id),E=MathMazeGame;
    const assert=(v,m)=>{if(!v)throw Error(m);};
    const original=E.create;let s;
    E.create=(...args)=>(s=original(...args));
    try {
        $('start').click();assert(!$('play').hidden,'abre partida');
        assert(s.status==='paused'&&!$('dialog').hidden,'tutorial inicial');$('continue').click();
        assert(s.status==='running','continua tutorial');
        const previous=s.elapsed;advance(500);assert(s.elapsed>previous,'loop atualiza');
        $('pause').click();const elapsed=s.elapsed;advance(800);assert(s.elapsed===elapsed&&s.status==='paused','pausa');$('continue').click();
        // Isola os controles do risco de colisão: dados de teste, não alteração do motor.
        s.operators=[];s.items.clear();s.powers.clear();s.grid=Array.from({length:7},(_,r)=>Array.from({length:7},(_,c)=>r===0||c===0||r===6||c===6?1:0));
        function center(){Object.assign(s.player,{row:3,col:3,direction:null,queued:null,clock:0});}
        center();const key=new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true,cancelable:true});$('board').dispatchEvent(key);advance(180);assert(key.defaultPrevented&&s.player.col===4,'seta');
        center();$('board').dispatchEvent(new KeyboardEvent('keydown',{key:'w',bubbles:true,cancelable:true}));advance(180);assert(s.player.row===2,'WASD');
        center();document.querySelector('[data-direction=down]').click();advance(180);assert(s.player.row===4,'D-pad');
        center();const capture=$('board').setPointerCapture;$('board').setPointerCapture=()=>{};
        $('board').dispatchEvent(new PointerEvent('pointerdown',{pointerId:1,clientX:100,clientY:100}));$('board').dispatchEvent(new PointerEvent('pointerup',{pointerId:1,clientX:30,clientY:100}));$('board').setPointerCapture=capture;advance(180);assert(s.player.col===2,'swipe');
        $('sound').click();assert($('sound').getAttribute('aria-pressed')==='true','som ligado');$('sound').click();assert($('sound').getAttribute('aria-pressed')==='false','som desligado');
        $('board').dispatchEvent(new KeyboardEvent('keydown',{key:'p',bubbles:true}));advance(10);assert(s.status==='paused','P pausa');$('continue').click();
        for(let n=0;n<3;n++){s.shield=0;E.loseLife(s,'teste');}advance(10);
        assert(!$('again').hidden&&s.lives===0,'fim e jogar novamente');$('again').click();assert(s.status==='running'&&s.lives===3,'reinício sem repetir tutorial');
        // Percorre fases pelo contrato público, coletando os objetivos reais de cada mapa.
        for(let table=2;table<=12;table++) {
            s.operators=[];
            for(const [key,value] of [...s.items])if(MazeMath.isCorrectNumber(value,table)){const [row,col]=key.split(',').map(Number);Object.assign(s.player,{row,col});E.collect(s);}
            advance(10);
            if(table<12){assert(!$('continue').hidden,'transição');$('continue').click();assert(s.table===table+1,'nova tabuada');}
        }
        assert(s.status==='complete'&&$('dialog-title').textContent.includes('completou'),'campanha completa');
        assert(JSON.parse(localStorage.getItem('mathMazeHighScore')).score===s.score,'recorde persistido');
        return 'Interface: início, tutorial, teclado, WASD, D-pad, swipe, pausa, som, game over, fases e campanha: OK';
    } finally {E.create=original;}
}
