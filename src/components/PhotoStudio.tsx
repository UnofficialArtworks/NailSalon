import { useId, useState } from 'react';
import type { Manicure, PhotoSettings } from '../game/types';
import {
  PHOTO_CHOICES,
  photoSettings,
  photoChoiceUnlocked,
  type PhotoCategory,
} from '../game/photo';
import { backdropSvg, jewelrySvg, photoOverlaySvg } from '../art/photoScene';
import { Hand } from './Hand';

export function PhotoPreview({ manicure, replay = 0 }: { manicure: Manicure; replay?: number }) {
  const id = useId();
  const settings = photoSettings(manicure);
  return (
    <div className="photo-preview" aria-label="Manicure photo preview">
      <svg
        viewBox="0 0 440 550"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: backdropSvg(settings) }}
      />
      <div className="photo-hand" key={`${id}-${replay}`}>
        <Hand manicure={manicure} small />
      </div>
      <svg
        className="photo-overlay"
        viewBox="0 0 440 550"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: photoOverlaySvg(settings) }}
      />
      <span className="photo-glint" key={replay} aria-hidden="true">
        ✦
      </span>
    </div>
  );
}
const categories: { id: PhotoCategory; name: string; picture: string }[] = [
  { id: 'backdrop', name: 'Backdrops', picture: '☁' },
  { id: 'frame', name: 'Frames', picture: '▣' },
  { id: 'props', name: 'Props', picture: '✿' },
  { id: 'bracelet', name: 'Bracelets', picture: '◎' },
  { id: 'ring', name: 'Rings', picture: '◇' },
];
function ChoicePicture({
  category,
  settings,
}: {
  category: PhotoCategory;
  settings: Required<PhotoSettings>;
}) {
  if (category === 'bracelet' || category === 'ring') {
    return settings[category] === 'none' ? (
      <span aria-hidden="true">—</span>
    ) : (
      <svg
        className={`jewelry-swatch ${category === 'bracelet' ? 'bracelet-swatch' : ''}`}
        viewBox={category === 'bracelet' ? '80 492 260 55' : '249 273 60 47'}
        aria-hidden="true"
        dangerouslySetInnerHTML={{
          __html: jewelrySvg({
            ...settings,
            ...(category === 'bracelet'
              ? { ring: 'none' as const }
              : { bracelet: 'none' as const }),
          }),
        }}
      />
    );
  }
  const art =
    category === 'backdrop'
      ? backdropSvg(settings)
      : `<rect width="440" height="550" rx="25" fill="#f5dfea"/>${photoOverlaySvg({
          ...settings,
          frame: category === 'frame' ? settings.frame : 'none',
          props: category === 'props' ? settings.props : 'none',
        })}`;
  return (
    <svg
      className="photo-choice-picture"
      viewBox={category === 'props' ? '0 370 95 160' : '0 0 440 550'}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: art }}
    />
  );
}
export function PhotoStudio({
  manicure,
  stars,
  onChange,
}: {
  manicure: Manicure;
  stars: number;
  onChange: (p: PhotoSettings) => void;
}) {
  const [replay, setReplay] = useState(0);
  const [category, setCategory] = useState<PhotoCategory>('backdrop');
  const optionsId = useId();
  const settings = photoSettings(manicure);
  const title = {
    backdrop: 'Pick a backdrop',
    frame: 'Pick a frame',
    props: 'Add props',
    bracelet: 'Pick a bracelet',
    ring: 'Pick a ring',
  }[category];
  return (
    <div className="photo-studio">
      <PhotoPreview manicure={manicure} replay={replay} />
      <div className="photo-options">
        <div className="photo-category-tabs" role="group" aria-label="Photo customization">
          {categories.map((c) => (
            <button
              key={c.id}
              aria-pressed={category === c.id}
              aria-controls={optionsId}
              onClick={() => setCategory(c.id)}
            >
              <span aria-hidden="true">{c.picture}</span>
              {c.name}
            </button>
          ))}
        </div>
        <fieldset id={optionsId}>
          <legend>{title}</legend>
          <div className="photo-choices">
            {PHOTO_CHOICES[category].map((choice) => {
              const unlocked = photoChoiceUnlocked(category, choice.id, stars);
              const preview = { ...settings, [category]: choice.id } as Required<PhotoSettings>;
              return (
                <button
                  key={choice.id}
                  disabled={!unlocked}
                  aria-pressed={settings[category] === choice.id}
                  onClick={() => onChange(preview)}
                >
                  <ChoicePicture category={category} settings={preview} />
                  {choice.name}
                  {!unlocked && <small className="photo-lock">{choice.stars} ★ to unlock</small>}
                </button>
              );
            })}
          </div>
        </fieldset>
        <p className="photo-reward-hint">
          {stars} ★ earned ·{' '}
          {stars >= 30
            ? 'All photo treasures unlocked!'
            : 'Play with customers to unlock more photo treasures.'}
        </p>
        <button className="full-width" onClick={() => setReplay((n) => n + 1)}>
          ✧ Replay reveal
        </button>
      </div>
    </div>
  );
}
