"""Cap the declared WASM linear memory; no code sections are changed.
Usage: python3 scripts/limit-python-wasm.py original.wasm output.wasm
MicroPython 1.27.0 pyscript has one unshared memory, minimum 259 pages.
"""
import sys
from pathlib import Path

def read_leb(data, pos):
    value = shift = 0
    while True:
        byte = data[pos]
        pos += 1
        value |= (byte & 127) << shift
        if not byte & 128:
            return value, pos
        shift += 7
        if shift > 35:
            raise ValueError('Invalid LEB128')

def leb(value):
    output = bytearray()
    while value >= 128:
        output.append((value & 127) | 128)
        value >>= 7
    output.append(value)
    return bytes(output)

def limit_memory(data, pages=512):
    if data[:8] != b'\0asm\x01\0\0\0':
        raise ValueError('Expected WASM v1')
    result = bytearray(data[:8])
    pos, found = 8, False
    while pos < len(data):
        section = data[pos]
        size, start = read_leb(data, pos + 1)
        payload = data[start:start + size]
        if section == 5:
            count, cursor = read_leb(payload, 0)
            flags, cursor = read_leb(payload, cursor)
            minimum, cursor = read_leb(payload, cursor)
            maximum, cursor = read_leb(payload, cursor)
            if count != 1 or flags != 1 or cursor != len(payload) or not minimum <= pages <= maximum:
                raise ValueError('Unexpected memory declaration')
            payload = leb(count) + leb(flags) + leb(minimum) + leb(pages)
            found = True
        result.extend(bytes([section]) + leb(len(payload)) + payload)
        pos = start + size
    if not found:
        raise ValueError('No memory section')
    return bytes(result)

if __name__ == '__main__':
    Path(sys.argv[2]).write_bytes(limit_memory(Path(sys.argv[1]).read_bytes()))
