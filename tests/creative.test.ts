import { describe, expect, it } from 'vitest';
import { STENCILS, insideStencil, fillStencil, dipMarble } from '../src/game/creative';
import { createSave, hasPolish, fillNails } from '../src/game/rules';
import { validateSave } from '../src/game/validation';
import { creativeIdeasAt } from '../src/game/occasions';
import { suppliesAt } from '../src/game/catalog';
import { history, commit, undo, redo } from '../src/game/history';
import { copyNailArt } from '../src/game/studio';

describe('creative painting activities', () => {
  it('masks paint for every stencil and never rewards invisible strokes', () => {
    const nail = createSave().active.nails[0];
    for (const s of STENCILS) {
      expect(insideStencil(s.id, { x: 0.5, y: 0.5 })).toBe(true);
      expect(insideStencil(s.id, { x: 0.15, y: 0.2 })).toBe(false);
      expect(
        hasPolish({
          ...nail,
          strokes: [
            {
              points: [{ x: 0.15, y: 0.2 }],
              width: 0.04,
              colorId: 'color-0',
              erase: false,
              stencilId: s.id,
            },
          ],
        }),
      ).toBe(false);
      expect(hasPolish(fillStencil(nail, s.id, 'color-0'))).toBe(true);
    }
  });
  it('preserves masks and marble in save, copy, undo and redo without aliasing', () => {
    const save = createSave();
    const original = save.active.nails;
    const dipped = dipMarble(original[0], 'color-0', 'color-5', 3);
    const art = fillStencil(dipped, 'heart', 'color-1');
    save.active.nails[0] = art;
    expect(validateSave(save)).toBe(true);
    const copy = copyNailArt(save.active.nails, 0, [1], 'design');
    expect(copy[1].marble).toEqual(art.marble);
    copy[1].marble!.variant = 1;
    expect(art.marble!.variant).toBe(3);
    expect(copy[1].strokes[0].stencilId).toBe('heart');
    const h = commit(history([original[1]]), [art]);
    expect(undo(h).present).toEqual([original[1]]);
    expect(redo(undo(h)).present).toEqual([art]);
    expect(fillNails(save.active).nails[0].marble).toBeNull();
    expect(copyNailArt(save.active.nails, 0, [1], 'color')[1].marble).toBeNull();
  });
  it('rejects malformed new fields while accepting first-release saves', () => {
    expect(validateSave(createSave())).toBe(true);
    for (const marble of [
      { colorId: 'bad', variant: 0 },
      { colorId: 'color-5', variant: 4 },
      { colorId: 'color-5', variant: 0.5 },
    ]) {
      const save = createSave();
      save.active.nails[0] = {
        ...dipMarble(save.active.nails[0], 'color-0', 'color-5', 0),
        marble,
      };
      expect(validateSave(save)).toBe(false);
    }
    const save = createSave();
    save.active.nails[0] = fillStencil(save.active.nails[0], 'heart', 'color-0');
    Object.assign(save.active.nails[0].strokes[0], { stencilId: 'unknown' });
    expect(validateSave(save)).toBe(false);
  });
  it('offers only available supplies in every inspiration card at every milestone', () => {
    for (let stars = 0; stars <= 36; stars += 3) {
      const kit = suppliesAt(stars);
      for (const idea of creativeIdeasAt(stars)) {
        expect(idea.colors.length).toBeGreaterThan(0);
        expect(idea.colors.every((i) => kit.colors.some((c) => c.id === `color-${i}`))).toBe(true);
        expect(kit.stickers.some((s) => s.id === `sticker-${idea.sticker}`)).toBe(true);
      }
    }
  });
});
