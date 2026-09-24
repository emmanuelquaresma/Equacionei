function testChess(C) {
    let count=0;
    const assert=(v,m)=>{if(!v)throw Error(m);count++;};
    const pos=name=>({row:8-Number(name[1]),col:'abcdefgh'.indexOf(name[0])});
    const at=(s,name)=>s.board[pos(name).row][pos(name).col];
    const put=(s,name,type,color)=>{const p=pos(name);s.board[p.row][p.col]={type,color};};
    const move=(s,a,b,promotion)=>{const n=C.movePiece(s,pos(a),pos(b),promotion);if(!n)throw Error(`Jogada recusada: ${a}-${b}`);return n;};
    const empty=()=>{const s=C.restartGame();s.board=Array.from({length:8},()=>Array(8).fill(null));s.castlingRights={white:{king:false,queen:false},black:{king:false,queen:false}};put(s,'e1','k','white');put(s,'e8','k','black');return s;};
    const targets=(s,square)=>C.getLegalMoves(s,pos(square).row,pos(square).col).map(m=>C.squareName(m.to));
    let s=C.restartGame();assert(s.board.flat().filter(Boolean).length===32,'32 peças');assert(s.currentPlayer==='white','brancas começam');
    assert(at(s,'d1').type==='q'&&at(s,'e8').type==='k','posição tradicional');
    assert(targets(s,'e2').includes('e3')&&targets(s,'e2').includes('e4'),'peão simples e duplo');
    assert(targets(s,'a1').length===0&&targets(s,'c1').length===0,'bloqueio por peças');
    assert(targets(s,'b1').includes('a3')&&targets(s,'b1').includes('c3'),'cavalo salta');
    assert(targets(s,'e7').length===0,'não move adversário');
    const original=JSON.stringify(s);assert(C.movePiece(s,pos('e2'),pos('e5'))===null&&JSON.stringify(s)===original,'inválida atômica');
    s=move(s,'e2','e4');s=move(s,'d7','d5');s=move(s,'e4','d5');assert(s.captured.white.length===1&&at(s,'d5').color==='white','captura diagonal');
    for(const [type,yes,no] of [['r','d7','e5'],['b','g7','d5'],['q','g7','e6'],['n','f5','d5'],['k','e5','f6']]) {
        s=empty();if(type==='k')s.board[7][4]=null;put(s,'d4',type,'white');
        assert(targets(s,'d4').includes(yes)&&!targets(s,'d4').includes(no),`movimentos ${type}`);
    }
    s=empty();put(s,'e2','r','white');put(s,'e7','r','black');assert(!targets(s,'e2').includes('d2'),'peça cravada não expõe rei');
    s=empty();put(s,'a1','r','black');assert(C.isKingInCheck(s,'white'),'xeque de torre');assert(!targets(s,'e1').includes('d1'),'rei não entra em ataque');
    s=C.restartGame();s=move(s,'f2','f3');s=move(s,'e7','e5');s=move(s,'g2','g4');s=move(s,'d8','h4');
    assert(s.status==='checkmate'&&s.winner==='black'&&C.isCheckmate(s),'mate do louco');assert(C.movePiece(s,pos('a2'),pos('a3'))===null,'mate bloqueia');
    s=empty();s.board=Array.from({length:8},()=>Array(8).fill(null));put(s,'a8','k','black');put(s,'c6','k','white');put(s,'c7','q','white');s.currentPlayer='black';assert(C.isStalemate(s),'afogamento');
    for(const promotion of ['q','r','b','n']) {
        s=empty();put(s,'a7','p','white');assert(C.movePiece(s,pos('a7'),pos('a8'))===null,'promoção exige escolha');
        s=move(s,'a7','a8',promotion);assert(at(s,'a8').type===promotion,`promoção ${promotion}`);
    }
    s=empty();put(s,'a1','r','white');put(s,'h1','r','white');s.castlingRights.white={king:true,queen:true};
    assert(targets(s,'e1').includes('g1')&&targets(s,'e1').includes('c1'),'ambos roques');
    let castled=move(s,'e1','g1');assert(at(castled,'g1').type==='k'&&at(castled,'f1').type==='r'&&!at(castled,'h1'),'roque move torre');
    castled=move(s,'e1','c1');assert(at(castled,'c1').type==='k'&&at(castled,'d1').type==='r','roque grande');
    put(s,'f8','r','black');assert(!targets(s,'e1').includes('g1'),'não atravessa xeque no roque');
    s=empty();put(s,'h1','r','white');s.castlingRights.white.king=true;s=move(s,'h1','h2');s=move(s,'e8','e7');s=move(s,'h2','h1');assert(!s.castlingRights.white.king,'torre voltou mas perdeu roque');
    s=C.restartGame();s=move(s,'e2','e4');s=move(s,'a7','a6');s=move(s,'e4','e5');s=move(s,'d7','d5');
    assert(targets(s,'e5').includes('d6'),'en passant disponível');
    let ep=move(s,'e5','d6');assert(!at(ep,'d5')&&at(ep,'d6').color==='white'&&ep.captured.white.length===1,'en passant remove peão');
    s=move(s,'h2','h3');assert(s.enPassantTarget===null,'en passant expira');
    s=empty();s.board[7][4]=null;put(s,'e5','k','white');put(s,'f5','p','white');put(s,'g5','p','black');put(s,'h5','r','black');s.enPassantTarget=pos('g6');
    assert(!targets(s,'f5').includes('g6'),'en passant não pode abrir xeque horizontal');
    s=C.restartGame();assert(s.moveHistory.length===0&&s.captured.white.length===0,'reinício limpo');
    function perft(state,depth) {if(!depth)return 1;return C.allLegalMoves(state).reduce((sum,m)=>sum+perft(C.applyUnchecked(state,m),depth-1),0);}
    assert(perft(s,1)===20,'perft 1: 20');assert(perft(s,2)===400,'perft 2: 400');assert(perft(s,3)===8902,'perft 3: 8902');
    return `${count} verificações do motor passaram, incluindo perft 20/400/8902.`;
}

