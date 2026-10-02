// Small original pentatonic music, synthesized locally without asset requests.
let context: AudioContext | null = null,
  musicTimer: number | undefined,
  musicOn = false,
  effectsOn = true,
  noteIndex = 0;
const melody = [60, 64, 67, 69, 67, 64, 62, 64, 67, 72, 69, 67, 64, 62, 60, 0];
function getContext() {
  const AudioBackend =
    window.AudioContext ??
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioBackend) return null;
  context ??= new AudioBackend();
  if (context.state === 'suspended') void context.resume().catch(() => {});
  return context;
}
function note(midi: number, duration: number, volume: number, type: OscillatorType = 'sine') {
  const c = getContext();
  if (!c) return;
  const o = c.createOscillator(),
    g = c.createGain();
  o.type = type;
  o.frequency.value = 440 * 2 ** ((midi - 69) / 12);
  g.gain.setValueAtTime(0, c.currentTime);
  g.gain.linearRampToValueAtTime(volume, c.currentTime + 0.035);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  o.connect(g);
  g.connect(c.destination);
  o.start();
  o.stop(c.currentTime + duration + 0.05);
}
function stop() {
  window.clearInterval(musicTimer);
  musicTimer = undefined;
}
export function audioSettings(music: boolean, effects: boolean) {
  musicOn = music;
  effectsOn = effects;
  if (!music) stop();
  else if (context && document.visibilityState === 'visible') start();
}
function start() {
  if (musicTimer !== undefined || !musicOn) return;
  musicTimer = window.setInterval(() => {
    const midi = melody[noteIndex++ % melody.length];
    if (midi) note(midi, 0.8, 0.025);
    if (noteIndex % 4 === 0) note(48, 1.7, 0.012);
  }, 420);
}
export function awakenAudio() {
  try {
    if (getContext()) start();
  } catch {
    /* Visual gameplay remains usable when audio is unavailable. */
  }
}
export function sound(kind: 'tap' | 'reward' | 'paint' = 'tap') {
  if (!effectsOn) return;
  try {
    if (kind === 'reward') {
      [72, 76, 79].forEach((n, i) => window.setTimeout(() => note(n, 0.35, 0.07), i * 100));
    } else note(kind === 'paint' ? 84 : 79, 0.08, 0.025);
  } catch {
    /* Audio is optional. */
  }
}
export function audioVisibility() {
  if (document.hidden) {
    stop();
    void context?.suspend();
  } else if (context) {
    void context.resume().catch(() => {});
    start();
  }
}
export function disposeAudio() {
  stop();
  void context?.close();
  context = null;
}
