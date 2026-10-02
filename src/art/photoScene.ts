import { HAND_PATH } from './handGeometry';
import { photoSettings, BACKDROPS } from '../game/photo';
import type { Manicure, PhotoSettings } from '../game/types';

// Only local catalog values enter these SVG strings; saved names are rendered as React text.
export function backdropSvg(p: PhotoSettings): string {
  const color = BACKDROPS.find((b) => b.id === p.backdrop)!.color;
  let art = '';
  for (let i = 0; i < 12; i++) {
    const x = 25 + (i % 3) * 174,
      y = 35 + Math.floor(i / 3) * 155;
    if (p.backdrop === 'candy')
      art += `<path d="M${x - 18} ${y}q-7-17 11-21q9-22 25-3q20-4 22 16q7 19-16 18h-27q-18 0-15-10" fill="#fff" opacity=".52"/>`;
    if (p.backdrop === 'ocean')
      art += `<circle cx="${x}" cy="${y}" r="15" fill="none" stroke="#fff" stroke-width="3" opacity=".6"/><circle cx="${x + 24}" cy="${y + 32}" r="5" fill="#fff" opacity=".7"/>`;
    if (p.backdrop === 'garden')
      art += `<g transform="translate(${x} ${y})" fill="#fff6dc" stroke="#efaaca" stroke-width="2"><circle cy="-9" r="8"/><circle cx="9" r="8"/><circle cy="9" r="8"/><circle cx="-9" r="8"/><circle r="5" fill="#f3c857" stroke="none"/></g>`;
  }
  return `<rect width="440" height="550" fill="${color}"/>${art}<rect x="9" y="9" width="422" height="532" rx="30" fill="none" stroke="#fff" stroke-width="3" opacity=".65"/>`;
}
export function jewelrySvg(p: PhotoSettings): string {
  let bracelet = '';
  if (p.bracelet === 'gold')
    bracelet =
      '<path d="M91 508Q207 530 330 508" fill="none" stroke="#e9aa32" stroke-width="8"/><path d="M91 506Q207 528 330 506" fill="none" stroke="#fff1b3" stroke-width="2.5"/><g transform="translate(210 519)"><circle r="10" fill="#edb640" stroke="#fff0a3" stroke-width="1.5"/><path d="m0-7 2 5 5 1-4 3 1 5-4-3-4 3 1-5-4-3 5-1z" fill="#fff9d6"/></g>';
  if (p.bracelet === 'pearls')
    bracelet = Array.from({ length: 22 }, (_, i) => {
      const x = 91 + i * 11.4,
        y = 508 + 11 * Math.sin((i / 21) * Math.PI);
      return `<circle cx="${x}" cy="${y}" r="6.5" fill="#fff4f5" stroke="#cca7bc" stroke-width="1.2"/><circle cx="${x - 2}" cy="${y - 2}" r="2" fill="#fff"/>`;
    }).join('');
  let ring = '';
  if (p.ring !== 'none')
    ring = `<g transform="translate(279 298) rotate(4)"><path d="M-24 0Q0 10 24 0" fill="none" stroke="#dca832" stroke-width="8"/><path d="M-23-2Q0 8 23-2" fill="none" stroke="#fff3aa" stroke-width="2"/>${p.ring === 'heart' ? '<path d="M0 9C-26-6-9-23 0-12C9-23 26-6 0 9Z" fill="#ef69ae" stroke="#fff0b0" stroke-width="2"/>' : '<g fill="#ba8fe5" stroke="#fff0b0" stroke-width="1.5"><circle cy="-10" r="7"/><circle cx="9" cy="-3" r="7"/><circle cx="5" cy="7" r="7"/><circle cx="-5" cy="7" r="7"/><circle cx="-9" cy="-3" r="7"/><circle cy="-1" r="5" fill="#fff0a5"/></g>'}</g>`;
  return bracelet + ring;
}
export function handSkinSvg(m: Manicure, id: string): string {
  return `<defs><clipPath id="${id}-wrist"><path d="${HAND_PATH}"/></clipPath><linearGradient id="${id}-shade"><stop stop-color="#94533b" stop-opacity=".22"/><stop offset=".24" stop-color="#fff4df" stop-opacity=".15"/><stop offset=".55" stop-color="#fff4df" stop-opacity=".04"/><stop offset="1" stop-color="#94533b" stop-opacity=".25"/></linearGradient><filter id="${id}-soft"><feGaussianBlur stdDeviation="5"/></filter></defs><path d="${HAND_PATH}" fill="${m.skin}" stroke="#78534220" stroke-width="1.5"/><path d="${HAND_PATH}" fill="url(#${id}-shade)"/><g clip-path="url(#${id}-wrist)"><path d="M52 247L70 343M122 176L136 336M198 137L201 331M271 184L269 341M368 310L340 381" fill="none" stroke="#fff5dc" stroke-opacity=".25" stroke-width="13" stroke-linecap="round" filter="url(#${id}-soft)"/></g><path d="M121 273Q137 278 152 273M191 257Q207 261 225 257M262 275Q277 280 292 274M52 303Q65 306 80 301" fill="none" stroke="#84513c18" stroke-width="1.5" stroke-linecap="round"/><g clip-path="url(#${id}-wrist)">${jewelrySvg(photoSettings(m))}</g>`;
}
export const sceneSvg = (content: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 550" width="440" height="550">${content}</svg>`;
