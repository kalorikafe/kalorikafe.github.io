/**
 * Image build pipeline for the Kalori Cafe catalog.
 *
 * Reads tmp_research/manifest.json: { products: [{ id, chain, slug, slot,
 * officialUrl?, pageUrl? }] }
 *
 * For every product it produces public/images/menu/<chain>/<slug>.webp and
 * records per-product provenance in tmp_research/assets.json:
 *  - official chain media URL when available  → kind 'official', exactProduct true
 *  - otherwise a Wikimedia Commons photo matched to the product's visual
 *    slot → kind 'licensed_fallback' (CC BY / CC BY-SA / CC0, page URL kept)
 *  - neutral local placeholder only as a last resort
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const MANIFEST = path.join(ROOT, 'tmp_research', 'manifest.json');
const ASSETS = path.join(ROOT, 'tmp_research', 'assets.json');
const PUBLIC_ROOT = path.join(ROOT, 'public', 'images', 'menu');
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 KaloriCafe/1.0';

const TARGET_WIDTH = 1000;
const WEBP_QUALITY = 82;

/* ------------------------------------------------------------------ */
/* Wikimedia Commons search                                            */
/* ------------------------------------------------------------------ */

const commonsCache = new Map();

function isAllowedFallbackLicense(license) {
  if (typeof license !== 'string') return false;
  const normalized = license.trim().toLowerCase();
  return normalized === 'unsplash license'
    || normalized === 'public domain'
    || normalized.startsWith('cc0')
    || normalized.startsWith('cc by ')
    || normalized.startsWith('cc by-sa ');
}

function sourceIdentity(url) {
  if (typeof url !== 'string') return '';
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

async function commonsSearch(query, limit = 6) {
  const key = `${query}|${limit}`;
  if (commonsCache.has(key)) return commonsCache.get(key);
  const url =
    'https://commons.wikimedia.org/w/api.php?action=query&generator=search' +
    `&gsrsearch=${encodeURIComponent(query)}&gsrlimit=${limit + 6}&gsrnamespace=6` +
    '&prop=imageinfo&iiprop=url|size|mime|extmetadata&iiurlwidth=1000&format=json&origin=*';
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) return [];
  const data = await res.json();
  const pages = Object.values(data.query?.pages ?? {});
  const out = pages
    .map(p => {
      const info = p.imageinfo?.[0];
      if (!info || !info.url) return null;
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(info.mime)) return null;
      if (info.width > 0 && info.width < 480) return null;
      const license = info.extmetadata?.LicenseShortName?.value || info.extmetadata?.License?.value;
      if (!isAllowedFallbackLicense(license)) return null;
      const title = (p.title || '').replace(/ /g, '_');
      return {
        direct: info.url,
        thumb: info.thumburl || info.url,
        pageUrl: `https://commons.wikimedia.org/wiki/${encodeURIComponent(title)}`,
        title: p.title.toLowerCase(),
        license,
      };
    })
    .filter(Boolean);
  commonsCache.set(key, out);
  return out;
}

/**
 * Curated Unsplash photo ids (verified at build time by HTTP check) used as
 * high-quality licensed fallbacks. Photo page = https://unsplash.com/photos/<id>
 */
