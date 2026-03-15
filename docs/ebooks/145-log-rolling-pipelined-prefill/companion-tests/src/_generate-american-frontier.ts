/**
 * _generate-american-frontier.ts
 *
 * Generates the American Frontier artifacts: JSON report, SVG figure, and Markdown.
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  buildAmericanFrontierReport,
  renderAmericanFrontierSvg,
  renderAmericanFrontierMarkdown,
} from './ch17-american-frontier-figure';

const report = buildAmericanFrontierReport();
const svg = renderAmericanFrontierSvg(report);
const markdown = renderAmericanFrontierMarkdown(report);

const artifactsDir = join(import.meta.dir, '..', 'artifacts');
mkdirSync(artifactsDir, { recursive: true });

writeFileSync(
  join(artifactsDir, 'ch17-american-frontier-figure.json'),
  JSON.stringify(report, null, 2) + '\n',
);
writeFileSync(join(artifactsDir, 'ch17-american-frontier-figure.svg'), svg + '\n');
writeFileSync(
  join(artifactsDir, 'ch17-american-frontier-figure.md'),
  markdown + '\n',
);

console.log('Artifacts written to', artifactsDir);
