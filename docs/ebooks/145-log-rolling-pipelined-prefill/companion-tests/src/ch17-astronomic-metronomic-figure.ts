/**
 * Astronomic Metronomic — Whip Wave Duality Visualization
 *
 * Visualizes the whip crack range equation across scales:
 *   d_max = sqrt(N * P / (rho * c*²))
 *
 * From a child passing balls to a friend (§0) to two children
 * juggling armfuls across the galaxy. Same formula. Same seven
 * handoffs. The distance is in the taper. The message is in the balls.
 *
 * Generates SVG + JSON + Markdown artifacts.
 */

/* ------------------------------------------------------------------ */
/*  Report types                                                       */
/* ------------------------------------------------------------------ */

export interface WhipRangeScale {
  readonly label: string;
  readonly distance_m: number;
  readonly distance_human: string;
  readonly medium: string;
  readonly fork_description: string;
  readonly fold_description: string;
  readonly deficit_description: string;
  readonly fork_N: number;
  readonly power_W: number;
  readonly noise_density: number;
  readonly snr_threshold: number;
  readonly d_max_m: number;
  readonly bule: string;
  readonly color: string;
}

export interface AstronomicMetronomicReport {
  readonly label: 'astronomic-metronomic-v1';
  readonly scales: readonly WhipRangeScale[];
  readonly equation: string;
  readonly svg: string;
  readonly markdown: string;
}

/* ------------------------------------------------------------------ */
/*  Palette                                                            */
/* ------------------------------------------------------------------ */

const COLORS = {
  human: '#0f766e', // teal-700
  room: '#6366f1', // indigo-500
  city: '#d97706', // amber-600
  earth: '#2563eb', // blue-600
  mars: '#dc2626', // red-600
  alpha: '#7c3aed', // violet-600
  galaxy: '#0891b2', // cyan-600
  bg: '#f8fafc',
  text: '#334155',
  textLight: '#94a3b8',
  grid: '#e2e8f0',
  taper: '#f59e0b', // amber-500
} as const;

/* ------------------------------------------------------------------ */
/*  Range computation                                                  */
/* ------------------------------------------------------------------ */

function computeRange(
  N: number,
  P: number,
  rho: number,
  cStarSq: number
): number {
  return Math.sqrt((N * P) / (rho * cStarSq));
}

/* ------------------------------------------------------------------ */
/*  Build report                                                       */
/* ------------------------------------------------------------------ */

export function buildAstronomicMetronomicReport(): AstronomicMetronomicReport {
  const scales: WhipRangeScale[] = [
    {
      label: 'Across a table',
      distance_m: 1,
      distance_human: '1 meter',
      medium: 'Air',
      fork_description: '1 voice (no redundancy)',
      fold_description: 'Listener decodes speech',
      deficit_description: 'Semantic mismatch (thought > speech)',
      fork_N: 1,
      power_W: 0.001,
      noise_density: 0.0001,
      snr_threshold: 1,
      d_max_m: computeRange(1, 0.001, 0.0001, 1),
      bule: 'k semantic paths - 1',
      color: COLORS.human,
    },
    {
      label: 'Across a room',
      distance_m: 10,
      distance_human: '10 meters',
      medium: 'Air + ambient noise',
      fork_description: 'Voice + gesture + expression (N=3)',
      fold_description: 'Listener integrates multimodal',
      deficit_description: 'Channels lost to noise',
      fork_N: 3,
      power_W: 0.01,
      noise_density: 0.001,
      snr_threshold: 1,
      d_max_m: computeRange(3, 0.01, 0.001, 1),
      bule: '3 channels - surviving',
      color: COLORS.room,
    },
    {
      label: 'Across a city',
      distance_m: 10_000,
      distance_human: '10 km',
      medium: 'Radio / cellular',
      fork_description: 'OFDM subcarriers (N=256)',
      fold_description: 'Receiver FFT + decode',
      deficit_description: 'Multipath fading',
      fork_N: 256,
      power_W: 10,
      noise_density: 1e-6,
      snr_threshold: 10,
      d_max_m: computeRange(256, 10, 1e-6, 10),
      bule: '256 - surviving subcarriers',
      color: COLORS.city,
    },
    {
      label: 'Across the Earth',
      distance_m: 12_742_000,
      distance_human: '12,742 km',
      medium: 'Fiber optic / satellite',
      fork_description: 'WDM wavelengths (N=80)',
      fold_description: 'Demux + FEC decode',
      deficit_description: 'Attenuation + dispersion',
      fork_N: 80,
      power_W: 1000,
      noise_density: 1e-8,
      snr_threshold: 100,
      d_max_m: computeRange(80, 1000, 1e-8, 100),
      bule: '80 - surviving wavelengths',
      color: COLORS.earth,
    },
    {
      label: 'Earth to Mars',
      distance_m: 5.46e10,
      distance_human: '54.6 million km',
      medium: 'Deep space (X-band)',
      fork_description: 'Turbo code redundancy (N=4096)',
      fold_description: 'Viterbi / belief propagation',
      deficit_description: 'Inverse square + solar weather',
      fork_N: 4096,
      power_W: 20_000,
      noise_density: 1e-12,
      snr_threshold: 1,
      d_max_m: computeRange(4096, 20000, 1e-12, 1),
      bule: 'coding overhead (paths forked but not needed)',
      color: COLORS.mars,
    },
    {
      label: 'To Alpha Centauri',
      distance_m: 4.0e16,
      distance_human: '4.24 light-years',
      medium: 'Interstellar void',
      fork_description: 'Massive fork array (N=10⁹)',
      fold_description: 'Phased array fold at receiver',
      deficit_description: 'Geometric spreading + ISM scattering',
      fork_N: 1e9,
      power_W: 1e6,
      noise_density: 1e-18,
      snr_threshold: 1,
      d_max_m: computeRange(1e9, 1e6, 1e-18, 1),
      bule: '10⁹ - surviving paths',
      color: COLORS.alpha,
    },
    {
      label: 'Across the galaxy',
      distance_m: 9.46e20,
      distance_human: '100,000 light-years',
      medium: 'Galactic medium',
      fork_description: 'Juggled armfuls (N → ∞)',
      fold_description: 'Catch whatever arrives',
      deficit_description: 'The distance itself',
      fork_N: 1e15,
      power_W: 1e12,
      noise_density: 1e-22,
      snr_threshold: 1,
      d_max_m: computeRange(1e15, 1e12, 1e-22, 1),
      bule: 'nearly everything (but not all)',
      color: COLORS.galaxy,
    },
  ];

  const equation = 'd_max = √(N·P / (ρ·c*²))';
  const svg = generateSVG(scales);
  const markdown = generateMarkdown(scales, equation);

  return { label: 'astronomic-metronomic-v1', scales, equation, svg, markdown };
}