const UNSPLASH_CURATED = {
  latte: ['1541167760496-1628856ab772', '1509042239860-f550ce710b93'],
  'iced-latte': ['1517701550927-30cf4ba1dba5', '1461023058943-07fcbe16d735'],
  'iced-americano': ['1517701604599-bb29b565090c'],
  cappuccino: ['1572442388796-11668a67e53d', '1504612002841-3d4d3b8d1d6f'],
  espresso: ['1510707577719-ae7c14805e3a', '1610889556528-9a770e32642f'],
  macchiato: ['1488477181946-6428a0291777'],
  americano: ['1514432324607-a09d9b4aefdd'],
  'flat-white': ['1541167760496-1628856ab772'],
  cortado: ['1510707577719-ae7c14805e3a'],
  mocha: ['1578314675249-a6910f80cc39'],
  'white-mocha': ['1578314675249-a6910f80cc39'],
  'cold-brew': ['1517701550927-30cf4ba1dba5'],
  frappe: ['1572490122747-3968b75cc699'],
  chai: ['1576092768241-dec231879fc3'],
  matcha: ['1536256263959-770b48d82b0a'],
  turkish: ['1557513538-ee869e2e4b5e'],
  'hot-chocolate': ['1542990253-0d0f5be5f0ed'],
  tea: ['1544787219-7f47ccb76574'],
  'herbal-tea': ['1576092768241-dec231879fc3'],
  lemonade: ['1613478223719-2ab802602423'],
  'orange-juice': ['1613478223719-2ab802602423'],
  refresher: ['1553530666-ba11a7da3888'],
  smoothie: ['1553530666-ba11a7da3888'],
  cheesecake: ['1533134242443-d4fd215305ad', '1524351199678-941a58a3df50'],
  'baked-cheesecake': ['1533134242443-d4fd215305ad'],
  cake: ['1621303837174-89787a7d4729'],
  'carrot-cake': ['1621303837174-89787a7d4729'],
  'lemon-cake': ['1621303837174-89787a7d4729'],
  muffin: ['1557958114-3d2440207108'],
  cookie: ['1499636136210-6f4ee915583e'],
  brownie: ['1606313564200-e75d5e30476c'],
  'choc-dessert': ['1606313564200-e75d5e30476c'],
  tiramisu: ['1571877227200-a0d98ea607e9'],
  'panna-cotta': ['1488477181946-6428a0291777'],
  croissant: ['1555507036-ab1f4038808a'],
  'chocolat-croissant': ['1623334044303-241021148842'],
  simit: ['1509440159596-0249088772ff'],
  bagel: ['1509440159596-0249088772ff'],
  sandwich: ['1528735602780-2552fd46c7af', '1509722747041-616f39b57569'],
  panini: ['1509722747041-616f39b57569'],
  wrap: ['1626700051175-6818013e1d4f'],
  baguette: ['1528735602780-2552fd46c7af'],
  'grilled-cheese': ['1528735602780-2552fd46c7af'],
  burger: ['1568901346375-23c9450c58cd'],
  avocado: ['1525351484163-7529414344d8'],
  'salad-bowl': ['1512621776951-a57141f2eefd'],
  'energy-balls': ['1488477181946-6428a0291777'],
};

/* ------------------------------------------------------------------ */
/* Slot → search sources                                               */
/* ------------------------------------------------------------------ */

/**
 * Slot definition: curated Unsplash ids (verified by HEAD at runtime) plus
 * Commons queries whose FILE TITLES must contain one of the token groups.
 */
