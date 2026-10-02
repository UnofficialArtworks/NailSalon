import type { Shape } from '../game/types';

export const FINGER_NAIL = { x: 45, y: 26, w: 150, h: 238 };

// Enlarge the nail's upper contour slightly, then continue it into the finger.
export function fingerPath(shape: Shape): string {
  const p = (x: number, y: number) => `${36 + x * 168} ${18 + y * 254}`;
  const stem = `M23 440Q30 310 ${p(0.08, 0.7)} `;
  const end = 'Q210 310 217 440Z';
  if (shape === 'oval') {
    return `M23 440Q30 310 ${p(0.08, 0.49)} A70.56 113.03 0 0 1 ${p(0.92, 0.49)} ${end}`;
  }
  if (shape === 'almond') {
    return `${stem}L${p(0.08, 0.72)} C${p(0.08, 0.42)} ${p(0.18, 0.15)} ${p(0.5, 0.025)} C${p(0.82, 0.15)} ${p(0.92, 0.42)} ${p(0.92, 0.72)} ${end}`;
  }
  if (shape === 'square' || shape === 'soft-square') {
    const r = shape === 'square' ? 0.045 : 0.15;
    return `${stem}L${p(0.08, 0.05 + r)} Q${p(0.08, 0.05)} ${p(0.08 + r, 0.05)} L${p(0.92 - r, 0.05)} Q${p(0.92, 0.05)} ${p(0.92, 0.05 + r)} L${p(0.92, 0.7)} ${end}`;
  }
  return `${stem}C${p(0.08, 0.18)} ${p(0.18, 0.045)} ${p(0.5, 0.045)} C${p(0.82, 0.045)} ${p(0.92, 0.18)} ${p(0.92, 0.7)} ${end}`;
}
