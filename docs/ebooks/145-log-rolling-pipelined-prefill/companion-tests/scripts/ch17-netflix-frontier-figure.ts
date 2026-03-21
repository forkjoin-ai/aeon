/**
 * ch17-netflix-frontier-figure.ts (script)
 *
 * Generates the Netflix Frontier markdown, JSON, and SVG artifacts.
 */

import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildNetflixFrontierReport,
  renderNetflixFrontierMarkdown,
  renderNetflixFrontierSvg,
} from '../src/ch17-netflix-frontier-figure';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ARTIFACTS = resolve(__dirname, '..', 'artifacts');

const report = buildNetflixFrontierReport();

writeFileSync(
  resolve(ARTIFACTS, 'ch17-netflix-frontier-figure.json'),
  JSON.stringify(report, null, 2) + '\n'
);
writeFileSync(
  resolve(ARTIFACTS, 'ch17-netflix-frontier-figure.md'),
  renderNetflixFrontierMarkdown(report)
);
writeFileSync(
  resolve(ARTIFACTS, 'ch17-netflix-frontier-figure.svg'),
  renderNetflixFrontierSvg(report)
);

console.log('wrote ch17-netflix-frontier-figure.{json,md,svg}');
console.log(
  `  algorithm frontier: ${report.algorithmFrontier.points.length} points`
);
console.log(`  team frontier: ${report.teamFrontier.points.length} points`);
console.log(
  `  monoculture ceilings: ${report.monocultureCeilings.length} families`
);
console.log(`  frontier properties:`);
for (const [key, value] of Object.entries(report.frontierProperties)) {
  console.log(`    ${key}: ${value}`);
}