function testChessUI() {
    const board=document.getElementById('chess-board'),assert=(v,m)=>{if(!v)throw Error(m);};
    assert(board.children.length===64,'64 casas');
    const sizes=[...board.children].map(e=>e.getBoundingClientRect());
    assert(sizes.every(s=>Math.abs(s.width-s.height)<1&&Math.abs(s.width-sizes[0].width)<1),'casas quadradas e iguais');
    const height=board.getBoundingClientRect().height;
    board.children[52].click();assert(board.children[36].classList.contains('chess-target'),'destino e4');board.children[36].click();
    assert(document.getElementById('chess-turn').textContent==='Pretas','troca turno');
    assert(document.getElementById('chess-history').textContent.includes('e2 → e4'),'histórico');
    assert(Math.abs(board.getBoundingClientRect().height-height)<1,'geometria estável');
    board.children[36].dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));
    assert(document.activeElement===board.children[37],'foco por teclado');
    const fixture=document.createElement('script');fixture.textContent="window.originalChessStart=Chess.restartGame;Chess.restartGame=()=>{const s=window.originalChessStart();s.board=Array.from({length:8},()=>Array(8).fill(null));s.board[7][4]={type:'k',color:'white'};s.board[0][4]={type:'k',color:'black'};s.board[1][0]={type:'p',color:'white'};return s;};";document.head.append(fixture);
    document.getElementById('chess-restart').click();board.children[8].click();board.children[0].click();
    assert(document.getElementById('promotion').open,'painel promoção');
    assert(document.getElementById('chess-turn').textContent==='Brancas','aguarda escolha antes de turno');
    document.querySelector('[data-promote="n"]').click();
    assert(board.children[0].getAttribute('aria-label').includes('cavalo branco'),'escolha cavalo');
    assert(!document.getElementById('promotion').open,'fecha promoção');
    const restore=document.createElement('script');restore.textContent='Chess.restartGame=window.originalChessStart;';document.head.append(restore);
    document.getElementById('chess-restart').click();
    assert(document.getElementById('chess-turn').textContent==='Brancas'&&board.querySelectorAll('.chess-piece').length===32,'reinício UI');
    return '64 casas, clique, turno, histórico, teclado, promoção e reinício OK';
}
