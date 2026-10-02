import { test, expect } from '@playwright/test';
import { skipPreparation } from './helpers';
import { createServer, type Server } from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
let server: Server, origin: string;
test.beforeAll(async () => {
  const files = new Map<string, { body: Buffer; type: string }>();
  files.set('/NailSalonGame/', {
    body: await readFile(resolve('dist/index.html')),
    type: 'text/html',
  });
  files.set('/NailSalonGame/favicon.svg', {
    body: await readFile(resolve('dist/favicon.svg')),
    type: 'image/svg+xml',
  });
  files.set('/NailSalonGame/manifest.webmanifest', {
    body: await readFile(resolve('dist/manifest.webmanifest')),
    type: 'application/manifest+json',
  });
  for (const name of await readdir(resolve('dist/icons')))
    files.set(`/NailSalonGame/icons/${name}`, {
      body: await readFile(resolve('dist/icons', name)),
      type: 'image/png',
    });
  for (const name of await readdir(resolve('dist/assets')))
    files.set(`/NailSalonGame/assets/${name}`, {
      body: await readFile(resolve('dist/assets', name)),
      type: name.endsWith('.js') ? 'text/javascript' : 'text/css',
    });
  files.set('/arcade', {
    body: Buffer.from(
      '<!doctype html><html lang="en"><head><title>Arcade</title></head><body><iframe src="/NailSalonGame/" title="Nail Salon" style="width:100%;height:90vh;border:0"></iframe></body></html>',
    ),
    type: 'text/html',
  });
  server = createServer((request, response) => {
    const file = files.get(new URL(request.url ?? '/', 'http://localhost').pathname);
    if (!file) {
      response.writeHead(404).end();
      return;
    }
    response.writeHead(200, { 'Content-Type': file.type });
    response.end(file.body);
  });
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Production preview did not start');
  origin = `http://127.0.0.1:${address.port}`;
});
test.afterAll(async () => {
  if (server) await new Promise<void>((r) => server.close(() => r()));
});
test('production assets load under a repository subdirectory without external requests', async ({
  page,
}) => {
  const errors: string[] = [],
    external: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (r) => {
    if (!r.url().startsWith(origin) && !r.url().startsWith('blob:')) external.push(r.url());
  });
  await page.goto(`${origin}/NailSalonGame/`);
  await page.getByRole('button', { name: 'Let’s create!' }).click();
  await skipPreparation(page);
  await page.getByRole('button', { name: 'Color all five', exact: true }).click();
  await page.getByRole('button', { name: 'All done!' }).click();
  await expect(page.getByRole('heading', { name: 'Look what you made!' })).toBeVisible();
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});
test('production game loads inside an arcade iframe', async ({ page }) => {
  await page.goto(`${origin}/arcade`);
  const game = page.frameLocator('iframe');
  await game.getByRole('button', { name: 'Let’s create!' }).click();
  await expect(game.getByRole('button', { name: 'All done!' })).toBeVisible();
});

test('installed app metadata and icons resolve within the Pages subdirectory', async ({
  page,
  browserName,
}) => {
  await page.goto(`${origin}/NailSalonGame/`);
  const manifestUrl = await page
    .locator('link[rel="manifest"]')
    .evaluate((link) => (link as HTMLLinkElement).href);
  const response = await page.request.get(manifestUrl);
  expect(response.ok()).toBe(true);
  const manifest = await response.json();
  expect(manifest.display).toBe('standalone');
  expect(manifest.name).toBe('Nail Salon');
  expect(manifest.prefer_related_applications).toBe(false);
  for (const key of ['start_url', 'scope', 'id'])
    expect(new URL(manifest[key], manifestUrl).href).toBe(`${origin}/NailSalonGame/`);
  expect(manifest.icons.map((icon: { sizes: string }) => icon.sizes)).toEqual([
    '192x192',
    '512x512',
    '512x512',
  ]);
  for (const icon of manifest.icons) {
    const url = new URL(icon.src, manifestUrl).href;
    expect(url.startsWith(`${origin}/NailSalonGame/icons/`)).toBe(true);
    const size = await page.evaluate(async (url) => {
      const image = new Image();
      image.src = url;
      await image.decode();
      return `${image.naturalWidth}x${image.naturalHeight}`;
    }, url);
    expect(size).toBe(icon.sizes);
  }
  await expect(page.locator('meta[name="apple-mobile-web-app-capable"]')).toHaveAttribute(
    'content',
    'yes',
  );
  const appleUrl = await page
    .locator('link[rel="apple-touch-icon"]')
    .evaluate((link) => (link as HTMLLinkElement).href);
  expect((await page.request.get(appleUrl)).ok()).toBe(true);
  if (browserName === 'chromium') {
    const session = await page.context().newCDPSession(page);
    const parsed = await session.send('Page.getAppManifest');
    expect(parsed.errors).toEqual([]);
    expect(parsed.url).toBe(manifestUrl);
    await session.detach();
  }
});
