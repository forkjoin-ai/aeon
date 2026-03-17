import type { BootstrapInterval, Gate3Report } from './gate3-compression-corpus';

interface Gate3FigureCell {
  readonly cellId: string;
  readonly primary: boolean;
  readonly sampleCount: number;
  readonly medianGainVsBestFixedPct: number;
  readonly medianGainVsBestFixedPctCi: BootstrapInterval;
  readonly medianGainVsHeuristicPct: number;
  readonly medianGainVsHeuristicPctCi: BootstrapInterval;
  readonly winRateVsBestFixed: number;
  readonly winRateVsHeuristic: number;
  readonly medianCodecsUsed: number;
}

interface MetricRange {
  readonly low: number;
  readonly high: number;
}

export interface Ch17Gate3CompressionCorpusFigureReport {
  readonly label: 'ch17-gate3-compression-corpus-figure-v1';
  readonly sourceLabel: string;
  readonly corpus: {
    readonly sampleCount: number;
    readonly totalBytes: number;
    readonly medianBytes: number;
  };
  readonly primaryPassed: number;
  readonly primaryTotal: number;
  readonly bestFixedGainRangePct: MetricRange;
  readonly heuristicGainRangePct: MetricRange;
  readonly minPrimaryBestFixedCiLowPct: number;
  readonly minPrimaryHeuristicCiLowPct: number;
  readonly medianCodecsUsedRange: MetricRange;
  readonly cells: readonly Gate3FigureCell[];
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function trimFixed(value: number, digits: number): string {
  const fixed = value.toFixed(digits);
  if (!fixed.includes('.')) {
    return fixed;
  }
  return fixed.replace(/0+$/, '').replace(/\.$/, '');
}

function formatPct(value: number): string {
  if (value >= 10) {
    return `${trimFixed(value, 2)}%`;
  }
  if (value >= 1) {
    return `${trimFixed(value, 3)}%`;
  }
  return `${trimFixed(value, 4)}%`;
}

function formatBytes(value: number): string {
  if (value >= 1_000_000) {
    return `${trimFixed(value / 1_000_000, 2)} MB`;
  }
  if (value >= 1_000) {
    return `${trimFixed(value / 1_000, 1)} KB`;
  }
  return `${value} B`;
}

function rangeFor(values: readonly number[]): MetricRange {
  return {
    low: Math.min(...values),
    high: Math.max(...values),
  };
}

function primaryColor(primary: boolean): string {
  return primary ? '#0f766e' : '#64748b';
}

function metricColor(metric: 'best-fixed' | 'heuristic'): string {
  return metric === 'best-fixed' ? '#1d4ed8' : '#c2410c';
}

function logScaleY(value: number, range: MetricRange, top: number, height: number): number {
  const safeValue = Math.max(value, range.low);
  const logMin = Math.log10(range.low);
  const logMax = Math.log10(range.high);
  const normalized = (Math.log10(safeValue) - logMin) / (logMax - logMin);
  return top + height - normalized * height;
}

export function buildCh17Gate3CompressionCorpusFigureReport(
  report: Gate3Report,
): Ch17Gate3CompressionCorpusFigureReport {
  const cells = report.cells.map<Gate3FigureCell>((cell) => ({
    cellId: cell.cellId,
    primary: cell.primary,
    sampleCount: cell.sampleCount,
    medianGainVsBestFixedPct: cell.medianGainVsBestFixedPct,
    medianGainVsBestFixedPctCi: cell.medianGainVsBestFixedPctCi,
    medianGainVsHeuristicPct: cell.medianGainVsHeuristicPct,
    medianGainVsHeuristicPctCi: cell.medianGainVsHeuristicPctCi,
    winRateVsBestFixed: cell.winRateVsBestFixed,
    winRateVsHeuristic: cell.winRateVsHeuristic,
    medianCodecsUsed: cell.medianCodecsUsed,
  }));
  const primaryCells = cells.filter((cell) => cell.primary);
  const ciCells = primaryCells.length > 0 ? primaryCells : cells;

  return {
    label: 'ch17-gate3-compression-corpus-figure-v1',
    sourceLabel: report.protocol.id,
    corpus: {
      sampleCount: report.corpus.sampleCount,
      totalBytes: report.corpus.totalBytes,
      medianBytes: report.corpus.medianBytes,
    },
    primaryPassed: report.gate.passedPrimaryCells.length,
    primaryTotal: report.gate.primaryCells.length,
    bestFixedGainRangePct: rangeFor(cells.map((cell) => cell.medianGainVsBestFixedPct)),
    heuristicGainRangePct: rangeFor(cells.map((cell) => cell.medianGainVsHeuristicPct)),
    minPrimaryBestFixedCiLowPct: Math.min(
      ...ciCells.map((cell) => cell.medianGainVsBestFixedPctCi.low),
    ),
    minPrimaryHeuristicCiLowPct: Math.min(
      ...ciCells.map((cell) => cell.medianGainVsHeuristicPctCi.low),
    ),
    medianCodecsUsedRange: rangeFor(cells.map((cell) => cell.medianCodecsUsed)),
    cells,
  };
}

export function renderCh17Gate3CompressionCorpusFigureMarkdown(
  report: Ch17Gate3CompressionCorpusFigureReport,
): string {
  const lines: string[] = [];
  lines.push('# Chapter 17 Gate 3 Compression-Corpus Figure');
  lines.push('');
  lines.push(`- Label: \`${report.label}\``);
  lines.push(`- Source: \`${report.sourceLabel}\``);
  lines.push(
    `- Corpus: \`${report.corpus.sampleCount}\` samples, \`${formatBytes(report.corpus.totalBytes)}\` total, median \`${formatBytes(report.corpus.medianBytes)}\``,
  );
  lines.push(`- Primary cells passed: \`${report.primaryPassed}/${report.primaryTotal}\``);
  lines.push(
    `- Gain vs best fixed range: \`${formatPct(report.bestFixedGainRangePct.low)}\` to \`${formatPct(report.bestFixedGainRangePct.high)}\``,
  );
  lines.push(
    `- Gain vs heuristic range: \`${formatPct(report.heuristicGainRangePct.low)}\` to \`${formatPct(report.heuristicGainRangePct.high)}\``,
  );
  lines.push(
    `- Minimum primary-cell CI lows: \`${formatPct(report.minPrimaryBestFixedCiLowPct)}\` and \`${formatPct(report.minPrimaryHeuristicCiLowPct)}\``,
  );
  lines.push(
    `- Median codecs used range: \`${trimFixed(report.medianCodecsUsedRange.low, 2)}\` to \`${trimFixed(report.medianCodecsUsedRange.high, 2)}\``,
  );
  lines.push('');
  lines.push('## Cells');
  lines.push('');
  lines.push(
    '| Cell | Primary | Gain vs Best Fixed % (95% CI) | Gain vs Heuristic % (95% CI) | Win Rates (best fixed / heuristic) | Median Codecs Used |',
  );
  lines.push('|---|---|---:|---:|---:|---:|');

  for (const cell of report.cells) {
    lines.push(
      `| ${cell.cellId} | ${cell.primary ? 'yes' : 'no'} | ${formatPct(cell.medianGainVsBestFixedPct)} (${formatPct(cell.medianGainVsBestFixedPctCi.low)} to ${formatPct(cell.medianGainVsBestFixedPctCi.high)}) | ${formatPct(cell.medianGainVsHeuristicPct)} (${formatPct(cell.medianGainVsHeuristicPctCi.low)} to ${formatPct(cell.medianGainVsHeuristicPctCi.high)}) | ${trimFixed(cell.winRateVsBestFixed * 100, 1)}% / ${trimFixed(cell.winRateVsHeuristic * 100, 1)}% | ${trimFixed(cell.medianCodecsUsed, 2)} |`,
    );
  }

  lines.push('');
  lines.push('Interpretation: the figure makes the honest asymmetry visible. Gains over the best fixed codec are tiny but positive in the primary heterogeneous families, while gains over the heuristic baseline are much larger; the non-primary homogeneous-text family acts as a control with a very different scale.');

  return `${lines.join('\n')}\n`;
}

function renderMetricPanel(
  svg: string[],
  report: Ch17Gate3CompressionCorpusFigureReport,
  options: {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
    readonly title: string;
    readonly subtitle: string;
    readonly axisLabel: string;
    readonly metric: 'best-fixed' | 'heuristic';
    readonly range: MetricRange;
    readonly ticks: readonly number[];
  },
): void {
  svg.push(
    `<rect x="${options.x}" y="${options.y}" width="${options.width}" height="${options.height}" rx="18" fill="#fffdfa" stroke="#d6d3c7"/>`,
  );
  svg.push(
    `<text x="${options.x + 24}" y="${options.y + 34}" font-family="Georgia, serif" font-size="20" fill="#111827">${escapeXml(options.title)}</text>`,
  );
  svg.push(
    `<text x="${options.x + 24}" y="${options.y + 56}" font-family="Georgia, serif" font-size="13" fill="#4b5563">${escapeXml(options.subtitle)}</text>`,
  );

  const innerX = options.x + 64;
  const innerY = options.y + 84;
  const innerWidth = options.width - 148;
  const innerHeight = options.height - 134;
  const color = metricColor(options.metric);
  const xStep =
    report.cells.length > 1 ? innerWidth / (report.cells.length - 1) : innerWidth / 2;

  for (const tick of options.ticks) {
    const y = logScaleY(tick, options.range, innerY, innerHeight);
    svg.push(
      `<line x1="${innerX}" y1="${y}" x2="${innerX + innerWidth}" y2="${y}" stroke="#e5e7eb" stroke-width="1"/>`,
    );
    svg.push(
      `<text x="${innerX - 12}" y="${y + 4}" text-anchor="end" font-family="system-ui, sans-serif" font-size="11" fill="#6b7280">${formatPct(tick)}</text>`,
    );
  }

  report.cells.forEach((cell, index) => {
    const cx = innerX + xStep * index;
    const value =
      options.metric === 'best-fixed'
        ? cell.medianGainVsBestFixedPct
        : cell.medianGainVsHeuristicPct;
    const interval =
      options.metric === 'best-fixed'
        ? cell.medianGainVsBestFixedPctCi
        : cell.medianGainVsHeuristicPctCi;
    const cy = logScaleY(value, options.range, innerY, innerHeight);
    const cyLow = logScaleY(interval.low, options.range, innerY, innerHeight);
    const cyHigh = logScaleY(interval.high, options.range, innerY, innerHeight);

    svg.push(
      `<line x1="${cx}" y1="${cyLow}" x2="${cx}" y2="${cyHigh}" stroke="${color}" stroke-width="2" opacity="0.5"/>`,
    );
    svg.push(
      `<line x1="${cx - 6}" y1="${cyLow}" x2="${cx + 6}" y2="${cyLow}" stroke="${color}" stroke-width="1.5" opacity="0.5"/>`,
    );
    svg.push(
      `<line x1="${cx - 6}" y1="${cyHigh}" x2="${cx + 6}" y2="${cyHigh}" stroke="${color}" stroke-width="1.5" opacity="0.5"/>`,
    );
    svg.push(
      `<circle cx="${cx}" cy="${cy}" r="5.5" fill="${primaryColor(cell.primary)}" stroke="${color}" stroke-width="2"/>`,
    );
    svg.push(
      `<text x="${cx}" y="${innerY + innerHeight + 20}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#6b7280">${escapeXml(cell.cellId)}</text>`,
    );
    svg.push(
      `<text x="${cx}" y="${innerY + innerHeight + 36}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" fill="#94a3b8">${cell.primary ? 'primary' : 'control'}</text>`,
    );
  });

  svg.push(
    `<text x="${innerX + innerWidth / 2}" y="${options.y + options.height - 4}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" fill="#6b7280">${escapeXml(options.axisLabel)}</text>`,
  );
}

export function renderCh17Gate3CompressionCorpusFigureSvg(
  report: Ch17Gate3CompressionCorpusFigureReport,
): string {
  const width = 1440;
  const height = 860;
  const bestFixedRange: MetricRange = {
    low: 0.0008,
    high: 1,
  };
  const heuristicRange: MetricRange = {
    low: 0.3,
    high: 60,
  };

  const svg: string[] = [];
  svg.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">`,
  );
  svg.push('<title id="title">Chapter 17 Gate 3 compression-corpus figure</title>');
  svg.push(
    '<desc id="desc">Two stacked log-scale compression-corpus panels showing median gain versus the best fixed codec and versus the heuristic baseline, each with bootstrap confidence intervals across the Gate 3 family matrix.</desc>',
  );
  svg.push('<defs>');
  svg.push('<linearGradient id="gate3bg" x1="0%" y1="0%" x2="100%" y2="100%">');
  svg.push('<stop offset="0%" stop-color="#f7f3e8"/>');
  svg.push('<stop offset="100%" stop-color="#fffdf8"/>');
  svg.push('</linearGradient>');
  svg.push('</defs>');
  svg.push('<rect width="1440" height="860" rx="24" fill="url(#gate3bg)"/>');
  svg.push(
    '<text x="48" y="58" font-family="Georgia, serif" font-size="30" fill="#111827">Chapter 17 Gate 3 Compression Corpus</text>',
  );
  svg.push(
    `<text x="48" y="88" font-family="Georgia, serif" font-size="15" fill="#4b5563">Source ${escapeXml(report.sourceLabel)} • ${report.corpus.sampleCount} samples • ${formatBytes(report.corpus.totalBytes)} total • ${report.primaryPassed}/${report.primaryTotal} primary families pass</text>`,
  );
  svg.push(
    `<text x="48" y="114" font-family="Georgia, serif" font-size="15" fill="#4b5563">Primary-family gains over the best fixed codec stay tiny but positive (${formatPct(report.minPrimaryBestFixedCiLowPct)} CI low floor), while gains over the heuristic baseline widen to ${formatPct(report.heuristicGainRangePct.high)}</text>`,
  );

