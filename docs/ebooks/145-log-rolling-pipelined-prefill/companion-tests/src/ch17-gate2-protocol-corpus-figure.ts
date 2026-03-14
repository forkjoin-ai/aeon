import type { BootstrapInterval, Gate2Report } from './gate2-protocol-corpus';

interface Gate2FigureCell {
  readonly cellId: string;
  readonly environmentLabel: string;
  readonly primary: boolean;
  readonly rttMs: number;
  readonly bandwidthMbps: number;
  readonly lossRate: number;
  readonly framingMedianGainPct: number;
  readonly framingMedianGainPctCi: BootstrapInterval;
  readonly completionMedianGainMs: number;
  readonly completionMedianGainMsCi: BootstrapInterval;
  readonly completionP95GainMs: number;
  readonly completionP95GainMsCi: BootstrapInterval;
}

interface MetricRange {
  readonly low: number;
  readonly high: number;
}

export interface Ch17Gate2ProtocolCorpusFigureReport {
  readonly label: 'ch17-gate2-protocol-corpus-figure-v1';
  readonly sourceLabel: string;
  readonly corpus: {
    readonly siteCount: number;
    readonly totalResources: number;
    readonly medianResourcesPerSite: number;
  };
  readonly primaryPassed: number;
  readonly primaryTotal: number;
  readonly framingGainRangePct: MetricRange;
  readonly completionMedianGainRangeMs: MetricRange;
  readonly completionP95GainRangeMs: MetricRange;
  readonly minPrimaryFramingCiLowPct: number;
  readonly minPrimaryCompletionMedianCiLowMs: number;
  readonly minPrimaryCompletionP95CiLowMs: number;
  readonly cells: readonly Gate2FigureCell[];
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

function formatMs(value: number): string {
  return trimFixed(value, value >= 100 ? 1 : 2);
}

function formatPct(value: number): string {
  return `${trimFixed(value, 3)}%`;
}

function formatLossPct(lossRate: number): string {
  return `${trimFixed(lossRate * 100, 1)}%`;
}

function rangeFor(values: readonly number[]): MetricRange {
  return {
    low: Math.min(...values),
    high: Math.max(...values),
  };
}

function scaleY(value: number, range: MetricRange, top: number, height: number): number {
  if (range.high <= range.low) {
    return top + height / 2;
  }

  const normalized = (value - range.low) / (range.high - range.low);
  return top + height - normalized * height;
}

function primaryColor(primary: boolean): string {
  return primary ? '#0f766e' : '#64748b';
}

function metricColor(metric: 'framing' | 'median' | 'p95'): string {
  if (metric === 'framing') {
    return '#1d4ed8';
  }
  if (metric === 'median') {
    return '#0f766e';
  }
  return '#c2410c';
}

export function buildCh17Gate2ProtocolCorpusFigureReport(
  report: Gate2Report,
): Ch17Gate2ProtocolCorpusFigureReport {
  const cells = report.cells.map<Gate2FigureCell>((cell) => ({
    cellId: cell.cellId,
    environmentLabel:
      `RTT ${trimFixed(cell.environment.rttMs, 0)} ms • BW ${trimFixed(cell.environment.bandwidthMbps, 0)} Mbps • loss ${formatLossPct(cell.environment.lossRate)}`,
    primary: cell.environment.primary,
    rttMs: cell.environment.rttMs,
    bandwidthMbps: cell.environment.bandwidthMbps,
    lossRate: cell.environment.lossRate,
    framingMedianGainPct: cell.framingMedianGainPct,
    framingMedianGainPctCi: cell.framingMedianGainPctCi,
    completionMedianGainMs: cell.completionMedianGainMs,
    completionMedianGainMsCi: cell.completionMedianGainMsCi,
    completionP95GainMs: cell.completionP95GainMs,
    completionP95GainMsCi: cell.completionP95GainMsCi,
  }));
  const primaryCells = cells.filter((cell) => cell.primary);
  const ciCells = primaryCells.length > 0 ? primaryCells : cells;

  return {
    label: 'ch17-gate2-protocol-corpus-figure-v1',
    sourceLabel: report.protocol.id,
    corpus: {
      siteCount: report.corpus.siteCount,
      totalResources: report.corpus.totalResources,
      medianResourcesPerSite: report.corpus.medianResourcesPerSite,
    },
    primaryPassed: report.gate.passedPrimaryCells.length,
    primaryTotal: report.gate.primaryCells.length,
    framingGainRangePct: rangeFor(cells.map((cell) => cell.framingMedianGainPct)),
    completionMedianGainRangeMs: rangeFor(
      cells.map((cell) => cell.completionMedianGainMs),
    ),
    completionP95GainRangeMs: rangeFor(cells.map((cell) => cell.completionP95GainMs)),
    minPrimaryFramingCiLowPct: Math.min(
      ...ciCells.map((cell) => cell.framingMedianGainPctCi.low),
    ),
    minPrimaryCompletionMedianCiLowMs: Math.min(
      ...ciCells.map((cell) => cell.completionMedianGainMsCi.low),
    ),
    minPrimaryCompletionP95CiLowMs: Math.min(
      ...ciCells.map((cell) => cell.completionP95GainMsCi.low),
    ),
    cells,
  };
}

export function renderCh17Gate2ProtocolCorpusFigureMarkdown(
  report: Ch17Gate2ProtocolCorpusFigureReport,
): string {
  const lines: string[] = [];
  lines.push('# Chapter 17 Gate 2 Protocol-Corpus Figure');
  lines.push('');
  lines.push(`- Label: \`${report.label}\``);
  lines.push(`- Source: \`${report.sourceLabel}\``);
  lines.push(
    `- Corpus: \`${report.corpus.siteCount}\` sites, \`${report.corpus.totalResources}\` resources, median \`${trimFixed(report.corpus.medianResourcesPerSite, 1)}\` resources/site`,
  );
  lines.push(`- Primary cells passed: \`${report.primaryPassed}/${report.primaryTotal}\``);
  lines.push(
    `- Framing gain range: \`${formatPct(report.framingGainRangePct.low)}\` to \`${formatPct(report.framingGainRangePct.high)}\``,
  );
  lines.push(
    `- Completion median gain range: \`${formatMs(report.completionMedianGainRangeMs.low)} ms\` to \`${formatMs(report.completionMedianGainRangeMs.high)} ms\``,
  );
  lines.push(
    `- Completion p95 gain range: \`${formatMs(report.completionP95GainRangeMs.low)} ms\` to \`${formatMs(report.completionP95GainRangeMs.high)} ms\``,
  );
  lines.push(
    `- Minimum primary-cell CI lows: \`${formatPct(report.minPrimaryFramingCiLowPct)}\`, \`${formatMs(report.minPrimaryCompletionMedianCiLowMs)} ms\`, \`${formatMs(report.minPrimaryCompletionP95CiLowMs)} ms\``,
  );
  lines.push('');
  lines.push('## Cells');
  lines.push('');
  lines.push(
    '| Cell | Environment | Primary | Framing Median Gain % (95% CI) | Completion Median Gain ms (95% CI) | Completion p95 Gain ms (95% CI) |',
  );
  lines.push('|---|---|---|---:|---:|---:|');

  for (const cell of report.cells) {
    lines.push(
      `| ${cell.cellId} | ${cell.environmentLabel} | ${cell.primary ? 'yes' : 'no'} | ${formatPct(cell.framingMedianGainPct)} (${formatPct(cell.framingMedianGainPctCi.low)} to ${formatPct(cell.framingMedianGainPctCi.high)}) | ${formatMs(cell.completionMedianGainMs)} (${formatMs(cell.completionMedianGainMsCi.low)} to ${formatMs(cell.completionMedianGainMsCi.high)}) | ${formatMs(cell.completionP95GainMs)} (${formatMs(cell.completionP95GainMsCi.low)} to ${formatMs(cell.completionP95GainMsCi.high)}) |`,
    );
  }

  lines.push('');
  lines.push('Interpretation: the figure separates the nearly invariant framing advantage from the latency gains that widen as impairment increases, making the protocol story legible without collapsing the corpus matrix into one scalar.');

  return `${lines.join('\n')}\n`;
}

function renderMetricPanel(
  svg: string[],
  report: Ch17Gate2ProtocolCorpusFigureReport,
  options: {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
    readonly title: string;
    readonly subtitle: string;
    readonly axisLabel: string;
    readonly metric: 'framing' | 'median' | 'p95';
    readonly range: MetricRange;
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

  const innerX = options.x + 54;
  const innerY = options.y + 86;
  const innerWidth = options.width - 94;
  const innerHeight = options.height - 136;
  const color = metricColor(options.metric);
  const tickCount = 4;
  const step = (options.range.high - options.range.low) / tickCount;

  for (let index = 0; index <= tickCount; index++) {
    const value = options.range.low + step * index;
    const y = scaleY(value, options.range, innerY, innerHeight);
    svg.push(
      `<line x1="${innerX}" y1="${y}" x2="${innerX + innerWidth}" y2="${y}" stroke="#e5e7eb" stroke-width="1"/>`,
    );
    const label = options.metric === 'framing' ? formatPct(value) : `${formatMs(value)} ms`;
    svg.push(
      `<text x="${innerX - 12}" y="${y + 4}" text-anchor="end" font-family="system-ui, sans-serif" font-size="11" fill="#6b7280">${label}</text>`,
    );
  }

  const pointGap =
    report.cells.length > 1 ? innerWidth / (report.cells.length - 1) : innerWidth / 2;
  const path: string[] = [];

  report.cells.forEach((cell, index) => {
    const cx = innerX + pointGap * index;
    const value =
      options.metric === 'framing'
        ? cell.framingMedianGainPct
        : options.metric === 'median'
          ? cell.completionMedianGainMs
          : cell.completionP95GainMs;
    const interval =
      options.metric === 'framing'
        ? cell.framingMedianGainPctCi
        : options.metric === 'median'
          ? cell.completionMedianGainMsCi
          : cell.completionP95GainMsCi;
    const cy = scaleY(value, options.range, innerY, innerHeight);
    const cyLow = scaleY(interval.low, options.range, innerY, innerHeight);
    const cyHigh = scaleY(interval.high, options.range, innerY, innerHeight);

    path.push(`${index === 0 ? 'M' : 'L'} ${cx} ${cy}`);

    svg.push(
      `<line x1="${cx}" y1="${cyLow}" x2="${cx}" y2="${cyHigh}" stroke="${color}" stroke-width="2" opacity="0.45"/>`,
    );
    svg.push(
      `<line x1="${cx - 5}" y1="${cyLow}" x2="${cx + 5}" y2="${cyLow}" stroke="${color}" stroke-width="1.5" opacity="0.45"/>`,
    );
    svg.push(
      `<line x1="${cx - 5}" y1="${cyHigh}" x2="${cx + 5}" y2="${cyHigh}" stroke="${color}" stroke-width="1.5" opacity="0.45"/>`,
    );
    svg.push(
      `<circle cx="${cx}" cy="${cy}" r="5" fill="${primaryColor(cell.primary)}" stroke="${color}" stroke-width="2"/>`,
    );
    svg.push(
      `<text x="${cx}" y="${innerY + innerHeight + 20}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" fill="#6b7280">r${trimFixed(cell.rttMs, 0)}</text>`,
    );
    svg.push(
      `<text x="${cx}" y="${innerY + innerHeight + 34}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" fill="#94a3b8">l${trimFixed(cell.lossRate * 100, 0)}</text>`,
    );
  });

  svg.push(
    `<path d="${path.join(' ')}" fill="none" stroke="${color}" stroke-width="2.5" opacity="0.9"/>`,
  );
  svg.push(
    `<text x="${innerX + innerWidth / 2}" y="${options.y + options.height - 18}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" fill="#6b7280">${escapeXml(options.axisLabel)}</text>`,
  );
}

export function renderCh17Gate2ProtocolCorpusFigureSvg(
  report: Ch17Gate2ProtocolCorpusFigureReport,
): string {
  const width = 1440;
  const height = 980;
  const framingRange: MetricRange = {
    low: Math.floor((report.minPrimaryFramingCiLowPct - 0.2) * 10) / 10,
    high:
      Math.ceil(
        (Math.max(...report.cells.map((cell) => cell.framingMedianGainPctCi.high)) + 0.2) * 10,
      ) / 10,
  };
  const completionMedianRange: MetricRange = {
    low: 0,
    high:
      Math.ceil(
        Math.max(...report.cells.map((cell) => cell.completionMedianGainMsCi.high)) / 20,
      ) * 20,
  };
  const completionP95Range: MetricRange = {
    low: 0,
    high:
      Math.ceil(
        Math.max(...report.cells.map((cell) => cell.completionP95GainMsCi.high)) / 20,
      ) * 20,
  };

  const svg: string[] = [];
  svg.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">`,
  );
  svg.push('<title id="title">Chapter 17 Gate 2 protocol-corpus figure</title>');
  svg.push(
    '<desc id="desc">Three stacked protocol-corpus panels showing framing median gain, completion median gain, and completion p95 gain across the Gate 2 environment matrix, each with bootstrap confidence intervals.</desc>',
  );
  svg.push('<defs>');
  svg.push('<linearGradient id="gate2bg" x1="0%" y1="0%" x2="100%" y2="100%">');
  svg.push('<stop offset="0%" stop-color="#f7f3e8"/>');
  svg.push('<stop offset="100%" stop-color="#fffdf8"/>');
  svg.push('</linearGradient>');
  svg.push('</defs>');
  svg.push('<rect width="1440" height="980" rx="24" fill="url(#gate2bg)"/>');
  svg.push(
    '<text x="48" y="58" font-family="Georgia, serif" font-size="30" fill="#111827">Chapter 17 Gate 2 Protocol Corpus</text>',
  );
  svg.push(
    `<text x="48" y="88" font-family="Georgia, serif" font-size="15" fill="#4b5563">Source ${escapeXml(report.sourceLabel)} • ${report.corpus.siteCount} sites • ${report.corpus.totalResources} resources • ${report.primaryPassed}/${report.primaryTotal} primary cells pass</text>`,
  );
  svg.push(
    `<text x="48" y="114" font-family="Georgia, serif" font-size="15" fill="#4b5563">Framing gain stays near ${formatPct(report.framingGainRangePct.low)}–${formatPct(report.framingGainRangePct.high)} while median and p95 completion gains widen to ${formatMs(report.completionMedianGainRangeMs.high)} ms and ${formatMs(report.completionP95GainRangeMs.high)} ms</text>`,
  );

  renderMetricPanel(svg, report, {
    x: 40,
    y: 150,
    width: 1360,
    height: 230,
    title: 'Framing Median Gain',
    subtitle: 'Header/framing advantage is stable across the environment matrix',
    axisLabel: 'environment order: low RTT/low loss on the left, higher impairment on the right',
    metric: 'framing',
    range: framingRange,
  });
  renderMetricPanel(svg, report, {
    x: 40,
    y: 406,
    width: 1360,
    height: 230,
    title: 'Completion Median Gain',
    subtitle: 'Median completion savings increase as RTT, loss, and bandwidth pressure worsen',
    axisLabel: 'labels under points: r = RTT in ms, l = loss percent',
    metric: 'median',
    range: completionMedianRange,
  });
  renderMetricPanel(svg, report, {
    x: 40,
    y: 662,
    width: 1360,
    height: 230,
    title: 'Completion p95 Gain',
    subtitle: 'Tail savings widen even more strongly under heavier impairment',
    axisLabel: 'filled green markers = primary cells, slate markers = non-primary cells',
    metric: 'p95',
    range: completionP95Range,
  });

  svg.push(`<circle cx="58" cy="926" r="6" fill="${primaryColor(true)}" stroke="#111827" stroke-width="0.5"/>`);
  svg.push(
    '<text x="74" y="930" font-family="system-ui, sans-serif" font-size="12" fill="#4b5563">primary cell</text>',
  );
  svg.push(`<circle cx="150" cy="926" r="6" fill="${primaryColor(false)}" stroke="#111827" stroke-width="0.5"/>`);
  svg.push(
    '<text x="166" y="930" font-family="system-ui, sans-serif" font-size="12" fill="#4b5563">non-primary cell</text>',
  );
  svg.push(`<line x1="276" y1="926" x2="314" y2="926" stroke="${metricColor('framing')}" stroke-width="2.5"/>`);
  svg.push(
    '<text x="322" y="930" font-family="system-ui, sans-serif" font-size="12" fill="#4b5563">framing gain</text>',
  );
  svg.push(`<line x1="414" y1="926" x2="452" y2="926" stroke="${metricColor('median')}" stroke-width="2.5"/>`);
  svg.push(
    '<text x="460" y="930" font-family="system-ui, sans-serif" font-size="12" fill="#4b5563">completion median gain</text>',
  );
  svg.push(`<line x1="616" y1="926" x2="654" y2="926" stroke="${metricColor('p95')}" stroke-width="2.5"/>`);
  svg.push(
    '<text x="662" y="930" font-family="system-ui, sans-serif" font-size="12" fill="#4b5563">completion p95 gain</text>',
  );

  svg.push('</svg>');
  return `${svg.join('')}\n`;
}
