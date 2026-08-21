import { MENU_ITEMS } from '../src/data/items.ts';

const crossBrandIssues = [];

for (const item of MENU_ITEMS) {
  if (item.chainId === 'starbucks') continue;

  const url = (item.imageSource?.url || '').toLowerCase();
  const desc = (item.description || '').toLowerCase();
  const img = (item.image || '').toLowerCase();

  if (url.includes('starbucks') || url.includes('sbux')) {
    crossBrandIssues.push({
      id: item.id,
      chain: item.chainId,
      name: item.name,
      issue: 'Starbucks in imageSource URL',
      url: item.imageSource?.url,
    });
  }

  if (img.includes('starbucks') || img.includes('sbux')) {
    crossBrandIssues.push({
      id: item.id,
      chain: item.chainId,
      name: item.name,
      issue: 'Starbucks in local image path',
      image: item.image,
    });
  }

  if (desc.includes('starbucks') || desc.includes('sbux')) {
    crossBrandIssues.push({
      id: item.id,
      chain: item.chainId,
      name: item.name,
      issue: 'Starbucks mentioned in description of other chain',
      description: item.description,
    });
  }
}

console.log('Cross-brand issues found:', crossBrandIssues.length);
if (crossBrandIssues.length > 0) {
  console.log(JSON.stringify(crossBrandIssues, null, 2));
}
