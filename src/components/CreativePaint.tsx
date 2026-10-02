import { useState } from 'react';
import { COLORS, suppliesAt } from '../game/catalog';
import { STENCILS, stencilPath, fillStencil, dipMarble } from '../game/creative';
import type { Nail, StencilId } from '../game/types';
import { NailCanvas } from './NailCanvas';

export function CreativePaint({
  nail,
  color,
  stars,
  stencil,
  setStencil,
  edit,
}: {
  nail: Nail;
  color: string;
  stars: number;
  stencil: StencilId | null;
  setStencil: (id: StencilId | null) => void;
  edit: (nail: Nail) => void;
}) {
  const [mode, setMode] = useState<'brush' | 'stencil' | 'marble'>(stencil ? 'stencil' : 'brush');
  const [accent, setAccent] = useState('color-5');
  const [variant, setVariant] = useState(0);
  const kit = suppliesAt(stars);
  const preview = dipMarble({ ...nail, patternId: null, decorations: [] }, color, accent, variant);
  return (
    <section
      className={`creative-paint ${mode === 'brush' ? '' : 'expanded'}`}
      aria-label="Creative painting tools"
    >
      <div className="creative-paint-tabs">
        {(
          [
            { id: 'brush', icon: '〰', name: 'Free brush' },
            { id: 'stencil', icon: '♡', name: 'Stencils' },
            { id: 'marble', icon: '◎', name: 'Marble dip' },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            aria-label={t.name}
            aria-pressed={mode === t.id}
            onClick={() => {
              setMode(t.id);
              setStencil(t.id === 'stencil' ? (stencil ?? 'heart') : null);
            }}
          >
            <span aria-hidden="true">{t.icon}</span>
            {t.name}
          </button>
        ))}
      </div>
      {mode === 'stencil' && (
        <div className="stencil-kit">
          <div className="stencil-choices" aria-label="Choose a stencil">
            {STENCILS.map((s) => (
              <button
                key={s.id}
                aria-label={`${s.name} stencil`}
                aria-pressed={stencil === s.id}
                onClick={() => setStencil(s.id)}
              >
                <svg viewBox="0 0 1 1" aria-hidden="true">
                  <path d={stencilPath(s.id)} fill="currentColor" />
                </svg>
                {s.name}
              </button>
            ))}
          </div>
          <p>Brush inside the window, then lift to see your shape!</p>
          <div className="action-pair">
            <button
              disabled={!stencil || nail.strokes.length >= 500}
              onClick={() => {
                if (stencil) edit(fillStencil(nail, stencil, color));
              }}
            >
              Fill stencil
            </button>
            <button
              disabled={!stencil}
              onClick={() => {
                setStencil(null);
                setMode('brush');
              }}
            >
              Lift stencil ✧
            </button>
          </div>
        </div>
      )}
      {mode === 'marble' && (
        <div className="marble-kit">
          <div className="marble-bowl">
            <NailCanvas nail={{ ...preview, shape: 'round' }} label="Marble polish bowl" />
          </div>
          <div className="marble-controls">
            <p>Pick two colors, swirl, then dip your nail!</p>
            <small>First color: {COLORS.find((c) => c.id === color)?.name} · choose above</small>
            <label>
              Second color{' '}
              <select
                aria-label="Marble second color"
                value={accent}
                onChange={(e) => setAccent(e.target.value)}
              >
                {kit.colors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="action-pair">
              <button onClick={() => setVariant((v) => (v + 1) % 4)}>Swirl colors ↻</button>
              <button onClick={() => edit(dipMarble(nail, color, accent, variant))}>
                Dip this nail ✧
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
