import type { MenuItem } from '../types/cafe';

export interface SwapPair {
  original: MenuItem;
  alternative: MenuItem;
  savedCalories: number;
  savedSugar: number;
  score: number;
}

const comparableField = (item: MenuItem, field: 'calories' | 'sugar'): boolean =>
  ['official', 'derived'].includes(item.nutritionSource?.fieldStatus?.[field] ?? '');

const servingKey = (item: MenuItem): string | null => {
  const value = item.nutritionSource?.servingBasis?.normalize('NFKC').toLocaleLowerCase('tr-TR').trim();
  return value || null;
};

const archetype = (item: MenuItem): string | null => {
  const name = item.name.normalize('NFKD').replace(/\p{M}/gu, '').toLocaleLowerCase('tr-TR');
  const families: Array<[string, RegExp]> = [
    ['americano', /americano/],
    ['flat_white', /flat white/],
    ['cappuccino', /cappuccino/],
    ['mocha', /mocha/],
    ['latte', /latte/],
    ['espresso', /espresso|ristretto/],
    ['filter', /filtre|filter/],
    ['cold_brew', /cold brew/],
    ['frappe', /frapp/],
    ['matcha', /matcha/],
    ['hot_chocolate', /sicak cikolata|hot chocolate/],
    ['tea', /\bcay\b|tea|earl grey|rooibos|hibiskus/],
    ['lemonade', /lemonade|limonata/],
    ['smoothie', /smoothie|frozen|cooler/],
    ['milkshake', /milkshake/],
    ['sandwich', /sandvic|sandwich|club/],
    ['wrap', /wrap/],
    ['tost', /tost/],
    ['panino', /panino|panini/],
    ['croissant', /croissant|kruvasan/],
    ['cheesecake', /cheesecake/],
    ['cookie', /cookie|kurabiye/],
    ['brownie', /brownie/],
    ['muffin', /muffin/],
    ['cake', /pasta|\bkek\b|cake/],
    ['pogaca', /pogaca/],
    ['simit', /simit/],
    ['salad', /salata/],
  ];
  return families.find(([, pattern]) => pattern.test(name))?.[0] ?? null;
};

export const buildSwapPairs = (items: readonly MenuItem[]): SwapPair[] => {
  const candidates = items.flatMap(original => {
    const originalArchetype = archetype(original);
    const originalServing = servingKey(original);
    if (!originalArchetype || !originalServing
      || !comparableField(original, 'calories')
      || !comparableField(original, 'sugar')) return [];
    const alternative = items
      .filter(candidate => candidate.id !== original.id
        && candidate.chainId === original.chainId
        && candidate.category === original.category
        && candidate.productKind === original.productKind
        && archetype(candidate) === originalArchetype
        && servingKey(candidate) === originalServing
        && comparableField(candidate, 'calories')
        && comparableField(candidate, 'sugar')
        && candidate.baseMacros.calories < original.baseMacros.calories
        && candidate.baseMacros.sugar <= original.baseMacros.sugar)
      .sort((left, right) => left.baseMacros.calories - right.baseMacros.calories
        || left.baseMacros.sugar - right.baseMacros.sugar)[0];
    if (!alternative) return [];
    const savedCalories = Math.round(original.baseMacros.calories - alternative.baseMacros.calories);
    const savedSugar = Math.round((original.baseMacros.sugar - alternative.baseMacros.sugar) * 10) / 10;
    if (savedCalories < 40 && savedSugar < 8) return [];
    return [{ original, alternative, savedCalories, savedSugar, score: savedCalories + savedSugar * 3 }];
  }).sort((left, right) => right.score - left.score);

  const picked: SwapPair[] = [];
  const usedItems = new Set<string>();
  const usedChains = new Set<string>();
  const chainCount = new Set(items.map(item => item.chainId)).size;

  for (const pair of candidates) {
    if (usedItems.has(pair.original.id) || usedItems.has(pair.alternative.id)) continue;
    if (chainCount > 1 && usedChains.has(pair.original.chainId)) continue;
    picked.push(pair);
    usedItems.add(pair.original.id);
    usedItems.add(pair.alternative.id);
    usedChains.add(pair.original.chainId);
    if (picked.length === 8) break;
  }

  if (picked.length < Math.min(5, candidates.length)) {
    for (const pair of candidates) {
      if (usedItems.has(pair.original.id) || usedItems.has(pair.alternative.id)) continue;
      picked.push(pair);
      usedItems.add(pair.original.id);
      usedItems.add(pair.alternative.id);
      if (picked.length === 8) break;
    }
  }
  return picked;
};
