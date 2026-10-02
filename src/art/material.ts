import type { Finish, Nail } from '../game/types';

const glitterTiles = new Map<string, HTMLCanvasElement>();
function blend(color: string, tint: string, amount: number): string {
  const channels = [1, 3, 5].map((i) =>
    Math.round(
      parseInt(color.slice(i, i + 2), 16) * (1 - amount) +
        parseInt(tint.slice(i, i + 2), 16) * amount,
    ),
  );
  return `rgb(${channels.join(',')})`;
}

// A paint style is used for fills AND strokes, so natural/erased regions never
// gain glitter. Tiles repeat in nail-width units, independent of export size.
export function polishPaint(
  ctx: CanvasRenderingContext2D,
  color: string,
  finish: Finish = 'glossy',
  nailWidth = 1,
): string | CanvasGradient | CanvasPattern {
  if (finish === 'metallic') {
    const gradient = ctx.createLinearGradient(0, 0, nailWidth, 0);
    for (const [at, tint, amount] of [
      [0, '#191d38', 0.5],
      [0.18, '#ffffff', 0.22],
      [0.36, '#ffffff', 0.85],
      [0.46, '#ffffff', 0.3],
      [0.64, '#191d38', 0.45],
      [0.82, '#ffffff', 0.55],
      [1, '#191d38', 0.4],
    ] as const)
      gradient.addColorStop(at, blend(color, tint, amount));
    return gradient;
  }
  if (finish === 'pearl') {
    const gradient = ctx.createLinearGradient(0, 0, nailWidth, 0.25 * nailWidth);
    gradient.addColorStop(0, blend(color, '#77edff', 0.25));
    gradient.addColorStop(0.3, blend(color, '#ffffff', 0.5));
    gradient.addColorStop(0.52, blend(color, '#ebb4ff', 0.35));
    gradient.addColorStop(0.75, blend(color, '#fff2a8', 0.3));
    gradient.addColorStop(1, blend(color, '#a7ffff', 0.25));
    return gradient;
  }
  if (finish !== 'glitter') return color;
  let tile = glitterTiles.get(color);
  if (!tile) {
    tile = document.createElement('canvas');
    tile.width = tile.height = 128;
    const brush = tile.getContext('2d')!;
    brush.fillStyle = color;
    brush.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 18; i++) {
      const x = (i * 73 + 19) % 128,
        y = (i * 47 + 31) % 128;
      brush.fillStyle = i % 3 === 0 ? '#fff5b9cc' : '#ffffffbb';
      brush.beginPath();
      brush.arc(x, y, i % 7 === 0 ? 3.5 : 1.4, 0, Math.PI * 2);
      brush.fill();
      if (i % 7 === 0) {
        brush.fillRect(x - 6, y - 0.7, 12, 1.4);
        brush.fillRect(x - 0.7, y - 6, 1.4, 12);
      }
    }
    glitterTiles.set(color, tile);
  }
  const pattern = ctx.createPattern(tile, 'repeat')!;
  pattern.setTransform(new DOMMatrix().scale((0.25 * nailWidth) / 128));
  return pattern;
}

// Restore matte polish after shine, keeping natural
// and erased nail areas identical to other finishes. No saved raster data.
export function nailShine(
  ctx: CanvasRenderingContext2D,
  nail: Nail,
  width: number,
  height: number,
) {
  const matte = nail.finish === 'matte' && (nail.fillColorId || nail.strokes.some((s) => !s.erase));
  // A fully painted matte nail needs no gloss pass or scratch surface.
  if (matte && nail.fillColorId && !nail.strokes.some((s) => s.erase)) return;
  const before = matte ? ctx.getImageData(0, 0, width, height) : null;
  const shineCtx = ctx;
  const shine = shineCtx.createLinearGradient(0, 0, 1, 0);
  shine.addColorStop(0, '#43144e24');
  shine.addColorStop(0.24, '#ffffff18');
  shine.addColorStop(0.65, '#ffffff00');
  shine.addColorStop(1, '#43144e30');
  shineCtx.fillStyle = shine;
  shineCtx.fillRect(0, 0, 1, 1);
  for (const [x, y, rx, ry, opacity] of [
    [0.23, 0.34, 0.027, 0.21, '#ffffff85'],
    [0.76, 0.57, 0.018, 0.14, '#ffffff45'],
  ] as const) {
    shineCtx.fillStyle = opacity;
    shineCtx.beginPath();
    shineCtx.ellipse(x, y, rx, ry, 0.04, 0, Math.PI * 2);
    shineCtx.fill();
  }
  if (!before) return;
  // Rebuild the paint mask, including erasures, on a reusable bounded surface.
  const mask = (matteMask ??= document.createElement('canvas'));
  mask.width = width;
  mask.height = height;
  const mc = mask.getContext('2d')!;
  mc.globalCompositeOperation = 'source-over';
  // Store coverage as opaque grayscale; avoid platform-specific alpha
  // compositing when erasing a previously full coverage mask.
  mc.fillStyle = nail.fillColorId ? '#fff' : '#000';
  mc.fillRect(0, 0, width, height);
  mc.fillStyle = '#fff';
  mc.strokeStyle = '#fff';
  mc.lineCap = mc.lineJoin = 'round';
  for (const stroke of nail.strokes) {
    mc.fillStyle = mc.strokeStyle = stroke.erase ? '#000' : '#fff';
    mc.lineWidth = stroke.width * width;
    mc.beginPath();
    stroke.points.forEach((p, i) =>
      i ? mc.lineTo(p.x * width, p.y * height) : mc.moveTo(p.x * width, p.y * height),
    );
    if (stroke.points.length > 1) mc.stroke();
    else if (stroke.points.length === 1) {
      const p = stroke.points[0];
      mc.beginPath();
      mc.arc(p.x * width, p.y * height, (stroke.width * width) / 2, 0, Math.PI * 2);
      mc.fill();
    }
  }
  // Blend actual pixels instead of scaling a composited canvas back into nail
  // coordinates. This preserves bare pixels exactly across WebKit platforms.
  const coverage = mc.getImageData(0, 0, width, height).data;
  const after = ctx.getImageData(0, 0, width, height);
  if (import.meta.env.DEV && nail.fillColorId) {
    const center = (Math.floor(height / 2) * width + Math.floor(width / 2)) * 4;
    console.debug(
      'Matte snapshot:',
      JSON.stringify({
        before: [...before.data.slice(center, center + 4)],
        after: [...after.data.slice(center, center + 4)],
        mask: [...coverage.slice(center, center + 4)],
      }),
    );
  }
  for (let i = 0; i < coverage.length; i += 4) {
    const amount = coverage[i] / 255;
    if (!amount) continue;
    for (let channel = 0; channel < 4; channel++)
      after.data[i + channel] = Math.round(
        before.data[i + channel] * amount + after.data[i + channel] * (1 - amount),
      );
  }
  ctx.putImageData(after, 0, 0);
  if (import.meta.env.DEV && nail.fillColorId) {
    console.debug(
      'Matte result:',
      JSON.stringify([
        ...ctx.getImageData(Math.floor(width / 2), Math.floor(height / 2), 1, 1).data,
      ]),
    );
  }
}
let matteMask: HTMLCanvasElement | undefined;
