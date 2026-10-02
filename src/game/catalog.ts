import type { Customer, Supply, Shape } from './types';
const palette = [
  ['Petal pink', '#f597b7'],
  ['Cherry pop', '#e94f6d'],
  ['Peachy', '#ffae90'],
  ['Buttercup', '#ffd867'],
  ['Mint magic', '#8bd4b2'],
  ['Sky blue', '#84ccec'],
  ['Lavender', '#b5a0dc'],
  ['Lilac dream', '#d0b5e9'],
  ['Bubblegum', '#ee77af'],
  ['Berry nice', '#b95486'],
  ['Tangerine', '#ff955d'],
  ['Sea glass', '#70c8c4'],
  ['Blueberry', '#6596dc'],
  ['Cotton candy', '#f9c3d7'],
  ['Vanilla', '#fff1cb'],
  ['Snowdrop', '#fffaf5'],
  ['Rose garden', '#dc7694'],
  ['Pistachio', '#b3d38d'],
  ['Hot pink', '#ed3f99'],
  ['Ruby', '#b63555'],
  ['Sunset', '#ee735a'],
  ['Golden hour', '#e7b542'],
  ['Lime fizz', '#bbd956'],
  ['Emerald', '#369e83'],
  ['Lagoon', '#359aaf'],
  ['Ocean', '#3863b9'],
  ['Grape soda', '#8c5ab5'],
  ['Plum', '#704065'],
  ['Marshmallow', '#e7daed'],
  ['Silver lining', '#b4bccb'],
  ['Cocoa', '#96705a'],
  ['Midnight', '#45405f'],
  ['Coral reef', '#ff7c92'],
  ['Periwinkle', '#939bdd'],
  ['Ballet slipper', '#f4dad8'],
  ['Glitter gold', '#cf9c39'],
];
export const COLORS: Supply[] = palette.map(([name, color], i) => ({
  id: `color-${i}`,
  name,
  color,
}));
export const PATTERNS: Supply[] = [
  'Polka dots',
  'Candy stripes',
  'Little hearts',
  'Sparkle dust',
  'French tips',
  'Wavy lines',
  'Checkerboard',
  'Daisy field',
  'Confetti',
  'Starry sky',
].map((name, i) => ({ id: `pattern-${i}`, name, color: '#fffaf3' }));
export const STICKERS: Supply[] = [
  'Heart',
  'Star',
  'Daisy',
  'Butterfly',
  'Moon',
  'Sun',
  'Rainbow',
  'Cherries',
  'Strawberry',
  'Bow',
  'Paw print',
  'Smiley',
  'Lightning',
  'Cloud',
  'Leaf',
  'Mushroom',
  'Snowflake',
  'Music note',
  'Diamond',
  'Planet',
  'Crown',
  'Seashell',
  'Clover',
  'Flame',
  'Kiss',
  'Kitty',
  'Cactus',
  'Bumblebee',
  'Balloon',
  'Tulip',
].map((name, i) => ({
  id: `sticker-${i}`,
  name,
  color: ['#f06f9b', '#f4c552', '#fff6ce', '#b89bdf', '#84c9dd', '#83c5a1'][i % 6],
}));
export const GEMS: Supply[] = [
  'Rose quartz',
  'Honey crystal',
  'Aqua crystal',
  'Lilac jewel',
  'Pearl',
  'Mint jewel',
  'Ruby gem',
  'Sapphire',
  'Emerald gem',
  'Opal',
  'Amethyst',
  'Golden gem',
].map((name, i) => ({
  id: `gem-${i}`,
  name,
  color: [
    '#ef9eba',
    '#edbf59',
    '#77c9dd',
    '#b49ad8',
    '#f7ecdc',
    '#94cbb0',
    '#dd587a',
    '#638cda',
    '#4aaf87',
    '#cfdef0',
    '#9c6bc1',
    '#d9a446',
  ][i],
}));
export const SHAPES: { id: Shape; name: string }[] = [
  { id: 'round', name: 'Round' },
  { id: 'oval', name: 'Oval' },
  { id: 'square', name: 'Square' },
  { id: 'soft-square', name: 'Soft square' },
  { id: 'almond', name: 'Almond' },
];
export const SKINS = ['#f5d2b5', '#e9b894', '#cf956f', '#ad7154', '#86533e', '#603d31'];
export const CUSTOMERS: Customer[] = [
  'Mia',
  'Zoe',
  'Lily',
  'Ava',
  'Ruby',
  'Noor',
  'Ella',
  'Ivy',
  'Sofia',
  'Aria',
  'Chloe',
  'Isla',
].map((name, i) => ({
  id: `c${i}`,
  name,
  skin: SKINS[i % 6],
  hair: ['#694638', '#332a30', '#ca8a43', '#422d28', '#8c4d35', '#252735'][i % 6],
  shirt: ['#f59cbc', '#88cabc', '#b0a0dd', '#edbf69'][i % 4],
  style: i,
}));
export const ROOM = [
  { id: 'wall-0', name: 'Peach wallpaper', color: '#fff0e8' },
  { id: 'desk-0', name: 'Rose desk', color: '#e6b5b1' },
  { id: 'accessory-0', name: 'Daisy vase', color: '#eabf61' },
  { id: 'wall-1', name: 'Mint wallpaper', color: '#e4f1e6' },
  { id: 'desk-1', name: 'Lilac desk', color: '#b8a5cd' },
  { id: 'accessory-1', name: 'Little succulent', color: '#88b89c' },
  { id: 'wall-2', name: 'Lilac wallpaper', color: '#eee6f6' },
  { id: 'desk-2', name: 'Honey desk', color: '#d8b784' },
  { id: 'accessory-2', name: 'Lucky star', color: '#f3c750' },
];
type Reward = {
  kind: 'colors' | 'patterns' | 'stickers' | 'gems' | 'room';
  id: string;
  name: string;
};
const rewards: Reward[] = [
  ...COLORS.slice(18).map((s) => ({ ...s, kind: 'colors' as const })),
  ...PATTERNS.slice(5).map((s) => ({ ...s, kind: 'patterns' as const })),
  ...STICKERS.slice(15).map((s) => ({ ...s, kind: 'stickers' as const })),
  ...GEMS.slice(6).map((s) => ({ ...s, kind: 'gems' as const })),
  ...ROOM.slice(3).map((s) => ({ ...s, kind: 'room' as const })),
];
export const MILESTONES = Array.from({ length: 12 }, (_, i) => ({
  stars: (i + 1) * 3,
  rewards: rewards.filter((_, j) => j % 12 === i),
}));
export function suppliesAt(stars: number) {
  const earned = MILESTONES.filter((m) => m.stars <= stars).flatMap((m) =>
    m.rewards.map((r) => r.id),
  );
  return {
    colors: COLORS.filter((c, i) => i < 18 || earned.includes(c.id)),
    patterns: PATTERNS.filter((c, i) => i < 5 || earned.includes(c.id)),
    stickers: STICKERS.filter((c, i) => i < 15 || earned.includes(c.id)),
    gems: GEMS.filter((c, i) => i < 6 || earned.includes(c.id)),
    room: ROOM.filter((c, i) => i < 3 || earned.includes(c.id)),
  };
}
export const colorOf = (id: string | null) => COLORS.find((c) => c.id === id)?.color ?? '#fff5eb';
