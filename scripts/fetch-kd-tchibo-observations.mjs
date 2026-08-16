import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const API_ORIGIN = 'https://tr.fd-api.com';
const API_QUERY =
  'include=menus,bundles,multiple_discounts&language_id=2&opening_type=delivery&basket_currency=TRY';
const PERSEUS_CLIENT_ID = randomUUID();
const PERSEUS_SESSION_ID = randomUUID();

export const CATEGORY_ORDER = [
  'espresso_hot',
  'espresso_iced',
  'frappe_blended',
  'tea_herbal',
  'smoothie_juice',
  'bakery_dessert',
  'sandwich_savory',
  'fit_healthy',
];

export const CHAIN_CONFIGS = {
  kahve_dunyasi: {
    chainId: 'kahve_dunyasi',
    chainName: 'Kahve Dünyası',
    catalogPath: path.join(ROOT, 'src', 'data', 'catalog', 'kahve_dunyasi.ts'),
    outputName: 'kahve_dunyasi_observations.json',
    officialSources: [
      {
        url: 'https://www.kahvedunyasi.com/',
        sourceTier: 'tier_1_brand_official',
        role: 'Official chain identity and current brand site.',
      },
      {
        url: 'https://www.kahvedunyasi.com/magazalar',
        sourceTier: 'tier_1_brand_official',
        role: 'Official store directory used to reconcile the sampled chain and cities.',
      },
    ],
    branches: [
      {
        id: 'istanbul-cevahir-avm',
        vendorCode: 'kpxi',
        name: 'Kahve Dünyası İstanbul Cevahir AVM',
        city: 'İstanbul',
      },
      {
        id: 'ankara-istanbul-yolu',
        vendorCode: 'krln',
        name: 'Kahve Dünyası Ankara İstanbul Yolu',
        city: 'Ankara',
      },
      {
        id: 'ankara-365-avm',
        vendorCode: 'a6wl',
        name: 'Kahve Dünyası Ankara 365 AVM',
        city: 'Ankara',
      },
      {
        id: 'izmir-eski-tekel',
        vendorCode: 'l217',
        name: 'Kahve Dünyası İzmir Eski Tekel',
        city: 'İzmir',
      },
      {
        id: 'bursa-kent-meydani-avm',
        vendorCode: 'nxc7',
        name: 'Kahve Dünyası Bursa Kent Meydanı AVM',
        city: 'Bursa',
      },
    ],
  },
  tchibo: {
    chainId: 'tchibo',
    chainName: 'Tchibo',
    catalogPath: path.join(ROOT, 'src', 'data', 'catalog', 'tchibo.ts'),
    outputName: 'tchibo_observations.json',
    officialSources: [
      {
        url: 'https://www.tchibo.com.tr/',
        sourceTier: 'tier_1_brand_official',
        role: 'Official chain identity and current brand site.',
      },
      {
        url: 'https://www.tchibo.com.tr/c/yardim-magazalar',
        sourceTier: 'tier_1_brand_official',
        role: 'Official store directory used to reconcile the sampled chain and cities.',
      },
    ],
    branches: [
      {
        id: 'istanbul-metropol-avm',
        vendorCode: 'xqik',
        name: 'Tchibo İstanbul Metropol AVM',
        city: 'İstanbul',
      },
      {
        id: 'istanbul-capitol-avm',
        vendorCode: 'szus',
        name: 'Tchibo İstanbul Capitol AVM',
        city: 'İstanbul',
      },
      {
        id: 'ankara-koru',
        vendorCode: 's7t0',
        name: 'Tchibo Ankara Koru',
        city: 'Ankara',
      },
      {
        id: 'ankara-atakule',
        vendorCode: 'zui8',
        name: 'Tchibo Ankara Atakule',
        city: 'Ankara',
      },
      {
        id: 'izmir-mavibahce-avm',
        vendorCode: 'ppnd',
        name: 'Tchibo İzmir Mavibahçe AVM',
        city: 'İzmir',
      },
    ],
  },
};

const EXPLICIT_CATALOG_ALIASES = {
  kahve_dunyasi: [
    ['Türk Kahvesi', 'Geleneksel Türk Kahvesi'],
    ['Buzlu Gofrik Latte', 'Gofrik Buzlu Latte'],
    ['Fındık Kremalı Buzlu Latte', 'Fındık Kremalı Soğuk Buzlu Latte'],
    ['Hindi Füme Baget Ekmek Sandviç', 'Hindi Füme Sandviç'],
    ['Hindi Füme Baget Sandviç', 'Hindi Füme Sandviç'],
    ['Mozzarella Pesto Soslu Baget Sandviç', 'Mozzarellalı Pesto Soslu Sandviç'],
    ['Mozzarella Pesto Soslu Sandviç', 'Mozzarellalı Pesto Soslu Sandviç'],
    ['Mozaik Pasta (Dilim)', 'Mozaik Pasta'],
    ['Limonlu Cheesecake (Dilim)', 'Limonlu Cheesecake'],
  ],
  tchibo: [
    ['Hot Chocolate', 'Sıcak Çikolata'],
    ['Latte', 'Caffè Latte'],
    ['Frambuazlı Cheesecake', 'Raspberry Cheesecake'],
    ['Limonlu Cheesecake', 'Lemon Cheesecake'],
    ['Hindi Fümeli & Cheddarlı Ciabatta Sandviç', 'Hindi Fümeli & Cheddarlı Ciabatta'],
  ],
};

