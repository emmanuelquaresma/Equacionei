/* Motor local independente do DOM. Coordenadas lógicas: linha 0 = oitava fileira.
 * Movimentos, roque e en passant seguem as regras de xadrez padrão da FIDE.
 * Nesta versão, empates automáticos: afogamento e material básico insuficiente.
 */
const Chess = (() => {
    const inside = (r,c) => Number.isInteger(r)&&Number.isInteger(c)&&r>=0&&r<8&&c>=0&&c<8;
    const other = color => color==='white'?'black':'white';
    const equal = (a,b) => a&&b&&a.row===b.row&&a.col===b.col;
    const squareName = p => 'abcdefgh'[p.col]+(8-p.row);
    const diagonals = [[-1,-1],[-1,1],[1,-1],[1,1]];
    const straights = [[-1,0],[1,0],[0,-1],[0,1]];
    const knightSteps = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
    function initializeBoard() {
        const board=Array.from({length:8},()=>Array(8).fill(null));
        const back=['r','n','b','q','k','b','n','r'];
        for(let c=0;c<8;c++) {
            board[0][c]={type:back[c],color:'black'};board[1][c]={type:'p',color:'black'};
            board[6][c]={type:'p',color:'white'};board[7][c]={type:back[c],color:'white'};
        }
        return board;
    }
    function restartGame() {
        return {board:initializeBoard(),currentPlayer:'white',selectedPiece:null,legalMoves:[],
            captured:{white:[],black:[]},check:false,winner:null,status:'playing',moveHistory:[],
            castlingRights:{white:{king:true,queen:true},black:{king:true,queen:true}},enPassantTarget:null};
    }
    function isSquareAttacked(state,row,col,byColor) {
        for(let r=0;r<8;r++)for(let c=0;c<8;c++) {
            const p=state.board[r][c];if(!p||p.color!==byColor)continue;
            const dr=row-r,dc=col-c;
            if(p.type==='p'&&dr===(byColor==='white'?-1:1)&&Math.abs(dc)===1)return true;
            if(p.type==='n'&&Math.abs(dr)*Math.abs(dc)===2)return true;
            if(p.type==='k'&&Math.max(Math.abs(dr),Math.abs(dc))===1)return true;
            const straight=(dr===0)!==(dc===0),diagonal=Math.abs(dr)===Math.abs(dc)&&dr!==0;
            if((p.type==='r'&&straight)||(p.type==='b'&&diagonal)||(p.type==='q'&&(straight||diagonal))) {
                const sr=Math.sign(dr),sc=Math.sign(dc);let rr=r+sr,cc=c+sc,clear=true;
                while(rr!==row||cc!==col){if(state.board[rr][cc]){clear=false;break;}rr+=sr;cc+=sc;}
                if(clear)return true;
            }
        }
        return false;
    }
    function kingPosition(state,color) {
        for(let r=0;r<8;r++)for(let c=0;c<8;c++)if(state.board[r][c]?.type==='k'&&state.board[r][c].color===color)return {row:r,col:c};
        return null;
    }
    function isKingInCheck(state,color) {
        const king=kingPosition(state,color);
        return !king||isSquareAttacked(state,king.row,king.col,other(color));
    }
    function pseudoMoves(state,row,col) {
        const piece=state.board[row][col],moves=[];if(!piece)return moves;
        const add=(r,c,extra={})=>{
            if(!inside(r,c)||state.board[r][c]?.color===piece.color||state.board[r][c]?.type==='k')return false;
            const move={from:{row,col},to:{row:r,col:c},...extra};
            if(piece.type==='p'&&(r===0||r===7))for(const promotion of ['q','r','b','n'])moves.push({...move,promotion});
            else moves.push(move);
            return !state.board[r][c];
        };
        if(piece.type==='p') {
            const d=piece.color==='white'?-1:1,start=piece.color==='white'?6:1;
            if(inside(row+d,col)&&!state.board[row+d][col]) {
                add(row+d,col);
                if(row===start&&!state.board[row+2*d][col])add(row+2*d,col);
            }
            for(const dc of [-1,1])if(inside(row+d,col+dc)) {
                const target=state.board[row+d][col+dc];
                if(target&&target.color!==piece.color)add(row+d,col+dc);
                else if(!target&&equal(state.enPassantTarget,{row:row+d,col:col+dc})&&
                    state.board[row][col+dc]?.type==='p'&&state.board[row][col+dc].color!==piece.color)
                    add(row+d,col+dc,{enPassant:true});
            }
        } else if(piece.type==='n')for(const [dr,dc] of knightSteps)add(row+dr,col+dc);
        else if(piece.type==='k') {
            for(const [dr,dc] of [...straights,...diagonals])add(row+dr,col+dc);
            const home=piece.color==='white'?7:0;
            if(row===home&&col===4&&!isKingInCheck(state,piece.color))for(const side of ['king','queen']) {
                const rookCol=side==='king'?7:0,step=side==='king'?1:-1;
                const rook=state.board[home][rookCol];
                if(!state.castlingRights[piece.color][side]||rook?.type!=='r'||rook.color!==piece.color)continue;
                const path=side==='king'?[5,6]:[1,2,3];
                if(path.some(c=>state.board[home][c]))continue;
                const transit=applyUnchecked(state,{from:{row,col},to:{row,col:col+step}});
                if(!isKingInCheck(transit,piece.color))add(home,col+2*step,{castle:side});
            }
        } else {
            const dirs=piece.type==='r'?straights:piece.type==='b'?diagonals:[...straights,...diagonals];
            for(const [dr,dc] of dirs)for(let r=row+dr,c=col+dc;inside(r,c);r+=dr,c+=dc)if(!add(r,c))break;
        }
        return moves;
    }
    // Aplicação sem validação usada apenas internamente, após geração de movimentos.
    function applyUnchecked(state,move) {
        const next={...state,board:state.board.map(row=>row.map(p=>p?{...p}:null)),
            castlingRights:{white:{...state.castlingRights.white},black:{...state.castlingRights.black}},
            enPassantTarget:null,captured:{white:[...state.captured.white],black:[...state.captured.black]}};
        const {from,to}=move,piece=next.board[from.row][from.col];
        const captured=move.enPassant?next.board[from.row][to.col]:next.board[to.row][to.col];
        if(captured)next.captured[piece.color].push({...captured});
        const revokeRook=(color,r,c)=>{
            if(r===(color==='white'?7:0)) {
                if(c===0)next.castlingRights[color].queen=false;
                if(c===7)next.castlingRights[color].king=false;
            }
        };
        if(piece.type==='k')next.castlingRights[piece.color]={king:false,queen:false};
        if(piece.type==='r')revokeRook(piece.color,from.row,from.col);
        if(captured?.type==='r')revokeRook(captured.color,to.row,to.col);
        next.board[from.row][from.col]=null;
        if(move.enPassant)next.board[from.row][to.col]=null;
        next.board[to.row][to.col]=piece;
        if(piece.type==='p'&&Math.abs(to.row-from.row)===2)next.enPassantTarget={row:(from.row+to.row)/2,col:from.col};
        if(move.promotion)piece.type=move.promotion;
        if(move.castle) {
            const rookFrom=move.castle==='king'?7:0,rookTo=move.castle==='king'?5:3;
            next.board[to.row][rookTo]=next.board[to.row][rookFrom];next.board[to.row][rookFrom]=null;
        }
        next.currentPlayer=other(piece.color);
        return next;
    }
    function getLegalMoves(state,row,col) {
        if(state.status!=='playing'||!inside(row,col))return [];
        const piece=state.board[row][col];if(!piece||piece.color!==state.currentPlayer)return [];
        return pseudoMoves(state,row,col).filter(move=>!isKingInCheck(applyUnchecked(state,move),piece.color));
    }
    function allLegalMoves(state) {
        const moves=[];
        for(let r=0;r<8;r++)for(let c=0;c<8;c++)moves.push(...getLegalMoves(state,r,c));
        return moves;
    }
    function insufficientMaterial(state) {
        const pieces=state.board.flat().filter(p=>p&&p.type!=='k');
        return pieces.length===0||(pieces.length===1&&['b','n'].includes(pieces[0].type));
    }
    function movePiece(state,from,to,promotion) {
        if(!from||!to||!inside(from.row,from.col)||!inside(to.row,to.col))return null;
        const move=getLegalMoves(state,from.row,from.col).find(m=>equal(m.to,to)&&m.promotion===promotion);
        if(!move)return null;
        const next=applyUnchecked(state,move);
        next.selectedPiece=null;next.legalMoves=[];
        next.moveHistory=[...state.moveHistory,{...move,color:state.currentPlayer}];
        next.check=isKingInCheck(next,next.currentPlayer);
        if(allLegalMoves(next).length===0) {
            next.status=next.check?'checkmate':'stalemate';next.winner=next.check?state.currentPlayer:null;
        } else if(insufficientMaterial(next))next.status='insufficient';
        return next;
    }
    function isCheckmate(state) {return isKingInCheck(state,state.currentPlayer)&&allLegalMoves({...state,status:'playing'}).length===0;}
    function isStalemate(state) {return !isKingInCheck(state,state.currentPlayer)&&allLegalMoves({...state,status:'playing'}).length===0;}
    return {restartGame,initializeBoard,getLegalMoves,allLegalMoves,movePiece,isSquareAttacked,isKingInCheck,
        isCheckmate,isStalemate,kingPosition,squareName,applyUnchecked};
})();

