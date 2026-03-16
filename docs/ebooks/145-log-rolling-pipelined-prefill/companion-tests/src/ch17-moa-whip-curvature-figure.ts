import type { Ch17MoaTopologyFigureReport } from './ch17-moa-topology-figure';

interface Point {
  readonly x: number;
  readonly y: number;
}

interface CurvatureBlock {
  readonly label: string;
  readonly active: boolean;
  readonly activeHeads: number;
  readonly center: Point;
}

export interface Ch17MoaWhipCurvatureFigureReport {
  readonly label: 'ch17-moa-whip-curvature-figure-v1';
  readonly sourceLabel: string;
  readonly primitive: string;
  readonly sparseTopologyPath: string;
  readonly stages: number;
  readonly chunks: number;
  readonly blocks: number;
  readonly activeBlocks: number;
  readonly headsPerBlock: number;
  readonly activeHeadsPerLiveBlock: number;
  readonly activeBlockLabels: readonly string[];
  readonly suppressedBlockLabels: readonly string[];
  readonly activeHeadLabels: readonly string[];
  readonly suppressedHeadLabels: readonly string[];
  readonly curvatureView: {
    readonly outerEnvelopeLabel: string;
    readonly innerEnvelopeLabel: string;
    readonly foldSnapLabel: string;
  };
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function circle(
  svg: string[],
  x: number,
  y: number,
  radius: number,
  fill: string,
  stroke: string,
  dashed = false,
): void {
  svg.push(
    `<circle cx="${x}" cy="${y}" r="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="2"${
      dashed ? ' stroke-dasharray="7 6"' : ''
    }/>`,
  );
}

function rect(
  svg: string[],
  x: number,
  y: number,
  width: number,
  height: number,
  fill: string,
  stroke: string,
  dashed = false,
): void {
  svg.push(
    `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="18" ry="18" fill="${fill}" stroke="${stroke}" stroke-width="2"${
      dashed ? ' stroke-dasharray="8 7"' : ''
    }/>`,
  );
}

function label(
  svg: string[],
  x: number,
  y: number,
  text: string,
  options: {
    readonly anchor?: 'start' | 'middle' | 'end';
    readonly color?: string;
    readonly size?: number;
    readonly weight?: number;
  } = {},
): void {
  svg.push(
    `<text x="${x}" y="${y}" text-anchor="${
      options.anchor ?? 'middle'
    }" font-family="Georgia, Times New Roman, serif" font-size="${
      options.size ?? 15
    }" font-weight="${options.weight ?? 400}" fill="${
      options.color ?? '#334155'
    }">${escapeXml(text)}</text>`,
  );
}

function multilineLabel(
  svg: string[],
  x: number,
  y: number,
  lines: readonly string[],
  options: {
    readonly anchor?: 'start' | 'middle' | 'end';
    readonly color?: string;
    readonly size?: number;
    readonly weight?: number;
    readonly lineHeight?: number;
  } = {},
): void {
  const lineHeight = options.lineHeight ?? Math.round((options.size ?? 15) * 1.3);
  const tspans = lines
    .map((line, index) => {
      const dy = index === 0 ? '0' : String(lineHeight);
      return `<tspan x="${x}" dy="${dy}">${escapeXml(line)}</tspan>`;
    })
    .join('');
  svg.push(
    `<text x="${x}" y="${y}" text-anchor="${
      options.anchor ?? 'middle'
    }" font-family="Georgia, Times New Roman, serif" font-size="${
      options.size ?? 15
    }" font-weight="${options.weight ?? 400}" fill="${
      options.color ?? '#334155'
    }">${tspans}</text>`,
  );
}

function estimateTextWidth(text: string, size: number): number {
  return text.length * size * 0.56;
}

function badge(
  svg: string[],
  x: number,
  y: number,
  text: string,
  options: {
    readonly fill?: string;
    readonly stroke?: string;
    readonly textColor?: string;
    readonly size?: number;
    readonly paddingX?: number;
    readonly paddingY?: number;
  } = {},
): void {
  const size = options.size ?? 14;
  const paddingX = options.paddingX ?? 14;
  const paddingY = options.paddingY ?? 10;
  const width = estimateTextWidth(text, size) + paddingX * 2;
  const height = size + paddingY * 2;

  rect(
    svg,
    x - width / 2,
    y - height / 2,
    width,
    height,
    options.fill ?? '#fff7ed',
    options.stroke ?? '#f59e0b',
  );
  label(svg, x, y + size * 0.28, text, {
    size,
    color: options.textColor ?? '#92400e',
  });
}

function curve(
  svg: string[],
  d: string,
  color: string,
  options: {
    readonly dashed?: boolean;
    readonly width?: number;
    readonly opacity?: number;
    readonly marker?: 'active' | 'suppressed' | 'guide' | 'none';
  } = {},
): void {
  const marker =
    options.marker === undefined || options.marker === 'none'
      ? ''
      : ` marker-end="url(#arrow-${options.marker})"`;
  svg.push(
    `<path d="${d}" fill="none" stroke="${color}" stroke-width="${
      options.width ?? 2.5
    }" stroke-linecap="round" stroke-linejoin="round"${
      options.dashed ? ' stroke-dasharray="8 7"' : ''
    }${
      options.opacity === undefined ? '' : ` opacity="${options.opacity}"`
    }${marker}/>`,
  );
}

function polar(center: Point, radius: number, angleDegrees: number): Point {
  const radians = (angleDegrees * Math.PI) / 180;
  return {
    x: center.x + Math.cos(radians) * radius,
    y: center.y - Math.sin(radians) * radius,
  };
}

function blockAngles(blocks: number, activeBlocks: number): readonly number[] {
  if (blocks === 4 && activeBlocks === 2) {
    return [150, 30, 330, 210];
  }

  const activeAngles = Array.from({ length: activeBlocks }, (_, index) =>
    150 - (120 * index) / Math.max(activeBlocks - 1, 1),
  );
  const suppressedCount = Math.max(blocks - activeBlocks, 0);
  const suppressedAngles = Array.from({ length: suppressedCount }, (_, index) =>
    330 - (120 * index) / Math.max(suppressedCount - 1, 1),
  );
  return [...activeAngles, ...suppressedAngles];
}

function buildBlocks(report: Ch17MoaWhipCurvatureFigureReport): CurvatureBlock[] {
  const center = { x: 680, y: 560 };
  const radius = 275;
  const labels = [
    ...report.activeBlockLabels,
    ...report.suppressedBlockLabels,
  ];
  const angles = blockAngles(report.blocks, report.activeBlocks);

  return labels.map((labelText, index) => ({
    label: labelText,
    active: index < report.activeBlocks,
    activeHeads: index < report.activeBlocks ? report.activeHeadsPerLiveBlock : 0,
    center: polar(center, radius, angles[index] ?? 0),
  }));
}

function drawCurvedBlock(
  svg: string[],
  block: CurvatureBlock,
  report: Ch17MoaWhipCurvatureFigureReport,
): { readonly inlet: Point; readonly outlet: Point } {
  const width = 184;
  const height = 176;
  const x = block.center.x - width / 2;
  const y = block.center.y - height / 2;
  const stroke = block.active ? '#0f766e' : '#94a3b8';
  const fill = block.active ? '#fcfffe' : '#f8fafc';
  const dashed = !block.active;
  const innerRotation = { x: x + 44, y: y + 44 };
  const innerRouter = { x: x + width - 44, y: y + 44 };
  const innerWhip = { x: x + width / 2, y: y + height - 38 };
  const arcCenter = { x: x + width / 2, y: y + 100 };
  const radius = 58;

  rect(svg, x, y, width, height, fill, stroke, dashed);
  label(svg, x + width / 2, y + 22, block.label, {
    size: 18,
    weight: 700,
    color: '#1f2937',
  });

  circle(svg, innerRotation.x, innerRotation.y, 12, '#eff6ff', '#2563eb');
  circle(svg, innerRouter.x, innerRouter.y, 12, '#fff7ed', '#c2410c');
  label(svg, innerRotation.x, innerRotation.y + 35, 'inner rot', {
    size: 11,
    color: '#1d4ed8',
  });
  label(svg, innerRouter.x, innerRouter.y + 35, 'inner router', {
    size: 11,
    color: '#7c2d12',
  });
  curve(
    svg,
    `M ${innerRotation.x + 12} ${innerRotation.y} C ${x + width / 2 - 18} ${y + 18} ${x + width / 2 + 18} ${y + 18} ${innerRouter.x - 12} ${innerRouter.y}`,
    '#64748b',
    { marker: 'guide' },
  );

  for (let headIndex = 0; headIndex < report.headsPerBlock; headIndex++) {
    const angle = 200 - 40 * headIndex;
    const head = polar(arcCenter, radius, angle);
    const headActive = block.active && headIndex < block.activeHeads;
    const headStroke = headActive ? '#0f766e' : '#94a3b8';
    const headFill = headActive ? '#dcfce7' : '#f8fafc';
    const marker = headActive ? 'active' : 'suppressed';

    circle(svg, head.x, head.y, 13, headFill, headStroke, !headActive);
    label(svg, head.x, head.y + 5, `h${headIndex + 1}`, {
      size: 12,
      weight: 700,
      color: headActive ? '#065f46' : '#64748b',
    });
    curve(
      svg,
      `M ${innerRouter.x} ${innerRouter.y + 12} C ${innerRouter.x - 12} ${head.y - 26} ${head.x + 12} ${head.y - 28} ${head.x} ${head.y - 13}`,
      headActive ? '#0f766e' : '#94a3b8',
      {
        dashed: !headActive,
        marker,
      },
    );
    curve(
      svg,
      `M ${head.x} ${head.y + 13} C ${head.x} ${head.y + 30} ${innerWhip.x + (head.x < innerWhip.x ? -18 : 18)} ${innerWhip.y - 24} ${innerWhip.x} ${innerWhip.y - 16}`,
      headActive ? '#0f766e' : '#94a3b8',
      {
        dashed: !headActive,
        marker,
      },
    );
  }

  circle(svg, innerWhip.x, innerWhip.y, 16, '#fff7ed', '#c2410c', dashed);
  // Offset "inner whip" label below the dashed block border to avoid overlap
  const innerWhipLabelY = innerWhip.y + 46;
  const innerWhipLabelWidth = estimateTextWidth(report.curvatureView.innerEnvelopeLabel, 12) + 12;
  const innerWhipLabelHeight = 18;
  svg.push(
    `<rect x="${innerWhip.x - innerWhipLabelWidth / 2}" y="${innerWhipLabelY - innerWhipLabelHeight / 2 - 2}" width="${innerWhipLabelWidth}" height="${innerWhipLabelHeight}" fill="${fill}" rx="4" ry="4"/>`,
  );
  label(svg, innerWhip.x, innerWhipLabelY, report.curvatureView.innerEnvelopeLabel, {
    size: 12,
    color: '#7c2d12',
  });

  return {
    inlet: { x: x + width / 2, y: y },
    outlet: { x: innerWhip.x, y: innerWhip.y + 16 },
  };
}

export function buildCh17MoaWhipCurvatureFigureReport(
  topology: Ch17MoaTopologyFigureReport,
): Ch17MoaWhipCurvatureFigureReport {
  return {
    label: 'ch17-moa-whip-curvature-figure-v1',
    sourceLabel: topology.label,
    primitive: topology.primitive,
    sparseTopologyPath: topology.sparseTopologyPath,
    stages: topology.stages,
    chunks: topology.chunks,
    blocks: topology.blocks,
    activeBlocks: topology.activeBlocks,
    headsPerBlock: topology.headsPerBlock,
    activeHeadsPerLiveBlock: topology.activeHeadsPerLiveBlock,
    activeBlockLabels: topology.sparseExample.activeBlockLabels,
    suppressedBlockLabels: topology.sparseExample.suppressedBlockLabels,
    activeHeadLabels: topology.sparseExample.activeHeadLabels,
    suppressedHeadLabels: topology.sparseExample.suppressedHeadLabels,
    curvatureView: {
      outerEnvelopeLabel: 'curved whip envelope',
      innerEnvelopeLabel: 'inner whip',
      foldSnapLabel: 'outer whip snap',
    },
  };
}

export function renderCh17MoaWhipCurvatureFigureMarkdown(
  report: Ch17MoaWhipCurvatureFigureReport,
): string {
  const lines: string[] = [];
  lines.push('# Chapter 17 MoA Whip Curvature Figure');
  lines.push('');
  lines.push(`- Label: \`${report.label}\``);
  lines.push(`- Source topology report: \`${report.sourceLabel}\``);
  lines.push(`- Primitive: \`${report.primitive}\``);
  lines.push(`- Sparse GG topology: \`${report.sparseTopologyPath}\``);
  lines.push(
    `- Outer Wallington stages/chunks: \`${report.stages}\` / \`${report.chunks}\``,
  );
  lines.push(
    `- Live blocks: \`${report.activeBlockLabels.join(', ')}\`; suppressed blocks: \`${report.suppressedBlockLabels.join(', ')}\``,
  );
  lines.push(
    `- Live heads per live block: \`${report.activeHeadLabels.join(', ')}\`; suppressed heads: \`${report.suppressedHeadLabels.join(', ')}\``,
  );
  lines.push(
    `- Curvature view: \`${report.curvatureView.outerEnvelopeLabel}\`, \`${report.curvatureView.innerEnvelopeLabel}\`, \`${report.curvatureView.foldSnapLabel}\``,
  );
  lines.push('');
  lines.push(
    'Interpretation: this supplemental view keeps the same sparse `StructuredMoA` topology but bends the paths into a wraparound composition, so the Worthington whip reads as a curved enclosure around the routed blocks rather than a straight up-down collapse.',
  );
  lines.push('');
  return `${lines.join('\n')}\n`;
}

export function renderCh17MoaWhipCurvatureFigureSvg(
  report: Ch17MoaWhipCurvatureFigureReport,
): string {
  const width = 1360;
  const height = 960;
  const panelX = 52;
  const panelY = 142;
  const panelWidth = 1256;
  const panelHeight = 770;
  const centerX = 680;
  const centerY = 560;
  const input = { x: centerX, y: 206 };
  const outerRotation = { x: centerX, y: 278 };
  const outerRouter = { x: centerX, y: 352 };
  const outerWhip = { x: centerX, y: 678 };
  const output = { x: centerX, y: 772 };
  const blocks = buildBlocks(report);
  const svg: string[] = [];

  svg.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">`,
  );
  svg.push('<title id="title">Chapter 17 MoA whip curvature figure</title>');
  svg.push(
    '<desc id="desc">Supplemental artifact-generated MoA architecture figure that bends the sparse StructuredMoA paths into a wraparound whip envelope around the routed blocks.</desc>',
  );
  svg.push(
    '<defs><marker id="arrow-active" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#0f766e"/></marker><marker id="arrow-suppressed" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8"/></marker><marker id="arrow-guide" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#c2410c"/></marker></defs>',
  );
  svg.push('<rect width="1360" height="960" fill="#f3efe5"/>');
  svg.push('<rect x="22" y="22" width="1316" height="916" rx="28" fill="#f7f4ea" stroke="#d6d3c7"/>');
  svg.push('<rect x="52" y="142" width="1256" height="770" rx="24" fill="#fffdfa" stroke="#d6d3c7"/>');
  label(svg, 680, 72, 'Whip-Wrapped StructuredMoA', {
    size: 34,
    weight: 700,
    color: '#1f2937',
  });
  label(
    svg,
    680,
    102,
    'Supplemental curvature view of the sparse 2-of-4 MoA architecture',
    { size: 17, color: '#475569' },
  );
  label(
    svg,
    panelX + panelWidth - 28,
    panelY + 34,
    `source ${report.sourceLabel}`,
    { anchor: 'end', size: 13, color: '#64748b' },
  );

