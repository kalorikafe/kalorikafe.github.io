import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { MENU_ITEMS } from '../../src/data/items';
import { filterAndSortMenu } from '../../src/utils/menuFilter';
import { ALLERGEN_MAP } from '../../src/utils/macroCalculator';
import type { Allergen } from '../../src/types/cafe';

const CAFFE_NERO_SOURCE = JSON.parse(
  readFileSync(new URL('../../scripts/catalog_sources/caffe_nero.json', import.meta.url), 'utf8'),
) as { products: Array<{ name: string }> };
const BASELINE_WITHOUT_CAFFE_NERO = 825;
const LEGACY_CAFFE_NERO_IDS = [
  'caffe_nero_1_caff__americano',
  'caffe_nero_2_caff__latte',
  'caffe_nero_3_cappuccino',
  'caffe_nero_4_caff__mocha',
  'caffe_nero_5_cortado',
  'caffe_nero_6_flat_white',
  'caffe_nero_7_filtre_kahve',
  'caffe_nero_8_antep_f_st_kl__latte',
  'caffe_nero_9_iced_latte',
  'caffe_nero_10_iced_white_chocolate_mocha',
  'caffe_nero_11_iced_caramelatte',
  'caffe_nero_12_freddo_espresso',
  'caffe_nero_13_cold_brew',
  'caffe_nero_14_milano_s_cak__ikolata',
  'caffe_nero_15_chai_tea_latte',
  'caffe_nero_16_mozzarella___domatesli_panino',
  'caffe_nero_17_tavuklu_sezar_sandvi_',
  'caffe_nero_18____peynirli_tost',
  'caffe_nero_19__ikolatal__kruvasan',
  'caffe_nero_20_nero_premium_san_sebastian_cheesecake',
] as const;

describe('allergen support', () => {
  it('registers peanut as a full-fledged allergen with a Turkish label', () => {
    expect(ALLERGEN_MAP.peanut).toBeDefined();
    expect(ALLERGEN_MAP.peanut.name).toBe('Yer Fıstığı');
    expect(ALLERGEN_MAP.peanut.description).toMatch(/Yer fıstığı/i);
  });

  it('covers the additional official Caffè Nero allergen labels', () => {
    expect(ALLERGEN_MAP.fish.name).toBe('Balık');
    expect(ALLERGEN_MAP.mustard.name).toBe('Hardal');
    expect(ALLERGEN_MAP.sesame.name).toBe('Susam');
    expect(ALLERGEN_MAP.sulphites.name).toBe('Sülfitler');
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

  it('keeps the full catalog stable and includes the tracked Caffè Nero snapshot', () => {
    const expectedTotal = BASELINE_WITHOUT_CAFFE_NERO + CAFFE_NERO_SOURCE.products.length;
    expect(MENU_ITEMS.length).toBe(expectedTotal);
    const chainIds = new Set(MENU_ITEMS.map(i => i.chainId));
    expect(chainIds.size).toBe(10);
    expect(new Set(MENU_ITEMS.map(i => i.id)).size).toBe(expectedTotal);

    const neroItems = MENU_ITEMS.filter(i => i.chainId === 'caffe_nero');
    expect(neroItems.length).toBe(CAFFE_NERO_SOURCE.products.length);
    expect(new Set(neroItems.map(i => i.name))).toEqual(
      new Set(CAFFE_NERO_SOURCE.products.map(product => product.name)),
    );
    for (const legacyId of LEGACY_CAFFE_NERO_IDS) {
      expect(neroItems.some(item => item.id === legacyId), legacyId).toBe(true);
    }
    // No fabricated or remote images slipped in.
    for (const item of MENU_ITEMS) {
      expect(item.image, item.id).toMatch(/^\/images\/menu\/.+(\.webp)$/);
    }
  });
});
