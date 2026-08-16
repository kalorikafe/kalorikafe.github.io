/**
 * Automated catalog audit for Kalori Cafe.
 *
 * Run via `npm run catalog:audit` (node scripts/catalog-audit.ts).
 * Fails with exit code 1 and a descriptive message on any violated gate.
 *
 * Catalog quality gates:
 *  - unique product IDs
 *  - valid chain references
 *  - finite, non-negative nutrition values
 *  - canonical productKind/category agreement and no food modifiers
 *  - regulated allergen + catalog/image/nutrition provenance on every item
 *  - field-level nutrition provenance agrees with the aggregate status
 *  - availability limited to current | seasonal
 *  - local WebP image exists, is non-empty and decodable
 *  - unique image ratio >= 60%
 *  - at most 6 products per image file
 *  - repeated image files used only within one normalized visual family
 *  - no verbatim clone product blocks across chains
 *  - total product count > 199
 *
 * Set CATALOG_AUDIT_SKIP_IMAGES=1 to skip the filesystem image gates
 * (useful in unit-test contexts that don't need the built assets).
 */
import { readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MENU_ITEMS } from '../src/data/items.ts';
import { CHAINS } from '../src/data/chains.ts';
import type { MenuItem, NutritionField, OfficialAllergen } from '../src/types/cafe.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const PUBLIC_IMAGES = path.join(PROJECT_ROOT, 'public', 'images');

const IMAGE_GATES_ENABLED = process.env.CATALOG_AUDIT_SKIP_IMAGES !== '1';
const FOOD_CATEGORIES = new Set(['bakery_dessert', 'sandwich_savory', 'fit_healthy']);
const OFFICIAL_ALLERGENS = new Set<OfficialAllergen>([
  'gluten', 'crustaceans', 'egg', 'fish', 'peanut', 'soy', 'milk',
  'nuts', 'celery', 'mustard', 'sesame', 'sulphites', 'lupin', 'molluscs',
]);
const NUTRITION_FIELDS: NutritionField[] = [
  'calories', 'protein', 'carbs', 'sugar', 'fat', 'satFat', 'caffeine', 'sodium',
];
const NUTRITION_FIELD_STATUSES = new Set(['official', 'derived', 'estimated', 'unknown']);

const failures: string[] = [];
let checksRun = 0;

function check(condition: boolean, message: string): void {
  checksRun++;
  if (!condition) failures.push(message);
}

function itemId(item: MenuItem): string {
  return `${item.id} (${item.chainId})`;
}