  curve(
    svg,
    `M ${outerRouter.x - 26} ${outerRouter.y + 4} C 458 344 336 452 338 654 C 344 722 420 766 610 716`,
    '#f59e0b',
    { width: 18, opacity: 0.18, marker: 'none' },
  );
  curve(
    svg,
    `M ${outerRouter.x + 26} ${outerRouter.y + 4} C 902 344 1024 452 1022 654 C 1016 722 940 766 750 716`,
    '#f59e0b',
    { width: 18, opacity: 0.18, marker: 'none' },
  );
  curve(
    svg,
    `M 390 244 C 502 178 860 178 970 244`,
    '#f59e0b',
    { width: 10, opacity: 0.14, marker: 'none' },
  );
  curve(
    svg,
    `M 356 670 C 452 814 908 814 1004 670`,
    '#f59e0b',
    { width: 10, opacity: 0.12, marker: 'none' },
  );
  badge(svg, 220, 300, report.curvatureView.outerEnvelopeLabel, {
    size: 15,
    fill: '#fff7ed',
    stroke: '#f59e0b',
    textColor: '#92400e',
  });
  curve(
    svg,
    'M 305 300 C 326 298 340 286 350 270',
    '#f59e0b',
    { width: 2.5, opacity: 0.72, marker: 'none' },
  );

