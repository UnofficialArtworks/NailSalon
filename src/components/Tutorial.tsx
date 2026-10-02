import { Icon, Bottle } from './Icon';
export function Tutorial({ onDone, onSkip }: { onDone: () => void; onSkip: () => void }) {
  return (
    <>
      <p className="modal-intro">Welcome to your little salon. Let’s make something lovely!</p>
      <div className="tutorial-welcome-art" aria-hidden="true">
        <Bottle color="#f597b7" size={80} />
        <Icon id="sticker-2" size={80} />
        <Icon id="star" size={64} />
      </div>
      <p className="modal-intro">We’ll show you a little tip at a time while you play.</p>
      <p className="little-note">No timers. No mistakes. Just your imagination.</p>
      <button className="primary full-width" onClick={onDone}>
        Let’s create!
      </button>
      <button className="full-width" onClick={onSkip}>
        Skip tutorial
      </button>
    </>
  );
}
