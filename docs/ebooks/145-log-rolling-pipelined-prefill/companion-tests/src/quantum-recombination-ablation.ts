export interface Complex {
  readonly re: number;
  readonly im: number;
}

type Kernel2 = readonly [readonly [Complex, Complex], readonly [Complex, Complex]];

export interface InvariantProfile {
  readonly preservesKernelAgreement: boolean;
  readonly preservesPartitionAdditivity: boolean;
  readonly preservesOrderInvariance: boolean;
  readonly preservesCancellation: boolean;
}

export interface InvariantDistances {
  readonly kernelAgreementDistance: number;
  readonly partitionAdditivityDistance: number;
  readonly orderInvarianceDistance: number;
  readonly cancellationMagnitude2: number;
}

export interface FoldStrategy {
  readonly name: 'linear' | 'winner-take-all' | 'early-stop';
  readonly fold: (amplitudes: readonly Complex[]) => Complex;
}

export interface StrategyReport {
  readonly profile: InvariantProfile;
  readonly distances: InvariantDistances;
}

export interface QuantumRecombinationAblationReport {
  readonly label: 'quantum-recombination-ablation-v1';
  readonly tolerance: number;
  readonly strategies: Record<FoldStrategy['name'], StrategyReport>;
  readonly predictedLossMatrixMatches: boolean;
}

function cAdd(a: Complex, b: Complex): Complex {
  return { re: a.re + b.re, im: a.im + b.im };
}

function cMul(a: Complex, b: Complex): Complex {
  return {
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re,
  };
}

function cMag2(value: Complex): number {
  return value.re * value.re + value.im * value.im;
}

function cDistance(a: Complex, b: Complex): number {
  return Math.hypot(a.re - b.re, a.im - b.im);
}

function enumeratePathAmplitudes(
  kernel: Kernel2,
  startNode: 0 | 1,
  endNode: 0 | 1,
  steps: number,
): Complex[] {
  const amplitudes: Complex[] = [];

  function recurse(currentNode: 0 | 1, remaining: number, amplitude: Complex): void {
    if (remaining === 0) {
      if (currentNode === endNode) {
        amplitudes.push(amplitude);
      }
      return;
    }

    recurse(0, remaining - 1, cMul(kernel[0][currentNode], amplitude));
    recurse(1, remaining - 1, cMul(kernel[1][currentNode], amplitude));
  }

  recurse(startNode, steps, { re: 1, im: 0 });
  return amplitudes;
}

function enumeratePathSum(
  kernel: Kernel2,
  startNode: 0 | 1,
  endNode: 0 | 1,
  steps: number,
): Complex {
  return enumeratePathAmplitudes(kernel, startNode, endNode, steps).reduce<Complex>(
    (acc, amplitude) => cAdd(acc, amplitude),
    { re: 0, im: 0 },
  );
}

export function linearFold(amplitudes: readonly Complex[]): Complex {
  return amplitudes.reduce<Complex>((acc, next) => cAdd(acc, next), { re: 0, im: 0 });
}

export function winnerTakeAllFold(amplitudes: readonly Complex[]): Complex {
  const firstAmplitude = amplitudes[0];
  if (firstAmplitude === undefined) {
    throw new Error('winnerTakeAllFold requires at least one amplitude');
  }

  let best = firstAmplitude;
  let bestMag2 = cMag2(best);

  for (let i = 1; i < amplitudes.length; i++) {
    const candidate = amplitudes[i];
    const candidateMag2 = cMag2(candidate);
    if (candidateMag2 > bestMag2) {
      best = candidate;
      bestMag2 = candidateMag2;
    }
  }

  return best;
}

export function earlyStopFold(amplitudes: readonly Complex[]): Complex {
  const firstAmplitude = amplitudes[0];
  if (firstAmplitude === undefined) {
    throw new Error('earlyStopFold requires at least one amplitude');
  }
  return firstAmplitude;
}

const foldStrategies: readonly FoldStrategy[] = [
  { name: 'linear', fold: linearFold },
  { name: 'winner-take-all', fold: winnerTakeAllFold },
  { name: 'early-stop', fold: earlyStopFold },
];

const expectedProfiles: Record<FoldStrategy['name'], InvariantProfile> = {
  linear: {
    preservesKernelAgreement: true,
    preservesPartitionAdditivity: true,
    preservesOrderInvariance: true,
    preservesCancellation: true,
  },
  'winner-take-all': {
    preservesKernelAgreement: false,
    preservesPartitionAdditivity: false,
    preservesOrderInvariance: false,
    preservesCancellation: false,
  },
  'early-stop': {
    preservesKernelAgreement: false,
    preservesPartitionAdditivity: false,
    preservesOrderInvariance: false,
    preservesCancellation: false,
  },
};

