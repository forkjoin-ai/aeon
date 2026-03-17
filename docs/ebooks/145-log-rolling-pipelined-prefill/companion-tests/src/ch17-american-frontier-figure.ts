/**
 * ch17-american-frontier-figure.ts
 *
 * Generates the American Frontier figure: a three-panel visualization showing
 * that diversity-vs-waste traces the same monotone Pareto frontier across
 * three substrates (protocol framing, pipeline scheduling, compression strategy).
 *
 * The American Frontier: waste is monotonically non-increasing in diversity,
 * reaching zero at matched diversity (β₁ = β₁*). Every shootoff in the paper
 * is an instantiation of this single curve on a different substrate.
 */

// ─── Data types ──────────────────────────────────────────────────────

export interface ProtocolPoint {
  readonly protocol: string;
  readonly shortLabel: string;
  readonly overheadPct: number;
  readonly wireKB: number;
  readonly rtts: number;
  readonly beta1Effective: number;
}

export interface PipelinePoint {
  readonly reynolds: number;
  readonly idleFraction: number;
}

export interface CompressionCorpusPoint {
  readonly corpus: string;
  readonly shortLabel: string;
  readonly gainVsHeuristicPct: number;
  readonly gainVsBestFixedPct: number;
  readonly winRate: number;
}

export interface AmericanFrontierReport {
  readonly label: 'ch17-american-frontier-figure-v1';

  readonly protocol: {
    readonly siteName: string;
    readonly resourceCount: number;
    readonly beta1Star: number;
    readonly points: readonly ProtocolPoint[];
  };

  readonly pipeline: {
    readonly stageCount: number;
    readonly points: readonly PipelinePoint[];
  };

  readonly compression: {
    readonly corpusCount: number;
    readonly points: readonly CompressionCorpusPoint[];
  };

  /** American Frontier properties (from the Lean theorem). */
  readonly frontierProperties: {
    readonly monotone: boolean;
    readonly zeroAtMatch: boolean;
    readonly positiveBelow: boolean;
    readonly pigeonholeWitness: boolean;
  };
}

// ─── Data builder ────────────────────────────────────────────────────

export function buildAmericanFrontierReport(): AmericanFrontierReport {
  // Protocol shootoff data (microfrontend, 95 resources, ~1.8 MB)
  const protocolPoints: ProtocolPoint[] = [
    {
      protocol: 'HTTP/1.1',
      shortLabel: 'H1',
      overheadPct: 31.0,
      wireKB: 187,
      rtts: 16,
      beta1Effective: 0,
    },
    {
      protocol: 'HTTP/2',
      shortLabel: 'H2',
      overheadPct: 5.8,
      wireKB: 137,
      rtts: 2,
      beta1Effective: 94,
    },
    {
      protocol: 'HTTP/3',
      shortLabel: 'H3',
      overheadPct: 4.4,
      wireKB: 135,
      rtts: 1,
      beta1Effective: 94,
    },
    {
      protocol: 'Aeon Flow',
      shortLabel: 'AF',
      overheadPct: 1.5,
      wireKB: 131,
      rtts: 1,
      beta1Effective: 94,
    },
  ];

  // Pipeline scheduling data (4-stage family from Reynolds figure)
  const pipelinePoints: PipelinePoint[] = [
    { reynolds: 0.1, idleFraction: 0.07 },
    { reynolds: 0.2, idleFraction: 0.13 },
    { reynolds: 0.3, idleFraction: 0.184 },
    { reynolds: 0.5, idleFraction: 0.273 },
    { reynolds: 0.7, idleFraction: 0.344 },
    { reynolds: 1.0, idleFraction: 0.429 },
    { reynolds: 1.5, idleFraction: 0.529 },
    { reynolds: 2.0, idleFraction: 0.6 },
    { reynolds: 4.0, idleFraction: 0.75 },
    { reynolds: 8.0, idleFraction: 0.857 },
    { reynolds: 16.0, idleFraction: 0.923 },
  ];

  // Compression topology data (Gate 3 corpus results)
  const compressionPoints: CompressionCorpusPoint[] = [
    {
      corpus: 'text-homogeneous',
      shortLabel: 'text',
      gainVsHeuristicPct: 0.83,
      gainVsBestFixedPct: 0.83,
      winRate: 1.0,
    },
    {
      corpus: 'web-mixed',
      shortLabel: 'web',
      gainVsHeuristicPct: 0.78,
      gainVsBestFixedPct: 0.005,
      winRate: 1.0,
    },
    {
      corpus: 'media-plus-metadata',
      shortLabel: 'media',
      gainVsHeuristicPct: 7.44,
      gainVsBestFixedPct: 0.001,
      winRate: 1.0,
    },
    {
      corpus: 'polyglot-bundle',
      shortLabel: 'polyglot',
      gainVsHeuristicPct: 26.65,
      gainVsBestFixedPct: 0.003,
      winRate: 1.0,
    },
    {
      corpus: 'api-telemetry',
      shortLabel: 'api',
      gainVsHeuristicPct: 46.37,
      gainVsBestFixedPct: 0.008,
      winRate: 1.0,
    },
  ];

  return {
    label: 'ch17-american-frontier-figure-v1',

    protocol: {
      siteName: 'Microfrontend (95 resources)',
      resourceCount: 95,
      beta1Star: 94,
      points: protocolPoints,
    },

    pipeline: {
      stageCount: 4,
      points: pipelinePoints,
    },

    compression: {
      corpusCount: 5,
      points: compressionPoints,
    },

    frontierProperties: {
      monotone: true,
      zeroAtMatch: true,
      positiveBelow: true,
      pigeonholeWitness: true,
    },
  };
}

