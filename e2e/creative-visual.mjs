import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
await mkdir('test-results/visual', { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 768, height: 1024 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('http://127.0.0.1:4173');
  await page.getByRole('button', { name: 'Skip tutorial', exact: true }).click();
  await page.getByRole('button', { name: /2. Paint/ }).click();
  await page.getByRole('button', { name: 'Stencils', exact: true }).click();
  await page.getByRole('button', { name: 'Fill stencil', exact: true }).click();
  await page.locator('.studio-stages').scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'test-results/visual/creative-stencil-ipad.png', fullPage: true });
  await page.getByRole('button', { name: 'Lift stencil' }).click();
  await page.getByRole('button', { name: 'Marble dip', exact: true }).click();
  await page.getByRole('button', { name: 'Swirl colors' }).click();
  await page.getByRole('button', { name: 'Dip this nail' }).click();
  for (const [name, width, height] of [
    ['ipad', 768, 1024],
    ['landscape', 1133, 744],
    ['phone', 390, 844],
    ['desktop', 1440, 1000],
  ]) {
    await page.setViewportSize({ width, height });
    await page.locator('.studio-stages').scrollIntoViewIfNeeded();
    await page.screenshot({
      path: `test-results/visual/creative-marble-${name}.png`,
      fullPage: true,
    });
    await page.getByRole('button', { name: 'Marble second color: Sky blue', exact: true }).click();
    await page.mouse.move(0, 0);
    await page
      .getByRole('group', { name: 'Choose your marble second color' })
      .screenshot({ path: `test-results/visual/creative-picker-${name}.png` });
    await page.screenshot({
      path: `test-results/visual/creative-picker-${name}-context.png`,
      fullPage: true,
    });
    await page.keyboard.press('Escape');
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1))
      throw new Error(`Overflow: ${name}`);
  }
  console.log(JSON.stringify({ errors }));
} finally {
  await browser.close();
}
