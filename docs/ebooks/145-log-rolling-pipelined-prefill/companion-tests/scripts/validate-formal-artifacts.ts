import { readdirSync, readFileSync } from 'node:fs';
import { dirname, extname, join, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  parseTlaModule,
  parseTlcConfig,
  renderTlaModule,
  serializeTlcConfig,
} from '@affectively/aeon-logic';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(scriptDir, '..');
const formalDir = join(rootDir, 'formal');

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function validateTlaFile(filename: string): void {
  const fullPath = join(formalDir, filename);
  const source = readFileSync(fullPath, 'utf8');
  const parsed = parseTlaModule(source);
  const rendered = renderTlaModule(parsed);
  const reparsed = parseTlaModule(rendered);

  assert(
    JSON.stringify(reparsed) === JSON.stringify(parsed),
    `TLA round-trip mismatch for ${filename}`,
  );
  assert(parsed.moduleName === basename(filename, '.tla'), `Module name mismatch for ${filename}`);
}

function validateCfgFile(filename: string): void {
  const fullPath = join(formalDir, filename);
  const source = readFileSync(fullPath, 'utf8');
  const parsed = parseTlcConfig(source);
  const rendered = serializeTlcConfig(parsed);
  const reparsed = parseTlcConfig(rendered);

  assert(
    JSON.stringify(reparsed) === JSON.stringify(parsed),
    `CFG round-trip mismatch for ${filename}`,
  );
  assert(
    Boolean(parsed.specification || (parsed.init && parsed.next)),
    `Config ${filename} must specify SPECIFICATION or INIT+NEXT`,
  );
}

function main(): void {
  const files = readdirSync(formalDir).filter((entry) => !entry.startsWith('.'));
  const allTlaFiles = files.filter((entry) => extname(entry) === '.tla');
  const cfgFiles = files.filter((entry) => extname(entry) === '.cfg');

  assert(cfgFiles.length > 0, 'No .cfg files found in formal/');

  const cfgByBase = new Set(cfgFiles.map((entry) => basename(entry, '.cfg')));
  const tlaFiles = allTlaFiles.filter((entry) => cfgByBase.has(basename(entry, '.tla')));
  assert(tlaFiles.length > 0, 'No .tla files with matching .cfg found in formal/');

  for (const cfgFile of cfgFiles) {
    const baseName = basename(cfgFile, '.cfg');
    assert(
      allTlaFiles.includes(`${baseName}.tla`),
      `Missing module for config ${baseName}.cfg`,
    );
  }

  for (const filename of tlaFiles) {
    validateTlaFile(filename);
  }
  for (const filename of cfgFiles) {
    validateCfgFile(filename);
  }

  process.stdout.write(
    `aeon-logic parser validation passed (${tlaFiles.length} TLA modules, ${cfgFiles.length} CFG files)\n`,
  );
}

main();
