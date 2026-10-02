import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { loadSave, writeSave, openDatabase, recoverSave } from '../src/storage/database';
import { createSave } from '../src/game/rules';
describe('browser saves', () => {
  it('round-trips artwork and rewards through IndexedDB', async () => {
    const db = await openDatabase('round-trip');
    const state = createSave();
    state.stars = 9;
    await writeSave(db, state);
    const result = await loadSave(db);
    expect(result.status).toBe('loaded');
    if (result.status === 'loaded') expect(result.save).toEqual(state);
    db.close();
  });
  it('preserves an invalid save and requires explicit recovery', async () => {
    const db = await openDatabase('invalid');
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('saves', 'readwrite');
      tx.objectStore('saves').put({ version: 88, stars: 100 }, 'current');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    const result = await loadSave(db);
    expect(result.status).toBe('invalid');
    if (result.status === 'invalid') {
      expect(result.raw).toEqual({ version: 88, stars: 100 });
      await recoverSave(db, createSave(), result.raw);
      expect((await loadSave(db)).status).toBe('loaded');
      const backup = await new Promise((resolve) => {
        const r = db.transaction('saves').objectStore('saves').get('recovery-backup');
        r.onsuccess = () => resolve(r.result);
      });
      expect(backup).toEqual(result.raw);
    }
    db.close();
  });
});
