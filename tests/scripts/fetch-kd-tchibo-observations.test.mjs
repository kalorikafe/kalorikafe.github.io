import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  buildObservationSnapshot,
  CHAIN_CONFIGS,
  exclusionReasons,
  mapCategory,
  nameKey,
  parseArgs,
} from '../../scripts/fetch-kd-tchibo-observations.mjs';

const fixture = JSON.parse(
  await readFile(
    new URL('../fixtures/kd-tchibo-observations/claims.json', import.meta.url),
    'utf8',
  ),
);

function product(category, name, price) {
  return {
    name,
    description: category.includes('Paket') ? 'Paketli ürün' : '',
    display_price: null,
    product_variations: [{ price }],
  };
}

function fixtureResponses(config) {
  const chainFixture = fixture[config.chainId];
  return Object.fromEntries(
    config.branches.map((branch, index) => {
      const claims = [
        ...chainFixture.base,
        ...(index < 3 ? chainFixture.firstThree : []),
        ...(index < 2 ? chainFixture.firstTwo : []),
      ];
      const byCategory = new Map();
      for (const claim of claims) {
        const products = byCategory.get(claim.category) ?? [];
        products.push(product(claim.category, claim.name, claim.price + index));
        byCategory.set(claim.category, products);
      }
      return [
        branch.vendorCode,
        {
          status_code: 200,
          data: {
            code: branch.vendorCode,
            name: config.chainName,
            address: `${branch.name} fixture address`,
            latitude: 40 + index / 100,
            longitude: 29 + index / 100,
            menus: [
              {
                menu_categories: [...byCategory].map(([name, products]) => ({ name, products })),
              },
            ],
          },
        },
      ];
    }),
  );
}

test('CLI requires an explicit observation date for reproducible snapshots', () => {
  assert.throws(() => parseArgs([]), /--observed-at YYYY-MM-DD is required/);
  assert.equal(parseArgs(['--observed-at', '2026-08-11']).observedAt, '2026-08-11');
});

test('normalization and exclusions are Turkish-aware and reject retail scope', () => {
  assert.equal(nameKey('Fındık Kremalı'), 'findik kremali');
  assert.deepEqual(exclusionReasons('Paket Kahveler', 'Çekirdek Kahve (250 gr.)'), [
    'beans_capsules_or_packaged_coffee',
    'packaged_retail',
  ]);
  assert.equal(mapCategory('tchibo', 'Buzlu İçecekler', 'Iced Chai Tea Latte'), 'tea_herbal');
  assert.equal(mapCategory('kahve_dunyasi', 'Türk Kahveleri', 'Soğuk Türk Kahvesi'), 'espresso_iced');
});

for (const config of Object.values(CHAIN_CONFIGS)) {
  test(`${config.chainName} fixture computes union, intersection, 60% core, prices, and statuses deterministically`, () => {
    const vendorResponses = fixtureResponses(config);
    const exactName = config.chainId === 'kahve_dunyasi' ? 'Americano' : 'Latte Macchiato';
    const existingCatalog = [{ id: `${config.chainId}_fixture_exact`, name: exactName }];
    const input = {
      config,
      observedAt: '2026-08-11',
      vendorResponses,
      existingCatalog,
    };
    const first = buildObservationSnapshot(input);
    const second = buildObservationSnapshot(input);

    assert.equal(JSON.stringify(first), JSON.stringify(second));
    assert.equal(first.coverage.branchCount, 5);
    assert.ok(first.coverage.cityCount >= 3);
    assert.equal(first.counts.unionProductCount, 3);
    assert.equal(first.counts.intersectionProductCount, 1);
    assert.equal(first.counts.chainCoreCount, 2);
    assert.equal(first.counts.exactCandidateCount, 1);
    assert.equal(first.counts.additionCandidateCount, 1);
    assert.equal(first.counts.uncertainCaseCount, 1);

    const exact = first.products.find((item) => item.name === exactName);
    assert.equal(exact.branchCount, 5);
    assert.equal(exact.status, 'core');
    assert.equal(exact.price.min, exact.price.byBranch[0].amount);
    assert.ok(exact.price.max > exact.price.min);
    assert.equal(exact.nutrition, 'unknown');
    assert.equal(exact.allergens, 'unknown');

    const ambiguous = first.products.find((item) => item.branchCount === 2);
    assert.equal(ambiguous.status, 'ambiguous');
    assert.equal(ambiguous.availabilityScope, 'branch_observed');
    assert.ok(first.excludedProducts.length >= 2);
    assert.ok(first.excludedProducts.every((item) => item.status === 'excluded'));
  });
}
