import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import type {
  AeonVizSceneSpec,
  CosmicExplainerSceneSpec,
  DimensionLadderSceneSpec,
} from '../../../../../../../shared-ui/src/wallington-lab/aeonVizScenes';
import {
  extractAeonVizSceneSpecsFromMarkdown,
  replaceAeonVizSceneFencesWithStaticAssets,
} from '../../../../../../../shared-ui/src/wallington-lab/aeonVizScenes';
import { renderAeonVizSceneStaticMarkup } from '../../../../../../../shared-ui/src/wallington-lab/aeonVizSceneStatic';

import { resolveCh17ManuscriptPath } from './manuscript-variant.js';

const moduleDir = dirname(fileURLToPath(import.meta.url));
const chapterRoot = resolve(moduleDir, '..', '..');

export const CH17_MANUSCRIPT_PATH = resolve(
  resolveCh17ManuscriptPath()
);
export const CH17_ARTIFACTS_DIR = resolve(chapterRoot, 'companion-tests', 'artifacts');

export interface EmbeddedAeonVizSceneFigureReport {
  readonly label: string;
  readonly scene: AeonVizSceneSpec['scene'];
  readonly mode: AeonVizSceneSpec['mode'];
  readonly title: string;
  readonly subtitle: string | null;
  readonly story: string | null;
  readonly caption: string | null;
  readonly staticAsset: string | null;
  readonly markCount: number;
}

export function readChapter17Manuscript(): string {
  return readFileSync(CH17_MANUSCRIPT_PATH, 'utf8');
}

export function extractChapter17SceneSpecs(
  markdown = readChapter17Manuscript()
): readonly AeonVizSceneSpec[] {
  return extractAeonVizSceneSpecsFromMarkdown(markdown).map(
    (entry) => entry.spec
  );
}

export function getChapter17SceneSpec(
  scene: AeonVizSceneSpec['scene'],
  markdown = readChapter17Manuscript()
): AeonVizSceneSpec {
  const spec = extractChapter17SceneSpecs(markdown).find(
    (entry) => entry.scene === scene
  );
  if (!spec) {
    throw new Error(`Missing Chapter 17 aeon-viz scene: ${scene}`);
  }
  return spec;
}

export function buildEmbeddedAeonVizSceneFigureReport(
  spec: AeonVizSceneSpec
): EmbeddedAeonVizSceneFigureReport {
  return {
    label:
      spec.staticAsset?.split('/').pop()?.replace(/\.svg$/iu, '') ??
      spec.scene,
    scene: spec.scene,
    mode: spec.mode,
    title: spec.title ?? spec.scene,
    subtitle: spec.subtitle ?? null,
    story: spec.story ?? null,
    caption: spec.caption ?? null,
    staticAsset: spec.staticAsset ?? null,
    markCount:
      spec.scene === 'cosmic-explainer'
        ? spec.milestones.length
        : spec.rungs.length,
  };
}

export function renderEmbeddedAeonVizSceneFigureMarkdown(
  report: EmbeddedAeonVizSceneFigureReport
): string {
  return [
    `# ${report.title}`,
    '',
    `- scene: \`${report.scene}\``,
    `- mode: \`${report.mode}\``,
    `- marks: \`${report.markCount}\``,
    `- static asset: \`${report.staticAsset ?? 'missing'}\``,
    ...(report.subtitle ? [`- subtitle: ${report.subtitle}`] : []),
    ...(report.story ? [`- story: ${report.story}`] : []),
    ...(report.caption ? ['', report.caption] : []),
    '',
  ].join('\n');
}

export function renderEmbeddedAeonVizSceneFigureSvg(
  spec: AeonVizSceneSpec
): string {
  return renderAeonVizSceneStaticMarkup(spec);
}

export function rewriteChapter17SceneFencesWithStaticAssets(
  markdown = readChapter17Manuscript()
): string {
  return replaceAeonVizSceneFencesWithStaticAssets(markdown);
}

export function assertCosmicSceneSurface(
  spec: AeonVizSceneSpec
): CosmicExplainerSceneSpec {
  if (spec.scene !== 'cosmic-explainer') {
    throw new Error(`Expected cosmic-explainer scene, received ${spec.scene}`);
  }
  if (spec.progressPercent !== 23) {
    throw new Error(
      `Cosmic explainer progressPercent must remain 23, received ${spec.progressPercent}`
    );
  }
  if (spec.milestones.length < 5) {
    throw new Error('Cosmic explainer needs at least five milestones');
  }
  return spec;
}

export function assertDimensionSceneSurface(
  spec: AeonVizSceneSpec
): DimensionLadderSceneSpec {
  if (spec.scene !== 'dimension-ladder') {
    throw new Error(`Expected dimension-ladder scene, received ${spec.scene}`);
  }
  if (spec.focusDimension !== 54) {
    throw new Error(
      `Dimension ladder focusDimension must remain 54, received ${spec.focusDimension}`
    );
  }
  if (spec.maxDimension !== 55) {
    throw new Error(
      `Dimension ladder maxDimension must remain 55, received ${spec.maxDimension}`
    );
  }
  if (spec.rungs.length < 5) {
    throw new Error('Dimension ladder needs at least five named rungs');
  }
  return spec;
}