const SLOT_DEFS = {
  latte: { unsplash: UNSPLASH_CURATED.latte, commons: ['latte', 'caffe latte', 'latte art', 'cafe latte'], tokens: [['latte']] },
  'iced-latte': { unsplash: UNSPLASH_CURATED['iced-latte'], commons: ['iced latte', 'iced coffee', 'iced coffee milk'], tokens: [['latte', 'ice'], ['iced', 'coffee'], ['latte']] },
  'iced-americano': { unsplash: UNSPLASH_CURATED['iced-americano'], commons: ['iced americano', 'iced coffee black'], tokens: [['americano', 'ice'], ['iced', 'coffee']] },
  cappuccino: { unsplash: UNSPLASH_CURATED.cappuccino, commons: ['cappuccino', 'cappuccino cup'], tokens: [['cappuccino'], ['cappucino']] },
  espresso: { unsplash: UNSPLASH_CURATED.espresso, commons: ['espresso cup', 'espresso'], tokens: [['espresso']] },
  macchiato: { unsplash: UNSPLASH_CURATED.macchiato, commons: ['macchiato', 'caramel macchiato'], tokens: [['macchiato']] },
  americano: { unsplash: UNSPLASH_CURATED.americano, commons: ['americano', 'black coffee cup'], tokens: [['americano'], ['black', 'coffee']] },
  'flat-white': { unsplash: UNSPLASH_CURATED['flat-white'], commons: ['flat white', 'latte art'], tokens: [['flat', 'white'], ['latte', 'art']] },
  cortado: { unsplash: UNSPLASH_CURATED.cortado, commons: ['cortado', 'espresso milk'], tokens: [['cortado']] },
  mocha: { unsplash: UNSPLASH_CURATED.mocha, commons: ['mocha coffee', 'mocha'], tokens: [['mocha']] },
  'white-mocha': { unsplash: UNSPLASH_CURATED['white-mocha'], commons: ['white mocha', 'mocha'], tokens: [['mocha']] },
  'cold-brew': { unsplash: UNSPLASH_CURATED['cold-brew'], commons: ['cold brew', 'cold coffee'], tokens: [['cold', 'brew'], ['cold', 'coffee']] },
  frappe: { unsplash: UNSPLASH_CURATED.frappe, commons: ['frappe', 'frappuccino'], tokens: [['frappe'], ['frappuccino']] },
  chai: { unsplash: UNSPLASH_CURATED.chai, commons: ['chai latte'], tokens: [['chai']] },
  matcha: { unsplash: UNSPLASH_CURATED.matcha, commons: ['matcha latte'], tokens: [['matcha']] },
  turkish: { unsplash: UNSPLASH_CURATED.turkish, commons: ['turkish coffee', 'cezve'], tokens: [['turkish', 'coffee'], ['cezve']] },
  'hot-chocolate': { unsplash: UNSPLASH_CURATED['hot-chocolate'], commons: ['hot chocolate', 'cocoa'], tokens: [['chocolate'], ['cocoa']] },
  salep: { unsplash: UNSPLASH_CURATED['hot-chocolate'], commons: ['salep'], tokens: [['salep']] },
  tea: { unsplash: UNSPLASH_CURATED.tea, commons: ['cup of tea', 'black tea'], tokens: [['tea']] },
  'herbal-tea': { unsplash: UNSPLASH_CURATED['herbal-tea'], commons: ['hibiscus tea', 'fruit tea'], tokens: [['hibiscus'], ['berry', 'tea'], ['fruit', 'tea']] },
  lemonade: { unsplash: UNSPLASH_CURATED.lemonade, commons: ['lemonade', 'lemon drink'], tokens: [['lemonade'], ['lemon', 'drink']] },
  'orange-juice': { unsplash: UNSPLASH_CURATED['orange-juice'], commons: ['orange juice'], tokens: [['orange', 'juice']] },
  refresher: { unsplash: UNSPLASH_CURATED.refresher, commons: ['iced tea glass', 'berry drink', 'iced drink'], tokens: [['iced'], ['berry', 'drink'], ['cooler'], ['fruit', 'drink']] },
  smoothie: { unsplash: UNSPLASH_CURATED.smoothie, commons: ['smoothie', 'strawberry smoothie'], tokens: [['smoothie']] },
  cheesecake: { unsplash: UNSPLASH_CURATED.cheesecake, commons: ['cheesecake', 'cheese cake'], tokens: [['cheesecake'], ['cheese', 'cake']] },
  'baked-cheesecake': { unsplash: UNSPLASH_CURATED['baked-cheesecake'], commons: ['basque cheesecake'], tokens: [['cheesecake']] },
  cake: { unsplash: UNSPLASH_CURATED.cake, commons: ['cake slice', 'chocolate cake'], tokens: [['cake']] },
  'carrot-cake': { unsplash: UNSPLASH_CURATED['carrot-cake'], commons: ['carrot cake'], tokens: [['carrot']] },
  'lemon-cake': { unsplash: UNSPLASH_CURATED['lemon-cake'], commons: ['lemon cake', 'lemon loaf'], tokens: [['lemon', 'cake'], ['lemon', 'loaf']] },
  muffin: { unsplash: UNSPLASH_CURATED.muffin, commons: ['muffin', 'blueberry muffin'], tokens: [['muffin']] },
  cookie: { unsplash: UNSPLASH_CURATED.cookie, commons: ['chocolate cookie', 'cookies'], tokens: [['cookie']] },
  brownie: { unsplash: UNSPLASH_CURATED.brownie, commons: ['brownie', 'chocolate brownie'], tokens: [['brownie']] },
  'choc-dessert': { unsplash: UNSPLASH_CURATED['choc-dessert'], commons: ['chocolate cake', 'chocolate dessert'], tokens: [['chocolate', 'cake'], ['chocolate', 'dessert']] },
  tiramisu: { unsplash: UNSPLASH_CURATED.tiramisu, commons: ['tiramisu'], tokens: [['tiramisu']] },
  'panna-cotta': { unsplash: UNSPLASH_CURATED['panna-cotta'], commons: ['panna cotta'], tokens: [['panna', 'cotta']] },
  croissant: { unsplash: UNSPLASH_CURATED.croissant, commons: ['croissant', 'butter croissant'], tokens: [['croissant']] },
  'chocolat-croissant': { unsplash: UNSPLASH_CURATED['chocolat-croissant'], commons: ['pain au chocolat'], tokens: [['chocolat'], ['chocolate', 'croissant']] },
  simit: { unsplash: UNSPLASH_CURATED.simit, commons: ['simit'], tokens: [['simit']] },
  boyoz: { unsplash: [], commons: ['boyoz'], tokens: [['boyoz']] },
  bagel: { unsplash: UNSPLASH_CURATED.bagel, commons: ['bagel', 'sesame bagel'], tokens: [['bagel']] },
  pogaca: { unsplash: [], commons: ['pogaca'], tokens: [['pogaca'], ['börek'], ['borek']] },
  sandwich: { unsplash: UNSPLASH_CURATED.sandwich, commons: ['sandwich', 'toast sandwich', 'sandviç'], tokens: [['sandwich'], ['sandviç'], ['toast']] },
  panini: { unsplash: UNSPLASH_CURATED.panini, commons: ['panini', 'ciabatta'], tokens: [['panini'], ['ciabatta']] },
  wrap: { unsplash: UNSPLASH_CURATED.wrap, commons: ['wrap'], tokens: [['wrap']] },
  baguette: { unsplash: UNSPLASH_CURATED.baguette, commons: ['baguette'], tokens: [['baguette']] },
  'grilled-cheese': { unsplash: UNSPLASH_CURATED['grilled-cheese'], commons: ['grilled cheese', 'cheese toast'], tokens: [['grilled', 'cheese'], ['toast']] },
  'mixed-toast': { unsplash: [], commons: ['tost'], tokens: [['tost'], ['toast']] },
  burger: { unsplash: UNSPLASH_CURATED.burger, commons: ['cheeseburger'], tokens: [['burger']] },
  avocado: { unsplash: UNSPLASH_CURATED.avocado, commons: ['avocado toast'], tokens: [['avocado']] },
  'salad-bowl': { unsplash: UNSPLASH_CURATED['salad-bowl'], commons: ['salad bowl', 'salad'], tokens: [['salad']] },
  'energy-balls': { unsplash: UNSPLASH_CURATED['energy-balls'], commons: ['energy balls'], tokens: [['balls'], ['energy']] },
  gofrik: { unsplash: [], commons: ['wafer chocolate', 'gofret'], tokens: [['wafer'], ['gofret']] },
  'madlen-choc': { unsplash: [], commons: ['chocolate pralines'], tokens: [['chocolate'], ['praline']] },
  profiterol: { unsplash: [], commons: ['profiterole'], tokens: [['profiterole'], ['profiterol']] },
  'pizza-bread': { unsplash: [], commons: ['pizza bread'], tokens: [['pizza']] },
  waffle: { unsplash: [], commons: ['waffle'], tokens: [['waffle']] },
  pancakes: { unsplash: [], commons: ['pancakes'], tokens: [['pancake']] },
  strudel: { unsplash: [], commons: ['strudel', 'baklava'], tokens: [['strudel'], ['baklava']] },
};

