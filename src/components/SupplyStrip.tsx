import { useEffect, useRef, useState, type ReactNode } from 'react';

export function SupplyStrip({
  kind,
  selected,
  children,
}: {
  kind: 'color' | 'decoration';
  selected: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });
  function measure() {
    const el = ref.current!;
    setEdges({
      left: el.scrollLeft > 1,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 1,
    });
  }
  useEffect(() => {
    const el = ref.current!;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    measure();
    return () => observer.disconnect();
  }, [children]);
  useEffect(() => {
    const el = ref.current!;
    const picked = el.querySelector<HTMLButtonElement>('[aria-pressed="true"]');
    if (picked) {
      const r = picked.getBoundingClientRect(),
        strip = el.getBoundingClientRect();
      if (r.left < strip.left) el.scrollLeft += r.left - strip.left;
      else if (r.right > strip.right) el.scrollLeft += r.right - strip.right;
    }
    measure();
  }, [selected, kind]);
  function move(direction: number) {
    const el = ref.current!;
    el.scrollBy({
      left: direction * el.clientWidth * 0.85,
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  }
  const label = kind === 'color' ? 'polishes' : 'decorations';
  return (
    <div className="supply-strip">
      <button
        className="strip-arrow"
        aria-label={`Previous ${label}`}
        disabled={!edges.left}
        onClick={() => move(-1)}
      >
        ‹
      </button>
      <div ref={ref} className={`${kind}-grid`} onScroll={measure}>
        {children}
      </div>
      <button
        className="strip-arrow"
        aria-label={`More ${label}`}
        disabled={!edges.right}
        onClick={() => move(1)}
      >
        ›
      </button>
    </div>
  );
}
