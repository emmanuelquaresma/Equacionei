const ChessGame = (() => {
    const board=document.getElementById('chess-board');if(!board)return;
    const $=id=>document.getElementById(id);
    const {glyphs,names,pieceLabel}=ChessBoard;
    const colorName=color=>color==='white'?'Brancas':'Pretas';
    let gameState=Chess.restartGame(),perspective='white',pending=null,focusIndex=56;
    const visualIndex=position=>ChessBoard.visualIndex(position,perspective);
    function focusBoard(index=focusIndex) {focusIndex=index;ChessBoard.focus(board,index);}
    function renderCaptures(color) {
        const list=$('captured-'+color);list.replaceChildren();
        if(!gameState.captured[color].length) {
            const item=document.createElement('li');item.textContent='Nenhuma';list.append(item);return;
        }
        for(const piece of gameState.captured[color]) {
            const item=document.createElement('li'),symbol=document.createElement('span'),label=document.createElement('span');
            symbol.textContent=glyphs[piece.color][piece.type];symbol.setAttribute('aria-hidden','true');
            label.className='chess-sr-only';label.textContent=pieceLabel(piece);
            item.append(symbol,label);list.append(item);
        }
    }
    function trapDialogFocus(dialog) {
        dialog.addEventListener('keydown',event=>{
            if(event.key!=='Tab')return;
            const buttons=[...dialog.querySelectorAll('button:not([disabled])')];
            const first=buttons[0],last=buttons.at(-1);
            if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
            else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
        });
    }
    function cancelPromotion() {
        if(!pending)return;
        const origin=visualIndex(pending.from);pending=null;
        if($('promotion').open)$('promotion').close('cancel');
        gameState.selectedPiece=null;gameState.legalMoves=[];
        $('chess-message').textContent='Promoção cancelada. Escolha outra jogada.';
        renderBoard();focusBoard(origin);
    }
    let restartTrigger=null;
    function cancelRestart() {
        const trigger=restartTrigger;restartTrigger=null;
        if($('chess-restart-dialog').open)$('chess-restart-dialog').close('cancel');
        trigger?.focus();
    }
    function requestRestart(event) {
        if($('promotion').open||$('chess-restart-dialog').open)return;
        if(gameState.status==='playing'&&gameState.moveHistory.length) {
            restartTrigger=event.currentTarget;
            $('chess-restart-dialog').showModal();$('chess-restart-cancel').focus();
        } else {restartGame();focusBoard(56);}
    }
    const drawMessages={
        threefold:'Empate reivindicado: a mesma posição ocorreu três vezes, com o mesmo jogador da vez e os mesmos direitos de jogada.',
        fivefold:'Empate automático: a mesma posição ocorreu cinco vezes.',
        fiftyMove:'Empate reivindicado: cada jogador completou 50 lances sem mover peão nem capturar.',
        seventyFiveMove:'Empate automático: cada jogador completou 75 lances sem mover peão nem capturar.',
        deadPosition:'Empate por posição morta: nenhum dos jogadores pode dar xeque-mate por qualquer sequência legal de jogadas.'
    };
    function drawMessage() {
        if(gameState.drawClaim?.intendedMove) {
            if(gameState.drawReason==='threefold')
                return 'Empate reivindicado: a jogada declarada repetiria a mesma posição pela terceira vez (três vezes).';
            if(gameState.drawReason==='fiftyMove')
                return 'Empate reivindicado: a jogada declarada completaria 50 lances de cada jogador sem mover peão nem capturar.';
        }
        return drawMessages[gameState.drawReason];
    }
    let claimOptions=[];
    function renderDrawClaims() {
        const current=Chess.getDrawClaims(gameState);
        for(const [reason,id] of [['threefold','chess-claim-threefold'],['fiftyMove','chess-claim-fifty']])
            $(id).hidden=!current.includes(reason);
        claimOptions=[];
        if(gameState.status==='playing')for(const move of Chess.allLegalMoves(gameState))
            for(const reason of Chess.getDrawClaims(gameState,move))claimOptions.push({move,reason});
        const select=$('chess-claim-move');select.replaceChildren();
        for(const [index,{move,reason}] of claimOptions.entries()) {
            const option=document.createElement('option');option.value=String(index);
            option.textContent=Chess.squareName(move.from)+' → '+Chess.squareName(move.to)+
                (move.promotion?' = '+names[move.promotion]:'')+
                (reason==='threefold'?' — terceira repetição':' — 50 lances');
            select.append(option);
        }
        $('chess-claim-intended').hidden=claimOptions.length===0;
        $('chess-draw-controls').hidden=!current.length&&!claimOptions.length;
    }
    function finishClaim(reason,move) {
        if(pending)return;
        const next=Chess.claimDraw(gameState,reason,move);
        if(!next){$('chess-message').textContent='Esta reivindicação não está disponível.';return;}
        gameState=next;
        $('chess-message').textContent=move?'Empate reivindicado antes da jogada declarada. A jogada não foi executada.':'';
        renderBoard();$('chess-again').focus();
    }
    function renderBoard() {
        ChessBoard.render(board,gameState,{
            perspective,focusIndex,onFocus:index=>{focusIndex=index;},
            onSelect:selectPiece,
            onEscape:()=>{gameState.selectedPiece=null;gameState.legalMoves=[];renderBoard();}
        });
        $('chess-turn').textContent=colorName(gameState.currentPlayer);
        $('chess-status').textContent=gameState.status==='checkmate'?`Xeque-mate! ${colorName(gameState.winner)} venceram.`:
            gameState.status==='stalemate'?'Empate por afogamento: o jogador da vez não tem jogadas legais e seu rei não está em xeque.':
            gameState.drawReason?drawMessage():gameState.status==='insufficient'?'Empate por material insuficiente.':
            gameState.check?`Rei ${gameState.currentPlayer==='white'?'branco':'preto'} em xeque!`:'Partida em andamento';
        for(const color of ['white','black'])renderCaptures(color);
        $('chess-again').hidden=gameState.status==='playing';
        renderDrawClaims();
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
        if(gameState.status!=='playing'||pending||$('chess-restart-dialog').open)return;
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
    $('chess-restart').addEventListener('click',requestRestart);$('chess-again').addEventListener('click',requestRestart);
    $('chess-restart-cancel').addEventListener('click',cancelRestart);
    $('chess-restart-confirm').addEventListener('click',()=>{
        restartTrigger=null;$('chess-restart-dialog').close('confirmed');restartGame();focusBoard(56);
    });
    $('chess-restart-dialog').addEventListener('cancel',event=>{event.preventDefault();cancelRestart();});
    $('chess-restart-dialog').addEventListener('close',()=>{
        if(restartTrigger&&!$('chess-restart-dialog').open){const trigger=restartTrigger;restartTrigger=null;trigger.focus();}
    });
    trapDialogFocus($('chess-restart-dialog'));trapDialogFocus($('promotion'));
    $('chess-claim-threefold').addEventListener('click',()=>finishClaim('threefold'));
    $('chess-claim-fifty').addEventListener('click',()=>finishClaim('fiftyMove'));
    $('chess-claim-declared').addEventListener('click',()=>{
        const option=claimOptions[Number($('chess-claim-move').value)];
        if(option)finishClaim(option.reason,option.move);
    });
    $('promotion').querySelectorAll('[data-promote]').forEach(button=>button.addEventListener('click',()=>{
        if(!pending)return;const move=pending;pending=null;$('promotion').close('promoted');commit(move,button.dataset.promote);focusBoard(visualIndex(move.to));
    }));
    $('promotion-cancel').addEventListener('click',cancelPromotion);
    $('promotion').addEventListener('cancel',event=>{event.preventDefault();cancelPromotion();});
    $('promotion').addEventListener('close',()=>{if(pending&&!$('promotion').open)cancelPromotion();});
    restartGame();
    return Object.freeze({
        getSnapshot:()=>structuredClone({gameState,pending,perspective,focusIndex}),
        canLeave:()=>!$('promotion').open&&!$('chess-restart-dialog').open,
        focus:()=>focusBoard()
    });
})();
