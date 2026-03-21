/**
 * ch17-netflix-void-walker.ts
 *
 * A void-walking recommendation strategy that demonstrates the limit
 * of monoculture by construction.
 *
 * The strategy:
 *   1. Fork: generate predictions from K diverse algorithm families
 *   2. Race: evaluate each prediction against the user's actual rating
 *   3. Fold: select the best prediction
 *   4. Vent: record the rejected predictions in the void boundary
 *
 * The void boundary -- the complement distribution over accumulated
 * rejection history -- learns which algorithm families fail for which
 * user-taste profiles.  Over time, the walker discovers the intrinsic
 * topology of the taste space: users whose taste vectors are orthogonal
 * to a family's latent factors accumulate in that family's void.
 *
 * The key demonstration:
 *   - Run each algorithm family as a monoculture (d=1) and measure RMSE
 *   - Run the void-walking ensemble (d=K) and measure RMSE
 *   - The gap between the best monoculture and the ensemble is the
 *     pigeonhole witness: proof that no single family covers the full
 *     taste space
 *   - The void boundary's entropy at convergence estimates beta_1*:
 *     the number of algorithmically distinct dimensions in taste space
 *
 * This uses synthetic data that faithfully models the Netflix Prize's
 * published statistical properties.  No actual Netflix data is used.
 */

// ---------------------------------------------------------------------------
// Synthetic taste-space model
// ---------------------------------------------------------------------------

/**
 * A user's taste is a point in a K-dimensional latent factor space.
 * Each dimension represents an orthogonal taste axis (e.g., "action
 * intensity", "romantic complexity", "visual style").
 */
export interface UserTaste {
  readonly id: number;
  readonly factors: readonly number[];
}

/**
 * A movie's profile is also a point in the same K-dimensional space.
 */
export interface MovieProfile {
  readonly id: number;
  readonly factors: readonly number[];
}

/**
 * An algorithm family is characterized by which taste dimensions it
 * can "see".  A family with visibility [true, true, false, false]
 * can model dimensions 0 and 1 but is blind to dimensions 2 and 3.
 *
 * This models the real Netflix Prize finding: SVD captures global
 * latent factors but misses local neighborhood structure.  k-NN
 * captures local structure but misses global trends.  RBMs capture
 * nonlinear interactions that both miss.  Each family has a different
 * "field of view" in taste space.
 */
export interface AlgorithmFamily {
  readonly name: string;
  readonly shortLabel: string;
  /** Which dimensions of the taste space this family can model */
  readonly visibility: readonly boolean[];
  /** Noise floor for this family's predictions (models imperfect learning) */
  readonly noiseStd: number;
}

/**
 * A rating observation: user u rated movie m with rating r.
 */
export interface Rating {
  readonly userId: number;
  readonly movieId: number;
  readonly actual: number;
}

/**
 * Seeded PRNG for reproducibility (xorshift32).
 */
export class SeededRNG {
  private state: number;

  constructor(seed: number) {
    this.state = seed | 0 || 1;
  }

  next(): number {
    let x = this.state;
    x ^= x << 13;
    x ^= x >> 17;
    x ^= x << 5;
    this.state = x;
    return (x >>> 0) / 0xffffffff;
  }

  gaussian(): number {
    // Box-Muller
    const u1 = this.next();
    const u2 = this.next();
    return Math.sqrt(-2 * Math.log(u1 + 1e-10)) * Math.cos(2 * Math.PI * u2);
  }
}

// ---------------------------------------------------------------------------
// Data generation
// ---------------------------------------------------------------------------

export interface SyntheticDataset {
  readonly users: readonly UserTaste[];
  readonly movies: readonly MovieProfile[];
  readonly ratings: readonly Rating[];
  readonly latentDims: number;
}

/**
 * Generate a synthetic dataset that models the Netflix Prize's
 * statistical properties.
 *
 * @param latentDims Number of latent taste dimensions (the true beta_1*)
 * @param userCount Number of users
 * @param movieCount Number of movies
 * @param ratingsPerUser Average ratings per user
 * @param seed PRNG seed for reproducibility
 */
