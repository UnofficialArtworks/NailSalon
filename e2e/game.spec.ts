import { test, expect, type Page } from '@playwright/test';
async function welcome(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Let’s create!' }).click();
}
async function saved(page: Page) {
  return page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const r = indexedDB.open('nail-salon-v1', 1);
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
    const value = await new Promise<Record<string, unknown>>((resolve, reject) => {
      const r = db.transaction('saves').objectStore('saves').get('current');
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
    db.close();
    return value;
  });
}
test('customer manicure awards wishes and cannot claim twice', async ({ page }) => {
  await welcome(page);
  await page.getByRole('button', { name: '☆ Customers', exact: true }).click();
  await page.getByRole('button', { name: 'Color all five', exact: true }).click();
  await page.getByRole('button', { name: 'Heart', exact: true }).first().click();
  await page.getByRole('button', { name: 'Place in the middle' }).click();
  await page.getByRole('button', { name: 'All done!' }).click();
  await expect(page.getByText('+3 stars', { exact: true })).toBeVisible();
  await expect(page.getByText('New treasures!', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Save to gallery', exact: true }).click();
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await page.getByRole('button', { name: 'All done!' }).click();
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(page.getByLabel('3 stars', { exact: true })).toBeVisible();
  await expect.poll(async () => (await saved(page))?.stars).toBe(3);
  await page.reload();
  await expect(page.getByLabel('3 stars', { exact: true })).toBeVisible();
});
test('free-play gallery, PNG export, and editing a copy', async ({ page }) => {
  await welcome(page);
  await page.getByRole('button', { name: 'Color all five', exact: true }).click();
  await page.getByRole('button', { name: 'All done!' }).click();
  await page.getByRole('button', { name: 'Save to gallery', exact: true }).click();
  await page.getByRole('button', { name: 'Save picture', exact: true }).click();
  await expect(page.getByAltText('Your finished manicure')).toBeVisible();
  const download = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Download picture' }).click();
  expect((await download).suggestedFilename()).toBe('my-nail-salon-art.png');
  await page.getByRole('dialog').last().getByRole('button', { name: 'Close', exact: true }).click();
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await page.getByRole('button', { name: 'My gallery' }).click();
  await expect(page.getByText('Little masterpiece 1', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Edit a copy' }).click();
  await page.getByRole('button', { name: 'Start without saving' }).click();
  await expect(page.getByRole('button', { name: '♡ Free play', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});
test('painting and cancelled strokes survive resizing, undo, redo, and reload', async ({
  page,
}) => {
  await welcome(page);
  await page.getByRole('button', { name: 'Edit nail 1', exact: true }).click();
  const canvas = page.getByLabel('Paint nail 1', { exact: true });
  const box = (await canvas.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.3);
  await page.mouse.down();
  await canvas.dispatchEvent('pointerdown', {
    pointerId: 99,
    pointerType: 'touch',
    isPrimary: false,
    button: 0,
    clientX: box.x + box.width * 0.5,
    clientY: box.y + box.height * 0.3,
  });
  await page.mouse.move(box.x + box.width * 0.55, box.y + box.height * 0.7, { steps: 10 });
  await canvas.dispatchEvent('pointercancel', {
    pointerId: 1,
    pointerType: 'mouse',
    isPrimary: true,
  });
  await page.mouse.up();
  await expect(page.getByRole('button', { name: 'Undo', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Redo', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Redo', exact: true }).click();
  await page.setViewportSize({ width: 768, height: 1024 });
  await expect
    .poll(async () => JSON.stringify((await saved(page))?.active))
    .toContain('"points":[');
  const before = JSON.stringify((await saved(page)).active);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Edit nail 1', exact: true })).toBeVisible();
  expect(JSON.stringify((await saved(page)).active)).toBe(before);
});
test('decorations can be selected, rotated, and removed without dragging', async ({ page }) => {
  await welcome(page);
  await page.getByRole('button', { name: 'Stickers', exact: true }).click();
  await page.getByRole('button', { name: 'Place in the middle' }).click();
  await expect(page.getByRole('button', { name: 'Make decoration bigger' })).toBeEnabled();
  await page.getByRole('button', { name: 'Make decoration bigger' }).click();
  await expect
    .poll(async () => {
      const active = (await saved(page)).active as { nails: { decorations: { size: number }[] }[] };
      return active.nails[0].decorations[0].size;
    })
    .toBeCloseTo(0.32);
  await page.getByRole('button', { name: 'Move', exact: true }).click();
  await page.getByRole('button', { name: 'Item 1' }).click();
  await page.getByRole('button', { name: 'Rotate', exact: false }).click();
  await page.getByRole('button', { name: 'Remove item', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Item 1' })).toHaveCount(0);
});

test('switching tools remembers the chosen sticker', async ({ page }) => {
  await welcome(page);
  await page.getByRole('button', { name: 'Stickers', exact: true }).click();
  await page.getByRole('button', { name: 'Butterfly', exact: true }).click();
  await page.getByRole('button', { name: 'Gems', exact: true }).click();
  await page.getByRole('button', { name: 'Stickers', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Butterfly', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});
test('portrait, landscape, phone, and iframe layouts do not overflow', async ({ page }) => {
  await welcome(page);
  for (const size of [
    { width: 320, height: 740 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
  ]) {
    await page.setViewportSize(size);
    await expect(page.getByRole('button', { name: 'All done!' })).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  }
  await page.goto('/e2e/embed.html');
  const frame = page.frameLocator('iframe');
  await expect(frame.getByRole('heading', { name: 'Nail Salon', exact: false })).toBeVisible();
});
test('storage failure keeps gameplay usable and displays a notice', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'indexedDB', {
      get() {
        throw new Error('Storage disabled');
      },
    });
  });
  await welcome(page);
  await expect(page.getByRole('status').filter({ hasText: 'Saving is unavailable' })).toBeVisible();
  await page.getByRole('button', { name: 'Color all five', exact: true }).click();
  await page.getByRole('button', { name: 'All done!' }).click();
  await expect(page.getByRole('heading', { name: 'Look what you made!' })).toBeVisible();
});
test('invalid save is preserved until the player chooses recovery', async ({ page }) => {
  await welcome(page);
  await expect.poll(async () => (await saved(page))?.version).toBe(1);
  await page.getByRole('button', { name: 'Color all five', exact: true }).click();
  await expect
    .poll(async () => JSON.stringify((await saved(page))?.active))
    .toContain('"fillColorId":"color-0"');
  await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve) => {
      const r = indexedDB.open('nail-salon-v1');
      r.onsuccess = () => resolve(r.result);
    });
    await new Promise<void>((resolve) => {
      const tx = db.transaction('saves', 'readwrite');
      tx.objectStore('saves').put({ version: 99, art: 'preserve me' }, 'current');
      tx.oncomplete = () => resolve();
    });
    db.close();
  });
  await page.reload();
  await expect(
    page.getByText('Your saved game could not be read.', { exact: false }),
  ).toBeVisible();
  expect((await saved(page)).version).toBe(99);
  await page.getByRole('button', { name: 'Restore previous save', exact: true }).click();
  await expect(page.getByText('Save recovered.', { exact: false })).toBeVisible();
  await expect.poll(async () => (await saved(page))?.version).toBe(1);
});
