import { COLORS, PATTERNS, STICKERS, GEMS, SHAPES, SKINS, CUSTOMERS, ROOM } from './catalog';
import type { Save } from './types';
const object = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);
const number = (v: unknown, min = 0, max = 1) =>
  typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max;
const text = (v: unknown) => typeof v === 'string' && v.length > 0 && v.length <= 200;
const id = (v: unknown, items: { id: string }[]) => items.some((i) => i.id === v);
function nail(v: unknown): boolean {
  if (
    !object(v) ||
    !id(v.shape, SHAPES) ||
    (v.length !== undefined &&
      (typeof v.length !== 'string' || !['short', 'medium', 'long'].includes(v.length))) ||
    (v.finish !== undefined &&
      (typeof v.finish !== 'string' || !['glossy', 'glitter', 'pearl'].includes(v.finish))) ||
    (v.patternColorId !== undefined &&
      v.patternColorId !== null &&
      !id(v.patternColorId, COLORS)) ||
    typeof v.cleaned !== 'boolean' ||
    (v.baseColorId !== null && !id(v.baseColorId, COLORS)) ||
    (v.fillColorId !== null && !id(v.fillColorId, COLORS)) ||
    (v.patternId !== null && !id(v.patternId, PATTERNS))
  )
    return false;
  if (
    !Array.isArray(v.strokes) ||
    v.strokes.length > 500 ||
    !Array.isArray(v.decorations) ||
    v.decorations.length > 100
  )
    return false;
  if (
    !v.strokes.every(
      (s) =>
        object(s) &&
        id(s.colorId, COLORS) &&
        number(s.width, 0.005, 0.5) &&
        typeof s.erase === 'boolean' &&
        Array.isArray(s.points) &&
        s.points.length > 0 &&
        s.points.length <= 3000 &&
        s.points.every((p) => object(p) && number(p.x) && number(p.y)),
    )
  )
    return false;
  return v.decorations.every(
    (d) =>
      object(d) &&
      text(d.id) &&
      (d.kind === 'sticker' || d.kind === 'gem') &&
      id(d.supplyId, d.kind === 'sticker' ? STICKERS : GEMS) &&
      number(d.x) &&
      number(d.y) &&
      number(d.rotation, -3600, 3600) &&
      number(d.size, 0.05, 0.8),
  );
}
function manicure(v: unknown): boolean {
  if (
    !object(v) ||
    !text(v.id) ||
    !['free', 'customer'].includes(String(v.mode)) ||
    !SKINS.includes(String(v.skin)) ||
    typeof v.rewarded !== 'boolean' ||
    !Array.isArray(v.nails) ||
    v.nails.length !== 5 ||
    !v.nails.every(nail)
  )
    return false;
  if (v.mode === 'free') return v.request === null;
  return (
    object(v.request) &&
    id(v.request.customerId, CUSTOMERS) &&
    id(v.request.colorId, COLORS) &&
    id(v.request.stickerId, STICKERS)
  );
}
export function validateSave(v: unknown): v is Save {
  if (
    !object(v) ||
    v.version !== 1 ||
    !number(v.stars, 0, 1e9) ||
    !Number.isInteger(v.stars) ||
    !number(v.served, 0, 1e9) ||
    !Number.isInteger(v.served) ||
    !manicure(v.active)
  )
    return false;
  if (
    !Array.isArray(v.gallery) ||
    v.gallery.length > 50 ||
    !v.gallery.every(
      (g) =>
        object(g) &&
        text(g.id) &&
        typeof g.createdAt === 'string' &&
        Number.isFinite(Date.parse(g.createdAt)) &&
        manicure(g.manicure),
    )
  )
    return false;
  if (
    !object(v.room) ||
    !Object.entries(v.room).every(
      ([k, val]) =>
        ['wall', 'desk', 'accessory'].includes(k) &&
        id(val, ROOM) &&
        String(val).startsWith(k + '-'),
    ) ||
    Object.keys(v.room).length !== 3
  )
    return false;
  const settings = v.settings;
  return (
    object(settings) &&
    ['music', 'effects', 'tutorialSeen'].every((k) => typeof settings[k] === 'boolean')
  );
}
