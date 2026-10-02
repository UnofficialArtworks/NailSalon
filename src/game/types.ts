export type Shape = 'round' | 'oval' | 'square' | 'soft-square' | 'almond';
export type Tool = 'clean' | 'brush' | 'eraser' | 'pattern' | 'sticker' | 'gem' | 'move';
export interface Point {
  x: number;
  y: number;
}
export interface Stroke {
  points: Point[];
  colorId: string;
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
  cleaned: boolean;
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
