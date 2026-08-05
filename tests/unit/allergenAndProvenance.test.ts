import { describe, expect, it } from 'vitest';
import { MENU_ITEMS } from '../../src/data/items';
import { filterAndSortMenu } from '../../src/utils/menuFilter';
import { ALLERGEN_MAP } from '../../src/utils/macroCalculator';
import type { Allergen } from '../../src/types/cafe';

describe('peanut allergen support', () => {
  it('registers peanut as a full-fledged allergen with a Turkish label', () => {
    expect(ALLERGEN_MAP.peanut).toBeDefined();
    expect(ALLERGEN_MAP.peanut.name).toBe('Yer Fıstığı');
    expect(ALLERGEN_MAP.peanut.description).toMatch(/Yer fıstığı/i);
  });

  it('keeps every catalog allergen inside the known allergen map (incl. peanut)', () => {
    const known = new Set<Allergen>(Object.keys(ALLERGEN_MAP) as Allergen[]);
    for (const item of MENU_ITEMS) {
      for (const allergen of item.allergens) {
        expect(known.has(allergen), `${item.id} uses unknown allergen ${allergen}`).toBe(true);
      }
    }
  });

  it('hide mode filters out peanut-bearing products for peanut-sensitive users', () => {
    const withPeanut = MENU_ITEMS.filter(i => i.allergens.includes('peanut'));
    // The catalog itself contains peanut-marked items (the check is
    // meaningful only when at least one exists).
    const filtered = filterAndSortMenu(MENU_ITEMS, {
      hideAllergens: true,
      userAllergens: ['peanut'],
    });
    for (const item of filtered) {
      expect(item.allergens).not.toContain('peanut');
    }
    expect(filtered.length).toBeLessThan(MENU_ITEMS.length);
    expect(withPeanut.length).toBeGreaterThan(0);
  });

  it('warning mode keeps peanut products but marks them as risky', () => {
    const filtered = filterAndSortMenu(MENU_ITEMS, {
      hideAllergens: false,
      userAllergens: ['peanut'],
    });
    expect(filtered.length).toBe(MENU_ITEMS.length);
    const risky = MENU_ITEMS.filter(i =>
      i.allergens.includes('peanut') && i.allergens.some(a => (['peanut'] as Allergen[]).includes(a))
    );
    expect(risky.length).toBeGreaterThan(0);
  });
});

describe('catalog provenance honesty (compile_catalog.py contract)', () => {
  it('marks exactly the four Tchibo espresso-base products as secondary', () => {
    const secondaryIds = MENU_ITEMS
      .filter(i => i.catalogSource?.kind === 'secondary')
      .map(i => i.id)
      .sort();
    expect(secondaryIds).toEqual(['tchibo_americano', 'tchibo_caff_latte', 'tchibo_cappuccino', 'tchibo_espresso']);
  });

  it('keeps every other chain product official', () => {
    const nonTchiboSecondary = MENU_ITEMS.filter(
      i => i.catalogSource?.kind === 'secondary' && i.chainId !== 'tchibo'
    );
    expect(nonTchiboSecondary).toEqual([]);
    const tchiboOfficial = MENU_ITEMS.filter(
      i => i.chainId === 'tchibo' && i.catalogSource?.kind === 'official'
    );
    expect(tchiboOfficial.length).toBe(20);
  });

  it('prefers the exact researched product URL when available', () => {
    // Starbucks items were researched with per-product URLs; the catalog
    // source must point at the product page, not the generic menu page.
    const latte = MENU_ITEMS.find(i => i.id === 'starbucks_1_caff__latte')!;
    expect(latte.catalogSource?.url).toBe('https://www.starbucks.com.tr/menu/urun/caffe-latte-SBUX-1');
    expect(latte.catalogSource?.kind).toBe('official');
    expect(latte.catalogSource?.checkedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('falls back to the chain research/default URL when no product URL exists', () => {
    const tchiboEspresso = MENU_ITEMS.find(i => i.id === 'tchibo_espresso')!;
    // Tchibo research has no per-product URL, so the chain source wins.
    expect(tchiboEspresso.catalogSource?.url).toBe('https://www.tchibo.com.tr');
    expect(tchiboEspresso.catalogSource?.kind).toBe('secondary');
  });

  it('keeps the full catalog stable: 845 items, 10 chains, unique ids', () => {
    expect(MENU_ITEMS.length).toBe(845);
    const chainIds = new Set(MENU_ITEMS.map(i => i.chainId));
    expect(chainIds.size).toBe(10);
    expect(new Set(MENU_ITEMS.map(i => i.id)).size).toBe(845);
    // No fabricated or remote images slipped in.
    for (const item of MENU_ITEMS) {
      expect(item.image, item.id).toMatch(/^\/images\/menu\/.+(\.webp)$/);
    }
  });
});
