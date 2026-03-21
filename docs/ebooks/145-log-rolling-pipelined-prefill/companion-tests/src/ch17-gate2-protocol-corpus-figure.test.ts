import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  buildCh17Gate2ProtocolCorpusFigureReport,
  renderCh17Gate2ProtocolCorpusFigureMarkdown,
  renderCh17Gate2ProtocolCorpusFigureSvg,
} from './ch17-gate2-protocol-corpus-figure';
import type { Gate2Report } from './gate2-protocol-corpus';

function loadGate2Report(): Gate2Report {
  const moduleDir = dirname(fileURLToPath(import.meta.url));
  const artifactPath = resolve(
    moduleDir,
    '../artifacts/gate2-protocol-corpus.json'
  );
  return JSON.parse(readFileSync(artifactPath, 'utf8')) as Gate2Report;
}

describe('Chapter 17 Gate 2 protocol-corpus figure', () => {
  it('builds a compact figure report from the Gate 2 artifact', () => {
    const figure = buildCh17Gate2ProtocolCorpusFigureReport(loadGate2Report());

    expect(figure.label).toBe('ch17-gate2-protocol-corpus-figure-v1');
    expect(figure.sourceLabel).toBe('gate2-protocol-corpus-v1');
    expect(figure.corpus.siteCount).toBe(144);
    expect(figure.corpus.totalResources).toBe(12371);
    expect(figure.primaryPassed).toBe(6);
    expect(figure.primaryTotal).toBe(6);
    expect(figure.cells).toHaveLength(8);
    expect(figure.minPrimaryFramingCiLowPct).toBeCloseTo(72.19, 2);
    expect(figure.minPrimaryCompletionMedianCiLowMs).toBeCloseTo(20.24, 2);
    expect(figure.minPrimaryCompletionP95CiLowMs).toBeCloseTo(19.99, 2);
  });

  it('renders markdown and svg outputs with the three protocol panels', () => {
    const figure = buildCh17Gate2ProtocolCorpusFigureReport(loadGate2Report());

    const markdown = renderCh17Gate2ProtocolCorpusFigureMarkdown(figure);
    const svg = renderCh17Gate2ProtocolCorpusFigureSvg(figure);

    expect(markdown).toContain('# Chapter 17 Gate 2 Protocol-Corpus Figure');
    expect(markdown).toContain('## Cells');
    expect(markdown).toContain('rtt110-bw7-loss2pct');
    expect(svg).toContain('<svg');
    expect(svg).toContain('Framing Median Gain');
    expect(svg).toContain('Completion Median Gain');
    expect(svg).toContain('Completion p95 Gain');
  });
});
