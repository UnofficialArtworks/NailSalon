import { COLORS, PATTERNS, STICKERS, GEMS, suppliesAt } from '../game/catalog';
import type { Nail, Tool, Shape, NailLength } from '../game/types';
import { COLLECTIONS, duplicateItem, reorderItem } from '../game/studio';
import { Icon, Bottle } from './Icon';
import { uid } from '../game/rules';
import { ToolPicture } from './ToolPicture';
import { NailCanvas } from './NailCanvas';
import { useRef, useState } from 'react';
import { ManicurePrep } from './ManicurePrep';
import { SupplyStrip } from './SupplyStrip';
interface Props {
  stars: number;
  tool: Tool;
  setTool: (tool: Tool) => void;
  color: string;
  setColor: (id: string) => void;
  supply: string;
  setSupply: (id: string) => void;
  brush: number;
  setBrush: (n: number) => void;
  nail: Nail;
  edit: (n: Nail) => void;
  fillAll: () => void;
  changeShape: (shape: Shape) => void;
  changeLength: (length: NailLength) => void;
  skin: string;
  setSkin: (s: string) => void;
  isFree: boolean;
  selected: string | null;
  rotate: () => void;
  remove: () => void;
  message: (s: string) => void;
  selectDecoration: (id: string | null) => void;
}
const tools: { id: Tool; name: string }[] = [
  { id: 'clean', name: 'Clean' },
  { id: 'brush', name: 'Polish' },
  { id: 'pattern', name: 'Patterns' },
  { id: 'sticker', name: 'Stickers' },
  { id: 'gem', name: 'Gems' },
  { id: 'eraser', name: 'Eraser' },
  { id: 'move', name: 'Move' },
];
const nudges = [
  { direction: 'left', dx: -0.04, dy: 0, icon: '←' },
  { direction: 'up', dx: 0, dy: -0.04, icon: '↑' },
  { direction: 'down', dx: 0, dy: 0.04, icon: '↓' },
  { direction: 'right', dx: 0.04, dy: 0, icon: '→' },
];
export function ToolRack(p: Props) {
  const [collection, setCollection] = useState('all');
  const theme = COLLECTIONS.find((c) => c.id === collection)!;
  const filter = (id: string, kind: 'colors' | 'stickers' | 'patterns' | 'gems') =>
    collection === 'all' || (theme[kind] as readonly number[]).includes(Number(id.split('-')[1]));
  const remembered = useRef<Record<string, string>>({});
  const kit = suppliesAt(p.stars);
  const library = p.tool === 'pattern' ? PATTERNS : p.tool === 'sticker' ? STICKERS : GEMS;
  const unlocked =
    p.tool === 'pattern' ? kit.patterns : p.tool === 'sticker' ? kit.stickers : kit.gems;
  return (
    <aside className="tool-rack" aria-label="Nail art supplies">
      <div className="tool-tabs">
        {tools.map((t) => (
          <button
            key={t.id}
            className={p.tool === t.id ? 'active' : ''}
            aria-pressed={p.tool === t.id}
            onClick={() => {
              remembered.current[p.tool] = p.supply;
              p.setTool(t.id);
              if (t.id === 'pattern') p.setSupply(remembered.current[t.id] ?? kit.patterns[0].id);
              if (t.id === 'sticker') p.setSupply(remembered.current[t.id] ?? kit.stickers[0].id);
              if (t.id === 'gem') p.setSupply(remembered.current[t.id] ?? kit.gems[0].id);
            }}
          >
            <ToolPicture tool={t.id} />
            <span className="tool-name">{t.name}</span>
          </button>
        ))}
      </div>
      <div className="supplies-area">
        {['brush', 'pattern', 'sticker', 'gem'].includes(p.tool) && (
          <div className="collection-tabs" aria-label="Supply collections">
            {COLLECTIONS.map((c) => (
              <button
                key={c.id}
                aria-pressed={collection === c.id}
                onClick={() => setCollection(c.id)}
              >
                <Icon id={c.icon} size={24} />
                {c.name}
              </button>
            ))}
          </div>
        )}
        {(p.tool === 'brush' || p.tool === 'eraser') && (
          <>
            <div className="section-label">
              <h3>{p.tool === 'brush' ? 'Pick a polish' : 'Polish eraser'}</h3>
              <span>{COLORS.find((c) => c.id === p.color)?.name}</span>
            </div>
            {p.tool === 'brush' && (
              <SupplyStrip kind="color" selected={p.color}>
                {[...COLORS]
                  .filter((c) => filter(c.id, 'colors'))
                  .sort(
                    (a, b) =>
                      Number(kit.colors.some((c) => c.id === b.id)) -
                      Number(kit.colors.some((c) => c.id === a.id)),
                  )
                  .map((c) => {
                    const available = kit.colors.some((a) => a.id === c.id);
                    return (
                      <button
                        key={c.id}
                        className={`swatch ${p.color === c.id ? 'selected' : ''} ${available ? '' : 'locked'}`}
                        aria-label={`${c.name}${available ? '' : ' · locked'}`}
                        aria-pressed={p.color === c.id}
                        onClick={() =>
                          available
                            ? p.setColor(c.id)
                            : p.message('Serve customers to earn stars and unlock this polish!')
                        }
                      >
                        <Bottle color={c.color} size={48} />
                        <span className="swatch-mark">
                          {!available ? '🔒' : p.color === c.id ? '✓' : ''}
                        </span>
                      </button>
                    );
                  })}
              </SupplyStrip>
            )}
            <label className="brush-control">
              Brush size{' '}
              <input
                type="range"
                min="4"
                max="25"
                value={Math.round(p.brush * 100)}
                onChange={(e) => p.setBrush(Number(e.target.value) / 100)}
              />
              <span>{p.brush < 0.1 ? 'Small' : p.brush < 0.18 ? 'Medium' : 'Big'}</span>
            </label>
            {p.tool === 'brush' && (
              <div className="action-pair">
                <button
                  onClick={() =>
                    p.edit({
                      ...p.nail,
                      cleaned: true,
                      baseColorId: p.color,
                      fillColorId: p.color,
                      strokes: [],
                    })
                  }
                >
                  Fill this nail
                </button>
                <button onClick={p.fillAll}>Color all five</button>
              </div>
            )}
            {p.tool === 'brush' && (
              <div className="finish-picker" aria-label="Polish finish">
                {(
                  [
                    { id: 'glossy', name: 'Glossy', icon: '◡' },
                    { id: 'glitter', name: 'Glitter', icon: '✧' },
                    { id: 'pearl', name: 'Pearlescent', icon: '◉' },
                    { id: 'matte', name: 'Matte', icon: '●' },
                    { id: 'metallic', name: 'Metallic', icon: '◇' },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.id}
                    aria-label={f.name}
                    aria-pressed={(p.nail.finish ?? 'glossy') === f.id}
                    onClick={() => p.edit({ ...p.nail, finish: f.id })}
                  >
                    <span
                      className={`finish-sample ${f.id}`}
                      style={
                        {
                          '--polish': COLORS.find((c) => c.id === p.color)?.color,
                        } as React.CSSProperties
                      }
                    >
                      {f.icon}
                    </span>
                    {f.name}
                  </button>
                ))}
              </div>
            )}
            {p.tool === 'eraser' && (
              <p className="little-note">Rub away polish. Patterns and decorations stay.</p>
            )}
          </>
        )}
        {['pattern', 'sticker', 'gem'].includes(p.tool) && (
          <>
            <div className="section-label">
              <h3>
                {p.tool === 'pattern'
                  ? 'Pretty patterns'
                  : p.tool === 'sticker'
                    ? 'Sticker collection'
                    : 'A little sparkle'}
              </h3>
              <span>
                {unlocked.length}/{library.length}
              </span>
            </div>
            <SupplyStrip kind="decoration" selected={p.supply}>
              {[...library]
                .filter((item) =>
                  filter(
                    item.id,
                    p.tool === 'pattern' ? 'patterns' : p.tool === 'sticker' ? 'stickers' : 'gems',
                  ),
                )
                .sort(
                  (a, b) =>
                    Number(unlocked.some((c) => c.id === b.id)) -
                    Number(unlocked.some((c) => c.id === a.id)),
                )
                .map((item) => {
                  const available = unlocked.some((a) => a.id === item.id);
                  return (
                    <button
                      key={item.id}
                      className={`${p.supply === item.id ? 'selected' : ''} ${available ? '' : 'locked'}`}
                      aria-label={`${item.name}${available ? '' : ' · locked'}`}
                      aria-pressed={p.supply === item.id}
                      onClick={() => {
                        if (!available) {
                          p.message('More stars, more little treasures!');
                          return;
                        }
                        p.setSupply(item.id);
                      }}
                    >
                      {p.tool === 'sticker' ? (
                        <Icon id={item.id} size={48} />
                      ) : p.tool === 'gem' ? (
                        <span className="gem-nail-preview">
                          <NailCanvas
                            nail={{
                              ...p.nail,
                              cleaned: true,
                              fillColorId: null,
                              baseColorId: null,
                              strokes: [],
                              patternId: null,
                              decorations: [
                                {
                                  id: 'preview',
                                  kind: 'gem',
                                  supplyId: item.id,
                                  x: 0.5,
                                  y: 0.5,
                                  size: 0.7,
                                  rotation: 0,
                                },
                              ],
                            }}
                            label={item.name}
                          />
                        </span>
                      ) : (
                        <div className="pattern-tile">
                          <NailCanvas
                            nail={{
                              ...p.nail,
                              decorations: [],
                              strokes: [],
                              cleaned: true,
                              fillColorId: p.color,
                              patternId: item.id,
                            }}
                            label={item.name}
                          />
                        </div>
                      )}
                      <small>{item.name}</small>
                      {!available && <span className="lock-mark">♧</span>}
                    </button>
                  );
                })}
            </SupplyStrip>
            {p.tool === 'pattern' ? (
              <>
                <div className="pattern-colors" aria-label="Pattern ink">
                  <button
                    aria-label="Pattern color: Original"
                    aria-pressed={!p.nail.patternColorId}
                    onClick={() => p.edit({ ...p.nail, patternColorId: null })}
                  >
                    Original
                  </button>
                  {kit.colors.map((c) => (
                    <button
                      key={c.id}
                      aria-label={`Pattern color: ${c.name}`}
                      aria-pressed={p.nail.patternColorId === c.id}
                      style={{ background: c.color }}
                      onClick={() => p.edit({ ...p.nail, patternColorId: c.id })}
                    />
                  ))}
                </div>
                <div className="action-pair">
                  <button
                    onClick={() =>
                      p.edit({
                        ...p.nail,
                        patternId: p.supply.startsWith('pattern-') ? p.supply : 'pattern-0',
                      })
                    }
                  >
                    Apply pattern
                  </button>
                  <button onClick={() => p.edit({ ...p.nail, patternId: null })}>No pattern</button>
                </div>
              </>
            ) : (
              <>
                <p className="little-note">Tap your nail to place it, or use the button below.</p>
                <button
                  className="full-width"
                  onClick={() => {
                    if (p.nail.decorations.length >= 100) {
                      p.message('This nail is full of treasures! Remove one to make room.');
                      return;
                    }
                    p.edit({
                      ...p.nail,
                      decorations: [
                        ...p.nail.decorations,
                        {
                          id: uid(),
                          kind: p.tool as 'sticker' | 'gem',
                          supplyId: p.supply,
                          x: 0.5,
                          y: 0.5,
                          rotation: 0,
                          size: p.tool === 'gem' ? 0.2 : 0.28,
                        },
                      ],
                    });
                  }}
                >
                  Place in the middle
                </button>
              </>
            )}
          </>
        )}
        {p.tool === 'clean' && (
          <ManicurePrep
            nail={p.nail}
            clean={() => p.edit({ ...p.nail, cleaned: true })}
            shape={p.changeShape}
            length={p.changeLength}
            skin={p.skin}
            setSkin={p.setSkin}
            isFree={p.isFree}
            paint={() => p.setTool('brush')}
          />
        )}
        {p.tool === 'move' && (
          <div className="prep-kit">
            <span className="big-symbol">↔</span>
            <h3>Make it just right</h3>
            <p>Pick an item, then use the arrows or drag it on your nail.</p>
            <div className="decoration-picker">
              {p.nail.decorations.map((d, i) => (
                <button
                  key={d.id}
                  aria-pressed={p.selected === d.id}
                  className={p.selected === d.id ? 'selected' : ''}
                  onClick={() => p.selectDecoration(d.id)}
                >
                  {d.kind === 'sticker' ? <Icon id={d.supplyId} /> : <span>◇</span>}
                  <small>Item {i + 1}</small>
                </button>
              ))}
            </div>
          </div>
        )}
        {['move', 'sticker', 'gem'].includes(p.tool) &&
          (p.selected || p.nail.decorations.length > 0) && (
            <div className="action-pair">
              <button
                disabled={!p.selected}
                aria-label="Make decoration smaller"
                onClick={() =>
                  p.edit({
                    ...p.nail,
                    decorations: p.nail.decorations.map((d) =>
                      d.id === p.selected ? { ...d, size: Math.max(0.1, d.size - 0.04) } : d,
                    ),
                  })
                }
              >
                − Smaller
              </button>
              <button
                disabled={!p.selected}
                aria-label="Make decoration bigger"
                onClick={() =>
                  p.edit({
                    ...p.nail,
                    decorations: p.nail.decorations.map((d) =>
                      d.id === p.selected ? { ...d, size: Math.min(0.65, d.size + 0.04) } : d,
                    ),
                  })
                }
              >
                + Bigger
              </button>
              {nudges.map(({ direction, dx, dy, icon }) => (
                <button
                  key={direction}
                  disabled={!p.selected}
                  aria-label={`Move decoration ${direction}`}
                  onClick={() =>
                    p.edit({
                      ...p.nail,
                      decorations: p.nail.decorations.map((d) =>
                        d.id === p.selected
                          ? {
                              ...d,
                              x: Math.max(0, Math.min(1, d.x + dx)),
                              y: Math.max(0, Math.min(1, d.y + dy)),
                            }
                          : d,
                      ),
                    })
                  }
                >
                  {icon}
                </button>
              ))}
              <button
                disabled={!p.selected}
                onClick={() =>
                  p.edit({
                    ...p.nail,
                    decorations: p.nail.decorations.map((d) =>
                      d.id === p.selected ? { ...d, x: 0.5, y: 0.5 } : d,
                    ),
                  })
                }
              >
                Center item
              </button>
              <button disabled={!p.selected} onClick={p.rotate}>
                ↻ Rotate
              </button>
              <button disabled={!p.selected} onClick={p.remove}>
                Remove item
              </button>
              <button
                disabled={!p.selected || p.nail.decorations.length >= 100}
                onClick={() => p.edit(duplicateItem(p.nail, p.selected!))}
              >
                Duplicate item
              </button>
              <button
                disabled={!p.selected || p.nail.decorations.at(-1)?.id === p.selected}
                onClick={() => p.edit(reorderItem(p.nail, p.selected!, 'front'))}
              >
                Bring to front
              </button>
              <button
                disabled={!p.selected || p.nail.decorations[0]?.id === p.selected}
                onClick={() => p.edit(reorderItem(p.nail, p.selected!, 'back'))}
              >
                Send to back
              </button>
              <button disabled={!p.selected} onClick={() => p.selectDecoration(null)}>
                Deselect item
              </button>
            </div>
          )}
      </div>
    </aside>
  );
}
