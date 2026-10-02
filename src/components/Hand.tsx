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
          <linearGradient id={id} x1="0" x2="1" y1="0" y2=".5">
            <stop stopColor={manicure.skin} />
            <stop offset=".6" stopColor={manicure.skin} />
            <stop offset="1" stopColor="#fff" stopOpacity=".12" />
          </linearGradient>
        </defs>
        <path d={HAND_PATH} fill={manicure.skin} stroke="#78534235" strokeWidth="2" />
        <path d={HAND_PATH} fill={`url(#${id})`} />
        <path
          d="M183 287Q195 298 209 290M264 291Q279 300 291 294M144 322Q157 331 174 321M322 322Q336 333 349 323M159 407Q183 391 202 396M203 468Q255 449 302 462"
          fill="none"
          stroke="#84513c25"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <g clipPath={`url(#${id}-wrist)`}>
          <path d="M150 495Q240 517 339 495" fill="none" stroke="#e9aa32" strokeWidth="10" />
          <path d="M150 493Q240 515 339 493" fill="none" stroke="#fff1b3" strokeWidth="3" />
          <g transform="translate(245 506)">
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
