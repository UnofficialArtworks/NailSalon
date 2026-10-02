import { COLORS, CUSTOMERS, SKINS, suppliesAt } from './catalog';
import type { Save, Manicure, Request, Wishes, Nail, Point, GalleryEntry } from './types';
export const uid = (): string =>
  crypto.randomUUID?.() ??
  Array.from(crypto.getRandomValues(new Uint8Array(16)), (n) =>
    n.toString(16).padStart(2, '0'),
  ).join('');
export function blankManicure(): Manicure {
  return {
    id: uid(),
    mode: 'free',
    skin: SKINS[0],
    nails: Array.from({ length: 5 }, () => ({
      shape: 'round',
      cleaned: false,
      baseColorId: null,
      fillColorId: null,
      strokes: [],
      patternId: null,
      decorations: [],
    })),
    request: null,
    rewarded: false,
  };
}
export function createSave(): Save {
  return {
    version: 1,
    stars: 0,
    served: 0,
    active: blankManicure(),
    gallery: [],
    room: { wall: 'wall-0', desk: 'desk-0', accessory: 'accessory-0' },
    settings: { music: true, effects: true, tutorialSeen: false },
  };
}
export function makeRequest(served: number, stars: number): Request {
  const kit = suppliesAt(stars);
  return {
    customerId: CUSTOMERS[served % 12].id,
    colorId: kit.colors[(served * 7) % kit.colors.length].id,
    stickerId: kit.stickers[(served * 3) % kit.stickers.length].id,
  };
}
export function startManicure(save: Save, mode: 'free' | 'customer'): Save {
  const active = blankManicure();
  active.mode = mode;
  if (mode === 'customer') {
    active.request = makeRequest(save.served, save.stars);
    active.skin = CUSTOMERS.find((c) => c.id === active.request?.customerId)!.skin;
  } else active.skin = save.active.skin;
  return { ...save, active };
}
export function hasManicureEdits(manicure: Manicure): boolean {
  return manicure.nails.some(
    (n) =>
      n.cleaned ||
      n.shape !== 'round' ||
      (n.length !== undefined && n.length !== 'short') ||
      (n.finish !== undefined && n.finish !== 'glossy') ||
      n.baseColorId !== null ||
      n.fillColorId !== null ||
      n.patternId !== null ||
      n.strokes.length > 0 ||
      n.decorations.length > 0,
  );
}
export function designIsSaved(manicure: Manicure, gallery: GalleryEntry[]): boolean {
  const entries = gallery.filter((entry) => entry.manicure.id === manicure.id);
  if (!entries.length) return false;
  const nails = JSON.stringify(manicure.nails);
  return entries.some(
    ({ manicure: saved }) => saved.skin === manicure.skin && JSON.stringify(saved.nails) === nails,
  );
}
export function scoreRequest(manicure: Manicure, request: Request): Wishes {
  const painted = manicure.nails.map(hasPolish);
  const complete = painted.every(Boolean);
  const color =
    manicure.nails.filter((n, i) => painted[i] && n.baseColorId === request.colorId).length >= 3;
  const sticker = manicure.nails.some((n) =>
    n.decorations.some((d) => d.kind === 'sticker' && d.supplyId === request.stickerId),
  );
  return { complete, color, sticker, stars: complete ? 1 + Number(color) + Number(sticker) : 0 };
}
function distanceToSegment(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x,
    dy = b.y - a.y,
    length = dx * dx + dy * dy;
  const t =
    length === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / length));
  return Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy);
}
// Sample the polish layer after erasing, rather than rewarding invisible paint history.
export function hasPolish(nail: Nail): boolean {
  const candidates: Point[] = [];
  for (let x = 0.2; x <= 0.8; x += 0.1)
    for (let y = 0.25; y <= 0.85; y += 0.1) candidates.push({ x, y });
  for (const s of nail.strokes)
    if (!s.erase)
      candidates.push(
        ...s.points.filter((p) => p.x >= 0.12 && p.x <= 0.88 && p.y >= 0.15 && p.y <= 0.9),
      );
  return candidates.some((p) => {
    for (let i = nail.strokes.length - 1; i >= 0; i--) {
      const s = nail.strokes[i];
      if (s.points.some((a, j) => distanceToSegment(p, a, s.points[j + 1] ?? a) <= s.width / 2))
        return !s.erase;
    }
    return nail.fillColorId !== null;
  });
}
export function finishCustomer(save: Save): Save {
  if (save.active.mode !== 'customer' || save.active.rewarded || !save.active.request) return save;
  const score = scoreRequest(save.active, save.active.request);
  if (!score.complete) return save;
  return {
    ...save,
    stars: save.stars + score.stars,
    served: save.served + 1,
    active: { ...save.active, rewarded: true },
  };
}
export function saveToGallery(save: Save, id: string = uid()): { save: Save; full: boolean } {
  if (save.gallery.length >= 50) return { save, full: true };
  return {
    full: false,
    save: {
      ...save,
      gallery: [
        { id, createdAt: new Date().toISOString(), manicure: structuredClone(save.active) },
        ...save.gallery,
      ],
    },
  };
}
export function fillNails(manicure: Manicure, colorId = COLORS[0].id): Manicure {
  return {
    ...manicure,
    nails: manicure.nails.map((n) => ({
      ...n,
      baseColorId: colorId,
      fillColorId: colorId,
      strokes: [],
    })),
  };
}
