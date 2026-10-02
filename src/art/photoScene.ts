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
    if (p.backdrop === 'starlight')
      art += `<g transform="translate(${x} ${y})" fill="#fff5bc"><path d="M0-11 3-3 11 0 3 3 0 11-3 3-11 0-3-3Z"/><circle cx="31" cy="27" r="2"/></g>`;
  }
  if (p.backdrop === 'rainbow') {
    art += ['#f596ba', '#ffc575', '#ffec9c', '#9ddbc4', '#a7d9f2', '#bea0e8']
      .map(
        (c, i) =>
          `<path d="M-50 205Q220 ${-100 + i * 29} 490 205" fill="none" stroke="${c}" stroke-width="25"/>`,
      )
      .join('');
    art +=
      '<g fill="#fff" opacity=".8"><ellipse cx="34" cy="201" rx="64" ry="25"/><ellipse cx="403" cy="201" rx="64" ry="25"/></g>';
  }
  if (p.backdrop === 'sunset')
    art +=
      '<circle cx="330" cy="88" r="52" fill="#fff3b9"/><path d="M0 180Q110 130 230 180T440 180V550H0Z" fill="#edabb9" opacity=".4"/><path d="M0 275Q170 190 440 270V550H0Z" fill="#cbb4ea" opacity=".35"/>';
  return `<rect width="440" height="550" fill="${color}"/>${art}<rect x="9" y="9" width="422" height="532" rx="30" fill="none" stroke="#fff" stroke-width="3" opacity=".65"/>`;
}
// Foreground stays around the scene edges so the manicure remains the focus.
// Both the browser preview and PNG export draw this after the hand and nail art.
export function photoOverlaySvg(p: PhotoSettings): string {
  let art = '';
  if (p.frame === 'postcard')
    art +=
      '<rect x="8" y="8" width="424" height="534" rx="22" fill="none" stroke="#fffaf0" stroke-width="16"/><path d="M29 27H411V523H29Z" fill="none" stroke="#d99bb7" stroke-width="2" stroke-dasharray="6 5"/>';
  if (p.frame === 'rainbow')
    art += ['#f39ebc', '#ffe498', '#9ddfc9', '#b9b0ee']
      .map(
        (c, i) =>
          `<rect x="${5 + i * 5}" y="${5 + i * 5}" width="${430 - i * 10}" height="${540 - i * 10}" rx="${30 - i * 5}" fill="none" stroke="${c}" stroke-width="5"/>`,
      )
      .join('');
  if (p.frame === 'sparkle') {
    art +=
      '<rect x="12" y="12" width="416" height="526" rx="26" fill="none" stroke="#f4ca69" stroke-width="9"/><rect x="12" y="12" width="416" height="526" rx="26" fill="none" stroke="#fff7d1" stroke-width="2"/>';
    for (const [x, y] of [
      [25, 25],
      [415, 25],
      [25, 525],
      [415, 525],
    ])
      art += `<path transform="translate(${x} ${y})" d="M0-16 4-4 16 0 4 4 0 16-4 4-16 0-4-4Z" fill="#fff9d6" stroke="#dfaf45"/>`;
  }
  for (const [x, y, rotation] of [
    [43, 430, -22],
    [397, 440, 22],
  ]) {
    const flower =
      '<g fill="#fca9cc" stroke="#fff7ee" stroke-width="2"><circle cy="-15" r="12"/><circle cx="14" cy="-4" r="12"/><circle cx="9" cy="13" r="12"/><circle cx="-9" cy="13" r="12"/><circle cx="-14" cy="-4" r="12"/><circle r="8" fill="#ffe187"/></g>';
    if (p.props === 'flowers')
      art += `<g transform="translate(${x} ${y}) rotate(${rotation})"><path d="M0 0Q-5 40 9 66" fill="none" stroke="#72b793" stroke-width="5"/><ellipse cx="-8" cy="36" rx="14" ry="6" fill="#9acda4" transform="rotate(30 -8 36)"/>${flower}</g>`;
    if (p.props === 'shells')
      art += `<g transform="translate(${x} ${y}) rotate(${rotation})"><path d="M0 25C-70-30-23-57 0-33C23-57 70-30 0 25Z" fill="#ffc7b6" stroke="#e59aa6" stroke-width="3"/><path d="M0 22V-31M0 22-21-29M0 22 21-29" stroke="#fff3e7" stroke-width="3"/><circle cy="47" r="9" fill="#fff8ef" stroke="#c9b0ce" stroke-width="2"/></g>`;
  }
  if (p.props === 'party')
    for (let i = 0; i < 24; i++) {
      const x = i % 2 ? 409 - (i % 3) * 12 : 25 + (i % 3) * 12;
      const y = 42 + Math.floor(i / 2) * 38;
      art += `<rect x="${x}" y="${y}" width="7" height="15" rx="2" transform="rotate(${i * 31} ${x} ${y})" fill="${['#f899c6', '#ffda77', '#8bdacf', '#baa1ef'][i % 4]}"/>`;
    }
  return art;
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
  if (p.bracelet === 'ribbon')
    bracelet =
      '<path d="M91 508Q207 530 330 508" fill="none" stroke="#ee89b4" stroke-width="12"/><path d="M91 506Q207 528 330 506" fill="none" stroke="#ffc8df" stroke-width="3"/><g transform="translate(210 519)"><path d="M0 0C-47-32-40 29 0 0C40 29 47-32 0 0M-4 0-15 26 1 20 14 26 5 0" fill="#f8a1c8" stroke="#c9689b" stroke-width="2"/><circle r="5" fill="#ffe3ef"/></g>';
  let ring = '';
  if (p.ring === 'heart' || p.ring === 'flower')
    ring = `<g transform="translate(279 298) rotate(4)"><path d="M-24 0Q0 10 24 0" fill="none" stroke="#dca832" stroke-width="8"/><path d="M-23-2Q0 8 23-2" fill="none" stroke="#fff3aa" stroke-width="2"/>${p.ring === 'heart' ? '<path d="M0 9C-26-6-9-23 0-12C9-23 26-6 0 9Z" fill="#ef69ae" stroke="#fff0b0" stroke-width="2"/>' : '<g fill="#ba8fe5" stroke="#fff0b0" stroke-width="1.5"><circle cy="-10" r="7"/><circle cx="9" cy="-3" r="7"/><circle cx="5" cy="7" r="7"/><circle cx="-5" cy="7" r="7"/><circle cx="-9" cy="-3" r="7"/><circle cy="-1" r="5" fill="#fff0a5"/></g>'}</g>`;
  if (p.ring === 'star')
    ring =
      '<g transform="translate(279 298) rotate(4)"><path d="M-24 0Q0 10 24 0" fill="none" stroke="#dca832" stroke-width="8"/><path d="m0-17 5 10 11 2-8 8 2 11-10-5-10 5 2-11-8-8 11-2z" fill="#95dcda" stroke="#fff2b3" stroke-width="2"/><path d="m-3-9 3 6 6 1" fill="none" stroke="#fff" stroke-width="2"/></g>';
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
