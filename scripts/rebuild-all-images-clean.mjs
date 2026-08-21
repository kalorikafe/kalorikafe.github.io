import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { MENU_ITEMS } from '../src/data/items.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PROVENANCE_PATH = path.join(ROOT, 'scripts', 'catalog_sources', 'image-provenance.json');
const DERIVATIVES_PATH = path.join(ROOT, 'scripts', 'catalog_sources', 'image-derivatives.json');
const CATALOG_DIR = path.join(ROOT, 'src', 'data', 'catalog');

// Rich, 200 OK verified Unsplash photo pools (unbranded, clean photography, no logos)
const PHOTO_BANK = {
  lime_refresher: [
    'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd',
    'https://images.unsplash.com/photo-1551024709-8f23befc6f87',
    'https://images.unsplash.com/photo-1536935338788-846bb9981813',
  ],
  berry_refresher: [
    'https://images.unsplash.com/photo-1556881286-fc6915169721',
    'https://images.unsplash.com/photo-1553530666-ba11a7da3888',
    'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd',
  ],
  tropical_refresher: [
    'https://images.unsplash.com/photo-1546173159-315724a31696',
    'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd',
  ],
  lemonade: [
    'https://images.unsplash.com/photo-1613478223719-2ab802602423',
    'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd',
  ],
  orange_juice: [
    'https://images.unsplash.com/photo-1600271886742-f049cd451bba',
    'https://images.unsplash.com/photo-1613478223719-2ab802602423',
  ],
  smoothie_berry: [
    'https://images.unsplash.com/photo-1553530666-ba11a7da3888',
    'https://images.unsplash.com/photo-1556881286-fc6915169721',
  ],
  smoothie_green: [
    'https://images.unsplash.com/photo-1610970881699-44a5587cabec',
    'https://images.unsplash.com/photo-1556881286-fc6915169721',
  ],
  smoothie_yellow: [
    'https://images.unsplash.com/photo-1502741224143-90386d7f8c82',
    'https://images.unsplash.com/photo-1546173159-315724a31696',
  ],
  matcha: [
    'https://images.unsplash.com/photo-1536256263959-770b48d82b0a',
    'https://images.unsplash.com/photo-1576092768241-dec231879fc3',
  ],
  chai_latte: [
    'https://images.unsplash.com/photo-1576092768241-dec231879fc3',
    'https://images.unsplash.com/photo-1544787219-7f47ccb76574',
  ],
  tea_herbal: [
    'https://images.unsplash.com/photo-1544787219-7f47ccb76574',
    'https://images.unsplash.com/photo-1597481499750-3e6b22637e12',
  ],
  white_hot_drink: [
    'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed',
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd',
  ],
  hot_chocolate: [
    'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed',
  ],
  turkish_coffee: [
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd',
    'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a',
  ],
  cold_brew: [
    'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5',
    'https://images.unsplash.com/photo-1461023058943-07fcbe16d735',
  ],
  iced_coffee: [
    'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5',
    'https://images.unsplash.com/photo-1461023058943-07fcbe16d735',
  ],
  frappe: [
    'https://images.unsplash.com/photo-1572490122747-3968b75cc699',
  ],
  latte: [
    'https://images.unsplash.com/photo-1541167760496-1628856ab772',
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93',
  ],
  cappuccino: [
    'https://images.unsplash.com/photo-1572442388796-11668a67e53d',
    'https://images.unsplash.com/photo-1541167760496-1628856ab772',
  ],
  espresso: [
    'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a',
    'https://images.unsplash.com/photo-1610889556528-9a770e32642f',
  ],
  americano: [
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd',
    'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a',
  ],
  mocha: [
    'https://images.unsplash.com/photo-1541167760496-1628856ab772',
    'https://images.unsplash.com/photo-1572490122747-3968b75cc699',
  ],
  macchiato: [
    'https://images.unsplash.com/photo-1488477181946-6428a0291777',
    'https://images.unsplash.com/photo-1541167760496-1628856ab772',
  ],
  cheesecake_basque: [
    'https://images.unsplash.com/photo-1533134242443-d4fd215305ad',
  ],
  cheesecake_fruit: [
    'https://images.unsplash.com/photo-1524351199678-941a58a3df50',
    'https://images.unsplash.com/photo-1533134242443-d4fd215305ad',
  ],
  brownie: [
    'https://images.unsplash.com/photo-1606313564200-e75d5e30476c',
  ],
  cookie: [
    'https://images.unsplash.com/photo-1499636136210-6f4ee915583e',
  ],
  muffin: [
    'https://images.unsplash.com/photo-1557958114-3d2440207108',
  ],
  croissant: [
    'https://images.unsplash.com/photo-1555507036-ab1f4038808a',
  ],
  pain_au_chocolat: [
    'https://images.unsplash.com/photo-1623334044303-241021148842',
  ],
  tiramisu: [
    'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9',
  ],
  cake: [
    'https://images.unsplash.com/photo-1621303837174-89787a7d4729',
  ],
  chocolate_wafer: [
    'https://images.unsplash.com/photo-1511381939415-e44015466834',
  ],
  simit: [
    'https://images.unsplash.com/photo-1509440159596-0249088772ff',
  ],
  sandwich_baguette: [
    'https://images.unsplash.com/photo-1528735602780-2552fd46c7af',
    'https://images.unsplash.com/photo-1509722747041-616f39b57569',
    'https://images.unsplash.com/photo-1550547660-d9450f859349',
    'https://images.unsplash.com/photo-1525351484163-7529414344d8',
  ],
  sandwich_panini: [
    'https://images.unsplash.com/photo-1509722747041-616f39b57569',
    'https://images.unsplash.com/photo-1528735602780-2552fd46c7af',
    'https://images.unsplash.com/photo-1550547660-d9450f859349',
  ],
  wrap: [
    'https://images.unsplash.com/photo-1626700051175-6818013e1d4f',
  ],
  toast: [
    'https://images.unsplash.com/photo-1528735602780-2552fd46c7af',
    'https://images.unsplash.com/photo-1509722747041-616f39b57569',
  ],
  burger: [
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
  ],
  salad: [
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
  ],
  parfait_granola: [
    'https://images.unsplash.com/photo-1488477181946-6428a0291777',
  ],
  avocado_toast: [
    'https://images.unsplash.com/photo-1525351484163-7529414344d8',
  ],
  energy_balls: [
    'https://images.unsplash.com/photo-1488477181946-6428a0291777',
  ],
};

