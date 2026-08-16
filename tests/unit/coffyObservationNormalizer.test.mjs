import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import {
  nameKey,
  normalizeCoffyObservations,
} from '../../scripts/normalize-coffy-observations.mjs';

const fixtureUrl = new URL('../fixtures/coffy-observations.fixture.json', import.meta.url);
const rawSnapshotUrl = new URL('../../scripts/catalog_sources/coffy_observations.raw.json', import.meta.url);
const committedSnapshotUrl = new URL('../../scripts/catalog_sources/coffy_observations.json', import.meta.url);

async function readJson(url) {
  return JSON.parse(await readFile(url, 'utf8'));
}

describe('Coffy observation normalizer', () => {
  it('enforces the three-branch/two-city chain_core threshold and exclusions', async () => {
    const snapshot = normalizeCoffyObservations(await readJson(fixtureUrl));
    const americano = snapshot.products.find((product) => product.name === 'Americano');
    const coolLime = snapshot.products.find((product) => product.name === 'Cool Lime');

    expect(snapshot.counts).toMatchObject({
      productCount: 2,
      chainCoreCount: 1,
      branchObservedCount: 1,
      reconcileCandidateCount: 1,
      additionCandidateCount: 1,
      excludedObservationCount: 5,
    });
    expect(americano).toMatchObject({
      branchCount: 3,
      cityCount: 2,
      availabilityScope: 'chain_core',
      sourceKind: 'secondary',
    });
    expect(americano.observedVariants).toEqual(['Caffé Americano']);
    expect(coolLime).toMatchObject({
      branchCount: 3,
      cityCount: 1,
      availabilityScope: 'branch_observed',
    });
    expect(snapshot.reconcileCandidates[0]).toMatchObject({
      catalogId: 'coffy_americano',
      matchKind: 'explicit_alias',
    });
    expect(snapshot.additionCandidates[0].name).toBe('Cool Lime');
  });

  it('does not permit callers to weaken the chain_core threshold', async () => {
    const snapshot = normalizeCoffyObservations(await readJson(fixtureUrl), {
      minimumBranches: 1,
      minimumCities: 1,
    });
    const coolLime = snapshot.products.find((product) => product.name === 'Cool Lime');

    expect(coolLime.availabilityScope).toBe('branch_observed');
  });

  it('rejects observations that refer to an unknown branch', async () => {
    const raw = await readJson(fixtureUrl);
    raw.observations[0].branchIds.push('does-not-exist');

    expect(() => normalizeCoffyObservations(raw)).toThrow('Unknown branch id');
  });

  it('keeps Turkish and accented name variants stable', () => {
    expect(nameKey('İsli Peynir & Hindi Fümeli Baget')).toBe(
      nameKey('isli peynir ve hindi fumeli baget'),
    );
  });

  it('reproduces the committed Coffy snapshot without forbidden catalog fields', async () => {
    const raw = await readJson(rawSnapshotUrl);
    const committed = await readJson(committedSnapshotUrl);
    const generated = normalizeCoffyObservations(raw);
    const forbiddenKeys = new Set(['price', 'image', 'calories', 'macros']);

    expect(generated).toEqual(committed);
    expect(generated.coverage).toMatchObject({ branchCount: 5, cityCount: 3 });
    expect(generated.counts).toMatchObject({
      productCount: 78,
      chainCoreCount: 78,
      branchObservedCount: 0,
      reconcileCandidateCount: 22,
      additionCandidateCount: 56,
    });

    for (const product of generated.products) {
      expect(product.branchCount).toBeGreaterThanOrEqual(3);
      expect(product.cityCount).toBeGreaterThanOrEqual(2);
      expect(product.availabilityScope).toBe('chain_core');
    }

    const visit = (value) => {
      if (!value || typeof value !== 'object') return;
      for (const [key, child] of Object.entries(value)) {
        expect(forbiddenKeys.has(key)).toBe(false);
        visit(child);
      }
    };
    visit(generated);
  });
});
