// Same geometry is used for the on-screen hand and PNG exports.
// Lift along each finger's axis for a small free edge; exports share these boxes.
const HAND_NAIL_LIFTS = [11.4, 19.5, 19.7, 19.5, 18.6];
export const NAIL_BOXES = [
  { x: 354, y: 236, w: 43, h: 65, r: 24 },
  { x: 257, y: 100, w: 46, h: 72, r: 4 },
  { x: 183, y: 52, w: 47, h: 76, r: 0 },
  { x: 110, y: 95, w: 44, h: 70, r: -4 },
  { x: 43, y: 184, w: 37, h: 57, r: -10 },
].map(({ x, y, w, h, r }, i) => {
  const angle = (r * Math.PI) / 180;
  const lift = HAND_NAIL_LIFTS[i];
  return {
    x: x - w * 0.025 + Math.sin(angle) * lift,
    y: y - h * 0.025 - Math.cos(angle) * lift,
    w: w * 1.05,
    h: h * 1.05,
    r,
  };
});
export const HAND_PATH =
  'M104 550C106 505 78 465 70 421C64 389 58 355 53 320L33 216C28 188 38 172 56 170C75 168 88 183 92 207L110 325Q114 339 118 324L101 126C99 97 110 81 130 80C151 79 162 96 163 124L173 312Q175 328 179 312L177 82C177 53 188 37 207 37C228 37 240 54 240 82L242 312Q244 328 249 313L250 128C250 99 262 84 281 85C302 86 314 103 311 132L300 351Q300 368 311 352L343 264C353 237 369 224 388 231C408 238 412 257 402 283L369 380C359 417 340 449 325 478C316 497 316 524 318 550Z';
