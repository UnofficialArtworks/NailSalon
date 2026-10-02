import { test, expect, type Page } from '@playwright/test';

async function start(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Skip tutorial', exact: true }).click();
}
test('customer occasions and individual star celebrations keep requests forgiving', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await start(page);
  await page.getByRole('button', { name: 'Customers', exact: false }).click();
  await expect(page.locator('.occasion-banner')).toContainText('Rainbow party');
  await expect(page.locator('.occasion-banner')).toContainText('I’m going to a rainbow party!');
  await expect(page.locator('.customer-wave')).toBeVisible();
  await page.getByRole('button', { name: 'Start painting →' }).click();
  await page.locator('.wish-list button').first().click();
  await page.getByRole('button', { name: 'Color all five' }).click();
  await page.locator('.wish-list button').last().click();
  await page.getByRole('button', { name: 'Place in the middle' }).click();
  await page.getByRole('button', { name: /All done!/ }).click();
  const celebration = page.getByLabel('Customer celebration');
  await expect(celebration).toContainText('These will sparkle at my party!');
  await expect(celebration.locator('.earned-star')).toHaveCount(3);
  expect(
    await celebration
      .locator('.earned-star')
      .evaluateAll((elements) => elements.map((e) => getComputedStyle(e).animationDelay)),
  ).toEqual(['0s', '0.45s', '0.9s']);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(celebration.locator('.earned-star').first()).toHaveCSS('animation-name', 'none');
  await page.getByRole('button', { name: /Next customer/ }).click();
  await page.getByRole('button', { name: 'Save & start new' }).click();
  await expect(page.locator('.occasion-banner')).toContainText('Beach day');
  await expect(page.locator('.star-total')).toContainText('3');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('new finishes and original rainbow stickers survive gallery, reload and export', async ({
  page,
}) => {
  await start(page);
  await page.getByRole('button', { name: 'Start painting →' }).click();
  await page.getByRole('button', { name: 'Rainbow Dreams', exact: true }).click();
  await page.getByRole('button', { name: 'Matte', exact: true }).click();
  await page.getByRole('button', { name: 'Fill this nail' }).click();
  await page.getByRole('button', { name: 'Select nail 2', exact: true }).click();
  await page.getByRole('button', { name: 'Metallic', exact: true }).click();
  await page.getByRole('button', { name: 'Fill this nail' }).click();
  await page.getByRole('button', { name: 'Stickers', exact: true }).click();
  for (const sticker of [
    'Shooting star',
    'Magic wand',
    'Rainbow heart',
    'Cupcake',
    'Sandcastle',
    'Rocket',
  ]) {
    await page.getByRole('button', { name: sticker, exact: true }).click();
    await page.getByRole('button', { name: 'Place in the middle' }).click();
  }
  await page.getByRole('button', { name: /All done!/ }).click();
  await page.getByRole('button', { name: 'Save to gallery', exact: true }).click();
  await page.getByRole('button', { name: 'Save picture', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Your picture is ready' })).toBeVisible();
  await page.reload();
  const saved = await page.evaluate(async (path) => {
    const { openDatabase, loadSave } = await import(path);
    const db = await openDatabase();
    const result = await loadSave(db);
    db.close();
    return result.status === 'loaded' ? result.save : null;
  }, '/src/storage/database.ts');
  expect(saved.active.nails[0].finish).toBe('matte');
  expect(saved.active.nails[1].finish).toBe('metallic');
  expect(
    saved.gallery[0].manicure.nails[1].decorations.map((d: { supplyId: string }) => d.supplyId),
  ).toEqual(['sticker-30', 'sticker-31', 'sticker-32', 'sticker-33', 'sticker-34', 'sticker-35']);
});

test('post-unlock creative ideas are optional and suggest supplies without changing artwork', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await start(page);
  await expect(page.getByRole('button', { name: 'Creative idea' })).toBeVisible();
  await page.evaluate(
    async ([rulesPath, dbPath]) => {
      const { createSave } = await import(rulesPath);
      const { openDatabase, writeSave } = await import(dbPath);
      const save = createSave();
      save.stars = 36;
      save.settings.tutorialSeen = true;
      const db = await openDatabase();
      await writeSave(db, save);
      db.close();
    },
    ['/src/game/rules.ts', '/src/storage/database.ts'],
  );
  await page.reload();
  await page.getByRole('button', { name: 'Creative idea' }).click();
  await expect(page.getByText('A rainbow on every finger', { exact: true })).toBeVisible();
  await page.setViewportSize({ width: 1133, height: 744 });
  await expect(page.getByText('A rainbow on every finger', { exact: true })).toBeVisible();
  // Sidebar controls must never cover the supply tray, including on tablets.
  const sidebar = (await page.locator('.salon-sidebar').boundingBox())!;
  const tray = (await page.locator('.supplies-area').boundingBox())!;
  expect(sidebar.y + sidebar.height).toBeLessThanOrEqual(tray.y + 2);
  await page.getByRole('button', { name: 'Try Cherry pop', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Cherry pop', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  for (const title of [
    'Tiny seaside treasures',
    'A flower fairy manicure',
    'Rocket to the stars',
  ]) {
    await page.getByRole('button', { name: 'Another idea' }).click();
    await expect(page.getByText(title, { exact: true })).toBeVisible();
  }
  await page.getByRole('button', { name: 'Try the suggested sticker' }).click();
  await expect(page.getByRole('button', { name: 'Rocket', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'Just play' }).click();
  await expect(page.getByLabel('Optional creative idea')).toHaveCount(0);
  const nails = await page.evaluate(async (path) => {
    const { openDatabase, loadSave } = await import(path);
    const db = await openDatabase();
    const result = await loadSave(db);
    db.close();
    return result.status === 'loaded' ? result.save.active.nails : [];
  }, '/src/storage/database.ts');
  expect(
    nails.every(
      (n: { fillColorId: string | null; decorations: unknown[]; strokes: unknown[] }) =>
        !n.fillColorId && !n.decorations.length && !n.strokes.length,
    ),
  ).toBe(true);
});
