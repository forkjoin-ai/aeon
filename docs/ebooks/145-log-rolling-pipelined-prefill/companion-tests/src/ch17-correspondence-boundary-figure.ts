type StrategyName = 'linear' | 'winner-take-all' | 'early-stop';

interface Interval {
  readonly low: number;
  readonly high: number;
}

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
      readonly meanSquaredErrorCi95: Interval;
      readonly exactWithinToleranceFraction: number;
      readonly exactWithinToleranceFractionCi95: Interval;
    }
  >;
}

export interface GnosisFoldTrainingBenchmarkFigureInput {
  readonly label: string;
  readonly strategies: Record<
    StrategyName,
    {
      readonly meanEvalMeanSquaredError: number;
      readonly evalMeanSquaredErrorCi95: Interval;
      readonly meanExactWithinToleranceFraction: number;
      readonly exactWithinToleranceFractionCi95: Interval;
      readonly meanCancellationLineMeanAbsoluteError: number;
      readonly cancellationLineMeanAbsoluteErrorCi95: Interval;
    }
  >;
}

export interface GnosisMiniMoeRoutingBenchmarkFigureInput {
  readonly label: string;
  readonly strategies: Record<
    StrategyName,
    {
      readonly meanEvalMeanSquaredError: number;
      readonly evalMeanSquaredErrorCi95: Interval;
      readonly meanExactWithinToleranceFraction: number;
      readonly exactWithinToleranceFractionCi95: Interval;
      readonly meanDualActiveRegionMeanAbsoluteError: number;
      readonly dualActiveRegionMeanAbsoluteErrorCi95: Interval;
    }
  >;
}

export interface Ch17CorrespondenceBoundaryFigureReport {
  readonly label: 'ch17-correspondence-boundary-figure-v2';
  readonly sources: {
    readonly quantumLabel: string;
    readonly toyAttentionLabel: string;
    readonly gnosisTrainingLabel: string;
    readonly gnosisMiniMoeLabel: string;
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
    readonly mseCi95: Record<StrategyName, Interval>;
    readonly exactFraction: Record<StrategyName, number>;
  };
  readonly gnosisTraining: {
    readonly evalMse: Record<StrategyName, number>;
    readonly evalMseCi95: Record<StrategyName, Interval>;
    readonly exactFraction: Record<StrategyName, number>;
    readonly cancellationLineAbsError: Record<StrategyName, number>;
  };
  readonly gnosisMiniMoe: {
    readonly evalMse: Record<StrategyName, number>;
    readonly evalMseCi95: Record<StrategyName, Interval>;
    readonly exactFraction: Record<StrategyName, number>;
    readonly dualActiveAbsError: Record<StrategyName, number>;
  };
}

