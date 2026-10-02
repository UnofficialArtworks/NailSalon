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
        <path d="M166 497Q240 514 334 497" fill="none" stroke="#efb74f" strokeWidth="11" />
        <path d="M168 495Q242 511 331 495" fill="none" stroke="#ffe8a5" strokeWidth="3" />
        <circle cx="255" cy="510" r="10" fill="#f1bf5a" />
        <path d="m255 502 2 5 5 1-4 3 1 5-4-3-4 3 1-5-4-3 5-1z" fill="#fff4cf" />
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
        return onSelect ? (
          <button
            key={i}
            className={`hand-nail ${selected === i ? 'chosen' : ''}`}
            style={style}
            aria-label={`Edit nail ${i + 1}`}
            aria-pressed={selected === i}
            onClick={() => onSelect(i)}
          >
            <NailCanvas nail={n} label={`Nail ${i + 1}`} />
          </button>
        ) : (
          <div key={i} className="hand-nail" style={style}>
            <NailCanvas nail={n} label={`Nail ${i + 1}`} />
          </div>
        );
      })}
    </div>
  );
}