export function generateDataset(
  latentDims: number,
  userCount: number,
  movieCount: number,
  ratingsPerUser: number,
  seed: number
): SyntheticDataset {
  const rng = new SeededRNG(seed);

  const users: UserTaste[] = [];
  for (let i = 0; i < userCount; i++) {
    const factors: number[] = [];
    for (let d = 0; d < latentDims; d++) {
      factors.push(rng.gaussian());
    }
    users.push({ id: i, factors });
  }

  const movies: MovieProfile[] = [];
  for (let i = 0; i < movieCount; i++) {
    const factors: number[] = [];
    for (let d = 0; d < latentDims; d++) {
      factors.push(rng.gaussian());
    }
    movies.push({ id: i, factors });
  }

  const ratings: Rating[] = [];
  for (const user of users) {
    const count = Math.max(
      1,
      Math.round(ratingsPerUser + rng.gaussian() * ratingsPerUser * 0.3)
    );
    for (let r = 0; r < count; r++) {
      const movieIdx = Math.floor(rng.next() * movieCount);
      const movie = movies[movieIdx];
      // True rating = dot product + noise, clamped to [1, 5]
      let trueScore = 3; // baseline
      for (let d = 0; d < latentDims; d++) {
        trueScore += user.factors[d] * movie.factors[d] * 0.5;
      }
      trueScore += rng.gaussian() * 0.3; // irreducible noise
      const actual = Math.max(1, Math.min(5, Math.round(trueScore * 2) / 2));
      ratings.push({ userId: user.id, movieId: movie.id, actual });
    }
  }

  return { users, movies, ratings, latentDims };
}

// ---------------------------------------------------------------------------
// Algorithm families
// ---------------------------------------------------------------------------

/**
 * Create algorithm families for a given number of latent dimensions.
 * Each family can "see" a subset of the dimensions, modelling the
 * real-world situation where SVD, k-NN, RBM, etc. each capture
 * different aspects of user taste.
 */
export function createFamilies(latentDims: number): AlgorithmFamily[] {
  const families: AlgorithmFamily[] = [];

  // Family 0: "Global MF" -- sees the first ceil(K/2) dimensions
  // Models SVD-like approaches that capture major latent factors
  const globalVis = Array.from({ length: latentDims }, (_, i) =>
    i < Math.ceil(latentDims / 2)
  );
  families.push({
    name: 'Global MF (like SVD)',
    shortLabel: 'MF',
    visibility: globalVis,
    noiseStd: 0.15,
  });

  // Family 1: "Local Neighborhood" -- sees the last ceil(K/2) dimensions
  // Models k-NN-like approaches that capture local taste structure
  const localVis = Array.from({ length: latentDims }, (_, i) =>
    i >= Math.floor(latentDims / 2)
  );
  families.push({
    name: 'Local Neighborhood (like k-NN)',
    shortLabel: 'kNN',
    visibility: localVis,
    noiseStd: 0.18,
  });

  // Family 2: "Nonlinear" -- sees even dimensions
  // Models RBM-like approaches that capture nonlinear interactions
  const nonlinVis = Array.from(
    { length: latentDims },
    (_, i) => i % 2 === 0
  );
  families.push({
    name: 'Nonlinear (like RBM)',
    shortLabel: 'RBM',
    visibility: nonlinVis,
    noiseStd: 0.2,
  });

  // Family 3: "Temporal" -- sees odd dimensions
  // Models temporal-dynamics approaches
  const tempVis = Array.from(
    { length: latentDims },
    (_, i) => i % 2 === 1
  );
  families.push({
    name: 'Temporal (like timeSVD++)',
    shortLabel: 'tSVD',
    visibility: tempVis,
    noiseStd: 0.17,
  });

  // Family 4: "Factored" -- sees dims 0, 2, 4, ...
  // Models NNMF-like non-negative approaches
  if (latentDims >= 5) {
    const facVis = Array.from(
      { length: latentDims },
      (_, i) => i % 3 === 0
    );
    families.push({
      name: 'Factored (like NNMF)',
      shortLabel: 'NNMF',
      visibility: facVis,
      noiseStd: 0.22,
    });
  }

  return families;
}

// ---------------------------------------------------------------------------
// Prediction
// ---------------------------------------------------------------------------

/**
 * Predict a rating using a given algorithm family.
 * The family can only "see" the dimensions in its visibility mask.
 * Dimensions it can't see contribute zero to the prediction.
 */
