import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { novel28, renderNovel28Markdown } from '../src/ch17-28-novel-predictions';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ARTIFACTS = resolve(__dirname, '..', 'artifacts');

const predictions = novel28();

writeFileSync(
  resolve(ARTIFACTS, 'ch17-28-novel-predictions.json'),
  JSON.stringify(predictions, null, 2) + '\n'
);
writeFileSync(
  resolve(ARTIFACTS, 'ch17-28-novel-predictions.md'),
  renderNovel28Markdown()
);

const easy = predictions.filter((p) => p.difficulty === 'easy').length;
const medium = predictions.filter((p) => p.difficulty === 'medium').length;
const hard = predictions.filter((p) => p.difficulty === 'hard').length;
const totalN = predictions.reduce((s, p) => s + p.estimatedN, 0);

console.log(`wrote ch17-28-novel-predictions.{json,md}`);
console.log(`  ${predictions.length} predictions: ${easy} easy, ${medium} medium, ${hard} hard`);
console.log(`  total N: ~${totalN}`);
