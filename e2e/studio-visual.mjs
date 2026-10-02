import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
await mkdir('test-results/visual', { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 768, height: 1024 } });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.goto('http://127.0.0.1:4173');
await page.getByRole('button', { name: 'Skip tutorial', exact: true }).click();
await page.getByRole('button', { name: /1. Prepare/ }).click();
await page.getByRole('button', { name: 'Long nails' }).click();
await page.getByRole('button', { name: 'Almond', exact: true }).click();
await page.screenshot({ path: 'test-results/visual/studio-prep-ipad.png', fullPage: true });
await page.getByRole('button', { name: /2. Paint/ }).click();
await page.getByRole('button', { name: 'Ocean Sparkle', exact: true }).click();
await page.getByRole('button', { name: 'Sky blue', exact: true }).click();
await page.getByRole('button', { name: 'Fill this nail' }).click();
for (const finish of ['Glossy', 'Glitter', 'Pearlescent']) {
  await page.getByRole('button', { name: finish, exact: true }).click();
  await page.locator('.studio-stages').scrollIntoViewIfNeeded();
  await page.screenshot({ path: `test-results/visual/studio-${finish.toLowerCase()}-ipad.png`, fullPage: true });
}
await page.getByRole('button', { name: 'Glitter', exact: true }).click();
await page.getByRole('button', { name: 'Stickers', exact: true }).click();
await page.getByRole('button', { name: 'Star', exact: true }).click();
await page.getByRole('button', { name: 'Place in the middle' }).click();
await page.getByRole('button', { name: 'Copy this nail', exact: true }).click();
await page.getByRole('button', { name: 'Choose all other nails' }).click();
await page.screenshot({ path: 'test-results/visual/studio-copy.png', fullPage: true });
await page.getByRole('button', { name: 'Copy to chosen nails' }).click();
await page.getByRole('button', { name: /Back to hand/ }).click();
await page.screenshot({ path: 'test-results/visual/studio-hand-ipad.png', fullPage: true });
await page.getByRole('button', { name: /2. Paint/ }).click();
for (const [name, width, height] of [['phone', 390, 844], ['landscape', 1133, 744], ['desktop', 1440, 1000]]) {
  await page.setViewportSize({ width, height });
  await page.locator('.studio-stages').scrollIntoViewIfNeeded();
  await page.screenshot({ path: `test-results/visual/studio-${name}.png`, fullPage: true });
}
console.log(JSON.stringify({ errors }));
await browser.close();
