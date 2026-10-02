import { describe, expect, it } from 'vitest';
import { createSave, saveToGallery, designIsSaved } from '../src/game/rules';
import { validateSave } from '../src/game/validation';
import {
  DEFAULT_PHOTO,
  PHOTO_CHOICES,
  photoSettings,
  photoChoiceUnlocked,
  designName,
} from '../src/game/photo';
import { MILESTONES } from '../src/game/catalog';
import { backdropSvg, handSkinSvg, photoOverlaySvg } from '../src/art/photoScene';

describe('photo studio and scrapbook', () => {
  it('normalizes first-release photos without losing their choices', () => {
    const save = createSave();
    save.active.photo = { backdrop: 'ocean', bracelet: 'pearls', ring: 'heart' };
    expect(photoSettings(save.active)).toEqual({
      backdrop: 'ocean',
      bracelet: 'pearls',
      ring: 'heart',
      frame: 'none',
      props: 'none',
    });
    const saved = saveToGallery(save).save;
    saved.active.photo = photoSettings(saved.active);
    expect(designIsSaved(saved.active, saved.gallery)).toBe(true);
  });
  it('unlocks photo rewards at the same star milestones without changing supply ordering', () => {
    for (const [category, choices] of Object.entries(PHOTO_CHOICES)) {
      for (const choice of choices) {
        const key = category as keyof typeof PHOTO_CHOICES;
        expect(photoChoiceUnlocked(key, choice.id, choice.stars)).toBe(true);
        if (choice.stars > 0) {
          expect(photoChoiceUnlocked(key, choice.id, choice.stars - 1)).toBe(false);
          const rewards = MILESTONES.flatMap((m) =>
            m.rewards.filter((r) => r.id === `photo-${category}-${choice.id}`).map(() => m.stars),
          );
          expect(rewards).toEqual([choice.stars]);
        } else expect(photoChoiceUnlocked(key, choice.id, 0)).toBe(true);
      }
    }
    expect(photoChoiceUnlocked('frame', 'unknown', 99)).toBe(false);
    expect(MILESTONES[0].rewards.filter((r) => r.kind !== 'photo').map((r) => r.id)).toEqual([
      'color-18',
      'color-30',
      'sticker-16',
      'sticker-28',
      'desk-2',
    ]);
  });
  it('validates new photo choices, preserves independent gallery copies, and detects edits', () => {
    const save = createSave();
    save.active.photo = {
      backdrop: 'rainbow',
      bracelet: 'ribbon',
      ring: 'star',
      frame: 'sparkle',
      props: 'party',
    };
    expect(validateSave(save)).toBe(true);
    const saved = saveToGallery(save).save;
    saved.active.photo!.props = 'shells';
    expect(saved.gallery[0].manicure.photo!.props).toBe('party');
    expect(designIsSaved(saved.active, saved.gallery)).toBe(false);
    for (const key of ['frame', 'props']) {
      const bad = structuredClone(save);
      Object.assign(bad.active.photo!, { [key]: 'unknown' });
      expect(validateSave(bad)).toBe(false);
    }
    for (const backdrop of PHOTO_CHOICES.backdrop) {
      const settings = { ...DEFAULT_PHOTO, backdrop: backdrop.id };
      expect(backdropSvg(settings)).toBe(backdropSvg(settings));
      expect(backdropSvg(settings)).not.toContain('undefined');
    }
    expect(photoOverlaySvg(DEFAULT_PHOTO)).toBe('');
    expect(photoOverlaySvg(photoSettings(save.active))).toContain('#f4ca69');
  });
  it('preserves old saves and rejects malformed photo and scrapbook data', () => {
    const save = createSave();
    expect(validateSave(save)).toBe(true);
    expect(photoSettings(save.active)).toEqual(DEFAULT_PHOTO);
    save.active.photo = { backdrop: 'ocean', bracelet: 'pearls', ring: 'heart' };
    const result = saveToGallery(save).save;
    result.gallery[0].name = 'Ocean magic';
    result.gallery[0].favorite = true;
    expect(validateSave(result)).toBe(true);
    for (const invalid of [{ backdrop: 'remote' }, { ring: 'unknown' }, { bracelet: null }]) {
      const bad = structuredClone(result);
      Object.assign(bad.gallery[0].manicure.photo!, invalid);
      expect(validateSave(bad)).toBe(false);
    }
    result.gallery[0].name = 'x'.repeat(41);
    expect(validateSave(result)).toBe(false);
    result.gallery[0].name = 'okay';
    Object.assign(result.gallery[0], { favorite: 'yes' });
    expect(validateSave(result)).toBe(false);
  });
  it('saves independent photo choices and detects changes without treating names as artwork', () => {
    let save = createSave();
    save = saveToGallery(save).save;
    save.active.photo = { ...DEFAULT_PHOTO };
    expect(designIsSaved(save.active, save.gallery)).toBe(true);
    save.gallery[0].name = 'My favorite';
    expect(designIsSaved(save.active, save.gallery)).toBe(true);
    save.active.photo.backdrop = 'garden';
    expect(designIsSaved(save.active, save.gallery)).toBe(false);
    save = saveToGallery(save).save;
    save.active.photo = { ...photoSettings(save.active), ring: 'flower' };
    expect(save.gallery[0].manicure.photo?.ring).toBe('none');
    expect(designIsSaved(save.active, save.gallery)).toBe(false);
    expect(designName('  Flower magic  ')).toBe('Flower magic');
    expect(designName('x'.repeat(90))).toHaveLength(40);
  });
  it('shares deterministic artwork and omits jewelry when requested', () => {
    const m = createSave().active;
    const plain = handSkinSvg({ ...m, photo: { ...DEFAULT_PHOTO, bracelet: 'none' } }, 'test');
    expect(plain).not.toContain('#e9aa32');
    expect(handSkinSvg(m, 'test')).toContain('#e9aa32');
    for (const backdrop of ['cream', 'candy', 'ocean', 'garden'] as const) {
      expect(backdropSvg({ ...DEFAULT_PHOTO, backdrop })).toBe(
        backdropSvg({ ...DEFAULT_PHOTO, backdrop }),
      );
    }
  });
});
