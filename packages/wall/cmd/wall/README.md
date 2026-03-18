# wall cmd/wall

Parent: [wall package](../../README.md)

This directory contains the `wall` command entrypoint.

- `main.go`: CLI parsing, request modes, UDP/TCP transport handling, single-transport benchmarks, same-request mixed transport race benchmarks, and the native `--raw-path` Aeon benchmark fast path.
- `main_test.go`: regression tests for UDP frame reads, single-frame `FIN` request sends, raw-path benchmarking, benchmark metadata headers, and mixed transport race smoke coverage.
