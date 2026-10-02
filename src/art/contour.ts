import type { Shape } from '../game/types';

// Normalized geometry shared by painting, exports, and the enlarged finger.
export function nailContour(shape: Shape, x = 0, y = 0, width = 1, height = 1) {
  const p = (px: number, py: number) => `${x + px * width} ${y + py * height}`;
  const arc = (rx: number, ry: number, px: number, py: number) =>
    `A${rx * width} ${ry * height} 0 0 1 ${p(px, py)}`;
  if (shape === 'oval')
    return {
      start: p(0.08, 0.49),
      upper: arc(0.42, 0.445, 0.92, 0.49),
      lower: arc(0.42, 0.445, 0.08, 0.49),
    };
  if (shape === 'almond')
    return {
      start: p(0.08, 0.72),
      upper: `C${p(0.08, 0.42)} ${p(0.18, 0.15)} ${p(0.5, 0.025)} C${p(0.82, 0.15)} ${p(0.92, 0.42)} ${p(0.92, 0.72)}`,
      lower: `C${p(0.92, 0.99)} ${p(0.08, 0.99)} ${p(0.08, 0.72)}`,
    };
  if (shape === 'square' || shape === 'soft-square') {
    const r = shape === 'square' ? 0.045 : 0.15;
    return {
      start: p(0.08, 0.7),
      upper: `L${p(0.08, 0.05 + r)} ${arc(r, r, 0.08 + r, 0.05)} L${p(0.92 - r, 0.05)} ${arc(r, r, 0.92, 0.05 + r)} L${p(0.92, 0.7)}`,
      lower: `L${p(0.92, 0.93 - r)} ${arc(r, r, 0.92 - r, 0.93)} L${p(0.08 + r, 0.93)} ${arc(r, r, 0.08, 0.93 - r)}`,
    };
  }
  return {
    start: p(0.08, 0.7),
    upper: `C${p(0.08, 0.18)} ${p(0.18, 0.045)} ${p(0.5, 0.045)} C${p(0.82, 0.045)} ${p(0.92, 0.18)} ${p(0.92, 0.7)}`,
    lower: `C${p(0.92, 1)} ${p(0.08, 1)} ${p(0.08, 0.7)}`,
  };
}
