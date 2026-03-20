export interface ReadinessInputs {
  mapIndependence: number; // I_map
  reduceAssociativity: number; // A_reduce
  keySkew: number; // S_key
  zeroCopyRatio: number; // Z_copy
  intrinsicBeta1: number; // beta1*
  implementationBeta1: number; // beta1
}

export interface ReadinessScores {
  qMr: number;
  oBeta: number;
  rQr: number;
}

export function clamp01(value: number): number {
  if (Number.isNaN(value)) {
    return 0;
  }
  return Math.max(0, Math.min(1, value));
}

export function makeRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

export function mean(values: readonly number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function linearRegressionSlope(
  x: readonly number[],
  y: readonly number[]
): number {
  const xBar = mean(x);
  const yBar = mean(y);
  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < x.length; i++) {
    const dx = x[i] - xBar;
    numerator += dx * (y[i] - yBar);
    denominator += dx * dx;
  }
  return denominator === 0 ? 0 : numerator / denominator;
}

export function pearsonCorrelation(
  x: readonly number[],
  y: readonly number[]
): number {
  const xBar = mean(x);
  const yBar = mean(y);
  let covariance = 0;
  let xVariance = 0;
  let yVariance = 0;

  for (let i = 0; i < x.length; i++) {
    const dx = x[i] - xBar;
    const dy = y[i] - yBar;
    covariance += dx * dy;
    xVariance += dx * dx;
    yVariance += dy * dy;
  }

  const denom = Math.sqrt(xVariance * yVariance);
  return denom === 0 ? 0 : covariance / denom;
}

export function computeReadinessScores(
  inputs: ReadinessInputs
): ReadinessScores {
  const mapIndependence = clamp01(inputs.mapIndependence);
  const reduceAssociativity = clamp01(inputs.reduceAssociativity);
  const keySkew = clamp01(inputs.keySkew);
  const zeroCopyRatio = clamp01(inputs.zeroCopyRatio);

  const intrinsicBeta1 = Math.max(0, inputs.intrinsicBeta1);
  const implementationBeta1 = Math.max(0, inputs.implementationBeta1);
  const deficit = Math.max(0, intrinsicBeta1 - implementationBeta1);
  const oBeta = clamp01(deficit / Math.max(1, intrinsicBeta1));

  const qMr = clamp01(
    mapIndependence * reduceAssociativity * (1 - keySkew) * zeroCopyRatio
  );

  return {
    qMr,
    oBeta,
    rQr: clamp01(qMr * oBeta),
  };
}

export function simulatePromotionGain(
  inputs: ReadinessInputs,
  rng: () => number
): number {
  const mapIndependence = clamp01(inputs.mapIndependence);
  const reduceAssociativity = clamp01(inputs.reduceAssociativity);
  const keySkew = clamp01(inputs.keySkew);
  const zeroCopyRatio = clamp01(inputs.zeroCopyRatio);

  const intrinsicBeta1 = Math.max(0, inputs.intrinsicBeta1);
  const implementationBeta1 = Math.max(0, inputs.implementationBeta1);
  const deficit = Math.max(0, intrinsicBeta1 - implementationBeta1);
  const opportunity = clamp01(deficit / Math.max(1, intrinsicBeta1));
  const migrationQuality =
    mapIndependence * reduceAssociativity * (1 - keySkew) * zeroCopyRatio;

  // Baseline map/reduce runtime model (no explicit race/vent semantics).
  const baselineParallelism = Math.max(1, 1 + implementationBeta1);
  const mapWork = 120;
  const reduceWork = 60;
  const skewPenalty = 1 + 1.8 * keySkew * keySkew;
  const dependencePenalty = 1 / (0.35 + 0.65 * mapIndependence);
  const reducerPenalty = 1 + 1.4 * (1 - reduceAssociativity);
  const serializationTax = 36 * (1 - zeroCopyRatio);

  const baselineTime =
    (mapWork * skewPenalty * dependencePenalty) / baselineParallelism +
    reduceWork * reducerPenalty +
    serializationTax +
    5;

  // Promotion model: race/vent benefits appear only when opportunity exists.
  const promotedParallelism =
    baselineParallelism + deficit * (0.25 + 0.75 * migrationQuality);
  const raceBenefit = 1 - 0.5 * opportunity * migrationQuality;
  const ventBenefit = 1 - 0.6 * opportunity * migrationQuality;
  const promotedReducerPenalty =
    1 +
    (1 - reduceAssociativity) * (1.25 - 0.95 * opportunity * migrationQuality);
  const coordinationOverhead =
    4 + 8 * (1 - mapIndependence) + 6 * (1 - reduceAssociativity);

  const promotedTime =
    ((mapWork * skewPenalty) / Math.max(1, promotedParallelism)) * raceBenefit +
    reduceWork * promotedReducerPenalty +
    serializationTax * ventBenefit +
    coordinationOverhead;

  // Independent bounded noise from deployment/runtime variance.
  const jitter = 1 + (rng() - 0.5) * 0.05;
  const observedGain = (baselineTime - promotedTime * jitter) / baselineTime;
  return clamp01(observedGain);
}
