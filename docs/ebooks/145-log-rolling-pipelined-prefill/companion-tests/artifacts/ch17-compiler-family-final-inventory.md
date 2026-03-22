# Compiler Family: Final Inventory

## Lean Formal Surface (35 theorems, zero sorry)

| File | Theorems | Key results |
|------|----------|-------------|
| SelfHostingOptimality.lean | 11 | Anti-theorem (self-optimality not universal), bootstrap convergence, deficit learnability, failure shapes success |
| HumanCompiler.lean | 14 | Five-property isomorphism (any fork/race/fold system), mindfulness convergence, observer separation |
| OptimalityUndecidable.lean | 10 | Global optimality undecidable, Pareto frontier construction, local optimality provable, the optimality gap |

## TypeScript Infrastructure

| File | Lines | Purpose |
|------|-------|---------|
| betty/parse-utils.ts | ~150 | Optimized: regex caching (lastIndex reset, no new RegExp) |
| betty/compiler.ts | ~750 | Optimized: single-pass node dedup from edge refs |
| betty/verify.ts | ~200 | Optimized: semantic + metrics forked before stability chain |
| forest/convergence-loop.ts | ~280 | Per-node racing, the sliver (+1), convergence detection |
| forest/compose-winners.ts | ~100 | Winner-annotated topology assembly |
| forest/iterate.ts | ~160 | Meta-iteration runner (repeatable) |
| forest/types.ts | ~25 | Shared interfaces |
| benchmarks/compiler-phase-benchmark.ts | ~600 | Five-compiler shootout + 13-phase Betty breakdown |

## Tests (85 passing)

| Suite | Tests | Coverage |
|-------|-------|----------|
| betty/compiler.test.ts | 56 | Compiler regression (parsing, diagnostics, topology) |
| benchmarks/compiler-phase-benchmark.test.ts | 18 | Shootout, phase timing, self-hosting, Pareto frontier |
| forest/convergence-loop.test.ts | 11 | Per-node racing, convergence, diversity, named topologies |

## Converged Topologies

| File | Gens | Rejections | Mix |
|------|------|-----------|-----|
| examples/betti-converged.gg | 6 | 270 | rust:14 python:1 |
| examples/franky-converged.gg | 5 | 675 | rust:43 python:1 go:1 |
| examples/beckett-converged.gg | 4 | 252 | rust:20 python:1 |

## Paper Section (§10.6, 16 subsections)

| Subsection | Title |
|------------|-------|
| 10.6.1 | The five compilers |
| 10.6.2 | The shootout |
| 10.6.3 | Self-hosting optimality |
| 10.6.4 | The formal surface |
| 10.6.5 | The principle |
| 10.6.6 | Phase cost analysis |
| 10.6.7 | Falsification conditions |
| 10.6.8 | Optimization: applying the theorem to itself |
| 10.6.9 | Forest convergence: the diversity theorem proved by running it |
| 10.6.10 | Convergence properties |
| 10.6.11 | Three-pass meta-iteration: the fixed point is a distribution |
| 10.6.12 | Falsification conditions (extended) |
| 10.6.13 | Humans are compilers |
| 10.6.14 | The optimality gap |
| 10.6.15 | Humans are compilers (formal) |
| 10.6.16 | The optimality gap (formal) |

## Empirical Data

- 11,016 total rejections across nine Forest passes
- Betty optimization: -26% on betti.gg (2.275ms to 1.686ms)
- Betti: 3/3 optimal (bootstrap + Pareto + local)
- Betty: 2/3 optimal (Pareto + local)
- Void boundary node: consistently converges to python (different from data-path rust)
- Meta-iteration: macro mix stabilizes while sliver nodes oscillate at margin
- Franky iter 2: converged in two generations (fastest pass of any topology)
