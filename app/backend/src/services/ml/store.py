"""Cache efêmero e limitado. IDs são capacidades aleatórias, não caminhos de arquivos."""
import secrets
import threading
import time
from .errors import LabError


class MemoryStore:
    def __init__(self, limits):
        self.limits = limits
        self.entries = {}
        self.lock = threading.Lock()

    def _prune(self):
        now = time.monotonic()
        for key in list(self.entries):
            if self.entries[key][0] <= now:
                del self.entries[key]

    def put(self, value):
        with self.lock:
            self._prune()
            if len(self.entries) >= self.limits.max_entries:
                raise LabError('Laboratório com capacidade temporariamente ocupada. Libere o experimento atual ou tente mais tarde.', 503)
            key = secrets.token_urlsafe(32)
            self.entries[key] = (time.monotonic() + self.limits.ttl_seconds, value)
            return key

    def get(self, key):
        with self.lock:
            self._prune()
            if key not in self.entries:
                raise LabError('Dataset ou modelo não encontrado ou expirado. Carregue os dados e treine novamente.', 404)
            return self.entries[key][1]

    def delete(self, key):
        with self.lock:
            self.entries.pop(key, None)
            self._prune()