  circle(svg, input.x, input.y, 15, '#fffdf8', '#334155');
  label(svg, input.x, input.y + 38, 'input', { size: 14 });
  circle(svg, outerRotation.x, outerRotation.y, 16, '#eff6ff', '#2563eb');
  label(svg, outerRotation.x, outerRotation.y + 40, 'outer rot', {
    size: 13,
    color: '#1d4ed8',
  });
  circle(svg, outerRouter.x, outerRouter.y, 16, '#fff7ed', '#c2410c');
  // Background rect behind "outer router" label to prevent overlap with connection lines
  const outerRouterLabelY = outerRouter.y + 40;
  const outerRouterLabelWidth = 96;
  const outerRouterLabelHeight = 20;
  svg.push(
    `<rect x="${outerRouter.x - outerRouterLabelWidth / 2}" y="${outerRouterLabelY - outerRouterLabelHeight / 2 - 2}" width="${outerRouterLabelWidth}" height="${outerRouterLabelHeight}" fill="#fffdfa" rx="4" ry="4"/>`,
  );
  label(svg, outerRouter.x, outerRouter.y + 40, 'outer router', {
    size: 13,
    color: '#7c2d12',
  });
  curve(
    svg,
    `M ${input.x} ${input.y + 15} C ${input.x - 8} ${input.y + 42} ${outerRotation.x - 8} ${outerRotation.y - 34} ${outerRotation.x} ${outerRotation.y - 16}`,
    '#64748b',
    { marker: 'guide' },
  );
  curve(
    svg,
    `M ${outerRotation.x} ${outerRotation.y + 16} C ${outerRotation.x + 12} ${outerRotation.y + 50} ${outerRouter.x + 12} ${outerRouter.y - 40} ${outerRouter.x} ${outerRouter.y - 16}`,
    '#2563eb',
    { marker: 'guide' },
  );

