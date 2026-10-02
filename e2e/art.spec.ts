import { test, expect } from '@playwright/test';

test('shared contours preserve the original painting silhouettes', async ({ page }) => {
  await page.goto('/');
  const differences = await page.evaluate(async (modulePath) => {
    const { nailPath } = await import(modulePath);
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 600;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(400, 600);
    return ['round', 'oval', 'square', 'soft-square', 'almond'].map((shape) => {
      // Independent reference for the silhouettes used by existing saved artwork.
      const original = new Path2D();
      if (shape === 'oval') original.ellipse(0.5, 0.49, 0.42, 0.445, 0, 0, Math.PI * 2);
      else if (shape === 'almond') {
        original.moveTo(0.5, 0.025);
        original.bezierCurveTo(0.82, 0.15, 0.92, 0.42, 0.92, 0.72);
        original.bezierCurveTo(0.92, 0.99, 0.08, 0.99, 0.08, 0.72);
        original.bezierCurveTo(0.08, 0.42, 0.18, 0.15, 0.5, 0.025);
      } else if (shape === 'square' || shape === 'soft-square') {
        original.roundRect(0.08, 0.05, 0.84, 0.88, shape === 'square' ? 0.045 : 0.15);
      } else {
        original.moveTo(0.08, 0.7);
        original.bezierCurveTo(0.08, 0.18, 0.18, 0.045, 0.5, 0.045);
        original.bezierCurveTo(0.82, 0.045, 0.92, 0.18, 0.92, 0.7);
        original.bezierCurveTo(0.92, 1, 0.08, 1, 0.08, 0.7);
      }
      original.closePath();
      const current = nailPath(shape);
      ctx.clearRect(0, 0, 1, 1);
      ctx.fill(original);
      const before = ctx.getImageData(0, 0, 400, 600).data;
      ctx.clearRect(0, 0, 1, 1);
      ctx.fill(current);
      const after = ctx.getImageData(0, 0, 400, 600).data;
      let mismatch = 0;
      // Compare actual displayed clipping, excluding antialiased boundary pixels.
      for (let i = 3; i < before.length; i += 4)
        if ((before[i] === 255 && after[i] === 0) || (before[i] === 0 && after[i] === 255))
          mismatch++;
      return { shape, mismatch };
    });
  }, '/src/art/render.ts');
  for (const result of differences) expect(result.mismatch, result.shape).toBe(0);
});

test('round stickers keep their proportions on tall nails, including rotation', async ({
  page,
}) => {
  await page.goto('/');
  const bounds = await page.evaluate(async (modulePath) => {
    const { drawDecoration } = await import(modulePath);
    return [0, 30, 90].map((rotation) => {
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 340;
      const ctx = canvas.getContext('2d')!;
      ctx.scale(canvas.width, canvas.height);
      drawDecoration(
        ctx,
        {
          id: 'test',
          kind: 'sticker',
          supplyId: 'sticker-11',
          x: 0.5,
          y: 0.5,
          size: 0.5,
          rotation,
        },
        canvas.width / canvas.height,
      );
      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let minX = 200,
        minY = 340,
        maxX = 0,
        maxY = 0;
      for (let y = 0; y < 340; y++)
        for (let x = 0; x < 200; x++) {
          if (data[(y * 200 + x) * 4 + 3] < 32) continue;
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
        }
      return { width: maxX - minX, height: maxY - minY };
    });
  }, '/src/art/render.ts');
  for (const box of bounds) {
    expect(box.width).toBeGreaterThan(80);
    expect(Math.abs(box.width - box.height)).toBeLessThanOrEqual(2);
  }
});
