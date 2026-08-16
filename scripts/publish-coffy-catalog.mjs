/**
 * Promote the reviewed Coffy multi-branch observation snapshot into the
 * approved static catalog. The promotion is deliberately explicit: the
 * observation normalizer never publishes products by itself.
 *
 * New products use conservative, deterministic name/category estimates.
 * Empty allergen arrays are recorded as unavailable, never as evidence that
 * a product is safe. Images are local, product-labelled derivatives of a
 * tracked licensed fallback with inherited attribution.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, '..');
const SOURCES = path.join(SCRIPT_DIR, 'catalog_sources');
const CHECKED_AT = '2026-08-11';
const OBSERVATIONS_PATH = path.join(SOURCES, 'coffy_observations.json');
const RELEASE_PATH = path.join(SOURCES, 'catalog_release.json');
const ASSETS_PATH = path.join(SOURCES, 'catalog_assets.json');
const PROVENANCE_PATH = path.join(SOURCES, 'image-provenance.json');
const LEGACY_PATH = path.join(SOURCES, 'legacy_unverified.json');
const PUBLICATION_PATH = path.join(SOURCES, 'coffy_catalog_publication.json');
const NUTRITION_FIELDS = [
  'calories', 'protein', 'carbs', 'sugar', 'fat', 'satFat', 'caffeine', 'sodium',
];
const FOOD_CATEGORIES = new Set(['bakery_dessert', 'sandwich_savory', 'fit_healthy']);

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function stableJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function writeJson(filePath, value) {
  const serialized = stableJson(value);
  writeFileSync(filePath, serialized, 'utf8');
  return serialized;
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function normalize(value) {
  return String(value)
    .toLocaleLowerCase('tr-TR')
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .replaceAll('ı', 'i')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function coffyCatalogId(name) {
  const slug = normalize(name).replaceAll(' ', '_');
  assert(slug, `Cannot create a Coffy id from ${name}`);
  return `coffy_${slug}`;
}

function imagePathFor(name) {
  return `/images/menu/coffy/${coffyCatalogId(name).slice('coffy_'.length)}.webp`;
}

function glycemic(macros) {
  if (macros.sugar > 30 || macros.carbs > 45) return 'Yüksek';
  if (macros.sugar < 15 && macros.carbs < 20) return 'Düşük';
  return 'Orta';
}

/** Conservative estimate for one unspecified standard cafe serving. */
export function estimateCoffyMacros(name, category) {
  const n = normalize(name);
  const food = FOOD_CATEGORIES.has(category);

  if (food) {
    if (n.includes('chia puding')) {
      return { calories: 300, protein: 8, carbs: 34, sugar: 18, fat: 15, satFat: 6, caffeine: 0, sodium: 120 };
    }
    if (n.includes('cheesecake')) {
      return { calories: 450, protein: 8, carbs: 42, sugar: 30, fat: 27, satFat: 16, caffeine: 0, sodium: 280 };
    }
    if (/(kruvasan|croissant)/.test(n)) {
      return { calories: 355, protein: 6, carbs: 38, sugar: 12, fat: 20, satFat: 12, caffeine: 0, sodium: 350 };
    }
    if (n.includes('muffin')) {
      return { calories: 370, protein: 5, carbs: 52, sugar: 29, fat: 16, satFat: 4, caffeine: 0, sodium: 310 };
    }
    if (/(cookie|kurabiye)/.test(n)) {
      return { calories: 400, protein: 6, carbs: 50, sugar: 33, fat: 21, satFat: 12, caffeine: 10, sodium: 255 };
    }
    if (/(brownie|mozaik|sufle|profiterol)/.test(n)) {
      return { calories: 420, protein: 7, carbs: 55, sugar: 36, fat: 20, satFat: 12, caffeine: 10, sodium: 240 };
    }
    if (n.includes('tiramisu')) {
      return { calories: 370, protein: 6, carbs: 39, sugar: 27, fat: 21, satFat: 13, caffeine: 35, sodium: 130 };
    }
    if (/(kek|cake|pasta)/.test(n)) {
      return { calories: 380, protein: 5, carbs: 50, sugar: 33, fat: 18, satFat: 6, caffeine: 0, sodium: 270 };
    }
    if (/(simit|pogaca|boyoz|acma)/.test(n)) {
      return { calories: 310, protein: 9, carbs: 40, sugar: 4, fat: 14, satFat: 6, caffeine: 0, sodium: 380 };
    }
    if (/(sandvic|sandwich|bagel|baget|tost|panini|ciabatta)/.test(n)) {
      return { calories: 440, protein: 20, carbs: 46, sugar: 4, fat: 18, satFat: 8, caffeine: 0, sodium: 900 };
    }
    if (/(tahil bar|fruit bar|power coconut)/.test(n)) {
      return { calories: 230, protein: 4, carbs: 31, sugar: 16, fat: 10, satFat: 5, caffeine: 5, sodium: 90 };
    }
    return { calories: 380, protein: 10, carbs: 44, sugar: 18, fat: 18, satFat: 8, caffeine: 0, sodium: 500 };
  }

  if (n.includes('bulletproof')) {
    return { calories: 330, protein: 2, carbs: 3, sugar: 1, fat: 35, satFat: 24, caffeine: 140, sodium: 50 };
  }
  if (/(americano|filtre)/.test(n)) {
    return { calories: 10, protein: 0.5, carbs: 2, sugar: 0, fat: 0, satFat: 0, caffeine: 140, sodium: 12 };
  }
  if (/(cherry brownie|chocolate cookie|caramel bubble)/.test(n) && /(latte|frappe)/.test(n)) {
    return { calories: 330, protein: 8, carbs: 46, sugar: 40, fat: 13, satFat: 8, caffeine: 140, sodium: 190 };
  }
  if (/(white chocolate mocha)/.test(n)) {
    return { calories: 360, protein: 10, carbs: 46, sugar: 40, fat: 15, satFat: 9.5, caffeine: 140, sodium: 170 };
  }
  if (/(mocha)/.test(n) && !n.includes('frappe')) {
    return { calories: 340, protein: 10, carbs: 44, sugar: 36, fat: 14, satFat: 9, caffeine: 140, sodium: 150 };
  }
  if (/(salted|karamel|caramel|blossom)/.test(n) && /(latte|macchiato)/.test(n)) {
    return { calories: 270, protein: 8, carbs: 36, sugar: 32, fat: 10, satFat: 6, caffeine: 140, sodium: 180 };
  }
  if (/(latte|flat white)/.test(n)) {
    return { calories: 170, protein: 9, carbs: 15, sugar: 13, fat: 7, satFat: 4, caffeine: 140, sodium: 115 };
  }
  if (/(cappuccino|macchiato)/.test(n)) {
    return { calories: 130, protein: 7, carbs: 12, sugar: 10, fat: 5, satFat: 3, caffeine: 140, sodium: 100 };
  }
  if (/(frappe|milkshake|coffychino)/.test(n)) {
    return { calories: 400, protein: 7, carbs: 60, sugar: 54, fat: 15, satFat: 10, caffeine: 90, sodium: 230 };
  }
  if (n.includes('matcha')) {
    const flavoured = /(vanilla|berry|mango|strawberry)/.test(n);
    return flavoured
      ? { calories: 210, protein: 6, carbs: 34, sugar: 30, fat: 6, satFat: 3.5, caffeine: 50, sodium: 90 }
      : { calories: 170, protein: 7, carbs: 23, sugar: 20, fat: 6, satFat: 3.5, caffeine: 50, sodium: 90 };
  }
  if (/(earl grey|hibiskus|hibiscus)/.test(n)) {
    return { calories: 10, protein: 0.2, carbs: 2, sugar: 0, fat: 0, satFat: 0, caffeine: 25, sodium: 5 };
  }
  if (/(freshaa|frozen|cool lime|lemonade|berry hibiscus)/.test(n)) {
    return { calories: 140, protein: 0.5, carbs: 34, sugar: 30, fat: 0.2, satFat: 0, caffeine: 10, sodium: 10 };
  }
  return { calories: 170, protein: 5, carbs: 25, sugar: 21, fat: 6, satFat: 3.5, caffeine: 80, sodium: 90 };
}

