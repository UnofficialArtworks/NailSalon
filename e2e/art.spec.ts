import { test, expect } from '@playwright/test';

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
