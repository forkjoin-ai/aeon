# wall

`wall` is a command-line client for the Aeon Flow protocol.

Child: [cmd/wall](./cmd/wall/README.md)

The fair brag is that it feels like a practical protocol tool, not just a demo binary. It supports normal requests, `fork`, `race`, HTTP comparison, UDP transport, verbose waterfall output, and sustained benchmarking with configurable client count and LAMINAR depth, including same-request UDP+TCP transport races and a native raw-path Aeon benchmark mode that skips HTTP-style request envelopes.

## Install

```bash
go install github.com/forkjoin-ai/aeon/wall/cmd/wall@latest
```

Or build from source:

```bash
cd open-source/aeon/packages/wall
go build -o wall ./cmd/wall
```

## Examples

```bash
wall aeon://localhost:4001/api/users
wall --fork aeon://localhost:4001/index.html /css/app.css /js/app.js
wall --race aeon://cache:4001/data aeon://origin:4001/data
wall --compare aeon://localhost:4001/api/users http://localhost:8080/api/users
wall --udp aeon://localhost:4001/api/users
wall --bench --udp --raw-path --clients 64 --duration 15s --depth 16 aeon://localhost:4001/api/users
wall --bench --race --udp --raw-path --clients 64 --duration 15s --depth 16 aeon://localhost:9082/plaintext http://localhost:8080/plaintext
wall -v --waterfall aeon://localhost:4001/api/users
```

## Useful Flags

- `-v`: frame-by-frame details
- `--waterfall`: waterfall timeline
- `--fork`: request several child paths in one fork
- `--race`: first response wins
- `--compare`: compare Aeon Flow and HTTP
- `--udp`: use UDP datagrams
- `--bench`: run a sustained benchmark instead of a single request
- `--bench --race --udp`: race the same logical request over Aeon/UDP and HTTP/TCP, first response wins
- `--raw-path`: benchmark the Aeon leg with bare path payloads for the zero-overhead native wire path
- `--clients`, `--duration`, `--depth`: shape the LAMINAR benchmark load
- `--tcp-delay`, `--udp-delay`: add requester-side skew to the mixed transport race
- `-H "Key: Value"`: send headers

## Why This README Is Grounded

Wall does not need a bigger pitch than that. The strongest fair brag is that it already gives the protocol a useful command-line tool for development and comparison work.
