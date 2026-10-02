import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react';
import { nailPath, renderNail } from '../art/render';
import { uid } from '../game/rules';
import type { Nail, Tool, Stroke, Point } from '../game/types';
import { SPONGE_WIDTH, washNail, washedCount } from '../game/preparation';
import { CleaningSponge } from './CleaningSponge';
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
    cursor = useRef<HTMLSpanElement>(null),
    sponge = useRef<HTMLSpanElement>(null),
    washMeter = useRef<HTMLSpanElement>(null),
    active = useRef<{
      id: number;
      stroke: Stroke;
      start: Point;
      moveId: string | null;
      nail: Nail;
      source: Nail;
      tool: Tool;
    } | null>(null),
    frame = useRef(0),
    dirty = useRef(false);
  const latest = useRef({ nail, onChange, onSelect });
  latest.current = { nail, onChange, onSelect };
  useEffect(() => {
    const canvas = ref.current!;
    const draft = active.current;
    if (draft && draft.source !== nail) {
      // Explicit toolbar edits replace the draft; pointer-up must not restore it.
      active.current = null;
      dirty.current = false;
      if (canvas.hasPointerCapture(draft.id)) canvas.releasePointerCapture(draft.id);
    }
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
      sizeCursor();
      showWashProgress(active.current?.nail ?? latest.current.nail);
    }
    const observer = new ResizeObserver(render);
    observer.observe(canvas);
    render();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame.current);
      frame.current = 0;
    };
  }, [nail, selected, brush, tool]);
  useEffect(() => {
    const flush = () => {
      if (cursor.current) cursor.current.style.display = 'none';
      if (sponge.current) sponge.current.style.display = 'none';
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
  }, [tool]);
  function showWashProgress(n: Nail) {
    if (washMeter.current) washMeter.current.style.width = `${(washedCount(n) / 9) * 100}%`;
  }
  function sizeCursor() {
    if (!cursor.current || !ref.current) return;
    const diameter =
      (active.current?.stroke.width ?? brush) * ref.current.getBoundingClientRect().width;
    cursor.current.style.width = cursor.current.style.height = `${diameter}px`;
  }
  function pointCursor(e: ReactPointerEvent<HTMLCanvasElement>) {
    if (!cursor.current || !onChange || (tool !== 'brush' && tool !== 'eraser')) return;
    if (active.current && active.current.id !== e.pointerId) return;
    if (e.pointerType === 'touch' && !active.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    sizeCursor();
    cursor.current.style.display = 'block';
    cursor.current.style.left = `${e.clientX - r.left}px`;
    cursor.current.style.top = `${e.clientY - r.top}px`;
  }
  function pointSponge(e: ReactPointerEvent<HTMLCanvasElement>) {
    if (!sponge.current || tool !== 'clean' || active.current?.id !== e.pointerId) return;
    const r = e.currentTarget.getBoundingClientRect();
    const size = r.width * SPONGE_WIDTH;
    sponge.current.style.width = `${size}px`;
    sponge.current.style.height = `${size}px`;
    sponge.current.style.display = 'block';
    sponge.current.style.left = `${e.clientX - r.left}px`;
    sponge.current.style.top = `${e.clientY - r.top}px`;
  }
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
      if (active.current) showWashProgress(active.current.nail);
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
    let next = structuredClone(nail);
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
          .find(
            (d) =>
              Math.hypot(
                d.x - p.x,
                ((d.y - p.y) * e.currentTarget.height) / e.currentTarget.width,
              ) <
              d.size * 0.65,
          )?.id ?? null;
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
    if (tool === 'clean')
      next = washNail(next, p, p, e.currentTarget.height / e.currentTarget.width);
    active.current = { id: e.pointerId, stroke, start: p, moveId, nail: next, source: nail, tool };
    pointCursor(e);
    pointSponge(e);
    dirty.current = tool === 'clean' ? next.washed !== nail.washed : tool !== 'move';
    schedule();
  }
  function move(e: ReactPointerEvent<HTMLCanvasElement>) {
    pointCursor(e);
    const a = active.current;
    if (!a || a.id !== e.pointerId) return;
    const p = position(e);
    pointSponge(e);
    if (a.tool === 'clean') {
      const next = washNail(a.nail, a.start, p, e.currentTarget.height / e.currentTarget.width);
      if (next !== a.nail) dirty.current = true;
      a.nail = next;
      a.start = p;
    } else if (a.moveId) {
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
    if (sponge.current) sponge.current.style.display = 'none';
    if (cursor.current && e.pointerType === 'touch') cursor.current.style.display = 'none';
    cancelAnimationFrame(frame.current);
    frame.current = 0;
    if (dirty.current) onChange?.(a.nail);
    dirty.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId);
  }
  return (
    <span className="nail-surface" data-cleaned={nail.cleaned}>
      <canvas
        ref={ref}
        className={onChange ? 'nail-canvas interactive' : 'nail-canvas'}
        role="img"
        aria-label={label}
        data-brush-tool={tool === 'brush' || tool === 'eraser'}
        onPointerEnter={pointCursor}
        onPointerLeave={() => {
          if (cursor.current) cursor.current.style.display = 'none';
        }}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={finish}
        onPointerCancel={finish}
        onLostPointerCapture={finish}
      />
      {onChange && (tool === 'brush' || tool === 'eraser') && (
        <span ref={cursor} className="brush-cursor" aria-hidden="true" />
      )}
      {onChange && tool === 'clean' && (
        <>
          <span ref={sponge} className="cleaning-sponge">
            <CleaningSponge />
          </span>
          {nail.cleaned ? (
            <span className="clean-sparkles" aria-hidden="true">
              ✧<i>✦</i>✧
            </span>
          ) : (
            <span className="wash-meter" aria-hidden="true">
              <span ref={washMeter} />
            </span>
          )}
        </>
      )}
    </span>
  );
}
