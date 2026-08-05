import { describe, expect, it } from 'vitest';
import { CHAINS } from '../../src/data/chains';
import { MENU_ITEMS } from '../../src/data/items';

describe('menu data contracts', () => {
  it('keeps IDs unique and chain references valid', () => {
    const ids = MENU_ITEMS.map(item => item.id);
    const chainIds = new Set(CHAINS.map(chain => chain.id));

    expect(new Set(ids).size).toBe(ids.length);
    expect(MENU_ITEMS.every(item => chainIds.has(item.chainId))).toBe(true);
  });

  it('contains finite, non-negative nutrition values', () => {
    for (const item of MENU_ITEMS) {
      const values = Object.values(item.baseMacros).filter(value => value !== undefined);
      expect(values.every(value => Number.isFinite(value) && value >= 0), item.id).toBe(true);
    }
  });

  it('requires complete provenance when a source is marked verified', () => {
    for (const item of MENU_ITEMS) {
      if (item.nutritionSource?.status !== 'verified') continue;
      expect(item.nutritionSource.url, `${item.id} source URL`).toMatch(/^https:\/\//);
      expect(item.nutritionSource.verifiedAt, `${item.id} verification date`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(item.nutritionSource.servingBasis, `${item.id} serving basis`).toBeTruthy();
    }
  });
});
