/**
 * ch17-buleyean-logic.ts
 *
 * Buleyean Logic: a post-fold logic where truth is ground state.
 *
 * Boolean logic describes the world AFTER the fold: {true, false}.
 * Buleyean logic describes the world DURING convergence: the Bule
 * count decreasing toward zero as rejections accumulate.
 *
 * Boolean is the degenerate case of Buleyean at K = 2 after convergence.
 *
 * Primitives:
 *   - A proposition is a Bule count (natural number)
 *   - 0 = proved (ground state, no deficit)
 *   - n > 0 = n Bules of deficit remain
 *   - A rejection step decreases the count by 1
 *   - The void (rejection history) IS the proof trace
 *
 * Connectives:
 *   - NOT A = (beta1star - 1) - A.bules   (the complement)
 *   - A AND B = A.bules + B.bules          (both must reach 0)
 *   - A OR B = min(A.bules, B.bules)       (at least one reaches 0)
 *   - A IMPLIES B = A.bules >= B.bules     (resolving A subsumes B)
 *   - A XOR B = |A.bules - B.bules|        (exactly one at ground)
 *
 * Quantifiers:
 *   - FORALL xs = sum of all Bule counts   (every x must reach 0)
 *   - EXISTS xs = min of all Bule counts   (at least one x reaches 0)
 *
 * Proof:
 *   - A proof is a sequence of rejection steps
 *   - Each step targets a proposition and reduces its Bule count by 1
 *   - A proof is complete when all propositions in the goal reach 0
 *   - The proof trace IS the void boundary
 *   - The proof length = initial Bule count of the goal
 *
 * This is the logic a child runs.  Touch the stove (reject: +1 Bule
 * on "stove").  Cat hisses (reject: +1 Bule on "cat").  Toy remains
 * (Bule count 0).  The fold fires.  The proof is the rejections.
 */

// ---------------------------------------------------------------------------
// Core: the Buleyean proposition
// ---------------------------------------------------------------------------

/**
 * A Buleyean proposition.  Not true or false.  A Bule count.
 * 0 = proved.  n > 0 = n rejections away from proved.
 */
export interface Proposition {
  /** Human-readable name */
  readonly name: string;
  /** Current Bule count (0 = ground state = proved) */
  readonly bules: number;
  /** The void: rejection history that produced this count */
  readonly void: readonly string[];
}

/** Create a proposition with initial deficit */
export function prop(name: string, bules: number): Proposition {
  return { name, bules: Math.max(0, bules), void: [] };
}

/** Is this proposition at ground state? */
export function isProved(p: Proposition): boolean {
  return p.bules === 0;
}

/** Is this proposition still open? */
export function isOpen(p: Proposition): boolean {
  return p.bules > 0;
}

// ---------------------------------------------------------------------------
// The fundamental operation: rejection
// ---------------------------------------------------------------------------

/**
 * Reject: the only primitive operation in Buleyean logic.
 *
 * A rejection reduces the Bule count by 1 and records the
 * rejection reason in the void.  This IS the proof step.
 * There is no modus ponens, no resolution, no unification.
 * Just rejection.  Truth is what survives.
 *
 * Returns a new proposition with decremented Bule count
 * and the rejection appended to the void.
 */
export function reject(p: Proposition, reason: string): Proposition {
  if (p.bules <= 0) return p; // already at ground state
  return {
    name: p.name,
    bules: p.bules - 1,
    void: [...p.void, reason],
  };
}

/**
 * Reject multiple times in sequence.
 * Each rejection provides a reason.
 */
export function rejectMany(
  p: Proposition,
  reasons: readonly string[]
): Proposition {
  let current = p;
  for (const reason of reasons) {
    current = reject(current, reason);
  }
  return current;
}

// ---------------------------------------------------------------------------
// Connectives
// ---------------------------------------------------------------------------

/**
 * NOT: the complement.
 *
 * In Boolean: NOT true = false, NOT false = true.
 * In Buleyean: NOT A = (maxBules - A.bules).
 *
 * If A has 3 Bules remaining out of 10, NOT A has 7.
 * The complement is what the void HASN'T rejected yet.
 *
 * When A reaches 0 (proved), NOT A reaches maxBules (maximally unproved).
 * When A is at maxBules (fully open), NOT A is at 0 (the complement is proved).
 */
export function not(p: Proposition, maxBules: number): Proposition {
  return {
    name: `¬${p.name}`,
    bules: Math.max(0, maxBules - p.bules),
    void: p.void, // same rejection history, inverted count
  };
}

