import { describe, expect, it } from 'vitest';
import { copyNailArt, duplicateItem, reorderItem, COLLECTIONS } from '../src/game/studio';
import { createSave } from '../src/game/rules';
import { validateSave } from '../src/game/validation';
import { lengthBox } from '../src/art/length';
import { history, commit, undo } from '../src/game/history';
import { COLORS, GEMS, PATTERNS, STICKERS } from '../src/game/catalog';

describe('creative studio', () => {
  it('keeps old saves and validates new settings in active and gallery designs', () => {
    const save = createSave();
    expect(validateSave(save)).toBe(true);
    save.active.nails[0] = {
      ...save.active.nails[0],
      length: 'long',
      finish: 'glitter',
      patternColorId: 'color-0',
    };
    save.gallery.push({
      id: 'saved',
      createdAt: new Date().toISOString(),
      manicure: structuredClone(save.active),
    });
    expect(validateSave(save)).toBe(true);
    const bad = structuredClone(save);
    Object.assign(bad.gallery[0].manicure.nails[0], { length: 'extra-long' });
    expect(validateSave(bad)).toBe(false);
    Object.assign(bad.gallery[0].manicure.nails[0], { length: 'long', finish: 'invalid' });
    expect(validateSave(bad)).toBe(false);
    Object.assign(bad.gallery[0].manicure.nails[0], { finish: 'pearl', patternColorId: 'bad' });
    expect(validateSave(bad)).toBe(false);
    for (const fields of [{ length: ['long'] }, { finish: ['pearl'] }, { length: null }]) {
      const malformed = structuredClone(save);
      Object.assign(malformed.active.nails[0], fields);
      expect(validateSave(malformed)).toBe(false);
    }
  });

  it('extends the tip while preserving the rotated nail bed anchor', () => {
    for (const rotation of [-10, 0, 24]) {
      const original = { x: 50, y: 70, w: 40, h: 60, r: rotation };
      const anchor = (b: typeof original) => ({
        x: b.x + b.w / 2 - (Math.sin((rotation * Math.PI) / 180) * b.h) / 2,
        y: b.y + b.h / 2 + (Math.cos((rotation * Math.PI) / 180) * b.h) / 2,
      });
      expect(lengthBox(original)).toEqual(original);
      for (const length of ['medium', 'long'] as const) {
        const box = lengthBox(original, length);
        expect(anchor(box).x).toBeCloseTo(anchor(original).x);
        expect(anchor(box).y).toBeCloseTo(anchor(original).y);
        expect(box.h).toBeGreaterThan(original.h);
        expect(box.w).toBe(original.w);
      }
    }
  });

  it('copies independently with fresh item IDs and undoes the whole set in one action', () => {
    const nails = createSave().active.nails;
    nails[0].strokes.push({
      points: [{ x: 0.5, y: 0.5 }],
      width: 0.1,
      colorId: 'color-0',
      erase: false,
    });
    nails[0].decorations.push({
      id: 'original',
      kind: 'sticker',
      supplyId: 'sticker-0',
      x: 0.5,
      y: 0.5,
      size: 0.28,
      rotation: 0,
    });
    nails[0].finish = 'glitter';
    nails[1].shape = 'almond';
    nails[1].length = 'long';
    const copies = copyNailArt(nails, 0, [1, 2], 'design');
    expect(copies[1].shape).toBe('almond');
    expect(copies[1].length).toBe('long');
    expect(copies[1].finish).toBe('glitter');
    expect(
      new Set([
        nails[0].decorations[0].id,
        copies[1].decorations[0].id,
        copies[2].decorations[0].id,
      ]).size,
    ).toBe(3);
    copies[1].strokes[0].points[0].x = 0.8;
    expect(nails[0].strokes[0].points[0].x).toBe(0.5);
    expect(copies[2].strokes[0].points[0].x).toBe(0.5);
    expect(copies[3]).toBe(nails[3]);
    expect(undo(commit(history(nails), copies)).present).toEqual(nails);
  });

  it('copies only color without replacing decorations or geometry', () => {
    const nails = createSave().active.nails;
    nails[0].baseColorId = 'color-1';
    nails[1].patternId = 'pattern-0';
    nails[1].length = 'long';
    const copy = copyNailArt(nails, 0, [1], 'color')[1];
    expect(copy.fillColorId).toBe('color-1');
    expect(copy.patternId).toBe('pattern-0');
    expect(copy.length).toBe('long');
  });

  it('duplicates and reorders without altering the original item or exceeding the limit', () => {
    const nail = createSave().active.nails[0];
    nail.decorations.push({
      id: 'original',
      kind: 'gem',
      supplyId: 'gem-0',
      x: 0.5,
      y: 0.5,
      size: 0.2,
      rotation: 30,
    });
    const duplicated = duplicateItem(nail, 'original');
    expect(duplicated.decorations).toHaveLength(2);
    expect(nail.decorations).toHaveLength(1);
    expect(duplicated.decorations[1].id).not.toBe('original');
    expect(reorderItem(duplicated, 'original', 'front').decorations[1].id).toBe('original');
    expect(reorderItem(duplicated, duplicated.decorations[1].id, 'back').decorations[0].id).toBe(
      duplicated.decorations[1].id,
    );
    const full = {
      ...nail,
      decorations: Array.from({ length: 100 }, () => ({ ...nail.decorations[0] })),
    };
    expect(duplicateItem(full, 'original')).toBe(full);
  });

  it('collection filters reference real supplies and offer usable starting choices', () => {
    for (const collection of COLLECTIONS.slice(1)) {
      for (const [kind, library, start] of [
        ['colors', COLORS, 18],
        ['stickers', STICKERS, 15],
        ['patterns', PATTERNS, 5],
        ['gems', GEMS, 6],
      ] as const) {
        expect(collection[kind].some((n) => n < start)).toBe(true);
        for (const n of collection[kind]) expect(library[n]).toBeDefined();
      }
    }
  });
});
