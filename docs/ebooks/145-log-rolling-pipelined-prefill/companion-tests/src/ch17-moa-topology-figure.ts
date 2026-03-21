const STRUCTURED_MOA_NODE_PATTERN =
  /^\(\s*([A-Za-z_][A-Za-z0-9_]*)\s*:\s*StructuredMoA\s*{([^}]*)}\s*\)\s*$/m;

interface StructuredMoaFigureConfig {
  readonly primitive: string;
  readonly blocks: number;
  readonly activeBlocks: number;
  readonly heads: number;
  readonly activeHeads: number;
  readonly stages: number;
  readonly chunks: number;
}

interface TopologyLegend {
  readonly active: string;
  readonly suppressed: string;
}

export interface Ch17MoaTopologyFigureReport {
  readonly label: 'ch17-moa-topology-figure-v1';
  readonly primitive: string;
  readonly sparseTopologyPath: string;
  readonly denseTopologyPath: string;
  readonly stages: number;
  readonly chunks: number;
  readonly blocks: number;
  readonly activeBlocks: number;
  readonly headsPerBlock: number;
  readonly activeHeadsPerLiveBlock: number;
  readonly sparseExample: {
    readonly activeBlockLabels: readonly string[];
    readonly suppressedBlockLabels: readonly string[];
    readonly activeHeadLabels: readonly string[];
    readonly suppressedHeadLabels: readonly string[];
  };
  readonly denseBaseline: {
    readonly blockLabels: readonly string[];
    readonly headLabels: readonly string[];
  };
  readonly legend: TopologyLegend;
}