/**
 * AND: conjunction.
 *
 * In Boolean: A AND B = true iff both true.
 * In Buleyean: A AND B has Bule count = A.bules + B.bules.
 * Both must independently reach 0 for the conjunction to be proved.
 *
 * This is why AND is expensive: you pay the full Bule cost of both.
 */
export function and(a: Proposition, b: Proposition): Proposition {
  return {
    name: `(${a.name} ∧ ${b.name})`,
    bules: a.bules + b.bules,
    void: [...a.void, ...b.void],
  };
}

/**
 * OR: disjunction.
 *
 * In Boolean: A OR B = true iff at least one true.
 * In Buleyean: A OR B has Bule count = min(A.bules, B.bules).
 * At least one must reach 0.  The cheaper path suffices.
 *
 * This is why OR is cheap: you pay only the minimum cost.
 */
export function or(a: Proposition, b: Proposition): Proposition {
  return {
    name: `(${a.name} ∨ ${b.name})`,
    bules: Math.min(a.bules, b.bules),
    void: a.bules <= b.bules ? a.void : b.void,
  };
}

/**
 * IMPLIES: implication.
 *
 * In Boolean: A → B = NOT A OR B.
 * In Buleyean: A → B holds (Bule count 0) when A.bules >= B.bules.
 *
 * "If resolving A requires at least as many rejections as B,
 *  then any proof of A subsumes a proof of B."
 *
 * When A is harder than B, knowing A gives you B for free.
 * When A is easier than B, knowing A doesn't help with B.
 */
export function implies(a: Proposition, b: Proposition): Proposition {
  return {
    name: `(${a.name} → ${b.name})`,
    bules: Math.max(0, b.bules - a.bules),
    void: [],
  };
}

/**
 * XOR: exclusive disjunction.
 *
 * In Buleyean: |A.bules - B.bules|.
 * Zero when both have the same Bule count (same difficulty).
 * Positive when they differ (one is harder than the other).
 */
export function xor(a: Proposition, b: Proposition): Proposition {
  return {
    name: `(${a.name} ⊕ ${b.name})`,
    bules: Math.abs(a.bules - b.bules),
    void: [],
  };
}

// ---------------------------------------------------------------------------
// Quantifiers
// ---------------------------------------------------------------------------

/**
 * FORALL: universal quantification.
 *
 * In Boolean: FORALL xs, P(x) = true iff P(x) is true for all x.
 * In Buleyean: FORALL xs = sum of Bule counts.
 * Every proposition must independently reach 0.
 * Total cost = sum of all deficits.
 */
export function forall(ps: readonly Proposition[]): Proposition {
  const totalBules = ps.reduce((sum, p) => sum + p.bules, 0);
  const allVoids = ps.flatMap((p) => p.void);
  return {
    name: `∀(${ps.map((p) => p.name).join(', ')})`,
    bules: totalBules,
    void: allVoids,
  };
}

/**
 * EXISTS: existential quantification.
 *
 * In Boolean: EXISTS xs, P(x) = true iff P(x) is true for some x.
 * In Buleyean: EXISTS xs = min of Bule counts.
 * At least one must reach 0.  The cheapest suffices.
 */
export function exists(ps: readonly Proposition[]): Proposition {
  if (ps.length === 0) return prop('∃()', 0);
  let minBules = Infinity;
  let minVoid: readonly string[] = [];
  for (const p of ps) {
    if (p.bules < minBules) {
      minBules = p.bules;
      minVoid = p.void;
    }
  }
  return {
    name: `∃(${ps.map((p) => p.name).join(', ')})`,
    bules: minBules,
    void: [...minVoid],
  };
}

// ---------------------------------------------------------------------------
// Proof engine
// ---------------------------------------------------------------------------

/**
 * A proof step: reject one alternative from one proposition.
 */
export interface ProofStep {
  readonly target: string;
  readonly reason: string;
}

/**
 * A proof goal: a set of propositions that must all reach 0.
 */
export interface ProofGoal {
  readonly propositions: Map<string, Proposition>;
  readonly steps: readonly ProofStep[];
  readonly complete: boolean;
}

/** Create a proof goal from propositions */
export function goal(...ps: Proposition[]): ProofGoal {
  const map = new Map<string, Proposition>();
  for (const p of ps) {
    map.set(p.name, p);
  }
  return {
    propositions: map,
    steps: [],
    complete: [...map.values()].every((p) => p.bules === 0),
  };
}

