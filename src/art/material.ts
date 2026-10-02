import type { Finish } from '../game/types';

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
): string | CanvasGradient | CanvasPattern {
  if (finish === 'pearl') {
    const gradient = ctx.createLinearGradient(0, 0, 1, 0.25);
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
  pattern.setTransform(new DOMMatrix().scale(0.25 / 128));
  return pattern;
}