  renderMetricPanel(svg, report, {
    x: 40,
    y: 150,
    width: 1360,
    height: 290,
    title: 'Median Gain vs Best Fixed Codec',
    subtitle:
      'Primary heterogeneous families clear zero by narrow margins; homogeneous text is a non-primary high-gain control',
    axisLabel: 'log scale percent gain by family',
    metric: 'best-fixed',
    range: bestFixedRange,
    ticks: [0.001, 0.01, 0.1, 1],
  });
  renderMetricPanel(svg, report, {
    x: 40,
    y: 470,
    width: 1360,
    height: 290,
    title: 'Median Gain vs Heuristic Baseline',
    subtitle:
      'Heterogeneous families show much larger gains against the simpler heuristic baseline',
    axisLabel: 'log scale percent gain by family',
    metric: 'heuristic',
    range: heuristicRange,
    ticks: [0.5, 1, 5, 10, 50],
  });

  svg.push(
    `<circle cx="58" cy="798" r="6" fill="${primaryColor(true)}" stroke="#111827" stroke-width="0.5"/>`,
  );
  svg.push(
    '<text x="74" y="802" font-family="system-ui, sans-serif" font-size="12" fill="#4b5563">primary family</text>',
  );
  svg.push(
    `<circle cx="168" cy="798" r="6" fill="${primaryColor(false)}" stroke="#111827" stroke-width="0.5"/>`,
  );
  svg.push(
    '<text x="184" y="802" font-family="system-ui, sans-serif" font-size="12" fill="#4b5563">non-primary control</text>',
  );
  svg.push(
    `<line x1="336" y1="798" x2="374" y2="798" stroke="${metricColor('best-fixed')}" stroke-width="2.5"/>`,
  );
  svg.push(
    '<text x="382" y="802" font-family="system-ui, sans-serif" font-size="12" fill="#4b5563">gain vs best fixed</text>',
  );
  svg.push(
    `<line x1="528" y1="798" x2="566" y2="798" stroke="${metricColor('heuristic')}" stroke-width="2.5"/>`,
  );
  svg.push(
    '<text x="574" y="802" font-family="system-ui, sans-serif" font-size="12" fill="#4b5563">gain vs heuristic</text>',
  );
  svg.push(
    `<text x="760" y="802" font-family="system-ui, sans-serif" font-size="12" fill="#4b5563">median codecs used range: ${trimFixed(report.medianCodecsUsedRange.low, 2)}–${trimFixed(report.medianCodecsUsedRange.high, 2)}</text>`,
  );

  svg.push('</svg>');
  return `${svg.join('')}\n`;
}
