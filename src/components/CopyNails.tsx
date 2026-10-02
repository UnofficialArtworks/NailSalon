import { useState } from 'react';
import type { Nail } from '../game/types';
import { Modal } from './Modal';
import { NailCanvas } from './NailCanvas';

export function CopyNails({
  nails,
  source,
  close,
  apply,
}: {
  nails: Nail[];
  source: number;
  close: () => void;
  apply: (targets: number[], mode: 'color' | 'design') => void;
}) {
  const [targets, setTargets] = useState<number[]>([]);
  const [mode, setMode] = useState<'color' | 'design'>('design');
  return (
    <Modal title="Make a matching set" onClose={close}>
      <p className="modal-intro">Copy nail {source + 1}. Choose the nails you want to decorate.</p>
      <div className="action-pair" aria-label="What to copy">
        <button aria-pressed={mode === 'design'} onClick={() => setMode('design')}>
          Whole design
        </button>
        <button aria-pressed={mode === 'color'} onClick={() => setMode('color')}>
          Base color only
        </button>
      </div>
      <div className="copy-nails">
        {nails.map((nail, i) => (
          <button
            key={i}
            disabled={i === source}
            aria-label={`Copy to nail ${i + 1}`}
            aria-pressed={targets.includes(i)}
            onClick={() =>
              setTargets((old) => (old.includes(i) ? old.filter((n) => n !== i) : [...old, i]))
            }
          >
            <span className="copy-preview">
              <NailCanvas
                nail={
                  targets.includes(i)
                    ? {
                        ...nail,
                        ...(mode === 'design'
                          ? nails[source]
                          : {
                              fillColorId: nails[source].fillColorId ?? nails[source].baseColorId,
                            }),
                        shape: nail.shape,
                        length: nail.length,
                      }
                    : nail
                }
              />
            </span>
            <span>{i === source ? 'Original' : `${targets.includes(i) ? '✓ ' : ''}${i + 1}`}</span>
          </button>
        ))}
      </div>
      <button
        className="full-width"
        onClick={() => setTargets(nails.map((_, i) => i).filter((i) => i !== source))}
      >
        Choose all other nails
      </button>
      <p className="little-note">Each nail keeps its shape and length. You can undo the copy.</p>
      <button
        className="primary full-width"
        disabled={
          !targets.length ||
          (mode === 'color' && !nails[source].baseColorId && !nails[source].fillColorId)
        }
        onClick={() => {
          apply(targets, mode);
          close();
        }}
      >
        Copy to chosen nails
      </button>
    </Modal>
  );
}
