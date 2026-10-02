import type { Nail, Point } from './types';

// Stable normalized spots keep partial washing aligned through resizing and saves.
export const DIRT_SPOTS: readonly Point[] = [
  { x: 0.3, y: 0.3 },
  { x: 0.5, y: 0.27 },
  { x: 0.7, y: 0.32 },
  { x: 0.27, y: 0.49 },
  { x: 0.5, y: 0.5 },
  { x: 0.73, y: 0.48 },
  { x: 0.32, y: 0.69 },
  { x: 0.5, y: 0.73 },
  { x: 0.68, y: 0.68 },
];
export const ALL_WASHED = (1 << DIRT_SPOTS.length) - 1;
export const SPONGE_WIDTH = 0.46;
export const washedCount = (nail: Nail) =>
  nail.cleaned
    ? DIRT_SPOTS.length
    : DIRT_SPOTS.filter((_, i) => ((nail.washed ?? 0) & (1 << i)) !== 0).length;

/** Swept circular sponge in actual pixels, not stretched normalized coordinates. */
export function washNail(nail: Nail, from: Point, to: Point, aspect: number): Nail {
  if (nail.cleaned) return nail;
  const dx = to.x - from.x,
    dy = (to.y - from.y) * aspect;
  const distance = dx * dx + dy * dy;
  let washed = nail.washed ?? 0;
  DIRT_SPOTS.forEach((spot, i) => {
    const px = spot.x - from.x,
      py = (spot.y - from.y) * aspect;
    const t = distance ? Math.max(0, Math.min(1, (px * dx + py * dy) / distance)) : 0;
    if (Math.hypot(px - t * dx, py - t * dy) <= SPONGE_WIDTH / 2) washed |= 1 << i;
  });
  return washed === (nail.washed ?? 0) ? nail : { ...nail, washed, cleaned: washed === ALL_WASHED };
}
