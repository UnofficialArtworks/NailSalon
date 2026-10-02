import type { Nail } from './types';
import { uid } from './rules';

export const COLLECTIONS = [
  {
    id: 'all',
    name: 'All supplies',
    icon: 'sticker-6',
    colors: [],
    stickers: [],
    patterns: [],
    gems: [],
  },
  {
    id: 'candy',
    name: 'Candy Pop',
    icon: 'sticker-8',
    colors: [0, 1, 2, 8, 9, 13, 18, 32],
    stickers: [0, 1, 7, 8, 9, 11, 24, 28],
    patterns: [0, 2, 8],
    gems: [0, 1, 4, 6, 11],
  },
  {
    id: 'ocean',
    name: 'Ocean Sparkle',
    icon: 'sticker-21',
    colors: [4, 5, 6, 11, 12, 17, 24, 25],
    stickers: [1, 4, 5, 6, 13, 16, 19, 21],
    patterns: [1, 3, 5, 9],
    gems: [2, 3, 4, 7, 9],
  },
  {
    id: 'garden',
    name: 'Garden Party',
    icon: 'sticker-2',
    colors: [0, 2, 3, 4, 7, 14, 16, 17, 23],
    stickers: [2, 3, 5, 8, 14, 15, 22, 26, 27, 29],
    patterns: [0, 2, 7],
    gems: [0, 1, 4, 5, 8],
  },
  {
    id: 'rainbow',
    name: 'Rainbow Dreams',
    icon: 'sticker-32',
    colors: [0, 1, 3, 4, 5, 6, 8, 10, 18, 22, 26],
    stickers: [0, 1, 3, 6, 13, 19, 30, 31, 32, 33, 34, 35],
    patterns: [0, 3, 8, 9],
    gems: [0, 1, 2, 3, 9, 10],
  },
] as const;

export function copyNailArt(
  nails: Nail[],
  source: number,
  targets: number[],
  mode: 'color' | 'design',
): Nail[] {
  const from = nails[source];
  return nails.map((nail, i) => {
    if (i === source || !targets.includes(i)) return nail;
    if (mode === 'color') {
      const color = from.fillColorId ?? from.baseColorId;
      return { ...nail, cleaned: true, baseColorId: color, fillColorId: color };
    }
    return {
      ...structuredClone(from),
      shape: nail.shape,
      length: nail.length,
      decorations: from.decorations.map((d) => ({ ...d, id: uid() })),
    };
  });
}

export function duplicateItem(nail: Nail, selected: string): Nail {
  const item = nail.decorations.find((d) => d.id === selected);
  if (!item || nail.decorations.length >= 100) return nail;
  return {
    ...nail,
    decorations: [
      ...nail.decorations,
      {
        ...item,
        id: uid(),
        x: Math.min(0.85, item.x + 0.06),
        y: Math.min(0.85, item.y + 0.04),
      },
    ],
  };
}

export function reorderItem(nail: Nail, selected: string, direction: 'front' | 'back'): Nail {
  const index = nail.decorations.findIndex((d) => d.id === selected);
  if (index < 0) return nail;
  const decorations = [...nail.decorations];
  const [item] = decorations.splice(index, 1);
  if (direction === 'front') decorations.push(item);
  else decorations.unshift(item);
  return { ...nail, decorations };
}
