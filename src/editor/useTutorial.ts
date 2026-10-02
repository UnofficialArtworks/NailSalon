import { useEffect, useState } from 'react';
import type { Manicure, Tool } from '../game/types';

export function useTutorial(
  manicure: Manicure,
  zoom: boolean,
  tool: Tool,
  revealed: boolean,
  saved: boolean,
) {
  const [step, setStep] = useState<number | null>(null);
  useEffect(() => {
    if (step === 0 && zoom) setStep(1);
    if (step === 1 && tool === 'brush' && manicure.nails.some((n) => n.cleaned)) setStep(2);
    if (step === 2 && manicure.nails.some((n) => n.baseColorId || n.strokes.some((s) => !s.erase)))
      setStep(3);
    if (step === 3 && manicure.nails.some((n) => n.decorations.length)) setStep(4);
    if (step === 4 && revealed && saved) setStep(null);
  }, [step, manicure, zoom, tool, revealed, saved]);
  return {
    step,
    start: () => setStep(0),
    stop: () => setStep(null),
    next: () => setStep((s) => (s === null || s === 4 ? null : s + 1)),
  };
}