/** Infer only allergens strongly signalled by the product name. */
export function strongNameAllergens(name, category) {
  const n = normalize(name);
  const result = new Set();
  const food = FOOD_CATEGORIES.has(category);

  if (food) {
    const declaredGlutenFree = /glutensiz/.test(n);
    if (!declaredGlutenFree && /(cookie|muffin|cheesecake|brownie|kek|cake|pasta|sufle|kruvasan|croissant|pogaca|tiramisu|sandvic|sandwich|bagel|baget|simit)/.test(n)) {
      result.add('gluten');
    }
    if (/(cookie|muffin|cheesecake|brownie|kek|cake|pasta|sufle|kruvasan|croissant|pogaca|tiramisu)/.test(n)) {
      result.add('egg');
    }
    if (/(cheesecake|creamy|kremali|sut|peynir|kasar|cheddar|labne|tereyagli|puding|tiramisu)/.test(n)) {
      result.add('milk');
    }
    if (/(findik|badem|ceviz|antep fistigi|pistachio|hazelnut|almond|walnut)/.test(n)) {
      result.add('nuts');
    }
    if (/simit/.test(n)) result.add('sesame');
  } else {
    if (/(latte|cappuccino|macchiato|mocha|milkshake)/.test(n)) result.add('milk');
    if (/(cookie|brownie)/.test(n)) {
      result.add('gluten');
      result.add('egg');
    }
    if (/(findik|badem|ceviz|antep fistigi|pistachio|hazelnut|almond|walnut)/.test(n)) {
      result.add('nuts');
    }
  }

  return [...result].sort((left, right) => left.localeCompare(right, 'en'));
}

