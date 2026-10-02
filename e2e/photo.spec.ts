import { test, expect } from '@playwright/test';

test('photo choices, names and favorites survive reload and editing a copy', async ({ page }) => {
  test.setTimeout(60000);
  await page.goto('/');
  await page.getByRole('button', { name: 'Skip tutorial', exact: true }).click();
  await page.getByRole('button', { name: 'All done!' }).click();
  await page.getByRole('button', { name: 'Ocean dreams', exact: true }).click();
  await page.getByRole('button', { name: 'Pearls', exact: true }).click();
  await page.getByRole('button', { name: 'Heart ring', exact: true }).click();
  await page.getByRole('button', { name: 'Replay reveal' }).click();
  await page.getByRole('button', { name: 'Save to gallery', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Saved ✓' })).toBeDisabled();
  // A different photo is a new save even when the nail art stays the same.
  await page.getByRole('button', { name: 'Garden picnic', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Save to gallery', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Ocean dreams', exact: true }).click();
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await page.getByRole('button', { name: 'My gallery' }).click();
  await page.getByRole('button', { name: 'Name design', exact: true }).click();
  await page.getByLabel('Name your design').fill('Ocean magic');
  await page.getByRole('button', { name: 'Keep name', exact: true }).click();
  await page.getByRole('button', { name: 'Favorite Ocean magic', exact: true }).click();
  await page.getByRole('button', { name: 'Favorites', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Ocean magic' })).toBeVisible();
  await page.waitForTimeout(1000);
  await page.reload();
  await page.getByRole('button', { name: 'My gallery' }).click();
  await expect(page.getByRole('button', { name: 'Favorite Ocean magic' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'Edit a copy', exact: true }).click();
  await page.getByRole('button', { name: 'All done!' }).click();
  await expect(page.getByRole('button', { name: 'Ocean dreams' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByRole('button', { name: 'Heart ring' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

test('PNG reproduces the photo scene and phone controls stay inside the dialog', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Skip tutorial', exact: true }).click();
  await page.getByRole('button', { name: 'All done!' }).click();
  await page.getByRole('button', { name: 'Candy clouds', exact: true }).click();
  await page.getByRole('button', { name: 'Flower ring', exact: true }).click();
  const overflow = await page.locator('dialog').evaluate((d) => d.scrollWidth > d.clientWidth);
  expect(overflow).toBe(false);
  await page.getByRole('button', { name: 'Replay reveal' }).click();
  expect(
    await page.locator('.photo-hand').evaluate((el) => getComputedStyle(el).animationName),
  ).toBe('none');
  await page.getByRole('button', { name: 'Save picture', exact: true }).click();
  const preview = page.getByAltText('Your finished manicure');
  await expect(preview).toBeVisible();
  const pixels = await preview.evaluate(async (img: HTMLImageElement) => {
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const ctx = c.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    return {
      width: c.width,
      height: c.height,
      corner: Array.from(ctx.getImageData(2, 2, 1, 1).data),
      ring: Array.from(ctx.getImageData(558, 594, 1, 1).data),
    };
  });
  expect(pixels.width).toBe(880);
  expect(pixels.height).toBe(1100);
  expect(pixels.corner).toEqual([255, 214, 236, 255]);
  // Flower center is warm yellow, rather than bare skin or backdrop.
  expect(pixels.ring[0]).toBeGreaterThan(230);
  expect(pixels.ring[2]).toBeLessThan(210);
});
