interface Point {
  readonly x: number;
  readonly y: number;
}

interface LayerSummary {
  readonly kind: 'cpu' | 'gpu' | 'npu' | 'wasm';
  readonly label: string;
  readonly laneCount: number;
  readonly bindings: readonly string[];
}

export interface Ch17HeteroMoaFabricCurvatureFigureReport {
  readonly label: 'ch17-hetero-moa-fabric-curvature-figure-v1';
  readonly primitive: 'HeteroMoAFabric';
  readonly sourceSurface: {
    readonly loweringPath: string;
    readonly runtimePath: string;
    readonly benchmarkPath: string;
  };
  readonly frameProtocol: 'aeon-10-byte-binary';
  readonly scheduleStrategy: 'cannon';
  readonly pairedKernel: 'mirrored-coupled';
  readonly cpuLanes: number;
  readonly gpuLanes: number;
  readonly npuLanes: number;
  readonly wasmLanes: number;
  readonly totalLanes: number;
  readonly pairCount: number;
  readonly mirroredKernelCount: number;
  readonly launchGate: 'armed';
  readonly hedgeDelayTicks: number;
  readonly hedgePolicy: 'skip-on-sufficient';
  readonly communityMemory: 'QDoc decay';
  readonly layers: readonly LayerSummary[];
  readonly curvatureView: {
    readonly outerEnvelopeLabel: string;
    readonly layerHelixLabel: string;
    readonly pairSnapLabel: string;
    readonly metaCollapseLabel: string;
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

function polar(center: Point, radius: number, angleDegrees: number): Point {
  const radians = (angleDegrees * Math.PI) / 180;
  return {
    x: center.x + Math.cos(radians) * radius,
    y: center.y - Math.sin(radians) * radius,
  };
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
    readonly anchor?: 'start' | 'middle' | 'end';
    readonly color?: string;
    readonly size?: number;
    readonly weight?: number;
    readonly lineHeight?: number;
  } = {}
): void {
  const lineHeight =
    options.lineHeight ?? Math.round((options.size ?? 15) * 1.28);
  lines.forEach((line, index) => {
    label(svg, x, y + index * lineHeight, line, options);
  });
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
    `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="22" ry="22" fill="${fill}" stroke="${stroke}" stroke-width="2"${
      dashed ? ' stroke-dasharray="8 7"' : ''
    }/>`
  );
}

function circle(
  svg: string[],
  x: number,
  y: number,
  radius: number,
  fill: string,
  stroke: string
): void {
  svg.push(
    `<circle cx="${x}" cy="${y}" r="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`
  );
}

function curve(
  svg: string[],
  d: string,
  color: string,
  options: {
    readonly dashed?: boolean;
    readonly width?: number;
    readonly opacity?: number;
  } = {}
): void {
  svg.push(
    `<path d="${d}" fill="none" stroke="${color}" stroke-width="${
      options.width ?? 2.6
    }" stroke-linecap="round" stroke-linejoin="round"${
      options.dashed ? ' stroke-dasharray="9 8"' : ''
    }${options.opacity === undefined ? '' : ` opacity="${options.opacity}"`}/>`
  );
}

function layerAccent(kind: LayerSummary['kind']): {
  fill: string;
  stroke: string;
  pairFill: string;
  pairStroke: string;
} {
  switch (kind) {
    case 'cpu':
      return {
        fill: '#fef3c7',
        stroke: '#d97706',
        pairFill: '#fff7ed',
        pairStroke: '#c2410c',
      };
    case 'gpu':
      return {
        fill: '#dcfce7',
        stroke: '#16a34a',
        pairFill: '#ecfdf5',
        pairStroke: '#15803d',
      };
    case 'npu':
      return {
        fill: '#dbeafe',
        stroke: '#2563eb',
        pairFill: '#eff6ff',
        pairStroke: '#1d4ed8',
      };
    case 'wasm':
      return {
        fill: '#ede9fe',
        stroke: '#7c3aed',
        pairFill: '#f5f3ff',
        pairStroke: '#6d28d9',
      };
  }
}

