import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import {
  resolveCh17ArxivSubmissionDir,
  resolveCh17ManuscriptPath,
} from './manuscript-variant.js';

const FLAGSHIP_TITLE =
  'Topological Mismatch in Distributed Inference: Mechanized Models and Protocol-Level Evidence for Fork/Race/Fold Scheduling';
const THESIS_SENTENCE =
  "Path-like execution topologies impose avoidable coordination cost when the workload's natural structure has positive parallel-path complexity.";

function readFlagshipManuscript(): string {
  return readFileSync(resolveCh17ManuscriptPath('flagship'), 'utf8');
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/gu, ' ').trim();
}

function extractManuscriptAbstract(markdown: string): string {
  const match = markdown.match(
    /## Abstract\s+([\s\S]*?)\n## 1\. Problem and Claim/u
  );
  if (!match) {
    throw new Error('Unable to locate flagship abstract');
  }
  return normalizeWhitespace(match[1]);
}

function extractMetadataField(metadata: string, label: string): string {
  const start = metadata.indexOf(`${label}:`);
  if (start === -1) {
    throw new Error(`Missing metadata field ${label}`);
  }
  const afterLabel = metadata.slice(start + label.length + 1);
  const nextBlankLine = afterLabel.search(/\n\s*\n/u);
  return normalizeWhitespace(
    nextBlankLine === -1 ? afterLabel : afterLabel.slice(0, nextBlankLine)
  );
}

function extractMainBody(markdown: string): string {
  const appendixStart = markdown.indexOf('## Appendix A: Theorem-to-Artifact Map');
  if (appendixStart === -1) {
    throw new Error('Unable to locate flagship appendix boundary');
  }
  return markdown.slice(0, appendixStart);
}

describe('Flagship manuscript structure', () => {
  it('keeps the title and metadata synchronized', () => {
    const manuscript = readFlagshipManuscript();
    const metadata = readFileSync(
      `${resolveCh17ArxivSubmissionDir('flagship')}/arxiv-metadata.txt`,
      'utf8'
    );

    expect(manuscript.startsWith(`# ${FLAGSHIP_TITLE}`)).toBe(true);
    expect(extractMetadataField(metadata, 'Title')).toBe(FLAGSHIP_TITLE);
    expect(extractMetadataField(metadata, 'Abstract')).toBe(
      extractManuscriptAbstract(manuscript)
    );
  });

  it('states one thesis twice and keeps the body reviewer-facing', () => {
    const manuscript = readFlagshipManuscript();
    const matches = [...manuscript.matchAll(new RegExp(THESIS_SENTENCE, 'gu'))];

    expect(matches).toHaveLength(2);
  });

  it('stays inside the planned structural envelope', () => {
    const manuscript = readFlagshipManuscript();

    expect(manuscript.includes('## 1. Problem and Claim')).toBe(true);
    expect(manuscript.includes('## 2. Model and Notation')).toBe(true);
    expect(manuscript.includes('## 3. Formal Results')).toBe(true);
    expect(manuscript.includes('## 4. Systems Instantiation')).toBe(true);
    expect(manuscript.includes('## 5. Evaluation')).toBe(true);
    expect(manuscript.includes('## 6. Limitations and Non-Claims')).toBe(true);
    expect(manuscript.includes('## 7. Related Work')).toBe(true);
    expect(manuscript.includes('## 8. Conclusion')).toBe(true);
    expect(manuscript.includes('## Appendix A: Theorem-to-Artifact Map')).toBe(
      true
    );
    expect(manuscript.includes('## Appendix B: Reproduction Surface')).toBe(
      true
    );
  });

  it('removes the removed-topic surface from the flagship body', () => {
    const mainBody = extractMainBody(readFlagshipManuscript()).toLowerCase();
    const bannedPatterns = [
      /\btheology\b/u,
      /\bcosmology\b/u,
      /\bconsciousness\b/u,
      /\bpeace theory\b/u,
      /\bgnostic\b/u,
      /\bparticle analog/u,
      /\bbuleyean\b/u,
      /\bvoid walking\b/u,
      /\bcorrespondence grade\b/u,
      /\bsame structure at every scale\b/u,
      /\bgrade a\b/u,
      /\bgrade b\b/u,
      /\bgrade c\b/u,
    ];

    for (const bannedPattern of bannedPatterns) {
      expect(bannedPattern.test(mainBody)).toBe(false);
    }
  });

  it('keeps the flagship figure set small and referenced in text', () => {
    const manuscript = readFlagshipManuscript();
    const imageCount = [...manuscript.matchAll(/!\[[^\]]*\]\([^)]+\)/gu)].length;

    expect(imageCount).toBeGreaterThanOrEqual(3);
    expect(imageCount).toBeLessThanOrEqual(7);

    const figures = [
      {
        label: 'Figure 1',
        asset: 'ch17-inverted-scaling-reynolds-figure.png',
      },
      {
        label: 'Figure 2',
        asset: 'ch17-gate1-wallclock-figure.png',
      },
      {
        label: 'Figure 3',
        asset: 'ch17-gate2-protocol-corpus-figure.png',
      },
    ];

    for (const figure of figures) {
      expect(manuscript.includes(figure.label)).toBe(true);
      expect(manuscript.includes(figure.asset)).toBe(true);
    }
  });

  it('keeps the main body focused on the finite-DAG bridge thesis', () => {
    const mainBody = extractMainBody(readFlagshipManuscript());

    expect(mainBody.includes('finite DAG')).toBe(true);
    expect(mainBody.includes('C1')).toBe(true);
    expect(mainBody.includes('C2')).toBe(true);
    expect(mainBody.includes('C3')).toBe(true);
    expect(mainBody.includes('C4')).toBe(true);
    expect(mainBody.includes('Delta_beta')).toBe(true);
    expect(mainBody.includes('graph pairs')).toBe(true);
    expect(mainBody.includes('serial fraction')).toBe(true);
    expect(mainBody.includes('Aeon Flux site')).toBe(true);
    expect(mainBody.includes('WallingtonRotation')).toBe(true);
    expect(mainBody.includes('collapsed_output')).toBe(true);
    expect(mainBody.includes('Aeon Flow')).toBe(true);
    expect(mainBody.includes('HTTP/3')).toBe(true);
  });
});
