import { expect, it } from 'vitest';
import { occasionFor, OCCASIONS, CREATIVE_IDEAS } from '../src/game/occasions';
import { COLORS, STICKERS, MILESTONES, suppliesAt, CUSTOMERS } from '../src/game/catalog';
import { createSave, scoreRequest } from '../src/game/rules';
import { validateSave } from '../src/game/validation';
import { iconLayers } from '../src/art/icons';

it('provides all four occasions without changing forgiving customer scoring', () => {
  expect(new Set(CUSTOMERS.map((c) => occasionFor(c.id).id)).size).toBe(4);
  const save = createSave();
  save.active.nails.forEach((n) => {
    n.fillColorId = n.baseColorId = 'color-1';
    n.finish = 'metallic';
  });
  expect(
    scoreRequest(save.active, { customerId: 'c0', colorId: 'color-0', stickerId: 'sticker-0' })
      .stars,
  ).toBe(1);
});
it('offers six original starter stickers without redistributing existing unlocks', () => {
  const fresh = STICKERS.slice(30);
  expect(fresh).toHaveLength(6);
  expect(new Set(fresh.map((s) => JSON.stringify(iconLayers(s.id)))).size).toBe(6);
  expect(fresh.every((s) => suppliesAt(0).stickers.includes(s))).toBe(true);
  expect(MILESTONES.flatMap((m) => m.rewards).filter((r) => r.kind === 'stickers')).toHaveLength(
    15,
  );
  // Existing room unlocks stay at their original milestones.
  expect(
    MILESTONES.filter((m) => m.rewards.some((r) => r.kind === 'room')).map((m) => m.stars),
  ).toEqual([3, 6, 27, 30, 33, 36]);
});
it('validates both new finishes and post-unlock prompt supplies', () => {
  const save = createSave();
  for (const finish of ['matte', 'metallic'] as const) {
    save.active.nails[0].finish = finish;
    expect(validateSave(save)).toBe(true);
  }
  Object.assign(save.active.nails[0], { finish: 'unknown' });
  expect(validateSave(save)).toBe(false);
  for (const idea of CREATIVE_IDEAS) {
    expect(OCCASIONS.some((o) => o.id === idea.occasion)).toBe(true);
    expect(idea.colors.every((i) => COLORS[i] && suppliesAt(36).colors.includes(COLORS[i]))).toBe(
      true,
    );
    expect(STICKERS[idea.sticker]).toBeDefined();
  }
});