  const blockOutputs: Array<{
    readonly inlet: Point;
    readonly outlet: Point;
    readonly active: boolean;
  }> = [];

  for (const block of blocks) {
    const blockGeometry = drawCurvedBlock(svg, block, report);
    const marker = block.active ? 'active' : 'suppressed';
    curve(
      svg,
      `M ${outerRouter.x} ${outerRouter.y + 16} C ${outerRouter.x} ${outerRouter.y + 72} ${blockGeometry.inlet.x} ${blockGeometry.inlet.y - 54} ${blockGeometry.inlet.x} ${blockGeometry.inlet.y}`,
      block.active ? '#0f766e' : '#94a3b8',
      {
        dashed: !block.active,
        marker,
      },
    );
    blockOutputs.push({
      inlet: blockGeometry.inlet,
      outlet: blockGeometry.outlet,
      active: block.active,
    });
  }

  circle(svg, outerWhip.x, outerWhip.y, 18, '#fff7ed', '#c2410c');
  label(svg, outerWhip.x, outerWhip.y + 42, report.curvatureView.foldSnapLabel, {
    size: 14,
    color: '#7c2d12',
  });

  for (const blockOutput of blockOutputs) {
    const marker = blockOutput.active ? 'active' : 'suppressed';
    curve(
      svg,
      `M ${blockOutput.outlet.x} ${blockOutput.outlet.y} C ${blockOutput.outlet.x} ${blockOutput.outlet.y + 32} ${outerWhip.x + (blockOutput.outlet.x < outerWhip.x ? -86 : 86)} ${outerWhip.y - 60} ${outerWhip.x} ${outerWhip.y - 18}`,
      blockOutput.active ? '#0f766e' : '#94a3b8',
      {
        dashed: !blockOutput.active,
        marker,
      },
    );
  }

