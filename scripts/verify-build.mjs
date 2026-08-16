import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { appendFile, readFile, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const distDirectory = join(projectRoot, 'dist');
const failures = [];

const readJson = async path => JSON.parse(await readFile(path, 'utf8'));
const expectedSha = process.env.EXPECTED_SHA
  ?? process.env.GITHUB_SHA
  ?? execFileSync('git', ['rev-parse', 'HEAD'], { cwd: projectRoot, encoding: 'utf8' }).trim();

let buildInfo;
let manifest;
let catalog;
try {
  buildInfo = await readJson(join(distDirectory, 'build-info.json'));
  manifest = await readJson(join(distDirectory, 'data', 'catalog-manifest.json'));
  if (typeof manifest.file !== 'string' || !/^catalog\.[a-f0-9]{12}\.json$/.test(manifest.file)) {
    throw new Error('catalog manifest has an invalid file name');
  }
  catalog = await readJson(join(distDirectory, 'data', manifest.file));
} catch (error) {
  console.error(`Production build verification could not read its manifests: ${error instanceof Error ? error.message : error}`);
  process.exit(1);
}

if (buildInfo.sha !== expectedSha) failures.push(`build SHA ${buildInfo.sha} does not match expected ${expectedSha}`);
if (!Number.isFinite(Date.parse(buildInfo.builtAt))) failures.push('build-info builtAt is not a valid timestamp');
if (!Array.isArray(catalog.items)) failures.push('catalog payload has no items array');

const catalogCount = Array.isArray(catalog.items) ? catalog.items.length : 0;
if (manifest.count !== catalogCount) failures.push(`manifest count ${manifest.count} does not match payload ${catalogCount}`);
if (buildInfo.catalogCount !== catalogCount) failures.push(`build-info count ${buildInfo.catalogCount} does not match payload ${catalogCount}`);
if (buildInfo.catalogSha256 !== manifest.sha256) failures.push('build-info and catalog manifest SHA-256 differ');
const catalogSha256 = createHash('sha256').update(JSON.stringify(catalog)).digest('hex');
if (catalogSha256 !== manifest.sha256) failures.push('catalog payload does not match its manifest SHA-256');

const sampleItem = Array.isArray(catalog.items)
  ? catalog.items.find(item => typeof item?.image === 'string' && /^\/images\/menu\/.+\.webp$/.test(item.image))
  : undefined;
const sampleImage = sampleItem?.image;
if (!sampleImage) {
  failures.push('catalog has no local WebP sample image');
} else {
  try {
    const image = await readFile(join(distDirectory, sampleImage.replace(/^\//, '')));
    const header = image.subarray(0, 12);
    if (image.byteLength === 0 || header.toString('ascii', 0, 4) !== 'RIFF' || header.toString('ascii', 8, 12) !== 'WEBP') {
      failures.push(`sample image is empty or not WebP: ${sampleImage}`);
    }
  } catch (error) {
    failures.push(`sample image is missing: ${sampleImage} (${error instanceof Error ? error.message : error})`);
  }
}

for (const requiredPath of ['index.html', 'sitemap.xml', '404.html']) {
  try {
    if ((await stat(join(distDirectory, requiredPath))).size === 0) failures.push(`${requiredPath} is empty`);
  } catch {
    failures.push(`${requiredPath} is missing`);
  }
}

if (failures.length > 0) {
  console.error(`Production build verification FAILED (${failures.length})`);
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log(`Production build verified: ${expectedSha.slice(0, 12)} · ${catalogCount} items · ${sampleImage}`);

if (process.argv.includes('--github-output')) {
  const outputPath = process.env.GITHUB_OUTPUT;
  if (!outputPath) {
    console.error('--github-output requires the GITHUB_OUTPUT environment variable');
    process.exit(1);
  }
  await appendFile(
    outputPath,
    `build_sha=${buildInfo.sha}\ncatalog_count=${catalogCount}\nsample_image=${sampleImage}\n`,
    'utf8',
  );
}
