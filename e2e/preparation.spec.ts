import { test, expect, type Page } from '@playwright/test';

async function start(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Skip tutorial', exact: true }).click();
  await page.getByRole('button', { name: /1. Prepare/ }).click();
}
async function stored(page: Page) {
  return page.evaluate(async (path) => {
    const { openDatabase, loadSave } = await import(path);
    const db = await openDatabase();
    const result = await loadSave(db);
    db.close();
    return result.status === 'loaded' ? result.save.active.nails[0] : null;
  }, '/src/storage/database.ts');
}

test('local wiping survives interruption, undo, reload and rotation', async ({ page }) => {
  await start(page);
  const canvas = page.getByLabel('Paint nail 1', { exact: true });
  let box = (await canvas.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.3);
  await page.mouse.down();
  await expect(page.locator('.cleaning-sponge')).toBeVisible();
  // A second pointer cannot steal the sponge or wash another area.
  await canvas.dispatchEvent('pointermove', {
    pointerId: 99,
    pointerType: 'touch',
    isPrimary: false,
    clientX: box.x + box.width * 0.7,
    clientY: box.y + box.height * 0.7,
  });
  await canvas.dispatchEvent('pointercancel', {
    pointerId: 1,
    pointerType: 'mouse',
    isPrimary: true,
  });
  await page.mouse.up();
  await expect(page.locator('.cleaning-sponge')).not.toBeVisible();
  await expect.poll(async () => (await stored(page))?.washed).toBeGreaterThan(0);
  const partial = (await stored(page))!;
  expect(partial.cleaned).toBe(false);
  expect(partial.washed! & (1 << 8)).toBe(0);
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect.poll(async () => (await stored(page))?.washed).toBeUndefined();
  await page.getByRole('button', { name: 'Redo', exact: true }).click();
  await expect.poll(async () => (await stored(page))?.washed).toBe(partial.washed);
  await page.reload();
  await page.getByRole('button', { name: /1. Prepare/ }).click();
  for (const [width, height] of [
    [744, 1133],
    [1133, 744],
  ]) {
    await page.setViewportSize({ width, height });
    await expect.poll(async () => (await stored(page))?.washed).toBe(partial.washed);
  }
  // Visit all remaining spots with actual mouse input on the resized surface.
  box = (await canvas.boundingBox())!;
  for (const [x, y] of [
    [0.3, 0.3],
    [0.5, 0.27],
    [0.7, 0.32],
    [0.27, 0.49],
    [0.5, 0.5],
    [0.73, 0.48],
    [0.32, 0.69],
    [0.5, 0.73],
    [0.68, 0.68],
  ]) {
    await page.mouse.click(box.x + box.width * x, box.y + box.height * y);
  }
  await expect.poll(async () => (await stored(page))?.cleaned).toBe(true);
  await expect(page.getByText('Sparkly clean! Choose a length & shape.')).toBeVisible();
  await expect(page.locator('.clean-sparkles')).toBeVisible();
  expect((await stored(page))?.strokes).toHaveLength(0);
});

test('tap cleaning, shape choices, skipping and gentle replay preserve polish', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await start(page);
  await page.getByRole('button', { name: 'Clean this nail', exact: true }).click();
  await expect(page.locator('.clean-sparkles')).toHaveCSS('animation-name', 'none');
  await page.getByRole('button', { name: 'Long nails' }).click();
  await page.getByRole('button', { name: 'Square', exact: true }).click();
  await page.getByRole('button', { name: 'Start painting →' }).click();
  await page.getByRole('button', { name: 'Fill this nail' }).click();
  await expect.poll(async () => (await stored(page))?.fillColorId).toBe('color-0');
  await page.getByRole('button', { name: /1. Prepare/ }).click();
  await page.getByRole('button', { name: 'Clean again' }).click();
  expect((await stored(page))?.fillColorId).toBe('color-0');
  await page.getByRole('button', { name: 'Select nail 2', exact: true }).click();
  await expect(page.getByText('0 of 9 spots washed')).toBeVisible();
  await page.getByRole('button', { name: 'Start painting →' }).click();
  await page.getByRole('button', { name: 'Color all five' }).click();
  await expect
    .poll(async () => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    .toBe(true);
  await page.getByRole('button', { name: /All done!/ }).click();
  await expect(page.getByRole('heading', { name: 'Look what you made!' })).toBeVisible();
});