export function predict(
  user: UserTaste,
  movie: MovieProfile,
  family: AlgorithmFamily,
  rng: SeededRNG
): number {
  let score = 3; // baseline
  for (let d = 0; d < user.factors.length; d++) {
    if (family.visibility[d]) {
      score += user.factors[d] * movie.factors[d] * 0.5;
    }
  }
  score += rng.gaussian() * family.noiseStd;
  return Math.max(1, Math.min(5, score));
}

// ---------------------------------------------------------------------------
// Void walker
// ---------------------------------------------------------------------------

/**
 * The void boundary: accumulated rejection counts per family.
 * The complement distribution softmax(-eta * vents) converts
 * rejection history into a sampling/weighting distribution.
 */
export interface VoidBoundary {
  /** Per-family vent count (how many times this family lost the race) */
  readonly ventCounts: number[];
  /** Total folds (races completed) */
  readonly foldCount: number;
  /** The eta parameter (temperature of the complement distribution) */
  readonly eta: number;
}

export function createVoidBoundary(
  familyCount: number,
  eta: number
): VoidBoundary {
  return {
    ventCounts: new Array(familyCount).fill(0),
    foldCount: 0,
    eta,
  };
}

/**
 * Compute the complement distribution: softmax(-eta * v_i).
 * Higher vent count → lower weight.  Families that fail more
 * get suppressed.
 */
export function complementDistribution(boundary: VoidBoundary): number[] {
  const logits = boundary.ventCounts.map((v) => -boundary.eta * v);
  const maxLogit = Math.max(...logits);
  const exps = logits.map((l) => Math.exp(l - maxLogit));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}

/**
 * Shannon entropy of the complement distribution.
 * High entropy = uniform = no family dominates the void.
 * Low entropy = peaked = one family clearly worse than others.
 */
export function voidEntropy(boundary: VoidBoundary): number {
  const dist = complementDistribution(boundary);
  let h = 0;
  for (const p of dist) {
    if (p > 1e-10) {
      h -= p * Math.log2(p);
    }
  }
  return h;
}

// ---------------------------------------------------------------------------
// Racing strategies
// ---------------------------------------------------------------------------

export interface RaceResult {
  readonly winnerIndex: number;
  readonly winnerPrediction: number;
  readonly predictions: readonly number[];
  readonly errors: readonly number[];
}

/**
 * Race all families on a single rating.  The winner is the family
 * whose prediction has the lowest absolute error.
 */
export function raceFamilies(
  user: UserTaste,
  movie: MovieProfile,
  actual: number,
  families: readonly AlgorithmFamily[],
  rng: SeededRNG
): RaceResult {
  const predictions: number[] = [];
  const errors: number[] = [];

  for (const family of families) {
    const pred = predict(user, movie, family, rng);
    predictions.push(pred);
    errors.push(Math.abs(pred - actual));
  }

  let winnerIndex = 0;
  for (let i = 1; i < errors.length; i++) {
    if (errors[i] < errors[winnerIndex]) {
      winnerIndex = i;
    }
  }

  return { winnerIndex, winnerPrediction: predictions[winnerIndex], predictions, errors };
}

/**
 * Void-walking ensemble: race families, fold to winner, vent losers
 * into the void boundary.  Weight predictions by the complement
 * distribution for the blended prediction.
 */
export function voidWalkingPredict(
  user: UserTaste,
  movie: MovieProfile,
  families: readonly AlgorithmFamily[],
  boundary: VoidBoundary,
  rng: SeededRNG
): { prediction: number; raceResult: RaceResult } {
  const race = raceFamilies(user, movie, 3, families, rng); // actual=3 placeholder

  // Weighted blend using complement distribution
  const weights = complementDistribution(boundary);
  let weightedSum = 0;
  let weightTotal = 0;
  for (let i = 0; i < families.length; i++) {
    const pred = predict(user, movie, families[i], rng);
    weightedSum += weights[i] * pred;
    weightTotal += weights[i];
  }
  const prediction = weightedSum / weightTotal;

  return { prediction, raceResult: race };
}

/**
 * Update the void boundary after observing the actual rating.
 * All families that lost (higher error than winner) get a vent.
 */
