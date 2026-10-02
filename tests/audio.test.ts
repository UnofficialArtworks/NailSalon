import { afterEach, expect, it, vi } from 'vitest';
import { audioSettings, awakenAudio, sound, disposeAudio } from '../src/audio/sound';
afterEach(() => {
  disposeAudio();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
it('does not throw from delayed rewards when the audio backend is missing', () => {
  vi.useFakeTimers();
  vi.stubGlobal('window', { setTimeout, clearInterval, setInterval });
  vi.stubGlobal('AudioContext', undefined);
  audioSettings(true, true);
  expect(() => awakenAudio()).not.toThrow();
  sound('reward');
  expect(() => vi.runAllTimers()).not.toThrow();
});