interface PanelLayout {
  readonly title: string;
  readonly subtitle: string;
  readonly activeBlocks: number;
  readonly activeHeads: number;
  readonly showSuppressed: boolean;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

interface BlockLayout {
  readonly label: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly active: boolean;
  readonly activeHeads: number;
  readonly totalHeads: number;
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function parsePositiveInt(
  rawValue: string | undefined,
  fallback: number
): number {
  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.max(1, Math.floor(parsed));
}

function parseProperties(propertiesRaw: string): Record<string, string> {
  if (!propertiesRaw) {
    return {};
  }

  const properties: Record<string, string> = {};
  const pairs = propertiesRaw.match(
    /(\w+)\s*:\s*('[^']*'|"[^"]*"|\[[^\]]*\]|[^,]+)/g
  );
  if (!pairs) {
    return properties;
  }

  for (const pair of pairs) {
    const separator = pair.indexOf(':');
    if (separator < 0) {
      continue;
    }

    const key = pair.slice(0, separator).trim();
    const value = pair
      .slice(separator + 1)
      .trim()
      .replace(/^['"]|['"]$/g, '');

    if (key.length > 0 && value.length > 0) {
      properties[key] = value;
    }
  }

  return properties;
}

function alphabeticLabel(index: number): string {
  const code = 'A'.charCodeAt(0) + index;
  return String.fromCharCode(code);
}

function parseStructuredMoaConfig(source: string): StructuredMoaFigureConfig {
  const match = source.match(STRUCTURED_MOA_NODE_PATTERN);
  if (!match?.[1] || !match[2]) {
    throw new Error('Could not find StructuredMoA node in sparse GG source.');
  }

  const properties = parseProperties(match[2]);
  const blocks = parsePositiveInt(properties.blocks, 4);
  const activeBlocks = Math.min(
    blocks,
    parsePositiveInt(properties.activeBlocks ?? properties.active_blocks, 2)
  );
  const heads = parsePositiveInt(properties.heads, 4);
  const activeHeads = Math.min(
    heads,
    parsePositiveInt(properties.activeHeads ?? properties.active_heads, 2)
  );

  return {
    primitive: match[1],
    blocks,
    activeBlocks,
    heads,
    activeHeads,
    stages: parsePositiveInt(properties.stages, 4),
    chunks: parsePositiveInt(properties.chunks, 2),
  };
}

function circle(
  svg: string[],
  x: number,
  y: number,
  radius: number,
  fill: string,
  stroke: string,
  dashed = false
): void {
  svg.push(
    `<circle cx="${x}" cy="${y}" r="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="2"${
      dashed ? ' stroke-dasharray="7 6"' : ''
    }/>`
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
  dashed = false
): void {
  svg.push(
    `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="16" ry="16" fill="${fill}" stroke="${stroke}" stroke-width="2"${
      dashed ? ' stroke-dasharray="8 7"' : ''
    }/>`
  );
}

function label(
  svg: string[],
  x: number,
  y: number,
  text: string,
  options: {
    readonly size?: number;
    readonly weight?: number;
    readonly color?: string;
    readonly anchor?: 'start' | 'middle' | 'end';
  } = {}
): void {
  svg.push(
    `<text x="${x}" y="${y}" text-anchor="${
      options.anchor ?? 'middle'
    }" font-family="Georgia, Times New Roman, serif" font-size="${
      options.size ?? 15
    }" font-weight="${options.weight ?? 400}" fill="${
      options.color ?? '#334155'
    }">${escapeXml(text)}</text>`
  );
}

function multilineLabel(
  svg: string[],
  x: number,
  y: number,
  lines: readonly string[],
  options: {
    readonly size?: number;
    readonly weight?: number;
    readonly color?: string;
    readonly anchor?: 'start' | 'middle' | 'end';
    readonly lineHeight?: number;
  } = {}
): void {
  const lineHeight =
    options.lineHeight ?? Math.round((options.size ?? 12) * 1.2);
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
      options.size ?? 12
    }" font-weight="${options.weight ?? 400}" fill="${
      options.color ?? '#334155'
    }">${tspans}</text>`
  );
}

function arrow(
  svg: string[],
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  dashed = false
): void {
  svg.push(
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="2.5"${
      dashed ? ' stroke-dasharray="8 7"' : ''
    } marker-end="url(#arrow-${dashed ? 'suppressed' : 'active'})"/>`
  );
}

function drawBlock(
  svg: string[],
  block: BlockLayout
): { readonly outputX: number; readonly outputY: number } {
  const activeStroke = block.active ? '#0f766e' : '#94a3b8';
  const activeFill = block.active ? '#fcfffe' : '#f8fafc';
  rect(
    svg,
    block.x,
    block.y,
    block.width,
    block.height,
    activeFill,
    activeStroke,
    !block.active
  );
  label(svg, block.x + block.width / 2, block.y + 28, block.label, {
    size: 18,
    weight: 700,
    color: '#1f2937',
  });

  const topNodeY = block.y + 66;
  const topLeftX = block.x + 36;
  const topRightX = block.x + block.width - 36;
  circle(svg, topLeftX, topNodeY, 13, '#fffdf8', '#334155');
  circle(svg, topRightX, topNodeY, 13, '#fffdf8', '#c2410c');
  multilineLabel(svg, topLeftX, topNodeY + 28, ['head', 'rot'], {
    size: 11,
    lineHeight: 12,
  });
  multilineLabel(svg, topRightX, topNodeY + 28, ['head', 'sel'], {
    size: 11,
    lineHeight: 12,
  });
  arrow(svg, topLeftX + 12, topNodeY, topRightX - 12, topNodeY, '#64748b');

  const headY = block.y + 132;
  const headSpacing = block.width / (block.totalHeads + 1);
  const whipX = block.x + block.width / 2;
  const whipY = block.y + 198;

  for (let headIndex = 0; headIndex < block.totalHeads; headIndex++) {
    const headX = block.x + headSpacing * (headIndex + 1);
    const headLabel = `h${headIndex + 1}`;
    const headActive = block.active && headIndex < block.activeHeads;
    circle(
      svg,
      headX,
      headY,
      13,
      headActive ? '#dcfce7' : '#f8fafc',
      headActive ? '#0f766e' : '#94a3b8',
      !headActive
    );
    label(svg, headX, headY + 5, headLabel, {
      size: 12,
      weight: 700,
      color: headActive ? '#065f46' : '#64748b',
    });
    arrow(
      svg,
      topRightX,
      topNodeY + 12,
      headX,
      headY - 13,
      headActive ? '#0f766e' : '#94a3b8',
      !headActive
    );
    arrow(
      svg,
      headX,
      headY + 13,
      whipX,
      whipY - 14,
      headActive ? '#0f766e' : '#94a3b8',
      !headActive
    );
  }

  circle(svg, whipX, whipY, 16, '#fff7ed', '#c2410c', !block.active);
  multilineLabel(svg, whipX, whipY + 34, ['inner', 'whip'], {
    size: 11,
    lineHeight: 12,
    color: '#7c2d12',
  });

  return {
    outputX: whipX,
    outputY: whipY + 16,
  };
}

function drawPanel(
  svg: string[],
  report: Ch17MoaTopologyFigureReport,
  panel: PanelLayout
): void {
  rect(svg, panel.x, panel.y, panel.width, panel.height, '#fffdf8', '#d6d3c7');
  label(svg, panel.x + 28, panel.y + 36, panel.title, {
    anchor: 'start',
    size: 24,
    weight: 700,
    color: '#1f2937',
  });
  label(svg, panel.x + 28, panel.y + 62, panel.subtitle, {
    anchor: 'start',
    size: 14,
    color: '#64748b',
  });

  const centerX = panel.x + panel.width / 2;
  const inputY = panel.y + 112;
  const outerRotationY = panel.y + 182;
  const outerRouterY = panel.y + 252;
  const outerWhipY = panel.y + panel.height - 94;
  const outputY = panel.y + panel.height - 32;
  const blockY = panel.y + 310;
  const blockWidth = 148;
  const blockHeight = 240;
  const gap = (panel.width - blockWidth * report.blocks) / (report.blocks + 1);

  circle(svg, centerX, inputY, 15, '#fffdf8', '#334155');
  label(svg, centerX, inputY + 38, 'input', { size: 14 });
  circle(svg, centerX, outerRotationY, 16, '#eff6ff', '#2563eb');
  label(svg, centerX, outerRotationY + 40, 'outer rot', {
    size: 13,
    color: '#1d4ed8',
  });
  circle(svg, centerX, outerRouterY, 16, '#fff7ed', '#c2410c');
  // Background rect behind "outer router" label to prevent overlap with connection lines
  const outerRouterLabelY = outerRouterY + 40;
  const outerRouterLabelWidth = 96;
  const outerRouterLabelHeight = 20;
  svg.push(
    `<rect x="${centerX - outerRouterLabelWidth / 2}" y="${
      outerRouterLabelY - outerRouterLabelHeight / 2 - 2
    }" width="${outerRouterLabelWidth}" height="${outerRouterLabelHeight}" fill="#fffdf8" rx="4" ry="4"/>`
  );
  label(svg, centerX, outerRouterY + 40, 'outer router', {
    size: 13,
    color: '#7c2d12',
  });
  arrow(svg, centerX, inputY + 15, centerX, outerRotationY - 16, '#64748b');
  arrow(
    svg,
    centerX,
    outerRotationY + 16,
    centerX,
    outerRouterY - 16,
    '#2563eb'
  );

  const blockLabels = report.denseBaseline.blockLabels;
  const activeBlocks = panel.activeBlocks;
  const activeHeads = panel.activeHeads;
  const blockOutputs: {
    readonly outputX: number;
    readonly outputY: number;
    readonly active: boolean;
  }[] = [];

  // Each block box renders the inner head rotation/router, labeled heads, and inner whip.
  for (let blockIndex = 0; blockIndex < report.blocks; blockIndex++) {
    const x = panel.x + gap * (blockIndex + 1) + blockWidth * blockIndex;
    const block = drawBlock(svg, {
      label: blockLabels[blockIndex] ?? `blk ${blockIndex + 1}`,
      x,
      y: blockY,
      width: blockWidth,
      height: blockHeight,
      active: blockIndex < activeBlocks,
      activeHeads,
      totalHeads: report.headsPerBlock,
    });
    const blockActive = blockIndex < activeBlocks;
    arrow(
      svg,
      centerX,
      outerRouterY + 16,
      x + blockWidth / 2,
      blockY,
      blockActive ? '#0f766e' : '#94a3b8',
      panel.showSuppressed && !blockActive
    );
    blockOutputs.push({
      outputX: block.outputX,
      outputY: block.outputY,
      active: blockActive,
    });
  }

  circle(svg, centerX, outerWhipY, 18, '#fff7ed', '#c2410c');
  label(svg, centerX, outerWhipY + 42, 'outer whip', {
    size: 14,
    color: '#7c2d12',
  });
  for (const output of blockOutputs) {
    arrow(
      svg,
      output.outputX,
      output.outputY,
      centerX,
      outerWhipY - 18,
      output.active ? '#0f766e' : '#94a3b8',
      panel.showSuppressed && !output.active
    );
  }
  circle(svg, centerX, outputY, 15, '#fffdf8', '#334155');
  label(svg, centerX, outputY + 36, 'output', { size: 14 });
  arrow(svg, centerX, outerWhipY + 18, centerX, outputY - 15, '#c2410c');
}

export function buildCh17MoaTopologyFigureReport(
  sparseTopologySource: string,
  sparseTopologyPath: string,
  denseTopologyPath: string
): Ch17MoaTopologyFigureReport {
  const config = parseStructuredMoaConfig(sparseTopologySource);
  const blockLabels = Array.from(
    { length: config.blocks },
    (_, index) => `blk ${alphabeticLabel(index)}`
  );
  const headLabels = Array.from(
    { length: config.heads },
    (_, index) => `h${index + 1}`
  );

  return {
    label: 'ch17-moa-topology-figure-v1',
    primitive: 'StructuredMoA',
    sparseTopologyPath,
    denseTopologyPath,
    stages: config.stages,
    chunks: config.chunks,
    blocks: config.blocks,
    activeBlocks: config.activeBlocks,
    headsPerBlock: config.heads,
    activeHeadsPerLiveBlock: config.activeHeads,
    sparseExample: {
      activeBlockLabels: blockLabels.slice(0, config.activeBlocks),
      suppressedBlockLabels: blockLabels.slice(config.activeBlocks),
      activeHeadLabels: headLabels.slice(0, config.activeHeads),
      suppressedHeadLabels: headLabels.slice(config.activeHeads),
    },
    denseBaseline: {
      blockLabels,
      headLabels,
    },
    legend: {
      active: 'solid edges show live routed paths',
      suppressed: 'dashed edges show suppressed sparse paths',
    },
  };
}

export function renderCh17MoaTopologyFigureMarkdown(
  report: Ch17MoaTopologyFigureReport
): string {
  const lines: string[] = [];
  lines.push('# Chapter 17 MoA Topology Figure');
  lines.push('');
  lines.push(`- Label: \`${report.label}\``);
  lines.push(`- Primitive: \`${report.primitive}\``);
  lines.push(`- Sparse GG topology: \`${report.sparseTopologyPath}\``);
  lines.push(`- Dense GG topology: \`${report.denseTopologyPath}\``);
  lines.push(
    `- Outer Wallington stages/chunks: \`${report.stages}\` / \`${report.chunks}\``
  );
  lines.push(
    `- Sparse block activity: \`${report.activeBlocks}/${report.blocks}\``
  );
  lines.push(
    `- Sparse head activity per live block: \`${report.activeHeadsPerLiveBlock}/${report.headsPerBlock}\``
  );
  lines.push('');
  lines.push('## Sparse StructuredMoA');
  lines.push('');
  lines.push(
    `- Live blocks: \`${report.sparseExample.activeBlockLabels.join(
      ', '
    )}\`; suppressed blocks: \`${report.sparseExample.suppressedBlockLabels.join(
      ', '
    )}\``
  );
  lines.push(
    `- Live heads: \`${report.sparseExample.activeHeadLabels.join(
      ', '
    )}\`; suppressed heads: \`${report.sparseExample.suppressedHeadLabels.join(
      ', '
    )}\``
  );
  lines.push('');
  lines.push('## Dense rotated baseline');
  lines.push('');
  lines.push(
    `- Live blocks: \`${report.denseBaseline.blockLabels.join(', ')}\``
  );
  lines.push(`- Live heads: \`${report.denseBaseline.headLabels.join(', ')}\``);
  lines.push('');
  lines.push('## Legend');
  lines.push('');
  lines.push(`- Active: ${report.legend.active}`);
  lines.push(`- Suppressed: ${report.legend.suppressed}`);
  lines.push('');
  lines.push(
    'Interpretation: this figure isolates the executable topology itself rather than the benchmark metrics. The sparse panel shows one `2-of-4` router realization of `StructuredMoA`, with `2-of-4` heads live inside each selected block; the dense panel shows the matched `4-of-4` baseline with the same Wallington outer/inner rotations and Worthington inner/outer whips but no suppression.'
  );
  lines.push('');
  return `${lines.join('\n')}\n`;
}

export function renderCh17MoaTopologyFigureSvg(
  report: Ch17MoaTopologyFigureReport
): string {
  const width = 1400;
  const height = 980;
  const sparseSubtitle = `${report.activeBlocks}/${report.blocks} blocks live, ${report.activeHeadsPerLiveBlock}/${report.headsPerBlock} heads per live block`;
  const denseSubtitle = `${report.blocks}/${report.blocks} blocks live, ${report.headsPerBlock}/${report.headsPerBlock} heads per block`;
  const svg: string[] = [];
  svg.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">`
  );
  svg.push(
    '<title id="title">Chapter 17 StructuredMoA topology figure</title>'
  );
  svg.push(
    '<desc id="desc">Artifact-generated topology figure showing the sparse StructuredMoA realization against the dense rotated baseline with labeled head rotation, head router, heads, and inner/outer whips.</desc>'
  );
  svg.push(
    '<defs><marker id="arrow-active" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#0f766e"/></marker><marker id="arrow-suppressed" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8"/></marker></defs>'
  );
  svg.push(
    '<rect x="0" y="0" width="1400" height="980" fill="#f7f4ea" rx="24" ry="24"/>'
  );
  label(svg, 700, 66, 'StructuredMoA Topology', {
    size: 34,
    weight: 700,
    color: '#1f2937',
  });
  label(
    svg,
    700,
    96,
    `Primitive ${report.primitive} rendered as a sparse 2-of-4 realization against the matched dense baseline`,
    {
      size: 16,
      color: '#475569',
    }
  );

  drawPanel(svg, report, {
    title: 'Sparse StructuredMoA',
    subtitle: sparseSubtitle,
    activeBlocks: report.activeBlocks,
    activeHeads: report.activeHeadsPerLiveBlock,
    showSuppressed: true,
    x: 44,
    y: 126,
    width: 640,
    height: 776,
  });
  drawPanel(svg, report, {
    title: 'Dense rotated baseline',
    subtitle: denseSubtitle,
    activeBlocks: report.blocks,
    activeHeads: report.headsPerBlock,
    showSuppressed: false,
    x: 716,
    y: 126,
    width: 640,
    height: 776,
  });

  circle(svg, 526, 934, 10, '#dcfce7', '#0f766e');
  label(svg, 546, 939, 'solid = live path', {
    anchor: 'start',
    size: 14,
    color: '#334155',
  });
  circle(svg, 834, 934, 10, '#f8fafc', '#94a3b8', true);
  label(svg, 854, 939, 'dashed = suppressed sparse path', {
    anchor: 'start',
    size: 14,
    color: '#334155',
  });
  svg.push('</svg>');
  return `${svg.join('\n')}\n`;
}
