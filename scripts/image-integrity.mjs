/**
 * Content-based image integrity and provenance audit.
 *
 * Usage:
 *   node --experimental-strip-types scripts/image-integrity.mjs --report
 *   node --experimental-strip-types scripts/image-integrity.mjs --strict
 *
 * `--report` always exits successfully and records gate failures in JSON.
 * `--strict` exits non-zero when a gate fails. No mode deletes image files.
 */
import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, '..');
const DEFAULT_PUBLIC_DIR = path.join(PROJECT_ROOT, 'public');
const MAX_PRODUCTS_PER_CONTENT = 6;
const MIN_UNIQUE_CONTENT_PERCENT = 60;

const LICENSE_URLS = Object.freeze({
  'CC BY 2.0': 'https://creativecommons.org/licenses/by/2.0/',
  'CC BY 2.5': 'https://creativecommons.org/licenses/by/2.5/',
  'CC BY 3.0': 'https://creativecommons.org/licenses/by/3.0/',
  'CC BY 4.0': 'https://creativecommons.org/licenses/by/4.0/',
  'CC BY-SA 2.0': 'https://creativecommons.org/licenses/by-sa/2.0/',
  'CC BY-SA 2.5': 'https://creativecommons.org/licenses/by-sa/2.5/',
  'CC BY-SA 3.0': 'https://creativecommons.org/licenses/by-sa/3.0/',
  'CC BY-SA 4.0': 'https://creativecommons.org/licenses/by-sa/4.0/',
  CC0: 'https://creativecommons.org/publicdomain/zero/1.0/',
  'Public domain': 'https://creativecommons.org/publicdomain/mark/1.0/',
  'Unsplash License': 'https://unsplash.com/license',
});

export function sha256(content) {
  return createHash('sha256').update(content).digest('hex');
}

export function exitCodeForMode(mode, passed) {
  return mode === 'strict' && !passed ? 1 : 0;
}

function round(value, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function compareText(left, right) {
  return left.localeCompare(right, 'en');
}

function isHttpsUrl(value) {
  if (typeof value !== 'string') return false;
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

function walkFiles(directory) {
  if (!existsSync(directory)) return [];
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walkFiles(entryPath));
    else if (entry.isFile()) files.push(entryPath);
  }
  return files;
}

function toPublicUrl(filePath, publicDir) {
  return `/${path.relative(publicDir, filePath).split(path.sep).join('/')}`;
}

