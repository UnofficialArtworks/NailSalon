import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { commit, history, redo, undo } from '../game/history';
import type { Nail, Save } from '../game/types';
import { sound } from '../audio/sound';

// Own selection, history, and commits together so callbacks belong to one manicure.
export function useEditor(save: Save, setSave: Dispatch<SetStateAction<Save>>) {
  const manicure = save.active;
  const [selectedNail, setSelectedNail] = useState(0);
  const [selectedDecoration, setSelectedDecoration] = useState<string | null>(null);
  const [zoom, setZoom] = useState(false);
  const [artHistory, setArtHistory] = useState(() => history(manicure.nails));
  const historyRef = useRef(artHistory);
  const activeId = useRef(manicure.id);
  activeId.current = manicure.id;
  historyRef.current = artHistory;
  const nail = manicure.nails[selectedNail];

  useEffect(() => {
    setArtHistory(history(manicure.nails));
    setSelectedNail(0);
    setSelectedDecoration(null);
    setZoom(false);
  }, [manicure.id]);

  function editNails(nails: Nail[]) {
    // A departing canvas may flush after a new manicure has mounted.
    if (activeId.current !== manicure.id) return;
    const h = commit(historyRef.current, nails);
    historyRef.current = h;
    setArtHistory(h);
    setSave((s) => (s.active.id === manicure.id ? { ...s, active: { ...s.active, nails } } : s));
    sound('paint');
  }
  function editNail(next: Nail) {
    if (activeId.current !== manicure.id) return;
    const added = next.decorations.find((d) => !nail.decorations.some((old) => old.id === d.id));
    if (added) setSelectedDecoration(added.id);
    editNails(manicure.nails.map((old, i) => (i === selectedNail ? next : old)));
  }
  function historyAction(action: 'undo' | 'redo') {
    if (activeId.current !== manicure.id) return;
    const h = action === 'undo' ? undo(historyRef.current) : redo(historyRef.current);
    historyRef.current = h;
    setArtHistory(h);
    setSave((s) =>
      s.active.id === manicure.id ? { ...s, active: { ...s.active, nails: h.present } } : s,
    );
    setSelectedDecoration(null);
  }
  function selectNail(i: number) {
    setSelectedNail(i);
    setSelectedDecoration(null);
    setZoom(true);
    sound();
  }
  function selectedAction(remove = false) {
    if (!selectedDecoration) return;
    editNail({
      ...nail,
      decorations: remove
        ? nail.decorations.filter((d) => d.id !== selectedDecoration)
        : nail.decorations.map((d) =>
            d.id === selectedDecoration ? { ...d, rotation: (d.rotation + 30) % 360 } : d,
          ),
    });
    if (remove) setSelectedDecoration(null);
  }
  return {
    nail,
    selectedNail,
    setSelectedNail,
    selectedDecoration,
    setSelectedDecoration,
    zoom,
    setZoom,
    artHistory,
    editNails,
    editNail,
    historyAction,
    selectNail,
    selectedAction,
  };
}
