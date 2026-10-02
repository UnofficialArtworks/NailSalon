import { chromium } from '@playwright/test';
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:4173');
  await page.getByRole('button', { name: 'Skip tutorial', exact: true }).click();
  await page.getByRole('button', { name: 'Start painting →', exact: true }).click();
  await page.getByRole('button', { name: 'Color all five', exact: true }).click();
  await page.getByRole('button', { name: 'All done!' }).click();
  await page.getByRole('button', { name: 'Ocean dreams', exact: true }).click();
  await page.getByRole('button', { name: 'Bracelets', exact: true }).click();
  await page.getByRole('button', { name: 'Pearls', exact: true }).click();
  await page.getByRole('button', { name: 'Rings', exact: true }).click();
  await page.getByRole('button', { name: 'Flower ring', exact: true }).click();
  for (const [name, width, height] of [
    ['ipad', 744, 1133],
    ['phone', 390, 844],
    ['desktop', 1440, 1000],
  ]) {
    await page.setViewportSize({ width, height });
    await page.waitForTimeout(800);
    await page.screenshot({ path: `test-results/photo-${name}.png` });
  }
  await page.getByRole('button', { name: 'Save to gallery', exact: true }).click();
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await page.getByRole('button', { name: 'My gallery' }).click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'test-results/scrapbook.png' });
} finally {
  await browser.close();
}
