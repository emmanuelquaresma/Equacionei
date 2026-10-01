/* Fluxo educacional; contratos de dataset/resultado permitem futuros algoritmos. */
(() => {
    'use strict';
    const $ = id => document.getElementById(id);
    const state = { dataset: null, model: null, busy: false, limits: null };
    const parameterInfo = [
        ['n_estimators', 'Número de árvores', 100, 1, 200, 1, 'Quantas árvores corrigem os erros em sequência. Mais árvores aumentam o custo e podem causar sobreajuste.'],
        ['max_depth', 'Profundidade máxima', 6, 1, 8, 1, 'Limita os níveis de cada árvore. Árvores profundas capturam detalhes, mas podem decorar o treino.'],
        ['learning_rate', 'Taxa de aprendizado', .1, .01, 1, .01, 'Define quanto cada nova árvore contribui para corrigir os erros. Valores menores podem exigir mais árvores.'],
        ['subsample', 'Fração de linhas por árvore', 1, .1, 1, .1, 'Amostra de linhas do treino usada em cada árvore. Uma fração menor pode reduzir o sobreajuste.'],
        ['colsample_bytree', 'Fração de features por árvore', 1, .1, 1, .1, 'Fração das variáveis disponíveis para cada árvore. Pode ajudar a diversificar o aprendizado.'],
    ];
    const metricInfo = {
        accuracy: ['Accuracy', 'Proporção de acertos no teste; pode esconder dificuldades com classes raras.'],
        precision: ['Precision (macro)', 'Entre as previsões de cada classe, quantas estavam corretas; média com o mesmo peso por classe.'],
        recall: ['Recall (macro)', 'Quanto dos exemplos reais de cada classe foi identificado; média entre classes.'],
        f1: ['F1-score (macro)', 'Equilíbrio entre precision e recall, calculado por classe e depois promediado.'],
        roc_auc: ['ROC-AUC', 'Capacidade de separar classes usando probabilidades. Multiclasse: média macro, uma classe contra as demais.'],
        mae: ['MAE', 'Erro absoluto médio, na mesma unidade do target. Menor é melhor.'],
        mse: ['MSE', 'Média dos erros ao quadrado; penaliza mais os erros grandes. Menor é melhor.'],
        rmse: ['RMSE', 'Raiz do MSE, na unidade do target. Menor é melhor.'],
        r2: ['R²', 'Variação explicada pelo modelo. Mais próximo de 1 é melhor; pode ser negativo. Não avalie isoladamente.'],
    };
    const el = (tag, text, className) => {
        const node = document.createElement(tag);
        if (text !== undefined) node.textContent = text;
        if (className) node.className = className;
        return node;
    };
    const number = value => value == null ? 'Não aplicável' : Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 4 });
    function error(message = '') { $('ml-error').textContent = message; $('ml-error').hidden = !message; }
    async function api(path, body, options = {}) {
        let response;
        try {
            response = await fetch('/api/ml' + path, body === undefined ? options : {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), ...options,
            });
        } catch (_) { throw Error('Não foi possível conectar ao laboratório. Verifique sua conexão e tente novamente.'); }
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw Error(typeof data.detail === 'string' ? data.detail : 'Não foi possível concluir a operação. Confira os dados e tente novamente.');
        return data;
    }
    function busy(value) {
        state.busy = value;
        for (const id of ['dataset-controls', 'training-controls', 'prediction-controls', 'clear-experiment']) $(id).disabled = value;
        $('train').textContent = value ? 'Aguarde...' : 'Treinar modelo';
        document.querySelector('main').setAttribute('aria-busy', String(value));
    }
    async function operation(message, work) {
        if (state.busy) return;
        busy(true); error(); $('ml-status').textContent = message;
        try { await work(); }
        catch (e) { error(e.message); $('ml-status').textContent = ''; }
        finally { busy(false); }
    }
    function release(dataset, model) {
        const body = {};
        if (dataset) body.dataset_id = dataset.dataset_id;
        if (model) body.model_id = model.model_id;
        if (Object.keys(body).length) api('/release', body).catch(() => {});
    }
    function invalidate() {
        release(null, state.model); state.model = null;
        $('results').hidden = $('prediction').hidden = true;
        $('prediction-result').replaceChildren();
        $('training-state').textContent = '';
    }
    function table(container, headings, rows, caption) {
        container.replaceChildren();
        const t = el('table'), head = el('thead'), tr = el('tr'), body = el('tbody');
        if (caption) t.append(el('caption', caption));
        headings.forEach(name => { const th = el('th', name); th.scope = 'col'; tr.append(th); });
        head.append(tr);
        rows.forEach(row => { const line = el('tr'); row.forEach(value => line.append(el('td', value == null ? '—' : String(value)))); body.append(line); });
        t.append(head, body); container.append(t);
    }
    function targetChanged() {
        invalidate();
        const target = $('target').value;
        const column = state.dataset.columns.find(c => c.name === target);
        $('model-type').value = column.suggested_task;
        $('task-suggestion').textContent = 'Sugestão pelos valores do target: ' + (column.suggested_task === 'classification' ? 'classificação' : 'regressão') + '. Você pode alterá-la.';
        $('features').replaceChildren();
        state.dataset.columns.forEach((c, index) => {
            const label = el('label'), input = el('input'); input.type = 'checkbox'; input.value = c.name;
            input.name = 'feature'; input.id = 'feature-' + index;
            input.disabled = c.name === target; input.checked = c.name !== target;
            label.append(input, el('span', c.name + (c.name === target ? ' (target)' : ''))); $('features').append(label);
        });
    }
    function showDataset(data) {
        const previous = state.dataset;
        invalidate(); state.dataset = data; release(previous, null);
        $('dataset-preview').hidden = $('train-form').hidden = $('clear-experiment').hidden = false;
        $('dataset-title').textContent = data.name;
        $('dataset-summary').textContent = `${data.rows} linhas · ${data.column_count} colunas · ${data.columns.reduce((n,c)=>n+c.missing,0)} valores ausentes. Amostra de ${data.preview.length} linhas.`;
        table($('column-table'), ['Coluna', 'Tipo', 'Ausentes', 'Valores distintos'], data.columns.map(c => [c.name, c.type === 'numeric' ? 'Numérica' : 'Categórica', c.missing, c.unique]));
        table($('preview-table'), data.columns.map(c => c.name), data.preview.map(row => data.columns.map(c => row[c.name])), 'Primeiras linhas');
        $('target').replaceChildren();
        data.columns.forEach(c => { const option = el('option', c.name); option.value = c.name; $('target').append(option); });
        $('target').value = data.default_target; targetChanged();
        $('ml-status').textContent = 'Dataset carregado. Escolha o target e confira as features na etapa 2.';
    }
    function drawScatter(data) {
        const box = $('evaluation-chart'); box.replaceChildren();
        const width = Math.min(740, Math.max(240, box.clientWidth)), height = 300;
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`); svg.setAttribute('role', 'img');
        svg.setAttribute('aria-label', 'Dispersão: valores reais no eixo horizontal e previstos no vertical. A linha diagonal representa previsões perfeitas.');
        function shape(tag, attrs, text) { const n = document.createElementNS(svg.namespaceURI, tag); Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,v)); if(text!==undefined)n.textContent=text; svg.append(n); }
        const all = [...data.actual, ...data.predicted], low = Math.min(...all), high = Math.max(...all), span = high-low || 1;
        const left = 56, right = width-18, top = 22, bottom = 248;
        const x = v => left + (v-low)/span*(right-left), y = v => bottom - (v-low)/span*(bottom-top);
        shape('line', {x1:left,y1:bottom,x2:right,y2:bottom,stroke:'#667e91'});
        shape('line', {x1:left,y1:top,x2:left,y2:bottom,stroke:'#667e91'});
        shape('line', {x1:left,y1:bottom,x2:right,y2:top,stroke:'#977724','stroke-dasharray':'5 4'});
        for(let i=0;i<=2;i++) {
            const v = low+span*i/2, label = Number(v.toPrecision(3)).toLocaleString('pt-BR');
            shape('text',{x:x(v),y:bottom+18,'text-anchor':'middle','font-size':11,fill:'#334e63'},label);
            shape('text',{x:left-6,y:y(v)+4,'text-anchor':'end','font-size':11,fill:'#334e63'},label);
        }
        data.actual.forEach((v,i)=>shape('circle',{cx:x(v),cy:y(data.predicted[i]),r:3.3,fill:'#17659a',opacity:.6}));
        shape('text',{x:(left+right)/2,y:290,'text-anchor':'middle','font-size':13,fill:'#163653'},'Valor real');
        shape('text',{x:left,y:14,'font-size':13,fill:'#163653'},'Valor previsto');
        box.append(svg, el('p', `${data.shown} de ${data.total} previsões de teste exibidas. A linha tracejada indica real = previsto.`));
    }
    function showResults(result) {
        state.model = result;
        $('results').hidden = $('prediction').hidden = false;
        $('split-summary').textContent = `${result.train_rows} registros para treinar · ${result.test_rows} para testar · ${number(result.elapsed_seconds)} s. Métricas calculadas somente no teste.`;
        $('preparation-summary').textContent = `${result.preparation.numeric.length} features numéricas e ${result.preparation.categorical.length} categóricas. ${Object.values(result.preparation.missing).reduce((a,b)=>a+b,0)} valores ausentes nas entradas; preparação ajustada somente no treino.`;
        $('metrics').replaceChildren();
        Object.entries(result.metrics).forEach(([key,value]) => {
            const card = el('div', undefined, 'ml-metric'), [name, description] = metricInfo[key];
            const explanation = el('details'); explanation.append(el('summary', 'Como interpretar'), el('p', description));
            const compact = value == null ? 'Não aplicável' : Number(value).toLocaleString('pt-BR', { maximumSignificantDigits: 4 });
            card.append(el('h3', name), el('strong', compact), explanation); $('metrics').append(card);
        });
        const classification = result.model_type === 'classification';
        $('metric-note').textContent = classification ? 'Accuracy, Precision, Recall, F1 e ROC-AUC variam de 0 a 1. ROC-AUC indisponível aparece como “Não aplicável”.' : 'R² não é definido quando o target do teste é constante; nesse caso, aparece como “Não aplicável”.';
        $('evaluation-title').textContent = classification ? 'Matriz de Confusão' : 'Valores reais × previstos';
        $('evaluation-help').textContent = classification ? 'A matriz mostra onde o modelo acertou e onde confundiu as classes. Linhas: classe real. Colunas: classe prevista.' : 'Quanto mais perto da diagonal, menor a diferença entre a previsão e o valor real.';
        if (classification) {
            const wrap = el('div', undefined, 'ml-table-scroll'); wrap.tabIndex = 0; wrap.setAttribute('role', 'region'); wrap.setAttribute('aria-label','Matriz de confusão');
            table(wrap, ['Real ↓ / Prevista →', ...result.evaluation.labels], result.evaluation.matrix.map((row,i)=>[result.evaluation.labels[i], ...row]));
            const max = Math.max(1, ...result.evaluation.matrix.flat());
            [...wrap.querySelectorAll('tbody tr')].forEach((tr,i)=> [...tr.children].slice(1).forEach((cell,j)=>{cell.style.backgroundColor=`rgba(23,101,154,${.05+.3*result.evaluation.matrix[i][j]/max})`; if(i===j)cell.style.fontWeight='750';}));
            $('evaluation-chart').replaceChildren(wrap);
        } else drawScatter(result.evaluation);
        $('importance').replaceChildren();
        result.feature_importance.forEach(item => {
            const row = el('div',undefined,'ds-bar-row'), bar = el('div',undefined,'ds-bar'), fill = el('span');
            fill.style.width = (item.importance*100)+'%'; bar.setAttribute('aria-hidden','true'); bar.append(fill);
            row.append(el('p',`${item.feature} — ${number(item.importance*100)}%`),bar); $('importance').append(row);
        });
        const summary = { 'Algoritmo': 'XGBoost', 'Tipo': classification ? 'Classificação' : 'Regressão', Dataset: result.dataset, Target: result.target,
            'Features': result.features.join(', '), 'Número de features': result.features.length, Registros: result.rows,
            'Treino / teste': `${result.train_rows} / ${result.test_rows}`, 'Validade': `${Math.round(result.expires_in_seconds/60)} minutos após o treino` };
        Object.entries(result.parameters).forEach(([k,v])=>summary[k]=v);
        Object.entries(result.metrics).forEach(([k,v])=>summary[metricInfo[k][0]]=number(v));
        $('experiment-summary').replaceChildren(); Object.entries(summary).forEach(([k,v])=>$('experiment-summary').append(el('dt',k),el('dd',v)));
        $('prediction-fields').replaceChildren();
        result.prediction_fields.forEach((field,i) => {
            const div = el('div'), label = el('label',field.name), input = el('input');
            input.id = 'prediction-'+i; input.name = field.name; label.htmlFor = input.id;
            input.type = field.type === 'numeric' ? 'number' : 'text'; if(input.type==='number')input.step='any';
            input.value = field.default == null ? '' : String(field.default);
            if(field.type==='categorical') {
                input.maxLength = state.limits.max_cell_chars;
                const list=el('datalist'); list.id='categories-'+i;
                field.categories.forEach(c=>{const o=el('option');o.value=c;list.append(o);});
                input.setAttribute('list',list.id);div.append(list);
            }
            div.append(label,input); $('prediction-fields').append(div);
        });
        $('prediction-result').replaceChildren();
        $('training-state').textContent = 'Treinamento concluído. Resultados disponíveis abaixo.';
        $('ml-status').textContent = 'Modelo treinado. Analise o teste e experimente uma previsão.';
        $('results').querySelector('h2').focus({preventScroll:true});
        $('results').scrollIntoView({behavior:'smooth',block:'start'});
    }
    parameterInfo.forEach(([key,title,value,min,max,step,help])=>{
        const div=el('div'),label=el('label',`${title} — ${key}`),input=el('input'),small=el('small',help);
        input.id=key; input.type='number';input.value=value;input.min=min;input.max=max;input.step=step;input.required=true;
        label.htmlFor=key;small.id=key+'-help';input.setAttribute('aria-describedby',small.id);div.append(label,input,small);$('parameters').append(div);
    });
    $('load-demo').addEventListener('click',()=>operation('Carregando demonstração...',async()=>showDataset(await api('/datasets/demo/'+encodeURIComponent($('demo').value),{}))));
    $('csv').addEventListener('change',()=>{$('upload').disabled=!$('csv').files.length;});
    $('upload').addEventListener('click',()=>operation('Lendo e validando o CSV...',async()=>{
        const file=$('csv').files[0];
        if(!file || !/\.csv$/i.test(file.name))throw Error('Selecione um arquivo CSV.');
        if(file.size>state.limits.max_upload_mb*1024*1024)throw Error(`O limite é ${state.limits.max_upload_mb} MB.`);
        const response=await api('/datasets/upload?filename='+encodeURIComponent(file.name),undefined,{method:'POST',headers:{'Content-Type':'text/csv'},body:file});
        showDataset(response);
    }));
    $('target').addEventListener('change',targetChanged);
    $('train-form').addEventListener('input',invalidate);
    $('train-percent').addEventListener('input',()=>{$('test-percent').textContent=`Teste: ${100-Number($('train-percent').value)}%. Dados que não participam do treinamento.`;});
    $('train-form').addEventListener('submit',event=>{
        event.preventDefault();
        if(state.busy)return;
        const features=[...document.querySelectorAll('#features input:checked:not(:disabled)')].map(input=>input.value);
        if(!features.length){error('Selecione pelo menos uma feature.');return;}
        const parameters=Object.fromEntries([...parameterInfo.map(p=>p[0]),'random_state'].map(k=>[k,Number($(k).value)]));
        operation('Treinando modelo...',async()=>{
            $('training-state').textContent='Treinando modelo...';$('train').textContent='Treinando modelo...';
            try {
                const result=await api('/xgboost/train',{dataset_id:state.dataset.dataset_id,target:$('target').value,features,
                    model_type:$('model-type').value,test_size:Number(((100-Number($('train-percent').value))/100).toFixed(2)),parameters});
                release(null,state.model);showResults(result);
            } finally { if($('training-state').textContent==='Treinando modelo...')$('training-state').textContent='Treino não concluído. Confira a mensagem acima.'; }
        });
    });
    $('predict-form').addEventListener('submit',event=>{
        event.preventDefault(); if(!state.model)return;
        const values=Object.fromEntries([...document.querySelectorAll('#prediction-fields input')].map(input=>[input.name,input.value===''?null:input.type==='number'?Number(input.value):input.value]));
        operation('Calculando previsão...',async()=>{
            const result=await api('/xgboost/predict',{model_id:state.model.model_id,values});
            $('prediction-result').replaceChildren(el('p','Previsão: '+(typeof result.prediction==='number'?number(result.prediction):result.prediction)));
            if(result.probabilities){const list=el('ul');result.probabilities.forEach(p=>list.append(el('li',`${p.class}: ${number(p.probability*100)}%`)));$('prediction-result').append(list,el('p','Probabilidades estimadas pelo modelo, sem calibração adicional.'));}
            $('ml-status').textContent='Previsão concluída.';
        });
    });
    $('clear-experiment').addEventListener('click',()=>{
        invalidate();release(state.dataset,null);state.dataset=null;
        for(const id of ['dataset-preview','train-form','clear-experiment'])$(id).hidden=true;
        $('csv').value='';$('upload').disabled=true;error();$('ml-status').textContent='Experimento limpo. Escolha outro dataset.';
    });
    let resizeTimer;
    window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{if(state.model?.model_type==='regression')drawScatter(state.model.evaluation);},100);});
    api('/datasets').then(data=>{
        state.limits=data.limits;
        data.demos.forEach(d=>{const o=el('option',d.name+' · '+(d.model_type==='classification'?'classificação':'regressão'));o.value=d.id;$('demo').append(o);});
        $('n_estimators').max=data.limits.max_estimators;$('max_depth').max=data.limits.max_depth;
        $('n_estimators').value=Math.min(100,data.limits.max_estimators);$('max_depth').value=Math.min(6,data.limits.max_depth);
        $('demo').disabled=$('load-demo').disabled=$('csv').disabled=false;
        $('upload-limits').textContent=`Até ${data.limits.max_upload_mb} MB, ${data.limits.max_rows} linhas e ${data.limits.max_columns} colunas. CSV UTF-8 com cabeçalho; separadores: vírgula, ponto e vírgula ou tabulação.`;
        $('ml-status').textContent='Comece carregando um dataset.';
    }).catch(e=>{error(e.message+' Recarregue a página para tentar novamente.');$('ml-status').textContent='';});
})();