// ─── Markdown renderer ───────────────────────────────────────────────

export function renderAmericanFrontierMarkdown(
  report: AmericanFrontierReport,
): string {
  const lines: string[] = [];
  lines.push('# American Frontier: Diversity vs Waste\n');
  lines.push(
    'The Pareto frontier of diversity vs waste across three substrates.\n',
  );

  lines.push('## Panel A: Protocol Framing Overhead\n');
  lines.push(
    `Site: ${report.protocol.siteName}, β₁* = ${report.protocol.beta1Star}\n`,
  );
  lines.push('| Protocol | Overhead % | Wire KB | RTTs |');
  lines.push('|----------|-----------|---------|------|');
  for (const p of report.protocol.points) {
    lines.push(
      `| ${p.protocol} | ${p.overheadPct}% | ${p.wireKB} | ${p.rtts} |`,
    );
  }

  lines.push('\n## Panel B: Pipeline Idle Fraction\n');
  lines.push(`${report.pipeline.stageCount}-stage pipeline:\n`);
  lines.push('| Re | Idle Fraction |');
  lines.push('|----|--------------|');
  for (const p of report.pipeline.points) {
    lines.push(`| ${p.reynolds} | ${(p.idleFraction * 100).toFixed(1)}% |`);
  }

  lines.push('\n## Panel C: Compression Topology Gain\n');
  lines.push('| Corpus | Gain vs Heuristic | Win Rate |');
  lines.push('|--------|------------------|----------|');
  for (const p of report.compression.points) {
    lines.push(
      `| ${p.corpus} | ${p.gainVsHeuristicPct.toFixed(2)}% | ${(p.winRate * 100).toFixed(0)}% |`,
    );
  }

  lines.push(
    '\n## Frontier Properties (mechanized in AmericanFrontier.lean)\n',
  );
  const fp = report.frontierProperties;
  lines.push(`- Monotone: ${fp.monotone}`);
  lines.push(`- Zero at match: ${fp.zeroAtMatch}`);
  lines.push(`- Positive below match: ${fp.positiveBelow}`);
  lines.push(`- Pigeonhole witness: ${fp.pigeonholeWitness}`);

  return lines.join('\n');
}

// ─── SVG renderer ────────────────────────────────────────────────────

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
  if (!fixed.includes('.')) return fixed;
  return fixed.replace(/0+$/, '').replace(/\.$/, '');
}

const PANEL_W = 400;
const PANEL_H = 320;
const PAD_L = 60;
const PAD_R = 40;
const PAD_T = 50;
const PAD_B = 84;
const PLOT_W = PANEL_W - PAD_L - PAD_R;
const PLOT_H = PANEL_H - PAD_T - PAD_B;
const GAP = 30;
const TOTAL_W = PANEL_W * 3 + GAP * 2 + 40;
const TOTAL_H = PANEL_H + 90;

const TEAL = '#0f766e';
const ORANGE = '#c2410c';
const BLUE = '#2563eb';
const SLATE = '#64748b';
const BG = '#fafaf9';
const GRID = '#e2e8f0';
const TEXT = '#1e293b';
const LIGHT_TEXT = '#475569';

function panelX(panelIdx: number): number {
  return 20 + panelIdx * (PANEL_W + GAP);
}

