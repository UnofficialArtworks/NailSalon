import type { NailLength } from '../game/types';

// Extend above the bed. Compensate for rotated fingers so its lower edge stays fixed.
export function lengthBox<T extends { x: number; y: number; w: number; h: number; r?: number }>(
  box: T,
  length: NailLength = 'short',
): T {
  const extension = box.h * { short: 0, medium: 0.18, long: 0.36 }[length];
  const angle = ((box.r ?? 0) * Math.PI) / 180;
  return {
    ...box,
    x: box.x + (Math.sin(angle) * extension) / 2,
    y: box.y - ((1 + Math.cos(angle)) * extension) / 2,
    h: box.h + extension,
  };
}