function nutritionSource() {
  return {
    status: 'estimated',
    label: 'Coffy standart porsiyon için ihtiyatlı tahmin',
    servingBasis: '1 standart kafe porsiyonu; resmî boy ve reçete yayımlanmamıştır',
    notes: 'Coffy ürün başına resmî besin tablosu yayımlamıyor. Değerler ürün adı ve kategoriye dayalı ihtiyatlı tahmindir; gerçek reçete ve porsiyona göre değişebilir.',
    fieldStatus: Object.fromEntries(NUTRITION_FIELDS.map((field) => [field, 'estimated'])),
  };
}

function allergenMetadata(name, category, sourceUrl) {
  const allergens = strongNameAllergens(name, category);
  const hasMilk = allergens.includes('milk');
  const source = allergens.length > 0
    ? {
        status: 'estimated',
        url: sourceUrl,
        checkedAt: CHECKED_AT,
        notes: 'Yalnızca ürün adındaki açık bileşen ve reçete işaretleri kullanıldı; ikincil menü yüzeyi tam alerjen beyanı sunmadığı için başka alerjenler dışlanamaz.',
      }
    : {
        status: 'unavailable',
        url: sourceUrl,
        checkedAt: CHECKED_AT,
        notes: 'İkincil menü yüzeyi tam alerjen beyanı sunmuyor ve ürün adından güvenilir bir alerjen çıkarılamadı; boş liste güvenli olduğu anlamına gelmez.',
      };
  return { allergens, ...(hasMilk ? { containsLactose: true } : {}), allergenSource: source };
}