function buildStrategyReport(strategy: FoldStrategy, tolerance: number): StrategyReport {
  const invSqrt2 = 1 / Math.sqrt(2);
  const hadamardKernel: Kernel2 = [
    [{ re: invSqrt2, im: 0 }, { re: invSqrt2, im: 0 }],
    [{ re: invSqrt2, im: 0 }, { re: -invSqrt2, im: 0 }],
  ];

  const kernelPaths = enumeratePathAmplitudes(hadamardKernel, 0, 0, 3);
  const kernelExpected = enumeratePathSum(hadamardKernel, 0, 0, 3);
  const kernelActual = strategy.fold(kernelPaths);

  const partitionWitness: readonly Complex[] = [
    { re: 2, im: 0 },
    { re: 1, im: 0 },
    { re: -2, im: 0 },
  ];
  const partitionA = partitionWitness.slice(0, 2);
  const partitionB = partitionWitness.slice(2);
  const partitionCombined = cAdd(strategy.fold(partitionA), strategy.fold(partitionB));

  const orderForward: readonly Complex[] = [{ re: 1, im: 0 }, { re: -1, im: 0 }];
  const orderReversed: readonly Complex[] = [{ re: -1, im: 0 }, { re: 1, im: 0 }];
  const cancellationWitness: readonly Complex[] = [{ re: 1, im: 0 }, { re: -1, im: 0 }];

  const distances: InvariantDistances = {
    kernelAgreementDistance: cDistance(kernelActual, kernelExpected),
    partitionAdditivityDistance: cDistance(strategy.fold(partitionWitness), partitionCombined),
    orderInvarianceDistance: cDistance(strategy.fold(orderForward), strategy.fold(orderReversed)),
    cancellationMagnitude2: cMag2(strategy.fold(cancellationWitness)),
  };

  return {
    profile: {
      preservesKernelAgreement: distances.kernelAgreementDistance <= tolerance,
      preservesPartitionAdditivity: distances.partitionAdditivityDistance <= tolerance,
      preservesOrderInvariance: distances.orderInvarianceDistance <= tolerance,
      preservesCancellation: distances.cancellationMagnitude2 <= tolerance,
    },
    distances,
  };
}

export function runQuantumRecombinationAblation(
  tolerance = 1e-10,
): QuantumRecombinationAblationReport {
  const strategies = Object.fromEntries(
    foldStrategies.map((strategy) => [strategy.name, buildStrategyReport(strategy, tolerance)]),
  ) as Record<FoldStrategy['name'], StrategyReport>;

  const predictedLossMatrixMatches = foldStrategies.every(
    (strategy) =>
      JSON.stringify(strategies[strategy.name].profile) ===
      JSON.stringify(expectedProfiles[strategy.name]),
  );

  return {
    label: 'quantum-recombination-ablation-v1',
    tolerance,
    strategies,
    predictedLossMatrixMatches,
  };
}

function formatBoolean(value: boolean): string {
  return value ? 'yes' : 'no';
}

function formatDistance(value: number): string {
  return value.toExponential(3);
}

export function renderQuantumRecombinationAblationMarkdown(
  report: QuantumRecombinationAblationReport,
): string {
  const lines: string[] = [];
  lines.push('# Quantum Recombination Ablation');
  lines.push('');
  lines.push(`- Label: \`${report.label}\``);
  lines.push(`- Tolerance: \`${report.tolerance}\``);
  lines.push(`- Predicted loss matrix recovered: \`${report.predictedLossMatrixMatches ? 'yes' : 'no'}\``);
  lines.push('');
  lines.push('## Invariant Matrix');
  lines.push('');
  lines.push('| Strategy | Kernel agreement | Partition additivity | Order invariance | Cancellation |');
  lines.push('|---|---:|---:|---:|---:|');

  for (const strategyName of Object.keys(report.strategies) as FoldStrategy['name'][]) {
    const profile = report.strategies[strategyName].profile;
    lines.push(
      `| \`${strategyName}\` | ${formatBoolean(profile.preservesKernelAgreement)} | ${formatBoolean(profile.preservesPartitionAdditivity)} | ${formatBoolean(profile.preservesOrderInvariance)} | ${formatBoolean(profile.preservesCancellation)} |`,
    );
  }

  lines.push('');
  lines.push('## Distances');
  lines.push('');
  lines.push('| Strategy | Kernel distance | Partition distance | Order distance | Cancellation magnitude² |');
  lines.push('|---|---:|---:|---:|---:|');

  for (const strategyName of Object.keys(report.strategies) as FoldStrategy['name'][]) {
    const distances = report.strategies[strategyName].distances;
    lines.push(
      `| \`${strategyName}\` | ${formatDistance(distances.kernelAgreementDistance)} | ${formatDistance(distances.partitionAdditivityDistance)} | ${formatDistance(distances.orderInvarianceDistance)} | ${formatDistance(distances.cancellationMagnitude2)} |`,
    );
  }

  lines.push('');
  lines.push('Interpretation: hold the path family fixed, then swap only the recombination rule. Linear fold preserves the path-sum invariants; winner-take-all and early-stop do not.');
  lines.push('');

  return `${lines.join('\n')}\n`;
}
