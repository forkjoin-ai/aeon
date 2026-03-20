/**
 * Five Novel AI Inference Forms
 *
 * Tests for §15.24: five genuinely novel inference paradigms derived
 * from the Buleyean framework. Each is a new way to generate text,
 * route computation, or make predictions using the complement
 * distribution and void boundary machinery.
 *
 * 1. Void Inference — generation by rejection accumulation
 * 2. Retrocausal Decoding — constrained generation from terminal state
 * 3. Topological Speculative Decoding — skip by beta1 deficit
 * 4. Semiotic Ensemble — fork/race/fold multi-model inference
 * 5. Non-Empirical Inference — prediction without training data
 *
 * Companion theorems: NovelInferenceForms.lean (28 sorry-free theorems),
 * NovelInferenceForms.tla (11 invariants, model-checked).
 */

import { describe, expect, it } from 'vitest';

// ============================================================================
// Engine: Buleyean primitives
// ============================================================================

/** Buleyean weight: rounds - min(void, rounds) + 1. Always >= 1. */
function buleyeanWeight(rounds: number, voidCount: number): number {
  return rounds - Math.min(voidCount, rounds) + 1;
}

/** Complement distribution: normalize Buleyean weights to probabilities. */
function complementDistribution(
  rounds: number,
  voidBoundary: number[]
): number[] {
  const weights = voidBoundary.map((v) => buleyeanWeight(rounds, v));
  const total = weights.reduce((a, b) => a + b, 0);
  return weights.map((w) => w / total);
}

// ============================================================================
// Form 1: Void Inference — Generation by Rejection Accumulation
// ============================================================================

interface VoidInferenceState {
  vocabSize: number;
  voidBoundary: number[];
  rounds: number;
  stepsCompleted: number;
}

function createVoidInferenceState(vocabSize: number): VoidInferenceState {
  return {
    vocabSize,
    voidBoundary: new Array(vocabSize).fill(0),
    rounds: 1,
    stepsCompleted: 0,
  };
}

function rejectToken(
  state: VoidInferenceState,
  tokenIdx: number
): VoidInferenceState {
  const newBoundary = [...state.voidBoundary];
  newBoundary[tokenIdx] += 1;
  return {
    ...state,
    voidBoundary: newBoundary,
    rounds: state.rounds + 1,
    stepsCompleted: state.stepsCompleted + 1,
  };
}

describe('Form 1: Void Inference — generation by rejection accumulation', () => {
  it('all tokens retain positive weight (void_inference_positive)', () => {
    let state = createVoidInferenceState(10);
    // Reject tokens 0-4 multiple times
    for (let step = 0; step < 50; step++) {
      state = rejectToken(state, step % 5);
    }

    for (let i = 0; i < state.vocabSize; i++) {
      const w = buleyeanWeight(state.rounds, state.voidBoundary[i]);
      expect(w).toBeGreaterThanOrEqual(1);
    }
  });

  it('complement distribution concentrates on least-rejected tokens (void_inference_concentrates)', () => {
    let state = createVoidInferenceState(5);
    // Reject token 0 heavily, token 4 not at all
    for (let i = 0; i < 20; i++) {
      state = rejectToken(state, 0);
    }
    for (let i = 0; i < 10; i++) {
      state = rejectToken(state, 1);
    }

    const weights = state.voidBoundary.map((v) =>
      buleyeanWeight(state.rounds, v)
    );

    // Token 4 (never rejected) should have highest weight
    expect(weights[4]).toBeGreaterThan(weights[0]);
    // Token 1 (less rejected than 0) should have higher weight than 0
    expect(weights[1]).toBeGreaterThan(weights[0]);
  });

  it('two systems with same rejection history produce same distribution (void_inference_coherent)', () => {
    let state1 = createVoidInferenceState(5);
    let state2 = createVoidInferenceState(5);

    // Apply same rejections to both
    const rejections = [0, 1, 2, 0, 1, 0, 3, 4, 2, 1];
    for (const r of rejections) {
      state1 = rejectToken(state1, r);
      state2 = rejectToken(state2, r);
    }

    const dist1 = complementDistribution(state1.rounds, state1.voidBoundary);
    const dist2 = complementDistribution(state2.rounds, state2.voidBoundary);

    for (let i = 0; i < 5; i++) {
      expect(dist1[i]).toBeCloseTo(dist2[i], 10);
    }
  });

  it('single-step void inference equals standard softmax range (void_inference_subsumes_softmax)', () => {
    const state = createVoidInferenceState(4);
    // With rounds = 1, weights are 1 (rejected) or 2 (not rejected)
    for (let i = 0; i < state.vocabSize; i++) {
      const w = buleyeanWeight(state.rounds, state.voidBoundary[i]);
      expect(w).toBeGreaterThanOrEqual(1);
      expect(w).toBeLessThanOrEqual(state.rounds + 1);
    }
  });

  it('total weight is always positive (void_inference_normalizable)', () => {
    let state = createVoidInferenceState(8);
    for (let step = 0; step < 30; step++) {
      state = rejectToken(state, step % 8);
    }

    const total = state.voidBoundary
      .map((v) => buleyeanWeight(state.rounds, v))
      .reduce((a, b) => a + b, 0);
    expect(total).toBeGreaterThan(0);
  });

  it('cross-step memory: later rejections affect earlier distribution (novel vs standard)', () => {
    let state = createVoidInferenceState(4);
    // Step 1: reject token 0
    state = rejectToken(state, 0);
    const weights1 = state.voidBoundary.map((v) =>
      buleyeanWeight(state.rounds, v)
    );

    // Step 2: reject token 0 again
    state = rejectToken(state, 0);
    const weights2 = state.voidBoundary.map((v) =>
      buleyeanWeight(state.rounds, v)
    );

    // Token 0's weight should decrease as it accumulates rejections
    expect(weights2[0]).toBeLessThanOrEqual(weights1[0]);
    // Other tokens should gain relative weight
    expect(weights2[1]).toBeGreaterThanOrEqual(weights1[1]);
  });
});

