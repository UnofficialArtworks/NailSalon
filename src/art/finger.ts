import type { Shape } from '../game/types';
import { nailContour } from './contour';
export const FINGER_NAIL = { x: 41.25, y: 20.05, w: 157.5, h: 249.9 };
// Use the nail contour with a wider skin margin and continue into the finger.
export function fingerPath(shape: Shape): string {
  const { start, upper } = nailContour(shape, 18, 18, 204, 254);
  return `M23 440Q28 310 ${start} ${upper} Q212 310 217 440Z`;
}
