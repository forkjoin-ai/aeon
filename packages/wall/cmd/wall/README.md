# wall cmd/wall

Parent: [wall package](../../README.md)

This directory contains the `wall` command entrypoint.

- `main.go`: CLI parsing, request modes, UDP/TCP transport handling, single-transport benchmarks, same-request mixed transport race benchmarks, the native `--raw-path` Aeon benchmark fast path, compact Laminar identity metadata for raw mixed races, explicit mixed-race waste observables (winner bytes, loser bytes, loser completions, vent rate, skipped hedges), first-sufficient-result accounting so empty `VENT` replies cannot steal benchmark wins, requester-side hedge delays that suppress a delayed loser leg after an early winner, bearer auth, trusted `X-Aeon-*` auth snapshot flags, and the preconnect launch gate used to release benchmark clients together.
- `main_test.go`: regression tests for UDP frame reads, single-frame `FIN` request sends, raw-path benchmarking, benchmark metadata headers, raw-path Laminar identity embedding, repeated header parsing, HTTP benchmark response parsing including vent detection, propagated auth header synthesis, start-gate behavior, Aeon pending-race registration, and mixed transport race smoke coverage including the "vent is not a winner" case and delayed-hedge suppression behavior.
