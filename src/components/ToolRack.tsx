import { COLORS, PATTERNS, STICKERS, GEMS, SHAPES, SKINS, suppliesAt } from '../game/catalog';
import type { Nail, Tool, Shape } from '../game/types';
import { Icon, Bottle } from './Icon';
import { uid } from '../game/rules';
import { ToolPicture } from './ToolPicture';
import { NailCanvas } from './NailCanvas';
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
  skin: string;
  setSkin: (s: string) => void;
  isFree: boolean;
  selected: string | null;
  rotate: () => void;
  remove: () => void;
  message: (s: string) => void;
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
export function ToolRack(p: Props) {
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
              p.setTool(t.id);
              if (t.id === 'pattern') p.setSupply(kit.patterns[0].id);
              if (t.id === 'sticker') p.setSupply(kit.stickers[0].id);
              if (t.id === 'gem') p.setSupply(kit.gems[0].id);
            }}
          >
            <ToolPicture tool={t.id} />
            <span className="tool-name">{t.name}</span>
          </button>
        ))}
      </div>
      <div className="supplies-area">
        {(p.tool === 'brush' || p.tool === 'eraser') && (
          <>
            <div className="section-label">
              <h3>{p.tool === 'brush' ? 'Pick a polish' : 'Polish eraser'}</h3>
              <span>{COLORS.find((c) => c.id === p.color)?.name}</span>
            </div>
            {p.tool === 'brush' && (
              <div className="color-grid">
                {COLORS.map((c) => {
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
              </div>
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
            <div className="decoration-grid">
              {library.map((item) => {
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
                      if (p.tool === 'pattern') p.edit({ ...p.nail, patternId: item.id });
                    }}
                  >
                    {p.tool === 'sticker' ? (
                      <Icon id={item.id} size={48} />
                    ) : p.tool === 'gem' ? (
                      <span className="gem-preview" style={{ background: item.color }} />
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
            </div>
            {p.tool === 'pattern' ? (
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
          <div className="prep-kit">
            <div className="soap-illustration" aria-hidden="true">
              ◌<span>✧</span>
            </div>
            <h3>A fresh little start</h3>
            <p>Swipe over a nail to clean it. Then choose a shape you love.</p>
            <button className="full-width" onClick={() => p.edit({ ...p.nail, cleaned: true })}>
              {p.nail.cleaned ? 'Clean again' : 'Clean this nail'}
            </button>
          </div>
        )}
        {p.tool === 'move' && (
          <div className="prep-kit">
            <span className="big-symbol">↔</span>
            <h3>Make it just right</h3>
            <p>Tap a decoration on the big nail, then drag it. You can also pick one below.</p>
            <div className="decoration-picker">
              {p.nail.decorations.map((d, i) => (
                <button
                  key={d.id}
                  aria-pressed={p.selected === d.id}
                  className={p.selected === d.id ? 'selected' : ''}
                  onClick={() => p.message(`select:${d.id}`)}
                >
                  {d.kind === 'sticker' ? <Icon id={d.supplyId} /> : <span>◇</span>}
                  <small>Item {i + 1}</small>
                </button>
              ))}
            </div>
          </div>
        )}
        {(p.selected || p.nail.decorations.length > 0) && (
          <div className="action-pair">
            <button disabled={!p.selected} onClick={p.rotate}>
              ↻ Rotate
            </button>
            <button disabled={!p.selected} onClick={p.remove}>
              Remove item
            </button>
          </div>
        )}
        <details className="shape-settings">
          <summary>Nail shapes &amp; skin tones</summary>
          <div className="shape-buttons">
            {SHAPES.map((s) => (
              <button
                key={s.id}
                aria-pressed={p.nail.shape === s.id}
                onClick={() => p.changeShape(s.id)}
              >
                <span className="shape-tile">
                  <NailCanvas
                    nail={{
                      ...p.nail,
                      shape: s.id,
                      decorations: [],
                      strokes: [],
                      cleaned: true,
                      patternId: null,
                    }}
                    label={`${s.name} shape`}
                  />
                </span>
                {s.name}
              </button>
            ))}
          </div>
          {p.isFree && (
            <div className="skin-tones" aria-label="Hand skin tone">
              {SKINS.map((s, i) => (
                <button
                  key={s}
                  className={p.skin === s ? 'selected' : ''}
                  style={{ background: s }}
                  aria-label={`Skin tone ${i + 1}`}
                  aria-pressed={p.skin === s}
                  onClick={() => p.setSkin(s)}
                />
              ))}
            </div>
          )}
        </details>
      </div>
    </aside>
  );
}
