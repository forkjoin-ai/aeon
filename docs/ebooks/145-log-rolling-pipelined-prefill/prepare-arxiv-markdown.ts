#!/usr/bin/env bun

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { replaceAeonVizSceneFencesWithStaticAssets } from '../../../../../shared-ui/src/wallington-lab/aeonVizScenes';

interface CliOptions {
  readonly inputPath: string;
  readonly outputPath: string;
}

function parseCli(argv: readonly string[]): CliOptions {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  let inputPath = path.join(scriptDir, 'ch17-arxiv-manuscript.md');
  let outputPath = path.join(scriptDir, 'arxiv-manuscript.prepared.md');

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--input') {
      const next = argv[index + 1];
      if (!next) {
        throw new Error('Missing value for --input');
      }
      inputPath = path.resolve(next);
      index += 1;
      continue;
    }
    if (arg === '--output') {
      const next = argv[index + 1];
      if (!next) {
        throw new Error('Missing value for --output');
      }
      outputPath = path.resolve(next);
      index += 1;
      continue;
    }
    throw new Error(`Unknown flag: ${arg}`);
  }

  return { inputPath, outputPath };
}

const options = parseCli(process.argv.slice(2));
const markdown = await fs.readFile(options.inputPath, 'utf8');
const rewritten = replaceAeonVizSceneFencesWithStaticAssets(markdown);

await fs.mkdir(path.dirname(options.outputPath), { recursive: true });
await fs.writeFile(options.outputPath, rewritten, 'utf8');

console.log(`prepare-arxiv-markdown: ${options.inputPath} -> ${options.outputPath}`);
