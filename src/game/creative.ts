import type { Nail, Point, StencilId } from './types';

export const STENCILS: { id: StencilId; name: string }[] = [
  { id: 'heart', name: 'Heart' },
  { id: 'star', name: 'Star' },
  { id: 'flower', name: 'Flower' },
];
const outlines = Object.fromEntries(
  STENCILS.map(({ id }) => [
    id,
    Array.from({ length: id === 'star' ? 10 : 80 }, (_, i) => {
      const t = (i * Math.PI * 2) / (id === 'star' ? 10 : 80);
      if (id === 'heart')
        return {
          x: 0.5 + 0.018 * 16 * Math.sin(t) ** 3,
          y:
            0.49 -
            0.017 *
              (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)),
        };
      const r = id === 'star' ? (i % 2 ? 0.46 : 1) : 0.82 + 0.18 * Math.cos(5 * t);
      return { x: 0.5 + 0.3 * r * Math.sin(t), y: 0.5 - 0.22 * r * Math.cos(t) };
    }),
  ]),
) as Record<StencilId, Point[]>;

export function stencilPath(id: StencilId): string {
  return outlines[id].map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join(' ') + 'Z';
}
export function insideStencil(id: StencilId, p: Point): boolean {
  const points = outlines[id];
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const a = points[i],
      b = points[j];
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x)
      inside = !inside;
  }
  return inside;
}
export function fillStencil(nail: Nail, stencilId: StencilId, colorId: string): Nail {
  if (nail.strokes.length >= 500) return nail;
  const points = Array.from({ length: 18 }, (_, i) => ({
    x: i % 2 ? 1 : 0,
    y: 0.1 + Math.floor(i / 2) * 0.1,
  }));
  return {
    ...nail,
    cleaned: true,
    baseColorId: colorId,
    strokes: [...nail.strokes, { points, colorId, width: 0.5, erase: false, stencilId }],
  };
}
export function dipMarble(nail: Nail, base: string, accent: string, variant: number): Nail {
  return {
    ...nail,
    cleaned: true,
    baseColorId: base,
    fillColorId: base,
    marble: { colorId: accent, variant },
    strokes: [],
  };
}
