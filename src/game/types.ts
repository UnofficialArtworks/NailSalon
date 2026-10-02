export type Shape = 'round' | 'oval' | 'square' | 'soft-square' | 'almond';
export type NailLength = 'short' | 'medium' | 'long';
export type Finish = 'glossy' | 'glitter' | 'pearl' | 'matte' | 'metallic';
export type Tool = 'clean' | 'brush' | 'eraser' | 'pattern' | 'sticker' | 'gem' | 'move';
export interface Point {
  x: number;
  y: number;
}
export interface Stroke {
  points: Point[];
  colorId: string;
  /** Brush diameter as a fraction of nail width; round in rendered pixels. */
  width: number;
  erase: boolean;
}
export interface Decoration extends Point {
  id: string;
  kind: 'sticker' | 'gem';
  supplyId: string;
  rotation: number;
  size: number;
}
export interface Nail {
  shape: Shape;
  /** Missing optional fields preserve the appearance of first-release saves. */
  length?: NailLength;
  finish?: Finish;
  patternColorId?: string | null;
  cleaned: boolean;
  /** Bit mask of washed dirt spots; absent in first-release saves. */
  washed?: number;
  baseColorId: string | null;
  fillColorId: string | null;
  strokes: Stroke[];
  patternId: string | null;
  decorations: Decoration[];
}
export interface Request {
  customerId: string;
  colorId: string;
  stickerId: string;
}
export interface Manicure {
  id: string;
  mode: 'free' | 'customer';
  skin: string;
  nails: Nail[];
  request: Request | null;
  rewarded: boolean;
  photo?: PhotoSettings;
}
export interface PhotoSettings {
  backdrop: 'cream' | 'candy' | 'ocean' | 'garden';
  bracelet: 'gold' | 'pearls' | 'none';
  ring: 'none' | 'heart' | 'flower';
}
export interface Supply {
  id: string;
  name: string;
  color: string;
}
export interface Customer {
  id: string;
  name: string;
  skin: string;
  hair: string;
  shirt: string;
  style: number;
}
export interface GalleryEntry {
  id: string;
  createdAt: string;
  manicure: Manicure;
  name?: string;
  favorite?: boolean;
}
export interface Save {
  version: 1;
  stars: number;
  served: number;
  active: Manicure;
  gallery: GalleryEntry[];
  room: { wall: string; desk: string; accessory: string };
  settings: { music: boolean; effects: boolean; tutorialSeen: boolean };
}
export interface Wishes {
  complete: boolean;
  color: boolean;
  sticker: boolean;
  stars: number;
}
