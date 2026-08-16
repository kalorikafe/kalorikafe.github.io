import { describe, expect, it } from 'vitest';
import type { MenuItem, NutritionFieldStatus } from '../../src/types/cafe';
import { buildSwapPairs } from '../../src/utils/smartSwaps';

const item = (
  id: string,
  name: string,
  calories: number,
  sugar: number,
  status: NutritionFieldStatus = 'official',
): MenuItem => ({
  id,
  chainId: 'test_chain',
  name,
  category: 'espresso_hot',
  productKind: 'drink',
  description: 'Test fixture',
  image: '/images/menu/placeholder.webp',
  isDrink: true,
  baseMacros: { calories, sugar, protein: 1, carbs: sugar, fat: 1, caffeine: 50 },
  allergens: [],
  dietaryTags: [],
  nutritionSource: {
    status: status === 'estimated' ? 'estimated' : 'mixed',
    servingBasis: 'Regular',
    fieldStatus: { calories: status, sugar: status },
  },
});

describe('buildSwapPairs', () => {
  it('pairs only the same product family, serving basis and sourced macro fields', () => {
    const pairs = buildSwapPairs([
      item('mocha-heavy', 'White Chocolate Mocha', 420, 55),
      item('mocha-light', 'Mocha', 230, 30),
      item('americano', 'Americano', 8, 0),
      item('estimated-mocha', 'Seasonal Mocha', 100, 5, 'estimated'),
    ]);

    expect(pairs).toHaveLength(1);
    expect(pairs[0]).toMatchObject({
      original: { id: 'mocha-heavy' },
      alternative: { id: 'mocha-light' },
    });
  });

  it('returns no recommendation when only estimated values are available', () => {
    expect(buildSwapPairs([
      item('estimated-heavy', 'Iced Latte', 300, 30, 'estimated'),
      item('estimated-light', 'Caffè Latte', 100, 5, 'estimated'),
    ])).toEqual([]);
  });
});
