import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/?demo=1');
  await expect(page.getByRole('button', { name: 'Kişisel tercihleri aç' })).toBeVisible();
  await page.waitForFunction(() => localStorage.getItem('negiysem_user_preferences') !== null);
});

test('complete dashboard, seven days, no overflow or clipped card text', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await expect(page.getByRole('heading', { name: /Güne hazır çık/ })).toBeVisible();
  await expect(page.getByRole('region', { name: '7 Günlük Gardırop Planı' }).getByRole('button')).toHaveCount(7);
  await expect(page.getByRole('heading', { name: 'Giyimin için net kararlar.' })).toBeVisible();
  await page.getByRole('slider', { name: 'Saatlik zaman çizelgesi kaydırma çubuğu' }).focus();
  await page.keyboard.press('End');
  await expect(page.getByRole('slider')).toHaveValue('23');
  const overflow = await page.evaluate(() => ({ width: innerWidth, document: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
  expect(overflow.document).toBeLessThanOrEqual(overflow.width);
  expect(overflow.body).toBeLessThanOrEqual(overflow.width);
  const clipped = await page.locator('main h3, main p').evaluateAll(elements => elements.filter(element => getComputedStyle(element).textOverflow === 'ellipsis').length);
  expect(clipped).toBe(0);
  expect(errors).toEqual([]);
  await page.getByRole('slider').press('Home');
  await page.getByRole('slider').blur();
  await expect(page.getByRole('link', { name: 'İçeriğe geç' })).not.toBeFocused();
  await page.screenshot({ path: testInfo.outputPath('product.png'), fullPage: true });
});

test('native hour rail and weekly selection work with pointer and keyboard', async ({ page }) => {
  const slider = page.getByRole('slider', { name: 'Saatlik zaman çizelgesi kaydırma çubuğu' });
  await slider.focus(); await slider.press('Home'); await expect(slider).toHaveValue('0');
  await slider.press('End'); await expect(slider).toHaveValue('23');
  const box = (await slider.boundingBox())!;
  await page.mouse.move(box.x + 10, box.y + box.height / 2); await page.mouse.down();
  await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2, { steps: 24 }); await page.mouse.up();
  await expect(slider).toHaveValue('23');
  const nextDay = page.getByRole('region', { name: '7 Günlük Gardırop Planı' }).getByRole('button').nth(1);
  await nextDay.click(); await expect(nextDay).toHaveAttribute('aria-pressed', 'true'); await expect(slider).toHaveValue('0');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await slider.press('ArrowRight'); await expect(slider).toHaveValue('1');
});

test('feedback persists, preferences dialog traps focus and restores it', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Kişisel tercihleri aç' });
  await page.getByRole('button', { name: 'Üşüdüm', exact: true }).click();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('negiysem_user_preferences') ?? '{}').temperatureSensitivity)).toBe(-1);
  await page.reload();
  await expect(trigger).toContainText('-1°');
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Gardırop Ayarları' });
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Tab');
  expect(await dialog.evaluate(element => element.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape'); await expect(dialog).not.toBeVisible(); await expect(trigger).toBeFocused();
});

test('Turkish search and recoverable network error preserve previous location', async ({ page }) => {
  await page.route('**/api/weather?**', route => route.fulfill({ status: 502, json: { error: 'Test error' } }));
  await page.getByRole('button', { name: /^Konumu değiştir:/ }).click();
  await page.getByRole('searchbox').fill('kadikoy');
  await page.getByRole('button', { name: /İstanbul \/ Kadıköy & Moda/ }).click();
  await expect(page.getByRole('main').getByRole('alert')).toContainText('Önceki konum gösteriliyor');
  await expect(page.getByRole('button', { name: /^Konumu değiştir:/ })).toContainText('Beşiktaş');
});
