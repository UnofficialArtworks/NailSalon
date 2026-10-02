import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
await mkdir('test-results/occasions-visual', { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 744, height: 1133 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto('http://127.0.0.1:4173');
await page.getByRole('button', { name: 'Skip tutorial', exact: true }).click();
await page.getByRole('button', { name: /Customers/ }).click();
await page.getByRole('button', { name: 'Start painting →' }).click();
await page.getByRole('button', { name: /Back to hand/ }).click();
await page.screenshot({ path: 'test-results/occasions-visual/ipad-customer.png', fullPage: true });
await page.setViewportSize({ width: 390, height: 844 });
await page.screenshot({ path: 'test-results/occasions-visual/phone-customer.png', fullPage: true });
await page.locator('.wish-list button').first().click();
await page.getByRole('button', { name: 'Color all five' }).click();
await page.locator('.wish-list button').last().click();
await page.getByRole('button', { name: 'Place in the middle' }).click();
await page.getByRole('button', { name: /All done!/ }).click();
await page.emulateMedia({ reducedMotion: 'reduce' });
await page.screenshot({
  path: 'test-results/occasions-visual/phone-celebration.png',
  fullPage: true,
});
await page.evaluate(
  async ([rules, database]) => {
    const { createSave } = await import(rules);
    const { openDatabase, writeSave } = await import(database);
    const save = createSave();
    save.stars = 36;
    save.settings.tutorialSeen = true;
    save.active.nails.forEach((n, i) => {
      n.cleaned = true;
      n.fillColorId = n.baseColorId = ['color-8', 'color-6', 'color-5', 'color-4', 'color-3'][i];
      n.finish = ['glossy', 'matte', 'metallic', 'pearl', 'glitter'][i];
      n.length = 'medium';
      n.decorations = [
        {
          id: `visual-${i}`,
          kind: 'sticker',
          supplyId: `sticker-${[32, 35, 34, 31, 33][i]}`,
          x: 0.5,
          y: 0.5,
          size: 0.65,
          rotation: 0,
        },
      ];
    });
    const db = await openDatabase();
    await writeSave(db, save);
    db.close();
  },
  ['/src/game/rules.ts', '/src/storage/database.ts'],
);
await page.reload();
await page.setViewportSize({ width: 1440, height: 1000 });
await page.getByRole('button', { name: /2. Paint/ }).click();
await page.getByRole('button', { name: /Back to hand/ }).click();
await page.getByRole('button', { name: 'Rainbow Dreams', exact: true }).click();
await page.getByRole('button', { name: 'Creative idea' }).click();
await page.screenshot({ path: 'test-results/occasions-visual/desktop-ideas.png', fullPage: true });
await page.getByRole('button', { name: /All done!/ }).click();
await page.screenshot({
  path: 'test-results/occasions-visual/new-sticker-manicure.png',
  fullPage: true,
});
const sheet = await page.evaluate(async (path) => {
  const { iconLayers } = await import(path);
  return ['Shooting star', 'Magic wand', 'Rainbow heart', 'Cupcake', 'Sandcastle', 'Rocket']
    .map(
      (name, i) =>
        `<div><svg viewBox="0 0 64 64">${iconLayers(`sticker-${30 + i}`)
          .map(
            (l) =>
              `<path d="${l.path}" fill="${l.fill}" stroke="${l.stroke ?? 'none'}" stroke-width="${l.strokeWidth ?? 0}" stroke-linecap="round" stroke-linejoin="round"/>`,
          )
          .join('')}</svg><p>${name}</p></div>`,
    )
    .join('');
}, '/src/art/icons.ts');
await page.setContent(
  `<style>body{background:#ffedf6;display:grid;grid-template-columns:repeat(3,1fr);gap:20px;padding:30px;font:20px sans-serif;text-align:center;color:#654067}svg{width:150px;height:150px}div{background:white;border-radius:24px;padding:25px}</style>${sheet}`,
);
await page.setViewportSize({ width: 850, height: 560 });
await page.screenshot({ path: 'test-results/occasions-visual/sticker-sheet.png', fullPage: true });
console.log(JSON.stringify({ errors }));
await browser.close();