function renderProtocolPanel(report: AmericanFrontierReport): string {
  const ox = panelX(0);
  const oy = 40;
  const points = report.protocol.points;
  const maxOverhead = 35; // round up from 31

  const lines: string[] = [];

  // Background
  lines.push(
    `<rect x="${ox}" y="${oy}" width="${PANEL_W}" height="${PANEL_H}" rx="12" fill="${BG}" stroke="${GRID}" stroke-width="1"/>`,
  );

  // Title
  lines.push(
    `<text x="${ox + PANEL_W / 2}" y="${oy + 24}" text-anchor="middle" font-size="13" font-weight="600" fill="${TEXT}">A. Protocol Framing Overhead</text>`,
  );

  // Y-axis gridlines and labels
  const yTicks = [0, 5, 10, 15, 20, 25, 30, 35];
  for (const tick of yTicks) {
    const yPos = oy + PAD_T + PLOT_H - (tick / maxOverhead) * PLOT_H;
    lines.push(
      `<line x1="${ox + PAD_L}" y1="${yPos}" x2="${ox + PAD_L + PLOT_W}" y2="${yPos}" stroke="${GRID}" stroke-width="0.5"/>`,
    );
    if (tick % 10 === 0) {
      lines.push(
        `<text x="${ox + PAD_L - 8}" y="${yPos + 4}" text-anchor="end" font-size="10" fill="${LIGHT_TEXT}">${tick}%</text>`,
      );
    }
  }

  // Y-axis label
  lines.push(
    `<text x="${ox + 14}" y="${oy + PAD_T + PLOT_H / 2}" text-anchor="middle" font-size="11" fill="${TEXT}" transform="rotate(-90,${ox + 14},${oy + PAD_T + PLOT_H / 2})">Framing overhead %</text>`,
  );

  // Bars
  const barW = PLOT_W / (points.length * 2);
  const colors = [ORANGE, '#d97706', '#ca8a04', TEAL];
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const cx =
      ox + PAD_L + (PLOT_W / points.length) * i + PLOT_W / points.length / 2;
    const barH = (p.overheadPct / maxOverhead) * PLOT_H;
    const barY = oy + PAD_T + PLOT_H - barH;
    lines.push(
      `<rect x="${cx - barW / 2}" y="${barY}" width="${barW}" height="${barH}" rx="3" fill="${colors[i]}" opacity="0.85"/>`,
    );
    // Value label
    lines.push(
      `<text x="${cx}" y="${barY - 6}" text-anchor="middle" font-size="10" font-weight="600" fill="${colors[i]}">${trimFixed(p.overheadPct, 1)}%</text>`,
    );
    // Protocol label
    lines.push(
      `<text x="${cx}" y="${oy + PAD_T + PLOT_H + 16}" text-anchor="middle" font-size="10" fill="${TEXT}">${escapeXml(p.shortLabel)}</text>`,
    );
  }

  // X-axis label
  lines.push(
    `<text x="${ox + PAD_L + PLOT_W / 2}" y="${oy + PAD_T + PLOT_H + 38}" text-anchor="middle" font-size="11" fill="${TEXT}">Protocol (increasing diversity →)</text>`,
  );

  // Frontier annotation: monotone decreasing arrow
  const arrowY = oy + PAD_T + 15;
  lines.push(
    `<line x1="${ox + PAD_L + 20}" y1="${arrowY}" x2="${ox + PAD_L + PLOT_W - 20}" y2="${arrowY + 40}" stroke="${TEAL}" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#arrowhead)"/>`,
  );

  return lines.join('\n');
}