export function buildCh17HeteroMoaFabricCurvatureFigureReport(): Ch17HeteroMoaFabricCurvatureFigureReport {
  const layers: readonly LayerSummary[] = [
    {
      kind: 'cpu',
      label: 'CPU control helix',
      laneCount: 2,
      bindings: ['native threads', 'command CUDA fallback'],
    },
    {
      kind: 'gpu',
      label: 'GPU wave helix',
      laneCount: 1,
      bindings: ['WebGPU', 'CUDA-style runner'],
    },
    {
      kind: 'npu',
      label: 'NPU route helix',
      laneCount: 1,
      bindings: ['WebNN', 'vendor NPU runner'],
    },
    {
      kind: 'wasm',
      label: 'WASM browser helix',
      laneCount: 1,
      bindings: ['WASM', 'browser worker'],
    },
  ];

  return {
    label: 'ch17-hetero-moa-fabric-curvature-figure-v1',
    primitive: 'HeteroMoAFabric',
    sourceSurface: {
      loweringPath: 'open-source/gnosis/src/structured-primitives.ts',
      runtimePath: 'open-source/gnosis/src/runtime/hetero-fabric.ts',
      benchmarkPath:
        'open-source/gnosis/src/benchmarks/hetero-moa-fabric-benchmark.ts',
    },
    frameProtocol: 'aeon-10-byte-binary',
    scheduleStrategy: 'cannon',
    pairedKernel: 'mirrored-coupled',
    cpuLanes: 2,
    gpuLanes: 1,
    npuLanes: 1,
    wasmLanes: 1,
    totalLanes: 5,
    pairCount: 5,
    mirroredKernelCount: 10,
    launchGate: 'armed',
    hedgeDelayTicks: 1,
    hedgePolicy: 'skip-on-sufficient',
    communityMemory: 'QDoc decay',
    layers,
    curvatureView: {
      outerEnvelopeLabel: 'curved meta-laminar envelope',
      layerHelixLabel: 'backend helix lanes',
      pairSnapLabel: 'paired-kernel snap',
      metaCollapseLabel: 'global race collapse',
    },
  };
}

export function renderCh17HeteroMoaFabricCurvatureFigureMarkdown(
  report: Ch17HeteroMoaFabricCurvatureFigureReport
): string {
  const lines: string[] = [];
  lines.push('# Chapter 17 Hetero MoA Fabric Curvature Figure');
  lines.push('');
  lines.push(`- Label: \`${report.label}\``);
  lines.push(`- Primitive: \`${report.primitive}\``);
  lines.push(
    `- Lanes: CPU ${report.cpuLanes}, GPU ${report.gpuLanes}, NPU ${report.npuLanes}, WASM ${report.wasmLanes} (${report.totalLanes} total; ${report.mirroredKernelCount} mirrored kernels)`
  );
  lines.push(
    `- Scheduling: \`${report.scheduleStrategy}\`, launch gate \`${report.launchGate}\`, hedge delay \`${report.hedgeDelayTicks}\`, hedge policy \`${report.hedgePolicy}\``
  );
  lines.push(`- Stream protocol: \`${report.frameProtocol}\``);
  lines.push(`- Community memory: \`${report.communityMemory}\``);
  lines.push(
    `- Curvature view: \`${report.curvatureView.outerEnvelopeLabel}\`, \`${report.curvatureView.layerHelixLabel}\`, \`${report.curvatureView.pairSnapLabel}\`, \`${report.curvatureView.metaCollapseLabel}\``
  );
  lines.push('');
  lines.push(
    'Interpretation: this paper-facing supplement reuses the wraparound curvature grammar from the whipped `StructuredMoA` figure, but bends CPU, GPU, NPU, and WASM/browser lanes into one stretched spring. The meta layer races whole device classes, each lane contains a mirrored primary/shadow pair, and the bottom snap is the single global fold where loser bytes, skipped hedges, and vent share become measurable.'
  );
  lines.push('');
  lines.push('## Layer Bindings');
  lines.push('');
  for (const layer of report.layers) {
    lines.push(
      `- ${layer.label}: ${
        layer.laneCount
      } lane(s); bindings ${layer.bindings.join(', ')}`
    );
  }
  lines.push('');
  lines.push('## Source Surfaces');
  lines.push('');
  lines.push(`- Lowering: \`${report.sourceSurface.loweringPath}\``);
  lines.push(`- Runtime: \`${report.sourceSurface.runtimePath}\``);
  lines.push(`- Benchmark: \`${report.sourceSurface.benchmarkPath}\``);
  lines.push('');
  return `${lines.join('\n')}\n`;
}

