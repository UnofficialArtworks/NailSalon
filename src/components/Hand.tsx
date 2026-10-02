import { useId } from 'react';
import { HAND_PATH, NAIL_BOXES } from '../art/render';
import type { Manicure } from '../game/types';
import { NailCanvas } from './NailCanvas';
export function Hand({
  manicure,
  selected,
  onSelect,
  small = false,
}: {
  manicure: Manicure;
  selected?: number;
  onSelect?: (i: number) => void;
  small?: boolean;
}) {
  const id = useId();
  return (
    <div className={`hand-art ${small ? 'small' : ''}`}>
      <svg className="hand-skin" viewBox="0 0 440 550" aria-hidden="true">
        <defs>
          <clipPath id={`${id}-wrist`}>
            <path d={HAND_PATH} />
          </clipPath>
          <linearGradient id={id}>
            <stop stopColor="#94533b" stopOpacity=".22" />
            <stop offset=".24" stopColor="#fff4df" stopOpacity=".15" />
            <stop offset=".55" stopColor="#fff4df" stopOpacity=".04" />
            <stop offset="1" stopColor="#94533b" stopOpacity=".25" />
          </linearGradient>
          <filter id={`${id}-soft`}>
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>
        <path d={HAND_PATH} fill={manicure.skin} stroke="#78534220" strokeWidth="1.5" />
        <path d={HAND_PATH} fill={`url(#${id})`} />
        <g clipPath={`url(#${id}-wrist)`}>
          <path
            d="M52 247L70 343M122 176L136 336M198 137L201 331M271 184L269 341M368 310L340 381"
            fill="none"
            stroke="#fff5dc"
            strokeOpacity=".25"
            strokeWidth="13"
            strokeLinecap="round"
            filter={`url(#${id}-soft)`}
          />
        </g>
        <path
          d="M121 273Q137 278 152 273M191 257Q207 261 225 257M262 275Q277 280 292 274M52 303Q65 306 80 301"
          fill="none"
          stroke="#84513c18"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <g clipPath={`url(#${id}-wrist)`}>
          <path d="M91 508Q207 530 330 508" fill="none" stroke="#e9aa32" strokeWidth="8" />
          <path d="M91 506Q207 528 330 506" fill="none" stroke="#fff1b3" strokeWidth="2.5" />
          <g transform="translate(210 519)">
            <circle r="10" fill="#edb640" stroke="#fff0a3" strokeWidth="1.5" />
            <path d="m0-7 2 5 5 1-4 3 1 5-4-3-4 3 1-5-4-3 5-1z" fill="#fff9d6" />
          </g>
        </g>
      </svg>
      {manicure.nails.map((n, i) => {
        const b = NAIL_BOXES[i],
          style = {
            left: `${b.x / 4.4}%`,
            top: `${b.y / 5.5}%`,
            width: `${b.w / 4.4}%`,
            height: `${b.h / 5.5}%`,
            transform: `rotate(${b.r}deg)`,
          };
        return (
          <div
            key={i}
            className={`hand-nail ${onSelect && selected === i ? 'chosen' : ''}`}
            style={style}
          >
            <NailCanvas nail={n} label={`Nail ${i + 1}`} />
            {onSelect && (
              <button
                className="nail-hit-target"
                aria-label={`Edit nail ${i + 1}`}
                aria-pressed={selected === i}
                onClick={() => onSelect(i)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
