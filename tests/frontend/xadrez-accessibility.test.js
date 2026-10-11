/* Interação sem alterar o motor ou a cobertura das regras. */
function testChessAccessibility(C) {
    let count=0;
    const assert=(v,m)=>{if(!v)throw Error(m);count++;};
    const $=id=>document.getElementById(id),board=$('chess-board');
    const restart=()=>restartChessForTest();
    const pos=name=>({row:8-Number(name[1]),col:'abcdefgh'.indexOf(name[0])});
    const click=name=>{const p=pos(name);board.children[p.row*8+p.col].click();};
    const play=(a,b)=>{click(a);click(b);};
    const key=(button,key,shiftKey=false)=>button.dispatchEvent(new KeyboardEvent('keydown',{key,shiftKey,bubbles:true,cancelable:true}));
    const focus=index=>board.children[index].focus();
    const once=()=>board.querySelectorAll('[tabindex="0"]').length===1;
    const snapshot=()=>JSON.stringify({
        pieces:[...board.children].map(b=>b.querySelector('.chess-piece')?.textContent??null),
        history:$('chess-history').innerHTML,turn:$('chess-turn').textContent,
        capturedWhite:$('captured-white').textContent,capturedBlack:$('captured-black').textContent
    });
    const contrast=(fg,bg)=>{
        const light=rgb=>rgb.match(/\d+(?:\.\d+)?/g).slice(0,3).map(n=>Number(n)/255)
            .map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4)
            .reduce((sum,n,i)=>sum+n*[.2126,.7152,.0722][i],0);
        const a=light(fg),b=light(bg);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
    };
    restart();
    assert(board.children.length===64,'continua com 64 casas');
    assert(once(),'tabuleiro tem uma única entrada por Tab');
    for(const [index,k,destination] of [
        [0,'ArrowLeft',0],[0,'ArrowUp',0],[7,'ArrowRight',7],[7,'ArrowUp',7],
        [8,'ArrowLeft',8],[15,'ArrowRight',15],[31,'ArrowRight',31],
        [56,'ArrowLeft',56],[56,'ArrowDown',56],[63,'ArrowRight',63],[63,'ArrowDown',63],
        [7,'ArrowDown',15],[8,'ArrowUp',0],[8,'ArrowRight',9],[9,'ArrowLeft',8],
        [56,'ArrowRight',57],[63,'ArrowUp',55]
    ]) {
        focus(index);key(board.children[index],k);
        assert(document.activeElement===board.children[destination],'seta '+k+' em '+index+' chega a '+destination);
        assert(once(),'uma entrada por Tab após '+k);
    }
    const files=[...board.querySelectorAll('.chess-coordinate-file')],ranks=[...board.querySelectorAll('.chess-coordinate-rank')];
    assert(files.map(e=>e.textContent).join('')==='abcdefgh','colunas a–h em ordem');
    assert(ranks.map(e=>e.textContent).join('')==='87654321','fileiras 8–1 em ordem');
    assert(files.length===8&&ranks.length===8,'16 coordenadas visuais');
    assert([...files,...ranks].every(e=>e.getAttribute('aria-hidden')==='true'),'coordenadas não duplicam nomes acessíveis');
    assert([...files,...ranks].every(e=>{
        const a=e.getBoundingClientRect(),b=e.parentElement.getBoundingClientRect();
        return a.x>=b.x&&a.right<=b.right+.1&&a.y>=b.y&&a.bottom<=b.bottom+.1;
    }),'coordenadas dentro das casas');
    assert(board.children[56].getAttribute('aria-label').includes('Casa a1: torre branca'),'torre e casa nomeadas');
    assert(board.children[3].getAttribute('aria-label').includes('dama preta'),'dama nomeada com gênero correto');
    assert(board.children[48].getAttribute('aria-label').includes('peão branco'),'peão nomeado');
    assert(board.children[40].getAttribute('aria-label').includes('vazia'),'casa vazia nomeada');
    assert(board.getAttribute('aria-describedby')==='chess-keyboard-help','instruções de teclado associadas');
    const coordinateStyle=getComputedStyle(files[0]);
    assert(contrast(coordinateStyle.color,coordinateStyle.backgroundColor)>=4.5,'contraste textual das coordenadas');
    click('e2');
    assert(board.children[52].getAttribute('aria-pressed')==='true'&&board.children[52].getAttribute('aria-label').includes('selecionada'),'seleção acessível');
    assert(board.children[52].querySelector('.chess-selection-mark')?.textContent==='✓','seleção não depende de cor');
    const markStyle=getComputedStyle(board.children[52].querySelector('.chess-selection-mark'));
    assert(contrast(markStyle.color,markStyle.backgroundColor)>=4.5,'marca de seleção contrastante');
    assert(board.children[36].getAttribute('aria-label').includes('destino legal'),'destino legal nomeado');
    focus(52);key(board.children[52],'Escape');
    assert(!board.querySelector('.chess-selected')&&!board.querySelector('.chess-target')&&document.activeElement===board.children[52],'Escape limpa seleção e mantém foco');
    play('e2','e4');
    const ongoing=snapshot();$('chess-restart').focus();$('chess-restart').click();
    assert($('chess-restart-dialog').open,'reinício em andamento abre confirmação');
    assert(document.activeElement===$('chess-restart-cancel'),'foco inicial em continuar partida');
    assert($('chess-restart-dialog').getAttribute('aria-describedby')==='chess-restart-description','perda de dados explicada no diálogo');
    assert(snapshot()===ongoing,'abrir confirmação preserva partida');
    key($('chess-restart-cancel'),'Tab',true);
    assert(document.activeElement===$('chess-restart-confirm'),'Shift+Tab contido no diálogo de reinício');
    key($('chess-restart-confirm'),'Tab');
    assert(document.activeElement===$('chess-restart-cancel'),'Tab contido no diálogo de reinício');
    $('chess-restart-cancel').click();
    assert(!$('chess-restart-dialog').open&&snapshot()===ongoing,'cancelar reinício preserva partida');
    assert(document.activeElement===$('chess-restart'),'cancelamento retorna foco ao acionador');
    $('chess-restart').click();$('chess-restart-dialog').dispatchEvent(new Event('cancel',{cancelable:true}));
    assert(!$('chess-restart-dialog').open&&snapshot()===ongoing&&document.activeElement===$('chess-restart'),'Escape cancela reinício e retorna foco');
    $('chess-restart').click();$('chess-restart-confirm').click();
    assert(!$('chess-restart-dialog').open&&$('chess-history').children.length===0&&$('chess-turn').textContent==='Brancas','confirmação reinicia e limpa histórico');
    assert(document.activeElement===board.children[56]&&once(),'reinício confirmado retorna ao tabuleiro');
    $('chess-restart').click();assert(!$('chess-restart-dialog').open,'posição inicial sem jogadas pode reiniciar diretamente');
    play('e2','e4');play('d7','d5');click('e4');
    assert(board.children[27].getAttribute('aria-label').includes('captura de peão preto'),'destino de captura nomeia a peça');
    click('d5');
    assert($('captured-white').tagName==='UL'&&$('captured-white').getAttribute('aria-labelledby')==='captured-white-title','capturadas são lista nomeada');
    const captured=$('captured-white').querySelector('li');
    assert(captured.querySelector('.chess-sr-only').textContent==='peão preto','captura contém nome legível pelo leitor de tela');
    assert(captured.querySelector('[aria-hidden="true"]').textContent==='♟','glifo visual separado do nome');
    const original=C.restartGame;
    try {
        C.restartGame=()=>{
            const s=original();s.board=Array.from({length:8},()=>Array(8).fill(null));
            s.board[7][4]={type:'k',color:'white'};s.board[0][4]={type:'k',color:'black'};s.board[1][0]={type:'p',color:'white'};
            s.castlingRights={white:{king:false,queen:false},black:{king:false,queen:false}};
            s.positionHistory=[C.positionKey(s)];return s;
        };
        restart();const prepromotion=snapshot();click('a7');click('a8');
        const dialog=$('promotion'),first=dialog.querySelector('[data-promote="q"]'),cancel=$('promotion-cancel');
        assert(dialog.open&&document.activeElement===first,'promoção abre com foco em dama');
        assert(dialog.getAttribute('aria-describedby')==='promotion-description','descrição acessível de promoção');
        assert(snapshot()===prepromotion,'abrir promoção não executa jogada');
        key(first,'Tab',true);assert(document.activeElement===cancel,'Shift+Tab da primeira opção volta à última');
        key(cancel,'Tab');assert(document.activeElement===first,'Tab da última opção volta à primeira');
        cancel.click();
        assert(!dialog.open&&document.activeElement===board.children[8]&&snapshot()===prepromotion,'cancelar promoção preserva e retorna ao peão');
        assert(!board.querySelector('.chess-selected')&&once(),'cancelamento limpa seleção e mantém entrada única');
        click('a7');click('a8');dialog.dispatchEvent(new Event('cancel',{cancelable:true}));
        assert(!dialog.open&&document.activeElement===board.children[8]&&snapshot()===prepromotion,'Escape cancela promoção');
        click('a7');click('a8');first.click();
        assert(!dialog.open&&document.activeElement===board.children[0]&&board.children[0].getAttribute('aria-label').includes('dama branca'),'promoção confirmada retorna ao destino');
        assert($('chess-turn').textContent==='Pretas'&&$('chess-history').children.length===1,'promoção executada uma vez');
    } finally {C.restartGame=original;restart();}
    play('f2','f3');play('e7','e5');play('g2','g4');play('d8','h4');
    const checked=board.querySelector('.chess-check');
    assert(checked?.getAttribute('aria-label').includes('rei em xeque'),'xeque descrito no nome do rei');
    const checkStyle=getComputedStyle(checked,'::before');
    assert(checkStyle.content.includes('!')&&contrast(checkStyle.color,checkStyle.backgroundColor)>=4.5,'xeque possui símbolo contrastante');
    $('chess-again').click();
    assert(!$('chess-restart-dialog').open&&document.activeElement===board.children[56],'partida encerrada permite jogar novamente');
    assert($('chess-turn').textContent==='Brancas'&&$('chess-history').children.length===0,'estado inicial restaurado ao final');
    const width=Number(new URLSearchParams(location.search).get('viewport'));
    assert(document.documentElement.scrollWidth<=width,'sem transbordamento horizontal');
    const controls=[...document.querySelectorAll('.chess-panel button,.chess-dialog button')].filter(e=>e.getClientRects().length);
    assert(controls.every(e=>{const r=e.getBoundingClientRect();return r.width>=44&&r.height>=44;}),'controles de ação com alvo de toque de 44 px');
    return count+' verificações de interação e acessibilidade passaram.';
}