const MANUAL_UNCERTAIN_RULES = {
  kahve_dunyasi: [
    {
      observedName: 'Gofrik Latte',
      catalogName: 'Gofrik Buzlu Latte',
      reason: 'The live name is a hot latte while the catalog item is explicitly iced; do not merge.',
    },
    {
      observedName: 'Double Türk Kahvesi',
      catalogName: 'Geleneksel Türk Kahvesi',
      reason: 'The source explicitly lists a double serving; the catalog name does not specify serving size.',
    },
    {
      observedName: 'Damla Sakızlı Double Türk Kahvesi',
      catalogName: 'Damla Sakızlı Türk Kahvesi',
      reason: 'The source explicitly lists a double serving; the catalog name does not specify serving size.',
    },
    {
      observedName: 'Hindi Fümeli Baget Ekmek Sandviç',
      catalogName: 'Hindi Füme Sandviç',
      reason: 'The live menu splits the sandwich by bread/recipe; the generic catalog item cannot be merged safely.',
    },
  ],
  tchibo: [
    {
      observedName: 'Double Espresso',
      catalogName: 'Espresso',
      reason: 'The source explicitly says double espresso; the catalog item does not specify shot count.',
    },
    {
      observedName: 'Iced Matcha Latte',
      catalogName: 'Matcha Latte',
      reason: 'Hot/unspecified and iced matcha are distinct serving forms; do not merge without recipe review.',
    },
  ],
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function stableStringSort(values) {
  return [...values].sort((left, right) => left.localeCompare(right, 'tr'));
}

export function normalizeName(value) {
  assert(typeof value === 'string' && value.trim(), 'Product name must be a non-empty string');
  return value
    .normalize('NFC')
    .replace(/[\u00a0\u2007\u202f]/g, ' ')
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

function apiUrl(vendorCode) {
  return `${API_ORIGIN}/api/v5/vendors/${vendorCode}?${API_QUERY}`;
}

function storefrontUrl(vendorCode, chainId) {
  const slug = chainId === 'kahve_dunyasi' ? 'kahve-dunyasi' : 'tchibo';
  return `https://www.yemeksepeti.com/restaurant/${vendorCode}/${slug}-${vendorCode}`;
}

function seasonalEvidence(sourceCategory, productName) {
  const categoryKey = nameKey(sourceCategory);
  const productKey = nameKey(productName);
  return (
    /\b(donemsel|sezon|seasonal|limited)\b/.test(categoryKey) ||
    /\b(winter|summer|seasonal|limited edition)\b/.test(productKey)
  );
}

const CATEGORY_EXCLUSIONS = [
  {
    pattern: /^(populer|kampanyalar|yemeksepeti ozel menu|yemeksepeti special menu)$/,
    reason: 'duplicate_or_combo_surface',
  },
  {
    pattern: /(butun pastalar|whole cakes)/,
    reason: 'whole_cake',
  },
  {
    pattern: /(donuk ekmek|donuk kruvasan|frozen bread|frozen croissant)/,
    reason: 'frozen_take_home',
  },
  {
    pattern: /(cekirdek kahve|ogutulmus kahve|cozunebilir kahve|paket kahve|kapsul kahve|coffee beans|ground coffee|instant coffee|coffee capsules|davidof|davifoff|davidoff)/,
    reason: 'beans_capsules_or_packaged_coffee',
  },
  {
    pattern: /(demleme ekipman|brewing equipment|aksesuar|merchandise)/,
    reason: 'equipment_or_merchandise',
  },
  {
    pattern: /(paket cikolata|paket urun|drajeler|atistirmaliklar|snacks)/,
    reason: 'packaged_retail',
  },
  {
    pattern: /(sise icecek|bottled drinks)/,
    reason: 'bottled_retail',
  },
  {
    pattern: /ozel serisi (soguk|sicak) kahve/,
    reason: 'packaged_retail',
  },
];

export function exclusionReasons(sourceCategoryValue, productNameValue, descriptionValue = '') {
  const sourceCategory = normalizeName(sourceCategoryValue);
  const productName = normalizeName(productNameValue);
  const sourceKey = nameKey(sourceCategory);
  const productKey = nameKey(productName);
  const descriptionKey = descriptionValue ? nameKey(descriptionValue) : '';
  const reasons = [];

  for (const rule of CATEGORY_EXCLUSIONS) {
    if (rule.pattern.test(sourceKey)) reasons.push(rule.reason);
  }

  if (/\b(menu|combo)\b/.test(productKey)) reasons.push('duplicate_or_combo_surface');
  if (/\b(tasima cantasi|alisveris cantasi|termos|mug|bardak|filtre kagidi)\b/.test(productKey)) {
    reasons.push('equipment_or_merchandise');
  }
  if (/\b(butun pasta|donuk pasta)\b/.test(productKey)) reasons.push('whole_cake');
  if (/\b(kapsul|cekirdek kahve|ogutulmus kahve|cozunebilir kahve)\b/.test(productKey)) {
    reasons.push('beans_capsules_or_packaged_coffee');
  }
  if (/\b(paketli urun|paket urun)\b/.test(productKey)) reasons.push('packaged_retail');
  if (/\b(paketli urun|paket urun)\b/.test(descriptionKey)) reasons.push('packaged_retail');
  if (/\b\d+(?:[.,]\d+)?\s*(?:gr|g|kg)\b/.test(productKey)) reasons.push('packaged_retail');
  if (/\b(aile seti)\b/.test(productKey)) reasons.push('duplicate_or_combo_surface');
  if (/^(su|soda|premium maden suyu|maden suyu)(\b|$)/.test(productKey)) {
    reasons.push('generic_bottled_drink');
  }
  if (/^(coca cola|fanta|sprite|ayran|uludag premium|oddly)\b/.test(productKey)) {
    reasons.push('generic_bottled_drink');
  }

  return stableStringSort(new Set(reasons));
}

function isSandwichName(productKey) {
  return /(sandvic|bagel|tost|ciabatta|focaccia|panini)/.test(productKey);
}

export function mapCategory(chainId, sourceCategoryValue, productNameValue) {
  const sourceKey = nameKey(sourceCategoryValue);
  const productKey = nameKey(productNameValue);

  if (/sandvic/.test(sourceKey) || isSandwichName(productKey)) return 'sandwich_savory';
  if (/fit urun/.test(sourceKey)) return 'fit_healthy';
  if (/kahvalti|breakfast/.test(sourceKey)) {
    if (isSandwichName(productKey)) return 'sandwich_savory';
    if (/(chia|poric|porridge|granola|musli)/.test(productKey)) return 'fit_healthy';
    return 'bakery_dessert';
  }
  if (/unlu mamul|tatli|dondurma|cheesecake|cookie|kek|glutensiz|vegan|dessert/.test(sourceKey)) {
    return 'bakery_dessert';
  }

  if (/sicak ve soguk cay|matcha ailesi|tea/.test(sourceKey)) return 'tea_herbal';
  if (/sicak cikolata|salep|sicak icecek/.test(sourceKey)) return 'tea_herbal';

  if (
    /(soguk|buzlu|iced)/.test(productKey) &&
    /(chai|matcha|tea|cay)/.test(productKey)
  ) {
    return 'tea_herbal';
  }
  if (
    /(soguk|buzlu|iced)/.test(productKey) &&
    /(americano|latte|mocha|macchiato|cold brew|kahve|espresso|gofrik)/.test(productKey)
  ) {
    return 'espresso_iced';
  }
  if (/ozel serisi soguk kahve|buzlu ve soguk kahve|cold brew/.test(sourceKey)) {
    return 'espresso_iced';
  }
  if (/ozel serisi sicak kahve|klasik kahve|espresso|filtre kahve|turk kahve|yoresel kahve|sicak kahve/.test(sourceKey)) {
    return 'espresso_hot';
  }

  if (/buzlu icecek/.test(sourceKey)) {
    if (/(chai|matcha|tea|cay)/.test(productKey)) return 'tea_herbal';
    return /(shake|frappe|milkshake|frozen)/.test(productKey)
      ? 'frappe_blended'
      : 'smoothie_juice';
  }

  if (/soguk icecek/.test(sourceKey)) {
    if (/(chai|matcha|tea|cay|salep)/.test(productKey)) return 'tea_herbal';
    if (/(milkshake|frozen|frappe|gofrix|shake)/.test(productKey)) return 'frappe_blended';
    if (/(limonata|lemonade|portakal suyu|meyve suyu|smoothie|breeze|cooler)/.test(productKey)) {
      return 'smoothie_juice';
    }
    if (/(americano|latte|mocha|macchiato|cold brew|kahve|espresso|gofrik)/.test(productKey)) {
      return 'espresso_iced';
    }
    return 'smoothie_juice';
  }

  if (chainId === 'tchibo' && /tchibo special/.test(sourceKey)) return 'espresso_hot';

  throw new Error(
    `No normalized category mapping for ${chainId}: ${sourceCategoryValue} / ${productNameValue}`,
  );
}

function parsePrice(product) {
  const variationPrices = (product?.product_variations ?? [])
    .map((variation) => Number(variation?.price))
    .filter((price) => Number.isFinite(price) && price >= 0);
  const rawDisplayPrice = product?.display_price;
  if (rawDisplayPrice !== null && rawDisplayPrice !== undefined && rawDisplayPrice !== '') {
    const displayPrice = Number(rawDisplayPrice);
    if (Number.isFinite(displayPrice) && displayPrice >= 0) variationPrices.push(displayPrice);
  }
  if (variationPrices.length === 0) return null;
  return Math.round(Math.min(...variationPrices) * 100) / 100;
}

function extractClaims(response, branch, chainId) {
  const data = response?.data ?? response;
  assert(data && typeof data === 'object', `Missing vendor data for ${branch.id}`);
  assert(Array.isArray(data.menus) && data.menus.length > 0, `Missing menus for ${branch.id}`);
  const claims = [];

  for (const menu of data.menus) {
    for (const category of menu?.menu_categories ?? []) {
      const sourceCategory = normalizeName(category.name);
      for (const product of category?.products ?? []) {
        const name = normalizeName(product.name);
        const description = typeof product.description === 'string' ? product.description : '';
        const reasons = exclusionReasons(sourceCategory, name, description);
        claims.push({
          branchId: branch.id,
          observedName: name,
          normalizedKey: nameKey(name),
          sourceCategory,
          price: parsePrice(product),
          exclusionReasons: reasons,
          seasonalEvidence: seasonalEvidence(sourceCategory, name),
          category: reasons.length === 0 ? mapCategory(chainId, sourceCategory, name) : null,
        });
      }
    }
  }

  return {
    data,
    claims,
  };
}

function categorySort(left, right) {
  const categoryDifference = CATEGORY_ORDER.indexOf(left.category) - CATEGORY_ORDER.indexOf(right.category);
  return categoryDifference || left.name.localeCompare(right.name, 'tr');
}

function pickCategory(eligibleClaims, productName) {
  const counts = new Map();
  for (const claim of eligibleClaims) counts.set(claim.category, (counts.get(claim.category) ?? 0) + 1);
  const ranked = [...counts.entries()].sort((left, right) => {
    const countDifference = right[1] - left[1];
    return countDifference || CATEGORY_ORDER.indexOf(left[0]) - CATEGORY_ORDER.indexOf(right[0]);
  });
  assert(ranked.length > 0, `No category votes for ${productName}`);
  return {
    category: ranked[0][0],
    evidence: ranked.map(([category, claimCount]) => ({ category, claimCount })),
  };
}

function branchClaim(branchId, claims, preferredCategory = null) {
  const candidates = claims.filter((claim) => claim.branchId === branchId);
  const eligible = candidates.filter((claim) => claim.exclusionReasons.length === 0);
  const preferred = preferredCategory
    ? eligible.filter((claim) => claim.category === preferredCategory)
    : eligible;
  const pool = preferred.length > 0 ? preferred : eligible.length > 0 ? eligible : candidates;
  if (pool.length === 0) return null;
  const prices = pool.map((claim) => claim.price).filter((price) => price !== null);
  return {
    price: prices.length > 0 ? Math.min(...prices) : null,
  };
}

function priceSummary(branchPrices) {
  const values = branchPrices.map((entry) => entry.amount).filter((value) => value !== null);
  if (values.length === 0) {
    return {
      currency: 'TRY',
      min: null,
      max: null,
      byBranch: branchPrices,
    };
  }
  return {
    currency: 'TRY',
    min: Math.min(...values),
    max: Math.max(...values),
    byBranch: branchPrices,
  };
}

export function extractCatalogItems(sourceText) {
  const items = [];
  const itemPattern = /\bid:\s*"([^"]+)"[\s\S]*?\bname:\s*"([^"]+)"/g;
  let match;
  while ((match = itemPattern.exec(sourceText))) {
    items.push({ id: match[1], name: normalizeName(match[2]) });
  }
  assert(items.length > 0, 'No catalog items parsed');
  return items;
}

function buildReconciliation(chainId, products, excludedProducts, existingCatalog) {
  const catalogByKey = new Map(existingCatalog.map((item) => [nameKey(item.name), item]));
  const catalogByName = new Map(existingCatalog.map((item) => [item.name, item]));
  const aliasByObservedKey = new Map(
    (EXPLICIT_CATALOG_ALIASES[chainId] ?? []).map(([observedName, catalogName]) => [
      nameKey(observedName),
      catalogName,
    ]),
  );
  const matchedCatalogIds = new Set();
  const exactCandidates = [];
  const renameCandidates = [];
  const additionCandidates = [];
  const uncertainCases = [];

  for (const product of products) {
    const exact = catalogByKey.get(product.normalizedKey);
    const aliasCatalogName = aliasByObservedKey.get(product.normalizedKey);
    const alias = aliasCatalogName ? catalogByName.get(aliasCatalogName) : null;
    const catalogItem = exact ?? alias;

    if (catalogItem) {
      matchedCatalogIds.add(catalogItem.id);
      if (product.status === 'core' && product.availabilityScope === 'chain_core') {
        const common = {
          catalogId: catalogItem.id,
          catalogName: catalogItem.name,
          observedName: product.name,
          category: product.category,
          branchCount: product.branchCount,
          branchPresenceRatio: product.branchPresenceRatio,
          nutrition: 'unknown',
          allergens: 'unknown',
        };
        if (exact) {
          exactCandidates.push({
            ...common,
            matchKind: 'normalized_exact',
            suggestedAction: 'keep_id_refresh_catalog_source_only_after_manual_review',
          });
        } else {
          renameCandidates.push({
            ...common,
            matchKind: 'reviewed_alias',
            suggestedName: product.name,
            suggestedAction: 'rename_only_after_manual_review',
          });
        }
      } else {
        uncertainCases.push({
          observedName: product.name,
          catalogId: catalogItem.id,
          catalogName: catalogItem.name,
          reason: `Catalog match exists, but live status is ${product.status} with ${product.branchCount} sampled branches.`,
          disposition: 'do_not_promote',
        });
      }
      continue;
    }

    if (product.status === 'core' && product.availabilityScope === 'chain_core') {
      additionCandidates.push({
        name: product.name,
        normalizedKey: product.normalizedKey,
        category: product.category,
        branchCount: product.branchCount,
        cityCount: product.cityCount,
        branchPresenceRatio: product.branchPresenceRatio,
        priceRange: { currency: 'TRY', min: product.price.min, max: product.price.max },
        nutrition: 'unknown',
        allergens: 'unknown',
        promotionStatus: 'blocked_pending_manual_nutrition_allergen_and_asset_research',
      });
    } else {
      uncertainCases.push({
        observedName: product.name,
        catalogId: null,
        catalogName: null,
        reason: `Unmatched live product is ${product.status} and appears in ${product.branchCount} of the sampled branches.`,
        disposition: 'do_not_promote',
      });
    }
  }

  const productByKey = new Map(products.map((product) => [product.normalizedKey, product]));
  for (const rule of MANUAL_UNCERTAIN_RULES[chainId] ?? []) {
    const product = productByKey.get(nameKey(rule.observedName));
    const catalogItem = catalogByName.get(rule.catalogName);
    if (!product || !catalogItem) continue;
    const alreadyRecorded = uncertainCases.some(
      (entry) => entry.observedName === product.name && entry.catalogId === catalogItem.id,
    );
    if (!alreadyRecorded) {
      uncertainCases.push({
        observedName: product.name,
        catalogId: catalogItem.id,
        catalogName: catalogItem.name,
        reason: rule.reason,
        disposition: 'do_not_merge',
      });
    }
  }

  const excludedByKey = new Map(excludedProducts.map((product) => [product.normalizedKey, product]));
  for (const catalogItem of existingCatalog) {
    const excluded = excludedByKey.get(nameKey(catalogItem.name));
    if (!excluded) continue;
    uncertainCases.push({
      observedName: excluded.name,
      catalogId: catalogItem.id,
      catalogName: catalogItem.name,
      reason: `Observed only in excluded source scope: ${excluded.exclusionReasons.join(', ')}.`,
      disposition: 'do_not_reconcile_from_this_snapshot',
    });
  }

  const unobservedExistingCatalogItems = existingCatalog
    .filter((item) => !matchedCatalogIds.has(item.id))
    .map((item) => ({ id: item.id, name: item.name }));

  exactCandidates.sort((left, right) => left.catalogId.localeCompare(right.catalogId, 'tr'));
  renameCandidates.sort((left, right) => left.catalogId.localeCompare(right.catalogId, 'tr'));
  additionCandidates.sort((left, right) => {
    const categoryDifference = CATEGORY_ORDER.indexOf(left.category) - CATEGORY_ORDER.indexOf(right.category);
    return categoryDifference || left.name.localeCompare(right.name, 'tr');
  });
  uncertainCases.sort((left, right) => {
    const nameDifference = left.observedName.localeCompare(right.observedName, 'tr');
    return nameDifference || String(left.catalogId).localeCompare(String(right.catalogId), 'tr');
  });

  return {
    exactCandidates,
    renameCandidates,
    additionCandidates,
    uncertainCases,
    unobservedExistingCatalogItems,
  };
}

export function buildObservationSnapshot({
  config,
  observedAt,
  vendorResponses,
  existingCatalog,
}) {
  assert(/^\d{4}-\d{2}-\d{2}$/.test(observedAt), 'observedAt must use YYYY-MM-DD');
  assert(config.branches.length >= 5, `${config.chainId} needs at least five branches`);
  const citySet = new Set(config.branches.map((branch) => branch.city));
  assert(citySet.size >= 3, `${config.chainId} needs at least three sampled cities`);
  const minimumCoreBranches = Math.ceil(config.branches.length * 0.6);
  const branchOrder = new Map(config.branches.map((branch, index) => [branch.id, index]));
  const claimsByProduct = new Map();
  const branchMetadata = [];

  for (const branch of config.branches) {
    const response = vendorResponses[branch.vendorCode];
    assert(response, `Missing response for vendor ${branch.vendorCode}`);
    const { data, claims } = extractClaims(response, branch, config.chainId);
    assert(nameKey(data.name).includes(nameKey(config.chainName)), `Unexpected vendor name for ${branch.id}`);
    for (const claim of claims) {
      const entry = claimsByProduct.get(claim.normalizedKey) ?? {
        normalizedKey: claim.normalizedKey,
        claims: [],
      };
      entry.claims.push(claim);
      claimsByProduct.set(claim.normalizedKey, entry);
    }

    branchMetadata.push({
      id: branch.id,
      vendorCode: branch.vendorCode,
      name: branch.name,
      city: branch.city,
      address: normalizeName(data.address),
      latitude: Number(data.latitude),
      longitude: Number(data.longitude),
      sourceUrl: storefrontUrl(branch.vendorCode, config.chainId),
      menuApiUrl: apiUrl(branch.vendorCode),
      sourceTier: 'tier_2_brand_managed_ordering_surface',
      platform: 'Yemeksepeti / Delivery Hero public menu API',
      observedAt,
      accessStatus: `HTTP 200 on ${observedAt}`,
      observedRawClaimCount: claims.length,
    });
  }

  const products = [];
  const excludedProducts = [];

  for (const entry of claimsByProduct.values()) {
    const eligibleClaims = entry.claims.filter((claim) => claim.exclusionReasons.length === 0);
    const variants = stableStringSort(new Set(entry.claims.map((claim) => claim.observedName)));
    const name = variants[0];

    if (eligibleClaims.length === 0) {
      const branchIds = stableStringSort(new Set(entry.claims.map((claim) => claim.branchId))).sort(
        (left, right) => branchOrder.get(left) - branchOrder.get(right),
      );
      const branchPrices = branchIds.map((branchId) => ({
        branchId,
        amount: branchClaim(branchId, entry.claims)?.price ?? null,
      }));
      excludedProducts.push({
        name,
        normalizedKey: entry.normalizedKey,
        observedVariants: variants,
        status: 'excluded',
        sourceCategories: stableStringSort(new Set(entry.claims.map((claim) => claim.sourceCategory))),
        exclusionReasons: stableStringSort(
          new Set(entry.claims.flatMap((claim) => claim.exclusionReasons)),
        ),
        observedAt,
        sourceTier: 'tier_2_brand_managed_ordering_surface',
        branches: branchMetadata
          .filter((branch) => branchIds.includes(branch.id))
          .map(({ id, name: branchName, city, sourceUrl }) => ({
            id,
            name: branchName,
            city,
            sourceUrl,
          })),
        branchCount: branchIds.length,
        price: priceSummary(branchPrices),
        nutrition: 'unknown',
        allergens: 'unknown',
      });
      continue;
    }

    const { category, evidence } = pickCategory(eligibleClaims, name);
    const eligibleBranchIds = new Set(eligibleClaims.map((claim) => claim.branchId));
    for (const claim of entry.claims) {
      if (
        claim.exclusionReasons.length === 1 &&
        claim.exclusionReasons[0] === 'duplicate_or_combo_surface' &&
        !/\b(menu|combo)\b/.test(claim.normalizedKey)
      ) {
        eligibleBranchIds.add(claim.branchId);
      }
    }
    const branchIds = [...eligibleBranchIds].sort(
      (left, right) => branchOrder.get(left) - branchOrder.get(right),
    );
    const branches = branchMetadata
      .filter((branch) => branchIds.includes(branch.id))
      .map(({ id, name: branchName, city, sourceUrl }) => ({
        id,
        name: branchName,
        city,
        sourceUrl,
      }));
    const cities = stableStringSort(new Set(branches.map((branch) => branch.city)));
    const branchPrices = branchIds.map((branchId) => ({
      branchId,
      amount: branchClaim(branchId, entry.claims, category)?.price ?? null,
    }));
    const branchCount = branchIds.length;
    const isSeasonal = eligibleClaims.some((claim) => claim.seasonalEvidence);
    const availabilityScope =
      branchCount >= minimumCoreBranches ? 'chain_core' : 'branch_observed';
    const status = isSeasonal ? 'seasonal' : availabilityScope === 'chain_core' ? 'core' : 'ambiguous';

    products.push({
      name,
      normalizedKey: entry.normalizedKey,
      observedVariants: variants,
      category,
      categoryEvidence: evidence,
      status,
      availabilityScope,
      sourceCategories: stableStringSort(new Set(eligibleClaims.map((claim) => claim.sourceCategory))),
      observedAt,
      sourceTier: 'tier_2_brand_managed_ordering_surface',
      sourceUrls: branches.map((branch) => branch.sourceUrl),
      branches,
      cities,
      branchCount,
      cityCount: cities.length,
      branchPresenceRatio: branchCount / config.branches.length,
      price: priceSummary(branchPrices),
      nutrition: 'unknown',
      allergens: 'unknown',
    });
  }

  products.sort(categorySort);
  excludedProducts.sort((left, right) => left.name.localeCompare(right.name, 'tr'));
  const reconciliation = buildReconciliation(
    config.chainId,
    products,
    excludedProducts,
    existingCatalog,
  );
  const intersection = products.filter((product) => product.branchCount === config.branches.length);
  const chainCore = products.filter((product) => product.branchCount >= minimumCoreBranches);
  const categoryCounts = Object.fromEntries(
    CATEGORY_ORDER.map((category) => [
      category,
      products.filter((product) => product.category === category).length,
    ]).filter(([, count]) => count > 0),
  );
  const statusCounts = Object.fromEntries(
    ['core', 'seasonal', 'ambiguous'].map((status) => [
      status,
      products.filter((product) => product.status === status).length,
    ]),
  );
  const eligibleCountByBranch = Object.fromEntries(
    config.branches.map((branch) => [
      branch.id,
      products.filter((product) => product.branches.some((item) => item.id === branch.id)).length,
    ]),
  );

  return {
    schemaVersion: '1.0.0',
    chainId: config.chainId,
    chainName: config.chainName,
    observedAt,
    generatedBy: 'scripts/fetch-kd-tchibo-observations.mjs',
    promotionPolicy: 'review_artifact_only_no_auto_promotion',
    methodology: {
      coverageMode: 'controlled_multi_branch_live_snapshot',
      completeness: 'section-complete for the recorded storefront claims; not a nationwide inventory',
      chainCoreRule: `Present in at least ${minimumCoreBranches} of ${config.branches.length} sampled branches (>=60%).`,
      intersectionRule: `Present in all ${config.branches.length} sampled branches.`,
      normalization: 'NFC, Turkish-aware case folding, punctuation folding, stable branch/category/name sorting.',
      pricePolicy: 'Lowest listed base variation price per branch; promotion bundles are excluded.',
      unknownFieldPolicy: 'Nutrition and allergens remain unknown; no values are inferred.',
      exclusionRules: [
        'packages and packaged retail',
        'beans, ground coffee, instant coffee, and capsules',
        'equipment and merchandising',
        'duplicate popular/campaign/combo/menu surfaces',
        'bags and frozen take-home goods',
        'whole cakes',
        'generic or unrelated bottled retail drinks',
      ],
    },
    sourceAttribution: {
      officialSources: config.officialSources.map((source) => ({ ...source, accessStatus: `HTTP 200 on ${observedAt}` })),
      productSurface: 'Named chain storefronts on Yemeksepeti backed by Delivery Hero public vendor menus.',
      productSourceTier: 'tier_2_brand_managed_ordering_surface',
      sourceTierRationale:
        'The storefronts identify the named chain and expose branch address/legal merchant context, but are hosted by a third-party ordering platform.',
    },
    coverage: {
      branchCount: branchMetadata.length,
      cityCount: citySet.size,
      cities: stableStringSort(citySet),
      branches: branchMetadata.map((branch) => ({
        ...branch,
        observedEligibleProductCount: eligibleCountByBranch[branch.id],
      })),
      limitations: [
        'Branch assortment, stock, and prices can change after the observation date.',
        'This controlled sample is not an exhaustive nationwide inventory.',
        'The official brand directories establish chain/store context but do not publish complete cafe menus.',
        'Yemeksepeti is a third-party ordering host; each exact branch URL and API URL is retained for audit.',
      ],
    },
    sets: {
      union: products.map(({ name, normalizedKey }) => ({ name, normalizedKey })),
      intersection: intersection.map(({ name, normalizedKey }) => ({ name, normalizedKey })),
      chainCore: chainCore.map(({ name, normalizedKey, status }) => ({
        name,
        normalizedKey,
        status,
      })),
    },
    counts: {
      unionProductCount: products.length,
      intersectionProductCount: intersection.length,
      chainCoreCount: chainCore.length,
      excludedProductCount: excludedProducts.length,
      exactCandidateCount: reconciliation.exactCandidates.length,
      renameCandidateCount: reconciliation.renameCandidates.length,
      additionCandidateCount: reconciliation.additionCandidates.length,
      uncertainCaseCount: reconciliation.uncertainCases.length,
      unobservedExistingCatalogCount: reconciliation.unobservedExistingCatalogItems.length,
      categoryCounts,
      statusCounts,
    },
    products,
    excludedProducts,
    reconciliation,
  };
}

async function fetchVendor(branch) {
  const url = apiUrl(branch.vendorCode);
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          accept: 'application/json',
          origin: 'https://www.yemeksepeti.com',
          referer: storefrontUrl(branch.vendorCode, branch.chainId ?? 'tchibo'),
          'user-agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
            '(KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
          'x-disco-client-id': 'web',
          'perseus-client-id': PERSEUS_CLIENT_ID,
          'perseus-session-id': PERSEUS_SESSION_ID,
        },
      });
      const payload = await response.json();
      if (!response.ok || payload?.status_code !== 200) {
        const error = new Error(`HTTP ${response.status}: ${JSON.stringify(payload).slice(0, 500)}`);
        error.nonRetryable = response.status === 403;
        throw error;
      }
      return payload;
    } catch (error) {
      lastError = error;
      if (error?.nonRetryable) break;
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, attempt * 250));
    }
  }
  throw new Error(`Failed to fetch ${branch.vendorCode}: ${lastError?.message}`);
}

