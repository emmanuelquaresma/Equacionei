const FractionView = (() => {
 const ns='http://www.w3.org/2000/svg';
 function label({numerator:n,denominator:d}){return `${n} de ${d} partes iguais preenchidas`;}
 function fraction(value){
  const el=document.createElement('span');el.className='math-fraction';el.setAttribute('role','img');el.setAttribute('aria-label',`${value.numerator} sobre ${value.denominator}`);
  ['numerator','denominator'].forEach((part,i)=>{const span=document.createElement('span');span.className=`math-fraction__${part}`;span.textContent=value[i===0?'numerator':'denominator'];span.setAttribute('aria-hidden','true');el.append(span);});return el;
 }
 function pizza({numerator:n,denominator:d}){
  if(!Number.isInteger(n)||!Number.isInteger(d)||d<1||n<0||n>d)throw Error('Fração visual inválida.');
  const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 104 104');svg.setAttribute('class','fraction-pizza');svg.setAttribute('role','img');svg.setAttribute('aria-label',`Representação gráfica: ${label({numerator:n,denominator:d})}`);
  for(let i=0;i<d;i++){
   const slice=document.createElementNS(ns,d===1?'circle':'path');
   if(d===1){slice.setAttribute('cx','52');slice.setAttribute('cy','52');slice.setAttribute('r','48');}
   else {
    const angle=i*2*Math.PI/d-Math.PI/2,next=(i+1)*2*Math.PI/d-Math.PI/2;
    const x=a=>52+48*Math.cos(a),y=a=>52+48*Math.sin(a);
    slice.setAttribute('d',`M52 52 L${x(angle)} ${y(angle)} A48 48 0 ${2*Math.PI/d>Math.PI?1:0} 1 ${x(next)} ${y(next)} Z`);
   }
   if(i<n)slice.setAttribute('class','is-filled');svg.append(slice);
  }
  return svg;
 }
 return {fraction,pizza,label};
})();
