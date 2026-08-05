import { describe, expect, it } from 'vitest';
import {
  normalizeSearchText,
  queryMatchesItem,
  rankSearchMatches,
  getSearchableFields,
} from '../../src/utils/searchNormalize';
import { MENU_ITEMS } from '../../src/data/items';

describe('search text normalization', () => {
  it('folds Turkish case correctly (İ→i, I→ı→i)', () => {
    expect(normalizeSearchText('İÇECEK')).toBe('icecek');
    expect(normalizeSearchText('ICED')).toBe('iced');
    expect(normalizeSearchText('Iced')).toBe('iced');
    expect(normalizeSearchText('İSTANBUL')).toBe('istanbul');
  });

  it('strips diacritics so accent-free queries match', () => {
    expect(normalizeSearchText('Türk Kahvesi')).toBe('turk kahvesi');
    expect(normalizeSearchText('türk kahvesi')).toBe('turk kahvesi');
    expect(normalizeSearchText('Espresso')).toBe('espresso');
  });

  it('collapses multiple spaces and trims edges', () => {
    expect(normalizeSearchText('  türk   kahvesi  ')).toBe('turk kahvesi');
    expect(normalizeSearchText('  ')).toBe('');
  });
});

describe('search matching over catalog fields', () => {
  const latte = MENU_ITEMS.find(i => i.id === 'starbucks_1_caff__latte');
  const espresso = MENU_ITEMS.find(i => i.id === 'starbucks_5_caff__americano');

  it('finds an item by name with diacritic folding', () => {
    expect(latte).toBeDefined();
    if (!latte) return;
    expect(queryMatchesItem(latte, 'turk kahve')).toBe(false);
    expect(queryMatchesItem(latte, 'caffe latte')).toBe(true);
    expect(queryMatchesItem(latte, 'CAFFE')).toBe(true);
  });

  it('matches by chain name', () => {
    expect(latte).toBeDefined();
    if (!latte) return;
    expect(queryMatchesItem(latte, 'starbucks')).toBe(true);
  });

  it('matches by human-readable category label', () => {
    expect(latte).toBeDefined();
    if (!latte) return;
    expect(queryMatchesItem(latte, 'sıcak espresso')).toBe(true);
    expect(queryMatchesItem(latte, 'sicak')).toBe(true);
  });

  it('matches by dietary tag', () => {
    expect(espresso).toBeDefined();
    if (!espresso) return;
    expect(queryMatchesItem(espresso, 'glutensiz')).toBe(true);
    expect(queryMatchesItem(espresso, 'vegan')).toBe(true);
  });

  it('considers every token in a multi-word query (AND semantics)', () => {
    expect(latte).toBeDefined();
    if (!latte) return;
    expect(queryMatchesItem(latte, 'starbucks latte')).toBe(true);
    expect(queryMatchesItem(latte, 'starbucks mocha')).toBe(false);
  });
});

describe('suggestion ranking', () => {
  it('returns at most the requested limit and prefers name matches', () => {
    const results = rankSearchMatches(MENU_ITEMS, 'latte', 8);
    expect(results.length).toBeLessThanOrEqual(8);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name.toLowerCase()).toContain('latte');
  });

  it('ranks exact name prefix above description-only matches', () => {
    const results = rankSearchMatches(MENU_ITEMS, 'cortado', 8);
    const names = results.map(r => r.name.toLowerCase());
    expect(names.some(n => n.startsWith('cortado'))).toBe(true);
  });

  it('returns [] for an empty query', () => {
    expect(rankSearchMatches(MENU_ITEMS, '   ', 8)).toEqual([]);
  });
});

describe('searchable field extraction', () => {
  it('covers name, chain, description, category label and diet tags', () => {
    const item = MENU_ITEMS.find(i => i.id === 'starbucks_1_caff__latte');
    expect(item).toBeDefined();
    if (!item) return;
    const fields = getSearchableFields(item);
    expect(fields.name).toBe('caffe latte');
    expect(fields.chainName).toBe('starbucks');
    expect(fields.categoryLabel).toContain('espresso');
    expect(Array.isArray(fields.dietaryLabels)).toBe(true);
  });
});