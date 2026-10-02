import { useId, useState } from 'react';
import type { Manicure, PhotoSettings } from '../game/types';
import { BACKDROPS, photoSettings } from '../game/photo';
import { backdropSvg, jewelrySvg } from '../art/photoScene';
import { Hand } from './Hand';

export function PhotoPreview({ manicure, replay = 0 }: { manicure: Manicure; replay?: number }) {
  const id = useId();
  return (
    <div className="photo-preview" aria-label="Manicure photo preview">
      <svg
        viewBox="0 0 440 550"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: backdropSvg(photoSettings(manicure)) }}
      />
      <div className="photo-hand" key={`${id}-${replay}`}>
        <Hand manicure={manicure} small />
      </div>
      <span className="photo-glint" key={replay} aria-hidden="true">
        ✦
      </span>
    </div>
  );
}
export function PhotoStudio({
  manicure,
  onChange,
}: {
  manicure: Manicure;
  onChange: (p: PhotoSettings) => void;
}) {
  const [replay, setReplay] = useState(0);
  const settings = photoSettings(manicure);
  return (
    <div className="photo-studio">
      <PhotoPreview manicure={manicure} replay={replay} />
      <div className="photo-options">
        <fieldset>
          <legend>Pick a backdrop</legend>
          <div className="photo-choices">
            {BACKDROPS.map((b) => (
              <button
                key={b.id}
                aria-pressed={settings.backdrop === b.id}
                onClick={() => onChange({ ...settings, backdrop: b.id })}
              >
                <span
                  className={`backdrop-swatch ${b.id}`}
                  style={{ backgroundColor: b.color }}
                  aria-hidden="true"
                >
                  {b.id === 'candy' ? '☁' : b.id === 'ocean' ? '○' : b.id === 'garden' ? '✿' : '✧'}
                </span>
                {b.name}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>Bracelet</legend>
          <div className="photo-choices">
            {(['gold', 'pearls', 'none'] as const).map((b) => (
              <button
                key={b}
                aria-pressed={settings.bracelet === b}
                onClick={() => onChange({ ...settings, bracelet: b })}
              >
                {b === 'none' ? (
                  <span aria-hidden="true">—</span>
                ) : (
                  <svg
                    className="jewelry-swatch bracelet-swatch"
                    viewBox="80 492 260 42"
                    aria-hidden="true"
                    dangerouslySetInnerHTML={{
                      __html: jewelrySvg({ ...settings, bracelet: b, ring: 'none' }),
                    }}
                  />
                )}
                {b === 'gold' ? 'Golden star' : b === 'pearls' ? 'Pearls' : 'No bracelet'}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>Ring</legend>
          <div className="photo-choices">
            {(['none', 'heart', 'flower'] as const).map((r) => (
              <button
                key={r}
                aria-pressed={settings.ring === r}
                onClick={() => onChange({ ...settings, ring: r })}
              >
                {r === 'none' ? (
                  <span aria-hidden="true">—</span>
                ) : (
                  <svg
                    className="jewelry-swatch"
                    viewBox="249 273 60 47"
                    aria-hidden="true"
                    dangerouslySetInnerHTML={{
                      __html: jewelrySvg({ ...settings, bracelet: 'none', ring: r }),
                    }}
                  />
                )}
                {r === 'none' ? 'No ring' : r === 'heart' ? 'Heart ring' : 'Flower ring'}
              </button>
            ))}
          </div>
        </fieldset>
        <button className="full-width" onClick={() => setReplay((n) => n + 1)}>
          ✧ Replay reveal
        </button>
      </div>
    </div>
  );
}
