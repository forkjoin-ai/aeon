import type { BootstrapInterval, Gate1Report } from './gate1-wallclock';

interface Gate1FigureCell {
  readonly cellId: string;
  readonly workloadLabel: string;
  readonly networkLabel: string;
  readonly primary: boolean;
  readonly sequentialP50Ms: number;
  readonly sequentialP50Ci: BootstrapInterval;
  readonly chunkedP50Ms: number;
  readonly chunkedP50Ci: BootstrapInterval;
  readonly speedupMedian: number;
  readonly speedupMedianCi: BootstrapInterval;
  readonly improvementMedianMs: number;
  readonly improvementMedianMsCi: BootstrapInterval;
}

export interface Ch17Gate1WallclockFigureReport {
  readonly label: 'ch17-gate1-wallclock-figure-v1';
  readonly sourceLabel: string;
  readonly executionMode: Gate1Report['execution']['mode'];
  readonly distinctEndpointHostCount: number;
  readonly primaryPassed: number;
  readonly primaryTotal: number;
  readonly speedupMedianRange: {
    readonly low: number;
    readonly high: number;
  };
  readonly minSpeedupCiLow: number;
  readonly minImprovementCiLowMs: number;
  readonly cells: readonly Gate1FigureCell[];
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
  return trimFixed(value, value >= 1_000 ? 0 : 2);
}

function formatRatio(value: number): string {
  return `${trimFixed(value, 3)}x`;
}

function formatLossPercent(lossRate: number): string {
  return `${trimFixed(lossRate * 100, 1)}%`;
}

function rowColor(primary: boolean): string {
  return primary ? '#0f766e' : '#64748b';
}

function latencyColor(kind: 'sequential' | 'chunked'): string {
  return kind === 'sequential' ? '#c2410c' : '#0f766e';
}

function speedupScale(
  value: number,
  minValue: number,
  maxValue: number,
  x: number,
  width: number
): number {
  if (maxValue <= minValue) {
    return x + width / 2;
  }

  return x + ((value - minValue) / (maxValue - minValue)) * width;
}

function latencyScale(value: number, x: number, width: number): number {
  const minValue = 250;
  const maxValue = 12_000;
  const logMin = Math.log10(minValue);
  const logMax = Math.log10(maxValue);
  const normalized = (Math.log10(value) - logMin) / (logMax - logMin);
  return x + normalized * width;
}

export function buildCh17Gate1WallclockFigureReport(
  report: Gate1Report
): Ch17Gate1WallclockFigureReport {
  const cells = report.cells.map<Gate1FigureCell>((cell) => ({
    cellId: cell.cellId,
    workloadLabel: `${cell.workload.tokens} tok • ${cell.workload.nodes} nodes • B${cell.workload.chunkSize}`,
    networkLabel: `RTT ${trimFixed(
      cell.network.rttMs,
      1
    )} ms • loss ${formatLossPercent(cell.network.lossRate)}`,
    primary: cell.network.primary,
    sequentialP50Ms: cell.sequential.p50Ms,
    sequentialP50Ci: cell.sequential.p50Ci,
    chunkedP50Ms: cell.chunked.p50Ms,
    chunkedP50Ci: cell.chunked.p50Ci,
    speedupMedian: cell.speedupMedian,
    speedupMedianCi: cell.speedupMedianCi,
    improvementMedianMs: cell.improvementMedianMs,
    improvementMedianMsCi: cell.improvementMedianMsCi,
  }));

  const speedupMedians = cells.map((cell) => cell.speedupMedian);
  const minSpeedupCiLow = Math.min(
    ...cells.map((cell) => cell.speedupMedianCi.low)
  );
  const minImprovementCiLowMs = Math.min(
    ...cells.map((cell) => cell.improvementMedianMsCi.low)
  );

  return {
    label: 'ch17-gate1-wallclock-figure-v1',
    sourceLabel: report.execution.label,
    executionMode: report.execution.mode,
    distinctEndpointHostCount: report.execution.distinctEndpointHostCount,
    primaryPassed: report.gate.passedPrimaryCells.length,
    primaryTotal: report.gate.primaryCells.length,
    speedupMedianRange: {
      low: Math.min(...speedupMedians),
      high: Math.max(...speedupMedians),
    },
    minSpeedupCiLow,
    minImprovementCiLowMs,
    cells,
  };
}

