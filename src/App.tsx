import { Finger } from './components/Finger';
import { useEffect, useRef, useState } from 'react';
import { COLORS, CUSTOMERS, MILESTONES, ROOM, STICKERS } from './game/catalog';
import {
  fillNails,
  finishCustomer,
  scoreRequest,
  saveToGallery,
  startManicure,
  uid,
  hasManicureEdits,
} from './game/rules';
import { useEditor } from './editor/useEditor';
import type { GalleryEntry, Manicure, Tool } from './game/types';
import { useSave } from './storage/useSave';
import { audioSettings, audioVisibility, awakenAudio, disposeAudio, sound } from './audio/sound';
import { exportManicure } from './art/render';
import { Hand } from './components/Hand';
import { NailCanvas } from './components/NailCanvas';
import { ToolRack } from './components/ToolRack';
import { Portrait } from './components/Portrait';
import { Icon, Bottle } from './components/Icon';
import { Modal } from './components/Modal';
import { Gallery } from './components/Gallery';
import { Tutorial } from './components/Tutorial';
type Panel = 'tutorial' | 'gallery' | 'room' | 'reveal' | null;
export default function App() {
  const { save, setSave, ready, notice, invalid, recover } = useSave();
  const [panel, setPanel] = useState<Panel>(null),
    [tool, setTool] = useState<Tool>('brush'),
    [color, setColor] = useState('color-0'),
    [supply, setSupply] = useState('sticker-0'),
    [brush, setBrush] = useState(0.09),
    [toast, setToast] = useState(''),
    [pending, setPending] = useState<'free' | 'customer' | GalleryEntry | null>(null),
    [picture, setPicture] = useState<string | null>(null),
    [exporting, setExporting] = useState(false),
    [earned, setEarned] = useState(0),
    [oldStars, setOldStars] = useState(0),
    [savedReveal, setSavedReveal] = useState(false);
  const {
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
  } = useEditor(save, setSave);
  const pictureRef = useRef<string | null>(null);
  pictureRef.current = picture;
  useEffect(() => {
    setSavedReveal(false);
  }, [save.active.id]);
  useEffect(() => {
    if (ready && !save.settings.tutorialSeen && !invalid) setPanel('tutorial');
  }, [ready, save.settings.tutorialSeen, invalid]);
  useEffect(() => {
    audioSettings(save.settings.music, save.settings.effects);
  }, [save.settings.music, save.settings.effects]);
  useEffect(() => {
    document.addEventListener('visibilitychange', audioVisibility);
    return () => {
      document.removeEventListener('visibilitychange', audioVisibility);
      disposeAudio();
      if (pictureRef.current) URL.revokeObjectURL(pictureRef.current);
    };
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(''), 3600);
    return () => window.clearTimeout(t);
  }, [toast]);
  const m = save.active,
    customer = CUSTOMERS.find((c) => c.id === m.request?.customerId),
    wishColor = COLORS.find((c) => c.id === m.request?.colorId),
    wishSticker = STICKERS.find((c) => c.id === m.request?.stickerId),
    next = MILESTONES.find((l) => l.stars > save.stars),
    score = m.request ? scoreRequest(m, m.request) : null;
  function begin(target: 'free' | 'customer' | GalleryEntry) {
    if (typeof target === 'string') setSave((s) => startManicure(s, target));
    else
      setSave((s) => ({
        ...s,
        active: {
          ...structuredClone(target.manicure),
          id: uid(),
          mode: 'free',
          request: null,
          rewarded: false,
        },
      }));
    setPending(null);
    setPanel(null);
    setTool('brush');
    sound();
  }
  function requestBegin(target: 'free' | 'customer' | GalleryEntry) {
    if (hasManicureEdits(m)) setPending(target);
    else begin(target);
  }
  function gallerySave() {
    const result = saveToGallery(save);
    if (result.full) {
      setToast('Your gallery is full. Open My gallery and remove a design to make room.');
      return false;
    }
    setSave(result.save);
    setSavedReveal(true);
    setToast('Saved to your gallery. A tiny masterpiece!');
    sound('reward');
    return true;
  }
  function finish() {
    if (m.mode === 'customer' && !m.rewarded) {
      if (!score?.complete) {
        setToast('Add a little polish to each of the five nails. “Color all five” can help!');
        return;
      }
      setOldStars(save.stars);
      setEarned(score.stars);
      setSave(finishCustomer(save));
    } else {
      setOldStars(save.stars);
      setEarned(0);
    }
    setSavedReveal(false);
    setPanel('reveal');
    sound('reward');
  }
  async function exportPicture(design: Manicure) {
    setExporting(true);
    try {
      const blob = await exportManicure(design);
      if (picture) URL.revokeObjectURL(picture);
      setPicture(URL.createObjectURL(blob));
    } catch {
      setToast('The picture could not be made. Your design is still here. Try again.');
    } finally {
      setExporting(false);
    }
  }
  function closePicture() {
    if (picture) URL.revokeObjectURL(picture);
    setPicture(null);
  }
  const roomColor = (id: string) => ROOM.find((r) => r.id === id)?.color;
  if (!ready)
    return (
      <div className="loading">
        <Bottle color="#f597b7" size={64} />
        <h1>Opening your little salon…</h1>
      </div>
    );
  return (
    <div
      className="app"
      onPointerDownCapture={awakenAudio}
      onKeyDownCapture={awakenAudio}
      style={
        {
          '--wall': roomColor(save.room.wall),
          '--desk': roomColor(save.room.desk),
        } as React.CSSProperties
      }
    >
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">
            <Bottle color="#ee86aa" size={32} />
          </span>
          <div>
            <h1>
              Nail Salon<span>✧</span>
            </h1>
            <p>A LITTLE SALON FOR BIG IMAGINATIONS</p>
          </div>
        </div>
        <div className="top-actions">
          <span className="star-total" aria-label={`${save.stars} stars`}>
            <Icon id="star" size={25} />
            {save.stars}
          </span>
          <button onClick={() => setPanel('gallery')}>
            <span aria-hidden="true">▧</span> <span>My gallery</span>
          </button>
          <button
            className="icon-button"
            aria-label={save.settings.music ? 'Mute music' : 'Enable music'}
            aria-pressed={save.settings.music}
            onClick={() =>
              setSave((s) => ({ ...s, settings: { ...s.settings, music: !s.settings.music } }))
            }
          >
            {save.settings.music ? '♫' : '♪'}
          </button>
          <button
            className="icon-button"
            aria-label={save.settings.effects ? 'Mute sound effects' : 'Enable sound effects'}
            aria-pressed={save.settings.effects}
            onClick={() =>
              setSave((s) => ({ ...s, settings: { ...s.settings, effects: !s.settings.effects } }))
            }
          >
            {save.settings.effects ? '◖))' : '◖×'}
          </button>
          <button
            className="icon-button"
            aria-label="How to play"
            onClick={() => setPanel('tutorial')}
          >
            ?
          </button>
        </div>
      </header>
      {next && (
        <div className="mobile-reward" aria-label="Next reward">
          <span>Next treasure · {next.stars - save.stars} ★</span>
          {next.rewards
            .filter((r) => r.kind === 'colors')
            .slice(0, 2)
            .map((r) => (
              <span key={r.id} title={r.name}>
                <Bottle color={COLORS.find((c) => c.id === r.id)!.color} size={24} />
              </span>
            ))}
          <span>{next.rewards[0].name}</span>
        </div>
      )}
      {notice && (
        <div className="storage-notice" role="status">
          {notice}
          {invalid && (
            <div className="action-pair">
              {invalid.previous && (
                <button onClick={() => void recover(true)}>Restore previous save</button>
              )}
              <button onClick={() => void recover(false)}>Keep backup &amp; start fresh</button>
              <button
                onClick={() => {
                  const url = URL.createObjectURL(
                    new Blob([JSON.stringify(invalid.raw, null, 2)], { type: 'application/json' }),
                  );
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'nail-salon-recovery.json';
                  a.click();
                  window.setTimeout(() => URL.revokeObjectURL(url), 10000);
                }}
              >
                Download preserved save
              </button>
            </div>
          )}
        </div>
      )}
      <main className="salon-layout">
        <aside className="salon-sidebar">
          <div className="mode-switch" aria-label="Game mode">
            <button
              className={m.mode === 'free' ? 'active' : ''}
              aria-pressed={m.mode === 'free'}
              onClick={() => {
                if (m.mode !== 'free') requestBegin('free');
              }}
            >
              ♡ Free play
            </button>
            <button
              className={m.mode === 'customer' ? 'active' : ''}
              aria-pressed={m.mode === 'customer'}
              onClick={() => {
                if (m.mode !== 'customer') requestBegin('customer');
              }}
            >
              ☆ Customers
            </button>
          </div>
          <section className="customer-card">
            {customer ? (
              <>
                <div className="customer-portrait">
                  <Portrait customer={customer} />
                  <span className="hello-bubble">Hi!</span>
                </div>
                <h2>{customer.name}</h2>
                <div className="wish-list">
                  <button
                    className={score?.color ? 'wish-met' : ''}
                    onClick={() => {
                      setColor(wishColor!.id);
                      setTool('brush');
                    }}
                  >
                    <Bottle color={wishColor!.color} />
                    <span>{wishColor!.name}</span>
                    <span aria-hidden="true">{score?.color ? '✓' : '♡'}</span>
                  </button>
                  <button
                    className={score?.sticker ? 'wish-met' : ''}
                    onClick={() => {
                      setTool('sticker');
                      setSupply(wishSticker!.id);
                    }}
                  >
                    <Icon id={wishSticker!.id} />
                    <span>{wishSticker!.name}</span>
                    <span aria-hidden="true">{score?.sticker ? '✓' : '♡'}</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="freeplay-art">
                  <Icon id="sticker-3" size={72} />
                  <span>✧</span>
                  <Icon id="sticker-2" size={42} />
                </div>
                <h2>Free play!</h2>
                <button
                  className="full-width"
                  onClick={() => {
                    editNails(m.nails.map((n) => ({ ...n, cleaned: true })));
                    setTool('brush');
                    setToast('Ready to paint! Tap a nail to start.');
                  }}
                >
                  Ready to paint
                </button>
              </>
            )}
          </section>
          <section className="reward-card">
            <div className="reward-title">
              <Icon id="star" size={26} />
              <h3>{next ? 'Next treasure' : 'All treasures unlocked!'}</h3>
            </div>
            {next ? (
              <>
                <p>
                  {next.rewards
                    .slice(0, 2)
                    .map((r) => r.name)
                    .join(' + ')}
                  <span> + more</span>
                </p>
                <div
                  className="progress-track"
                  role="progressbar"
                  aria-label="Stars toward next reward"
                  aria-valuenow={save.stars % 3}
                  aria-valuemin={0}
                  aria-valuemax={3}
                >
                  <span style={{ width: `${((save.stars % 3) / 3) * 100}%` }} />
                </div>
                <div className="reward-meta">
                  <span>{3 - (save.stars % 3)} more stars</span>
                  <span>✧ {next.stars} stars</span>
                </div>
              </>
            ) : (
              <p>Keep making lovely designs and serving friends.</p>
            )}
          </section>
          <button className="room-button" onClick={() => setPanel('room')}>
            <span aria-hidden="true">⌂</span> Salon <span>→</span>
          </button>
        </aside>
        <section className="workspace" aria-label="Manicure workspace">
          <div className={`desk-scene ${zoom ? 'zoomed' : ''}`}>
            <div className="desk-line" />
            <div className="scene-flower" aria-hidden="true">
              <svg viewBox="0 0 100 150">
                <path
                  d="M50 100V32M50 75Q20 67 23 49Q49 51 50 75M50 62Q77 54 75 40Q56 40 50 62"
                  fill="none"
                  stroke="#7aaa8b"
                  strokeWidth="4"
                />
                {save.room.accessory === 'accessory-0' ? (
                  <g transform="translate(24 3)">
                    <path
                      d="M25 20C-7-7-7 34 16 27C-5 61 42 61 34 34C65 55 68 8 40 17C47-10 9-14 25 20Z"
                      fill="#fff3cc"
                    />
                    <circle cx="29" cy="27" r="10" fill="#efbb56" />
                  </g>
                ) : save.room.accessory === 'accessory-1' ? (
                  <path
                    d="M50 70Q-2 26 19 20Q36 20 50 56Q39-3 55 1Q76 18 60 57Q94 4 95 27Q100 53 50 70Z"
                    fill="#88b89c"
                  />
                ) : (
                  <path
                    d="M50 7L61 35L91 37L66 57L75 87L50 68L25 87L34 57L9 37L39 35Z"
                    fill="#f3c750"
                  />
                )}
                <path d="M27 92H74L69 145H32Z" fill="#db9fae" />
                <path d="M34 102V132" stroke="#ffe6ea" strokeWidth="6" strokeLinecap="round" />
              </svg>
            </div>
            <div className="desk-bottle" aria-hidden="true">
              <Bottle color={COLORS.find((c) => c.id === color)!.color} size={62} />
            </div>
            <div className="desk-pad">
              {zoom ? (
                <div className="zoom-editor">
                  <button
                    className="back-to-hand"
                    onClick={() => {
                      setZoom(false);
                    }}
                  >
                    ← Back to hand
                  </button>
                  <Finger skin={m.skin} shape={nail.shape}>
                    <NailCanvas
                      key={`${m.id}-${selectedNail}`}
                      nail={nail}
                      tool={tool}
                      colorId={color}
                      brush={brush}
                      supplyId={supply}
                      selected={selectedDecoration}
                      onSelect={setSelectedDecoration}
                      onChange={editNail}
                      label={`Paint nail ${selectedNail + 1}`}
                    />
                  </Finger>
                  <div className="nail-selector" aria-label="Choose a nail">
                    {m.nails.map((n, i) => (
                      <button
                        key={i}
                        aria-label={`Select nail ${i + 1}`}
                        aria-pressed={selectedNail === i}
                        onClick={() => {
                          setSelectedNail(i);
                          setSelectedDecoration(null);
                        }}
                      >
                        <span
                          style={{
                            background:
                              COLORS.find((c) => c.id === n.baseColorId)?.color ?? '#ffece0',
                          }}
                        >
                          {i + 1}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <Hand manicure={m} selected={selectedNail} onSelect={selectNail} />
              )}
            </div>
            {!zoom && (
              <div className="tap-hint">
                <span>↖</span> Tap a nail to paint it up close
              </div>
            )}
            <span className="scene-star one">✧</span>
            <span className="scene-star two">✧</span>
          </div>
          <div className="workspace-controls">
            <div className="history-controls">
              <button
                aria-label="Undo"
                disabled={!artHistory.past.length}
                onClick={() => historyAction('undo')}
              >
                ↶ <span>Undo</span>
              </button>
              <button
                aria-label="Redo"
                disabled={!artHistory.future.length}
                onClick={() => historyAction('redo')}
              >
                ↷ <span>Redo</span>
              </button>
              <button
                onClick={() => {
                  editNail({
                    ...nail,
                    baseColorId: null,
                    fillColorId: null,
                    strokes: [],
                    patternId: null,
                    decorations: [],
                  });
                  setSelectedDecoration(null);
                }}
              >
                Clear nail
              </button>
            </div>
            <button className="primary finish-button" onClick={finish}>
              All done! <span>✧</span>
            </button>
          </div>
          <div className="workspace-bottom">
            <span>
              {zoom
                ? `Selected tool: ${tool === 'brush' ? 'Polish brush' : tool}`
                : 'Five little nails. Endless possibilities.'}
            </span>
            <button onClick={() => requestBegin(m.mode)}>New manicure</button>
          </div>
        </section>
        <ToolRack
          stars={save.stars}
          tool={tool}
          setTool={(t) => {
            setTool(t);
            if (!zoom) {
              setZoom(true);
            }
          }}
          color={color}
          setColor={setColor}
          supply={supply}
          setSupply={setSupply}
          brush={brush}
          setBrush={setBrush}
          nail={nail}
          edit={editNail}
          fillAll={() => editNails(fillNails(m, color).nails)}
          changeShape={(shape) => editNails(m.nails.map((n) => ({ ...n, shape })))}
          skin={m.skin}
          setSkin={(skin) => setSave((s) => ({ ...s, active: { ...s.active, skin } }))}
          isFree={m.mode === 'free'}
          selected={selectedDecoration}
          rotate={() => selectedAction()}
          remove={() => selectedAction(true)}
          selectDecoration={setSelectedDecoration}
          message={setToast}
        />
      </main>
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
      {panel === 'tutorial' && (
        <Modal
          title="Welcome, little artist!"
          onClose={() => {
            setPanel(null);
            setSave((s) => ({ ...s, settings: { ...s.settings, tutorialSeen: true } }));
          }}
        >
          <Tutorial
            onDone={() => {
              setPanel(null);
              setSave((s) => ({ ...s, settings: { ...s.settings, tutorialSeen: true } }));
            }}
          />
        </Modal>
      )}
      {panel === 'gallery' && (
        <Modal title="My little gallery" wide onClose={() => setPanel(null)}>
          <Gallery
            entries={save.gallery}
            onDelete={(id) =>
              setSave((s) => ({ ...s, gallery: s.gallery.filter((g) => g.id !== id) }))
            }
            onOpen={requestBegin}
            onExport={(g) => void exportPicture(g.manicure)}
          />
        </Modal>
      )}
      {panel === 'room' && (
        <Modal title="A salon that feels like you" onClose={() => setPanel(null)}>
          <p className="modal-intro">Choose your favorite little corner of the world.</p>
          {(['wall', 'desk', 'accessory'] as const).map((kind) => (
            <section className="room-options" key={kind}>
              <h3>
                {kind === 'wall'
                  ? 'Wallpaper'
                  : kind === 'desk'
                    ? 'Manicure desk'
                    : 'Tabletop treasure'}
              </h3>
              <div>
                {ROOM.filter((r) => r.id.startsWith(kind)).map((r) => {
                  const unlocked =
                    r.id.endsWith('-0') ||
                    MILESTONES.filter((t) => t.stars <= save.stars).some((t) =>
                      t.rewards.some((a) => a.id === r.id),
                    );
                  return (
                    <button
                      key={r.id}
                      aria-pressed={save.room[kind] === r.id}
                      className={save.room[kind] === r.id ? 'selected' : ''}
                      onClick={() =>
                        unlocked
                          ? setSave((s) => ({ ...s, room: { ...s.room, [kind]: r.id } }))
                          : setToast('Earn customer stars to unlock this room treasure.')
                      }
                    >
                      <span style={{ background: r.color }}>
                        {!unlocked ? '♧' : save.room[kind] === r.id ? '✓' : ''}
                      </span>
                      {r.name}
                      {!unlocked && <small>Unlock with stars</small>}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </Modal>
      )}
      {panel === 'reveal' && (
        <Modal title="Look what you made!" onClose={() => setPanel(null)}>
          <div className="reveal">
            <div className="reveal-stars">✧ ✦ ✧</div>
            <Hand manicure={m} small />
            {earned > 0 ? (
              <>
                <h3>{customer?.name} loves her lovely nails!</h3>
                <div className="earned-stars">
                  {Array.from({ length: earned }, (_, i) => (
                    <Icon key={i} id="star" size={44} />
                  ))}
                  <span>+{earned} stars</span>
                </div>
              </>
            ) : (
              <h3>A tiny masterpiece, made by you.</h3>
            )}
            {MILESTONES.filter((t) => t.stars > oldStars && t.stars <= save.stars).map((t) => (
              <div key={t.stars} className="unlock-message">
                <strong>New treasures!</strong>
                <p>{t.rewards.map((r) => r.name).join(' · ')}</p>
              </div>
            ))}
            <div className="reveal-actions">
              <button disabled={savedReveal} onClick={gallerySave}>
                {savedReveal ? 'Saved ✓' : 'Save to gallery'}
              </button>
              <button disabled={exporting} onClick={() => void exportPicture(m)}>
                {exporting ? 'Making picture…' : 'Save picture'}
              </button>
              <button className="primary" onClick={() => requestBegin(m.mode)}>
                {m.mode === 'customer' ? 'Next customer →' : 'Make another →'}
              </button>
            </div>
            {save.gallery.length >= 50 && (
              <button onClick={() => setPanel('gallery')}>Open gallery to make room</button>
            )}
          </div>
        </Modal>
      )}
      {pending && (
        <Modal title="Ready for something new?" onClose={() => setPending(null)}>
          <p className="modal-intro">
            Your current manicure will be replaced. Save it to your gallery first if you’d like to
            keep it.
          </p>
          <div className="stack-actions">
            <button
              className="primary"
              onClick={() => {
                if (gallerySave()) begin(pending);
              }}
            >
              Save &amp; start new
            </button>
            <button onClick={() => begin(pending)}>Start without saving</button>
            <button onClick={() => setPending(null)}>Keep creating</button>
            {save.gallery.length >= 50 && (
              <button
                onClick={() => {
                  setPending(null);
                  setPanel('gallery');
                }}
              >
                Open full gallery
              </button>
            )}
          </div>
        </Modal>
      )}
      {picture && (
        <Modal title="Your picture is ready" onClose={closePicture}>
          <img className="export-preview" src={picture} alt="Your finished manicure" />
          <p className="little-note">
            On iPad, touch and hold the picture to save it to Photos, or use the download button.
          </p>
          <a className="button primary full-width" href={picture} download="my-nail-salon-art.png">
            Download picture
          </a>
        </Modal>
      )}
    </div>
  );
}
