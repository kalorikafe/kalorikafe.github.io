import { MENU_ITEMS } from '../src/data/items.ts';

const summary = {
  total: MENU_ITEMS.length,
  byChain: {},
  byCategory: {},
  byKind: {},
  byImageSourceKind: {},
  suspiciousOrMismatched: [],
};

for (const item of MENU_ITEMS) {
  summary.byChain[item.chainId] = (summary.byChain[item.chainId] || 0) + 1;
  summary.byCategory[item.category] = (summary.byCategory[item.category] || 0) + 1;
  summary.byKind[item.productKind] = (summary.byKind[item.productKind] || 0) + 1;
  const srcKind = item.imageSource?.kind || 'none';
  summary.byImageSourceKind[srcKind] = (summary.byImageSourceKind[srcKind] || 0) + 1;

  // Let's check common mismatch patterns
  const name = item.name.toLowerCase();
  const imgUrl = (item.imageSource?.url || '').toLowerCase();

  // Pattern 1: Lime / Lemonade with berry smoothie photo (photo-1553530666-ba11a7da3888)
  if ((name.includes('lime') || name.includes('limon') || name.includes('lemon')) && imgUrl.includes('1553530666-ba11a7da3888')) {
    summary.suspiciousOrMismatched.push({
      id: item.id,
      chain: item.chainId,
      name: item.name,
      reason: 'Lime/Lemon product using berry smoothie photo 1553530666-ba11a7da3888',
      imgUrl,
    });
  }

  // Pattern 2: Green tea / Matcha with coffee or berry photo
  if ((name.includes('matcha') || name.includes('yeşil çay') || name.includes('green tea')) && !imgUrl.includes('matcha') && !item.imageSource?.exactProduct && imgUrl.includes('1553530666')) {
    summary.suspiciousOrMismatched.push({
      id: item.id,
      chain: item.chainId,
      name: item.name,
      reason: 'Matcha/Green tea using berry smoothie photo',
      imgUrl,
    });
  }

  // Pattern 3: Tea / Herbal tea using coffee latte photo
  if (item.category === 'tea_herbal' && (imgUrl.includes('1541167760496') || imgUrl.includes('latte'))) {
    summary.suspiciousOrMismatched.push({
      id: item.id,
      chain: item.chainId,
      name: item.name,
      reason: 'Tea using latte art photo',
      imgUrl,
    });
  }

  // Pattern 4: Sandwiches or savory using bakery/sweet photo or energy balls
  if (item.category === 'sandwich_savory' && (imgUrl.includes('1488477181946') || imgUrl.includes('1606313564200') || imgUrl.includes('cookie') || imgUrl.includes('cheesecake'))) {
    summary.suspiciousOrMismatched.push({
      id: item.id,
      chain: item.chainId,
      name: item.name,
      reason: 'Savory sandwich using sweet/dessert photo',
      imgUrl,
    });
  }

  // Pattern 5: Sweet/Dessert using savory sandwich photo
  if (item.category === 'bakery_dessert' && (imgUrl.includes('1528735602780') || imgUrl.includes('1509722747041') || imgUrl.includes('sandwich') || imgUrl.includes('panini') || imgUrl.includes('burger'))) {
    summary.suspiciousOrMismatched.push({
      id: item.id,
      chain: item.chainId,
      name: item.name,
      reason: 'Dessert using savory sandwich photo',
      imgUrl,
    });
  }
}

console.log(JSON.stringify(summary, null, 2));
