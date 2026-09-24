/* Armazenamento local independente de recordes e sessões multiplayer. */
(() => {
    const KEY='matematica.learning.attempts.v1', PROGRESS='matematica.learning.progress.v1', LIMIT=1000;
    const valid = row => row && row.version===1 && ['lightning','queda'].includes(row.game)
        && typeof row.questionId==='string' && typeof row.question==='string'
        && Number.isFinite(row.expected) && (row.answer===null||Number.isFinite(row.answer))
        && Number.isFinite(row.responseMs) && row.responseMs>=0 && ['answer','timeout'].includes(row.outcome)
        && Array.isArray(row.operations) && typeof row.timestamp==='string';
    let memory=[], progress={activities:[],examples:[],runs:[]}, persistent=true;
    function read(key,fallback) { if(!persistent)return fallback; try { const value=JSON.parse(localStorage.getItem(key));return value??fallback; }catch(_){persistent=false;return fallback;} }
    function write(key,value) { try {localStorage.setItem(key,JSON.stringify(value));return true;}catch(_){persistent=false;return false;} }
    function attempts() {
        const rows=read(KEY,memory);
        if(Array.isArray(rows)) memory=rows.filter(valid).slice(-LIMIT);
        return memory.map(row=>({...row,operations:[...row.operations],correct:row.outcome==='answer'&&row.answer===row.expected}));
    }
    function record(input) {
        try {
            const row={...input,version:1,id:newId(),learner:'Aluno deste navegador',timestamp:new Date().toISOString()};
            if(!valid(row))return false;
            row.correct=row.outcome==='answer'&&row.answer===row.expected;
            memory=[...attempts(),row].slice(-LIMIT);write(KEY,memory);return true;
        } catch(_){return false;} // Falhas no histórico não interrompem o jogo.
    }
    function newId() {return globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`;}
    function loadProgress() {
        const value=read(PROGRESS,progress);
        if(value&&typeof value==='object'&&!Array.isArray(value))progress={
            activities:Array.isArray(value.activities)?value.activities.filter(v=>typeof v==='string').slice(0,30):[],
            examples:Array.isArray(value.examples)?value.examples.slice(0,100):[],
            runs:Array.isArray(value.runs)?value.runs.slice(-20):[]};
        return JSON.parse(JSON.stringify(progress));
    }
    function saveProgress(value) {progress=JSON.parse(JSON.stringify(value));write(PROGRESS,progress);}
    function clearAttempts() {memory=[];write(KEY,[]);}
    window.LearningData={attempts,record,newId,loadProgress,saveProgress,clearAttempts,limit:LIMIT,isPersistent:()=>persistent};
})();
