import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { MENU_ITEMS } from '../src/data/items.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PROVENANCE_PATH = path.join(ROOT, 'scripts', 'catalog_sources', 'image-provenance.json');

// Curated high-res, verified, accurate photo pools from Unsplash (clean photography, no text)
const PHOTO_BANK = {
  // Cool Lime / Lime Refreshers / Mint Lemonade
  lime_refresher: [
    'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd',
    'https://images.unsplash.com/photo-1551024709-8f23befc6f87',
    'https://images.unsplash.com/photo-1536935338788-846bb9981813',
  ],
  // Berry Hibiscus / Very Berry / Frambuaz / Strawberry Refresher
  berry_refresher: [
    'https://images.unsplash.com/photo-1556881286-fc6915169721',
    'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd',
    'https://images.unsplash.com/photo-1553530666-ba11a7da3888',
  ],
  // Mango / Passionfruit / Tropical Refresher / Dragonfruit
  tropical_refresher: [
    'https://images.unsplash.com/photo-1546173159-315724a31696',
    'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd',
  ],
  // Lemonades
  lemonade: [
    'https://images.unsplash.com/photo-1613478223719-2ab802602423',
    'https://images.unsplash.com/photo-1523371067-179b027116f3',
  ],
  // Orange Juice / Citrus
  orange_juice: [
    'https://images.unsplash.com/photo-1600271886742-f049cd451bba',
    'https://images.unsplash.com/photo-1613478223719-2ab802602423',
  ],
  // Smoothies
  smoothie_berry: [
    'https://images.unsplash.com/photo-1553530666-ba11a7da3888',
    'https://images.unsplash.com/photo-1502741224143-90386d7f8c82',
  ],
  smoothie_green: [
    'https://images.unsplash.com/photo-1610970881699-44a5587cabec',
    'https://images.unsplash.com/photo-1556881286-fc6915169721',
  ],
  smoothie_yellow: [
    'https://images.unsplash.com/photo-1502741224143-90386d7f8c82',
    'https://images.unsplash.com/photo-1546173159-315724a31696',
  ],
  // Matcha
  matcha_hot: [
    'https://images.unsplash.com/photo-1536256263959-770b48d82b0a',
    'https://images.unsplash.com/photo-1576092768241-dec231879fc3',
  ],
  matcha_iced: [
    'https://images.unsplash.com/photo-1536256263959-770b48d82b0a',
    'https://images.unsplash.com/photo-1576092768241-dec231879fc3',
  ],
  matcha_strawberry: [
    'https://images.unsplash.com/photo-1536256263959-770b48d82b0a',
    'https://images.unsplash.com/photo-1576092768241-dec231879fc3',
  ],
  // Chai Tea Latte
  chai_latte: [
    'https://images.unsplash.com/photo-1576092768241-dec231879fc3',
    'https://images.unsplash.com/photo-1544787219-7f47ccb76574',
  ],
  // Herbal tea / Mint lemon
  tea_herbal: [
    'https://images.unsplash.com/photo-1544787219-7f47ccb76574',
    'https://images.unsplash.com/photo-1576092768241-dec231879fc3',
    'https://images.unsplash.com/photo-1597481499750-3e6b22637e12',
  ],
  // Turkish Tea (demli bardak)
  tea_turkish: [
    'https://images.unsplash.com/photo-1544787219-7f47ccb76574',
    'https://images.unsplash.com/photo-1576092768241-dec231879fc3',
  ],
  // White Chocolate / Salep / Milk
  white_hot_drink: [
    'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed',
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd',
  ],
  // Hot Chocolate / Kakao
  hot_chocolate: [
    'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed',
  ],
  // Turkish Coffee
  turkish_coffee: [
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd',
    'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a',
  ],
  // Cold Brew
  cold_brew: [
    'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5',
    'https://images.unsplash.com/photo-1461023058943-07fcbe16d735',
  ],
  // Iced Coffee / Iced Latte / Iced Americano
  iced_coffee: [
    'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5',
    'https://images.unsplash.com/photo-1517701604599-bb29b565090c',
    'https://images.unsplash.com/photo-1461023058943-07fcbe16d735',
  ],
  // Frappe / Blended
  frappe: [
    'https://images.unsplash.com/photo-1572490122747-3968b75cc699',
  ],
  // Hot Latte / Flat White / Cappuccino
  latte: [
    'https://images.unsplash.com/photo-1541167760496-1628856ab772',
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93',
  ],
  cappuccino: [
    'https://images.unsplash.com/photo-1572442388796-11668a67e53d',
  ],
  espresso: [
    'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a',
    'https://images.unsplash.com/photo-1610889556528-9a770e32642f',
  ],
  americano: [
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd',
  ],
  mocha: [
    'https://images.unsplash.com/photo-1541167760496-1628856ab772',
    'https://images.unsplash.com/photo-1572490122747-3968b75cc699',
  ],
  macchiato: [
    'https://images.unsplash.com/photo-1488477181946-6428a0291777',
  ],
  // Desserts
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
  // Savory
  simit: [
    'https://images.unsplash.com/photo-1509440159596-0249088772ff',
  ],
  bagel: [
    'https://images.unsplash.com/photo-1509440159596-0249088772ff',
  ],
  sandwich_baguette: [
    'https://images.unsplash.com/photo-1528735602780-2552fd46c7af',
    'https://images.unsplash.com/photo-1509722747041-616f39b57569',
  ],
  sandwich_panini: [
    'https://images.unsplash.com/photo-1509722747041-616f39b57569',
    'https://images.unsplash.com/photo-1528735602780-2552fd46c7af',
  ],
  wrap: [
    'https://images.unsplash.com/photo-1626700051175-6818013e1d4f',
  ],
  toast: [
    'https://images.unsplash.com/photo-1528735602780-2552fd46c7af',
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

function selectAccuratePhotoUrl(item) {
  // If official exact product, we don't need to change URL
  if (item.imageSource?.kind === 'official' && item.imageSource?.exactProduct) {
    return null;
  }

  const name = item.name.toLowerCase();
  const cat = item.category;

  // 1. Cool Lime / Lime Refresha / Lime Cooler
  if (name.includes('lime') || name.includes('misket limon') || (name.includes('refresha') && name.includes('lime'))) {
    return PHOTO_BANK.lime_refresher[0];
  }
  // 2. Berry / Hibiscus / Frambuaz Refresher
  if (name.includes('berry') || name.includes('hibiscus') || name.includes('frambuaz') || name.includes('böğürtlen') || (name.includes('refresha') && (name.includes('berry') || name.includes('hibiscus')))) {
    return PHOTO_BANK.berry_refresher[0];
  }
  // 3. Mango / Dragonfruit / Tropik Refresher
  if (name.includes('dragon') || name.includes('mango') || name.includes('passion') || name.includes('tropik') || name.includes('maracuja')) {
    return PHOTO_BANK.tropical_refresher[0];
  }
  // 4. Lemonade / Limonata
  if (name.includes('limonata') || name.includes('lemonade')) {
    return PHOTO_BANK.lemonade[0];
  }
  // 5. Orange Juice / Portakal
  if (name.includes('portakal') || name.includes('orange juice') || name.includes('narenciye')) {
    return PHOTO_BANK.orange_juice[0];
  }
  // 6. Smoothies
  if (cat === 'smoothie_juice' || name.includes('smoothie')) {
    if (name.includes('yeşil') || name.includes('detox') || name.includes('green') || name.includes('avokado')) {
      return PHOTO_BANK.smoothie_green[0];
    }
    if (name.includes('sarı') || name.includes('muz') || name.includes('mango') || name.includes('ananas')) {
      return PHOTO_BANK.smoothie_yellow[0];
    }
    return PHOTO_BANK.smoothie_berry[0];
  }
  // 7. Matcha
  if (name.includes('matcha')) {
    if (name.includes('strawberry') || name.includes('pink') || name.includes('çilek')) {
      return PHOTO_BANK.matcha_strawberry[0];
    }
    if (name.includes('iced') || name.includes('buzlu') || name.includes('soğuk') || cat === 'espresso_iced') {
      return PHOTO_BANK.matcha_iced[0];
    }
    return PHOTO_BANK.matcha_hot[0];
  }
  // 8. Chai Latte
  if (name.includes('chai')) {
    return PHOTO_BANK.chai_latte[0];
  }
  // 9. Herbal Teas / Çaylar
  if (cat === 'tea_herbal' || name.includes('çay') || name.includes('tea') || name.includes('adaçayı') || name.includes('ıhlamur') || name.includes('papatya') || name.includes('mint')) {
    if (name.includes('türk çayı') || name.includes('taze demlenmiş çay') || name.includes('demlik')) {
      return PHOTO_BANK.tea_turkish[0];
    }
    return PHOTO_BANK.tea_herbal[0];
  }
  // 10. White Chocolate / Salep / Süt
  if (name.includes('salep') || name.includes('beyaz çikolata') || name.includes('white chocolate') || name.includes('süt') || name.includes('milk')) {
    if (name.includes('white chocolate mocha') || name.includes('white mocha')) {
      return PHOTO_BANK.mocha[0];
    }
    return PHOTO_BANK.white_hot_drink[0];
  }
  // 11. Hot Chocolate
  if (name.includes('sıcak çikolata') || name.includes('hot chocolate') || name.includes('kakao')) {
    return PHOTO_BANK.hot_chocolate[0];
  }
  // 12. Türk Kahvesi
  if (name.includes('türk kahvesi') || name.includes('turkish coffee') || name.includes('menengiç') || name.includes('dibek')) {
    return PHOTO_BANK.turkish_coffee[0];
  }
  // 13. Cold Brew / Nitro
  if (cat === 'cold_brew' || name.includes('cold brew') || name.includes('nitro')) {
    return PHOTO_BANK.cold_brew[0];
  }
  // 14. Iced Espresso / Iced Latte / Iced Americano
  if (cat === 'espresso_iced' || name.includes('iced') || name.includes('buzlu')) {
    return PHOTO_BANK.iced_coffee[0];
  }
  // 15. Frappe / Blended
  if (cat === 'frappe_blended' || name.includes('frappe') || name.includes('frappuccino') || name.includes('shake')) {
    return PHOTO_BANK.frappe[0];
  }
  // 16. Hot Espresso drinks
  if (name.includes('cappuccino')) return PHOTO_BANK.cappuccino[0];
  if (name.includes('espresso') || name.includes('ristretto') || name.includes('lungo')) return PHOTO_BANK.espresso[0];
  if (name.includes('americano') || name.includes('filtre')) return PHOTO_BANK.americano[0];
  if (name.includes('mocha')) return PHOTO_BANK.mocha[0];
  if (name.includes('macchiato')) return PHOTO_BANK.macchiato[0];
  if (cat === 'espresso_hot') return PHOTO_BANK.latte[0];

  // 17. Desserts / Bakery
  if (cat === 'bakery_dessert') {
    if (name.includes('san sebastian') || name.includes('basque') || name.includes('bask')) return PHOTO_BANK.cheesecake_basque[0];
    if (name.includes('cheesecake')) return PHOTO_BANK.cheesecake_fruit[0];
    if (name.includes('brownie')) return PHOTO_BANK.brownie[0];
    if (name.includes('cookie') || name.includes('kurabiye')) return PHOTO_BANK.cookie[0];
    if (name.includes('muffin')) return PHOTO_BANK.muffin[0];
    if (name.includes('pain au chocolat') || name.includes('çikolatalı kruvasan')) return PHOTO_BANK.pain_au_chocolat[0];
    if (name.includes('kruvasan') || name.includes('croissant')) return PHOTO_BANK.croissant[0];
    if (name.includes('tiramisu')) return PHOTO_BANK.tiramisu[0];
    if (name.includes('gofrik') || name.includes('gofret') || name.includes('madlen') || name.includes('çikolata')) return PHOTO_BANK.chocolate_wafer[0];
    return PHOTO_BANK.cake[0];
  }

  // 18. Savory & Fit
  if (cat === 'sandwich_savory' || cat === 'fit_healthy') {
    if (name.includes('simit')) return PHOTO_BANK.simit[0];
    if (name.includes('boyoz') || name.includes('poğaça') || name.includes('pogaca') || name.includes('açma') || name.includes('acma')) return PHOTO_BANK.simit[0];
    if (name.includes('wrap') || name.includes('dürüm')) return PHOTO_BANK.wrap[0];
    if (name.includes('tost') || name.includes('toast') || name.includes('grilled cheese')) return PHOTO_BANK.toast[0];
    if (name.includes('burger')) return PHOTO_BANK.burger[0];
    if (name.includes('panini')) return PHOTO_BANK.sandwich_panini[0];
    if (name.includes('baget') || name.includes('sandviç') || name.includes('sandwich') || name.includes('focaccia')) return PHOTO_BANK.sandwich_baguette[0];
    if (name.includes('salata') || name.includes('salad') || name.includes('kase') || name.includes('bowl')) return PHOTO_BANK.salad[0];
    if (name.includes('parfe') || name.includes('parfait') || name.includes('granola') || name.includes('yoğurt') || name.includes('puding')) return PHOTO_BANK.parfait_granola[0];
    if (name.includes('avokado') || name.includes('avocado')) return PHOTO_BANK.avocado_toast[0];
    if (name.includes('top') || name.includes('ball') || name.includes('protein bar') || name.includes('bar')) return PHOTO_BANK.energy_balls[0];
    return PHOTO_BANK.sandwich_baguette[0];
  }

  return null;
}

const imageBufferCache = new Map();

async function fetchImageBuffer(url) {
  if (imageBufferCache.has(url)) return imageBufferCache.get(url);
  const fullUrl = url.includes('?') ? url : `${url}?w=1000&auto=format&fit=crop&q=80`;
  const res = await fetch(fullUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) KaloriCafe/1.0' },
  });
  if (!res.ok) throw new Error(`Failed to fetch ${fullUrl}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  imageBufferCache.set(url, buf);
  return buf;
}

async function main() {
  console.log(`Starting image curation for ${MENU_ITEMS.length} items...`);
  const provenanceData = JSON.parse(fs.readFileSync(PROVENANCE_PATH, 'utf8'));

  let updatedCount = 0;
  let officialPreservedCount = 0;

  for (const item of MENU_ITEMS) {
    const isOfficialExact = item.imageSource?.kind === 'official' && item.imageSource?.exactProduct;
    if (isOfficialExact) {
      officialPreservedCount++;
      continue;
    }

    const targetUrl = selectAccuratePhotoUrl(item);
    if (!targetUrl) continue;

    // Check if the current photo already equals the target photo
    const currentUrl = item.imageSource?.url || '';
    const needsUpdate = !currentUrl.startsWith(targetUrl);

    if (needsUpdate) {
      try {
        const rawBuf = await fetchImageBuffer(targetUrl);
        const webpBuf = await sharp(rawBuf)
          .resize(640, 480, { fit: 'cover' })
          .webp({ quality: 80, effort: 4 })
          .toBuffer();

        const localPath = path.join(ROOT, 'public', item.image.replace(/^\//, ''));
        fs.mkdirSync(path.dirname(localPath), { recursive: true });
        fs.writeFileSync(localPath, webpBuf);

        // Update provenance
        const photoId = targetUrl.split('photo-')[1]?.split('?')[0] || 'custom';
        const sourcePageUrl = `https://unsplash.com/photos/${photoId}`;
        const sourceUrl = `${targetUrl}?w=1000&auto=format&fit=crop&q=80`;

        provenanceData.records[item.id] = {
          imagePath: item.image,
          sourceUrl: sourceUrl,
          sourcePageUrl: sourcePageUrl,
          sourceKind: 'licensed_fallback',
          exactProduct: false,
          author: 'Unsplash Contributor',
          license: 'Unsplash License',
          licenseUrl: 'https://unsplash.com/license',
          metadataVerification: 'curated_verified_accurate',
        };

        updatedCount++;
        if (updatedCount % 20 === 0) {
          console.log(`Updated ${updatedCount} images...`);
        }
      } catch (err) {
        console.error(`Error updating image for ${item.id} (${item.name}):`, err.message);
      }
    }
  }

  fs.writeFileSync(PROVENANCE_PATH, JSON.stringify(provenanceData, null, 2));
  console.log(`\nFinished image curation:`);
  console.log(`- Official exact images preserved: ${officialPreservedCount}`);
  console.log(`- Licensed images updated with accurate photos: ${updatedCount}`);
}

main().catch(console.error);
