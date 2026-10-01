"""Features vetorizadas e baseline explícito, sempre na perspectiva das brancas."""
from __future__ import annotations
from dataclasses import dataclass, field
import numpy as np
from numpy.typing import NDArray
from .state import BoardState, inside, legal_steps

FEATURES = ("men", "kings", "advance", "center", "edges", "protected", "threatened", "mobility", "promotion_near", "to_move")
FEATURE_VERSION = 1
# Escalas fixas conhecidas a priori: nenhuma estatística do conjunto de teste.
SCALES = np.array([12, 12, 84, 12, 12, 12, 12, 48, 12, 1], dtype=float)
DEFAULT_WEIGHTS = (1200., 2100., 336., 72., 24., 60., -288., 144., 144., 5.)
TERMINAL_VALUE = 100000.


def features(state: BoardState) -> NDArray[np.float64]:
    board = state.matrix
    rows, cols = np.indices((8, 8))
    center = (rows >= 2) & (rows <= 5) & (cols >= 2) & (cols <= 5)
    edges = (cols == 0) | (cols == 7)
    sides = []
    for side in (1, -1):
        own, men, kings = board * side > 0, board == side, board == 2 * side
        advance = 7 - rows if side == 1 else rows
        protected = 0
        for r, c in np.argwhere(own):
            back = int(r) + side
            protected += any(inside(back, int(c) + dc) and board[back, int(c) + dc] * side > 0 for dc in (-1, 1))
        threats = {step.captured for step in legal_steps(board, -side) if step.captured is not None}
        sides.append(np.array([men.sum(), kings.sum(), advance[men].sum(), (own & center).sum(),
                               (own & edges).sum(), protected, len(threats), len(legal_steps(board, side)),
                               (men & (advance == 6)).sum(), 0.], dtype=float))
    vector = sides[0] - sides[1]
    vector[-1] = state.to_move
    return vector / SCALES

@dataclass
class EvaluationFunction:
    """S(s, p) = p · wᵀφ(s); valores terminais têm prioridade sobre heurísticas."""
    weights: NDArray[np.float64] = field(default_factory=lambda: np.array(DEFAULT_WEIGHTS))

    def __post_init__(self) -> None:
        self.weights = np.asarray(self.weights, dtype=float).copy()
        if self.weights.shape != (len(FEATURES),) or not np.isfinite(self.weights).all():
            raise ValueError("Pesos inválidos.")

    def __call__(self, state: BoardState, perspective: int) -> float:
        winner = state.winner
        if winner is not None:
            return TERMINAL_VALUE if winner == perspective else -TERMINAL_VALUE
        return float(perspective * (features(state) @ self.weights))
