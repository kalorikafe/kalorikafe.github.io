#!/usr/bin/env node
/**
 * Compare a fetched catalog candidate with an approved normalized snapshot.
 *
 * This command is intentionally read-only with respect to catalog sources. It
 * can write a report artifact, but it never promotes a candidate or removes a
 * product. A missing product becomes `unknown` after one consecutive miss and
 * `retired` only after the second; both states remain in the proposal for
 * explicit review.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const VALID_LIFECYCLES = new Set(['current', 'seasonal', 'retired', 'unknown']);
const DEFAULT_BASELINE = path.join(ROOT, 'scripts', 'catalog_sources', 'caffe_nero.json');
const DEFAULT_CANDIDATE = path.join(ROOT, 'tmp', 'catalog_drift', 'caffe_nero-candidate.json');

function normalizeIdentity(value = '') {
  return value
    .normalize('NFKC')
    .toLocaleLowerCase('tr-TR')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

function productList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.products)) return payload.products;
  if (Array.isArray(payload?.items)) return payload.items;
  throw new TypeError('Catalog snapshot must be an array or contain products/items');
}

function lifecycleOf(product) {
  if (product.lifecycle != null && !VALID_LIFECYCLES.has(product.lifecycle)) {
    throw new TypeError(`Unknown lifecycle ${JSON.stringify(product.lifecycle)} for ${product.name || 'unnamed product'}`);
  }
  if (VALID_LIFECYCLES.has(product.lifecycle)) return product.lifecycle;
  if (product.seasonal || product.availability === 'seasonal') return 'seasonal';
  if (product.availability === 'retired') return 'retired';
  return 'current';
}

function identityKeys(product) {
  return [...new Set([product.name, product.sourceName, ...(product.aliases || [])]
    .filter(Boolean)
    .map(normalizeIdentity)
    .filter(Boolean))];
}

function duplicateNames(products) {
  const groups = new Map();
  for (const product of products) {
    const key = normalizeIdentity(product.name);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(product.name);
  }
  return [...groups.entries()]
    .filter(([, names]) => names.length > 1)
    .map(([key, names]) => ({ key, names }));
}

function readMissCount(state, key) {
  const entry = state?.misses?.[key];
  if (Number.isInteger(entry)) return Math.max(0, entry);
  if (Number.isInteger(entry?.count)) return Math.max(0, entry.count);
  return 0;
}

const SEMANTIC_FIELDS = [
  'category', 'productKind', 'isDrink', 'description', 'imageUrl', 'seasonal',
  'defaultSizeId', 'defaultMilkId', 'defaultSyrupPumps', 'baseMacros',
  'allergens', 'sourceAllergens', 'officialNutritionFields', 'derivedNutritionFields',
  'containsLactose', 'crossContactRisks',
];
const SET_FIELDS = new Set([
  'allergens', 'sourceAllergens', 'officialNutritionFields',
  'derivedNutritionFields', 'crossContactRisks',
]);

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map(key => [key, stableValue(value[key])]));
}

function changedFields(before, after) {
  return SEMANTIC_FIELDS.filter(field => {
    const normalize = value => SET_FIELDS.has(field) && Array.isArray(value)
      ? [...value].sort((left, right) => String(left).localeCompare(String(right), 'tr'))
      : value;
    return JSON.stringify(stableValue(normalize(before[field])))
      !== JSON.stringify(stableValue(normalize(after[field])));
  });
}

function buildBaselineIndex(products) {
  const index = new Map();
  const ambiguousKeys = new Set();
  products.forEach((product, productIndex) => {
    for (const key of identityKeys(product)) {
      if (index.has(key) && index.get(key) !== productIndex) ambiguousKeys.add(key);
      else index.set(key, productIndex);
    }
  });
  return { index, ambiguousKeys };
}

export function semanticCatalogDiff({
  baseline,
  candidate,
  state = { misses: {} },
  checkedAt = new Date().toISOString().slice(0, 10),
  maxDropRate = 0.20,
  chainId,
}) {
  const baselineProducts = productList(baseline);
  const candidateProducts = productList(candidate);
  const resolvedChainId = chainId || candidate?.chainId || baseline?.chainId || null;
  const duplicates = duplicateNames(candidateProducts);
  const { index: baselineIndex, ambiguousKeys } = buildBaselineIndex(baselineProducts);
  const matchedBaseline = new Set();
  const matched = [];
  const added = [];
  const proposals = [];
  const candidateCollisions = [];

  for (const product of candidateProducts) {
    const matches = [...new Set(identityKeys(product)
      .filter(key => !ambiguousKeys.has(key) && baselineIndex.has(key))
      .map(key => baselineIndex.get(key)))];
    if (matches.length > 1) {
      candidateCollisions.push({ name: product.name, baselineNames: matches.map(i => baselineProducts[i].name) });
      proposals.push({ ...product, lifecycle: 'unknown' });
      continue;
    }
    if (matches.length === 0) {
      const lifecycle = lifecycleOf(product);
      added.push({ name: product.name, lifecycle });
      proposals.push({ ...product, lifecycle });
      continue;
    }
    const baselineIndexValue = matches[0];
    if (matchedBaseline.has(baselineIndexValue)) {
      candidateCollisions.push({ name: product.name, baselineNames: [baselineProducts[baselineIndexValue].name] });
      proposals.push({ ...product, lifecycle: 'unknown' });
      continue;
    }
    matchedBaseline.add(baselineIndexValue);
    const before = baselineProducts[baselineIndexValue];
    const fields = changedFields(before, product);
    if (fields.length) matched.push({ name: product.name, previousName: before.name, changedFields: fields });
    proposals.push({ ...product, lifecycle: lifecycleOf(product) });
  }

  const nextMisses = {};
  const missing = [];
  baselineProducts.forEach((product, productIndex) => {
    if (matchedBaseline.has(productIndex)) return;
    const key = normalizeIdentity(product.name);
    const previousMisses = readMissCount(state, key);
    const consecutiveMisses = previousMisses + 1;
    const previousLifecycle = lifecycleOf(product);
    const lifecycle = previousLifecycle === 'retired'
      ? 'retired'
      : consecutiveMisses >= 2 ? 'retired' : 'unknown';
    nextMisses[key] = { count: consecutiveMisses, lastMissAt: checkedAt };
    missing.push({
      name: product.name,
      previousMisses,
      consecutiveMisses,
      lifecycle,
      action: 'retain_for_review',
    });
    proposals.push({ ...product, lifecycle });
  });

  const activeBaselineCount = baselineProducts.filter(product => lifecycleOf(product) !== 'retired').length;
  const uniqueCandidateCount = candidateProducts.length - duplicates.reduce((sum, group) => sum + group.names.length - 1, 0);
  const dropRate = activeBaselineCount === 0
    ? 0
    : Math.max(0, (activeBaselineCount - uniqueCandidateCount) / activeBaselineCount);
  const blockingIssues = [];
  if (duplicates.length) blockingIssues.push('duplicate_names');
  if (ambiguousKeys.size || candidateCollisions.length) blockingIssues.push('ambiguous_identity');
  if (dropRate > maxDropRate) blockingIssues.push('sudden_drop');

  return {
    schemaVersion: 1,
    chainId: resolvedChainId,
    checkedAt,
    thresholds: { maxDropRate },
    counts: {
      baseline: baselineProducts.length,
      baselineActive: activeBaselineCount,
      candidate: candidateProducts.length,
      candidateUnique: uniqueCandidateCount,
      unchanged: matchedBaseline.size - matched.length,
      changed: matched.length,
      added: added.length,
      missing: missing.length,
      proposed: proposals.length,
    },
    dropRate,
    duplicates,
    ambiguousBaselineKeys: [...ambiguousKeys].sort(),
    candidateCollisions,
    changed: matched,
    added,
    missing,
    blockingIssues,
    requiresReview: Boolean(blockingIssues.length || matched.length || added.length || missing.length),
    noAutomaticDeletion: proposals.length >= baselineProducts.length,
    proposedProducts: proposals,
    nextState: {
      schemaVersion: 1,
      chainId: resolvedChainId,
      checkedAt,
      misses: nextMisses,
    },
  };
}

function parseArgs(argv) {
  const options = {
    baseline: DEFAULT_BASELINE,
    candidate: DEFAULT_CANDIDATE,
    state: null,
    report: null,
    checkedAt: new Date().toISOString().slice(0, 10),
    maxDropRate: 0.20,
    allowCritical: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const value = argv[i + 1];
    if (arg === '--baseline') { options.baseline = path.resolve(value); i += 1; }
    else if (arg === '--candidate') { options.candidate = path.resolve(value); i += 1; }
    else if (arg === '--state') { options.state = path.resolve(value); i += 1; }
    else if (arg === '--report') { options.report = path.resolve(value); i += 1; }
    else if (arg === '--checked-at') { options.checkedAt = value; i += 1; }
    else if (arg === '--max-drop') { options.maxDropRate = Number(value); i += 1; }
    else if (arg === '--allow-critical') options.allowCritical = true;
    else throw new Error(`Unknown or incomplete argument: ${arg}`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(options.checkedAt)) throw new Error('--checked-at must be YYYY-MM-DD');
  if (!(options.maxDropRate >= 0 && options.maxDropRate < 1)) throw new Error('--max-drop must be in [0, 1)');
  return options;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function isDirectRun() {
  return process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
}

if (isDirectRun()) {
  const options = parseArgs(process.argv.slice(2));
  const report = semanticCatalogDiff({
    baseline: readJson(options.baseline),
    candidate: readJson(options.candidate),
    state: options.state && fs.existsSync(options.state) ? readJson(options.state) : { misses: {} },
    checkedAt: options.checkedAt,
    maxDropRate: options.maxDropRate,
  });
  if (options.report) {
    fs.mkdirSync(path.dirname(options.report), { recursive: true });
    fs.writeFileSync(options.report, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  }
  const summary = {
    chainId: report.chainId,
    counts: report.counts,
    dropRate: report.dropRate,
    blockingIssues: report.blockingIssues,
    requiresReview: report.requiresReview,
    report: options.report ? path.relative(ROOT, options.report) : null,
  };
  console.log(JSON.stringify(summary, null, 2));
  if (report.blockingIssues.length && !options.allowCritical) process.exitCode = 2;
}
