import { test, expect } from '@playwright/test';
import type { Nail, Finish } from '../src/game/types';

async function start(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Skip tutorial', exact: true }).click();
}
async function saved(page: import('@playwright/test').Page) {
  return page.evaluate(async (path) => {
    const dbm = await import(path);
    const db = await dbm.openDatabase();
    const result = await dbm.loadSave(db);
    db.close();
    return result.status === 'loaded' ? result.save : null;
  }, '/src/storage/database.ts');
}

test('lengths keep the finger fixed and survive resize, undo and reload', async ({ page }) => {
  await start(page);
  await page.getByRole('button', { name: /1. Prepare/ }).click();
  const finger = await page.locator('.finger-skin path').first().getAttribute('d');
  const nail = page.locator('.finger-nail');
  const short = (await nail.boundingBox())!;
  const shortOrigin = (await page.locator('.big-nail').boundingBox())!.y;
  await page.getByRole('button', { name: 'Long nails', exact: true }).click();
  const long = (await nail.boundingBox())!;
  const longOrigin = (await page.locator('.big-nail').boundingBox())!.y;
  expect(long.height / short.height).toBeCloseTo(1.36, 1);
  expect(long.y - longOrigin).toBeLessThan(short.y - shortOrigin);
  expect(long.y - longOrigin + long.height).toBeCloseTo(short.y - shortOrigin + short.height, 0);
  await expect(page.locator('.finger-skin path').first()).toHaveAttribute('d', finger!);
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Short nails' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'Redo', exact: true }).click();
  await expect.poll(async () => (await saved(page))?.active.nails[0].length).toBe('long');
  await page.reload();
  await page.getByRole('button', { name: /1. Prepare/ }).click();
  await expect(page.getByRole('button', { name: 'Long nails' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(nail).toBeVisible();
  const top = (await nail.boundingBox())!.y;
  expect(top).toBeGreaterThanOrEqual((await page.locator('.desk-scene').boundingBox())!.y);
});

test('finishes, pattern ink, copies and layers persist into the gallery and PNG', async ({
  page,
}) => {
  // This exercises painting, copying, export, reload and gallery editing in one session.
  test.setTimeout(60000);
  await start(page);
  await page.getByRole('button', { name: 'Medium nails' }).click();
  await page.getByRole('button', { name: /2. Paint/ }).click();
  await page.getByRole('button', { name: 'Glitter', exact: true }).click();
  await page.getByRole('button', { name: 'Fill this nail' }).click();
  await page.getByRole('button', { name: 'Patterns', exact: true }).click();
  await page.getByRole('button', { name: 'Pattern color: Cherry pop', exact: true }).click();
  await page.getByRole('button', { name: 'Apply pattern' }).click();
  await page.getByRole('button', { name: 'Stickers', exact: true }).click();
  await page.getByRole('button', { name: 'Place in the middle' }).click();
  await page.getByRole('button', { name: 'Duplicate item' }).click();
  await page.getByRole('button', { name: 'Send to back' }).click();
  await page.getByRole('button', { name: 'Copy this nail', exact: true }).click();
  await page.getByRole('button', { name: 'Choose all other nails' }).click();
  await page.getByRole('button', { name: 'Copy to chosen nails' }).click();
  await expect
    .poll(
      async () =>
        (await saved(page))?.active.nails.filter((n: { finish: string }) => n.finish === 'glitter')
          .length,
    )
    .toBe(5);
  const data = await saved(page);
  expect(
    new Set(
      data.active.nails.flatMap((n: { decorations: { id: string }[] }) =>
        n.decorations.map((d) => d.id),
      ),
    ).size,
  ).toBe(10);
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect.poll(async () => (await saved(page))?.active.nails[1].finish).toBeUndefined();
  await page.getByRole('button', { name: 'Redo', exact: true }).click();
  await page.getByRole('button', { name: /4. Reveal/ }).click();
  await page.getByRole('button', { name: 'Save to gallery', exact: true }).click();
  await page.getByRole('button', { name: 'Save picture', exact: true }).click();
  await expect(page.getByRole('img', { name: 'Your finished manicure' })).toBeVisible();
  const download = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Download picture' }).click();
  expect((await download).suggestedFilename()).toBe('my-nail-salon-art.png');
  await page.reload();
  await expect
    .poll(async () => (await saved(page))?.gallery[0].manicure.nails[0].length)
    .toBe('medium');
  await page.getByRole('button', { name: 'My gallery' }).click();
  await page.getByRole('button', { name: 'Edit a copy' }).click();
  await expect.poll(async () => (await saved(page))?.active.nails[0].finish).toBe('glitter');
});

test('collection filters retain an All supplies view and respect locked supplies', async ({
  page,
}) => {
  await start(page);
  await page.getByRole('button', { name: /2. Paint/ }).click();
  const all = await page.locator('.color-grid button').count();
  await page.getByRole('button', { name: 'Ocean Sparkle', exact: true }).click();
  expect(await page.locator('.color-grid button').count()).toBeLessThan(all);
  await expect(page.getByRole('button', { name: 'Sky blue', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Ocean · locked', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Serve customers');
  await page.getByRole('button', { name: 'All supplies', exact: true }).click();
  expect(await page.locator('.color-grid button').count()).toBe(all);
});

test('material rendering is deterministic and leaves bare and erased areas natural', async ({
  page,
}) => {
  await page.goto('/');
  const result = await page.evaluate(async (path) => {
    const { renderNail } = await import(path);
    const canvas = document.createElement('canvas');
    canvas.width = 240;
    canvas.height = 380;
    const ctx = canvas.getContext('2d')!;
    const nail: Nail = {
      shape: 'round',
      cleaned: true,
      baseColorId: null,
      fillColorId: null,
      patternId: null,
      strokes: [],
      decorations: [],
    };
    const render = (value: Nail) => {
      renderNail(ctx, value, 240, 380);
      return Array.from(ctx.getImageData(0, 0, 240, 380).data);
    };
    const baseline = render(nail);
    const variants = (['glitter', 'pearl', 'matte', 'metallic'] as Finish[]).map((finish) => {
      const dot = { points: [{ x: 0.5, y: 0.5 }], width: 0.15, colorId: 'color-0', erase: false };
      const art = { ...nail, finish, strokes: [dot] };
      const first = render(art);
      const second = render(art);
      const erased = render({ ...art, strokes: [dot, { ...dot, erase: true }] });
      const filled = render({
        ...art,
        strokes: [],
        fillColorId: 'color-0',
      });
      const sample = (pixels: number[], x: number, y: number) =>
        pixels.slice((y * 240 + x) * 4, (y * 240 + x) * 4 + 4);
      return {
        same: first.every((v, i) => v === second[i]),
        bare: sample(first, 120, 280),
        expectedBare: sample(baseline, 120, 280),
        erased: sample(erased, 120, 190),
        expectedErased: sample(baseline, 120, 190),
        painted: sample(first, 120, 190),
        filled: sample(filled, 120, 190),
      };
    });
    return variants;
  }, '/src/art/render.ts');
  for (const variant of result) {
    expect(variant.same).toBe(true);
    expect(variant.bare).toEqual(variant.expectedBare);
    expect(variant.erased).toEqual(variant.expectedErased);
    expect(variant.painted).not.toEqual(variant.expectedErased);
    expect(variant.painted).toEqual(variant.filled);
  }
});
