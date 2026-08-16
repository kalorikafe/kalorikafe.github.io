/**
 * Idempotently resize/encode catalog WebP images and label licensed fallbacks.
 *
 * Catalog paths stay unchanged. Official exact-product images are only resized
 * and encoded; licensed fallback images receive a small product/chain label.
 */
import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, '..');
const DEFAULT_PUBLIC_DIR = path.join(PROJECT_ROOT, 'public');
const DEFAULT_PROVENANCE_PATH = path.join(SCRIPT_DIR, 'catalog_sources', 'image-provenance.json');
const DEFAULT_MANIFEST_PATH = path.join(SCRIPT_DIR, 'catalog_sources', 'image-derivatives.json');

export const TRANSFORM_VERSION = 'menu-webp-v1';
export const TRANSFORM_CONFIG = Object.freeze({
  maximumWidth: 640,
  maximumHeight: 480,
  officialExactQuality: 76,
  licensedFallbackQuality: 68,
  webpEffort: 4,
  fit: 'inside',
  withoutEnlargement: true,
  fallbackOverlay: 'bottom-product-chain-v1',
});

function sha256(content) {
  return createHash('sha256').update(content).digest('hex');
}

function compareText(left, right) {
  return left.localeCompare(right, 'en');
}

export function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function truncate(value, maximumLength) {
  if (value.length <= maximumLength) return value;
  return `${value.slice(0, Math.max(1, maximumLength - 1)).trimEnd()}…`;
}

function wrapLabel(value, maximumCharacters, maximumLines = 2) {
  const words = String(value).trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return ['Ürün'];
  const lines = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maximumCharacters || current.length === 0) {
      current = candidate;
      continue;
    }
    lines.push(current);
    current = word;
    if (lines.length === maximumLines - 1) break;
  }
  if (lines.length < maximumLines && current) lines.push(current);
  const consumed = lines.join(' ').split(/\s+/).length;
  if (consumed < words.length || lines.at(-1).length > maximumCharacters) {
    lines[lines.length - 1] = truncate(lines.at(-1), maximumCharacters);
  }
  return lines.slice(0, maximumLines);
}

export function createFallbackOverlaySvg(width, height, productName, chainLabel) {
  const productFontSize = clamp(Math.round(width * 0.034), 14, 21);
  const chainFontSize = clamp(Math.round(width * 0.021), 10, 13);
  const horizontalPadding = clamp(Math.round(width * 0.035), 12, 22);
  const maximumCharacters = Math.max(18, Math.floor((width - horizontalPadding * 2) / (productFontSize * 0.56)));
  const lines = wrapLabel(productName, maximumCharacters, 2);
  const lineHeight = Math.round(productFontSize * 1.18);
  const panelHeight = Math.min(
    height,
    horizontalPadding + chainFontSize + 6 + lines.length * lineHeight + Math.round(horizontalPadding * 0.7),
  );
  const panelTop = height - panelHeight;
  const chainY = panelTop + horizontalPadding + chainFontSize;
  const productStartY = chainY + 7 + productFontSize;
  const productTspans = lines
    .map((line, index) => `<tspan x="${horizontalPadding}" y="${productStartY + index * lineHeight}">${escapeXml(line)}</tspan>`)
    .join('');

  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`
    + '<defs><linearGradient id="label-bg" x1="0" y1="0" x2="0" y2="1">'
    + '<stop offset="0" stop-color="#17120f" stop-opacity="0.18"/>'
    + '<stop offset="0.3" stop-color="#17120f" stop-opacity="0.82"/>'
    + '<stop offset="1" stop-color="#17120f" stop-opacity="0.96"/>'
    + '</linearGradient></defs>'
    + `<rect x="0" y="${panelTop}" width="${width}" height="${panelHeight}" fill="url(#label-bg)"/>`
    + `<text x="${horizontalPadding}" y="${chainY}" fill="#f2d8ae" font-family="Arial, Helvetica, sans-serif" font-size="${chainFontSize}" font-weight="700" letter-spacing="0.8">${escapeXml(chainLabel)}</text>`
    + `<text fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="${productFontSize}" font-weight="700">${productTspans}</text>`
    + '</svg>',
  );
}

function resolveCatalogImage(imagePath, publicDir) {
  if (typeof imagePath !== 'string' || !imagePath.startsWith('/images/menu/') || !imagePath.endsWith('.webp')) {
    throw new Error(`Catalog image must be a local menu WebP: ${imagePath}`);
  }
  const resolved = path.resolve(publicDir, `.${imagePath}`);
  const menuRoot = path.resolve(publicDir, 'images', 'menu');
  const relative = path.relative(menuRoot, resolved);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Catalog image resolves outside public/images/menu: ${imagePath}`);
  }
  return resolved;
}

