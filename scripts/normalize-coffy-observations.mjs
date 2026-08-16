import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const CATEGORY_ORDER = [
  'espresso_hot',
  'espresso_iced',
  'cold_brew',
  'frappe_blended',
  'tea_herbal',
  'smoothie_juice',
  'bakery_dessert',
  'sandwich_savory',
  'fit_healthy',
];

const ALLOWED_SOURCE_KINDS = new Set(['official', 'secondary']);

const EXCLUDED_SOURCE_CATEGORIES = [
  /men[uü]ler/i,
  /kupa|termos|aksesuar|merchandise/i,
  /[cç]ekirdek kahve/i,
  /di[gğ]er s[ıi]cak.*so[gğ]uk [iİ]çecekler/i,
  /^içecekler$/i,
  /^poşet$/i,
];

const EXCLUDED_PRODUCT_PATTERNS = [
  /\bmen[uü](s[uü])?\b/i,
  /\b(kupa|termos|bez [cç]anta|aksesuar|merchandise)\b/i,
  /\b(kaps[uü]l kahve|[cç]ekirdek kahve)\b/i,
  /\b(250\s*gr|paket kahve)\b/i,
  /\b(b[uü]t[uü]n pasta|b[uü]t[uü]n cheesecake|whole cake)\b/i,
];

const BASIC_BOTTLED_DRINK_PATTERNS = [
  /^(su|soda)(\s*\([^)]*\))?$/i,
  /^(schweppes|coca[ -]?cola|fanta|sprite|ayran)\b/i,
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function asNonEmptyString(value, field) {
  assert(typeof value === 'string' && value.trim(), `${field} must be a non-empty string`);
  return value.trim().normalize('NFC');
}