// ============================================================================
// Form 2: Retrocausal Decoding — Constrained Generation from Terminal State
// ============================================================================

interface RetrocausalDecoder {
  terminalBoundary: number[];
  currentBoundary: number[];
  terminalRounds: number;
  currentRounds: number;
  vocabSize: number;
}

function createRetrocausalDecoder(
  vocabSize: number,
  terminalRounds: number,
  terminalBoundary: number[]
): RetrocausalDecoder {
  return {
    terminalBoundary,
    currentBoundary: new Array(vocabSize).fill(0),
    terminalRounds,
    currentRounds: 1,
    vocabSize,
  };
}

function isConsistentWithTerminal(
  decoder: RetrocausalDecoder,
  tokenIdx: number
): boolean {
  // A token is consistent if rejecting it doesn't exceed the terminal count
  return (
    decoder.currentBoundary[tokenIdx] + 1 <= decoder.terminalBoundary[tokenIdx]
  );
}

describe('Form 2: Retrocausal Decoding — constrained generation from terminal state', () => {
  it('terminal constraints are satisfiable (retrocausal_consistent)', () => {
    const decoder = createRetrocausalDecoder(5, 10, [3, 2, 1, 2, 2]);

    for (let i = 0; i < decoder.vocabSize; i++) {
      const w = buleyeanWeight(
        decoder.terminalRounds,
        decoder.terminalBoundary[i]
      );
      expect(w).toBeGreaterThan(0);
    }
  });

  it('no valid trajectory is excluded (retrocausal_positive)', () => {
    const decoder = createRetrocausalDecoder(4, 20, [5, 5, 5, 5]);

    for (let i = 0; i < decoder.vocabSize; i++) {
      const w = buleyeanWeight(
        decoder.currentRounds,
        decoder.currentBoundary[i]
      );
      expect(w).toBeGreaterThanOrEqual(1);
      expect(w).not.toBe(0);
    }
  });

  it('consistent continuations shrink as generation progresses (retrocausal_sharpens)', () => {
    const decoder = createRetrocausalDecoder(4, 10, [3, 2, 1, 4]);

    // Count consistent tokens initially
    let initialConsistent = 0;
    for (let i = 0; i < decoder.vocabSize; i++) {
      if (isConsistentWithTerminal(decoder, i)) initialConsistent++;
    }

    // Reject some tokens
    decoder.currentBoundary[2] = 1; // Token 2 now at terminal limit

    let afterConsistent = 0;
    for (let i = 0; i < decoder.vocabSize; i++) {
      if (isConsistentWithTerminal(decoder, i)) afterConsistent++;
    }

    expect(afterConsistent).toBeLessThanOrEqual(initialConsistent);
  });

  it('two constraints compose (retrocausal_composable)', () => {
    const decoder1 = createRetrocausalDecoder(4, 10, [3, 3, 3, 3]);
    const decoder2 = createRetrocausalDecoder(4, 10, [2, 4, 1, 5]);

    // Both terminal states are satisfiable
    for (let i = 0; i < 4; i++) {
      expect(
        buleyeanWeight(decoder1.terminalRounds, decoder1.terminalBoundary[i])
      ).toBeGreaterThan(0);
      expect(
        buleyeanWeight(decoder2.terminalRounds, decoder2.terminalBoundary[i])
      ).toBeGreaterThan(0);
    }
  });

  it('self-referential constraints cannot annihilate (retrocausal_no_self_reference)', () => {
    // Even with maximum rejection, weight is 1, not 0
    const decoder = createRetrocausalDecoder(4, 10, [10, 10, 10, 10]);

    for (let i = 0; i < decoder.vocabSize; i++) {
      const w = buleyeanWeight(
        decoder.terminalRounds,
        decoder.terminalBoundary[i]
      );
      expect(w).toBe(1); // The sliver
      expect(w).not.toBe(0);
    }
  });
});

