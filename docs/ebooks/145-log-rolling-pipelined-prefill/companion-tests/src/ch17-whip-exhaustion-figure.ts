/**
 * Chapter 17 Whip Exhaustion Figure
 *
 * Visualizes the Fork Dimension Completeness theorem for transformers:
 * all orthogonal fork axes, their β₁ contributions, nested fold structure,
 * and the energy taper showing that inner folds discharge more cycles than outer.
 *
 * §6.9.1 + §6.11 — Whip Exhaustion proof surface
 */

/* ------------------------------------------------------------------ */
/*  Report types                                                       */
/* ------------------------------------------------------------------ */

export interface WhipExhaustionForkAxis {
  readonly label: string;
  readonly size: number;
  readonly beta1: number;
  readonly foldLabel: string;
  readonly whipType: string;
  readonly depth: number; // 0 = outermost, higher = deeper nesting
  readonly color: string;
}

export interface WhipExhaustionLayerConfig {
  readonly heads: number;
  readonly ffnExpansion: number;
  readonly moeExperts: number; // 0 = dense FFN
  readonly moeTopK: number;
}

export interface Ch17WhipExhaustionFigureReport {
  readonly label: 'ch17-whip-exhaustion-figure-v1';
  readonly config: WhipExhaustionLayerConfig;
  readonly axes: readonly WhipExhaustionForkAxis[];
  readonly totalBeta1: number;
  readonly whipCount: number;
  readonly telescopingSum: readonly number[];
  readonly taperRatio: number;
}

/* ------------------------------------------------------------------ */
/*  Colour palette (matching existing teal/slate scheme)               */
/* ------------------------------------------------------------------ */

const COLORS = {
  attnHead: '#0f766e', // teal-700 — geometric race (heads)
  residual: '#6366f1', // indigo-500 — structural (residual)
  ffn: '#d97706', // amber-600 — soft vent/fold (FFN)
  moe: '#dc2626', // red-600 — selective race (MoE)
  bg: '#f8fafc', // slate-50
  bgInner: '#f0fdf4', // green-50
  text: '#334155', // slate-700
  textLight: '#64748b', // slate-500
  textWhite: '#ffffff',
  snap: '#ef4444', // red-500 — snap discharge
  flow: '#94a3b8', // slate-400 — flow arrows
  border: '#cbd5e1', // slate-300
  gold: '#f59e0b', // amber-500 — energy badge
} as const;

/* ------------------------------------------------------------------ */
/*  Report builder                                                     */
/* ------------------------------------------------------------------ */

export function buildCh17WhipExhaustionFigureReport(
  config: WhipExhaustionLayerConfig = {
    heads: 16,
    ffnExpansion: 4,
    moeExperts: 0,
    moeTopK: 0,
  }
): Ch17WhipExhaustionFigureReport {
  const { heads, ffnExpansion, moeExperts } = config;
  const useMoe = moeExperts > 0;

  const axes: WhipExhaustionForkAxis[] = [
    {
      label: 'Residual-Attention',
      size: 2,
      beta1: 1,
      foldLabel: 'Additive merge',
      whipType: 'structural',
      depth: 0,
      color: COLORS.residual,
    },
    {
      label: `Attention Heads (N=${heads})`,
      size: heads,
      beta1: heads - 1,
      foldLabel: 'Concat + W_O projection',
      whipType: 'geometric race',
      depth: 1,
      color: COLORS.attnHead,
    },
    {
      label: 'Residual-FFN',
      size: 2,
      beta1: 1,
      foldLabel: 'Additive merge',
      whipType: 'structural',
      depth: 0,
      color: COLORS.residual,
    },
    ...(useMoe
      ? [
          {
            label: `MoE Experts (E=${moeExperts})`,
            size: moeExperts,
            beta1: moeExperts - 1,
            foldLabel: `Weighted top-${config.moeTopK} sum`,
            whipType: 'selective race',
            depth: 1,
            color: COLORS.moe,
          } as WhipExhaustionForkAxis,
        ]
      : [
          {
            label: `FFN Neurons (${ffnExpansion}x)`,
            size: ffnExpansion,
            beta1: ffnExpansion - 1,
            foldLabel: 'Contraction W_2',
            whipType: 'soft vent/fold',
            depth: 1,
            color: COLORS.ffn,
          } as WhipExhaustionForkAxis,
        ]),
  ];

  const totalBeta1 = axes.reduce((sum, axis) => sum + axis.beta1, 0);
  const whipCount = axes.filter((a) => a.beta1 > 0).length;

  // Telescoping sum: partial products showing discharge at each fold
  const telescopingSum = axes.map((a) => a.beta1);

  // Taper ratio: innermost discharge / outermost discharge
  const innermost = Math.max(...axes.map((a) => a.beta1));
  const outermost = Math.min(
    ...axes.filter((a) => a.beta1 > 0).map((a) => a.beta1)
  );
  const taperRatio = outermost > 0 ? innermost / outermost : 1;

  return {
    label: 'ch17-whip-exhaustion-figure-v1',
    config,
    axes,
    totalBeta1,
    whipCount,
    telescopingSum,
    taperRatio,
  };
}

