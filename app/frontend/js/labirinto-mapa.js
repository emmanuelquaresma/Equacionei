/* Gerador independente de tabuada, pontuação e interface. 0 = corredor, 1 = parede. */
const MazeGenerator = (() => {
    const key = p => p.row + ',' + p.col;
    const directions = [{row:-1,col:0},{row:1,col:0},{row:0,col:-1},{row:0,col:1}];
    function neighbors(grid,p) {
        return directions.map(d=>({row:p.row+d.row,col:p.col+d.col})).filter(q=>grid[q.row]?.[q.col]===0);
    }
    function distances(grid,start,blocked=null) {
        const result=new Map([[key(start),0]]),queue=[start];
        for(let i=0;i<queue.length;i++) for(const p of neighbors(grid,queue[i])) {
            if(key(p)===blocked||result.has(key(p)))continue;
            result.set(key(p),result.get(key(queue[i]))+1);queue.push(p);
        }
        return result;
    }
    function floors(grid) { return grid.flatMap((line,row)=>line.flatMap((v,col)=>v===0?[{row,col}]:[])); }
    function validateConnectivity(grid,start={row:1,col:1}) {
        return grid[start.row]?.[start.col]===0 && distances(grid,start).size===floors(grid).length;
    }
    function shuffled(values,random) {
        const out=[...values];for(let i=out.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;
    }
    function generateMaze(size=13,random=Math.random) {
        if(size<11||size%2===0)throw Error('Dimensão ímpar, a partir de 11.');
        const grid=Array.from({length:size},()=>Array(size).fill(1));
        const start={row:1,col:1},stack=[start];grid[1][1]=0;
        while(stack.length) {
            const p=stack[stack.length-1];
            const choices=shuffled(directions,random).map(d=>({row:p.row+2*d.row,col:p.col+2*d.col})).filter(q=>q.row>0&&q.col>0&&q.row<size-1&&q.col<size-1&&grid[q.row][q.col]===1);
            if(!choices.length){stack.pop();continue;}
            const q=choices[0];grid[(p.row+q.row)/2][(p.col+q.col)/2]=0;grid[q.row][q.col]=0;stack.push(q);
        }
        // Abre passagens entre dois corredores para criar rotas de fuga.
        const walls=[];
        for(let row=1;row<size-1;row++)for(let col=1;col<size-1;col++) {
            if(grid[row][col]===1&&((grid[row-1][col]===0&&grid[row+1][col]===0)||(grid[row][col-1]===0&&grid[row][col+1]===0)))walls.push({row,col});
        }
        for(const p of shuffled(walls,random).slice(0,Math.floor(size*.9)))grid[p.row][p.col]=0;
        if(!validateConnectivity(grid,start))throw Error('Mapa desconectado.');
        return grid;
    }
    function findPositions(grid,random=Math.random) {
        const size=grid.length,player={row:1,col:1},all=floors(grid),distance=distances(grid,player);
        const far=shuffled(all.filter(p=>distance.get(key(p))>=10),random).sort((a,b)=>distance.get(key(b))-distance.get(key(a)));
        const operators=far.slice(0,4),reserved=new Set([key(player),...operators.map(key)]);
        const corners=[{row:1,col:1},{row:1,col:size-2},{row:size-2,col:1},{row:size-2,col:size-2}];
        const powers=corners.map(corner=>{
            const p=all.filter(p=>!reserved.has(key(p))).sort((a,b)=>(Math.abs(a.row-corner.row)+Math.abs(a.col-corner.col))-(Math.abs(b.row-corner.row)+Math.abs(b.col-corner.col)))[0];
            reserved.add(key(p));return p;
        });
        const available=shuffled(all.filter(p=>!reserved.has(key(p))&&distance.get(key(p))>2),random);
        // Intercala quadrantes para espalhar os objetivos pelo mapa.
        const buckets=[[],[],[],[]];available.forEach(p=>buckets[(p.row>=size/2?2:0)+(p.col>=size/2?1:0)].push(p));
        const items=[];while(buckets.some(b=>b.length))for(const b of buckets)if(b.length)items.push(b.pop());
        return {player,operators,powers,items};
    }
    function nextStep(grid,from,target,random=Math.random,flee=false) {
        const options=shuffled(neighbors(grid,from),random),distance=distances(grid,target);
        options.sort((a,b)=>((distance.get(key(a))??999)-(distance.get(key(b))??999))*(flee?-1:1));
        return options[0]||from;
    }
    return {key,neighbors,distances,floors,validateConnectivity,shuffled,generateMaze,findPositions,nextStep};
})();
