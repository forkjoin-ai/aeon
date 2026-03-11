# Formal Verification Artifacts (TLA+)

- Parent README: [../README.md](../README.md)

This directory contains finite-state TLA+ models used to mechanize the paper's strongest quantitative and topological claims.

## Files

- `ForkRaceFoldC1C4.tla` / `.cfg`: pipeline locality, branch isolation, deterministic fold, bounded termination (C1–C4).
- `Section7Formulas.tla` / `.cfg`: §7 formulas (Worthington Whip, Speculative Tree, turbulent idle fraction sample).
- `QuantumDeficit.tla` / `.cfg`: §6.12 speedup = topological deficit identity (Grover-scale sample).
- `BandGapVoid.tla` / `.cfg`: §6.11 band gaps as voids (`β₂ > 0`) on a finite periodic-energy sample.
- `ProtocolDeficit.tla` / `.cfg`: §8.3 protocol topology deficits (TCP vs QUIC/Aeon Flow).
- `SettlementDeficit.tla` / `.cfg`: §6.12 evidence-table settlement deficit (`Δβ = 2` for T+2 sequential baseline).

## Run

From `companion-tests/`:

```bash
bun run test:formal:parser
bun run test:formal
```

`test:formal:parser` validates all `.tla/.cfg` artifacts with the self-hosted `aeon-logic` parser before TLC execution.
