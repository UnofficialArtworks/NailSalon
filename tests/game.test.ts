import { describe, expect, it } from 'vitest';
import {
  COLORS,
  PATTERNS,
  STICKERS,
  GEMS,
  CUSTOMERS,
  MILESTONES,
  suppliesAt,
} from '../src/game/catalog';
import {
  createSave,
  blankManicure,
  makeRequest,
  scoreRequest,
  finishCustomer,
  saveToGallery,
} from '../src/game/rules';
import { history, commit, undo, redo } from '../src/game/history';
import { validateSave } from '../src/game/validation';

describe('creative library and rewards', () => {
  it('ships the agreed library and starter kit', () => {
    expect([
      COLORS.length,
      PATTERNS.length,
      STICKERS.length,
      GEMS.length,
      CUSTOMERS.length,
    ]).toEqual([36, 10, 30, 12, 12]);
    const starter = suppliesAt(0);
    expect([
      starter.colors.length,
      starter.patterns.length,
      starter.stickers.length,
      starter.gems.length,
    ]).toEqual([18, 5, 15, 6]);
    expect(MILESTONES.map((m) => m.stars)).toEqual([3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36]);
    expect(suppliesAt(36).colors).toHaveLength(36);
    expect(suppliesAt(36).room).toHaveLength(9);
  });
  it('only asks for unlocked supplies and cycles all customers', () => {
    for (let i = 0; i < 48; i++) {
      const request = makeRequest(i, 0);
      expect(suppliesAt(0).colors.map((c) => c.id)).toContain(request.colorId);
      expect(suppliesAt(0).stickers.map((c) => c.id)).toContain(request.stickerId);
      expect(request.customerId).toBe(CUSTOMERS[i % 12].id);
    }
  });
  it('awards a completion star without punishing unmatched designs', () => {
    const manicure = blankManicure();
    manicure.nails.forEach((n) => {
      n.baseColorId = COLORS[1].id;
      n.fillColorId = COLORS[1].id;
    });
    expect(
      scoreRequest(manicure, {
        customerId: 'c0',
        colorId: COLORS[0].id,
        stickerId: STICKERS[0].id,
      }),
    ).toEqual({ complete: true, color: false, sticker: false, stars: 1 });
  });
  it('awards both wish bonuses without counting extra art against them', () => {
    const request = makeRequest(0, 0);
    const manicure = blankManicure();
    manicure.nails.forEach((n, i) => {
      n.baseColorId = i < 3 ? request.colorId : COLORS[2].id;
      n.fillColorId = n.baseColorId;
    });
    manicure.nails[4].decorations.push({
      id: 'd',
      kind: 'sticker',
      supplyId: request.stickerId,
      x: 0.5,
      y: 0.5,
      rotation: 90,
      size: 0.3,
    });
    expect(scoreRequest(manicure, request).stars).toBe(3);
  });
  it('cannot claim rewards twice or finish unpainted nails', () => {
    const state = createSave();
    state.active.mode = 'customer';
    state.active.request = makeRequest(0, 0);
    expect(finishCustomer(state)).toBe(state);
    state.active.nails.forEach((n) => {
      n.baseColorId = state.active.request!.colorId;
      n.fillColorId = n.baseColorId;
    });
    const next = finishCustomer(state);
    expect(next.stars).toBe(2);
    expect(finishCustomer(next).stars).toBe(2);
  });
  it('never removes artwork when the gallery is full', () => {
    let state = createSave();
    for (let i = 0; i < 50; i++) state = saveToGallery(state, String(i)).save;
    const result = saveToGallery(state, 'overflow');
    expect(result.full).toBe(true);
    expect(result.save).toBe(state);
    expect(state.gallery).toHaveLength(50);
  });
});
describe('art history', () => {
  it('undoes and redoes whole actions and clears the redo branch on a new edit', () => {
    let h = history({ color: 'pink' });
    h = commit(h, { color: 'blue' });
    h = commit(h, { color: 'green' });
    h = undo(h);
    expect(h.present.color).toBe('blue');
    h = redo(h);
    expect(h.present.color).toBe('green');
    h = commit(undo(h), { color: 'gold' });
    expect(h.future).toHaveLength(0);
  });
});
describe('painted nail completion', () => {
  it('does not count fully erased polish as a completed manicure', () => {
    const state = createSave();
    state.active.mode = 'customer';
    state.active.request = makeRequest(0, 0);
    state.active.nails.forEach((n) => {
      n.baseColorId = 'color-0';
      n.fillColorId = 'color-0';
      for (let x = 0.1; x < 1; x += 0.2)
        n.strokes.push({
          points: [
            { x, y: 0 },
            { x, y: 1 },
          ],
          colorId: 'color-0',
          width: 0.25,
          erase: true,
        });
    });
    expect(scoreRequest(state.active, state.active.request).complete).toBe(false);
  });
});
describe('saved data', () => {
  it('accepts a versioned save and rejects corruption without resetting it', () => {
    expect(validateSave(createSave())).toBe(true);
    expect(validateSave({ version: 99 })).toBe(false);
    const state = createSave();
    state.active.nails[0].decorations.push({
      id: 'd',
      kind: 'gem',
      supplyId: GEMS[0].id,
      x: NaN,
      y: 0.2,
      size: 0.2,
      rotation: 0,
    });
    expect(validateSave(state)).toBe(false);
  });
});
