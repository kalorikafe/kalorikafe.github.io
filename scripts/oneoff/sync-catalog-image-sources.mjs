import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PROVENANCE_PATH = path.join(ROOT, 'scripts', 'catalog_sources', 'image-provenance.json');
const DERIVATIVES_PATH = path.join(ROOT, 'scripts', 'catalog_sources', 'image-derivatives.json');
const CATALOG_DIR = path.join(ROOT, 'src', 'data', 'catalog');

const provenanceData = JSON.parse(fs.readFileSync(PROVENANCE_PATH, 'utf8'));
const derivativesData = JSON.parse(fs.readFileSync(DERIVATIVES_PATH, 'utf8'));

// Update derivatives manifest records
for (const [id, prov] of Object.entries(provenanceData.records)) {
  if (derivativesData.records[id]) {
    derivativesData.records[id].sourceUrl = prov.sourceUrl;
    derivativesData.records[id].sourcePageUrl = prov.sourcePageUrl;
    derivativesData.records[id].sourceKind = prov.sourceKind;
  }
}
fs.writeFileSync(DERIVATIVES_PATH, JSON.stringify(derivativesData, null, 2));
console.log('Updated image-derivatives.json');

// Update catalog ts files
const catalogFiles = fs.readdirSync(CATALOG_DIR).filter(f => f.endsWith('.ts'));

for (const file of catalogFiles) {
  const filePath = path.join(CATALOG_DIR, file);
  let content = fs.readFileSync(filePath, 'utf8');

  for (const [id, prov] of Object.entries(provenanceData.records)) {
    if (!content.includes(`id: "${id}"`)) continue;

    // Replace imageSource block for this item
    // Match pattern: id: "..." ... imageSource: { ... }
    const idIndex = content.indexOf(`id: "${id}"`);
    if (idIndex === -1) continue;

    const sourceIndex = content.indexOf('imageSource:', idIndex);
    if (sourceIndex === -1) continue;

    const nextCloseBrace = content.indexOf('},', sourceIndex);
    if (nextCloseBrace === -1) continue;

    // Check that this imageSource belongs to the current item and not the next one
    const nextIdIndex = content.indexOf('id: "', idIndex + 10);
    if (nextIdIndex !== -1 && sourceIndex > nextIdIndex) continue;

    const newSourceBlock = `imageSource: {\n      url: "${prov.sourceUrl}", kind: "${prov.sourceKind}", exactProduct: ${prov.exactProduct},\n    }`;
    const oldBlock = content.slice(sourceIndex, nextCloseBrace + 2);
    content = content.replace(oldBlock, newSourceBlock + ',');
  }

  fs.writeFileSync(filePath, content);
  console.log(`Synced ${file}`);
}
console.log('All catalog TS files synced with updated image sources.');
