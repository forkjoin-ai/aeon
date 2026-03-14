#!/usr/bin/env bun

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const texPath = path.join(scriptDir, 'arxiv-manuscript.tex');
const svgPattern = /\\includesvg(\[[^\]]*\])?\{([^}]+\.svg)\}/g;

const texSource = await fs.readFile(texPath, 'utf8');
const svgMatches = [...texSource.matchAll(svgPattern)];

if (svgMatches.length === 0) {
  console.log(
    'prepare-arxiv-figures: no SVG figures found in arxiv-manuscript.tex'
  );
  process.exit(0);
}

const renderedPngs = new Set<string>();

for (const match of svgMatches) {
  const svgRelativePath = match[2];
  if (!svgRelativePath) {
    continue;
  }

  const svgPath = path.join(scriptDir, svgRelativePath);
  const pngPath = svgPath.replace(/\.svg$/i, '.png');

  const svgStat = await fs.stat(svgPath).catch(() => null);
  if (!svgStat) {
    throw new Error(`Missing SVG figure: ${svgRelativePath}`);
  }

  const pngStat = await fs.stat(pngPath).catch(() => null);
  const pngIsFresh = pngStat !== null && pngStat.mtimeMs >= svgStat.mtimeMs;

  if (!pngIsFresh) {
    await fs.mkdir(path.dirname(pngPath), { recursive: true });
    await sharp(svgPath, { density: 192 }).png().toFile(pngPath);
  }

  renderedPngs.add(path.relative(scriptDir, pngPath));
}

const rewrittenTex = texSource.replace(
  svgPattern,
  (
    _fullMatch: string,
    options: string | undefined,
    svgRelativePath: string
  ) => {
    const pngRelativePath = svgRelativePath.replace(/\.svg$/i, '.png');
    return `\\includegraphics${options ?? ''}{${pngRelativePath}}`;
  }
);

if (rewrittenTex !== texSource) {
  await fs.writeFile(texPath, rewrittenTex);
}

const renderedList = [...renderedPngs].sort().join(', ');
console.log(
  `prepare-arxiv-figures: ready ${renderedPngs.size} PNG fallback(s): ${renderedList}`
);
