# MicroPython local — 1.27.0

Origem: pacote oficial `@micropython/micropython-webassembly-pyscript@1.27.0`.
Tarball: https://registry.npmjs.org/@micropython/micropython-webassembly-pyscript/-/micropython-webassembly-pyscript-1.27.0.tgz
Integridade do tarball original:
`sha512-DnXx4EqxgkeaFESrS3uKrL7mLMk4mRTd0mMzaOd3HUSiZUOAE7t11uLnjf3ftF87N2xm4knHnWEKcVK4IYIUDA==`

Licença original: https://raw.githubusercontent.com/micropython/micropython/v1.27.0/LICENSE
A cópia MIT está em `LICENSE`. O wrapper `micropython.mjs` não foi alterado.

## Modificação local do WASM

O build original tem memória linear mínima de 259 páginas e máxima de 32768
páginas (2 GiB). O heap inicial passado a `loadMicroPython` NÃO é um teto.
Aplicamos `scripts/limit-python-wasm.py` para reduzir o máximo a 512 páginas
(32 MiB), sem alterar as seções de código. Reprodução, a partir do WASM original:

```
python3 scripts/limit-python-wasm.py original/micropython.wasm app/frontend/vendor/micropython/micropython.wasm
```

`SHA256SUMS` contém hashes dos arquivos distribuídos (inclusive WASM modificado).
Tamanho entregue: 107864 bytes JS + 433742 bytes WASM = 541606 bytes.
Sem CDN em execução. Não atualizar automaticamente: atualizar exige nova revisão,
reaplicação do limite e testes de isolamento/compatibilidade.
