"""Ponto de extensão: outros algoritmos reutilizam carga, split, métricas e previsão."""
import time
from xgboost import XGBClassifier, XGBRegressor
from xgboost.callback import TrainingCallback
from .errors import LabError


class Deadline(TrainingCallback):
    def __init__(self, deadline):
        self.deadline = deadline

    def after_iteration(self, model, epoch, evals_log):
        if time.monotonic() > self.deadline:
            raise LabError('O treino excedeu o tempo do laboratório. Reduza árvores, profundidade ou dados.', 408)
        return False


def make_xgboost(model_type, parameters, deadline):
    cls = XGBClassifier if model_type == 'classification' else XGBRegressor
    return cls(**parameters, tree_method='hist', device='cpu', n_jobs=1,
               callbacks=[Deadline(deadline)], verbosity=0)


ALGORITHMS = {'xgboost': make_xgboost}
