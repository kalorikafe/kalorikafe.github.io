import { describe, expect, it } from 'vitest';
import { CHAINS } from '../../src/data/chains';
import { MENU_ITEMS } from '../../src/data/items';

const VALID_CATEGORIES = new Set([
  'espresso_hot', 'espresso_iced', 'cold_brew', 'frappe_blended',
  'tea_herbal', 'smoothie_juice', 'bakery_dessert', 'sandwich_savory', 'fit_healthy',
]);
const FOOD_CATEGORIES = new Set(['bakery_dessert', 'sandwich_savory', 'fit_healthy']);
const OFFICIAL_ALLERGENS = new Set([
  'gluten', 'crustaceans', 'egg', 'fish', 'peanut', 'soy', 'milk',
  'nuts', 'celery', 'mustard', 'sesame', 'sulphites', 'lupin', 'molluscs',
]);

describe('menu data contracts', () => {
  it('keeps IDs unique and chain references valid', () => {
    const ids = MENU_ITEMS.map(item => item.id);
    const chainIds = new Set(CHAINS.map(chain => chain.id));

    expect(new Set(ids).size).toBe(ids.length);
        expect(MENU_ITEMS.every(item => chainIds.has(item.chainId))).toBe(true);
        // stable, lowercase, machine-friendly ids
        expect(MENU_ITEMS.every(item => /^[a-z][a-z0-9_]*$/.test(item.id)), 'id charset').toBe(true);
      });

  it('contains finite, non-negative nutrition values', () => {
    for (const item of MENU_ITEMS) {
      const values = Object.values(item.baseMacros).filter(value => value !== undefined);
      expect(values.every(value => Number.isFinite(value) && value >= 0), item.id).toBe(true);
    }
  });

  it('requires complete provenance when a source is marked verified', () => {
    for (const item of MENU_ITEMS) {
      if (!['verified', 'mixed'].includes(item.nutritionSource?.status ?? '')) continue;
      expect(item.nutritionSource.url, `${item.id} source URL`).toMatch(/^https:\/\//);
      expect(item.nutritionSource.verifiedAt, `${item.id} verification date`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(item.nutritionSource.servingBasis, `${item.id} serving basis`).toBeTruthy();
    }
  });

  it('gives every static product full provenance (catalog, image, nutrition)', () => {
    for (const item of MENU_ITEMS) {
      expect(item.catalogSource, `${item.id} catalogSource`).toBeDefined();
      expect(item.catalogSource?.url, `${item.id} catalog url`).toMatch(/^https?:\/\//);
      expect(item.catalogSource?.checkedAt, `${item.id} checkedAt`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(['official', 'secondary', 'legacy_unverified']).toContain(item.catalogSource?.kind);

      expect(item.imageSource, `${item.id} imageSource`).toBeDefined();
      expect(['official', 'licensed_fallback']).toContain(item.imageSource?.kind);
      expect(typeof item.imageSource?.exactProduct, `${item.id} exactProduct`).toBe('boolean');
      expect(item.image, `${item.id} image`).toMatch(/^\/images\/menu\//);
      expect(item.image.endsWith('.webp'), `${item.id} webp image`).toBe(true);

      expect(item.nutritionSource, `${item.id} nutritionSource`).toBeDefined();
      expect(['verified', 'mixed', 'estimated', 'unverified']).toContain(item.nutritionSource?.status);
      expect(Object.keys(item.nutritionSource?.fieldStatus ?? {}).sort()).toEqual(
        ['calories', 'protein', 'carbs', 'sugar', 'fat', 'satFat', 'caffeine', 'sodium'].sort(),
      );
      expect(item.allergenSource, `${item.id} allergenSource`).toBeDefined();
      expect(['current', 'seasonal']).toContain(item.availability);
      expect(VALID_CATEGORIES.has(item.category), `${item.id} category`).toBe(true);
    }
  });

  it('keeps canonical product kind aligned with category and strips food modifiers', () => {
    for (const item of MENU_ITEMS) {
      const expectedKind = FOOD_CATEGORIES.has(item.category) ? 'food' : 'drink';
      expect(item.productKind, item.id).toBe(expectedKind);
      expect(item.isDrink, item.id).toBe(expectedKind === 'drink');
      if (expectedKind === 'food') {
        expect(item.defaultSizeId, `${item.id} size`).toBeUndefined();
        expect(item.defaultMilkId, `${item.id} milk`).toBeUndefined();
        expect(item.defaultSyrupPumps, `${item.id} syrup`).toBeUndefined();
      }
    }
  });

  it('uses only the regulated 14 allergen groups in static catalog rows', () => {
    for (const item of MENU_ITEMS) {
      for (const allergen of item.allergens) {
        expect(OFFICIAL_ALLERGENS.has(allergen), `${item.id}: ${allergen}`).toBe(true);
      }
      if (item.containsLactose) expect(item.allergens, item.id).toContain('milk');
    }
  });

  it('keeps image reuse at or below 6 products per file', () => {
    const usage = new Map<string, number>();
    for (const item of MENU_ITEMS) {
      usage.set(item.image, (usage.get(item.image) || 0) + 1);
    }
    for (const [image, count] of usage) {
      expect(count, `image ${image} used ${count}x`).toBeLessThanOrEqual(6);
    }
  });

  it('reuses a repeated image only inside one visual family', () => {
    const family = (item: (typeof MENU_ITEMS)[number]): string => {
      if (!item.isDrink) {
        return item.category === 'bakery_dessert' || item.category === 'fit_healthy'
          ? 'dessert-snack'
          : 'savory-food';
      }
      switch (item.category) {
        case 'espresso_hot':
          return 'hot-coffee';
        case 'espresso_iced':
        case 'cold_brew':
          return 'cold-coffee';
        case 'frappe_blended':
          return 'blended-drink';
        case 'tea_herbal':
          return 'hot-tea';
        case 'smoothie_juice':
          return 'fresh-drink';
        default:
          return 'other-drink';
      }
    };
    const byImage = new Map<string, typeof MENU_ITEMS>();
    for (const item of MENU_ITEMS) {
      byImage.set(item.image, [...(byImage.get(item.image) || []), item]);
    }
    for (const [image, items] of byImage) {
      if (items.length < 2) continue;
      const families = new Set(items.map(family));
      expect(families.size, `image ${image} used across families`).toBe(1);
    }
  });

  it('reports a catalog larger than 199 products (no clone inflation)', () => {
    expect(MENU_ITEMS.length).toBeGreaterThan(199);
  });
});
