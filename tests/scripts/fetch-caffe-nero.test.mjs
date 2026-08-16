import assert from 'node:assert/strict';
import test from 'node:test';
import { mapAllergen, parseArgs } from '../../scripts/fetch-caffe-nero.mjs';

test('checkedAt defaults at runtime and can be supplied by CLI', () => {
  assert.match(parseArgs([]).checkedAt, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(parseArgs(['--checked-at', '2026-09-01']).checkedAt, '2026-09-01');
});

test('fetch output is a review artifact and cannot overwrite the approved baseline', () => {
  const defaults = parseArgs([]);
  assert.match(defaults.output.replaceAll('\\', '/'), /\/tmp\/catalog_drift\/caffe_nero-candidate\.json$/);
  assert.throws(
    () => parseArgs(['--baseline', defaults.baseline, '--output', defaults.baseline]),
    /may not overwrite the approved baseline/,
  );
});

test('official allergen mapper covers the regulated groups exposed by the page', () => {
  assert.equal(mapAllergen('Süt ve süt ürünleri'), 'milk');
  assert.equal(mapAllergen('Kabuklu deniz ürünleri'), 'crustaceans');
  assert.equal(mapAllergen('Yer fıstığı'), 'peanut');
  assert.equal(mapAllergen('Sert kabuklu kuruyemiş'), 'nuts');
  assert.equal(mapAllergen('Acı bakla (lupin)'), 'lupin');
  assert.equal(mapAllergen('Yumuşakçalar'), 'molluscs');
});

