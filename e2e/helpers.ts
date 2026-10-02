import type { Page } from '@playwright/test';

// Free play can skip preparation; return to the overview for painting tests.
export async function skipPreparation(page: Page) {
  await page.getByRole('button', { name: 'Start painting →' }).click();
  await page.getByRole('button', { name: /Back to hand/ }).click();
}
