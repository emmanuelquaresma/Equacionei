"""Minimal CDP driver for browser smoke tests, using an isolated Chrome profile."""
import base64
import json
import os
import shutil
import socket
import struct
import subprocess
import tempfile
import time
import urllib.request
from pathlib import Path
from urllib.parse import urlsplit


class Chrome:
    def __init__(self):
        self.profile = tempfile.TemporaryDirectory(prefix='equacionei-test-', ignore_cleanup_errors=True)
        binary = shutil.which('google-chrome') or shutil.which('chromium')
        if not binary:
            raise RuntimeError('Install Google Chrome or Chromium to run browser tests.')
        self.p = subprocess.Popen([
            binary, '--headless=new', '--no-sandbox', '--disable-dev-shm-usage',
            '--remote-debugging-port=0', '--user-data-dir=' + self.profile.name,
            'about:blank'
        ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        try:
            active = Path(self.profile.name) / 'DevToolsActivePort'
            for _ in range(100):
                if active.exists():
                    break
                if self.p.poll() is not None:
                    raise RuntimeError('Chrome exited before starting its test endpoint.')
                time.sleep(.1)
            port = int(active.read_text().splitlines()[0])
            with urllib.request.urlopen(f'http://127.0.0.1:{port}/json', timeout=5) as response:
                tabs = json.load(response)
            url = urlsplit(next(t for t in tabs if t['type'] == 'page')['webSocketDebuggerUrl'])
            self.s = socket.create_connection((url.hostname, url.port), timeout=60)
            key = base64.b64encode(os.urandom(16)).decode()
            self.s.sendall((f'GET {url.path} HTTP/1.1\r\nHost: {url.netloc}\r\n'
                           f'Upgrade: websocket\r\nConnection: Upgrade\r\n'
                           f'Sec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n').encode())
            response = b''
            while not response.endswith(b'\r\n\r\n'):
                response += self.read(1)
            if b' 101 ' not in response.split(b'\r\n')[0]:
                raise RuntimeError('CDP WebSocket handshake failed')
            self.i = 0
            self.events = []
            self.call('Page.enable')
            self.call('Runtime.enable')
            self.call('Log.enable')
        except Exception:
            self.close()
            raise

    def read(self, count):
        result = b''
        while len(result) < count:
            chunk = self.s.recv(count - len(result))
            if not chunk:
                raise RuntimeError('Chrome closed the test connection')
            result += chunk
        return result

    def call(self, method, params=None):
        self.i += 1
        data = json.dumps(dict(id=self.i, method=method, params=params or {})).encode()
        size = len(data)
        header = bytes([129, 128 | size]) if size < 126 else (
            bytes([129, 254]) + struct.pack('!H', size) if size < 65536
            else bytes([129, 255]) + struct.pack('!Q', size))
        mask = os.urandom(4)
        self.s.sendall(header + mask + bytes(v ^ mask[i % 4] for i, v in enumerate(data)))
        while True:
            opcode, length = self.read(2)
            size = length & 127
            if size == 126:
                size = struct.unpack('!H', self.read(2))[0]
            if size == 127:
                size = struct.unpack('!Q', self.read(8))[0]
            payload = self.read(size)
            if opcode & 15 == 8:
                raise RuntimeError('CDP WebSocket closed')
            result = json.loads(payload)
            if result.get('id') == self.i:
                if 'error' in result:
                    raise RuntimeError(result['error'])
                return result
            self.events.append(result)

    def js(self, source):
        return self.call('Runtime.evaluate', {
            'expression': source, 'awaitPromise': True, 'returnByValue': True
        })

    def close(self):
        if hasattr(self, 's'):
            self.s.close()
        self.p.terminate()
        try:
            self.p.wait(timeout=5)
        except subprocess.TimeoutExpired:
            self.p.kill()
            self.p.wait()
        self.profile.cleanup()
