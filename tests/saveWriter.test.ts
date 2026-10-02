import { expect, it, vi } from 'vitest';
import { createSave } from '../src/game/rules';
import { createSaveWriter } from '../src/storage/saveWriter';

it('finishes the in-flight write and saves only the newest waiting edit', async () => {
  let release!: () => void;
  const write = vi
    .fn()
    .mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          release = resolve;
        }),
    )
    .mockResolvedValue(undefined);
  const writer = createSaveWriter(write, vi.fn());
  const first = createSave(),
    middle = createSave(),
    newest = createSave();
  writer.enqueue(first);
  await Promise.resolve();
  writer.enqueue(middle);
  writer.enqueue(newest);
  expect(write).toHaveBeenCalledTimes(1);
  release();
  await writer.settled();
  expect(write.mock.calls.map(([value]) => value)).toEqual([first, newest]);
});

it('reports failed writes and continues saving the newest pending state', async () => {
  let fail!: (error: Error) => void;
  const write = vi
    .fn()
    .mockImplementationOnce(
      () =>
        new Promise<void>((_, reject) => {
          fail = reject;
        }),
    )
    .mockResolvedValue(undefined);
  const error = vi.fn();
  const writer = createSaveWriter(write, error);
  writer.enqueue(createSave());
  await Promise.resolve();
  const newest = createSave();
  writer.enqueue(newest);
  fail(new Error('storage unavailable'));
  await writer.settled();
  expect(error).toHaveBeenCalledTimes(1);
  expect(write).toHaveBeenLastCalledWith(newest);
});

it('starts a fresh write after the queue has drained', async () => {
  const write = vi.fn().mockResolvedValue(undefined);
  const writer = createSaveWriter(write, vi.fn());
  writer.enqueue(createSave());
  await writer.settled();
  const newest = createSave();
  writer.enqueue(newest);
  await writer.settled();
  expect(write).toHaveBeenCalledTimes(2);
  expect(write).toHaveBeenLastCalledWith(newest);
});
