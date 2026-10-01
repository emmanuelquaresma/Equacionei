import numpy as np
from sklearn.metrics import (accuracy_score, precision_recall_fscore_support, roc_auc_score,
                             confusion_matrix, mean_absolute_error, mean_squared_error, r2_score)


def evaluate(model_type, y, predicted, probabilities, classes, plot_rows):
    if model_type == 'classification':
        precision, recall, f1, _ = precision_recall_fscore_support(y, predicted, labels=np.arange(len(classes)), average='macro', zero_division=0)
        metrics = {'accuracy': float(accuracy_score(y, predicted)), 'precision': float(precision),
                   'recall': float(recall), 'f1': float(f1), 'roc_auc': None}
        if len(np.unique(y)) == len(classes):
            metrics['roc_auc'] = float(roc_auc_score(y, probabilities[:, 1]) if len(classes) == 2 else
                                       roc_auc_score(y, probabilities, multi_class='ovr', average='macro'))
        return metrics, {'labels': list(classes), 'matrix': confusion_matrix(y, predicted, labels=np.arange(len(classes))).tolist()}
    mse = float(mean_squared_error(y, predicted))
    metrics = {'mae': float(mean_absolute_error(y, predicted)), 'mse': mse, 'rmse': float(np.sqrt(mse)),
               'r2': float(r2_score(y, predicted, force_finite=False)) if np.var(y) > 0 else None}
    metrics = {key: value if value is None or np.isfinite(value) else None for key, value in metrics.items()}
    indices = np.linspace(0, len(y)-1, min(len(y), plot_rows), dtype=int)
    return metrics, {'actual': np.asarray(y)[indices].tolist(), 'predicted': np.asarray(predicted)[indices].tolist(),
                     'shown': len(indices), 'total': len(y)}
