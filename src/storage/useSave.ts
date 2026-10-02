import { useEffect, useRef, useState } from 'react';
import { createSave } from '../game/rules';
import type { Save } from '../game/types';
import { openDatabase, loadSave, writeSave, recoverSave, type LoadResult } from './database';
export function useSave() {
  const [save, setSave] = useState<Save>(createSave),
    [ready, setReady] = useState(false),
    [notice, setNotice] = useState(''),
    [invalid, setInvalid] = useState<Extract<LoadResult, { status: 'invalid' }> | null>(null);
  const db = useRef<IDBDatabase | null>(null),
    latest = useRef(save),
    writable = useRef(false),
    queue = useRef(Promise.resolve());
  latest.current = save;
  function persist(value: Save) {
    const database = db.current;
    if (!database || !writable.current) return;
    queue.current = queue.current
      .then(() => writeSave(database, value))
      .catch(() => {
        setNotice(
          'Saving is unavailable. You can keep playing, but changes may not stay after closing. Save a picture to keep your art.',
        );
      });
  }
  useEffect(() => {
    let cancelled = false;
    void openDatabase()
      .then(async (database) => {
        if (cancelled) {
          database.close();
          return;
        }
        db.current = database;
        const result = await loadSave(database);
        if (cancelled) return;
        if (result.status === 'loaded') setSave(result.save);
        if (result.status === 'invalid') {
          setInvalid(result);
          setNotice(
            'Your saved game could not be read. It is preserved. Choose how to recover it.',
          );
        } else writable.current = true;
      })
      .catch(() => {
        if (!cancelled)
          setNotice(
            'Saving is unavailable. You can keep playing, but changes may not stay after closing.',
          );
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    const flush = () => {
      if (document.visibilityState === 'hidden') persist(latest.current);
    };
    document.addEventListener('visibilitychange', flush);
    const pagehide = () => persist(latest.current);
    window.addEventListener('pagehide', pagehide);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', flush);
      window.removeEventListener('pagehide', pagehide);
      const database = db.current;
      queue.current.finally(() => database?.close());
    };
  }, []);
  useEffect(() => {
    if (!ready || invalid) return;
    persist(save);
  }, [save, ready, invalid]);
  async function recover(previous: boolean) {
    if (!db.current || !invalid) return;
    const next = previous && invalid.previous ? invalid.previous : createSave();
    try {
      await recoverSave(db.current, next, invalid.raw);
      writable.current = true;
      setSave(next);
      setInvalid(null);
      setNotice('Save recovered. Your original unreadable save is kept as a backup.');
    } catch {
      setNotice('Recovery could not be saved. Your original game is still preserved.');
    }
  }
  return { save, setSave, ready, notice, invalid, recover };
}
