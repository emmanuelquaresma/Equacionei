"""Fluxos reais ASGI + scikit-learn/XGBoost; sem servidor ou nova biblioteca de testes."""
import json
import time
import unittest
from dataclasses import replace
from unittest.mock import patch
import numpy as np
from fastapi import FastAPI
from config.ml import LIMITS
from routes import ml
from schemas.ml import TrainRequest
from services.ml.errors import LabError
from services.ml.service import LabService
from services.ml.store import MemoryStore
from services.ml.datasets import load_csv
from services.rate_limit import limiter


class MLApiTest(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        limiter._events.clear()
        ml.service = LabService()
        self.app = FastAPI()
        self.app.include_router(ml.router)

    async def http(self, method, path, body=None, raw=None, query=b''):
        content = raw if raw is not None else json.dumps(body).encode() if body is not None else b''
        messages = []
        async def receive():
            return {'type': 'http.request', 'body': content, 'more_body': False}
        async def send(message):
            messages.append(message)
        await self.app({'type': 'http', 'asgi': {'version': '3.0'}, 'http_version': '1.1',
                        'method': method, 'scheme': 'http', 'path': '/api/ml'+path, 'raw_path': ('/api/ml'+path).encode(),
                        'query_string': query, 'headers': [(b'content-type', b'application/json')],
                        'server': ('test',80), 'client': ('test',1), 'root_path': ''}, receive, send)
        data = json.loads(b''.join(m.get('body', b'') for m in messages))
        self.response_headers = dict(messages[0].get('headers', []))
        return messages[0]['status'], data

    async def demo(self, name='iris'):
        code, data = await self.http('POST', '/datasets/demo/'+name)
        self.assertEqual(code,200,data)
        return data

    def config(self, data, task='classification'):
        return {'dataset_id':data['dataset_id'], 'target':'target',
                'features':[c['name'] for c in data['columns'] if c['name']!='target'],
                'model_type':task, 'parameters':{'n_estimators':20}}

    async def test_classification_and_regression_end_to_end(self):
        for demo, task in [('iris','classification'),('breast-cancer','classification'),('wine','classification'),('diabetes','regression')]:
            data = await self.demo(demo)
            code, trained = await self.http('POST','/xgboost/train',self.config(data,task))
            self.assertEqual(code,200,trained)
            self.assertEqual(trained['train_rows']+trained['test_rows'],data['rows'])
            self.assertTrue(all(v is None or np.isfinite(v) for v in trained['metrics'].values()))
            self.assertAlmostEqual(sum(x['importance'] for x in trained['feature_importance']),1.)
            self.assertEqual({x['feature'] for x in trained['feature_importance']},set(trained['features']))
            code, prediction = await self.http('POST','/xgboost/predict',{'model_id':trained['model_id'],
                'values':{f['name']:f['default'] for f in trained['prediction_fields']}})
            self.assertEqual(code,200,prediction)
            if task=='classification':
                self.assertIn('roc_auc',trained['metrics'])
                self.assertAlmostEqual(sum(p['probability'] for p in prediction['probabilities']),1.,places=5)
                self.assertEqual(sum(map(sum,trained['evaluation']['matrix'])),trained['test_rows'])
            else:
                self.assertEqual(set(trained['metrics']),{'mae','mse','rmse','r2'})
                self.assertAlmostEqual(trained['metrics']['rmse']**2,trained['metrics']['mse'])
                self.assertIsInstance(prediction['prediction'],float)

    async def test_upload_categorical_nulls_prediction_and_no_leakage(self):
        # Categoria exclusiva do teste e extremo numérico não podem entrar na preparação.
        from sklearn.model_selection import train_test_split
        train_indices,test_indices=train_test_split(np.arange(40),test_size=.2,random_state=42)
        test=set(test_indices)
        rows=['amount,kind,empty,target']
        for i in range(40):
            rows.append(f'{100000 if i in test else i},{"unseen" if i in test else "normal" if i%2 else ""},,{i*2}')
        code,data=await self.http('POST','/datasets/upload',raw='\n'.join(rows).encode(),query=b'filename=../../example.csv')
        self.assertEqual(code,200,data)
        config=self.config(data,'regression')
        code,r=await self.http('POST','/xgboost/train',config)
        self.assertEqual(code,200,r)
        pipeline=ml.service.models.get(r['model_id'])['pipeline']
        numeric=pipeline.named_steps['prepare'].named_transformers_['numeric']
        self.assertEqual(numeric.statistics_[0],np.median(train_indices))
        categories=pipeline.named_steps['prepare'].named_transformers_['categorical'].named_steps['encode'].categories_[0]
        self.assertNotIn('unseen',categories)
        code,p=await self.http('POST','/xgboost/predict',{'model_id':r['model_id'],'values':{'amount':None,'kind':'brand new','empty':None}})
        self.assertEqual(code,200,p)
        self.assertTrue(np.isfinite(p['prediction']))
        # Nova previsão usa a mesma preparação, não refaz fit.
        self.assertEqual(numeric.statistics_[0],np.median(train_indices))

    async def test_invalid_csv(self):
        cases=[(b'',b'filename=a.csv'),(b'a,b\n1,2',b'filename=a.exe'),(b'not a table',b'filename=a.csv'),
               (b'a,a\n1,2',b'filename=a.csv'),(b'a,b\n',b'filename=a.csv'),(b'a,b\n1,2,3\n4,5',b'filename=a.csv'),
               (b'a,b\n\x00,2',b'filename=a.csv'),(b'a,b\n\xff,2',b'filename=a.csv'),(b'a,b\ninf,2',b'filename=a.csv')]
        for raw,query in cases:
            code,data=await self.http('POST','/datasets/upload',raw=raw,query=query)
            self.assertEqual(code,422,(raw,data))
            self.assertIsInstance(data['detail'],str)
        for separator in [',',';','\t']:
            raw=f' feature {separator}target\n1{separator}a\n2{separator}b'.encode()
            code,data=await self.http('POST','/datasets/upload',raw=raw,query=b'filename=a.csv')
            self.assertEqual(code,200,data)
            self.assertEqual(data['columns'][0]['name'],'feature')

    async def test_invalid_target_features_parameters_and_no_model(self):
        data=await self.demo()
        original=self.config(data)
        for changes in [{'target':'absent'},{'features':['target']},{'features':[]},{'features':['absent']},
                        {'features':[original['features'][0]]*2},{'parameters':{'n_estimators':0}},
                        {'parameters':{'max_depth':LIMITS.max_depth+1}},{'parameters':{'learning_rate':2}},
                        {'parameters':{'subsample':0}},{'parameters':{'colsample_bytree':2}},
                        {'parameters':{'random_state':-1}},{'test_size':.9},{'model_type':'clustering'},
                        {'parameters':{'n_jobs':99}}]:
            code,body=await self.http('POST','/xgboost/train',{**original,**changes})
            self.assertEqual(code,422,(changes,body))
        code,body=await self.http('POST','/xgboost/predict',{'model_id':'missing-model-identifier','values':{}})
        self.assertEqual(code,404)
        self.assertIn('expirado',body['detail'])

    async def test_limits_and_release(self):
        too_many=('a,b\n'+'1,2\n'*(LIMITS.max_rows+1)).encode()
        code,_=await self.http('POST','/datasets/upload',raw=too_many,query=b'filename=a.csv')
        self.assertEqual(code,422)
        columns=','.join(f'c{i}' for i in range(LIMITS.max_columns+1))+'\n'+','.join('1' for _ in range(LIMITS.max_columns+1))
        code,_=await self.http('POST','/datasets/upload',raw=columns.encode(),query=b'filename=a.csv')
        self.assertEqual(code,422)
        code,_=await self.http('POST','/datasets/upload',raw=b'x'*(LIMITS.max_upload_mb*1024*1024+1),query=b'filename=a.csv')
        self.assertEqual(code,413)
        code,_=await self.http('POST','/xgboost/train',raw=b'x'*(LIMITS.max_json_bytes+1))
        self.assertEqual(code,413)
        data=await self.demo()
        code,_=await self.http('POST','/release',{'dataset_id':data['dataset_id']})
        self.assertEqual(code,200)
        code,_=await self.http('POST','/xgboost/train',self.config(data))
        self.assertEqual(code,404)

    async def test_prediction_validation(self):
        data=await self.demo()
        _,trained=await self.http('POST','/xgboost/train',self.config(data))
        valid={f['name']:f['default'] for f in trained['prediction_fields']}
        for values in [{},{**valid,'extra':1},{**valid,next(iter(valid)):'abc'},{**valid,next(iter(valid)):'Infinity'}]:
            code,body=await self.http('POST','/xgboost/predict',{'model_id':trained['model_id'],'values':values})
            self.assertEqual(code,422,body)

    async def test_training_rate_limit(self):
        for _ in range(20):
            self.assertEqual((await self.http('POST','/xgboost/train'))[0], 422)
        status, _ = await self.http('POST','/xgboost/train')
        self.assertEqual(status, 429)
        self.assertGreater(int(self.response_headers[b'retry-after']), 0)

    async def test_capacity_expiry_busy_and_deadline(self):
        cache=MemoryStore(replace(LIMITS,max_entries=1,ttl_seconds=1))
        key=cache.put('x')
        with self.assertRaises(LabError): cache.put('y')
        with patch('services.ml.store.time.monotonic',return_value=time.monotonic()+2):
            with self.assertRaises(LabError): cache.get(key)
        data=await self.demo()
        ml.service.training.acquire()
        try:
            code,_=await self.http('POST','/xgboost/train',self.config(data))
            self.assertEqual(code,429)
        finally: ml.service.training.release()
        from services.ml.algorithms import Deadline
        with self.assertRaises(LabError): Deadline(time.monotonic()-1).after_iteration(None,0,{})

    async def test_target_quality_and_minimum_rows(self):
        cases=[('x,target\n'+'1,a\n'*12,'classification'),
               ('x,target\n'+''.join(f'{i},{"a" if i<11 else "b"}\n' for i in range(12)),'classification'),
               ('x,target\n'+'1,a\n2,\n'*6,'classification'),
               ('x,target\n'+'1,a\n2,b\n'*6,'regression'),
               ('x,target\n1,a\n2,b','classification')]
        for raw,task in cases:
            code,data=await self.http('POST','/datasets/upload',raw=raw.encode(),query=b'filename=a.csv')
            self.assertEqual(code,200,data)
            code,error=await self.http('POST','/xgboost/train',self.config(data,task))
            self.assertEqual(code,422,error)

    async def test_undefined_metrics_and_category_limit(self):
        from services.ml.metrics import evaluate
        metrics, _ = evaluate('classification', np.array([0,0]), np.array([0,0]),
                              np.array([[1.,0.],[1.,0.]]), ['a','b'], LIMITS.plot_rows)
        self.assertIsNone(metrics['roc_auc'])
        self.assertEqual(metrics['f1'], .5)  # Macro inclui a classe sem exemplos no teste.
        metrics, _ = evaluate('regression', np.array([1.,1.]), np.array([1.,1.]), None, None, LIMITS.plot_rows)
        self.assertIsNone(metrics['r2'])
        data=await self.demo()
        ml.service.limits=replace(LIMITS, max_categories=1)
        dataset=ml.service.datasets.get(data['dataset_id'])
        dataset['frame']['text']=np.where(np.arange(data['rows'])%2, 'a', 'b')
        config=self.config(data);config['features']=['text']
        code,error=await self.http('POST','/xgboost/train',config)
        self.assertEqual(code,422,error)
        self.assertIn('categorias',error['detail'])

    async def test_repeatability(self):
        data=await self.demo()
        _,one=await self.http('POST','/xgboost/train',self.config(data))
        _,two=await self.http('POST','/xgboost/train',self.config(data))
        self.assertEqual(one['metrics'],two['metrics'])
        self.assertEqual(one['feature_importance'],two['feature_importance'])


if __name__=='__main__': unittest.main()
