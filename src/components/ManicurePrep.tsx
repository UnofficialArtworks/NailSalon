import { SHAPES, SKINS } from '../game/catalog';
import type { Nail, Shape } from '../game/types';
import { NailCanvas } from './NailCanvas';
import { ToolPicture } from './ToolPicture';

export function ManicurePrep({
  nail,
  clean,
  shape,
  skin,
  setSkin,
  isFree,
  paint,
}: {
  nail: Nail;
  clean: () => void;
  shape: (shape: Shape) => void;
  skin: string;
  setSkin: (skin: string) => void;
  isFree: boolean;
  paint: () => void;
}) {
  return (
    <section className="manicure-prep" aria-label="Manicure preparation">
      <div className="prep-heading">
        <ToolPicture tool="clean" />
        <div>
          <h3>1. Wash & wipe</h3>
          <p>Swipe your nail, or tap to clean.</p>
        </div>
        <button onClick={clean}>{nail.cleaned ? 'Clean again' : 'Clean this nail'}</button>
      </div>
      <h3>2. Pick a nail shape</h3>
      <div className="shape-buttons">
        {SHAPES.map((s) => (
          <button
            key={s.id}
            aria-label={s.name}
            aria-pressed={nail.shape === s.id}
            onClick={() => shape(s.id)}
          >
            <span className="shape-tile">
              <NailCanvas
                nail={{
                  ...nail,
                  shape: s.id,
                  cleaned: true,
                  fillColorId: null,
                  baseColorId: null,
                  strokes: [],
                  decorations: [],
                  patternId: null,
                }}
                label={`${s.name} shape`}
              />
            </span>
            {s.name}
          </button>
        ))}
      </div>
      {isFree && (
        <div className="skin-tones" aria-label="Hand skin tone">
          {SKINS.map((tone, i) => (
            <button
              key={tone}
              className={skin === tone ? 'selected' : ''}
              style={{ background: tone }}
              aria-label={`Skin tone ${i + 1}`}
              aria-pressed={skin === tone}
              onClick={() => setSkin(tone)}
            />
          ))}
        </div>
      )}
      <button className="primary full-width" onClick={paint}>
        Start painting →
      </button>
    </section>
  );
}