/* ------------------------------------------------------------------ */
/*  SVG primitives (matching existing figure style)                    */
/* ------------------------------------------------------------------ */

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function svgCircle(
  svg: string[],
  x: number,
  y: number,
  radius: number,
  fill: string,
  stroke: string,
  strokeWidth = 2
): void {
  svg.push(
    `<circle cx="${x}" cy="${y}" r="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`
  );
}

function svgRect(
  svg: string[],
  x: number,
  y: number,
  width: number,
  height: number,
  fill: string,
  stroke: string,
  rx = 12
): void {
  svg.push(
    `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${rx}" ry="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`
  );
}

function svgLabel(
  svg: string[],
  x: number,
  y: number,
  text: string,
  options: {
    readonly anchor?: 'start' | 'middle' | 'end';
    readonly color?: string;
    readonly size?: number;
    readonly weight?: number;
    readonly italic?: boolean;
  } = {}
): void {
  const style = options.italic ? ' font-style="italic"' : '';
  svg.push(
    `<text x="${x}" y="${y}" text-anchor="${
      options.anchor ?? 'middle'
    }" font-family="Georgia, Times New Roman, serif" font-size="${
      options.size ?? 14
    }" font-weight="${options.weight ?? 400}" fill="${
      options.color ?? COLORS.text
    }"${style}>${escapeXml(text)}</text>`
  );
}

function svgCurve(
  svg: string[],
  d: string,
  color: string,
  options: {
    readonly width?: number;
    readonly dashed?: boolean;
    readonly marker?: boolean;
  } = {}
): void {
  svg.push(
    `<path d="${d}" fill="none" stroke="${color}" stroke-width="${
      options.width ?? 2
    }" stroke-linecap="round" stroke-linejoin="round"${
      options.dashed ? ' stroke-dasharray="6 5"' : ''
    }${options.marker ? ' marker-end="url(#arrow)"' : ''}/>`
  );
}

function svgBadge(
  svg: string[],
  x: number,
  y: number,
  text: string,
  fill: string,
  stroke: string,
  textColor: string
): void {
  const width = text.length * 8.5 + 20;
  const height = 26;
  svgRect(svg, x - width / 2, y - height / 2, width, height, fill, stroke, 13);
  svgLabel(svg, x, y + 5, text, { size: 12, weight: 600, color: textColor });
}

/* ------------------------------------------------------------------ */
/*  Main SVG renderer                                                  */
/* ------------------------------------------------------------------ */

