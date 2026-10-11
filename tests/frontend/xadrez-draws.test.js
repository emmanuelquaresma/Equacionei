/* Regressões FIDE 5.2.2 e 9.2–9.6; sem alterar os 41 testes originais. */
function testChessDraws(C) {
    let count=0;
    const assert=(value,message)=>{if(!value)throw Error(message);count++;};
    const pos=name=>({row:8-Number(name[1]),col:'abcdefgh'.indexOf(name[0])});
    const put=(s,name,type,color)=>{const p=pos(name);s.board[p.row][p.col]={type,color};};
    const intended=(a,b,promotion)=>({from:pos(a),to:pos(b),...(promotion?{promotion}:{})});
    const move=(s,a,b,promotion)=>{const next=C.movePiece(s,pos(a),pos(b),promotion);if(!next)throw Error('Movimento recusado: '+a+'-'+b);return next;};
    const seed=s=>{s.positionHistory=[C.positionKey(s)];return s;};
    const empty=()=>{
        const s=C.restartGame();s.board=Array.from({length:8},()=>Array(8).fill(null));
        s.castlingRights={white:{king:false,queen:false},black:{king:false,queen:false}};
        put(s,'e1','k','white');put(s,'e8','k','black');return seed(s);
    };
    const rook=clock=>{const s=empty();put(s,'a1','r','white');s.halfmoveClock=clock;return seed(s);};
    const cycle=[['g1','f3'],['g8','f6'],['f3','g1'],['f6','g8']];
    const repeat=(s,plies)=>{for(let i=0;i<plies;i++)s=move(s,...cycle[i%4]);return s;};
    let s=C.restartGame();
    assert(s.positionHistory.length===1&&s.positionHistory[0]===C.positionKey(s),'posição inicial registrada');
    assert(s.halfmoveClock===0&&s.drawReason===null,'contadores iniciais');
    assert(!C.getDrawClaims(s).length,'nenhuma reivindicação inicial');
    const original=JSON.stringify(s);
    assert(C.claimDraw(s,'threefold')===null&&JSON.stringify(s)===original,'reivindicação inválida atômica');
    assert(C.movePiece(s,pos('e2'),pos('e5'))===null&&JSON.stringify(s)===original,'jogada ilegal não altera estado, histórico ou contador');
    assert(C.movePiece(s,pos('g8'),pos('f6'))===null&&JSON.stringify(s)===original,'jogada fora do turno atômica');
    assert(!C.getDrawClaims(s,intended('e2','e5')).length,'jogada declarada ilegal rejeitada');
    s=repeat(s,4);assert(s.status==='playing'&&!C.getDrawClaims(s).includes('threefold'),'duas ocorrências não bastam');
    s=repeat(s,4);
    assert(s.status==='playing'&&C.getDrawClaims(s).includes('threefold'),'terceira ocorrência permite reivindicar sem encerrar');
    assert(s.positionHistory.length===9&&s.halfmoveClock===8,'histórico e meias-jogadas');
    const snapshot=JSON.stringify(s),claimed=C.claimDraw(s,'threefold');
    assert(claimed.status==='draw'&&claimed.drawReason==='threefold'&&claimed.winner===null,'reivindicação de três repetições');
    assert(JSON.stringify(s)===snapshot,'reivindicação não muda estado de origem');
    assert(C.movePiece(claimed,pos('g1'),pos('f3'))===null&&!C.getDrawClaims(claimed).length,'partida reivindicada encerrada');
    s=repeat(s,4);assert(s.status==='playing','quarta ocorrência não automática');
    s=repeat(s,4);assert(s.status==='draw'&&s.drawReason==='fivefold','quinta ocorrência automática');
    assert(C.movePiece(s,pos('g1'),pos('f3'))===null,'cinco repetições bloqueiam jogadas');
    s=repeat(C.restartGame(),7);
    assert(!C.getDrawClaims(s).includes('threefold'),'posição atual só ocorreu duas vezes');
    assert(C.getDrawClaims(s,intended('f6','g8')).includes('threefold'),'terceira repetição pela jogada declarada');
    const preclaim=C.claimDraw(s,'threefold',intended('f6','g8'));
    assert(preclaim.status==='draw'&&preclaim.currentPlayer==='black','quem declara é o jogador da vez');
    assert(JSON.stringify(preclaim.board)===JSON.stringify(s.board)&&preclaim.moveHistory.length===7&&preclaim.positionHistory.length===8,'jogada declarada não é executada');
    assert(preclaim.drawClaim.intendedMove.to.col===6,'declaração registrada');
    s=C.restartGame();const initialKey=C.positionKey(s);
    let changed={...s,currentPlayer:'black'};assert(C.positionKey(changed)!==initialKey,'turno diferencia posição');
    changed=structuredClone(s);changed.board[6][0]=null;assert(C.positionKey(changed)!==initialKey,'disposição diferencia posição');
    changed=structuredClone(s);changed.board[7][1].color='black';assert(C.positionKey(changed)!==initialKey,'cor diferencia posição');
    changed=structuredClone(s);changed.board[7][1].type='b';assert(C.positionKey(changed)!==initialKey,'tipo diferencia posição');
    for(const color of ['white','black'])for(const side of ['king','queen']) {
        changed=structuredClone(s);changed.castlingRights[color][side]=false;
        assert(C.positionKey(changed)!==initialKey,'direito de roque diferencia '+color+'/'+side);
    }
    s=move(s,'e2','e4');changed={...s,enPassantTarget:null};
    assert(C.positionKey(s)===C.positionKey(changed),'alvo en passant sem capturador não diferencia');
    s=move(s,'a7','a6');s=move(s,'e4','e5');s=move(s,'d7','d5');
    assert(C.positionKey(s)!==C.positionKey({...s,enPassantTarget:null}),'en passant legal diferencia');
    const epState=s,ep=move(s,'e5','d6');assert(ep.halfmoveClock===0,'en passant zera contador');
    s=empty();s.board[7][4]=null;put(s,'e5','k','white');put(s,'f5','p','white');put(s,'g5','p','black');put(s,'h5','r','black');s.enPassantTarget=pos('g6');seed(s);
    assert(C.positionKey(s)===C.positionKey({...s,enPassantTarget:null}),'en passant que expõe rei não diferencia');
    assert(!C.getDrawClaims({...epState,positionHistory:[C.positionKey({...epState,enPassantTarget:null}),C.positionKey({...epState,enPassantTarget:null}),C.positionKey(epState)]}).includes('threefold'),'en passant efetivo evita falso empate');
    s=rook(98);assert(!C.getDrawClaims(s).length&&!C.getDrawClaims(s,intended('a1','a2')).length,'98 meias-jogadas abaixo do limite');
    s=rook(99);assert(!C.getDrawClaims(s).length&&C.getDrawClaims(s,intended('a1','a2')).includes('fiftyMove'),'99 permite declarar a centésima');
    const fifty=C.claimDraw(s,'fiftyMove',intended('a1','a2'));
    assert(fifty.status==='draw'&&fifty.halfmoveClock===99&&fifty.moveHistory.length===0,'reivindicação antecipada de 50 não executa movimento');
    s=move(s,'a1','a2');assert(s.halfmoveClock===100&&s.status==='playing'&&C.getDrawClaims(s).includes('fiftyMove'),'100 permite reivindicar sem automático');
    assert(C.claimDraw(s,'fiftyMove').drawReason==='fiftyMove','reivindicação atual de 50');
    s=move(rook(148),'a1','a2');assert(s.halfmoveClock===149&&s.status==='playing','149 não automático');
    s=move(rook(149),'a1','a2');assert(s.halfmoveClock===150&&s.status==='draw'&&s.drawReason==='seventyFiveMove','150 encerra automaticamente');
    assert(C.movePiece(s,pos('e8'),pos('e7'))===null,'75 lances bloqueiam jogadas');
    s=rook(99);put(s,'b2','p','white');seed(s);
    assert(!C.getDrawClaims(s,intended('b2','b3')).includes('fiftyMove'),'peão declarado não completa 50');
    s=move(s,'b2','b3');assert(s.halfmoveClock===0&&s.status==='playing','avanço de peão zera');
    s=rook(149);put(s,'a2','r','black');seed(s);
    assert(!C.getDrawClaims(s,intended('a1','a2')).includes('fiftyMove'),'captura declarada não completa 50');
    s=move(s,'a1','a2');assert(s.halfmoveClock===0&&s.status==='playing','captura zera e evita 75');
    s=empty();put(s,'a7','p','white');s.halfmoveClock=149;seed(s);
    const promotionSnapshot=JSON.stringify(s);
    assert(C.movePiece(s,pos('a7'),pos('a8'))===null&&JSON.stringify(s)===promotionSnapshot,'promoção sem escolha não altera dados');
    s=move(s,'a7','a8','q');assert(s.halfmoveClock===0,'promoção zera como movimento de peão');
    s=C.restartGame();s=move(s,'f2','f3');s=move(s,'e7','e5');s=move(s,'g2','g4');s.halfmoveClock=149;
    s=move(s,'d8','h4');assert(s.halfmoveClock===150&&s.status==='checkmate'&&s.winner==='black'&&s.drawReason===null,'mate prevalece sobre 75');
    s=rook(100);s.positionHistory=[C.positionKey(s),C.positionKey(s),C.positionKey(s)];
    assert(C.getDrawClaims(s).includes('threefold')&&C.getDrawClaims(s).includes('fiftyMove'),'duas reivindicações coexistem');
    s=rook(100);const key=C.positionKey(s);
    assert(C.positionKey({...s,halfmoveClock:7,moveHistory:[],captured:{white:[],black:[]}})===key,'contador e capturas históricas não diferenciam posição');
    s.positionHistory=[key,'outra posição',key,'outra posição',key];
    assert(C.getDrawClaims(s).includes('threefold'),'repetições não precisam ser consecutivas');
    const illegalSnapshot=JSON.stringify(s);
    assert(C.movePiece(s,pos('a1'),pos('b2'))===null&&JSON.stringify(s)===illegalSnapshot,'ilegal no limite preserva direito de reivindicação e histórico');
    assert(C.claimDraw(s,'fivefold')===null&&JSON.stringify(s)===illegalSnapshot,'motivo automático não pode ser reivindicado');
    assert(C.claimDraw(s,'fiftyMove',intended('a1','b2'))===null&&JSON.stringify(s)===illegalSnapshot,'declaração ilegal não altera estado');
    assert(!C.getDrawClaims(s,{from:pos('a1'),to:{row:8,col:0}}).length,'declaração fora do tabuleiro');
    s=rook(99);s.castlingRights.white.king=true;put(s,'h1','r','white');seed(s);
    assert(C.getDrawClaims(s,intended('e1','g1')).includes('fiftyMove'),'roque também completa limite');
    s=move(s,'e1','g1');assert(s.halfmoveClock===100,'roque não zera contador');
    s=empty();put(s,'h1','r','white');s.castlingRights.white.king=true;seed(s);
    const beforeRook=C.positionKey(s);s=move(s,'h1','h2');s=move(s,'e8','e7');s=move(s,'h2','h1');s=move(s,'e7','e8');
    assert(s.board[7][7].type==='r'&&C.positionKey(s)!==beforeRook,'peças voltam mas direitos perdidos impedem repetição');
    s=empty();put(s,'c1','b','white');put(s,'d2','r','black');seed(s);
    s=move(s,'c1','d2');assert(s.status==='insufficient'&&s.drawReason==='deadPosition','captura produz material morto');
    s=empty();s.board[0][4]=null;seed(s);
    assert(!C.isDeadPosition(s),'posição sem um rei não é certificada como morta');
    s=empty();assert(C.isDeadPosition(s),'rei contra rei morto');
    s=move(s,'e1','d1');assert(s.status==='insufficient'&&s.drawReason==='deadPosition','preserva empate básico existente');
    for(const type of ['b','n']) {
        s=empty();put(s,'c1',type,'white');seed(s);
        assert(C.isDeadPosition(s),'rei e '+type+' contra rei morto');
        s=move(s,'e1','d1');assert(s.status==='insufficient','empate básico '+type+' preservado');
    }
    s=empty();put(s,'c1','b','white');put(s,'f8','b','black');seed(s);
    assert(C.isDeadPosition(s),'bispos da mesma cor de casas mortos');
    s=move(s,'c1','d2');assert(s.status==='draw'&&s.drawReason==='deadPosition','encerra bispos da mesma cor');
    s=empty();put(s,'c1','b','white');put(s,'e3','b','white');put(s,'f8','b','black');seed(s);
    assert(C.isDeadPosition(s),'múltiplos bispos promovidos na mesma cor mortos');
    for(const pieces of [
        [['c1','b','white'],['c8','b','black']],
        [['c1','b','white'],['f8','n','black']],
        [['c1','n','white'],['f8','n','black']],
        [['c1','n','white'],['g1','n','white']],
        [['c1','b','white'],['g1','n','white']],
        [['c1','b','white'],['f1','b','white']],
        [['a2','p','white']],[['a1','r','white']],[['a1','q','white']]
    ]) {
        s=empty();for(const piece of pieces)put(s,...piece);seed(s);
        assert(!C.isDeadPosition(s),'não declara material com mate possível: '+JSON.stringify(pieces));
    }
    s=empty();s.board=Array.from({length:8},()=>Array(8).fill(null));
    put(s,'f7','k','white');put(s,'h8','k','black');put(s,'g6','n','white');put(s,'f6','n','white');s.currentPlayer='black';seed(s);
    assert(C.isCheckmate(s)&&!C.isDeadPosition(s),'dois cavalos permitem mate cooperativo');
    s=empty();for(const file of 'aceg'){put(s,file+'4','p','white');put(s,file+'5','p','black');}seed(s);
    const wallSnapshot=JSON.stringify(s);
    assert(C.isDeadPosition(s),'barreira de peões: nenhum mate alcançável por busca completa');
    assert(JSON.stringify(s)===wallSnapshot,'busca de posição morta não altera estado');
    const wall=structuredClone(s);
    s=move(s,'e1','d1');assert(s.status==='draw'&&s.drawReason==='deadPosition','barreira encerra automaticamente');
    const opened=structuredClone(wall);opened.board[pos('g4').row][pos('g4').col]=null;seed(opened);
    assert(!C.isDeadPosition(opened),'peão desbloqueado não é posição morta comprovada');
    const capturable=structuredClone(wall);capturable.board[7][4]=null;put(capturable,'b5','k','white');seed(capturable);
    assert(!C.isDeadPosition(capturable),'rei pode capturar e abrir a barreira');
    s=empty();s.board=Array.from({length:8},()=>Array(8).fill(null));put(s,'a8','k','black');put(s,'c6','k','white');put(s,'b6','q','white');s.halfmoveClock=149;seed(s);
    s=move(s,'b6','c7');assert(s.status==='stalemate'&&s.winner===null,'afogamento preservado no limite de 75');
    s=C.restartGame();assert(s.positionHistory.length===1&&s.halfmoveClock===0&&s.drawReason===null&&s.drawClaim===null,'reinício limpa metadados de empate');
    return count+' verificações de empate passaram.';
}

