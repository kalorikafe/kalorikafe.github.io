import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  coffyCatalogId,
  estimateCoffyMacros,
  strongNameAllergens,
} from '../../scripts/publish-coffy-catalog.mjs';

const root = path.resolve(import.meta.dirname, '../..');
const source = (name: string) => JSON.parse(readFileSync(
  path.join(root, 'scripts', 'catalog_sources', name),
  'utf8',
));
const observations = source('coffy_observations.json');
const publication = source('coffy_catalog_publication.json');
const release = source('catalog_release.json');
const assets = source('catalog_assets.json');
const provenance = source('image-provenance.json');
const coffyItems = release.items.filter((item: { chainId: string }) => item.chainId === 'coffy');
const byId = new Map<string, Record<string, any>>(release.items.map((item: Record<string, any>) => [item.id, item]));
const nutritionFields = ['calories', 'protein', 'carbs', 'sugar', 'fat', 'satFat', 'caffeine', 'sodium'];

describe('controlled Coffy catalog publication', () => {
  it('publishes 56 chain-core candidates, reconciles 22, and retains all 8 unseen rows', () => {
    expect(publication.counts).toEqual({
      observedProducts: 78,
      reconciledExisting: 22,
      addedProducts: 56,
      retainedUnobservedExisting: 8,
      coffyProductsAfterPublication: 86,
      catalogProductsAfterPublication: 1006,
    });
    expect(coffyItems).toHaveLength(86);
    expect(release.items).toHaveLength(1006);
    expect(observations.additionCandidates).toHaveLength(56);
    expect(observations.additionCandidates.every((candidate: Record<string, any>) => (
      candidate.availabilityScope === 'chain_core'
      && candidate.branchCount >= 3
      && candidate.cityCount >= 2
      && byId.has(coffyCatalogId(candidate.name))
    ))).toBe(true);
    expect(observations.unobservedCatalogItems.every((item: { id: string }) => byId.has(item.id))).toBe(true);
    expect(observations.reconcileCandidates.every((candidate: { catalogId: string }) => {
      const item = byId.get(candidate.catalogId);
      return item?.catalogSource.kind === 'secondary'
        && item.catalogSource.checkedAt === '2026-08-11';
    })).toBe(true);
  });

  it('marks every Coffy nutrition field as an estimate with an honest serving caveat', () => {
    for (const item of coffyItems) {
      expect(item.nutritionSource.status, item.id).toBe('estimated');
      expect(item.nutritionSource.servingBasis, item.id).toContain('standart kafe porsiyonu');
      expect(item.nutritionSource.notes, item.id).toContain('resmî besin tablosu yayımlamıyor');
      expect(nutritionFields.every((field) => item.nutritionSource.fieldStatus[field] === 'estimated'), item.id).toBe(true);
    }
    expect(estimateCoffyMacros('Bulletproof Latte', 'espresso_hot')).toMatchObject({ calories: 330, fat: 35 });
    expect(estimateCoffyMacros('Iced Americano', 'espresso_iced')).toMatchObject({ calories: 10, sugar: 0 });
  });

  it('uses only strong name evidence for allergens and never assigns safety tags to additions', () => {
    const additions = observations.additionCandidates.map((candidate: { name: string }) => byId.get(coffyCatalogId(candidate.name)));
    expect(additions.every((item: Record<string, any>) => item.dietaryTags.length === 0)).toBe(true);

    expect(byId.get('coffy_glutensiz_brownie')?.allergens).toEqual(['egg']);
    expect(byId.get('coffy_cookie_cups_kakaolu_findik_kremali')?.allergens)
      .toEqual(['egg', 'gluten', 'milk', 'nuts']);
    expect(byId.get('coffy_kasarli_zeytin_ezmeli_simit_sandvic')?.allergens)
      .toEqual(['gluten', 'milk', 'sesame']);
    expect(byId.get('coffy_matcha_latte')).toMatchObject({ allergens: ['milk'], containsLactose: true });
    expect(byId.get('coffy_chocolate_cookie_latte')).toMatchObject({
      allergens: ['egg', 'gluten', 'milk'],
      containsLactose: true,
    });
    expect(byId.get('coffy_iced_americano')).toMatchObject({
      allergens: [],
      allergenSource: { status: 'unavailable' },
    });
    expect(byId.get('coffy_iced_americano')).not.toHaveProperty('containsLactose');
    expect(strongNameAllergens('Glutensiz Brownie', 'bakery_dessert')).toEqual(['egg']);
  });

  it('keeps unique local labelled fallbacks with complete inherited license provenance', () => {
    expect(Object.keys(assets)).toHaveLength(release.items.length);
    expect(provenance.recordCount).toBe(release.items.length);
    expect(Object.values(provenance.records).every((record: any) => (
      record.sourceKind !== 'licensed_fallback'
      || (record.license !== 'unknown' && /^https:\/\//.test(record.licenseUrl))
    ))).toBe(true);

    for (const candidate of observations.additionCandidates) {
      const id = coffyCatalogId(candidate.name);
      const item = byId.get(id)!;
      expect(item.image, id).toBe(`/images/menu/coffy/${id.slice('coffy_'.length)}.webp`);
      expect(item.imageSource, id).toMatchObject({ kind: 'licensed_fallback', exactProduct: false });
      expect(assets[id], id).toMatchObject({
        id,
        file: item.image,
        kind: 'licensed_fallback',
        exactProduct: false,
      });
      expect(provenance.records[id], id).toMatchObject({
        imagePath: item.image,
        sourceKind: 'licensed_fallback',
        exactProduct: false,
      });
    }
  });
});