function renderPipelinePanel(report: AmericanFrontierReport): string {
  const ox = panelX(1);
  const oy = 40;
  const points = report.pipeline.points;

  const lines: string[] = [];

  // Background
  lines.push(
    `<rect x="${ox}" y="${oy}" width="${PANEL_W}" height="${PANEL_H}" rx="12" fill="${BG}" stroke="${GRID}" stroke-width="1"/>`,
  );

  // Title
  lines.push(
    `<text x="${ox + PANEL_W / 2}" y="${oy + 24}" text-anchor="middle" font-size="13" font-weight="600" fill="${TEXT}">B. Pipeline Idle Fraction</text>`,
  );

  // Log-scale x-axis (Re from 0.1 to 16)
  const logMin = Math.log10(0.08);
  const logMax = Math.log10(20);
  const logRange = logMax - logMin;

  function xForRe(re: number): number {
    // Invert: low Re (high diversity) on RIGHT, high Re (low diversity) on LEFT
    const logRe = Math.log10(re);
    const frac = 1 - (logRe - logMin) / logRange;
    return ox + PAD_L + frac * PLOT_W;
  }

  function yForIdle(idle: number): number {
    return oy + PAD_T + PLOT_H - idle * PLOT_H;
  }

  // Y-axis gridlines
  for (let tick = 0; tick <= 100; tick += 20) {
    const yPos = yForIdle(tick / 100);
    lines.push(
      `<line x1="${ox + PAD_L}" y1="${yPos}" x2="${ox + PAD_L + PLOT_W}" y2="${yPos}" stroke="${GRID}" stroke-width="0.5"/>`,
    );
    lines.push(
      `<text x="${ox + PAD_L - 8}" y="${yPos + 4}" text-anchor="end" font-size="10" fill="${LIGHT_TEXT}">${tick}%</text>`,
    );
  }

  // Y-axis label
  lines.push(
    `<text x="${ox + 14}" y="${oy + PAD_T + PLOT_H / 2}" text-anchor="middle" font-size="11" fill="${TEXT}" transform="rotate(-90,${ox + 14},${oy + PAD_T + PLOT_H / 2})">Idle fraction (waste)</text>`,
  );

  // X-axis ticks
  const reTicks = [0.1, 0.5, 1, 2, 4, 8, 16];
  for (const re of reTicks) {
    const xPos = xForRe(re);
    lines.push(
      `<line x1="${xPos}" y1="${oy + PAD_T + PLOT_H}" x2="${xPos}" y2="${oy + PAD_T + PLOT_H + 5}" stroke="${LIGHT_TEXT}" stroke-width="0.5"/>`,
    );
    lines.push(
      `<text x="${xPos}" y="${oy + PAD_T + PLOT_H + 16}" text-anchor="middle" font-size="9" fill="${LIGHT_TEXT}">${re}</text>`,
    );
  }

  // X-axis label (inverted: low Re on right = high diversity)
  lines.push(
    `<text x="${ox + PAD_L + PLOT_W / 2}" y="${oy + PAD_T + PLOT_H + 52}" text-anchor="middle" font-size="11" fill="${TEXT}">← high diversity (low Re)     Re     low diversity (high Re) →</text>`,
  );

  // Curve
  const pathParts: string[] = [];
  for (let i = 0; i < points.length; i++) {
    const x = xForRe(points[i].reynolds);
    const y = yForIdle(points[i].idleFraction);
    pathParts.push(i === 0 ? `M${x},${y}` : `L${x},${y}`);
  }
  lines.push(
    `<path d="${pathParts.join(' ')}" fill="none" stroke="${BLUE}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`,
  );

  // Data points
  for (const p of points) {
    const x = xForRe(p.reynolds);
    const y = yForIdle(p.idleFraction);
    lines.push(
      `<circle cx="${x}" cy="${y}" r="3.5" fill="${BLUE}" stroke="white" stroke-width="1"/>`,
    );
  }

  // Regime annotations
  const laminarX = xForRe(0.15);
  const turbulentX = xForRe(8);
  lines.push(
    `<text x="${laminarX}" y="${oy + PAD_T + PLOT_H - 10}" text-anchor="middle" font-size="9" fill="${TEAL}" font-style="italic">laminar</text>`,
  );
  lines.push(
    `<text x="${turbulentX}" y="${oy + PAD_T + 20}" text-anchor="middle" font-size="9" fill="${ORANGE}" font-style="italic">turbulent</text>`,
  );

  return lines.join('\n');
}

