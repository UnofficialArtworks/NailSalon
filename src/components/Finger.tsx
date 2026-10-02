import { useId, type ReactNode } from 'react';
import { fingerPath, FINGER_NAIL as box } from '../art/finger';
import { lengthBox } from '../art/length';
import type { NailLength } from '../game/types';

// The finger is a backdrop: painting continues to use normalized nail coordinates.
export function Finger({
  skin,
  children,
  length,
}: {
  skin: string;
  children: ReactNode;
  length?: NailLength;
}) {
  const id = useId();
  const outline = fingerPath();
  const nailBox = lengthBox(box, length);
  return (
    <div className="big-nail">
      <svg className="finger-skin" viewBox="0 -95 240 515" aria-hidden="true">
        <defs>
          <linearGradient id={`${id}-depth`}>
            <stop stopColor="#94533b" stopOpacity=".28" />
            <stop offset=".22" stopColor="#fff4df" stopOpacity=".18" />
            <stop offset=".48" stopColor="#fff4df" stopOpacity=".04" />
            <stop offset=".75" stopColor="#94533b" stopOpacity=".04" />
            <stop offset="1" stopColor="#94533b" stopOpacity=".3" />
          </linearGradient>
        </defs>
        <g>
          <path d={outline} fill={skin} />
          <path d={outline} fill={`url(#${id}-depth)`} />
          <path
            d="M64 330Q118 339 176 330M77 337Q121 342 163 337"
            fill="none"
            stroke="#875139"
            strokeOpacity=".09"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M73 342Q119 348 168 342"
            fill="none"
            stroke="white"
            strokeOpacity=".16"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      </svg>
      <div
        className="finger-nail"
        style={{
          left: `${nailBox.x / 2.4}%`,
          top: `${(nailBox.y + 95) / 5.15}%`,
          width: `${nailBox.w / 2.4}%`,
          height: `${nailBox.h / 5.15}%`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
