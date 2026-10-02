import type { Manicure, PhotoSettings } from './types';

export const DEFAULT_PHOTO: Required<PhotoSettings> = {
  backdrop: 'cream',
  bracelet: 'gold',
  ring: 'none',
  frame: 'none',
  props: 'none',
};
export const PHOTO_CHOICES = {
  backdrop: [
    { id: 'cream', name: 'Peach satin', color: '#fff5ed', stars: 0 },
    { id: 'candy', name: 'Candy clouds', color: '#ffd6ec', stars: 0 },
    { id: 'ocean', name: 'Ocean dreams', color: '#c8eef4', stars: 0 },
    { id: 'garden', name: 'Garden picnic', color: '#e0f1cd', stars: 0 },
    { id: 'sunset', name: 'Sunset glow', color: '#ffd2ac', stars: 0 },
    { id: 'rainbow', name: 'Rainbow skies', color: '#efe1ff', stars: 12 },
    { id: 'starlight', name: 'Starlight stage', color: '#464281', stars: 24 },
  ],
  frame: [
    { id: 'none', name: 'No frame', stars: 0 },
    { id: 'postcard', name: 'Sweet postcard', stars: 0 },
    { id: 'rainbow', name: 'Rainbow frame', stars: 12 },
    { id: 'sparkle', name: 'Sparkle frame', stars: 24 },
  ],
  props: [
    { id: 'none', name: 'No props', stars: 0 },
    { id: 'flowers', name: 'Flower corners', stars: 0 },
    { id: 'shells', name: 'Seaside treasures', stars: 18 },
    { id: 'party', name: 'Party confetti', stars: 30 },
  ],
  bracelet: [
    { id: 'gold', name: 'Golden star', stars: 0 },
    { id: 'pearls', name: 'Pearls', stars: 0 },
    { id: 'none', name: 'No bracelet', stars: 0 },
    { id: 'ribbon', name: 'Ribbon bracelet', stars: 0 },
  ],
  ring: [
    { id: 'none', name: 'No ring', stars: 0 },
    { id: 'heart', name: 'Heart ring', stars: 0 },
    { id: 'flower', name: 'Flower ring', stars: 0 },
    { id: 'star', name: 'Star ring', stars: 6 },
  ],
} as const;
export const BACKDROPS = PHOTO_CHOICES.backdrop;
export type PhotoCategory = keyof PhotoSettings;
export const photoSettings = (m: Manicure): Required<PhotoSettings> => ({
  ...DEFAULT_PHOTO,
  ...m.photo,
  frame: m.photo?.frame ?? 'none',
  props: m.photo?.props ?? 'none',
});
export function photoChoiceUnlocked(category: PhotoCategory, id: string, stars: number): boolean {
  const choice = PHOTO_CHOICES[category].find((c) => c.id === id);
  return choice !== undefined && choice.stars <= stars;
}
export function validPhoto(value: unknown): boolean {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const p = value as Record<string, unknown>;
  return (Object.keys(PHOTO_CHOICES) as PhotoCategory[]).every(
    (category) =>
      (p[category] === undefined && (category === 'frame' || category === 'props')) ||
      PHOTO_CHOICES[category].some((c) => c.id === p[category]),
  );
}
export const samePhoto = (a: Manicure, b: Manicure) => {
  const left = photoSettings(a),
    right = photoSettings(b);
  return (
    left.backdrop === right.backdrop &&
    left.bracelet === right.bracelet &&
    left.ring === right.ring &&
    left.frame === right.frame &&
    left.props === right.props
  );
};
export const designName = (name: string) => name.trim().slice(0, 40);
