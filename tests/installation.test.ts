import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('installed application identity', () => {
  const manifest = JSON.parse(readFileSync('public/manifest.webmanifest', 'utf8'));
  const origin = 'https://unofficialartworks.github.io';

  it('identifies Nail Salon separately from other games on the Pages origin', () => {
    // Unlike start_url and scope, id resolves against the start URL's origin.
    const start = new URL(manifest.start_url, `${origin}/NailSalon/manifest.webmanifest`);
    const identity = new URL(manifest.id, start.origin).href;
    expect(identity).toBe(`${origin}/NailSalon/`);
    expect(identity).not.toBe(new URL('./', start.origin).href);
    expect(identity).not.toBe(`${origin}/AquariumGame/`);
  });

  it('keeps launch, scope and icons relative when the game is embedded elsewhere', () => {
    const manifestUrl = `${origin}/arcade/nails/manifest.webmanifest`;
    expect(new URL(manifest.start_url, manifestUrl).href).toBe(`${origin}/arcade/nails/`);
    expect(new URL(manifest.scope, manifestUrl).href).toBe(`${origin}/arcade/nails/`);
    for (const icon of manifest.icons)
      expect(new URL(icon.src, manifestUrl).href).toMatch(`${origin}/arcade/nails/icons/`);
  });
});
