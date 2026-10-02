import { skipPreparation } from './helpers.ts';
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

// Local synthetic benchmark, using the actual autosave hook and browser IndexedDB.
// No instrumentation is shipped in the game. This is not an iPad measurement.
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });
  await page.addInitScript(() => {
    window.saveMetrics = { durations: [], pending: 0, maxPending: 0 };
    const put = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (value, key) {
      if (key === 'current' && this.transaction.db.name === 'nail-salon-v1')
        this.transaction.savedFill = value.active.nails[0].fillColorId;
      return put.call(this, value, key);
    };
    const original = IDBDatabase.prototype.transaction;
    IDBDatabase.prototype.transaction = function (...args) {
      const tx = original.apply(this, args);
      if (args[1] === 'readwrite' && this.name === 'nail-salon-v1') {
        const metrics = window.saveMetrics;
        const started = performance.now();
        metrics.pending++;
        metrics.maxPending = Math.max(metrics.maxPending, metrics.pending);
        tx.addEventListener('complete', () => {
          metrics.pending--;
          metrics.durations.push(performance.now() - started);
          metrics.lastCompletedFill = tx.savedFill;
        });
      }
      return tx;
    };
  });
  await page.goto('http://127.0.0.1:4173');
  await page.getByRole('button', { name: 'Let’s create!' }).click();
  await skipPreparation(page);
  const bytes = await page.evaluate(async () => {
    const { createSave } = await import('/src/game/rules.ts');
    const { openDatabase, writeSave } = await import('/src/storage/database.ts');
    const state = createSave();
    state.settings = { music: false, effects: false, tutorialSeen: true };
    state.gallery = Array.from({ length: 50 }, (_, entry) => {
      const manicure = createSave().active;
      manicure.nails.forEach((nail, index) => {
        nail.baseColorId = nail.fillColorId = 'color-0';
        nail.strokes = Array.from({ length: 12 }, (_, stroke) => ({
          colorId: 'color-0',
          width: 0.09,
          erase: false,
          points: Array.from({ length: 80 }, (_, point) => ({
            x: 0.1 + ((point * 7 + stroke + entry) % 80) / 100,
            y: 0.1 + ((point * 3 + index + entry) % 80) / 100,
          })),
        }));
      });
      return { id: `stress-${entry}`, createdAt: new Date().toISOString(), manicure };
    });
    const db = await openDatabase();
    await writeSave(db, state);
    db.close();
    return new Blob([JSON.stringify(state)]).size;
  });
  await page.reload();
  await skipPreparation(page);
  await page.getByRole('button', { name: 'Edit nail 1', exact: true }).click();
  await page.waitForFunction(
    () => window.saveMetrics.pending === 0 && window.saveMetrics.durations.length > 0,
  );
  const edits = 40;
  const result = await page.evaluate(async (count) => {
    const metrics = window.saveMetrics;
    metrics.durations = [];
    metrics.maxPending = 0;
    metrics.lastCompletedFill = 'waiting';
    const button = [...document.querySelectorAll('button')].find((b) =>
      b.textContent.includes('Fill this nail'),
    );
    const started = performance.now();
    for (let i = 0; i < count; i++) {
      button.click();
      await new Promise((resolve) => setTimeout(resolve, 15));
    }
    const burstMs = performance.now() - started;
    [...document.querySelectorAll('button')]
      .find((b) => b.textContent.includes('Clear nail'))
      .click();
    const ended = performance.now();
    while (metrics.lastCompletedFill !== null || metrics.pending > 0) {
      if (performance.now() - ended > 60000)
        throw new Error('Autosave did not drain within 60 seconds');
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
    const { openDatabase, loadSave } = await import('/src/storage/database.ts');
    const db = await openDatabase();
    const loaded = await loadSave(db);
    db.close();
    return {
      burstMs,
      drainMs: performance.now() - ended,
      writes: metrics.durations.length,
      averageWriteMs: metrics.durations.reduce((a, b) => a + b, 0) / metrics.durations.length,
      maxWriteMs: Math.max(...metrics.durations),
      maxConcurrentWrites: metrics.maxPending,
      galleryEntries: loaded.status === 'loaded' ? loaded.save.gallery.length : -1,
      galleryPoints:
        loaded.status === 'loaded'
          ? loaded.save.gallery.reduce(
              (total, entry) =>
                total +
                entry.manicure.nails.reduce(
                  (points, nail) =>
                    points + nail.strokes.reduce((sum, stroke) => sum + stroke.points.length, 0),
                  0,
                ),
              0,
            )
          : -1,
      latestEditSaved:
        loaded.status === 'loaded' && loaded.save.active.nails[0].fillColorId === null,
    };
  }, edits);
  assert.equal(result.galleryEntries, 50);
  assert.equal(result.galleryPoints, 240000);
  assert.equal(result.latestEditSaved, true);
  const report = {
    desktopSynthetic: true,
    engine: 'chromium',
    galleryEntries: 50,
    pointsPerDesign: 4800,
    jsonBytes: bytes,
    edits,
    ...result,
  };
  await mkdir('test-results', { recursive: true });
  await writeFile('test-results/storage-performance.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
