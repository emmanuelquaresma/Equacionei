from typing import Literal
from pydantic import BaseModel, ConfigDict, Field
from config.ml import LIMITS


class StrictModel(BaseModel):
    model_config = ConfigDict(extra='forbid', allow_inf_nan=False)


class Parameters(StrictModel):
    n_estimators: int = Field(default=min(100, LIMITS.max_estimators), ge=1, le=LIMITS.max_estimators, strict=True)
    max_depth: int = Field(default=min(6, LIMITS.max_depth), ge=1, le=LIMITS.max_depth, strict=True)
    learning_rate: float = Field(default=.1, ge=.01, le=1)
    subsample: float = Field(default=1., ge=.1, le=1)
    colsample_bytree: float = Field(default=1., ge=.1, le=1)
    random_state: int = Field(default=42, ge=0, le=2147483647, strict=True)


class TrainRequest(StrictModel):
    dataset_id: str = Field(min_length=20, max_length=100)
    target: str = Field(min_length=1, max_length=LIMITS.max_column_chars)
    features: list[str] = Field(min_length=1, max_length=LIMITS.max_columns)
    model_type: Literal['classification', 'regression']
    test_size: float = Field(default=.2, ge=.1, le=.4)
    parameters: Parameters = Field(default_factory=Parameters)


class PredictRequest(StrictModel):
    model_id: str = Field(min_length=20, max_length=100)
    values: dict[str, float | str | None]


class ReleaseRequest(StrictModel):
    dataset_id: str | None = Field(default=None, min_length=20, max_length=100)
    model_id: str | None = Field(default=None, min_length=20, max_length=100)
