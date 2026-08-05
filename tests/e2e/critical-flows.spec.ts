import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/*', route => {
    if (route.request().resourceType() === 'image') return route.abort();
    return route.continue();
  });
  await page.goto('/');
});

test('loads the real catalog and renders product cards', async ({ page }) => {
  await expect(page.getByText('Kalori Cafe').first()).toBeVisible();
  const cards = page.getByTestId('item-card');
  await expect(cards).toHaveCount(24);
  await page.getByRole('button', { name: 'Daha fazla göster' }).click();
  await expect(cards).toHaveCount(48);
  await page.getByRole('button', { name: 'Daha fazla göster' }).click();
  await expect(cards).toHaveCount(72);
});

test('search changes the rendered result set', async ({ page }) => {
  const cards = page.getByTestId('item-card');
  await expect(cards).toHaveCount(24);

  await page.getByRole('textbox', { name: 'Menüde ara' }).fill('Sarelle Mocha');

  await expect(cards).toHaveCount(1);
  await expect(cards.first()).toContainText('Sarelle Mocha');
});

test('opens and closes a product detail dialog', async ({ page }) => {
  const latteCard = page.locator('[data-item-id="starbucks_1_caff__latte"]');
  await latteCard.getByTitle('FDA Besin Etiketi Göster').click();

  const dialog = page.getByRole('dialog', { name: 'Besin Değerleri' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('Caffè Latte');
  await expect(dialog).toContainText('Kaynak doğrulaması bekleniyor');

  await dialog.getByRole('button', { name: 'Besin değerlerini kapat' }).click();
  await expect(dialog).toBeHidden();
});

test('untouched customizer calories match the product card', async ({ page }) => {
  const latteCard = page.locator('[data-item-id="starbucks_1_caff__latte"]');
  await expect(latteCard.getByTestId('card-calories')).toContainText('190');
  await latteCard.getByRole('button', { name: 'Özelleştir' }).click();

  const dialog = page.getByRole('dialog', { name: /Caffè Latte/ });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByTestId('customizer-calories')).toContainText('190');

  await dialog.getByRole('button', { name: 'Özelleştiriciyi kapat' }).click();
  await expect(dialog).toBeHidden();
});

test('dialog traps interaction, locks page scroll and restores focus on Escape', async ({ page }) => {
  const latteCard = page.locator('[data-item-id="starbucks_1_caff__latte"]');
  const trigger = latteCard.getByRole('button', { name: 'Özelleştir' });
  await trigger.click();

  const dialog = page.getByRole('dialog', { name: /Caffè Latte/ });
  await expect(dialog).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('hidden');
  await expect.poll(() => page.evaluate(() => document.activeElement?.closest('[role="dialog"]') !== null)).toBe(true);

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('');
});

test('mobile 390px layout has no horizontal overflow and actions stay reachable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const cards = page.getByTestId('item-card');
  await expect(cards).toHaveCount(24);

  const layout = await page.evaluate(() => {
    const doc = document.documentElement;
    const offenders = [...document.querySelectorAll<HTMLElement>('body *')]
      .map(element => ({
        tag: element.tagName,
        text: (element.textContent || '').trim().slice(0, 60),
        className: element.className.toString().slice(0, 100),
        left: Math.round(element.getBoundingClientRect().left),
        right: Math.round(element.getBoundingClientRect().right),
        width: Math.round(element.getBoundingClientRect().width),
        overflowX: getComputedStyle(element).overflowX,
        scrollWidth: element.scrollWidth,
        clientWidth: element.clientWidth,
      }))
      .filter(element =>
        element.width > doc.clientWidth + 1 ||
        (element.left < doc.clientWidth && element.right > doc.clientWidth + 1 && element.overflowX === 'visible')
      )
      .slice(0, 20);
    return { overflow: doc.scrollWidth - doc.clientWidth, offenders };
  });
  expect(layout.overflow, JSON.stringify(layout.offenders)).toBeLessThanOrEqual(0);

  // Basket and theme toggle remain accessible regardless of compactness
  await expect(page.getByRole('button', { name: /Sepetim/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Açık Moda Geç|Koyu Moda Geç/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Arama' })).toBeVisible();
});

test('mobile search dialog filters results at 390px and Escape/close work', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const cards = page.getByTestId('item-card');
  await expect(cards).toHaveCount(24);

  await page.getByRole('button', { name: 'Arama' }).click();
  const dialog = page.getByRole('dialog', { name: 'Mobil arama' });
  await expect(dialog).toBeVisible();

  await dialog.getByRole('textbox', { name: 'Mobil aramada ara' }).fill('Sarelle Mocha');
  await expect(cards).toHaveCount(1);
  await expect(cards.first()).toContainText('Sarelle Mocha');

  // Close button hides the dialog while keeping the applied search
  await dialog.getByRole('button', { name: 'Aramayı kapat' }).click();
  await expect(dialog).toBeHidden();
  await expect(cards).toHaveCount(1);

  // Reopen, type again, then Escape closes it
  await page.getByRole('button', { name: 'Arama' }).click();
  await expect(dialog).toBeVisible();
  await dialog.getByRole('textbox', { name: 'Mobil aramada ara' }).fill('Latte');
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});

test('hero quick pills filter to the correct chain', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const cards = page.getByTestId('item-card');
  await expect(cards).toHaveCount(24);

  const cases = [
    { pill: '☕ Espressolab', idPrefix: 'espressolab_', count: 20 },
    { pill: '☕ Kahve Dünyası', idPrefix: 'kahve_dunyasi_', count: 20 },
    { pill: '☕ Caffè Nero', idPrefix: 'caffe_nero_', count: 20 },
  ];

  for (const c of cases) {
    await page.getByRole('button', { name: c.pill }).click();
    await expect(cards).toHaveCount(c.count);
    const ids = await cards.evaluateAll(els =>
      els.map(el => el.getAttribute('data-item-id') || '')
    );
    for (const id of ids) {
      expect(id.startsWith(c.idPrefix)).toBe(true);
    }
  }
});