const DEFAULT_SLOT = { unsplash: [], commons: ['coffee'], tokens: [['coffee']] };

function slotDef(slot) {
  return SLOT_DEFS[slot] || DEFAULT_SLOT;
}

function titleMatchesTokens(title, tokenGroups) {
  return tokenGroups.some(group => group.every(token => title.includes(token)));
}

/* ------------------------------------------------------------------ */
/* small helpers                                                       */
/* ------------------------------------------------------------------ */

function extOf(url) {
  const m = /\.(jpe?g|png|webp)/i.exec(url);
  return m ? m[1].toLowerCase().replace('jpeg', 'jpg') : 'jpg';
}

async function downloadBytes(url) {
  // Commons originals are heavy and rate-limited; thumbs are CDN-cached.
  const target = url.includes('upload.wikimedia.org') ? url : url;
  let lastErr = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(target, { headers: { 'User-Agent': UA } });
      if (res.status === 429 || res.status >= 500) {
        const retryAfter = Number(res.headers.get('retry-after') || 0) * 1000;
        lastErr = new Error(`HTTP ${res.status} for ${url}`);
        await new Promise(r => setTimeout(r, Math.max(1500, retryAfter) * (attempt + 1)));
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      const bytes = Buffer.from(await res.arrayBuffer());
      if (bytes.length < 256) throw new Error(`tiny body from ${url}`);
      return bytes;
    } catch (err) {
      lastErr = err;
      if (err && err.message && err.message.includes('HTTP 4')) break; // permanent
      await new Promise(r => setTimeout(r, 1200 * (attempt + 1)));
    }
  }
  throw lastErr || new Error(`download failed ${url}`);
}

