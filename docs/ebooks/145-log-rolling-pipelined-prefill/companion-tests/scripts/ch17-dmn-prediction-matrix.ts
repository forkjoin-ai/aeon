import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  generatePredictions,
  renderPredictionMatrixMarkdown,
} from '../src/ch17-dmn-prediction-matrix';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ARTIFACTS = resolve(__dirname, '..', 'artifacts');

const matrix = generatePredictions();

writeFileSync(
  resolve(ARTIFACTS, 'ch17-dmn-prediction-matrix.json'),
  JSON.stringify(matrix, null, 2) + '\n'
);
writeFileSync(
  resolve(ARTIFACTS, 'ch17-dmn-prediction-matrix.md'),
  renderPredictionMatrixMarkdown(matrix)
);

console.log('wrote ch17-dmn-prediction-matrix.{json,md}');
console.log(`  predictions: ${matrix.predictions.length}`);
console.log(`  confirmed: ${matrix.confirmedCount}`);
console.log(`  novel: ${matrix.novelCount}`);