export function renderCh17Gate1WallclockFigureMarkdown(
  report: Ch17Gate1WallclockFigureReport
): string {
  const lines: string[] = [];
  lines.push('# Chapter 17 Gate 1 Wall-Clock Figure');
  lines.push('');
  lines.push(`- Label: \`${report.label}\``);
  lines.push(`- Source: \`${report.sourceLabel}\``);
  lines.push(`- Execution mode: \`${report.executionMode}\``);
  lines.push(
    `- Distinct endpoint hosts: \`${report.distinctEndpointHostCount}\``
  );
  lines.push(
    `- Primary cells passed: \`${report.primaryPassed}/${report.primaryTotal}\``
  );
  lines.push(
    `- Speedup median range: \`${formatRatio(
      report.speedupMedianRange.low
    )}\` to \`${formatRatio(report.speedupMedianRange.high)}\``
  );
  lines.push(
    `- Minimum speedup CI low: \`${formatRatio(report.minSpeedupCiLow)}\``
  );
  lines.push(
    `- Minimum latency-improvement CI low: \`${formatMs(
      report.minImprovementCiLowMs
    )} ms\``
  );
  lines.push('');
  lines.push('## Cells');
  lines.push('');
  lines.push(
    '| Cell | Workload | Network | Primary | Seq p50 (ms) | Chunked p50 (ms) | Median Speedup (95% CI) | Median Improvement (95% CI, ms) |'
  );
  lines.push('|---|---|---|---|---:|---:|---:|---:|');

  for (const cell of report.cells) {
    lines.push(
      `| ${cell.cellId} | ${cell.workloadLabel} | ${cell.networkLabel} | ${
        cell.primary ? 'yes' : 'no'
      } | ${formatMs(cell.sequentialP50Ms)} | ${formatMs(
        cell.chunkedP50Ms
      )} | ${formatRatio(cell.speedupMedian)} (${formatRatio(
        cell.speedupMedianCi.low
      )} to ${formatRatio(cell.speedupMedianCi.high)}) | ${formatMs(
        cell.improvementMedianMs
      )} (${formatMs(cell.improvementMedianMsCi.low)} to ${formatMs(
        cell.improvementMedianMsCi.high
      )}) |`
    );
  }

  lines.push('');
  lines.push(
    'Interpretation: the figure pairs a log-scale p50 latency dumbbell with speedup confidence intervals so the deployment-level separation is visible without collapsing the result into a single summary number.'
  );

  return `${lines.join('\n')}\n`;
}

