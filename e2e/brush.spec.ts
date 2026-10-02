import { test, expect } from '@playwright/test';
import { skipPreparation } from './helpers';

test('paint and eraser footprints remain round in every nail aspect ratio', async ({ page }) => {
  await page.goto('/');
  const measurements = await page.evaluate(async (modulePath) => {
    const { renderNail } = await import(modulePath);
    const results = [];
    for (const [width, height] of [
      [240, 380],
      [120, 210],
      [300, 300],
    ]) {
      for (const size of [0.04, 0.09, 0.25]) {
        for (const erase of [false, true]) {
          for (const points of [
            [{ x: 0.5, y: 0.5 }],
            [
              { x: 0.4, y: 0.4 },
              { x: 0.6, y: 0.6 },
            ],
            [
              { x: 0.4, y: 0.5 },
              { x: 0.6, y: 0.5 },
            ],
          ]) {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d')!;
            const nail = {
              shape: 'round',
              cleaned: true,
              baseColorId: null,
              fillColorId: erase ? 'color-1' : null,
              strokes: [],
              decorations: [],
              patternId: null,
            };
            renderNail(ctx, nail, width, height);
            const before = Array.from(ctx.getImageData(0, 0, width, height).data);
            // NailCanvas resets its bitmap dimensions before each frame. Match
            // that real rendering lifecycle instead of reusing a native backing store.
            canvas.width = width;
            canvas.height = height;
            renderNail(ctx, { ...nail, fillColorId: erase ? null : 'color-1' }, width, height);
            const target = Array.from(ctx.getImageData(0, 0, width, height).data);
            canvas.width = width;
            canvas.height = height;
            renderNail(
              ctx,
              {
                ...nail,
                strokes: [{ points, width: size, erase, colorId: 'color-1' }],
              },
              width,
              height,
            );
            const after = ctx.getImageData(0, 0, width, height).data;
            let left = width,
              right = -1,
              top = height,
              bottom = -1;
            const outsideSamples: { x: number; y: number; before: number[]; after: number[] }[] =
              [];
            const expectedLeft = Math.min(...points.map((p) => p.x)) * width - (width * size) / 2;
            const expectedRight = Math.max(...points.map((p) => p.x)) * width + (width * size) / 2;
            for (let y = 0; y < height; y++)
              for (let x = 0; x < width; x++) {
                const i = (y * width + x) * 4;
                // Measure paint coverage against the actual natural/polished
                // reference colors. Small changes to glossy highlights are not paint.
                const distance = (reference: number[]) =>
                  [0, 1, 2].reduce((sum, c) => sum + Math.abs(reference[i + c] - after[i + c]), 0);
                const contrast = Math.max(
                  ...[0, 1, 2].map((c) => Math.abs(before[i + c] - target[i + c])),
                );
                if (contrast > 15 && distance(target) < distance(before)) {
                  left = Math.min(left, x);
                  right = Math.max(right, x);
                  top = Math.min(top, y);
                  bottom = Math.max(bottom, y);
                  if (
                    (x < expectedLeft - 2 || x > expectedRight + 2) &&
                    outsideSamples.length < 6
                  ) {
                    outsideSamples.push({
                      x,
                      y,
                      before: before.slice(i, i + 4),
                      after: Array.from(after.slice(i, i + 4)),
                    });
                  }
                }
              }
            const diameter = width * size;
            results.push({
              width,
              height,
              size,
              erase,
              points,
              outsideSamples,
              actualWidth: right - left + 1,
              actualHeight: bottom - top + 1,
              expectedWidth:
                (Math.max(...points.map((p) => p.x)) - Math.min(...points.map((p) => p.x))) *
                  width +
                diameter,
              expectedHeight:
                (Math.max(...points.map((p) => p.y)) - Math.min(...points.map((p) => p.y))) *
                  height +
                diameter,
            });
          }
        }
      }
    }
    return results;
  }, '/src/art/render.ts');
  for (const result of measurements) {
    expect(
      Math.abs(result.actualWidth - result.expectedWidth),
      JSON.stringify(result),
    ).toBeLessThanOrEqual(2);
    expect(
      Math.abs(result.actualHeight - result.expectedHeight),
      JSON.stringify(result),
    ).toBeLessThanOrEqual(2);
  }
});

for (const viewport of [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1280, height: 800 },
]) {
  test(`painted dot matches the cursor at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await page.getByRole('button', { name: 'Skip tutorial', exact: true }).click();
    await page.getByRole('button', { name: 'Clean this nail', exact: true }).click();
    await skipPreparation(page);
    await page.getByRole('button', { name: 'Edit nail 1', exact: true }).click();
    const canvas = page.getByLabel('Paint nail 1', { exact: true });
    await page.getByRole('slider', { name: 'Brush size' }).press('End');
    await canvas.hover();
    const cursor = (await page.locator('.brush-cursor').boundingBox())!;
    const before = await canvas.evaluate((element) => {
      const c = element as HTMLCanvasElement;
      return Array.from(c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data);
    });
    await canvas.click();
    const footprint = await canvas.evaluate((element, previous) => {
      const c = element as HTMLCanvasElement;
      const pixels = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data;
      let left = c.width,
        right = -1,
        top = c.height,
        bottom = -1;
      for (let y = 0; y < c.height; y++)
        for (let x = 0; x < c.width; x++) {
          const i = (y * c.width + x) * 4;
          if (Math.abs(pixels[i + 1] - previous[i + 1]) > 15) {
            left = Math.min(left, x);
            right = Math.max(right, x);
            top = Math.min(top, y);
            bottom = Math.max(bottom, y);
          }
        }
      const rect = c.getBoundingClientRect();
      return {
        width: ((right - left + 1) * rect.width) / c.width,
        height: ((bottom - top + 1) * rect.height) / c.height,
        x: rect.left + (((left + right + 1) / 2) * rect.width) / c.width,
        y: rect.top + (((top + bottom + 1) / 2) * rect.height) / c.height,
      };
    }, before);
    expect(Math.abs(footprint.width - cursor.width)).toBeLessThanOrEqual(2);
    expect(Math.abs(footprint.height - cursor.height)).toBeLessThanOrEqual(2);
    expect(Math.abs(footprint.x - (cursor.x + cursor.width / 2))).toBeLessThanOrEqual(2);
    expect(Math.abs(footprint.y - (cursor.y + cursor.height / 2))).toBeLessThanOrEqual(2);
    if (viewport.width === 768)
      await page.screenshot({
        path: `test-results/visual/round-brush-${test.info().project.name}.png`,
        fullPage: true,
      });
  });
}
