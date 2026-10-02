import { nailContour } from './contour';
import { colorOf, GEMS } from '../game/catalog';
import { iconLayers } from './icons';
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
  // Stroke width is measured against nail width. Use uniform scaling for the
  // brush so round taps and caps match the circular cursor on tall nails too.
  ctx.save();
  const aspect = width / height;
  ctx.scale(1, aspect);
  for (const s of nail.strokes) {
    ctx.strokeStyle = s.erase ? '#fff4e8' : colorOf(s.colorId);
    ctx.fillStyle = ctx.strokeStyle;
    ctx.lineWidth = s.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    s.points.forEach((p, i) =>
      i === 0 ? ctx.moveTo(p.x, p.y / aspect) : ctx.lineTo(p.x, p.y / aspect),
    );
    ctx.stroke();
    if (s.points.length === 1) {
      ctx.beginPath();
      ctx.arc(s.points[0].x, s.points[0].y / aspect, s.width / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
  if (nail.patternId) pattern(ctx, nail.patternId);
  for (const d of nail.decorations) drawDecoration(ctx, d, width / height);
  if (!nail.cleaned && !nail.baseColorId && nail.strokes.length === 0) {
    ctx.fillStyle = '#bc927966';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(0.25 + i * 0.1, 0.36 + (i % 2) * 0.2, 0.025, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const shine = ctx.createLinearGradient(0, 0, 1, 0);
  shine.addColorStop(0, '#43144e24');
  shine.addColorStop(0.24, '#ffffff18');
  shine.addColorStop(0.65, '#ffffff00');
  shine.addColorStop(1, '#43144e30');
  ctx.fillStyle = shine;
  ctx.fillRect(0, 0, 1, 1);
  ctx.fillStyle = '#ffffff85';
  ctx.beginPath();
  ctx.ellipse(0.23, 0.34, 0.027, 0.21, 0.04, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff45';
  ctx.beginPath();
  ctx.ellipse(0.76, 0.57, 0.018, 0.14, 0.04, 0, Math.PI * 2);
  ctx.fill();
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
// Same geometry is used for the on-screen hand and PNG exports.
// Lift along each finger's axis for a small free edge; exports share these boxes.
const HAND_NAIL_LIFTS = [11.4, 19.5, 19.7, 19.5, 18.6];
export const NAIL_BOXES = [
  { x: 354, y: 236, w: 43, h: 65, r: 24 },
  { x: 257, y: 100, w: 46, h: 72, r: 4 },
  { x: 183, y: 52, w: 47, h: 76, r: 0 },
  { x: 110, y: 95, w: 44, h: 70, r: -4 },
  { x: 43, y: 184, w: 37, h: 57, r: -10 },
].map(({ x, y, w, h, r }, i) => {
  const angle = (r * Math.PI) / 180;
  const lift = HAND_NAIL_LIFTS[i];
  return {
    x: x - w * 0.025 + Math.sin(angle) * lift,
    y: y - h * 0.025 - Math.cos(angle) * lift,
    w: w * 1.05,
    h: h * 1.05,
    r,
  };
});
export const HAND_PATH =
  'M104 550C106 505 78 465 70 421C64 389 58 355 53 320L33 216C28 188 38 172 56 170C75 168 88 183 92 207L110 325Q114 339 118 324L101 126C99 97 110 81 130 80C151 79 162 96 163 124L173 312Q175 328 179 312L177 82C177 53 188 37 207 37C228 37 240 54 240 82L242 312Q244 328 249 313L250 128C250 99 262 84 281 85C302 86 314 103 311 132L300 351Q300 368 311 352L343 264C353 237 369 224 388 231C408 238 412 257 402 283L369 380C359 417 340 449 325 478C316 497 316 524 318 550Z';
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
  ctx.translate(159, 140);
  ctx.scale(1.55, 1.55);
  ctx.fillStyle = m.skin;
  ctx.strokeStyle = '#6d483344';
  ctx.lineWidth = 2;
  ctx.fill(new Path2D(HAND_PATH));
  ctx.stroke(new Path2D(HAND_PATH));
  m.nails.forEach((n, i) => {
    const b = NAIL_BOXES[i];
    const tile = document.createElement('canvas');
    tile.width = 240;
    tile.height = Math.round((240 * b.h) / b.w);
    renderNail(tile.getContext('2d')!, n, tile.width, tile.height);
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
