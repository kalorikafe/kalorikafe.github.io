import { readFile, readdir, stat } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const distDirectory = join(projectRoot, 'dist');

const LIMITS = {
  mainBytes: 300_000,
  mainGzipBytes: 90_000,
  // Includes field-level nutrition provenance and image attribution metadata.
  catalogGzipBytes: 96_000,
  chunkBytes: 500_000,
  distBytes: 40 * 1024 * 1024,
};

const formatBytes = bytes => `${(bytes / 1024).toFixed(2)} KiB`;
const failures = [];

const filesUnder = async directory => {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async entry => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(path) : [path];
  }));
  return nested.flat();
};

const requireBelow = (label, actual, limit) => {
  if (actual >= limit) failures.push(`${label}: ${formatBytes(actual)} must be below ${formatBytes(limit)}`);
};

let allFiles;
try {
  allFiles = await filesUnder(distDirectory);
} catch (error) {
  console.error(`Bundle budget could not read dist/: ${error instanceof Error ? error.message : error}`);
  process.exit(1);
}

const indexHtml = await readFile(join(distDirectory, 'index.html'), 'utf8');
const moduleScript = [...indexHtml.matchAll(/<script\b[^>]*\btype=["']module["'][^>]*>/gi)]
  .map(match => match[0])
  .map(tag => tag.match(/\bsrc=["']([^"']+)["']/i)?.[1])
  .find(Boolean);

if (!moduleScript) failures.push('main JS: no module script found in dist/index.html');

let mainBytes = 0;
let mainGzipBytes = 0;
if (moduleScript) {
  const mainPath = resolve(distDirectory, moduleScript.replace(/^\//, ''));
  const mainRelativePath = relative(resolve(distDirectory), mainPath);
  if (mainRelativePath.startsWith('..') || isAbsolute(mainRelativePath)) {
    failures.push(`main JS resolves outside dist/: ${moduleScript}`);
  } else {
    try {
      const main = await readFile(mainPath);
      mainBytes = main.byteLength;
      mainGzipBytes = gzipSync(main, { level: 9 }).byteLength;
      requireBelow('main JS (minified)', mainBytes, LIMITS.mainBytes);
      requireBelow('main JS (gzip)', mainGzipBytes, LIMITS.mainGzipBytes);
    } catch (error) {
      failures.push(`main JS is missing: ${error instanceof Error ? error.message : error}`);
    }
  }
}

const javascriptFiles = allFiles.filter(path => path.endsWith('.js'));
for (const path of javascriptFiles) {
  const bytes = (await stat(path)).size;
  requireBelow(`JS chunk ${relative(distDirectory, path)}`, bytes, LIMITS.chunkBytes);
}

let catalogGzipBytes = 0;
try {
  const manifest = JSON.parse(await readFile(join(distDirectory, 'data', 'catalog-manifest.json'), 'utf8'));
  if (typeof manifest.file !== 'string' || !/^catalog\.[a-f0-9]{12}\.json$/.test(manifest.file)) {
    throw new Error('catalog manifest has an invalid file name');
  }
  const catalog = await readFile(join(distDirectory, 'data', manifest.file));
  catalogGzipBytes = gzipSync(catalog, { level: 9 }).byteLength;
  requireBelow('catalog JSON (gzip)', catalogGzipBytes, LIMITS.catalogGzipBytes);
} catch (error) {
  failures.push(`catalog budget could not be measured: ${error instanceof Error ? error.message : error}`);
}

const distBytes = (await Promise.all(allFiles.map(async path => (await stat(path)).size)))
  .reduce((total, bytes) => total + bytes, 0);
requireBelow('dist total', distBytes, LIMITS.distBytes);

console.log(JSON.stringify({
  main: { bytes: mainBytes, gzipBytes: mainGzipBytes },
  catalog: { gzipBytes: catalogGzipBytes },
  javascriptChunks: javascriptFiles.length,
  dist: { files: allFiles.length, bytes: distBytes },
  limits: LIMITS,
}, null, 2));

if (failures.length > 0) {
  console.error(`Bundle budget FAILED (${failures.length})`);
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log('Bundle budget passed');
