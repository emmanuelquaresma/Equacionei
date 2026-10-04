"""Rate limits simples por processo/IP; não substituem um limitador distribuído."""
from collections import deque
import threading
import time


class SlidingWindowLimiter:
    def __init__(self):
        self._events = {}
        self._windows = {}
        self._lock = threading.Lock()

    def check(self, key: str, limit: int, window: int, now=None) -> int | None:
        current = time.monotonic() if now is None else now
        with self._lock:
            stale = [item for item, queue in self._events.items()
                     if not queue or queue[-1] <= current - self._windows[item]]
            for item in stale:
                self._events.pop(item, None)
                self._windows.pop(item, None)
            events = self._events.setdefault(key, deque())
            self._windows[key] = window
            while events and events[0] <= current - window:
                events.popleft()
            if len(events) >= limit:
                return max(1, int(events[0] + window - current + .999))
            events.append(current)
            return None


limiter = SlidingWindowLimiter()