function seedIdFor(name, category) {
  const n = normalize(name);
  if (category === 'espresso_hot') {
    if (/mocha/.test(n)) return 'coffy_5_mocha';
    return 'coffy_2_coffy_caffe_latte';
  }
  if (category === 'espresso_iced') return 'coffy_8_iced_latte';
  if (category === 'frappe_blended') return 'coffy_12_chocolate_cookie_frappe';
  if (category === 'tea_herbal') {
    return /matcha/.test(n) ? 'espressolab_coconut_matcha' : 'coffy_blueberry_cool_hibiscus';
  }
  if (category === 'smoothie_juice') return 'mackbear_lemonade_regular';
  if (category === 'sandwich_savory') {
    return /simit/.test(n) ? 'caffe_nero_peynirli_mini_simit' : 'espressolab_eslab_mix_sandvic';
  }
  if (category === 'fit_healthy') return 'kahve_dunyasi_16_kahve_d_nyas__gofrik__antep_f_st_kl__';
  if (/chia puding/.test(n)) return 'caffe_nero_granola_pot';
  if (/cheesecake/.test(n)) return 'espressolab_yaban_mersinli_bardakta_cheesecake';
  if (/cookie/.test(n)) return 'caffe_nero_chocolate_chip_cookie';
  if (/muffin/.test(n)) return 'caffe_nero_cikolatali_muffin';
  if (/(brownie|mozaik|sufle)/.test(n)) return 'espressolab_brownie';
  if (/kruvasan/.test(n)) return 'coffy_17__ikolatal__kruvasan';
  if (/pogaca/.test(n)) return 'espressolab_anne_pogacasi';
  if (/havuclu/.test(n)) return 'gloria_jeans_kremali_havuclu_pasta';
  return 'espressolab_kremali_acibadem_pasta';
}

function descriptionFor(product) {
  const factual = product.descriptions?.[0];
  return factual
    ? `${factual} ${product.branchCount} şube ve ${product.cityCount} şehirde ${CHECKED_AT} tarihinde gözlemlendi.`
    : `Coffy menüsünde ${product.branchCount} şube ve ${product.cityCount} şehirde ${CHECKED_AT} tarihinde gözlemlendi.`;
}

