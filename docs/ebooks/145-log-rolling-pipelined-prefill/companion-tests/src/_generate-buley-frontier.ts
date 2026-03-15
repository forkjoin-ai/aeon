/**
 * _generate-buley-frontier.ts
 *
 * Generates the Buley Frontier artifacts: JSON report, SVG figure, and Markdown.
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  buildBuleyFrontierReport,
  renderBuleyFrontierSvg,
  renderBuleyFrontierMarkdown,
} from './ch17-buley-frontier-figure';

const report = buildBuleyFrontierReport();
const svg = renderBuleyFrontierSvg(report);
const markdown = renderBuleyFrontierMarkdown(report);

const artifactsDir = join(import.meta.dir, '..', 'artifacts');
mkdirSync(artifactsDir, { recursive: true });

writeFileSync(
  join(artifactsDir, 'ch17-buley-frontier-figure.json'),
  JSON.stringify(report, null, 2) + '\n',
);
writeFileSync(join(artifactsDir, 'ch17-buley-frontier-figure.svg'), svg + '\n');
writeFileSync(
  join(artifactsDir, 'ch17-buley-frontier-figure.md'),
  markdown + '\n',
);

console.log('Artifacts written to', artifactsDir);
