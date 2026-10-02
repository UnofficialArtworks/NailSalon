import { stencilPath } from '../game/creative';
import type { StencilId } from '../game/types';

/** Leave the caller in pixel space with a normalized stencil clip installed. */
export function clipStencil(
  ctx: CanvasRenderingContext2D,
  id: StencilId,
  width: number,
  height: number,
) {
  ctx.scale(width, height);
  ctx.clip(new Path2D(stencilPath(id)));
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
/** Stable ribbons: the stored variant reproduces the bowl, nail and exported photo. */
export function marbleRibbons(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  variant: number,
) {
  ctx.save();
  ctx.scale(width, height);
  const warp = (x: number, y: number) => {
    const dx = x - 0.5,
      dy = y - 0.48;
    const radius = Math.hypot(dx, dy);
    const twist =
      (variant % 2 ? -1 : 1) * (1.5 + variant * 0.7) * Math.exp((-radius * radius) / 0.19);
    const angle = Math.atan2(dy, dx) + twist;
    return { x: 0.5 + Math.cos(angle) * radius, y: 0.48 + Math.sin(angle) * radius };
  };
  for (let i = -5; i < 14; i++) {
    const y = i * 0.12;
    ctx.beginPath();
    for (let step = 0; step <= 120; step++) {
      const forward = step <= 60;
      const x = -0.5 + (forward ? step : 120 - step) / 30;
      const p = warp(x, y + (forward ? 0 : 0.045));
      if (step === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}
