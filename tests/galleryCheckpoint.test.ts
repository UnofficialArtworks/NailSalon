import { expect, it } from 'vitest';
import { createSave, designIsSaved, fillNails, saveToGallery } from '../src/game/rules';

it('recognizes gallery artwork independently of customer reward metadata', () => {
  const state = createSave();
  state.active = fillNails(state.active);
  const saved = saveToGallery(state).save;
  expect(designIsSaved(saved.active, saved.gallery)).toBe(true);
  expect(designIsSaved({ ...saved.active, rewarded: true }, saved.gallery)).toBe(true);
  expect(designIsSaved(saved.active, [])).toBe(false);
});

it('requires saving again after artwork, shape, or skin changes', () => {
  const state = saveToGallery(createSave()).save;
  for (const kind of ['pattern', 'shape', 'skin']) {
    const design = structuredClone(state.active);
    if (kind === 'pattern') design.nails[0].patternId = 'pattern-0';
    if (kind === 'shape') design.nails[0].shape = 'square';
    if (kind === 'skin') design.skin = '#different';
    expect(designIsSaved(design, state.gallery)).toBe(false);
  }
  expect(designIsSaved({ ...state.active, id: 'new-session' }, state.gallery)).toBe(false);
});

it('recognizes an earlier saved version after undoing later edits', () => {
  const first = saveToGallery(createSave()).save;
  const later = { ...first, active: fillNails(first.active) };
  const second = saveToGallery(later).save;
  expect(designIsSaved(first.active, second.gallery)).toBe(true);
  expect(designIsSaved(second.active, second.gallery)).toBe(true);
});
