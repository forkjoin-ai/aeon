type Regime = 'laminar' | 'transitional' | 'turbulent';

interface MetricRange {
  readonly low: number;
  readonly high: number;
}

interface SpeedupCurvePoint {
  readonly workload: number;
  readonly speedup: number;
}

interface SpeedupCurve {
  readonly stageCount: number;
  readonly chunkCount: number;
  readonly points: readonly SpeedupCurvePoint[];
}

interface RegimeCurvePoint {
  readonly reynolds: number;
  readonly idleFraction: number;
}

interface RegimeCurve {
  readonly stageCount: number;
  readonly points: readonly RegimeCurvePoint[];
}

interface FigureScenario {
  readonly id: string;
  readonly label: string;
  readonly workload?: number;
  readonly stageCount: number;
  readonly chunkCount: number;
  readonly speedup?: number;
  readonly idleFraction: number;
  readonly reynolds: number;
  readonly regime: Regime;
  readonly note?: string;
}

export interface Ch17InvertedScalingReynoldsFigureReport {
  readonly label: 'ch17-inverted-scaling-reynolds-figure-v1';
  readonly speedupFormula: string;
  readonly idleFormula: string;
  readonly reynoldsFormula: string;
  readonly balancedChunkRule: string;
  readonly stageFamilies: readonly number[];
  readonly workloadRange: MetricRange;
  readonly reynoldsRange: MetricRange;
  readonly speedupRange: MetricRange;
  readonly idleRange: MetricRange;
  readonly speedupCurves: readonly SpeedupCurve[];
  readonly regimeCurves: readonly RegimeCurve[];
  readonly scenarios: readonly FigureScenario[];
}

