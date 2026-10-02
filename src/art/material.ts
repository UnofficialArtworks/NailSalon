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

// Reusable scratch surface: restore matte polish after shine, keeping natural
// and erased nail areas identical to other finishes. No saved raster data.
let shineSurface: HTMLCanvasElement | undefined;
export function nailShine(
  ctx: CanvasRenderingContext2D,
  nail: Nail,
  width: number,
  height: number,
) {
  const matte = nail.finish === 'matte' && (nail.fillColorId || nail.strokes.some((s) => !s.erase));
  const surface = matte ? (shineSurface ??= document.createElement('canvas')) : null;
  if (surface) {
    surface.width = width;
    surface.height = height;
    const snapshot = surface.getContext('2d')!;
    snapshot.globalCompositeOperation = 'source-over';
    snapshot.drawImage(ctx.canvas, 0, 0);
  }
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
  if (!surface) return;
  // Rebuild the paint mask, including erasures, on another bounded scratch surface.
  const mask = (matteMask ??= document.createElement('canvas'));
  mask.width = width;
  mask.height = height;
  const mc = mask.getContext('2d')!;
  // Explicitly reset reused canvas state: an erased nail leaves destination-out
  // active, and WebKit may retain it when dimensions are assigned unchanged.
  mc.globalCompositeOperation = 'source-over';
  mc.fillStyle = '#fff';
  mc.strokeStyle = '#fff';
  mc.lineCap = mc.lineJoin = 'round';
  if (nail.fillColorId) mc.fillRect(0, 0, width, height);
  for (const stroke of nail.strokes) {
    mc.globalCompositeOperation = stroke.erase ? 'destination-out' : 'source-over';
    mc.lineWidth = stroke.width * width;
    mc.beginPath();
    stroke.points.forEach((p, i) =>
      i ? mc.lineTo(p.x * width, p.y * height) : mc.moveTo(p.x * width, p.y * height),
    );
    mc.stroke();
    if (stroke.points.length === 1) {
      const p = stroke.points[0];
      mc.beginPath();
      mc.arc(p.x * width, p.y * height, (stroke.width * width) / 2, 0, Math.PI * 2);
      mc.fill();
    }
  }
  const unshiny = surface.getContext('2d')!;
  unshiny.globalCompositeOperation = 'destination-in';
  unshiny.drawImage(mask, 0, 0);
  ctx.drawImage(surface, 0, 0, 1, 1);
}
let matteMask: HTMLCanvasElement | undefined;