  circle(svg, output.x, output.y, 15, '#fffdf8', '#334155');
  label(svg, output.x, output.y + 36, 'output', { size: 14 });
  curve(
    svg,
    `M ${outerWhip.x} ${outerWhip.y + 18} C ${outerWhip.x} ${outerWhip.y + 52} ${output.x} ${output.y - 56} ${output.x} ${output.y - 15}`,
    '#c2410c',
    { marker: 'guide' },
  );

  rect(svg, 202, 818, 956, 66, '#fffdf8', '#d6d3c7');
  multilineLabel(
    svg,
    680,
    840,
    [
      'The sparse path family now reads as a curved enclosure:',
      'outer routing wraps around the blocks, and each block folds through an inner whip;',
      'the outer whip snaps the live paths back to one output.',
    ],
    {
      size: 15,
      color: '#475569',
      lineHeight: 18,
    },
  );

  circle(svg, 442, 900, 10, '#dcfce7', '#0f766e');
  label(svg, 462, 905, 'solid = live routed path', {
    anchor: 'start',
    size: 14,
    color: '#334155',
  });
  circle(svg, 780, 900, 10, '#f8fafc', '#94a3b8', true);
  label(svg, 800, 905, 'dashed = suppressed sparse path', {
    anchor: 'start',
    size: 14,
    color: '#334155',
  });

  svg.push('</svg>');
  return `${svg.join('\n')}\n`;
}
