import { validateSave } from '../game/validation';
import type { Save } from '../game/types';
export type LoadResult =
  | { status: 'empty' }
  | { status: 'loaded'; save: Save }
  | { status: 'invalid'; raw: unknown; previous: Save | null };
export function openDatabase(name = 'nail-salon-v1'): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, 1);
    request.onupgradeneeded = () => request.result.createObjectStore('saves');
    request.onsuccess = () => {
      request.result.onversionchange = () => request.result.close();
      resolve(request.result);
    };
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Save storage is busy in another tab.'));
  });
}
function read(db: IDBDatabase, key: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const r = db.transaction('saves').objectStore('saves').get(key);
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}
export async function loadSave(db: IDBDatabase): Promise<LoadResult> {
  const raw = await read(db, 'current');
  if (raw === undefined) return { status: 'empty' };
  if (validateSave(raw)) return { status: 'loaded', save: raw };
  const previous = await read(db, 'previous');
  return { status: 'invalid', raw, previous: validateSave(previous) ? previous : null };
}
export function writeSave(db: IDBDatabase, save: Save): Promise<void> {
  if (!validateSave(save))
    return Promise.reject(new Error('This design could not be saved safely.'));
  return new Promise((resolve, reject) => {
    const tx = db.transaction('saves', 'readwrite'),
      store = tx.objectStore('saves');
    const r = store.get('current');
    r.onsuccess = () => {
      if (validateSave(r.result)) store.put(r.result, 'previous');
      store.put(save, 'current');
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error ?? new Error('Save interrupted.'));
  });
}
export function recoverSave(db: IDBDatabase, save: Save, raw: unknown): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('saves', 'readwrite'),
      store = tx.objectStore('saves');
    store.put(raw, 'recovery-backup');
    store.put(save, 'current');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}
