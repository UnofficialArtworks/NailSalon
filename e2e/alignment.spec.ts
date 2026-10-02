import { skipPreparation } from './helpers';
import { test, expect } from '@playwright/test';

test('every fingertip can be opened on short desktop, tablet, and phone screens', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Let’s create!' }).click();
  await skipPreparation(page);
  for (const [width, height] of [
    [1280, 720],
    [1024, 768],
    [768, 1024],
    [390, 844],
  ]) {
    await page.setViewportSize({ width, height });
    for (let i = 1; i <= 5; i++) {
      await page.getByRole('button', { name: `Edit nail ${i}`, exact: true }).click();
      await expect(page.getByLabel(`Paint nail ${i}`, { exact: true })).toBeVisible();
      await page.getByRole('button', { name: /Back to hand/ }).click();
    }
  }
});

test('hand nail beds stay aligned with small free edges and large touch targets', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Let’s create!' }).click();
  await skipPreparation(page);
  for (const width of [320, 768, 1280]) {
    await page.setViewportSize({ width, height: 1024 });
    const result = await page.evaluate(async (modulePath) => {
      const { NAIL_BOXES, HAND_PATH, nailPath } = await import(modulePath);
      const hand = document.querySelector('.workspace .hand-art')!.getBoundingClientRect();
      const skin = new Path2D(HAND_PATH);
      const ctx = document.createElement('canvas').getContext('2d')!;
      const nails = [...document.querySelectorAll('.workspace .hand-nail')];
      let outside = 0;
      const sizes = nails.map((el, i) => {
        const box = NAIL_BOXES[i];
        const angle = (box.r * Math.PI) / 180;
        const bounds = el.getBoundingClientRect();
        const expectedWidth =
          ((box.w * Math.abs(Math.cos(angle)) + box.h * Math.abs(Math.sin(angle))) * hand.width) /
          440;
        const target = el.querySelector('button')!;
        // Sample every supported nail silhouette against the actual hand path.
        for (const shape of ['round', 'oval', 'square', 'soft-square', 'almond']) {
          const path = nailPath(shape);
          for (let x = 0.1; x < 0.9; x += 0.05)
            for (let y = 0.35; y < 0.95; y += 0.05) {
              if (!ctx.isPointInPath(path, x, y)) continue;
              const dx = (x - 0.5) * box.w,
                dy = (y - 0.5) * box.h;
              const hx = box.x + box.w / 2 + dx * Math.cos(angle) - dy * Math.sin(angle);
              const hy = box.y + box.h / 2 + dx * Math.sin(angle) + dy * Math.cos(angle);
              if (!ctx.isPointInPath(skin, hx, hy)) outside++;
            }
        }
        const tip = { dx: 0, dy: (0.05 - 0.5) * box.h };
        const tx = box.x + box.w / 2 - tip.dy * Math.sin(angle);
        const ty = box.y + box.h / 2 + tip.dy * Math.cos(angle);
        return {
          freeEdge: !ctx.isPointInPath(skin, tx, ty),
          error: Math.abs(bounds.width - expectedWidth),
          touchWidth: target.clientWidth,
          touchHeight: target.clientHeight,
        };
      });
      return { sizes, outside };
    }, '/src/art/render.ts');
    expect(result.outside).toBe(0);
    for (const nail of result.sizes) {
      expect(nail.freeEdge).toBe(true);
      expect(nail.error).toBeLessThan(1);
      expect(nail.touchWidth).toBeGreaterThanOrEqual(48);
      expect(nail.touchHeight).toBeGreaterThanOrEqual(48);
    }
  }
});

test('the fixed fingertip holds the nail beds while nail tips extend just beyond it', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Let’s create!' }).click();
  await skipPreparation(page);
  await page.getByRole('button', { name: 'Edit nail 3', exact: true }).click();
  const geometry = await page.evaluate(
    async (paths) => {
      const { fingerPath, FINGER_NAIL: box } = await import(paths[0]);
      const { nailPath } = await import(paths[1]);
      const ctx = document.createElement('canvas').getContext('2d')!;
      const skin = new Path2D(fingerPath());
      const span = (y: number) => {
        let width = 0;
        for (let x = 0; x < 240; x++) if (ctx.isPointInPath(skin, x, y)) width++;
        return width;
      };
      let outside = 0;
      let fingertip = 0;
      while (!ctx.isPointInPath(skin, 120, fingertip)) fingertip++;
      const extensions = [];
      for (const shape of ['round', 'oval', 'square', 'soft-square', 'almond']) {
        const nail = nailPath(shape);
        const skin = new Path2D(fingerPath());
        let tip = 0;
        while (tip < 1 && !ctx.isPointInPath(nail, 0.5, tip)) tip += 0.001;
        extensions.push(fingertip - (box.y + tip * box.h));
        for (let x = 0.1; x < 0.9; x += 0.025)
          // The upper free edge intentionally projects beyond the fingertip.
          for (let y = 0.35; y < 0.95; y += 0.025) {
            if (
              ctx.isPointInPath(nail, x, y) &&
              !ctx.isPointInPath(skin, box.x + x * box.w, box.y + y * box.h)
            )
              outside++;
          }
      }
      return { tip: span(80), base: span(380), outside, extensions };
    },
    ['/src/art/finger.ts', '/src/art/render.ts'],
  );
  expect(geometry.base).toBeGreaterThan(geometry.tip);
  expect(geometry.outside).toBe(0);
  for (const extension of geometry.extensions) {
    expect(extension).toBeGreaterThan(0);
    expect(extension).toBeLessThan(25);
  }
});

test('phone customer wishes leave all five nail selectors reachable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Let’s create!' }).click();
  await skipPreparation(page);
  await page.getByRole('button', { name: '☆ Customers', exact: true }).click();
  await page.getByRole('button', { name: 'Polish', exact: true }).click();
  for (let i = 1; i <= 5; i++) {
    await page.getByRole('button', { name: `Select nail ${i}`, exact: true }).click();
    await expect(page.getByLabel(`Paint nail ${i}`, { exact: true })).toBeVisible();
  }
});
