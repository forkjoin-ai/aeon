type StrategyName = 'linear' | 'winner-take-all' | 'early-stop';

export interface QuantumRecombinationAblationFigureInput {
  readonly label: string;
  readonly strategies: Record<
    StrategyName,
    {
      readonly profile: {
        readonly preservesKernelAgreement: boolean;
        readonly preservesPartitionAdditivity: boolean;
        readonly preservesOrderInvariance: boolean;
        readonly preservesCancellation: boolean;
      };
      readonly distances: {
        readonly kernelAgreementDistance: number;
        readonly partitionAdditivityDistance: number;
        readonly orderInvarianceDistance: number;
        readonly cancellationMagnitude2: number;
      };
    }
  >;
}

export interface ToyAttentionFoldAblationFigureInput {
  readonly label: string;
  readonly strategies: Record<
    StrategyName,
    {
      readonly meanSquaredError: number;
      readonly exactWithinToleranceFraction: number;
    }
  >;
}

export interface GnosisFoldTrainingBenchmarkFigureInput {
  readonly label: string;
  readonly strategies: Record<
    StrategyName,
    {
      readonly meanEvalMeanSquaredError: number;
      readonly meanExactWithinToleranceFraction: number;
      readonly meanCancellationLineMeanAbsoluteError: number;
    }
  >;
}