export function renderCh17Gate1WallclockFigureSvg(
  report: Ch17Gate1WallclockFigureReport
): string {
  const width = 1460;
  const height = 1020;
  const rowStartY = 224;
  const rowGap = 66;
  const latencyPanelX = 324;
  const latencyPanelWidth = 430;
  const speedupPanelX = 812;
  const speedupPanelWidth = 320;
  const improvementColumnX = 1150;
  const rows = report.cells;
  const speedupMin = Math.floor((report.minSpeedupCiLow - 1) / 2) * 2;
  const speedupMax =
    Math.ceil(
      (Math.max(...rows.map((cell) => cell.speedupMedianCi.high)) + 1) / 2
    ) * 2;
  const speedupTicks: number[] = [];
  for (let tick = speedupMin; tick <= speedupMax; tick += 2) {
    speedupTicks.push(tick);
  }

  const svg: string[] = [];
  svg.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">`
  );
  svg.push('<title id="title">Chapter 17 Gate 1 wall-clock figure</title>');
  svg.push(
    '<desc id="desc">A log-scale p50 latency dumbbell for sequential versus chunked execution and a paired median speedup confidence-interval plot for the Gate 1 six-host wall-clock matrix.</desc>'
  );
  svg.push('<defs>');
  svg.push('<linearGradient id="gate1bg" x1="0%" y1="0%" x2="100%" y2="100%">');
  svg.push('<stop offset="0%" stop-color="#f7f3e8"/>');
  svg.push('<stop offset="100%" stop-color="#fffdf8"/>');
  svg.push('</linearGradient>');
  svg.push('</defs>');
  svg.push(
    `<rect width="${width}" height="${height}" rx="24" fill="url(#gate1bg)"/>`
  );
  svg.push(
    '<text x="48" y="58" font-family="Georgia, serif" font-size="30" fill="#111827">Chapter 17 Gate 1 Wall-Clock Matrix</text>'
  );
  svg.push(
    `<text x="48" y="88" font-family="Georgia, serif" font-size="15" fill="#4b5563">Source ${escapeXml(
      report.sourceLabel
    )} • ${report.distinctEndpointHostCount} distinct hosts • ${
      report.primaryPassed
    }/${report.primaryTotal} primary cells pass</text>`
  );
  svg.push(
    `<text x="48" y="114" font-family="Georgia, serif" font-size="15" fill="#4b5563">Median speedups span ${formatRatio(
      report.speedupMedianRange.low
    )}–${formatRatio(
      report.speedupMedianRange.high
    )}; minimum CI lows stay at ${formatRatio(
      report.minSpeedupCiLow
    )} and +${formatMs(report.minImprovementCiLowMs)} ms</text>`
  );

  const panelHeight = height - 180;
  svg.push(
    `<rect x="40" y="140" width="720" height="${panelHeight}" rx="18" fill="#fffdfa" stroke="#d6d3c7"/>`
  );
  svg.push(
    `<rect x="780" y="140" width="${
      width - 820
    }" height="${panelHeight}" rx="18" fill="#fffdfa" stroke="#d6d3c7"/>`
  );

  svg.push(
    '<text x="64" y="172" font-family="Georgia, serif" font-size="20" fill="#111827">p50 Completion Latency</text>'
  );
  svg.push(
    '<text x="64" y="194" font-family="Georgia, serif" font-size="13" fill="#4b5563">Sequential versus chunked medians on a log-scale millisecond axis</text>'
  );
  svg.push(
    '<text x="804" y="172" font-family="Georgia, serif" font-size="20" fill="#111827">Median Speedup</text>'
  );
  svg.push(
    '<text x="804" y="194" font-family="Georgia, serif" font-size="13" fill="#4b5563">Paired median speedup with 95% bootstrap confidence intervals</text>'
  );

  const latencyTicks = [300, 500, 1_000, 3_000, 10_000];
  const axisY = rowStartY + rowGap * rows.length + 12;
  const axisLabelY = axisY + 36;
  const legendY = height - 34;
  for (const tick of latencyTicks) {
    const x = latencyScale(tick, latencyPanelX, latencyPanelWidth);
    svg.push(
      `<line x1="${x}" y1="208" x2="${x}" y2="${axisY}" stroke="#e5e7eb" stroke-width="1"/>`
    );
    svg.push(
      `<text x="${x}" y="${
        axisY + 24
      }" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" fill="#6b7280">${formatMs(
        tick
      )}</text>`
    );
  }
  svg.push(
    `<text x="${
      latencyPanelX + latencyPanelWidth / 2
    }" y="${axisLabelY}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" fill="#6b7280">p50 latency (ms, log scale)</text>`
  );

  for (const tick of speedupTicks) {
    const x = speedupScale(
      tick,
      speedupMin,
      speedupMax,
      speedupPanelX,
      speedupPanelWidth
    );
    svg.push(
      `<line x1="${x}" y1="208" x2="${x}" y2="${axisY}" stroke="#e5e7eb" stroke-width="1"/>`
    );
    svg.push(
      `<text x="${x}" y="${
        axisY + 24
      }" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" fill="#6b7280">${tick}</text>`
    );
  }
  svg.push(
    `<text x="${
      speedupPanelX + speedupPanelWidth / 2
    }" y="${axisLabelY}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" fill="#6b7280">median speedup (x)</text>`
  );
  svg.push(
    `<text x="${improvementColumnX}" y="214" font-family="system-ui, sans-serif" font-size="12" fill="#6b7280">median gain</text>`
  );

  svg.push(
    `<line x1="68" y1="${height - 56}" x2="${width - 68}" y2="${
      height - 56
    }" stroke="#d6d3c7" stroke-width="1"/>`
  );
  svg.push(
    `<circle cx="96" cy="${legendY}" r="6" fill="${latencyColor('chunked')}"/>`
  );
  svg.push(
    `<text x="110" y="${
      legendY + 5
    }" font-family="system-ui, sans-serif" font-size="12" fill="#4b5563">chunked p50</text>`
  );
  svg.push(
    `<circle cx="188" cy="${legendY}" r="6" fill="${latencyColor(
      'sequential'
    )}"/>`
  );
  svg.push(
    `<text x="202" y="${
      legendY + 5
    }" font-family="system-ui, sans-serif" font-size="12" fill="#4b5563">sequential p50</text>`
  );
  svg.push(
    `<line x1="318" y1="${legendY - 6}" x2="354" y2="${
      legendY - 6
    }" stroke="#4b5563" stroke-width="3"/>`
  );
  svg.push(`<circle cx="336" cy="${legendY - 6}" r="5" fill="#0f766e"/>`);
  svg.push(
    `<text x="366" y="${
      legendY - 1
    }" font-family="system-ui, sans-serif" font-size="12" fill="#4b5563">speedup median with CI</text>`
  );

  rows.forEach((cell, index) => {
    const y = rowStartY + index * rowGap;
    const color = rowColor(cell.primary);
    const rowFill = index % 2 === 0 ? '#fffdfa' : '#f8fafc';

    svg.push(
      `<rect x="52" y="${
        y - 30
      }" width="692" height="54" rx="10" fill="${rowFill}" opacity="0.85"/>`
    );
    svg.push(
      `<rect x="792" y="${y - 30}" width="${
        width - 832
      }" height="54" rx="10" fill="${rowFill}" opacity="0.85"/>`
    );

    if (index === 5) {
      const divY = rowStartY + 5 * rowGap + rowGap / 2;
      svg.push(
        `<line x1="64" y1="${divY}" x2="${
          width - 60
        }" y2="${divY}" stroke="#d6d3c7" stroke-width="1.5"/>`
      );
    }

    svg.push(`<circle cx="72" cy="${y - 5}" r="6" fill="${color}"/>`);
    svg.push(
      `<text x="88" y="${
        y - 2
      }" font-family="Georgia, serif" font-size="15" fill="#111827">${escapeXml(
        cell.workloadLabel
      )}</text>`
    );
    svg.push(
      `<text x="88" y="${
        y + 18
      }" font-family="system-ui, sans-serif" font-size="12" fill="#6b7280">${escapeXml(
        cell.networkLabel
      )}${cell.primary ? ' • primary' : ' • non-primary'}</text>`
    );

    const chunkCiLow = latencyScale(
      cell.chunkedP50Ci.low,
      latencyPanelX,
      latencyPanelWidth
    );
    const chunkCiHigh = latencyScale(
      cell.chunkedP50Ci.high,
      latencyPanelX,
      latencyPanelWidth
    );
    const seqCiLow = latencyScale(
      cell.sequentialP50Ci.low,
      latencyPanelX,
      latencyPanelWidth
    );
    const seqCiHigh = latencyScale(
      cell.sequentialP50Ci.high,
      latencyPanelX,
      latencyPanelWidth
    );
    const chunkX = latencyScale(
      cell.chunkedP50Ms,
      latencyPanelX,
      latencyPanelWidth
    );
    const seqX = latencyScale(
      cell.sequentialP50Ms,
      latencyPanelX,
      latencyPanelWidth
    );

    svg.push(
      `<line x1="${chunkCiLow}" y1="${y + 8}" x2="${chunkCiHigh}" y2="${
        y + 8
      }" stroke="${latencyColor('chunked')}" stroke-width="3" opacity="0.35"/>`
    );
    svg.push(
      `<line x1="${seqCiLow}" y1="${y - 10}" x2="${seqCiHigh}" y2="${
        y - 10
      }" stroke="${latencyColor(
        'sequential'
      )}" stroke-width="3" opacity="0.35"/>`
    );
    svg.push(
      `<line x1="${chunkX}" y1="${y - 1}" x2="${seqX}" y2="${
        y - 1
      }" stroke="#94a3b8" stroke-width="2"/>`
    );
    svg.push(
      `<circle cx="${chunkX}" cy="${y - 1}" r="5.5" fill="${latencyColor(
        'chunked'
      )}" stroke="#ffffff" stroke-width="1.5"/>`
    );
    svg.push(
      `<circle cx="${seqX}" cy="${y - 1}" r="5.5" fill="${latencyColor(
        'sequential'
      )}" stroke="#ffffff" stroke-width="1.5"/>`
    );

    const speedupCiLowX = speedupScale(
      cell.speedupMedianCi.low,
      speedupMin,
      speedupMax,
      speedupPanelX,
      speedupPanelWidth
    );
    const speedupCiHighX = speedupScale(
      cell.speedupMedianCi.high,
      speedupMin,
      speedupMax,
      speedupPanelX,
      speedupPanelWidth
    );
    const speedupMedianX = speedupScale(
      cell.speedupMedian,
      speedupMin,
      speedupMax,
      speedupPanelX,
      speedupPanelWidth
    );
    const dotFill = cell.primary ? '#0f766e' : '#475569';
    const dotOpacity = cell.primary ? '1' : '0.75';

    svg.push(
      `<line x1="${speedupCiLowX}" y1="${y - 1}" x2="${speedupCiHighX}" y2="${
        y - 1
      }" stroke="${dotFill}" stroke-width="3" opacity="${dotOpacity}"/>`
    );
    svg.push(
      `<line x1="${speedupCiLowX}" y1="${y - 8}" x2="${speedupCiLowX}" y2="${
        y + 6
      }" stroke="${dotFill}" stroke-width="1.5" opacity="${dotOpacity}"/>`
    );
    svg.push(
      `<line x1="${speedupCiHighX}" y1="${y - 8}" x2="${speedupCiHighX}" y2="${
        y + 6
      }" stroke="${dotFill}" stroke-width="1.5" opacity="${dotOpacity}"/>`
    );
    svg.push(
      `<circle cx="${speedupMedianX}" cy="${
        y - 1
      }" r="5.5" fill="${dotFill}" opacity="${dotOpacity}"/>`
    );
    svg.push(
      `<text x="${improvementColumnX}" y="${
        y + 4
      }" font-family="system-ui, sans-serif" font-size="12" fill="#374151">+${formatMs(
        cell.improvementMedianMs
      )} ms</text>`
    );
  });

  svg.push('</svg>');
  return `${svg.join('')}\n`;
}
