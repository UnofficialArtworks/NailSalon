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
  'M108 550C110 514 82 478 71 436C62 402 57 364 52 326C47 292 38 252 33 216C28 188 38 172 56 170C75 168 88 183 92 207C99 245 107 290 111 324C112 338 119 338 119 322C113 262 105 186 101 126C99 97 110 81 130 80C151 79 162 96 163 124C166 190 171 262 174 312C175 328 179 328 179 312C178 230 177 150 177 82C177 53 188 37 207 37C228 37 240 54 240 82C241 150 242 230 243 312C244 328 249 328 249 313C250 240 250 180 250 128C250 99 262 84 281 85C302 86 314 103 311 132C309 200 303 290 300 352C300 372 313 370 320 350C328 322 336 292 345 266C355 238 370 224 388 231C408 238 412 257 402 283C395 310 382 346 371 378C361 416 340 448 326 478C316 498 316 524 318 550Z';
