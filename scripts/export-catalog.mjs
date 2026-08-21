import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MENU_ITEMS } from '../src/data/items.ts';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = dirname(scriptDirectory);
const outputDirectory = join(projectRoot, 'public', 'data');
const imageProvenance = JSON.parse(await readFile(
  join(projectRoot, 'scripts', 'catalog_sources', 'image-provenance.json'),
  'utf8',
));
const imageRecords = imageProvenance?.records;
if (!imageRecords || typeof imageRecords !== 'object' || Array.isArray(imageRecords)) {
  throw new Error('Tracked image provenance has an invalid records object.');
}
if (Object.keys(imageRecords).length !== MENU_ITEMS.length) {
  throw new Error(`Image provenance count ${Object.keys(imageRecords).length} does not match catalog ${MENU_ITEMS.length}.`);
}

const runtimeItems = MENU_ITEMS.map(item => {
  const record = imageRecords[item.id];
  if (!record || record.imagePath !== item.image || record.sourceUrl !== item.imageSource?.url) {
    throw new Error(`Image provenance mismatch for ${item.id}. Run npm run image:integrity.`);
  }
  return {
    ...item,
    imageSource: {
      ...item.imageSource,
      author: record.author,
      license: record.license,
      licenseUrl: record.licenseUrl,
      sourcePageUrl: record.sourcePageUrl,
      metadataVerification: record.metadataVerification,
    },
  };
});

const stableJson = JSON.stringify({ schemaVersion: 1, items: runtimeItems });
const sha256 = createHash('sha256').update(stableJson).digest('hex');
const file = `catalog.${sha256.slice(0, 12)}.json`;

await mkdir(outputDirectory, { recursive: true });

for (const existing of await readdir(outputDirectory).catch(() => [])) {
  if (/^catalog\.[a-f0-9]{12}\.json$/.test(existing) && existing !== file) {
    await rm(join(outputDirectory, existing));
  }
}

await writeFile(join(outputDirectory, file), `${stableJson}\n`, 'utf8');
await writeFile(
  join(outputDirectory, 'catalog-manifest.json'),
  `${JSON.stringify({ schemaVersion: 1, count: runtimeItems.length, sha256, file }, null, 2)}\n`,
  'utf8',
);


console.log(`Catalog export: ${runtimeItems.length} items -> public/data/${file}`);
