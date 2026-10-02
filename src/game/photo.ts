import type { Manicure, PhotoSettings } from './types';

export const DEFAULT_PHOTO: PhotoSettings = { backdrop: 'cream', bracelet: 'gold', ring: 'none' };
export const BACKDROPS = [
  { id: 'cream', name: 'Peach satin', color: '#fff5ed' },
  { id: 'candy', name: 'Candy clouds', color: '#ffd6ec' },
  { id: 'ocean', name: 'Ocean dreams', color: '#c8eef4' },
  { id: 'garden', name: 'Garden picnic', color: '#e0f1cd' },
] as const;
export const photoSettings = (m: Manicure): PhotoSettings => m.photo ?? DEFAULT_PHOTO;
export const samePhoto = (a: Manicure, b: Manicure) => {
  const left = photoSettings(a),
    right = photoSettings(b);
  return (
    left.backdrop === right.backdrop && left.bracelet === right.bracelet && left.ring === right.ring
  );
};
export const designName = (name: string) => name.trim().slice(0, 40);
