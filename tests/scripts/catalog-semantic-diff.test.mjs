import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { semanticCatalogDiff } from '../../scripts/catalog-semantic-diff.mjs';

const FIXTURES = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'fixtures', 'catalog-drift');
const readFixture = name => JSON.parse(fs.readFileSync(path.join(FIXTURES, name), 'utf8'));

test('one miss retains the product as unknown without treating a 20% drop as sudden', () => {
  const report = semanticCatalogDiff({
    baseline: readFixture('baseline.json'),
    candidate: readFixture('candidate-first-miss.json'),
    checkedAt: '2026-08-11',
  });

  assert.equal(report.dropRate, 0.20);
  assert.deepEqual(report.blockingIssues, []);
  assert.equal(report.missing[0].name, 'Cookie');
  assert.equal(report.missing[0].consecutiveMisses, 1);
  assert.equal(report.missing[0].lifecycle, 'unknown');
  assert.equal(report.counts.proposed, report.counts.baseline);
  assert.equal(report.noAutomaticDeletion, true);
});

test('the second consecutive miss proposes retired but still keeps the row', () => {
  const report = semanticCatalogDiff({
    baseline: readFixture('baseline.json'),
    candidate: readFixture('candidate-first-miss.json'),
    state: readFixture('state-after-first-miss.json'),
    checkedAt: '2026-08-11',
  });

  assert.equal(report.missing[0].consecutiveMisses, 2);
  assert.equal(report.missing[0].lifecycle, 'retired');
  assert.ok(report.proposedProducts.some(product => product.name === 'Cookie' && product.lifecycle === 'retired'));
});

test('a drop greater than 20% is blocking', () => {
  const report = semanticCatalogDiff({
    baseline: readFixture('baseline.json'),
    candidate: readFixture('candidate-drop.json'),
    checkedAt: '2026-08-11',
  });

  assert.equal(report.dropRate, 0.40);
  assert.ok(report.blockingIssues.includes('sudden_drop'));
});

test('duplicate candidate names are blocking and cannot delete baseline rows', () => {
  const report = semanticCatalogDiff({
    baseline: readFixture('baseline.json'),
    candidate: readFixture('candidate-duplicate.json'),
    checkedAt: '2026-08-11',
  });

  assert.ok(report.blockingIssues.includes('duplicate_names'));
  assert.equal(report.duplicates[0].key, 'latte');
  assert.equal(report.noAutomaticDeletion, true);
});

test('lifecycle values are restricted to current, seasonal, retired or unknown', () => {
  assert.throws(() => semanticCatalogDiff({
    baseline: readFixture('baseline.json'),
    candidate: { products: [{ name: 'Americano', lifecycle: 'deleted' }] },
    checkedAt: '2026-08-11',
  }), /Unknown lifecycle/);
});

test('set-like allergen ordering is not reported as semantic drift', () => {
  const report = semanticCatalogDiff({
    baseline: { products: [{ name: 'Cookie', allergens: ['egg', 'gluten', 'milk'] }] },
    candidate: { products: [{ name: 'Cookie', allergens: ['milk', 'egg', 'gluten'] }] },
    checkedAt: '2026-08-11',
  });
  assert.equal(report.counts.changed, 0);
});
