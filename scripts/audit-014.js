// Run with playwright-cli run-code --filename=scripts/audit-014.js.
// Requires a production server at http://127.0.0.1:3014 and a headless CLI session.
async page => {
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  const failures = [];
  page.on('pageerror', error => failures.push(error.message));
  const location = { id: 'istanbul-besiktas', name: 'İstanbul / Boğaz & Beşiktaş', region: 'İstanbul', latitude: 41.0428, longitude: 29.0077, microclimateNote: 'Test tahmini' };
  const start = new Date('2026-11-16T00:00:00+03:00').getTime();
  const hourly = Array.from({ length: 168 }, (_, index) => ({
    time: new Date(start + index * 3600000).toISOString(), temperature: 17 + Math.sin(index / 4) * 5,
    apparentTemperature: 15 + Math.sin(index / 4) * 5, precipitation: index % 24 === 15 ? 4.2 : 0,
    precipitationProbability: index % 24 === 15 ? 90 : 10, windSpeed: 28, windDirection: 45, weatherCode: index % 24 === 15 ? 63 : 2,
  }));
  let failNext = false;
  await page.route('**/api/weather?**', async route => {
    if (failNext) { failNext = false; await route.fulfill({ status: 502, json: { error: 'Test error' } }); }
    else await route.fulfill({ json: { hourly } });
  });
  await page.context().addInitScript(saved => {
    if (!localStorage.getItem('negiysem_user_location')) localStorage.setItem('negiysem_user_location', JSON.stringify(saved));
  }, location);
  await page.goto('http://127.0.0.1:3014');
  const week = page.getByRole('region', { name: '7 Günlük Gardırop Planı' });
  await week.getByRole('button').nth(6).waitFor();
  const slider = page.getByRole('slider', { name: 'Saatlik zaman çizelgesi kaydırma çubuğu' });
  const results = [];
  for (const width of [390, 1440, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await slider.focus(); await slider.press('Home');
    assert(await slider.inputValue() === '0', `${width}: Home must select first hour`);
    await slider.press('End');
    assert(await slider.inputValue() === '23', `${width}: End must select last hour`);
    const geometry = await page.evaluate(() => {
      const overflow = [...document.querySelectorAll('main *')].filter(element => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && (rect.left < -1 || rect.right > innerWidth + 1);
      }).map(element => element.tagName + '.' + element.className);
      return { scrollWidth: document.documentElement.scrollWidth, innerWidth, overflow };
    });
    assert(geometry.scrollWidth <= geometry.innerWidth, `${width}: document overflow ${JSON.stringify(geometry)}`);
    assert(geometry.overflow.length === 0, `${width}: clipped elements ${geometry.overflow.join(', ')}`);
    const truncated = await page.locator('main h3, main p').evaluateAll(elements => elements.filter(element => {
      const style = getComputedStyle(element);
      return style.textOverflow === 'ellipsis' || (style.webkitLineClamp !== 'none' && style.webkitLineClamp !== '');
    }).length);
    assert(!truncated, `${width}: truncated card text`);
    await page.screenshot({ path: `.playwright/audit-014-${width}.png`, fullPage: true });
    results.push({ width, ...geometry, truncated });
  }
  await page.setViewportSize({ width: 390, height: 900 });
  const bounds = await slider.boundingBox();
  await page.mouse.move(bounds.x + 10, bounds.y + bounds.height / 2);
  await page.mouse.down();
  await page.mouse.move(bounds.x + bounds.width - 10, bounds.y + bounds.height / 2, { steps: 24 });
  await page.mouse.up();
  assert(await slider.inputValue() === '23', 'mouse drag must reach final hour');
  await week.getByRole('button').nth(1).click();
  assert(await week.getByRole('button').nth(1).getAttribute('aria-pressed') === 'true', 'weekly selection');
  const before = await page.evaluate(() => JSON.parse(localStorage.getItem('negiysem_user_preferences')).temperatureSensitivity);
  await page.getByRole('button', { name: 'Üşüdüm', exact: true }).click();
  await page.waitForFunction(previous => JSON.parse(localStorage.getItem('negiysem_user_preferences')).temperatureSensitivity === Math.max(-2, previous - 1), before);
  await page.reload();
  await week.getByRole('button').nth(6).waitFor();
  const after = await page.evaluate(() => JSON.parse(localStorage.getItem('negiysem_user_preferences')).temperatureSensitivity);
  assert(after === Math.max(-2, before - 1), 'thermal preference must persist after reload');
  await page.getByRole('button', { name: 'Kişisel tercihleri aç' }).click();
  await page.getByRole('dialog', { name: 'Gardırop Ayarları' }).waitFor();
  await page.keyboard.press('Escape');
  assert(await page.getByRole('button', { name: 'Kişisel tercihleri aç' }).evaluate(element => element === document.activeElement), 'drawer must restore focus');
  await page.getByRole('button', { name: /^Konumu değiştir:/ }).click();
  await page.getByRole('searchbox').fill('kadikoy');
  await page.getByRole('button', { name: /İstanbul \/ Kadıköy & Moda/ }).click();
  await page.getByRole('button', { name: 'Konumu değiştir: İstanbul / Kadıköy & Moda' }).waitFor();
  failNext = true;
  await page.getByRole('button', { name: /^Konumu değiştir:/ }).click();
  await page.getByRole('searchbox').fill('ankara');
  await page.getByRole('button', { name: /Ankara \/ Çankaya/ }).click();
  await page.getByRole('main').getByRole('alert').waitFor();
  assert(await page.getByRole('button', { name: 'Konumu değiştir: İstanbul / Kadıköy & Moda' }).isVisible(), 'failed fetch must keep previous location and data');
  await page.context().grantPermissions(['geolocation']);
  await page.context().setGeolocation({ latitude: 39.12345, longitude: 32.12345 });
  await page.getByRole('button', { name: /^Konumu değiştir:/ }).click();
  await page.getByRole('button', { name: 'Mevcut konumumu kullan (GPS)' }).click();
  await page.getByRole('button', { name: 'Konumu değiştir: Mevcut Konumum (GPS)' }).waitFor();
  assert(await page.evaluate(() => JSON.parse(localStorage.getItem('negiysem_user_location')).latitude) === 39.12345, 'GPS coordinates must not snap to a preset');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await slider.focus(); await slider.press('Home');
  assert(await slider.inputValue() === '0', 'reduced motion must preserve interaction');
  assert(failures.length === 0, `browser errors: ${failures.join('; ')}`);
  return { results, flows: ['keyboard', 'mouse drag', 'weekly selection', 'preference persistence', 'dialog focus', 'Turkish search', 'fetch recovery', 'exact GPS', 'reduced motion'], browserErrors: failures };
}
