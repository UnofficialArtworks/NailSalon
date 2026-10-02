import { describe, expect, it } from 'vitest';
import { createSave, saveToGallery, designIsSaved } from '../src/game/rules';
import { validateSave } from '../src/game/validation';
import { DEFAULT_PHOTO, photoSettings, designName } from '../src/game/photo';
import { backdropSvg, handSkinSvg } from '../src/art/photoScene';

describe('photo studio and scrapbook', () => {
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