export function updateVoid(
  boundary: VoidBoundary,
  raceResult: RaceResult
): VoidBoundary {
  const newVents = [...boundary.ventCounts];
  for (let i = 0; i < raceResult.errors.length; i++) {
    if (i !== raceResult.winnerIndex) {
      newVents[i]++;
    }
  }
  return {
    ventCounts: newVents,
    foldCount: boundary.foldCount + 1,
    eta: boundary.eta,
  };
}

// ---------------------------------------------------------------------------
// Evaluation
// ---------------------------------------------------------------------------

export interface EvalResult {
  readonly strategyName: string;
  readonly rmse: number;
  readonly ratingCount: number;
}

export interface VoidWalkerEvalResult extends EvalResult {
  readonly finalBoundary: VoidBoundary;
  readonly finalEntropy: number;
  readonly winShareByFamily: readonly number[];
}

/**
 * Evaluate a monoculture strategy (single algorithm family).
 */
export function evalMonoculture(
  dataset: SyntheticDataset,
  family: AlgorithmFamily,
  seed: number
): EvalResult {
  const rng = new SeededRNG(seed);
  let sse = 0;
  const userMap = new Map(dataset.users.map((u) => [u.id, u]));
  const movieMap = new Map(dataset.movies.map((m) => [m.id, m]));

  for (const rating of dataset.ratings) {
    const user = userMap.get(rating.userId)!;
    const movie = movieMap.get(rating.movieId)!;
    const pred = predict(user, movie, family, rng);
    const err = pred - rating.actual;
    sse += err * err;
  }

  return {
    strategyName: `Monoculture: ${family.name}`,
    rmse: Math.sqrt(sse / dataset.ratings.length),
    ratingCount: dataset.ratings.length,
  };
}

/**
 * Evaluate the void-walking ensemble strategy.
 */
export function evalVoidWalker(
  dataset: SyntheticDataset,
  families: readonly AlgorithmFamily[],
  eta: number,
  seed: number
): VoidWalkerEvalResult {
  const rng = new SeededRNG(seed);
  let boundary = createVoidBoundary(families.length, eta);
  let sse = 0;
  const winCounts = new Array(families.length).fill(0);
  const userMap = new Map(dataset.users.map((u) => [u.id, u]));
  const movieMap = new Map(dataset.movies.map((m) => [m.id, m]));

  for (const rating of dataset.ratings) {
    const user = userMap.get(rating.userId)!;
    const movie = movieMap.get(rating.movieId)!;

    // Get predictions from all families
    const predictions: number[] = [];
    const errors: number[] = [];
    for (const family of families) {
      const pred = predict(user, movie, family, rng);
      predictions.push(pred);
      errors.push(Math.abs(pred - rating.actual));
    }

    // Race: find winner
    let winnerIndex = 0;
    for (let i = 1; i < errors.length; i++) {
      if (errors[i] < errors[winnerIndex]) {
        winnerIndex = i;
      }
    }
    winCounts[winnerIndex]++;

    // Blend using complement distribution
    const weights = complementDistribution(boundary);
    let weightedSum = 0;
    let weightTotal = 0;
    for (let i = 0; i < families.length; i++) {
      weightedSum += weights[i] * predictions[i];
      weightTotal += weights[i];
    }
    const blended = weightedSum / weightTotal;

    const err = blended - rating.actual;
    sse += err * err;

    // Update void: all losers get vented
    const raceResult: RaceResult = {
      winnerIndex,
      winnerPrediction: predictions[winnerIndex],
      predictions,
      errors,
    };
    boundary = updateVoid(boundary, raceResult);
  }

  const totalWins = winCounts.reduce((a: number, b: number) => a + b, 0);
  const winShareByFamily = winCounts.map(
    (c: number) => (totalWins > 0 ? c / totalWins : 0)
  );

  return {
    strategyName: `Void Walker (${families.length} families, η=${eta})`,
    rmse: Math.sqrt(sse / dataset.ratings.length),
    ratingCount: dataset.ratings.length,
    finalBoundary: boundary,
    finalEntropy: voidEntropy(boundary),
    winShareByFamily,
  };
}

// ---------------------------------------------------------------------------
// Oracle strategies: time-traveling through the void
// ---------------------------------------------------------------------------