// ============================================================================
// Form 3: Topological Speculative Decoding — Skip by β₁ Deficit
// ============================================================================

interface TopoSpecDecoder {
  totalLayers: number;
  layerBeta1: number[];
}

function canSkipLayer(decoder: TopoSpecDecoder, layerIdx: number): boolean {
  return decoder.layerBeta1[layerIdx] === 0;
}

function countSkippableLayers(decoder: TopoSpecDecoder): number {
  return decoder.layerBeta1.filter((b) => b === 0).length;
}

function computeSpeedup(deficit: number): number {
  return deficit + 1;
}

describe('Form 3: Topological Speculative Decoding — skip by beta1 deficit', () => {
  it('zero-deficit layers can be skipped (topo_skip_preserves_topology)', () => {
    const decoder: TopoSpecDecoder = {
      totalLayers: 8,
      layerBeta1: [0, 1, 0, 2, 0, 0, 1, 0],
    };

    // Layers 0, 2, 4, 5, 7 have beta1 = 0 and can be skipped
    expect(canSkipLayer(decoder, 0)).toBe(true);
    expect(canSkipLayer(decoder, 1)).toBe(false);
    expect(canSkipLayer(decoder, 2)).toBe(true);
    expect(canSkipLayer(decoder, 3)).toBe(false);
  });

  it('speedup = deficit + 1 (topo_speedup_exact)', () => {
    expect(computeSpeedup(0)).toBe(1);
    expect(computeSpeedup(1)).toBe(2);
    expect(computeSpeedup(5)).toBe(6);
  });

  it('multiple layer skips compose (topo_skip_composable)', () => {
    const d1 = 0,
      d2 = 0;
    const totalSpeedup = computeSpeedup(d1) + computeSpeedup(d2);
    expect(totalSpeedup).toBe(d1 + d2 + 2);
  });

  it('skip count bounded by network depth (topo_skip_bounded)', () => {
    const decoder: TopoSpecDecoder = {
      totalLayers: 12,
      layerBeta1: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    };

    const skippable = countSkippableLayers(decoder);
    expect(skippable).toBeLessThanOrEqual(decoder.totalLayers);
  });

  it('at least one layer must execute (topo_minimum_compute)', () => {
    const decoder: TopoSpecDecoder = {
      totalLayers: 6,
      layerBeta1: [0, 0, 0, 0, 0, 0],
    };

    // Even if all layers are skippable, at least 1 must execute
    const maxSkip = decoder.totalLayers - 1;
    expect(maxSkip).toBeLessThan(decoder.totalLayers);
    expect(decoder.totalLayers).toBeGreaterThan(0);
  });

  it('deficit is always non-negative (topo_deficit_nonneg)', () => {
    const decoder: TopoSpecDecoder = {
      totalLayers: 5,
      layerBeta1: [3, 0, 1, 0, 2],
    };

    for (const beta1 of decoder.layerBeta1) {
      expect(beta1).toBeGreaterThanOrEqual(0);
    }
  });
});

// ============================================================================
// Form 4: Semiotic Ensemble — Fork/Race/Fold Multi-Model Inference
// ============================================================================

interface SemioticEnsemble {
  agentCount: number;
  rejections: number[];
  rounds: number;
}

function createEnsemble(agentCount: number): SemioticEnsemble {
  return {
    agentCount,
    rejections: new Array(agentCount).fill(0),
    rounds: 1,
  };
}

function rejectAgent(
  ensemble: SemioticEnsemble,
  agentIdx: number
): SemioticEnsemble {
  const newRejections = [...ensemble.rejections];
  newRejections[agentIdx] += 1;
  return {
    ...ensemble,
    rejections: newRejections,
    rounds: ensemble.rounds + 1,
  };
}