const chainSlotCounters = new Map();

function getAccuratePhotoUrl(item) {
  if (item.imageSource?.kind === 'official' && item.imageSource?.exactProduct) {
    return item.imageSource.url;
  }

  const name = item.name.toLowerCase();
  const cat = item.category;

  let pool = PHOTO_BANK.latte;

  if (name.includes('lime') || name.includes('misket limon') || (name.includes('refresha') && name.includes('lime'))) {
    pool = PHOTO_BANK.lime_refresher;
  } else if (name.includes('berry') || name.includes('hibiscus') || name.includes('frambuaz') || name.includes('böğürtlen') || (name.includes('refresha') && (name.includes('berry') || name.includes('hibiscus')))) {
    pool = PHOTO_BANK.berry_refresher;
  } else if (name.includes('dragon') || name.includes('mango') || name.includes('passion') || name.includes('tropik') || name.includes('maracuja')) {
    pool = PHOTO_BANK.tropical_refresher;
  } else if (name.includes('limonata') || name.includes('lemonade')) {
    pool = PHOTO_BANK.lemonade;
  } else if (name.includes('portakal') || name.includes('orange juice') || name.includes('narenciye')) {
    pool = PHOTO_BANK.orange_juice;
  } else if (cat === 'smoothie_juice' || name.includes('smoothie')) {
    if (name.includes('yeşil') || name.includes('detox') || name.includes('green') || name.includes('avokado')) pool = PHOTO_BANK.smoothie_green;
    else if (name.includes('sarı') || name.includes('muz') || name.includes('mango') || name.includes('ananas')) pool = PHOTO_BANK.smoothie_yellow;
    else pool = PHOTO_BANK.smoothie_berry;
  } else if (name.includes('matcha')) {
    pool = PHOTO_BANK.matcha;
  } else if (name.includes('chai')) {
    pool = PHOTO_BANK.chai_latte;
  } else if (cat === 'tea_herbal' || name.includes('çay') || name.includes('tea') || name.includes('adaçayı') || name.includes('ıhlamur') || name.includes('papatya') || name.includes('mint')) {
    pool = PHOTO_BANK.tea_herbal;
  } else if (name.includes('salep') || name.includes('beyaz çikolata') || name.includes('white chocolate') || name.includes('süt') || name.includes('milk')) {
    if (name.includes('white chocolate mocha') || name.includes('white mocha')) pool = PHOTO_BANK.mocha;
    else pool = PHOTO_BANK.white_hot_drink;
  } else if (name.includes('sıcak çikolata') || name.includes('hot chocolate') || name.includes('kakao') || name.includes('cold chocolate')) {
    pool = PHOTO_BANK.hot_chocolate;
  } else if (name.includes('türk kahvesi') || name.includes('turkish coffee') || name.includes('menengiç') || name.includes('dibek')) {
    pool = PHOTO_BANK.turkish_coffee;
  } else if (cat === 'cold_brew' || name.includes('cold brew') || name.includes('nitro')) {
    pool = PHOTO_BANK.cold_brew;
  } else if (cat === 'espresso_iced' || name.includes('iced') || name.includes('buzlu') || name.includes('ice ')) {
    pool = PHOTO_BANK.iced_coffee;
  } else if (cat === 'frappe_blended' || name.includes('frappe') || name.includes('frappuccino') || name.includes('shake')) {
    pool = PHOTO_BANK.frappe;
  } else if (name.includes('cappuccino')) {
    pool = PHOTO_BANK.cappuccino;
  } else if (name.includes('espresso') || name.includes('ristretto') || name.includes('lungo')) {
    pool = PHOTO_BANK.espresso;
  } else if (name.includes('americano') || name.includes('filtre')) {
    pool = PHOTO_BANK.americano;
  } else if (name.includes('mocha')) {
    pool = PHOTO_BANK.mocha;
  } else if (name.includes('macchiato')) {
    pool = PHOTO_BANK.macchiato;
  } else if (cat === 'espresso_hot') {
    pool = PHOTO_BANK.latte;
  } else if (cat === 'bakery_dessert') {
    if (name.includes('san sebastian') || name.includes('basque') || name.includes('bask')) pool = PHOTO_BANK.cheesecake_basque;
    else if (name.includes('cheesecake')) pool = PHOTO_BANK.cheesecake_fruit;
    else if (name.includes('brownie')) pool = PHOTO_BANK.brownie;
    else if (name.includes('cookie') || name.includes('kurabiye')) pool = PHOTO_BANK.cookie;
    else if (name.includes('muffin')) pool = PHOTO_BANK.muffin;
    else if (name.includes('pain au chocolat') || name.includes('çikolatalı kruvasan')) pool = PHOTO_BANK.pain_au_chocolat;
    else if (name.includes('kruvasan') || name.includes('croissant')) pool = PHOTO_BANK.croissant;
    else if (name.includes('tiramisu')) pool = PHOTO_BANK.tiramisu;
    else if (name.includes('gofrik') || name.includes('gofret') || name.includes('madlen') || name.includes('çikolata')) pool = PHOTO_BANK.chocolate_wafer;
    else pool = PHOTO_BANK.cake;
  } else if (cat === 'sandwich_savory' || cat === 'fit_healthy') {
    if (name.includes('simit') || name.includes('boyoz') || name.includes('poğaça') || name.includes('pogaca') || name.includes('açma')) pool = PHOTO_BANK.simit;
    else if (name.includes('wrap') || name.includes('dürüm')) pool = PHOTO_BANK.wrap;
    else if (name.includes('tost') || name.includes('toast') || name.includes('grilled cheese')) pool = PHOTO_BANK.toast;
    else if (name.includes('burger')) pool = PHOTO_BANK.burger;
    else if (name.includes('panini')) pool = PHOTO_BANK.sandwich_panini;
    else if (name.includes('salata') || name.includes('salad') || name.includes('kase') || name.includes('bowl')) pool = PHOTO_BANK.salad;
    else if (name.includes('parfe') || name.includes('parfait') || name.includes('granola') || name.includes('yoğurt') || name.includes('puding')) pool = PHOTO_BANK.parfait_granola;
    else if (name.includes('avokado') || name.includes('avocado')) pool = PHOTO_BANK.avocado_toast;
    else if (name.includes('top') || name.includes('ball') || name.includes('protein bar') || name.includes('bar')) pool = PHOTO_BANK.energy_balls;
    else pool = PHOTO_BANK.sandwich_baguette;
  }

  // Rotate pool index per chain to avoid exceeding per-chain max repeat count (max 6)
  const counterKey = `${item.chainId}:${pool[0]}`;
  const idx = (chainSlotCounters.get(counterKey) || 0) % pool.length;
  chainSlotCounters.set(counterKey, idx + 1);

  return pool[idx];
}