export function renderCh17WhipExhaustionFigureSvg(
  report: Ch17WhipExhaustionFigureReport
): string {
  const W = 1000;
  const H = 820;
  const svg: string[] = [];

  // --- SVG root ---
  svg.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Whip Exhaustion: per-layer fork dimension completeness">`
  );

  // --- Defs: arrow marker, gradients ---
  svg.push('<defs>');
  svg.push(
    `<marker id="arrow" viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="8" markerHeight="6" orient="auto-start-reverse"><polygon points="0 0, 10 3.5, 0 7" fill="${COLORS.flow}"/></marker>`
  );
  svg.push(
    `<marker id="arrow-snap" viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="8" markerHeight="6" orient="auto-start-reverse"><polygon points="0 0, 10 3.5, 0 7" fill="${COLORS.snap}"/></marker>`
  );
  svg.push(
    `<linearGradient id="taper-grad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="${COLORS.snap}" stop-opacity="0.08"/><stop offset="100%" stop-color="${COLORS.snap}" stop-opacity="0.35"/></linearGradient>`
  );
  svg.push('</defs>');

  // --- Background ---
  svgRect(svg, 0, 0, W, H, COLORS.bg, 'none', 0);

  // --- Title ---
  svgLabel(
    svg,
    W / 2,
    38,
    'Whip Exhaustion: Transformer Fork Dimension Completeness',
    {
      size: 22,
      weight: 700,
    }
  );
  svgLabel(
    svg,
    W / 2,
    62,
    `N=${report.config.heads} heads, ${
      report.config.moeExperts > 0
        ? `E=${report.config.moeExperts} MoE experts`
        : `${report.config.ffnExpansion}x FFN`
    } — Total beta_1 = ${report.totalBeta1}, ${
      report.whipCount
    } whip snaps per layer`,
    {
      size: 13,
      color: COLORS.textLight,
      italic: true,
    }
  );

  // ================================================================
  // LEFT PANEL: Nesting tree
  // ================================================================
  const treeX = 70;
  const treeY = 110;
  const treeW = 440;
  const treeH = 580;

  svgRect(svg, treeX - 10, treeY - 20, treeW, treeH, '#ffffff', COLORS.border);
  svgLabel(svg, treeX + treeW / 2 - 10, treeY, 'Per-Layer Nesting Tree', {
    size: 16,
    weight: 700,
  });

  // Draw the computation flow as a vertical tree
  const nodeW = 180;
  const nodeH = 44;
  const centerX = treeX + treeW / 2 - 10;
  let curY = treeY + 35;

  // Input node
  svgCircle(svg, centerX, curY, 16, COLORS.bg, COLORS.border);
  svgLabel(svg, centerX, curY + 5, 'Input', { size: 11, weight: 600 });
  const inputY = curY;
  curY += 40;

  // --- Residual Fork 1 ---
  const resFork1Y = curY;
  svgRect(
    svg,
    centerX - nodeW / 2,
    curY,
    nodeW,
    nodeH,
    '#eef2ff',
    COLORS.residual
  );
  svgLabel(svg, centerX, curY + 17, 'Residual Fork 1', {
    size: 12,
    weight: 600,
    color: COLORS.residual,
  });
  svgLabel(svg, centerX, curY + 32, 'beta_1 += 1', {
    size: 10,
    color: COLORS.textLight,
    italic: true,
  });
  svgCurve(
    svg,
    `M ${centerX} ${inputY + 16} L ${centerX} ${curY}`,
    COLORS.flow,
    { marker: true }
  );

  curY += nodeH + 12;

  // Split: identity path (left) and attention sublayer (right)
  const identX = centerX - 80;
  const attnX = centerX + 80;

  // Identity path (left)
  svgRect(svg, identX - 42, curY, 84, 30, COLORS.bg, COLORS.border);
  svgLabel(svg, identX, curY + 18, 'Identity', {
    size: 11,
    color: COLORS.textLight,
  });
  svgCurve(
    svg,
    `M ${centerX - nodeW / 4} ${resFork1Y + nodeH} Q ${identX} ${
      resFork1Y + nodeH + 6
    } ${identX} ${curY}`,
    COLORS.flow,
    { dashed: true }
  );
  const identTopY = curY;

  // Attention sublayer (right)
  svgRect(svg, attnX - 60, curY, 120, 30, '#f0fdf4', COLORS.attnHead);
  svgLabel(svg, attnX, curY + 18, 'Attention', {
    size: 11,
    weight: 600,
    color: COLORS.attnHead,
  });
  svgCurve(
    svg,
    `M ${centerX + nodeW / 4} ${resFork1Y + nodeH} Q ${attnX} ${
      resFork1Y + nodeH + 6
    } ${attnX} ${curY}`,
    COLORS.attnHead,
    { marker: true }
  );

  curY += 40;

  // Head Fork (nested inside attention)
  const headForkY = curY;
  svgRect(svg, attnX - 80, curY, 160, nodeH, '#dcfce7', COLORS.attnHead);
  svgLabel(svg, attnX, curY + 17, `Head Fork (N=${report.config.heads})`, {
    size: 12,
    weight: 600,
    color: COLORS.attnHead,
  });
  svgLabel(svg, attnX, curY + 32, `beta_1 += ${report.config.heads - 1}`, {
    size: 10,
    color: COLORS.textLight,
    italic: true,
  });
  svgCurve(svg, `M ${attnX} ${curY - 10} L ${attnX} ${curY}`, COLORS.attnHead, {
    marker: true,
  });

  curY += nodeH + 12;

  // Fan out to show N head dots
  const headCount = Math.min(report.config.heads, 8); // show up to 8 dots
  const headSpread = 120;
  const headDotY = curY + 4;
  for (let i = 0; i < headCount; i++) {
    const hx = attnX - headSpread / 2 + (headSpread / (headCount - 1)) * i;
    svgCircle(svg, hx, headDotY, 5, '#dcfce7', COLORS.attnHead, 1.5);
    if (i < 3 || i === headCount - 1) {
      svgLabel(
        svg,
        hx,
        headDotY + 14,
        i < 3 ? `h${i + 1}` : `h${report.config.heads}`,
        { size: 8, color: COLORS.textLight }
      );
    }
    if (i === 3 && headCount > 4) {
      svgLabel(svg, hx, headDotY + 14, '...', {
        size: 10,
        color: COLORS.textLight,
      });
    }
  }

  curY += 30;

  // Head Fold — WHIP 1
  const headFoldY = curY;
  svgRect(svg, attnX - 80, curY, 160, 36, '#fef2f2', COLORS.snap);
  svgLabel(svg, attnX, curY + 14, 'Concat + W_O', {
    size: 11,
    weight: 600,
    color: COLORS.snap,
  });
  svgLabel(
    svg,
    attnX,
    curY + 28,
    `WHIP 1: discharges ${report.config.heads - 1} cycles`,
    { size: 9, weight: 700, color: COLORS.snap }
  );
  // Fan in lines from heads to fold
  for (let i = 0; i < headCount; i++) {
    const hx = attnX - headSpread / 2 + (headSpread / (headCount - 1)) * i;
    svgCurve(svg, `M ${hx} ${headDotY + 5} L ${attnX} ${curY}`, COLORS.snap, {
      width: 1.2,
    });
  }

  curY += 48;

  // Residual Fold 1 — WHIP 2
  const resFold1Y = curY;
  svgRect(svg, centerX - nodeW / 2, curY, nodeW, 36, '#fef2f2', COLORS.snap);
  svgLabel(svg, centerX, curY + 14, 'Additive Merge', {
    size: 11,
    weight: 600,
    color: COLORS.snap,
  });
  svgLabel(svg, centerX, curY + 28, 'WHIP 2: discharges 1 cycle', {
    size: 9,
    weight: 700,
    color: COLORS.snap,
  });
  // Join identity + attention output
  svgCurve(
    svg,
    `M ${identX} ${identTopY + 30} L ${identX} ${curY + 18} L ${
      centerX - nodeW / 2
    } ${curY + 18}`,
    COLORS.flow,
    { dashed: true }
  );
  svgCurve(
    svg,
    `M ${attnX} ${headFoldY + 36} L ${attnX} ${curY + 18} L ${
      centerX + nodeW / 2
    } ${curY + 18}`,
    COLORS.snap
  );

  curY += 48;

  // --- Residual Fork 2 ---
  const resFork2Y = curY;
  svgRect(
    svg,
    centerX - nodeW / 2,
    curY,
    nodeW,
    nodeH,
    '#eef2ff',
    COLORS.residual
  );
  svgLabel(svg, centerX, curY + 17, 'Residual Fork 2', {
    size: 12,
    weight: 600,
    color: COLORS.residual,
  });
  svgLabel(svg, centerX, curY + 32, 'beta_1 += 1', {
    size: 10,
    color: COLORS.textLight,
    italic: true,
  });
  svgCurve(
    svg,
    `M ${centerX} ${resFold1Y + 36} L ${centerX} ${curY}`,
    COLORS.flow,
    { marker: true }
  );

  curY += nodeH + 12;

  // Split: identity (left) and FFN/MoE (right)
  const ident2X = centerX - 80;
  const ffnX = centerX + 80;
  const useMoe = report.config.moeExperts > 0;
  const ffnAxis = report.axes[3];

  svgRect(svg, ident2X - 42, curY, 84, 30, COLORS.bg, COLORS.border);
  svgLabel(svg, ident2X, curY + 18, 'Identity', {
    size: 11,
    color: COLORS.textLight,
  });
  svgCurve(
    svg,
    `M ${centerX - nodeW / 4} ${resFork2Y + nodeH} Q ${ident2X} ${
      resFork2Y + nodeH + 6
    } ${ident2X} ${curY}`,
    COLORS.flow,
    { dashed: true }
  );
  const ident2TopY = curY;

  svgRect(
    svg,
    ffnX - 60,
    curY,
    120,
    30,
    useMoe ? '#fef2f2' : '#fffbeb',
    ffnAxis.color
  );
  svgLabel(svg, ffnX, curY + 18, useMoe ? 'MoE' : 'FFN', {
    size: 11,
    weight: 600,
    color: ffnAxis.color,
  });
  svgCurve(
    svg,
    `M ${centerX + nodeW / 4} ${resFork2Y + nodeH} Q ${ffnX} ${
      resFork2Y + nodeH + 6
    } ${ffnX} ${curY}`,
    ffnAxis.color,
    { marker: true }
  );

  curY += 40;

  // FFN/MoE Fork
  svgRect(
    svg,
    ffnX - 80,
    curY,
    160,
    nodeH,
    useMoe ? '#fee2e2' : '#fef3c7',
    ffnAxis.color
  );
  svgLabel(svg, ffnX, curY + 17, ffnAxis.label, {
    size: 11,
    weight: 600,
    color: ffnAxis.color,
  });
  svgLabel(svg, ffnX, curY + 32, `beta_1 += ${ffnAxis.beta1}`, {
    size: 10,
    color: COLORS.textLight,
    italic: true,
  });
  svgCurve(svg, `M ${ffnX} ${curY - 10} L ${ffnX} ${curY}`, ffnAxis.color, {
    marker: true,
  });

  curY += nodeH + 20;

  // FFN/MoE Fold — WHIP 3
  svgRect(svg, ffnX - 80, curY, 160, 36, '#fef2f2', COLORS.snap);
  svgLabel(svg, ffnX, curY + 14, ffnAxis.foldLabel, {
    size: 10,
    weight: 600,
    color: COLORS.snap,
  });
  svgLabel(svg, ffnX, curY + 28, `WHIP 3: discharges ${ffnAxis.beta1} cycles`, {
    size: 9,
    weight: 700,
    color: COLORS.snap,
  });
  const ffnFoldY = curY;

  curY += 48;

  // Residual Fold 2 — WHIP 4
  svgRect(svg, centerX - nodeW / 2, curY, nodeW, 36, '#fef2f2', COLORS.snap);
  svgLabel(svg, centerX, curY + 14, 'Additive Merge', {
    size: 11,
    weight: 600,
    color: COLORS.snap,
  });
  svgLabel(svg, centerX, curY + 28, 'WHIP 4: discharges 1 cycle', {
    size: 9,
    weight: 700,
    color: COLORS.snap,
  });
  svgCurve(
    svg,
    `M ${ident2X} ${ident2TopY + 30} L ${ident2X} ${curY + 18} L ${
      centerX - nodeW / 2
    } ${curY + 18}`,
    COLORS.flow,
    { dashed: true }
  );
  svgCurve(
    svg,
    `M ${ffnX} ${ffnFoldY + 36} L ${ffnX} ${curY + 18} L ${
      centerX + nodeW / 2
    } ${curY + 18}`,
    COLORS.snap
  );
  const resFold2Y = curY;

  curY += 48;

  // Output node
  svgCircle(svg, centerX, curY, 16, COLORS.bg, COLORS.border);
  svgLabel(svg, centerX, curY + 5, 'Output', { size: 11, weight: 600 });
  svgCurve(
    svg,
    `M ${centerX} ${resFold2Y + 36} L ${centerX} ${curY - 16}`,
    COLORS.flow,
    { marker: true }
  );
  svgLabel(svg, centerX, curY + 30, 'beta_1 = 0', {
    size: 11,
    weight: 700,
    color: COLORS.attnHead,
  });

  // ================================================================
  // RIGHT PANEL: Energy taper bar chart
  // ================================================================
  const chartX = 550;
  const chartY = 110;
  const chartW = 400;
  const chartH = 290;

  svgRect(svg, chartX, chartY - 20, chartW, chartH, '#ffffff', COLORS.border);
  svgLabel(
    svg,
    chartX + chartW / 2,
    chartY,
    'Energy Taper: Cycles Discharged per Whip',
    {
      size: 15,
      weight: 700,
    }
  );

  // Taper gradient background
  svg.push(
    `<rect x="${chartX + 20}" y="${chartY + 20}" width="${
      chartW - 40
    }" height="${chartH - 65}" rx="8" fill="url(#taper-grad)"/>`
  );

  const barX = chartX + 50;
  const barMaxW = chartW - 110;
  const barH = 38;
  const barGap = 14;
  const maxBeta1 = Math.max(...report.axes.map((a) => a.beta1));
  let barY = chartY + 35;

  for (let i = 0; i < report.axes.length; i++) {
    const axis = report.axes[i];
    if (axis.beta1 === 0) continue;
    const w = Math.max((axis.beta1 / maxBeta1) * barMaxW, 8);

    svgRect(svg, barX, barY, w, barH, axis.color + '22', axis.color, 8);
    svg.push(
      `<rect x="${barX}" y="${barY}" width="${w}" height="${barH}" rx="8" fill="${axis.color}" opacity="0.25"/>`
    );
    svgLabel(svg, barX + w + 8, barY + barH / 2 + 4, `${axis.beta1} cycles`, {
      anchor: 'start',
      size: 12,
      weight: 700,
      color: axis.color,
    });
    svgLabel(svg, barX - 5, barY + barH / 2 + 4, `Whip ${i + 1}`, {
      anchor: 'end',
      size: 11,
      weight: 600,
      color: COLORS.text,
    });
    svgLabel(svg, barX + 8, barY + barH / 2 + 4, axis.whipType, {
      anchor: 'start',
      size: 10,
      color: axis.color,
      italic: true,
    });

    barY += barH + barGap;
  }

  // Total badge
  svgBadge(
    svg,
    chartX + chartW / 2,
    barY + 20,
    `Total beta_1 = ${report.totalBeta1}`,
    '#fef3c7',
    COLORS.gold,
    '#92400e'
  );

  // ================================================================
  // RIGHT PANEL: Excluded dimensions
  // ================================================================
  const exclY = chartY + chartH + 20;
  const exclH = 280;
  svgRect(svg, chartX, exclY, chartW, exclH, '#ffffff', COLORS.border);
  svgLabel(
    svg,
    chartX + chartW / 2,
    exclY + 22,
    'Excluded (Non-Fork) Dimensions',
    {
      size: 15,
      weight: 700,
    }
  );

  const excluded = [
    {
      label: 'Layer stack (L layers)',
      reason: 'Causal dependency',
      beta1: '0',
    },
    {
      label: 'Sequence positions (T tokens)',
      reason: 'Entangled via QK^T',
      beta1: '0',
    },
    {
      label: 'Batch dimension (B samples)',
      reason: 'No cross-sample fold',
      beta1: '0',
    },
    {
      label: 'KV cache positions',
      reason: 'Sequential accumulation',
      beta1: '0',
    },
  ];

  let exY = exclY + 42;
  for (const item of excluded) {
    const rowX = chartX + 25;
    // Strikethrough-style presentation
    svgCircle(svg, rowX + 8, exY + 8, 8, '#f1f5f9', '#e2e8f0');
    svgLabel(svg, rowX + 8, exY + 12, 'X', {
      size: 10,
      weight: 700,
      color: COLORS.snap,
    });
    svgLabel(svg, rowX + 26, exY + 12, item.label, {
      anchor: 'start',
      size: 12,
      weight: 600,
    });
    svgLabel(svg, rowX + 26, exY + 30, item.reason, {
      anchor: 'start',
      size: 11,
      color: COLORS.textLight,
      italic: true,
    });
    svgBadge(
      svg,
      chartX + chartW - 50,
      exY + 16,
      `beta_1 = ${item.beta1}`,
      '#f1f5f9',
      '#e2e8f0',
      COLORS.textLight
    );
    exY += 54;
  }

  // ================================================================
  // Bottom: Conservation law summary
  // ================================================================
  const summaryY = H - 80;
  svgRect(svg, 40, summaryY, W - 80, 62, '#f0fdf4', COLORS.attnHead);
  svgLabel(
    svg,
    W / 2,
    summaryY + 22,
    `Conservation: ${report.totalBeta1} cycles created = ${report.totalBeta1} cycles discharged = beta_1(layer). After 4 folds, beta_1 = 0.`,
    {
      size: 13,
      weight: 600,
      color: COLORS.attnHead,
    }
  );
  svgLabel(
    svg,
    W / 2,
    summaryY + 44,
    `Energy taper ratio: ${report.taperRatio.toFixed(
      0
    )}:1 (inner whip discharges ${report.taperRatio.toFixed(
      0
    )}x more cycles than outer). No potential escapes the layer boundary.`,
    {
      size: 12,
      color: COLORS.textLight,
      italic: true,
    }
  );

  svg.push('</svg>');
  return svg.join('\n');
}

