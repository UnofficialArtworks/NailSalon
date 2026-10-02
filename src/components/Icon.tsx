import { iconLayers } from '../art/icons';
export function Icon({ id, size = 32 }: { id: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      {iconLayers(id).map((l, i) => (
        <path
          key={i}
          d={l.path}
          fill={l.fill}
          stroke={l.stroke}
          strokeWidth={l.strokeWidth ?? 3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}
export function Bottle({ color, size = 36 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 56" aria-hidden="true">
      <rect x="16" y="2" width="16" height="20" rx="4" fill="#514050" />
      <path d="M19 5v12m5-12v12m5-12v12" stroke="#ffffff25" strokeWidth="2" />
      <rect
        x="8"
        y="20"
        width="32"
        height="33"
        rx="9"
        fill={color}
        stroke="#72506333"
        strokeWidth="2"
      />
      <path d="M15 29v12" stroke="#fff9" strokeWidth="4" strokeLinecap="round" />
      <rect x="21" y="31" width="13" height="12" rx="3" fill="#fff5" />
    </svg>
  );
}
