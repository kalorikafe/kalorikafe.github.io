import { describe, expect, it } from 'vitest';
import type { MenuItem } from '../../src/types/cafe';
import { chainSlug, createProductSlugMap, productPath, slugify } from '../../src/utils/slugs';

const item = (id: string, name: string): MenuItem => ({
  id, chainId: 'kahve_dunyasi', name, category: 'espresso_hot', productKind: 'drink',
  description: 'test', image: '/images/menu/placeholder.webp', isDrink: true,
  baseMacros: { calories: 1, protein: 0, carbs: 0, sugar: 0, fat: 0, caffeine: 0 },
  allergens: [], dietaryTags: [],
});

describe('public slugs', () => {
  it('normalizes Turkish characters deterministically', () => {
    expect(slugify('  Çilekli Türk Kahvesi  ')).toBe('cilekli-turk-kahvesi');
    expect(chainSlug('kahve_dunyasi')).toBe('kahve-dunyasi');
  });

  it('keeps duplicate names collision-safe without changing IDs', () => {
    const items = [item('kahve_1', 'Latte'), item('kahve_2', 'Latte')];
    const slugs = createProductSlugMap(items);
    expect(new Set(slugs.values()).size).toBe(2);
    expect(productPath(items[0], slugs)).toMatch(/^\/urun\/kahve-dunyasi\/latte-/);
  });
});