/* ------------------------------------------------------------------ */
/*  Markdown renderer                                                  */
/* ------------------------------------------------------------------ */

export function renderCh17WhipExhaustionFigureMarkdown(
  report: Ch17WhipExhaustionFigureReport
): string {
  const lines: string[] = [
    '# Chapter 17 Whip Exhaustion Figure',
    '',
    'Fork Dimension Completeness for Transformers (Theorem, section 6.11).',
    '',
    `**Configuration:** N=${report.config.heads} heads, ${
      report.config.moeExperts > 0
        ? `E=${report.config.moeExperts} MoE experts (top-${report.config.moeTopK})`
        : `${report.config.ffnExpansion}x FFN expansion`
    }`,
    '',
    '## Fork Axes',
    '',
    '| Axis | Size | beta_1 | Fold | Whip Type |',
    '|---|---|---|---|---|',
  ];

  for (const axis of report.axes) {
    lines.push(
      `| ${axis.label} | ${axis.size} | ${axis.beta1} | ${axis.foldLabel} | ${axis.whipType} |`
    );
  }

  lines.push(
    '',
    `**Total beta_1 per layer:** ${report.totalBeta1}`,
    `**Whip snaps per layer:** ${report.whipCount}`,
    `**Energy taper ratio:** ${report.taperRatio.toFixed(1)}:1`,
    '',
    '## Excluded Dimensions',
    '',
    '| Dimension | Reason | beta_1 |',
    '|---|---|---|',
    '| Layer stack | Causal dependency (L+1 depends on L) | 0 |',
    '| Sequence positions | Entangled via QK^T attention matrix | 0 |',
    '| Batch | Independent computations, no cross-sample fold | 0 |',
    '| KV cache | Sequential accumulation | 0 |',
    '',
    '## Conservation',
    '',
    `Total created = total discharged = ${report.totalBeta1}. After all ${report.whipCount} folds, beta_1 = 0. No potential escapes the layer boundary.`,
    '',
    '## Energy Taper',
    '',
    'Cycles discharged per whip (innermost first):',
    ''
  );

  const sorted = [...report.axes]
    .filter((a) => a.beta1 > 0)
    .sort((a, b) => b.beta1 - a.beta1);
  for (const axis of sorted) {
    lines.push(`- **${axis.label}**: ${axis.beta1} cycles (${axis.whipType})`);
  }

  lines.push(
    '',
    `The innermost fold (attention heads) discharges ${report.taperRatio.toFixed(
      0
    )}x more cycles than each outermost fold (residual). This is the computational taper: energy density concentrates inward, matching the physical whip where the tip carries the most momentum.`,
    ''
  );

  return lines.join('\n');
}
