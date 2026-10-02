import { nailContour } from './contour';
export const FINGER_NAIL = { x: 41.25, y: 7, w: 157.5, h: 249.9 };
// Use the nail contour with a wider skin margin and continue into the finger.
export function fingerPath(): string {
  const { start, upper } = nailContour('round', 18, 18, 204, 254);
  return `M23 440Q28 310 ${start} ${upper} Q212 310 217 440Z`;
}
