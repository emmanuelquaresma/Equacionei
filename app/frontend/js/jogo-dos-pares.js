(() => {
 const $=name=>document.getElementById('pair-'+name),total=5;
 let level=PairChallenges[0],sessionLevel,roundIndex=0,round,state,feedbackTimer;
 const buttons=new Map();
 PairChallenges.forEach(item=>{const option=document.createElement('option');option.value=item.id;option.textContent=item.title;$('level').append(option);});
 function clearFeedback(){
  for(const button of buttons.values()){
   button.classList.remove('is-selected','is-wrong');button.setAttribute('aria-pressed','false');
   if(!button.classList.contains('is-matched'))button.querySelector('.pair-card__state').textContent='';
  }
 }
 function progress(){
  const done=roundIndex+(state.completed?1:0);
  $('round').textContent=`Rodada ${roundIndex+1} de ${total}`;
  $('progress').value=done;$('progress').setAttribute('aria-valuetext',`${done} de ${total} rodadas concluídas`);
  $('count').textContent=`${state.matched.length/2} de 3 pares`;
 }
 function complete(){
  $('message').textContent='✓ Rodada concluída!';
  if(roundIndex===total-1){
   $('win').hidden=false;$('restart').hidden=true;
   $('next-level').hidden=level===PairChallenges[PairChallenges.length-1];
   $('win').querySelector('h2').focus({preventScroll:true});
   $('win').scrollIntoView({block:'nearest'});
  }else {$('next').hidden=false;$('next').focus();}
 }
 function choose(id){
  const result=state.select(id);
  if(result.status==='ignored')return;
  clearFeedback();
  if(result.status==='cleared'){$('message').textContent='Seleção retirada.';return;}
  if(result.status==='selected'){
   const button=buttons.get(id);button.classList.add('is-selected');button.setAttribute('aria-pressed','true');
   $('message').textContent='Escolha um cartão da outra coluna.';return;
  }
  if(result.status==='wrong'){
   result.ids.forEach(id=>{const b=buttons.get(id);b.classList.add('is-wrong');b.querySelector('.pair-card__state').textContent='✕';});
   $('message').textContent='Ainda não. Compare os valores e tente novamente.';
   feedbackTimer=setTimeout(()=>{state.unlock();clearFeedback();$('message').textContent='Tente outra combinação.';},800);
   return;
  }
  result.ids.forEach(id=>{const b=buttons.get(id);b.classList.add('is-matched');b.disabled=true;b.setAttribute('aria-label',`${b.dataset.description}. Par concluído.`);b.querySelector('.pair-card__state').textContent='✓';});
  $('message').textContent='✓ Muito bem! Os valores correspondem.';progress();
  if(result.completed){
   for(const b of buttons.values())b.disabled=true;
   complete();
  }else {
   // Keep keyboard users in the board after disabling the matched button.
   const next=[...buttons.values()].find(b=>!b.disabled);next?.focus({preventScroll:true});
  }
 }
 function render(){
  clearTimeout(feedbackTimer);round=PairEngine.createRound(sessionLevel,roundIndex);state=PairEngine.createState(round);
  $('next').hidden=true;$('win').hidden=true;$('restart').hidden=false;$('message').textContent='';
  const headings={match:['Representação','Fração'],equivalence:['Fração','Equivalente'],operation:['Operação','Resultado']}[round.type];
  $('left-heading').textContent=headings[0];$('right-heading').textContent=headings[1];
  $('instruction').textContent='Combine um cartão de cada coluna.';
  buttons.clear();$('board').replaceChildren();
  for(const card of round.cards){
   const b=document.createElement('button');b.type='button';b.className='pair-card';b.dataset.cardId=card.id;b.setAttribute('aria-pressed','false');
   b.dataset.side=card.side;b.setAttribute('aria-describedby',`pair-${card.side}-heading`);
   const status=document.createElement('span');status.className='pair-card__state';status.setAttribute('aria-hidden','true');
   let content;
   if(card.kind==='operation'){
    content=document.createElement('span');content.className='pair-operation';content.setAttribute('role','img');
    content.setAttribute('aria-label',card.terms.map(t=>`${t.numerator} sobre ${t.denominator}`).join(' mais '));
    card.terms.forEach((term,i)=>{if(i)content.append(document.createTextNode(' + '));const f=FractionView.fraction(term);f.setAttribute('aria-hidden','true');content.append(f);});
   }else content=card.kind==='visual'?FractionView.pizza(card):FractionView.fraction(card);
   b.dataset.description=content.getAttribute('aria-label');
   b.append(content,status);
   b.addEventListener('click',()=>choose(card.id));buttons.set(card.id,b);$('board').append(b);
  }
  progress();
 }
 function restart(){roundIndex=0;sessionLevel={...level,items:PairEngine.shuffle(level.items)};render();}
 $('next').onclick=()=>{if(!state.completed||roundIndex>=total-1)return;roundIndex++;render();buttons.values().next().value.focus();};
 $('restart').onclick=restart;$('again').onclick=()=>{restart();buttons.values().next().value.focus();};
 $('level').onchange=()=>{level=PairChallenges.find(item=>item.id===$('level').value);restart();};
 $('next-level').onclick=()=>{const next=PairChallenges[PairChallenges.indexOf(level)+1];if(next){level=next;$('level').value=level.id;restart();buttons.values().next().value.focus();}};
 addEventListener('pagehide',()=>clearTimeout(feedbackTimer));
 addEventListener('pageshow',event=>{if(event.persisted){state.unlock();clearFeedback();}});
 restart();
})();
