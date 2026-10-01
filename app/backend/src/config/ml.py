"""Limites do laboratório; sobrescrevíveis por variáveis de ambiente ML_*."""
import os
from dataclasses import dataclass


def setting(name, default):
    value = int(os.getenv('ML_' + name, default))
    if value < 1:
        raise ValueError(f'ML_{name} deve ser positivo')
    return value


@dataclass(frozen=True)
class Limits:
    max_upload_mb: int = setting('MAX_UPLOAD_MB', 2)
    max_rows: int = setting('MAX_ROWS', 5000)
    max_columns: int = setting('MAX_COLUMNS', 40)
    max_categories: int = setting('MAX_CATEGORIES', 32)
    max_classes: int = setting('MAX_CLASSES', 20)
    max_estimators: int = setting('MAX_ESTIMATORS', 200)
    max_depth: int = setting('MAX_DEPTH', 8)
    max_entries: int = setting('MAX_ENTRIES', 12)
    ttl_seconds: int = setting('TTL_SECONDS', 1800)
    train_seconds: int = setting('TRAIN_SECONDS', 30)
    concurrent_training: int = setting('CONCURRENT_TRAINING', 1)
    preview_rows: int = 10
    plot_rows: int = 250
    max_cell_chars: int = 200
    max_column_chars: int = 80
    min_rows: int = 10
    max_json_bytes: int = 32768


LIMITS = Limits()
