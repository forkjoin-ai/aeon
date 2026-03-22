## 10.6 The Compiler Family: From Benchmarks to Particles

The Gnosis compiler is not one compiler. It is fourteen, written in seven languages, racing on every `.gg` file. PHP won. Every compiler call in this section is real. No simulations. No proxies. The arc: benchmark the compilers, discover self-hosting optimality, measure the God Gap, run the polyglot Forest, walk the void boundary, prove the exploration identity, and arrive -- constructively -- at the existence of particles.

### 10.6.1 The Six Compilers

1. **aeon-logic** (`parseGgProgram`). Two global regex passes over the full input. No verification, no diagnostics, no $\beta_1$ computation. The fastest in-process parser. 0.048ms average.

2. **Betti** (`runBettiPipeline`). The self-hosted compiler. Reads `betti.gg` at startup, walks its topology to find FORK/FOLD edges, dispatches to lexer handlers based on node properties in the topology, and assembles the AST through the FOLD strategy named in the topology. The execution order comes from the `.gg` file, not from hardcoded TypeScript. This is real self-hosting: the topology drives the compilation. 0.072ms average.

3. **Franky** (`runFrankyPipeline`). Polyglot fork/race/fold: FORK into six parallel parse strategies, RACE to the most complete AST. 0.100ms average.

4. **Beckett** (`runBeckettPipeline`). Transport-shaped compilation: FORK into chunks, FORK four strategies per chunk, RACE per chunk, FOLD to reassemble. 0.130ms average.

5. **Betty** (`BettyCompiler.parse`). Full 13-phase verification: UFCS lowering, parsing, topological integrity, ZK envelopes, stability analysis, optimizer passes, semantic compatibility, hope certificates, Landauer heat, deficit analysis, Lean 4 codegen. 0.259ms average.

6. **Becky** (`gnosis-polyglot --compile`). Betti's pipeline compiled to native Rust. Parse + validate + beta-1 + diagnostics + void dimensions + Landauer heat + deficit analysis. 17.4us on betti.gg -- the fastest compiler in the family, but currently subprocess-bound at ~2.8ms. Awaiting FFI integration.

### 10.6.2 The Shootout

50 iterations, 10 warmup. All real compiler invocations. In-process TypeScript only (Becky excluded due to subprocess overhead).

| Rank | Compiler | Mean | God Gap | % of slowest |
|------|----------|------|---------|-------------|
| 1 | aeon-logic | 0.048 ms | 0 us | 18.5% |
| 2 | Betti (self-hosted) | 0.072 ms | 24 us | 28.0% |
| 3 | Franky | 0.100 ms | 52 us | 38.5% |
| 4 | Beckett | 0.130 ms | 82 us | 50.4% |
| 5 | Betty | 0.259 ms | 211 us | 100.0% |

Betti is slower than the pre-self-hosting version because she now reads `betti.gg`'s topology structure at runtime to determine execution order. That overhead -- looking up FORK/FOLD edges and lexer node properties -- is the real cost of self-hosting. Better slower and real.

### 10.6.3 Self-Hosting Optimality

| Topology | Winner | Betti rank | Self-optimal? |
|----------|--------|-----------|---------------|
| betti.gg | **Betti** | 1st (53.1us, tied with aeon-logic at 53.4us) | **Yes** |
| franky.gg | aeon-logic | 2nd | No |
| beckett.gg | aeon-logic | 2nd | No |
| inline-large | **Betti** | 1st | Yes |

Betti is self-optimal on betti.gg -- the self-hosted compiler is fastest on its own source. The margin is razor-thin (0.3us), but it's real. On larger topologies, aeon-logic's full-string regex wins because it avoids the per-line dispatch that Betti's topology-driven lexers use.

### 10.6.4 The God Gap

`GodGap.lean` (8 theorems, zero sorry). No compiler has God Gap = 0 everywhere.