/**
 * Oracle Strategy 1: Void-Designed Optimal Monoculture
 *
 * Use the converged void boundary to design the single best algorithm
 * family.  The void tells us per-family win rates, so we extract
 * which dimensions matter most and construct a visibility mask that
 * maximizes coverage.  This is "time travel": the void walked the
 * future, learned what fails, and we use that knowledge to design
 * the optimal single strategy retroactively.
 *
 * The visibility mask is the union of visible dimensions from the
 * top-performing families (weighted by complement distribution).
 */
export function designOracleMonoculture(
  families: readonly AlgorithmFamily[],
  boundary: VoidBoundary,
  latentDims: number
): AlgorithmFamily {
  const weights = complementDistribution(boundary);

  // Score each dimension by how much total weight sees it
  const dimScores: number[] = new Array(latentDims).fill(0);
  for (let f = 0; f < families.length; f++) {
    for (let d = 0; d < latentDims; d++) {
      if (families[f].visibility[d]) {
        dimScores[d] += weights[f];
      }
    }
  }

  // Pick the top ceil(K * 0.6) dimensions (a single model can't
  // maintain accuracy across all dims simultaneously)
  const maxVisible = Math.ceil(latentDims * 0.6);
  const ranked = dimScores
    .map((score, idx) => ({ idx, score }))
    .sort((a, b) => b.score - a.score);
  const topDims = new Set(ranked.slice(0, maxVisible).map((d) => d.idx));

  const visibility = Array.from(
    { length: latentDims },
    (_, i) => topDims.has(i)
  );

  // Use the best family's noise level (optimistic)
  const bestFamilyIdx = weights.indexOf(Math.max(...weights));
  const noiseStd = families[bestFamilyIdx].noiseStd;

  return {
    name: 'Void-Designed Oracle (time-traveled)',
    shortLabel: 'Oracle',
    visibility,
    noiseStd,
  };
}

/**
 * Oracle Strategy 2: Full-Visibility God-Mode
 *
 * A model that sees ALL dimensions -- no blind spots.  This is
 * impossible in practice (no real algorithm perfectly captures every
 * aspect of user taste), but it establishes the theoretical ceiling
 * for monoculture: even with perfect coverage, a single model's
 * prediction noise is not reduced by averaging across diverse models.
 */
export function createGodModeMonoculture(
  latentDims: number
): AlgorithmFamily {
  return {
    name: 'God-Mode (all dimensions visible)',
    shortLabel: 'God',
    visibility: new Array(latentDims).fill(true),
    noiseStd: 0.15, // same as best family
  };
}

/**
 * Oracle Strategy 3: Per-Rating Oracle Routing
 *
 * For each rating, pick whichever family had the lowest error.
 * This is the information-theoretic upper bound on what any routing
 * strategy can achieve with the given family set.  It requires
 * knowing the actual rating (true omniscience).
 *
 * Crucially: this is NOT a monoculture.  It uses a DIFFERENT family
 * for each rating.  It is the ceiling of diversity, not the ceiling
 * of monoculture.  The fact that this beats monoculture proves
 * that diversity is necessary to reach the ceiling.
 */
export function evalOraclePerRatingRouting(
  dataset: SyntheticDataset,
  families: readonly AlgorithmFamily[],
  seed: number
): EvalResult & { readonly perFamilySelections: readonly number[] } {
  const rng = new SeededRNG(seed);
  let sse = 0;
  const selections = new Array(families.length).fill(0);
  const userMap = new Map(dataset.users.map((u) => [u.id, u]));
  const movieMap = new Map(dataset.movies.map((m) => [m.id, m]));

  for (const rating of dataset.ratings) {
    const user = userMap.get(rating.userId)!;
    const movie = movieMap.get(rating.movieId)!;

    let bestErr = Infinity;
    let bestPred = 3;
    let bestIdx = 0;

    for (let i = 0; i < families.length; i++) {
      const pred = predict(user, movie, families[i], rng);
      const err = Math.abs(pred - rating.actual);
      if (err < bestErr) {
        bestErr = err;
        bestPred = pred;
        bestIdx = i;
      }
    }

    selections[bestIdx]++;
    const sqErr = (bestPred - rating.actual) ** 2;
    sse += sqErr;
  }

  return {
    strategyName: 'Oracle Per-Rating Routing (omniscient)',
    rmse: Math.sqrt(sse / dataset.ratings.length),
    ratingCount: dataset.ratings.length,
    perFamilySelections: selections,
  };
}