interface MetricPanelConfig {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly title: string;
  readonly subtitle: string;
  readonly axisLabel: string;
  readonly values: Record<StrategyName, number>;
  readonly intervals: Record<StrategyName, Interval>;
  readonly secondaryLabel: string;
  readonly secondaryValues: Record<StrategyName, number>;
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
  gnosisMiniMoe: GnosisMiniMoeRoutingBenchmarkFigureInput
): Ch17CorrespondenceBoundaryFigureReport {
  return {
    label: 'ch17-correspondence-boundary-figure-v2',
    sources: {
      quantumLabel: quantum.label,
      toyAttentionLabel: toyAttention.label,
      gnosisTrainingLabel: gnosisTraining.label,
      gnosisMiniMoeLabel: gnosisMiniMoe.label,
    },
    quantum: {
      matrix: {
        linear: {
          kernelAgreement:
            quantum.strategies.linear.profile.preservesKernelAgreement,
          partitionAdditivity:
            quantum.strategies.linear.profile.preservesPartitionAdditivity,
          orderInvariance:
            quantum.strategies.linear.profile.preservesOrderInvariance,
          cancellation: quantum.strategies.linear.profile.preservesCancellation,
        },
        'winner-take-all': {
          kernelAgreement:
            quantum.strategies['winner-take-all'].profile
              .preservesKernelAgreement,
          partitionAdditivity:
            quantum.strategies['winner-take-all'].profile
              .preservesPartitionAdditivity,
          orderInvariance:
            quantum.strategies['winner-take-all'].profile
              .preservesOrderInvariance,
          cancellation:
            quantum.strategies['winner-take-all'].profile.preservesCancellation,
        },
        'early-stop': {
          kernelAgreement:
            quantum.strategies['early-stop'].profile.preservesKernelAgreement,
          partitionAdditivity:
            quantum.strategies['early-stop'].profile
              .preservesPartitionAdditivity,
          orderInvariance:
            quantum.strategies['early-stop'].profile.preservesOrderInvariance,
          cancellation:
            quantum.strategies['early-stop'].profile.preservesCancellation,
        },
      },
      winnerTakeAllKernelDistance:
        quantum.strategies['winner-take-all'].distances.kernelAgreementDistance,
      winnerTakeAllPartitionDistance:
        quantum.strategies['winner-take-all'].distances
          .partitionAdditivityDistance,
      winnerTakeAllCancellationMagnitude2:
        quantum.strategies['winner-take-all'].distances.cancellationMagnitude2,
    },
    toyAttention: {
      mse: {
        linear: toyAttention.strategies.linear.meanSquaredError,
        'winner-take-all':
          toyAttention.strategies['winner-take-all'].meanSquaredError,
        'early-stop': toyAttention.strategies['early-stop'].meanSquaredError,
      },
      mseCi95: {
        linear: toyAttention.strategies.linear.meanSquaredErrorCi95,
        'winner-take-all':
          toyAttention.strategies['winner-take-all'].meanSquaredErrorCi95,
        'early-stop':
          toyAttention.strategies['early-stop'].meanSquaredErrorCi95,
      },
      exactFraction: {
        linear: toyAttention.strategies.linear.exactWithinToleranceFraction,
        'winner-take-all':
          toyAttention.strategies['winner-take-all']
            .exactWithinToleranceFraction,
        'early-stop':
          toyAttention.strategies['early-stop'].exactWithinToleranceFraction,
      },
    },
    gnosisTraining: {
      evalMse: {
        linear: gnosisTraining.strategies.linear.meanEvalMeanSquaredError,
        'winner-take-all':
          gnosisTraining.strategies['winner-take-all'].meanEvalMeanSquaredError,
        'early-stop':
          gnosisTraining.strategies['early-stop'].meanEvalMeanSquaredError,
      },
      evalMseCi95: {
        linear: gnosisTraining.strategies.linear.evalMeanSquaredErrorCi95,
        'winner-take-all':
          gnosisTraining.strategies['winner-take-all'].evalMeanSquaredErrorCi95,
        'early-stop':
          gnosisTraining.strategies['early-stop'].evalMeanSquaredErrorCi95,
      },
      exactFraction: {
        linear:
          gnosisTraining.strategies.linear.meanExactWithinToleranceFraction,
        'winner-take-all':
          gnosisTraining.strategies['winner-take-all']
            .meanExactWithinToleranceFraction,
        'early-stop':
          gnosisTraining.strategies['early-stop']
            .meanExactWithinToleranceFraction,
      },
      cancellationLineAbsError: {
        linear:
          gnosisTraining.strategies.linear
            .meanCancellationLineMeanAbsoluteError,
        'winner-take-all':
          gnosisTraining.strategies['winner-take-all']
            .meanCancellationLineMeanAbsoluteError,
        'early-stop':
          gnosisTraining.strategies['early-stop']
            .meanCancellationLineMeanAbsoluteError,
      },
    },
    gnosisMiniMoe: {
      evalMse: {
        linear: gnosisMiniMoe.strategies.linear.meanEvalMeanSquaredError,
        'winner-take-all':
          gnosisMiniMoe.strategies['winner-take-all'].meanEvalMeanSquaredError,
        'early-stop':
          gnosisMiniMoe.strategies['early-stop'].meanEvalMeanSquaredError,
      },
      evalMseCi95: {
        linear: gnosisMiniMoe.strategies.linear.evalMeanSquaredErrorCi95,
        'winner-take-all':
          gnosisMiniMoe.strategies['winner-take-all'].evalMeanSquaredErrorCi95,
        'early-stop':
          gnosisMiniMoe.strategies['early-stop'].evalMeanSquaredErrorCi95,
      },
      exactFraction: {
        linear:
          gnosisMiniMoe.strategies.linear.meanExactWithinToleranceFraction,
        'winner-take-all':
          gnosisMiniMoe.strategies['winner-take-all']
            .meanExactWithinToleranceFraction,
        'early-stop':
          gnosisMiniMoe.strategies['early-stop']
            .meanExactWithinToleranceFraction,
      },
      dualActiveAbsError: {
        linear:
          gnosisMiniMoe.strategies.linear.meanDualActiveRegionMeanAbsoluteError,
        'winner-take-all':
          gnosisMiniMoe.strategies['winner-take-all']
            .meanDualActiveRegionMeanAbsoluteError,
        'early-stop':
          gnosisMiniMoe.strategies['early-stop']
            .meanDualActiveRegionMeanAbsoluteError,
      },
    },
  };
}

