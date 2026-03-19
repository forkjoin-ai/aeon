/**
 * ch17-american-frontier-figure.ts
 *
 * Generates the American Frontier figure as a four-panel frontier family.
 * The first three panels show the theorem on framing, scheduling, and
 * response encoding. The fourth panel adds the recursive wire witness:
 * diversity first chooses the representation, then diversity carries the
 * representation across the transport.
 */

export interface ProtocolPoint {
  readonly protocol: string;
  readonly shortLabel: string;
  readonly overheadPct: number;
  readonly wireKB: number;
  readonly rtts: number;
  readonly diversityOrder: number;
}

export interface PipelinePoint {
  readonly reynolds: number;
  readonly idleFraction: number;
}

export interface EncodingPoint {
  readonly corpus: string;
  readonly shortLabel: string;
  readonly heterogeneityOrder: number;
  readonly gainVsHeuristicPct: number;
  readonly gainVsBestFixedPct: number;
  readonly winRate: number;
}

export interface TransportPoint {
  readonly label: string;
  readonly tcpDelayMs: number;
  readonly requestsPerSec: number;
  readonly aeonWins: number;
  readonly httpWins: number;
  readonly skippedHttpHedges: number;
  readonly loserVentPct: number;
  readonly wasteBytesPerWin: number;
}

export interface RecursiveWireWitness {
  readonly workload: string;
  readonly zeroSkewRequestsPerSec: number;
  readonly zeroSkewAeonWinSharePct: number;
  readonly zeroSkewWasteBytesPerWin: number;
  readonly tcpDelay2msRequestsPerSec: number;
  readonly tcpDelay2msAeonWinSharePct: number;
  readonly tcpDelay2msWasteBytesPerWin: number;
  readonly throughputRetentionPct: number;
}

export interface AmericanFrontierReport {
  readonly label: 'ch17-american-frontier-figure-v2';

  readonly protocol: {
    readonly siteName: string;
    readonly resourceCount: number;
    readonly points: readonly ProtocolPoint[];
  };

  readonly pipeline: {
    readonly stageCount: number;
    readonly points: readonly PipelinePoint[];
  };

  readonly encoding: {
    readonly corpusCount: number;
    readonly points: readonly EncodingPoint[];
  };

  readonly transport: {
    readonly workload: string;
    readonly points: readonly TransportPoint[];
    readonly heavyWitness: RecursiveWireWitness;
  };

  readonly frontierProperties: {
    readonly monotone: boolean;
    readonly zeroAtMatch: boolean;
    readonly positiveBelow: boolean;
    readonly pigeonholeWitness: boolean;
    readonly recursiveAcrossLayers: boolean;
  };
}

function aeonWinSharePct(point: TransportPoint): number {
  const totalWins = point.aeonWins + point.httpWins;
  return totalWins === 0 ? 0 : (point.aeonWins / totalWins) * 100;
}

function protocolPoints(): ProtocolPoint[] {
  return [
    {
      protocol: 'HTTP/1.1',
      shortLabel: 'H1',
      overheadPct: 31.0,
      wireKB: 187,
      rtts: 16,
      diversityOrder: 1,
    },
    {
      protocol: 'HTTP/2',
      shortLabel: 'H2',
      overheadPct: 5.8,
      wireKB: 137,
      rtts: 2,
      diversityOrder: 2,
    },
    {
      protocol: 'HTTP/3',
      shortLabel: 'H3',
      overheadPct: 4.4,
      wireKB: 135,
      rtts: 1,
      diversityOrder: 3,
    },
    {
      protocol: 'Aeon Flow',
      shortLabel: 'AF',
      overheadPct: 1.5,
      wireKB: 131,
      rtts: 1,
      diversityOrder: 4,
    },
  ];
}