export interface Ch17CorrespondenceBoundaryFigureReport {
  readonly label: 'ch17-correspondence-boundary-figure-v1';
  readonly sources: {
    readonly quantumLabel: string;
    readonly toyAttentionLabel: string;
    readonly gnosisTrainingLabel: string;
  };
  readonly quantum: {
    readonly matrix: Record<
      StrategyName,
      {
        readonly kernelAgreement: boolean;
        readonly partitionAdditivity: boolean;
        readonly orderInvariance: boolean;
        readonly cancellation: boolean;
      }
    >;
    readonly winnerTakeAllKernelDistance: number;
    readonly winnerTakeAllPartitionDistance: number;
    readonly winnerTakeAllCancellationMagnitude2: number;
  };
  readonly toyAttention: {
    readonly mse: Record<StrategyName, number>;
    readonly exactFraction: Record<StrategyName, number>;
  };
  readonly gnosisTraining: {
    readonly evalMse: Record<StrategyName, number>;
    readonly exactFraction: Record<StrategyName, number>;
    readonly cancellationLineAbsError: Record<StrategyName, number>;
  };
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function formatNumber(value: number): string {
  return value.toFixed(3);
}

function strategyColor(strategy: StrategyName): string {
  if (strategy === 'linear') {
    return '#0f766e';
  }
  if (strategy === 'winner-take-all') {
    return '#c2410c';
  }
  return '#991b1b';
}

function barHeight(value: number, maxValue: number, maxHeight: number): number {
  if (maxValue <= 0) {
    return 0;
  }
  return (value / maxValue) * maxHeight;
}

export function buildCh17CorrespondenceBoundaryFigureReport(
  quantum: QuantumRecombinationAblationFigureInput,
  toyAttention: ToyAttentionFoldAblationFigureInput,
  gnosisTraining: GnosisFoldTrainingBenchmarkFigureInput,
): Ch17CorrespondenceBoundaryFigureReport {
  return {
    label: 'ch17-correspondence-boundary-figure-v1',
    sources: {
      quantumLabel: quantum.label,
      toyAttentionLabel: toyAttention.label,
      gnosisTrainingLabel: gnosisTraining.label,
    },
    quantum: {
      matrix: {
        linear: {
          kernelAgreement: quantum.strategies.linear.profile.preservesKernelAgreement,
          partitionAdditivity: quantum.strategies.linear.profile.preservesPartitionAdditivity,
          orderInvariance: quantum.strategies.linear.profile.preservesOrderInvariance,
          cancellation: quantum.strategies.linear.profile.preservesCancellation,
        },
        'winner-take-all': {
          kernelAgreement: quantum.strategies['winner-take-all'].profile.preservesKernelAgreement,
          partitionAdditivity:
            quantum.strategies['winner-take-all'].profile.preservesPartitionAdditivity,
          orderInvariance: quantum.strategies['winner-take-all'].profile.preservesOrderInvariance,
          cancellation: quantum.strategies['winner-take-all'].profile.preservesCancellation,
        },
        'early-stop': {
          kernelAgreement: quantum.strategies['early-stop'].profile.preservesKernelAgreement,
          partitionAdditivity: quantum.strategies['early-stop'].profile.preservesPartitionAdditivity,
          orderInvariance: quantum.strategies['early-stop'].profile.preservesOrderInvariance,
          cancellation: quantum.strategies['early-stop'].profile.preservesCancellation,
        },
      },
      winnerTakeAllKernelDistance:
        quantum.strategies['winner-take-all'].distances.kernelAgreementDistance,
      winnerTakeAllPartitionDistance:
        quantum.strategies['winner-take-all'].distances.partitionAdditivityDistance,
      winnerTakeAllCancellationMagnitude2:
        quantum.strategies['winner-take-all'].distances.cancellationMagnitude2,
    },
    toyAttention: {
      mse: {
        linear: toyAttention.strategies.linear.meanSquaredError,
        'winner-take-all': toyAttention.strategies['winner-take-all'].meanSquaredError,
        'early-stop': toyAttention.strategies['early-stop'].meanSquaredError,
      },
      exactFraction: {
        linear: toyAttention.strategies.linear.exactWithinToleranceFraction,
        'winner-take-all':
          toyAttention.strategies['winner-take-all'].exactWithinToleranceFraction,
        'early-stop': toyAttention.strategies['early-stop'].exactWithinToleranceFraction,
      },
    },
    gnosisTraining: {
      evalMse: {
        linear: gnosisTraining.strategies.linear.meanEvalMeanSquaredError,
        'winner-take-all':
          gnosisTraining.strategies['winner-take-all'].meanEvalMeanSquaredError,
        'early-stop': gnosisTraining.strategies['early-stop'].meanEvalMeanSquaredError,
      },
      exactFraction: {
        linear: gnosisTraining.strategies.linear.meanExactWithinToleranceFraction,
        'winner-take-all':
          gnosisTraining.strategies['winner-take-all'].meanExactWithinToleranceFraction,
        'early-stop': gnosisTraining.strategies['early-stop'].meanExactWithinToleranceFraction,
      },
      cancellationLineAbsError: {
        linear: gnosisTraining.strategies.linear.meanCancellationLineMeanAbsoluteError,
        'winner-take-all':
          gnosisTraining.strategies['winner-take-all'].meanCancellationLineMeanAbsoluteError,
        'early-stop':
          gnosisTraining.strategies['early-stop'].meanCancellationLineMeanAbsoluteError,
      },
    },
  };
}

export function renderCh17CorrespondenceBoundaryFigureMarkdown(
  report: Ch17CorrespondenceBoundaryFigureReport,
): string {
  const lines: string[] = [];
  lines.push('# Chapter 17 Correspondence Boundary Figure');
  lines.push('');
  lines.push(`- Label: \`${report.label}\``);
  lines.push(`- Quantum source: \`${report.sources.quantumLabel}\``);
  lines.push(`- Toy-attention source: \`${report.sources.toyAttentionLabel}\``);
  lines.push(`- Gnosis training source: \`${report.sources.gnosisTrainingLabel}\``);
  lines.push('');
  lines.push('## Quantum Matrix');
  lines.push('');
  lines.push('| Strategy | Kernel | Partition | Order | Cancellation |');
  lines.push('|---|---:|---:|---:|---:|');

  for (const strategy of ['linear', 'winner-take-all', 'early-stop'] as StrategyName[]) {
    const row = report.quantum.matrix[strategy];
    lines.push(
      `| \`${strategy}\` | ${row.kernelAgreement ? 'yes' : 'no'} | ${row.partitionAdditivity ? 'yes' : 'no'} | ${row.orderInvariance ? 'yes' : 'no'} | ${row.cancellation ? 'yes' : 'no'} |`,
    );
  }

  lines.push('');
  lines.push('## Behavioral Metrics');
  lines.push('');
  lines.push('| Strategy | Toy attention MSE | Gnosis eval MSE | Gnosis cancellation-line abs error |');
  lines.push('|---|---:|---:|---:|');
  for (const strategy of ['linear', 'winner-take-all', 'early-stop'] as StrategyName[]) {
    lines.push(
      `| \`${strategy}\` | ${formatNumber(report.toyAttention.mse[strategy])} | ${formatNumber(report.gnosisTraining.evalMse[strategy])} | ${formatNumber(report.gnosisTraining.cancellationLineAbsError[strategy])} |`,
    );
  }

  lines.push('');
  lines.push(
    'Interpretation: the invariant boundary, fixed-parameter toy attention, and seeded Gnosis training benchmark all agree on the same ranking. Linear recombination preserves cancellation and learned behavior; nonlinear selection does not.',
  );
  lines.push('');
  return `${lines.join('\n')}\n`;
}

export function renderCh17CorrespondenceBoundaryFigureSvg(
  report: Ch17CorrespondenceBoundaryFigureReport,
): string {
  const toyMax = Math.max(...Object.values(report.toyAttention.mse));
  const trainingMax = Math.max(...Object.values(report.gnosisTraining.evalMse));
  const trainingCancelMax = Math.max(...Object.values(report.gnosisTraining.cancellationLineAbsError));
  const maxBarHeight = 120;
  const matrixHeaders = ['Kernel', 'Partition', 'Order', 'Cancel'];
  const strategies: StrategyName[] = ['linear', 'winner-take-all', 'early-stop'];
  const svg: string[] = [];

  svg.push('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="760" viewBox="0 0 1200 760" role="img" aria-labelledby="title desc">');
  svg.push('<title id="title">Chapter 17 correspondence boundary figure</title>');
  svg.push('<desc id="desc">Invariant matrix, toy-attention error chart, and seeded Gnosis training benchmark chart for the linear versus nonlinear fold boundary.</desc>');
  svg.push('<defs>');
  svg.push('<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">');
  svg.push('<stop offset="0%" stop-color="#f7f3e8"/>');
  svg.push('<stop offset="100%" stop-color="#fffdf8"/>');
  svg.push('</linearGradient>');
  svg.push('</defs>');
  svg.push('<rect width="1200" height="760" fill="url(#bg)" rx="24"/>');
  svg.push('<text x="52" y="56" font-family="Georgia, serif" font-size="28" fill="#111827">Chapter 17 Correspondence Boundary</text>');
  svg.push('<text x="52" y="84" font-family="Georgia, serif" font-size="14" fill="#4b5563">Invariant boundary, fixed-parameter toy attention, and seeded Gnosis training benchmark</text>');

  svg.push('<rect x="40" y="120" width="500" height="270" rx="20" fill="#fffaf0" stroke="#d6d3d1"/>');
  svg.push('<text x="64" y="156" font-family="Georgia, serif" font-size="22" fill="#111827">Invariant Loss Matrix</text>');
  svg.push('<text x="64" y="180" font-family="Georgia, serif" font-size="13" fill="#57534e">Same path family, fold rule swapped</text>');

  for (let index = 0; index < matrixHeaders.length; index++) {
    svg.push(
      `<text x="${180 + index * 78}" y="220" font-family="ui-monospace, SFMono-Regular, monospace" font-size="12" fill="#6b7280">${escapeXml(
        matrixHeaders[index]!,
      )}</text>`,
    );
  }

  strategies.forEach((strategy, rowIndex) => {
    const row = report.quantum.matrix[strategy];
    svg.push(
      `<text x="64" y="${260 + rowIndex * 56}" font-family="ui-monospace, SFMono-Regular, monospace" font-size="13" fill="#111827">${escapeXml(
        strategy,
      )}</text>`,
    );
    const values = [
      row.kernelAgreement,
      row.partitionAdditivity,
      row.orderInvariance,
      row.cancellation,
    ];
    values.forEach((value, columnIndex) => {
      const fill = value ? '#0f766e' : '#b91c1c';
      const label = value ? 'yes' : 'no';
      const x = 164 + columnIndex * 78;
      const y = 236 + rowIndex * 56;
      svg.push(`<rect x="${x}" y="${y}" width="58" height="30" rx="10" fill="${fill}" opacity="0.92"/>`);
      svg.push(
        `<text x="${x + 29}" y="${y + 20}" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, monospace" font-size="12" fill="#f8fafc">${label}</text>`,
      );
    });
  });

  svg.push(
    `<text x="64" y="342" font-family="ui-monospace, SFMono-Regular, monospace" font-size="12" fill="#6b7280">winner-take-all distances: kernel ${formatNumber(
      report.quantum.winnerTakeAllKernelDistance,
    )}, partition ${formatNumber(report.quantum.winnerTakeAllPartitionDistance)}, cancellation ${formatNumber(
      report.quantum.winnerTakeAllCancellationMagnitude2,
    )}</text>`,
  );

  svg.push('<rect x="580" y="120" width="580" height="270" rx="20" fill="#fffaf0" stroke="#d6d3d1"/>');
  svg.push('<text x="604" y="156" font-family="Georgia, serif" font-size="22" fill="#111827">Toy Attention Error</text>');
  svg.push('<text x="604" y="180" font-family="Georgia, serif" font-size="13" fill="#57534e">Fixed keys, values, score function, and query grid</text>');
  svg.push('<line x1="630" y1="330" x2="1120" y2="330" stroke="#9ca3af" stroke-width="1"/>');

  strategies.forEach((strategy, index) => {
    const value = report.toyAttention.mse[strategy];
    const height = barHeight(value, toyMax, maxBarHeight);
    const x = 668 + index * 150;
    const y = 330 - height;
    svg.push(`<rect x="${x}" y="${y}" width="68" height="${height}" rx="12" fill="${strategyColor(strategy)}"/>`);
    svg.push(
      `<text x="${x + 34}" y="356" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, monospace" font-size="12" fill="#111827">${escapeXml(
        strategy,
      )}</text>`,
    );
    svg.push(
      `<text x="${x + 34}" y="${y - 10}" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, monospace" font-size="12" fill="#374151">${formatNumber(
        value,
      )}</text>`,
    );
    svg.push(
      `<text x="${x + 34}" y="376" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, monospace" font-size="11" fill="#6b7280">exact ${formatNumber(
        report.toyAttention.exactFraction[strategy],
      )}</text>`,
    );
  });

  svg.push('<rect x="40" y="430" width="1120" height="290" rx="20" fill="#fffaf0" stroke="#d6d3d1"/>');
  svg.push('<text x="64" y="468" font-family="Georgia, serif" font-size="22" fill="#111827">Seeded Gnosis Training Benchmark</text>');
  svg.push('<text x="64" y="492" font-family="Georgia, serif" font-size="13" fill="#57534e">Same topology, same 4 parameters, same data; only the FOLD strategy changes</text>');
  svg.push('<line x1="90" y1="658" x2="520" y2="658" stroke="#9ca3af" stroke-width="1"/>');
  svg.push('<line x1="700" y1="658" x2="1090" y2="658" stroke="#9ca3af" stroke-width="1"/>');
  svg.push('<text x="92" y="524" font-family="ui-monospace, SFMono-Regular, monospace" font-size="13" fill="#374151">Eval MSE</text>');
  svg.push('<text x="702" y="524" font-family="ui-monospace, SFMono-Regular, monospace" font-size="13" fill="#374151">Cancellation-line abs error</text>');

  strategies.forEach((strategy, index) => {
    const mseValue = report.gnosisTraining.evalMse[strategy];
    const mseHeight = barHeight(mseValue, trainingMax, maxBarHeight);
    const mseX = 128 + index * 132;
    const mseY = 658 - mseHeight;
    svg.push(`<rect x="${mseX}" y="${mseY}" width="72" height="${mseHeight}" rx="12" fill="${strategyColor(strategy)}"/>`);
    svg.push(
      `<text x="${mseX + 36}" y="684" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, monospace" font-size="12" fill="#111827">${escapeXml(
        strategy,
      )}</text>`,
    );
    svg.push(
      `<text x="${mseX + 36}" y="${mseY - 10}" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, monospace" font-size="12" fill="#374151">${formatNumber(
        mseValue,
      )}</text>`,
    );
    svg.push(
      `<text x="${mseX + 36}" y="704" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, monospace" font-size="11" fill="#6b7280">exact ${formatNumber(
        report.gnosisTraining.exactFraction[strategy],
      )}</text>`,
    );

    const cancelValue = report.gnosisTraining.cancellationLineAbsError[strategy];
    const cancelHeight = barHeight(cancelValue, trainingCancelMax, maxBarHeight);
    const cancelX = 744 + index * 112;
    const cancelY = 658 - cancelHeight;
    svg.push(`<rect x="${cancelX}" y="${cancelY}" width="72" height="${cancelHeight}" rx="12" fill="${strategyColor(strategy)}"/>`);
    svg.push(
      `<text x="${cancelX + 36}" y="684" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, monospace" font-size="12" fill="#111827">${escapeXml(
        strategy,
      )}</text>`,
    );
    svg.push(
      `<text x="${cancelX + 36}" y="${cancelY - 10}" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, monospace" font-size="12" fill="#374151">${formatNumber(
        cancelValue,
      )}</text>`,
    );
  });

  svg.push('</svg>');
  return `${svg.join('')}\n`;
}
