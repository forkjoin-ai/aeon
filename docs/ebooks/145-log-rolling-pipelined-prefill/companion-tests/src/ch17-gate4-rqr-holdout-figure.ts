import type {
  BootstrapInterval,
  Gate4Criterion,
  Gate4DecileSummary,
  Gate4Report,
} from './gate4-rqr-holdout';

interface MetricRange {
  readonly low: number;
  readonly high: number;
}

interface Gate4FigureCriterion {
  readonly id: string;
  readonly label: string;
  readonly observed: number;
  readonly ci95?: BootstrapInterval;
  readonly threshold: string;
  readonly thresholdLow?: number;
  readonly thresholdHigh?: number;
  readonly pass: boolean;
}

interface Gate4FigureDecile {
  readonly decile: number;
  readonly count: number;
  readonly meanRqr: number;
  readonly meanObservedGain: number;
  readonly meanPredictedGain: number;
  readonly residualGain: number;
}

export interface Ch17Gate4RqrHoldoutFigureReport {
  readonly label: 'ch17-gate4-rqr-holdout-figure-v1';
  readonly sourceLabel: string;
  readonly trainingSampleCount: number;
  readonly holdoutSampleCount: number;
  readonly criteriaPassed: number;
  readonly criteriaTotal: number;
  readonly decileCount: number;
  readonly gainRange: MetricRange;
  readonly rqrRange: MetricRange;
  readonly quartileDelta: {
    readonly value: number;
    readonly ci95: BootstrapInterval;
    readonly lowQuartileMeanGain: number;
    readonly highQuartileMeanGain: number;
    readonly lowerQuartileRqr: number;
    readonly upperQuartileRqr: number;
  };
  readonly maxAbsoluteResidualGain: number;
  readonly monotonicViolations: number;
  readonly maxMonotonicViolations: number;
  readonly criteria: readonly Gate4FigureCriterion[];
  readonly deciles: readonly Gate4FigureDecile[];
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

function formatGain(value: number): string {
  const pct = value * 100;
  if (pct >= 10) {
    return `${trimFixed(pct, 2)}%`;
  }
  if (pct >= 1) {
    return `${trimFixed(pct, 3)}%`;
  }
  return `${trimFixed(pct, 4)}%`;
}

function formatMetric(value: number): string {
  return trimFixed(value, value >= 1 ? 3 : 4);
}

function formatRqr(value: number): string {
  if (value >= 0.1) {
    return trimFixed(value, 3);
  }
  if (value >= 0.01) {
    return trimFixed(value, 4);
  }
  return trimFixed(value, 5);
}

function rangeFor(values: readonly number[]): MetricRange {
  return {
    low: Math.min(...values),
    high: Math.max(...values),
  };
}

function criterionLabel(criterion: Gate4Criterion): string {
  switch (criterion.id) {
    case 'spearman_ci_low':
      return 'Spearman';
    case 'slope_ci_low':
      return 'Slope';
    case 'quartile_delta_ci_low':
      return 'Quartile Delta';
    case 'predicted_pearson_ci_low':
      return 'Predictor Pearson';
    case 'decile_monotonicity':
      return 'Monotonicity';
    default:
      return criterion.id;
  }
}

function withThreshold(
  criterion: Gate4Criterion,
  threshold: { readonly low?: number; readonly high?: number },
): Gate4FigureCriterion {
  return {
    id: criterion.id,
    label: criterionLabel(criterion),
    observed: criterion.observed,
    ci95: criterion.ci95,
    threshold: criterion.threshold,
    thresholdLow: threshold.low,
    thresholdHigh: threshold.high,
    pass: criterion.pass,
  };
}

export function buildCh17Gate4RqrHoldoutFigureReport(
  report: Gate4Report,
): Ch17Gate4RqrHoldoutFigureReport {
  const deciles = report.holdout.deciles.map<Gate4FigureDecile>((decile) => ({
    decile: decile.decile,
    count: decile.count,
    meanRqr: decile.meanRqr,
    meanObservedGain: decile.meanObservedGain,
    meanPredictedGain: decile.meanPredictedGain,
    residualGain: decile.meanObservedGain - decile.meanPredictedGain,
  }));

  const gainValues = deciles.flatMap((decile) => [
    decile.meanObservedGain,
    decile.meanPredictedGain,
  ]);

  const criteria: Gate4FigureCriterion[] = report.gate.criteria.map((criterion) => {
    switch (criterion.id) {
      case 'spearman_ci_low':
        return withThreshold(criterion, {
          low: report.config.thresholds.spearmanLowerCi,
        });
      case 'slope_ci_low':
        return withThreshold(criterion, {
          low: report.config.thresholds.slopeLowerCi,
        });
      case 'quartile_delta_ci_low':
        return withThreshold(criterion, {
          low: report.config.thresholds.quartileDeltaLowerCi,
        });
      case 'predicted_pearson_ci_low':
        return withThreshold(criterion, {
          low: report.config.thresholds.predictedPearsonLowerCi,
        });
      case 'decile_monotonicity':
        return withThreshold(criterion, {
          high: report.config.thresholds.maxDecileMonotonicViolations,
        });
      default:
        return withThreshold(criterion, {});
    }
  });

  return {
    label: 'ch17-gate4-rqr-holdout-figure-v1',
    sourceLabel: report.protocol.id,
    trainingSampleCount: report.training.sampleCount,
    holdoutSampleCount: report.holdout.sampleCount,
    criteriaPassed: report.gate.passedCriterionIds.length,
    criteriaTotal: report.gate.criteria.length,
    decileCount: deciles.length,
    gainRange: rangeFor(gainValues),
    rqrRange: rangeFor(deciles.map((decile) => decile.meanRqr)),
    quartileDelta: {
      value: report.holdout.quartileDelta.value,
      ci95: report.holdout.quartileDelta.ci95,
      lowQuartileMeanGain: report.holdout.lowQuartileMeanGain,
      highQuartileMeanGain: report.holdout.highQuartileMeanGain,
      lowerQuartileRqr: report.holdout.lowerQuartileRqr,
      upperQuartileRqr: report.holdout.upperQuartileRqr,
    },
    maxAbsoluteResidualGain: Math.max(...deciles.map((decile) => Math.abs(decile.residualGain))),
    monotonicViolations: report.holdout.monotonicViolations,
    maxMonotonicViolations: report.config.thresholds.maxDecileMonotonicViolations,
    criteria,
    deciles,
  };
}

export function renderCh17Gate4RqrHoldoutFigureMarkdown(
  report: Ch17Gate4RqrHoldoutFigureReport,
): string {
  const lines: string[] = [];
  lines.push('# Chapter 17 Gate 4 R_qr Holdout Figure');
  lines.push('');
  lines.push(`- Label: \`${report.label}\``);
  lines.push(`- Source: \`${report.sourceLabel}\``);
  lines.push(
    `- Samples: training \`${report.trainingSampleCount}\`, holdout \`${report.holdoutSampleCount}\``,
  );
  lines.push(`- Criteria passed: \`${report.criteriaPassed}/${report.criteriaTotal}\``);
  lines.push(`- Holdout deciles: \`${report.decileCount}\``);
  lines.push(
    `- Holdout gain range: \`${formatGain(report.gainRange.low)}\` to \`${formatGain(report.gainRange.high)}\``,
  );
  lines.push(
    `- Holdout R_qr range: \`${formatRqr(report.rqrRange.low)}\` to \`${formatRqr(report.rqrRange.high)}\``,
  );
  lines.push(
    `- Quartile delta: \`${formatGain(report.quartileDelta.value)}\` (95% CI \`${formatGain(report.quartileDelta.ci95.low)}\` to \`${formatGain(report.quartileDelta.ci95.high)}\`)`,
  );
  lines.push(
    `- Monotonicity: \`${report.monotonicViolations}/${report.maxMonotonicViolations}\` allowed violations`,
  );
  lines.push('');
  lines.push('## Criteria');
  lines.push('');
  lines.push('| Criterion | Observed | 95% CI | Threshold | Pass |');
  lines.push('|---|---:|---:|---|---|');
  for (const criterion of report.criteria) {
    const ciText = criterion.ci95
      ? `${formatMetric(criterion.ci95.low)} to ${formatMetric(criterion.ci95.high)}`
      : 'n/a';
    lines.push(
      `| ${criterion.label} | ${formatMetric(criterion.observed)} | ${ciText} | ${criterion.threshold} | ${criterion.pass ? 'yes' : 'no'} |`,
    );
  }
  lines.push('');
  lines.push('## Holdout Deciles');
  lines.push('');
  lines.push('| Decile | Count | Mean R_qr | Mean Observed Gain | Mean Predicted Gain | Residual |');
  lines.push('|---|---:|---:|---:|---:|---:|');
  for (const decile of report.deciles) {
    lines.push(
      `| ${decile.decile} | ${decile.count} | ${formatRqr(decile.meanRqr)} | ${formatGain(decile.meanObservedGain)} | ${formatGain(decile.meanPredictedGain)} | ${formatGain(decile.residualGain)} |`,
    );
  }
  lines.push('');
  lines.push(
    'Interpretation: the figure keeps the predictive-screening claim honest by showing both the mostly monotone holdout decile uplift and the interval-backed scoring criteria, instead of collapsing the result into a single correlation statistic.',
  );

  return `${lines.join('\n')}\n`;
}

function renderCalibrationPanel(
  svg: string[],
  report: Ch17Gate4RqrHoldoutFigureReport,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  svg.push(
    `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="18" fill="#fffdfa" stroke="#d6d3c7"/>`,
  );
  svg.push(
    `<text x="${x + 24}" y="${y + 34}" font-family="Georgia, serif" font-size="20" fill="#111827">Holdout Decile Calibration</text>`,
  );
  svg.push(
    `<text x="${x + 24}" y="${y + 56}" font-family="Georgia, serif" font-size="13" fill="#4b5563">Observed and training-fit predicted gains across deciles sorted by mean R_qr.</text>`,
  );

  const innerX = x + 72;
  const innerY = y + 92;
  const innerWidth = width - 104;
  const innerHeight = height - 176;
  const maxGainPct = Math.max(report.gainRange.high * 100, 18);
  const yMaxPct = Math.ceil((maxGainPct + 1) / 3) * 3;
  const tickStep = yMaxPct <= 12 ? 2 : 3;
  const tickValues: number[] = [];
  for (let tick = 0; tick <= yMaxPct; tick += tickStep) {
    tickValues.push(tick);
  }

  for (const tick of tickValues) {
    const cy = innerY + innerHeight - (tick / yMaxPct) * innerHeight;
    svg.push(
      `<line x1="${innerX}" y1="${cy}" x2="${innerX + innerWidth}" y2="${cy}" stroke="#e5e7eb" stroke-width="1"/>`,
    );
    svg.push(
      `<text x="${innerX - 12}" y="${cy + 4}" text-anchor="end" font-family="system-ui, sans-serif" font-size="11" fill="#6b7280">${trimFixed(tick, 1)}%</text>`,
    );
  }

  const xStep =
    report.deciles.length > 1 ? innerWidth / (report.deciles.length - 1) : innerWidth / 2;
  const observedPath: string[] = [];
  const predictedPath: string[] = [];

  report.deciles.forEach((decile, index) => {
    const cx = innerX + xStep * index;
    const observedCy =
      innerY + innerHeight - ((decile.meanObservedGain * 100) / yMaxPct) * innerHeight;
    const predictedCy =
      innerY + innerHeight - ((decile.meanPredictedGain * 100) / yMaxPct) * innerHeight;
    observedPath.push(`${index === 0 ? 'M' : 'L'} ${cx} ${observedCy}`);
    predictedPath.push(`${index === 0 ? 'M' : 'L'} ${cx} ${predictedCy}`);
  });

  svg.push(
    `<path d="${observedPath.join(' ')}" fill="none" stroke="#0f766e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,
  );
  svg.push(
    `<path d="${predictedPath.join(' ')}" fill="none" stroke="#b45309" stroke-width="3" stroke-dasharray="8 6" stroke-linecap="round" stroke-linejoin="round"/>`,
  );

  report.deciles.forEach((decile, index) => {
    const cx = innerX + xStep * index;
    const observedCy =
      innerY + innerHeight - ((decile.meanObservedGain * 100) / yMaxPct) * innerHeight;
    const predictedCy =
      innerY + innerHeight - ((decile.meanPredictedGain * 100) / yMaxPct) * innerHeight;
    svg.push(
      `<circle cx="${cx}" cy="${observedCy}" r="5.5" fill="#0f766e" stroke="#ecfeff" stroke-width="2"/>`,
    );
    svg.push(
      `<rect x="${cx - 4.5}" y="${predictedCy - 4.5}" width="9" height="9" rx="1.5" fill="#f59e0b" stroke="#78350f" stroke-width="1.4"/>`,
    );
    svg.push(
      `<text x="${cx}" y="${innerY + innerHeight + 22}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#374151">D${decile.decile}</text>`,
    );
    svg.push(
      `<text x="${cx}" y="${innerY + innerHeight + 38}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" fill="#94a3b8">R=${formatRqr(decile.meanRqr)}</text>`,
    );
  });

  svg.push(
    `<text x="${innerX + innerWidth / 2}" y="${innerY + innerHeight + 64}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" fill="#6b7280">Holdout deciles sorted by mean R_qr</text>`,
  );
  svg.push(
    `<text x="${innerX - 50}" y="${innerY + innerHeight / 2}" transform="rotate(-90 ${innerX - 50} ${innerY + innerHeight / 2})" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" fill="#6b7280">Mean realized / predicted gain</text>`,
  );

  const legendY = y + height - 32;
  svg.push(`<circle cx="${x + 34}" cy="${legendY}" r="5.5" fill="#0f766e" stroke="#ecfeff" stroke-width="2"/>`);
  svg.push(
    `<text x="${x + 48}" y="${legendY + 4}" font-family="system-ui, sans-serif" font-size="12" fill="#374151">Observed gain</text>`,
  );
  svg.push(
    `<rect x="${x + 168}" y="${legendY - 4.5}" width="9" height="9" rx="1.5" fill="#f59e0b" stroke="#78350f" stroke-width="1.4"/>`,
  );
  svg.push(
    `<text x="${x + 184}" y="${legendY + 4}" font-family="system-ui, sans-serif" font-size="12" fill="#374151">Predicted gain</text>`,
  );

  svg.push(
    `<text x="${x + width - 24}" y="${legendY + 4}" text-anchor="end" font-family="system-ui, sans-serif" font-size="12" fill="#6b7280">quartile delta ${formatGain(report.quartileDelta.value)}</text>`,
  );
}

function renderCriteriaPanel(
  svg: string[],
  report: Ch17Gate4RqrHoldoutFigureReport,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  svg.push(
    `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="18" fill="#f8fafc" stroke="#cbd5e1"/>`,
  );
  svg.push(
    `<text x="${x + 24}" y="${y + 34}" font-family="Georgia, serif" font-size="20" fill="#111827">Holdout Screening Criteria</text>`,
  );
  svg.push(
    `<text x="${x + 24}" y="${y + 56}" font-family="Georgia, serif" font-size="13" fill="#4b5563">Observed values and 95% intervals against the predeclared gate thresholds.</text>`,
  );

  const ciCriteria = report.criteria.filter((criterion) => criterion.ci95);
  const monotonicity = report.criteria.find((criterion) => criterion.id === 'decile_monotonicity');
  const metricMax = Math.max(
    1.05,
    ...ciCriteria.flatMap((criterion) => [
      criterion.observed,
      criterion.ci95?.high ?? 0,
      criterion.thresholdLow ?? 0,
    ]),
  );

  const innerX = x + 148;
  const innerY = y + 92;
  const innerWidth = width - 188;
  const rowStep = 66;

  for (const tick of [0, 0.25, 0.5, 0.75, 1]) {
    const cx = innerX + (tick / metricMax) * innerWidth;
    svg.push(
      `<line x1="${cx}" y1="${innerY - 18}" x2="${cx}" y2="${innerY + rowStep * (ciCriteria.length - 1) + 16}" stroke="#e2e8f0" stroke-width="1"/>`,
    );
    svg.push(
      `<text x="${cx}" y="${innerY - 28}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#64748b">${trimFixed(tick, 2)}</text>`,
    );
  }

  ciCriteria.forEach((criterion, index) => {
    if (!criterion.ci95) {
      return;
    }

    const cy = innerY + rowStep * index;
    const lowX = innerX + (criterion.ci95.low / metricMax) * innerWidth;
    const highX = innerX + (criterion.ci95.high / metricMax) * innerWidth;
    const observedX = innerX + (criterion.observed / metricMax) * innerWidth;
    const thresholdX =
      criterion.thresholdLow === undefined
        ? undefined
        : innerX + (criterion.thresholdLow / metricMax) * innerWidth;

    svg.push(
      `<text x="${x + 24}" y="${cy + 5}" font-family="system-ui, sans-serif" font-size="12" fill="#334155">${escapeXml(criterion.label)}</text>`,
    );
    svg.push(
      `<line x1="${lowX}" y1="${cy}" x2="${highX}" y2="${cy}" stroke="${criterion.pass ? '#1d4ed8' : '#b91c1c'}" stroke-width="4" stroke-linecap="round"/>`,
    );
    svg.push(
      `<line x1="${lowX}" y1="${cy - 7}" x2="${lowX}" y2="${cy + 7}" stroke="${criterion.pass ? '#1d4ed8' : '#b91c1c'}" stroke-width="1.5"/>`,
    );
    svg.push(
      `<line x1="${highX}" y1="${cy - 7}" x2="${highX}" y2="${cy + 7}" stroke="${criterion.pass ? '#1d4ed8' : '#b91c1c'}" stroke-width="1.5"/>`,
    );
    if (thresholdX !== undefined) {
      svg.push(
        `<line x1="${thresholdX}" y1="${cy - 16}" x2="${thresholdX}" y2="${cy + 16}" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/>`,
      );
    }
    svg.push(
      `<circle cx="${observedX}" cy="${cy}" r="5.5" fill="${criterion.pass ? '#0f766e' : '#b91c1c'}" stroke="#f8fafc" stroke-width="2"/>`,
    );
    svg.push(
      `<text x="${x + width - 20}" y="${cy + 5}" text-anchor="end" font-family="system-ui, sans-serif" font-size="11" fill="#475569">${escapeXml(`${formatMetric(criterion.observed)} | ${criterion.threshold}`)}</text>`,
    );
  });

  const gaugeY = y + height - 88;
  const gaugeX = x + 24;
  const gaugeWidth = width - 48;
  const fillWidth = (report.monotonicViolations / report.maxMonotonicViolations) * gaugeWidth;
  svg.push(
    `<text x="${gaugeX}" y="${gaugeY - 14}" font-family="system-ui, sans-serif" font-size="12" fill="#334155">Decile monotonicity</text>`,
  );
  svg.push(
    `<rect x="${gaugeX}" y="${gaugeY}" width="${gaugeWidth}" height="16" rx="8" fill="#e2e8f0"/>`,
  );
  svg.push(
    `<rect x="${gaugeX}" y="${gaugeY}" width="${fillWidth}" height="16" rx="8" fill="${report.monotonicViolations <= report.maxMonotonicViolations ? '#0f766e' : '#b91c1c'}"/>`,
  );
  svg.push(
    `<text x="${gaugeX + gaugeWidth / 2}" y="${gaugeY + 12}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#0f172a">${report.monotonicViolations} violation${report.monotonicViolations === 1 ? '' : 's'} of ${report.maxMonotonicViolations} allowed</text>`,
  );

  const lowCalloutY = y + height - 54;
  const highCalloutY = y + height - 32;
  svg.push(
    `<text x="${x + 24}" y="${lowCalloutY}" font-family="system-ui, sans-serif" font-size="12" fill="#475569">${escapeXml(`Low quartile: ${formatGain(report.quartileDelta.lowQuartileMeanGain)} at R_qr <= ${formatRqr(report.quartileDelta.lowerQuartileRqr)}`)}</text>`,
  );
  svg.push(
    `<text x="${x + 24}" y="${highCalloutY}" font-family="system-ui, sans-serif" font-size="12" fill="#475569">${escapeXml(`High quartile: ${formatGain(report.quartileDelta.highQuartileMeanGain)} at R_qr >= ${formatRqr(report.quartileDelta.upperQuartileRqr)}`)}</text>`,
  );
}

export function renderCh17Gate4RqrHoldoutFigureSvg(
  report: Ch17Gate4RqrHoldoutFigureReport,
): string {
  const svg: string[] = [];
  svg.push('<svg xmlns="http://www.w3.org/2000/svg" width="1240" height="820" viewBox="0 0 1240 820" role="img" aria-labelledby="title desc">');
  svg.push('<title id="title">Chapter 17 Gate 4 R_qr holdout figure</title>');
  svg.push(
    '<desc id="desc">Two-panel figure showing holdout decile calibration and interval-backed predictive-screening criteria for the R_qr validation artifact.</desc>',
  );
  svg.push('<rect width="1240" height="820" fill="#f3efe5"/>');
  svg.push('<rect x="22" y="22" width="1196" height="776" rx="28" fill="#f7f4ea" stroke="#d6d3c7"/>');
  svg.push('<text x="60" y="82" font-family="Georgia, serif" font-size="32" fill="#111827">Gate 4 R_qr Holdout Validation</text>');
  svg.push(
    `<text x="60" y="114" font-family="Georgia, serif" font-size="15" fill="#4b5563">Source ${escapeXml(report.sourceLabel)} | ${report.criteriaPassed}/${report.criteriaTotal} criteria passed | max residual ${formatGain(report.maxAbsoluteResidualGain)}</text>`,
  );

  renderCalibrationPanel(svg, report, 52, 148, 688, 610);
  renderCriteriaPanel(svg, report, 772, 148, 416, 610);

  svg.push('</svg>');
  return `${svg.join('')}\n`;
}