export function renderCh17CorrespondenceBoundaryFigureMarkdown(
  report: Ch17CorrespondenceBoundaryFigureReport
): string {
  const lines: string[] = [];
  lines.push('# Chapter 17 Correspondence Boundary Figure');
  lines.push('');
  lines.push(`- Label: \`${report.label}\``);
  lines.push(`- Quantum source: \`${report.sources.quantumLabel}\``);
  lines.push(`- Toy-attention source: \`${report.sources.toyAttentionLabel}\``);
  lines.push(
    `- Gnosis training source: \`${report.sources.gnosisTrainingLabel}\``
  );
  lines.push(
    `- Gnosis mini-MoE source: \`${report.sources.gnosisMiniMoeLabel}\``
  );
  lines.push('');
  lines.push('## Quantum Matrix');
  lines.push('');
  lines.push('| Strategy | Kernel | Partition | Order | Cancellation |');
  lines.push('|---|---:|---:|---:|---:|');

  for (const strategy of [
    'linear',
    'winner-take-all',
    'early-stop',
  ] as StrategyName[]) {
    const row = report.quantum.matrix[strategy];
    lines.push(
      `| \`${strategy}\` | ${row.kernelAgreement ? 'yes' : 'no'} | ${
        row.partitionAdditivity ? 'yes' : 'no'
      } | ${row.orderInvariance ? 'yes' : 'no'} | ${
        row.cancellation ? 'yes' : 'no'
      } |`
    );
  }

  lines.push('');
  lines.push('## Interval-Backed Behavioral Metrics');
  lines.push('');
  lines.push(
    '| Strategy | Toy attention MSE | Toy 95% CI | Gnosis cancellation MSE | Gnosis cancellation 95% CI | Gnosis mini-MoE MSE | Gnosis mini-MoE 95% CI |'
  );
  lines.push('|---|---:|---:|---:|---:|---:|---:|');

  for (const strategy of [
    'linear',
    'winner-take-all',
    'early-stop',
  ] as StrategyName[]) {
    const toyCi = report.toyAttention.mseCi95[strategy];
    const trainingCi = report.gnosisTraining.evalMseCi95[strategy];
    const miniMoeCi = report.gnosisMiniMoe.evalMseCi95[strategy];
    lines.push(
      `| \`${strategy}\` | ${formatNumber(
        report.toyAttention.mse[strategy]
      )} | [${formatNumber(toyCi.low)}, ${formatNumber(
        toyCi.high
      )}] | ${formatNumber(
        report.gnosisTraining.evalMse[strategy]
      )} | [${formatNumber(trainingCi.low)}, ${formatNumber(
        trainingCi.high
      )}] | ${formatNumber(
        report.gnosisMiniMoe.evalMse[strategy]
      )} | [${formatNumber(miniMoeCi.low)}, ${formatNumber(miniMoeCi.high)}] |`
    );
  }

  lines.push('');
  lines.push(
    'Interpretation: the invariant boundary, fixed-parameter toy attention, seeded cancellation learner, and harder mini-MoE routing learner all recover the same ordering. Linear recombination preserves both exact cancellation and dual-path routed behavior; nonlinear selection does not.'
  );
  lines.push('');
  return `${lines.join('\n')}\n`;
}

