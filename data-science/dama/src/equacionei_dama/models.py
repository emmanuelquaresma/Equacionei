"""Modelos lineares transparentes, serializados em JSON com contrato de features."""
from __future__ import annotations
from dataclasses import dataclass, field
import json
from pathlib import Path
from typing import Any
import numpy as np
from numpy.typing import NDArray
from .evaluation import FEATURES, FEATURE_VERSION, SCALES, TERMINAL_VALUE, features
from .state import BoardState, RULESET


def sigmoid(value: Any) -> Any:
    return 1. / (1. + np.exp(-np.clip(value, -30., 30.)))

@dataclass
class LinearValueModel:
    kind: str = "supervised"
    weights: NDArray[np.float64] = field(default_factory=lambda: np.zeros(len(FEATURES)))
    bias: float = 0.
    metadata: dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        self.weights = np.asarray(self.weights, dtype=float).copy()
        if self.kind not in ("supervised", "td") or self.weights.shape != (len(FEATURES),):
            raise ValueError("Tipo de modelo ou dimensão incompatível.")
        if not np.isfinite(self.weights).all() or not np.isfinite(self.bias):
            raise ValueError("Parâmetros devem ser finitos.")

    def predict(self, x: NDArray[np.float64]) -> Any:
        return sigmoid(x @ self.weights + self.bias)

    def score(self, state: BoardState, perspective: int) -> float:
        """Logit para busca; saídas não terminais jamais sobrepõem uma vitória."""
        if state.winner is not None:
            return TERMINAL_VALUE if state.winner == perspective else -TERMINAL_VALUE
        return float(perspective * np.clip(features(state) @ self.weights + self.bias, -1000., 1000.))

    def fit(self, x: NDArray[np.float64], y: NDArray[np.float64], epochs: int = 400,
            rate: float = .1, l2: float = .001) -> None:
        if self.kind != "supervised" or x.ndim != 2 or x.shape != (len(y), len(FEATURES)) or len(y) < 2:
            raise ValueError("Dataset vazio, formato inválido ou modelo incorreto.")
        if not np.isfinite(x).all() or set(np.unique(y)) != {0., 1.}:
            raise ValueError("Treino supervisionado precisa de features finitas e das duas classes.")
        if epochs < 1 or rate <= 0 or l2 < 0:
            raise ValueError("Hiperparâmetros inválidos.")
        for _ in range(epochs):
            error = self.predict(x) - y
            self.weights -= rate * (x.T @ error / len(y) + l2 * self.weights)
            self.bias -= rate * float(error.mean())

    def update_td(self, x: NDArray[np.float64], target: float, rate: float) -> None:
        if self.kind != "td" or not 0 <= target <= 1 or rate <= 0:
            raise ValueError("Atualização TD inválida.")
        value = float(self.predict(x))  # Recalculado com os pesos atuais, nunca cache obsoleto.
        delta = rate * (target - value) * value * (1 - value)
        self.weights += delta * x
        self.bias += delta

    def save(self, path: Path) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        data = {"schema": 1, "ruleset": RULESET, "features": list(FEATURES), "feature_version": FEATURE_VERSION,
                "scales": SCALES.tolist(), "kind": self.kind, "weights": self.weights.tolist(), "bias": self.bias,
                "metadata": self.metadata}
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2, allow_nan=False), encoding="utf-8")

    @classmethod
    def load(cls, path: Path, expected_kind: str) -> LinearValueModel:
        data = json.loads(path.read_text(encoding="utf-8"))
        if (data.get("schema") != 1 or data.get("ruleset") != RULESET or data.get("features") != list(FEATURES)
                or data.get("feature_version") != FEATURE_VERSION or data.get("scales") != SCALES.tolist()
                or data.get("kind") != expected_kind):
            raise ValueError("Modelo incompatível com regras, features ou agente.")
        return cls(data["kind"], np.asarray(data["weights"]), float(data["bias"]), data.get("metadata", {}))
