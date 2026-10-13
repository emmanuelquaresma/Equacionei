/* Apresentação compartilhada. Nunca altera o estado recebido. */
const ChessBoard = (() => {
    const glyphs={white:{k:'♔',q:'♕',r:'♖',b:'♗',n:'♘',p:'♙'},black:{k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟'}};
    const names={k:'rei',q:'dama',r:'torre',b:'bispo',n:'cavalo',p:'peão'};
    function pieceLabel(p) {
        const feminine=['q','r'].includes(p.type);
        return `${names[p.type]} ${p.color==='white'?(feminine?'branca':'branco'):(feminine?'preta':'preto')}`;
    }
    function coordinate(button,text,axis) {
        const label=document.createElement('span');label.className='chess-coordinate chess-coordinate-'+axis;
        label.textContent=text;label.setAttribute('aria-hidden','true');button.append(label);
    }

    function visualIndex(position,perspective='white') {
        return perspective==='black'?(7-position.row)*8+7-position.col:position.row*8+position.col;
    }
    function focus(board,index) {
        if(!Number.isInteger(index)||index<0||index>63)return false;
        board.querySelectorAll('[tabindex="0"]').forEach(square=>{square.tabIndex=-1;});
        board.children[index].tabIndex=0;board.children[index].focus();return true;
    }
    function render(board,state,options={}) {
        let focusIndex=options.focusIndex??56;
        const perspective=options.perspective??'white';
        const focusBoard=index=>{focusIndex=index;focus(board,index);};
        const hadFocus=board.contains(document.activeElement),fragment=document.createDocumentFragment();
        const king=state.check?Chess.kingPosition(state,state.currentPlayer):null;
        for(let vr=0;vr<8;vr++)for(let vc=0;vc<8;vc++) {
            const r=perspective==='black'?7-vr:vr,c=perspective==='black'?7-vc:vc;
            const p=state.board[r][c],button=document.createElement('button'),index=vr*8+vc;
            const selected=state.selectedPiece?.row===r&&state.selectedPiece?.col===c;
            const targetMove=state.legalMoves.find(m=>m.to.row===r&&m.to.col===c),target=Boolean(targetMove);
            const inCheck=king?.row===r&&king.col===c;
            const goal=options.goal?.row===r&&options.goal?.col===c;
            const study=(options.highlights??[]).some(p=>p.row===r&&p.col===c);
            const forbidden=(options.forbidden??[]).some(p=>p.row===r&&p.col===c);
            button.type='button';button.className=`chess-square ${(r+c)%2?'chess-dark':'chess-light'}${selected?' chess-selected':''}${target?' chess-target':''}${king?.row===r&&king.col===c?' chess-check':''}`;
            if(goal)button.classList.add('chess-goal');
            if(study)button.classList.add('chess-study-highlight');
            if(forbidden)button.classList.add('chess-study-forbidden');
            button.tabIndex=index===focusIndex?0:-1;
            const capture=targetMove?.enPassant?state.board[targetMove.from.row][c]:p;
            button.setAttribute('aria-label',`Casa ${Chess.squareName({row:r,col:c})}: ${p?pieceLabel(p):'vazia'}. Casa ${(r+c)%2?'escura':'clara'}${target?', destino legal'+(capture?', captura de '+pieceLabel(capture):''):''}${selected?', peça selecionada':''}${inCheck?', rei em xeque':''}${goal?', objetivo do exercício':''}${study?', casa destacada na lição':''}${forbidden?', destino proibido para a peça neste exemplo':''}.`);
            button.setAttribute('aria-pressed',String(selected));
            if(p){const token=document.createElement('span');token.className=`chess-piece chess-${p.color}`;token.textContent=glyphs[p.color][p.type];token.setAttribute('aria-hidden','true');button.append(token);}
            if(goal){const marker=document.createElement('span');marker.className='chess-goal-mark';marker.textContent='◎';marker.setAttribute('aria-hidden','true');button.append(marker);}
            if(forbidden){const mark=document.createElement('span');mark.className='chess-forbidden-mark';mark.textContent='×';mark.setAttribute('aria-hidden','true');button.append(mark);}
            if(vc===0)coordinate(button,String(8-r),'rank');
            if(vr===7)coordinate(button,'abcdefgh'[c],'file');
            if(selected) {
                const mark=document.createElement('span');mark.className='chess-selection-mark';
                mark.textContent='✓';mark.setAttribute('aria-hidden','true');button.append(mark);
            }
            button.addEventListener('focus',()=>{
                board.querySelectorAll('[tabindex="0"]').forEach(square=>{square.tabIndex=-1;});
                button.tabIndex=0;focusIndex=index;options.onFocus?.(index);
            });
            button.addEventListener('click',()=>{
                if(board.closest('[hidden]'))return;
                focusIndex=index;options.onFocus?.(index);options.onSelect?.(r,c);
            });
            button.addEventListener('keydown',event=>{
                if(board.closest('[hidden]'))return;
                const step={ArrowLeft:[0,-1],ArrowRight:[0,1],ArrowUp:[-1,0],ArrowDown:[1,0]}[event.key];
                if(step) {
                    event.preventDefault();const nr=vr+step[0],nc=vc+step[1];
                    if(nr>=0&&nr<8&&nc>=0&&nc<8)focusBoard(nr*8+nc);
                }
                if(event.key==='Escape'){event.preventDefault();options.onEscape?.();}
            });fragment.append(button);
        }
        board.replaceChildren(fragment);if(hadFocus)board.children[focusIndex].focus();
    }
    Object.values(glyphs).forEach(Object.freeze);Object.freeze(glyphs);Object.freeze(names);
    return Object.freeze({render,focus,visualIndex,glyphs,names,pieceLabel});
})();