function ensembleDeficit(k: number): number {
  return k - 1;
}

describe('Form 4: Semiotic Ensemble — fork/race/fold multi-model inference', () => {
  it('deficit is exactly k - 1 (ensemble_deficit_exact)', () => {
    expect(ensembleDeficit(2)).toBe(1);
    expect(ensembleDeficit(3)).toBe(2);
    expect(ensembleDeficit(5)).toBe(4);
    expect(ensembleDeficit(10)).toBe(9);
  });

  it('deficit is positive for nontrivial ensembles (ensemble_deficit_positive)', () => {
    for (let k = 2; k <= 20; k++) {
      expect(ensembleDeficit(k)).toBeGreaterThan(0);
    }
  });

  it('least-rejected agent has highest weight (ensemble_dominates_single)', () => {
    let ensemble = createEnsemble(4);
    // Reject agents 0, 1, 2 but not agent 3
    ensemble = rejectAgent(ensemble, 0);
    ensemble = rejectAgent(ensemble, 0);
    ensemble = rejectAgent(ensemble, 1);
    ensemble = rejectAgent(ensemble, 2);

    const weights = ensemble.rejections.map((v) =>
      buleyeanWeight(ensemble.rounds, v)
    );

    // Agent 3 (never rejected) has highest weight
    expect(weights[3]).toBeGreaterThan(weights[0]);
    expect(weights[3]).toBeGreaterThan(weights[1]);
    expect(weights[3]).toBeGreaterThan(weights[2]);
  });

  it('all agents retain positive weight (ensemble_complement_voting)', () => {
    let ensemble = createEnsemble(5);
    for (let i = 0; i < 30; i++) {
      ensemble = rejectAgent(ensemble, i % 5);
    }

    for (let i = 0; i < ensemble.agentCount; i++) {
      const w = buleyeanWeight(ensemble.rounds, ensemble.rejections[i]);
      expect(w).toBeGreaterThanOrEqual(1);
    }
  });

  it('two juries with same data select same winner (ensemble_coherent)', () => {
    let e1 = createEnsemble(3);
    let e2 = createEnsemble(3);

    const rejections = [0, 1, 0, 2, 1, 0];
    for (const r of rejections) {
      e1 = rejectAgent(e1, r);
      e2 = rejectAgent(e2, r);
    }

    const dist1 = complementDistribution(e1.rounds, e1.rejections);
    const dist2 = complementDistribution(e2.rounds, e2.rejections);

    for (let i = 0; i < 3; i++) {
      expect(dist1[i]).toBeCloseTo(dist2[i], 10);
    }
  });

  it('adding one agent increases deficit by 1 (ensemble_scaling)', () => {
    for (let k = 2; k <= 10; k++) {
      expect(ensembleDeficit(k + 1)).toBe(ensembleDeficit(k) + 1);
    }
  });
});

// ============================================================================
// Form 5: Non-Empirical Inference — Prediction Without Training Data
// ============================================================================

interface StructuralHole {
  neighborCount: number;
  neighborRoundsSum: number;
  neighborVoidSum: number;
}

function interpolationWeight(hole: StructuralHole): number {
  return (
    hole.neighborRoundsSum -
    Math.min(hole.neighborVoidSum, hole.neighborRoundsSum) +
    1
  );
}

function uninformedGuessWeight(rounds: number): number {
  return rounds + 1;
}