export function renderCh17HeteroMoaFabricCurvatureFigureSvg(
  report: Ch17HeteroMoaFabricCurvatureFigureReport
): string {
  const svg: string[] = [];
  const width = 1400;
  const height = 920;
  const center: Point = { x: 700, y: 430 };
  const scheduler = { x: 700, y: 190 };
  const collapse = { x: 700, y: 730 };
  const layerAngles = [150, 30, 330, 210] as const;

  svg.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">`
  );
  svg.push(
    '<title id="title">Chapter 17 Hetero MoA Fabric curvature figure</title>'
  );
  svg.push(
    '<desc id="desc">Curved backend-diverse paired-kernel MoA fabric showing a meta-laminar envelope around CPU, GPU, NPU, and WASM lanes.</desc>'
  );
  svg.push(`<rect width="${width}" height="${height}" fill="#fffdf8"/>`);
  svg.push(
    '<path d="M 130 430 C 170 170 430 44 700 44 C 970 44 1230 170 1270 430 C 1230 690 970 816 700 816 C 430 816 170 690 130 430 Z" fill="#fff7ed" stroke="#fdba74" stroke-width="3"/>'
  );
  svg.push(
    '<path d="M 260 430 C 300 250 500 142 700 142 C 900 142 1100 250 1140 430 C 1100 610 900 718 700 718 C 500 718 300 610 260 430 Z" fill="#fffbeb" stroke="#f59e0b" stroke-width="2.5" stroke-dasharray="10 8"/>'
  );

  label(svg, 700, 72, 'Curved HeteroMoAFabric', {
    size: 28,
    weight: 700,
    color: '#7c2d12',
  });
  label(svg, 700, 104, 'fork/race/merge+vent across device layers', {
    size: 16,
    color: '#9a3412',
  });
  label(svg, 700, 134, report.curvatureView.outerEnvelopeLabel, {
    size: 16,
    weight: 600,
    color: '#b45309',
  });

  rect(
    svg,
    scheduler.x - 190,
    scheduler.y - 50,
    380,
    100,
    '#ffffff',
    '#c2410c'
  );
  multilineLabel(
    svg,
    scheduler.x,
    scheduler.y - 18,
    ['Aeon 10-byte stream ingress', 'launch gate', 'cannon cursor'],
    { size: 18, weight: 600, color: '#7c2d12', lineHeight: 24 }
  );

  rect(svg, collapse.x - 195, collapse.y - 48, 390, 96, '#ffffff', '#7c3aed');
  multilineLabel(
    svg,
    collapse.x,
    collapse.y - 16,
    ['global race collapse', 'winner/loser/vent telemetry'],
    { size: 18, weight: 600, color: '#581c87', lineHeight: 24 }
  );

  curve(
    svg,
    `M ${scheduler.x} ${scheduler.y + 50} C 700 275 700 310 700 350`,
    '#ea580c',
    { width: 3.2 }
  );
  curve(
    svg,
    `M ${center.x} ${center.y + 56} C 700 580 700 625 700 700`,
    '#7c3aed',
    { width: 3.2 }
  );
  circle(svg, center.x, center.y, 82, '#fff', '#ea580c');
  multilineLabel(
    svg,
    center.x,
    center.y - 10,
    ['meta race across layers', report.communityMemory],
    { size: 18, weight: 700, color: '#9a3412', lineHeight: 26 }
  );

  report.layers.forEach((layer, index) => {
    const orbital = polar(center, 355, layerAngles[index]);
    const accent = layerAccent(layer.kind);
    const boxWidth = 320;
    const boxHeight = 144;
    const control1 = polar(center, 205, layerAngles[index]);
    const control2 = polar(center, 280, layerAngles[index]);
    const pairOrbit = layer.kind === 'cpu' ? 160 : 150;
    const pairStartAngle =
      layer.kind === 'cpu' ? layerAngles[index] - 16 : layerAngles[index] + 12;
    const pairStep = layer.laneCount === 1 ? 0 : 26;

    curve(
      svg,
      `M ${scheduler.x} ${scheduler.y + 32} C ${control1.x} ${
        control1.y - 115
      } ${control2.x} ${control2.y - 48} ${orbital.x} ${orbital.y - 64}`,
      accent.stroke,
      { width: 2.5, opacity: 0.58 }
    );
    curve(
      svg,
      `M ${orbital.x} ${orbital.y + 64} C ${control2.x} ${control2.y + 54} ${
        control1.x
      } ${control1.y + 120} ${collapse.x} ${collapse.y - 32}`,
      accent.stroke,
      { width: 2.5, opacity: 0.58 }
    );
    for (let laneIndex = 0; laneIndex < layer.laneCount; laneIndex++) {
      const laneAngle = pairStartAngle - laneIndex * pairStep;
      const pairCenter = polar(orbital, pairOrbit, laneAngle);
      curve(
        svg,
        `M ${orbital.x} ${orbital.y - 2} C ${pairCenter.x - 18} ${
          pairCenter.y - 20
        } ${pairCenter.x - 4} ${pairCenter.y - 8} ${pairCenter.x} ${
          pairCenter.y
        }`,
        accent.pairStroke,
        { width: 1.8, opacity: 0.68 }
      );
    }

    rect(
      svg,
      orbital.x - boxWidth / 2,
      orbital.y - boxHeight / 2,
      boxWidth,
      boxHeight,
      accent.fill,
      accent.stroke
    );
    multilineLabel(
      svg,
      orbital.x,
      orbital.y - 32,
      [
        layer.label,
        `${layer.laneCount} mirrored lane${layer.laneCount === 1 ? '' : 's'}`,
      ],
      { size: 19, weight: 700, color: accent.stroke, lineHeight: 24 }
    );
    multilineLabel(svg, orbital.x, orbital.y + 30, layer.bindings, {
      size: 15,
      color: '#334155',
      lineHeight: 20,
    });
    for (let laneIndex = 0; laneIndex < layer.laneCount; laneIndex++) {
      const laneAngle = pairStartAngle - laneIndex * pairStep;
      const pairCenter = polar(orbital, pairOrbit, laneAngle);
      circle(
        svg,
        pairCenter.x,
        pairCenter.y,
        24,
        accent.pairFill,
        accent.pairStroke
      );
      label(svg, pairCenter.x, pairCenter.y + 4, `P${laneIndex + 1}`, {
        size: 15,
        weight: 700,
        color: accent.pairStroke,
      });
    }
  });

  svg.push('</svg>');
  return svg.join('');
}