function pipelinePoints(): PipelinePoint[] {
  return [
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
}

function encodingPoints(): EncodingPoint[] {
  return [
    {
      corpus: 'text-homogeneous',
      shortLabel: 'text',
      heterogeneityOrder: 1,
      gainVsHeuristicPct: 0.83,
      gainVsBestFixedPct: 0.83,
      winRate: 1.0,
    },
    {
      corpus: 'web-mixed',
      shortLabel: 'web',
      heterogeneityOrder: 2,
      gainVsHeuristicPct: 0.78,
      gainVsBestFixedPct: 0.005,
      winRate: 1.0,
    },
    {
      corpus: 'media-plus-metadata',
      shortLabel: 'media',
      heterogeneityOrder: 3,
      gainVsHeuristicPct: 7.44,
      gainVsBestFixedPct: 0.001,
      winRate: 1.0,
    },
    {
      corpus: 'polyglot-bundle',
      shortLabel: 'polyglot',
      heterogeneityOrder: 4,
      gainVsHeuristicPct: 26.65,
      gainVsBestFixedPct: 0.003,
      winRate: 1.0,
    },
    {
      corpus: 'api-telemetry',
      shortLabel: 'api',
      heterogeneityOrder: 5,
      gainVsHeuristicPct: 46.37,
      gainVsBestFixedPct: 0.008,
      winRate: 1.0,
    },
  ];
}

function transportPoints(): TransportPoint[] {
  return [
    {
      label: '0 ms',
      tcpDelayMs: 0,
      requestsPerSec: 165_807.66,
      aeonWins: 709_652,
      httpWins: 1_820_058,
      skippedHttpHedges: 0,
      loserVentPct: 99.64,
      wasteBytesPerWin: 0.05,
    },
    {
      label: '0.25 ms',
      tcpDelayMs: 0.25,
      requestsPerSec: 56_130.28,
      aeonWins: 725_645,
      httpWins: 130_736,
      skippedHttpHedges: 399_721,
      loserVentPct: 99.61,
      wasteBytesPerWin: 0.03,
    },
    {
      label: '0.5 ms',
      tcpDelayMs: 0.5,
      requestsPerSec: 77_485.11,
      aeonWins: 1_028_706,
      httpWins: 172_414,
      skippedHttpHedges: 646_907,
      loserVentPct: 99.54,
      wasteBytesPerWin: 0.03,
    },
    {
      label: '1 ms',
      tcpDelayMs: 1,
      requestsPerSec: 98_045.19,
      aeonWins: 1_502_210,
      httpWins: 17_612,
      skippedHttpHedges: 1_240_698,
      loserVentPct: 99.15,
      wasteBytesPerWin: 0.02,
    },
    {
      label: '2 ms',
      tcpDelayMs: 2,
      requestsPerSec: 109_790.68,
      aeonWins: 1_670_747,
      httpWins: 3_660,
      skippedHttpHedges: 1_644_757,
      loserVentPct: 99.21,
      wasteBytesPerWin: 0.0,
    },
    {
      label: '4 ms',
      tcpDelayMs: 4,
      requestsPerSec: 111_570.09,
      aeonWins: 1_699_969,
      httpWins: 1_631,
      skippedHttpHedges: 1_699_075,
      loserVentPct: 99.76,
      wasteBytesPerWin: 0.0,
    },
  ];
}

export function buildAmericanFrontierReport(): AmericanFrontierReport {
  const transport = transportPoints();
  const heavyZeroSkewRequestsPerSec = 248_714.95;
  const heavyZeroSkewAeonWins = 7_740;
  const heavyZeroSkewHttpWins = 7_575_940;
  const heavyDelayRequestsPerSec = 221_606.8;
  const heavyDelayAeonWins = 6_698_051;
  const heavyDelayHttpWins = 5_995;

  return {
    label: 'ch17-american-frontier-figure-v2',
    protocol: {
      siteName: 'Microfrontend (95 resources)',
      resourceCount: 95,
      points: protocolPoints(),
    },
    pipeline: {
      stageCount: 4,
      points: pipelinePoints(),
    },
    encoding: {
      corpusCount: 5,
      points: encodingPoints(),
    },
    transport: {
      workload:
        'Same-request Aeon/UDP vs HTTP/TCP mixed race, plaintext, 64 clients, depth 16',
      points: transport,
      heavyWitness: {
        workload:
          'Same-request Aeon/UDP vs HTTP/TCP mixed race, plaintext, 256 clients, depth 256',
        zeroSkewRequestsPerSec: heavyZeroSkewRequestsPerSec,
        zeroSkewAeonWinSharePct:
          (heavyZeroSkewAeonWins / (heavyZeroSkewAeonWins + heavyZeroSkewHttpWins)) *
          100,
        zeroSkewWasteBytesPerWin: 0.5,
        tcpDelay2msRequestsPerSec: heavyDelayRequestsPerSec,
        tcpDelay2msAeonWinSharePct:
          (heavyDelayAeonWins / (heavyDelayAeonWins + heavyDelayHttpWins)) * 100,
        tcpDelay2msWasteBytesPerWin: 0.02,
        throughputRetentionPct:
          (heavyDelayRequestsPerSec / heavyZeroSkewRequestsPerSec) * 100,
      },
    },
    frontierProperties: {
      monotone: true,
      zeroAtMatch: true,
      positiveBelow: true,
      pigeonholeWitness: true,
      recursiveAcrossLayers: true,
    },
  };
}

export function renderAmericanFrontierMarkdown(
  report: AmericanFrontierReport,
): string {
  const lines: string[] = [];
  lines.push('# American Frontier: Frontier Curves and Recursive Wire Witness\n');
  lines.push(
    'The American Frontier rendered as curve families across framing, scheduling, response encoding, and the recursive wire hedge.\n',
  );

  lines.push('## Panel A: Framing Waste by Protocol\n');
  lines.push(`Site: ${report.protocol.siteName}\n`);
  lines.push('| Protocol | Overhead % | Wire KB | RTTs |');
  lines.push('|----------|-----------:|--------:|-----:|');
  for (const point of report.protocol.points) {
    lines.push(
      `| ${point.protocol} | ${trimFixed(point.overheadPct, 1)}% | ${point.wireKB} | ${point.rtts} |`,
    );
  }

  lines.push('\n## Panel B: Idle Waste by Reynolds Regime\n');
  lines.push(`${report.pipeline.stageCount}-stage pipeline:\n`);
  lines.push('| Reynolds | Idle Fraction |');
  lines.push('|---------:|--------------:|');
  for (const point of report.pipeline.points) {
    lines.push(
      `| ${trimFixed(point.reynolds, 1)} | ${(point.idleFraction * 100).toFixed(1)}% |`,
    );
  }

  lines.push('\n## Panel C: Encoding Waste by Content Mix\n');
  lines.push('| Corpus | Heuristic waste | Gain vs best fixed | Win rate |');
  lines.push('|--------|----------------:|-------------------:|---------:|');
  for (const point of report.encoding.points) {
    lines.push(
      `| ${point.corpus} | ${point.gainVsHeuristicPct.toFixed(2)}% | ${point.gainVsBestFixedPct.toFixed(3)}% | ${(point.winRate * 100).toFixed(0)}% |`,
    );
  }

  lines.push('\n## Panel D: Aeon/UDP vs HTTP/TCP Mixed Race\n');
  lines.push(`${report.transport.workload}\n`);
  lines.push(
    '| TCP hedge delay | Req/s | Aeon win share | Waste bytes/win | Loser vent % | Skipped HTTP hedges |',
  );
  lines.push(
    '|----------------|------:|---------------:|-----------------:|-------------:|--------------------:|',
  );
  for (const point of report.transport.points) {
    lines.push(
      `| ${point.label} | ${point.requestsPerSec.toFixed(2)} | ${aeonWinSharePct(point).toFixed(2)}% | ${point.wasteBytesPerWin.toFixed(2)} | ${point.loserVentPct.toFixed(2)}% | ${point.skippedHttpHedges.toLocaleString('en-US')} |`,
    );
  }

  const heavy = report.transport.heavyWitness;
  lines.push('\n## Recursive Heavy Witness\n');
  lines.push(
    `At ${heavy.workload}, zero skew sits at ${heavy.zeroSkewAeonWinSharePct.toFixed(2)}% Aeon share and ${heavy.zeroSkewWasteBytesPerWin.toFixed(2)} waste bytes/win. A 2 ms TCP hedge delay moves the same workload to ${heavy.tcpDelay2msAeonWinSharePct.toFixed(2)}% Aeon share and ${heavy.tcpDelay2msWasteBytesPerWin.toFixed(2)} waste bytes/win while retaining ${heavy.throughputRetentionPct.toFixed(1)}% of zero-skew throughput.`,
  );

  lines.push('\n## Recursive Claim\n');
  lines.push(
    'Panels C and D are the same theorem at two layers: diversity first encodes the response, then diversity carries the response on the wire. The hedge delay acts as an inverse-Bule control knob that suppresses unnecessary loser launches before they become waste.',
  );

  lines.push(
    '\n## Frontier Properties (mechanized in AmericanFrontier.lean)\n',
  );
  lines.push(`- Monotone: ${report.frontierProperties.monotone}`);
  lines.push(`- Zero at match: ${report.frontierProperties.zeroAtMatch}`);
  lines.push(
    `- Positive below match: ${report.frontierProperties.positiveBelow}`,
  );
  lines.push(
    `- Pigeonhole witness: ${report.frontierProperties.pigeonholeWitness}`,
  );
  lines.push(
    `- Recursive across layers: ${report.frontierProperties.recursiveAcrossLayers}`,
  );

  return `${lines.join('\n')}\n`;
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
  if (!fixed.includes('.')) return fixed;
  return fixed.replace(/0+$/, '').replace(/\.$/, '');
}

const PANEL_W = 448;
const PANEL_H = 332;
const PAD_L = 66;
const PAD_R = 28;
const PAD_T = 84;
const PAD_B = 64;
const PLOT_W = PANEL_W - PAD_L - PAD_R;
const PLOT_H = PANEL_H - PAD_T - PAD_B;
const OUTER_PAD = 28;
const COL_GAP = 28;
const ROW_GAP = 28;
const HEADER_H = 74;
const FOOTER_H = 112;
const TOTAL_W = OUTER_PAD * 2 + PANEL_W * 2 + COL_GAP;
const TOTAL_H = HEADER_H + OUTER_PAD + PANEL_H * 2 + ROW_GAP + FOOTER_H;

const BG = '#fcfaf5';
const PANEL_BG = '#fffef9';
const GRID = '#d7dee7';
const TEXT = '#0f172a';
const LIGHT_TEXT = '#334155';
const MUTED_TEXT = '#64748b';
const TEAL = '#0f766e';
const TEAL_FILL = '#5eead4';
const BLUE = '#2563eb';
const BLUE_FILL = '#93c5fd';
const ORANGE = '#c2410c';
const ORANGE_FILL = '#fdba74';
const RED = '#b91c1c';
const RED_FILL = '#fca5a5';
const GOLD = '#a16207';
const WHITE = '#ffffff';

function panelOrigin(panelIndex: number): { x: number; y: number } {
  const col = panelIndex % 2;
  const row = Math.floor(panelIndex / 2);
  return {
    x: OUTER_PAD + col * (PANEL_W + COL_GAP),
    y: HEADER_H + row * (PANEL_H + ROW_GAP),
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current.length === 0 ? word : `${current} ${word}`;
    if (candidate.length <= maxChars) {
      current = candidate;
      continue;
    }
    if (current.length > 0) {
      lines.push(current);
    }
    current = word;
  }

  if (current.length > 0) {
    lines.push(current);
  }

  return lines;
}

interface MultilineTextOptions {
  readonly x: number;
  readonly y: number;
  readonly lines: readonly string[];
  readonly anchor?: 'start' | 'middle' | 'end';
  readonly fontSize?: number;
  readonly fontWeight?: string;
  readonly fill?: string;
  readonly lineHeight?: number;
  readonly className?: string;
}

function renderMultilineText(options: MultilineTextOptions): string {
  const anchor = options.anchor ?? 'start';
  const fontSize = options.fontSize ?? 11;
  const fontWeight = options.fontWeight ?? '400';
  const fill = options.fill ?? TEXT;
  const lineHeight = options.lineHeight ?? Math.round(fontSize * 1.25);
  const className = options.className ? ` class="${options.className}"` : '';

  const tspans = options.lines
    .map((line, index) => {
      const dy = index === 0 ? 0 : lineHeight;
      return `<tspan x="${options.x}" dy="${dy}">${escapeXml(line)}</tspan>`;
    })
    .join('');

  return `<text${className} x="${options.x}" y="${options.y}" text-anchor="${anchor}" font-size="${fontSize}" font-weight="${fontWeight}" fill="${fill}">${tspans}</text>`;
}

function renderLabelPill(
  x: number,
  y: number,
  text: string,
  color: string,
  anchor: 'start' | 'middle' | 'end' = 'middle',
): string {
  const paddingX = 6;
  const width = text.length * 5.9 + paddingX * 2;
  const height = 18;
  const originX =
    anchor === 'middle' ? x - width / 2 : anchor === 'end' ? x - width : x;
  const originY = y - height / 2;

  return [
    `<rect x="${trimFixed(originX, 2)}" y="${trimFixed(originY, 2)}" width="${trimFixed(width, 2)}" height="${height}" rx="9" fill="${WHITE}" stroke="${color}" stroke-width="1" opacity="0.96"/>`,
    `<text x="${x}" y="${y + 3.5}" text-anchor="${anchor}" font-size="10" font-weight="700" fill="${color}">${escapeXml(text)}</text>`,
  ].join('\n');
}

function renderPanelFrame(
  ox: number,
  oy: number,
  badge: string,
  title: string,
  accent: string,
  subtitle?: string,
): string[] {
  const lines: string[] = [];
  lines.push(
    `<rect x="${ox}" y="${oy}" width="${PANEL_W}" height="${PANEL_H}" rx="16" fill="${PANEL_BG}" stroke="${GRID}" stroke-width="1.25"/>`,
  );
  lines.push(
    `<rect x="${ox}" y="${oy}" width="${PANEL_W}" height="60" rx="16" fill="${accent}" opacity="0.08"/>`,
  );
  lines.push(
    `<line x1="${ox}" y1="${oy + 60}" x2="${ox + PANEL_W}" y2="${oy + 60}" stroke="${GRID}" stroke-width="1"/>`,
  );
  lines.push(
    `<circle cx="${ox + 24}" cy="${oy + 24}" r="14" fill="${accent}"/>`,
  );
  lines.push(
    `<text x="${ox + 24}" y="${oy + 29}" text-anchor="middle" font-size="12" font-weight="800" fill="${WHITE}">${escapeXml(badge)}</text>`,
  );
  lines.push(
    `<text x="${ox + 46}" y="${oy + 29}" text-anchor="start" font-size="17" font-weight="700" fill="${TEXT}">${escapeXml(title)}</text>`,
  );
  if (subtitle) {
    lines.push(
      renderMultilineText({
        x: ox + 18,
        y: oy + 78,
        lines: wrapText(subtitle, 58),
        anchor: 'start',
        fontSize: 10.5,
        fill: LIGHT_TEXT,
        lineHeight: 12,
      }),
    );
  }
  return lines;
}

function renderNumericYAxis(
  lines: string[],
  ox: number,
  oy: number,
  yTicks: readonly number[],
  maxY: number,
  label: string,
  formatter: (value: number) => string,
): void {
  for (const tick of yTicks) {
    const y = oy + PAD_T + PLOT_H - (tick / maxY) * PLOT_H;
    lines.push(
      `<line x1="${ox + PAD_L}" y1="${y}" x2="${ox + PAD_L + PLOT_W}" y2="${y}" stroke="${GRID}" stroke-width="0.75"/>`,
    );
    lines.push(
      `<text x="${ox + PAD_L - 8}" y="${y + 4}" text-anchor="end" font-size="10" fill="${LIGHT_TEXT}">${escapeXml(formatter(tick))}</text>`,
    );
  }

  lines.push(
    `<text x="${ox + 18}" y="${oy + PAD_T + PLOT_H / 2}" text-anchor="middle" font-size="12" font-weight="600" fill="${TEXT}" transform="rotate(-90,${ox + 18},${oy + PAD_T + PLOT_H / 2})">${escapeXml(label)}</text>`,
  );
}

function renderAreaPath(
  points: readonly { x: number; y: number }[],
  baselineY: number,
  stroke: string,
  fill: string,
): string {
  if (points.length === 0) {
    return '';
  }
  const linePath = points
    .map((point, index) =>
      `${index === 0 ? 'M' : 'L'}${trimFixed(point.x, 2)},${trimFixed(point.y, 2)}`,
    )
    .join(' ');
  const areaPath = `${linePath} L${trimFixed(points[points.length - 1].x, 2)},${trimFixed(baselineY, 2)} L${trimFixed(points[0].x, 2)},${trimFixed(baselineY, 2)} Z`;
  return [
    `<path d="${areaPath}" fill="${fill}" opacity="0.24"/>`,
    `<path d="${linePath}" fill="none" stroke="${stroke}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,
  ].join('\n');
}

function renderProtocolPanel(report: AmericanFrontierReport): string {
  const { x: ox, y: oy } = panelOrigin(0);
  const points = report.protocol.points;
  const maxY = 35;
  const lines = renderPanelFrame(
    ox,
    oy,
    'A',
    'Framing Waste by Protocol',
    TEAL,
    'HTTP/1.1, HTTP/2, HTTP/3, and Aeon Flow on the same microfrontend workload.',
  );

  renderNumericYAxis(
    lines,
    ox,
    oy,
    [0, 5, 10, 15, 20, 25, 30, 35],
    maxY,
    'Framing waste (%)',
    (value) => `${value}%`,
  );

  const xForIndex = (index: number): number =>
    ox + PAD_L + (index / (points.length - 1)) * PLOT_W;
  const yForWaste = (waste: number): number =>
    oy + PAD_T + PLOT_H - (waste / maxY) * PLOT_H;

  const curvePoints = points.map((point, index) => ({
    x: xForIndex(index),
    y: yForWaste(point.overheadPct),
  }));
  lines.push(
    renderAreaPath(curvePoints, oy + PAD_T + PLOT_H, TEAL, TEAL_FILL),
  );

  for (let index = 0; index < points.length; index++) {
    const point = points[index];
    const x = xForIndex(index);
    const y = yForWaste(point.overheadPct);
    lines.push(
      `<circle cx="${x}" cy="${y}" r="4" fill="${TEAL}" stroke="white" stroke-width="1.5"/>`,
    );
    lines.push(renderLabelPill(x, y - 16, `${trimFixed(point.overheadPct, 1)}%`, TEAL));
    const protocolLabel =
      point.protocol === 'Aeon Flow' ? ['Aeon', 'Flow'] : [point.protocol];
    lines.push(
      renderMultilineText({
        x,
        y: oy + PAD_T + PLOT_H + 16,
        lines: protocolLabel,
        anchor: 'middle',
        fontSize: 10,
        fontWeight: '600',
        fill: TEXT,
        lineHeight: 12,
      }),
    );
  }

  lines.push(
    `<text x="${ox + PAD_L + PLOT_W / 2}" y="${oy + PANEL_H - 18}" text-anchor="middle" font-size="12" font-weight="600" fill="${TEXT}">protocol family</text>`,
  );
  lines.push(
    `<text x="${ox + PAD_L}" y="${oy + PANEL_H - 38}" text-anchor="start" font-size="10" fill="${MUTED_TEXT}">monoculture</text>`,
  );
  lines.push(
    `<text x="${ox + PAD_L + PLOT_W}" y="${oy + PANEL_H - 38}" text-anchor="end" font-size="10" fill="${MUTED_TEXT}">matched cover</text>`,
  );

  return lines.join('\n');
}

function renderPipelinePanel(report: AmericanFrontierReport): string {
  const { x: ox, y: oy } = panelOrigin(1);
  const points = report.pipeline.points;
  const lines = renderPanelFrame(
    ox,
    oy,
    'B',
    'Idle Waste by Reynolds Regime',
    BLUE,
    'As scheduler diversity falls and Reynolds number rises, idle waste climbs.',
  );

  const logMin = Math.log10(0.08);
  const logMax = Math.log10(20);
  const logRange = logMax - logMin;

  const xForRe = (reynolds: number): number => {
    const position = 1 - (Math.log10(reynolds) - logMin) / logRange;
    return ox + PAD_L + position * PLOT_W;
  };
  const yForIdle = (idleFraction: number): number =>
    oy + PAD_T + PLOT_H - idleFraction * PLOT_H;

  renderNumericYAxis(
    lines,
    ox,
    oy,
    [0, 20, 40, 60, 80, 100],
    100,
    'Idle waste (%)',
    (value) => `${value}%`,
  );

  const xTicks = [0.1, 0.5, 1, 2, 4, 8, 16];
  for (const tick of xTicks) {
    const x = xForRe(tick);
    lines.push(
      `<line x1="${x}" y1="${oy + PAD_T + PLOT_H}" x2="${x}" y2="${oy + PAD_T + PLOT_H + 5}" stroke="${LIGHT_TEXT}" stroke-width="0.75"/>`,
    );
    lines.push(
      `<text x="${x}" y="${oy + PAD_T + PLOT_H + 19}" text-anchor="middle" font-size="10" fill="${LIGHT_TEXT}">${trimFixed(tick, 1)}</text>`,
    );
  }

  const curvePoints = points.map((point) => ({
    x: xForRe(point.reynolds),
    y: yForIdle(point.idleFraction),
  }));
  lines.push(
    renderAreaPath(curvePoints, oy + PAD_T + PLOT_H, BLUE, BLUE_FILL),
  );

  for (const point of points) {
    const x = xForRe(point.reynolds);
    const y = yForIdle(point.idleFraction);
    lines.push(
      `<circle cx="${x}" cy="${y}" r="3.5" fill="${BLUE}" stroke="white" stroke-width="1.2"/>`,
    );
  }

  lines.push(
    `<text x="${ox + PAD_L + PLOT_W / 2}" y="${oy + PANEL_H - 18}" text-anchor="middle" font-size="12" font-weight="600" fill="${TEXT}">scheduler diversity ←→ Reynolds regime</text>`,
  );
  lines.push(
    renderLabelPill(xForRe(0.16), yForIdle(0.1), 'laminar', TEAL),
  );
  lines.push(
    renderLabelPill(xForRe(11), yForIdle(0.9), 'turbulent', ORANGE),
  );

  return lines.join('\n');
}

function renderEncodingPanel(report: AmericanFrontierReport): string {
  const { x: ox, y: oy } = panelOrigin(2);
  const points = report.encoding.points;
  const maxY = 50;
  const lines = renderPanelFrame(
    ox,
    oy,
    'C',
    'Encoding Waste by Content Mix',
    ORANGE,
    'The same theorem on response encoding: heterogeneous payloads punish monoculture.',
  );

  renderNumericYAxis(
    lines,
    ox,
    oy,
    [0, 10, 20, 30, 40, 50],
    maxY,
    'Monoculture waste (%)',
    (value) => `${value}%`,
  );

  const xForIndex = (index: number): number =>
    ox + PAD_L + (index / (points.length - 1)) * PLOT_W;
  const yForWaste = (waste: number): number =>
    oy + PAD_T + PLOT_H - (waste / maxY) * PLOT_H;

  const curvePoints = points.map((point, index) => ({
    x: xForIndex(index),
    y: yForWaste(point.gainVsHeuristicPct),
  }));
  lines.push(
    renderAreaPath(curvePoints, oy + PAD_T + PLOT_H, ORANGE, ORANGE_FILL),
  );

  lines.push(
    `<line x1="${ox + PAD_L}" y1="${oy + PAD_T + PLOT_H}" x2="${ox + PAD_L + PLOT_W}" y2="${oy + PAD_T + PLOT_H}" stroke="${TEAL}" stroke-width="1.25" stroke-dasharray="4,3"/>`,
  );
  lines.push(
    renderLabelPill(ox + PAD_L + PLOT_W - 8, oy + PAD_T + PLOT_H - 12, 'matched floor', TEAL, 'end'),
  );

  for (let index = 0; index < points.length; index++) {
    const point = points[index];
    const x = xForIndex(index);
    const y = yForWaste(point.gainVsHeuristicPct);
    lines.push(
      `<circle cx="${x}" cy="${y}" r="4" fill="${ORANGE}" stroke="white" stroke-width="1.5"/>`,
    );
    lines.push(
      renderLabelPill(x, y - 16, `${trimFixed(point.gainVsHeuristicPct, 1)}%`, ORANGE),
    );
    lines.push(
      `<text x="${x}" y="${oy + PAD_T + PLOT_H + 20}" text-anchor="middle" font-size="10" font-weight="600" fill="${TEXT}">${escapeXml(point.shortLabel)}</text>`,
    );
  }

  lines.push(
    `<text x="${ox + PAD_L + PLOT_W / 2}" y="${oy + PANEL_H - 18}" text-anchor="middle" font-size="12" font-weight="600" fill="${TEXT}">intrinsic response diversity (β₁* →)</text>`,
  );

  return lines.join('\n');
}

function renderTransportPanel(report: AmericanFrontierReport): string {
  const { x: ox, y: oy } = panelOrigin(3);
  const points = report.transport.points;
  const maxY = 0.05;
  const lines = renderPanelFrame(
    ox,
    oy,
    'D',
    'Aeon/UDP vs HTTP/TCP Mixed Race',
    RED,
    'One logical request is launched on both transports; the first sufficient winner serves the client.',
  );

  const xForShare = (sharePct: number): number =>
    ox + PAD_L + (sharePct / 100) * PLOT_W;
  const yForWaste = (waste: number): number =>
    oy + PAD_T + PLOT_H - (waste / maxY) * PLOT_H;

  renderNumericYAxis(
    lines,
    ox,
    oy,
    [0, 0.01, 0.02, 0.03, 0.04, 0.05],
    maxY,
    'Loser waste / win',
    (value) => trimFixed(value, 2),
  );

  const xTicks = [0, 25, 50, 75, 100];
  for (const tick of xTicks) {
    const x = xForShare(tick);
    lines.push(
      `<line x1="${x}" y1="${oy + PAD_T + PLOT_H}" x2="${x}" y2="${oy + PAD_T + PLOT_H + 5}" stroke="${LIGHT_TEXT}" stroke-width="0.75"/>`,
    );
    lines.push(
      `<text x="${x}" y="${oy + PAD_T + PLOT_H + 18}" text-anchor="middle" font-size="9" fill="${LIGHT_TEXT}">${tick}%</text>`,
    );
  }

  const curvePoints = points.map((point) => ({
    x: xForShare(aeonWinSharePct(point)),
    y: yForWaste(point.wasteBytesPerWin),
  }));
  lines.push(
    renderAreaPath(curvePoints, oy + PAD_T + PLOT_H, RED, RED_FILL),
  );

  const representativeLabels = new Map<
    number,
    { marker: string; delayLabel: string; dx: number; dy: number; anchor: 'start' | 'middle' | 'end' }
  >([
    [0, { marker: '1', delayLabel: '0 ms TCP hedge', dx: 16, dy: 10, anchor: 'start' }],
    [2, { marker: '2', delayLabel: '0.5 ms TCP hedge', dx: 12, dy: -14, anchor: 'start' }],
    [3, { marker: '3', delayLabel: '1 ms TCP hedge', dx: 12, dy: -10, anchor: 'start' }],
    [5, { marker: '4', delayLabel: '4 ms TCP hedge', dx: -14, dy: -12, anchor: 'end' }],
  ]);

  for (let index = 0; index < points.length; index++) {
    const point = points[index];
    const x = xForShare(aeonWinSharePct(point));
    const y = yForWaste(point.wasteBytesPerWin);
    lines.push(
      `<circle cx="${x}" cy="${y}" r="4" fill="${RED}" stroke="white" stroke-width="1.5"/>`,
    );
    const labelOffset = representativeLabels.get(index);
    if (labelOffset) {
      lines.push(
        renderLabelPill(
          clamp(x + labelOffset.dx, ox + PAD_L + 20, ox + PAD_L + PLOT_W - 20),
          clamp(y + labelOffset.dy, oy + PAD_T + 14, oy + PAD_T + PLOT_H - 14),
          labelOffset.marker,
          RED,
          labelOffset.anchor,
        ),
      );
    }
  }

  const legendX = ox + PAD_L + 14;
  const legendY = oy + PAD_T + PLOT_H - 86;
  const legendW = 156;
  const legendH = 74;
  lines.push(
    `<rect x="${legendX}" y="${legendY}" width="${legendW}" height="${legendH}" rx="12" fill="${WHITE}" stroke="${GRID}" stroke-width="1"/>`,
  );
  lines.push(
    `<text x="${legendX + 10}" y="${legendY + 16}" text-anchor="start" font-size="10" font-weight="700" fill="${TEXT}">TCP hedge delay</text>`,
  );
  let legendRowY = legendY + 31;
  for (const index of [0, 2, 3, 5]) {
    const item = representativeLabels.get(index);
    if (!item) {
      continue;
    }
    lines.push(renderLabelPill(legendX + 16, legendRowY - 1, item.marker, RED));
    lines.push(
      `<text x="${legendX + 30}" y="${legendRowY + 3}" text-anchor="start" font-size="10" fill="${LIGHT_TEXT}">${escapeXml(item.delayLabel)}</text>`,
    );
    legendRowY += 13;
  }

  lines.push(
    renderMultilineText({
      x: ox + PAD_L + PLOT_W / 2,
      y: oy + PANEL_H - 31,
      lines: [
        'Aeon/UDP winner share in the mixed race',
        '0% = HTTP/TCP dominates, 100% = Aeon/UDP dominates',
      ],
      anchor: 'middle',
      fontSize: 11,
      fontWeight: '600',
      fill: TEXT,
      lineHeight: 12,
    }),
  );
  return lines.join('\n');
}

export function renderAmericanFrontierSvg(
  report: AmericanFrontierReport,
): string {
  const parts: string[] = [];

  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${TOTAL_W} ${TOTAL_H}" font-family="'Avenir Next', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif">`,
  );
  parts.push(
    `<rect width="${TOTAL_W}" height="${TOTAL_H}" rx="20" fill="${BG}" stroke="${GRID}" stroke-width="1"/>`,
  );
  parts.push(
    `<text x="${TOTAL_W / 2}" y="34" text-anchor="middle" font-size="28" font-weight="700" fill="${TEXT}" font-family="'Iowan Old Style', 'Palatino Linotype', 'Book Antiqua', serif">The American Frontier</text>`,
  );
  parts.push(
    renderMultilineText({
      x: TOTAL_W / 2,
      y: 54,
      lines: wrapText(
        'Diversity reduces waste in framing, scheduling, encoding, and recursively again on the wire.',
        84,
      ),
      anchor: 'middle',
      fontSize: 13,
      fill: LIGHT_TEXT,
      lineHeight: 15,
    }),
  );

  parts.push(renderProtocolPanel(report));
  parts.push(renderPipelinePanel(report));
  parts.push(renderEncodingPanel(report));
  parts.push(renderTransportPanel(report));

  const heavy = report.transport.heavyWitness;
  const footerY = TOTAL_H - FOOTER_H + 18;
  const footerBoxW = (TOTAL_W - OUTER_PAD * 2 - 18) / 2;
  parts.push(
    `<rect x="${OUTER_PAD}" y="${TOTAL_H - FOOTER_H + 6}" width="${footerBoxW}" height="${FOOTER_H - 20}" rx="14" fill="${WHITE}" stroke="${GRID}" stroke-width="1"/>`,
  );
  parts.push(
    renderMultilineText({
      x: OUTER_PAD + 14,
      y: footerY,
      lines: [
        'Heavy recursive witness',
        ...wrapText(
          `Zero skew: ${heavy.zeroSkewAeonWinSharePct.toFixed(2)}% Aeon share, ${heavy.zeroSkewWasteBytesPerWin.toFixed(2)} loser-bytes per win. 2 ms hedge: ${heavy.tcpDelay2msAeonWinSharePct.toFixed(2)}% Aeon share, ${heavy.tcpDelay2msWasteBytesPerWin.toFixed(2)} loser-bytes per win, ${heavy.throughputRetentionPct.toFixed(1)}% throughput retention.`,
          52,
        ),
      ],
      anchor: 'start',
      fontSize: 11,
      fill: TEXT,
      fontWeight: '500',
      lineHeight: 14,
    }),
  );
  const theoremBoxX = OUTER_PAD + footerBoxW + 18;
  parts.push(
    `<rect x="${theoremBoxX}" y="${TOTAL_H - FOOTER_H + 6}" width="${footerBoxW}" height="${FOOTER_H - 20}" rx="14" fill="${WHITE}" stroke="${GRID}" stroke-width="1"/>`,
  );
  parts.push(
    renderMultilineText({
      x: theoremBoxX + 14,
      y: footerY,
      lines: [
        'Recursive reading of THM-AMERICAN-FRONTIER',
        ...wrapText(
          'Matched diversity lowers waste twice: first while choosing the response representation, then again while carrying that representation across the wire. Panels C and D are the same curve at adjacent layers.',
          52,
        ),
      ],
      anchor: 'start',
      fontSize: 11,
      fill: LIGHT_TEXT,
      fontWeight: '500',
      lineHeight: 14,
    }),
  );
  parts.push('</svg>');

  return `${parts.join('\n')}\n`;
}
