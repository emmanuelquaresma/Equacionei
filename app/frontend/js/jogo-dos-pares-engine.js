/* Regras independentes do DOM, de temporizadores e do conteúdo dos níveis. */
const PairEngine = (() => {
 const equivalent=(a,b)=>a.numerator*b.denominator===b.numerator*a.denominator;
 function shuffle(items,random=Math.random){
  const result=items.slice();
  for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}
  return result;
 }
 function validateFraction(f){
  if(!Number.isSafeInteger(f.numerator)||!Number.isSafeInteger(f.denominator)||f.denominator<1||f.numerator<0||f.numerator>f.denominator)throw Error('Fração inválida: use valores inteiros entre zero e um inteiro.');
 }
 function valueOf(item,type){
  if(type!=='operation'){validateFraction(item);return {numerator:item.numerator,denominator:item.denominator};}
  if(!item.terms||item.terms.length<2)throw Error('A operação precisa de pelo menos duas parcelas.');
  item.terms.forEach(validateFraction);
  const denominator=item.terms[0].denominator;
  if(!item.terms.every(f=>f.denominator===denominator))throw Error('Use denominadores iguais neste nível.');
  const value={numerator:item.terms.reduce((sum,f)=>sum+f.numerator,0),denominator};
  validateFraction(value);return value;
 }
 function validateRound(round){
  const left=round.cards.filter(c=>c.side==='left'),right=round.cards.filter(c=>c.side==='right');
  if(left.length!==3||right.length!==3)throw Error('A rodada precisa de três cartões por coluna.');
  for(const [column,other] of [[left,right],[right,left]]){
   for(const card of column){
    validateFraction(card);
    if(column.filter(c=>equivalent(card,c)).length!==1||other.filter(c=>equivalent(card,c)).length!==1)throw Error('Rodada ambígua: cada cartão precisa de um único parceiro.');
   }
  }
 }
 function createRound(level,index,random=Math.random){
  if(!['match','equivalence','operation'].includes(level.type))throw Error('Tipo de desafio desconhecido.');
  const candidates=level.items.map(item=>{
   const value=valueOf(item,level.type),answer=level.type==='equivalence'?item.equivalent:value;
   validateFraction(answer);
   if(!equivalent(value,answer))throw Error('As frações propostas não são equivalentes.');
   if(level.type==='equivalence'&&value.numerator===answer.numerator&&value.denominator===answer.denominator)throw Error('Use representações diferentes para ensinar equivalência.');
   return {item,value,answer};
  });
  const selected=[];
  for(const candidate of shuffle(candidates,random)){
   if(!selected.some(other=>equivalent(other.value,candidate.value)))selected.push(candidate);
   if(selected.length===3)break;
  }
  if(selected.length!==3)throw Error('O nível precisa de três valores distintos.');
  const left=shuffle(selected.map(({item,value},i)=>({id:`l${i}`,side:'left',kind:level.type==='match'?'visual':level.type==='operation'?'operation':'fraction',...value,...(item.terms?{terms:item.terms}: {})})),random);
  const right=shuffle(selected.map(({answer},i)=>({id:`r${i}`,side:'right',kind:'fraction',numerator:answer.numerator,denominator:answer.denominator})),random);
  // Embaralhar cada coluna; nunca apresentar todos os pares já alinhados.
  if(left.every((card,i)=>equivalent(card,right[i])))right.push(right.shift());
  const round={type:level.type,cards:left.flatMap((card,i)=>[card,right[i]])};
  validateRound(round);return round;
 }
 function createState(round){
  let selected=null,locked=false;const matched=new Set();let completed=false;
  return {
   select(id){
    if(locked||completed||matched.has(id))return {status:'ignored'};
    const card=round.cards.find(c=>c.id===id);if(!card)return {status:'ignored'};
    if(selected===card){selected=null;return {status:'cleared'};}
    if(!selected||selected.side===card.side){selected=card;return {status:'selected',ids:[id]};}
    const ids=[selected.id,id];
    if(equivalent(selected,card)){
     ids.forEach(id=>matched.add(id));selected=null;completed=matched.size===round.cards.length;
     return {status:'correct',ids,completed};
    }
    locked=true;return {status:'wrong',ids};
   },
   unlock(){locked=false;selected=null;},
   get matched(){return [...matched];},get completed(){return completed;}
  };
 }
 return {equivalent,shuffle,createRound,createState,validateRound};
})();