function applyObservedFacts(item, product) {
  const sourceUrl = product.sourceUrls[0];
  assert(/^https:\/\//.test(sourceUrl), `Missing HTTPS source for ${product.name}`);
  assert(product.availabilityScope === 'chain_core', `${product.name} is not chain_core`);
  assert(product.branchCount >= 3 && product.cityCount >= 2, `${product.name} does not meet coverage rule`);
  const nameForInference = item.name;
  const macros = estimateCoffyMacros(nameForInference, product.category);
  const allergen = allergenMetadata(nameForInference, product.category, sourceUrl);
  item.category = product.category;
  item.productKind = FOOD_CATEGORIES.has(product.category) ? 'food' : 'drink';
  item.isDrink = item.productKind === 'drink';
  item.baseMacros = macros;
  item.allergens = allergen.allergens;
  delete item.containsLactose;
  if (allergen.containsLactose) item.containsLactose = true;
  delete item.crossContactRisks;
  item.allergenSource = allergen.allergenSource;
  item.dietaryTags = [];
  item.glycemicImpact = glycemic(macros);
  item.availability = 'current';
  item.catalogSource = { url: sourceUrl, checkedAt: CHECKED_AT, kind: 'secondary' };
  item.nutritionSource = nutritionSource();
  if (!item.isDrink) {
    delete item.defaultSizeId;
    delete item.defaultMilkId;
    delete item.defaultSyrupPumps;
    delete item.baseCustomization;
  }
}

async function prepareSeedDerivative(seedPath, targetPath) {
  const input = readFileSync(seedPath);
  const metadata = await sharp(input).metadata();
  assert(metadata.width && metadata.height, `Unreadable seed image: ${seedPath}`);
  // Existing licensed fallbacks have a bottom attribution label. Cropping the
  // lower 30% removes it before the optimizer adds the new product's label.
  const cropHeight = Math.max(1, Math.floor(metadata.height * 0.7));
  const output = await sharp(input)
    .extract({ left: 0, top: 0, width: metadata.width, height: cropHeight })
    .resize({ width: 640, height: 480, fit: 'cover', position: 'attention' })
    .webp({ quality: 86, effort: 4 })
    .toBuffer();
  mkdirSync(path.dirname(targetPath), { recursive: true });
  writeFileSync(targetPath, output);
}

export async function publishCoffyCatalog() {
  const observationsText = readFileSync(OBSERVATIONS_PATH, 'utf8');
  const observations = JSON.parse(observationsText);
  const release = readJson(RELEASE_PATH);
  const assets = readJson(ASSETS_PATH);
  const provenance = readJson(PROVENANCE_PATH);
  assert(observations.schemaVersion === 1 && observations.chainId === 'coffy', 'Unexpected Coffy snapshot');
  assert(observations.observedAt === CHECKED_AT, 'Coffy observation date drift');
  assert(observations.counts.productCount === 78, 'Expected 78 observed Coffy products');
  assert(observations.counts.reconcileCandidateCount === 22, 'Expected 22 Coffy reconciliations');
  assert(observations.counts.additionCandidateCount === 56, 'Expected 56 Coffy additions');
  assert(observations.counts.unobservedExistingCatalogCount === 8, 'Expected 8 retained unobserved products');
  assert(observations.additionCandidates.every((candidate) => candidate.availabilityScope === 'chain_core'), 'Only chain_core candidates may be published');
  assert(release.schemaVersion === 1 && Array.isArray(release.items), 'Invalid release snapshot');
  assert(provenance.schemaVersion === 1 && provenance.records, 'Invalid provenance manifest');

  // Older Commons snapshots retained the correct Public domain label but no
  // canonical rights URL. Backfill the canonical mark before any derivative
  // inherits that attribution.
  for (const record of Object.values(provenance.records)) {
    if (record.sourceKind === 'licensed_fallback' && record.license === 'Public domain' && record.licenseUrl === 'unknown') {
      record.licenseUrl = 'https://creativecommons.org/publicdomain/mark/1.0/';
    }
  }

  const itemsById = new Map(release.items.map((item) => [item.id, item]));
  assert(itemsById.size === release.items.length, 'Duplicate release IDs before Coffy promotion');
  const productsByKey = new Map(observations.products.map((product) => [product.normalizedKey, product]));
  const reconciledIds = [];

  for (const candidate of observations.reconcileCandidates) {
    const item = itemsById.get(candidate.catalogId);
    const product = observations.products.find((entry) => entry.name === candidate.productName);
    assert(item?.chainId === 'coffy', `Missing Coffy reconciliation target ${candidate.catalogId}`);
    assert(product, `Missing observed product ${candidate.productName}`);
    applyObservedFacts(item, product);
    reconciledIds.push(item.id);
  }

  // All Coffy nutrition is estimated and carries the same explicit serving
  // caveat, including the eight retained products not seen in this snapshot.
  for (const item of release.items.filter((entry) => entry.chainId === 'coffy')) {
    item.nutritionSource = nutritionSource();
  }

  const newRows = [];
  const newAssetRows = [];
  for (const candidate of observations.additionCandidates) {
    const product = productsByKey.get(candidate.normalizedKey);
    assert(product, `Missing product for addition ${candidate.name}`);
    assert(product.name === candidate.name, `Candidate name drift for ${candidate.name}`);
    const id = coffyCatalogId(product.name);
    const image = imagePathFor(product.name);
    let item = itemsById.get(id);
    const existedBefore = Boolean(item);
    if (!item) {
      item = {
        id,
        chainId: 'coffy',
        name: product.name,
        category: product.category,
        productKind: FOOD_CATEGORIES.has(product.category) ? 'food' : 'drink',
        description: descriptionFor(product),
        image,
        isDrink: !FOOD_CATEGORIES.has(product.category),
        baseMacros: estimateCoffyMacros(product.name, product.category),
        allergens: [],
        allergenSource: { status: 'unavailable' },
        dietaryTags: [],
        availability: 'current',
        catalogSource: { url: product.sourceUrls[0], checkedAt: CHECKED_AT, kind: 'secondary' },
        nutritionSource: nutritionSource(),
        imageSource: { url: '', kind: 'licensed_fallback', exactProduct: false },
      };
      newRows.push(item);
      itemsById.set(id, item);
    }
    assert(item.chainId === 'coffy' && item.name === product.name, `Stable ID collision for ${id}`);
    item.description = descriptionFor(product);
    item.image = image;
    applyObservedFacts(item, product);

    const seedId = seedIdFor(product.name, product.category);
    const seedItem = itemsById.get(seedId);
    const seedAsset = assets[seedId];
    const seedProvenance = provenance.records[seedId];
    assert(seedItem && seedAsset && seedProvenance, `Missing image seed ${seedId} for ${id}`);
    assert(seedAsset.kind === 'licensed_fallback' && seedAsset.exactProduct === false, `Seed ${seedId} is not a licensed fallback`);
    assert(seedProvenance.sourceKind === 'licensed_fallback' && seedProvenance.exactProduct === false, `Seed provenance ${seedId} is not a licensed fallback`);
    item.imageSource = { url: seedAsset.sourceUrl, kind: 'licensed_fallback', exactProduct: false };

    const asset = {
      id,
      file: image,
      sourceUrl: seedAsset.sourceUrl,
      pageUrl: seedAsset.pageUrl,
      kind: 'licensed_fallback',
      exactProduct: false,
      license: seedAsset.license,
      derivedFromProductId: seedId,
    };
    assets[id] = asset;
    provenance.records[id] = {
      imagePath: image,
      sourceUrl: seedProvenance.sourceUrl,
      sourcePageUrl: seedProvenance.sourcePageUrl,
      sourceKind: 'licensed_fallback',
      exactProduct: false,
      author: seedProvenance.author,
      license: seedProvenance.license,
      licenseUrl: seedProvenance.licenseUrl,
      metadataVerification: seedProvenance.metadataVerification,
      derivedFromProductId: seedId,
      derivativePolicy: 'local crop of tracked licensed seed; product/chain label applied by optimize-menu-images.mjs',
    };
    newAssetRows.push({ id, seedId, image, sourceUrl: seedAsset.sourceUrl });

    const targetPath = path.join(ROOT, 'public', image.replace(/^\//, ''));
    if (!existedBefore || !existsSync(targetPath)) {
      const seedPath = path.join(ROOT, 'public', seedItem.image.replace(/^\//, ''));
      assert(existsSync(seedPath), `Missing local seed image ${seedItem.image}`);
      await prepareSeedDerivative(seedPath, targetPath);
    }
  }

  if (newRows.length > 0) {
    const lastCoffyIndex = release.items.reduce(
      (last, item, index) => (item.chainId === 'coffy' ? index : last),
      -1,
    );
    assert(lastCoffyIndex >= 0, 'No Coffy section in catalog release');
    release.items.splice(lastCoffyIndex + 1, 0, ...newRows);
  }

  const finalIds = new Set(release.items.map((item) => item.id));
  assert(finalIds.size === release.items.length, 'Duplicate release IDs after Coffy promotion');
  const coffyRows = release.items.filter((item) => item.chainId === 'coffy');
  assert(coffyRows.length === 86, `Expected 86 Coffy products, found ${coffyRows.length}`);
  assert(release.items.length === 1006, `Expected 1006 total products, found ${release.items.length}`);
  const retainedIds = observations.unobservedCatalogItems.map((item) => item.id);
  assert(retainedIds.every((id) => finalIds.has(id)), 'An unobserved Coffy product was removed');
  assert(observations.additionCandidates.every((candidate) => finalIds.has(coffyCatalogId(candidate.name))), 'A Coffy addition candidate is missing');
  assert(coffyRows.every((item) => item.nutritionSource?.status === 'estimated'), 'Every Coffy nutrition source must be estimated');
  assert(coffyRows.every((item) => NUTRITION_FIELDS.every((field) => item.nutritionSource.fieldStatus[field] === 'estimated')), 'Every Coffy nutrition field must be estimated');

  release.checkedAt = CHECKED_AT;
  release.source = 'Normalized approved release snapshot; field provenance is embedded per item and Coffy promotion is recorded in coffy_catalog_publication.json.';
  const releaseText = writeJson(RELEASE_PATH, release);
  const assetsText = writeJson(ASSETS_PATH, assets);

  provenance.sourceSnapshot = 'scripts/catalog_sources/catalog_assets.json';
  provenance.sourceSnapshotSha256 = sha256(assetsText);
  provenance.recordCount = Object.keys(provenance.records).length;
  provenance.records = Object.fromEntries(
    Object.entries(provenance.records).sort(([left], [right]) => left.localeCompare(right, 'en')),
  );
  assert(provenance.recordCount === release.items.length, 'Provenance count does not match release');
  assert(
    Object.values(provenance.records).every((record) => (
      record.sourceKind !== 'licensed_fallback'
      || (record.license !== 'unknown' && /^https:\/\//.test(record.licenseUrl))
    )),
    'Every licensed fallback must retain a declared license and canonical HTTPS license URL',
  );
  provenance.issues = [];
  writeJson(PROVENANCE_PATH, provenance);

  const legacy = readJson(LEGACY_PATH);
  legacy.checkedAt = CHECKED_AT;
  legacy.productIds = release.items
    .filter((item) => item.catalogSource?.kind === 'legacy_unverified')
    .map((item) => item.id)
    .sort((left, right) => left.localeCompare(right, 'en'));
  writeJson(LEGACY_PATH, legacy);

  const publication = {
    schemaVersion: 1,
    publishedAt: CHECKED_AT,
    observationSnapshot: 'scripts/catalog_sources/coffy_observations.json',
    observationSnapshotSha256: sha256(observationsText),
    approvedRelease: 'scripts/catalog_sources/catalog_release.json',
    approvedReleaseSha256: sha256(releaseText),
    sourcePolicy: 'Five Yemeksepeti branches across three cities; Coffy officially directs ordering users to Yemeksepeti. Catalog provenance is secondary, never official.',
    inclusionRule: 'chain_core: observed at no fewer than 3 branches across no fewer than 2 cities',
    nutritionPolicy: 'No official product nutrition was found; all eight fields are conservative name/category estimates for one unspecified standard serving.',
    allergenPolicy: 'Only allergens strongly signalled by the name are included. Empty lists use unavailable status and never imply safety; no dietary safety tags are assigned.',
    imagePolicy: 'Each new product has a unique local path derived from a category-appropriate tracked licensed fallback. The optimizer applies a Coffy/product label; fallback images are never marked official or exact.',
    counts: {
      observedProducts: observations.counts.productCount,
      reconciledExisting: reconciledIds.length,
      addedProducts: observations.additionCandidates.length,
      retainedUnobservedExisting: retainedIds.length,
      coffyProductsAfterPublication: coffyRows.length,
      catalogProductsAfterPublication: release.items.length,
    },
    reconciledCatalogIds: reconciledIds.sort((left, right) => left.localeCompare(right, 'en')),
    manualReconciliations: observations.reconcileCandidates
      .filter((candidate) => candidate.matchKind === 'manual_review')
      .map((candidate) => ({
        catalogId: candidate.catalogId,
        observedProductName: candidate.productName,
        decision: 'retained existing stable ID after human-reviewed close-name reconciliation',
        rationale: candidate.rationale,
      })),
    addedProducts: newAssetRows.sort((left, right) => left.id.localeCompare(right.id, 'en')),
    retainedUnobservedCatalogIds: retainedIds.sort((left, right) => left.localeCompare(right, 'en')),
  };
  writeJson(PUBLICATION_PATH, publication);

  return publication.counts;
}

const invoked = process.argv[1] ? path.resolve(process.argv[1]) : null;
if (invoked === fileURLToPath(import.meta.url)) {
  const counts = await publishCoffyCatalog();
  console.log(JSON.stringify(counts, null, 2));
}
