# wall cmd/wall

Parent: [wall package](../../README.md)

This directory contains the `wall` command entrypoint.

- `main.go`: CLI parsing, request modes, UDP/TCP transport handling, single-transport benchmarks, same-request mixed transport race benchmarks, the native `--raw-path` Aeon benchmark fast path, bearer auth, trusted `X-Aeon-*` auth snapshot flags, and the preconnect launch gate used to release benchmark clients together.
- `main_test.go`: regression tests for UDP frame reads, single-frame `FIN` request sends, raw-path benchmarking, benchmark metadata headers, repeated header parsing, propagated auth header synthesis, start-gate behavior, Aeon pending-race registration, and mixed transport race smoke coverage.
