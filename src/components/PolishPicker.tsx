import { useEffect, useId, useRef, useState } from 'react';
import type { Supply } from '../game/types';

export function PolishPicker({
  colors,
  selected,
  choose,
}: {
  colors: Supply[];
  selected: string;
  choose: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const current = colors.find((c) => c.id === selected)!;
  useEffect(() => {
    if (!open) return;
    const outside = (e: PointerEvent) => {
      if (e.target instanceof Node && !root.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', outside);
    root.current?.querySelector<HTMLButtonElement>('[aria-pressed="true"]')?.focus();
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);
  return (
    <div
      className="polish-picker"
      ref={root}
      onBlur={(e) => {
        // Safari may blur a focused option with no relatedTarget on a pointer
        // press. Keep it mounted until its click selects the color.
        if (e.relatedTarget && !e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          setOpen(false);
          trigger.current?.focus();
        }
      }}
    >
      <button
        ref={trigger}
        className="polish-picker-trigger"
        aria-label={`Marble second color: ${current.name}`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <span
          className="polish-dot"
          style={{ backgroundColor: current.color }}
          aria-hidden="true"
        />
        <span>{current.name}</span>
        <span className="polish-picker-chevron" aria-hidden="true">
          {open ? '▴' : '▾'}
        </span>
      </button>
      {open && (
        <div
          id={panelId}
          className="polish-picker-panel"
          role="group"
          aria-label="Choose your marble second color"
        >
          <strong>Pick your second color ✧</strong>
          <div className="polish-picker-colors">
            {colors.map((c) => (
              <button
                key={c.id}
                aria-label={`Marble color: ${c.name}`}
                aria-pressed={selected === c.id}
                onClick={() => {
                  choose(c.id);
                  setOpen(false);
                  trigger.current?.focus();
                }}
              >
                <span
                  className="polish-dot"
                  style={{ backgroundColor: c.color }}
                  aria-hidden="true"
                />
                <span>{c.name}</span>
                <span className="polish-picker-check" aria-hidden="true">
                  {selected === c.id ? '✓' : ''}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
