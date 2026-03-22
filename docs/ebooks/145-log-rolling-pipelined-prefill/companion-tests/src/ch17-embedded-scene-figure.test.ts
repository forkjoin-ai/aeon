import { describe, expect, it } from 'vitest';

import {
  assertCosmicSceneSurface,
  assertDimensionSceneSurface,
  extractChapter17SceneSpecs,
  getChapter17SceneSpec,
  renderEmbeddedAeonVizSceneFigureSvg,
  rewriteChapter17SceneFencesWithStaticAssets,
} from './ch17-embedded-scene-figure';

describe('Chapter 17 embedded scene figures', () => {
  it('extracts the two aeon-viz scene specs from the manuscript', () => {
    const scenes = extractChapter17SceneSpecs();

    expect(scenes.map((scene) => scene.scene).sort()).toEqual([
      'cosmic-explainer',
      'dimension-ladder',
    ]);
  });

  it('keeps the cosmic and dimensional scene contracts on their expected assets', () => {
    const cosmic = assertCosmicSceneSurface(getChapter17SceneSpec('cosmic-explainer'));
    const dimension = assertDimensionSceneSurface(
      getChapter17SceneSpec('dimension-ladder')
    );

    expect(cosmic.staticAsset).toBe(
      'companion-tests/artifacts/ch17-cosmic-explainer-figure.svg'
    );
    expect(dimension.staticAsset).toBe(
      'companion-tests/artifacts/ch17-dimension-ladder-figure.svg'
    );
  });

  it('rewrites scene fences to static markdown image references for pandoc', () => {
    const rewritten = rewriteChapter17SceneFencesWithStaticAssets();

    expect(rewritten).toContain(
      '![Figure 3b. Dimension ladder from 2D through the current 55D runtime ceiling, with named manuscript rungs and a projected-slice metaphor for the 54D particle. The left panel treats D = K + 1 as the governing lift rule; the right panel makes explicit that a 54D object can only be shown as lower-dimensional projections or cross-sections, not as a literal full view.](companion-tests/artifacts/ch17-dimension-ladder-figure.svg)'
    );
    expect(rewritten).toContain(
      '![Figure 3c. Cosmic explainer for Chapter 17. The left panel places the manuscript'
    );
    expect(rewritten).not.toContain('```aeon-viz');
  });

  it('renders deterministic SVG surfaces for both embedded scenes', () => {
    const cosmicSvg = renderEmbeddedAeonVizSceneFigureSvg(
      getChapter17SceneSpec('cosmic-explainer')
    );
    const dimensionSvg = renderEmbeddedAeonVizSceneFigureSvg(
      getChapter17SceneSpec('dimension-ladder')
    );

    expect(cosmicSvg).toContain('<svg');
    expect(cosmicSvg).toContain('23% loading bar is authored display state');
    expect(dimensionSvg).toContain('<svg');
    expect(dimensionSvg).toContain('What a 54D particle looks like');
  });
});
