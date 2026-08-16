import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const expectNoSeriousViolations = async (page: Page) => {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  const violations = results.violations.filter(violation => violation.impact === 'critical' || violation.impact === 'serious');
  expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
};

test('home discovery surface has no serious automated accessibility violations', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('item-card')).toHaveCount(24);
  await expectNoSeriousViolations(page);
});

test('dark mobile discovery and allergen dialog pass the same gate', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => localStorage.setItem('kalori_cafe_theme', 'dark'));
  await page.goto('/');
  await expectNoSeriousViolations(page);

  await page.getByRole('button', { name: 'Alerji Profili' }).click();
  await expect(page.getByRole('dialog', { name: 'Kişisel Alerjen & Hassasiyet Profili' })).toBeVisible();
  await expectNoSeriousViolations(page);
});

test('product and methodology routes pass the accessibility gate', async ({ page }) => {
  for (const route of ['/urun/starbucks/caffe-latte/', '/metodoloji/', '/gizlilik/']) {
    await page.goto(route);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expectNoSeriousViolations(page);
  }
});