function renderMetricPanel(svg: string[], config: MetricPanelConfig): void {
  const strategies: StrategyName[] = [
    'linear',
    'winner-take-all',
    'early-stop',
  ];
  const chartBottom = config.y + config.height - 58;
  const chartHeight = config.height - 136;
  const maxValue = Math.max(
    ...strategies.map((strategy) =>
      Math.max(config.values[strategy], config.intervals[strategy].high)
    )
  );

  svg.push(
    `<rect x="${config.x}" y="${config.y}" width="${config.width}" height="${config.height}" rx="20" fill="#fffaf0" stroke="#d6d3d1"/>`
  );
  svg.push(
    `<text x="${config.x + 24}" y="${
      config.y + 36
    }" font-family="Georgia, serif" font-size="22" fill="#111827">${escapeXml(
      config.title
    )}</text>`
  );
  svg.push(
    `<text x="${config.x + 24}" y="${
      config.y + 60
    }" font-family="Georgia, serif" font-size="13" fill="#57534e">${escapeXml(
      config.subtitle
    )}</text>`
  );
  svg.push(
    `<text x="${config.x + 24}" y="${
      config.y + 86
    }" font-family="ui-monospace, SFMono-Regular, monospace" font-size="12" fill="#374151">${escapeXml(
      config.axisLabel
    )}</text>`
  );
  svg.push(
    `<line x1="${config.x + 44}" y1="${chartBottom}" x2="${
      config.x + config.width - 30
    }" y2="${chartBottom}" stroke="#9ca3af" stroke-width="1"/>`
  );

  strategies.forEach((strategy, index) => {
    const value = config.values[strategy];
    const interval = config.intervals[strategy];
    const height = barHeight(value, maxValue, chartHeight);
    const intervalLowY =
      chartBottom - barHeight(interval.low, maxValue, chartHeight);
    const intervalHighY =
      chartBottom - barHeight(interval.high, maxValue, chartHeight);
    const barX = config.x + 82 + index * 150;
    const barY = chartBottom - height;
    const barWidth = 70;
    const centerX = barX + barWidth / 2;

    svg.push(
      `<rect x="${barX}" y="${barY}" width="${barWidth}" height="${height}" rx="12" fill="${strategyColor(
        strategy
      )}"/>`
    );
    svg.push(
      `<line x1="${centerX}" y1="${intervalHighY}" x2="${centerX}" y2="${intervalLowY}" stroke="#111827" stroke-width="2"/>`
    );
    svg.push(
      `<line x1="${centerX - 10}" y1="${intervalHighY}" x2="${
        centerX + 10
      }" y2="${intervalHighY}" stroke="#111827" stroke-width="2"/>`
    );
    svg.push(
      `<line x1="${centerX - 10}" y1="${intervalLowY}" x2="${
        centerX + 10
      }" y2="${intervalLowY}" stroke="#111827" stroke-width="2"/>`
    );
    const labelAnchorY = Math.max(config.y + 60, Math.min(barY, intervalHighY));
    svg.push(
      `<text x="${centerX}" y="${
        labelAnchorY - 12
      }" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, monospace" font-size="11" fill="#374151">${formatNumber(
        value
      )}</text>`
    );
    svg.push(
      `<text x="${centerX}" y="${
        chartBottom + 24
      }" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, monospace" font-size="12" fill="#111827">${escapeXml(
        strategy
      )}</text>`
    );
    svg.push(
      `<text x="${centerX}" y="${
        chartBottom + 42
      }" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, monospace" font-size="11" fill="#6b7280">${escapeXml(
        `${config.secondaryLabel} ${formatNumber(
          config.secondaryValues[strategy]
        )}`
      )}</text>`
    );
  });
}

