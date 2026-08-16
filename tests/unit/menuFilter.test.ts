import { describe, expect, it } from 'vitest';
import { MENU_ITEMS } from '../../src/data/items';
import { CHAINS } from '../../src/data/chains';
import { filterAndSortMenu } from '../../src/utils/menuFilter';

describe('menu filtering with the shared search matcher', () => {
  it('filters by chain id and returns only that chain', () => {
    const espressoLab = CHAINS.find(c => c.name === 'Espressolab');
    expect(espressoLab).toBeDefined();
    const result = filterAndSortMenu(MENU_ITEMS, { selectedChainId: espressoLab?.id });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every(i => i.chainId === espressoLab?.id)).toBe(true);
  });

  it('filters by category', () => {
    const result = filterAndSortMenu(MENU_ITEMS, { selectedCategory: 'bakery_dessert' });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every(i => i.category === 'bakery_dessert')).toBe(true);
  });

  it('combines search query with chain filter', () => {
    const starbucks = CHAINS.find(c => c.id === 'starbucks');
    const result = filterAndSortMenu(MENU_ITEMS, { searchQuery: 'latte', selectedChainId: starbucks?.id });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every(i => i.chainId === 'starbucks')).toBe(true);
  });

  it('matches diacritic-free Turkish queries', () => {
    const result = filterAndSortMenu(MENU_ITEMS, { searchQuery: 'turk kahvesi' });
    expect(result.length).toBeGreaterThan(0);
    expect(result.some(i => i.name.includes('Türk Kahvesi') || i.name.includes('Türk'))).toBe(true);
  });

  it('keeps the low_calorie + tag semantics intact', () => {
    const result = filterAndSortMenu(MENU_ITEMS, { selectedDietaryTags: ['low_calorie'] });
    expect(result.every(i => i.baseMacros.calories < 150)).toBe(true);
  });

  it('only presents sourced, explicitly safe rows for gluten/lactose filters', () => {
    const glutenFree = filterAndSortMenu(MENU_ITEMS, { selectedDietaryTags: ['gluten_free'] });
    expect(glutenFree.every(item => ['official', 'mixed'].includes(item.allergenSource?.status ?? '')
      && !item.allergens.includes('gluten')
      && !item.crossContactRisks?.includes('celiac_oat_risk'))).toBe(true);

    const lactoseFree = filterAndSortMenu(MENU_ITEMS, { selectedDietaryTags: ['lactose_free'] });
    expect(lactoseFree.every(item => ['official', 'mixed'].includes(item.allergenSource?.status ?? '')
      && item.containsLactose === false
      && !item.allergens.includes('milk'))).toBe(true);
  });
});
