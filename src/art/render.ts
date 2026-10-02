import { colorOf, GEMS } from '../game/catalog';
import { iconLayers } from './icons';
import type { Nail, Shape, Manicure, Decoration } from '../game/types';
export function nailPath(shape: Shape): Path2D {
  const p = new Path2D();
  if (shape === 'oval') {
    p.ellipse(0.5, 0.49, 0.42, 0.445, 0, 0, Math.PI * 2);
  } else if (shape === 'almond') {
    p.moveTo(0.5, 0.025);
    p.bezierCurveTo(0.82, 0.15, 0.92, 0.42, 0.92, 0.72);
    p.bezierCurveTo(0.92, 0.99, 0.08, 0.99, 0.08, 0.72);
    p.bezierCurveTo(0.08, 0.42, 0.18, 0.15, 0.5, 0.025);
  } else if (shape === 'square' || shape === 'soft-square') {
    p.roundRect(0.08, 0.05, 0.84, 0.88, shape === 'square' ? 0.045 : 0.15);
  } else {
    p.moveTo(0.08, 0.7);
    p.bezierCurveTo(0.08, 0.18, 0.18, 0.045, 0.5, 0.045);
    p.bezierCurveTo(0.82, 0.045, 0.92, 0.18, 0.92, 0.7);
    p.bezierCurveTo(0.92, 1, 0.08, 1, 0.08, 0.7);
  }
  p.closePath();
  return p;
}
export function drawIcon(
  ctx: CanvasRenderingContext2D,
  id: string,
  x: number,
  y: number,
  size: number,
) {
  ctx.save();
  ctx.translate(x - size / 2, y - size / 2);
  ctx.scale(size / 64, size / 64);
  for (const layer of iconLayers(id)) {
    const path = new Path2D(layer.path);
    if (layer.fill !== 'none') {
      ctx.fillStyle = layer.fill;
      ctx.fill(path);
    }
    if (layer.stroke) {
      ctx.strokeStyle = layer.stroke;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke(path);
    }
  }
  ctx.restore();
}
export function drawDecoration(ctx: CanvasRenderingContext2D, d: Decoration) {
  ctx.save();
  ctx.translate(d.x, d.y);
  ctx.rotate((d.rotation * Math.PI) / 180);
  if (d.kind === 'sticker') drawIcon(ctx, d.supplyId, 0, 0, d.size);
  else {
    const color = GEMS.find((g) => g.id === d.supplyId)?.color ?? '#f4c7d7';
    const r = d.size / 2;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(r * 0.8, -r * 0.4);
    ctx.lineTo(r * 0.8, r * 0.45);
    ctx.lineTo(0, r);
    ctx.lineTo(-r * 0.8, r * 0.45);
    ctx.lineTo(-r * 0.8, -r * 0.4);
    ctx.closePath();
    ctx.fill();
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
  }
  ctx.restore();
}
function pattern(ctx: CanvasRenderingContext2D, id: string) {
  const kind = Number(id.split('-')[1]);
  ctx.fillStyle = '#ffffffbb';
  ctx.strokeStyle = '#ffffffbb';
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
        drawIcon(ctx, kind === 2 ? 'heart' : kind === 7 ? 'sticker-2' : 'star', x, y, 0.075);
      else if (kind === 8) {
        ctx.fillStyle = ['#ffe784', '#ffc5d8', '#c5ecdd'][(row + col) % 3];
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
  // Erasing restores the natural nail within the clipped artwork layer.
  if (nail.fillColorId) {
    ctx.fillStyle = colorOf(nail.fillColorId);
    ctx.fillRect(0, 0, 1, 1);
  }
  for (const s of nail.strokes) {
    ctx.strokeStyle = s.erase ? '#fff4e8' : colorOf(s.colorId);
    ctx.fillStyle = ctx.strokeStyle;
    ctx.lineWidth = s.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    s.points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.stroke();
    if (s.points.length === 1) {
      ctx.beginPath();
      ctx.arc(s.points[0].x, s.points[0].y, s.width / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (nail.patternId) pattern(ctx, nail.patternId);
  for (const d of nail.decorations) drawDecoration(ctx, d);
  if (!nail.cleaned && !nail.baseColorId && nail.strokes.length === 0) {
    ctx.fillStyle = '#bc927966';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(0.25 + i * 0.1, 0.36 + (i % 2) * 0.2, 0.025, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.fillStyle = '#ffffff40';
  ctx.beginPath();
  ctx.ellipse(0.24, 0.33, 0.025, 0.16, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = '#6b464432';
  ctx.lineWidth = 0.012;
  ctx.stroke(outline);
  const d = nail.decorations.find((d) => d.id === selected);
  if (d) {
    ctx.strokeStyle = '#60415e';
    ctx.lineWidth = 0.008;
    ctx.setLineDash([0.025, 0.018]);
    ctx.strokeRect(
      d.x - d.size / 2 - 0.015,
      d.y - d.size / 2 - 0.015,
      d.size + 0.03,
      d.size + 0.03,
    );
  }
  ctx.restore();
}
// Same geometry is used for the on-screen hand and PNG exports.
export const NAIL_BOXES = [
  { x: 41, y: 249, w: 60, h: 79, r: -35 },
  { x: 126, y: 104, w: 52, h: 73, r: -7 },
  { x: 204, y: 62, w: 54, h: 78, r: 0 },
  { x: 282, y: 101, w: 52, h: 73, r: 7 },
  { x: 354, y: 173, w: 46, h: 66, r: 13 },
];
export const HAND_PATH =
  'M157 535C159 488 132 437 111 410L48 333C23 307 21 282 39 269C58 250 77 262 98 288L124 314L115 145C113 113 127 94 146 96C167 97 177 113 177 142L181 274L183 100C183 64 195 47 219 47C244 47 254 65 254 99L254 274L263 140C265 109 279 92 300 97C321 102 327 119 324 151L317 293L334 212C340 182 352 164 373 169C394 174 402 192 396 222L375 362C370 412 342 452 334 485L331 535Z';
export async function exportManicure(m: Manicure): Promise<Blob> {
  const c = document.createElement('canvas');
  c.width = 1000;
  c.height = 1100;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#fff5ed';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle = '#70415a';
  ctx.font = 'bold 54px Georgia';
  ctx.textAlign = 'center';
  ctx.fillText('Nail Salon', 500, 86);
  ctx.font = '24px sans-serif';
  ctx.fillStyle = '#957688';
  ctx.fillText('Made with a little imagination', 500, 126);
  ctx.save();
  ctx.translate(72, 140);
  ctx.scale(2, 1.65);
  ctx.fillStyle = m.skin;
  ctx.strokeStyle = '#6d483344';
  ctx.lineWidth = 2;
  ctx.fill(new Path2D(HAND_PATH));
  ctx.stroke(new Path2D(HAND_PATH));
  m.nails.forEach((n, i) => {
    const b = NAIL_BOXES[i];
    const tile = document.createElement('canvas');
    tile.width = 240;
    tile.height = 320;
    renderNail(tile.getContext('2d')!, n, 240, 320);
    ctx.save();
    ctx.translate(b.x + b.w / 2, b.y + b.h / 2);
    ctx.rotate((b.r * Math.PI) / 180);
    ctx.drawImage(tile, -b.w / 2, -b.h / 2, b.w, b.h);
    ctx.restore();
  });
  ctx.restore();
  ctx.fillStyle = '#b18a9e';
  ctx.font = '22px sans-serif';
  ctx.fillText('Your own tiny masterpiece ♡', 500, 1050);
  return new Promise((resolve, reject) =>
    c.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Picture could not be created.'))),
      'image/png',
    ),
  );
}
