import { expect, it } from 'vitest';
import { createSave, hasManicureEdits } from '../src/game/rules';
import { DIRT_SPOTS, washNail, washedCount } from '../src/game/preparation';
import { validateSave } from '../src/game/validation';
import { history, commit, undo, redo } from '../src/game/history';

it('cleans only the swept area and completes after all spots are visited', () => {
  const nail = createSave().active.nails[0];
  const partial = washNail(nail, DIRT_SPOTS[0], DIRT_SPOTS[0], 2);
  expect(partial.cleaned).toBe(false);
  expect(washedCount(partial)).toBeGreaterThan(0);
  expect(washedCount(partial)).toBeLessThan(9);
  expect(nail.washed).toBeUndefined();
  const complete = DIRT_SPOTS.reduce((n, p) => washNail(n, p, p, 2), partial);
  expect(complete.cleaned).toBe(true);
  expect(washedCount(complete)).toBe(9);
  expect(washNail(complete, { x: 0, y: 0 }, { x: 1, y: 1 }, 2)).toBe(complete);
});
it('covers fast swipe segments and keeps its circular footprint at different aspects', () => {
  const nail = createSave().active.nails[0];
  const swept = washNail(nail, { x: 0.15, y: 0.5 }, { x: 0.85, y: 0.5 }, 2);
  expect((swept.washed ?? 0) & (1 << 4)).toBeTruthy();
  expect((swept.washed ?? 0) & (1 << 1)).toBeFalsy();
  const tall = washNail(nail, { x: 0.5, y: 0.4 }, { x: 0.5, y: 0.4 }, 3);
  expect((tall.washed ?? 0) & (1 << 4)).toBeFalsy();
});
it('preserves partial washing through history and validates compatible bounded saves', () => {
  const save = createSave();
  expect(validateSave(save)).toBe(true);
  const before = save.active.nails[0];
  const partial = washNail(before, DIRT_SPOTS[0], DIRT_SPOTS[0], 2);
  const h = commit(history(before), partial);
  expect(undo(h).present).toEqual(before);
  expect(redo(undo(h)).present).toEqual(partial);
  save.active.nails[0] = partial;
  expect(validateSave(save)).toBe(true);
  expect(hasManicureEdits(save.active)).toBe(true);
  for (const bad of [-1, 512, 1.5, NaN, '3']) {
    Object.assign(save.active.nails[0], { washed: bad });
    expect(validateSave(save)).toBe(false);
  }
});
