import { test, expect } from '@playwright/test';

test('mobile layouts show the next reward', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Let’s create!' }).click();
  await expect(page.getByLabel('Next reward', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Next reward', { exact: true })).toContainText('3 ★');
});

test('a departing canvas cannot copy its draft into a new manicure', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Let’s create!' }).click();
  await page.getByRole('button', { name: 'Edit nail 1', exact: true }).click();
  const box = (await page.getByLabel('Paint nail 1', { exact: true }).boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.4);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.6);
  await page
    .getByRole('button', { name: 'New manicure', exact: true })
    .evaluate((button: HTMLButtonElement) => button.click());
  await page.mouse.up();
  await page.getByRole('button', { name: 'Edit nail 1', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Undo', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'New manicure', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Ready for something new?' })).toHaveCount(0);
});

test('pattern-only artwork is protected before starting a new manicure', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Let’s create!' }).click();
  await page.getByRole('button', { name: 'Patterns', exact: true }).click();
  await page.getByRole('button', { name: 'Apply pattern', exact: true }).click();
  await page.getByRole('button', { name: 'New manicure', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Ready for something new?' })).toBeVisible();
  await page.getByRole('button', { name: 'Keep creating' }).click();
  await expect(page.getByRole('button', { name: 'Undo', exact: true })).toBeEnabled();
});

test('a toolbar fill during a held stroke is not overwritten on pointer release', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Let’s create!' }).click();
  await page.getByRole('button', { name: 'Edit nail 1', exact: true }).click();
  const nail = page.getByLabel('Paint nail 1', { exact: true });
  const box = (await nail.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.4);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.6);
  // A second finger can tap HTML controls while the drawing pointer remains captured.
  await page
    .getByRole('button', { name: 'Fill this nail', exact: true })
    .evaluate((button: HTMLButtonElement) => button.click());
  await page.mouse.up();
  await expect
    .poll(async () =>
      page.evaluate(async () => {
        const db = await new Promise<IDBDatabase>((resolve) => {
          const request = indexedDB.open('nail-salon-v1', 1);
          request.onsuccess = () => resolve(request.result);
        });
        const data = await new Promise<{ active: { nails: { fillColorId: string | null }[] } }>(
          (resolve) => {
            const request = db.transaction('saves').objectStore('saves').get('current');
            request.onsuccess = () => resolve(request.result);
          },
        );
        db.close();
        return data?.active.nails[0].fillColorId;
      }),
    )
    .toBe('color-0');
});
