#!/usr/bin/env node
/**
 * Fetch the current Caffè Nero Türkiye menu into a review candidate.
 *
 * The official site renders every product twice (card + detail popover), so
 * this parser deliberately starts only from `button.menu__product` cards.
 * Sizes are attributes of one product and are never emitted as separate rows.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { semanticCatalogDiff } from './catalog-semantic-diff.mjs';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const BASELINE = path.join(ROOT, 'scripts', 'catalog_sources', 'caffe_nero.json');
const OUTPUT = path.join(ROOT, 'tmp', 'catalog_drift', 'caffe_nero-candidate.json');
const REPORT = path.join(ROOT, 'tmp', 'catalog_drift', 'caffe_nero-report.json');
let CHECKED_AT = new Date().toISOString().slice(0, 10);
const USER_AGENT = 'KaloriCafeCatalog/1.0 (+https://kalorikafe.github.io/)';

const PAGES = [
  { section: 'Sıcak Kahveler', url: 'https://www.caffenero.com/tr/menu/kahveler/sicak-kahveler', category: 'espresso_hot', isDrink: true },
  { section: 'Soğuk Kahveler', url: 'https://www.caffenero.com/tr/menu/kahveler/soguk-kahveler', category: 'espresso_iced', isDrink: true },
  { section: 'Sıcak İçecekler', url: 'https://www.caffenero.com/tr/menu/icecekler/sicak-icecekler', category: 'tea_herbal', isDrink: true },
  { section: 'Soğuk İçecekler', url: 'https://www.caffenero.com/tr/menu/icecekler/soguk-icecekler', category: 'smoothie_juice', isDrink: true },
  { section: 'Deli To Go', url: 'https://www.caffenero.com/tr/menu/yiyecekler/deli-to-go', category: 'sandwich_savory', isDrink: false },
  { section: 'Bakery', url: 'https://www.caffenero.com/tr/menu/yiyecekler/bakery', category: 'bakery_dessert', isDrink: false },
  { section: 'Atıştırmalık', url: 'https://www.caffenero.com/tr/menu/yiyecekler/atistirmalik', category: 'bakery_dessert', isDrink: false },
];

const LEGACY_ALIASES = new Map([
  ['Americano', ['Caffè Americano']],
  ['Mocha', ['Caffè Mocha']],
  ['Sıcak Çikolata Milano', ['Milano Sıcak Çikolata']],
  ['Chai Latte', ['Chai Tea Latte']],
  ['Mozzarella ve Domatesli Panino', ['Mozzarella & Domatesli Panino']],
  ['Sezar Tavuklu Wrap', ['Tavuklu Sezar Sandviç']],
  ['Eski Kaşar, Gravyer ve Biber Salçalı Köy Tostu', ['Üç Peynirli Tost']],
  ['Çikolatalı Croissant', ['Çikolatalı Kruvasan']],
  ['Nero Premium SS Cheesecake', ['Nero Premium San Sebastian Cheesecake']],
]);

function parseArgs(argv) {
  const options = {
    checkedAt: new Date().toISOString().slice(0, 10),
    baseline: BASELINE,
    output: OUTPUT,
    report: REPORT,
    state: null,
    maxDropRate: 0.20,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const value = argv[i + 1];
    if (arg === '--checked-at') { options.checkedAt = value; i += 1; }
    else if (arg === '--baseline') { options.baseline = path.resolve(value); i += 1; }
    else if (arg === '--output') { options.output = path.resolve(value); i += 1; }
    else if (arg === '--report') { options.report = path.resolve(value); i += 1; }
    else if (arg === '--state') { options.state = path.resolve(value); i += 1; }
    else if (arg === '--max-drop') { options.maxDropRate = Number(value); i += 1; }
    else throw new Error(`Unknown or incomplete argument: ${arg}`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(options.checkedAt)) throw new Error('--checked-at must be YYYY-MM-DD');
  if (!(options.maxDropRate >= 0 && options.maxDropRate < 1)) throw new Error('--max-drop must be in [0, 1)');
  if (path.resolve(options.output) === path.resolve(options.baseline)) {
    throw new Error('Fetcher output may not overwrite the approved baseline; review the drift report and promote separately');
  }
  return options;
}

function decodeHtml(value = '') {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#([0-9]+);/g, (_, code) => String.fromCodePoint(Number.parseInt(code, 10)))
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&apos;|&#x27;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function textOf(html = '') {
  return decodeHtml(html.replace(/<br\s*\/?\s*>/gi, ' ').replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

function attrOf(tag, name) {
  const match = tag.match(new RegExp(`${name}=["']([^"']*)["']`, 'i'));
  return match ? decodeHtml(match[1]) : '';
}

function normalizeName(sourceName) {
  let name = sourceName.replace(/\s+/g, ' ').trim();
  const replacements = [
    [/Amerıcano/g, 'Americano'],
    [/Caffé/g, 'Caffè'],
    [/Cappuccıno/g, 'Cappuccino'],
    [/Whıte/g, 'White'],
    [/Macchıato/g, 'Macchiato'],
    [/Rıstretto/g, 'Ristretto'],
    [/Mılano/g, 'Milano'],
    [/Chaı/g, 'Chai'],
    [/Pıstachıo/g, 'Pistachio'],
    [/Rooıbos/g, 'Rooibos'],
    [/Arrabbıata/g, 'Arrabbiata'],
    [/Sedanı Rıgatı/g, 'Sedani Rigati'],
    [/Croıssant/g, 'Croissant'],
    [/Tıramısu/g, 'Tiramisu'],
    [/Premıum/g, 'Premium'],
    [/Dı Fruttı/g, 'Di Frutti'],
    [/Trıple/g, 'Triple'],
    [/Cookıe/g, 'Cookie'],
    [/Chıp/g, 'Chip'],
    [/Brownıe/g, 'Brownie'],
    [/Muffın/g, 'Muffin'],
  ];
  for (const [pattern, replacement] of replacements) name = name.replace(pattern, replacement);

  const displayFixes = new Map([
    ['ICED CAPPUCCINO', 'Iced Cappuccino'],
    ['ICED FLAT WHITE', 'Iced Flat White'],
    ['ICED WHITE CHOCOLATE MOCHA', 'Iced White Chocolate Mocha'],
    ['CHAI LATTE', 'Chai Latte'],
    ['LYCHEE & STRAWBERRY LEMONADE', 'Lychee & Strawberry Lemonade'],
    ['FRESH LIME & MINT COOLER', 'Fresh Lime & Mint Cooler'],
    ['WATERMELON & STRAWBERRY MINT COOLER', 'Watermelon & Strawberry Mint Cooler'],
    ['STRAWBERRY & BANANA', 'Strawberry & Banana'],
    ['MANGO & PASSION FRUIT', 'Mango & Passion Fruit'],
    ['Rooibos Çayı-Kurutulmuş Ananas-Kivi Parçacıkları', 'Rooibos Çayı - Kurutulmuş Ananas - Kivi Parçacıkları'],
    ['ÇİLEK', 'Çilekli Milkshake'],
    ['ÇİKOLATA', 'Çikolatalı Milkshake'],
    ['MUZ', 'Muzlu Milkshake'],
  ]);
  name = displayFixes.get(name) || name;
  if (name === name.toLocaleUpperCase('tr-TR') && /\p{L}/u.test(name)) {
    name = name
      .toLocaleLowerCase('tr-TR')
      .replace(/(^|[\s-])(\p{L})/gu, (_, prefix, letter) => `${prefix}${letter.toLocaleUpperCase('tr-TR')}`)
      .replace(/\bVe\b/g, 've');
  }
  return name;
}

function classify(page, name) {
  const n = name.toLocaleLowerCase('tr-TR');
  if (page.section === 'Soğuk Kahveler' && n.includes('cold brew')) return 'cold_brew';
  if (page.section === 'Soğuk İçecekler') {
    if (/frapp|milkshake/.test(n)) return 'frappe_blended';
    if (/matcha|çayı|tea/.test(n)) return 'tea_herbal';
    return 'smoothie_juice';
  }
  if (page.section === 'Deli To Go' && /salata|müsli|chia|porridge|granola/.test(n)) return 'fit_healthy';
  if (page.section === 'Bakery' && /sausage roll|pide|poğaça|açma|çörek|mini çatal/.test(n)) return 'sandwich_savory';
  if (page.section === 'Atıştırmalık' && n.includes('mini çatal')) return 'sandwich_savory';
  return page.category;
}

function visualSlot(name, category, isDrink) {
  const n = name.toLocaleLowerCase('tr-TR');
  if (!isDrink) {
    if (/cheesecake/.test(n)) return n.includes('ss cheesecake') ? 'baked-cheesecake' : 'cheesecake';
    if (/croissant/.test(n)) return n.includes('çikolata') ? 'chocolat-croissant' : 'croissant';
    if (/muffin/.test(n)) return 'muffin';
    if (/cookie|acıbadem/.test(n)) return 'cookie';
    if (/brownie|mozaik/.test(n)) return 'brownie';
    if (/tiramisu/.test(n)) return 'tiramisu';
    if (/kek|cake|pasta|panna cotta|pie|tart/.test(n)) return 'cake';
    if (/simit/.test(n)) return 'simit';
    if (/poğaça|açma|çörek|pide|mini çatal/.test(n)) return 'pogaca';
    if (/wrap/.test(n)) return 'wrap';
    if (/panino|ciabatta|sandviç|tost/.test(n)) return 'sandwich';
    if (/salata|müsli|chia|porridge|granola/.test(n)) return 'salad-bowl';
    return category === 'sandwich_savory' ? 'sandwich' : 'cake';
  }
  if (/milkshake|frapp/.test(n)) return 'frappe';
  if (/cold brew/.test(n)) return 'cold-brew';
  if (/matcha/.test(n)) return 'matcha';
  if (/chai/.test(n)) return 'chai';
  if (/sıcak çikolata/.test(n)) return 'hot-chocolate';
  if (/limonata|lemonade/.test(n)) return 'lemonade';
  if (/cooler|hibiskus|rooibos|kelebek çayı/.test(n)) return 'refresher';
  if (/mango|strawberry|çilek|muz/.test(n) && category === 'smoothie_juice') return 'smoothie';
  if (/türk kahvesi/.test(n)) return 'turkish';
  if (/americano|filtre/.test(n)) return /iced|soğuk/.test(n) ? 'iced-americano' : 'americano';
  if (/espresso/.test(n)) return /freddo/.test(n) ? 'iced-americano' : 'espresso';
  if (/cappuccino/.test(n)) return /iced/.test(n) ? 'iced-latte' : 'cappuccino';
  if (/flat white/.test(n)) return /iced/.test(n) ? 'iced-latte' : 'flat-white';
  if (/cortado/.test(n)) return 'cortado';
  if (/macchiato/.test(n)) return /iced/.test(n) ? 'iced-latte' : 'macchiato';
  if (/mocha/.test(n)) return /iced/.test(n) ? 'iced-latte' : (n.includes('white') ? 'white-mocha' : 'mocha');
  if (/latte/.test(n)) return /iced/.test(n) ? 'iced-latte' : 'latte';
  return category === 'tea_herbal' ? 'tea' : 'latte';
}

function estimatedCaffeine(name, category, isDrink) {
  if (!isDrink) return /tiramisu/.test(name.toLocaleLowerCase('tr-TR')) ? 35 : (/çikolata|cookie|brownie/.test(name.toLocaleLowerCase('tr-TR')) ? 10 : 0);
  const n = name.toLocaleLowerCase('tr-TR');
  if (/matcha/.test(n)) return 65;
  if (/chai/.test(n)) return 60;
  if (/filtre/.test(n)) return 170;
  if (/cold brew/.test(n)) return 170;
  if (/türk kahvesi/.test(n)) return 60;
  if (/^espresso(?: ristretto| con panna| macchiato)?$/.test(n)) return 80;
  if (/americano|espresso|freddo/.test(n)) return 160;
  if (/latte|cappuccino|flat white|cortado|mocha|caramelatte|macchiato/.test(n)) return 160;
  if (/frapp/.test(n)) return /coffee|kahve|mocha/.test(n) ? 90 : 0;
  if (/çikolata/.test(n)) return 15;
  if (/çayı|tea|hibiskus|rooibos/.test(n)) return 35;
  return category === 'espresso_iced' || category === 'espresso_hot' ? 160 : 0;
}

function mapAllergen(raw) {
  const n = raw.toLocaleLowerCase('tr-TR');
  if (n.includes('gluten')) return 'gluten';
  if (n.includes('kabuklu deniz') || n.includes('kabuklular')) return 'crustaceans';
  if (n.includes('süt')) return 'milk';
  if (n.includes('yer fıstığı')) return 'peanut';
  if (n.includes('kuruyemiş') || n.includes('sert kabuklu')) return 'nuts';
  if (n.includes('yumurta')) return 'egg';
  if (n.includes('soya')) return 'soy';
  if (n.includes('balık')) return 'fish';
  if (n.includes('kereviz')) return 'celery';
  if (n.includes('hardal')) return 'mustard';
  if (n.includes('susam')) return 'sesame';
  if (n.includes('sülfür') || n.includes('sülfit')) return 'sulphites';
  if (n.includes('acı bakla') || n.includes('lupin')) return 'lupin';
  if (n.includes('yumuşakça')) return 'molluscs';
  return null;
}

function numberFromCell(value) {
  const match = textOf(value).replace(',', '.').match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function parseNutrition(segment, name, category, isDrink, productUrl) {
  const sizeMatches = [...segment.matchAll(/<details\b[^>]*class="[^"]*menu__product-detail__size[^"]*"[^>]*>([\s\S]*?)<\/details>/gi)];
  const candidates = sizeMatches.map(match => {
    const body = match[1];
    const summary = textOf((body.match(/<summary\b[^>]*>([\s\S]*?)<\/summary>/i) || [])[1] || '');
    return { body, summary };
  });
  const chosen = candidates.find(candidate => /^regular$/i.test(candidate.summary))
    || candidates.find(candidate => !candidate.summary)
    || candidates[0]
    || { body: segment, summary: '' };
  const table = (chosen.body.match(/<table\b[^>]*class="[^"]*dataset[^"]*"[^>]*>([\s\S]*?)<\/table>/i) || [])[1];

  const allergenScope = chosen.body || segment;
  const allergenBlock = (allergenScope.match(/<dl\b[^>]*class="[^"]*menu__product-detail__allergens[^"]*"[^>]*>([\s\S]*?)<\/dl>/i)
    || segment.match(/<dl\b[^>]*class="[^"]*menu__product-detail__allergens[^"]*"[^>]*>([\s\S]*?)<\/dl>/i));
  const sourceAllergens = allergenBlock
    ? [...allergenBlock[1].matchAll(/<dd\b[^>]*>([\s\S]*?)<\/dd>/gi)].map(match => textOf(match[1]).replace(/\s+,?$/, '')).filter(Boolean)
    : [];
  const allergens = [...new Set(sourceAllergens.map(mapAllergen).filter(Boolean))];
  const caffeine = estimatedCaffeine(name, category, isDrink);
  const estimatedPayload = (notes, servingBasis) => ({
    sourceAllergens,
    allergens,
    allergenSourceAvailable: Boolean(allergenBlock),
    baseMacros: { caffeine },
    officialNutritionFields: [],
    derivedNutritionFields: [],
    nutritionSource: {
      status: 'estimated',
      label: 'Standart tarif/porsiyon bazlı tahmin',
      url: productUrl,
      verifiedAt: CHECKED_AT,
      servingBasis,
      notes,
    },
  });

  if (!table) {
    return estimatedPayload(
      'Resmî ürün sayfasında sayısal besin tablosu yayınlanmadığı için makrolar standart tarif ve porsiyon üzerinden tahmin edildi.',
      'standart porsiyon',
    );
  }

  const rows = new Map();
  for (const match of table.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const cells = [...match[1].matchAll(/<(?:th|td)\b[^>]*>([\s\S]*?)<\/(?:th|td)>/gi)].map(cell => cell[1]);
    if (cells.length >= 3) rows.set(textOf(cells[0]), { per100: numberFromCell(cells[1]), product: numberFromCell(cells[2]) });
  }
  const caloriesRow = rows.get('Enerji (kcal)');
  const useProduct = Number.isFinite(caloriesRow?.product) && caloriesRow.product > 0 && caloriesRow.product <= 2000;
  const usePer100 = !useProduct && Number.isFinite(caloriesRow?.per100) && caloriesRow.per100 > 0 && caloriesRow.per100 <= 1000;
  if (!useProduct) {
    const notes = usePer100
      ? 'Resmî sayfada yalnız 100 g değeri yayınlandığı ve ürün porsiyonu belirtilmediği için bu değer ürün porsiyonu gibi kullanılmadı; makrolar standart porsiyon üzerinden tahmin edildi.'
      : 'Resmî sayfada besin alanı bulunuyor ancak sayısal porsiyon verisi yayınlanmadığı için makrolar tahmin edildi.';
    return estimatedPayload(notes, chosen.summary || 'standart porsiyon');
  }

  const pick = label => rows.get(label)?.product;
  const raw = {
    calories: pick('Enerji (kcal)'),
    protein: pick('Protein'),
    carbs: pick('Karbonhidratlar'),
    sugar: pick('Şekerler'),
    fat: pick('Yağ'),
    satFat: pick('Doymuş Yağ'),
  };
  const baseMacros = {};
  for (const [key, value] of Object.entries(raw)) {
    const max = key === 'calories' ? 2000 : 500;
    if (Number.isFinite(value) && value >= 0 && value <= max) baseMacros[key] = value;
  }
  if (Number.isFinite(baseMacros.sugar) && Number.isFinite(baseMacros.carbs) && baseMacros.sugar > baseMacros.carbs) delete baseMacros.sugar;
  if (Number.isFinite(baseMacros.satFat) && Number.isFinite(baseMacros.fat) && baseMacros.satFat > baseMacros.fat) delete baseMacros.satFat;
  const salt = pick('Tuz');
  const derivedNutritionFields = [];
  if (Number.isFinite(salt) && salt >= 0 && salt <= 20) {
    baseMacros.sodium = Math.round(salt * 400);
    derivedNutritionFields.push('sodium');
  }
  const derivedEnergy = 4 * ((baseMacros.protein || 0) + (baseMacros.carbs || 0)) + 9 * (baseMacros.fat || 0);
  const energyLooksWrong = Number.isFinite(baseMacros.calories)
    && Number.isFinite(baseMacros.protein)
    && Number.isFinite(baseMacros.carbs)
    && Number.isFinite(baseMacros.fat)
    && derivedEnergy > Math.max(baseMacros.calories * 1.8, baseMacros.calories + 100);
  if (energyLooksWrong) {
    return estimatedPayload(
      'Resmî porsiyon tablosu enerji ve makro tutarlılık kontrolünü geçmediği için değerler içeri alınmadı; makrolar standart tarif ve porsiyon üzerinden tahmin edildi.',
      chosen.summary || 'standart porsiyon',
    );
  }
  baseMacros.caffeine = caffeine;
  const officialNutritionFields = Object.keys(baseMacros).filter(
    key => key !== 'caffeine' && !derivedNutritionFields.includes(key),
  );
  const expectedFields = ['calories', 'protein', 'carbs', 'sugar', 'fat', 'satFat', 'sodium'];
  const sourcedFields = new Set([...officialNutritionFields, ...derivedNutritionFields]);
  const estimatedFields = expectedFields.filter(key => !sourcedFields.has(key));
  const fieldLabels = {
    calories: 'kalori', protein: 'protein', carbs: 'karbonhidrat', sugar: 'şeker',
    fat: 'yağ', satFat: 'doymuş yağ', sodium: 'sodyum',
  };
  const estimatedFieldLabels = estimatedFields.map(key => fieldLabels[key]).join(', ');
  const completeOfficialRow = estimatedFields.length === 0;

  return {
    sourceAllergens,
    allergens,
    allergenSourceAvailable: Boolean(allergenBlock),
    baseMacros,
    officialNutritionFields,
    derivedNutritionFields,
    nutritionSource: {
      status: 'estimated',
      label: completeOfficialRow ? 'Resmî porsiyon makroları + tahmini kafein' : 'Resmî porsiyon değerleri + alan bazlı tahmin',
      url: productUrl,
      verifiedAt: CHECKED_AT,
      servingBasis: chosen.summary || 'ürün başına',
      notes: completeOfficialRow
        ? 'Kalori, protein, karbonhidrat, şeker, yağ ve tuz değerleri resmî Caffè Nero tablosundan alındı; sodyum tuzdan (×400 mg) türetildi. Kafein resmî tabloda bulunmadığı için tarif bazlı tahmindir.'
        : `Resmî porsiyon tablosundaki güvenilir alanlar kullanıldı; eksik veya tutarsız ${estimatedFieldLabels} alanları standart tariften tahmin edildi. Kafein resmî tabloda bulunmadığı için tarif bazlı tahmindir.`,
    },
  };
}

function defaultSizeId(name) {
  const n = name.toLocaleLowerCase('tr-TR');
  return /^(espresso(?: ristretto| con panna| macchiato)?|türk kahvesi)$/.test(n)
    || /cortado|flat white/.test(n)
    ? 'short'
    : 'tall';
}

function parsePage(html, page) {
  const starts = [...html.matchAll(/<button\s+class="menu__product(?:\s[^"]*)?"[^>]*>/gi)];
  return starts.map((start, index) => {
    const end = starts[index + 1]?.index ?? html.length;
    const segment = html.slice(start.index, end);
    const cardEnd = segment.indexOf('</button>');
    const card = cardEnd >= 0 ? segment.slice(0, cardEnd + 9) : segment;
    const sourceName = textOf((card.match(/<h4\b[^>]*>([\s\S]*?)<\/h4>/i) || [])[1] || '');
    const name = normalizeName(sourceName);
    const detailDescription = textOf((segment.match(/<div\b[^>]*class="[^"]*menu__product-detail\s+slimscroll[^"]*"[^>]*>[\s\S]*?<h2\b[^>]*>[\s\S]*?<\/h2>\s*<p\b[^>]*>([\s\S]*?)<\/p>/i) || [])[1] || '');
    const cardDescription = textOf((card.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i) || [])[1] || '');
    const imageTag = (card.match(/<img\b[^>]*class="[^"]*menu__product-image[^"]*"[^>]*>/i) || [])[0] || '';
    const imageUrl = attrOf(imageTag, 'src');
    const category = classify(page, name);
    const nutrition = parseNutrition(segment, name, category, page.isDrink, page.url);
    const milkBased = page.isDrink && /latte|cappuccino|flat white|cortado|mocha|macchiato|caramelatte|con panna|sıcak çikolata|frapp|milkshake/i.test(name);
    if (milkBased && !nutrition.allergens.includes('milk')) {
      nutrition.allergens.push('milk');
      nutrition.allergens.sort();
      nutrition.allergenNotes = nutrition.allergenSourceAvailable
        ? 'Resmî alerjen listesine ek olarak ürün adı/açıklamasındaki varsayılan süt veya krema tarifi nedeniyle süt işaretlendi.'
        : 'Varsayılan süt veya krema tarifi nedeniyle süt işaretlendi; resmî sayfada ayrı alerjen tablosu yoktu.';
    }
    nutrition.containsLactose = nutrition.allergens.includes('milk');
    return {
      name,
      sourceName,
      ...(LEGACY_ALIASES.has(name) ? { aliases: LEGACY_ALIASES.get(name) } : {}),
      category,
      productKind: page.isDrink ? 'drink' : 'food',
      isDrink: page.isDrink,
      description: detailDescription || cardDescription.replace(/\.\.\.$/, ''),
      imageUrl,
      productUrl: page.url,
      sourceSection: page.section,
      seasonal: false,
      lifecycle: 'current',
      ...(page.isDrink ? { defaultSizeId: defaultSizeId(name), defaultMilkId: milkBased ? 'whole_milk' : null } : {}),
      visualSlot: visualSlot(name, category, page.isDrink),
      ...nutrition,
    };
  }).filter(product => product.name);
}

async function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  CHECKED_AT = options.checkedAt;
  const products = [];
  const sources = [];
  for (const page of PAGES) {
    const response = await fetch(page.url, { headers: { 'user-agent': USER_AGENT } });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${page.url}`);
    const html = await response.text();
    const pageProducts = parsePage(html, page);
    products.push(...pageProducts);
    sources.push({ url: page.url, status: response.status, checkedAt: CHECKED_AT, kind: 'official' });
    console.log(`${page.section}: ${pageProducts.length}`);
  }

  const payload = {
    chainId: 'caffe_nero',
    checkedAt: CHECKED_AT,
    canonicalizeExisting: true,
    refreshExisting: true,
    sources,
    products,
  };
  if (!fs.existsSync(options.baseline)) throw new Error(`Approved baseline not found: ${options.baseline}`);
  const baseline = JSON.parse(fs.readFileSync(options.baseline, 'utf8'));
  const state = options.state && fs.existsSync(options.state)
    ? JSON.parse(fs.readFileSync(options.state, 'utf8'))
    : { misses: {} };
  const report = semanticCatalogDiff({
    baseline,
    candidate: payload,
    state,
    checkedAt: CHECKED_AT,
    maxDropRate: options.maxDropRate,
  });

  fs.mkdirSync(path.dirname(options.output), { recursive: true });
  fs.mkdirSync(path.dirname(options.report), { recursive: true });
  fs.writeFileSync(options.output, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  fs.writeFileSync(options.report, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  const images = products.filter(product => product.imageUrl).length;
  const nutrition = products.filter(product => product.officialNutritionFields?.length).length;
  console.log(`Wrote ${products.length} candidate products to ${path.relative(ROOT, options.output)} (official images=${images}, official macro rows=${nutrition})`);
  console.log(`Drift report: ${path.relative(ROOT, options.report)}; drop=${(report.dropRate * 100).toFixed(1)}%; blocking=${report.blockingIssues.join(',') || 'none'}`);
  if (report.blockingIssues.length) process.exitCode = 2;
}

const directRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (directRun) await main();

export { mapAllergen, parseArgs, parsePage };
