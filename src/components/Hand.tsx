import { useId } from 'react';
import { NAIL_BOXES } from '../art/handGeometry';
import { handSkinSvg } from '../art/photoScene';
import type { Manicure } from '../game/types';
import { NailCanvas } from './NailCanvas';
import { lengthBox } from '../art/length';
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
      <svg
        className="hand-skin"
        viewBox="0 0 440 550"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: handSkinSvg(manicure, id) }}
      />
      {manicure.nails.map((n, i) => {
        const b = lengthBox(NAIL_BOXES[i], n.length),
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