(() => {
    const board=document.getElementById('chess-board');if(!board)return;
    const $=id=>document.getElementById(id);
    const glyphs={white:{k:'♔',q:'♕',r:'♖',b:'♗',n:'♘',p:'♙'},black:{k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟'}};
    const names={k:'rei',q:'dama',r:'torre',b:'bispo',n:'cavalo',p:'peão'};
    const colorName=color=>color==='white'?'Brancas':'Pretas';
    let gameState=Chess.restartGame(),perspective='white',pending=null,focusIndex=56;
    function pieceLabel(p) {
        const feminine=['q','r'].includes(p.type);
        return `${names[p.type]} ${p.color==='white'?(feminine?'branca':'branco'):(feminine?'preta':'preto')}`;
    }
    function renderBoard() {
        const hadFocus=board.contains(document.activeElement),fragment=document.createDocumentFragment();
        const king=gameState.check?Chess.kingPosition(gameState,gameState.currentPlayer):null;
        for(let vr=0;vr<8;vr++)for(let vc=0;vc<8;vc++) {
            const r=perspective==='black'?7-vr:vr,c=perspective==='black'?7-vc:vc;
            const p=gameState.board[r][c],button=document.createElement('button'),index=vr*8+vc;
            const selected=gameState.selectedPiece?.row===r&&gameState.selectedPiece?.col===c;
            const target=gameState.legalMoves.some(m=>m.to.row===r&&m.to.col===c);
            button.type='button';button.className=`chess-square ${(r+c)%2?'chess-dark':'chess-light'}${selected?' chess-selected':''}${target?' chess-target':''}${king?.row===r&&king.col===c?' chess-check':''}`;
            button.tabIndex=index===focusIndex?0:-1;
            button.setAttribute('aria-label',`${Chess.squareName({row:r,col:c})}, ${p?pieceLabel(p):'vazia'}${target?', destino possível':''}${selected?', selecionada':''}`);
            button.setAttribute('aria-pressed',String(selected));
            if(p){const token=document.createElement('span');token.className=`chess-piece chess-${p.color}`;token.textContent=glyphs[p.color][p.type];token.setAttribute('aria-hidden','true');button.append(token);}
            button.addEventListener('click',()=>{focusIndex=index;selectPiece(r,c);});
            button.addEventListener('keydown',event=>{
                const delta={ArrowLeft:-1,ArrowRight:1,ArrowUp:-8,ArrowDown:8}[event.key];
                if(delta!==undefined){event.preventDefault();focusIndex=Math.max(0,Math.min(63,index+delta));board.children[index].tabIndex=-1;board.children[focusIndex].tabIndex=0;board.children[focusIndex].focus();}
                if(event.key==='Escape'){gameState.selectedPiece=null;gameState.legalMoves=[];renderBoard();}
            });fragment.append(button);
        }
        board.replaceChildren(fragment);if(hadFocus)board.children[focusIndex].focus();
        $('chess-turn').textContent=colorName(gameState.currentPlayer);
        $('chess-status').textContent=gameState.status==='checkmate'?`Xeque-mate! ${colorName(gameState.winner)} venceram.`:
            gameState.status==='stalemate'?'Empate por afogamento.':gameState.status==='insufficient'?'Empate por material insuficiente.':
            gameState.check?`Rei ${gameState.currentPlayer==='white'?'branco':'preto'} em xeque!`:'Partida em andamento';
        for(const color of ['white','black'])$('captured-'+color).textContent=gameState.captured[color].map(p=>glyphs[p.color][p.type]).join(' ')||'Nenhuma';
        $('chess-again').hidden=gameState.status==='playing';
        $('chess-history').replaceChildren();
        for(const move of gameState.moveHistory) {
            const item=document.createElement('li');item.textContent=`${colorName(move.color)}: ${Chess.squareName(move.from)} → ${Chess.squareName(move.to)}${move.promotion?' = '+names[move.promotion]:''}${move.castle?' (roque)':''}${move.enPassant?' (en passant)':''}`;
            $('chess-history').append(item);
        }
    }
    function commit(move,promotion) {
        const next=Chess.movePiece(gameState,move.from,move.to,promotion);
        if(!next){$('chess-message').textContent='Jogada inválida.';return;}
        gameState=next;pending=null;$('chess-message').textContent='';renderBoard();
    }
    function selectPiece(row,col) {
        if(gameState.status!=='playing'||pending)return;
        const move=gameState.legalMoves.find(m=>m.to.row===row&&m.to.col===col);
        if(move) {
            if(move.promotion){pending=move;$('promotion').showModal();$('promotion').querySelector('button').focus();}
            else commit(move);
            return;
        }
        if(gameState.board[row][col]?.color===gameState.currentPlayer) {
            gameState.selectedPiece={row,col};gameState.legalMoves=Chess.getLegalMoves(gameState,row,col);
            $('chess-message').textContent=gameState.legalMoves.length?'Escolha uma casa marcada.':'Esta peça não tem jogadas legais.';
        } else {gameState.selectedPiece=null;gameState.legalMoves=[];$('chess-message').textContent='Jogada inválida.';}
        renderBoard();
    }
    function restartGame() {pending=null;if($('promotion').open)$('promotion').close();gameState=Chess.restartGame();focusIndex=56;$('chess-message').textContent='Brancas começam.';renderBoard();}
    $('chess-restart').addEventListener('click',restartGame);$('chess-again').addEventListener('click',restartGame);
    $('promotion').querySelectorAll('[data-promote]').forEach(button=>button.addEventListener('click',()=>{
        if(!pending)return;const move=pending;$('promotion').close();commit(move,button.dataset.promote);board.children[focusIndex].focus();
    }));
    $('promotion').addEventListener('cancel',()=>{pending=null;});
    restartGame();
})();
