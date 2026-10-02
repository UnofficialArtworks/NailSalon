import type { Save } from '../game/types';

// One transaction at a time; superseded waiting snapshots need not be written.
export function createSaveWriter(write: (value: Save) => Promise<void>, onError: () => void) {
  let pending: Save | null = null;
  let running: Promise<void> | null = null;

  function start() {
    running = Promise.resolve()
      .then(async () => {
        while (pending) {
          const value = pending;
          pending = null;
          try {
            await write(value);
          } catch {
            onError();
          }
        }
      })
      .finally(() => {
        running = null;
        if (pending) start();
      });
  }
  return {
    enqueue(value: Save) {
      pending = value;
      if (!running) start();
    },
    async settled() {
      while (running) await running;
    },
  };
}
