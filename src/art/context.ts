// Matte finishes read and restore pixels every frame. Request the readback
// canvas path at creation instead of letting a browser switch backing stores
// partway through a manicure. Preview and export use the same context options.
export function nailContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const context = canvas.getContext('2d', { willReadFrequently: true, colorSpace: 'srgb' });
  if (!context) throw new Error('Nail artwork needs a 2D canvas.');
  return context;
}
