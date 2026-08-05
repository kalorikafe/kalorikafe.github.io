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

test('390px and 1440px layouts have no horizontal overflow in both themes', async ({ page }) => {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    for (const theme of ['light', 'dark']) {
      await page.evaluate(t => localStorage.setItem('kalori_cafe_theme', t), theme);
      await page.reload();

      const layout = await page.evaluate(() => {
        const doc = document.documentElement;
        const offenders = [...document.querySelectorAll<HTMLElement>('body *')]
          .map(element => ({
            tag: element.tagName,
            className: element.className.toString().slice(0, 100),
            width: Math.round(element.getBoundingClientRect().width),
          }))
          .filter(element => element.width > doc.clientWidth + 1)
          .slice(0, 10);
        return { overflow: doc.scrollWidth - doc.clientWidth, offenders };
      });
      expect(layout.overflow, `${JSON.stringify(viewport)} ${theme}: ${JSON.stringify(layout.offenders)}`).toBeLessThanOrEqual(0);

      // Basket and theme toggle remain accessible regardless of compactness
            await expect(page.getByRole('button', { name: /Sepetim/ })).toBeVisible();
            await expect(page.getByRole('button', { name: /Açık Moda Geç|Koyu Moda Geç/ })).toBeVisible();
            if (viewport.width < 768) {
              await expect(page.getByRole('button', { name: 'Arama' })).toBeVisible();
            }
          }
        }
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

  // Dynamic against the real catalog: the ChainSelector chip shows each
  // chain's live product count, which must equal the filtered card count.
  const cases = [
    { pill: '☕ Espressolab', chainChip: 'Espressolab', idPrefix: 'espressolab_' },
    { pill: '☕ Kahve Dünyası', chainChip: 'Kahve Dünyası', idPrefix: 'kahve_dunyasi_' },
    { pill: '☕ Caffè Nero', chainChip: 'Caffè Nero', idPrefix: 'caffe_nero_' },
  ];

  for (const c of cases) {
    const badge = page
      .getByRole('button', { name: new RegExp(`${c.chainChip} \\d+`) })
      .getByText(/^\d+$/)
      .first();
    await expect(badge).toBeVisible();
    const expectedCount = Number(await badge.textContent());

    await page.getByRole('button', { name: c.pill }).click();
    const more = page.getByRole('button', { name: 'Daha fazla göster' });
    while (await more.isVisible().catch(() => false)) {
      await more.click();
    }
    await expect(cards).toHaveCount(expectedCount);
    const ids = await cards.evaluateAll(els =>
      els.map(el => el.getAttribute('data-item-id') || '')
    );
    for (const id of ids) {
      expect(id.startsWith(c.idPrefix)).toBe(true);
    }
  }
});

test('catalog total count exceeds the legacy 199 baseline', async ({ page }) => {
  const badge = page
    .getByRole('button', { name: /Tüm Kafeler/ })
    .getByText(/^\d+$/)
    .first();
  await expect(badge).toBeVisible();
  expect(Number(await badge.textContent())).toBeGreaterThan(199);
});

test('suggestion panel opens after 2 characters and filters live', async ({ page }) => {
  const input = page.getByRole('textbox', { name: 'Menüde ara' });
  const listbox = page.getByRole('listbox', { name: 'Arama önerileri' });

  await input.fill('l');
  await expect(listbox).toBeHidden();

  await input.fill('la');
  await expect(listbox).toBeVisible();
  expect(await listbox.getByRole('option').count()).toBeGreaterThan(0);

  await input.fill('sarelle');
  await expect(listbox.getByRole('option')).toHaveCount(1);
  await expect(listbox).toContainText('Sarelle Mocha');
});

test('ArrowDown + Enter activate a suggestion and jump to results', async ({ page }) => {
  const input = page.getByRole('textbox', { name: 'Menüde ara' });
  const listbox = page.getByRole('listbox', { name: 'Arama önerileri' });
  await input.fill('turk');
  await expect(listbox).toBeVisible();

  await input.press('ArrowDown');
  const active = listbox.getByRole('option').and(page.locator('[aria-selected="true"]'));
  await expect(active).toBeVisible();

  await input.press('Enter');
  await expect(listbox).toBeHidden();
  await expect(page.getByTestId('item-card').first()).toBeVisible();
});

test('Escape closes the panel without clearing the query; ArrowUp cycles', async ({ page }) => {
  const input = page.getByRole('textbox', { name: 'Menüde ara' });
  const listbox = page.getByRole('listbox', { name: 'Arama önerileri' });
  await input.fill('latte');
  await expect(listbox).toBeVisible();

  await input.press('ArrowUp');
  await input.press('Escape');
  await expect(listbox).toBeHidden();
  await expect(input).toHaveValue('latte');
  await expect(page.getByTestId('item-card').first()).toBeVisible();
});

test('clear button resets query, panel and active suggestion', async ({ page }) => {
  const input = page.getByRole('textbox', { name: 'Menüde ara' });
  await input.fill('latte');
  await expect(page.getByRole('listbox', { name: 'Arama önerileri' })).toBeVisible();
  await input.press('ArrowDown');

  await page.getByRole('button', { name: 'Aramayı temizle' }).click();
  await expect(page.getByRole('listbox', { name: 'Arama önerileri' })).toBeHidden();
  await expect(input).toHaveValue('');
  await expect(page.getByTestId('item-card').first()).toBeVisible();
});

test('mobile search modal shows the same suggestions and Enter closes it', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Arama' }).click();
  const dialog = page.getByRole('dialog', { name: 'Mobil arama' });
  await expect(dialog).toBeVisible();

  const input = dialog.getByRole('textbox', { name: 'Mobil aramada ara' });
  await input.fill('sarelle');
  await expect(page.getByTestId('item-card')).toHaveCount(1);
  await expect(page.getByTestId('item-card').first()).toContainText('Sarelle Mocha');

  await input.fill('la');
  await expect(page.getByRole('listbox', { name: 'Arama önerileri' })).toBeVisible();
  await input.press('ArrowDown');
  await input.press('Enter');
  await expect(dialog).toBeHidden();
  await expect(page.getByTestId('item-card').first()).toBeVisible();
});

test('theme toggle persists across reload under kalori_cafe_theme', async ({ page }) => {
  const initialDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  const toggle = page.getByRole('button', { name: /Açık Moda Geç|Koyu Moda Geç/ });
  await toggle.click();
  const afterToggle = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  expect(afterToggle).toBe(!initialDark);

  await page.reload();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.classList.contains('dark')))
    .toBe(afterToggle);
  expect(await page.evaluate(() => localStorage.getItem('kalori_cafe_theme'))).toBe(afterToggle ? 'dark' : 'light');
  await expect(
    page.getByRole('button', { name: afterToggle ? 'Açık Moda Geç' : 'Koyu Moda Geç' })
  ).toBeVisible();
});