function stableTransformPayload(item, chainLabel, provenance, inputSha256) {
  return {
    transformVersion: TRANSFORM_VERSION,
    config: TRANSFORM_CONFIG,
    productId: item.id,
    productName: item.name,
    chainLabel,
    imagePath: item.image,
    inputSha256,
    sourceUrl: provenance.sourceUrl,
    sourceKind: provenance.sourceKind,
    exactProduct: provenance.exactProduct,
  };
}

export function createTransformKey(item, chainLabel, provenance, inputSha256) {
  return sha256(JSON.stringify(stableTransformPayload(item, chainLabel, provenance, inputSha256)));
}

function loadExistingManifest(manifestPath) {
  if (!existsSync(manifestPath)) return { records: {} };
  try {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    return manifest.schemaVersion === 1 && manifest.records ? manifest : { records: {} };
  } catch {
    return { records: {} };
  }
}

function writeManifest(manifestPath, manifest) {
  mkdirSync(path.dirname(manifestPath), { recursive: true });
  const orderedRecords = Object.fromEntries(
    Object.entries(manifest.records).sort(([left], [right]) => compareText(left, right)),
  );
  writeFileSync(manifestPath, `${JSON.stringify({ ...manifest, records: orderedRecords }, null, 2)}\n`, 'utf8');
}

async function encodeImage(inputBuffer, item, chainLabel, provenance) {
  const isLicensedFallback = provenance.sourceKind === 'licensed_fallback';
  const isOfficialExact = provenance.sourceKind === 'official' && provenance.exactProduct === true;
  if (!isLicensedFallback && !isOfficialExact) {
    throw new Error(`Unsupported image provenance for ${item.id}: ${provenance.sourceKind}/${provenance.exactProduct}`);
  }

  const resize = {
    width: TRANSFORM_CONFIG.maximumWidth,
    height: TRANSFORM_CONFIG.maximumHeight,
    fit: TRANSFORM_CONFIG.fit,
    withoutEnlargement: TRANSFORM_CONFIG.withoutEnlargement,
  };
  const quality = isLicensedFallback
    ? TRANSFORM_CONFIG.licensedFallbackQuality
    : TRANSFORM_CONFIG.officialExactQuality;
  let result;

  if (isLicensedFallback) {
    const resized = await sharp(inputBuffer)
      .rotate()
      .resize(resize)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const overlay = createFallbackOverlaySvg(resized.info.width, resized.info.height, item.name, chainLabel);
    result = await sharp(resized.data, {
      raw: {
        width: resized.info.width,
        height: resized.info.height,
        channels: resized.info.channels,
      },
    })
      .composite([{ input: overlay, top: 0, left: 0 }])
      .webp({ quality, effort: TRANSFORM_CONFIG.webpEffort, smartSubsample: true })
      .toBuffer({ resolveWithObject: true });
  } else {
    result = await sharp(inputBuffer)
      .rotate()
      .resize(resize)
      .webp({ quality, effort: TRANSFORM_CONFIG.webpEffort, smartSubsample: true })
      .toBuffer({ resolveWithObject: true });
  }

  return {
    buffer: result.data,
    width: result.info.width,
    height: result.info.height,
    quality,
    overlayApplied: isLicensedFallback,
  };
}

async function optimizeOne({ item, chainLabel, provenance, publicDir, existing }) {
  const filePath = resolveCatalogImage(item.image, publicDir);
  if (!statSync(filePath, { throwIfNoEntry: false })?.isFile()) {
    throw new Error(`Catalog image is missing: ${item.image}`);
  }
  if (path.basename(filePath).toLowerCase() === 'placeholder.webp') {
    throw new Error(`Catalog must not optimize placeholder.webp: ${item.id}`);
  }

  const currentBuffer = readFileSync(filePath);
  const currentSha256 = sha256(currentBuffer);
  const reusableInputSha = existing?.output?.sha256 === currentSha256
    ? existing.input?.sha256
    : currentSha256;
  const transformKey = createTransformKey(item, chainLabel, provenance, reusableInputSha);

  if (
    existing?.transformVersion === TRANSFORM_VERSION
    && existing.transformKey === transformKey
    && existing.output?.sha256 === currentSha256
    && existing.output.width <= TRANSFORM_CONFIG.maximumWidth
    && existing.output.height <= TRANSFORM_CONFIG.maximumHeight
  ) {
    return {
      status: 'skipped',
      bytesBefore: currentBuffer.length,
      bytesAfter: currentBuffer.length,
      record: existing,
    };
  }

  const inputMetadata = await sharp(currentBuffer).metadata();
  const encoded = await encodeImage(currentBuffer, item, chainLabel, provenance);
  const outputSha256 = sha256(encoded.buffer);
  writeFileSync(filePath, encoded.buffer);

  return {
    status: 'processed',
    bytesBefore: currentBuffer.length,
    bytesAfter: encoded.buffer.length,
    record: {
      transformVersion: TRANSFORM_VERSION,
      transformKey,
      imagePath: item.image,
      input: {
        sha256: currentSha256,
        width: inputMetadata.autoOrient?.width ?? inputMetadata.width ?? null,
        height: inputMetadata.autoOrient?.height ?? inputMetadata.height ?? null,
        sizeBytes: currentBuffer.length,
        sourceUrl: provenance.sourceUrl,
        sourceKind: provenance.sourceKind,
        exactProduct: provenance.exactProduct,
      },
      transform: {
        quality: encoded.quality,
        overlayApplied: encoded.overlayApplied,
        productLabel: encoded.overlayApplied ? item.name : null,
        chainLabel: encoded.overlayApplied ? chainLabel : null,
      },
      output: {
        sha256: outputSha256,
        width: encoded.width,
        height: encoded.height,
        sizeBytes: encoded.buffer.length,
        format: 'webp',
      },
    },
  };
}