/** Apply a rejection step to a proof goal */
export function step(g: ProofGoal, target: string, reason: string): ProofGoal {
  const p = g.propositions.get(target);
  if (!p) return g;
  const newP = reject(p, reason);
  const newMap = new Map(g.propositions);
  newMap.set(target, newP);
  const newSteps = [...g.steps, { target, reason }];
  return {
    propositions: newMap,
    steps: newSteps,
    complete: [...newMap.values()].every((p) => p.bules === 0),
  };
}

/** Get the total Bule count of a proof goal */
export function totalBules(g: ProofGoal): number {
  let sum = 0;
  for (const p of g.propositions.values()) {
    sum += p.bules;
  }
  return sum;
}

/** Render the proof trace */
export function renderProof(g: ProofGoal): string {
  const lines: string[] = [];
  lines.push('Proof trace:');
  for (let i = 0; i < g.steps.length; i++) {
    const s = g.steps[i];
    lines.push(`  ${i + 1}. reject ${s.target}: "${s.reason}"`);
  }
  lines.push('');
  lines.push('Final state:');
  for (const [name, p] of g.propositions) {
    const status = p.bules === 0 ? '✓ proved' : `${p.bules} Bules remaining`;
    lines.push(`  ${name}: ${status}`);
    if (p.void.length > 0) {
      lines.push(`    void: [${p.void.join(', ')}]`);
    }
  }
  lines.push('');
  lines.push(g.complete ? 'QED (all propositions at ground state)' : `OPEN (${totalBules(g)} Bules remaining)`);
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Boolean embedding: Buleyean subsumes Boolean
// ---------------------------------------------------------------------------

/**
 * Boolean true = Buleyean 0 (ground state, proved).
 * Boolean false = Buleyean 1 (one Bule of deficit).
 *
 * This embedding proves that Boolean is the K=2 special case
 * of Buleyean after the void has fully converged.
 */
export function fromBoolean(name: string, value: boolean): Proposition {
  return prop(name, value ? 0 : 1);
}

export function toBoolean(p: Proposition): boolean {
  return p.bules === 0;
}

// ---------------------------------------------------------------------------
// The child's proof: learning by rejection
// ---------------------------------------------------------------------------

/**
 * Simulate a child's decision process as a Buleyean proof.
 *
 * The child faces K options.  Each option starts with Bule count 1
 * (one rejection away from being eliminated).  The child explores
 * options, rejects the ones that fail, and the fold fires when
 * exactly one option remains at Bule count 0 (not yet rejected)
 * while all others have been rejected (Bule count 0 via complement).
 *
 * Wait -- the logic is inverted for the child.  The child's "proof"
 * is not "this option is true" but "all other options are rejected."
 * The surviving option is proved by the complement.
 *
 * In Buleyean: the child starts with EXISTS(options) where each
 * option has Bule count 0 (all are candidates).  Through rejection,
 * all but one accumulate Bules.  The survivor has the minimum count.
 * EXISTS returns the minimum.  When only one has count 0, EXISTS = 0.
 * QED.
 */
export interface ChildDecision {
  readonly options: readonly string[];
  readonly rejections: readonly { option: string; reason: string }[];
  readonly survivor: string;
  readonly proof: string;
}

export function childDecides(
  options: readonly string[],
  rejections: readonly { option: string; reason: string }[]
): ChildDecision {
  // Start: all options are candidates (Bule count 0 = not rejected)
  const rejected = new Set<string>();
  const reasons = new Map<string, string>();

  for (const r of rejections) {
    rejected.add(r.option);
    reasons.set(r.option, r.reason);
  }

  const survivors = options.filter((o) => !rejected.has(o));
  const survivor = survivors.length > 0 ? survivors[0] : '(none)';

  const proofLines: string[] = [];
  proofLines.push(`Child faces ${options.length} options: [${options.join(', ')}]`);
  for (const r of rejections) {
    proofLines.push(`  reject "${r.option}": ${r.reason}`);
  }
  proofLines.push(`Survivor: "${survivor}" (not yet rejected)`);
  proofLines.push(`Proof: the void contains [${[...rejected].join(', ')}]`);
  proofLines.push(`The survivor is proved by the complement of the void.`);

  return {
    options,
    rejections,
    survivor,
    proof: proofLines.join('\n'),
  };
}
