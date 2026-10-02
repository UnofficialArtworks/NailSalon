import { useId, type ReactNode } from 'react';
import { nailContour } from '../art/contour';
import { fingerPath, FINGER_NAIL as box } from '../art/finger';
import { lengthBox } from '../art/length';
import { skinTones } from '../art/skin';
import type { NailLength, Shape } from '../game/types';

// The finger is a backdrop: painting continues to use normalized nail coordinates.
export function Finger({
  skin,
  children,
  length,
  shape = 'round',
}: {
  skin: string;
  children: ReactNode;
  length?: NailLength;
  shape?: Shape;
}) {
  const id = useId();
  const outline = fingerPath();
  const nailBox = lengthBox(box, length);
  const t = skinTones(skin);
  const base = nailBox.y + nailBox.h;
  // Trace the real lower contour of the nail so the cuticle hugs every shape and length.
  const { upper, lower } = nailContour(shape, nailBox.x, nailBox.y, nailBox.w, nailBox.h);
  const [rx, ry] = upper.match(/-?\d+(?:\.\d+)?/g)!.slice(-2);
  const fold = `M${rx} ${ry}${lower}`;
  const blur = (name: string, n: number) => (
    <filter
      id={`${id}-${name}`}
      filterUnits="userSpaceOnUse"
      x="-40"
      y="-140"
      width="320"
      height="600"
    >
      <feGaussianBlur stdDeviation={n} />
    </filter>
  );
  return (
    <div className="big-nail">
      <svg className="finger-skin" viewBox="0 -95 240 515" aria-hidden="true">
        <defs>
          <clipPath id={`${id}-clip`}>
            <path d={outline} />
          </clipPath>
          <linearGradient id={`${id}-depth`}>
            <stop stopColor={t.deep} stopOpacity=".34" />
            <stop offset=".2" stopColor={t.glow} stopOpacity=".3" />
            <stop offset=".48" stopColor={t.light} stopOpacity=".06" />
            <stop offset=".78" stopColor={t.shade} stopOpacity=".1" />
            <stop offset="1" stopColor={t.deep} stopOpacity=".38" />
          </linearGradient>
          {blur('fine', 1.2)}
          {blur('soft', 3.5)}
          {blur('wide', 9)}
        </defs>
        <path d={outline} fill={skin} />
        <path d={outline} fill={`url(#${id}-depth)`} />
        <g clipPath={`url(#${id}-clip)`}>
          <path
            d={outline}
            fill="none"
            stroke={t.deep}
            strokeOpacity=".45"
            strokeWidth="34"
            filter={`url(#${id}-wide)`}
          />
          <path
            d={`M50 ${base + 40}L48 405`}
            stroke={t.glow}
            strokeOpacity=".28"
            strokeWidth="26"
            strokeLinecap="round"
            filter={`url(#${id}-soft)`}
          />
          <path
            d={fold}
            fill="none"
            stroke={t.blush}
            strokeOpacity=".6"
            strokeWidth="22"
            strokeLinecap="round"
            filter={`url(#${id}-soft)`}
          />
          <path
            d={fold}
            fill="none"
            stroke={t.shade}
            strokeOpacity=".55"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <ellipse
            cx="120"
            cy="372"
            rx="64"
            ry="16"
            fill={t.glow}
            fillOpacity=".3"
            filter={`url(#${id}-soft)`}
          />
          <path
            d="M62 330Q118 340 178 330M72 340Q120 348 168 340M82 350Q121 356 160 350"
            fill="none"
            stroke={t.line}
            strokeOpacity=".3"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M76 360Q121 366 166 360"
            fill="none"
            stroke={t.glow}
            strokeOpacity=".5"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </g>
        <path
          d={outline}
          fill="none"
          stroke={t.line}
          strokeOpacity=".35"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
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
