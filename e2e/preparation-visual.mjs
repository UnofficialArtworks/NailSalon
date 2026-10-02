import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
await mkdir('test-results/preparation-visual', { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 744, height: 1133 },
  deviceScaleFactor: 1,
});
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto('http://127.0.0.1:4173');
await page.getByRole('button', { name: 'Skip tutorial', exact: true }).click();
await page.getByRole('button', { name: /1. Prepare/ }).click();
const canvas = page.getByLabel('Paint nail 1', { exact: true });
let box = await canvas.boundingBox();
await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.3);
await page.mouse.down();
await page.screenshot({ path: 'test-results/preparation-visual/ipad-wiping.png', fullPage: true });
await page.mouse.up();
await page.setViewportSize({ width: 390, height: 844 });
await page.screenshot({ path: 'test-results/preparation-visual/phone.png', fullPage: true });
await page.getByRole('button', { name: 'Clean this nail', exact: true }).click();
await page.screenshot({ path: 'test-results/preparation-visual/clean.png', fullPage: true });
await page.getByRole('button', { name: 'Start painting →' }).click();
await page.getByRole('button', { name: /Back to hand/ }).click();
await page.getByRole('button', { name: 'Customers', exact: false }).click();
await page.getByRole('button', { name: 'Start without saving', exact: true }).click();
await page.getByRole('button', { name: 'Start painting →' }).click();
await page.getByRole('button', { name: /Back to hand/ }).click();
await page.setViewportSize({ width: 1440, height: 1000 });
await page.screenshot({
  path: 'test-results/preparation-visual/hand-and-customer.png',
  fullPage: true,
});
console.log(JSON.stringify({ errors }));
await browser.close();
