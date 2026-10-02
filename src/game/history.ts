export interface History<T> {
  past: T[];
  present: T;
  future: T[];
}
export const history = <T>(present: T): History<T> => ({ past: [], present, future: [] });
export function commit<T>(h: History<T>, value: T): History<T> {
  return { past: [...h.past.slice(-39), h.present], present: value, future: [] };
}
export function undo<T>(h: History<T>): History<T> {
  if (!h.past.length) return h;
  return {
    past: h.past.slice(0, -1),
    present: h.past[h.past.length - 1],
    future: [h.present, ...h.future],
  };
}
export function redo<T>(h: History<T>): History<T> {
  if (!h.future.length) return h;
  return { past: [...h.past, h.present], present: h.future[0], future: h.future.slice(1) };
}
