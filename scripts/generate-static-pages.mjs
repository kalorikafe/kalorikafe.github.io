import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MENU_ITEMS } from '../src/data/items.ts';
import { CHAINS } from '../src/data/chains.ts';
import { chainSlug, createProductSlugMap, productPath } from '../src/utils/slugs.ts';

const ORIGIN = 'https://kalorikafe.github.io';
const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = dirname(scriptDirectory);
const distDirectory = join(projectRoot, 'dist');
const template = await readFile(join(distDirectory, 'index.html'), 'utf8');
const productSlugs = createProductSlugMap(MENU_ITEMS);
const imageProvenance = JSON.parse(await readFile(
  join(projectRoot, 'scripts', 'catalog_sources', 'image-provenance.json'),
  'utf8',
));

const escapeHtml = value => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const safeJson = value => JSON.stringify(value).replaceAll('<', '\\u003c');
const absoluteUrl = path => new URL(path, ORIGIN).href;
const latestDate = items => items
  .map(item => item.catalogSource?.checkedAt)
  .filter(Boolean)
  .sort()
  .at(-1) ?? new Date().toISOString().slice(0, 10);

const renderDocument = ({ title, description, path, image, body, jsonLd, noIndex = false }) => {
  const socialImage = absoluteUrl(image || '/social-card.png');
  let html = template
    .replace(/<title>.*?<\/title>/s, `<title>${escapeHtml(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${escapeHtml(description)}" />`)
    .replace(/<meta property="og:title" content="[^"]*"\s*\/>/, `<meta property="og:title" content="${escapeHtml(title)}" />`)
    .replace(/<meta property="og:description" content="[^"]*"\s*\/>/, `<meta property="og:description" content="${escapeHtml(description)}" />`)
    .replace(/<link rel="canonical" href="[^"]*"\s*\/>/, `<link rel="canonical" href="${absoluteUrl(path)}" />`)
    .replace(/<meta property="og:url" content="[^"]*"\s*\/>/, `<meta property="og:url" content="${absoluteUrl(path)}" />`)
    .replace(/<meta property="og:image" content="[^"]*"\s*\/>/, `<meta property="og:image" content="${socialImage}" />`)
    .replace(/<meta property="og:image:alt" content="[^"]*"\s*\/>/, `<meta property="og:image:alt" content="${escapeHtml(image ? `${title} görseli` : 'Kalori Cafe — kafe ürünlerini veriye göre seç')}" />`)
    .replace(/<meta name="twitter:title" content="[^"]*"\s*\/>/, `<meta name="twitter:title" content="${escapeHtml(title)}" />`)
    .replace(/<meta name="twitter:description" content="[^"]*"\s*\/>/, `<meta name="twitter:description" content="${escapeHtml(description)}" />`)
    .replace(/<meta name="twitter:image" content="[^"]*"\s*\/>/, `<meta name="twitter:image" content="${socialImage}" />`)
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`);

  if (image) {
    html = html
      .replace(/\s*<meta property="og:image:width"[^>]*\/>/, '')
      .replace(/\s*<meta property="og:image:height"[^>]*\/>/, '');
  }

  const metadata = [
    noIndex ? '<meta name="robots" content="noindex,follow" />' : '',
    `<script type="application/ld+json">${safeJson(jsonLd)}</script>`,
  ].filter(Boolean).join('\n    ');
  return html.replace('</head>', `    ${metadata}\n  </head>`);
};

const shell = content => `
  <main style="max-width:72rem;margin:0 auto;padding:2rem 1rem;font-family:system-ui,sans-serif;line-height:1.55;color:#2c221e">
    <nav aria-label="Ana gezinme"><a href="/">Kalori Cafe</a> · <a href="/metodoloji/">Metodoloji</a> · <a href="/gizlilik/">Gizlilik</a></nav>
    ${content}
    <noscript><p>Filtreleme ve özelleştirme araçları için JavaScript gerekir; temel katalog içeriği bu sayfada okunabilir.</p></noscript>
  </main>`;

const writeRoute = async (path, html) => {
  const relative = path === '/' ? '' : path.replace(/^\//, '').replace(/\/$/, '');
  const directory = join(distDirectory, relative);
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, 'index.html'), html, 'utf8');
};

const chainLinks = CHAINS.map(chain =>
  `<li><a href="/zincir/${chainSlug(chain.id)}/">${escapeHtml(chain.name)}</a></li>`,
).join('');
const newest = latestDate(MENU_ITEMS);

await writeRoute('/', renderDocument({
  title: 'Kalori Cafe | Kafe Kalori, Makro ve Alerjen Rehberi',
  description: `${CHAINS.length} zincirde ${MENU_ITEMS.length} ürünün kalori, makro, kafein, kaynak ve alerjen bilgilerini karşılaştırın.`,
  path: '/',
  body: shell(`<h1>Kafe ürünlerini karşılaştırın</h1><p>${MENU_ITEMS.length} ürün; kaynak ve tahmin durumu açıkça belirtilir.</p><h2>Kafe zincirleri</h2><ul>${chainLinks}</ul>`),
  jsonLd: {
    '@context': 'https://schema.org', '@type': 'WebSite', name: 'Kalori Cafe', url: `${ORIGIN}/`,
    inLanguage: 'tr-TR', description: 'Türkiye kafe zincirleri için kalori, makro ve alerjen rehberi.',
  },
}));

for (const chain of CHAINS) {
  const items = MENU_ITEMS.filter(item => item.chainId === chain.id);
  const path = `/zincir/${chainSlug(chain.id)}/`;
  const links = items.map(item =>
    `<li><a href="${productPath(item, productSlugs)}">${escapeHtml(item.name)}</a> — ${item.baseMacros.calories} kcal</li>`,
  ).join('');
  await writeRoute(path, renderDocument({
    title: `${chain.name} Kalori ve Alerjen Rehberi | Kalori Cafe`,
    description: `${chain.name} menüsündeki ${items.length} ürünün kalori, makro, kafein, alerjen ve kaynak bilgileri.`,
    path,
    body: shell(`<h1>${escapeHtml(chain.name)} ürünleri</h1><p>${escapeHtml(chain.description)}</p><ul>${links}</ul>`),
    jsonLd: {
      '@context': 'https://schema.org', '@type': 'CollectionPage', name: `${chain.name} ürünleri`, url: absoluteUrl(path),
      inLanguage: 'tr-TR', numberOfItems: items.length,
    },
  }));
}

for (const item of MENU_ITEMS) {
  const chain = CHAINS.find(candidate => candidate.id === item.chainId);
  if (!chain) throw new Error(`Unknown chain for ${item.id}`);
  const path = productPath(item, productSlugs);
  const sourceSummary = item.nutritionSource?.status === 'verified'
    ? 'doğrulanmış'
    : item.nutritionSource?.status === 'mixed'
      ? 'kısmen resmî, kısmen tahmini'
      : 'tahmini';
  const sourceLink = item.catalogSource?.url
    ? `<p>Menü kaynağı: <a href="${escapeHtml(item.catalogSource.url)}" rel="nofollow">${escapeHtml(item.catalogSource.kind)}</a> (${escapeHtml(item.catalogSource.checkedAt)})</p>`
    : '<p>Menü kaynağı henüz doğrulanmadı.</p>';
  const imageRecord = imageProvenance.records?.[item.id];
  if (!imageRecord || imageRecord.imagePath !== item.image || imageRecord.sourceUrl !== item.imageSource?.url) {
    throw new Error(`Image provenance mismatch for ${item.id}`);
  }
  const imageKind = imageRecord.sourceKind === 'official' ? 'Resmî ürün görseli' : 'Temsilî, lisanslı görsel';
  const imageAuthor = imageRecord.author !== 'unknown' ? ` · ${escapeHtml(imageRecord.author)}` : '';
  const imageLicense = imageRecord.license !== 'unknown'
    ? imageRecord.licenseUrl !== 'unknown'
      ? ` · <a href="${escapeHtml(imageRecord.licenseUrl)}" rel="license nofollow">${escapeHtml(imageRecord.license)}</a>`
      : ` · ${escapeHtml(imageRecord.license)}`
    : '';
  const imageSourceLink = `<p>Görsel: ${escapeHtml(imageKind)}${imageAuthor}${imageLicense} · <a href="${escapeHtml(imageRecord.sourcePageUrl || imageRecord.sourceUrl)}" rel="nofollow">kaynak</a></p>`;
  const description = `${chain.name} ${item.name}: ${item.baseMacros.calories} kcal, ${item.baseMacros.protein} g protein, ${item.baseMacros.caffeine} mg kafein. Veriler ${sourceSummary}.`;
  const breadcrumbs = [
    { '@type': 'ListItem', position: 1, name: 'Kalori Cafe', item: `${ORIGIN}/` },
    { '@type': 'ListItem', position: 2, name: chain.name, item: absoluteUrl(`/zincir/${chainSlug(chain.id)}/`) },
    { '@type': 'ListItem', position: 3, name: item.name, item: absoluteUrl(path) },
  ];
  await writeRoute(path, renderDocument({
    title: `${item.name} Kalori ve Makroları — ${chain.name} | Kalori Cafe`,
    description,
    path,
    image: item.image,
    body: shell(`
      <p><a href="/zincir/${chainSlug(chain.id)}/">${escapeHtml(chain.name)}</a></p>
      <h1>${escapeHtml(item.name)}</h1>
      <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" width="640" height="480" />
      <p>${escapeHtml(item.description)}</p>
      <dl><dt>Kalori</dt><dd>${item.baseMacros.calories} kcal</dd><dt>Protein</dt><dd>${item.baseMacros.protein} g</dd><dt>Karbonhidrat</dt><dd>${item.baseMacros.carbs} g</dd><dt>Yağ</dt><dd>${item.baseMacros.fat} g</dd><dt>Kafein</dt><dd>${item.baseMacros.caffeine} mg</dd></dl>
      <p>Besin verisi: ${escapeHtml(sourceSummary)}. Değerler porsiyon ve hazırlamaya göre değişebilir.</p>${sourceLink}${imageSourceLink}`),
    jsonLd: [
      {
        '@context': 'https://schema.org', '@type': 'ItemPage', name: item.name, url: absoluteUrl(path),
        mainEntity: {
          '@type': 'MenuItem', name: item.name, description: item.description, image: absoluteUrl(item.image),
          nutrition: {
            '@type': 'NutritionInformation', calories: `${item.baseMacros.calories} kcal`,
            proteinContent: `${item.baseMacros.protein} g`, carbohydrateContent: `${item.baseMacros.carbs} g`,
            sugarContent: `${item.baseMacros.sugar} g`, fatContent: `${item.baseMacros.fat} g`,
          },
        },
      },
      { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: breadcrumbs },
    ],
  }));
}

const methodologyPath = '/metodoloji/';
await writeRoute(methodologyPath, renderDocument({
  title: 'Veri Metodolojisi | Kalori Cafe',
  description: 'Kalori Cafe ürün, besin, alerjen, porsiyon, kaynak ve tahmin verilerini nasıl toplar ve günceller?',
  path: methodologyPath,
  body: shell(`<h1>Veri metodolojisi</h1><p>Ürün varlığı için resmî menü ve marka yönlendirmeli sipariş yüzeyleri önceliklendirilir. Besin alanları resmî, türetilmiş, tahmini veya bilinmiyor olarak ayrı izlenir.</p><h2>Sınırlar</h2><p>Değerler şubeye, porsiyona ve tarife göre değişebilir. Alerjen bilgisi tıbbi tavsiye değildir; çapraz bulaşma için markaya danışın.</p><h2>Güncellik</h2><p>Son katalog gözlemi: ${newest}. Sezonluk ürünler 30, çekirdek ürünler 90 gün içinde yeniden kontrol edilmeyi hedefler.</p>`),
  jsonLd: { '@context': 'https://schema.org', '@type': 'WebPage', name: 'Kalori Cafe veri metodolojisi', url: absoluteUrl(methodologyPath) },
}));

const privacyPath = '/gizlilik/';
await writeRoute(privacyPath, renderDocument({
  title: 'Gizlilik | Kalori Cafe',
  description: 'Kalori Cafe yerel veri saklama ve mahremiyet odaklı, hassas veri toplamayan ölçüm ilkeleri.',
  path: privacyPath,
  body: shell('<h1>Gizlilik</h1><p>Favoriler, alerjen tercihleri, hedefler, tarifler ve sepet bu cihazdaki yerel depolamada tutulur; bir hesaba veya sunucuya gönderilmez.</p><p>Ölçüm etkinleştirilirse yalnız anonim özellik kullanımı ve Web Vitals değerleri sayılır. Arama metni, sağlık hedefleri, vücut bilgileri, alerjenler, tarif adları ve sepet içeriği gönderilmez. Tarayıcının “Do Not Track” tercihi uygulanır.</p>'),
  jsonLd: { '@context': 'https://schema.org', '@type': 'PrivacyPolicy', name: 'Kalori Cafe gizlilik bildirimi', url: absoluteUrl(privacyPath) },
}));

const urls = [
  { path: '/', lastmod: newest, priority: '1.0' },
  ...CHAINS.map(chain => ({
    path: `/zincir/${chainSlug(chain.id)}/`,
    lastmod: latestDate(MENU_ITEMS.filter(item => item.chainId === chain.id)), priority: '0.8',
  })),
  ...MENU_ITEMS.map(item => ({ path: productPath(item, productSlugs), lastmod: item.catalogSource?.checkedAt ?? newest, priority: '0.6' })),
  { path: methodologyPath, lastmod: newest, priority: '0.5' },
  { path: privacyPath, lastmod: newest, priority: '0.4' },
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(entry => `  <url><loc>${absoluteUrl(entry.path)}</loc><lastmod>${entry.lastmod}</lastmod><priority>${entry.priority}</priority></url>`).join('\n')}\n</urlset>\n`;
await writeFile(join(distDirectory, 'sitemap.xml'), sitemap, 'utf8');

const notFound = renderDocument({
  title: 'Sayfa bulunamadı | Kalori Cafe', description: 'Aradığınız Kalori Cafe sayfası bulunamadı.', path: '/404.html', noIndex: true,
  body: shell('<h1>Sayfa bulunamadı</h1><p>Ürün kaldırılmış veya adres değişmiş olabilir. <a href="/">Güncel kataloğa dönün.</a></p>'),
  jsonLd: { '@context': 'https://schema.org', '@type': 'WebPage', name: 'Sayfa bulunamadı' },
});
await writeFile(join(distDirectory, '404.html'), notFound, 'utf8');

const sha = process.env.GITHUB_SHA
  ?? execFileSync('git', ['rev-parse', 'HEAD'], { cwd: projectRoot, encoding: 'utf8' }).trim();
const manifest = JSON.parse(await readFile(join(distDirectory, 'data', 'catalog-manifest.json'), 'utf8'));
await writeFile(join(distDirectory, 'build-info.json'), `${JSON.stringify({
  sha, builtAt: new Date().toISOString(), catalogCount: MENU_ITEMS.length,
  catalogSha256: manifest.sha256, schemaVersion: 1,
}, null, 2)}\n`, 'utf8');

console.log(`Static pages: ${urls.length} canonical URLs + 404; catalog ${MENU_ITEMS.length}; SHA ${sha.slice(0, 12)}`);
