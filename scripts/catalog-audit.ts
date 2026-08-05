/**
 * Automated catalog audit for Kalori Cafe.
 *
 * Run via `npm run catalog:audit` (node scripts/catalog-audit.ts).
 * Fails with exit code 1 and a descriptive message on any violated gate.
 *
 * Gates (see DEEPSEEK_NIGHT_GOAL.md §8.1):
 *  - unique product IDs
 *  - valid chain references
 *  - finite, non-negative nutrition values
 *  - catalog/image/nutrition provenance on every static item
 *  - `verified` nutrition sources carry https URL + checkedAt + servingBasis
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
import type { MenuItem } from '../src/types/cafe.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const PUBLIC_IMAGES = path.join(PROJECT_ROOT, 'public', 'images');

const IMAGE_GATES_ENABLED = process.env.CATALOG_AUDIT_SKIP_IMAGES !== '1';

const failures: string[] = [];
let checksRun = 0;

function check(condition: boolean, message: string): void {
  checksRun++;
  if (!condition) failures.push(message);
}

function itemId(item: MenuItem): string {
  return `${item.id} (${item.chainId})`;
}

/* ------------------------------------------------------------------ */
/* Image family classification: a "normalized visual family"          */
/* ------------------------------------------------------------------ */
export function visualFamilyOf(item: MenuItem): string {
  if (!item.isDrink) {
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

let positiveCount = 0;
for (const item of MENU_ITEMS) {
  const values = Object.values(item.baseMacros).filter(v => v !== undefined);
  if (!values.every(v => Number.isFinite(v) && v >= 0)) {
    failures.push(`Non-finite or negative macro in ${itemId(item)}`);
  }
  if (item.baseMacros.calories > 0) positiveCount++;
}
check(positiveCount === MENU_ITEMS.length, 'Expected positive calories on every base macro set');

check(
  MENU_ITEMS.every(i => !i.availability || i.availability === 'current' || i.availability === 'seasonal'),
  'availability must be current | seasonal',
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
    if (!['official', 'secondary'].includes(item.catalogSource.kind)) {
      failures.push(`catalogSource.kind invalid on ${itemId(item)}`);
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
  if (item.nutritionSource.status === 'verified') {
    const ns = item.nutritionSource;
    if (!ns.url || !/^https:\/\//.test(ns.url)) {
      failures.push(`verified nutritionSource needs https url on ${itemId(item)}`);
    }
    if (!ns.verifiedAt || !/^\d{4}-\d{2}-\d{2}$/.test(ns.verifiedAt)) {
      failures.push(`verified nutritionSource needs YYYY-MM-DD verifiedAt on ${itemId(item)}`);
    }
    if (!ns.servingBasis) {
      failures.push(`verified nutritionSource needs servingBasis on ${itemId(item)}`);
    }
  } else if (!['estimated', 'unverified'].includes(item.nutritionSource.status)) {
    failures.push(`nutritionSource.status invalid on ${itemId(item)}`);
  }
}

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

const nutritionCounts = { verified: 0, estimated: 0, unverified: 0 };
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