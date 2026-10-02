import { test, expect, type Page } from '@playwright/test';

async function start(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Skip tutorial', exact: true }).click();
  await page.getByRole('button', { name: /2. Paint/ }).click();
}
async function saved(page: Page) {
  return page.evaluate(async (path) => {
    const { openDatabase, loadSave } = await import(path);
    const db = await openDatabase();
    const result = await loadSave(db);
    db.close();
    return result.status === 'loaded' ? result.save : null;
  }, '/src/storage/database.ts');
}

test('brush-through stencils lift, undo and resume; tap filling works too', async ({ page }) => {
  await start(page);
  await page.getByRole('button', { name: 'Stencils', exact: true }).click();
  const canvas = page.getByRole('img', { name: 'Paint nail 1' });
  await canvas.scrollIntoViewIfNeeded();
  const box = (await canvas.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.5);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.5, { steps: 8 });
  await page.mouse.up();
  await expect
    .poll(async () => (await saved(page))?.active.nails[0].strokes[0]?.stencilId)
    .toBe('heart');
  await page.getByRole('button', { name: 'Lift stencil' }).click();
  await expect(page.locator('.stencil-guide')).toHaveCount(0);
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect.poll(async () => (await saved(page))?.active.nails[0].strokes.length).toBe(0);
  await page.getByRole('button', { name: 'Redo', exact: true }).click();
  await expect
    .poll(async () => (await saved(page))?.active.nails[0].strokes[0]?.stencilId)
    .toBe('heart');
  await page.reload();
  await expect
    .poll(async () => (await saved(page))?.active.nails[0].strokes[0]?.stencilId)
    .toBe('heart');
  await page.getByRole('button', { name: /2. Paint/ }).click();
  await page.getByRole('button', { name: 'Stencils', exact: true }).click();
  await page.getByRole('button', { name: 'Star stencil' }).click();
  await page.getByRole('button', { name: 'Fill stencil', exact: true }).click();
  await expect
    .poll(async () => (await saved(page))?.active.nails[0].strokes.at(-1)?.stencilId)
    .toBe('star');
  await page.getByRole('button', { name: 'Gems', exact: true }).click();
  await page.getByRole('button', { name: 'Polish', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Stencils', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByRole('button', { name: 'Star stencil' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

test('marble bowl swirls, dips and persists through gallery and PNG', async ({ page }) => {
  test.setTimeout(60000);
  await start(page);
  await page.getByRole('button', { name: 'Marble dip', exact: true }).click();
  await page.getByLabel('Marble second color').selectOption('color-6');
  await page.getByRole('button', { name: 'Swirl colors' }).click();
  await page.getByRole('button', { name: 'Dip this nail' }).click();
  await expect
    .poll(async () => (await saved(page))?.active.nails[0].marble)
    .toEqual({ colorId: 'color-6', variant: 1 });
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect.poll(async () => (await saved(page))?.active.nails[0].marble).toBeUndefined();
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
    .poll(async () => (await saved(page))?.gallery[0].manicure.nails[0].marble)
    .toEqual({ colorId: 'color-6', variant: 1 });
  await page.getByRole('button', { name: /2. Paint/ }).click();
  await page.getByRole('button', { name: 'Clear nail', exact: true }).click();
  await expect.poll(async () => (await saved(page))?.active.nails[0].marble).toBeNull();
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect
    .poll(async () => (await saved(page))?.active.nails[0].marble)
    .toEqual({ colorId: 'color-6', variant: 1 });
});

test('starter inspiration suggests unlocked supplies without changing the manicure', async ({
  page,
}) => {
  await start(page);
  const before = (await saved(page)).active;
  await page.getByRole('button', { name: 'Creative idea' }).click();
  for (let i = 0; i < 4; i++) {
    await page.getByRole('button', { name: 'Try the suggested sticker' }).click();
    await page.getByRole('button', { name: 'Another idea' }).click();
  }
  await page.getByRole('button', { name: 'Try Cherry pop', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Cherry pop', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  expect((await saved(page)).active).toEqual(before);
  expect((await saved(page)).stars).toBe(0);
});

test('stencil masks and marble render consistently, including matte and exported pixels', async ({
  page,
}) => {
  await page.goto('/');
  const results = await page.evaluate(
    async (paths) => {
      const { renderNail, exportManicure, NAIL_BOXES } = (await import(
        paths[0]
      )) as typeof import('../src/art/render');
      const { nailContext } = (await import(paths[1])) as typeof import('../src/art/context');
      const { createSave } = await import(paths[2]);
      const { fillStencil, dipMarble } = await import(paths[3]);
      const canvas = document.createElement('canvas');
      canvas.width = 240;
      canvas.height = 380;
      const ctx = nailContext(canvas);
      const base = { ...createSave().active.nails[0], cleaned: true };
      const render = (n: typeof base) => {
        renderNail(ctx, n, 240, 380);
        return Array.from(ctx.getImageData(0, 0, 240, 380).data);
      };
      const sample = (p: number[], x: number, y: number) =>
        p.slice((y * 240 + x) * 4, (y * 240 + x) * 4 + 4);
      const bare = render(base);
      const stencil = fillStencil({ ...base, finish: 'matte' }, 'heart', 'color-1');
      const first = render(stencil);
      const second = render(stencil);
      const marble = dipMarble(base, 'color-0', 'color-5', 1);
      const marbled = render(marble);
      const marbledAgain = render(marble);
      const swirled = render(dipMarble(base, 'color-0', 'color-5', 2));
      const m = createSave().active;
      m.nails[0] = stencil;
      m.nails[1] = marble;
      const blob = await exportManicure(m);
      const bitmap = await createImageBitmap(blob);
      const dimensions = [bitmap.width, bitmap.height];
      const photo = document.createElement('canvas');
      photo.width = bitmap.width;
      photo.height = bitmap.height;
      const pc = photo.getContext('2d')!;
      pc.drawImage(bitmap, 0, 0);
      const exported = NAIL_BOXES.slice(0, 2).map((b) =>
        Array.from(
          pc.getImageData(Math.round((b.x + b.w / 2) * 2), Math.round((b.y + b.h / 2) * 2), 1, 1)
            .data,
        ),
      );
      bitmap.close();
      return {
        outside: sample(first, 36, 76),
        bare: sample(bare, 36, 76),
        inside: sample(first, 120, 190),
        natural: sample(bare, 120, 190),
        stencilSame: first.every((v, i) => v === second[i]),
        marbleSame: marbled.every((v, i) => v === marbledAgain[i]),
        swirlDifferent: marbled.some((v, i) => v !== swirled[i]),
        exported,
        expectedExported: [sample(first, 120, 190), sample(marbled, 120, 190)],
        dimensions,
        type: blob.type,
      };
    },
    ['/src/art/render.ts', '/src/art/context.ts', '/src/game/rules.ts', '/src/game/creative.ts'],
  );
  expect(results.outside).toEqual(results.bare);
  expect(results.inside).not.toEqual(results.natural);
  expect(results.stencilSame).toBe(true);
  expect(results.marbleSame).toBe(true);
  expect(results.swirlDifferent).toBe(true);
  expect(results.dimensions).toEqual([880, 1100]);
  expect(results.type).toBe('image/png');
  results.exported.forEach((pixel, i) =>
    pixel.forEach((v, channel) => {
      expect(Math.abs(v - results.expectedExported[i][channel])).toBeLessThanOrEqual(8);
    }),
  );
});
