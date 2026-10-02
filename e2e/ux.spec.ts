import { skipPreparation } from './helpers';
import { test, expect, type Page } from '@playwright/test';

async function start(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Skip tutorial', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Clean', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByRole('heading', { name: '3. Pick a nail shape' })).toBeVisible();
  await skipPreparation(page);
}
async function active(page: Page) {
  return page.evaluate(async (modulePath) => {
    const { openDatabase, loadSave } = await import(modulePath);
    const db = await openDatabase();
    const result = await loadSave(db);
    db.close();
    return result.status === 'loaded' ? result.save : null;
  }, '/src/storage/database.ts');
}

test('manicure shapes are visible in Clean and never change the finger silhouette', async ({
  page,
}) => {
  await start(page);
  await page.getByRole('button', { name: 'Clean', exact: true }).click();
  await expect(page.getByRole('heading', { name: '3. Pick a nail shape' })).toBeVisible();
  const finger = page.locator('.finger-skin path').first();
  const outline = await finger.getAttribute('d');
  for (const name of ['Round', 'Oval', 'Square', 'Soft square', 'Almond']) {
    await page.getByRole('button', { name, exact: true }).click();
    await expect(finger).toHaveAttribute('d', outline!);
    await expect(page.getByRole('button', { name, exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  }
  await page.getByRole('button', { name: 'Start painting →' }).click();
  await expect(page.getByRole('button', { name: 'Fill this nail' })).toBeVisible();
});

test('saved art starts another manicure without duplicate saving, including after reload', async ({
  page,
}) => {
  await start(page);
  await page.getByRole('button', { name: 'Color all five' }).click();
  await page.getByRole('button', { name: 'All done!' }).click();
  await page.getByRole('button', { name: 'Save to gallery', exact: true }).click();
  await expect.poll(async () => (await active(page))?.gallery.length).toBe(1);
  await page.reload();
  await page.getByRole('button', { name: 'All done!' }).click();
  await expect(page.getByRole('button', { name: 'Saved ✓' })).toBeDisabled();
  await page.getByRole('button', { name: 'Make another →' }).click();
  await expect(page.getByRole('dialog', { name: 'Ready for something new?' })).toHaveCount(0);
  await expect.poll(async () => (await active(page))?.gallery.length).toBe(1);
  await expect.poll(async () => (await active(page))?.active.nails[0].fillColorId).toBe(null);
});

test('editing a saved design brings the save prompt back', async ({ page }) => {
  await start(page);
  await page.getByRole('button', { name: 'Color all five' }).click();
  await page.getByRole('button', { name: 'All done!' }).click();
  await page.getByRole('button', { name: 'Save to gallery', exact: true }).click();
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await page.getByRole('button', { name: 'Clear nail', exact: true }).click();
  await page.getByRole('button', { name: 'New manicure' }).click();
  await expect(page.getByRole('dialog', { name: 'Ready for something new?' })).toBeVisible();
});

test('pattern selection waits for Apply and the eraser has no paint actions', async ({ page }) => {
  await start(page);
  await page.getByRole('button', { name: 'Patterns', exact: true }).click();
  await page.locator('.decoration-grid button').nth(1).click();
  await expect(page.getByRole('button', { name: 'Undo', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Apply pattern' }).click();
  await expect(page.getByRole('button', { name: 'Undo', exact: true })).toBeEnabled();
  await expect.poll(async () => (await active(page))?.active.nails[0].patternId).toBe('pattern-1');
  await page.getByRole('button', { name: 'Eraser', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Fill this nail' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Color all five' })).toHaveCount(0);
});

test('a decoration can be nudged, recentered, and undone without dragging', async ({ page }) => {
  await start(page);
  await page.getByRole('button', { name: 'Stickers', exact: true }).click();
  await page.getByRole('button', { name: 'Place in the middle' }).click();
  await page.getByRole('button', { name: 'Move decoration right' }).click();
  await expect
    .poll(async () => (await active(page))?.active.nails[0].decorations[0].x)
    .toBeCloseTo(0.54);
  await page.getByRole('button', { name: 'Center item' }).click();
  await expect.poll(async () => (await active(page))?.active.nails[0].decorations[0].x).toBe(0.5);
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect
    .poll(async () => (await active(page))?.active.nails[0].decorations[0].x)
    .toBeCloseTo(0.54);
});

test('phone palettes have large arrows that reveal more colors', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await start(page);
  const strip = page.locator('.color-grid');
  const before = await strip.evaluate((el) => el.scrollLeft);
  await page.getByRole('button', { name: 'More polishes' }).click();
  await expect
    .poll(async () => strip.evaluate((el) => el.scrollLeft))
    .toBeGreaterThan(before + 100);
  await expect(page.getByRole('button', { name: 'Previous polishes' })).toBeEnabled();
  const box = await page.getByRole('button', { name: 'More polishes' }).boundingBox();
  expect(box!.width).toBeGreaterThanOrEqual(48);
  expect(box!.height).toBeGreaterThanOrEqual(48);
});

test('brush cursor is circular and follows the brush size', async ({ page }) => {
  await start(page);
  await page.getByRole('button', { name: 'Edit nail 1', exact: true }).click();
  const canvas = page.getByLabel('Paint nail 1', { exact: true });
  await canvas.hover();
  const cursor = page.locator('.brush-cursor');
  await expect(cursor).toBeVisible();
  const small = (await cursor.boundingBox())!;
  expect(small.width).toBeCloseTo(small.height, 1);
  await page.getByRole('slider', { name: 'Brush size' }).press('End');
  await canvas.hover();
  const big = (await cursor.boundingBox())!;
  expect(big.width).toBeGreaterThan(small.width * 2);
  expect(big.width).toBeCloseTo(big.height, 1);
  const area = (await canvas.boundingBox())!;
  expect(big.width).toBeCloseTo(area.width * 0.25, 0);
  await expect(canvas).toHaveCSS('cursor', 'none');
});

test('guided play teaches manicure, painting, decorating, finishing, and saving', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Let’s create!' }).click();
  const coach = page.getByRole('region', { name: 'Play tutorial' });
  await expect(coach).toContainText('Tap a nail');
  await page.getByRole('button', { name: 'Open a nail' }).click();
  await page.getByRole('button', { name: 'Manicure tools' }).click();
  await page.getByRole('button', { name: 'Clean this nail' }).click();
  await page.getByRole('button', { name: 'Square', exact: true }).click();
  await page.getByRole('button', { name: 'Start painting →' }).click();
  await expect(coach).toContainText('Add color');
  await page.getByRole('button', { name: 'Fill this nail' }).click();
  await expect(coach).toContainText('Add sparkle');
  await page.getByRole('button', { name: 'Show stickers' }).click();
  await page.getByRole('button', { name: 'Place in the middle' }).click();
  await page.getByRole('button', { name: 'Finish design' }).click();
  await expect(page.getByRole('dialog', { name: 'Look what you made!' })).toBeVisible();
  await page.getByRole('button', { name: 'Save to gallery', exact: true }).click();
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(coach).toHaveCount(0);
  await page.getByRole('button', { name: 'How to play' }).click();
  await page.getByRole('button', { name: 'Let’s create!' }).click();
  await expect(coach).toBeVisible();
  await page.getByRole('button', { name: 'Skip tutorial' }).click();
  await expect(coach).toHaveCount(0);
});