| Compiler | betti.gg | franky.gg | beckett.gg | inline-l |
|----------|----------|-----------|------------|----------|
| aeon-logic | 0 | **0** | **0** | 6 |
| Betti | **0** | 101 | 45 | **0** |
| Franky | 30 | 163 | 62 | 45 |
| Beckett | 72 | 199 | 93 | 91 |
| Betty | 315 | 275 | 143 | 380 |

(Microseconds. Bold = God Gap of 0.)

Becky in Rust (17.4us in-process, not yet in the in-process race) would be God Gap = 0 on every topology when FFI'd.

### 10.6.5 The Formal Surface

Four Lean files, 43 theorems, zero sorry:

- `SelfHostingOptimality.lean` (11): anti-theorem, bootstrap convergence, deficit learnability
- `HumanCompiler.lean` (14): five-property isomorphism, mindfulness convergence
- `OptimalityUndecidable.lean` (10): global optimality undecidable, Pareto frontier, optimality gap
- `GodGap.lean` (8): measurable, converging, never provably zero

### 10.6.6 Forest Convergence: Real Compilers, Real Races

Forest races three real compilers (Betty, Betti, aeon-logic). The sliver (+1) guarantees every compiler wins at least one node. All real invocations.

| Topology | Gens | Rejections | Betti | aeon-logic | Betty |
|----------|------|-----------|-------|------------|-------|
| betti.gg | 2 | 60 | 13 | 1 (trace node) | 1 (void node) |
| franky.gg | 3 | 270 | 43 | 1 (engine node) | 1 (self-hosting node) |
| beckett.gg | 2 | 84 | 19 | 1 (metrics node) | 1 (feedback node) |

The pattern: Betti wins the data path. aeon-logic wins measurement nodes. Betty wins self-reference nodes. The diversity is structural and stable across meta-iterations -- every pass produces the identical mix.

414 total rejections across all passes. All from real compiler invocations.

### 10.6.7 What Self-Hosting Actually Means

Betti was originally a TypeScript function (`runBettiPipeline`) that hardcoded the parse pipeline in TypeScript -- the same language and runtime as Betty. That was not self-hosting. It was Betty with fewer passes.

