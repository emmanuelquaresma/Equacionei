import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from .errors import LabError


def make_preprocessor(frame, limits):
    numeric = [c for c in frame if pd.api.types.is_numeric_dtype(frame[c])]
    categorical = [c for c in frame if c not in numeric]
    for c in categorical:
        if frame[c].nunique() > limits.max_categories:
            raise LabError(f'A feature “{c}” tem mais de {limits.max_categories} categorias no treino. Remova identificadores ou reduza as categorias.')
    transforms = []
    if numeric:
        transforms.append(('numeric', SimpleImputer(strategy='median', keep_empty_features=True), numeric))
    if categorical:
        transforms.append(('categorical', Pipeline([
            ('missing', SimpleImputer(strategy='constant', fill_value='__ausente__', keep_empty_features=True)),
            ('encode', OneHotEncoder(handle_unknown='ignore', sparse_output=False, dtype=np.float32)),
        ]), categorical))
    return ColumnTransformer(transforms, remainder='drop', verbose_feature_names_out=False), numeric, categorical


def normalized(frame, numeric):
    """Conversões determinísticas, sem estatísticas aprendidas fora do treino."""
    result = frame.copy()
    for col in result:
        if col in numeric:
            result[col] = pd.to_numeric(result[col], errors='raise').astype(float)
        else:
            result[col] = result[col].map(lambda v: str(v) if pd.notna(v) else np.nan)
    return result


def inputs_description(frame, numeric):
    fields = []
    for col in frame:
        values = frame[col].dropna()
        if col in numeric:
            default = float(values.median()) if len(values) else None
            fields.append({'name': col, 'type': 'numeric', 'default': default})
        else:
            fields.append({'name': col, 'type': 'categorical', 'default': str(values.mode().iloc[0]) if len(values) else None,
                           'categories': sorted(values.astype(str).unique().tolist())})
    return fields


def importance(pipeline, numeric, categorical):
    # total_gain permite somar as colunas one-hot de volta à variável original.
    names = list(numeric)
    if categorical:
        encoder = pipeline.named_steps['prepare'].named_transformers_['categorical'].named_steps['encode']
        for col, categories in zip(categorical, encoder.categories_):
            names.extend([col] * len(categories))
    gain = pipeline.named_steps['model'].get_booster().get_score(importance_type='total_gain')
    totals = dict.fromkeys(numeric + categorical, 0.)
    for index, name in enumerate(names):
        totals[name] += float(gain.get(f'f{index}', 0))
    total = sum(totals.values())
    return sorted([{'feature': name, 'importance': value / total if total else 0.} for name, value in totals.items()],
                  key=lambda row: row['importance'], reverse=True)