interface PlottedScenario extends FigureScenario {
  readonly workload: number;
  readonly speedup: number;
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

function formatRatio(value: number): string {
  if (value >= 100) {
    return `${trimFixed(value, 1)}x`;
  }
  if (value >= 10) {
    return `${trimFixed(value, 2)}x`;
  }
  return `${trimFixed(value, 3)}x`;
}

function formatPct(value: number): string {
  return `${trimFixed(value * 100, value >= 0.1 ? 1 : 2)}%`;
}

function formatRe(value: number): string {
  return trimFixed(value, value >= 10 ? 2 : 3);
}

function rangeFor(values: readonly number[]): MetricRange {
  return {
    low: Math.min(...values),
    high: Math.max(...values),
  };
}

function speedup(workload: number, stageCount: number, chunkCount: number): number {
  return (workload * stageCount) / (chunkCount + stageCount - 1);
}

function idleFraction(stageCount: number, chunkCount: number): number {
  return (stageCount - 1) / (chunkCount + stageCount - 1);
}

function reynolds(stageCount: number, chunkCount: number): number {
  return stageCount / chunkCount;
}

function regime(value: number): Regime {
  if (value < 0.3) {
    return 'laminar';
  }
  if (value <= 0.7) {
    return 'transitional';
  }
  return 'turbulent';
}

function stageColor(stageCount: number): string {
  switch (stageCount) {
    case 2:
      return '#0f766e';
    case 4:
      return '#1d4ed8';
    case 8:
      return '#c2410c';
    case 10:
      return '#7c3aed';
    case 16:
      return '#b45309';
    default:
      return '#475569';
  }
}

function isPlottedScenario(scenario: FigureScenario): scenario is PlottedScenario {
  return scenario.workload !== undefined && scenario.speedup !== undefined;
}

function regimeColor(value: Regime): string {
  switch (value) {
    case 'laminar':
      return '#15803d';
    case 'transitional':
      return '#a16207';
    case 'turbulent':
      return '#b91c1c';
  }
}

function logScale(value: number, range: MetricRange, start: number, span: number): number {
  const logMin = Math.log10(range.low);
  const logMax = Math.log10(range.high);
  const normalized = (Math.log10(value) - logMin) / (logMax - logMin);
  return start + normalized * span;
}

export function buildCh17InvertedScalingReynoldsFigureReport(): Ch17InvertedScalingReynoldsFigureReport {
  const stageFamilies = [2, 4, 8, 10] as const;
  const workloads = [10, 16, 24, 32, 48, 64, 96, 128, 192, 256, 384, 512] as const;
  const reynoldsSamples = [
    0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.7, 1, 1.5, 2, 4, 8, 16,
  ] as const;

  const speedupCurves = stageFamilies.map<SpeedupCurve>((stageCount) => ({
    stageCount,
    chunkCount: stageCount,
    points: workloads.map((workload) => ({
      workload,
      speedup: speedup(workload, stageCount, stageCount),
    })),
  }));

  const regimeCurves = [4, 8, 16].map<RegimeCurve>((stageCount) => ({
    stageCount,
    points: reynoldsSamples.map((sample) => {
      const chunkCount = stageCount / sample;
      return {
        reynolds: sample,
        idleFraction: idleFraction(stageCount, chunkCount),
      };
    }),
  }));

  const scenarios: FigureScenario[] = [
    {
      id: 'table-14x2',
      label: '14 tokens / 2 nodes',
      workload: 14,
      stageCount: 2,
      chunkCount: 7,
      speedup: 28 / 9,
      idleFraction: idleFraction(2, 7),
      reynolds: reynolds(2, 7),
      regime: regime(reynolds(2, 7)),
      note: 'includes one extra orchestration step in the companion table surface',
    },
    {
      id: 'table-100x4',
      label: '100 tokens / 4 nodes',
      workload: 100,
      stageCount: 4,
      chunkCount: 4,
      speedup: speedup(100, 4, 4),
      idleFraction: idleFraction(4, 4),
      reynolds: reynolds(4, 4),
      regime: regime(reynolds(4, 4)),
    },
    {
      id: 'table-500x8',
      label: '500 tokens / 8 nodes',
      workload: 500,
      stageCount: 8,
      chunkCount: 8,
      speedup: speedup(500, 8, 8),
      idleFraction: idleFraction(8, 8),
      reynolds: reynolds(8, 8),
      regime: regime(reynolds(8, 8)),
    },
    {
      id: 'table-100x10',
      label: '100 tokens / 10 nodes',
      workload: 100,
      stageCount: 10,
      chunkCount: 10,
      speedup: speedup(100, 10, 10),
      idleFraction: idleFraction(10, 10),
      reynolds: reynolds(10, 10),
      regime: regime(reynolds(10, 10)),
    },
    {
      id: 'http1-microfrontend',
      label: '95 resources / HTTP-1.1',
      stageCount: 95,
      chunkCount: 6,
      idleFraction: idleFraction(95, 6),
      reynolds: reynolds(95, 6),
      regime: regime(reynolds(95, 6)),
      note: 'six-connection browser limit keeps the page-load pipeline deeply turbulent',
    },
    {
      id: 'aeon-flow-microfrontend',
      label: '95 resources / Aeon Flow',
      stageCount: 95,
      chunkCount: 256,
      idleFraction: idleFraction(95, 256),
      reynolds: reynolds(95, 256),
      regime: regime(reynolds(95, 256)),
      note: 'widened transport capacity pulls the same resource graph into the transitional band',
    },
  ];

  return {
    label: 'ch17-inverted-scaling-reynolds-figure-v1',
    speedupFormula: 'Speedup = (P × N) / (C + N - 1)',
    idleFormula: 'idle = (N - 1) / (C + N - 1)',
    reynoldsFormula: 'Re = N / C',
    balancedChunkRule: 'Left-panel curves use the balanced-chunk cross-section C = N to expose the inverted-scaling slope directly.',
    stageFamilies: [...stageFamilies],
    workloadRange: rangeFor(workloads),
    reynoldsRange: { low: 0.1, high: 20 },
    speedupRange: rangeFor(
      speedupCurves.flatMap((curve) => curve.points.map((point) => point.speedup)).concat(
        scenarios.flatMap((scenario) => (scenario.speedup === undefined ? [] : [scenario.speedup])),
      ),
    ),
    idleRange: rangeFor(
      regimeCurves.flatMap((curve) => curve.points.map((point) => point.idleFraction)).concat(
        scenarios.map((scenario) => scenario.idleFraction),
      ),
    ),
    speedupCurves,
    regimeCurves,
    scenarios,
  };
}

export function renderCh17InvertedScalingReynoldsFigureMarkdown(
  report: Ch17InvertedScalingReynoldsFigureReport,
): string {
  const lines: string[] = [];
  lines.push('# Chapter 17 Inverted-Scaling and Reynolds Figure');
  lines.push('');
  lines.push(`- Label: \`${report.label}\``);
  lines.push(`- Speedup formula: \`${report.speedupFormula}\``);
  lines.push(`- Idle formula: \`${report.idleFormula}\``);
  lines.push(`- Reynolds formula: \`${report.reynoldsFormula}\``);
  lines.push(`- Balanced-chunk rule: ${report.balancedChunkRule}`);
  lines.push(
    `- Stage families: \`${report.stageFamilies.join(', ')}\`; workload sweep \`${report.workloadRange.low}\` to \`${report.workloadRange.high}\` items`,
  );
  lines.push(
    `- Reynolds sweep: \`${formatRe(report.reynoldsRange.low)}\` to \`${formatRe(report.reynoldsRange.high)}\`; idle range \`${formatPct(report.idleRange.low)}\` to \`${formatPct(report.idleRange.high)}\``,
  );
  lines.push('');
  lines.push('## Scenarios');
  lines.push('');
  lines.push('| Scenario | P | N | C | Speedup | Re | Idle | Regime |');
  lines.push('|---|---:|---:|---:|---:|---:|---:|---|');
  for (const scenario of report.scenarios) {
    lines.push(
      `| ${scenario.label} | ${scenario.workload === undefined ? 'n/a' : scenario.workload} | ${scenario.stageCount} | ${scenario.chunkCount} | ${scenario.speedup === undefined ? 'n/a' : formatRatio(scenario.speedup)} | ${formatRe(scenario.reynolds)} | ${formatPct(scenario.idleFraction)} | ${scenario.regime} |`,
    );
  }
  lines.push('');
  lines.push(
    'Interpretation: the left panel isolates the inverted-scaling story under the balanced-chunk cross-section, while the right panel maps the same chunk-count language into laminar/transitional/turbulent bands and overlays the manuscript scenarios plus the HTTP/1.1 vs Aeon Flow transport example.',
  );

  return `${lines.join('\n')}\n`;
}

function renderSpeedupPanel(
  svg: string[],
  report: Ch17InvertedScalingReynoldsFigureReport,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  svg.push(
    `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="18" fill="#fffdfa" stroke="#d6d3c7"/>`,
  );
  svg.push(
    `<text x="${x + 24}" y="${y + 34}" font-family="Georgia, serif" font-size="20" fill="#111827">Inverted Scaling Under Balanced Chunks</text>`,
  );
  svg.push(
    `<text x="${x + 24}" y="${y + 56}" font-family="Georgia, serif" font-size="13" fill="#4b5563">Curves use C = N, so the ideal step-count slope is visible as workload grows.</text>`,
  );

  const innerX = x + 74;
  const innerY = y + 92;
  const innerWidth = width - 108;
  const innerHeight = height - 160;
  const xRange = report.workloadRange;
  const yMax = Math.ceil((report.speedupRange.high + 10) / 25) * 25;

  for (const workload of [10, 20, 50, 100, 200, 500]) {
    const cx = logScale(workload, xRange, innerX, innerWidth);
    svg.push(
      `<line x1="${cx}" y1="${innerY}" x2="${cx}" y2="${innerY + innerHeight}" stroke="#e5e7eb" stroke-width="1"/>`,
    );
    svg.push(
      `<text x="${cx}" y="${innerY + innerHeight + 22}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#6b7280">${workload}</text>`,
    );
  }

  for (let tick = 0; tick <= yMax; tick += 50) {
    const cy = innerY + innerHeight - (tick / yMax) * innerHeight;
    svg.push(
      `<line x1="${innerX}" y1="${cy}" x2="${innerX + innerWidth}" y2="${cy}" stroke="#e5e7eb" stroke-width="1"/>`,
    );
    svg.push(
      `<text x="${innerX - 12}" y="${cy + 4}" text-anchor="end" font-family="system-ui, sans-serif" font-size="11" fill="#6b7280">${tick}</text>`,
    );
  }

  report.speedupCurves.forEach((curve) => {
    const color = stageColor(curve.stageCount);
    const path = curve.points
      .map((point, index) => {
        const cx = logScale(point.workload, xRange, innerX, innerWidth);
        const cy = innerY + innerHeight - (point.speedup / yMax) * innerHeight;
        return `${index === 0 ? 'M' : 'L'} ${cx} ${cy}`;
      })
      .join(' ');
    svg.push(
      `<path d="${path}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,
    );
  });

  report.scenarios
    .filter(isPlottedScenario)
    .forEach((scenario) => {
      const cx = logScale(scenario.workload, xRange, innerX, innerWidth);
      const cy = innerY + innerHeight - (scenario.speedup / yMax) * innerHeight;
      const color = stageColor(scenario.stageCount);
      svg.push(
        `<circle cx="${cx}" cy="${cy}" r="6" fill="#ffffff" stroke="${color}" stroke-width="3"/>`,
      );
      svg.push(
        `<text x="${cx + 10}" y="${cy - 10}" font-family="system-ui, sans-serif" font-size="11" fill="#374151">${escapeXml(scenario.label)}</text>`,
      );
    });

  svg.push(
    `<text x="${innerX + innerWidth / 2}" y="${innerY + innerHeight + 48}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" fill="#6b7280">Workload P (items, log scale)</text>`,
  );
  svg.push(
    `<text x="${innerX - 52}" y="${innerY + innerHeight / 2}" transform="rotate(-90 ${innerX - 52} ${innerY + innerHeight / 2})" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" fill="#6b7280">Modeled step-count speedup</text>`,
  );

  report.speedupCurves.forEach((curve, index) => {
    const legendY = y + height - 26 - (report.speedupCurves.length - 1 - index) * 20;
    const color = stageColor(curve.stageCount);
    svg.push(
      `<line x1="${x + width - 148}" y1="${legendY}" x2="${x + width - 120}" y2="${legendY}" stroke="${color}" stroke-width="3"/>`,
    );
    svg.push(
      `<text x="${x + width - 112}" y="${legendY + 4}" font-family="system-ui, sans-serif" font-size="11" fill="#374151">N = ${curve.stageCount}, C = ${curve.chunkCount}</text>`,
    );
  });
}

function renderRegimePanel(
  svg: string[],
  report: Ch17InvertedScalingReynoldsFigureReport,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  svg.push(
    `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="18" fill="#f8fafc" stroke="#cbd5e1"/>`,
  );
  svg.push(
    `<text x="${x + 24}" y="${y + 34}" font-family="Georgia, serif" font-size="20" fill="#111827">Reynolds Regime Map</text>`,
  );
  svg.push(
    `<text x="${x + 24}" y="${y + 56}" font-family="Georgia, serif" font-size="13" fill="#4b5563">Idle fraction under the tested formula idle = (N - 1)/(C + N - 1), shaded by the manuscript Re bands.</text>`,
  );

  const innerX = x + 72;
  const innerY = y + 92;
  const innerWidth = width - 108;
  const innerHeight = height - 160;
  const xRange = report.reynoldsRange;

  const bandSpecs = [
    { low: 0.1, high: 0.3, fill: '#dcfce7', label: 'laminar' },
    { low: 0.3, high: 0.7, fill: '#fef3c7', label: 'transitional' },
    { low: 0.7, high: 20, fill: '#fee2e2', label: 'turbulent' },
  ] as const;

  for (const band of bandSpecs) {
    const startX = logScale(band.low, xRange, innerX, innerWidth);
    const endX = logScale(band.high, xRange, innerX, innerWidth);
    svg.push(
      `<rect x="${startX}" y="${innerY}" width="${endX - startX}" height="${innerHeight}" fill="${band.fill}" opacity="0.55"/>`,
    );
    svg.push(
      `<text x="${(startX + endX) / 2}" y="${innerY + 22}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#475569">${band.label}</text>`,
    );
  }

  for (const reTick of [0.1, 0.2, 0.3, 0.5, 0.7, 1, 2, 5, 10, 20]) {
    const cx = logScale(reTick, xRange, innerX, innerWidth);
    svg.push(
      `<line x1="${cx}" y1="${innerY}" x2="${cx}" y2="${innerY + innerHeight}" stroke="#e2e8f0" stroke-width="1"/>`,
    );
    svg.push(
      `<text x="${cx}" y="${innerY + innerHeight + 22}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#6b7280">${formatRe(reTick)}</text>`,
    );
  }

  for (let tick = 0; tick <= 1; tick += 0.2) {
    const cy = innerY + innerHeight - tick * innerHeight;
    svg.push(
      `<line x1="${innerX}" y1="${cy}" x2="${innerX + innerWidth}" y2="${cy}" stroke="#e2e8f0" stroke-width="1"/>`,
    );
    svg.push(
      `<text x="${innerX - 12}" y="${cy + 4}" text-anchor="end" font-family="system-ui, sans-serif" font-size="11" fill="#6b7280">${trimFixed(tick * 100, 0)}%</text>`,
    );
  }

  report.regimeCurves.forEach((curve) => {
    const color = stageColor(curve.stageCount);
    const path = curve.points
      .map((point, index) => {
        const cx = logScale(point.reynolds, xRange, innerX, innerWidth);
        const cy = innerY + innerHeight - point.idleFraction * innerHeight;
        return `${index === 0 ? 'M' : 'L'} ${cx} ${cy}`;
      })
      .join(' ');
    svg.push(
      `<path d="${path}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`,
    );
  });

  report.scenarios.forEach((scenario) => {
    const cx = logScale(scenario.reynolds, xRange, innerX, innerWidth);
    const cy = innerY + innerHeight - scenario.idleFraction * innerHeight;
    const color = regimeColor(scenario.regime);
    svg.push(
      `<circle cx="${cx}" cy="${cy}" r="5.5" fill="${color}" stroke="#ffffff" stroke-width="2"/>`,
    );
    svg.push(
      `<text x="${cx + 8}" y="${cy - 8}" font-family="system-ui, sans-serif" font-size="10.5" fill="#374151">${escapeXml(scenario.label)}</text>`,
    );
  });

  svg.push(
    `<text x="${innerX + innerWidth / 2}" y="${innerY + innerHeight + 48}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" fill="#6b7280">Pipeline Reynolds number Re = N / C (log scale)</text>`,
  );
  svg.push(
    `<text x="${innerX - 50}" y="${innerY + innerHeight / 2}" transform="rotate(-90 ${innerX - 50} ${innerY + innerHeight / 2})" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" fill="#6b7280">Idle node-slot fraction</text>`,
  );

  report.regimeCurves.forEach((curve, index) => {
    const legendY = y + height - 26 - (report.regimeCurves.length - 1 - index) * 20;
    const color = stageColor(curve.stageCount);
    svg.push(
      `<line x1="${x + width - 120}" y1="${legendY}" x2="${x + width - 92}" y2="${legendY}" stroke="${color}" stroke-width="2.5"/>`,
    );
    svg.push(
      `<text x="${x + width - 84}" y="${legendY + 4}" font-family="system-ui, sans-serif" font-size="11" fill="#374151">N = ${curve.stageCount}</text>`,
    );
  });
}

export function renderCh17InvertedScalingReynoldsFigureSvg(
  report: Ch17InvertedScalingReynoldsFigureReport,
): string {
  const svg: string[] = [];
  svg.push('<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="820" viewBox="0 0 1280 820" role="img" aria-labelledby="title desc">');
  svg.push('<title id="title">Chapter 17 inverted-scaling and Reynolds-regime figure</title>');
  svg.push(
    '<desc id="desc">Two-panel analytic figure showing workload-speedup curves under balanced chunks and a Reynolds-number regime map with manuscript scenarios overlaid.</desc>',
  );
  svg.push('<rect width="1280" height="820" fill="#f3efe5"/>');
  svg.push('<rect x="22" y="22" width="1236" height="776" rx="28" fill="#f7f4ea" stroke="#d6d3c7"/>');
  svg.push('<text x="60" y="82" font-family="Georgia, serif" font-size="32" fill="#111827">Inverted Scaling and Reynolds Regimes</text>');
  svg.push(
    `<text x="60" y="114" font-family="Georgia, serif" font-size="15" fill="#4b5563">${escapeXml(report.speedupFormula)} | ${escapeXml(report.idleFormula)} | ${escapeXml(report.reynoldsFormula)}</text>`,
  );
  svg.push(
    `<text x="60" y="136" font-family="system-ui, sans-serif" font-size="12" fill="#6b7280">${escapeXml(report.balancedChunkRule)}</text>`,
  );

  renderSpeedupPanel(svg, report, 52, 168, 620, 610);
  renderRegimePanel(svg, report, 700, 168, 528, 610);

  svg.push('</svg>');
  return `${svg.join('')}\n`;
}