export async function optimizeCatalogImages({
  items,
  chains,
  provenanceManifest,
  publicDir = DEFAULT_PUBLIC_DIR,
  manifestPath = DEFAULT_MANIFEST_PATH,
  concurrency = 8,
}) {
  const uniqueImagePaths = new Set(items.map(item => item.image));
  if (uniqueImagePaths.size !== items.length) {
    throw new Error('Each catalog product must have its own image path before product-specific overlays are generated.');
  }
  const chainNames = new Map(chains.map(chain => [chain.id, chain.name]));
  const existingManifest = loadExistingManifest(manifestPath);
  const manifest = {
    schemaVersion: 1,
    transformVersion: TRANSFORM_VERSION,
    config: TRANSFORM_CONFIG,
    sourceProvenanceManifest: 'scripts/catalog_sources/image-provenance.json',
    records: {},
  };
  const summary = {
    totalProducts: items.length,
    processed: 0,
    skipped: 0,
    officialExact: 0,
    licensedFallback: 0,
    overlaysApplied: 0,
    bytesBefore: 0,
    bytesAfter: 0,
    savedBytes: 0,
    savedPercent: 0,
  };

  const sortedItems = [...items].sort((left, right) => compareText(left.id, right.id));
  for (let offset = 0; offset < sortedItems.length; offset += concurrency) {
    const batch = sortedItems.slice(offset, offset + concurrency);
    const results = await Promise.all(batch.map(async item => {
      const provenance = provenanceManifest.records?.[item.id];
      if (!provenance) throw new Error(`Missing image provenance record: ${item.id}`);
      const chainLabel = chainNames.get(item.chainId);
      if (!chainLabel) throw new Error(`Unknown chain for ${item.id}: ${item.chainId}`);
      return {
        item,
        provenance,
        result: await optimizeOne({
          item,
          chainLabel,
          provenance,
          publicDir,
          existing: existingManifest.records?.[item.id],
        }),
      };
    }));

    for (const { item, provenance, result } of results) {
      manifest.records[item.id] = result.record;
      summary[result.status]++;
      summary.bytesBefore += result.bytesBefore;
      summary.bytesAfter += result.bytesAfter;
      if (provenance.sourceKind === 'licensed_fallback') summary.licensedFallback++;
      else summary.officialExact++;
      if (result.record.transform.overlayApplied) summary.overlaysApplied++;
    }
  }

  // Write once after the complete transform. Rewriting the same large JSON
  // file after every small batch caused intermittent Windows file-lock errors
  // (antivirus/indexer races) and could leave a valid but partial manifest.
  writeManifest(manifestPath, manifest);

  summary.savedBytes = summary.bytesBefore - summary.bytesAfter;
  summary.savedPercent = summary.bytesBefore === 0
    ? 0
    : Math.round((summary.savedBytes / summary.bytesBefore) * 1000) / 10;
  return { summary, manifest };
}

async function main() {
  sharp.cache(false);
  const { MENU_ITEMS } = await import('../src/data/items.ts');
  const { CHAINS } = await import('../src/data/chains.ts');
  const provenanceManifest = JSON.parse(readFileSync(DEFAULT_PROVENANCE_PATH, 'utf8'));
  const result = await optimizeCatalogImages({
    items: MENU_ITEMS,
    chains: CHAINS,
    provenanceManifest,
  });
  console.log(JSON.stringify(result.summary, null, 2));
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : null;
if (invokedPath === fileURLToPath(import.meta.url)) {
  await main();
}
