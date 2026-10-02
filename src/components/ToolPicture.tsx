import { Bottle, Icon } from './Icon';
import type { Tool } from '../game/types';

export function ToolPicture({ tool }: { tool: Tool }) {
  if (tool === 'brush') return <Bottle color="#ff49b5" size={42} />;
  if (tool === 'sticker') return <Icon id="sticker-3" size={40} />;
  return (
    <svg width="40" height="40" viewBox="0 0 64 64" aria-hidden="true">
      {tool === 'clean' && (
        <>
          <rect
            x="10"
            y="25"
            width="44"
            height="28"
            rx="13"
            fill="#57ead9"
            stroke="#129bac"
            strokeWidth="3"
          />
          <path d="M19 34h25" stroke="white" strokeWidth="5" strokeLinecap="round" />
          <circle cx="43" cy="12" r="8" fill="#d9fcff" stroke="#70cae7" strokeWidth="2" />
          <circle cx="18" cy="17" r="5" fill="white" />
        </>
      )}
      {tool === 'pattern' && (
        <>
          <rect
            x="14"
            y="5"
            width="36"
            height="54"
            rx="17"
            fill="#b47bff"
            stroke="#7544bd"
            strokeWidth="3"
          />
          {[20, 32, 44].map((y) => (
            <path key={y} d={`M15 ${y}h34`} stroke="#fff5ac" strokeWidth="5" />
          ))}
        </>
      )}
      {tool === 'gem' && (
        <>
          <path d="M18 10h28l15 19-29 31L3 29Z" fill="#33e6da" stroke="#168eae" strokeWidth="3" />
          <path d="m18 10 14 19 14-19M3 29h58M32 29v31" stroke="#b5ffff" strokeWidth="3" />
          <path d="m32 4 2 8 8 2-8 2-2 8-2-8-8-2 8-2Z" fill="white" />
        </>
      )}
      {tool === 'eraser' && (
        <>
          <path
            d="m10 39 26-29q4-4 8 0l13 12q4 4 0 8L34 56H21Z"
            fill="#ff80bd"
            stroke="#a6478c"
            strokeWidth="3"
          />
          <path d="m10 39 11 17h13l10-12-18-17Z" fill="#e7e7ff" />
          <path d="M24 56h34" stroke="#8c63af" strokeWidth="3" />
        </>
      )}
      {tool === 'move' && (
        <>
          <path
            d="M32 6v52M6 32h52m-35-17 9-9 9 9M23 49l9 9 9-9M15 23l-9 9 9 9m34-18 9 9-9 9"
            fill="none"
            stroke="#a04cdb"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="32" cy="32" r="7" fill="#ffe877" />
        </>
      )}
    </svg>
  );
}
