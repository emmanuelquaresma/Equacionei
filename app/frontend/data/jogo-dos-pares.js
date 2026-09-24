/* A matemática é a fonte dos desenhos, das frações e da validação. */
const PairChallenges = [
 {id:'recognize',title:'Nível 1 · Gráfico e fração',type:'match',items:[
  {numerator:1,denominator:2},{numerator:1,denominator:3},
  {numerator:2,denominator:3},{numerator:1,denominator:4},
  {numerator:3,denominator:4},{numerator:4,denominator:5},
  {numerator:5,denominator:6}
 ]},
 {id:'divisions',title:'Nível 2 · Frações equivalentes',type:'equivalence',items:[
  {numerator:1,denominator:2,equivalent:{numerator:2,denominator:4}},
  {numerator:1,denominator:3,equivalent:{numerator:2,denominator:6}},
  {numerator:2,denominator:3,equivalent:{numerator:4,denominator:6}},
  {numerator:3,denominator:4,equivalent:{numerator:6,denominator:8}},
  {numerator:2,denominator:5,equivalent:{numerator:4,denominator:10}},
  {numerator:3,denominator:6,equivalent:{numerator:1,denominator:2}},
  {numerator:3,denominator:9,equivalent:{numerator:1,denominator:3}}
 ]},
 {id:'addition',title:'Nível 3 · Operação e resultado',type:'operation',items:[
  {terms:[{numerator:1,denominator:3},{numerator:1,denominator:3}]},
  {terms:[{numerator:1,denominator:4},{numerator:2,denominator:4}]},
  {terms:[{numerator:2,denominator:5},{numerator:1,denominator:5}]},
  {terms:[{numerator:2,denominator:6},{numerator:3,denominator:6}]},
  {terms:[{numerator:1,denominator:2},{numerator:1,denominator:2}]}
 ]}
];
