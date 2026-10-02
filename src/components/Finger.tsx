import { useId, type ReactNode } from 'react';
import { FINGER_PATH, FINGER_NAIL as box } from '../art/finger';

// The finger is a backdrop: painting continues to use normalized nail coordinates.
export function Finger({ skin, children }: { skin: string; children: ReactNode }) {
  const id = useId();
  return (
    <div className="big-nail">
      <svg className="finger-skin" viewBox="0 0 240 420" aria-hidden="true">
        <defs>
          <linearGradient id={`${id}-depth`}>
            <stop stopColor="#714330" stopOpacity=".16" />
            <stop offset=".16" stopColor="white" stopOpacity=".13" />
            <stop offset=".45" stopColor="white" stopOpacity=".06" />
            <stop offset=".82" stopColor="#714330" stopOpacity="0" />
            <stop offset="1" stopColor="#714330" stopOpacity=".19" />
          </linearGradient>
        </defs>
        <g>
          <path d={FINGER_PATH} fill={skin} />
          <path d={FINGER_PATH} fill={`url(#${id}-depth)`} />
          <path
            d="M61 317Q114 326 178 315"
            fill="none"
            stroke="#875139"
            strokeOpacity=".13"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M68 323Q114 331 171 322"
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
          left: `${box.x / 2.4}%`,
          top: `${box.y / 4.2}%`,
          width: `${box.w / 2.4}%`,
          height: `${box.h / 4.2}%`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
