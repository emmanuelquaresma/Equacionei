/* Carregar na página do jogo em um perfil de teste. */
async function testPairGame(){
 const assert=(ok,message)=>{if(!ok)throw Error(message);},f=(numerator,denominator)=>({numerator,denominator});
 const visual=[[1,2],[1,3],[2,3],[3,4],[4,5],[5,6]];
 for(const [n,d] of visual){const svg=FractionView.pizza(f(n,d));assert(svg.children.length===d,'Total de setores');assert(svg.querySelectorAll('.is-filled').length===n,'Setores preenchidos');}
 for(const [a,b,c,d] of [[1,2,2,4],[1,3,2,6],[2,3,4,6],[3,4,6,8],[2,5,4,10]])assert(PairEngine.equivalent(f(a,b),f(c,d)),'Equivalência');
 for(const [a,b,c,d] of [[1,2,2,3],[1,3,2,5],[2,3,3,4]])assert(!PairEngine.equivalent(f(a,b),f(c,d)),'Par falso');
 const orders=new Set();
 for(const level of PairChallenges)for(let i=0;i<100;i++){
  const round=PairEngine.createRound(level,i),state=PairEngine.createState(round);
  const left=round.cards.filter(c=>c.side==='left'),right=round.cards.filter(c=>c.side==='right');
  assert(left.length===3&&right.length===3,'Três cartões por coluna');
  orders.add(round.cards.map(c=>c.id).join(','));
  assert(!left.every((c,i)=>PairEngine.equivalent(c,right[i])),'Não alinhar todos os pares');
  assert(left.every(c=>c.kind===(level.type==='match'?'visual':level.type==='equivalence'?'fraction':'operation')),'Categoria esquerda');
  assert(right.every(c=>c.kind==='fraction'),'Somente respostas à direita');
  state.select(left[0].id);assert(state.select(left[1].id).status==='selected','Trocar seleção na mesma coluna');assert(!state.matched.length,'Mesma coluna não é par');
  state.select(left[1].id);
  const bad=right.find(c=>!PairEngine.equivalent(c,left[0]));state.select(left[0].id);
  assert(state.select(bad.id).status==='wrong','Par errado');assert(state.select(left[1].id).status==='ignored','Bloquear durante erro');state.unlock();
  for(const l of left){
   const matches=right.filter(r=>PairEngine.equivalent(l,r));assert(matches.length===1,'Parceiro único');
   if(level.type==='match'){const svg=FractionView.pizza(l);assert(svg.children.length===l.denominator&&svg.querySelectorAll('.is-filled').length===l.numerator,'SVG corresponde ao próprio objeto');}
   if(level.type==='equivalence')assert(l.numerator!==matches[0].numerator||l.denominator!==matches[0].denominator,'Representações diferentes');
   if(level.type==='operation')assert(l.numerator===l.terms.reduce((n,t)=>n+t.numerator,0)&&l.denominator===l.terms[0].denominator,'Soma correta');
   // A escolha pode começar à direita, inclusive quando ambos são frações.
   state.select(matches[0].id);assert(state.select(l.id).status==='correct','Par matemático correto');assert(state.select(l.id).status==='ignored','Bloquear acerto');
  }
  assert(state.completed,'Concluir os três pares');
 }
 assert(orders.size>5,'Embaralhamento variável por coluna');
 const ambiguous={cards:[...Array.from({length:3},(_,i)=>({id:'l'+i,side:'left',...f(1,2)})),...Array.from({length:3},(_,i)=>({id:'r'+i,side:'right',...f(i+2,(i+2)*2)}))]};
 let rejected=false;try{PairEngine.validateRound(ambiguous);}catch{rejected=true;}assert(rejected,'Rejeitar parceiros ambíguos');
 return ['6 gráficos exatos','5 equivalências','3 pares falsos','300 rodadas nos três níveis','Seleção por coluna, erro, bloqueio e vitória','Rejeição de ambiguidade'];
}
