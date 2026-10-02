import { HAND_PATH, NAIL_BOXES } from './handGeometry';
import { nailContour } from './contour';
import { lengthBox } from './length';
import { skinTones, type SkinTones } from './skin';
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
// Local frame of a nail: origin at the box center, y along the finger toward the knuckles.
// The cuticle traces each nail's real lower contour, so it hugs every shape and length.
function nailFrames(m: Manicure) {
  return m.nails.map((n, i) => {
    const b = lengthBox(NAIL_BOXES[i], n.length);
    return {
      b,
      n,
      i,
      at: `translate(${(b.x + b.w / 2).toFixed(1)} ${(b.y + b.h / 2).toFixed(1)}) rotate(${b.r})`,
    };
  });
}
function nailBedSvg(m: Manicure, tones: SkinTones, id: string): string {
  return nailFrames(m)
    .map(({ b, n, at }) => {
      const { upper, lower } = nailContour(n.shape, -b.w / 2, -b.h / 2, b.w, b.h);
      // The lower arc starts where the upper one ends (the nail's right edge).
      const [rx, ry] = upper.match(/-?\d+(?:\.\d+)?/g)!.slice(-2);
      const bed = `M${rx} ${ry}${lower}`;
      return `<g transform="${at}"><path d="${bed}" fill="none" stroke="${tones.blush}" stroke-opacity=".6" stroke-width="10" stroke-linecap="round" filter="url(#${id}-bed)"/><path d="${bed}" fill="none" stroke="${tones.shade}" stroke-opacity=".55" stroke-width="3.4" stroke-linecap="round"/></g>`;
    })
    .join('');
}
// Gentle joint creases sit across each finger's own axis, so they follow its tilt.
function jointsSvg(m: Manicure, tones: SkinTones): string {
  const arc = (y: number, half: number, o: number) =>
    `<path d="M${-half} ${y}Q0 ${y + 3.4} ${half} ${y}" fill="none" stroke="${tones.line}" stroke-opacity="${o}" stroke-width="1.3" stroke-linecap="round"/>`;
  return nailFrames(m)
    .map(({ b, i, at }) => {
      const joint = b.h / 2 + b.h * (i === 0 ? 0.95 : 0.55); // first joint under the nail
      const knuckle = i === 0 ? null : joint + b.h * 1.0;
      const half = b.w * 0.3;
      return `<g transform="${at}">${arc(joint, half, 0.26)}${arc(joint + 5, half * 0.7, 0.14)}${knuckle ? arc(knuckle, half * 1.05, 0.24) + arc(knuckle + 5, half * 0.7, 0.13) : ''}</g>`;
    })
    .join('');
}
export function handSkinSvg(m: Manicure, id: string): string {
  const t = skinTones(m.skin);
  const blur = (n: number, name: string) =>
    `<filter id="${id}-${name}" filterUnits="userSpaceOnUse" x="-40" y="-40" width="520" height="630"><feGaussianBlur stdDeviation="${n}"/></filter>`;
  const defs = `<defs><clipPath id="${id}-wrist"><path d="${HAND_PATH}"/></clipPath><linearGradient id="${id}-shade" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${t.glow}" stop-opacity=".42"/><stop offset=".35" stop-color="${t.light}" stop-opacity=".14"/><stop offset=".7" stop-color="${t.shade}" stop-opacity=".12"/><stop offset="1" stop-color="${t.deep}" stop-opacity=".4"/></linearGradient><linearGradient id="${id}-wristfade" x1="0" y1="0" x2="0" y2="1"><stop offset=".7" stop-color="${t.deep}" stop-opacity="0"/><stop offset="1" stop-color="${t.deep}" stop-opacity=".32"/></linearGradient>${blur(1.2, 'fine')}${blur(3, 'soft')}${blur(6, 'wide')}${blur(12, 'broad')}<filter id="${id}-bed" filterUnits="userSpaceOnUse" x="-60" y="-60" width="120" height="140"><feGaussianBlur stdDeviation="2.2"/></filter></defs>`;
  const web = (d: string) =>
    `<path d="${d}" fill="none" stroke="${t.deep}" stroke-opacity=".5" stroke-width="7" stroke-linecap="round" filter="url(#${id}-soft)"/>`;
  const glint = (d: string, w = 11, o = 0.55) =>
    `<path d="${d}" fill="none" stroke="${t.glow}" stroke-opacity="${o}" stroke-width="${w}" stroke-linecap="round" filter="url(#${id}-soft)"/>`;
  const volume = `<path d="${HAND_PATH}" fill="none" stroke="${t.deep}" stroke-opacity=".5" stroke-width="30" stroke-linejoin="round" filter="url(#${id}-wide)"/>`;
  const gaps =
    web('M116 328L99 178') +
    web('M176.5 318L170 120') +
    web('M246.5 318L246 110') +
    web('M309 360L330 296');
  const lights =
    glint('M64 207L84 318') +
    glint('M118 150L131 306') +
    glint('M193 105L198 306') +
    glint('M268 150L267 306') +
    glint('M376 262L352 362', 12, 0.5) +
    `<ellipse cx="226" cy="408" rx="62" ry="78" fill="${t.glow}" opacity=".28" filter="url(#${id}-broad)"/><ellipse cx="338" cy="428" rx="22" ry="44" transform="rotate(26 338 428)" fill="${t.glow}" opacity=".3" filter="url(#${id}-wide)"/>`;
  return `${defs}<path d="${HAND_PATH}" fill="${t.base}"/><path d="${HAND_PATH}" fill="url(#${id}-shade)"/><g clip-path="url(#${id}-wrist)">${volume}${gaps}${lights}<rect y="440" width="440" height="110" fill="url(#${id}-wristfade)"/>${jointsSvg(m, t)}${nailBedSvg(m, t, id)}</g><path d="${HAND_PATH}" fill="none" stroke="${t.line}" stroke-opacity=".38" stroke-width="1.5" stroke-linejoin="round"/><g clip-path="url(#${id}-wrist)">${jewelrySvg(photoSettings(m))}</g>`;
}
export const sceneSvg = (content: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 550" width="440" height="550">${content}</svg>`;
