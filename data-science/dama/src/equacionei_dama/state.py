"""Motor sem interface: ações atômicas incluem TODOS os saltos de uma captura.

Convenção: 0 vazio, +1 branca, +2 dama branca, -1 preta, -2 dama preta.
Brancas sobem. Preserva a variante curta do Equacionei, não damas brasileiras.
"""
from __future__ import annotations
from dataclasses import dataclass
from typing import Callable, Optional

import numpy as np
from numpy.typing import NDArray

Position = tuple[int, int]
RULESET = "equacionei-short-v1"
DIAGONALS = ((-1, -1), (-1, 1), (1, -1), (1, 1))

@dataclass(frozen=True)
class Step:
    origin: Position
    destination: Position
    captured: Optional[Position] = None

@dataclass(frozen=True)
class Action:
    steps: tuple[Step, ...]

    @property
    def captures(self) -> int:
        return sum(step.captured is not None for step in self.steps)

    def notation(self) -> str:
        """Coordenadas de matriz, base zero; caminho completo sem ambiguidade."""
        if not self.steps:
            return ""
        separator = " x " if self.captures else " → "
        return separator.join(str(p) for p in (self.steps[0].origin, *(s.destination for s in self.steps)))


def inside(row: int, col: int) -> bool:
    return 0 <= row < 8 and 0 <= col < 8


def piece_steps(board: NDArray[np.int8], origin: Position, captures_only: bool = False) -> tuple[Step, ...]:
    row, col = origin
    piece = int(board[row, col])
    if not piece:
        return ()
    side = 1 if piece > 0 else -1
    directions = DIAGONALS if abs(piece) == 2 else ((-side, -1), (-side, 1))
    result = []
    for dr, dc in directions:
        nr, nc = row + dr, col + dc
        if not inside(nr, nc):
            continue
        neighbor = int(board[nr, nc])
        if not neighbor and not captures_only:
            result.append(Step(origin, (nr, nc)))
        elif neighbor * side < 0 and inside(nr + dr, nc + dc) and board[nr + dr, nc + dc] == 0:
            result.append(Step(origin, (nr + dr, nc + dc), (nr, nc)))
    return tuple(result)


def legal_steps(board: NDArray[np.int8], side: int, forced: Optional[Position] = None) -> tuple[Step, ...]:
    if forced is not None:
        return piece_steps(board, forced, True)
    moves = tuple(step for r, c in np.argwhere(board * side > 0) for step in piece_steps(board, (int(r), int(c))))
    captures = tuple(step for step in moves if step.captured is not None)
    return captures or moves


def _advance(board: NDArray[np.int8], step: Step) -> NDArray[np.int8]:
    """Transição interna de um passo já validado, incluindo promoção imediata."""
    result = board.copy()
    piece = int(result[step.origin])
    result[step.origin] = 0
    if step.captured is not None:
        result[step.captured] = 0
    if (piece == 1 and step.destination[0] == 0) or (piece == -1 and step.destination[0] == 7):
        piece *= 2
    result[step.destination] = piece
    return result

@dataclass(frozen=True, eq=False)
class BoardState:
    """Estado defensivamente copiado; array somente leitura e turno em {-1, +1}."""
    matrix: NDArray[np.int8]
    to_move: int = 1

    def __post_init__(self) -> None:
        raw = np.asarray(self.matrix)
        if raw.shape != (8, 8) or not np.isin(raw, (-2, -1, 0, 1, 2)).all():
            raise ValueError("O tabuleiro deve ser 8×8 com valores -2, -1, 0, 1, 2.")
        if type(self.to_move) is not int or self.to_move not in (-1, 1):
            raise ValueError("to_move deve ser -1 ou +1.")
        rows, cols = np.indices((8, 8))
        if np.any(raw[(rows + cols) % 2 == 0]):
            raise ValueError("Peças devem ocupar casas escuras.")
        board = raw.astype(np.int8, copy=True)
        board.setflags(write=False)
        object.__setattr__(self, "matrix", board)

    @classmethod
    def initial(cls) -> BoardState:
        board = np.zeros((8, 8), dtype=np.int8)
        rows, cols = np.indices((8, 8))
        dark = (rows + cols) % 2 == 1
        board[dark & (rows < 3)] = -1
        board[dark & (rows > 4)] = 1
        return cls(board)

    @property
    def winner(self) -> Optional[int]:
        """Sem peças ou movimentos: derrota. Não inventa empate por truncamento."""
        return None if legal_steps(self.matrix, self.to_move) else -self.to_move

    def legal_actions(self, check: Optional[Callable[[], None]] = None) -> tuple[Action, ...]:
        actions: list[Action] = []
        def expand(board: NDArray[np.int8], prefix: tuple[Step, ...], forced: Optional[Position]) -> None:
            if check is not None:
                check()
            for step in legal_steps(board, self.to_move, forced):
                if check is not None:
                    check()
                after = _advance(board, step)
                path = prefix + (step,)
                if step.captured is not None and piece_steps(after, step.destination, True):
                    expand(after, path, step.destination)
                else:
                    actions.append(Action(path))
        expand(self.matrix, (), None)
        return tuple(actions)

    def transition(self, action: Action) -> BoardState:
        """Valida cada passo e rejeita turnos parciais ou movimento extra."""
        if not isinstance(action, Action) or not action.steps:
            raise ValueError("Ação vazia ou inválida.")
        board, forced = self.matrix, None
        for index, step in enumerate(action.steps):
            if step not in legal_steps(board, self.to_move, forced):
                raise ValueError("Movimento ilegal.")
            board = _advance(board, step)
            forced = step.destination if step.captured is not None and piece_steps(board, step.destination, True) else None
            if index < len(action.steps) - 1 and forced is None:
                raise ValueError("O turno já terminou.")
        if forced is not None:
            raise ValueError("Complete a captura com a mesma peça.")
        return BoardState(board, -self.to_move)
