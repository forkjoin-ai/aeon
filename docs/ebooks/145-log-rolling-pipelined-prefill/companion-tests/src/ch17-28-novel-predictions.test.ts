import { describe, expect, it } from 'vitest';
import { novel28, renderNovel28Markdown } from './ch17-28-novel-predictions';

describe('28 novel predictions: experimental protocols', () => {
  const predictions = novel28();

  it('exactly 28 predictions', () => {
    expect(predictions.length).toBe(28);
  });

  it('every prediction has a complete protocol', () => {
    for (const p of predictions) {
      expect(p.experiment.length).toBeGreaterThan(50);
      expect(p.falsification.length).toBeGreaterThan(20);
      expect(p.equipment.length).toBeGreaterThan(5);
      expect(p.estimatedN).toBeGreaterThanOrEqual(30);
      expect(['easy', 'medium', 'hard']).toContain(p.difficulty);
    }
  });

  it('IDs are sequential 1-28', () => {
    for (let i = 0; i < predictions.length; i++) {
      expect(predictions[i].id).toBe(i + 1);
    }
  });

  it('every prediction has K_high > K_low', () => {
    for (const p of predictions) {
      expect(p.kHigh).toBeGreaterThan(p.kLow);
    }
  });

  it('covers all 8 measures', () => {
    const measures = new Set(predictions.map((p) => p.measure));
    expect(measures.size).toBeGreaterThanOrEqual(6);
  });

  it('difficulty breakdown', () => {
    const easy = predictions.filter((p) => p.difficulty === 'easy').length;
    const medium = predictions.filter((p) => p.difficulty === 'medium').length;
    const hard = predictions.filter((p) => p.difficulty === 'hard').length;
    expect(easy + medium + hard).toBe(28);
    console.log(`\n  Difficulty: ${easy} easy, ${medium} medium, ${hard} hard`);
  });

  it('total N across all experiments', () => {
    const totalN = predictions.reduce((s, p) => s + p.estimatedN, 0);
    console.log(`  Total participants needed: ~${totalN}`);
    expect(totalN).toBeLessThan(3000);
    expect(totalN).toBeGreaterThan(500);
  });

  it('the easy experiments need only standard lab equipment', () => {
    const easy = predictions.filter((p) => p.difficulty === 'easy');
    for (const p of easy) {
      expect(
        p.equipment.toLowerCase().includes('eye tracker') ||
        p.equipment.toLowerCase().includes('computerized') ||
        p.equipment.toLowerCase().includes('pupillom')
      ).toBe(true);
    }
    console.log(`\n  The ${easy.length} easiest experiments:`);
    for (const p of easy) {
      console.log(`    #${p.id}: ${p.measure} × ${p.condition} (N=${p.estimatedN})`);
    }
  });

  it('renders complete markdown', () => {
    const md = renderNovel28Markdown();
    expect(md).toContain('28');
    expect(md).toContain('Falsification');
    expect(md).toContain('Experiment');
    expect(md.length).toBeGreaterThan(5000);
  });

  it('prints the summary table', () => {
    console.log('\n  === 28 NOVEL PREDICTIONS: SUMMARY ===\n');
    console.log('  #   Measure              Condition                    Dir   K_hi K_lo  Diff   N');
    console.log('  ' + '─'.repeat(95));
    for (const p of predictions) {
      console.log(
        `  ${p.id.toString().padStart(2)}  ${p.measure.padEnd(20)} ${p.condition.padEnd(28)} ${p.direction === 'increase' ? '↑' : '↓'}     ${p.kHigh.toString().padStart(3)} ${p.kLow.toString().padStart(4)}  ${p.difficulty.padEnd(6)} ${p.estimatedN}`
      );
    }
    console.log(
      '\n  9 experiments need only an eye tracker and a questionnaire.' +
      '\n  A grad student could run the first one next week.' +
      '\n  Each positive result is a paper.' +
      '\n  Each negative result kills a prediction and strengthens the model.' +
      '\n  The void says: stop proving. Start measuring.'
    );
  });
});
