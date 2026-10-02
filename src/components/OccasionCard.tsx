import type { Occasion } from '../game/occasions';

export function OccasionArt({ id }: { id: Occasion['id'] }) {
  return (
    <svg viewBox="0 0 144 80" aria-hidden="true">
      <rect
        width="144"
        height="80"
        rx="14"
        fill={
          id === 'space'
            ? '#55497d'
            : id === 'beach'
              ? '#a9e7f4'
              : id === 'garden'
                ? '#c8efd9'
                : '#ffe4f0'
        }
      />
      {id === 'rainbow' && (
        <>
          {['#f28ab5', '#ffd96f', '#98ddbd', '#8acde8', '#b498df'].map((color, i) => (
            <path
              key={color}
              d={`M${28 + i * 7} 70A${44 - i * 7} ${44 - i * 7} 0 0 1 ${116 - i * 7} 70`}
              stroke={color}
              strokeWidth="7"
              fill="none"
            />
          ))}
          <path d="M20 27Q30 43 20 58M125 32Q114 48 124 62" stroke="#ab83ba" fill="none" />
          <ellipse cx="20" cy="20" rx="9" ry="12" fill="#ec8abd" />
          <ellipse cx="125" cy="25" rx="9" ry="12" fill="#af98df" />
          <path
            d="M5 72q-4-12 8-14q5-12 15-3q12-3 15 17M101 72q-3-12 9-14q6-12 15-3q11-3 14 17"
            fill="white"
          />
        </>
      )}
      {id === 'beach' && (
        <>
          <circle cx="120" cy="18" r="11" fill="#ffe37d" />
          <path d="M0 44Q18 36 36 44T72 44T108 44T144 44V80H0Z" fill="#64cbd6" />
          <path d="M0 61Q80 48 144 65V80H0Z" fill="#ffe3a5" />
          <path d="M45 67V27M20 28Q45-6 70 28Z" stroke="#8b668d" strokeWidth="2" fill="#f593be" />
          <path d="M45 9Q33 18 33 28H56Q55 18 45 9" fill="#fff0d4" />
          <path d="M90 64q11-15 22 0l-11 9z" fill="#eab5de" stroke="#bc8db4" />
        </>
      )}
      {id === 'garden' && (
        <>
          <path d="M0 62Q36 42 72 58T144 56V80H0Z" fill="#8ad0a1" />
          <path d="M37 57H106L124 80H22Z" fill="#fff2e5" />
          <path
            d="M40 63H110M31 73H119M52 57L48 80M75 57V80M96 57L102 80"
            stroke="#f3aabd"
            strokeWidth="4"
          />
          <path d="M56 50Q55 25 84 32Q95 33 94 52" fill="none" stroke="#bc895c" strokeWidth="4" />
          <path d="M52 45H96L91 63H57Z" fill="#eac17d" stroke="#ba8d61" strokeWidth="2" />
          <path d="M16 54V33M128 51V25" stroke="#529b75" strokeWidth="3" />
          {[
            [16, 30],
            [128, 24],
          ].map(([x, y]) => (
            <g key={x} transform={`translate(${x} ${y})`} fill="#fff3fa">
              <circle cx="-5" r="5" />
              <circle cx="5" r="5" />
              <circle cy="-5" r="5" />
              <circle cy="5" r="5" />
              <circle r="3" fill="#f4ce68" />
            </g>
          ))}
        </>
      )}
      {id === 'space' && (
        <>
          <g fill="#fff4a5">
            <path d="M20 12l2 7 7 2-7 2-2 7-2-7-7-2 7-2zM118 47l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" />
            <circle cx="75" cy="13" r="2" />
            <circle cx="35" cy="62" r="2" />
            <circle cx="126" cy="12" r="2" />
          </g>
          <circle cx="103" cy="29" r="13" fill="#c7a7ee" />
          <ellipse
            cx="103"
            cy="30"
            rx="23"
            ry="5"
            transform="rotate(-20 103 30)"
            fill="none"
            stroke="#f1cd80"
            strokeWidth="3"
          />
          <g transform="translate(38 11) rotate(22 16 25)">
            <path d="M8 45L16 65L24 45" fill="#ffc772" />
            <path d="M6 42V20Q7 7 16 0Q25 7 26 20V42Z" fill="#ecf7ff" />
            <path d="M6 20Q7 7 16 0Q25 7 26 20Z" fill="#ec9abd" />
            <circle cx="16" cy="29" r="6" fill="#82cde5" />
          </g>
        </>
      )}
    </svg>
  );
}
export function OccasionCard({ occasion }: { occasion: Occasion }) {
  return (
    <div className="occasion-card">
      <OccasionArt id={occasion.id} />
      <div>
        <strong>{occasion.name}</strong>
        <p>{occasion.wish}</p>
      </div>
    </div>
  );
}