export function renderCh17CorrespondenceBoundaryFigureSvg(
  report: Ch17CorrespondenceBoundaryFigureReport
): string {
  const matrixHeaders = ['Kernel', 'Partition', 'Order', 'Cancel'];
  const strategies: StrategyName[] = [
    'linear',
    'winner-take-all',
    'early-stop',
  ];
  const svg: string[] = [];

  svg.push(
    '<svg xmlns="http://www.w3.org/2000/svg" width="1240" height="980" viewBox="0 0 1240 980" role="img" aria-labelledby="title desc">'
  );
  svg.push(
    '<title id="title">Chapter 17 correspondence boundary figure</title>'
  );
  svg.push(
    '<desc id="desc">Invariant matrix, toy-attention error chart with bootstrap intervals, seeded Gnosis cancellation benchmark with seed intervals, and seeded Gnosis mini-MoE routing benchmark with seed intervals.</desc>'
  );
  svg.push('<defs>');
  svg.push('<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">');
  svg.push('<stop offset="0%" stop-color="#f7f3e8"/>');
  svg.push('<stop offset="100%" stop-color="#fffdf8"/>');
  svg.push('</linearGradient>');
  svg.push('</defs>');
  svg.push('<rect width="1240" height="980" fill="url(#bg)" rx="24"/>');
  svg.push(
    '<text x="48" y="56" font-family="Georgia, serif" font-size="28" fill="#111827">Chapter 17 Correspondence Boundary</text>'
  );
  svg.push(
    '<text x="48" y="84" font-family="Georgia, serif" font-size="14" fill="#4b5563">Invariant matrix plus three interval-backed behavioral benchmarks</text>'
  );

  svg.push(
    '<rect x="40" y="120" width="560" height="350" rx="20" fill="#fffaf0" stroke="#d6d3d1"/>'
  );
  svg.push(
    '<text x="64" y="156" font-family="Georgia, serif" font-size="22" fill="#111827">Invariant Loss Matrix</text>'
  );
  svg.push(
    '<text x="64" y="180" font-family="Georgia, serif" font-size="13" fill="#57534e">Same path family, fold rule swapped</text>'
  );

  for (let index = 0; index < matrixHeaders.length; index++) {
    const header = matrixHeaders[index];
    svg.push(
      `<text x="${
        194 + index * 82
      }" y="216" font-family="ui-monospace, SFMono-Regular, monospace" font-size="12" fill="#6b7280">${escapeXml(
        header ?? ''
      )}</text>`
    );
  }

  strategies.forEach((strategy, rowIndex) => {
    const rowLabelY = 254 + rowIndex * 50;
    const cellY = 232 + rowIndex * 50;
    const row = report.quantum.matrix[strategy];
    svg.push(
      `<text x="64" y="${rowLabelY}" font-family="ui-monospace, SFMono-Regular, monospace" font-size="13" fill="#111827">${escapeXml(
        strategy
      )}</text>`
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
      const x = 174 + columnIndex * 82;
      const y = cellY;
      svg.push(
        `<rect x="${x}" y="${y}" width="60" height="30" rx="10" fill="${fill}" opacity="0.92"/>`
      );
      svg.push(
        `<text x="${x + 30}" y="${
          y + 20
        }" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, monospace" font-size="12" fill="#f8fafc">${label}</text>`
      );
    });
  });

  svg.push(
    '<rect x="60" y="376" width="520" height="62" rx="12" fill="#f8fafc" stroke="#e5e7eb"/>'
  );
  svg.push(
    `<text x="76" y="400" font-family="ui-monospace, SFMono-Regular, monospace" font-size="11" fill="#6b7280">winner-take-all distances: kernel ${formatNumber(
      report.quantum.winnerTakeAllKernelDistance
    )}, partition ${formatNumber(
      report.quantum.winnerTakeAllPartitionDistance
    )}, cancellation ${formatNumber(
      report.quantum.winnerTakeAllCancellationMagnitude2
    )}</text>`
  );
  svg.push(
    `<text x="76" y="422" font-family="ui-monospace, SFMono-Regular, monospace" font-size="11" fill="#6b7280">Linear remains the only strategy preserving all four invariants.</text>`
  );

  renderMetricPanel(svg, {
    x: 640,
    y: 120,
    width: 560,
    height: 350,
    title: 'Toy Attention Error',
    subtitle: 'Fixed keys, values, score function, and query grid',
    axisLabel: 'Mean squared error with bootstrap 95% CI',
    values: report.toyAttention.mse,
    intervals: report.toyAttention.mseCi95,
    secondaryLabel: 'exact',
    secondaryValues: report.toyAttention.exactFraction,
  });

  renderMetricPanel(svg, {
    x: 40,
    y: 510,
    width: 560,
    height: 390,
    title: 'Seeded Gnosis Cancellation Benchmark',
    subtitle: 'Same 4-parameter topology; cancel-sensitive L-minus-R learner',
    axisLabel: 'Eval MSE with seed bootstrap 95% CI',
    values: report.gnosisTraining.evalMse,
    intervals: report.gnosisTraining.evalMseCi95,
    secondaryLabel: 'cancel',
    secondaryValues: report.gnosisTraining.cancellationLineAbsError,
  });

  renderMetricPanel(svg, {
    x: 640,
    y: 510,
    width: 560,
    height: 390,
    title: 'Seeded Gnosis Mini-MoE Routing Benchmark',
    subtitle: 'Same 16-param routed-expert topology; two paths contribute',
    axisLabel: 'Eval MSE with seed bootstrap 95% CI',
    values: report.gnosisMiniMoe.evalMse,
    intervals: report.gnosisMiniMoe.evalMseCi95,
    secondaryLabel: 'dual',
    secondaryValues: report.gnosisMiniMoe.dualActiveAbsError,
  });

  svg.push('</svg>');
  return `${svg.join('')}\n`;
}