export function normalizeName(value) {
  return asNonEmptyString(value, 'name')
    .replace(/[’‘`]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function nameKey(value) {
  return normalizeName(value)
    .toLocaleLowerCase('tr-TR')
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .replace(/ı/g, 'i')
    .replace(/&/g, ' ve ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function createAliasResolver(aliases = []) {
  const aliasMap = new Map();

  for (const [index, alias] of aliases.entries()) {
    const observedName = normalizeName(alias?.observedName);
    const canonicalName = normalizeName(alias?.canonicalName);
    const observedKey = nameKey(observedName);
    const existing = aliasMap.get(observedKey);
    assert(
      existing === undefined || nameKey(existing) === nameKey(canonicalName),
      `aliases[${index}] conflicts with another alias for ${observedName}`,
    );
    aliasMap.set(observedKey, canonicalName);
  }

  return (value) => {
    let resolved = normalizeName(value);
    const visited = new Set();

    while (aliasMap.has(nameKey(resolved))) {
      const key = nameKey(resolved);
      assert(!visited.has(key), `Alias cycle detected at ${resolved}`);
      visited.add(key);
      resolved = aliasMap.get(key);
    }

    return resolved;
  };
}

export function shouldExcludeObservation(observation) {
  const name = normalizeName(observation.name);
  const sourceCategory = asNonEmptyString(observation.sourceCategory, 'sourceCategory');

  if (EXCLUDED_SOURCE_CATEGORIES.some((pattern) => pattern.test(sourceCategory))) return true;
  if (EXCLUDED_PRODUCT_PATTERNS.some((pattern) => pattern.test(name))) return true;
  return BASIC_BOTTLED_DRINK_PATTERNS.some((pattern) => pattern.test(name));
}

export function mapCategory(sourceCategoryValue, productNameValue) {
  const sourceCategory = asNonEmptyString(sourceCategoryValue, 'sourceCategory');
  const productName = normalizeName(productNameValue);
  const sourceKey = nameKey(sourceCategory);
  const productKey = nameKey(productName);

  if (sourceKey.includes('sandvic')) return 'sandwich_savory';
  if (/kahvaltilik|kruvasan|tatli/.test(sourceKey)) return 'bakery_dessert';
  if (sourceKey.includes('atistirmalik')) {
    return /brownie|cookie|kek|muffin/.test(productKey) ? 'bakery_dessert' : 'fit_healthy';
  }

  if (productKey.includes('iced cherry brownie latte')) return 'espresso_iced';
  if (/frappe|milkshake|coffychino/.test(productKey)) return 'frappe_blended';
  if (/freshaa|frozen|cool lime|lemonade/.test(productKey)) return 'smoothie_juice';
  if (/matcha|hibiskus|hibiscus|earl grey/.test(productKey)) return 'tea_herbal';

  if (sourceKey.includes('soguk kahve')) return 'espresso_iced';
  if (sourceKey.includes('sicak kahve')) return 'espresso_hot';
  if (sourceKey.includes('sicak icecek')) return 'tea_herbal';
  if (sourceKey.includes('soguk icecek')) return 'smoothie_juice';
  if (sourceKey.includes('donemsel')) {
    if (productKey.includes('iced') && productKey.includes('latte')) return 'espresso_iced';
    return 'smoothie_juice';
  }

  throw new Error(`No category mapping for ${sourceCategory} / ${productName}`);
}

function sortStrings(values) {
  return [...values].sort((left, right) => left.localeCompare(right, 'tr'));
}

function validateRaw(raw) {
  assert(raw && typeof raw === 'object' && !Array.isArray(raw), 'raw snapshot must be an object');
  assert(raw.schemaVersion === 1, 'raw schemaVersion must be 1');
  asNonEmptyString(raw.chainId, 'chainId');
  asNonEmptyString(raw.chainName, 'chainName');
  assert(/^\d{4}-\d{2}-\d{2}$/.test(raw.observedAt), 'observedAt must use YYYY-MM-DD');
  assert(Array.isArray(raw.branches) && raw.branches.length > 0, 'branches must be non-empty');
  assert(Array.isArray(raw.observations), 'observations must be an array');
  assert(Array.isArray(raw.existingCatalog), 'existingCatalog must be an array');
}

export function normalizeCoffyObservations(raw, thresholds = {}) {
  validateRaw(raw);

  const minimumBranches = Math.max(3, thresholds.minimumBranches ?? 3);
  const minimumCities = Math.max(2, thresholds.minimumCities ?? 2);
  const resolveAlias = createAliasResolver(raw.aliases);
  const branchesById = new Map();

  const branches = raw.branches.map((branch, index) => {
    const id = asNonEmptyString(branch?.id, `branches[${index}].id`);
    assert(!branchesById.has(id), `Duplicate branch id: ${id}`);
    const sourceKind = asNonEmptyString(branch?.sourceKind, `branches[${index}].sourceKind`);
    assert(ALLOWED_SOURCE_KINDS.has(sourceKind), `Unsupported sourceKind: ${sourceKind}`);

    const normalized = {
      id,
      name: asNonEmptyString(branch.name, `branches[${index}].name`),
      city: asNonEmptyString(branch.city, `branches[${index}].city`),
      address: asNonEmptyString(branch.address, `branches[${index}].address`),
      sourceUrl: asNonEmptyString(branch.sourceUrl, `branches[${index}].sourceUrl`),
      sourceKind,
      platform: asNonEmptyString(branch.platform, `branches[${index}].platform`),
      officialDirectoryName: asNonEmptyString(
        branch.officialDirectoryName,
        `branches[${index}].officialDirectoryName`,
      ),
    };

    assert(/^https:\/\//.test(normalized.sourceUrl), `Branch sourceUrl must be HTTPS: ${id}`);
    branchesById.set(id, normalized);
    return normalized;
  });

  const aggregate = new Map();
  let excludedObservationCount = 0;
  let excludedBranchClaimCount = 0;

  for (const [index, observation] of raw.observations.entries()) {
    assert(observation && typeof observation === 'object', `observations[${index}] must be an object`);
    const observedName = normalizeName(observation.name);
    const branchIds = [...new Set(observation.branchIds ?? [])];
    assert(branchIds.length > 0, `observations[${index}].branchIds must be non-empty`);
    for (const branchId of branchIds) {
      assert(branchesById.has(branchId), `Unknown branch id ${branchId} in ${observedName}`);
    }

    if (shouldExcludeObservation(observation)) {
      excludedObservationCount += 1;
      excludedBranchClaimCount += branchIds.length;
      continue;
    }

    const canonicalName = resolveAlias(observedName);
    const key = nameKey(canonicalName);
    const category = mapCategory(observation.sourceCategory, canonicalName);
    const existing = aggregate.get(key) ?? {
      name: canonicalName,
      normalizedKey: key,
      category,
      observedVariants: new Set(),
      descriptions: new Set(),
      branchIds: new Set(),
      sourceCategories: new Set(),
    };

    assert(existing.category === category, `Category conflict for ${canonicalName}`);
    existing.observedVariants.add(observedName);
    existing.sourceCategories.add(normalizeName(observation.sourceCategory));
    if (observation.description) {
      existing.descriptions.add(asNonEmptyString(observation.description, `observations[${index}].description`));
    }
    for (const branchId of branchIds) existing.branchIds.add(branchId);
    aggregate.set(key, existing);
  }

  const products = [...aggregate.values()].map((entry) => {
    const productBranches = branches.filter((branch) => entry.branchIds.has(branch.id));
    const cities = sortStrings(new Set(productBranches.map((branch) => branch.city)));
    const branchCount = productBranches.length;
    const cityCount = cities.length;

    return {
      name: entry.name,
      normalizedKey: entry.normalizedKey,
      observedVariants: sortStrings(entry.observedVariants),
      category: entry.category,
      sourceCategories: sortStrings(entry.sourceCategories),
      ...(entry.descriptions.size > 0 ? { descriptions: sortStrings(entry.descriptions) } : {}),
      observedAt: raw.observedAt,
      sourceKind: productBranches.some((branch) => branch.sourceKind === 'secondary')
        ? 'secondary'
        : 'official',
      sourceUrls: productBranches.map((branch) => branch.sourceUrl),
      branches: productBranches.map(({ id, name, city }) => ({ id, name, city })),
      cities,
      branchCount,
      cityCount,
      availabilityScope:
        branchCount >= minimumBranches && cityCount >= minimumCities
          ? 'chain_core'
          : 'branch_observed',
    };
  });

  products.sort((left, right) => {
    const categoryDifference = CATEGORY_ORDER.indexOf(left.category) - CATEGORY_ORDER.indexOf(right.category);
    return categoryDifference || left.name.localeCompare(right.name, 'tr');
  });

  const productsByKey = new Map(products.map((product) => [product.normalizedKey, product]));
  const catalogById = new Map();
  const catalogByCanonicalKey = new Map();

  for (const [index, item] of raw.existingCatalog.entries()) {
    const id = asNonEmptyString(item?.id, `existingCatalog[${index}].id`);
    const name = normalizeName(item?.name);
    assert(!catalogById.has(id), `Duplicate existing catalog id: ${id}`);
    const normalized = { id, name };
    catalogById.set(id, normalized);
    const canonicalKey = nameKey(resolveAlias(name));
    assert(!catalogByCanonicalKey.has(canonicalKey), `Duplicate canonical catalog name: ${name}`);
    catalogByCanonicalKey.set(canonicalKey, normalized);
  }

  const reconciliationByProductKey = new Map();
  for (const product of products) {
    const catalogItem = catalogByCanonicalKey.get(product.normalizedKey);
    if (!catalogItem) continue;
    const observedKeys = new Set(product.observedVariants.map(nameKey));
    const matchKind = observedKeys.has(nameKey(catalogItem.name)) ? 'normalized_exact' : 'explicit_alias';
    reconciliationByProductKey.set(product.normalizedKey, {
      productName: product.name,
      observedVariants: product.observedVariants,
      category: product.category,
      catalogId: catalogItem.id,
      catalogName: catalogItem.name,
      matchKind,
      availabilityScope: product.availabilityScope,
      rationale:
        matchKind === 'normalized_exact'
          ? 'Ad, Türkçe karakter/noktalama normalizasyonundan sonra mevcut katalog adıyla eşleşiyor.'
          : 'Kaynak ad varyantı, snapshot içindeki açık alias kuralıyla mevcut katalog adına bağlandı.',
    });
  }

  for (const [index, manual] of (raw.manualReconcile ?? []).entries()) {
    const observedName = resolveAlias(manual?.observedName);
    const productKey = nameKey(observedName);
    const product = productsByKey.get(productKey);
    const catalogItem = catalogById.get(manual?.catalogId);
    assert(product, `manualReconcile[${index}] product not found: ${manual?.observedName}`);
    assert(catalogItem, `manualReconcile[${index}] catalog id not found: ${manual?.catalogId}`);
    assert(!reconciliationByProductKey.has(productKey), `manualReconcile duplicates an automatic match: ${observedName}`);
    reconciliationByProductKey.set(productKey, {
      productName: product.name,
      observedVariants: product.observedVariants,
      category: product.category,
      catalogId: catalogItem.id,
      catalogName: catalogItem.name,
      matchKind: 'manual_review',
      availabilityScope: product.availabilityScope,
      rationale: asNonEmptyString(manual.reason, `manualReconcile[${index}].reason`),
    });
  }

  const reconcileCandidates = products
    .filter((product) => reconciliationByProductKey.has(product.normalizedKey))
    .map((product) => reconciliationByProductKey.get(product.normalizedKey));

  const additionCandidates = products
    .filter((product) => !reconciliationByProductKey.has(product.normalizedKey))
    .map((product) => ({
      name: product.name,
      normalizedKey: product.normalizedKey,
      category: product.category,
      availabilityScope: product.availabilityScope,
      branchCount: product.branchCount,
      cityCount: product.cityCount,
      catalogImportStatus: 'blocked_pending_nutrition_and_image_research',
    }));

  const reconciledCatalogIds = new Set(reconcileCandidates.map((candidate) => candidate.catalogId));
  const unobservedCatalogItems = [...catalogById.values()].filter(
    (catalogItem) => !reconciledCatalogIds.has(catalogItem.id),
  );

  const eligibleItemCountByBranch = Object.fromEntries(
    branches.map((branch) => [
      branch.id,
      products.filter((product) => product.branches.some((item) => item.id === branch.id)).length,
    ]),
  );

  const categoryCounts = Object.fromEntries(
    CATEGORY_ORDER
      .map((category) => [category, products.filter((product) => product.category === category).length])
      .filter(([, count]) => count > 0),
  );

  const cities = sortStrings(new Set(branches.map((branch) => branch.city)));
  const chainCoreCount = products.filter((product) => product.availabilityScope === 'chain_core').length;

  return {
    schemaVersion: 1,
    chainId: raw.chainId,
    chainName: raw.chainName,
    observedAt: raw.observedAt,
    generatedBy: 'scripts/normalize-coffy-observations.mjs',
    methodology: {
      coverageMode: 'controlled_multi_branch_snapshot',
      completeness: 'section-complete for the recorded branch claims; not a nationwide inventory',
      chainCoreRule: `At least ${minimumBranches} observed branches across at least ${minimumCities} cities`,
      normalization: 'NFC, Turkish-aware case folding, punctuation folding, and explicit reviewed aliases',
      prohibitedFields: ['price', 'image', 'calories', 'macros'],
      exclusionRules: [
        'combos and menus',
        'merchandise and accessories',
        'capsules and packaged/bean coffee',
        'basic bottled drinks',
        'whole cakes',
      ],
    },
    sourceAttribution: {
      officialSources: raw.officialSources ?? [],
      productSourceKind: 'secondary',
      productSurface: 'Yemeksepeti, explicitly named by Coffy as an ordering channel',
    },
    coverage: {
      branchCount: branches.length,
      cityCount: cities.length,
      cities,
      branches: branches.map((branch) => ({
        ...branch,
        observedAt: raw.observedAt,
        observedEligibleItemCount: eligibleItemCountByBranch[branch.id],
      })),
      blockers: raw.blockers ?? [],
      limitations: raw.limitations ?? [],
    },
    counts: {
      productCount: products.length,
      chainCoreCount,
      branchObservedCount: products.length - chainCoreCount,
      reconcileCandidateCount: reconcileCandidates.length,
      additionCandidateCount: additionCandidates.length,
      unobservedExistingCatalogCount: unobservedCatalogItems.length,
      excludedObservationCount,
      excludedBranchClaimCount,
      categoryCounts,
    },
    products,
    reconcileCandidates,
    additionCandidates,
    unobservedCatalogItems,
  };
}

export async function generateSnapshot(inputPath, outputPath) {
  const raw = JSON.parse(await readFile(inputPath, 'utf8'));
  const snapshot = normalizeCoffyObservations(raw);
  await writeFile(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
  return snapshot;
}

const currentFile = fileURLToPath(import.meta.url);
const invokedFile = process.argv[1] ? path.resolve(process.argv[1]) : '';

if (currentFile === invokedFile) {
  const root = path.resolve(path.dirname(currentFile), '..');
  const inputPath = path.resolve(
    process.argv[2] ?? path.join(root, 'scripts', 'catalog_sources', 'coffy_observations.raw.json'),
  );
  const outputPath = path.resolve(
    process.argv[3] ?? path.join(root, 'scripts', 'catalog_sources', 'coffy_observations.json'),
  );
  const snapshot = await generateSnapshot(inputPath, outputPath);
  console.log(
    `Coffy snapshot: ${snapshot.counts.productCount} products, ` +
      `${snapshot.counts.chainCoreCount} chain_core, ` +
      `${snapshot.counts.reconcileCandidateCount} reconcile, ` +
      `${snapshot.counts.additionCandidateCount} additions.`,
  );
}
