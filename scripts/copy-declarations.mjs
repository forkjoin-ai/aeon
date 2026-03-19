import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(scriptDir, '..');
const sourceRoot = path.join(packageRoot, 'src');
const distRoot = path.join(packageRoot, 'dist');

function rewriteRelativeSpecifiers(contents) {
  return contents.replace(
    /(from\s+['"])(\.\.?\/[^'"]+?)(['"])/g,
    (fullMatch, prefix, specifier, suffix) => {
      if (/\.(?:[cm]?js|[cm]?ts|json)$/.test(specifier)) {
        return fullMatch;
      }

      return `${prefix}${specifier}.js${suffix}`;
    }
  );
}

async function copyDeclarations(sourceDir) {
  const entries = await readdir(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const relativePath = path.relative(sourceRoot, sourcePath);
    const targetPath = path.join(distRoot, relativePath);

    if (entry.isDirectory()) {
      await copyDeclarations(sourcePath);
      continue;
    }

    if (!entry.isFile() || !entry.name.endsWith('.d.ts')) {
      continue;
    }

    await mkdir(path.dirname(targetPath), { recursive: true });
    const contents = await readFile(sourcePath, 'utf8');
    await writeFile(targetPath, rewriteRelativeSpecifiers(contents));
  }
}

await copyDeclarations(sourceRoot);