function renderCompressionPanel(report: AmericanFrontierReport): string {
  const ox = panelX(2);
  const oy = 40;
  const points = report.compression.points;
  const maxGain = 50;

  const lines: string[] = [];

  // Background
  lines.push(
    `<rect x="${ox}" y="${oy}" width="${PANEL_W}" height="${PANEL_H}" rx="12" fill="${BG}" stroke="${GRID}" stroke-width="1"/>`,
  );

  // Title
  lines.push(
    `<text x="${ox + PANEL_W / 2}" y="${oy + 24}" text-anchor="middle" font-size="13" font-weight="600" fill="${TEXT}">C. Compression: Cost of Monoculture</text>`,
  );

  // Y-axis gridlines
  const yTicks = [0, 10, 20, 30, 40, 50];
  for (const tick of yTicks) {
    const yPos = oy + PAD_T + PLOT_H - (tick / maxGain) * PLOT_H;
    lines.push(
      `<line x1="${ox + PAD_L}" y1="${yPos}" x2="${ox + PAD_L + PLOT_W}" y2="${yPos}" stroke="${GRID}" stroke-width="0.5"/>`,
    );
    lines.push(
      `<text x="${ox + PAD_L - 8}" y="${yPos + 4}" text-anchor="end" font-size="10" fill="${LIGHT_TEXT}">${tick}%</text>`,
    );
  }

  // Y-axis label
  lines.push(
    `<text x="${ox + 14}" y="${oy + PAD_T + PLOT_H / 2}" text-anchor="middle" font-size="11" fill="${TEXT}" transform="rotate(-90,${ox + 14},${oy + PAD_T + PLOT_H / 2})">Heuristic waste (topology gain %)</text>`,
  );

  // Bars — ordered by ascending heterogeneity (ascending gain)
  const barW = PLOT_W / (points.length * 2);
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const cx =
      ox + PAD_L + (PLOT_W / points.length) * i + PLOT_W / points.length / 2;
    const barH = (p.gainVsHeuristicPct / maxGain) * PLOT_H;
    const barY = oy + PAD_T + PLOT_H - barH;

    // Color gradient: low gain = slate, high gain = orange
    const color =
      p.gainVsHeuristicPct < 5
        ? SLATE
        : p.gainVsHeuristicPct < 15
          ? '#d97706'
          : ORANGE;

    lines.push(
      `<rect x="${cx - barW / 2}" y="${barY}" width="${barW}" height="${barH}" rx="3" fill="${color}" opacity="0.85"/>`,
    );
    // Value label
    lines.push(
      `<text x="${cx}" y="${barY - 6}" text-anchor="middle" font-size="10" font-weight="600" fill="${color}">${trimFixed(p.gainVsHeuristicPct, 1)}%</text>`,
    );
    // Corpus label
    lines.push(
      `<text x="${cx}" y="${oy + PAD_T + PLOT_H + 16}" text-anchor="middle" font-size="9" fill="${TEXT}">${escapeXml(p.shortLabel)}</text>`,
    );
  }

  // X-axis label
  lines.push(
    `<text x="${ox + PAD_L + PLOT_W / 2}" y="${oy + PAD_T + PLOT_H + 38}" text-anchor="middle" font-size="11" fill="${TEXT}">Content heterogeneity (β₁* →)</text>`,
  );

  // Annotation: zero line = frontier
  lines.push(
    `<line x1="${ox + PAD_L}" y1="${oy + PAD_T + PLOT_H}" x2="${ox + PAD_L + PLOT_W}" y2="${oy + PAD_T + PLOT_H}" stroke="${TEAL}" stroke-width="1.5"/>`,
  );
  lines.push(
    `<text x="${ox + PAD_L + PLOT_W + 2}" y="${oy + PAD_T + PLOT_H + 4}" text-anchor="start" font-size="9" fill="${TEAL}" font-weight="600">frontier</text>`,
  );

  return lines.join('\n');
}

export function renderAmericanFrontierSvg(
  report: AmericanFrontierReport,
): string {
  const parts: string[] = [];

  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${TOTAL_W} ${TOTAL_H}" font-family="system-ui, -apple-system, sans-serif">`,
  );

  // Arrow marker
  parts.push('<defs>');
  parts.push(
    `<marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" fill="${TEAL}"/></marker>`,
  );
  parts.push('</defs>');

  // Main background
  parts.push(
    `<rect width="${TOTAL_W}" height="${TOTAL_H}" rx="18" fill="white" stroke="${GRID}" stroke-width="1"/>`,
  );

  // Supertitle
  parts.push(
    `<text x="${TOTAL_W / 2}" y="${26}" text-anchor="middle" font-size="16" font-weight="700" fill="${TEXT}">The American Frontier: Diversity vs Waste Across Three Substrates</text>`,
  );

  // Three panels
  parts.push(renderProtocolPanel(report));
  parts.push(renderPipelinePanel(report));
  parts.push(renderCompressionPanel(report));

  // Footer annotation
  parts.push(
    `<text x="${TOTAL_W / 2}" y="${TOTAL_H - 8}" text-anchor="middle" font-size="10" fill="${LIGHT_TEXT}">THM-AMERICAN-FRONTIER (AmericanFrontier.lean): waste monotonically non-increasing in diversity, zero at β₁ = β₁*, positive below — mechanized in Lean 4</text>`,
  );

  parts.push('</svg>');
  return parts.join('\n');
}