export function parseArgs(argv) {
  const args = {
    observedAt: null,
    outputDir: path.join(ROOT, 'scripts', 'catalog_sources'),
    fixture: null,
    chain: null,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--observed-at') args.observedAt = argv[++index];
    else if (token === '--output-dir') args.outputDir = path.resolve(argv[++index]);
    else if (token === '--fixture') args.fixture = path.resolve(argv[++index]);
    else if (token === '--chain') args.chain = argv[++index];
    else throw new Error(`Unknown argument: ${token}`);
  }
  assert(/^\d{4}-\d{2}-\d{2}$/.test(args.observedAt ?? ''), '--observed-at YYYY-MM-DD is required');
  assert(
    args.chain === null || Object.hasOwn(CHAIN_CONFIGS, args.chain),
    `--chain must be one of: ${Object.keys(CHAIN_CONFIGS).join(', ')}`,
  );
  return args;
}

export async function generateSnapshots({ observedAt, outputDir, fixture = null, chain = null }) {
  const fixturePayload = fixture ? JSON.parse(await readFile(fixture, 'utf8')) : null;
  const snapshots = {};
  await mkdir(outputDir, { recursive: true });

  const selectedConfigs = chain ? [CHAIN_CONFIGS[chain]] : Object.values(CHAIN_CONFIGS);
  for (const config of selectedConfigs) {
    const vendorResponses = {};
    for (const branch of config.branches) {
      vendorResponses[branch.vendorCode] = fixturePayload
        ? fixturePayload[config.chainId]?.[branch.vendorCode]
        : await fetchVendor({ ...branch, chainId: config.chainId });
      if (!fixturePayload) await new Promise((resolve) => setTimeout(resolve, 1200));
    }
    const existingCatalog = extractCatalogItems(await readFile(config.catalogPath, 'utf8'));
    const snapshot = buildObservationSnapshot({
      config,
      observedAt,
      vendorResponses,
      existingCatalog,
    });
    await writeFile(
      path.join(outputDir, config.outputName),
      `${JSON.stringify(snapshot, null, 2)}\n`,
      'utf8',
    );
    snapshots[config.chainId] = snapshot;
  }
  return snapshots;
}

const invokedFile = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedFile === fileURLToPath(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2));
  const snapshots = await generateSnapshots(args);
  for (const snapshot of Object.values(snapshots)) {
    console.log(
      `${snapshot.chainName}: ${snapshot.counts.unionProductCount} union, ` +
        `${snapshot.counts.intersectionProductCount} intersection, ` +
        `${snapshot.counts.chainCoreCount} chain_core, ` +
        `${snapshot.counts.additionCandidateCount} additions.`,
    );
  }
}