function imageSourceIdentity(url: string): string {
  const unsplash = url.match(/(?:\/photos\/|photo-)([^?&/]+)/i);
  if (unsplash) return `unsplash:${unsplash[1].toLowerCase()}`;
  let decoded = url;
  try {
    decoded = decodeURIComponent(url);
  } catch {
    // Keep the original URL when malformed percent escapes are encountered.
  }
  const commonsPage = decoded.match(/\/wiki\/File:([^?#]+)/i);
  if (commonsPage) return `commons:${commonsPage[1].replace(/ /g, '_').toLowerCase()}`;
  if (/upload\.wikimedia\.org/i.test(decoded)) {
    const filename = decoded.split(/[/?#]/).filter(Boolean).at(-1);
    if (filename) return `commons:${filename.replace(/ /g, '_').toLowerCase()}`;
  }
  return url;
}

/* ------------------------------------------------------------------ */
/* Image family classification: a "normalized visual family"          */
/* ------------------------------------------------------------------ */
export function visualFamilyOf(item: MenuItem): string {
  if (item.productKind === 'food') {
    if (item.category === 'bakery_dessert' || item.category === 'fit_healthy') return 'dessert-snack';
    return 'savory-food';
  }
  switch (item.category) {
    case 'espresso_hot':
      return 'hot-coffee';
    case 'espresso_iced':
    case 'cold_brew':
      return 'cold-coffee';
    case 'frappe_blended':
      return 'blended-drink';
    case 'tea_herbal':
      return 'hot-tea';
    case 'smoothie_juice':
      return 'fresh-drink';
    default:
      return 'other-drink';
  }
}

function isLocalMenuImage(item: MenuItem): boolean {
  return item.image.startsWith('/images/menu/');
}

function assertWebpDecodable(filePath: string): boolean {
  const buf = readFileSync(filePath);
  if (buf.length < 12) return false;
  if (buf.toString('ascii', 0, 4) !== 'RIFF') return false;
  if (buf.toString('ascii', 8, 12) !== 'WEBP') return false;
  const chunk = buf.toString('ascii', 12, 16);
  return ['VP8 ', 'VP8L', 'VP8X'].includes(chunk);
}

/* ------------------------------------------------------------------ */
/* 1. IDs, chains, macros, provenance                                  */
/* ------------------------------------------------------------------ */

const ids = MENU_ITEMS.map(i => i.id);
check(new Set(ids).size === ids.length, 'Duplicate product IDs found');

const chainIds = new Set(CHAINS.map(c => c.id));
check(
  MENU_ITEMS.every(i => chainIds.has(i.chainId)),
  `Unknown chain reference(s): ${MENU_ITEMS.filter(i => !chainIds.has(i.chainId)).map(i => i.chainId).join(', ')}`,
);

/* Canonical product type: category owns the drink/food decision. */
for (const item of MENU_ITEMS) {
  const expectedKind = FOOD_CATEGORIES.has(item.category) ? 'food' : 'drink';
  if (item.productKind !== expectedKind) {
    failures.push(`productKind/category conflict in ${itemId(item)}: ${item.productKind ?? 'missing'} vs ${item.category}`);
  }
  if (item.isDrink !== (item.productKind === 'drink')) {
    failures.push(`isDrink is not derived from productKind in ${itemId(item)}`);
  }
  if (item.productKind === 'food') {
    const modifiers = ['defaultSizeId', 'defaultMilkId', 'defaultSyrupPumps', 'baseCustomization']
      .filter(key => item[key as keyof MenuItem] !== undefined);
    if (modifiers.length > 0) {
      failures.push(`Food item has drink modifier fallback(s) ${modifiers.join(', ')} in ${itemId(item)}`);
    }
  }
}
const coffyCake = MENU_ITEMS.find(item => item.id === 'coffy_portakalli_kakaolu_kek');
check(
  coffyCake?.category === 'bakery_dessert' && coffyCake.productKind === 'food' && !coffyCake.isDrink,
  'Coffy Portakallı Kakaolu Kek must remain a bakery food',
);

const drinkFallback = JSON.stringify({
  calories: 150, protein: 8, carbs: 13, sugar: 12, fat: 6,
  satFat: 3.5, caffeine: 0, sodium: 90,
});
check(
  !MENU_ITEMS.some(item => item.productKind === 'food' && JSON.stringify(item.baseMacros) === drinkFallback),
  'Food item still carries the generic drink macro fallback',
);

let positiveCount = 0;
for (const item of MENU_ITEMS) {
  const values = Object.values(item.baseMacros).filter(v => v !== undefined);
  if (!values.every(v => Number.isFinite(v) && v >= 0)) {
    failures.push(`Non-finite or negative macro in ${itemId(item)}`);
  }
  if (item.baseMacros.sugar > item.baseMacros.carbs) {
    failures.push(`Sugar exceeds total carbs in ${itemId(item)}`);
  }
  if (item.baseMacros.satFat > item.baseMacros.fat) {
    failures.push(`Saturated fat exceeds total fat in ${itemId(item)}`);
  }
  const macroEnergy = 4 * (item.baseMacros.protein + item.baseMacros.carbs) + 9 * item.baseMacros.fat;
  if (macroEnergy > Math.max(item.baseMacros.calories * 1.8, item.baseMacros.calories + 100)) {
    failures.push(`Macro energy is implausibly above calories in ${itemId(item)}`);
  }
  if (item.baseMacros.calories > 0) positiveCount++;
}
check(positiveCount === MENU_ITEMS.length, 'Expected positive calories on every base macro set');

check(
  MENU_ITEMS.every(i => !i.availability || i.availability === 'current' || i.availability === 'seasonal'),
  'availability must be current | seasonal',
);

const legacyManifestPath = path.join(PROJECT_ROOT, 'scripts', 'catalog_sources', 'legacy_unverified.json');
const legacyManifest = JSON.parse(readFileSync(legacyManifestPath, 'utf8')) as {
  checkedAt: string;
  productIds: string[];
};
const legacyManifestIds = new Set(legacyManifest.productIds);
check(
  legacyManifestIds.size === legacyManifest.productIds.length,
  'Duplicate IDs in legacy-unverified provenance manifest',
);

/* Provenance required on every static catalog product. */
for (const item of MENU_ITEMS) {
  if (!item.catalogSource) {
    failures.push(`Missing catalogSource on ${itemId(item)}`);
  } else {
    if (!/^https?:\/\//.test(item.catalogSource.url)) {
      failures.push(`catalogSource.url not a URL on ${itemId(item)}`);
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(item.catalogSource.checkedAt)) {
      failures.push(`catalogSource.checkedAt not YYYY-MM-DD on ${itemId(item)}`);
    }
    if (!['official', 'secondary', 'legacy_unverified'].includes(item.catalogSource.kind)) {
      failures.push(`catalogSource.kind invalid on ${itemId(item)}`);
    }
    if (legacyManifestIds.has(item.id) && item.catalogSource.kind !== 'legacy_unverified') {
      failures.push(`Source-unmatched item is presented as ${item.catalogSource.kind} on ${itemId(item)}`);
    }
    if (item.catalogSource.kind === 'legacy_unverified' && !legacyManifestIds.has(item.id)) {
      failures.push(`legacy_unverified item missing from provenance manifest: ${itemId(item)}`);
    }
  }

  for (const allergen of item.allergens) {
    if (!OFFICIAL_ALLERGENS.has(allergen as OfficialAllergen)) {
      failures.push(`Non-regulated or unknown static allergen ${allergen} on ${itemId(item)}`);
    }
  }
  if (item.containsLactose === true && !item.allergens.includes('milk')) {
    failures.push(`containsLactose=true without regulated milk allergen on ${itemId(item)}`);
  }
  if (item.crossContactRisks?.some(risk => risk !== 'celiac_oat_risk')) {
    failures.push(`Unknown cross-contact risk on ${itemId(item)}`);
  }
  if (!item.allergenSource) {
    failures.push(`allergenSource missing on ${itemId(item)}`);
  } else {
    const source = item.allergenSource;
    if (!['official', 'mixed', 'estimated', 'unavailable'].includes(source.status)) {
      failures.push(`allergenSource.status invalid on ${itemId(item)}`);
    }
    if (source.status === 'official' || source.status === 'mixed') {
      if (!source.url || !/^https:\/\//.test(source.url)) {
        failures.push(`${source.status} allergenSource needs https url on ${itemId(item)}`);
      }
      if (!source.checkedAt || !/^\d{4}-\d{2}-\d{2}$/.test(source.checkedAt)) {
        failures.push(`${source.status} allergenSource needs checkedAt on ${itemId(item)}`);
      }
    }
  }

  if (!item.imageSource) {
    failures.push(`imageSource missing on ${itemId(item)}`);
  } else {
    if (!/^https?:\/\//.test(item.imageSource.url)) {
      failures.push(`imageSource.url not a URL on ${itemId(item)}`);
    }
    if (!['official', 'licensed_fallback'].includes(item.imageSource.kind)) {
      failures.push(`imageSource.kind invalid on ${itemId(item)}`);
    }
    if (typeof item.imageSource.exactProduct !== 'boolean') {
      failures.push(`imageSource.exactProduct not boolean on ${itemId(item)}`);
    }
  }

  if (!item.nutritionSource) {
    failures.push(`nutritionSource missing on ${itemId(item)}`);
    continue;
  }
  const ns = item.nutritionSource;
  if (ns.status === 'verified' || ns.status === 'mixed') {
    if (!ns.url || !/^https:\/\//.test(ns.url)) {
      failures.push(`${ns.status} nutritionSource needs https url on ${itemId(item)}`);
    }
    if (!ns.verifiedAt || !/^\d{4}-\d{2}-\d{2}$/.test(ns.verifiedAt)) {
      failures.push(`${ns.status} nutritionSource needs YYYY-MM-DD verifiedAt on ${itemId(item)}`);
    }
    if (!ns.servingBasis) {
      failures.push(`${ns.status} nutritionSource needs servingBasis on ${itemId(item)}`);
    }
  } else if (!['estimated', 'unverified'].includes(ns.status)) {
    failures.push(`nutritionSource.status invalid on ${itemId(item)}`);
  }

  if (!ns.fieldStatus) {
    failures.push(`nutritionSource.fieldStatus missing on ${itemId(item)}`);
  } else {
    const statuses = NUTRITION_FIELDS.map(field => ns.fieldStatus?.[field]);
    if (statuses.some(status => !status || !NUTRITION_FIELD_STATUSES.has(status))) {
      failures.push(`nutrition field provenance incomplete/invalid on ${itemId(item)}`);
    } else {
      const statusSet = new Set(statuses);
      const hasSourced = statusSet.has('official') || statusSet.has('derived');
      const hasEstimatedOrUnknown = statusSet.has('estimated') || statusSet.has('unknown');
      if (ns.status === 'verified' && hasEstimatedOrUnknown) {
        failures.push(`verified nutrition has estimated/unknown fields on ${itemId(item)}`);
      }
      if (ns.status === 'mixed' && (!hasSourced || !hasEstimatedOrUnknown)) {
        failures.push(`mixed nutrition must contain sourced and estimated/unknown fields on ${itemId(item)}`);
      }
      if (ns.status === 'estimated' && !(statusSet.size === 1 && statusSet.has('estimated'))) {
        failures.push(`estimated nutrition has inconsistent field provenance on ${itemId(item)}`);
      }
    }
  }
}

check(
  legacyManifestIds.size === MENU_ITEMS.filter(item => item.catalogSource?.kind === 'legacy_unverified').length,
  'legacy_unverified catalog count differs from the provenance manifest',
);

/* ------------------------------------------------------------------ */
/* Images                                                              */
/* ------------------------------------------------------------------ */

const uniqueImageSet = new Set(MENU_ITEMS.map(i => i.image));
const repeatMap = new Map<string, MenuItem[]>();
for (const item of MENU_ITEMS) {
  const arr = repeatMap.get(item.image) ?? [];
  arr.push(item);
  repeatMap.set(item.image, arr);
}

check(
  MENU_ITEMS.every(isLocalMenuImage),
  `Remote/non-menu image paths: ${MENU_ITEMS.filter(i => !isLocalMenuImage(i)).map(i => `${i.id}=>${i.image}`).slice(0, 10).join(', ')}`,
);

const uniquePercent = (uniqueImageSet.size / MENU_ITEMS.length) * 100;
check(
  uniquePercent >= 60,
  `Unique image ratio ${uniquePercent.toFixed(1)}% < 60% (${uniqueImageSet.size} unique / ${MENU_ITEMS.length} items)`,
);

let worstRepeat = 0;
let worstRepeatFile = '';
const familyViolations: string[] = [];
for (const [image, items] of repeatMap) {
  if (items.length > worstRepeat) {
    worstRepeat = items.length;
    worstRepeatFile = image;
  }
  check(items.length <= 6, `Image file ${image} used by ${items.length} products (max 6)`);
  if (items.length > 1) {
    const families = new Set(items.map(visualFamilyOf));
    if (families.size > 1) {
      familyViolations.push(`${image} spans families ${[...families].join(', ')}`);
    }
  }
}
check(
  familyViolations.length === 0,
  `Repeated image spans multiple visual families: ${familyViolations.slice(0, 5).join(' | ')}`,
);

if (IMAGE_GATES_ENABLED) {
  let missing = 0;
  let broken = 0;
  for (const image of uniqueImageSet) {
    if (image.startsWith('http')) {
      failures.push(`Remote image URL still referenced: ${image}`);
      continue;
    }
    const rel = image.replace(/^\/images\//, '');
    const filePath = path.join(PUBLIC_IMAGES, rel);
    if (!statSync(filePath, { throwIfNoEntry: false })?.isFile()) {
      missing++;
      failures.push(`Image file missing: ${image}`);
      continue;
    }
    if (statSync(filePath).size <= 0) {
      broken++;
      failures.push(`Image file empty: ${image}`);
      continue;
    }
    if (!image.endsWith('.webp')) {
      failures.push(`Image not WebP: ${image}`);
      continue;
    }
    let decodable = false;
    try {
      decodable = assertWebpDecodable(filePath);
    } catch {
      decodable = false;
    }
    if (!decodable) {
      broken++;
      failures.push(`Image not decodable: ${image}`);
    }
  }
  check(missing === 0, `${missing} referenced image file(s) missing`);
  check(broken === 0, `${broken} image file(s) empty or not decodable`);
}

/* ------------------------------------------------------------------ */
/* Cross-chain clone detection                                         */
/* ------------------------------------------------------------------ */

const cloneGroups = new Map<string, string[]>();
for (const item of MENU_ITEMS) {
  // Structural fingerprint of the entire catalog record (minus id/chain).
  const fingerprint = JSON.stringify({
    name: item.name,
    description: item.description,
    category: item.category,
    image: item.image,
    baseMacros: item.baseMacros,
    allergens: item.allergens,
    dietaryTags: item.dietaryTags,
    availability: item.availability,
  });
  const arr = cloneGroups.get(fingerprint) ?? [];
  arr.push(item.chainId);
  cloneGroups.set(fingerprint, arr);
}
const clones = [...cloneGroups.entries()].filter(([, chains]) => new Set(chains).size > 1);
check(
  clones.length === 0,
  `Cross-chain clone blocks detected: ${clones.slice(0, 5).map(([fp, chains]) => `${[...new Set(chains)].join('+')} (${fp.length} chars)`).join(' | ')}`,
);

/* Total count gate. */
check(
  MENU_ITEMS.length > 199,
  `Catalog has ${MENU_ITEMS.length} items; must exceed 199`,
);

/* Tracked official snapshots must be represented completely. */
const caffeNeroSourcePath = path.join(PROJECT_ROOT, 'scripts', 'catalog_sources', 'caffe_nero.json');
if (!statSync(caffeNeroSourcePath, { throwIfNoEntry: false })?.isFile()) {
  check(false, 'Tracked Caffè Nero source snapshot is missing');
} else {
  const source = JSON.parse(readFileSync(caffeNeroSourcePath, 'utf8')) as {
    chainId: string;
    products: Array<{
      name: string;
      category: string;
      productKind: 'drink' | 'food';
      isDrink: boolean;
      allergens: OfficialAllergen[];
      containsLactose: boolean;
      allergenSourceAvailable: boolean;
      allergenNotes?: string;
      officialNutritionFields: NutritionField[];
      derivedNutritionFields?: NutritionField[];
    }>;
  };
  const sourceNames = new Set(source.products.map(product => product.name));
  const catalogNames = new Set(
    MENU_ITEMS.filter(item => item.chainId === source.chainId).map(item => item.name),
  );
  const catalogItems = MENU_ITEMS.filter(item => item.chainId === source.chainId);
  const missingNames = [...sourceNames].filter(name => !catalogNames.has(name));
  const extraNames = [...catalogNames].filter(name => !sourceNames.has(name));
  check(sourceNames.size === source.products.length, 'Duplicate names in tracked Caffè Nero source snapshot');
  check(
    catalogItems.length === source.products.length,
    `Caffè Nero row count differs from tracked snapshot (${catalogItems.length} catalog / ${source.products.length} source)`,
  );
  check(
    catalogNames.size === sourceNames.size,
    `Caffè Nero count differs from tracked snapshot (${catalogNames.size} catalog / ${sourceNames.size} source)`,
  );
  check(missingNames.length === 0, `Caffè Nero source products missing from catalog: ${missingNames.slice(0, 5).join(', ')}`);
  check(extraNames.length === 0, `Caffè Nero catalog products absent from source: ${extraNames.slice(0, 5).join(', ')}`);

  const catalogByName = new Map(catalogItems.map(item => [item.name, item]));
  for (const product of source.products) {
    const item = catalogByName.get(product.name);
    if (!item) continue;
    check(item.productKind === product.productKind, `Caffè Nero productKind drift on ${product.name}`);
    check(item.isDrink === product.isDrink, `Caffè Nero isDrink drift on ${product.name}`);
    check(item.containsLactose === product.containsLactose, `Caffè Nero lactose metadata drift on ${product.name}`);
    if (product.allergenSourceAvailable) {
      check(
        JSON.stringify([...item.allergens].sort()) === JSON.stringify([...product.allergens].sort()),
        `Caffè Nero official allergen drift on ${product.name}`,
      );
      const expectedAllergenStatus = product.allergenNotes ? 'mixed' : 'official';
      check(
        item.allergenSource?.status === expectedAllergenStatus,
        `Caffè Nero allergen provenance drift on ${product.name}`,
      );
    }

    const official = new Set(product.officialNutritionFields);
    const derived = new Set(product.derivedNutritionFields ?? []);
    const sourcedCount = official.size + derived.size;
    check(
      item.nutritionSource?.status === (sourcedCount > 0 ? 'mixed' : 'estimated'),
      `Caffè Nero nutrition aggregate provenance drift on ${product.name}`,
    );
    for (const field of NUTRITION_FIELDS) {
      const expected = derived.has(field) ? 'derived' : official.has(field) ? 'official' : 'estimated';
      check(
        item.nutritionSource?.fieldStatus?.[field] === expected,
        `Caffè Nero ${field} provenance drift on ${product.name}`,
      );
    }
  }

  const allSourceUsage = new Map<string, MenuItem[]>();
  for (const item of MENU_ITEMS) {
    if (!item.imageSource) continue;
    const identity = imageSourceIdentity(item.imageSource.url);
    const group = allSourceUsage.get(identity) ?? [];
    group.push(item);
    allSourceUsage.set(identity, group);
  }
  const caffeSourceUrls = new Set(
    catalogItems
      .map(item => item.imageSource?.url)
      .filter((url): url is string => Boolean(url))
      .map(imageSourceIdentity),
  );
  const caffeUniqueSourcePercent = (caffeSourceUrls.size / catalogItems.length) * 100;
  check(
    caffeUniqueSourcePercent >= 60,
    `Caffè Nero unique image-source ratio ${caffeUniqueSourcePercent.toFixed(1)}% < 60%`,
  );
  for (const sourceUrl of caffeSourceUrls) {
    const usedBy = catalogItems.filter(item => item.imageSource && imageSourceIdentity(item.imageSource.url) === sourceUrl);
    check(usedBy.length <= 6, `Caffè Nero image source ${sourceUrl} is used by ${usedBy.length} products (max 6)`);
  }
}

/* ------------------------------------------------------------------ */
/* Summary (also consumed by the completion report)                    */
/* ------------------------------------------------------------------ */

const chainCounts: Record<string, { total: number; seasonal: number }> = {};
for (const item of MENU_ITEMS) {
  const c = chainCounts[item.chainId] ?? { total: 0, seasonal: 0 };
  c.total++;
  if (item.availability === 'seasonal') c.seasonal++;
  chainCounts[item.chainId] = c;
}

const nutritionCounts = { verified: 0, mixed: 0, estimated: 0, unverified: 0 };
for (const item of MENU_ITEMS) {
  const s = item.nutritionSource?.status ?? 'unverified';
  nutritionCounts[s]++;
}
const imageKindCounts = { official: 0, licensed_fallback: 0, exactProduct: 0 };
for (const item of MENU_ITEMS) {
  if (!item.imageSource) continue;
  imageKindCounts[item.imageSource.kind]++;
  if (item.imageSource.exactProduct) imageKindCounts.exactProduct++;
}

const summary = {
  totalProducts: MENU_ITEMS.length,
  uniqueImages: uniqueImageSet.size,
  uniqueImagePercent: Number(uniquePercent.toFixed(1)),
  mostRepeatedImage: worstRepeatFile ? { path: worstRepeatFile, count: worstRepeat } : null,
  chains: chainCounts,
  nutrition: nutritionCounts,
  legacyUnverifiedSources: legacyManifestIds.size,
  images: imageKindCounts,
  checksRun,
  failures: failures.length,
};

if (failures.length > 0) {
  console.error(`❌ Catalog audit FAILED (${failures.length} failures)`);
  for (const f of failures) console.error(`   - ${f}`);
  process.exit(1);
}

console.log('✅ Catalog audit passed');
console.log(JSON.stringify(summary, null, 2));