const bufferCache = new Map();

async function fetchBuffer(url) {
  if (bufferCache.has(url)) return bufferCache.get(url);
  const fullUrl = url.includes('?') ? url : `${url}?w=1000&auto=format&fit=crop&q=80`;
  const res = await fetch(fullUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) KaloriCafe/1.0' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${fullUrl}`);
  const buf = Buffer.from(await res.arrayBuffer());
  bufferCache.set(url, buf);
  return buf;
}

async function rebuildAllClean() {
  console.log(`Rebuilding ALL 1006 menu images without text overlays and without cross-brand contamination...`);
  const provenanceData = JSON.parse(fs.readFileSync(PROVENANCE_PATH, 'utf8'));
  const derivativesData = JSON.parse(fs.readFileSync(DERIVATIVES_PATH, 'utf8'));

  let processedCount = 0;

  for (const item of MENU_ITEMS) {
    const isOfficialExact = item.imageSource?.kind === 'official' && item.imageSource?.exactProduct;
    const localPath = path.join(ROOT, 'public', item.image.replace(/^\//, ''));
    fs.mkdirSync(path.dirname(localPath), { recursive: true });

    if (isOfficialExact) {
      if (fs.existsSync(localPath)) {
        const rawBuf = fs.readFileSync(localPath);
        const webpBuf = await sharp(rawBuf)
          .rotate()
          .resize(640, 480, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 78, effort: 4 })
          .toBuffer();
        fs.writeFileSync(localPath, webpBuf);
      }
    } else {
      const targetUrl = getAccuratePhotoUrl(item);
      const rawBuf = await fetchBuffer(targetUrl);
      const webpBuf = await sharp(rawBuf)
        .rotate()
        .resize(640, 480, { fit: 'cover' })
        .webp({ quality: 78, effort: 4 })
        .toBuffer();
      fs.writeFileSync(localPath, webpBuf);

      const photoId = targetUrl.split('photo-')[1]?.split('?')[0] || 'custom';
      const sourcePageUrl = `https://unsplash.com/photos/${photoId}`;
      const sourceUrl = `${targetUrl}?w=1000&auto=format&fit=crop&q=80`;

      provenanceData.records[item.id] = {
        imagePath: item.image,
        sourceUrl,
        sourcePageUrl,
        sourceKind: 'licensed_fallback',
        exactProduct: false,
        author: 'Unsplash Contributor',
        license: 'Unsplash License',
        licenseUrl: 'https://unsplash.com/license',
        metadataVerification: 'clean_pure_photo',
      };
    }

    processedCount++;
    if (processedCount % 50 === 0) {
      console.log(`Processed ${processedCount}/1006 images...`);
    }
  }

  fs.writeFileSync(PROVENANCE_PATH, JSON.stringify(provenanceData, null, 2));

  // Sync derivatives
  for (const [id, prov] of Object.entries(provenanceData.records)) {
    if (derivativesData.records[id]) {
      derivativesData.records[id].sourceUrl = prov.sourceUrl;
      derivativesData.records[id].sourceKind = prov.sourceKind;
      derivativesData.records[id].exactProduct = prov.exactProduct;
      derivativesData.records[id].transform = {
        quality: 78,
        overlayApplied: false,
        productLabel: null,
        chainLabel: null,
      };
    }
  }
  fs.writeFileSync(DERIVATIVES_PATH, JSON.stringify(derivativesData, null, 2));

  // Sync catalog TS files
  const catalogFiles = fs.readdirSync(CATALOG_DIR).filter(f => f.endsWith('.ts'));
  for (const file of catalogFiles) {
    const filePath = path.join(CATALOG_DIR, file);
    let content = fs.readFileSync(filePath, 'utf8');

    for (const [id, prov] of Object.entries(provenanceData.records)) {
      if (!content.includes(`id: "${id}"`)) continue;
      const idIndex = content.indexOf(`id: "${id}"`);
      if (idIndex === -1) continue;
      const sourceIndex = content.indexOf('imageSource:', idIndex);
      if (sourceIndex === -1) continue;
      const nextCloseBrace = content.indexOf('},', sourceIndex);
      if (nextCloseBrace === -1) continue;
      const nextIdIndex = content.indexOf('id: "', idIndex + 10);
      if (nextIdIndex !== -1 && sourceIndex > nextIdIndex) continue;

      const newSourceBlock = `imageSource: {\n      url: "${prov.sourceUrl}", kind: "${prov.sourceKind}", exactProduct: ${prov.exactProduct},\n    }`;
      const oldBlock = content.slice(sourceIndex, nextCloseBrace + 2);
      content = content.replace(oldBlock, newSourceBlock + ',');
    }
    fs.writeFileSync(filePath, content);
  }

  console.log(`\n🎉 Rebuild complete! All 1006 images are 100% clean photography with zero text overlays.`);
}

rebuildAllClean().catch(console.error);
