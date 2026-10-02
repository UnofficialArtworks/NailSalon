import { backdropSvg, handSkinSvg, sceneSvg } from './photoScene';
import { photoSettings } from '../game/photo';
import { NAIL_BOXES } from './handGeometry';
export { HAND_PATH, NAIL_BOXES } from './handGeometry';
import { nailContour } from './contour';
import { colorOf, GEMS } from '../game/catalog';
import { iconLayers } from './icons';
import { lengthBox } from './length';
import { polishPaint, nailShine } from './material';
import { nailContext } from './context';
import { DIRT_SPOTS } from '../game/preparation';
import type { Nail, Shape, Manicure, Decoration } from '../game/types';
export function nailPath(shape: Shape): Path2D {
  const { start, upper, lower } = nailContour(shape);
  return new Path2D('M' + start + ' ' + upper + ' ' + lower + 'Z');
}
export function drawIcon(
  ctx: CanvasRenderingContext2D,
  id: string,
  x: number,
  y: number,
  size: number,
  tint?: string,
) {
  ctx.save();
  ctx.translate(x - size / 2, y - size / 2);
  ctx.scale(size / 64, size / 64);
  for (const layer of iconLayers(id)) {
    const path = new Path2D(layer.path);
    if (layer.fill !== 'none') {
      ctx.fillStyle = tint ?? layer.fill;
      ctx.fill(path);
    }
    if (layer.stroke) {
      ctx.strokeStyle = layer.stroke;
      ctx.lineWidth = layer.strokeWidth ?? 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke(path);
    }
  }
  ctx.restore();
}
export function drawDecoration(ctx: CanvasRenderingContext2D, d: Decoration, aspect = 1) {
  ctx.save();
  ctx.translate(d.x, d.y);
  ctx.scale(1, aspect);
  ctx.rotate((d.rotation * Math.PI) / 180);
  if (d.kind === 'sticker') drawIcon(ctx, d.supplyId, 0, 0, d.size);
  else {
    const color = GEMS.find((g) => g.id === d.supplyId)?.color ?? '#f4c7d7';
    const r = d.size / 2;
    const kind = Number(d.supplyId.split('-')[1]) % 6;
    ctx.fillStyle = color;
    ctx.beginPath();
    if (kind === 4 || kind === 2) {
      ctx.ellipse(0, 0, kind === 2 ? r * 0.72 : r, r, 0, 0, Math.PI * 2);
    } else if (kind === 3) {
      ctx.moveTo(0, r);
      ctx.bezierCurveTo(-r * 2, -r * 0.2, -r * 0.8, -r * 1.7, 0, -r * 0.5);
      ctx.bezierCurveTo(r * 0.8, -r * 1.7, r * 2, -r * 0.2, 0, r);
    } else if (kind === 5) {
      ctx.moveTo(0, -r);
      ctx.bezierCurveTo(r * 1.7, r * 0.7, r * 0.7, r * 1.4, 0, r);
      ctx.bezierCurveTo(-r * 0.7, r * 1.4, -r * 1.7, r * 0.7, 0, -r);
    } else if (kind === 0) {
      ctx.moveTo(0, -r);
      ctx.lineTo(r, 0);
      ctx.lineTo(0, r);
      ctx.lineTo(-r, 0);
    } else {
      ctx.moveTo(0, -r);
      ctx.lineTo(r * 0.8, -r * 0.4);
      ctx.lineTo(r * 0.8, r * 0.45);
      ctx.lineTo(0, r);
      ctx.lineTo(-r * 0.8, r * 0.45);
      ctx.lineTo(-r * 0.8, -r * 0.4);
    }
    ctx.closePath();
    ctx.fill();
    ctx.save();
    ctx.clip();
    ctx.strokeStyle = '#ffffffaa';
    ctx.lineWidth = 0.012;
    ctx.stroke();
    ctx.fillStyle = '#ffffff80';
    ctx.beginPath();
    ctx.moveTo(-r * 0.8, -r * 0.4);
    ctx.lineTo(0, -r);
    ctx.lineTo(r * 0.4, 0);
    ctx.lineTo(-r * 0.3, r * 0.3);
    ctx.closePath();
    ctx.fill();
    const shine = ctx.createRadialGradient(-r * 0.35, -r * 0.35, 0, 0, 0, r);
    shine.addColorStop(0, '#ffffffc0');
    shine.addColorStop(0.4, '#ffffff18');
    shine.addColorStop(1, '#39245e50');
    ctx.fillStyle = shine;
    ctx.fillRect(-r, -r, r * 2, r * 2);
    ctx.restore();
  }
  ctx.restore();
}
function pattern(ctx: CanvasRenderingContext2D, id: string, colorId?: string | null) {
  const kind = Number(id.split('-')[1]);
  ctx.fillStyle = colorId ? colorOf(colorId) : '#ffffffbb';
  ctx.strokeStyle = ctx.fillStyle;
  ctx.lineWidth = 0.025;
  if (kind === 4) {
    ctx.fillRect(0, 0, 1, 0.2);
    return;
  }
  if (kind === 1 || kind === 5) {
    for (let y = -0.5; y < 1.5; y += 0.18) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      if (kind === 1) ctx.lineTo(1, y + 0.6);
      else ctx.bezierCurveTo(0.3, y - 0.15, 0.6, y + 0.15, 1, y);
      ctx.stroke();
    }
    return;
  }
  if (kind === 6) {
    for (let y = 0; y < 1; y += 0.14)
      for (let x = 0; x < 1; x += 0.14)
        if ((Math.round(x / 0.14) + Math.round(y / 0.14)) % 2 === 0) ctx.fillRect(x, y, 0.14, 0.14);
    return;
  }
  for (let row = 0; row < 7; row++)
    for (let col = 0; col < 5; col++) {
      const x = 0.12 + col * 0.19 + (row % 2) * 0.06,
        y = 0.12 + row * 0.13;
      if (kind === 2 || kind === 7 || kind === 9)
        drawIcon(
          ctx,
          kind === 2 ? 'heart' : kind === 7 ? 'sticker-2' : 'star',
          x,
          y,
          0.075,
          colorId ? colorOf(colorId) : undefined,
        );
      else if (kind === 8) {
        ctx.fillStyle = colorId
          ? colorOf(colorId)
          : ['#ffe784', '#ffc5d8', '#c5ecdd'][(row + col) % 3];
        ctx.fillRect(x, y, 0.035, 0.065);
      } else {
        ctx.beginPath();
        ctx.arc(x, y, kind === 3 ? 0.009 : 0.025, 0, Math.PI * 2);
        ctx.fill();
      }
    }
}
export function renderNail(
  ctx: CanvasRenderingContext2D,
  nail: Nail,
  width: number,
  height: number,
  selected: string | null = null,
) {
  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.scale(width, height);
  const outline = nailPath(nail.shape);
  ctx.save();
  ctx.clip(outline);
  ctx.fillStyle = '#fff4e8';
  ctx.fillRect(0, 0, 1, 1);
  // Draw polish in physical canvas pixels. Native round caps remain circular
  // without depending on the browser's handling of transformed stroke paths.
  // Fill and brush materials share this space to align their textures.
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const paints = new Map<string, string | CanvasGradient | CanvasPattern>();
  if (nail.fillColorId) {
    const paint = polishPaint(ctx, colorOf(nail.fillColorId), nail.finish, width);
    paints.set(nail.fillColorId, paint);
    ctx.fillStyle = paint;
    ctx.fillRect(0, 0, width, height);
  }
  for (const s of nail.strokes) {
    let paint = paints.get(s.colorId);
    if (!s.erase && !paint) {
      paint = polishPaint(ctx, colorOf(s.colorId), nail.finish, width);
      paints.set(s.colorId, paint);
    }
    ctx.strokeStyle = s.erase ? '#fff4e8' : paint!;
    ctx.fillStyle = ctx.strokeStyle;
    ctx.lineWidth = s.width * width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    s.points.forEach((p, i) =>
      i === 0 ? ctx.moveTo(p.x * width, p.y * height) : ctx.lineTo(p.x * width, p.y * height),
    );
    if (s.points.length > 1) ctx.stroke();
    else if (s.points.length === 1) {
      ctx.beginPath();
      ctx.arc(s.points[0].x * width, s.points[0].y * height, (s.width * width) / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
  if (nail.patternId) pattern(ctx, nail.patternId, nail.patternColorId);
  for (const d of nail.decorations) drawDecoration(ctx, d, width / height);
  if (!nail.cleaned && !nail.baseColorId && nail.strokes.length === 0) {
    for (const [i, spot] of DIRT_SPOTS.entries()) {
      if ((nail.washed ?? 0) & (1 << i)) continue;
      ctx.fillStyle = '#b48b6a88';
      ctx.beginPath();
      ctx.ellipse(spot.x, spot.y, 0.046, (0.046 * width) / height, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff2dd88';
      ctx.beginPath();
      ctx.ellipse(
        spot.x - 0.01,
        spot.y - 0.006,
        0.012,
        (0.012 * width) / height,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }
  nailShine(ctx, nail, width, height);
  ctx.restore();
  ctx.strokeStyle = '#6b464432';
  ctx.lineWidth = 0.012;
  ctx.stroke(outline);
  const d = nail.decorations.find((d) => d.id === selected);
  if (d) {
    ctx.save();
    ctx.translate(d.x, d.y);
    ctx.scale(1, width / height);
    ctx.rotate((d.rotation * Math.PI) / 180);
    ctx.strokeStyle = '#60415e';
    ctx.lineWidth = 0.008;
    ctx.setLineDash([0.025, 0.018]);
    ctx.strokeRect(-d.size / 2 - 0.015, -d.size / 2 - 0.015, d.size + 0.03, d.size + 0.03);
    ctx.restore();
  }
  ctx.restore();
}
export async function exportManicure(m: Manicure): Promise<Blob> {
  const c = document.createElement('canvas');
  c.width = 880;
  c.height = 1100;
  const ctx = c.getContext('2d')!;
  const svg = sceneSvg(backdropSvg(photoSettings(m)) + handSkinSvg(m, 'photo'));
  const image = new Image();
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  try {
    image.src = url;
    await image.decode();
    ctx.drawImage(image, 0, 0, c.width, c.height);
  } finally {
    URL.revokeObjectURL(url);
  }
  ctx.save();
  ctx.scale(2, 2);
  m.nails.forEach((n, i) => {
    const b = lengthBox(NAIL_BOXES[i], n.length);
    const tile = document.createElement('canvas');
    tile.width = 240;
    tile.height = Math.round((240 * b.h) / b.w);
    renderNail(nailContext(tile), n, tile.width, tile.height);
    ctx.save();
    ctx.translate(b.x + b.w / 2, b.y + b.h / 2);
    ctx.rotate((b.r * Math.PI) / 180);
    ctx.drawImage(tile, -b.w / 2, -b.h / 2, b.w, b.h);
    ctx.restore();
  });
  ctx.restore();
  return new Promise((resolve, reject) =>
    c.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Picture could not be created.'))),
      'image/png',
    ),
  );
}
