// Derive a coherent set of shading tones from one skin color, so highlights and
// shadows stay warm on every skin tone instead of using fixed overlay colors.
const channels = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
export function mix(color: string, tint: string, amount: number): string {
  const from = channels(color),
    to = channels(tint);
  const out = from.map((c, i) => Math.round(c * (1 - amount) + to[i] * amount));
  return `#${out.map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}
export interface SkinTones {
  base: string;
  light: string;
  glow: string;
  shade: string;
  deep: string;
  blush: string;
  line: string;
}
export function skinTones(skin: string): SkinTones {
  return {
    base: skin,
    light: mix(skin, '#fff1dc', 0.38),
    glow: mix(skin, '#ffffff', 0.55),
    shade: mix(skin, '#a35a45', 0.3),
    deep: mix(skin, '#6d2f2f', 0.5),
    blush: mix(skin, '#ff7c8a', 0.4),
    line: mix(skin, '#5c2a24', 0.55),
  };
}