function testChessDrawUI(C) {
    let count=0;
    const assert=(v,m)=>{if(!v)throw Error(m);count++;};
    const board=document.getElementById('chess-board');
    const $=id=>document.getElementById(id);
    const pos=name=>({row:8-Number(name[1]),col:'abcdefgh'.indexOf(name[0])});
    const click=name=>{const p=pos(name);board.children[p.row*8+p.col].click();};
    const play=(a,b)=>{click(a);click(b);};
    const restart=()=>{ $('chess-restart').click();if($('chess-restart-dialog').open)$('chess-restart-confirm').click(); };
    const cycle=[['g1','f3'],['g8','f6'],['f3','g1'],['f6','g8']];
    const repeat=plies=>{for(let i=0;i<plies;i++)play(...cycle[i%4]);};
    restart();assert($('chess-draw-controls').hidden,'sem controles iniciais');
    repeat(7);assert(!$('chess-claim-intended').hidden&&$('chess-claim-threefold').hidden,'terceira ocorrência futura disponível');
    assert($('chess-claim-move').selectedOptions[0].textContent.includes('f6 → g8'),'jogada declarada identificada');
    const history=$('chess-history').innerHTML;
    $('chess-claim-declared').click();
    assert($('chess-status').textContent.includes('três vezes')&&$('chess-status').textContent.includes('repetiria'),'mensagem de reivindicação antes da jogada');
    // Render clears selection, so compare piece labels rather than selected CSS.
    assert(board.children[21].getAttribute('aria-label').includes('cavalo preto')&&$('chess-history').innerHTML===history,'declaração não executa jogada');
    assert($('chess-draw-controls').hidden&&!$('chess-again').hidden,'controle some após encerramento');
    restart();repeat(8);assert(!$('chess-claim-threefold').hidden,'reivindicação atual disponível');
    $('chess-claim-threefold').click();assert($('chess-status').textContent.includes('três vezes'),'reivindicação atual encerra');
    restart();repeat(16);assert($('chess-status').textContent.includes('cinco vezes')&&$('chess-draw-controls').hidden,'cinco repetições automáticas na UI');
    const original=C.restartGame;
    const install=clock=>{
        C.restartGame=()=>{
            const s=original();s.board=Array.from({length:8},()=>Array(8).fill(null));
            s.board[7][4]={type:'k',color:'white'};s.board[0][4]={type:'k',color:'black'};s.board[7][0]={type:'r',color:'white'};
            s.castlingRights={white:{king:false,queen:false},black:{king:false,queen:false}};
            s.halfmoveClock=clock;s.positionHistory=[C.positionKey(s)];return s;
        };
        restart();
    };
    try {
        install(98);assert($('chess-draw-controls').hidden,'98 sem controles');
        install(99);assert($('chess-claim-fifty').hidden&&!$('chess-claim-intended').hidden,'99 apenas declaração');
        const fiftyHistory=$('chess-history').innerHTML;
        $('chess-claim-declared').click();assert($('chess-status').textContent.includes('completaria 50 lances')&&$('chess-history').innerHTML===fiftyHistory,'declaração de 50 sem mover');
        install(100);assert(!$('chess-claim-fifty').hidden,'100 reivindicação atual');
        assert(document.documentElement.scrollWidth<=innerWidth,'controles de empate sem overflow');
        const control=$('chess-claim-fifty').getBoundingClientRect();
        assert(control.height>=44&&control.x>=0&&control.right<=innerWidth,'controle legível e dentro da tela');
        $('chess-claim-fifty').click();assert($('chess-status').textContent.includes('50 lances'),'50 encerra por reivindicação');
        install(149);play('a1','a2');assert($('chess-status').textContent.includes('75 lances')&&$('chess-draw-controls').hidden,'75 automático na interface');
        C.restartGame=()=>{
            const s=original();s.board=Array.from({length:8},()=>Array(8).fill(null));
            s.board[7][4]={type:'k',color:'white'};s.board[0][4]={type:'k',color:'black'};
            s.board[7][2]={type:'b',color:'white'};s.board[0][5]={type:'b',color:'black'};
            s.castlingRights={white:{king:false,queen:false},black:{king:false,queen:false}};
            s.positionHistory=[C.positionKey(s)];return s;
        };
        restart();play('c1','d2');assert($('chess-status').textContent.includes('posição morta'),'posição morta explicada');
    } finally {C.restartGame=original;restart();}
    assert($('chess-draw-controls').hidden&&$('chess-turn').textContent==='Brancas','reinício limpa controles');
    return count+' verificações da interface de empate passaram.';
}