export interface OracleResult {
  /** The void-designed optimal monoculture */
  readonly voidDesignedOracle: EvalResult;
  /** The god-mode all-dimensions monoculture */
  readonly godModeOracle: EvalResult;
  /** The per-rating omniscient routing (diversity ceiling) */
  readonly perRatingOracle: EvalResult & {
    readonly perFamilySelections: readonly number[];
  };
  /** The void-walking ensemble (for comparison) */
  readonly ensemble: VoidWalkerEvalResult;
  /** The best naive monoculture (for comparison) */
  readonly bestNaiveMonoculture: EvalResult;

  /** Gaps: each oracle vs ensemble */
  readonly gaps: {
    /** void-designed oracle RMSE - ensemble RMSE */
    readonly voidDesignedVsEnsemble: number;
    /** god-mode oracle RMSE - ensemble RMSE */
    readonly godModeVsEnsemble: number;
    /** per-rating oracle RMSE - ensemble RMSE (may be negative!) */
    readonly perRatingVsEnsemble: number;
    /** best naive monoculture RMSE - ensemble RMSE */
    readonly naiveVsEnsemble: number;
  };

  /** Proof claims */
  readonly proofs: {
    /** Even the void-designed oracle cannot beat the ensemble */
    readonly voidOracleCannotBeatEnsemble: boolean;
    /**
     * God-mode beats the ensemble -- but it requires seeing all
     * dimensions simultaneously, which is physically unrealizable.
     * No single algorithm family can model every aspect of user taste.
     * This is the realization gap: the monoculture that beats diversity
     * requires solving the problem you're trying to solve.
     */
    readonly godModeBeatsEnsembleButUnrealizable: boolean;
    /** God-mode still loses to per-rating oracle (even omniscience has noise) */
    readonly godModeLosesToDiversityCeiling: boolean;
    /** The per-rating oracle IS a diversity strategy (beats monoculture) */
    readonly perRatingOracleIsDiversity: boolean;
    /** The per-rating oracle beats or matches the ensemble */
    readonly perRatingOracleIsCeiling: boolean;
  };
}

export function runOracleExperiment(
  latentDims: number = 8,
  userCount: number = 500,
  movieCount: number = 200,
  ratingsPerUser: number = 40,
  eta: number = 0.01,
  seed: number = 42
): OracleResult {
  const dataset = generateDataset(
    latentDims,
    userCount,
    movieCount,
    ratingsPerUser,
    seed
  );
  const families = createFamilies(latentDims);

  // Step 1: Run the void walker to get the converged boundary
  const ensemble = evalVoidWalker(dataset, families, eta, seed + 100);

  // Step 2: Use the void boundary to design the optimal monoculture
  const oracleFamily = designOracleMonoculture(
    families,
    ensemble.finalBoundary,
    latentDims
  );
  const voidDesignedOracle = evalMonoculture(dataset, oracleFamily, seed + 200);

  // Step 3: Create the god-mode monoculture (all dims visible)
  const godFamily = createGodModeMonoculture(latentDims);
  const godModeOracle = evalMonoculture(dataset, godFamily, seed + 300);

  // Step 4: Run per-rating oracle routing (omniscient diversity)
  const perRatingOracle = evalOraclePerRatingRouting(
    dataset,
    families,
    seed + 400
  );

  // Step 5: Find the best naive monoculture for comparison
  let bestNaive: EvalResult = { strategyName: '', rmse: Infinity, ratingCount: 0 };
  for (let i = 0; i < families.length; i++) {
    const result = evalMonoculture(dataset, families[i], seed + i + 1);
    if (result.rmse < bestNaive.rmse) {
      bestNaive = result;
    }
  }

  return {
    voidDesignedOracle,
    godModeOracle,
    perRatingOracle,
    ensemble,
    bestNaiveMonoculture: bestNaive,
    gaps: {
      voidDesignedVsEnsemble: voidDesignedOracle.rmse - ensemble.rmse,
      godModeVsEnsemble: godModeOracle.rmse - ensemble.rmse,
      perRatingVsEnsemble: perRatingOracle.rmse - ensemble.rmse,
      naiveVsEnsemble: bestNaive.rmse - ensemble.rmse,
    },
    proofs: {
      voidOracleCannotBeatEnsemble:
        voidDesignedOracle.rmse > ensemble.rmse,
      godModeBeatsEnsembleButUnrealizable:
        godModeOracle.rmse < ensemble.rmse,
      godModeLosesToDiversityCeiling:
        godModeOracle.rmse > perRatingOracle.rmse,
      perRatingOracleIsDiversity:
        perRatingOracle.rmse < bestNaive.rmse,
      perRatingOracleIsCeiling:
        perRatingOracle.rmse <= ensemble.rmse,
    },
  };
}

