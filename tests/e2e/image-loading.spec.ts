import { expect, test } from '@playwright/test';

/**
 * Dedicated image test file: it deliberately does NOT abort image requests
 * (the other spec's beforeEach blocks them), so it can verify that local
 * WebP assets actually load in the browser.
 */
test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('product images are local webp files that actually load (naturalWidth > 0)', async ({ page }) => {
  await expect(page.getByTestId('item-card').first()).toBeVisible();

  // Card <img> tags that point at /images/menu/ are the product photos
  // (chain logo badges are separate, non-product images).
  const productImages = page
    .getByTestId('item-card')
    .locator('img[src^="/images/menu/"]');
  await expect(productImages.first()).toBeVisible();

  const sources = await productImages.evaluateAll(imgs =>
    imgs.map(img => img.getAttribute('src') || '')
  );
  expect(sources.length).toBeGreaterThan(0);
  for (const src of sources) {
    expect(src, 'card image must be local webp').toMatch(/^\/images\/menu\/.+\.webp$/);
  }

  // Wait for the lazily-loaded grid images and verify real decoding.
  await page.getByTestId('item-card').first().locator('img').evaluate(async (img: HTMLImageElement) => {
    if (!img.complete) {
      await new Promise<void>(resolve => {
        img.addEventListener('load', () => resolve(), { once: true });
        img.addEventListener('error', () => resolve(), { once: true });
      });
    }
  });
  const loaded = await page.getByTestId('item-card').first().locator('img').evaluate(
    (img: HTMLImageElement) => ({ complete: img.complete, naturalWidth: img.naturalWidth })
  );
  expect(loaded.complete).toBe(true);
  expect(loaded.naturalWidth).toBeGreaterThan(0);

  // The referenced assets are served over HTTP with the webp content type.
  const response = await page.request.get(sources[0]);
  expect(response.ok()).toBe(true);
  const headers = await response.headers();
  expect(headers['content-type'] || '').toContain('webp');
  expect((await response.body()).length).toBeGreaterThan(0);
});

test('every visible card in both themes renders its image element', async ({ page }) => {
  for (const theme of ['light', 'dark']) {
    await page.evaluate(t => localStorage.setItem('kalori_cafe_theme', t), theme);
    await page.reload();
    await expect(page.getByTestId('item-card').first()).toBeVisible();
    const images = page.getByTestId('item-card').locator('img');
    const count = await images.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(images.nth(i)).toBeVisible();
    }
  }
});