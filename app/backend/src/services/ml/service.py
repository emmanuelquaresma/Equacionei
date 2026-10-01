import math
import threading
import time
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder
from config.ml import LIMITS
from .algorithms import ALGORITHMS
from .datasets import load_csv, load_demo, describe
from .errors import LabError
from .metrics import evaluate
from .preprocessing import make_preprocessor, normalized, inputs_description, importance
from .store import MemoryStore


class LabService:
    def __init__(self, limits=LIMITS):
        self.limits = limits
        self.datasets, self.models = MemoryStore(limits), MemoryStore(limits)
        self.training = threading.BoundedSemaphore(limits.concurrent_training)

    def dataset(self, *, demo=None, raw=None, filename=''):
        data = load_demo(demo, self.limits) if demo else load_csv(raw, filename, self.limits)
        key = self.datasets.put(data)
        return describe(data, key, self.limits)

    def train(self, request, algorithm='xgboost'):
        if not self.training.acquire(blocking=False):
            raise LabError('Já há um treinamento em andamento. Aguarde um instante e tente novamente.', 429)
        try:
            return self._train(request, algorithm)
        finally:
            self.training.release()

    def _train(self, request, algorithm):
        started = time.monotonic()
        data = self.datasets.get(request.dataset_id)
        frame = data['frame']
        if request.target not in frame:
            raise LabError('O target escolhido não existe no dataset.')
        if request.target in request.features:
            raise LabError('O target não pode ser usado como feature. Remova-o das variáveis de entrada.')
        if len(set(request.features)) != len(request.features) or any(c not in frame for c in request.features):
            raise LabError('Selecione features existentes e sem repetição.')
        if len(frame) < self.limits.min_rows:
            raise LabError(f'Use pelo menos {self.limits.min_rows} registros para separar treino e teste.')
        if frame[request.target].isna().any():
            raise LabError('O target contém valores ausentes. Preencha ou remova essas linhas antes do upload.')
        y = frame[request.target]
        classification = request.model_type == 'classification'
        encoder = None
        if classification:
            if not 2 <= y.nunique() <= self.limits.max_classes:
                raise LabError(f'Classificação precisa de 2 a {self.limits.max_classes} classes. Para valores contínuos, escolha regressão.')
            counts = y.value_counts()
            test_rows = math.ceil(len(frame) * request.test_size)
            if counts.min() < 2 or min(test_rows, len(frame)-test_rows) < len(counts):
                raise LabError('Há poucos exemplos por classe para esse split. Inclua mais dados ou ajuste a divisão treino/teste.')
            encoder = LabelEncoder()
            y = encoder.fit_transform(y.astype(str))
        else:
            try:
                y = pd.to_numeric(y, errors='raise').to_numpy(dtype=float)
            except (ValueError, TypeError) as exc:
                raise LabError('Regressão precisa de um target numérico. Escolha outra coluna ou classificação.') from exc
            if not np.isfinite(y).all():
                raise LabError('O target deve conter apenas números finitos.')
        train, test, y_train, y_test = train_test_split(frame[request.features], y, test_size=request.test_size,
                                                     random_state=request.parameters.random_state,
                                                     stratify=y if classification else None)
        prepare, numeric, categorical = make_preprocessor(train, self.limits)
        train, test = normalized(train, numeric), normalized(test, numeric)
        params = request.parameters.model_dump()
        pipeline = Pipeline([('prepare', prepare), ('model', ALGORITHMS[algorithm](request.model_type, params, started+self.limits.train_seconds))])
        pipeline.fit(train, y_train)
        predicted = pipeline.predict(test)
        probabilities = pipeline.predict_proba(test) if classification else None
        classes = encoder.classes_.tolist() if encoder else None
        metrics, chart = evaluate(request.model_type, y_test, predicted, probabilities, classes, self.limits.plot_rows)
        fields = inputs_description(train, numeric)
        missing = {c: int(frame[c].isna().sum()) for c in request.features if frame[c].isna().any()}
        response = {'algorithm': algorithm, 'model_type': request.model_type, 'dataset': data['name'],
                    'target': request.target, 'features': request.features, 'rows': len(frame), 'train_rows': len(train),
                    'test_rows': len(test), 'test_size': request.test_size, 'parameters': params, 'metrics': metrics,
                    'feature_importance': importance(pipeline, numeric, categorical), 'importance_method': 'total_gain',
                    'evaluation': chart, 'prediction_fields': fields, 'preparation': {'numeric': numeric, 'categorical': categorical, 'missing': missing},
                    'elapsed_seconds': round(time.monotonic()-started, 3), 'expires_in_seconds': self.limits.ttl_seconds}
        key = self.models.put({'pipeline': pipeline, 'encoder': encoder, 'features': request.features,
                               'numeric': numeric, 'model_type': request.model_type})
        return {'model_id': key, **response}

    def predict(self, request):
        model = self.models.get(request.model_id)
        if set(request.values) != set(model['features']):
            raise LabError('Informe exatamente as features usadas no treinamento.')
        values = {}
        for feature in model['features']:
            value = request.values[feature]
            if value is None or value == '':
                values[feature] = np.nan
            elif feature in model['numeric']:
                try:
                    number = float(value)
                    if not math.isfinite(number) or abs(number) > np.finfo(np.float32).max:
                        raise ValueError()
                    values[feature] = number
                except (ValueError, TypeError) as exc:
                    raise LabError(f'Informe um número finito em “{feature}”, ou deixe em branco para imputação.') from exc
            else:
                if len(str(value)) > self.limits.max_cell_chars:
                    raise LabError(f'O valor de “{feature}” excede o limite de texto.')
                values[feature] = str(value)
        frame = pd.DataFrame([values], columns=model['features'])
        frame = normalized(frame, model['numeric'])
        prediction = model['pipeline'].predict(frame)[0]
        if model['encoder'] is not None:
            classes = model['encoder'].classes_
            probabilities = model['pipeline'].predict_proba(frame)[0]
            return {'prediction': str(classes[int(prediction)]),
                    'probabilities': [{'class': str(c), 'probability': float(p)} for c,p in zip(classes, probabilities)]}
        return {'prediction': float(prediction)}
