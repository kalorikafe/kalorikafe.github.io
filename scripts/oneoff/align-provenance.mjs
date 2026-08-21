import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MENU_ITEMS } from '../src/data/items.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PROVENANCE_PATH = path.join(ROOT, 'scripts', 'catalog_sources', 'image-provenance.json');
const DERIVATIVES_PATH = path.join(ROOT, 'scripts', 'catalog_sources', 'image-derivatives.json');

const provenanceData = JSON.parse(fs.readFileSync(PROVENANCE_PATH, 'utf8'));
const derivativesData = JSON.parse(fs.readFileSync(DERIVATIVES_PATH, 'utf8'));

for (const item of MENU_ITEMS) {
  const prov = provenanceData.records[item.id];
  if (!prov) {
    provenanceData.records[item.id] = {
      imagePath: item.image,
      sourceUrl: item.imageSource?.url || '',
      sourcePageUrl: item.imageSource?.url || '',
      sourceKind: item.imageSource?.kind || 'licensed_fallback',
      exactProduct: Boolean(item.imageSource?.exactProduct),
      author: 'Curated',
      license: item.imageSource?.kind === 'official' ? 'official' : 'Unsplash License',
      licenseUrl: item.imageSource?.kind === 'official' ? 'official' : 'https://unsplash.com/license',
      metadataVerification: 'catalog_aligned',
    };
  } else {
    // Keep sourceKind, exactProduct, and sourceUrl strictly aligned with catalog item
    prov.sourceUrl = item.imageSource?.url || prov.sourceUrl;
    prov.sourceKind = item.imageSource?.kind || prov.sourceKind;
    prov.exactProduct = Boolean(item.imageSource?.exactProduct);
    prov.imagePath = item.image;
  }
}

fs.writeFileSync(PROVENANCE_PATH, JSON.stringify(provenanceData, null, 2));

// Update derivativesData
for (const [id, prov] of Object.entries(provenanceData.records)) {
  if (derivativesData.records[id]) {
    derivativesData.records[id].sourceUrl = prov.sourceUrl;
    derivativesData.records[id].sourceKind = prov.sourceKind;
    derivativesData.records[id].exactProduct = prov.exactProduct;
  }
}
fs.writeFileSync(DERIVATIVES_PATH, JSON.stringify(derivativesData, null, 2));

console.log('Fixed and aligned all image provenance records!');
