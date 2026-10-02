import { useId } from 'react';
import type { Customer } from '../game/types';
export function Portrait({ customer }: { customer: Customer }) {
  const id = useId();
  const { skin, hair, shirt, style } = customer;
  return (
    <svg viewBox="0 0 160 165" role="img" aria-label={`${customer.name}, your customer`}>
      <defs>
        <clipPath id={id}>
          <rect width="160" height="165" rx="70" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <circle cx="80" cy="80" r="75" fill="#fff0df" />
        <path d="M35 145V70C35 9 125 9 125 70V145Z" fill={hair} />
        {style % 3 === 0 && (
          <>
            <circle cx="30" cy="68" r="21" fill={hair} />
            <circle cx="130" cy="68" r="21" fill={hair} />
          </>
        )}
        <path d="M16 166Q19 122 63 122H97Q141 122 144 166Z" fill={shirt} />
        <path d="M65 105H95V130Q80 145 65 130Z" fill={skin} />
        <ellipse cx="43" cy="80" rx="8" ry="12" fill={skin} />
        <ellipse cx="117" cy="80" rx="8" ry="12" fill={skin} />
        <path d="M43 57Q80 25 117 57V85C117 130 43 130 43 85Z" fill={skin} />
        <path
          d={
            style % 2
              ? 'M39 61Q42 12 82 24Q129 17 124 75Q95 52 83 37Q75 59 39 61Z'
              : 'M40 62Q46 13 81 25Q123 19 124 61Q90 62 81 42Q70 63 40 62Z'
          }
          fill={hair}
        />
        <path
          d="M58 83Q64 77 70 83M91 83Q97 77 103 83"
          stroke="#493135"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <ellipse cx="58" cy="94" rx="8" ry="4" fill="#eb8b9766" />
        <ellipse cx="103" cy="94" rx="8" ry="4" fill="#eb8b9766" />
        <path
          d="M70 102Q81 114 93 102"
          stroke="#9d4e5f"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <path d="M40 145L55 136M120 145L105 136" stroke="#fff6" strokeWidth="4" />
        {style % 4 === 0 && <path d="M107 42L118 27L120 44L136 45L121 57L110 52Z" fill="#f3ba70" />}
      </g>
    </svg>
  );
}
