const MazeMath = (() => {
    function isCorrectNumber(number,table) { return Number.isInteger(number)&&Number.isInteger(table)&&table>=2&&table<=12&&number>=table&&number<=table*12&&number%table===0; }
    const getCorrectNumbers=table=>Array.from({length:12},(_,i)=>table*(i+1));
    function generateWrongNumbers(table,amount,random=Math.random) {
        const candidates=Array.from({length:table*12-1},(_,i)=>i+2).filter(n=>!isCorrectNumber(n,table));
        return MazeGenerator.shuffled(candidates,random).slice(0,amount);
    }
    return {isCorrectNumber,getCorrectNumbers,generateWrongNumbers};
})();

const MathMazeGame = (() => {
    const vectors={up:{row:-1,col:0},down:{row:1,col:0},left:{row:0,col:-1},right:{row:0,col:1}};
    const same=(a,b)=>a.row===b.row&&a.col===b.col;
    const difficulty=table=>({enemyInterval:Math.max(340,650-(table-2)*23),wrong:Math.min(10,4+Math.floor((table-2)/2)),operators:Math.min(4,2+Math.floor((table-2)/4)),powerDuration:Math.max(4000,6000-(table-2)*160)});
    function emit(s,type,text) {s.events.push({type,text});s.message=text;}
    function loadPhase(s,table) {
        const old=s.grid?JSON.stringify(s.grid):'';
        let grid=MazeGenerator.generateMaze(13,s.random);
        for(let i=0;i<8&&JSON.stringify(grid)===old;i++)grid=MazeGenerator.generateMaze(13,s.random);
        const positions=MazeGenerator.findPositions(grid,s.random),settings=difficulty(table);
        Object.assign(s,{grid,table,phase:table-1,settings,spawn:positions.player,player:{...positions.player,direction:null,queued:null,clock:0},
            power:0,shield:2000,combo:0,phaseLosses:0,remaining:12,status:'running'});
        s.operators=positions.operators.slice(0,settings.operators).map((home,i)=>({position:{...home},home:{...home},symbol:['+','−','×','÷'][i],behavior:['chase','ambush','fast','random'][i],state:'NORMAL',clock:0,speed:i===2?.8:1}));
        s.items=new Map();s.powers=new Set(positions.powers.map(MazeGenerator.key));
        const correct=MazeGenerator.shuffled(MazeMath.getCorrectNumbers(table),s.random);
        const reserved=new Set();
        correct.forEach((number,i)=>{const p=positions.items[i];reserved.add(MazeGenerator.key(p));s.items.set(MazeGenerator.key(p),number);});
        // Distratores não ocupam pontos de corte: sempre existe rota para contorná-los.
        const safeGrid=grid.map(row=>[...row]),wrongPositions=[];
        for(const p of positions.items) {
            if(reserved.has(MazeGenerator.key(p)))continue;
            safeGrid[p.row][p.col]=1;
            if(MazeGenerator.validateConnectivity(safeGrid,s.spawn))wrongPositions.push(p);
            else safeGrid[p.row][p.col]=0;
            if(wrongPositions.length===settings.wrong)break;
        }
        MazeMath.generateWrongNumbers(table,wrongPositions.length,s.random).forEach((number,i)=>s.items.set(MazeGenerator.key(wrongPositions[i]),number));
        s.stats.highestTable=Math.max(table,s.stats.highestTable);s.stats.byTable[table]??={correct:0,wrong:0};
        emit(s,'phase',`Tabuada do ${table}: pegue ${table} × 1 até ${table} × 12.`);
    }
    function create(random=Math.random) {
        const s={random,score:0,lives:3,elapsed:0,accumulator:0,events:[],stats:{game:'math-maze',startedAt:new Date().toISOString(),highestTable:2,correctNumbers:0,wrongNumbers:0,livesLost:0,operatorsCaptured:0,byTable:{}}};
        loadPhase(s,2);return s;
    }
    function setDirection(s,direction) {if(s.status==='running'&&vectors[direction])s.player.queued=direction;}
    function loseLife(s,message) {
        if(s.shield>0||s.status!=='running')return false;
        s.lives--;s.stats.livesLost++;s.phaseLosses++;
        if(s.lives===0){s.status='gameover';emit(s,'gameover','Fim de jogo. Vamos tentar novamente?');return true;}
        s.player={...s.spawn,direction:null,queued:null,clock:0};s.shield=2000;
        // As regiões iniciais foram escolhidas a pelo menos dez passos do jogador.
        s.operators.forEach(op=>{op.position={...op.home};op.clock=0;});
        emit(s,'life',message+' Uma vida a menos; proteção por 2 segundos.');return true;
    }
    function collideOperators(s) {
        for(const op of s.operators) {
            if(!same(s.player,op.position)||op.state==='RETURNING')continue;
            if(op.state==='VULNERABLE') {
                op.state='RETURNING';s.combo++;s.score+=200*2**Math.min(3,s.combo-1);s.stats.operatorsCaptured++;
                emit(s,'capture',`Operador ${op.symbol} capturado! +${200*2**Math.min(3,s.combo-1)}`);
            }else if(loseLife(s,'Você encontrou um Operador.'))break;
        }
    }
    function collect(s) {
        const key=MazeGenerator.key(s.player);
        if(s.powers.delete(key)) {
            s.power=s.settings.powerDuration;s.combo=0;
            s.operators.forEach(op=>{if(op.state!=='RETURNING')op.state='VULNERABLE';});
            emit(s,'power','Poder ativo! Operadores com ◇ podem ser capturados.');
        }
        if(!s.items.has(key))return;
        const n=s.items.get(key);
        if(MazeMath.isCorrectNumber(n,s.table)) {
            s.items.delete(key);s.score+=100;s.remaining--;s.stats.correctNumbers++;s.stats.byTable[s.table].correct++;
            emit(s,'correct',`✓ ${n} · +100`);
            if(s.remaining===0) {
                s.score+=500+(s.phaseLosses===0?300:0);s.status=s.table===12?'complete':'phaseComplete';
                emit(s,s.status,`Tabuada do ${s.table} completa! Bônus: ${s.phaseLosses===0?800:500} pontos.`);
            }
        }else if(s.shield<=0) {
            s.items.delete(key);s.stats.wrongNumbers++;s.stats.byTable[s.table].wrong++;
            loseLife(s,`✕ ${n} não pertence à tabuada do ${s.table}.`);
        }
    }
    function playerStep(s) {
        const p=s.player;
        function destination(direction){const d=vectors[direction];return d?{row:p.row+d.row,col:p.col+d.col}:null;}
        const wanted=destination(p.queued);
        if(wanted&&s.grid[wanted.row]?.[wanted.col]===0){p.direction=p.queued;p.queued=null;}
        const next=destination(p.direction);
        if(next&&s.grid[next.row]?.[next.col]===0){p.row=next.row;p.col=next.col;collect(s);}
        if(s.status==='running')collideOperators(s);
    }
    function operatorStep(s,op) {
        if(op.state==='RETURNING') {
            op.position=MazeGenerator.nextStep(s.grid,op.position,op.home,s.random);
            if(same(op.position,op.home))op.state='NORMAL';
            return;
        }
        let target={row:s.player.row,col:s.player.col};
        if(op.behavior==='ambush') {
            const d=vectors[s.player.direction];
            if(d)for(let i=0;i<2;i++){const q={row:target.row+d.row,col:target.col+d.col};if(s.grid[q.row]?.[q.col]===0)target=q;}
        }
        if(op.behavior==='random'&&op.state==='NORMAL') {
            const options=MazeGenerator.neighbors(s.grid,op.position);op.position=options[Math.floor(s.random()*options.length)]||op.position;
        }else op.position=MazeGenerator.nextStep(s.grid,op.position,target,s.random,op.state==='VULNERABLE');
        collideOperators(s);
    }
    function update(s,delta) {
        if(s.status!=='running'||!Number.isFinite(delta)||delta<=0)return;
        // Passos fixos evitam atravessar paredes e detectam cruzamento entre entidades.
        s.accumulator+=delta;
        while(s.accumulator>=10&&s.status==='running') {
            s.accumulator-=10;s.elapsed+=10;s.shield=Math.max(0,s.shield-10);
            const oldPower=s.power;s.power=Math.max(0,s.power-10);
            if(oldPower>0&&s.power===0)s.operators.forEach(op=>{if(op.state==='VULNERABLE')op.state='NORMAL';});
            s.player.clock+=10;
            if(s.player.clock>=180){s.player.clock-=180;playerStep(s);}
            if(s.status!=='running')break;
            for(const op of s.operators) {
                op.clock+=10;const interval=op.state==='RETURNING'?130:s.settings.enemyInterval*op.speed*(op.state==='VULNERABLE'?1.25:1);
                if(op.clock>=interval){op.clock-=interval;operatorStep(s,op);}
                if(s.status!=='running')break;
            }
        }
    }
    function pause(s){if(s.status==='running')s.status='paused';}
    function resume(s){if(s.status==='paused')s.status='running';}
    function nextPhase(s){if(s.status==='phaseComplete'){s.accumulator=0;loadPhase(s,s.table+1);}}
    const summary=s=>({...s.stats,byTable:JSON.parse(JSON.stringify(s.stats.byTable)),score:s.score,elapsed:s.elapsed,status:s.status,finishedAt:new Date().toISOString()});
    return {create,loadPhase,setDirection,update,pause,resume,nextPhase,collect,collideOperators,loseLife,summary,difficulty};
})();
