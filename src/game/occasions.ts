import { suppliesAt } from './catalog';
export const OCCASIONS = [
  {
    id: 'rainbow',
    name: 'Rainbow party',
    wish: 'I’m going to a rainbow party!',
    thanks: 'These will sparkle at my party!',
  },
  {
    id: 'beach',
    name: 'Beach day',
    wish: 'I’m off for a sunny beach day!',
    thanks: 'Ready for sunshine and seashells!',
  },
  {
    id: 'garden',
    name: 'Garden picnic',
    wish: 'I’m meeting friends for a picnic!',
    thanks: 'My picnic nails are lovely!',
  },
  {
    id: 'space',
    name: 'Space celebration',
    wish: 'We’re having a space celebration!',
    thanks: 'My nails are out of this world!',
  },
] as const;
export type Occasion = (typeof OCCASIONS)[number];
export function occasionFor(customerId: string): Occasion {
  const index = Number(customerId.slice(1));
  return OCCASIONS[Number.isInteger(index) && index >= 0 ? index % OCCASIONS.length : 0];
}
export const CREATIVE_IDEAS = [
  {
    occasion: 'rainbow',
    title: 'A rainbow on every finger',
    hint: 'Try five different colors and a rainbow heart.',
    colors: [1, 3, 4, 5, 6],
    sticker: 32,
  },
  {
    occasion: 'beach',
    title: 'Tiny seaside treasures',
    hint: 'Try ocean colors, sandcastles and a little shimmer.',
    colors: [5, 11, 14, 24],
    sticker: 34,
  },
  {
    occasion: 'garden',
    title: 'A flower fairy manicure',
    hint: 'Try mint, lilac and a magic wand.',
    colors: [4, 7, 14, 17],
    sticker: 31,
  },
  {
    occasion: 'space',
    title: 'Rocket to the stars',
    hint: 'Try midnight, silver and tiny rockets.',
    colors: [6, 25, 29, 31],
    sticker: 35,
  },
] as const;

/** Inspiration is available immediately; suggestions grow with the player's kit. */
export function creativeIdeasAt(stars: number) {
  const kit = suppliesAt(stars);
  return CREATIVE_IDEAS.map((idea) => ({
    ...idea,
    colors: idea.colors.filter((i) => kit.colors.some((c) => c.id === `color-${i}`)),
    hint: idea.occasion === 'space' && stars < 36 ? 'Try sky colors and tiny rockets.' : idea.hint,
    sticker: kit.stickers.some((s) => s.id === `sticker-${idea.sticker}`) ? idea.sticker : 0,
  }));
}
