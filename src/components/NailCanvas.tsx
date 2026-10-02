import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react';
import { nailPath, renderNail } from '../art/render';
import { uid } from '../game/rules';
import type { Nail, Tool, Stroke, Point } from '../game/types';
interface Props {
  nail: Nail;
  tool?: Tool;
  colorId?: string;
  brush?: number;
  supplyId?: string;
  selected?: string | null;
  onSelect?: (id: string | null) => void;
  onChange?: (nail: Nail) => void;
  label?: string;
}
export function NailCanvas({
  nail,
  tool,
  colorId = 'color-0',
  brush = 0.09,
  supplyId = 'sticker-0',
  selected = null,
  onSelect,
  onChange,
  label = 'Nail painting area',
}: Props) {
  const ref = useRef<HTMLCanvasElement>(null),
    active = useRef<{
      id: number;
      stroke: Stroke;
      start: Point;
      moveId: string | null;
      nail: Nail;
    } | null>(null),
    frame = useRef(0),
    dirty = useRef(false);
  const latest = useRef({ nail, onChange, onSelect });
  latest.current = { nail, onChange, onSelect };
  useEffect(() => {
    const canvas = ref.current!;
    function render() {
      const r = canvas.getBoundingClientRect();
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(r.width * scale));
      canvas.height = Math.max(1, Math.round(r.height * scale));
      renderNail(
        canvas.getContext('2d')!,
        active.current?.nail ?? latest.current.nail,
        canvas.width,
        canvas.height,
        selected,
      );
    }
    const observer = new ResizeObserver(render);
    observer.observe(canvas);
    render();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame.current);
      frame.current = 0;
    };
  }, [nail, selected]);
  useEffect(() => {
    const flush = () => {
      const a = active.current;
      if (!a) return;
      active.current = null;
      cancelAnimationFrame(frame.current);
      frame.current = 0;
      if (dirty.current) latest.current.onChange?.(a.nail);
      dirty.current = false;
    };
    const visibility = () => {
      if (document.hidden) flush();
    };
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('blur', flush);
    return () => {
      flush();
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('blur', flush);
    };
  }, []);
  function position(event: ReactPointerEvent<HTMLCanvasElement>): Point {
    const r = event.currentTarget.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (event.clientX - r.left) / r.width)),
      y: Math.max(0, Math.min(1, (event.clientY - r.top) / r.height)),
    };
  }
  function schedule() {
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const canvas = ref.current;
      if (canvas && active.current)
        renderNail(
          canvas.getContext('2d')!,
          active.current.nail,
          canvas.width,
          canvas.height,
          selected,
        );
    });
  }
  function down(e: ReactPointerEvent<HTMLCanvasElement>) {
    if (
      !onChange ||
      !tool ||
      tool === 'pattern' ||
      active.current ||
      e.button !== 0 ||
      !e.isPrimary
    )
      return;
    const p = position(e),
      ctx = e.currentTarget.getContext('2d')!;
    if (!ctx.isPointInPath(nailPath(nail.shape), p.x, p.y)) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const next = structuredClone(nail);
    if (tool === 'sticker' || tool === 'gem') {
      if (next.decorations.length >= 100) return;
      const id = uid();
      next.decorations.push({
        id,
        kind: tool,
        supplyId,
        x: p.x,
        y: p.y,
        size: tool === 'gem' ? 0.2 : 0.28,
        rotation: 0,
      });
      onSelect?.(id);
      onChange(next);
      return;
    }
    let moveId: string | null = null;
    if (tool === 'move') {
      moveId =
        [...next.decorations]
          .reverse()
          .find((d) => Math.hypot(d.x - p.x, d.y - p.y) < d.size * 0.65)?.id ?? null;
      onSelect?.(moveId);
      if (!moveId) return;
    }
    const stroke: Stroke = { points: [p], colorId, width: brush, erase: tool === 'eraser' };
    if (tool === 'brush' || tool === 'eraser') {
      if (next.strokes.length >= 500) return;
      next.strokes.push(stroke);
      next.cleaned = true;
      if (tool === 'brush') next.baseColorId = colorId;
    }
    if (tool === 'clean') next.cleaned = true;
    active.current = { id: e.pointerId, stroke, start: p, moveId, nail: next };
    dirty.current = tool !== 'move';
    schedule();
  }
  function move(e: ReactPointerEvent<HTMLCanvasElement>) {
    const a = active.current;
    if (!a || a.id !== e.pointerId) return;
    const p = position(e);
    if (a.moveId) {
      const d = a.nail.decorations.find((d) => d.id === a.moveId)!;
      d.x = p.x;
      d.y = p.y;
      dirty.current = true;
    } else if (
      a.stroke.points.length < 3000 &&
      Math.hypot(p.x - a.stroke.points.at(-1)!.x, p.y - a.stroke.points.at(-1)!.y) > 0.003
    )
      a.stroke.points.push(p);
    schedule();
  }
  function finish(e: ReactPointerEvent<HTMLCanvasElement>) {
    const a = active.current;
    if (!a || a.id !== e.pointerId) return;
    active.current = null;
    cancelAnimationFrame(frame.current);
    frame.current = 0;
    if (dirty.current) onChange?.(a.nail);
    dirty.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId);
  }
  return (
    <canvas
      ref={ref}
      className={onChange ? 'nail-canvas interactive' : 'nail-canvas'}
      role="img"
      aria-label={label}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={finish}
      onPointerCancel={finish}
      onLostPointerCapture={finish}
    />
  );
}