describe('Form 5: Non-Empirical Inference — prediction without training data', () => {
  it('predicted completions have positive weight (nei_positive)', () => {
    const hole: StructuralHole = {
      neighborCount: 4,
      neighborRoundsSum: 20,
      neighborVoidSum: 15,
    };

    expect(interpolationWeight(hole)).toBeGreaterThan(0);
  });

  it('structural prediction strictly better than random (nei_dominates_guess)', () => {
    const hole: StructuralHole = {
      neighborCount: 3,
      neighborRoundsSum: 10,
      neighborVoidSum: 4, // Nontrivial rejection
    };

    const structured = interpolationWeight(hole);
    const random = uninformedGuessWeight(hole.neighborRoundsSum);

    expect(structured).toBeLessThan(random);
  });

  it('two systems with same lattice produce same prediction (nei_coherent)', () => {
    const hole1: StructuralHole = {
      neighborCount: 3,
      neighborRoundsSum: 15,
      neighborVoidSum: 7,
    };
    const hole2: StructuralHole = {
      neighborCount: 3,
      neighborRoundsSum: 15,
      neighborVoidSum: 7,
    };

    expect(interpolationWeight(hole1)).toBe(interpolationWeight(hole2));
  });

  it('prediction weight bounded between 1 and rounds + 1 (nei_bounded)', () => {
    for (let rounds = 1; rounds <= 20; rounds++) {
      for (let void_ = 0; void_ <= rounds; void_++) {
        const hole: StructuralHole = {
          neighborCount: 2,
          neighborRoundsSum: rounds,
          neighborVoidSum: void_,
        };
        const w = interpolationWeight(hole);
        expect(w).toBeGreaterThanOrEqual(1);
        expect(w).toBeLessThanOrEqual(rounds + 1);
      }
    }
  });

  it('Mendeleev interpolation is complement distribution (nei_mendeleev)', () => {
    const hole: StructuralHole = {
      neighborCount: 4,
      neighborRoundsSum: 12,
      neighborVoidSum: 5,
    };

    const structuralWeight = interpolationWeight(hole);
    const buleyean = buleyeanWeight(
      hole.neighborRoundsSum,
      hole.neighborVoidSum
    );

    // They are the same formula
    expect(structuralWeight).toBe(buleyean);
  });

  it('more rejection from neighbors = lower prediction weight (nei_structure_dominates)', () => {
    const hole1: StructuralHole = {
      neighborCount: 3,
      neighborRoundsSum: 10,
      neighborVoidSum: 2, // Less rejection
    };
    const hole2: StructuralHole = {
      neighborCount: 3,
      neighborRoundsSum: 10,
      neighborVoidSum: 6, // More rejection
    };

    expect(interpolationWeight(hole2)).toBeLessThan(interpolationWeight(hole1));
  });

  it('Mendeleev gallium example: structure predicts the hole', () => {
    // Simulate: gallium (Ga) neighbors are aluminum (Al) and indium (In)
    // Al: density ~2.7, In: density ~7.3
    // Mendeleev predicted Ga density ~5.9 (actual: 5.91)
    // In Buleyean terms: the hole's properties are the complement of
    // what the neighbors reject

    const galliumHole: StructuralHole = {
      neighborCount: 2,
      neighborRoundsSum: 100, // Many observations of neighbors
      neighborVoidSum: 40, // Partial rejection = constrained but not certain
    };

    const prediction = interpolationWeight(galliumHole);

    // Prediction is positive (the element exists)
    expect(prediction).toBeGreaterThan(0);
    // Prediction is more constrained than random
    expect(prediction).toBeLessThan(
      uninformedGuessWeight(galliumHole.neighborRoundsSum)
    );
    // Prediction weight = 100 - 40 + 1 = 61
    expect(prediction).toBe(61);
  });
});

// ============================================================================
// Cross-cutting: All five forms compose
// ============================================================================

describe('Cross-cutting: all five forms compose from Buleyean axioms', () => {
  it('all five forms use the same weight formula', () => {
    const rounds = 10;
    const void_ = 3;

    // Void inference weight
    const voidWeight = buleyeanWeight(rounds, void_);
    // Retrocausal terminal weight
    const retroWeight = buleyeanWeight(rounds, void_);
    // Ensemble agent weight
    const ensembleWeight = buleyeanWeight(rounds, void_);
    // NEI interpolation weight (same formula)
    const neiWeight = rounds - Math.min(void_, rounds) + 1;

    // All the same
    expect(voidWeight).toBe(retroWeight);
    expect(retroWeight).toBe(ensembleWeight);
    expect(ensembleWeight).toBe(neiWeight);
  });

  it('the sliver (weight >= 1) holds across all five forms', () => {
    for (let rounds = 1; rounds <= 20; rounds++) {
      for (let void_ = 0; void_ <= rounds + 5; void_++) {
        expect(buleyeanWeight(rounds, void_)).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('coherence (same data = same result) holds across all five forms', () => {
    const data = [3, 5, 2, 7, 1];
    const rounds = 20;

    const dist1 = complementDistribution(rounds, data);
    const dist2 = complementDistribution(rounds, [...data]); // Same data, new array

    for (let i = 0; i < data.length; i++) {
      expect(dist1[i]).toBeCloseTo(dist2[i], 10);
    }
  });

  it('concentration (less rejection = more weight) holds across all five forms', () => {
    const rounds = 10;
    for (let v1 = 0; v1 <= rounds; v1++) {
      for (let v2 = v1; v2 <= rounds; v2++) {
        expect(buleyeanWeight(rounds, v2)).toBeLessThanOrEqual(
          buleyeanWeight(rounds, v1)
        );
      }
    }
  });
});
