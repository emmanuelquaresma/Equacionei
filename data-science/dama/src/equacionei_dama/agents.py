"""Agentes intercambiáveis: todos consultam o mesmo BoardState."""
from __future__ import annotations
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
import math
import time
from typing import Callable, Optional
import numpy as np
from .evaluation import EvaluationFunction, TERMINAL_VALUE
from .models import LinearValueModel
from .state import Action, BoardState

@dataclass(frozen=True)
class Decision:
    action: Optional[Action]
    depth: int = 0
    simulations: int = 0
    nodes: int = 0
    elapsed_ms: float = 0.

class BotAgent(ABC):
    def __init__(self, seed: int = 0) -> None:
        self.rng = np.random.default_rng(seed)

    def pick(self, options: list) -> object:
        return options[int(self.rng.integers(len(options)))]

    @abstractmethod
    def choose(self, state: BoardState) -> Decision:
        """Retorna None em posição terminal; nunca uma captura parcial."""
        raise NotImplementedError

class RandomAgent(BotAgent):
    """Baseline para medir se aprender de fato trouxe benefício."""
    def choose(self, state: BoardState) -> Decision:
        actions = state.legal_actions()
        return Decision(self.pick(list(actions)) if actions else None)

class SupervisedAgent(BotAgent):
    """Um turno à frente. Empates numéricos são desempatados com RNG local."""
    def __init__(self, model: LinearValueModel, seed: int = 0) -> None:
        super().__init__(seed)
        if model.kind != "supervised":
            raise ValueError("Agente requer modelo supervisionado.")
        self.model = model

    def choose(self, state: BoardState) -> Decision:
        start = time.perf_counter()
        actions = state.legal_actions()
        if not actions:
            return Decision(None)
        scores = [self.model.score(state.transition(a), state.to_move) for a in actions]
        best = max(scores)
        action = self.pick([a for a, score in zip(actions, scores) if abs(score - best) < 1e-9])
        return Decision(action, depth=1, nodes=len(actions), elapsed_ms=1000*(time.perf_counter()-start))

class BudgetExpired(Exception):
    pass

class MinimaxAgent(BotAgent):
    """Alpha-beta com aprofundamento iterativo e limite de tempo cooperativo."""
    def __init__(self, evaluation: Callable[[BoardState, int], float], depth: int = 6,
                 time_ms: float = 450., seed: int = 0) -> None:
        super().__init__(seed)
        if depth < 1 or time_ms <= 0:
            raise ValueError("Profundidade e orçamento devem ser positivos.")
        self.evaluation, self.depth, self.time_ms = evaluation, depth, time_ms

    def choose(self, state: BoardState) -> Decision:
        start = time.perf_counter()
        deadline = start + self.time_ms / 1000
        nodes, reached = 0, 0
        def check() -> None:
            if time.perf_counter() >= deadline:
                raise BudgetExpired
        actions = state.legal_actions()
        if not actions:
            return Decision(None)
        actions = tuple(sorted(actions, key=lambda a: (a.captures, abs(state.transition(a).matrix[a.steps[-1].destination]) == 2), reverse=True))
        selected = actions[0]
        def search(current: BoardState, depth: int, alpha: float, beta: float) -> float:
            nonlocal nodes
            check(); nodes += 1
            if current.winner is not None or depth == 0:
                return self.evaluation(current, state.to_move)
            children = sorted(current.legal_actions(check), key=lambda a: a.captures, reverse=True)
            maximize = current.to_move == state.to_move
            best = -math.inf if maximize else math.inf
            for action in children:
                score = search(current.transition(action), depth-1, alpha, beta)
                best = max(best, score) if maximize else min(best, score)
                if maximize:
                    alpha = max(alpha, best)
                else:
                    beta = min(beta, best)
                if alpha >= beta:
                    break
            return best
        try:
            for depth in range(1, self.depth + 1):
                scores = [search(state.transition(a), depth-1, -math.inf, math.inf) for a in actions]
                best = max(scores)
                selected = self.pick([a for a, s in zip(actions, scores) if abs(s-best) < 1e-9])
                reached = depth
        except BudgetExpired:
            pass
        return Decision(selected, depth=reached, nodes=nodes, elapsed_ms=1000*(time.perf_counter()-start))

@dataclass
class _Node:
    state: BoardState
    action: Optional[Action] = None
    children: list[_Node] = field(default_factory=list)
    pending: list[Action] = field(default_factory=list)
    visits: int = 0
    total: float = 0.  # Retorno sempre na perspectiva da raiz.

class MCTSAgent(BotAgent):
    """UCT adversarial; cutoff de rollout usa valor heurístico, não vitória fictícia."""
    def __init__(self, iterations: int = 500, time_ms: float = 450., rollout_limit: int = 40,
                 exploration: float = math.sqrt(2), seed: int = 0) -> None:
        super().__init__(seed)
        if iterations < 1 or time_ms <= 0 or rollout_limit < 1 or exploration < 0:
            raise ValueError("Orçamentos e parâmetros de MCTS inválidos.")
        self.iterations, self.time_ms, self.rollout_limit = iterations, time_ms, rollout_limit
        self.exploration = exploration
        self.evaluation = EvaluationFunction()

    def choose(self, state: BoardState) -> Decision:
        start = time.perf_counter(); deadline = start + self.time_ms / 1000
        actions = state.legal_actions()
        if not actions:
            return Decision(None)
        root = _Node(state, pending=list(actions))
        self.rng.shuffle(root.pending)
        completed = 0
        def check() -> None:
            if time.perf_counter() >= deadline:
                raise BudgetExpired
        def ucb(parent: _Node, child: _Node) -> float:
            if not child.visits:
                return math.inf
            sign = 1 if parent.state.to_move == state.to_move else -1
            return sign * child.total / child.visits + self.exploration * math.sqrt(math.log(max(1, parent.visits)) / child.visits)
        try:
            for _ in range(self.iterations):
                check()
                node, path = root, [root]
                while not node.pending and node.children:
                    check()
                    node = max(node.children, key=lambda child: ucb(node, child))
                    path.append(node)
                if node.pending:
                    action = node.pending.pop()
                    following = node.state.transition(action)
                    child = _Node(following, action, pending=list(following.legal_actions(check)))
                    self.rng.shuffle(child.pending)
                    node.children.append(child); node = child; path.append(node)
                rollout = node.state
                for _ in range(self.rollout_limit):
                    check()
                    if rollout.winner is not None:
                        break
                    rollout = rollout.transition(self.pick(list(rollout.legal_actions(check))))
                if rollout.winner is not None:
                    reward = 1. if rollout.winner == state.to_move else -1.
                else:
                    reward = math.tanh(self.evaluation(rollout, state.to_move) / 400.)
                for ancestor in path:
                    ancestor.visits += 1
                    ancestor.total += reward
                completed += 1
        except BudgetExpired:
            pass
        visited = [child for child in root.children if child.visits]
        if visited:
            most = max(child.visits for child in visited)
            selected = self.pick([child for child in visited if child.visits == most]).action
        else:
            selected = actions[0]
        return Decision(selected, simulations=completed, elapsed_ms=1000*(time.perf_counter()-start))

class TDMinimaxAgent(MinimaxAgent):
    def __init__(self, model: LinearValueModel, **kwargs: object) -> None:
        if model.kind != "td":
            raise ValueError("Agente requer modelo TD.")
        super().__init__(model.score, **kwargs)
