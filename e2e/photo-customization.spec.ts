import { test, expect, type Page } from '@playwright/test';

async function setStars(page: Page, stars: number) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Skip tutorial', exact: true }).click();
  // Let the initial tutorial setting finish autosaving before replacing the fixture.
  await page.waitForTimeout(1000);
  await page.evaluate(async (stars) => {
    const rulesPath = '/src/game/rules.ts',
      dbPath = '/src/storage/database.ts';
    const { createSave } = await import(rulesPath);
    const { openDatabase, writeSave } = await import(dbPath);
    const save = createSave();
    save.stars = stars;
    save.settings.tutorialSeen = true;
    const db = await openDatabase();
    await writeSave(db, save);
    db.close();
  }, stars);
  await page.reload();
}

test('free photo choices work on a phone and star rewards clearly stay locked', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Skip tutorial', exact: true }).click();
  await page.getByRole('button', { name: 'All done!' }).click();
  await expect(page.getByRole('button', { name: /Rainbow skies.*12/ })).toBeDisabled();
  await page.getByRole('button', { name: 'Sunset glow', exact: true }).click();
  await page.getByRole('button', { name: 'Frames', exact: true }).click();
  await page.getByRole('button', { name: 'Sweet postcard', exact: true }).click();
  await expect(page.getByRole('button', { name: /Sparkle frame.*24/ })).toBeDisabled();
  await page.getByRole('button', { name: 'Props', exact: true }).click();
  await page.getByRole('button', { name: 'Flower corners', exact: true }).click();
  await page.getByRole('button', { name: 'Bracelets', exact: true }).click();
  await page.getByRole('button', { name: 'Ribbon bracelet', exact: true }).click();
  expect(await page.locator('dialog').evaluate((d) => d.scrollWidth <= d.clientWidth)).toBe(true);
  const sizes = await page.locator('.photo-category-tabs button').evaluateAll((buttons) =>
    buttons.map((b) => ({
      width: b.getBoundingClientRect().width,
      height: b.getBoundingClientRect().height,
    })),
  );
  expect(sizes.every((s) => s.width >= 48 && s.height >= 48)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('photo-studio-phone.png'), fullPage: true });
  await page.getByRole('button', { name: 'Save picture', exact: true }).click();
  const preview = page.getByAltText('Your finished manicure');
  await expect(preview).toBeVisible();
  const framePixel = await preview.evaluate(async (image: HTMLImageElement) => {
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(image, 0, 0);
    return Array.from(ctx.getImageData(20, 550, 1, 1).data);
  });
  expect(framePixel).toEqual([255, 250, 240, 255]);
});

test('earned photo choices survive scrapbook copying, reload and export', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  // This multi-stage flow includes two viewport captures, reload, gallery editing
  // and PNG export. Match the existing scrapbook flow's budget on slower CI WebKit.
  test.setTimeout(60000);
  await setStars(page, 36);
  await page.getByRole('button', { name: 'Start painting →' }).click();
  await page.getByRole('button', { name: 'Color all five' }).click();
  await page.getByRole('button', { name: 'All done!' }).click();
  await page.getByRole('button', { name: 'Starlight stage', exact: true }).click();
  await page.getByRole('button', { name: 'Frames', exact: true }).click();
  await page.getByRole('button', { name: 'Sparkle frame', exact: true }).click();
  await page.getByRole('button', { name: 'Props', exact: true }).click();
  await page.getByRole('button', { name: 'Seaside treasures', exact: true }).click();
  await page.getByRole('button', { name: 'Party confetti', exact: true }).click();
  await page.getByRole('button', { name: 'Rings', exact: true }).click();
  await page.getByRole('button', { name: 'Star ring', exact: true }).click();
  await page.screenshot({ path: testInfo.outputPath('photo-studio-ipad.png'), fullPage: true });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({ path: testInfo.outputPath('photo-studio-desktop.png'), fullPage: true });
  await page.getByRole('button', { name: 'Save to gallery', exact: true }).click();
  await page.waitForTimeout(1000);
  await page.reload();
  await page.getByRole('button', { name: 'My gallery' }).click();
  await page.getByRole('button', { name: 'Edit a copy', exact: true }).click();
  await page.getByRole('button', { name: 'All done!' }).click();
  await expect(page.getByRole('button', { name: 'Starlight stage' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'Frames', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Sparkle frame' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'Props', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Party confetti' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'Save picture', exact: true }).click();
  await expect(page.getByAltText('Your finished manicure')).toBeVisible();
});

test('a completed customer unlocks the star ring without spending stars', async ({ page }) => {
  await setStars(page, 3);
  await page.getByRole('button', { name: 'Customers', exact: false }).click();
  await page.getByRole('button', { name: 'Start painting →' }).click();
  await page.locator('.wish-list button').first().click();
  await page.getByRole('button', { name: 'Color all five' }).click();
  await page.locator('.wish-list button').last().click();
  await page.getByRole('button', { name: 'Place in the middle' }).click();
  await page.getByRole('button', { name: /All done!/ }).click();
  await expect(page.locator('.unlock-message')).toContainText('Star ring');
  await page.getByRole('button', { name: 'Rings', exact: true }).click();
  await page.getByRole('button', { name: 'Star ring', exact: true }).click();
  await expect(page.locator('.photo-reward-hint')).toContainText('6 ★ earned');
});
