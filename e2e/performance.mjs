import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1024, height: 768 },
  deviceScaleFactor: 2,
});
await page.goto('http://127.0.0.1:4173');
await page.getByRole('button', { name: 'Let’s create!' }).click();
await page.getByRole('button', { name: 'Edit nail 3', exact: true }).click();
const canvas = page.getByLabel('Paint nail 3', { exact: true }),
  box = await canvas.boundingBox();
const measurement = page.evaluate(
  () =>
    new Promise((resolve) => {
      const intervals = [];
      let last = performance.now();
      function tick(now) {
        intervals.push(now - last);
        last = now;
        if (intervals.length < 120) requestAnimationFrame(tick);
        else resolve(intervals);
      }
      requestAnimationFrame(tick);
    }),
);
await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.3);
await page.mouse.down();
for (let i = 0; i < 100; i++)
  await page.mouse.move(
    box.x + box.width * (0.5 + Math.sin(i * 0.2) * 0.15),
    box.y + box.height * (0.3 + i * 0.004),
  );
await page.mouse.up();
const intervals = await measurement;
const average = intervals.reduce((a, b) => a + b, 0) / intervals.length;
console.log(
  JSON.stringify({
    desktopEmulation: true,
    frames: intervals.length,
    averageFps: Math.round(1000 / average),
    framesSlowerThan33ms: intervals.filter((n) => n > 33.3).length,
  }),
);
await browser.close();