/* ------------------------------------------------------------------ */
/*  SVG generation                                                     */
/* ------------------------------------------------------------------ */

function generateSVG(scales: readonly WhipRangeScale[]): string {
  const W = 900;
  const H = 500;
  const padL = 80,
    padR = 40,
    padT = 60,
    padB = 80;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  // Log scale for distances
  const logDistances = scales.map((s) => Math.log10(s.distance_m));
  const logRanges = scales.map((s) => Math.log10(s.d_max_m));
  const minLog = Math.floor(Math.min(...logDistances));
  const maxLog = Math.ceil(Math.max(...logRanges));

  function xPos(logD: number): number {
    return padL + ((logD - minLog) / (maxLog - minLog)) * plotW;
  }
  function yPos(logR: number): number {
    return padT + plotH - ((logR - minLog) / (maxLog - minLog)) * plotH;
  }

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="system-ui, -apple-system, sans-serif">\n`;
  svg += `<rect width="${W}" height="${H}" fill="${COLORS.bg}"/>\n`;

  // Title
  svg += `<text x="${
    W / 2
  }" y="28" text-anchor="middle" font-size="16" font-weight="bold" fill="${
    COLORS.text
  }">Astronomic Metronomic</text>\n`;
  svg += `<text x="${W / 2}" y="46" text-anchor="middle" font-size="11" fill="${
    COLORS.textLight
  }">d_max = √(N·P / ρ·c*²) — How far can you whip a bit?</text>\n`;

  // Grid lines
  for (let log = minLog; log <= maxLog; log += 2) {
    const x = xPos(log);
    const y = yPos(log);
    svg += `<line x1="${x}" y1="${padT}" x2="${x}" y2="${
      padT + plotH
    }" stroke="${COLORS.grid}" stroke-width="0.5"/>\n`;
    svg += `<line x1="${padL}" y1="${y}" x2="${
      padL + plotW
    }" y2="${y}" stroke="${COLORS.grid}" stroke-width="0.5"/>\n`;
    svg += `<text x="${x}" y="${
      padT + plotH + 16
    }" text-anchor="middle" font-size="9" fill="${
      COLORS.textLight
    }">10^${log}</text>\n`;
    svg += `<text x="${padL - 8}" y="${
      y + 3
    }" text-anchor="end" font-size="9" fill="${
      COLORS.textLight
    }">10^${log}</text>\n`;
  }

  // Axes labels
  svg += `<text x="${W / 2}" y="${
    H - 8
  }" text-anchor="middle" font-size="10" fill="${
    COLORS.text
  }">Distance (meters, log scale)</text>\n`;
  svg += `<text x="14" y="${H / 2}" text-anchor="middle" font-size="10" fill="${
    COLORS.text
  }" transform="rotate(-90, 14, ${
    H / 2
  })">Whip Range d_max (meters, log scale)</text>\n`;

  // Diagonal: d_max = d (just barely reaches)
  svg += `<line x1="${xPos(minLog)}" y1="${yPos(minLog)}" x2="${xPos(
    maxLog
  )}" y2="${yPos(maxLog)}" stroke="${
    COLORS.taper
  }" stroke-width="1.5" stroke-dasharray="6,4" opacity="0.6"/>\n`;
  svg += `<text x="${xPos(maxLog) - 5}" y="${
    yPos(maxLog) + 14
  }" text-anchor="end" font-size="8" fill="${
    COLORS.taper
  }">d_max = d (threshold)</text>\n`;

  // The taper: connect scale points
  const points = scales
    .map(
      (s) => `${xPos(Math.log10(s.distance_m))},${yPos(Math.log10(s.d_max_m))}`
    )
    .join(' ');
  svg += `<polyline points="${points}" fill="none" stroke="${COLORS.text}" stroke-width="2" opacity="0.3"/>\n`;

  // Data points + labels
  for (const s of scales) {
    const x = xPos(Math.log10(s.distance_m));
    const y = yPos(Math.log10(s.d_max_m));
    const aboveLine = s.d_max_m > s.distance_m;

    // Point
    svg += `<circle cx="${x}" cy="${y}" r="6" fill="${s.color}" stroke="white" stroke-width="2"/>\n`;

    // Label
    const labelY = y - 12;
    svg += `<text x="${x}" y="${labelY}" text-anchor="middle" font-size="9" font-weight="600" fill="${s.color}">${s.label}</text>\n`;
    svg += `<text x="${x}" y="${
      labelY - 12
    }" text-anchor="middle" font-size="7" fill="${COLORS.textLight}">${
      s.distance_human
    } | N=${formatN(s.fork_N)}</text>\n`;

    // Above/below threshold indicator
    if (aboveLine) {
      svg += `<text x="${x + 10}" y="${y + 4}" font-size="8" fill="${
        s.color
      }">✓</text>\n`;
    }
  }

  // Legend
  svg += `<text x="${padL + 10}" y="${padT + 16}" font-size="9" fill="${
    COLORS.text
  }">Above diagonal: signal reaches. Below: too far.</text>\n`;
  svg += `<text x="${padL + 10}" y="${padT + 28}" font-size="8" fill="${
    COLORS.textLight
  }">Fork more paths (increase N) to push points upward.</text>\n`;

  svg += `</svg>`;
  return svg;
}

