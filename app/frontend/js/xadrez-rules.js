/* Motor local independente do DOM. Coordenadas lógicas: linha 0 = oitava fileira.
 * Movimentos, roque e en passant seguem as regras de xadrez padrão da FIDE.
 * Empates: FIDE 5.2.2 e 9.2–9.6. Contadores medem meias-jogadas (plies).
 * Posições mortas: material comprovado e busca exaustiva com peões imóveis;
 * fortalezas com outras peças ainda não são certificadas.
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
        const state={board:initializeBoard(),currentPlayer:'white',selectedPiece:null,legalMoves:[],
            captured:{white:[],black:[]},check:false,winner:null,status:'playing',moveHistory:[],
            castlingRights:{white:{king:true,queen:true},black:{king:true,queen:true}},enPassantTarget:null,
            halfmoveClock:0,positionHistory:[],drawReason:null,drawClaim:null};
        state.positionHistory=[positionKey(state)];
        return state;
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
        next.halfmoveClock=piece.type==='p'||captured?0:(state.halfmoveClock??0)+1;
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

    // En passant só diferencia posições se a captura for realmente legal,
    // inclusive quanto à segurança do rei (FIDE 9.2.3.1).
    function positionKey(state) {
        const placement=state.board.map(row=>row.map(p=>p?(p.color==='white'?p.type.toUpperCase():p.type):'.').join('')).join('/');
        const rights=['white','black'].map(color=>['king','queen'].map(side=>state.castlingRights[color][side]?'1':'0').join('')).join('');
        let ep='-';
        if(state.enPassantTarget) {
            const active={...state,status:'playing'};
            for(let r=0;r<8;r++)for(let c=0;c<8;c++)
                if(active.board[r][c]?.type==='p'&&getLegalMoves(active,r,c).some(m=>m.enPassant))
                    ep=squareName(state.enPassantTarget);
        }
        return placement+' '+state.currentPlayer+' '+rights+' '+ep;
    }
    function positionHistory(state) {
        const key=positionKey(state),history=state.positionHistory;
        // Fixtures/editors may replace the board. Never count a stale initial key.
        return history?.at(-1)===key?history:[key];
    }
    const occurrences=(history,key)=>history.reduce((n,item)=>n+(item===key?1:0),0);
    function findLegalMove(state,intended) {
        if(!intended?.from||!intended?.to||!inside(intended.to.row,intended.to.col))return null;
        return getLegalMoves(state,intended.from.row,intended.from.col)
            .find(m=>equal(m.to,intended.to)&&m.promotion===intended.promotion)??null;
    }
    function getDrawClaims(state,intended) {
        if(state.status!=='playing')return [];
        let candidate=state,history=positionHistory(state),count;
        if(intended!==undefined) {
            const move=findLegalMove(state,intended);if(!move)return [];
            candidate=applyUnchecked(state,move);
            count=occurrences(history,positionKey(candidate))+1;
        } else count=occurrences(history,positionKey(state));
        const reasons=[];
        if(count>=3)reasons.push('threefold');
        if(candidate.halfmoveClock>=100)reasons.push('fiftyMove');
        return reasons;
    }
    function claimDraw(state,reason,intended) {
        if(!getDrawClaims(state,intended).includes(reason))return null;
        // A valid pre-move claim ends play BEFORE the declared move is played.
        const declared=intended===undefined?null:findLegalMove(state,intended);
        return {...state,status:'draw',winner:null,drawReason:reason,
            drawClaim:{color:state.currentPlayer,intendedMove:declared},
            selectedPiece:null,legalMoves:[]};
    }

    // These are sufficient proofs, never "cannot force mate" heuristics.
    // Two knights, opposite-coloured bishops, or a minor piece on each side
    // can permit cooperative mate and must not be declared dead.
    function isDeadMaterial(state) {
        const minors=[];
        for(let r=0;r<8;r++)for(let c=0;c<8;c++) {
            const p=state.board[r][c];if(p&&p.type!=='k')minors.push({...p,squareColor:(r+c)%2});
        }
        if(minors.length===0)return true;
        if(minors.length===1&&['b','n'].includes(minors[0].type))return true;
        return minors.every(p=>p.type==='b'&&p.squareColor===minors[0].squareColor);
    }
    function isDeadPosition(state) {
        if(!kingPosition(state,'white')||!kingPosition(state,'black'))return false;
        if(isDeadMaterial(state))return true;
        // Exact reachability for positions containing ONLY kings and blocked
        // pawns. If any pawn move/capture is reachable, no proof is returned.
        // No 50/75-move or repetition cutoff is used: those do not prove death.
        const pawns=[];
        for(let r=0;r<8;r++)for(let c=0;c<8;c++) {
            const p=state.board[r][c];if(!p||p.type==='k')continue;
            if(p.type!=='p')return false;
            pawns.push({row:r,col:c,color:p.color});
        }
        for(const p of pawns) {
            const forward=p.row+(p.color==='white'?-1:1);
            if(!inside(forward,p.col)||state.board[forward][p.col]?.type!=='p')return false;
            if(pseudoMoves(state,p.row,p.col).length)return false;
        }
        const start={...state,status:'playing'},queue=[start],seen=new Set([positionKey(start)]);
        for(let i=0;i<queue.length;i++) {
            const current=queue[i],moves=allLegalMoves(current);
            if(!moves.length&&isKingInCheck(current,current.currentPlayer))return false;
            for(const move of moves) {
                if(current.board[move.from.row][move.from.col].type!=='k'||current.board[move.to.row][move.to.col])return false;
                const next=applyUnchecked(current,move),key=positionKey(next);
                if(!seen.has(key)){seen.add(key);queue.push(next);}
            }
        }
        // Finite graph: fixed pawns and two kings => fewer than 8192 positions.
        return true;
    }

    function movePiece(state,from,to,promotion) {
        if(!from||!to||!inside(from.row,from.col)||!inside(to.row,to.col))return null;
        const move=getLegalMoves(state,from.row,from.col).find(m=>equal(m.to,to)&&m.promotion===promotion);
        if(!move)return null;
        const next=applyUnchecked(state,move);
        next.selectedPiece=null;next.legalMoves=[];
        next.moveHistory=[...state.moveHistory,{...move,color:state.currentPlayer}];
        next.positionHistory=[...positionHistory(state),positionKey(next)];
        next.check=isKingInCheck(next,next.currentPlayer);
        if(allLegalMoves(next).length===0) {
            next.status=next.check?'checkmate':'stalemate';next.winner=next.check?state.currentPlayer:null;
        } else if(insufficientMaterial(next)){next.status='insufficient';next.drawReason='deadPosition';}
        else if(isDeadPosition(next)){next.status='draw';next.drawReason='deadPosition';}
        else if(occurrences(next.positionHistory,positionKey(next))>=5){next.status='draw';next.drawReason='fivefold';}
        else if(next.halfmoveClock>=150){next.status='draw';next.drawReason='seventyFiveMove';}
        return next;
    }
    function isCheckmate(state) {return isKingInCheck(state,state.currentPlayer)&&allLegalMoves({...state,status:'playing'}).length===0;}
    function isStalemate(state) {return !isKingInCheck(state,state.currentPlayer)&&allLegalMoves({...state,status:'playing'}).length===0;}
    return {restartGame,initializeBoard,getLegalMoves,allLegalMoves,movePiece,isSquareAttacked,isKingInCheck,
        isCheckmate,isStalemate,kingPosition,squareName,applyUnchecked,
        positionKey,getDrawClaims,claimDraw,isDeadPosition};
})();
