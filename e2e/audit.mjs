import { skipPreparation } from './helpers.ts';
import { chromium } from 'playwright';
import { iconLayers } from '../src/art/icons.ts';
import { mkdir } from 'node:fs/promises';
await mkdir('test-results/visual', { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1000, height: 760 } });
const names = [
  'Heart',
  'Star',
  'Daisy',
  'Butterfly',
  'Moon',
  'Sun',
  'Rainbow',
  'Cherries',
  'Strawberry',
  'Bow',
  'Paw print',
  'Smiley',
  'Lightning',
  'Cloud',
  'Leaf',
  'Mushroom',
  'Snowflake',
  'Music note',
  'Diamond',
  'Planet',
  'Crown',
  'Seashell',
  'Clover',
  'Flame',
  'Kiss',
  'Kitty',
  'Cactus',
  'Bumblebee',
  'Balloon',
  'Tulip',
];
await page.setContent(
  `<body style="margin:0;background:#fce1f2;font-family:Arial;color:#663962"><h1 style="margin:24px">Nail Salon · sticker sheet</h1><div style="display:grid;grid-template-columns:repeat(6,1fr);gap:12px;padding:0 24px 24px">${names
    .map(
      (name, i) =>
        `<div style="background:#fff9;border-radius:16px;text-align:center;padding:12px"><svg width="80" height="80" viewBox="0 0 64 64">${iconLayers(
          `sticker-${i}`,
        )
          .map(
            (l) =>
              `<path d="${l.path}" fill="${l.fill}" stroke="${l.stroke ?? 'none'}" stroke-width="${l.strokeWidth ?? 3}" stroke-linejoin="round" stroke-linecap="round"/>`,
          )
          .join('')}</svg><div>${name}</div></div>`,
    )
    .join('')}</div></body>`,
);
await page.screenshot({ path: 'test-results/visual/sticker-sheet.png', fullPage: true });
await page.goto('http://127.0.0.1:4173');
await page.getByRole('button', { name: 'Let’s create!' }).click();
await skipPreparation(page);
await page.getByRole('button', { name: 'Color all five', exact: true }).click();
await page.getByRole('button', { name: 'Stickers', exact: true }).click();
await page.getByRole('button', { name: 'Butterfly', exact: true }).click();
await page.getByRole('button', { name: 'Place in the middle', exact: true }).click();
await page.getByRole('button', { name: 'Make decoration bigger', exact: true }).click();
await page.getByRole('button', { name: 'Rotate', exact: false }).click();
for (const [name, width, height] of [
  ['stickers-desktop', 1440, 1000],
  ['stickers-ipad', 768, 1024],
  ['stickers-phone', 390, 844],
]) {
  await page.setViewportSize({ width, height });
  await page.screenshot({ path: `test-results/visual/${name}.png`, fullPage: true });
}
await browser.close();
