import { expect, test } from '@playwright/test';

test('static sitemap and chain pages expose crawlable canonical links', async ({ request }) => {
  const buildInfo = await (await request.get('/build-info.json')).json();
  const sitemapResponse = await request.get('/sitemap.xml');
  expect(sitemapResponse.ok()).toBe(true);
  const sitemap = await sitemapResponse.text();
  expect((sitemap.match(/<url>/g) ?? [])).toHaveLength(buildInfo.catalogCount + 13);
  expect(sitemap).toContain('<loc>https://kalorikafe.github.io/zincir/caffe-nero/</loc>');
  expect(sitemap).toContain('<loc>https://kalorikafe.github.io/metodoloji/</loc>');

  const chainResponse = await request.get('/zincir/caffe-nero/');
  const chainHtml = await chainResponse.text();
  expect(chainHtml).toContain('<link rel="canonical" href="https://kalorikafe.github.io/zincir/caffe-nero/"');
  expect(chainHtml).toContain('<h1>Caffè Nero ürünleri</h1>');
  const manifest = await (await request.get('/data/catalog-manifest.json')).json();
  const catalog = await (await request.get(`/data/${manifest.file}`)).json();
  const neroCount = catalog.items.filter((item: { chainId: string }) => item.chainId === 'caffe_nero').length;
  expect((chainHtml.match(/href="\/urun\/caffe-nero\//g) ?? []).length).toBe(neroCount);
});

test('product static HTML has semantic nutrition, canonical, Open Graph and JSON-LD', async ({ request }) => {
  const response = await request.get('/urun/starbucks/caffe-latte/');
  expect(response.ok()).toBe(true);
  const html = await response.text();
  expect(html).toContain('<h1>Caffè Latte</h1>');
  expect(html).toContain('<dt>Kalori</dt>');
  expect(html).toContain('rel="canonical" href="https://kalorikafe.github.io/urun/starbucks/caffe-latte/"');
  expect(html).toContain('property="og:image"');
  expect(html).toContain('"@type":"MenuItem"');
  expect(html).toContain('"@type":"BreadcrumbList"');
});

test('filter state survives reload and browser history', async ({ page }) => {
  await page.goto('/');
  const chain = page.getByRole('combobox', { name: 'Kafe zinciri seç' });
  await chain.selectOption('caffe_nero');
  await expect(page).toHaveURL(/\/zincir\/caffe-nero\/$/);

  const category = page.getByRole('combobox', { name: 'Kategori' });
  await category.selectOption('espresso_iced');
  await expect(page).toHaveURL(/category=espresso_iced/);
  await page.reload();
  await expect(category).toHaveValue('espresso_iced');

  await page.goBack();
  await expect(page).not.toHaveURL(/category=espresso_iced/);
  await expect(category).toHaveValue('all');
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(chain).toHaveValue('');
});

test('product card links to its stable public detail route', async ({ page }) => {
  await page.goto('/');
  const firstCard = page.getByTestId('item-card').first();
  const link = firstCard.getByRole('link', { name: 'Caffè Latte' });
  await expect(link).toHaveAttribute('href', '/urun/starbucks/caffe-latte/');
  await link.click();
  await expect(page).toHaveURL(/\/urun\/starbucks\/caffe-latte\/$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Caffè Latte' })).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://kalorikafe.github.io/urun/starbucks/caffe-latte/');
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /Caffè Latte Kalori ve Makroları/);
});