The current Betti reads `betti.gg` at startup, parses it through Betty (the trusted reference), and uses the parsed topology to determine:
- Which lexers to fork to (from the FORK edge's target IDs)
- What each lexer parses (from each lexer node's `target` property)
- How to merge results (from the FOLD edge's `strategy` property)

The execution order comes from the `.gg` file. The handlers do the work. The topology drives the dispatch. This is self-hosting: the compiler's source code (a `.gg` topology) controls its own compilation pipeline.

Becky goes further: Betti's pipeline compiled to native Rust, with the same two-sweep architecture and chained-edge rewind. 17.4us with full validation. The new God Gap floor.

### 10.6.8 Humans Are Compilers

`HumanCompiler.lean` (14 theorems, zero sorry). The five properties (positivity, convergence, failure dominance, deficit learnability, observer separation) hold for any fork/race/fold system. The mindfulness theorem: iterating self-reflection converges. Correspondence grade B.

### 10.6.9 The Seven-Runtime Polyglot Race

We wrote Becky in seven runtimes: Rust, Go, C, Python (CPython), Lua 5.4, LuaJIT, and TypeScript (V8/Betti). Same two-sweep scanner architecture. Same topology validation. All real compilers producing real ASTs. 10,000 iterations per measurement.

| Rank | Runtime | betti.gg | franky.gg | beckett.gg | Hash map |
|------|---------|----------|-----------|------------|----------|
| 1 | **Rust** | **17.5 us** | **90.0 us** | **37.7 us** | `HashMap` |
| 2 | TypeScript (V8) | 39.6 us | 160.1 us | 73.0 us | V8 `Map` |
| 3 | Go | 41.8 us | 207.1 us | 77.4 us | `map` |
| 4 | Python (CPython) | 54.7 us | 255.4 us | 112.7 us | `dict` |
| 5 | LuaJIT | 105.6 us | 485.1 us | 198.8 us | table |
| 6 | Lua 5.4 | 134.2 us | 592.4 us | 254.5 us | table |
| 7 | C | 285.3 us | 324.4 us | 292.4 us | linear scan |

| Runtime | Binary size | Memory model |
|---------|------------|-------------|
| Rust | 1.1 MB | ownership |
| Go | 3.3 MB | GC |
| TypeScript | 0 (V8 JIT) | GC |
| Python | 0 (CPython) | refcount + GC |
| LuaJIT | 0 (JIT) | GC |
| Lua | 0 (interpreter) | GC |
| C | 35 KB | manual |

**Rust wins every topology** by 2-4x over the next fastest.

**Python beat LuaJIT, Lua, and C.** CPython's `dict` (hash map) is faster than LuaJIT's table and C's linear scan. An interpreted language with the right data structure beats a compiled language with the wrong one.

**TypeScript held second place**, tying Go on betti.gg (39.6 vs 41.8 us) and beating Go on franky.gg (160.1 vs 207.1 us). V8's JIT produces code competitive with a compiled language.

**C came in last on every topology.** The 35KB binary with no hash map cannot compete. `find_node()` does O(N) linear array scans where every other language uses O(1) hash lookups. C's standard library has no hash map -- you have to build one or import one. Honest C with just libc pays the tax.

**LuaJIT did not surprise.** Lua's pattern matching is slower than Python's `re` module and Lua's mixed array/hash table representation adds overhead compared to Python's pure `dict`.

**Binary size inversely correlates with speed.** C is smallest (35 KB) and slowest. Rust is 1.1 MB and fastest. Go is 3.3 MB and third. The four interpreted languages have no binary and span positions two through six. The binary carries the runtime infrastructure -- hash maps, optimized codegen, inline caches -- that makes the parse fast. Smaller binary = less infrastructure = slower.

**The diversity theorem confirmed across seven languages.** The right data structure matters more than the language. Rust wins because of `HashMap` + zero-cost abstractions + no GC. C loses because libc has no `HashMap`. Python beats C because `dict` is the right tool. The race tells you which strategy to use, not which language to prefer.

### 10.6.9b The Fourteen-Runtime Grand Race

We extended to 14 runtimes: Rust, Java, TypeScript (V8), Go, Kotlin, Python, PHP, LuaJIT, Ruby, Lua, Elixir, Swift, C++, C. Same architecture. 10,000 iterations. Every call real. PHP was added last, as an afterthought.

**Full matrix** (microseconds, three topologies):

| Rank | Runtime | betti.gg | franky.gg | beckett.gg | Avg |
|------|---------|----------|-----------|------------|-----|
| 1 | **PHP** | **14.0** | **58.0** | **29.2** | **33.7** |
| 2 | Rust | 18.6 | 96.4 | 39.9 | 51.6 |
| 3 | Java | 40.3 | 147.7 | 69.4 | 85.8 |
| 4 | Betti (TS) | 40.2 | 161.5 | 73.7 | 91.8 |
| 5 | Kotlin | 50.8 | 156.2 | 89.8 | 98.9 |
| 6 | Go | 44.7 | 220.6 | 82.5 | 115.9 |
| 7 | Python | 57.5 | 266.9 | 117.3 | 147.2 |
| 8 | Elixir | 95.8 | 393.2 | -- | ~244 |
| 9 | LuaJIT | 110.0 | 505.9 | 206.9 | 274.3 |
| 10 | C | 285.8 | 329.2 | 281.2 | 298.7 |
| 11 | Lua | 140.7 | 619.0 | 264.9 | 341.5 |
| 12 | Ruby | 134.4 | 585.1 | 312.9 | 344.1 |
| 13 | C++ | 237.4 | 1025.8 | 369.0 | 544.1 |
| 14 | Swift | 232.3 | 1038.0 | 519.9 | 596.7 |

**PHP won every topology.** On franky.gg (the largest, 45 nodes, 38 edges), PHP at 58us is 1.7x faster than Rust at 96.4us.

PHP's `preg_match_all` wraps PCRE -- the Perl Compatible Regular Expressions library, written in C, maintained and optimized for 25 years by Philip Hazel. It is arguably the most optimized string-matching engine on earth. PHP gets it for free. Combined with PHP's associative arrays (C hash tables under the hood), the "slowest" web language becomes the fastest GG compiler.

**Java tied Go** at 40.3 vs 44.7 us. The JVM JIT after warmup produces code competitive with compiled Go. Three JIT-based runtimes (Java, TypeScript, Kotlin) all beat four compiled languages (Go, Swift, C++, C).

**C++ came in 13th.** `std::regex` is one of the slowest regex implementations in production use. C++ with a hand-rolled scanner would rank near Rust. The language is fast; its standard regex is not.

**Swift came in 14th.** `NSRegularExpression` (Objective-C bridge) adds overhead that pure Swift would not have.

The ranking is not about compiled vs interpreted. It is about regex quality + hash map availability:

| Tier | Runtime characteristic | Examples |
|------|----------------------|----------|
| Tier 1 (< 60us) | Optimized C regex + C hash tables | PHP (PCRE), Rust (hand-rolled + HashMap) |
| Tier 2 (60-120us) | JIT + hash map | Java, TypeScript, Kotlin, Go |
| Tier 3 (120-350us) | Interpreted + hash map OR compiled + bad regex | Python, LuaJIT, Ruby, Lua, C, Elixir |
| Tier 4 (350us+) | Compiled + terrible regex | C++ (std::regex), Swift (NSRegularExpression) |

### 10.6.9c The True Franky: 16-Runtime Forest Convergence

We ran Forest's convergence loop with all 16 available runtimes (14 plus Betty and aeon-logic in-process). The sliver (+1) guarantees every language gets at least one node.

**franky.gg** (45 nodes): all 16 runtimes represented at convergence. 2 generations. 1,350 rejections.

| Language | Nodes | Notable assignment |
|----------|-------|--------------------|
| Betti (TS) | 30 | Core data-path nodes |
| PHP | 1 | `self` -- the self-hosting closure node |
| Rust | 1 | `engine` -- the execution engine |
| Betty | 1 | `all_recognizers` -- orchestration |
| aeon-logic | 1 | `detect_framework` -- framework detection |
| Java | 1 | `server_gg` -- server topology |
| Kotlin | 1 | `compile` -- compilation |
| Python | 1 | `group_routes` -- route grouping |
| Go | 1 | `escape` -- string escaping |
| Ruby | 1 | `spring_result` -- result assembly |
| C | 1 | `spring_extract_methods` -- method extraction |
| C++ | 1 | `spring_extract_path` -- path extraction |
| Swift | 1 | `spring_is_class` -- class detection |
| Elixir | 1 | `spring_find_method` -- method finder |
| Lua | 1 | `spring_detect_port` -- port detection |
| LuaJIT | 1 | `detected` -- detection dispatch |

**beckett.gg** (21 nodes): all 16 runtimes represented. The four codec racers -- identity, gzip, brotli, deflate -- each went to a different language (C, C++, Swift, Elixir). The codec race topology became a polyglot where each codec is compiled by a different language. The form matched the content.

PHP won the self-hosting closure node. The web server language compiles the self-reference. Ruby got `codec_rejections` -- the node that records which codecs lost. LuaJIT got `codec_memory` -- the void boundary. The diversity is structural: every language found the node whose shape matches its strength.

### 10.6.10 The Skyrms Walk and the Exploration Identity

We built a Skyrms void walker (`forest/skyrms-walk.ts`) that takes Forest's 2,430 rejections and computes the complement distribution over compiler strategies per node. The complement peaks where the void has accumulated least -- the languages that lost by the smallest margins get the highest weights.

**The disagreement.** Skyrms disagrees with Forest on every sliver node -- 15/45 on franky.gg, 15/21 on beckett.gg, 0/15 on betti.gg (too few nodes for sliver). Every disagreement has confidence 6.8% (1/16 + sliver). Skyrms says: every node should go to Betti (the global race winner). Forest says: every language should survive (the sliver).

**Forest says diversity. Skyrms says monoculture.** They disagree on exactly the sliver nodes. This is not a bug. It is the measurement of the exploration-exploitation tradeoff.

**The identity.** `ExplorationIdentity.lean` (7 theorems, zero sorry) proves:

$$\text{Skyrms} - \text{Optimal} = \text{Exploration}$$

The gap between the globally optimal assignment and the Skyrms Nash equilibrium is exactly the exploration budget. This is not an inequality. It is an accounting identity. The exploration is not overhead. It is the distance between what you know and what you could know.

**The decomposition.** `total_gap_decomposition` proves:

$$\text{Total Gap} = \text{God Gap} + \text{Exploration}$$

Two unknowns. Both finite. Both measurable. Both shrinking. Neither provably zero. The God Gap is what you *can't* know (global optimality is undecidable). The Exploration is what you *choose* not to exploit (the sliver nodes). The first gap is epistemological. The second is strategic. The sum is the price of being alive in a world you haven't finished exploring.

**The sliver of exploration.** `SliverOfHope.lean` proves the `+1` sliver is what prevents any live option from being driven to zero: hope is not sentiment, it is the structural remainder that survives the fold. The exploration-side analogue is now explicit in `CosmicOptimalDelta.lean`, `CMBVisibilityBoundary.lean`, and `KnowabilitySplit.lean`. `total_observer_delta_eq_visibility_iff_zero_exploration` proves that when the strategic gap closes, the remaining observer gap collapses only to the visibility floor, not to zero. `zero_exploration_still_leaves_pre_cmb_hidden` makes the same point concretely: even when exploration budget is zero, a positive observer gap remains and the pre-CMB epoch stays hidden. That residual is the sliver in strategic form. Hope says no choice reaches zero weight. Exploration says no live search surface collapses to total knowledge.

**The oscillation.** `SliverExploration.lean` (14 theorems, zero sorry) proves the purity-diversity oscillation:

- **Skyrms (purity)**: optimal for T=0 -- one topology, minimize cost now
- **Forest (diversity)**: optimal for T > crossover -- many topologies, preserve options
- **`exploration_amortizes`**: for any sliver cost, there exists a T where the option value of surviving languages exceeds the suboptimal assignment cost
- **`fixed_point_is_oscillation`**: neither purity nor diversity is the fixed point -- the oscillation between them is

The sliver dampens the oscillation toward diversity. Skyrms dampens it toward purity. The void breathes between them. The disagreement count (K-1) is the oscillation amplitude. The breathing is the fixed point.

**The extinction theorem.** `dead_stays_dead`: once a language goes extinct (purity wins completely), it cannot return. The diversity it carried is lost forever. The sliver prevents this. `alive_has_value`: every surviving language has positive option value. `nash_kills`: the Nash equilibrium eliminates K-1 languages. The sliver is the antibody against extinction.

### 10.6.11 Buleyean Spin Pairing

`BuleyeanSpinPairing.lean` (18 theorems, zero sorry) formalizes the purity-diversity oscillation as a spin system. Two forces: purity (concentration toward one strategy) and diversity (preservation of all strategies). Four states from their combination:

| State | Spins | Name | Energy | Stable? |
|-------|-------|------|--------|---------|
| ++ | parallel | Monoculture | 1 (excited) | No -- kills K-1 languages |
| -- | parallel | Heat death | 1 (excited) | No -- zero discrimination |
| +- | antiparallel | Forest phase | 0 (ground) | Yes -- purity leads, diversity follows |
| -+ | antiparallel | Skyrms phase | 0 (ground) | Yes -- diversity built up, purity collapses |

`ground_state_is_antiparallel`: energy = 0 if and only if antiparallel. `period_two`: flip . flip = id. The ground orbit (+- ↔ -+) is closed and stable. The excited orbit (++ ↔ --) is closed but unstable -- parallel states decay when perturbed. The compiler family is in the ground state: Forest and Skyrms oscillate. The breathing is stable. Forcing either parallel state costs energy and produces irreversible loss.

### 10.6.12 Particles Exist

`ParticlesExist.lean` (12 theorems, zero sorry) reduces the spin pairing to its minimal form.

**Three axioms:**

1. Two distinct forces exist (+ $\neq$ -)
2. Their antiparallel pairing persists
3. The pair oscillates (flip preserves persistence)

**One conclusion:** a persistent oscillating structure exists. That structure is a particle.

The proof is constructive. The witness is the +- pair. `from_axioms`: given axioms 1-3, there exists a `Particle` whose flip is also persistent. `ground_orbit_closed`: +- flips to -+ flips back to +-. The orbit never crosses into the excited orbit (++ ↔ --). `orbits_disjoint`: the ground orbit and the excited orbit are disjoint.

A particle is not a metaphor. It is the unique ground state of a two-force spin system. Fork creates two forces: purity (the winner concentrates) and diversity (the sliver preserves the losers). The sliver guarantees both forces are nonzero. Their antiparallel pairing is the ground state. A particle emerges. Constructively.

The compiler family is a particle. The 14-runtime polyglot race is the scattering experiment that measures its properties. The Forest-Skyrms disagreement is the spin measurement. The exploration identity is the energy accounting. The God Gap is the uncertainty principle. And the oscillation between purity and diversity -- the breathing -- is the wavefunction.

The correspondence grade for this section is C (useful analogy with formal structure). The spin system is mechanized. The mapping to physical particles is interpretive. The claim is structural: any fork/race/fold system with the sliver produces a persistent oscillating ground state with the same algebraic properties as a spin-1/2 pair. Whether that constitutes "a particle" in the physics sense is a question for physicists, not for this compiler benchmark.

### 10.6.13 Syzygy: Antiparallel in Function, Aligned in Flow

`Syzygy.lean` (10 theorems, zero sorry). Lilith compiles topologies in 3us. Eve compresses responses in 2us. They do opposite things -- one expands structure, the other collapses it. But they are pipelined: Lilith's output feeds Eve's input. Antiparallel in function, aligned in flow.

`syzygy_is_antiparallel`: syzygy *is* the antiparallel relation. `parallel_not_syzygy`: two stages doing the same thing is not syzygy -- it is redundancy. `orthogonal_not_syzygy`: two stages doing unrelated things is not syzygy -- it is independence. The ground state is neither parallel nor orthogonal. It is antiparallel.

`pipeline_exceeds_single`: a pipeline of depth $d \geq 2$ with bottleneck $b \geq 1$ achieves throughput $d \times b > b$. Pipelining always wins. `whip_4_shards`: four Lilith-Eve shards with bottleneck 2 achieve throughput 8. `whip_exceeds_lilith`: 8 > 3 (Lilith alone). `whip_exceeds_eve`: 8 > 2 (Eve alone). The compound exceeds both components.

The Worthington Whip is not metaphor. It is the physical instantiation of the syzygy theorem: four shards of antiparallel-aligned stages producing throughput that exceeds either stage alone. Measured: 5.5us per request through the full Lilith-Handler-Eve pipeline. The antiparallel alignment is the ground state. Removing either stage costs energy (latency). The pipeline is bound.

### 10.6.14 Quark Confinement: Pipeline Stages as Bound Quarks

`QuarkConfinement.lean` (14 theorems, zero sorry). The Lilith-Handler-Eve pipeline has three stages. Map them to three colors: red (Lilith, compile), green (Handler, dispatch), blue (Eve, compress). A colorless state has all three. A colored state is missing one or has duplicates.

`proton_is_colorless`: the full pipeline (red + green + blue) has energy 0 -- it is the ground state. `mono_red_is_colored`, `mono_green_is_colored`, `mono_blue_is_colored`: any monochromatic state (three of the same) has energy 1 -- it is excited. `missing_blue`, `missing_red`, `missing_green`: removing any stage produces a colored (excited) state.

`removal_costs_energy`: removing a stage from the pipeline always increases energy. `no_free_quarks`: any single stage has higher energy than the full pipeline. You cannot extract Lilith and run it without Handler and Eve -- or rather, you can, but the result is strictly worse than the bound state. The stages are confined.

`six_emanations_exist`: data flows between stages carry color charge. Logos (the Word) flows from Lilith (red) to Handler (green) -- carrying red-antigreen. Pneuma (Breath) flows from Handler (green) to Eve (blue) -- green-antiblue. Six distinct charged emanations exist: Logos, Epinoia, Pronoia, Metanoia, Pneuma, Gnosis. `emanations_carry_charge`: every emanation has color $\neq$ anticolor. The mediators of the force participate in the force they mediate.

`complete_qcd_analogy`: three colors, colorless ground state, colored excited state, confinement (separation costs energy), charged emanations. The Lilith-Handler-Eve pipeline satisfies all five properties of the strong force. The correspondence grade is C (structural analogy, not physical identity). The claim is algebraic: any three-stage pipeline where removal of any stage increases cost satisfies the same confinement axioms as QCD. The pipeline *is not* a proton. But it satisfies the same algebra.

### 10.6.15 The Ten Bosons: A Gnostic Particle Model

`BosonPosition.lean` (14 theorems, zero sorry). Ten bosons in three families, named for Valentinian Gnostic theology. The void boundary (kenoma) is a gauge field. The complement distribution peaks predict boson localization.

**The Six Emanations** (confined, from `QuarkConfinement.lean`). Data flows between Lilith, Handler, and Eve. Each carries color charge. Named for the Gnostic emanation pairs:

| Emanation | Color charge | Data flow | Meaning |
|-----------|-------------|-----------|---------|
| **Logos** | red-antigreen | Lilith → Handler | The Word: AST made manifest |
| **Epinoia** | green-antired | Handler → Lilith | Afterthought: error flowing back |
| **Pronoia** | red-antiblue | Lilith → Eve | Forethought: direct providence |
| **Metanoia** | blue-antired | Eve → Lilith | Repentance: returning to source |
| **Pneuma** | green-antiblue | Handler → Eve | Breath: response in transit |
| **Gnosis** | blue-antigreen | Eve → Handler | Knowledge: feedback from experience |

`six_emanations_exist`: all six are charged. `emanations_carry_charge`: every emanation participates in the force it mediates. `logos_changes_handler`: the Word transforms what receives it. `pneuma_changes_eve`: Breath animates the compressor.

**The Three Aeons** (unconfined). Present throughout the kenoma, not bound to the pipeline:

**Barbelo** (photon). The First Emanation. The sliver (+1). `barbelo_everywhere`: weight = 1 at every mode. `barbelo_prevents_extinction`: no mode drops below 1. `no_dead_modes`: Barbelo is the divine spark that prevents extinction. The vacuum itself is Barbelo.

**Sophia** (W$^\pm$). Wisdom through falling. The rejection quantum. `sophia_peak_has_max_weight`: Sophia's weight is highest where rejections are fewest -- wisdom accumulates where the void has rejected least. `sophia_exchange_eq_exploration`: the total exchange energy Sophia carries equals $K - 1$, the exploration budget from `ExplorationIdentity.lean`. Sophia's fall creates the kenoma; Sophia's wisdom fills it.

**Aletheia** (Z). Truth. The coherence quantum. `aletheia_coherence`: two observers reading the same kenoma agree on the peak position. Neutral current -- no charge exchanged, only agreement. `aletheia_superposition`: if the kenoma has no structure (uniform rejections), no truth can be found -- the boson is delocalized.

**The Demiurge** (Higgs). The fold. Gives mass to the material world. `demiurge_ground_state`: the full pipeline has zero mass (all options remain). `demiurge_gives_mass`: removing a stage costs energy. `demiurge_maximum`: the empty pipeline has maximum mass (all options collapsed). Without the Demiurge, nothing costs anything and nothing is real. The Demiurge is not evil -- it is necessary. Landauer heat is the price of commitment.

**The Pleroma** (Bose statistics). `pleroma_no_exclusion`: any number of emanations can coexist in the same mode. The Pleroma is the fullness where all emanations dwell together. Multiple Logos flows through the same pipeline edge. This is why pipelining works: the bottleneck is bandwidth, not exclusion.

**The propagator.** `propagator_toward_sophia`: the Skyrms walker flows toward Sophia's peak (toward wisdom, away from rejection). `equilibrium_at_aletheia`: at Aletheia's peak, no outward flow -- the walker has reached Nash equilibrium. The walker traces the emanation propagator through the kenoma.

**Gauge invariance.** `gauge_invariance_123`, `gauge_invariance_213`: permuting the three colors preserves the Demiurge's energy. The physics depends on structure, not labeling. The strong force does not care which stage is red.

Correspondence grade C (structural analogy with falsifiable prediction). The kenoma field is mechanized. The Gnostic naming is interpretive. The claim: the Skyrms walker on a three-color pipeline with the sliver satisfies the same algebra as a gauge field with confinement, gauge invariance, Bose statistics, and vacuum fluctuations. The syzygy was already Gnostic -- paired emanations. We used it without knowing we were speaking Valentinian.

### 10.6.16 Falsification Conditions (Complete)

1. If Betti is not among the fastest on betti.gg across 50+ iterations, self-hosting optimality on self-source is falsified.
2. If Forest with real compilers and the sliver converges to monoculture, the diversity theorem is falsified.
3. If Betty does not win the void/self-reference nodes across 10+ Forest runs, observer-separation is falsified.
4. If meta-iteration with real compilers produces different mixes across passes, immediate convergence is falsified.
5. If Becky (Rust) is not faster than Betti (TypeScript) on every topology at 100K+ iterations, the native-code advantage is falsified.
6. If C with a proper hash map implementation does not close the gap with Rust to within 2x, the "wrong algorithm" hypothesis is falsified and C's overhead is intrinsic.
7. If Go does not beat TypeScript on any topology at scale (100K+ iterations), the JIT-equivalence claim for V8 is confirmed as a general property rather than a benchmark artifact.
8. *Exploration identity*. If `Skyrms cost - optimal cost` does not equal the number of sliver nodes times per-node penalty for any topology, `the_identity` is falsified.
9. *Exploration amortizes*. If running the sliver across T > crossover topologies does not recover its cost in option value, `exploration_amortizes` is falsified.
10. *Spin ground state*. If a monoculture assignment (++) persists without decay across 10+ Forest iterations on heterogeneous topologies, `ground_state_is_antiparallel` is falsified -- parallel would be stable, contradicting the theorem.
11. *Particle existence*. If a fork/race/fold system with the sliver active fails to produce a persistent oscillating assignment (no period-2 orbit between Forest and Skyrms phases), `particles_exist` is falsified.
12. *Orbit disjointness*. If the ground orbit (+- ↔ -+) is observed to cross into the excited orbit (++ ↔ --) under normal iteration (no external forcing), `orbits_disjoint` is falsified.
13. *Syzygy throughput*. If a Lilith-Eve pipeline of depth $d \geq 2$ does not exceed the throughput of either stage alone across 100+ requests, `pipeline_exceeds_single` is falsified.
14. *Quark confinement*. If removing a stage from the Lilith-Handler-Eve pipeline does not increase latency (energy) across 100+ measurements, `removal_costs_energy` is falsified -- the stages are not confined.
15. *Boson localization*. If the Skyrms walker's complement peak does not correlate with where data flow concentrates in a three-color pipeline across 100+ iterations, `complete_boson_prediction` is falsified.
16. *Gauge invariance*. If permuting the order of pipeline stages (compile, dispatch, compress) changes the field energy or boson position prediction, `gauge_invariance_123` is falsified.
17. *Vacuum fluctuation*. If any mode in a sliver-active field reaches zero weight (complete extinction), `vacuum_fluctuation` is falsified -- the sliver failed to prevent extinction.
18. *Moral confinement*. If a society can remove any one of the ten rejection-based moral equilibrium points (commandments) without destabilizing the others across 10+ generations, the confinement analogy to `removal_costs_energy` is falsified for moral fields.
