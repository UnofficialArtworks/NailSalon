import { useId } from 'react';
import { mix, skinTones } from '../art/skin';
import type { Customer } from '../game/types';

const EYES = ['#5b3a29', '#3d7b68', '#4a77b4', '#7b5a2b', '#6b4a8c', '#33414f'];
const FRINGES = [
  // side-swept, center-parted, then straight bangs
  'M41 78C40 36 62 25 82 26C108 27 121 46 119 78C104 63 91 50 84 37C78 55 60 68 41 78Z',
  'M41 80C39 38 61 25 80 25C99 25 121 38 119 80C101 71 89 53 80 40C71 53 59 71 41 80Z',
  'M40 84C35 36 59 23 80 23C101 23 125 36 120 84Q100 54 80 54Q60 54 40 84Z',
];

// Layered, flat-shaded busts; every customer varies by hairstyle, eyes and accessory.
export function Portrait({
  customer,
  happy = false,
  wave = false,
}: {
  customer: Customer;
  happy?: boolean;
  wave?: boolean;
}) {
  const id = useId();
  const { skin, hair, shirt, style } = customer;
  const t = skinTones(skin);
  const hairLight = mix(hair, '#ffffff', 0.3);
  const hairDeep = mix(hair, '#1b1020', 0.35);
  const shirtDeep = mix(shirt, '#5a3a6a', 0.25);
  const cut = style % 6;
  const eye = EYES[(style * 5 + 1) % 6];
  const fringe = FRINGES[cut % 3];
  const freckles = style % 5 === 1;
  const openSmile = happy || style % 3 === 0;
  const lash = mix(hair, '#1b1020', 0.6);
  return (
    <svg viewBox="0 0 160 165" role="img" aria-label={`${customer.name}, your customer`}>
      <defs>
        <clipPath id={id}>
          <rect width="160" height="165" rx="70" />
        </clipPath>
        <radialGradient id={`${id}-bg`} cx=".5" cy=".38" r=".7">
          <stop stopColor="#fffaf1" />
          <stop offset="1" stopColor={mix('#ffe9d6', shirt, 0.28)} />
        </radialGradient>
        <linearGradient id={`${id}-face`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor={t.light} stopOpacity=".55" />
          <stop offset=".45" stopColor={t.base} stopOpacity="0" />
          <stop offset="1" stopColor={t.shade} stopOpacity=".38" />
        </linearGradient>
        <linearGradient id={`${id}-hair`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor={hairLight} stopOpacity=".55" />
          <stop offset=".5" stopColor={hair} stopOpacity="0" />
          <stop offset="1" stopColor={hairDeep} stopOpacity=".5" />
        </linearGradient>
      </defs>
      <g clipPath={`url(#${id})`}>
        <circle cx="80" cy="80" r="76" fill={`url(#${id}-bg)`} />
        {/* back hair */}
        {cut === 0 && (
          <>
            <path d="M33 150V80C33 28 127 28 127 80V150Z" fill={hair} />
            <circle cx="47" cy="30" r="15" fill={hair} />
            <circle cx="113" cy="30" r="15" fill={hair} />
            <circle cx="47" cy="30" r="15" fill={`url(#${id}-hair)`} />
            <circle cx="113" cy="30" r="15" fill={`url(#${id}-hair)`} />
            <rect
              x="36"
              y="40"
              width="22"
              height="6"
              rx="3"
              fill={shirt}
              transform="rotate(-24 47 43)"
            />
            <rect
              x="102"
              y="40"
              width="22"
              height="6"
              rx="3"
              fill={shirt}
              transform="rotate(24 113 43)"
            />
          </>
        )}
        {cut === 1 && <path d="M29 156V76C29 22 131 22 131 76V156Z" fill={hair} />}
        {cut === 2 && (
          <path d="M33 124C24 72 38 24 80 24S136 72 127 124Q80 136 33 124Z" fill={hair} />
        )}
        {cut === 3 && (
          <>
            <path d="M38 124V70C38 20 122 20 122 70V124Z" fill={hair} />
            {[
              [34, 74, 20],
              [126, 74, 20],
              [44, 42, 20],
              [116, 42, 20],
              [80, 24, 22],
            ].map(([x, y, r]) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill={hair} />
            ))}
          </>
        )}
        {cut === 4 && (
          <>
            <path d="M36 118V76C36 26 124 26 124 76V118Z" fill={hair} />
            <path d="M120 50C154 48 158 104 138 134C134 116 136 100 124 86Z" fill={hair} />
            <path
              d="M126 70C142 74 148 100 140 124"
              fill="none"
              stroke={hairLight}
              strokeOpacity=".35"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </>
        )}
        {cut === 5 && (
          <>
            <path d="M36 112V76C36 26 124 26 124 76V112Z" fill={hair} />
            {[34, 126].map((x) => (
              <g key={x}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <ellipse
                    key={i}
                    cx={x + (x < 80 ? 1 : -1) * (i % 2 ? 1.5 : -1.5)}
                    cy={96 + i * 13}
                    rx="9"
                    ry="8"
                    fill={i % 2 ? hairDeep : hair}
                  />
                ))}
                <rect x={x - 8} y="158" width="16" height="5" rx="2.5" fill={shirt} />
              </g>
            ))}
          </>
        )}
        {/* shoulders, neck and shirt */}
        <path d="M63 108H97V138Q80 150 63 138Z" fill={t.base} />
        <path d="M63 108H97V126Q80 134 63 126Z" fill={t.shade} fillOpacity=".55" />
        <path
          d="M12 168C14 138 44 131 63 130Q80 148 97 130C116 131 146 138 148 168Z"
          fill={shirt}
        />
        <path
          d="M63 130Q80 148 97 130"
          fill="none"
          stroke={shirtDeep}
          strokeOpacity=".55"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M34 158L48 142M126 158L112 142"
          stroke="#fff"
          strokeOpacity=".45"
          strokeWidth="4"
          strokeLinecap="round"
        />
        {style % 4 === 2 && (
          <path
            d="M80 150C71 143 74 138 80 143C86 138 89 143 80 150Z"
            fill="#ee6c98"
            stroke="#fff6"
            strokeWidth="1"
          />
        )}
        {/* ears and earrings */}
        <ellipse cx="42" cy="86" rx="8" ry="11" fill={t.base} />
        <ellipse cx="118" cy="86" rx="8" ry="11" fill={t.base} />
        <ellipse cx="42" cy="87" rx="4" ry="6" fill={t.blush} fillOpacity=".5" />
        <ellipse cx="118" cy="87" rx="4" ry="6" fill={t.blush} fillOpacity=".5" />
        {style % 3 !== 2 && (
          <>
            <circle cx="42" cy="99" r="3.2" fill="#f3c15a" stroke="#fff3b8" strokeWidth=".8" />
            <circle cx="118" cy="99" r="3.2" fill="#f3c15a" stroke="#fff3b8" strokeWidth=".8" />
          </>
        )}
        {/* face */}
        <path
          d="M44 78C44 42 60 31 80 31C100 31 116 42 116 78C116 112 100 128 80 128C60 128 44 112 44 78Z"
          fill={t.base}
        />
        <path
          d="M44 78C44 42 60 31 80 31C100 31 116 42 116 78C116 112 100 128 80 128C60 128 44 112 44 78Z"
          fill={`url(#${id}-face)`}
        />
        <ellipse
          cx="66"
          cy="50"
          rx="14"
          ry="6"
          fill={t.glow}
          fillOpacity=".35"
          transform="rotate(-20 66 50)"
        />
        {/* hair front */}
        <path d={fringe} fill={hair} />
        <path d={fringe} fill={`url(#${id}-hair)`} />
        <path
          d="M52 50Q68 33 94 40"
          fill="none"
          stroke={hairLight}
          strokeOpacity=".45"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {cut === 1 && (
          <>
            <path d="M33 78C34 44 52 32 62 40C48 52 40 66 36 108Z" fill={hair} />
            <path d="M127 78C126 44 108 32 98 40C112 52 120 66 124 108Z" fill={hair} />
          </>
        )}
        {cut === 2 && (
          <>
            <path d="M38 80C38 52 44 46 50 44C46 66 46 90 50 108C42 104 38 96 38 80Z" fill={hair} />
            <path
              d="M122 80C122 52 116 46 110 44C114 66 114 90 110 108C118 104 122 96 122 80Z"
              fill={hair}
            />
          </>
        )}
        {cut === 4 && (
          <circle cx="124" cy="56" r="6" fill={shirt} stroke="#fff8" strokeWidth="1.2" />
        )}
        {/* brows */}
        <path
          d="M54 70Q63 64 72 68M88 68Q97 64 106 70"
          fill="none"
          stroke={hairDeep}
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        {/* eyes */}
        {[63, 97].map((x) => (
          <g key={x}>
            <ellipse cx={x} cy="86" rx="8.4" ry="9.4" fill="#fff" />
            <ellipse cx={x} cy="87" rx="6.4" ry="7.4" fill={eye} />
            <ellipse cx={x} cy="87.5" rx="3.6" ry="4.4" fill="#241418" />
            <circle cx={x - 2.4} cy="83.6" r="2.5" fill="#fff" />
            <circle cx={x + 2.4} cy="91" r="1.2" fill="#fff" fillOpacity=".85" />
            <path
              d={`M${x - 9} 87Q${x - 8} 77 ${x} 76.6Q${x + 8} 77 ${x + 9} 87`}
              fill="none"
              stroke={lash}
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </g>
        ))}
        <path d="M54 82L50 79M106 82L110 79" stroke={lash} strokeWidth="2" strokeLinecap="round" />
        {/* cheeks, nose, mouth */}
        <ellipse cx="55" cy="102" rx="9" ry="5" fill="#ff7b8e" fillOpacity={happy ? '.5' : '.3'} />
        <ellipse cx="105" cy="102" rx="9" ry="5" fill="#ff7b8e" fillOpacity={happy ? '.5' : '.3'} />
        {freckles &&
          [
            [52, 98],
            [58, 101],
            [50, 104],
            [108, 98],
            [102, 101],
            [110, 104],
          ].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="1.1" fill={t.line} fillOpacity=".45" />
          ))}
        <path
          d="M78 98Q80 101 82.5 98"
          fill="none"
          stroke={t.shade}
          strokeWidth="2"
          strokeLinecap="round"
        />
        {openSmile ? (
          <>
            <path
              d="M68 106Q80 124 92 106Z"
              fill="#9b3e56"
              stroke="#9b3e56"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M71 107.5Q80 111 89 107.5"
              fill="none"
              stroke="#fff"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <path d="M74 115Q80 120 86 115Q80 112 74 115Z" fill="#f2798f" />
          </>
        ) : (
          <>
            <path
              d="M69 107Q80 118 91 107"
              fill="none"
              stroke="#a54660"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M75 112.5Q80 116 85 112.5"
              fill="none"
              stroke="#f2798f"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </>
        )}
        {/* accessory */}
        {style % 4 === 0 && (
          <path
            d="M107 42L118 27L120 44L136 45L121 57L110 52Z"
            fill="#f3ba70"
            stroke="#fff3c0"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        )}
        {style % 4 === 1 && (
          <g transform="translate(50 40)">
            {[0, 72, 144, 216, 288].map((a) => (
              <ellipse
                key={a}
                cx="0"
                cy="-5.5"
                rx="3.6"
                ry="5"
                fill="#fff"
                stroke="#f1a9c6"
                strokeWidth=".9"
                transform={`rotate(${a})`}
              />
            ))}
            <circle r="3" fill="#f5c84f" />
          </g>
        )}
      </g>
      {wave && (
        <g className="customer-wave">
          <path
            d="M117 158Q145 158 140 131"
            fill="none"
            stroke={shirt}
            strokeWidth="18"
            strokeLinecap="round"
          />
          <path
            d="M132 132L127 119Q124 113 128 112L132 118L130 104Q130 99 134 101L136 114L137 100Q139 96 141 101L141 114L145 104Q148 101 149 106L146 117L151 112Q155 110 155 115L147 128Q145 137 137 135Z"
            fill={t.base}
            stroke={t.line}
            strokeWidth="1"
          />
        </g>
      )}
      {happy && (
        <g fill="#f489bc" aria-hidden="true">
          <path d="M19 84c-16-12-4-22 2-13c7-9 17 1-2 13zM141 77c-14-10-4-19 1-11c6-8 16 1-1 11z" />
        </g>
      )}
    </svg>
  );
}
