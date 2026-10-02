import { SHAPES, SKINS } from '../game/catalog';
import type { Nail, Shape, NailLength } from '../game/types';
import { NailCanvas } from './NailCanvas';
import { DIRT_SPOTS, washedCount } from '../game/preparation';
import { CleaningSponge } from './CleaningSponge';

export function ManicurePrep({
  nail,
  clean,
  shape,
  length,
  skin,
  setSkin,
  isFree,
  paint,
}: {
  nail: Nail;
  clean: () => void;
  shape: (shape: Shape) => void;
  length: (length: NailLength) => void;
  skin: string;
  setSkin: (skin: string) => void;
  isFree: boolean;
  paint: () => void;
}) {
  return (
    <section className="manicure-prep" aria-label="Manicure preparation">
      <div className="prep-heading">
        <span className="prep-sponge-picture">
          <CleaningSponge />
        </span>
        <div>
          <h3>1. Wash & wipe</h3>
          <p>Wipe the little spots with your bubbly sponge!</p>
        </div>
        <button onClick={clean}>{nail.cleaned ? 'Clean again' : 'Clean this nail'}</button>
      </div>
      <div className="wash-progress" role="status" aria-live="polite">
        <span className="wash-bubbles" aria-hidden="true">
          {DIRT_SPOTS.map((_, i) => (
            <span key={i} className={i < washedCount(nail) ? 'washed' : ''} />
          ))}
        </span>
        <span>
          {nail.cleaned
            ? 'Sparkly clean! Choose a length & shape.'
            : `${washedCount(nail)} of 9 spots washed`}
        </span>
      </div>
      <h3>2. Choose your nail length</h3>
      <div className="length-buttons" aria-label="Nail length">
        {(['short', 'medium', 'long'] as const).map((value, i) => (
          <button
            key={value}
            aria-label={`${value[0].toUpperCase() + value.slice(1)} nails`}
            aria-pressed={(nail.length ?? 'short') === value}
            onClick={() => length(value)}
          >
            <span className="length-picture" style={{ height: 24 + i * 8 }} />
            {value[0].toUpperCase() + value.slice(1)}
          </button>
        ))}
      </div>
      <h3>3. Pick a nail shape</h3>
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
                  marble: null,
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
      {!nail.cleaned && (
        <p className="little-note">You can paint whenever you like. Washing is just for fun!</p>
      )}
    </section>
  );
}