function formatN(n: number): string {
  if (n >= 1e15) return '10¹⁵';
  if (n >= 1e9) return '10⁹';
  if (n >= 1e6) return '10⁶';
  if (n >= 1000) return n.toLocaleString();
  return String(n);
}

/* ------------------------------------------------------------------ */
/*  Markdown generation                                                */
/* ------------------------------------------------------------------ */

function generateMarkdown(
  scales: readonly WhipRangeScale[],
  equation: string
): string {
  let md = `# Astronomic Metronomic\n\n`;
  md += `**${equation}**\n\n`;
  md += `How far can you whip a bit? Same formula at every scale.\n\n`;
  md += `| Scale | Distance | Fork N | Medium | Range | Reaches? |\n`;
  md += `|:------|:---------|:-------|:-------|:------|:---------|\n`;
  for (const s of scales) {
    const reaches = s.d_max_m > s.distance_m ? 'yes' : 'no';
    md += `| ${s.label} | ${s.distance_human} | ${formatN(s.fork_N)} | ${
      s.medium
    } | ${formatDistance(s.d_max_m)} | ${reaches} |\n`;
  }
  md += `\nThe child passing balls in §0 and the child juggling across the galaxy are the same formula.\n`;
  md += `The distance is in the taper. The message is in the balls.\n`;
  return md;
}

function formatDistance(d: number): string {
  if (d >= 9.46e15) return `${(d / 9.46e15).toFixed(1)} ly`;
  if (d >= 1e12) return `${(d / 1e12).toFixed(1)} Tm`;
  if (d >= 1e9) return `${(d / 1e9).toFixed(1)} Gm`;
  if (d >= 1e6) return `${(d / 1e6).toFixed(1)} Mm`;
  if (d >= 1e3) return `${(d / 1e3).toFixed(1)} km`;
  return `${d.toFixed(1)} m`;
}

/* ------------------------------------------------------------------ */
/*  Script mode                                                        */
/* ------------------------------------------------------------------ */

import * as fs from 'fs';
import * as path from 'path';

const report = buildAstronomicMetronomicReport();

const outDir = path.join(import.meta.dir, '..', '..', 'figures');
fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(path.join(outDir, 'astronomic-metronomic.svg'), report.svg);
fs.writeFileSync(
  path.join(outDir, 'astronomic-metronomic.json'),
  JSON.stringify(report, null, 2)
);
fs.writeFileSync(
  path.join(outDir, 'astronomic-metronomic.md'),
  report.markdown
);

console.log('Generated:');
console.log('  figures/astronomic-metronomic.svg');
console.log('  figures/astronomic-metronomic.json');
console.log('  figures/astronomic-metronomic.md');
console.log();
console.log(report.markdown);