// ---------------------------------------------------------------------------
// Full experiment: monoculture limit demonstration
// ---------------------------------------------------------------------------

export interface MonocultureLimitExperiment {
  readonly label: 'ch17-netflix-void-walker-v1';
  readonly latentDims: number;
  readonly userCount: number;
  readonly movieCount: number;
  readonly ratingCount: number;
  readonly familyCount: number;

  /** Per-family monoculture RMSE */
  readonly monocultureResults: readonly EvalResult[];
  /** Best monoculture RMSE */
  readonly bestMonocultureRmse: number;
  /** Void-walking ensemble RMSE */
  readonly voidWalkerResult: VoidWalkerEvalResult;

  /** The gap: monoculture waste that the ensemble eliminates */
  readonly monocultureGap: number;
  /** Win share per family (which families are useful where) */
  readonly winShares: readonly { name: string; share: number }[];

  /** THM-AMERICAN-FRONTIER properties on synthetic data */
  readonly frontierProperties: {
    /** Ensemble beats best monoculture */
    readonly ensembleBeatsBestMonoculture: boolean;
    /** All monocultures have positive waste vs ensemble */
    readonly allMonoculturePositiveWaste: boolean;
    /** Win shares are non-degenerate (no family wins everything) */
    readonly nonDegenerateWinShares: boolean;
    /** Void entropy is submaximal (the void learned structure) */
    readonly voidLearnedStructure: boolean;
  };
}

export function runMonocultureLimitExperiment(
  latentDims: number = 8,
  userCount: number = 500,
  movieCount: number = 200,
  ratingsPerUser: number = 40,
  eta: number = 0.01,
  seed: number = 42
): MonocultureLimitExperiment {
  const dataset = generateDataset(
    latentDims,
    userCount,
    movieCount,
    ratingsPerUser,
    seed
  );
  const families = createFamilies(latentDims);

  // Evaluate each monoculture
  const monocultureResults: EvalResult[] = [];
  for (let i = 0; i < families.length; i++) {
    monocultureResults.push(evalMonoculture(dataset, families[i], seed + i + 1));
  }

  const bestMonocultureRmse = Math.min(
    ...monocultureResults.map((r) => r.rmse)
  );

  // Evaluate void-walking ensemble
  const voidWalkerResult = evalVoidWalker(dataset, families, eta, seed + 100);

  const monocultureGap = bestMonocultureRmse - voidWalkerResult.rmse;

  const winShares = families.map((f, i) => ({
    name: f.shortLabel,
    share: voidWalkerResult.winShareByFamily[i],
  }));

  // Check frontier properties
  const maxEntropy = Math.log2(families.length);
  const ensembleBeatsBestMonoculture =
    voidWalkerResult.rmse < bestMonocultureRmse;
  const allMonoculturePositiveWaste = monocultureResults.every(
    (r) => r.rmse > voidWalkerResult.rmse
  );
  const nonDegenerateWinShares = winShares.every(
    (ws) => ws.share > 0.05 && ws.share < 0.6
  );
  const voidLearnedStructure =
    voidWalkerResult.finalEntropy < maxEntropy * 0.99;

  return {
    label: 'ch17-netflix-void-walker-v1',
    latentDims,
    userCount,
    movieCount,
    ratingCount: dataset.ratings.length,
    familyCount: families.length,
    monocultureResults,
    bestMonocultureRmse,
    voidWalkerResult,
    monocultureGap,
    winShares,
    frontierProperties: {
      ensembleBeatsBestMonoculture,
      allMonoculturePositiveWaste,
      nonDegenerateWinShares,
      voidLearnedStructure,
    },
  };
}