function resolvePublicUrl(publicUrl, publicDir) {
  if (typeof publicUrl !== 'string' || !publicUrl.startsWith('/')) return null;
  let decoded;
  try {
    decoded = decodeURIComponent(publicUrl.split(/[?#]/, 1)[0]);
  } catch {
    return null;
  }
  const resolved = path.resolve(publicDir, `.${decoded}`);
  const relative = path.relative(publicDir, resolved);
  if (relative.startsWith('..') || path.isAbsolute(relative)) return null;
  return resolved;
}

function sortedGroupRecords(groupMap, minimumSize = 1) {
  return [...groupMap.entries()]
    .map(([key, group]) => ({ key, ...group }))
    .filter(group => group.productIds.length >= minimumSize)
    .sort((left, right) => right.productIds.length - left.productIds.length || compareText(left.key, right.key));
}

export function analyzeCatalogImages(items, publicDir = DEFAULT_PUBLIC_DIR) {
  const pathHashCache = new Map();
  const contentGroups = new Map();
  const sourceGroups = new Map();
  const referencedUrls = new Set();
  const missingByPath = new Map();
  const products = [];

  for (const item of items) {
    const imagePath = item.image;
    referencedUrls.add(imagePath);
    const absolutePath = resolvePublicUrl(imagePath, publicDir);
    let contentSha256 = null;
    let sizeBytes = null;
    let exists = false;

    if (absolutePath && statSync(absolutePath, { throwIfNoEntry: false })?.isFile()) {
      exists = true;
      sizeBytes = statSync(absolutePath).size;
      contentSha256 = pathHashCache.get(absolutePath);
      if (!contentSha256) {
        contentSha256 = sha256(readFileSync(absolutePath));
        pathHashCache.set(absolutePath, contentSha256);
      }
      const group = contentGroups.get(contentSha256) ?? { productIds: [], imagePaths: new Set() };
      group.productIds.push(item.id);
      group.imagePaths.add(imagePath);
      contentGroups.set(contentSha256, group);
    } else {
      const missingKey = imagePath ?? 'unknown';
      const missing = missingByPath.get(missingKey) ?? [];
      missing.push(item.id);
      missingByPath.set(missingKey, missing);
    }

    const sourceUrl = item.imageSource?.url;
    if (sourceUrl) {
      const group = sourceGroups.get(sourceUrl) ?? { productIds: [], imagePaths: new Set() };
      group.productIds.push(item.id);
      group.imagePaths.add(imagePath);
      sourceGroups.set(sourceUrl, group);
    }

    products.push({
      productId: item.id,
      imagePath,
      exists,
      sizeBytes,
      sha256: contentSha256,
      imageSourceUrl: sourceUrl ?? null,
    });
  }

  const allWebpUrls = walkFiles(path.join(publicDir, 'images'))
    .filter(filePath => path.extname(filePath).toLowerCase() === '.webp')
    .map(filePath => toPublicUrl(filePath, publicDir))
    .sort(compareText);
  const orphanWebp = allWebpUrls.filter(publicUrl => !referencedUrls.has(publicUrl));

  const duplicateContentGroups = sortedGroupRecords(contentGroups, 2).map(group => ({
    sha256: group.key,
    productCount: group.productIds.length,
    fileCount: group.imagePaths.size,
    productIds: [...group.productIds].sort(compareText),
    imagePaths: [...group.imagePaths].sort(compareText),
  }));
  const repeatedImageSourceUrls = sortedGroupRecords(sourceGroups, 2).map(group => ({
    url: group.key,
    productCount: group.productIds.length,
    productIds: [...group.productIds].sort(compareText),
    imagePaths: [...group.imagePaths].sort(compareText),
  }));
  const missingImages = [...missingByPath.entries()]
    .map(([imagePath, productIds]) => ({ imagePath, productIds: productIds.sort(compareText) }))
    .sort((left, right) => compareText(left.imagePath, right.imagePath));

  const uniqueContentCount = contentGroups.size;
  const uniqueContentPercent = items.length === 0 ? 100 : (uniqueContentCount / items.length) * 100;
  const maxProductsPerContent = duplicateContentGroups[0]?.productCount ?? (items.length > 0 ? 1 : 0);
  const gates = {
    allCatalogImagesExist: {
      passed: missingImages.length === 0,
      actual: missingImages.length,
      expected: 0,
      unit: 'missing files',
    },
    uniqueContentPercent: {
      passed: uniqueContentPercent >= MIN_UNIQUE_CONTENT_PERCENT,
      actual: round(uniqueContentPercent),
      expectedMinimum: MIN_UNIQUE_CONTENT_PERCENT,
      unit: 'percent of products',
    },
    maxProductsPerContent: {
      passed: maxProductsPerContent <= MAX_PRODUCTS_PER_CONTENT,
      actual: maxProductsPerContent,
      expectedMaximum: MAX_PRODUCTS_PER_CONTENT,
      unit: 'products per SHA-256',
    },
  };

  return {
    schemaVersion: 1,
    thresholds: {
      minimumUniqueContentPercent: MIN_UNIQUE_CONTENT_PERCENT,
      maximumProductsPerContent: MAX_PRODUCTS_PER_CONTENT,
    },
    summary: {
      totalProducts: items.length,
      referencedImagePaths: referencedUrls.size,
      existingReferencedImagePaths: pathHashCache.size,
      missingImagePaths: missingImages.length,
      uniqueContentHashes: uniqueContentCount,
      uniqueContentPercent: round(uniqueContentPercent),
      duplicateContentGroups: duplicateContentGroups.length,
      maxProductsPerContent,
      repeatedImageSourceUrlGroups: repeatedImageSourceUrls.length,
      allWebpFiles: allWebpUrls.length,
      orphanWebpFiles: orphanWebp.length,
    },
    gates,
    passed: Object.values(gates).every(gate => gate.passed),
    missingImages,
    duplicateContentGroups,
    repeatedImageSourceUrls,
    orphanWebp,
    products: products.sort((left, right) => compareText(left.productId, right.productId)),
  };
}

function stripHtml(value) {
  return String(value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeLicenseUrl(value) {
  if (!value) return null;
  if (value.startsWith('//')) return `https:${value}`;
  if (value.startsWith('http://creativecommons.org/')) {
    return value.replace('http://', 'https://');
  }
  return /^https?:\/\//.test(value) ? value : null;
}

function verifiedAuthor(value) {
  const author = stripHtml(value);
  if (!author || /no machine-readable author|\bassumed\b/i.test(author)) return 'unknown';
  return author;
}

function commonsTitleFromUrl(pageUrl) {
  try {
    const url = new URL(pageUrl);
    if (url.hostname !== 'commons.wikimedia.org') return null;
    const encodedTitle = url.pathname.match(/^\/wiki\/(.+)$/)?.[1];
    if (!encodedTitle) return null;
    const title = decodeURIComponent(encodedTitle).replaceAll('_', ' ');
    return title.startsWith('File:') ? title : null;
  } catch {
    return null;
  }
}

function normalizedCommonsTitle(title) {
  return title.replaceAll('_', ' ').trim().toLocaleLowerCase('en');
}

export async function fetchCommonsMetadata(records, fetchImpl = globalThis.fetch) {
  if (typeof fetchImpl !== 'function') return new Map();
  const pageUrlsByTitle = new Map();
  for (const record of records) {
    const title = commonsTitleFromUrl(record.pageUrl);
    if (!title) continue;
    const key = normalizedCommonsTitle(title);
    const pageUrls = pageUrlsByTitle.get(key) ?? { title, pageUrls: [] };
    pageUrls.pageUrls.push(record.pageUrl);
    pageUrlsByTitle.set(key, pageUrls);
  }

  const requests = [...pageUrlsByTitle.values()];
  const result = new Map();
  for (let index = 0; index < requests.length; index += 10) {
    const batch = requests.slice(index, index + 10);
    const query = new URLSearchParams({
      action: 'query',
      format: 'json',
      formatversion: '2',
      prop: 'imageinfo',
      iiprop: 'extmetadata',
      iiextmetadatalanguage: 'en',
      iiextmetadatafilter: 'Artist|Credit|LicenseShortName|LicenseUrl',
      titles: batch.map(entry => entry.title).join('|'),
      origin: '*',
    });
    const response = await fetchImpl(`https://commons.wikimedia.org/w/api.php?${query}`, {
      headers: { 'User-Agent': 'KaloriCafeImageIntegrity/1.0 (catalog provenance audit)' },
    });
    if (!response.ok) continue;
    const payload = await response.json();
    for (const page of payload.query?.pages ?? []) {
      if (page.missing) continue;
      const metadata = page.imageinfo?.[0]?.extmetadata ?? {};
      const matched = pageUrlsByTitle.get(normalizedCommonsTitle(page.title));
      if (!matched) continue;
      const author = verifiedAuthor(metadata.Artist?.value || metadata.Credit?.value);
      const licenseName = stripHtml(metadata.LicenseShortName?.value) || 'unknown';
      const licenseUrl = normalizeLicenseUrl(metadata.LicenseUrl?.value) ?? 'unknown';
      for (const pageUrl of matched.pageUrls) {
        result.set(pageUrl, { author, licenseName, licenseUrl });
      }
    }
  }
  return result;
}

export function createProvenanceManifest(snapshot, items, commonsMetadata = new Map(), snapshotSha256 = 'unknown') {
  const issues = [];
  const records = {};
  const itemIds = new Set(items.map(item => item.id));

  for (const item of [...items].sort((left, right) => compareText(left.id, right.id))) {
    const source = snapshot[item.id];
    if (!source) {
      issues.push(`Missing snapshot row for ${item.id}`);
    }
    const declaredLicense = source?.license && source.license !== 'official' ? source.license : 'unknown';
    const commons = source?.pageUrl ? commonsMetadata.get(source.pageUrl) : null;
    const licenseName = commons?.licenseName ?? declaredLicense;
    const licenseUrl = commons?.licenseUrl && commons.licenseUrl !== 'unknown'
      ? commons.licenseUrl
      : LICENSE_URLS[licenseName]
        ?? LICENSE_URLS[declaredLicense]
        ?? 'unknown';
    const snapshotMatches = Boolean(source)
      && source.id === item.id
      && source.file === item.image
      && source.sourceUrl === item.imageSource?.url;
    if (source && !snapshotMatches) issues.push(`Snapshot/catalog mismatch for ${item.id}`);

    records[item.id] = {
      imagePath: item.image,
      sourceUrl: source?.sourceUrl ?? item.imageSource?.url ?? 'unknown',
      sourcePageUrl: source?.pageUrl ?? 'unknown',
      sourceKind: source?.kind ?? item.imageSource?.kind ?? 'unknown',
      exactProduct: source?.exactProduct ?? item.imageSource?.exactProduct ?? false,
      author: commons?.author ?? 'unknown',
      license: licenseName,
      licenseUrl,
      metadataVerification: commons
        ? 'wikimedia_commons_api'
        : licenseUrl !== 'unknown'
          ? 'snapshot_license_with_canonical_url'
          : 'snapshot_only',
    };
  }

  for (const snapshotId of Object.keys(snapshot)) {
    if (!itemIds.has(snapshotId)) issues.push(`Snapshot row is not in MENU_ITEMS: ${snapshotId}`);
  }

  return {
    schemaVersion: 1,
    sourceSnapshot: 'scripts/catalog_sources/catalog_assets.json',
    sourceSnapshotSha256: snapshotSha256,
    recordCount: Object.keys(records).length,
    unknownPolicy: 'Missing author, license, or license URL values are recorded as unknown; no license is inferred from source kind.',
    issues: issues.sort(compareText),
    records,
  };
}

export function validateProvenanceManifest(manifest, items, snapshotText = null) {
  const issues = [];
  if (!manifest || manifest.schemaVersion !== 1 || !manifest.records || Array.isArray(manifest.records)) {
    return ['Image provenance manifest has an invalid schema'];
  }
  const records = manifest.records;
  const itemIds = new Set(items.map(item => item.id));
  if (manifest.recordCount !== items.length || Object.keys(records).length !== items.length) {
    issues.push(`Image provenance count must equal catalog count ${items.length}`);
  }
  if (Array.isArray(manifest.issues) && manifest.issues.length > 0) {
    issues.push(...manifest.issues.map(issue => `Manifest issue: ${issue}`));
  }
  if (snapshotText !== null && manifest.sourceSnapshotSha256 !== sha256(snapshotText)) {
    issues.push('Image provenance source snapshot SHA-256 mismatch');
  }
  for (const item of items) {
    const record = records[item.id];
    if (!record) {
      issues.push(`Missing image provenance record for ${item.id}`);
      continue;
    }
    if (record.imagePath !== item.image
      || record.sourceUrl !== item.imageSource?.url
      || record.sourceKind !== item.imageSource?.kind
      || record.exactProduct !== item.imageSource?.exactProduct) {
      issues.push(`Image provenance/catalog mismatch for ${item.id}`);
    }
    if (!isHttpsUrl(record.sourcePageUrl)) issues.push(`Image source page is not HTTPS for ${item.id}`);
    if (record.sourceKind === 'licensed_fallback') {
      if (record.license === 'unknown') issues.push(`Fallback image license is unknown for ${item.id}`);
      if (!isHttpsUrl(record.licenseUrl)) issues.push(`Fallback image license URL is not HTTPS for ${item.id}`);
      if (record.metadataVerification === 'snapshot_only') {
        issues.push(`Fallback image metadata was not license-verified for ${item.id}`);
      }
    }
  }
  for (const id of Object.keys(records)) {
    if (!itemIds.has(id)) issues.push(`Image provenance record is not in catalog: ${id}`);
  }
  return issues.sort(compareText);
}

function hashForPublicUrl(publicUrl, publicDir) {
  const filePath = resolvePublicUrl(publicUrl, publicDir);
  if (!filePath || !statSync(filePath, { throwIfNoEntry: false })?.isFile()) return null;
  return sha256(readFileSync(filePath));
}

export function createCleanupReport(integrityReport, publicDir = DEFAULT_PUBLIC_DIR) {
  const productPaths = new Set(integrityReport.products.map(product => product.imagePath));
  const definiteUnused = [];
  const rootImageDirectory = path.join(publicDir, 'images');
  for (const filePath of walkFiles(rootImageDirectory)) {
    if (path.dirname(filePath) !== rootImageDirectory || path.extname(filePath).toLowerCase() !== '.jpg') continue;
    const publicUrl = toPublicUrl(filePath, publicDir);
    if (productPaths.has(publicUrl)) continue;
    definiteUnused.push({
      path: `public${publicUrl}`,
      reason: 'legacy root JPG not referenced by MENU_ITEMS',
      sizeBytes: statSync(filePath).size,
      sha256: sha256(readFileSync(filePath)),
    });
  }

  const knownOrphan = '/images/menu/starbucks/caffe_latte.webp';
  if (integrityReport.orphanWebp.includes(knownOrphan)) {
    const orphanHash = hashForPublicUrl(knownOrphan, publicDir);
    const matchingReferencedPaths = integrityReport.products
      .filter(product => product.sha256 === orphanHash)
      .map(product => product.imagePath)
      .filter((value, index, values) => values.indexOf(value) === index)
      .sort(compareText);
    const absolutePath = resolvePublicUrl(knownOrphan, publicDir);
    definiteUnused.push({
      path: `public${knownOrphan}`,
      reason: 'orphan WebP not referenced by MENU_ITEMS',
      sizeBytes: absolutePath ? statSync(absolutePath).size : null,
      sha256: orphanHash,
      duplicateOfReferencedPaths: matchingReferencedPaths,
    });
  }

  definiteUnused.sort((left, right) => compareText(left.path, right.path));
  const definiteUrls = new Set(definiteUnused.map(entry => entry.path.replace(/^public/, '')));
  return {
    schemaVersion: 1,
    deletionPerformed: false,
    basedOnCatalogProducts: integrityReport.summary.totalProducts,
    definiteUnused,
    orphanWebpForReview: integrityReport.orphanWebp.filter(publicUrl => !definiteUrls.has(publicUrl)),
  };
}

export function preserveCompletedCleanup(currentReport, previousReport) {
  if (!previousReport?.deletionPerformed) return currentReport;
  return {
    ...currentReport,
    deletionPerformed: true,
    removedAt: previousReport.removedAt,
    definiteUnused: previousReport.definiteUnused ?? [],
  };
}

function parseArguments(argv) {
  const options = {
    mode: 'report',
    output: null,
    cleanupOutput: null,
    provenanceInput: null,
    provenanceOutput: null,
    refreshCommons: false,
  };
  for (let index = 0; index < argv.length; index++) {
    const argument = argv[index];
    if (argument === '--report') options.mode = 'report';
    else if (argument === '--strict') options.mode = 'strict';
    else if (argument === '--refresh-commons') options.refreshCommons = true;
    else if (['--output', '--cleanup-output', '--provenance-input', '--provenance-output'].includes(argument)) {
      const value = argv[++index];
      if (!value) throw new Error(`${argument} needs a file path`);
      const key = {
        '--output': 'output',
        '--cleanup-output': 'cleanupOutput',
        '--provenance-input': 'provenanceInput',
        '--provenance-output': 'provenanceOutput',
      }[argument];
      options[key] = value;
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }
  if (options.provenanceInput && !options.provenanceOutput) {
    throw new Error('--provenance-input requires --provenance-output');
  }
  return options;
}

function writeJson(filePath, value) {
  const absolutePath = path.resolve(PROJECT_ROOT, filePath);
  mkdirSync(path.dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  return absolutePath;
}

async function main() {
  let options;
  try {
    options = parseArguments(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 2;
    return;
  }

  const { MENU_ITEMS } = await import('../src/data/items.ts');
  const integrityReport = analyzeCatalogImages(MENU_ITEMS, DEFAULT_PUBLIC_DIR);
  const trackedProvenancePath = path.join(SCRIPT_DIR, 'catalog_sources', 'image-provenance.json');
  const trackedProvenance = JSON.parse(readFileSync(trackedProvenancePath, 'utf8'));
  const sourceSnapshotPath = path.resolve(PROJECT_ROOT, trackedProvenance.sourceSnapshot ?? '');
  const sourceRelative = path.relative(PROJECT_ROOT, sourceSnapshotPath);
  const snapshotInsideProject = sourceRelative !== '' && !sourceRelative.startsWith('..') && !path.isAbsolute(sourceRelative);
  const sourceSnapshotText = snapshotInsideProject && existsSync(sourceSnapshotPath)
    ? readFileSync(sourceSnapshotPath, 'utf8')
    : null;
  const provenanceIssues = validateProvenanceManifest(trackedProvenance, MENU_ITEMS, sourceSnapshotText);
  if (!snapshotInsideProject || sourceSnapshotText === null) provenanceIssues.push('Tracked provenance source snapshot is missing or outside the project');
  integrityReport.provenanceIssues = provenanceIssues.sort(compareText);
  integrityReport.gates.provenanceManifest = {
    passed: provenanceIssues.length === 0,
    actual: provenanceIssues.length,
    expected: 0,
    unit: 'provenance issues',
  };
  integrityReport.passed = integrityReport.passed && provenanceIssues.length === 0;
  const cleanupReport = createCleanupReport(integrityReport, DEFAULT_PUBLIC_DIR);
  const written = {};

  if (options.output) written.report = writeJson(options.output, integrityReport);
  if (options.cleanupOutput) {
    const cleanupPath = path.resolve(PROJECT_ROOT, options.cleanupOutput);
    const previousCleanup = existsSync(cleanupPath)
      ? JSON.parse(readFileSync(cleanupPath, 'utf8'))
      : null;
    const persistedCleanup = preserveCompletedCleanup(cleanupReport, previousCleanup);
    written.cleanup = writeJson(options.cleanupOutput, persistedCleanup);
  }
  if (options.provenanceInput) {
    const inputPath = path.resolve(PROJECT_ROOT, options.provenanceInput);
    const snapshotText = readFileSync(inputPath, 'utf8');
    const snapshot = JSON.parse(snapshotText);
    const commonsMetadata = options.refreshCommons
      ? await fetchCommonsMetadata(Object.values(snapshot))
      : new Map();
    const manifest = createProvenanceManifest(snapshot, MENU_ITEMS, commonsMetadata, sha256(snapshotText));
    written.provenance = writeJson(options.provenanceOutput, manifest);
  }

  const consolePayload = options.output
    ? { mode: options.mode, passed: integrityReport.passed, summary: integrityReport.summary, gates: integrityReport.gates, provenanceIssues: integrityReport.provenanceIssues.slice(0, 25), written }
    : { mode: options.mode, ...integrityReport, cleanup: cleanupReport, written };
  console.log(JSON.stringify(consolePayload, null, 2));

  process.exitCode = exitCodeForMode(options.mode, integrityReport.passed);
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : null;
if (invokedPath === fileURLToPath(import.meta.url)) {
  await main();
}
