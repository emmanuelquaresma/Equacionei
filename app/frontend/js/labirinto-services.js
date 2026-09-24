const MathMazeStorage = (() => {
    function create(storage,onError=()=>{}) {
        const key='mathMazeHighScore',preferences='mathMazePreferences',historyKey='mathMazeSessions';
        let available=true,record={score:0,highestTable:2},history=[],sound=false,tutorial=false;
        function read(k){try{return JSON.parse(storage.getItem(k));}catch{available=false;onError();return null;}}
        const old=read(key),pref=read(preferences),sessions=read(historyKey);
        if(old&&Number.isFinite(old.score)&&old.score>=0)record={score:old.score,highestTable:Number.isInteger(old.highestTable)?Math.max(2,Math.min(12,old.highestTable)):2};
        if(pref){sound=pref.sound===true;tutorial=pref.tutorial===true;}
        if(Array.isArray(sessions))history=sessions.slice(-20);
        function write(k,value){if(!available)return;try{storage.setItem(k,JSON.stringify(value));}catch{available=false;onError();}}
        function preferencesChanged(){write(preferences,{sound,tutorial});}
        return {
            getRecord:()=>({...record}),soundEnabled:()=>sound,tutorialSeen:()=>tutorial,
            setSound(value){sound=Boolean(value);preferencesChanged();},
            markTutorial(){tutorial=true;preferencesChanged();},
            save(summary){
                record.score=Math.max(record.score,summary.score);record.highestTable=Math.max(record.highestTable,summary.highestTable);
                const entry={...summary},index=history.findIndex(s=>s.startedAt===entry.startedAt);
                if(index<0)history.push(entry);else history[index]=entry;
                history=history.slice(-20);write(key,record);write(historyKey,history);
            }
        };
    }
    return {create};
})();

const MathMazeAudio = (() => {
    // Sequências originais sintetizadas; sem amostras ou música externa.
    const sounds={correct:[660,880],life:[240,160],power:[440,660,990],capture:[550,830],phaseComplete:[523,659,784,1047],complete:[523,659,784,1047,1318],gameover:[330,260,196]};
    function create(enabled=false,Context=globalThis.AudioContext||globalThis.webkitAudioContext) {
        let context=null;const active=new Set();
        function stop(){for(const oscillator of active){try{oscillator.stop();}catch{}}active.clear();}
        function unlock(){if(!enabled||!Context)return;try{context??=new Context();context.resume()?.catch(()=>{});}catch{context=null;}}
        function play(name){
            if(!enabled||!context||context.state!=='running'||!sounds[name])return;
            try {
                sounds[name].forEach((frequency,i)=>{
                    const oscillator=context.createOscillator(),gain=context.createGain(),start=context.currentTime+i*.075;
                    oscillator.type='sine';oscillator.frequency.value=frequency;gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(.045,start+.012);gain.gain.exponentialRampToValueAtTime(.001,start+.1);
                    oscillator.connect(gain);gain.connect(context.destination);active.add(oscillator);oscillator.onended=()=>{active.delete(oscillator);oscillator.disconnect();gain.disconnect();};oscillator.start(start);oscillator.stop(start+.11);
                });
            } catch { /* Falta de áudio não interrompe o jogo. */ }
        }
        return {unlock,play,stop,setEnabled(value){enabled=value;if(!enabled)stop();else unlock();},isEnabled:()=>enabled};
    }
    return {create};
})();
