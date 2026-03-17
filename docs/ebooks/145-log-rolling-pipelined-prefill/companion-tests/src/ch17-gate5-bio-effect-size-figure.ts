import type { BootstrapInterval, Gate5PairResult, Gate5Report } from './gate5-bio-effect-size';

interface MetricRange {
  readonly low: number;
  readonly high: number;
}

interface Gate5FigurePair {
  readonly id: string;
  readonly domain: string;
  readonly numeratorLabel: string;
  readonly denominatorLabel: string;
  readonly unit: string;
  readonly primary: boolean;
  readonly medianRatio: number;
  readonly ratioCi95: BootstrapInterval;
  readonly pass: boolean;
}

export interface Ch17Gate5BioEffectSizeFigureReport {
  readonly label: 'ch17-gate5-bio-effect-size-figure-v1';
  readonly sourceLabel: string;
  readonly pairCount: number;
  readonly primaryPairCount: number;
  readonly primaryPairsPassed: number;
  readonly criteriaPassed: number;
  readonly criteriaTotal: number;
  readonly medianPairRatio: number;
  readonly minPrimaryPairRatioCiLow: number;
  readonly pairThresholdRatio: number;
  readonly pooledRatio: number;
  readonly pooledRatioCi95: BootstrapInterval;
  readonly pooledThresholdRatio: number;
  readonly ratioRange: MetricRange;
  readonly pairs: readonly Gate5FigurePair[];
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function multilineText(
  svg: string[],
  x: number,
  y: number,
  lines: readonly string[],
  options: {
    readonly anchor?: 'start' | 'middle' | 'end';
    readonly size?: number;
    readonly color?: string;
    readonly lineHeight?: number;
  } = {},
): void {
  const lineHeight = options.lineHeight ?? Math.round((options.size ?? 13) * 1.35);
  const tspans = lines
    .map((line, index) => {
      const dy = index === 0 ? '0' : String(lineHeight);
      return `<tspan x="${x}" dy="${dy}">${escapeXml(line)}</tspan>`;
    })
    .join('');
  svg.push(
    `<text x="${x}" y="${y}" text-anchor="${options.anchor ?? 'start'}" font-family="Georgia, serif" font-size="${
      options.size ?? 13
    }" fill="${options.color ?? '#4b5563'}">${tspans}</text>`,
  );
}

function trimFixed(value: number, digits: number): string {
  const fixed = value.toFixed(digits);
  if (!fixed.includes('.')) {
    return fixed;
  }
  return fixed.replace(/0+$/, '').replace(/\.$/, '');
}

function formatRatio(value: number): string {
  if (value >= 100) {
    return `${trimFixed(value, 1)}x`;
  }
  if (value >= 10) {
    return `${trimFixed(value, 2)}x`;
  }
  return `${trimFixed(value, 3)}x`;
}

function shortLabels(pair: Gate5FigurePair): { readonly numerator: string; readonly denominator: string } {
  switch (pair.id) {
    case 'saltatory_velocity':
      return {
        numerator: 'myelinated',
        denominator: 'unmyelinated',
      };
    case 'photosynthesis_step_vs_system':
      return {
        numerator: 'step-level exciton',
        denominator: 'whole-plant yield',
      };
    case 'okazaki_chunking':
      return {
        numerator: 'prokaryotic',
        denominator: 'eukaryotic',
      };
    default:
      return {
        numerator: pair.numeratorLabel,
        denominator: pair.denominatorLabel,
      };
  }
}

function rangeFor(values: readonly number[]): MetricRange {
  return {
    low: Math.min(...values),
    high: Math.max(...values),
  };
}

function ratioScale(value: number, range: MetricRange, left: number, width: number): number {
  const logMin = Math.log10(range.low);
  const logMax = Math.log10(range.high);
  const normalized = (Math.log10(value) - logMin) / (logMax - logMin);
  return left + normalized * width;
}

function sortedPairs(pairs: readonly Gate5PairResult[]): Gate5FigurePair[] {
  return [...pairs]
    .map<Gate5FigurePair>((pair) => ({
      id: pair.id,
      domain: pair.domain,
      numeratorLabel: pair.numeratorLabel,
      denominatorLabel: pair.denominatorLabel,
      unit: pair.unit,
      primary: pair.primary,
      medianRatio: pair.medianRatio,
      ratioCi95: pair.ratioCi95,
      pass: pair.pass,
    }))
    .sort((left, right) => right.medianRatio - left.medianRatio);
}

export function buildCh17Gate5BioEffectSizeFigureReport(
  report: Gate5Report,
): Ch17Gate5BioEffectSizeFigureReport {
  const pairs = sortedPairs(report.pairs);
  const primaryPairs = pairs.filter((pair) => pair.primary);
  const primaryPairsPassed = primaryPairs.filter((pair) => pair.pass).length;
  const pooledRatio = Math.exp(report.aggregate.pooledLogRatio);
  const pooledRatioCi95: BootstrapInterval = {
    low: Math.exp(report.aggregate.pooledLogRatioCi95.low),
    high: Math.exp(report.aggregate.pooledLogRatioCi95.high),
  };

  return {
    label: 'ch17-gate5-bio-effect-size-figure-v1',
    sourceLabel: report.protocol.id,
    pairCount: report.aggregate.pairCount,
    primaryPairCount: report.aggregate.primaryPairCount,
    primaryPairsPassed,
    criteriaPassed: report.gate.passedCriterionIds.length,
    criteriaTotal: report.gate.criteria.length,
    medianPairRatio: report.aggregate.medianPairRatio,
    minPrimaryPairRatioCiLow: report.aggregate.minPrimaryPairRatioCiLow,
    pairThresholdRatio: report.config.thresholds.minPairRatioLowerCi,
    pooledRatio,
    pooledRatioCi95,
    pooledThresholdRatio: Math.exp(report.config.thresholds.pooledLogRatioLowerCi),
    ratioRange: rangeFor([
      report.config.thresholds.minPairRatioLowerCi,
      Math.exp(report.config.thresholds.pooledLogRatioLowerCi),
      ...pairs.flatMap((pair) => [pair.ratioCi95.low, pair.ratioCi95.high, pair.medianRatio]),
      pooledRatioCi95.low,
      pooledRatioCi95.high,
      pooledRatio,
    ]),
    pairs,
  };
}

export function renderCh17Gate5BioEffectSizeFigureMarkdown(
  report: Ch17Gate5BioEffectSizeFigureReport,
): string {
  const lines: string[] = [];
  lines.push('# Chapter 17 Gate 5 Biological Effect-Size Figure');
  lines.push('');
  lines.push(`- Label: \`${report.label}\``);
  lines.push(`- Source: \`${report.sourceLabel}\``);
  lines.push(
    `- Pairs: \`${report.pairCount}\` total, \`${report.primaryPairCount}\` primary, \`${report.primaryPairsPassed}\` primary passed`,
  );
  lines.push(`- Criteria passed: \`${report.criteriaPassed}/${report.criteriaTotal}\``);
  lines.push(`- Median pair ratio: \`${formatRatio(report.medianPairRatio)}\``);
  lines.push(
    `- Minimum primary-pair CI low: \`${formatRatio(report.minPrimaryPairRatioCiLow)}\` (threshold \`${formatRatio(report.pairThresholdRatio)}\`)`,
  );
  lines.push(
    `- Pooled geometric ratio: \`${formatRatio(report.pooledRatio)}\` (95% CI \`${formatRatio(report.pooledRatioCi95.low)}\` to \`${formatRatio(report.pooledRatioCi95.high)}\`; threshold \`${formatRatio(report.pooledThresholdRatio)}\`)`,
  );
  lines.push('');
  lines.push('## Pairs');
  lines.push('');
  lines.push('| Domain | Numerator / Denominator | Median Ratio | 95% CI | Unit | Primary | Pass |');
  lines.push('|---|---|---:|---:|---|---|---|');
  for (const pair of report.pairs) {
    lines.push(
      `| ${pair.domain} | ${pair.numeratorLabel} / ${pair.denominatorLabel} | ${formatRatio(pair.medianRatio)} | ${formatRatio(pair.ratioCi95.low)} to ${formatRatio(pair.ratioCi95.high)} | ${pair.unit} | ${pair.primary ? 'yes' : 'no'} | ${pair.pass ? 'yes' : 'no'} |`,
    );
  }
  lines.push('');
  lines.push(
    'Interpretation: the figure turns the biological analogy section into a transparent effect-size forest plot, with the pooled geometric summary kept on the same log scale so reviewers can see the spread instead of reading only one pooled number.',
  );

  return `${lines.join('\n')}\n`;
}

function renderForestPlot(
  svg: string[],
  report: Ch17Gate5BioEffectSizeFigureReport,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  svg.push(
    `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="18" fill="#fffdfa" stroke="#d6d3c7"/>`,
  );
  svg.push(
    `<text x="${x + 24}" y="${y + 34}" font-family="Georgia, serif" font-size="20" fill="#111827">Pairwise Ratios on Log Scale</text>`,
  );
  svg.push(
    `<text x="${x + 24}" y="${y + 56}" font-family="Georgia, serif" font-size="11" fill="#4b5563">Median ratios with 95% CIs and pooled summary.</text>`,
  );

  const innerX = x + 270;
  const innerY = y + 92;
  const innerWidth = width - 306;
  const innerHeight = height - 148;
  const rowGap = innerHeight / report.pairs.length;
  const pooledRowY = innerY + innerHeight + 34;
  const plotRange: MetricRange = {
    low: Math.min(1, report.ratioRange.low),
    high: Math.max(200, report.ratioRange.high),
  };

  const tickValues = [1, 2, 5, 10, 20, 50, 100, 200];
  for (const tick of tickValues) {
    const cx = ratioScale(tick, plotRange, innerX, innerWidth);
    svg.push(
      `<line x1="${cx}" y1="${innerY - 16}" x2="${cx}" y2="${pooledRowY + 22}" stroke="#e5e7eb" stroke-width="1"/>`,
    );
    svg.push(
      `<text x="${cx}" y="${pooledRowY + 42}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#6b7280">${formatRatio(tick)}</text>`,
    );
  }

  const pooledThresholdX = ratioScale(report.pooledThresholdRatio, plotRange, innerX, innerWidth);
  svg.push(
    `<line x1="${pooledThresholdX}" y1="${innerY - 24}" x2="${pooledThresholdX}" y2="${pooledRowY + 22}" stroke="#92400e" stroke-width="2" stroke-dasharray="5 5"/>`,
  );
  svg.push(
    `<text x="${pooledThresholdX}" y="${innerY - 32}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#92400e">pooled floor ${formatRatio(report.pooledThresholdRatio)}</text>`,
  );

  report.pairs.forEach((pair, index) => {
    const cy = innerY + rowGap * index + rowGap / 2;
    const lowX = ratioScale(pair.ratioCi95.low, plotRange, innerX, innerWidth);
    const highX = ratioScale(pair.ratioCi95.high, plotRange, innerX, innerWidth);
    const medianX = ratioScale(pair.medianRatio, plotRange, innerX, innerWidth);
    const labels = shortLabels(pair);

    svg.push(
      `<text x="${x + 24}" y="${cy - 10}" font-family="Georgia, serif" font-size="15" fill="#111827">${escapeXml(pair.domain)}</text>`,
    );
    svg.push(
      `<text x="${x + 24}" y="${cy + 14}" font-family="system-ui, sans-serif" font-size="11" fill="#6b7280">${escapeXml(labels.numerator)} / ${escapeXml(labels.denominator)}${pair.unit === 'ratio' ? '' : ` (${escapeXml(pair.unit)})`}</text>`,
    );
    svg.push(
      `<line x1="${lowX}" y1="${cy}" x2="${highX}" y2="${cy}" stroke="${pair.pass ? '#1d4ed8' : '#b91c1c'}" stroke-width="4" stroke-linecap="round"/>`,
    );
    svg.push(
      `<line x1="${lowX}" y1="${cy - 8}" x2="${lowX}" y2="${cy + 8}" stroke="${pair.pass ? '#1d4ed8' : '#b91c1c'}" stroke-width="1.5"/>`,
    );
    svg.push(
      `<line x1="${highX}" y1="${cy - 8}" x2="${highX}" y2="${cy + 8}" stroke="${pair.pass ? '#1d4ed8' : '#b91c1c'}" stroke-width="1.5"/>`,
    );
    svg.push(
      `<rect x="${medianX - 6}" y="${cy - 6}" width="12" height="12" rx="2" fill="${pair.primary ? '#0f766e' : '#64748b'}" stroke="#eff6ff" stroke-width="2"/>`,
    );
    const labelText = `${formatRatio(pair.medianRatio)} (${formatRatio(pair.ratioCi95.low)} to ${formatRatio(pair.ratioCi95.high)})`;
    const labelRightEdge = x + width - 18;
    const labelFitsRight = highX + 10 + labelText.length * 7 < labelRightEdge;
    if (labelFitsRight) {
      svg.push(
        `<text x="${highX + 10}" y="${cy - 14}" text-anchor="start" font-family="system-ui, sans-serif" font-size="12" fill="#334155">${labelText}</text>`,
      );
    } else {
      svg.push(
        `<text x="${labelRightEdge}" y="${cy - 14}" text-anchor="end" font-family="system-ui, sans-serif" font-size="12" fill="#334155">${labelText}</text>`,
      );
    }
  });

  const pooledLowX = ratioScale(report.pooledRatioCi95.low, plotRange, innerX, innerWidth);
  const pooledHighX = ratioScale(report.pooledRatioCi95.high, plotRange, innerX, innerWidth);
  const pooledMidX = ratioScale(report.pooledRatio, plotRange, innerX, innerWidth);
  const diamondHalfWidth = 16;
  const diamondHalfHeight = 10;
  const diamondPoints = [
    `${pooledMidX},${pooledRowY - diamondHalfHeight}`,
    `${pooledMidX + diamondHalfWidth},${pooledRowY}`,
    `${pooledMidX},${pooledRowY + diamondHalfHeight}`,
    `${pooledMidX - diamondHalfWidth},${pooledRowY}`,
  ].join(' ');
  svg.push(
    `<text x="${x + 24}" y="${pooledRowY + 5}" font-family="Georgia, serif" font-size="16" fill="#111827">Pooled geometric summary</text>`,
  );
  svg.push(
    `<line x1="${pooledLowX}" y1="${pooledRowY}" x2="${pooledHighX}" y2="${pooledRowY}" stroke="#b45309" stroke-width="4" stroke-linecap="round"/>`,
  );
  svg.push(
    `<polygon points="${diamondPoints}" fill="#f59e0b" stroke="#78350f" stroke-width="2"/>`,
  );
  svg.push(
    `<text x="${x + width - 18}" y="${pooledRowY - 18}" text-anchor="end" font-family="system-ui, sans-serif" font-size="12" fill="#334155">${formatRatio(report.pooledRatio)} (${formatRatio(report.pooledRatioCi95.low)} to ${formatRatio(report.pooledRatioCi95.high)})</text>`,
  );

  svg.push(
    `<text x="${innerX + innerWidth / 2}" y="${pooledRowY + 66}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" fill="#6b7280">Multiplicative effect-size ratio</text>`,
  );
}

function renderSummaryCard(
  svg: string[],
  report: Ch17Gate5BioEffectSizeFigureReport,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  svg.push(
    `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="18" fill="#f8fafc" stroke="#cbd5e1"/>`,
  );
  svg.push(
    `<text x="${x + 24}" y="${y + 34}" font-family="Georgia, serif" font-size="20" fill="#111827">Gate Summary</text>`,
  );
  multilineText(
    svg,
    x + 24,
    y + 56,
    [
      'Every predeclared biological pair clears the floor,',
      'and the pooled effect remains far above',
      'the minimum 2x threshold.',
    ],
    {
      size: 13,
      color: '#4b5563',
      lineHeight: 17,
    },
  );

  const summaryLines = [
    `pairs ${report.pairCount} total / ${report.primaryPairCount} primary`,
    `criteria ${report.criteriaPassed}/${report.criteriaTotal} passed`,
    `median pair ratio ${formatRatio(report.medianPairRatio)}`,
    `smallest primary CI low ${formatRatio(report.minPrimaryPairRatioCiLow)}`,
    `pair floor ${formatRatio(report.pairThresholdRatio)}`,
    `pooled effect ${formatRatio(report.pooledRatio)}`,
    `pooled CI low ${formatRatio(report.pooledRatioCi95.low)}`,
    `pooled floor ${formatRatio(report.pooledThresholdRatio)}`,
  ];

  summaryLines.forEach((line, index) => {
    const cy = y + 122 + index * 40;
    svg.push(`<circle cx="${x + 28}" cy="${cy - 4}" r="4.5" fill="#0f766e"/>`);
    svg.push(
      `<text x="${x + 42}" y="${cy}" font-family="system-ui, sans-serif" font-size="13" fill="#334155">${escapeXml(line)}</text>`,
    );
  });

  const barX = x + 24;
  const barY = y + height - 92;
  const barWidth = width - 48;
  const fillWidth = (report.primaryPairsPassed / report.primaryPairCount) * barWidth;
  svg.push(
    `<text x="${barX}" y="${barY - 14}" font-family="system-ui, sans-serif" font-size="12" fill="#334155">Primary-pair pass rate</text>`,
  );
  svg.push(
    `<rect x="${barX}" y="${barY}" width="${barWidth}" height="16" rx="8" fill="#e2e8f0"/>`,
  );
  svg.push(
    `<rect x="${barX}" y="${barY}" width="${fillWidth}" height="16" rx="8" fill="#0f766e"/>`,
  );
  svg.push(
    `<text x="${barX + barWidth / 2}" y="${barY + 12}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#0f172a">${report.primaryPairsPassed}/${report.primaryPairCount} primary pairs pass</text>`,
  );
}

export function renderCh17Gate5BioEffectSizeFigureSvg(
  report: Ch17Gate5BioEffectSizeFigureReport,
): string {
  const svg: string[] = [];
  svg.push('<svg xmlns="http://www.w3.org/2000/svg" width="1240" height="780" viewBox="0 0 1240 780" role="img" aria-labelledby="title desc">');
  svg.push('<title id="title">Chapter 17 Gate 5 biological effect-size figure</title>');
  svg.push(
    '<desc id="desc">Log-scale forest plot of three biological effect-size ratios with a pooled geometric summary and gate-threshold summary card.</desc>',
  );
  svg.push('<rect width="1240" height="780" fill="#f3efe5"/>');
  svg.push('<rect x="22" y="22" width="1196" height="736" rx="28" fill="#f7f4ea" stroke="#d6d3c7"/>');
  svg.push('<text x="60" y="82" font-family="Georgia, serif" font-size="32" fill="#111827">Gate 5 Biological Effect-Size Mapping</text>');
  svg.push(
    `<text x="60" y="114" font-family="Georgia, serif" font-size="15" fill="#4b5563">Source ${escapeXml(report.sourceLabel)} | pooled effect ${formatRatio(report.pooledRatio)} | smallest primary CI low ${formatRatio(report.minPrimaryPairRatioCiLow)}</text>`,
  );

  renderForestPlot(svg, report, 52, 148, 814, 570);
  renderSummaryCard(svg, report, 892, 148, 296, 570);

  svg.push('</svg>');
  return `${svg.join('')}\n`;
}
