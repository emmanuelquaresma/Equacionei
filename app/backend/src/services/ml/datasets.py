"""Carga limitada em memória, sem executar conteúdo ou usar nomes como caminhos."""
import csv
import io
import numpy as np
import pandas as pd
from sklearn import datasets
from .errors import LabError

DEMOS = {
    'iris': ('Iris', datasets.load_iris, 'classification'),
    'breast-cancer': ('Breast Cancer', datasets.load_breast_cancer, 'classification'),
    'wine': ('Wine', datasets.load_wine, 'classification'),
    'diabetes': ('Diabetes', datasets.load_diabetes, 'regression'),
}


def validate(frame, limits):
    if frame.empty:
        raise LabError('O dataset está vazio. Inclua um cabeçalho e linhas de dados.')
    if len(frame) > limits.max_rows or len(frame.columns) > limits.max_columns:
        raise LabError(f'O limite é {limits.max_rows} linhas e {limits.max_columns} colunas.')
    if len(frame.columns) < 2:
        raise LabError('O dataset precisa de pelo menos duas colunas: target e uma feature.')
    for col in frame:
        if not col.strip() or len(col) > limits.max_column_chars or any(ord(c) < 32 for c in col):
            raise LabError(f'Use nomes de colunas não vazios, sem controles e com até {limits.max_column_chars} caracteres.')
        if pd.api.types.is_numeric_dtype(frame[col]):
            values = frame[col].dropna().to_numpy(dtype=float)
            if not np.isfinite(values).all() or (np.abs(values) > np.finfo(np.float32).max).any():
                raise LabError(f'A coluna “{col}” contém números infinitos ou fora da faixa numérica do modelo. Corrija esses valores.')
        elif frame[col].dropna().astype(str).str.len().max() > limits.max_cell_chars:
            raise LabError(f'A coluna “{col}” contém textos muito longos para este laboratório.')
    return frame


def load_csv(raw, filename, limits):
    if not filename.lower().endswith('.csv'):
        raise LabError('Envie um arquivo CSV (.csv).')
    if len(raw) > limits.max_upload_mb * 1024 * 1024:
        raise LabError(f'O arquivo excede {limits.max_upload_mb} MB.', 413)
    try:
        text = raw.decode('utf-8-sig')
    except UnicodeDecodeError as exc:
        raise LabError('Não foi possível ler o texto. Salve o CSV em UTF-8.') from exc
    if not text.strip() or '\x00' in text:
        raise LabError('Arquivo vazio ou inválido. Envie um CSV de texto com cabeçalho.')
    try:
        # Somente delimitadores explicitamente suportados; aspas são interpretadas pelo parser CSV.
        dialect = csv.Sniffer().sniff(text[:8192], delimiters=',;\t')
        reader = csv.reader(io.StringIO(text), dialect, strict=True)
        header = [s.strip() for s in next(reader)]
        if len(header) > limits.max_columns or len(set(header)) != len(header) or not all(header):
            raise LabError('Verifique o limite de colunas e use nomes únicos e não vazios no cabeçalho.')
        count = 0
        for row in reader:
            if not row:
                continue
            count += 1
            if len(row) != len(header):
                raise LabError('Há linhas com quantidade diferente de colunas. Verifique separadores e aspas.')
            if count > limits.max_rows:
                raise LabError(f'O dataset excede {limits.max_rows} linhas.')
            if any(len(value) > limits.max_cell_chars for value in row):
                raise LabError('O CSV contém células de texto acima do limite permitido.')
        frame = pd.read_csv(io.StringIO(text), sep=dialect.delimiter, header=0, names=header,
                            nrows=limits.max_rows + 1, skip_blank_lines=True)
        # Espaços isolados também são tratados como ausentes.
        for col in frame.select_dtypes(include=['object']):
            frame[col] = frame[col].map(lambda v: v.strip() if isinstance(v, str) else v).replace('', np.nan)
    except (csv.Error, StopIteration, pd.errors.ParserError, pd.errors.EmptyDataError, ValueError) as exc:
        raise LabError('Não foi possível ler o CSV. Confira cabeçalho, separador e aspas.') from exc
    return {'name': 'CSV enviado', 'frame': validate(frame, limits), 'default_target': header[-1]}


def load_demo(name, limits):
    if name not in DEMOS:
        raise LabError('Escolha um dos datasets de demonstração disponíveis.')
    title, loader, task = DEMOS[name]
    data = loader(as_frame=True)
    frame = data.frame.copy()
    if task == 'classification':
        frame['target'] = frame['target'].map(lambda n: str(data.target_names[int(n)]))
    return {'name': title, 'frame': validate(frame, limits), 'default_target': 'target'}


def suggested(series):
    if not pd.api.types.is_numeric_dtype(series):
        return 'classification'
    values = series.dropna()
    return 'classification' if values.nunique() <= 10 and (values % 1 == 0).all() else 'regression'


def describe(dataset, key, limits):
    frame = dataset['frame']
    return {'dataset_id': key, 'name': dataset['name'], 'rows': len(frame), 'column_count': len(frame.columns),
            'default_target': dataset['default_target'], 'expires_in_seconds': limits.ttl_seconds,
            'columns': [{'name': col, 'type': 'numeric' if pd.api.types.is_numeric_dtype(frame[col]) else 'categorical',
                         'missing': int(frame[col].isna().sum()), 'unique': int(frame[col].nunique()),
                         'suggested_task': suggested(frame[col])} for col in frame],
            'preview': frame.head(limits.preview_rows).astype(object).where(frame.head(limits.preview_rows).notna(), None).to_dict('records')}
