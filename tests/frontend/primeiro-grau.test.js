function testFirstDegree(source) {
    const assert = (value, message) => { if (!value) throw new Error(message); };
    const values = {a:{value:'2'},b:{value:'-4'},xInicial:{value:'-10'},xFinal:{value:'10'},
        equacao:{},raiz:{},coefAngular:{},coefLinear:{},comportamento:{},interceptoY:{},grafico:{getContext:()=>({})}};
    const chartCalls=[];
    const fakeDocument={getElementById:id=>values[id]};
    function FakeChart(_ctx,config){chartCalls.push(config);this.destroy=()=>{};}
    const fakeAlert=message=>{throw new Error(message);};
    const calculate=new Function('document','Chart','alert',source+'\nreturn calcularFuncao;')(fakeDocument,FakeChart,fakeAlert);
    calculate();
        assert(values.raiz.textContent==='x = 2','raiz da função');
        assert(values.comportamento.textContent==='Crescente','comportamento crescente');
        assert(values.interceptoY.textContent==='(0, -4)','intercepto Y');
        assert(chartCalls.length===1&&chartCalls[0].data.datasets[0].data[50]===-4,'gráfico local com f(0)');
        values.a.value='-2';calculate();
        assert(values.comportamento.textContent==='Decrescente'&&chartCalls.length===2,'atualiza função e gráfico');
        return 'Função do 1º Grau: raiz, coeficientes, comportamento e gráfico OK';
}