async function bakeWebp(bytes, ext, target) {
  const tmp = target.replace(/\.webp$/, `.src.${ext}`);
  fs.writeFileSync(tmp, bytes);
  await sharp(tmp)
    .resize({ width: TARGET_WIDTH, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toFile(target);
  fs.rmSync(tmp, { force: true });
}

function makeAsset(product) {
  return {
    id: product.id,
    file: `/images/menu/${product.chain}/${product.slug}.webp`,
    sourceUrl: null,
    pageUrl: null,
    kind: null,
    exactProduct: false,
    license: null,
  };
}

/* ------------------------------------------------------------------ */
/* main                                                                */
/* ------------------------------------------------------------------ */

const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf-8'));
const products = manifest.products;
// Previously built assets (for incremental reruns).
const assets = fs.existsSync(ASSETS) ? JSON.parse(fs.readFileSync(ASSETS, 'utf-8')) : {};
const slotPools = new Map();
const failedSources = new Set();

// Per-slot fallback demand (products without an official image).
const slotNeeds = new Map();
for (const product of products) {
  if (!product.officialUrl) {
    slotNeeds.set(product.slot, (slotNeeds.get(product.slot) || 0) + 1);
  }
}

async function build() {
  let officialCount = 0;
  let fallbackCount = 0;
  let placeholderCount = 0;
  let generatedSinceCheckpoint = 0;

  for (const product of products) {
    const entry = makeAsset(product);
    const target = path.join(PUBLIC_ROOT, product.chain, `${product.slug}.webp`);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    let succeeded = false;

    // Incremental: keep previous non-placeholder results unless an official
    // product image has become available (or the official source changed).
    // This lets later source refreshes upgrade licensed fallbacks without
    // requiring the whole asset cache to be discarded.
    if (fs.existsSync(target) && assets[product.id] && assets[product.id].kind !== 'placeholder') {
      const prev = assets[product.id];
      const shouldUpgradeToOfficial = Boolean(product.officialUrl) && prev.kind !== 'official';
      const officialSourceChanged =
        Boolean(product.officialUrl) && prev.kind === 'official' && prev.sourceUrl !== product.officialUrl;
      const officialSourceRemoved = !product.officialUrl && prev.kind === 'official';
      const previousSourceIdentity = sourceIdentity(prev.sourceUrl);
      const previousSourceUse = Object.values(assets)
        .filter(asset => sourceIdentity(asset.sourceUrl) === previousSourceIdentity).length;
      const trackedFallbackNeedsRefresh = product.chain === 'caffe_nero'
        && prev.kind === 'licensed_fallback'
        && (previousSourceUse > 6 || !isAllowedFallbackLicense(prev.license));
      if (!shouldUpgradeToOfficial && !officialSourceChanged && !officialSourceRemoved && !trackedFallbackNeedsRefresh) {
        assets[product.id] = prev;
        if (prev.kind === 'official') officialCount++;
        else fallbackCount++;
        continue;
      }
    }

    // 1) Official chain media
    if (product.officialUrl) {
      try {
        const bytes = await downloadBytes(product.officialUrl);
        await bakeWebp(bytes, extOf(product.officialUrl), target);
        entry.sourceUrl = product.officialUrl;
        entry.pageUrl = product.pageUrl || product.officialUrl;
        entry.kind = 'official';
        entry.exactProduct = true;
        entry.license = 'official';
        officialCount++;
        succeeded = true;
      } catch (err) {
        console.warn(`  official failed ${product.id}: ${err.message}`);
      }
    }

    // 2) Licensed fallback from the slot pool (curated + Commons, CC)
    if (!succeeded) {
      try {
        let pool = slotPools.get(product.slot);
        if (!pool) {
          const def = slotDef(product.slot);
          const seen = new Set();
          pool = [];
          // (a) curated Unsplash ids, verified on the fly
          for (const id of def.unsplash || []) {
            const url = `https://unsplash.com/photos/${id}`;
            const direct = `https://images.unsplash.com/photo-${id}?w=1000&auto=format&fit=crop&q=80`;
            try {
              const head = await fetch(direct, { method: 'HEAD', headers: { 'User-Agent': UA } });
              if (!head.ok) continue; // dead id — skip
            } catch {
              continue;
            }
            pool.push({ direct, thumb: direct, pageUrl: url, license: 'Unsplash License' });
            seen.add(direct);
          }
          // pool grows with demand so no photo is reused by more than 6 items
          const fallbackNeeded = (slotNeeds.get(product.slot) || 0);
          const poolTarget = Math.min(48, Math.max(8, Math.ceil(fallbackNeeded / 6)));
          // (b) Commons files whose titles match the slot tokens
          for (const query of def.commons || []) {
            const list = await commonsSearch(query, Math.min(10, poolTarget));
            for (const item of list) {
              if (!titleMatchesTokens(item.title, def.tokens || [])) continue;
              if (seen.has(item.direct)) continue;
              seen.add(item.direct);
              pool.push(item);
              if (pool.length >= poolTarget) break;
            }
            if (pool.length >= poolTarget) break;
          }
          slotPools.set(product.slot, pool);
        }
        if (pool.length === 0) throw new Error(`empty fallback pool for slot ${product.slot}`);

        // pick the least-used healthy photo in the pool (max 6 repeats stays safe)
        const usage = new Map();
        for (const a of Object.values(assets)) {
          if (a.kind !== 'licensed_fallback') continue;
          const identity = sourceIdentity(a.sourceUrl);
          usage.set(identity, (usage.get(identity) || 0) + 1);
        }
        const candidates = pool
          .filter(candidate => {
            const sourceKey = sourceIdentity(candidate.pageUrl || candidate.direct);
            return !failedSources.has(candidate.direct) && (usage.get(sourceKey) || 0) < 6;
          })
          .sort((a, b) => {
            const aUse = usage.get(sourceIdentity(a.pageUrl || a.direct)) || 0;
            const bUse = usage.get(sourceIdentity(b.pageUrl || b.direct)) || 0;
            return aUse - bUse;
          });
        if (candidates.length === 0) throw new Error(`no usable fallback photo left for slot ${product.slot}`);

        let lastCandidateError = null;
        for (const candidate of candidates) {
          try {
            // Commons thumbs are CDN-cached 1000px renditions — faster and
            // far less rate-limited than the original files.
            const downloadUrl = candidate.thumb || candidate.direct;
            const bytes = await downloadBytes(downloadUrl);
            await bakeWebp(bytes, extOf(downloadUrl), target);
            entry.sourceUrl = candidate.pageUrl || candidate.direct;
            entry.pageUrl = candidate.pageUrl;
            entry.kind = 'licensed_fallback';
            entry.exactProduct = false;
            entry.license = candidate.license;
            fallbackCount++;
            succeeded = true;
            break;
          } catch (err) {
            failedSources.add(candidate.direct);
            lastCandidateError = err;
          }
        }
        if (!succeeded) throw lastCandidateError || new Error(`fallback candidates failed for slot ${product.slot}`);
      } catch (err) {
        if (err && err.message) console.error(`  fallback failed ${product.id}: ${err.message}`);
      }
    }

    // 3) Neutral local placeholder as a last resort
    if (!succeeded) {
      try {
        const svg =
          '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">' +
          '<rect width="800" height="600" fill="#EFE7DE"/>' +
          '<text x="400" y="320" font-family="Georgia,serif" font-size="72" text-anchor="middle" fill="#8A7361">&#9749;</text>' +
          '</svg>';
        await sharp(Buffer.from(svg)).webp({ quality: 80 }).toFile(target);
        entry.kind = 'placeholder';
        placeholderCount++;
        console.warn(`PLACEHOLDER ${product.id}`);
      } catch (err2) {
        console.error(`  placeholder failed too: ${err2.message}`);
      }
    }

    assets[product.id] = entry;
    if (succeeded) console.log(`${entry.kind.padEnd(20)} ${product.id}`);
    generatedSinceCheckpoint++;
    if (generatedSinceCheckpoint % 10 === 0) {
      fs.writeFileSync(ASSETS, JSON.stringify(assets, null, 1));
    }
    await new Promise(r => setTimeout(r, 80)); // be polite to upstreams
  }

  fs.writeFileSync(ASSETS, JSON.stringify(assets, null, 1));
  console.log(
    `\nImages built: ${products.length} products — official=${officialCount}, licensed_fallback=${fallbackCount}, placeholder=${placeholderCount}`,
  );
  if (placeholderCount > 0) process.exitCode = 2;
}

build().catch(err => {
  console.error(err);
  process.exit(1);
});
